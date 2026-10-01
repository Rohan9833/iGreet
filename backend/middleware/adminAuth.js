const crypto = require("crypto");
const TLM = require("../models/TLM");
const SLM = require("../models/SLM");
const FLM = require("../models/FLM");

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;
const getSecret = () => process.env.ADMIN_AUTH_SECRET || process.env.MR_AUTH_SECRET || "igreet-admin-dev-secret-change-me";

const createAdminToken = (account) => {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({
    accountId: String(account._id),
    role: account.role,
    issuedAt,
    expiresAt,
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

const verifyAdminToken = (token) => {
  const [payload, signature] = String(token || "").split(".");
  if (!payload || !signature) return null;

  const expected = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!["tlm", "slm", "flm"].includes(decoded.role) || !decoded.accountId || decoded.expiresAt <= Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
};

const loadAccount = async (role, id) => {
  if (role === "tlm") return TLM.findOne({ _id: id, role: "tlm" });
  if (role === "slm") return SLM.findOne({ _id: id, role: "slm" });
  if (role === "flm") return FLM.findOne({ _id: id, role: "flm" });
  return null;
};

const requireAdminAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ success: false, message: "Admin login is required." });
    }

    const payload = verifyAdminToken(token);
    if (!payload) {
      return res.status(401).json({ success: false, message: "Your admin session has expired. Please login again." });
    }

    const account = await loadAccount(payload.role, payload.accountId);
    if (!account) {
      return res.status(401).json({ success: false, message: "Admin account not found." });
    }

    req.admin = account;
    req.adminRole = payload.role;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { createAdminToken, requireAdminAuth };
