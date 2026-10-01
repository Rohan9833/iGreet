const mongoose = require("mongoose");

const tlmSchema = new mongoose.Schema(
  {
    tlmId: { type: String, required: true, unique: true, index: true, trim: true },
    tlmPassword: { type: String, default: "" },
    tlmName: { type: String, required: true, trim: true },
    hq: { type: String, default: "", trim: true },
    zone: { type: String, default: "", trim: true },
    role: { type: String, default: "tlm" },
    slms: [{ type: mongoose.Schema.Types.ObjectId, ref: "SLM" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("TLM", tlmSchema);
