const { spawn } = require("child_process");
const fs = require("fs/promises");
const path = require("path");

const KIDNEY_ROOT = path.join(__dirname, "..", "python", "kidney day");
const PYTHON_SCRIPT = path.join(KIDNEY_ROOT, "kidney.py");
const FRAMES_ROOT = path.join(KIDNEY_ROOT, "frames");
const AUDIO_PATH = path.join(KIDNEY_ROOT, "kidney-audio.mp3");

const REQUIRED_ASSETS = ["kidney.py", "kidney-audio.mp3", "frames"];

const getPythonCommand = () =>
  process.env.PYTHON_BIN ||
  (process.platform === "win32" ? "python" : "python3");

const ensureKidneyAssets = async () => {
  const missing = [];

  for (const filename of REQUIRED_ASSETS) {
    try {
      const target = path.join(KIDNEY_ROOT, filename);
      const stats = await fs.stat(target);

      if (filename === "frames" && !stats.isDirectory()) {
        missing.push(filename);
      }
    } catch {
      missing.push(filename);
    }
  }

  if (!missing.length) {
    try {
      const frameFiles = await fs.readdir(FRAMES_ROOT);
      const jpgFrames = frameFiles.filter((file) =>
        /^frame_\d{4}\.jpg$/i.test(file),
      );

      if (jpgFrames.length === 0) {
        missing.push("frames/*.jpg");
      }
    } catch {
      missing.push("frames/*.jpg");
    }
  }

  if (missing.length) {
    const error = new Error(
      `Kidney video template is missing required files: ${missing.join(", ")}`,
    );
    error.code = "KIDNEY_ASSETS_MISSING";
    throw error;
  }
};

// const runKidneyVideo = ({
//   name,
//   speciality,
//   hospital,
//   city,
//   inputImagePath,
//   outputVideoPath,
// }) =>
//   new Promise((resolve, reject) => {
//     const args = [
//       PYTHON_SCRIPT,
//       inputImagePath,
//       outputVideoPath,
//       name,
//       speciality,
//       hospital,
//       city,
//     ];

//     const child = spawn(getPythonCommand(), args, {
//       cwd: KIDNEY_ROOT,
//       env: process.env,
//       shell: false,
//       windowsHide: true,
//       stdio: ["ignore", "pipe", "pipe"],
//     });

//     let stdout = "";
//     let stderr = "";

//     child.stdout.on("data", (chunk) => {
//       stdout += chunk.toString();
//     });

//     child.stderr.on("data", (chunk) => {
//       stderr += chunk.toString();
//     });

//     child.on("error", (error) => {
//       error.code = error.code || "PYTHON_SPAWN_FAILED";
//       reject(error);
//     });

//     child.on("close", async (code) => {
//       if (code !== 0) {
//         const error = new Error(
//           stderr.trim() ||
//             stdout.trim() ||
//             `Kidney video process exited with code ${code}.`,
//         );
//         error.code = "KIDNEY_PROCESS_FAILED";
//         error.exitCode = code;
//         error.stdout = stdout;
//         error.stderr = stderr;
//         return reject(error);
//       }

//       try {
//         const stats = await fs.stat(outputVideoPath);

//         if (!stats.isFile() || stats.size === 0) {
//           const error = new Error(
//             stdout.trim() ||
//               "Kidney video process finished without creating an output video.",
//           );
//           error.code = "KIDNEY_OUTPUT_MISSING";
//           error.stdout = stdout;
//           error.stderr = stderr;
//           return reject(error);
//         }

//         return resolve({
//           stdout,
//           stderr,
//           size: stats.size,
//         });
//       } catch {
//         const error = new Error(
//           stdout.trim() ||
//             "Kidney video process finished without creating an output video.",
//         );
//         error.code = "KIDNEY_OUTPUT_MISSING";
//         error.stdout = stdout;
//         error.stderr = stderr;
//         reject(error);
//       }
//     });
//   });
const runKidneyVideo = ({
  name,
  speciality,
  hospital,
  city,
  inputImagePath,
  outputVideoPath,
}) =>
  new Promise((resolve, reject) => {
    const args = [
      PYTHON_SCRIPT,
      inputImagePath,
      outputVideoPath,
      name,
      speciality,
      hospital,
      city,
      "--audio_path",
      AUDIO_PATH,
    ];

    console.log("[Kidney] Starting Python video generation");
    console.log("[Kidney] Python script:", PYTHON_SCRIPT);
    console.log("[Kidney] Input image:", inputImagePath);
    console.log("[Kidney] Output video:", outputVideoPath);
    console.log("[Kidney] Audio:", AUDIO_PATH);

    const child = spawn(getPythonCommand(), args, {
      cwd: KIDNEY_ROOT,
      env: process.env,
      shell: false,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();

      stdout += text;

      console.log("[Kidney Python]", text.trim());
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();

      stderr += text;

      console.error("[Kidney Python Error]", text.trim());
    });

    child.on("error", (error) => {
      error.code = error.code || "PYTHON_SPAWN_FAILED";
      reject(error);
    });

    child.on("close", async (code) => {
      if (code !== 0) {
        const error = new Error(
          stderr.trim() ||
            stdout.trim() ||
            `Kidney video process exited with code ${code}.`,
        );

        error.code = "KIDNEY_PROCESS_FAILED";
        error.exitCode = code;
        error.stdout = stdout;
        error.stderr = stderr;

        return reject(error);
      }

      try {
        const stats = await fs.stat(outputVideoPath);

        if (!stats.isFile() || stats.size === 0) {
          const error = new Error(
            stdout.trim() ||
              "Kidney video process finished without creating an output video.",
          );

          error.code = "KIDNEY_OUTPUT_MISSING";
          error.stdout = stdout;
          error.stderr = stderr;

          return reject(error);
        }

        return resolve({
          stdout,
          stderr,
          size: stats.size,
        });
      } catch {
        const error = new Error(
          stdout.trim() ||
            "Kidney video process finished without creating an output video.",
        );

        error.code = "KIDNEY_OUTPUT_MISSING";
        error.stdout = stdout;
        error.stderr = stderr;

        reject(error);
      }
    });
  });
module.exports = {
  KIDNEY_ROOT,
  PYTHON_SCRIPT,
  FRAMES_ROOT,
  AUDIO_PATH,
  REQUIRED_ASSETS,
  ensureKidneyAssets,
  runKidneyVideo,
};
