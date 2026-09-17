const express = require("express");
const router = express.Router();
const { getChat, sendMessage } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getChat);
router.post("/message", protect, sendMessage);

module.exports = router;
