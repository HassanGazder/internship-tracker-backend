const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    interviewDate: {
      type: Date,
      required: true,
    },
    questionsAsked: {
      type: String,
      default: "",
    },
    whatWentWell: {
      type: String,
      default: "",
    },
    improvements: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);