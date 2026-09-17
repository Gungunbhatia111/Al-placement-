const Chat = require("../models/Chat");
const Resume = require("../models/Resume");
const Feedback = require("../models/Feedback");
const { chatWithGungun } = require("../services/aiService");

// @route  GET /api/chat  (protected)
// Returns the student's running conversation thread, creating one if it
// doesn't exist yet.
const getChat = async (req, res, next) => {
  try {
    let chat = await Chat.findOne({ user: req.user._id });
    if (!chat) {
      chat = await Chat.create({ user: req.user._id, messages: [] });
    }
    res.status(200).json(chat);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/chat/message  (protected)
// Sends a message to Gungun, storing both sides of the exchange.
const sendMessage = async (req, res, next) => {
  try {
    const { message, targetCompany } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    let chat = await Chat.findOne({ user: req.user._id });
    if (!chat) {
      chat = await Chat.create({ user: req.user._id, messages: [] });
    }

    // Pull latest context so Gungun's answer is grounded, not generic.
    const resume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const latestFeedback = await Feedback.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    const reply = await chatWithGungun({
      history: chat.messages,
      userMessage: message,
      context: {
        resumeText: resume?.extractedText || "",
        latestFeedbackSummary: latestFeedback?.summary || "",
        targetCompany: targetCompany || req.user.targetCompanies?.[0] || "",
      },
    });

    chat.messages.push({ role: "user", content: message });
    chat.messages.push({ role: "assistant", content: reply });
    await chat.save();

    res.status(200).json({ reply, messages: chat.messages });
  } catch (error) {
    next(error);
  }
};

module.exports = { getChat, sendMessage };
