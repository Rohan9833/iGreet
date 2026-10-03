const Doctor = require("../models/Doctor");
const QR = require("../models/QR");
const Generation = require("../models/Generation");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const {
  REQUIRED_ASSETS,
  KIDNEY_ROOT,
  ensureKidneyAssets,
  runKidneyVideo,
} = require("../services/kidneyVideo.service");

const VIDEO_CREDIT_COST = Number(
  process.env.KIDNEY_VIDEO_CREDIT_COST || 20,
);

const VIDEO_STORAGE_ROOT = path.join(
  __dirname,
  "..",
  "storage",
  "generations",
);

const KIDNEY_TEMPLATE = {
  id: "kidney-doctor-intro",
  name: "Kidney Doctor Introduction",
  type: "video",
  fields: [
    { name: "name", label: "Doctor Name", type: "text", required: true },
    {
      name: "speciality",
      label: "Speciality",
      type: "text",
      required: true,
    },
    { name: "hospital", label: "Hospital", type: "text", required: true },
    { name: "city", label: "City", type: "text", required: true },
    {
      name: "input_image",
      label: "Doctor Photo",
      type: "image",
      required: true,
    },
  ],
  requiredAssets: REQUIRED_ASSETS,
};

const getKidneyTemplate = async () => {
  const missingAssets = [];

  try {
    await ensureKidneyAssets();
  } catch (error) {
    if (error.code === "KIDNEY_ASSETS_MISSING") {
      const match = error.message.match(/missing required files: (.*)$/i);
      if (match) {
        missingAssets.push(
          ...match[1].split(",").map((value) => value.trim()),
        );
      } else {
        missingAssets.push("kidney template assets");
      }
    } else {
      throw error;
    }
  }

  return {
    ...KIDNEY_TEMPLATE,
    available: missingAssets.length === 0,
    missingAssets,
    creditCost: VIDEO_CREDIT_COST,
  };
};

const generateKidneyVideo = async (req, res, next) => {
  let chargedDoctorId = null;
  let inputImagePath = null;
  let outputVideoPath = null;

  try {
    const {
      qrToken,
      name,
      speciality,
      hospital,
      city,
    } = req.body;

    if (!qrToken || !name || !speciality || !hospital || !city) {
      return res.status(400).json({
        success: false,
        message:
          "qrToken, name, speciality, hospital and city are required.",
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

    await ensureKidneyAssets();

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

    await runKidneyVideo({
      name: name.trim(),
      speciality: speciality.trim(),
      hospital: hospital.trim(),
      city: city.trim(),
      inputImagePath,
      outputVideoPath,
    });

    const outputUrl = `/generations/${doctor._id}/${outputFilename}`;
    const fileSize = (await fsp.stat(outputVideoPath)).size;

    const generation = await Generation.create({
      doctor: doctor._id,
      mr: qr.assignedByMr || null,
      qr: qr._id,
      type: "greeting-video",
      template: KIDNEY_TEMPLATE.id,
      creditsUsed: VIDEO_CREDIT_COST,
      status: "completed",
      outputUrl,
      metadata: {
        name: name.trim(),
        speciality: speciality.trim(),
        hospital: hospital.trim(),
        city: city.trim(),
        mimeType: "video/mp4",
        fileSize,
        source: "python",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Kidney video generated successfully.",
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

    if (
      error.code === "KIDNEY_ASSETS_MISSING" ||
      error.code === "KIDNEY_PROCESS_FAILED" ||
      error.code === "KIDNEY_OUTPUT_MISSING" ||
      error.code === "PYTHON_SPAWN_FAILED"
    ) {
      console.error("Kidney video generation failed:", error);

      return res.status(
        error.code === "KIDNEY_ASSETS_MISSING" ? 503 : 500,
      ).json({
        success: false,
        message:
          error.code === "KIDNEY_ASSETS_MISSING"
            ? error.message
            : "The Kidney video could not be generated. Please check the Python video environment.",
      });
    }

    return next(error);
  }
};

module.exports = {
  KIDNEY_TEMPLATE,
  getKidneyTemplate,
  generateKidneyVideo,
};
