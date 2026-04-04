const Interview = require("../models/Interviews");
const Application = require("../models/Application");

// @desc    Create interview reflection
// @route   POST /api/interviews
// @access  Private
const createInterview = async (req, res) => {
  try {
    const {
      application,
      interviewDate,
      questionsAsked,
      whatWentWell,
      improvements,
      rating,
    } = req.body;

    if (!application || !interviewDate) {
      return res.status(400).json({ message: "Application and interview date are required" });
    }

    // Check if application belongs to logged-in user
    const existingApplication = await Application.findOne({
      _id: application,
      user: req.user._id,
    });

    if (!existingApplication) {
      return res.status(404).json({ message: "Application not found or not authorized" });
    }

    const interview = await Interview.create({
      user: req.user._id,
      application,
      interviewDate,
      questionsAsked,
      whatWentWell,
      improvements,
      rating,
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all interview reflections of logged-in user
// @route   GET /api/interviews
// @access  Private
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).populate(
      "application",
      "companyName jobTitle status"
    );

    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single interview reflection
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("application", "companyName jobTitle status");

    if (!interview) {
      return res.status(404).json({ message: "Interview reflection not found" });
    }

    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update interview reflection
// @route   PUT /api/interviews/:id
// @access  Private
const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview reflection not found" });
    }

    const updatedInterview = await Interview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedInterview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete interview reflection
// @route   DELETE /api/interviews/:id
// @access  Private
const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview reflection not found" });
    }

    await interview.deleteOne();

    res.status(200).json({ message: "Interview reflection deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
};