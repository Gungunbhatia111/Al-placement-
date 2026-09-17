const fs = require("fs");
const pdfParse = require("pdf-parse");
const Resume = require("../models/Resume");
const User = require("../models/User");

// @route  POST /api/resumes/upload  (protected, multipart/form-data, field name: "resume")
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const parsed = await pdfParse(dataBuffer);

    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      extractedText: parsed.text,
      parsedAt: new Date(),
    });

    // link resume to user
    await User.findByIdAndUpdate(req.user._id, { resume: resume._id });

    res.status(201).json({
      _id: resume._id,
      fileName: resume.fileName,
      extractedText: resume.extractedText,
      message: "Resume uploaded and parsed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/resumes/me  (protected)
const getMyResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user?._id }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(404).json({ message: "No resume found" });
    }
    res.status(200).json(resume);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/resumes/analyze  (optional protection, body: { resumeText, jobDescription, targetRole })
const analyzeResume = async (req, res, next) => {
  try {
    const { analyzeResumeAI } = require("../services/aiService");
    const { resumeText, jobDescription, targetRole } = req.body;

    if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
      return res.status(400).json({
        isValidResume: false,
        errorMessage: "⚠️ Error: Invalid input detected. Please upload or paste a valid resume to get a review.",
      });
    }

    let existingResume = null;
    let previousScore = null;

    if (req.user?._id) {
      existingResume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (existingResume && existingResume.latestAnalysis && typeof existingResume.latestAnalysis.overallScore === "number") {
        previousScore = existingResume.latestAnalysis.overallScore;
      }
    }

    const result = await analyzeResumeAI({
      resumeText,
      jobDescription,
      previousScore,
    });

    if (result.isValidResume === false) {
      return res.status(400).json(result);
    }

    if (req.user?._id) {
      if (!existingResume) {
        existingResume = new Resume({
          user: req.user._id,
          fileName: "Pasted_Resume.txt",
          filePath: "N/A",
          extractedText: resumeText,
          parsedAt: new Date(),
        });
      }

      existingResume.latestAnalysis = result;
      existingResume.history = existingResume.history || [];
      existingResume.history.push({
        overallScore: result.overallScore,
        jobMatchScore: result.jobMatchScore,
        status: result.status,
        targetRole: targetRole || "General",
        analyzedAt: new Date(),
        analysisResult: result,
      });

      await existingResume.save();
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadResume, getMyResume, analyzeResume };

