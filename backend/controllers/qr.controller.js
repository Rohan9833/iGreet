const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const QRCode = require("qrcode");

const QR = require("../models/QR");

const QR_STORAGE_DIR = path.resolve(__dirname, "../storage/qrcodes");

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

const getBackendUrl = () =>
  (
    process.env.BACKEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/$/, "");

const createUniqueToken = () => crypto.randomBytes(18).toString("hex");

const createQRCode = async () => {
  let token;
  let exists = true;

  while (exists) {
    token = createUniqueToken();
    exists = await QR.exists({ token });
  }

  const shortToken = token.slice(0, 8).toUpperCase();
  const code = `IG-${shortToken}`;
  const qrUrl = `${getFrontendUrl()}/qr/${token}`;
  const imageFileName = `${code}.png`;
  const imagePath = path.join(QR_STORAGE_DIR, imageFileName);

  await QRCode.toFile(imagePath, qrUrl, {
    type: "png",
    width: 800,
    margin: 2,
    errorCorrectionLevel: "H",
  });

  const qr = await QR.create({
    code,
    token,
    qrUrl,
    imageFileName,
  });

  return {
    id: qr._id,
    code: qr.code,
    token: qr.token,
    status: qr.status,
    qrUrl: qr.qrUrl,
    imageUrl: `${getBackendUrl()}/qrcodes/${qr.imageFileName}`,
    createdAt: qr.createdAt,
  };
};

const generateQRCodes = async (req, res, next) => {
  try {
    const requestedQuantity = Number(req.body.quantity);

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "quantity must be a positive integer.",
      });
    }

    if (requestedQuantity > 1000) {
      return res.status(400).json({
        success: false,
        message: "You can generate a maximum of 1000 QR codes per request.",
      });
    }

    await fs.mkdir(QR_STORAGE_DIR, { recursive: true });

    const qrCodes = [];

    for (let index = 0; index < requestedQuantity; index += 1) {
      qrCodes.push(await createQRCode());
    }

    return res.status(201).json({
      success: true,
      message: `${qrCodes.length} QR code(s) generated successfully.`,
      count: qrCodes.length,
      qrCodes,
    });
  } catch (error) {
    return next(error);
  }
};

const listQRCodes = async (req, res, next) => {
  try {
    const qrs = await QR.find()
      .sort({ createdAt: -1 })
      .select(
        "code token status doctor qrUrl imageFileName assignedAt createdAt updatedAt"
      );

    const qrCodes = qrs.map((qr) => ({
      id: qr._id,
      code: qr.code,
      token: qr.token,
      status: qr.status,
      doctor: qr.doctor,
      qrUrl: qr.qrUrl,
      imageUrl: `${getBackendUrl()}/qrcodes/${qr.imageFileName}`,
      assignedAt: qr.assignedAt,
      createdAt: qr.createdAt,
      updatedAt: qr.updatedAt,
    }));

    return res.json({
      success: true,
      count: qrCodes.length,
      qrCodes,
    });
  } catch (error) {
    return next(error);
  }
};

const getQRByToken = async (req, res, next) => {
  try {
    const qr = await QR.findOne({ token: req.params.token }).select(
      "code token status doctor qrUrl imageFileName assignedAt createdAt"
    );

    if (!qr) {
      return res.status(404).json({
        success: false,
        message: "QR code not found.",
      });
    }

    return res.json({
      success: true,
      qr: {
        id: qr._id,
        code: qr.code,
        token: qr.token,
        status: qr.status,
        doctor: qr.doctor,
        qrUrl: qr.qrUrl,
        imageUrl: `${getBackendUrl()}/qrcodes/${qr.imageFileName}`,
        assignedAt: qr.assignedAt,
        createdAt: qr.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  generateQRCodes,
  listQRCodes,
  getQRByToken,
};
