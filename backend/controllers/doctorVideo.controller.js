const Doctor = require("../models/Doctor");
const QR = require("../models/QR");
const Generation = require("../models/Generation");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const {
  REQUIRED_ASSETS,
  NASH_ROOT,
  ensureNashAssets,
  runNashVideo,
} = require("../services/nashVideo.service");

const VIDEO_CREDIT_COST = Number(process.env.NASH_VIDEO_CREDIT_COST || 20);
const VIDEO_STORAGE_ROOT = path.join(
  __dirname,
  "..",
  "storage",
  "generations",
);

const NASH_TEMPLATE = {
  id: "nash-doctor-intro",
  name: "Nash Doctor Introduction",
  type: "video",
  fields: [
    { name: "name", label: "Doctor Name", type: "text", required: true },
    {
      name: "qualification",
      label: "Qualification",
      type: "text",
      required: true,
    },
    {
      name: "specialization",
      label: "Specialization",
      type: "text",
      required: true,
    },
    { name: "hospital", label: "Hospital", type: "text", required: true },
    {
      name: "input_image",
      label: "Doctor Photo",
      type: "image",
      required: true,
    },
  ],
  requiredAssets: REQUIRED_ASSETS,
};

const getNashTemplate = async () => {
  const missingAssets = [];

  for (const filename of REQUIRED_ASSETS) {
    try {
      await fsp.access(path.join(NASH_ROOT, filename));
    } catch {
      missingAssets.push(filename);
    }
  }

  return {
    ...NASH_TEMPLATE,
    available: missingAssets.length === 0,
    missingAssets,
    creditCost: VIDEO_CREDIT_COST,
  };
};

const previewNashVideo = async (req, res, next) => {
  try {
    await ensureNashAssets();

    const previewPath = path.join(NASH_ROOT, "nash.mp4");

    // The video is fetched from the public backend by the local Vite app.
    // Explicitly expose the response to browser media/fetch clients.
    const requestOrigin = req.headers.origin;
    if (requestOrigin) {
      res.setHeader("Access-Control-Allow-Origin", requestOrigin);
      res.setHeader("Vary", "Origin");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }

    const origin = req.headers.origin;
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type, Accept, Cache-Control");
    res.setHeader("Access-Control-Expose-Headers", "Accept-Ranges, Content-Length, Content-Range");
    res.setHeader("Vary", "Origin");

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    const stats = await fsp.stat(previewPath);
    const fileSize = stats.size;
    const range = req.headers.range;

    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Cache-Control", "public, max-age=3600");

    if (!range) {
      res.setHeader("Content-Length", fileSize);
      return fs.createReadStream(previewPath).pipe(res);
    }

    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      res.setHeader("Content-Range", `bytes */${fileSize}`);
      return res.status(416).end();
    }

    const start = match[1] ? Number(match[1]) : Math.max(fileSize - Number(match[2]), 0);
    const end = match[2] ? Number(match[2]) : fileSize - 1;

    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      start < 0 ||
      end < start ||
      start >= fileSize
    ) {
      res.setHeader("Content-Range", `bytes */${fileSize}`);
      return res.status(416).end();
    }

    const safeEnd = Math.min(end, fileSize - 1);

    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${safeEnd}/${fileSize}`);
    res.setHeader("Content-Length", safeEnd - start + 1);

    return fs
      .createReadStream(previewPath, { start, end: safeEnd })
      .pipe(res);
  } catch (error) {
    if (error.code === "NASH_ASSETS_MISSING") {
      return res.status(503).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};

const listVideoTemplates = async (req, res, next) => {
  try {
    const template = await getNashTemplate();

    return res.json({
      success: true,
      templates: [template],
    });
  } catch (error) {
    return next(error);
  }
};

const generateNashVideo = async (req, res, next) => {
  let chargedDoctorId = null;
  let inputImagePath = null;
  let outputVideoPath = null;

  try {
    const {
      qrToken,
      name,
      qualification,
      specialization,
      hospital,
    } = req.body;

    if (
      !qrToken ||
      !name ||
      !qualification ||
      !specialization ||
      !hospital
    ) {
      return res.status(400).json({
        success: false,
        message:
          "qrToken, name, qualification, specialization and hospital are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Doctor photo is required.",
      });
    }

    const qr = await QR.findOne({ token: qrToken });

    if (!qr) {
      return res.status(404).json({
        success: false,
        message: "QR code not found.",
      });
    }

    if (qr.status !== "assigned" || !qr.doctor) {
      return res.status(409).json({
        success: false,
        message: "This QR code is not assigned to a doctor.",
      });
    }

    const doctor = await Doctor.findOneAndUpdate(
      {
        _id: qr.doctor,
        status: "active",
        credits: { $gte: VIDEO_CREDIT_COST },
      },
      {
        $inc: { credits: -VIDEO_CREDIT_COST },
      },
      { new: true },
    );

    if (!doctor) {
      const currentDoctor = await Doctor.findById(qr.doctor).select(
        "credits status",
      );

      if (!currentDoctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found.",
        });
      }

      if (currentDoctor.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "This doctor account is inactive.",
        });
      }

      return res.status(402).json({
        success: false,
        message: "You do not have enough credits to create this video.",
        credits: currentDoctor.credits,
        requiredCredits: VIDEO_CREDIT_COST,
      });
    }

    chargedDoctorId = doctor._id;

    await ensureNashAssets();

    const inputDirectory = path.join(
      __dirname,
      "..",
      "storage",
      "video-inputs",
      String(doctor._id),
    );

    const outputDirectory = path.join(
      VIDEO_STORAGE_ROOT,
      String(doctor._id),
    );

    await fsp.mkdir(inputDirectory, { recursive: true });
    await fsp.mkdir(outputDirectory, { recursive: true });

    const extension = path.extname(req.file.originalname || "") || ".jpg";
    const safeExtension = /^\.[a-z0-9]+$/i.test(extension)
      ? extension.toLowerCase()
      : ".jpg";

    const generationId = crypto.randomUUID();
    inputImagePath = path.join(
      inputDirectory,
      `${generationId}${safeExtension}`,
    );

    const outputFilename = `${Date.now()}-${generationId}.mp4`;
    outputVideoPath = path.join(outputDirectory, outputFilename);

    await fsp.writeFile(inputImagePath, req.file.buffer);

    await runNashVideo({
      name: name.trim(),
      qualification: qualification.trim(),
      specialization: specialization.trim(),
      hospital: hospital.trim(),
      inputImagePath,
      outputVideoPath,
    });

    const outputUrl = `/generations/${doctor._id}/${outputFilename}`;

    const generation = await Generation.create({
      doctor: doctor._id,
      mr: qr.assignedByMr || null,
      qr: qr._id,
      type: "greeting-video",
      template: NASH_TEMPLATE.id,
      creditsUsed: VIDEO_CREDIT_COST,
      status: "completed",
      outputUrl,
      metadata: {
        name: name.trim(),
        qualification: qualification.trim(),
        specialization: specialization.trim(),
        hospital: hospital.trim(),
        mimeType: "video/mp4",
        fileSize: (await fsp.stat(outputVideoPath)).size,
        source: "python",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Nash video generated successfully.",
      generation: {
        id: generation._id,
        type: generation.type,
        template: generation.template,
        status: generation.status,
        outputUrl: generation.outputUrl,
        createdAt: generation.createdAt,
      },
      credits: doctor.credits,
    });
  } catch (error) {
    if (outputVideoPath) {
      await fsp.rm(outputVideoPath, { force: true }).catch(() => {});
    }

    if (inputImagePath) {
      await fsp.rm(inputImagePath, { force: true }).catch(() => {});
    }

    if (chargedDoctorId) {
      await Doctor.updateOne(
        { _id: chargedDoctorId },
        { $inc: { credits: VIDEO_CREDIT_COST } },
      );
    }

    if (error.code === "NASH_ASSETS_MISSING") {
      return res.status(503).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.code === "NASH_PROCESS_FAILED" ||
      error.code === "NASH_OUTPUT_MISSING" ||
      error.code === "PYTHON_SPAWN_FAILED"
    ) {
      console.error("Nash video generation failed:", error);

      return res.status(500).json({
        success: false,
        message:
          "The video could not be generated. Please check the Python video environment.",
      });
    }

    return next(error);
  }
};

module.exports = {
  listVideoTemplates,
  previewNashVideo,
  generateNashVideo,
};
