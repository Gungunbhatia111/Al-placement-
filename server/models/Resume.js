const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String, // where the uploaded PDF is stored
      required: true,
    },
    extractedText: {
      type: String, // raw text pulled from the PDF via pdf-parse
      default: "",
    },
    skills: [
      {
        type: String,
      },
    ],
    parsedAt: {
      type: Date,
    },
    latestAnalysis: {
      type: Object,
      default: null,
    },
    history: [
      {
        overallScore: Number,
        jobMatchScore: Number,
        status: String,
        targetRole: String,
        analyzedAt: { type: Date, default: Date.now },
        analysisResult: Object,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
