const mongoose = require("mongoose");

const qrSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["unassigned", "assigned", "disabled"],
      default: "unassigned",
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    assignedByMr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MR",
      default: null,
    },
    qrUrl: {
      type: String,
      required: true,
      trim: true,
    },
    imageFileName: {
      type: String,
      required: true,
      trim: true,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QR", qrSchema);
