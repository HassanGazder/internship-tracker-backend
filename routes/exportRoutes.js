// routes/exportRoutes.js
// Single protected route for CSV export

const express = require("express");
const router = express.Router();

const { exportApplicationsCSV } = require("../controllers/exportController");
const { protect } = require("../middleware/authMiddleware");
// ↑ Update this path/name if your auth middleware is named differently

// GET /api/export/applications
// Protected — requires valid Bearer token in Authorization header
// Response is a downloadable CSV file, not JSON
router.get("/applications", protect, exportApplicationsCSV);

module.exports = router;