// routes/alertsRoutes.js
// Single protected route for deadline alerts

const express = require("express");
const router = express.Router();

const { getDeadlineAlerts } = require("../controllers/alertController");
const { protect } = require("../middleware/authMiddleware");
// ↑ Update this path/name if your auth middleware file is named differently

// GET /api/alerts/deadlines
// Protected — requires valid Bearer token in Authorization header
router.get("/deadlines", protect, getDeadlineAlerts);

module.exports = router;