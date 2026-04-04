// routes/applicationRoutes.js
// All routes here are protected — only logged-in users can access them
// The "protect" middleware verifies the JWT and attaches req.user

const express = require("express");
const router = express.Router();

const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require("../controllers/applicationController");

const { protect } = require("../middleware/authMiddleware");
// ↑ Update this path if your auth middleware file is named differently

// Apply "protect" to all routes in this file
// Every request must include a valid Bearer JWT token in the Authorization header
router.use(protect);

// POST   /api/applications        → Create new application
// GET    /api/applications        → Get all applications (current user only)
router.route("/").post(createApplication).get(getAllApplications);

// GET    /api/applications/:id    → Get single application
// PUT    /api/applications/:id    → Update application
// DELETE /api/applications/:id   → Delete application
router
  .route("/:id")
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

module.exports = router;