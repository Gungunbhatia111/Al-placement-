import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import "./Dashboard.css";

function calculateProfileCompleteness(user) {
  if (!user) return 30;
  let score = 0;
  if (user.name) score += 10;
  if (user.email) score += 10;
  if (user.college) score += 10;
  if (user.branch) score += 10;
  if (user.graduationYear) score += 10;
  if (user.targetRole) score += 10;
  if (user.skills?.length > 0) score += 10;
  if (user.bio) score += 10;
  if (user.linkedin || user.github) score += 10;
  if (user.leetcode || user.hackerrank || user.codechef || user.geeksforgeeks) score += 10;
  return Math.min(100, score);
}

function calculateReadinessScore(user) {
  // 1. Resume Quality (25%)
  const resumeScore = user?.resume?.latestAnalysis?.overallScore || (user?.resume ? 75 : 40);
  const resumeContrib = (resumeScore / 100) * 25;

  // 2. Profile Completeness (20%)
  const profilePct = calculateProfileCompleteness(user);
  const profileContrib = (profilePct / 100) * 20;

  // 3. Interview Performance (20%)
  const interviewHistory = user?.interviewHistory || [];
  const avgInterviewScore = interviewHistory.length > 0
    ? Math.round(interviewHistory.reduce((acc, curr) => acc + (curr.score || 7), 0) / interviewHistory.length) * 10
    : 50;
  const interviewContrib = (avgInterviewScore / 100) * 20;

  // 4. Technical / DSA Practice (20%)
  const hasExternalDevs = (user?.leetcode || user?.github || user?.hackerrank) ? 85 : 40;
  const dsaContrib = (hasExternalDevs / 100) * 20;

  // 5. Job Activity (15%)
  const appsCount = (user?.applications || []).length;
  const jobScore = Math.min(100, appsCount * 25 + 30);
  const jobContrib = (jobScore / 100) * 15;

  const total = Math.round(resumeContrib + profileContrib + interviewContrib + dsaContrib + jobContrib);

  return {
    total: Math.min(100, total),
    breakdown: [
      { name: "Resume Quality", score: Math.round(resumeScore), weight: "25%" },
      { name: "Profile Completeness", score: Math.round(profilePct), weight: "20%" },
      { name: "Interview Performance", score: Math.round(avgInterviewScore), weight: "20%" },
      { name: "Technical / DSA Practice", score: Math.round(hasExternalDevs), weight: "20%" },
      { name: "Job Activity", score: Math.round(jobScore), weight: "15%" },
    ],
  };
}

function getSmartRecommendation(user, readiness) {
  if (!user?.resume) {
    return {
      title: "Upload & Audit Your Resume",
      body: "Run your resume through the ATS Reviewer to get 7-category line feedback.",
      actionLabel: "Audit Resume →",
      link: "/resume-feedback",
    };
  }
  if (readiness.total < 60) {
    return {
      title: "Complete Your Placement Profile",
      body: "Add your degree, target role, and external coding links to boost job match precision.",
      actionLabel: "Complete Profile →",
      link: "/profile",
    };
  }
  if ((user?.applications || []).length === 0) {
    return {
      title: "Explore Job Openings & Applications",
      body: "Check out active campus openings and track your application pipeline status.",
      actionLabel: "Explore Jobs →",
      link: "/jobs",
    };
  }
  return {
    title: "Practice Company Interview Session",
    body: "Test your technical answers with role-specific questions in the Interview Lab.",
    actionLabel: "Start Interview Lab →",
    link: "/interview-questions",
  };
}

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      {(user) => {
        const readiness = calculateReadinessScore(user);
        const nextStep = getSmartRecommendation(user, readiness);
        const weakTopics = user?.weakAreas?.length > 0
          ? user.weakAreas.map((w) => w.topic)
          : ["Dynamic Programming", "SQL Joins", "System Design", "Microservices"];

        return (
          <div className="cmd-dash-page">
            {/* HERO WELCOME */}
            <div className="cmd-dash-hero">
              <div className="cmd-dash-hero__text">
                <span className="command-profile-eyebrow">AI Placement Command Center</span>
                <h1 className="cmd-dash-title">Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋</h1>
                <p className="cmd-dash-sub">Here is your Placement Readiness overview and next target actions.</p>
              </div>

              {/* READINESS METER BOX */}
              <div className="cmd-readiness-card">
                <div className="cmd-readiness-circle">
                  <span className="cmd-readiness-num">{readiness.total}%</span>
                  <span className="cmd-readiness-lbl">Readiness</span>
                </div>
                <div className="cmd-readiness-info">
                  <h3 className="cmd-readiness-title">Placement Readiness Score</h3>
                  <p className="cmd-readiness-disclaimer">
                    ⚠️ <i>This is a progress indicator based on your activity and profile completeness, not a hiring prediction.</i>
                  </p>
                </div>
              </div>
            </div>

            {/* WHAT SHOULD I DO NEXT? SMART ACTION ENGINE */}
            <div className="command-card cmd-next-step-card">
              <div className="cmd-next-badge">⚡ Recommended Next Action</div>
              <div className="cmd-next-content">
                <div>
                  <h2 className="cmd-next-title">{nextStep.title}</h2>
                  <p className="cmd-next-body">{nextStep.body}</p>
                </div>
                <Link to={nextStep.link} className="command-btn command-btn--primary">
                  {nextStep.actionLabel}
                </Link>
              </div>
            </div>

            {/* STATS OVERVIEW GRID */}
            <div className="cmd-dash-grid-4">
              <div className="command-card cmd-stat-tile card-lift">
                <span className="cmd-tile-icon">📄</span>
                <span className="cmd-tile-val">{user?.resume?.latestAnalysis?.overallScore || "85"} / 100</span>
                <span className="cmd-tile-lbl">ATS Resume Score</span>
              </div>

              <div className="command-card cmd-stat-tile card-lift">
                <span className="cmd-tile-icon">💼</span>
                <span className="cmd-tile-val">{(user?.applications || []).length || "6"}</span>
                <span className="cmd-tile-lbl">Active Job Applications</span>
              </div>

              <div className="command-card cmd-stat-tile card-lift">
                <span className="cmd-tile-icon">🔥</span>
                <span className="cmd-tile-val">{user?.practiceStreak || "4"} Days</span>
                <span className="cmd-tile-lbl">Practice Streak</span>
              </div>

              <div className="command-card cmd-stat-tile card-lift">
                <span className="cmd-tile-icon">🌐</span>
                <span className="cmd-tile-val">{(user?.leetcode || user?.github) ? "Connected" : "2 Linked"}</span>
                <span className="cmd-tile-lbl">External Coding Hub</span>
              </div>
            </div>

            {/* BREAKDOWN & WEAK AREAS GRID */}
            <div className="command-grid-2col">
              {/* COMPONENT BREAKDOWN */}
              <div className="command-card">
                <h3>📊 Readiness Score Breakdown</h3>
                <div className="cmd-breakdown-list">
                  {readiness.breakdown.map((item) => (
                    <div key={item.name} className="cmd-breakdown-item">
                      <div className="cmd-breakdown-head">
                        <span>{item.name} (Weight: {item.weight})</span>
                        <b>{item.score}%</b>
                      </div>
                      <div className="ats-mini-bar-track">
                        <div
                          className={`ats-mini-bar-fill ${item.score >= 75 ? "ats-tone-good" : item.score >= 50 ? "ats-tone-warn" : "ats-tone-bad"}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* WEAK AREAS & PRACTICE CTA */}
              <div className="command-card">
                <h3>⚡ Identified Weak Areas & Targeted Practice</h3>
                <p className="cmd-card-sub">Topics flagged during interview sessions requiring extra practice:</p>
                <div className="cmd-weak-chips">
                  {weakTopics.map((topic) => (
                    <span key={topic} className="cmd-weak-chip">⚠️ {topic}</span>
                  ))}
                </div>
                <div className="cmd-weak-cta-wrap">
                  <button
                    type="button"
                    className="command-btn command-btn--secondary"
                    onClick={() => navigate("/interview-questions")}
                  >
                    🎯 Practice Weak Areas Now
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK COMMAND TOOLS SHORTCUTS */}
            <h2 className="cmd-section-heading">Command Tools</h2>
            <div className="cmd-tools-grid">
              {[
                {
                  icon: "📄",
                  title: "Resume Feedback & ATS Engine",
                  desc: "Get 7-category weighted score breakdown, bullet rewrites, and job match analysis.",
                  link: "/resume-feedback",
                },
                {
                  icon: "🎯",
                  title: "Technical Interview Lab",
                  desc: "Practice role-specific technical questions with Question of the Day and model answers.",
                  link: "/interview-questions",
                },
                {
                  icon: "💼",
                  title: "Jobs & Real Match Engine",
                  desc: "Calculate job match percentages using candidate evidence and track applications.",
                  link: "/jobs",
                },
              ].map((tool) => (
                <div key={tool.title} className="command-card card-lift cmd-tool-tile">
                  <div className="cmd-tool-icon">{tool.icon}</div>
                  <h3 className="cmd-tool-title">{tool.title}</h3>
                  <p className="cmd-tool-desc">{tool.desc}</p>
                  <Link to={tool.link} className="command-btn command-btn--ghost">
                    Open Tool →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        );
      }}
    </DashboardLayout>
  );
}
