const express = require("express");

const {
  getDashboard,
  listDoctors,
  getDoctorDetails,
  listMRs,
  listGenerations,
  unassignQR,
  setQRStatus,
  listHierarchySummary,
} = require("../controllers/admin.controller");
const { requireAdminAuth } = require("../middleware/adminAuth");

const router = express.Router();

router.use(requireAdminAuth);

router.get("/dashboard", getDashboard);
router.get("/doctors", listDoctors);
router.get("/doctors/:id", getDoctorDetails);
router.get("/mrs", listMRs);
router.get("/generations", listGenerations);
router.get("/hierarchy-summary", listHierarchySummary);

router.patch("/qr/:id/unassign", unassignQR);
router.patch("/qr/:id/status", setQRStatus);

module.exports = router;
