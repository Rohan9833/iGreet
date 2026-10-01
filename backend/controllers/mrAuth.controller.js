const MR = require("../models/MR");
const { createMrToken } = require("../middleware/mrAuth");

const loginMr = async (req, res, next) => {
  try {
    const mrId = String(req.body.mrId || "").trim();
    const mrPassword = String(req.body.mrPassword || "");

    if (!mrId || !mrPassword) {
      return res.status(400).json({
        success: false,
        message: "MR ID and password are required.",
      });
    }

    const mr = await MR.findOne({
      mrId,
      role: "mr",
    });

    if (!mr || mr.mrPassword !== mrPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid MR ID or password.",
      });
    }

    const token = createMrToken(mr);

    return res.json({
      success: true,
      message: "MR login successful.",
      token,
      mr: {
        id: mr._id,
        mrId: mr.mrId,
        mrName: mr.mrName,
        email: mr.email,
        hq: mr.hq,
        region: mr.region,
        zone: mr.zone,
        role: mr.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginMr,
};
