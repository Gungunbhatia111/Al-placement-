const Interview = require("../models/Interview");
const Resume = require("../models/Resume");
const Feedback = require("../models/Feedback");
const { generateQuestions, analyzeInterview } = require("../services/aiService");

// @route  POST /api/interviews  (protected)
// body: { company, difficulty }
const createInterview = async (req, res, next) => {
  try {
    const { company, difficulty } = req.body;
    if (!company) {
      return res.status(400).json({ message: "Company is required" });
    }

    const resume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(400).json({ message: "Upload a resume before starting an interview" });
    }

    const generatedQuestions = await generateQuestions({
      resumeText: resume.extractedText,
      company,
      difficulty: difficulty || "medium",
      count: 5,
    });

    const interview = await Interview.create({
      user: req.user._id,
      company,
      difficulty: difficulty || "medium",
      questions: generatedQuestions.map((q, i) => ({
        questionText: q,
        order: i,
      })),
    });

    res.status(201).json(interview);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/interviews  (protected)
const getMyInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(interviews);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/interviews/:id  (protected)
const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    res.status(200).json(interview);
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/interviews/:id/answers  (protected)
// body: { answers: [{ questionId, userAnswer }] }
const submitAnswers = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const { answers } = req.body;
    answers.forEach(({ questionId, userAnswer }) => {
      const question = interview.questions.id(questionId);
      if (question) {
        question.userAnswer = userAnswer;
      }
    });

    interview.status = "completed";
    interview.completedAt = new Date();
    await interview.save();

    res.status(200).json(interview);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/interviews/:id/feedback  (protected)
const generateFeedback = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const aiResult = await analyzeInterview({
      company: interview.company,
      difficulty: interview.difficulty,
      questions: interview.questions,
    });

    const feedback = await Feedback.create({
      interview: interview._id,
      user: req.user._id,
      scores: aiResult.scores,
      strengths: aiResult.strengths,
      improvements: aiResult.improvements,
      summary: aiResult.summary,
    });

    interview.feedback = feedback._id;
    await interview.save();

    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInterview,
  getMyInterviews,
  getInterviewById,
  submitAnswers,
  generateFeedback,
};
