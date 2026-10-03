const express = require("express");
const multer = require("multer");

const {
  listVideoTemplates,
  previewNashVideo,
  generateNashVideo,
} = require("../controllers/doctorVideo.controller");

const {
  generateKidneyVideo,
} = require("../controllers/kidneyVideo.controller");

const {
  generateEpilepsyVideo,
} = require("../controllers/epilepsyVideo.controller");

const router = express.Router();

const videoImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)
    ) {
      return cb(
        new Error("Doctor photo must be a PNG, JPEG or WebP image."),
      );
    }

    cb(null, true);
  },
});

router.get("/templates", listVideoTemplates);
router.get("/templates/nash/preview", previewNashVideo);

router.post(
  "/templates/nash/generate",
  videoImageUpload.single("input_image"),
  generateNashVideo,
);

router.post(
  "/templates/kidney/generate",
  videoImageUpload.single("input_image"),
  generateKidneyVideo,
);

router.post(
  "/templates/epilepsy/generate",
  videoImageUpload.single("input_image"),
  generateEpilepsyVideo,
);

module.exports = router;
