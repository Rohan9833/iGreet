const express = require("express");
const multer = require("multer");

const {
  listVideoTemplates,
  generateNashVideo,
} = require("../controllers/doctorVideo.controller");

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
router.post(
  "/templates/nash/generate",
  videoImageUpload.single("input_image"),
  generateNashVideo,
);

module.exports = router;
