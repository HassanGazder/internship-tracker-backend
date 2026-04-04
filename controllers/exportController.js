// controllers/exportController.js
// Phase 8: CSV Export
// Converts the logged-in user's applications into a downloadable CSV file
// No external libraries needed — we build the CSV manually as a plain string

const Application = require("../models/Application");

// ─────────────────────────────────────────────
// Helper: Safely format a value for CSV
// Wraps value in quotes and escapes any existing quotes inside
// This prevents commas or line breaks in notes/fields from breaking the CSV
// ─────────────────────────────────────────────
const escapeCSV = (value) => {
  if (value === null || value === undefined) return ""; // empty cell for missing data
  const str = String(value).replace(/"/g, '""');        // escape double quotes → ""
  return `"${str}"`;                                    // wrap entire value in quotes
};

// ─────────────────────────────────────────────
// Helper: Format a Date object to YYYY-MM-DD
// Returns empty string if no date provided
// ─────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0]; // e.g. "2024-02-10"
};

// ─────────────────────────────────────────────
// @desc    Export all applications as CSV download
// @route   GET /api/export/applications
// @access  Private
// ─────────────────────────────────────────────
const exportApplicationsCSV = async (req, res) => {
  try {
    // Step 1: Fetch all applications for the logged-in user
    const applications = await Application.find({ user: req.user._id }).sort({
      applicationDate: -1, // newest first
    });

    // Step 2: Define the CSV column headers (first row of the file)
    const headers = [
      "Company Name",
      "Job Title",
      "Location",
      "Application Date",
      "Deadline",
      "Status",
      "Salary",
      "Notes",
      "Job Link",
    ];

    // Step 3: Convert each application into a CSV row
    // Each field is passed through escapeCSV() to handle commas and quotes safely
    const rows = applications.map((app) => [
      escapeCSV(app.companyName),
      escapeCSV(app.jobTitle),
      escapeCSV(app.location),
      escapeCSV(formatDate(app.applicationDate)),
      escapeCSV(formatDate(app.deadline)),
      escapeCSV(app.status),
      escapeCSV(app.salary),
      escapeCSV(app.notes),
      escapeCSV(app.jobLink),
    ].join(",")); // join fields with comma to form one CSV row

    // Step 4: Combine header row + all data rows into a single string
    // \r\n is the standard line ending for CSV files (works on Windows + Mac)
    const csvContent = [
      headers.join(","), // header row (no escaping needed here)
      ...rows,           // spread all data rows
    ].join("\r\n");

    // Step 5: Set response headers so browser/Postman treats it as a file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=my_applications.csv" // this is the downloaded file name
    );

    // Step 6: Send the CSV string as the response body
    res.status(200).send(csvContent);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { exportApplicationsCSV };