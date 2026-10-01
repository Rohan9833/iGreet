const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MongoURI;

    if (!mongoURI) {
      throw new Error("MongoURI is not defined in the environment variables.");
    }

    const connection = await mongoose.connect(mongoURI);

    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
