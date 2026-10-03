const { spawn } = require("child_process");
const fs = require("fs/promises");
const path = require("path");

const NASH_ROOT = path.join(__dirname, "..", "python", "Nash");
const PYTHON_SCRIPT = path.join(NASH_ROOT, "nash.py");

const REQUIRED_ASSETS = [
  "nash.py",
  "nash.mp4",
  "nashban.png",
  "AnekLatin[wdth,wght].ttf",
  "Poppins-Medium.ttf",
];

const getPythonCommand = () =>
  process.env.PYTHON_BIN ||
  (process.platform === "win32" ? "python" : "python3");

const ensureNashAssets = async () => {
  const missing = [];

  for (const filename of REQUIRED_ASSETS) {
    try {
      await fs.access(path.join(NASH_ROOT, filename));
    } catch {
      missing.push(filename);
    }
  }

  if (missing.length) {
    const error = new Error(
      `Nash video template is missing required files: ${missing.join(", ")}`,
    );
    error.code = "NASH_ASSETS_MISSING";
    throw error;
  }
};

const runNashVideo = ({
  name,
  qualification,
  specialization,
  hospital,
  inputImagePath,
  outputVideoPath,
}) =>
  new Promise((resolve, reject) => {
    const args = [
      PYTHON_SCRIPT,
      "--name",
      name,
      "--qualification",
      qualification,
      "--specialization",
      specialization,
      "--hospital",
      hospital,
      "--input_image",
      inputImagePath,
      "--output_video",
      outputVideoPath,
    ];

    const child = spawn(getPythonCommand(), args, {
      cwd: NASH_ROOT,
      env: process.env,
      shell: false,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
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
            `Nash video process exited with code ${code}.`,
        );
        error.code = "NASH_PROCESS_FAILED";
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
              "Nash video process finished without creating an output video.",
          );
          error.code = "NASH_OUTPUT_MISSING";
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
            "Nash video process finished without creating an output video.",
        );
        error.code = "NASH_OUTPUT_MISSING";
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      }
    });
  });

module.exports = {
  NASH_ROOT,
  PYTHON_SCRIPT,
  REQUIRED_ASSETS,
  ensureNashAssets,
  runNashVideo,
};
