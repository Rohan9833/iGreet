const express = require("express");
const {
  registerDoctor,
  getDoctorByQRToken,
  createGeneration,
  getDoctorGenerationsByQRToken,
} = require("../controllers/doctor.controller");
const { requireMrAuth } = require("../middleware/mrAuth");

const router = express.Router();

router.post("/register", requireMrAuth, registerDoctor);
router.get("/by-qr/:token", getDoctorByQRToken);
router.post("/generate", createGeneration);
router.get("/generations/by-qr/:token", getDoctorGenerationsByQRToken);

module.exports = router;
