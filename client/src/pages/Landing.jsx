import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import NoticeTicker from "../components/NoticeTicker.jsx";
import { getQuestionOfTheDay } from "../questions/index.js";
import "./Landing.css";

const STAT_CARDS = [
  {
    label: "Avg. Package Boost",
    val: "+42%",
    sub: "Top 5%",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    label: "Companies Interviewing",
    val: "142",
    sub: "Active Drive",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F3D39" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    label: "Average ATS Grade",
    val: "A+",
    sub: "Optimized",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F3D39" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: "Total Mock Audits",
    val: "28.4k",
    sub: "Completed",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F3D39" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

const CORE_ENGINE_CARDS = [
  {
    title: "Deterministic Matching",
    desc: "No general keyword scrapers. Our neural rankers evaluate candidate evidence structures natively against corporate scorecards for guaranteed fit.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F3D39" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="22" y1="12" x2="18" y2="12" />
        <line x1="6" y1="12" x2="2" y2="12" />
        <line x1="12" y1="6" x2="12" y2="2" />
        <line x1="12" y1="22" x2="12" y2="18" />
      </svg>
    ),
  },
  {
    title: "17+ Topic Question Bank",
    desc: "Comprehensive conceptual banks spanning DSA, System Design, SQL, and specific tech stack domains with real-time feedback compiling metrics.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F3D39" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    title: "Real-Time Pipeline Tracking",
    desc: "Instantly monitor which resume version is shortlisted, where you stand in external rounds, and optimize your strategy relative to peer benchmarks.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F3D39" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: "External Practice Hub",
    desc: "Natively pulls practice data metrics from LeetCode, HackerRank, and GitHub commits to automatically build a singular profile that gets noticed.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F3D39" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Deploy Profile",
    desc: "Connect external dev hubs and upload your current resume. Our recursive builder extracts and styles core achievements cleanly.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F3D39" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Simulate & Refine",
    desc: "Complete adaptive topic tests. Let our voice & code analysis tools evaluate mock execution before the real interview.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F3D39" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="15" x2="23" y2="15" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="15" x2="4" y2="15" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Secure the Offer",
    desc: "Direct pathways automatically shared with partnering talent networks. Let companies bid for your validated skills.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F3D39" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    ),
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [dialScore, setDialScore] = useState(0);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [heroVisible, setHeroVisible] = useState(false);
  const heroRef = useRef(null);
  const qotd = getQuestionOfTheDay();

  // Scroll reveal observer for elements as user scrolls down
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("figma-reveal-active");
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll(".figma-reveal-scroll, .figma-hero-section");
    elements.forEach((el) => observer.observe(el));

    const timer = setTimeout(() => {
      setHeroVisible(true);
    }, 50);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Smooth dial animation from 0% to 85% on viewport load
  useEffect(() => {
    let score = 0;
    const interval = setInterval(() => {
      score += 2;
      if (score >= 85) {
        score = 85;
        clearInterval(interval);
      }
      setDialScore(score);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="figma-landing-page">
      <Header />

      <main className="figma-landing-main">
        {/* HERO SECTION (MATCHING FIGMA IMAGE 2) */}
        <section ref={heroRef} className={`figma-hero-section ${heroVisible ? "figma-reveal-active" : ""}`}>
          <div className="figma-hero-left">
            <div className="figma-intel-badge">
              <span className="figma-intel-dot" />
              <span>CAMPUS INTEL PLATFORM V2.4</span>
            </div>

            <h1 className="figma-hero-title">
              {["Welcome", "to", "Your", "AI", "Placement", "Command", "Center."].map((word, i) => (
                <span
                  key={i}
                  className={`figma-word-fly ${heroVisible ? "is-animating" : ""}`}
                  style={{ transitionDelay: `${0.12 * i + 0.15}s` }}
                >
                  {word}{" "}
                </span>
              ))}
            </h1>

            <p className="figma-hero-subtitle">
              Discover deterministically matched job profiles, optimize resumes recursively against real ATS engines, and practice simulated interviews with direct AI feedback loops.
            </p>

            <div className="figma-hero-actions">
              <button
                type="button"
                className="btn-pill-teal"
                onClick={() => navigate(token ? "/dashboard" : "/signup")}
              >
                Launch Command Center →
              </button>
              <button
                type="button"
                className="btn-pill-outline"
                onClick={() => navigate("/resume-feedback")}
              >
                Analyze Resume
              </button>
            </div>
          </div>

          {/* LIVE CANDIDATE INTELLIGENCE CARD (RIGHT SIDE OF FIGMA HERO) */}
          <div className="figma-intel-card card-lift">
            <div className="figma-intel-card__header">
              <div className="figma-intel-card__title-row">
                <span className="figma-intel-card__dot" />
                <span className="figma-intel-card__title">LIVE CANDIDATE INTELLIGENCE</span>
              </div>
              <span className="figma-intel-card__id">ID: 489-ATS</span>
            </div>

            <div className="figma-intel-card__ring-box">
              <div className="figma-intel-ring">
                <svg viewBox="0 0 36 36" className="figma-ring-svg">
                  <path
                    className="figma-ring-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="figma-ring-fill"
                    strokeDasharray={`${dialScore}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="figma-ring-score">{dialScore}%</div>
              </div>

              <div className="figma-intel-ring__info">
                <h3>Placement Readiness</h3>
                <p>Calculated across five dimensional performance components.</p>
              </div>
            </div>

            <div className="figma-intel-card__metrics">
              <div className="figma-intel-metric">
                <span className="figma-intel-metric__label">SDE Match</span>
                <span className="figma-intel-metric__val">92%</span>
              </div>
              <div className="figma-intel-metric">
                <span className="figma-intel-metric__label">Resume Quality</span>
                <span className="figma-intel-metric__val">A Grade</span>
              </div>
              <div className="figma-intel-metric">
                <span className="figma-intel-metric__label">Streak</span>
                <span className="figma-intel-metric__val figma-intel-metric__val--coral">4 Days</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4 TOP STAT CARDS SECTION (MATCHING FIGMA IMAGE 3) */}
        <section className="figma-stats-section figma-reveal-scroll">
          <div className="figma-stats-grid">
            {STAT_CARDS.map((stat) => (
              <div key={stat.label} className="figma-stat-card card-lift">
                <div className="figma-stat-card__top">
                  <span className="figma-stat-card__label">{stat.label}</span>
                  <div className="figma-stat-card__icon">{stat.icon}</div>
                </div>
                <div className="figma-stat-card__bottom">
                  <span className="figma-stat-card__val">{stat.val}</span>
                  <span className="figma-stat-card__sub">{stat.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <NoticeTicker />

        {/* CORE ENGINE SECTION (MATCHING FIGMA IMAGE 4) */}
        <section id="features" className="figma-section figma-reveal-scroll">
          <div className="figma-section-head">
            <span className="figma-section-tag">CORE ENGINE</span>
            <h2 className="figma-section-title">Engineered to remove guesswork from campus placements.</h2>
          </div>

          <div className="figma-core-grid">
            {CORE_ENGINE_CARDS.map((card) => (
              <div key={card.title} className="figma-core-card card-lift">
                <div className="figma-core-card__icon-box">
                  {card.icon}
                </div>
                <h3 className="figma-core-card__title">{card.title}</h3>
                <p className="figma-core-card__desc">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PROCESS SECTION (MATCHING FIGMA IMAGE 5) */}
        <section className="figma-section figma-section--alt figma-reveal-scroll">
          <div className="figma-section-head">
            <span className="figma-section-tag">PROCESS</span>
            <h2 className="figma-section-title">Three steps to your dream offer</h2>
          </div>

          <div className="figma-process-grid">
            {PROCESS_STEPS.map((step) => (
              <div key={step.step} className="figma-process-card card-lift">
                <div className="figma-process-card__top">
                  <span className="figma-process-card__step">{step.step}</span>
                  <div className="figma-process-card__icon">{step.icon}</div>
                </div>
                <h3 className="figma-process-card__title">{step.title}</h3>
                <p className="figma-process-card__desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* LOGGED IN QUICK ACTION LAUNCHPAD */}
        {token && (
          <section className="figma-section">
            <div className="figma-section-head">
              <span className="figma-section-tag">QUICK LAUNCH</span>
              <h2 className="figma-section-title">Your Placement Preparation Today</h2>
            </div>

            <div className="figma-launch-grid">
              <div className="figma-launch-card card-lift">
                <span className="figma-section-tag">📅 Question of the Day</span>
                <h3 className="figma-launch-qtitle">{qotd.category} • {qotd.topic}</h3>
                <p className="figma-launch-qtext">"{qotd.question}"</p>
                <Link to="/interview-questions" className="btn-pill-teal">
                  Practice Answer Now →
                </Link>
              </div>

              <div className="figma-launch-card card-lift">
                <span className="figma-section-tag">🌐 External Practice Hub</span>
                <h3 className="figma-launch-qtitle">Connect Your Handles</h3>
                <div className="figma-hub-quick-grid">
                  <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="figma-hub-btn">
                    LeetCode ↗
                  </a>
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="figma-hub-btn">
                    GitHub ↗
                  </a>
                  <a href="https://hackerrank.com" target="_blank" rel="noreferrer" className="figma-hub-btn">
                    HackerRank ↗
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="figma-hub-btn">
                    LinkedIn ↗
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="figma-footer">
        <div className="figma-footer__content">
          <strong>Placement Cell AI Command Center</strong>
          <p>© 2026 Campus Placement Cell. From Preparation to Offer Letter.</p>
        </div>
      </footer>
    </div>
  );
}
