const mongoose = require("mongoose");

const flmSchema = new mongoose.Schema(
  {
    flmId: { type: String, required: true, unique: true, index: true, trim: true },
    flmPassword: { type: String, default: "" },
    flmName: { type: String, required: true, trim: true },
    hq: { type: String, default: "", trim: true },
    zone: { type: String, default: "", trim: true },
    region: { type: String, default: "", trim: true },
    slm: { type: mongoose.Schema.Types.ObjectId, ref: "SLM", default: null },
    role: { type: String, default: "flm" },
    mrs: [{ type: mongoose.Schema.Types.ObjectId, ref: "MR" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("FLM", flmSchema);
