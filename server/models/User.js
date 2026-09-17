const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never return password by default in queries
    },
    college: {
      type: String,
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    graduationYear: {
      type: Number,
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
    portfolio: {
      type: String,
      trim: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    targetCompanies: [
      {
        type: String,
      },
    ],
    degree: {
      type: String,
      trim: true,
    },
    targetRole: {
      type: String,
      trim: true,
    },
    preferredLocations: [
      {
        type: String,
        trim: true,
      },
    ],
    leetcode: {
      type: String,
      trim: true,
    },
    hackerrank: {
      type: String,
      trim: true,
    },
    codechef: {
      type: String,
      trim: true,
    },
    geeksforgeeks: {
      type: String,
      trim: true,
    },
    applications: [
      {
        jobId: String,
        company: String,
        role: String,
        status: {
          type: String,
          enum: ["Saved", "Applied", "Assessment", "Interview", "Selected", "Rejected"],
          default: "Saved",
        },
        notes: String,
        deadline: Date,
        interviewDate: Date,
        savedAt: { type: Date, default: Date.now },
      },
    ],
    interviewHistory: [
      {
        date: { type: Date, default: Date.now },
        jobTitle: String,
        company: String,
        totalQuestions: Number,
        answeredQuestions: Number,
        score: Number,
        durationSeconds: Number,
        weakTopics: [String],
      },
    ],
    weakAreas: [
      {
        topic: String,
        count: { type: Number, default: 1 },
        lastAttempted: { type: Date, default: Date.now },
      },
    ],
    practiceStreak: {
      type: Number,
      default: 1,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
