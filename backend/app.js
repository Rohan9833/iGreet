const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");

const qrRoutes = require("./routes/qr.routes");
const doctorRoutes = require("./routes/doctor.routes");
const hierarchyRoutes = require("./routes/hierarchy.routes");
const mrAuthRoutes = require("./routes/mrAuth.routes");
const adminRoutes = require("./routes/admin.routes");
const adminAuthRoutes = require("./routes/adminAuth.routes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://192.168.1.3:5173",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".xlsx", ".xls", ".csv"];
    const extension = file.originalname
      .toLowerCase()
      .slice(file.originalname.lastIndexOf("."));

    if (!allowedExtensions.includes(extension)) {
      return cb(new Error("Only .xlsx, .xls and .csv files are allowed."));
    }

    cb(null, true);
  },
});

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked for origin: " + origin));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/qrcodes", express.static("storage/qrcodes"));
app.use("/generations", express.static("storage/generations"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "iGreet backend is running",
  });
});

app.use("/api/qr", qrRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/hierarchy", upload.single("file"), hierarchyRoutes);
app.use("/api/mr-auth", mrAuthRoutes);
app.use("/api/admin-auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
