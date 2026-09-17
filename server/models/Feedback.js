const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scores: {
      technicalAccuracy: { type: Number, min: 0, max: 10, default: 0 },
      communication: { type: Number, min: 0, max: 10, default: 0 },
      confidence: { type: Number, min: 0, max: 10, default: 0 },
      overall: { type: Number, min: 0, max: 10, default: 0 },
    },
    strengths: [
      {
        type: String,
      },
    ],
    improvements: [
      {
        type: String,
      },
    ],
    summary: {
      type: String, // AI-generated overall feedback paragraph
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
