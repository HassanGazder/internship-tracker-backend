const express = require("express");
const router = express.Router();
const {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
} = require("../controllers/interviewController");

const { protect } = require("../middleware/authmiddleware");

router.route("/").post(protect, createInterview).get(protect, getInterviews);

router
  .route("/:id")
  .get(protect, getInterviewById)
  .put(protect, updateInterview)
  .delete(protect, deleteInterview);

module.exports = router;