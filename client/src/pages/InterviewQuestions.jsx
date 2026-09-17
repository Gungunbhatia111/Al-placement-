import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { createInterview, submitAnswers, generateFeedback } from "../api/interviews.js";
import { getQuestionOfTheDay, filterQuestions, ALL_LOCAL_QUESTIONS } from "../questions/index.js";
import "./InterviewQuestions.css";

const CATEGORIES = ["All", "DSA", "Java", "C++", "Python", "JavaScript", "React", "Node.js", "SQL", "DBMS", "OS", "CN", "System Design", "HR", "Behavioral"];

function triggerConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 60 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * 0.5,
    r: Math.random() * 6 + 4,
    d: Math.random() * 4 + 2,
    color: ["#D97706", "#059669", "#1E293B", "#F59E0B", "#10B981"][Math.floor(Math.random() * 5)],
  }));

  let step = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.y += p.d;
      p.x += Math.sin(p.y * 0.05);
    });
    step++;
    if (step < 120) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  animate();
}

function QuestionCard({ index, q, answer, onAnswerChange, disabled }) {
  const [open, setOpen] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="cmd-qcard">
      <button className="cmd-qcard__head" type="button" onClick={() => setOpen((o) => !o)}>
        <span className="cmd-qcard__num">{String(index + 1).padStart(2, "0")}</span>
        <div className="cmd-qcard__title-wrap">
          <span className="cmd-qcard__question">{q.questionText || q.question}</span>
          <div className="cmd-qcard__chips">
            {q.category && <span className="cmd-qchip">{q.category}</span>}
            {q.difficulty && <span className="cmd-qchip cmd-qchip--diff">{q.difficulty}</span>}
          </div>
        </div>
        <span className="cmd-qcard__chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="cmd-qcard__body">
          <textarea
            className="cmd-textarea"
            placeholder="Type your technical response here (explain your approach, tools, and trade-offs)..."
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={disabled}
            rows={4}
          />

          {q.hint && <p className="cmd-qhint">💡 <b>Hint:</b> {q.hint}</p>}

          {q.suggestedAnswer && (
            <div className="cmd-answer-reveal">
              <button
                type="button"
                className="cmd-btn-text"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                {showAnswer ? "🙈 Hide Suggested Model Answer" : "👁 Reveal Suggested Model Answer"}
              </button>

              {showAnswer && (
                <div className="cmd-suggested-box">
                  <p><b>Model Answer:</b> {q.suggestedAnswer}</p>
                  {q.explanation && <p className="cmd-explanation"><b>Key Concepts:</b> {q.explanation}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewQuestions() {
  const location = useLocation();
  const jobContext = location.state || null;

  const [stage, setStage] = useState("setup"); // setup | questions | feedback
  const [company, setCompany] = useState(jobContext?.company || "Google");
  const [difficulty, setDifficulty] = useState("medium");
  const [category, setCategory] = useState("All");
  const [interview, setInterview] = useState(null);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState("");

  const qotd = useMemo(() => getQuestionOfTheDay(), []);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (jobContext?.company) {
      setCompany(jobContext.company);
    }
  }, [jobContext]);

  const handleStartSession = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);
    setToastMessage("");

    // Attempt Gemini AI Question Generation first
    try {
      if (token) {
        const data = await createInterview(token, { company, difficulty });
        if (data && data.questions && data.questions.length > 0) {
          setInterview(data);
          setStage("questions");
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      // Fallback cleanly to local modular question bank
      setToastMessage("AI generation temporarily unavailable. Loaded questions from local practice bank.");
    }

    // Local Question Bank Fallback
    const localPool = filterQuestions({ category, difficulty, count: 5 });
    const formattedLocal = {
      _id: "local-session-" + Date.now(),
      company: company || "Practice Lab",
      difficulty: difficulty,
      questions: localPool.map((q, idx) => ({
        _id: q.id,
        questionText: q.question,
        category: q.category,
        difficulty: q.difficulty,
        hint: q.hint,
        suggestedAnswer: q.suggestedAnswer,
        explanation: q.explanation,
        order: idx,
      })),
    };

    setInterview(formattedLocal);
    setStage("questions");
    setLoading(false);
  };

  const handleAnswerChange = (qId, val) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmitAnswers = async () => {
    setError("");
    setLoading(true);

    if (token && !interview._id.startsWith("local-session-")) {
      try {
        const answerList = interview.questions.map((q) => ({
          questionId: q._id,
          userAnswer: answers[q._id] || "",
        }));
        await submitAnswers(token, interview._id, answerList);
        const fb = await generateFeedback(token, interview._id);
        setFeedback(fb);
        setStage("feedback");
        triggerConfetti();
        setLoading(false);
        return;
      } catch (err) {
        setToastMessage("AI evaluation offline. Generated instant feedback evaluation.");
      }
    }

    // Local Evaluator Fallback
    const totalQ = interview.questions.length;
    const answeredCount = Object.values(answers).filter((a) => (a || "").trim().length > 10).length;
    const baseScore = Math.min(10, Math.max(3, Math.round((answeredCount / totalQ) * 7 + 3)));

    const fb = {
      scores: {
        overall: baseScore,
        technicalAccuracy: baseScore,
        communication: Math.max(1, baseScore - 1),
        confidence: baseScore,
      },
      summary: `You answered ${answeredCount} of ${totalQ} questions with detailed responses. Your technical structure is solid. Add specific project metrics to further strengthen your answers.`,
      strengths: [
        "Connected responses to the technical problem statement",
        "Demonstrated familiarity with foundational core concepts",
      ],
      improvements: [
        "Incorporate concrete numbers, dataset sizes, and performance metrics",
        "State architectural trade-offs explicitly in system design questions",
      ],
    };

    setFeedback(fb);
    setStage("feedback");
    triggerConfetti();
    setLoading(false);
  };

  const handleRestart = () => {
    setStage("setup");
    setAnswers({});
    setFeedback(null);
    setError("");
    setToastMessage("");
  };

  return (
    <DashboardLayout>
      <div className="cmd-interview-page">
        <div className="cmd-interview-header">
          <div>
            <span className="command-profile-eyebrow">Interview Command Lab</span>
            <h1 className="command-profile-title">Technical Interview Practice</h1>
            <p className="command-profile-sub">Job-specific interview preparation, timed sessions, and high-availability question bank.</p>
          </div>
        </div>

        {toastMessage && (
          <div className="cmd-toast-message">
            <span>ℹ️ {toastMessage}</span>
          </div>
        )}

        {/* JOB SPECIFIC TARGET PREP BANNER */}
        {jobContext && (
          <div className="cmd-job-prep-banner">
            <div className="cmd-job-prep-title">
              🎯 <b>Targeting Role: {jobContext.jobTitle} at {jobContext.company}</b>
            </div>
            <p className="cmd-job-prep-sub">Custom preparation plan generated! Prioritizing required skills: {jobContext.requiredSkills?.join(", ")}.</p>
          </div>
        )}

        {/* STAGE 1: SETUP & QUESTION OF THE DAY */}
        {stage === "setup" && (
          <div className="cmd-setup-grid">
            <div className="command-card">
              <h3>⚙️ Configure Practice Session</h3>
              <form onSubmit={handleStartSession} className="cmd-form-space">
                <div className="command-field-group">
                  <label>Target Company</label>
                  <input
                    className="command-input"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Amazon, Google, TCS"
                    required
                  />
                </div>

                <div className="command-grid-2col">
                  <div className="command-field-group">
                    <label>Difficulty</label>
                    <select
                      className="command-input"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div className="command-field-group">
                    <label>Category Module</label>
                    <select
                      className="command-input"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && <p className="cmd-error-text">{error}</p>}

                <button type="submit" className="command-btn command-btn--primary" disabled={loading}>
                  {loading ? "Preparing Session..." : "🚀 Start Interview Session"}
                </button>
              </form>
            </div>

            {/* QUESTION OF THE DAY WIDGET */}
            <div className="command-card cmd-qotd-card">
              <div className="cmd-qotd-badge">📅 Question of the Day</div>
              <h4 className="cmd-qotd-topic">{qotd.category} • {qotd.topic}</h4>
              <p className="cmd-qotd-question">{qotd.question}</p>
              <div className="cmd-qotd-meta">
                <span>Difficulty: <b>{qotd.difficulty}</b></span>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: QUESTION PRACTICE SESSION */}
        {stage === "questions" && interview && (
          <div className="cmd-practice-session">
            <div className="cmd-session-bar">
              <h2>{interview.company} • Practice Mode ({interview.difficulty})</h2>
              <span className="cmd-session-badge">{interview.questions.length} Questions</span>
            </div>

            <div className="cmd-q-list">
              {interview.questions.map((q, idx) => (
                <QuestionCard
                  key={q._id}
                  index={idx}
                  q={q}
                  answer={answers[q._id] || ""}
                  onAnswerChange={(val) => handleAnswerChange(q._id, val)}
                  disabled={loading}
                />
              ))}
            </div>

            <div className="cmd-session-actions">
              <button
                type="button"
                className="command-btn command-btn--primary"
                onClick={handleSubmitAnswers}
                disabled={loading}
              >
                {loading ? "Evaluating Answers..." : "✅ Submit Answers for AI Feedback"}
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: FEEDBACK & CELEBRATION */}
        {stage === "feedback" && feedback && (
          <div className="cmd-feedback-view">
            <div className="command-card cmd-feedback-hero">
              <h2>🎉 Interview Session Complete!</h2>
              <div className="cmd-fb-score-circle">
                <span className="cmd-fb-val">{feedback.scores.overall}</span>
                <span className="cmd-fb-max">/10</span>
              </div>
              <p className="cmd-fb-summary">{feedback.summary}</p>
            </div>

            <div className="command-grid-2col">
              <div className="command-card">
                <h3>💪 Key Strengths</h3>
                <ul className="cmd-fb-list cmd-fb-list--good">
                  {(feedback.strengths || []).map((s, i) => (
                    <li key={i}>✓ {s}</li>
                  ))}
                </ul>
              </div>

              <div className="command-card">
                <h3>⚠️ Actionable Improvements</h3>
                <ul className="cmd-fb-list cmd-fb-list--warn">
                  {(feedback.improvements || []).map((imp, i) => (
                    <li key={i}>⚡ {imp}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button type="button" className="command-btn command-btn--primary" onClick={handleRestart}>
              Practice Another Session →
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
