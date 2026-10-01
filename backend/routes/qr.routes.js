const express = require("express");

const {
  generateQRCodes,
  listQRCodes,
  getQRByToken,
} = require("../controllers/qr.controller");

const router = express.Router();

router.post("/generate", generateQRCodes);
router.get("/", listQRCodes);
router.get("/:token", getQRByToken);

module.exports = router;
