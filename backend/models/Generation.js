const mongoose = require("mongoose");

const generationSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    mr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MR",
      default: null,
      index: true,
    },
    qr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QR",
      default: null,
      index: true,
    },
    type: { type: String, default: "greeting-card", trim: true },
    template: { type: String, default: "", trim: true },
    creditsUsed: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["completed", "processing", "failed"],
      default: "completed",
      index: true,
    },
    outputUrl: { type: String, default: "", trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Generation", generationSchema);
