const mongoose = require("mongoose");

const slmSchema = new mongoose.Schema(
  {
    slmId: { type: String, required: true, unique: true, index: true, trim: true },
    slmPassword: { type: String, default: "" },
    slmName: { type: String, required: true, trim: true },
    hq: { type: String, default: "", trim: true },
    zone: { type: String, default: "", trim: true },
    region: { type: String, default: "", trim: true },
    tlm: { type: mongoose.Schema.Types.ObjectId, ref: "TLM", default: null },
    role: { type: String, default: "slm" },
    flms: [{ type: mongoose.Schema.Types.ObjectId, ref: "FLM" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("SLM", slmSchema);
