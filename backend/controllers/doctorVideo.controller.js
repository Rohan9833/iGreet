const Doctor = require("../models/Doctor");
const QR = require("../models/QR");
const Generation = require("../models/Generation");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const {
  REQUIRED_ASSETS,
  NASH_ROOT,
  ensureNashAssets,
  runNashVideo,
} = require("../services/nashVideo.service");

const {
  getKidneyTemplate,
} = require("./kidneyVideo.controller");

const {
  getEpilepsyTemplate,
} = require("./epilepsyVideo.controller");

const VIDEO_CREDIT_COST = Number(process.env.NASH_VIDEO_CREDIT_COST || 20);
const VIDEO_STORAGE_ROOT = path.join(
  __dirname,
  "..",
  "storage",
  "generations",
);

const NASH_BROWSER_PREVIEW = "nash-browser-preview.mp4";
let browserPreviewPromise = null;

const getFfmpegCommand = async () => {
  if (process.env.FFMPEG_BIN) {
    return process.env.FFMPEG_BIN;
  }

  if (process.platform !== "win32") {
    return "ffmpeg";
  }

  return new Promise((resolve) => {
    const probe = spawn("where.exe", ["ffmpeg.exe"], {
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"],
    });

    let output = "";

    probe.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });

    probe.on("error", () => resolve("ffmpeg.exe"));

    probe.on("close", async (code) => {
      if (code === 0 && output.trim()) {
        resolve(output.trim().split(/\r?\n/)[0]);
        return;
      }

      const localAppData = process.env.LOCALAPPDATA;

      if (!localAppData) {
        resolve("ffmpeg.exe");
        return;
      }

      const wingetPackages = path.join(
        localAppData,
        "Microsoft",
        "WinGet",
        "Packages",
      );

      try {
        const entries = await fsp.readdir(wingetPackages, {
          withFileTypes: true,
        });

        const ffmpegPackage = entries.find(
          (entry) =>
            entry.isDirectory() &&
            entry.name.toLowerCase().startsWith("gyan.ffmpeg"),
        );

        if (!ffmpegPackage) {
          resolve("ffmpeg.exe");
          return;
        }

        const packageRoot = path.join(
          wingetPackages,
          ffmpegPackage.name,
        );

        const versions = await fsp.readdir(packageRoot, {
          withFileTypes: true,
        });

        const versionRoot = versions.find(
          (entry) =>
            entry.isDirectory() &&
            entry.name.toLowerCase().startsWith("ffmpeg-"),
        );

        if (!versionRoot) {
          resolve("ffmpeg.exe");
          return;
        }

        const candidate = path.join(
          packageRoot,
          versionRoot.name,
          "bin",
          "ffmpeg.exe",
        );

        try {
          await fsp.access(candidate);
          resolve(candidate);
        } catch {
          resolve("ffmpeg.exe");
        }
      } catch {
        resolve("ffmpeg.exe");
      }
    });
  });
};

const ensureBrowserCompatiblePreview = async () => {
  const sourcePath = path.join(NASH_ROOT, "nash.mp4");
  const previewPath = path.join(NASH_ROOT, NASH_BROWSER_PREVIEW);

  try {
    const [sourceStats, previewStats] = await Promise.all([
      fsp.stat(sourcePath),
      fsp.stat(previewPath),
    ]);

    if (previewStats.size > 0 && previewStats.mtimeMs >= sourceStats.mtimeMs) {
      return previewPath;
    }
  } catch {
    // Preview does not exist yet; create it below.
  }

  if (browserPreviewPromise) {
    return browserPreviewPromise;
  }

  browserPreviewPromise = new Promise((resolve, reject) => {
    getFfmpegCommand()
      .then((ffmpegCommand) => {
        console.log("Nash preview FFmpeg:", ffmpegCommand);

        const ffmpeg = spawn(
          ffmpegCommand,
          [
            "-y",
            "-i",
            sourcePath,
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-preset",
            "veryfast",
            "-movflags",
            "+faststart",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            previewPath,
          ],
          {
            cwd: NASH_ROOT,
            shell: false,
            windowsHide: true,
            stdio: ["ignore", "ignore", "pipe"],
          },
        );

        let stderr = "";

        ffmpeg.stderr.on("data", (chunk) => {
          stderr += chunk.toString();
        });

        ffmpeg.on("error", (error) => {
          browserPreviewPromise = null;
          error.code = error.code || "FFMPEG_SPAWN_FAILED";
          reject(error);
        });

        ffmpeg.on("close", async (code) => {
          if (code !== 0) {
            browserPreviewPromise = null;
            const error = new Error(
              stderr.trim() ||
                `FFmpeg exited with code ${code} while preparing the Nash preview.`,
            );
            error.code = "NASH_PREVIEW_TRANSCODE_FAILED";
            reject(error);
            return;
          }

          try {
            const stats = await fsp.stat(previewPath);

            if (!stats.isFile() || stats.size === 0) {
              throw new Error("FFmpeg created an empty Nash preview.");
            }

            const result = previewPath;
            browserPreviewPromise = null;
            resolve(result);
          } catch (error) {
            browserPreviewPromise = null;
            reject(error);
          }
        });
      })
      .catch((error) => {
        browserPreviewPromise = null;
        reject(error);
      });
  });

  return browserPreviewPromise;
};

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

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    const previewPath = await ensureBrowserCompatiblePreview();

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");

    return res.sendFile(previewPath, {
      acceptRanges: true,
      cacheControl: false,
      dotfiles: "deny",
      lastModified: true,
    });
  } catch (error) {
    if (error.code === "NASH_ASSETS_MISSING") {
      return res.status(503).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Nash preview failed:", error);

    return res.status(500).json({
      success: false,
      message: "The Nash video preview could not be prepared.",
    });
  }
};

const listVideoTemplates = async (req, res, next) => {
  try {
    const [nashTemplate, kidneyTemplate, epilepsyTemplate] =
      await Promise.all([
        getNashTemplate(),
        getKidneyTemplate(),
        getEpilepsyTemplate(),
      ]);

    return res.json({
      success: true,
      templates: [
        nashTemplate,
        kidneyTemplate,
        epilepsyTemplate,
      ],
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
