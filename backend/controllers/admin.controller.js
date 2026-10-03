const Doctor = require("../models/Doctor");
const QR = require("../models/QR");
const MR = require("../models/MR");
const TLM = require("../models/TLM");
const SLM = require("../models/SLM");
const FLM = require("../models/FLM");
const Generation = require("../models/Generation");

const getDashboard = async (req, res, next) => {
  try {
    const [totalQRCodes, assignedQRCodes, availableQRCodes, disabledQRCodes, totalDoctors, activeDoctors, totalMRs, totalGenerations, creditsUsed] = await Promise.all([
      QR.countDocuments(),
      QR.countDocuments({ status: "assigned" }),
      QR.countDocuments({ status: "unassigned" }),
      QR.countDocuments({ status: "disabled" }),
      Doctor.countDocuments(),
      Doctor.countDocuments({ status: "active" }),
      MR.countDocuments({ role: "mr" }),
      Generation.countDocuments(),
      Generation.aggregate([{ $group: { _id: null, total: { $sum: "$creditsUsed" } } }]),
    ]);

    const recentQRCodes = await QR.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("doctor", "doctorName doctorCode speciality city")
      .populate("assignedByMr", "mrId mrName")
      .select("code token status doctor assignedByMr assignedAt createdAt imageFileName qrUrl")
      .lean();

    return res.json({
      success: true,
      stats: { totalQRCodes, assignedQRCodes, availableQRCodes, disabledQRCodes, totalDoctors, activeDoctors, totalMRs, totalGenerations, creditsUsed: creditsUsed[0]?.total || 0 },
      recentQRCodes,
    });
  } catch (error) { next(error); }
};

const listDoctors = async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = search ? { $or: [{ doctorName: new RegExp(search, "i") }, { doctorCode: new RegExp(search, "i") }, { speciality: new RegExp(search, "i") }, { clinicName: new RegExp(search, "i") }, { city: new RegExp(search, "i") }, { mobile: new RegExp(search, "i") }] } : {};
    const doctors = await Doctor.find(filter).sort({ createdAt: -1 }).lean();
    const ids = doctors.map((doctor) => doctor._id);
    const qrs = ids.length ? await QR.find({ doctor: { $in: ids } }).populate("assignedByMr", "mrId mrName").select("code token status doctor assignedByMr assignedAt createdAt").lean() : [];
    const qrByDoctor = new Map(qrs.map((qr) => [String(qr.doctor), qr]));
    return res.json({ success: true, count: doctors.length, doctors: doctors.map((doctor) => ({ ...doctor, qr: qrByDoctor.get(String(doctor._id)) || null })) });
  } catch (error) { next(error); }
};

const getDoctorDetails = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).lean();
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found." });
    const qr = await QR.findOne({ doctor: doctor._id }).populate("assignedByMr", "mrId mrName email hq region zone").select("code token status assignedByMr assignedAt createdAt imageFileName qrUrl").lean();
    const generations = await Generation.find({ doctor: doctor._id }).sort({ createdAt: -1 }).limit(50).populate("mr", "mrId mrName").lean();
    return res.json({ success: true, doctor, qr, generations });
  } catch (error) { next(error); }
};

const listMRs = async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim();
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 25),
    );

    const filter = { role: "mr" };

    if (search) {
      filter.$or = [
        { mrId: new RegExp(search, "i") },
        { mrName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { hq: new RegExp(search, "i") },
        { region: new RegExp(search, "i") },
        { zone: new RegExp(search, "i") },
      ];
    }

    const [total, mrs] = await Promise.all([
      MR.countDocuments(filter),
      MR.find(filter)
        .sort({ mrName: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select(
          "mrId mrName email hq region zone businessUnit doj role flm doctors createdAt updatedAt",
        )
        .populate({
          path: "flm",
          select: "flmId flmName hq zone region slm",
          populate: {
            path: "slm",
            select: "slmId slmName hq zone region tlm",
            populate: {
              path: "tlm",
              select: "tlmId tlmName hq zone",
            },
          },
        })
        .lean(),
    ]);

    return res.json({
      success: true,
      count: total,
      mrs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) { next(error); }
};
const listGenerations = async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = {};
    if (search) {
      const doctors = await Doctor.find({ $or: [{ doctorName: new RegExp(search, "i") }, { doctorCode: new RegExp(search, "i") }, { speciality: new RegExp(search, "i") }] }).select("_id");
      filter.doctor = { $in: doctors.map((doctor) => doctor._id) };
    }
    const generations = await Generation.find(filter).sort({ createdAt: -1 }).limit(200).populate("doctor", "doctorName doctorCode speciality").populate("mr", "mrId mrName").lean();
    return res.json({ success: true, count: generations.length, generations });
  } catch (error) { next(error); }
};

const unassignQR = async (req, res, next) => {
  try {
    const qr = await QR.findById(req.params.id);
    if (!qr) return res.status(404).json({ success: false, message: "QR code not found." });
    if (!qr.doctor) return res.status(400).json({ success: false, message: "This QR code is already unassigned." });
    const doctorId = qr.doctor;
    const mrId = qr.assignedByMr;
    qr.status = "unassigned"; qr.doctor = null; qr.assignedByMr = null; qr.assignedAt = null;
    await qr.save();
    if (mrId) await MR.updateOne({ _id: mrId }, { $pull: { doctors: doctorId } });
    return res.json({ success: true, message: "QR code unassigned successfully.", qr: { id: qr._id, code: qr.code, token: qr.token, status: qr.status } });
  } catch (error) { next(error); }
};

const setQRStatus = async (req, res, next) => {
  try {
    const status = String(req.body.status || "").trim();
    if (!["unassigned", "disabled"].includes(status)) return res.status(400).json({ success: false, message: "Status must be unassigned or disabled." });
    const qr = await QR.findById(req.params.id);
    if (!qr) return res.status(404).json({ success: false, message: "QR code not found." });
    if (status === "disabled" && qr.doctor) return res.status(409).json({ success: false, message: "Unassign the QR from its doctor before disabling it." });
    qr.status = status; await qr.save();
    return res.json({ success: true, message: "QR status updated.", qr });
  } catch (error) { next(error); }
};

const listHierarchySummary = async (req, res, next) => {
  try {
    const [tlm, slm, flm, mr] = await Promise.all([TLM.countDocuments(), SLM.countDocuments(), FLM.countDocuments(), MR.countDocuments({ role: "mr" })]);
    return res.json({ success: true, hierarchy: { tlm, slm, flm, mr } });
  } catch (error) { next(error); }
};

module.exports = { getDashboard, listDoctors, getDoctorDetails, listMRs, listGenerations, unassignQR, setQRStatus, listHierarchySummary };