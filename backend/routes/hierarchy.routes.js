const express = require("express");
const { importHierarchy } = require("../controllers/hierarchy.controller");

const router = express.Router();

router.post("/import", importHierarchy);

module.exports = router;
