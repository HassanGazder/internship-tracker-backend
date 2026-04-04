// controllers/dashboardController.js
// Phase 6: Analytics Dashboard
// Returns stats, counts, upcoming deadlines, recent apps, and monthly chart data
// Everything is scoped to the logged-in user only

const Application = require("../models/Application");
const Interview = require("../models/Interviews");

// ─────────────────────────────────────────────
// @desc    Get dashboard analytics for logged-in user
// @route   GET /api/dashboard/stats
// @access  Private
// ─────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id; // always scope to logged-in user

    // ── 1. Total applications ─────────────────────────────────────
    const totalApplications = await Application.countDocuments({ user: userId });

    // ── 2. Count by each status ───────────────────────────────────
    // countDocuments is faster than fetching full documents just to count
    const appliedCount   = await Application.countDocuments({ user: userId, status: "Applied" });
    const interviewCount = await Application.countDocuments({ user: userId, status: "Interview" });
    const offerCount     = await Application.countDocuments({ user: userId, status: "Offer" });
    const rejectedCount  = await Application.countDocuments({ user: userId, status: "Rejected" });

    // ── 3. Total interview reflections ────────────────────────────
    const totalInterviews = await Interview.countDocuments({ user: userId });

    // ── 4. Upcoming deadlines (next 7 days, not rejected) ─────────
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7); // 7 days from now

    const upcomingDeadlines = await Application.find({
      user: userId,
      status: { $ne: "Rejected" },   // $ne = "not equal" — skip rejected ones
      deadline: {
        $gte: today,                  // deadline is today or later
        $lte: next7Days,              // deadline is within 7 days
      },
    })
      .sort({ deadline: 1 })          // nearest deadline first
      .select("companyName jobTitle deadline status"); // only send needed fields

    // ── 5. Recent applications (latest 5) ─────────────────────────
    const recentApplications = await Application.find({ user: userId })
      .sort({ applicationDate: -1 })  // newest first
      .limit(5)                        // only 5 results
      .select("companyName jobTitle status applicationDate location"); // only needed fields

    // ── 6. Monthly applications (for chart) ───────────────────────
    // We use MongoDB aggregation to group applications by year and month
    // This is what powers a "Applications per Month" bar chart on the frontend
    const monthlyApplications = await Application.aggregate([
      {
        // Stage 1: Only include this user's applications
        $match: { user: userId },
      },
      {
        // Stage 2: Group by year + month, count how many per group
        $group: {
          _id: {
            year:  { $year: "$applicationDate" },   // extract year from date
            month: { $month: "$applicationDate" },  // extract month (1-12)
          },
          count: { $sum: 1 }, // count each application in this group
        },
      },
      {
        // Stage 3: Sort by year then month (oldest to newest for chart)
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        // Stage 4: Reshape the output to be cleaner for the frontend
        $project: {
          _id: 0,                    // hide the default _id field
          year:  "$_id.year",
          month: "$_id.month",
          count: 1,
        },
      },
    ]);

    // ── Send full dashboard response ──────────────────────────────
    res.status(200).json({
      message: "Dashboard stats fetched successfully",
      data: {
        // Application counts
        totalApplications,
        appliedCount,
        interviewCount,
        offerCount,
        rejectedCount,

        // Interview reflections
        totalInterviews,

        // Lists
        upcomingDeadlines,
        recentApplications,

        // Chart data
        monthlyApplications,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getDashboardStats };