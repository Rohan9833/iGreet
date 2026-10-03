const Doctor = require("../models/Doctor");
const QR = require("../models/QR");
const Generation = require("../models/Generation");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const {
  REQUIRED_ASSETS,
  ensureEpilepsyAssets,
  runEpilepsyVideo,
} = require("../services/epilepsyVideo.service");

const EPILEPSY_TEMPLATE = {
  id: "epilepsy-doctor-intro",
  name: "Epilepsy Doctor Introduction",
  type: "video",
  fields: [
    { name: "name", label: "Doctor Name", type: "text", required: true },
    {
      name: "speciality",
      label: "Speciality",
      type: "text",
      required: true,
    },
    {
      name: "hospital",
      label: "Hospital",
      type: "text",
      required: true,
    },
    {
      name: "city",
      label: "City",
      type: "text",
      required: true,
    },
    {
      name: "input_image",
      label: "Doctor Photo",
      type: "image",
      required: true,
    },
  ],
  requiredAssets: REQUIRED_ASSETS,
};

const VIDEO_CREDIT_COST = Number(
  process.env.EPILEPSY_VIDEO_CREDIT_COST || 20,
);

const VIDEO_STORAGE_ROOT = path.join(
  __dirname,
  "..",
  "storage",
  "generations",
);

const getEpilepsyTemplate = async () => {
  let missingAssets = [];

  try {
    await ensureEpilepsyAssets();
  } catch (error) {
    if (error.code === "EPILEPSY_ASSETS_MISSING") {
      const message = error.message.replace(
        /^Epilepsy video template is missing required files:\s*/,
        "",
      );

      missingAssets = message
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    } else {
      throw error;
    }
  }

  return {
    ...EPILEPSY_TEMPLATE,
    available: missingAssets.length === 0,
    missingAssets,
    creditCost: VIDEO_CREDIT_COST,
  };
};

const previewEpilepsyVideo = async (req, res, next) => {
  try {
    await ensureEpilepsyAssets();

    const videoPath = path.join(
      __dirname,
      "..",
      "python",
      "Epilepsy-video",
      "input.mp4",
    );

    res.setHeader("Cache-Control", "public, max-age=3600");

    return res.sendFile(videoPath, {
      acceptRanges: true,
      cacheControl: true,
      dotfiles: "deny",
    });
  } catch (error) {
    if (error.code === "EPILEPSY_ASSETS_MISSING") {
      return res.status(503).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};

const generateEpilepsyVideo = async (req, res, next) => {
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

    await ensureEpilepsyAssets();

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

    await runEpilepsyVideo({
      name: name.trim(),
      speciality: speciality.trim(),
      hospital: hospital.trim(),
      city: city.trim(),
      inputImagePath,
      outputVideoPath,
    });

    const outputUrl = `/generations/${doctor._id}/${outputFilename}`;

    const generation = await Generation.create({
      doctor: doctor._id,
      mr: qr.assignedByMr || null,
      qr: qr._id,
      type: "greeting-video",
      template: EPILEPSY_TEMPLATE.id,
      creditsUsed: VIDEO_CREDIT_COST,
      status: "completed",
      outputUrl,
      metadata: {
        name: name.trim(),
        speciality: speciality.trim(),
        hospital: hospital.trim(),
        city: city.trim(),
        mimeType: "video/mp4",
        fileSize: (await fsp.stat(outputVideoPath)).size,
        source: "python",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Epilepsy video generated successfully.",
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

    if (error.code === "EPILEPSY_ASSETS_MISSING") {
      return res.status(503).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.code === "EPILEPSY_PROCESS_FAILED" ||
      error.code === "EPILEPSY_OUTPUT_MISSING" ||
      error.code === "PYTHON_SPAWN_FAILED"
    ) {
      console.error("Epilepsy video generation failed:", error);

      return res.status(500).json({
        success: false,
        message:
          "The Epilepsy video could not be generated. Please check the Python video environment.",
      });
    }

    return next(error);
  }
};

module.exports = {
  EPILEPSY_TEMPLATE,
  getEpilepsyTemplate,
  generateEpilepsyVideo,
  previewEpilepsyVideo,
};
