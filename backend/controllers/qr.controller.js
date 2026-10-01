const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const QRCode = require("qrcode");

const QR = require("../models/QR");

const QR_STORAGE_DIR = path.resolve(__dirname, "../storage/qrcodes");

/**
 * Frontend URL
 *
 * This is the URL that will actually be encoded inside the QR code.
 *
 * Example:
 * http://192.168.1.3:5173/qr/<token>
 */
const getFrontendUrl = () => {
  return (
    process.env.FRONTEND_URL || "http://192.168.1.3:5173"
  ).replace(/\/$/, "");
};

/**
 * Backend URL
 *
 * This is NOT encoded inside the QR.
 * It is only used for API/image URLs returned by the backend.
 *
 * Example:
 * https://duplex-slate-kilobyte.ngrok-free.dev
 */
const getBackendUrl = () => {
  return (
    process.env.BACKEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/$/, "");
};

const createUniqueToken = async () => {
  let token;
  let exists = true;

  while (exists) {
    token = crypto.randomBytes(18).toString("hex");

    exists = await QR.exists({
      token,
    });
  }

  return token;
};

const createQRCode = async () => {
  // Create a unique token
  const token = await createUniqueToken();

  // Human-readable QR code
  const shortToken = token.slice(0, 8).toUpperCase();
  const code = `IG-${shortToken}`;

  /**
   * THIS IS THE URL STORED INSIDE THE QR CODE.
   *
   * Example:
   * http://192.168.1.3:5173/qr/abc123...
   */
  const qrUrl = `${getFrontendUrl()}/qr/${token}`;

  // PNG filename
  const imageFileName = `${code}.png`;

  // Full local path where the PNG will be saved
  const imagePath = path.join(QR_STORAGE_DIR, imageFileName);

  // Generate actual QR PNG
  await QRCode.toFile(imagePath, qrUrl, {
    type: "png",
    width: 800,
    margin: 2,
    errorCorrectionLevel: "H",
  });

  // Save QR information in MongoDB
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

    // URL encoded inside the QR
    qrUrl: qr.qrUrl,

    // Public URL to the generated PNG
    imageUrl: `${getBackendUrl()}/qrcodes/${qr.imageFileName}`,

    createdAt: qr.createdAt,
  };
};

/**
 * POST /api/qr/generate
 *
 * Body:
 * {
 *   "quantity": 10
 * }
 */
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

    // Make sure storage directory exists
    await fs.mkdir(QR_STORAGE_DIR, {
      recursive: true,
    });

    const qrCodes = [];

    for (let index = 0; index < requestedQuantity; index += 1) {
      const qr = await createQRCode();

      qrCodes.push(qr);
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

/**
 * GET /api/qr
 *
 * Returns all generated QR codes.
 */
const listQRCodes = async (req, res, next) => {
  try {
    const qrs = await QR.find()
      .sort({
        createdAt: -1,
      })
      .select(
        "code token status doctor qrUrl imageFileName assignedAt createdAt updatedAt"
      );

    const qrCodes = qrs.map((qr) => ({
      id: qr._id,
      code: qr.code,
      token: qr.token,
      status: qr.status,
      doctor: qr.doctor,

      // URL encoded inside the QR
      qrUrl: qr.qrUrl,

      // Public URL of QR PNG
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

/**
 * GET /api/qr/:token
 *
 * Used by the frontend to check a scanned QR.
 */
const getQRByToken = async (req, res, next) => {
  try {
    const qr = await QR.findOne({
      token: req.params.token,
    }).select(
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

        // URL encoded inside the QR
        qrUrl: qr.qrUrl,

        // Public URL of QR PNG
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