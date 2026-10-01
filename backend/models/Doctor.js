const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    doctorName: { type: String, required: true, trim: true },
    speciality: { type: String, required: true, trim: true },
    doctorCode: { type: String, required: true, unique: true, index: true, trim: true },
    clinicName: { type: String, default: "", trim: true },
    city: { type: String, required: true, trim: true },
    area: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    mobile: { type: String, required: true, trim: true },
    credits: { type: Number, default: 120, min: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
