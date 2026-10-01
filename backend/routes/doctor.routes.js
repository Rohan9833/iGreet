const express = require("express");
const multer = require("multer");
const {
  registerDoctor,
  getDoctorByQRToken,
  createGeneration,
  getDoctorGenerationsByQRToken,
} = require("../controllers/doctor.controller");
const { requireMrAuth } = require("../middleware/mrAuth");

const router = express.Router();

const generationUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)) {
      return cb(new Error("Generated card must be a PNG, JPEG or WebP image."));
    }
    cb(null, true);
  },
});

router.post("/register", requireMrAuth, registerDoctor);
router.get("/by-qr/:token", getDoctorByQRToken);
router.post("/generate", generationUpload.single("card"), createGeneration);
router.get("/generations/by-qr/:token", getDoctorGenerationsByQRToken);

module.exports = router;
