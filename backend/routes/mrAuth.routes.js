const express = require("express");
const { loginMr } = require("../controllers/mrAuth.controller");

const router = express.Router();

router.post("/login", loginMr);

module.exports = router;
