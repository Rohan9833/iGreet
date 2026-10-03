const Doctor = require("../models/Doctor");
const QR = require("../models/QR");
const MR = require("../models/MR");
const Generation = require("../models/Generation");
const fs = require("fs/promises");
const path = require("path");

const GENERATION_CREDIT_COST = 20;
const GENERATIONS_STORAGE_ROOT = path.join(__dirname, "..", "storage", "generations");

const registerDoctor = async (req, res, next) => {
  try {
    const {
      qrToken,
      doctorName,
      speciality,
      doctorCode,
      clinicName,
      city,
      area,
      email,
      mobile,
    } = req.body;

    if (!qrToken || !doctorName || !speciality || !doctorCode || !city || !mobile) {
      return res.status(400).json({
        success: false,
        message: "qrToken, doctorName, speciality, doctorCode, city and mobile are required.",
      });
    }

    if (!req.mr) {
      return res.status(401).json({
        success: false,
        message: "MR login is required before assigning a QR code.",
      });
    }

    const qr = await QR.findOne({ token: qrToken });

    if (!qr) {
      return res.status(404).json({ success: false, message: "QR code not found." });
    }

    if (qr.status !== "unassigned" || qr.doctor) {
      return res.status(409).json({
        success: false,
        message: "This QR code is already assigned to a doctor.",
      });
    }

    const existingDoctor = await Doctor.findOne({ doctorCode: doctorCode.trim() });
    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: "A doctor with this doctor code already exists.",
      });
    }

    const doctor = await Doctor.create({
      doctorName,
      speciality,
      doctorCode,
      clinicName,
      city,
      area,
      email,
      mobile,
    });

    const assignedQR = await QR.findOneAndUpdate(
      {
        _id: qr._id,
        status: "unassigned",
        doctor: null,
      },
      {
        $set: {
          status: "assigned",
          doctor: doctor._id,
          assignedAt: new Date(),
          assignedByMr: req.mr._id,
        },
      },
      { new: true },
    );

    if (!assignedQR) {
      await Doctor.findByIdAndDelete(doctor._id);
      return res.status(409).json({
        success: false,
        message: "This QR code was assigned while registration was being completed. Please try again.",
      });
    }

    await MR.updateOne(
      { _id: req.mr._id },
      { $addToSet: { doctors: doctor._id } },
    );

    return res.status(201).json({
      success: true,
      message: "Doctor registered and QR assigned successfully.",
      doctor: {
        id: doctor._id,
        doctorName: doctor.doctorName,
        speciality: doctor.speciality,
        doctorCode: doctor.doctorCode,
        clinicName: doctor.clinicName,
        city: doctor.city,
        area: doctor.area,
        email: doctor.email,
        mobile: doctor.mobile,
        credits: doctor.credits,
        status: doctor.status,
      },
      qr: {
        id: assignedQR._id,
        code: assignedQR.code,
        token: assignedQR.token,
        status: assignedQR.status,
        assignedAt: assignedQR.assignedAt,
        assignedByMr: assignedQR.assignedByMr,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getDoctorByQRToken = async (req, res, next) => {
  try {
    const qr = await QR.findOne({ token: req.params.token })
      .populate(
        "doctor",
        "doctorName speciality doctorCode clinicName city area email mobile credits status",
      )
      .populate("assignedByMr", "mrId mrName email hq region zone");

    if (!qr) {
      return res.status(404).json({ success: false, message: "QR code not found." });
    }

    return res.json({
      success: true,
      qr: {
        id: qr._id,
        code: qr.code,
        token: qr.token,
        status: qr.status,
        assignedAt: qr.assignedAt,
        assignedByMr: qr.assignedByMr,
      },
      doctor: qr.doctor,
    });
  } catch (error) {
    return next(error);
  }
};

const createGeneration = async (req, res, next) => {
  let storedFilePath = null;
  let chargedDoctorId = null;

  try {
    const {
      qrToken,
      template,
      receiverName,
      senderName = "",
    } = req.body;

    if (!qrToken || !template || !receiverName) {
      return res.status(400).json({
        success: false,
        message: "qrToken, template and receiverName are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "The generated card file is required.",
      });
    }

    const qr = await QR.findOne({ token: qrToken });

    if (!qr) {
      return res.status(404).json({
        success: false,
        message: "QR code not found.",
      });
    }

    if (qr.status !== "assigned" || !qr.doctor) {
      return res.status(409).json({
        success: false,
        message: "This QR code is not assigned to a doctor.",
      });
    }

    const doctor = await Doctor.findOneAndUpdate(
      {
        _id: qr.doctor,
        status: "active",
        credits: { $gte: GENERATION_CREDIT_COST },
      },
      {
        $inc: { credits: -GENERATION_CREDIT_COST },
      },
      {
        new: true,
      },
    );

    if (!doctor) {
      const currentDoctor = await Doctor.findById(qr.doctor).select("credits status");

      if (!currentDoctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found.",
        });
      }

      if (currentDoctor.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "This doctor account is inactive.",
        });
      }

      return res.status(402).json({
        success: false,
        message: "You do not have enough credits to create another generation.",
        credits: currentDoctor.credits,
        requiredCredits: GENERATION_CREDIT_COST,
      });
    }

    chargedDoctorId = doctor._id;

    const doctorDirectory = path.join(
      GENERATIONS_STORAGE_ROOT,
      String(doctor._id),
    );

    await fs.mkdir(doctorDirectory, { recursive: true });

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.png`;
    storedFilePath = path.join(doctorDirectory, filename);

    await fs.writeFile(storedFilePath, req.file.buffer);

    const outputUrl = `/generations/${doctor._id}/${filename}`;

    try {
      const generation = await Generation.create({
        doctor: doctor._id,
        mr: qr.assignedByMr || null,
        qr: qr._id,
        type: "greeting-card",
        template,
        creditsUsed: GENERATION_CREDIT_COST,
        status: "completed",
        outputUrl,
        metadata: {
          receiverName,
          senderName,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Generation created and stored successfully.",
        generation: {
          id: generation._id,
          template: generation.template,
          creditsUsed: generation.creditsUsed,
          status: generation.status,
          outputUrl: generation.outputUrl,
          createdAt: generation.createdAt,
        },
        credits: doctor.credits,
      });
    } catch (error) {
      await fs.rm(storedFilePath, { force: true });
      storedFilePath = null;
      throw error;
    }
  } catch (error) {
    if (chargedDoctorId) {
      await Doctor.updateOne(
        { _id: chargedDoctorId },
        { $inc: { credits: GENERATION_CREDIT_COST } },
      );
    }

    if (storedFilePath) {
      await fs.rm(storedFilePath, { force: true }).catch(() => {});
    }

    return next(error);
  }
};

const getDoctorGenerationsByQRToken = async (req, res, next) => {
  try {
    const qr = await QR.findOne({ token: req.params.token });

    if (!qr) {
      return res.status(404).json({
        success: false,
        message: "QR code not found.",
      });
    }

    if (!qr.doctor) {
      return res.status(409).json({
        success: false,
        message: "This QR code is not assigned to a doctor.",
      });
    }

    const generations = await Generation.find({ doctor: qr.doctor })
      .sort({ createdAt: -1 })
      .limit(200)
      .select("type template creditsUsed status outputUrl metadata createdAt updatedAt")
      .lean();

    return res.json({
      success: true,
      count: generations.length,
      generations,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerDoctor,
  getDoctorByQRToken,
  createGeneration,
  getDoctorGenerationsByQRToken,
};
