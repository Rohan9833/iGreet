const mongoose = require("mongoose");

const mrSchema = new mongoose.Schema(
  {
    mrId: { type: String, required: true, unique: true, index: true, trim: true },
    mrPassword: { type: String, default: "" },
    mrName: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    hq: { type: String, default: "", trim: true },
    region: { type: String, default: "", trim: true },
    zone: { type: String, default: "", trim: true },
    businessUnit: { type: String, default: "", trim: true },
    doj: { type: Date, default: null },
    flm: { type: mongoose.Schema.Types.ObjectId, ref: "FLM", default: null },
    role: { type: String, default: "mr" },
    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("MR", mrSchema);
