const TLM = require("../models/TLM");
const SLM = require("../models/SLM");
const FLM = require("../models/FLM");
const { createAdminToken } = require("../middleware/adminAuth");

const findAccount = async (loginId) => {
  const [tlm, slm, flm] = await Promise.all([
    TLM.findOne({ tlmId: loginId, role: "tlm" }),
    SLM.findOne({ slmId: loginId, role: "slm" }),
    FLM.findOne({ flmId: loginId, role: "flm" }),
  ]);

  return tlm || slm || flm;
};

const loginAdmin = async (req, res, next) => {
  try {
    const loginId = String(req.body.loginId || "").trim();
    const password = String(req.body.password || "");

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: "Login ID and password are required." });
    }

    const account = await findAccount(loginId);

    let role = null;
    let validPassword = false;

    if (account?.tlmId) {
      role = "tlm";
      validPassword = account.tlmPassword === password;
    } else if (account?.slmId) {
      role = "slm";
      validPassword = account.slmPassword === password;
    } else if (account?.flmId) {
      role = "flm";
      validPassword = account.flmPassword === password;
    }

    if (!account || !validPassword || !role) {
      return res.status(401).json({ success: false, message: "Invalid credentials. Use your TLM, SLM or FLM credentials." });
    }

    return res.json({
      success: true,
      message: "Admin login successful.",
      token: createAdminToken({ _id: account._id, role }),
      user: {
        id: account._id,
        loginId,
        name: account.tlmName || account.slmName || account.flmName,
        role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { loginAdmin };
