const Doctor = require("../models/Doctor");
const QR = require("../models/QR");
const MR = require("../models/MR");

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

module.exports = { registerDoctor, getDoctorByQRToken };
