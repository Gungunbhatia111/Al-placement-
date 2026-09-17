const express = require("express");
const router = express.Router();
const {
  createInterview,
  getMyInterviews,
  getInterviewById,
  submitAnswers,
  generateFeedback,
} = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createInterview);
router.get("/", protect, getMyInterviews);
router.get("/:id", protect, getInterviewById);
router.put("/:id/answers", protect, submitAnswers);
router.post("/:id/feedback", protect, generateFeedback);

module.exports = router;
