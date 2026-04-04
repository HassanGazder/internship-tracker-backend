// controllers/applicationController.js
// Handles all CRUD logic for internship applications
// Every route is protected — users can only access their own data

const Application = require("../models/Application");

// ─────────────────────────────────────────────
// @desc    Create a new application
// @route   POST /api/applications
// @access  Private
// ─────────────────────────────────────────────
const createApplication = async (req, res) => {
  try {
    const {
      companyName,
      jobTitle,
      location,
      applicationDate,
      deadline,
      status,
      salary,
      notes,
      jobLink,
    } = req.body;

    // Create a new application and link it to the logged-in user
    const application = await Application.create({
      user: req.user._id, // comes from auth middleware
      companyName,
      jobTitle,
      location,
      applicationDate,
      deadline,
      status,
      salary,
      notes,
      jobLink,
    });

    res.status(201).json({
      message: "Application created successfully",
      application,
    });
  } catch (error) {
    // Handle Mongoose validation errors (e.g. missing required fields)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all applications for logged-in user
// @route   GET /api/applications
// @access  Private
// ─────────────────────────────────────────────
const getAllApplications = async (req, res) => {
  try {
    // Step 1: Always start by scoping to the logged-in user only
    const filter = { user: req.user._id };

    // ── Filter by status ──────────────────────────────────────────
    // Example: ?status=Interview
    // Only add to filter if a status value was actually provided
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // ── Search by companyName or jobTitle ─────────────────────────
    // Example: ?search=google
    // $or lets us match either field
    // $regex makes it a partial match (e.g. "goo" matches "Google")
    // $options: "i" makes it case-insensitive
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: "i" };
      filter.$or = [
        { companyName: searchRegex },
        { jobTitle: searchRegex },
      ];
    }

    // ── Build sort object ─────────────────────────────────────────
    // Example: ?sort=newest
    // Mongoose sort format: { fieldName: 1 } = ascending, { fieldName: -1 } = descending
    let sortOption = { applicationDate: -1 }; // default: newest first

    if (req.query.sort) {
      switch (req.query.sort) {
        case "newest":
          sortOption = { applicationDate: -1 };
          break;
        case "oldest":
          sortOption = { applicationDate: 1 };
          break;
        case "deadline_asc":
          sortOption = { deadline: 1 };
          break;
        case "deadline_desc":
          sortOption = { deadline: -1 };
          break;
        default:
          sortOption = { applicationDate: -1 };
      }
    }

    // ── Run the query ─────────────────────────────────────────────
    const applications = await Application.find(filter).sort(sortOption);

    // ── Send response ─────────────────────────────────────────────
    res.status(200).json({
      message: "Applications fetched successfully",
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Get a single application by ID
// @route   GET /api/applications/:id
// @access  Private
// ─────────────────────────────────────────────
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    // Check if application exists
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check ownership — user must own this application
    if (application.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this application" });
    }

    res.status(200).json({
      message: "Application fetched successfully",
      application,
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Update an application by ID
// @route   PUT /api/applications/:id
// @access  Private
// ─────────────────────────────────────────────
const updateApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    // Check if application exists
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check ownership — user must own this application
    if (application.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this application" });
    }

    // Apply updates (only fields sent in request body will be updated)
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true } // return updated doc + validate changes
    );

    res.status(200).json({
      message: "Application updated successfully",
      application: updatedApplication,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Delete an application by ID
// @route   DELETE /api/applications/:id
// @access  Private
// ─────────────────────────────────────────────
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    // Check if application exists
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check ownership — user must own this application
    if (application.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this application" });
    }

    await application.deleteOne();

    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
};