import { useCallback, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { uploadResume, analyzeResumeApi } from "../api/resumes.js";
import { sendMessage } from "../api/chat.js";
import "./ResumeFeedback.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    pages.push(pageText);
  }
  return pages.join("\n");
}

const JOB_PRESETS = [
  {
    title: "Software Engineer",
    jd: "Looking for a Software Engineer proficient in Data Structures, Algorithms, REST APIs, Microservices, Git, Docker, System Design, Unit Testing, and Agile methodologies.",
  },
  {
    title: "Frontend Developer",
    jd: "Seeking Frontend Developer experienced in React, JavaScript/TypeScript, HTML5, CSS3, Webpack, Responsive Design, State Management, Web Performance Optimization, and Accessibility.",
  },
  {
    title: "Backend Developer",
    jd: "Required Backend Engineer with strong expertise in Node.js, Express, Python, SQL, MongoDB, Redis, GraphQL, CI/CD pipelines, Docker, and Cloud Services (AWS/GCP).",
  },
  {
    title: "Data Analyst",
    jd: "Looking for Data Analyst skilled in SQL, Python, Excel, Power BI, Tableau, ETL Pipelines, Statistical Analysis, Data Visualization, Pandas, and Business Metrics.",
  },
  {
    title: "Product Manager",
    jd: "Seeking Product Manager with background in Product Roadmaps, Stakeholder Alignment, User Research, KPIs, A/B Testing, OKRs, Agile Sprint Planning, and Product Analytics.",
  },
  {
    title: "DevOps Engineer",
    jd: "Requires DevOps Engineer experienced in Kubernetes, Docker, Terraform, CI/CD (GitHub Actions/Jenkins), Linux System Administration, Cloud Infrastructure (AWS), and Monitoring (Prometheus/Grafana).",
  },
];

const SCAN_STEPS = [
  "Running strict resume input validation...",
  "Evaluating 7 ATS scoring categories...",
  "Analyzing job description keyword alignment...",
  "Checking bullet points for weak verbs & missing metrics...",
  "Generating prioritized iterative improvement guide...",
];

export default function ResumeFeedback() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showJdInput, setShowJdInput] = useState(false);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [phase, setPhase] = useState("idle"); // idle | scanning | done
  const [scanStep, setScanStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [invalidErrorMessage, setInvalidErrorMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [activeTab, setActiveTab] = useState("breakdown"); // breakdown | risks | keywords | rewrites | guide | verdict | simulator | export
  const [simulatedCheckboxes, setSimulatedCheckboxes] = useState({});
  const [doctorPrompt, setDoctorPrompt] = useState("");
  const [doctorReply, setDoctorReply] = useState("");
  const [doctorLoading, setDoctorLoading] = useState(false);

  const fileRef = useRef(null);
  const token = localStorage.getItem("token");

  const handleAnalyze = useCallback(async () => {
    setInvalidErrorMessage("");
    setFileError("");

    if (!resumeText.trim()) {
      setInvalidErrorMessage("⚠️ Error: Invalid input detected. Please upload or paste a valid resume to get a review.");
      return;
    }

    setPhase("scanning");
    setScanStep(0);

    let step = 0;
    const iv = setInterval(() => {
      step++;
      setScanStep(step);
      if (step >= SCAN_STEPS.length - 1) {
        clearInterval(iv);
      }
    }, 450);

    try {
      const res = await analyzeResumeApi(token, {
        resumeText,
        jobDescription: showJdInput ? jobDescription : "",
        targetRole,
      });

      clearInterval(iv);

      if (res.isValidResume === false) {
        setInvalidErrorMessage(res.errorMessage || "⚠️ Error: Invalid input detected. Please upload or paste a valid resume to get a review.");
        setPhase("idle");
        return;
      }

      setAnalysisResult(res);
      setPhase("done");
      setActiveTab("breakdown");
    } catch (err) {
      clearInterval(iv);
      setInvalidErrorMessage(err.message || "Failed to analyze resume. Please try again.");
      setPhase("idle");
    }
  }, [resumeText, jobDescription, showJdInput, targetRole, token]);

  const readFile = async (file) => {
    if (!file) return;
    setFileError("");
    setUploadMessage("");
    setInvalidErrorMessage("");

    if (file.name.toLowerCase().endsWith(".pdf")) {
      try {
        if (token) {
          try {
            await uploadResume(token, file);
            setUploadMessage("Resume uploaded and saved to your profile.");
          } catch {
            // Upload to server optional, fallback to client parsing
          }
        }
        const extracted = await extractPdfText(file);
        setResumeText(extracted);
      } catch {
        setFileError("Could not parse PDF text. Please copy-paste your resume text instead.");
      }
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => setResumeText(ev.target?.result ?? "");
      reader.readAsText(file);
      setUploadMessage("Resume text file loaded successfully.");
    }
  };

  const handleFileInput = (e) => readFile(e.target.files?.[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    readFile(e.dataTransfer.files?.[0]);
  };

  const handleReset = () => {
    setPhase("idle");
    setAnalysisResult(null);
    setInvalidErrorMessage("");
    setFileError("");
    setUploadMessage("");
    setSimulatedCheckboxes({});
  };

  const handleAskDoctor = async () => {
    if (!doctorPrompt.trim()) return;
    setDoctorLoading(true);
    try {
      const res = await sendMessage(
        token,
        `I am working on my resume. ${doctorPrompt}`,
        targetRole
      );
      setDoctorReply(res.reply || res.message || "Advice generated successfully.");
    } catch (err) {
      setDoctorReply("Gungun AI says: Focus on quantifying your bullet points with measurable impact (%, numbers, scale).");
    } finally {
      setDoctorLoading(false);
    }
  };

  const calculateSimulatedScore = () => {
    if (!analysisResult) return 0;
    let base = analysisResult.overallScore || 0;
    const checkedCount = Object.values(simulatedCheckboxes).filter(Boolean).length;
    return Math.min(100, base + checkedCount * 4);
  };

  const renderStatusBadge = (status) => {
    if (status === "Strong") return <span className="ats-status-badge ats-status-badge--strong">🟢 Resume Status: Strong</span>;
    if (status === "Needs Improvement") return <span className="ats-status-badge ats-status-badge--warn">🟡 Resume Status: Needs Improvement</span>;
    return <span className="ats-status-badge ats-status-badge--danger">🔴 Resume Status: Major Revision Required</span>;
  };

  return (
    <DashboardLayout>
      <div className="ats-analyzer-container">
        {/* IDLE INPUT STATE */}
        {phase === "idle" && (
          <div className="ats-input-section">
            <div className="ats-hero-header">
              <span className="ats-eyebrow-pill">⚡ ATS Resume Engine & Optimization AI</span>
              <h1 className="ats-hero-title">Professional ATS Resume Reviewer</h1>
              <p className="ats-hero-subtitle">
                Accurate, critical, evidence-based feedback. Evaluate ATS compatibility, bullet impact, keyword match, and 7 weighted categories with zero hallucinated data.
              </p>
            </div>

            {invalidErrorMessage && (
              <div className="ats-error-banner">
                <span>{invalidErrorMessage}</span>
              </div>
            )}

            <div className="ats-input-card">
              <div className="ats-input-tabs">
                <button type="button" className="ats-tab-btn ats-tab-btn--active">📄 Resume Content</button>
              </div>

              <div
                className="ats-dropzone"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="ats-dropzone__icon">📂</div>
                <div className="ats-dropzone__title">Drag & drop your resume PDF / TXT here</div>
                <div className="ats-dropzone__sub">or click to browse files</div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.pdf"
                  style={{ display: "none" }}
                  onChange={handleFileInput}
                />
              </div>

              {fileError && <p className="ats-field-error">{fileError}</p>}
              {uploadMessage && <p className="ats-field-success">{uploadMessage}</p>}

              <div className="ats-divider">— or paste resume text —</div>

              <textarea
                className="ats-textarea"
                rows={10}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder={`Paste your full resume text here...\n\nExample:\nAlex Morgan\nalex@example.com | (555) 123-4567 | linkedin.com/in/alexmorgan\n\nPROFESSIONAL SUMMARY\nSoftware Engineer with 3 years of experience building web applications...\n\nSKILLS\nLanguages: JavaScript, Python, Java\nFrameworks: React, Node.js, Express\nDatabases: PostgreSQL, MongoDB\nTools: Docker, Git, Jest\n\nEXPERIENCE\nSoftware Developer | TechCorp (2022 - Present)\n• Built REST APIs using Node.js and Express for user management\n• Helped improve database query response times\n• Collaborated with frontend team on React features\n\nEDUCATION\nB.S. in Computer Science | State University (2018 - 2022)`}
              />

              {/* OPTIONAL JOB DESCRIPTION INPUT */}
              <div className="ats-jd-section">
                <div className="ats-jd-header" onClick={() => setShowJdInput(!showJdInput)}>
                  <div className="ats-jd-title">
                    <span>🎯 Target Job Description Alignment</span>
                    <span className="ats-jd-tag">{showJdInput ? "Active" : "Optional"}</span>
                  </div>
                  <button type="button" className="ats-toggle-btn">{showJdInput ? "— Hide JD" : "+ Add JD for Job Match Score"}</button>
                </div>

                {showJdInput && (
                  <div className="ats-jd-body">
                    <p className="ats-jd-desc">Select a target role preset or paste a custom Job Description to compute a <b>Job Match Score (X/100)</b> and analyze keyword gaps:</p>

                    <div className="ats-preset-chips">
                      {JOB_PRESETS.map((preset) => (
                        <button
                          key={preset.title}
                          type="button"
                          className={`ats-preset-chip ${targetRole === preset.title ? "ats-preset-chip--active" : ""}`}
                          onClick={() => {
                            setTargetRole(preset.title);
                            setJobDescription(preset.jd);
                          }}
                        >
                          {preset.title}
                        </button>
                      ))}
                    </div>

                    <textarea
                      className="ats-textarea ats-textarea--jd"
                      rows={5}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste target Job Description (JD) text here..."
                    />
                  </div>
                )}
              </div>

              <div className="ats-action-row">
                <button
                  type="button"
                  className="ats-primary-btn"
                  onClick={handleAnalyze}
                >
                  🚀 Run ATS Resume Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCANNING LOADING STATE */}
        {phase === "scanning" && (
          <div className="ats-scanning-card">
            <div className="ats-spinner" />
            <h2 className="ats-scanning-title">Analyzing Resume & ATS Compatibility...</h2>
            <p className="ats-scanning-sub">Evaluating structure, content quality, metrics, and keyword alignment</p>
            <div className="ats-scan-steps">
              {SCAN_STEPS.map((step, idx) => (
                <div
                  key={step}
                  className={`ats-scan-step ${idx < scanStep ? "ats-scan-step--done" : idx === scanStep ? "ats-scan-step--active" : ""}`}
                >
                  <span>{idx < scanStep ? "✅" : idx === scanStep ? "⏳" : "○"}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS DASHBOARD STATE */}
        {phase === "done" && analysisResult && (
          <div className="ats-results-dashboard">
            <div className="ats-results-topbar">
              <div>
                <h1 className="ats-results-title">📊 ATS Resume Analysis Report</h1>
                <p className="ats-results-meta">Strict evidence-based evaluation • No hallucinated metrics</p>
              </div>
              <button type="button" className="ats-secondary-btn" onClick={handleReset}>
                ← Analyze Another Resume
              </button>
            </div>

            {/* SCORE HERO HEADER */}
            <div className="ats-score-hero">
              <div className="ats-score-main">
                <div className="ats-score-circle">
                  <span className="ats-score-number">{analysisResult.overallScore}</span>
                  <span className="ats-score-denom">/100</span>
                </div>
                <div className="ats-score-info">
                  <div className="ats-status-row">
                    {renderStatusBadge(analysisResult.status)}
                    {analysisResult.jobMatchScore !== null && analysisResult.jobMatchScore !== undefined && (
                      <span className="ats-jobmatch-pill">🎯 Job Match: {analysisResult.jobMatchScore}/100</span>
                    )}
                  </div>
                  {analysisResult.scoreChangeText && (
                    <div className="ats-delta-banner">
                      <span>📈 {analysisResult.scoreChangeText}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="ats-tab-bar">
              {[
                { id: "breakdown", label: "📊 Score Breakdown" },
                { id: "risks", label: `🚨 Critical Issues (${(analysisResult.criticalIssues || []).length})` },
                { id: "keywords", label: "🔑 Keyword Match" },
                { id: "rewrites", label: `💥 Bullet Rewrites (${(analysisResult.lineFixes || []).length})` },
                { id: "guide", label: "🔧 Improvement Guide" },
                { id: "verdict", label: "✅ Final Verdict" },
                { id: "simulator", label: "🧮 Live Simulator" },
                { id: "export", label: "📄 Export Report" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`ats-tab-item ${activeTab === tab.id ? "ats-tab-item--active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT PANELS */}
            <div className="ats-tab-content">
              {/* 1. SCORE BREAKDOWN TAB */}
              {activeTab === "breakdown" && (
                <div className="ats-panel">
                  <h3 className="ats-panel-title">🔍 Weighted 7-Category Score Breakdown</h3>
                  <div className="ats-table-wrap">
                    <table className="ats-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Weight</th>
                          <th>Score</th>
                          <th>Status Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResult.scoreBreakdown && Object.entries(analysisResult.scoreBreakdown).map(([key, item]) => {
                          const labelMap = {
                            atsCompatibility: "ATS Compatibility",
                            contentQuality: "Content Quality",
                            impactQuantification: "Impact & Quantification",
                            skillsKeywordOpt: "Skills & Keyword Optimization",
                            experienceProjects: "Experience / Projects Quality",
                            formattingReadability: "Formatting & Readability",
                            professionalism: "Professionalism & Consistency",
                          };
                          const label = labelMap[key] || key;
                          const pct = Math.round((item.score / item.max) * 100);
                          const tone = pct >= 80 ? "good" : pct >= 60 ? "warn" : "bad";
                          return (
                            <tr key={key}>
                              <td className="ats-td-bold">{label}</td>
                              <td>{item.max} pts</td>
                              <td className={`ats-td-score ats-td-score--${tone}`}>{item.score} / {item.max}</td>
                              <td>
                                <div className="ats-mini-bar-track">
                                  <div className={`ats-mini-bar-fill ats-tone-${tone}`} style={{ width: `${pct}%` }} />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. CRITICAL ISSUES & ATS RISKS TAB */}
              {activeTab === "risks" && (
                <div className="ats-panel">
                  <h3 className="ats-panel-title">🚨 Critical ATS & Formatting Risks</h3>
                  {(!analysisResult.criticalIssues || analysisResult.criticalIssues.length === 0) ? (
                    <div className="ats-empty-state">
                      <span>🟢 No critical ATS parsing risks detected!</span>
                    </div>
                  ) : (
                    <div className="ats-risk-list">
                      {analysisResult.criticalIssues.map((issue, idx) => (
                        <div key={idx} className="ats-risk-card">
                          <span className="ats-risk-text">{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. KEYWORD ANALYSIS TAB */}
              {activeTab === "keywords" && (
                <div className="ats-panel">
                  <h3 className="ats-panel-title">🔑 Job Description Keyword Match Engine</h3>
                  {!analysisResult.keywordAnalysis ? (
                    <div className="ats-empty-state">
                      <p>No Job Description was provided during submission.</p>
                      <button type="button" className="ats-secondary-btn" onClick={handleReset}>
                        + Add Job Description for Keyword Match
                      </button>
                    </div>
                  ) : (
                    <div className="ats-keyword-grid">
                      <div className="ats-keyword-box ats-keyword-box--present">
                        <h4>🟢 Demonstrated Keywords ({analysisResult.keywordAnalysis.presentKeywords?.length || 0})</h4>
                        <div className="ats-chip-wrap">
                          {(analysisResult.keywordAnalysis.presentKeywords || []).map((kw) => (
                            <span key={kw} className="ats-chip ats-chip--green">✓ {kw}</span>
                          ))}
                        </div>
                      </div>

                      <div className="ats-keyword-box ats-keyword-box--missing">
                        <h4>🔴 Missing Target Keywords ({analysisResult.keywordAnalysis.missingKeywords?.length || 0})</h4>
                        <div className="ats-chip-wrap">
                          {(analysisResult.keywordAnalysis.missingKeywords || []).map((kw) => (
                            <span key={kw} className="ats-chip ats-chip--red">✗ {kw}</span>
                          ))}
                        </div>
                      </div>

                      <div className="ats-keyword-box ats-keyword-box--weak">
                        <h4>🟠 Weakly Demonstrated Keywords</h4>
                        <div className="ats-chip-wrap">
                          {(analysisResult.keywordAnalysis.weaklyDemonstrated || []).map((kw) => (
                            <span key={kw} className="ats-chip ats-chip--yellow">⚡ {kw}</span>
                          ))}
                        </div>
                      </div>

                      <div className="ats-keyword-box">
                        <h4>🛡️ Keyword Stuffing Audit</h4>
                        <p className="ats-audit-text">{analysisResult.keywordAnalysis.keywordStuffingRisk || "Low risk of keyword repetition"}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. BULLET POINT & IMPACT REWRITES TAB */}
              {activeTab === "rewrites" && (
                <div className="ats-panel">
                  <h3 className="ats-panel-title">💥 Bullet Point & Action Verb Analysis</h3>
                  {(!analysisResult.lineFixes || analysisResult.lineFixes.length === 0) ? (
                    <div className="ats-empty-state">
                      <span>🎉 Bullet points are strong and action-oriented!</span>
                    </div>
                  ) : (
                    <div className="ats-bullet-fix-list">
                      {analysisResult.lineFixes.map((fix, idx) => (
                        <div key={idx} className="ats-rewrite-card">
                          <div className="ats-rewrite-header">
                            <span className="ats-rewrite-badge">Issue #{idx + 1}: {fix.issue}</span>
                          </div>
                          <p className="ats-rewrite-why"><b>Why it matters:</b> {fix.whyItMatters}</p>
                          <p className="ats-rewrite-how"><b>How to fix:</b> {fix.howToFix}</p>

                          <div className="ats-code-comparison">
                            <div className="ats-code-box ats-code-box--before">
                              <span className="ats-code-label">✗ Original</span>
                              <code>{fix.original}</code>
                            </div>
                            <div className="ats-code-box ats-code-box--after">
                              <div className="ats-code-top">
                                <span className="ats-code-label">✓ Proposed Action-Oriented Rewrite</span>
                                <button
                                  type="button"
                                  className="ats-copy-btn"
                                  onClick={() => navigator.clipboard.writeText(fix.rewrite)}
                                >
                                  Copy Fix
                                </button>
                              </div>
                              <code>{fix.rewrite}</code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. ITERATIVE IMPROVEMENT GUIDE TAB */}
              {activeTab === "guide" && (
                <div className="ats-panel">
                  <h3 className="ats-panel-title">🔧 Prioritized Iterative Improvement Guide</h3>
                  <div className="ats-guide-list">
                    {(analysisResult.improvementGuide || []).map((guide, idx) => (
                      <div key={idx} className="ats-guide-card">
                        <h4 className="ats-guide-priority">{guide.priority}</h4>
                        <div className="ats-guide-row">
                          <span className="ats-guide-label">Problem:</span>
                          <span>{guide.problem}</span>
                        </div>
                        <div className="ats-guide-row">
                          <span className="ats-guide-label">Why it matters:</span>
                          <span>{guide.whyItMatters}</span>
                        </div>
                        <div className="ats-guide-row">
                          <span className="ats-guide-label">Action:</span>
                          <span>{guide.action}</span>
                        </div>
                        <div className="ats-guide-example">
                          <span className="ats-guide-label">Example:</span>
                          <code>{guide.example}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. FINAL VERDICT TAB */}
              {activeTab === "verdict" && (
                <div className="ats-panel">
                  <h3 className="ats-panel-title">✅ Final Verdict & Action Checklist</h3>
                  <div className="ats-verdict-grid">
                    <div className="ats-verdict-card ats-verdict-card--strengths">
                      <h4>💪 Biggest Strengths</h4>
                      <ul>
                        {(analysisResult.finalVerdict?.biggestStrengths || []).map((s, i) => (
                          <li key={i}>✓ {s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="ats-verdict-card ats-verdict-card--weaknesses">
                      <h4>⚠️ Key Weaknesses</h4>
                      <ul>
                        {(analysisResult.finalVerdict?.biggestWeaknesses || []).map((w, i) => (
                          <li key={i}>✗ {w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="ats-top-actions-box">
                    <h4>📌 Top 3 Actions to Implement First</h4>
                    <ol>
                      {(analysisResult.finalVerdict?.top3Actions || []).map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {/* 7. LIVE SIMULATOR TAB */}
              {activeTab === "simulator" && (
                <div className="ats-panel">
                  <h3 className="ats-panel-title">🧮 Interactive Target Score Simulator</h3>
                  <p className="ats-sim-desc">Check off items as you implement fixes to preview your target score boost in real-time:</p>

                  <div className="ats-sim-score-box">
                    <div className="ats-sim-val">Simulated Target Score: <b>{calculateSimulatedScore()} / 100</b></div>
                    <div className="ats-sim-delta">Potential Boost: +{calculateSimulatedScore() - analysisResult.overallScore} pts</div>
                  </div>

                  <div className="ats-sim-checklist">
                    {[
                      "Added measurable metrics (%, numbers, scale) to 3+ bullet points",
                      "Replaced weak passive verbs ('helped', 'worked on') with active engineering verbs",
                      "Categorized technical skills into Languages, Frameworks, Databases, and Tools",
                      "Added missing target role keywords to Skills and Experience sections",
                      "Ensured single-column format with clear standard headings (Summary, Education, Experience, Skills)",
                    ].map((item, idx) => (
                      <label key={idx} className="ats-sim-item">
                        <input
                          type="checkbox"
                          checked={!!simulatedCheckboxes[idx]}
                          onChange={(e) => setSimulatedCheckboxes({ ...simulatedCheckboxes, [idx]: e.target.checked })}
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. EXPORT REPORT TAB */}
              {activeTab === "export" && (
                <div className="ats-panel">
                  <h3 className="ats-panel-title">📄 Export Resume Audit Report</h3>
                  <p className="ats-sim-desc">Copy your complete structured evaluation report in Markdown format:</p>

                  <textarea
                    className="ats-textarea ats-textarea--export"
                    rows={12}
                    readOnly
                    value={`# 📊 ATS RESUME AUDIT REPORT

Overall Score: ${analysisResult.overallScore} / 100
Status: ${analysisResult.status}
${analysisResult.jobMatchScore ? `Job Match Score: ${analysisResult.jobMatchScore} / 100\n` : ""}

## Critical Issues & ATS Risks
${(analysisResult.criticalIssues || []).map((issue) => `- ${issue}`).join("\n")}

## Top Recommended Actions
${(analysisResult.finalVerdict?.top3Actions || []).map((act, i) => `${i + 1}. ${act}`).join("\n")}

## Prioritized Improvement Guide
${(analysisResult.improvementGuide || [])
  .map((g) => `### ${g.priority}\n- **Problem:** ${g.problem}\n- **Why it matters:** ${g.whyItMatters}\n- **Action:** ${g.action}\n- **Example:** ${g.example}`)
  .join("\n\n")}

${analysisResult.iterationReminder}
`}
                  />

                  <button
                    type="button"
                    className="ats-primary-btn ats-copy-report-btn"
                    onClick={() => {
                      const text = document.querySelector(".ats-textarea--export").value;
                      navigator.clipboard.writeText(text);
                      alert("Audit Report copied to clipboard!");
                    }}
                  >
                    📋 Copy Full Report to Clipboard
                  </button>
                </div>
              )}
            </div>

            {/* MANDATORY ITERATION REMINDER FOOTER */}
            {analysisResult.iterationReminder && (
              <div className="ats-iteration-reminder-footer">
                <span>{analysisResult.iterationReminder}</span>
              </div>
            )}

            {/* ASK AI DOCTOR ASSISTANT FLOATING CARD */}
            <div className="ats-doctor-card">
              <div className="ats-doctor-header">
                <span>💬 Ask Gungun AI Doctor</span>
              </div>
              <div className="ats-doctor-body">
                <p className="ats-doctor-sub">Ask how to rewrite any specific bullet point or section from your resume:</p>
                <div className="ats-doctor-input-row">
                  <input
                    type="text"
                    className="ats-doctor-input"
                    placeholder="e.g. How can I quantify my React onboarding project bullet?"
                    value={doctorPrompt}
                    onChange={(e) => setDoctorPrompt(e.target.value)}
                  />
                  <button
                    type="button"
                    className="ats-doctor-btn"
                    disabled={doctorLoading}
                    onClick={handleAskDoctor}
                  >
                    {doctorLoading ? "..." : "Ask AI"}
                  </button>
                </div>
                {doctorReply && (
                  <div className="ats-doctor-reply">
                    <p>{doctorReply}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
