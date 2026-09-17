import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth.js";
import "./AuthPage.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const isValidPassword = form.password.length >= 6;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(form);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider) => {
    // Demo token initialization for instant testing
    localStorage.setItem("token", "demo-token-12345");
    navigate("/dashboard");
  };

  return (
    <div className="cmd-auth-split">
      {/* LEFT PREVIEW PANEL */}
      <div className="cmd-auth-left">
        <div className="cmd-auth-brand">
          <span className="cmd-auth-mark">P</span>
          <div>
            <h2 className="cmd-auth-brand-name">Placement Cell AI</h2>
            <span className="cmd-auth-brand-sub">COMMAND CENTER</span>
          </div>
        </div>

        <div className="cmd-auth-hero-preview">
          <div className="cmd-auth-ring-card">
            <div className="cmd-auth-ring">
              <span className="cmd-auth-ring-val">85%</span>
            </div>
            <div className="cmd-auth-ring-text">
              <strong>Placement Readiness</strong>
              <span>Live Student Progress Indicator</span>
            </div>
          </div>

          <div className="cmd-auth-features-ticker">
            <div className="cmd-ticker-chip">⚡ 100% Deterministic Matching</div>
            <div className="cmd-ticker-chip">📄 7-Category Weighted ATS Engine</div>
            <div className="cmd-ticker-chip">🎯 17+ Topic Practice Question Bank</div>
          </div>

          <div className="cmd-auth-quote">
            <p>“Your career journey is built step-by-step. Focus on continuous preparation and your dream offer letter will follow.”</p>
            <span>— Gungun AI Placement Coach</span>
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="cmd-auth-right">
        <div className="cmd-auth-form-card">
          <div className="cmd-auth-form-head">
            <span className="command-profile-eyebrow">Access Credentials</span>
            <h1 className="cmd-auth-title">Log in to Command Center</h1>
            <p className="cmd-auth-sub">Welcome back! Access your placement dashboard, ATS resume audit, and interview lab.</p>
          </div>

          {/* SOCIAL AUTH BUTTONS */}
          <div className="cmd-social-btns">
            <button type="button" className="cmd-social-btn" onClick={() => handleSocialAuth("google")}>
              <span>🌐</span> Continue with Google
            </button>
            <button type="button" className="cmd-social-btn" onClick={() => handleSocialAuth("github")}>
              <span>🐙</span> Continue with GitHub
            </button>
          </div>

          <div className="ats-divider">— or log in with email —</div>

          <form onSubmit={handleSubmit} className="cmd-auth-form">
            <div className="command-field-group">
              <label className="cmd-input-label">
                <span>Email Address</span>
                {isValidEmail && <span className="cmd-check-badge">✓ Valid</span>}
              </label>
              <input
                type="email"
                name="email"
                className={`command-input ${isValidEmail ? "command-input--valid" : ""}`}
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@college.edu"
              />
            </div>

            <div className="command-field-group">
              <label className="cmd-input-label">
                <span>Password</span>
                {isValidPassword && <span className="cmd-check-badge">✓ Valid</span>}
              </label>
              <input
                type="password"
                name="password"
                className={`command-input ${isValidPassword ? "command-input--valid" : ""}`}
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            {error && <div className="ats-error-banner"><span>{error}</span></div>}

            <button type="submit" className="command-btn command-btn--primary cmd-auth-submit" disabled={loading}>
              {loading ? "Authenticating..." : "Log in to Command Center →"}
            </button>
          </form>

          <p className="cmd-auth-switch">
            New candidate? <Link to="/signup">Create Placement Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
