const crypto = require("crypto");
const MR = require("../models/MR");

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;
const DEFAULT_DEV_SECRET = "igreet-mr-dev-secret-change-me";

const getSecret = () => {
  // Use the configured secret when available. The fallback keeps local
  // development working when .env has not been updated yet.
  return process.env.MR_AUTH_SECRET || DEFAULT_DEV_SECRET;
};

const createMrToken = (mr) => {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + TOKEN_TTL_MS;

  const payload = Buffer.from(
    JSON.stringify({
      mrId: String(mr._id),
      role: "mr",
      issuedAt,
      expiresAt,
    }),
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
};

const verifyMrToken = (token) => {
  const [payload, signature] = String(token || "").split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );

    if (
      decoded.role !== "mr" ||
      !decoded.mrId ||
      !decoded.expiresAt ||
      decoded.expiresAt <= Date.now()
    ) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
};

const requireMrAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "MR login is required before assigning a QR code.",
      });
    }

    const payload = verifyMrToken(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Your MR login session has expired. Please login again.",
      });
    }

    const mr = await MR.findOne({
      _id: payload.mrId,
      role: "mr",
    });

    if (!mr) {
      return res.status(401).json({
        success: false,
        message: "MR account not found.",
      });
    }

    req.mr = mr;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMrToken,
  requireMrAuth,
};
