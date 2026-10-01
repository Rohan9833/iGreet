const express = require("express");
const { registerDoctor, getDoctorByQRToken } = require("../controllers/doctor.controller");

const router = express.Router();

router.post("/register", registerDoctor);
router.get("/by-qr/:token", getDoctorByQRToken);

module.exports = router;
