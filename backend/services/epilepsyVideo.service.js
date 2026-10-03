const { spawn } = require("child_process");
const fs = require("fs/promises");
const path = require("path");

const EPILEPSY_ROOT = path.join(
  __dirname,
  "..",
  "python",
  "Epilepsy-video",
);

const PYTHON_SCRIPT = path.join(EPILEPSY_ROOT, "main.py");
const SOURCE_VIDEO = path.join(EPILEPSY_ROOT, "input.mp4");
const LOGO_PATH = path.join(EPILEPSY_ROOT, "logo.png");
const FONT_PATH = path.join(
  EPILEPSY_ROOT,
  "ROBOTOCONDENSED-MEDIUM.TTF",
);

const REQUIRED_ASSETS = [
  "main.py",
  "input.mp4",
  "logo.png",
  "ROBOTOCONDENSED-MEDIUM.TTF",
];

const getPythonCommand = () =>
  process.env.PYTHON_BIN ||
  (process.platform === "win32" ? "python" : "python3");

const ensureEpilepsyAssets = async () => {
  const missing = [];

  const checks = [
    ["main.py", PYTHON_SCRIPT],
    ["input.mp4", SOURCE_VIDEO],
    ["logo.png", LOGO_PATH],
    ["ROBOTOCONDENSED-MEDIUM.TTF", FONT_PATH],
  ];

  for (const [name, target] of checks) {
    try {
      const stats = await fs.stat(target);

      if (!stats.isFile() || stats.size === 0) {
        missing.push(name);
      }
    } catch {
      missing.push(name);
    }
  }

  if (missing.length) {
    const error = new Error(
      `Epilepsy video template is missing required files: ${missing.join(", ")}`,
    );
    error.code = "EPILEPSY_ASSETS_MISSING";
    throw error;
  }
};

const runEpilepsyVideo = ({
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
      "--image",
      inputImagePath,
      "--output",
      outputVideoPath,
      "--name",
      name,
      "--speciality",
      speciality,
      "--hospital",
      hospital,
      "--city",
      city,
      "--video",
      SOURCE_VIDEO,
      "--logo",
      LOGO_PATH,
      "--font",
      FONT_PATH,
    ];

    console.log("[Epilepsy] Starting Python video generation");
    console.log("[Epilepsy] Python script:", PYTHON_SCRIPT);
    console.log("[Epilepsy] Source video:", SOURCE_VIDEO);
    console.log("[Epilepsy] Input image:", inputImagePath);
    console.log("[Epilepsy] Output video:", outputVideoPath);

    const child = spawn(getPythonCommand(), args, {
      cwd: EPILEPSY_ROOT,
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
      console.log("[Epilepsy Python]", text.trim());
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      console.error("[Epilepsy Python Error]", text.trim());
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
            `Epilepsy video process exited with code ${code}.`,
        );

        error.code = "EPILEPSY_PROCESS_FAILED";
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
              "Epilepsy video process finished without creating an output video.",
          );

          error.code = "EPILEPSY_OUTPUT_MISSING";
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
            "Epilepsy video process finished without creating an output video.",
        );

        error.code = "EPILEPSY_OUTPUT_MISSING";
        error.stdout = stdout;
        error.stderr = stderr;

        reject(error);
      }
    });
  });

module.exports = {
  EPILEPSY_ROOT,
  PYTHON_SCRIPT,
  SOURCE_VIDEO,
  LOGO_PATH,
  FONT_PATH,
  REQUIRED_ASSETS,
  ensureEpilepsyAssets,
  runEpilepsyVideo,
};
