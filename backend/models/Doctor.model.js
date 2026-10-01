const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    // Basic information
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    // Professional information
    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    qualification: {
      type: String,
      required: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    // Contact information
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },

    // Clinic information
    clinicName: {
      type: String,
      trim: true,
    },

    clinicAddress: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    // Doctor profile
    profileImage: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      trim: true,
      default: "",
    },

    // Account/status information
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    // Credits available to the doctor
    credits: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);