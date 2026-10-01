const XLSX = require("xlsx");

const TLM = require("../models/TLM");
const SLM = require("../models/SLM");
const FLM = require("../models/FLM");
const MR = require("../models/MR");

const REQUIRED_COLUMNS = [
  "TLMID", "TLMNAME", "TLMPASSWORD", "TLMHQ", "TLMZONE",
  "SLMID", "SLMNAME", "SLMPASSWORD", "SLMHQ", "SLMZONE", "SLMREGION",
  "FLMID", "FLMNAME", "FLMPASSWORD", "FLMHQ", "FLMZONE", "FLMREGION",
  "MRID", "MRNAME", "MREMAIL", "MRPASSWORD", "MRROLE", "MRHQ",
  "MRREGION", "MRZONE", "MRBUSSINESSUNIT", "MRDOJ",
];

const cleanValue = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const valueString = String(value).trim();
  const match = valueString.match(
    /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/,
  );

  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    ) {
      return date;
    }
  }

  const serial = Number(valueString);
  if (!Number.isNaN(serial)) {
    const excelDate = XLSX.SSF.parse_date_code(serial);
    if (excelDate) {
      return new Date(
        Date.UTC(excelDate.y, excelDate.m - 1, excelDate.d),
      );
    }
  }

  return null;
}

function updateFields(document, fields) {
  Object.entries(fields).forEach(([key, value]) => {
    document[key] = value;
  });
}

async function addReference(model, parentId, field, childId) {
  await model.updateOne(
    { _id: parentId },
    { $addToSet: { [field]: childId } },
  );
}

async function removeReference(model, parentId, field, childId) {
  if (!parentId) return;

  await model.updateOne(
    { _id: parentId },
    { $pull: { [field]: childId } },
  );
}

async function importHierarchy(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required.",
      });
    }

    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
      cellDates: true,
    });

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return res.status(400).json({
        success: false,
        message: "Excel file does not contain any sheet.",
      });
    }

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: "",
      raw: true,
    });

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Excel sheet is empty.",
      });
    }

    const receivedColumns = Object.keys(rows[0]);
    const missingColumns = REQUIRED_COLUMNS.filter(
      (column) => !receivedColumns.includes(column),
    );

    if (missingColumns.length) {
      return res.status(400).json({
        success: false,
        message: "Excel file is missing required columns.",
        missingColumns,
        receivedColumns,
      });
    }

    const created = {
      tlm: new Set(),
      slm: new Set(),
      flm: new Set(),
      mr: new Set(),
    };

    const updated = {
      tlm: new Set(),
      slm: new Set(),
      flm: new Set(),
      mr: new Set(),
    };

    let skipped = 0;
    const errors = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const excelRowNumber = index + 2;

      try {
        const tlmId = cleanValue(row.TLMID);
        const slmId = cleanValue(row.SLMID);
        const flmId = cleanValue(row.FLMID);
        const mrId = cleanValue(row.MRID);

        if (!tlmId || !slmId || !flmId || !mrId) {
          throw new Error(
            "TLMID, SLMID, FLMID and MRID are required.",
          );
        }

        let tlm = await TLM.findOne({ tlmId });

        if (!tlm) {
          tlm = await TLM.create({
            tlmId,
            tlmPassword: cleanValue(row.TLMPASSWORD),
            tlmName: cleanValue(row.TLMNAME),
            hq: cleanValue(row.TLMHQ),
            zone: cleanValue(row.TLMZONE),
            role: "tlm",
            slms: [],
          });
          created.tlm.add(tlmId);
        } else {
          updateFields(tlm, {
            tlmPassword: cleanValue(row.TLMPASSWORD),
            tlmName: cleanValue(row.TLMNAME),
            hq: cleanValue(row.TLMHQ),
            zone: cleanValue(row.TLMZONE),
            role: "tlm",
          });
          await tlm.save();
          updated.tlm.add(tlmId);
        }

        let slm = await SLM.findOne({ slmId });
        const previousTlmId = slm ? slm.tlm : null;

        if (!slm) {
          slm = await SLM.create({
            slmId,
            slmPassword: cleanValue(row.SLMPASSWORD),
            slmName: cleanValue(row.SLMNAME),
            hq: cleanValue(row.SLMHQ),
            zone: cleanValue(row.SLMZONE),
            region: cleanValue(row.SLMREGION),
            tlm: tlm._id,
            role: "slm",
            flms: [],
          });
          created.slm.add(slmId);
        } else {
          updateFields(slm, {
            slmPassword: cleanValue(row.SLMPASSWORD),
            slmName: cleanValue(row.SLMNAME),
            hq: cleanValue(row.SLMHQ),
            zone: cleanValue(row.SLMZONE),
            region: cleanValue(row.SLMREGION),
            tlm: tlm._id,
            role: "slm",
          });
          await slm.save();
          updated.slm.add(slmId);
        }

        if (
          previousTlmId &&
          String(previousTlmId) !== String(tlm._id)
        ) {
          await removeReference(TLM, previousTlmId, "slms", slm._id);
        }

        await addReference(TLM, tlm._id, "slms", slm._id);

        let flm = await FLM.findOne({ flmId });
        const previousSlmId = flm ? flm.slm : null;

        if (!flm) {
          flm = await FLM.create({
            flmId,
            flmPassword: cleanValue(row.FLMPASSWORD),
            flmName: cleanValue(row.FLMNAME),
            hq: cleanValue(row.FLMHQ),
            zone: cleanValue(row.FLMZONE),
            region: cleanValue(row.FLMREGION),
            slm: slm._id,
            role: "flm",
            mrs: [],
          });
          created.flm.add(flmId);
        } else {
          updateFields(flm, {
            flmPassword: cleanValue(row.FLMPASSWORD),
            flmName: cleanValue(row.FLMNAME),
            hq: cleanValue(row.FLMHQ),
            zone: cleanValue(row.FLMZONE),
            region: cleanValue(row.FLMREGION),
            slm: slm._id,
            role: "flm",
          });
          await flm.save();
          updated.flm.add(flmId);
        }

        if (
          previousSlmId &&
          String(previousSlmId) !== String(slm._id)
        ) {
          await removeReference(SLM, previousSlmId, "flms", flm._id);
        }

        await addReference(SLM, slm._id, "flms", flm._id);

        let mr = await MR.findOne({ mrId });
        const previousFlmId = mr ? mr.flm : null;

        const mrFields = {
          mrPassword: cleanValue(row.MRPASSWORD),
          mrName: cleanValue(row.MRNAME),
          email: cleanValue(row.MREMAIL),
          role: cleanValue(row.MRROLE).toLowerCase() || "mr",
          hq: cleanValue(row.MRHQ),
          region: cleanValue(row.MRREGION),
          zone: cleanValue(row.MRZONE),
          businessUnit: cleanValue(row.MRBUSSINESSUNIT),
          doj: parseDate(row.MRDOJ),
          flm: flm._id,
        };

        if (!mr) {
          mr = await MR.create({
            mrId,
            ...mrFields,
            doctors: [],
          });
          created.mr.add(mrId);
        } else {
          updateFields(mr, mrFields);
          await mr.save();
          updated.mr.add(mrId);
        }

        if (
          previousFlmId &&
          String(previousFlmId) !== String(flm._id)
        ) {
          await removeReference(FLM, previousFlmId, "mrs", mr._id);
        }

        await addReference(FLM, flm._id, "mrs", mr._id);
      } catch (error) {
        skipped += 1;
        errors.push({
          row: excelRowNumber,
          message: error.message,
        });
      }
    }

    const createdSummary = {
      tlm: created.tlm.size,
      slm: created.slm.size,
      flm: created.flm.size,
      mr: created.mr.size,
    };

    const updatedSummary = {
      tlm: updated.tlm.size,
      slm: updated.slm.size,
      flm: updated.flm.size,
      mr: updated.mr.size,
    };

    return res.status(200).json({
      success: true,
      message: "Hierarchy Excel imported successfully.",
      summary: {
        totalRows: rows.length,
        successfulRows: rows.length - skipped,
        skipped,
        created: createdSummary,
        updated: updatedSummary,
      },
      hierarchy: {
        topLevel: "TLM",
        secondLevel: "SLM",
        thirdLevel: "FLM",
        bottomLevel: "MR",
        ho: false,
      },
      errors,
    });
  } catch (error) {
    console.error("Hierarchy Excel import error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to import hierarchy Excel file.",
    });
  }
}

module.exports = {
  importHierarchy,
};
