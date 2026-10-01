require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const connectDB = require("./config/db");
const qrRoutes = require("./routes/qr.routes");
const doctorRoutes = require("./routes/doctor.routes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet());
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://192.168.1.3:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as Postman/curl/server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Generated QR images
app.use("/qrcodes", express.static("storage/qrcodes"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "iGreet backend is running",
  });
});

// QR management
app.use("/api/qr", qrRoutes);
app.use("/api/doctors", doctorRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
