// AI service layer — isolates all AI API calls in one place.
// Uses Google Gemini (generous free tier). Swap the fetch URL/body for
// OpenAI's /v1/chat/completions if you prefer that instead.

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

const ASSISTANT_PERSONA =
  "Your name is Gungun. You are a friendly AI placement assistant. When producing user-facing natural language, introduce yourself as: Hi, I am Gungun.";

const extractKeywords = (text = "") => {
  const common = new Set([
    "and", "the", "for", "with", "from", "that", "this", "have", "has", "was", "were",
    "you", "your", "into", "using", "project", "resume", "college", "student",
  ]);

  return [...new Set((text.match(/[A-Za-z][A-Za-z+#.-]{2,}/g) || [])
    .map((word) => word.toLowerCase())
    .filter((word) => !common.has(word)))]
    .slice(0, 8);
};

const fallbackQuestions = ({ resumeText, company, difficulty, count = 5 }) => {
  const skills = extractKeywords(resumeText);
  const skillList = skills.length ? skills.slice(0, 4).join(", ") : "your main technical skills";
  const level = difficulty || "medium";

  const questions = [
    `Tell me about one project from your resume that best matches ${company}. What problem did it solve and what was your exact contribution?`,
    `Your resume mentions ${skillList}. Can you explain how you used these skills in a real project, including one technical challenge you solved?`,
    `For a ${level} interview at ${company}, how would you design or improve one feature from your resume project for real users?`,
    `Describe a time when something in your project did not work as expected. How did you debug it and what did you learn?`,
    `Why do you want to join ${company}, and how do your resume projects or skills connect with the role you are targeting?`,
    `If an interviewer asks you to optimize one part of your project, what would you improve first and why?`,
    `Explain one technical concept from your resume in simple words, as if the interviewer is not familiar with your project.`,
  ];

  return questions.slice(0, count);
};

const fallbackFeedback = ({ questions }) => {
  const answered = questions.filter((q) => (q.userAnswer || "").trim().length > 0).length;
  const total = Math.max(questions.length, 1);
  const base = Math.round((answered / total) * 6) + 3;
  const score = Math.max(1, Math.min(10, base));

  return {
    scores: {
      technicalAccuracy: score,
      communication: Math.max(1, score - 1),
      confidence: score,
      overall: score,
    },
    strengths: [
      "You completed the interview flow and connected answers to the asked questions.",
      "You have resume-based material that can be shaped into stronger interview stories.",
    ],
    improvements: [
      "Add specific project details, metrics, tools, and tradeoffs in each answer.",
      "Use a clear structure: situation, your action, technical decision, and result.",
    ],
    summary:
      "Gemini feedback is currently unavailable, so this is basic offline feedback. Improve each answer by adding concrete evidence from your resume and explaining your personal contribution clearly.",
  };
};

const callGemini = async (prompt) => {
  const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

// Generates interview questions based on resume text + target company + difficulty.
// Returns a plain array of question strings.
const generateQuestions = async ({ resumeText, company, difficulty, count = 5 }) => {
  const prompt = `
${ASSISTANT_PERSONA}

You are an expert technical interviewer preparing questions for a candidate
applying to ${company}. Difficulty level: ${difficulty}.

Candidate resume summary (use this to tailor questions to their actual skills/projects):
"""
${resumeText.slice(0, 3000)}
"""

Generate exactly ${count} interview questions relevant to this candidate and company.
Mix technical and behavioral questions appropriately for the difficulty level.

Respond ONLY with a JSON array of strings, no markdown, no explanation. Example:
["Question 1 text", "Question 2 text"]
`;

  let raw = "";
  try {
    raw = await callGemini(prompt);
  } catch (err) {
    console.error("Gemini question generation failed:", err.message);
    return fallbackQuestions({ resumeText, company, difficulty, count });
  }

  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse AI question response as JSON:", raw);
    return fallbackQuestions({ resumeText, company, difficulty, count });
  }
};

// Analyzes a full interview (questions + user answers) and returns
// structured feedback matching the Feedback model shape.
const analyzeInterview = async ({ company, difficulty, questions }) => {
  const qaPairs = questions
    .map((q, i) => `Q${i + 1}: ${q.questionText}\nA${i + 1}: ${q.userAnswer || "(no answer given)"}`)
    .join("\n\n");

  const prompt = `
${ASSISTANT_PERSONA}

You are an expert interview coach reviewing a candidate's mock interview for
${company} (difficulty: ${difficulty}).

Here are the questions and the candidate's answers:
"""
${qaPairs}
"""

Evaluate the candidate and respond ONLY with a JSON object in exactly this shape,
no markdown, no explanation:

{
  "scores": {
    "technicalAccuracy": <0-10 integer>,
    "communication": <0-10 integer>,
    "confidence": <0-10 integer>,
    "overall": <0-10 integer>
  },
  "strengths": ["short bullet point", "short bullet point"],
  "improvements": ["short bullet point", "short bullet point"],
  "summary": "2-3 sentence overall feedback paragraph"
}
`;

  let raw = "";
  try {
    raw = await callGemini(prompt);
  } catch (err) {
    console.error("Gemini feedback generation failed:", err.message);
    return fallbackFeedback({ questions });
  }

  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse AI feedback response as JSON:", raw);
    return fallbackFeedback({ questions });
  }
};

const chatWithGungun = async ({ history, userMessage, context }) => {
  const msg = (userMessage || "").toLowerCase();

  // Guardrail check: Prohibited non-career / dating / romantic / explicit topics
  const prohibitedPatterns = [
    /\b(date|dating|boyfriend|girlfriend|romance|romantic|love me|kiss|marry|marriage|flirt|relationship|sex|sexual)\b/i,
    /\b(personal conflict|family dispute|medical advice|legal advice|politics|political)\b/i,
  ];

  for (const pattern of prohibitedPatterns) {
    if (pattern.test(msg)) {
      return "I am Gungun AI, your dedicated Placement & Career Coach. I am only programmed to assist with job preparation, interview practice, resume building, and professional motivation. Let's redirect our focus back to your career goals—how can I help you prepare today?";
    }
  }

  const { resumeText, latestFeedbackSummary, targetCompany } = context || {};

  const historyText = (history || [])
    .slice(-10)
    .map((m) => `${m.role === "user" ? "Student" : "Gungun"}: ${m.content}`)
    .join("\n");

  const prompt = `
ROLE & IDENTITY:
You are Gungun AI, an elite AI Placement Coach, Career Strategist, and Professional Mentor.
Your sole purpose is to help students and candidates prepare for jobs, improve technical and soft skills, build resume confidence, stay motivated, and navigate their career journey.

STRICT CONTENT POLICY & BOUNDARIES:
1. PERMITTED TOPICS: Career guidance, placement prep, resume review, job searching strategies, networking, interview practice (Technical, HR, Behavioral, System Design, DSA), and professional motivation.
2. PROHIBITED TOPICS: Sexual content, explicit language, dating/romance, relationship advice, non-career personal topics (medical, legal, political).

If the student's request is outside career guidance, respond with:
"I am Gungun AI, your dedicated Placement & Career Coach. I am only programmed to assist with job preparation, interview practice, resume building, and professional motivation. Let's redirect our focus back to your career goals—how can I help you prepare today?"

Student context:
- Target company/role: ${targetCompany || "not specified yet"}
- Resume summary: """${(resumeText || "").slice(0, 2000)}"""
- Latest interview feedback: """${latestFeedbackSummary || "none yet"}"""

Conversation so far:
${historyText || "(first message)"}

Student message: "${userMessage}"

Reply as Gungun in encouraging, professional, authoritative, and direct plain text.
`;

  try {
    if (process.env.GEMINI_API_KEY) {
      return await callGemini(prompt);
    }
  } catch (err) {
    console.error("Gungun AI chat fallback triggered:", err.message);
  }

  return `Hi, I am Gungun! As your AI Placement Coach, I recommend focusing on 3 key steps today: 1) Audit your resume using our 7-category ATS reviewer, 2) Practice 3 DSA or System Design questions from our Question Bank, and 3) Explore jobs matching your target role of ${targetCompany || "Software Engineer"}. How can I assist your prep next?`;
};

// ─── OFFLINE RESUME FALLBACK ANALYZER ──────────────────────────────────────────
const analyzeResumeOffline = ({ resumeText, jobDescription, previousScore }) => {
  const text = (resumeText || "").trim();
  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Validation
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasPhone = /[\d+() -]{7,}/.test(text);
  const hasContact = hasEmail || hasPhone || /linkedin|github|contact/i.test(text);
  const sectionMatches = (text.match(/\b(EXPERIENCE|WORK|EDUCATION|SKILLS|PROJECTS|SUMMARY|OBJECTIVE|CERTIFICATIONS|ACHIEVEMENTS)\b/gi) || []).length;
  const isCode = /^(import |const |function |def |public class |<html|<div|package )/m.test(text);
  const isQuestion = /^(how|what|why|can you|tell me|who|where|when)\b/i.test(text);

  if (wordCount < 25 || sectionMatches < 1 || (wordCount < 40 && !hasContact) || isCode || isQuestion) {
    return {
      isValidResume: false,
      errorMessage: "⚠️ Error: Invalid input detected. Please upload or paste a valid resume to get a review.",
    };
  }

  const hasSummary = /\b(summary|objective|profile|about)\b/i.test(text);
  const hasEducation = /\b(education|degree|bachelor|master|university|college|gpa)\b/i.test(text);
  const hasSkills = /\b(skills|technologies|languages|frameworks|tools)\b/i.test(text);
  const hasExperience = /\b(experience|work|employment|internship|job|position)\b/i.test(text);
  const hasProjects = /\b(projects|project|portfolio)\b/i.test(text);

  const numbersCount = (text.match(/\b\d+%(?:\s+\w+)?|\b\d+\s*(?:users|clients|ms|s|seconds|hours|days|weeks|months|years|x|fold)\b|\b\d+\b/gi) || []).length;

  // Category Scoring
  const atsCompatibility = Math.min(20, Math.max(8, (hasContact ? 5 : 0) + (hasSkills ? 5 : 0) + (hasEducation ? 4 : 0) + (hasExperience ? 3 : 0) + (hasProjects ? 3 : 0)));
  const contentQuality = Math.min(20, Math.max(6, (hasSummary ? 4 : 0) + (hasExperience ? 6 : 0) + (hasProjects ? 6 : 0) + (wordCount > 150 ? 4 : 2)));
  const impactQuantification = Math.min(15, Math.max(3, Math.round(Math.min(numbersCount, 6) * 2.2 + 2)));
  const skillsKeywordOpt = Math.min(15, Math.max(5, (hasSkills ? 8 : 3) + Math.min(7, Math.floor(wordCount / 50))));
  const experienceProjects = Math.min(15, Math.max(4, (hasProjects ? 7 : 2) + (hasExperience ? 8 : 2)));
  const formattingReadability = Math.min(10, Math.max(4, (wordCount >= 120 && wordCount <= 800 ? 6 : 3) + (sectionMatches >= 3 ? 4 : 2)));
  const professionalism = Math.min(5, Math.max(2, hasEmail ? 3 : 1) + (!/\b(hard worker|go-getter|think outside the box)\b/i.test(text) ? 2 : 0));

  const overallScore = atsCompatibility + contentQuality + impactQuantification + skillsKeywordOpt + experienceProjects + formattingReadability + professionalism;

  // Job Match Score
  let jobMatchScore = null;
  let keywordAnalysis = null;
  if (jobDescription && jobDescription.trim().length > 10) {
    const jdKeywords = [...new Set((jobDescription.match(/[A-Za-z][A-Za-z+#.-]{2,}/g) || [])
      .map(w => w.toLowerCase())
      .filter(w => !["and","the","for","with","from","that","this","have","has","you","your","will","role","team","work"].includes(w)))];
    const present = jdKeywords.filter(k => lower.includes(k)).slice(0, 10);
    const missing = jdKeywords.filter(k => !lower.includes(k)).slice(0, 10);
    const weaklyDemonstrated = present.slice(0, 2);
    jobMatchScore = Math.min(100, Math.max(25, Math.round((present.length / Math.max(jdKeywords.length, 1)) * 100)));
    keywordAnalysis = {
      presentKeywords: present,
      missingKeywords: missing,
      weaklyDemonstrated: weaklyDemonstrated,
      keywordStuffingRisk: wordCount > 0 && present.length / wordCount > 0.15 ? "High risk of keyword repetition" : "Low risk",
    };
  }

  const status = overallScore >= 80 ? "Strong" : overallScore >= 60 ? "Needs Improvement" : "Major Revision Required";

  const criticalIssues = [];
  if (!hasContact) criticalIssues.push("🔴 Critical: Missing visible contact info (email or phone number)");
  if (impactQuantification < 10) criticalIssues.push("🔴 Critical: Low quantification — bullet points lack metrics, %, or measurable outcomes");
  if (!hasSkills) criticalIssues.push("🔴 Critical: Missing dedicated Skills section for ATS parsing");
  if (!hasSummary) criticalIssues.push("🟠 Needs Improvement: Missing concise Professional Summary section");

  const lineFixes = [];
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  lines.forEach((line) => {
    if (/\b(helped|assisted|worked on|was responsible for)\b/i.test(line)) {
      lineFixes.push({
        original: line,
        issue: "Starts with passive or weak verb",
        whyItMatters: "Passive verbs hide individual ownership and technical initiative.",
        howToFix: "Use strong active action verbs such as Engineered, Spearheaded, Built, or Developed.",
        rewrite: line.replace(/\bhelped\b/i, "Engineered").replace(/\bworked on\b/i, "Developed").replace(/\bwas responsible for\b/i, "Spearheaded"),
      });
    } else if (line.startsWith("•") || line.startsWith("-")) {
      if (!/\d/.test(line) && line.length > 30) {
        lineFixes.push({
          original: line,
          issue: "Metric opportunity",
          whyItMatters: "Recruiters and ATS favor bullet points with concrete metrics and clear technical results.",
          howToFix: "Add actual percentage improvement, user count, dataset size, or processing time saved.",
          rewrite: `${line.replace(/\.$/, "")}, resulting in a 25% performance improvement.`,
        });
      }
    }
  });

  const improvementGuide = [
    {
      priority: "Priority 1 — Critical Issues",
      problem: "Missing or weak quantification across experience and projects.",
      whyItMatters: "Recruiters skip descriptive bullets that do not demonstrate clear business or technical impact.",
      action: "Add numbers (percentages, scale, dataset size, time saved) to at least 3 bullet points.",
      example: "Transformed: 'Built website for college event' → 'Built React portal serving 500+ attendees with 99.9% uptime.'",
    },
    {
      priority: "Priority 2 — High-Impact Improvements",
      problem: "Weak action verbs (e.g., 'helped', 'worked on') soften accomplishments.",
      whyItMatters: "ATS screening and recruiters evaluate candidates based on strong leadership and ownership verbs.",
      action: "Replace weak verbs at the start of every bullet with terms like Architected, Optimized, Automated, or Deployed.",
      example: "Replace 'Worked on database API' with 'Engineered RESTful Node.js API handling 1,000+ daily queries.'",
    },
    {
      priority: "Priority 3 — Medium Improvements",
      problem: "Skills section categorization.",
      whyItMatters: "Grouped skills make ATS parsing and recruiter scanning significantly faster.",
      action: "Group skills into clear categories: Languages, Frameworks, Databases, Tools, and Cloud.",
      example: "Languages: Python, JavaScript, Java | Frameworks: React, Node.js, Express | Tools: Git, Docker",
    },
    {
      priority: "Priority 4 — Final Polish",
      problem: "Bullet length and formatting consistency.",
      whyItMatters: "Consistently formatted bullets (10-25 words) prevent truncated text during ATS indexing.",
      action: "Ensure each bullet follows: Action Verb → Technical Task → Outcome / Metric.",
      example: "Automated test suite using Cypress, reducing regression testing cycle time by 4 hours per release.",
    },
  ];

  let scoreChangeText = null;
  if (previousScore !== undefined && previousScore !== null) {
    const diff = overallScore - previousScore;
    const sign = diff >= 0 ? "+" : "";
    scoreChangeText = `Previous Score: ${previousScore}/100 | Current Score: ${overallScore}/100 | Score Change: ${sign}${diff}`;
  }

  const iterationReminder = overallScore < 100
    ? `💡 Your resume currently scores ${overallScore}/100. Update your resume based on the suggestions above and paste the updated version here to get re-evaluated!`
    : "🎉 Exceptional! Your resume scores 100/100 across all evaluation metrics.";

  return {
    isValidResume: true,
    overallScore,
    status,
    jobMatchScore,
    scoreBreakdown: {
      atsCompatibility: { score: atsCompatibility, max: 20 },
      contentQuality: { score: contentQuality, max: 20 },
      impactQuantification: { score: impactQuantification, max: 15 },
      skillsKeywordOpt: { score: skillsKeywordOpt, max: 15 },
      experienceProjects: { score: experienceProjects, max: 15 },
      formattingReadability: { score: formattingReadability, max: 10 },
      professionalism: { score: professionalism, max: 5 },
    },
    criticalIssues,
    keywordAnalysis,
    lineFixes: lineFixes.slice(0, 6),
    improvementGuide,
    finalVerdict: {
      status,
      biggestStrengths: [
        hasSkills ? "Dedicated skills structure present" : "Clear textual layout",
        hasProjects ? "Technical project descriptions included" : "Basic career/education timeline available",
      ],
      biggestWeaknesses: [
        impactQuantification < 12 ? "Bullet points lack measurable metrics and quantified outcomes" : "Keyword alignment can be further sharpened",
        "Passive verb usage in bullet descriptions",
      ],
      top3Actions: [
        "Quantify 3-5 bullet points with metrics (%, time saved, user count)",
        "Replace passive verbs ('helped', 'worked on') with active engineering verbs",
        "Categorize skills into Languages, Frameworks, Databases, and Tools",
      ],
    },
    scoreChangeText,
    iterationReminder,
  };
};

// ─── MAIN AI RESUME ANALYZER (GEMINI WITH FALLBACK) ───────────────────────────
const analyzeResumeAI = async ({ resumeText, jobDescription, previousScore }) => {
  if (!process.env.GEMINI_API_KEY) {
    return analyzeResumeOffline({ resumeText, jobDescription, previousScore });
  }

  const prompt = `
You are an Expert ATS (Applicant Tracking System) Resume Analyzer, Resume Reviewer, and Resume Optimization AI.

INPUT RESUME TEXT:
"""
${(resumeText || "").slice(0, 4000)}
"""

TARGET JOB DESCRIPTION (if provided):
"""
${(jobDescription || "None provided").slice(0, 2000)}
"""

PREVIOUS SCORE (if available): ${previousScore !== undefined && previousScore !== null ? previousScore : "None"}

CRITICAL STEP 1 — STRICT INPUT VALIDATION:
Evaluate if the text contains a valid resume (contact info, education, skills, experience, projects, achievements, etc.).
If the input is general chat, an essay, code, a cover letter alone, a question, or random text, IT IS NOT A RESUME.
In that case, respond ONLY with a JSON object:
{
  "isValidResume": false,
  "errorMessage": "⚠️ Error: Invalid input detected. Please upload or paste a valid resume to get a review."
}

CRITICAL STEP 2 — COMPREHENSIVE ATS EVALUATION (IF VALID RESUME):
Evaluate the resume using the 7 weighted categories (Total = 100 points):
1. ATS Compatibility (max 20)
2. Content Quality (max 20)
3. Impact & Quantification (max 15)
4. Skills & Keyword Optimization (max 15)
5. Experience/Projects Quality (max 15)
6. Formatting & Readability (max 10)
7. Professionalism & Consistency (max 5)

Calculate Overall Score (sum of above out of 100).
Calculate Job Match Score (out of 100) if Job Description was provided, otherwise null.

ANTI-FABRICATION RULE:
NEVER invent metrics, dates, companies, tools, or achievements. If metrics are missing, state "Metric opportunity: Needs measurable outcome".

Respond ONLY with a JSON object matching this exact schema (no markdown formatting outside JSON):
{
  "isValidResume": true,
  "overallScore": <integer 0-100>,
  "status": "<Strong | Needs Improvement | Major Revision Required>",
  "jobMatchScore": <integer 0-100 or null>,
  "scoreBreakdown": {
    "atsCompatibility": { "score": <0-20>, "max": 20 },
    "contentQuality": { "score": <0-20>, "max": 20 },
    "impactQuantification": { "score": <0-15>, "max": 15 },
    "skillsKeywordOpt": { "score": <0-15>, "max": 15 },
    "experienceProjects": { "score": <0-15>, "max": 15 },
    "formattingReadability": { "score": <0-10>, "max": 10 },
    "professionalism": { "score": <0-5>, "max": 5 }
  },
  "criticalIssues": [
    "🔴 Critical: ...",
    "🟠 Needs Improvement: ..."
  ],
  "keywordAnalysis": {
    "presentKeywords": ["keyword1", "keyword2"],
    "missingKeywords": ["keyword3", "keyword4"],
    "weaklyDemonstrated": ["keyword5"],
    "keywordStuffingRisk": "Low risk"
  },
  "lineFixes": [
    {
      "original": "Helped build backend",
      "issue": "Starts with weak verb",
      "whyItMatters": "Passive verb hides initiative",
      "howToFix": "Use Engineered or Developed",
      "rewrite": "Engineered REST API backend serving 500 requests/sec"
    }
  ],
  "improvementGuide": [
    {
      "priority": "Priority 1 — Critical Issues",
      "problem": "...",
      "whyItMatters": "...",
      "action": "...",
      "example": "..."
    },
    {
      "priority": "Priority 2 — High-Impact Improvements",
      "problem": "...",
      "whyItMatters": "...",
      "action": "...",
      "example": "..."
    },
    {
      "priority": "Priority 3 — Medium Improvements",
      "problem": "...",
      "whyItMatters": "...",
      "action": "...",
      "example": "..."
    },
    {
      "priority": "Priority 4 — Final Polish",
      "problem": "...",
      "whyItMatters": "...",
      "action": "...",
      "example": "..."
    }
  ],
  "finalVerdict": {
    "status": "<Strong | Needs Improvement | Major Revision Required>",
    "biggestStrengths": ["strength 1", "strength 2"],
    "biggestWeaknesses": ["weakness 1", "weakness 2"],
    "top3Actions": ["action 1", "action 2", "action 3"]
  },
  "scoreChangeText": "<Previous Score: X/100 | Current Score: Y/100 | Score Change: +Z or null>",
  "iterationReminder": "💡 Your resume currently scores [X]/100. Update your resume based on the suggestions above and paste the updated version here to get re-evaluated!"
}
`;

  try {
    const raw = await callGemini(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.overallScore !== undefined && parsed.overallScore < 100) {
      parsed.iterationReminder = `💡 Your resume currently scores ${parsed.overallScore}/100. Update your resume based on the suggestions above and paste the updated version here to get re-evaluated!`;
    }

    return parsed;
  } catch (err) {
    console.error("Gemini ATS analysis error, running offline analyzer:", err.message);
    return analyzeResumeOffline({ resumeText, jobDescription, previousScore });
  }
};

module.exports = { generateQuestions, analyzeInterview, chatWithGungun, analyzeResumeAI, analyzeResumeOffline };

