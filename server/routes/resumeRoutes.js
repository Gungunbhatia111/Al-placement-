const express = require("express");
const router = express.Router();
const { uploadResume, getMyResume, analyzeResume } = require("../controllers/resumeController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/upload", protect, upload.single("resume"), uploadResume);
router.get("/me", protect, getMyResume);
router.post("/analyze", optionalAuth, analyzeResume);

module.exports = router;

