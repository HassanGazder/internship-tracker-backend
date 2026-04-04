// controllers/alertsController.js
// Phase 7: Smart Deadline Alerts
// Returns urgent, upcoming, and overdue deadlines for the logged-in user
// No emails — pure data only

const Application = require("../models/Application");

// ─────────────────────────────────────────────
// @desc    Get deadline alerts for logged-in user
// @route   GET /api/alerts/deadlines
// @access  Private
// ─────────────────────────────────────────────
const getDeadlineAlerts = async (req, res) => {
  try {
    const userId = req.user._id; // always scope to logged-in user

    // ── Set up time boundaries ────────────────────────────────────
    const now = new Date();

    const in3Days = new Date();
    in3Days.setDate(now.getDate() + 3); // 3 days from now

    const in7Days = new Date();
    in7Days.setDate(now.getDate() + 7); // 7 days from now

    // Statuses to exclude from all alerts
    // Students with Offer or Rejected don't need deadline reminders
    const excludedStatuses = { $nin: ["Rejected", "Offer"] };

    // Fields to return for each application (keep response lean)
    const selectedFields = "companyName jobTitle deadline status";

    // ── 1. Urgent Deadlines (within next 3 days) ──────────────────
    // deadline >= today AND deadline <= 3 days from now
    const urgentDeadlines = await Application.find({
      user: userId,
      status: excludedStatuses,
      deadline: {
        $gte: now,      // not already passed
        $lte: in3Days,  // within 3 days
      },
    })
      .sort({ deadline: 1 })      // nearest first
      .select(selectedFields);

    // ── 2. Upcoming Deadlines (within next 7 days) ────────────────
    // deadline >= today AND deadline <= 7 days from now
    // Note: this includes the urgent ones too — frontend can choose
    // to show them separately or merge them
    const upcomingDeadlines = await Application.find({
      user: userId,
      status: excludedStatuses,
      deadline: {
        $gte: now,      // not already passed
        $lte: in7Days,  // within 7 days
      },
    })
      .sort({ deadline: 1 })      // nearest first
      .select(selectedFields);

    // ── 3. Overdue Deadlines (deadline already passed) ────────────
    // deadline < today — student missed the deadline
    const overdueDeadlines = await Application.find({
      user: userId,
      status: excludedStatuses,
      deadline: {
        $lt: now, // strictly before today = already passed
      },
    })
      .sort({ deadline: -1 })     // most recently overdue first
      .select(selectedFields);

    // ── Send response ─────────────────────────────────────────────
    res.status(200).json({
      message: "Deadline alerts fetched successfully",
      data: {
        urgentCount:   urgentDeadlines.length,
        upcomingCount: upcomingDeadlines.length,
        overdueCount:  overdueDeadlines.length,

        urgentDeadlines,
        upcomingDeadlines,
        overdueDeadlines,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getDeadlineAlerts };