import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/auth.js";
import "./AuthPage.css";

const TARGET_ROLE_CHIPS = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Engineer",
  "Data Analyst",
  "DevOps Engineer",
  "Product Manager",
  "Full Stack Developer",
];

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    password: "",
    targetRole: "Software Engineer",
  });
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
      const data = await signup(form);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create account. Please check all details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider) => {
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
              <span className="cmd-auth-ring-val">100%</span>
            </div>
            <div className="cmd-auth-ring-text">
              <strong>Account Setup & Context</strong>
              <span>Target Role & Skill Matching</span>
            </div>
          </div>

          <div className="cmd-auth-features-ticker">
            <div className="cmd-ticker-chip">💼 Real-Time Application Pipeline</div>
            <div className="cmd-ticker-chip">🌐 GitHub, LeetCode & LinkedIn Hub</div>
            <div className="cmd-ticker-chip">⚡ Automated Weak Area Tracking</div>
          </div>

          <div className="cmd-auth-quote">
            <p>“Create your placement identity today. Set your target role and get job recommendations matched to your skills.”</p>
            <span>— Gungun AI Placement Coach</span>
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="cmd-auth-right">
        <div className="cmd-auth-form-card">
          <div className="cmd-auth-form-head">
            <span className="command-profile-eyebrow">Candidate Registration</span>
            <h1 className="cmd-auth-title">Create Placement Account</h1>
            <p className="cmd-auth-sub">Initialize your placement profile and start tracking your preparation journey.</p>
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

          <div className="ats-divider">— or register with email —</div>

          <form onSubmit={handleSubmit} className="cmd-auth-form">
            <div className="command-field-group">
              <label className="cmd-input-label">
                <span>Full Name</span>
              </label>
              <input
                name="name"
                className="command-input"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="As per college records"
              />
            </div>

            <div className="command-grid-2col">
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
                <label className="cmd-input-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="command-input"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>

            <div className="command-field-group">
              <label className="cmd-input-label">College Name</label>
              <input
                name="college"
                className="command-input"
                value={form.college}
                onChange={handleChange}
                required
                placeholder="Full college name"
              />
            </div>

            {/* TARGET ROLE SELECTION CHIPS */}
            <div className="command-field-group">
              <label className="cmd-input-label">Target Role Selection</label>
              <div className="cmd-target-chips">
                {TARGET_ROLE_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className={`cmd-target-chip ${form.targetRole === chip ? "cmd-target-chip--active" : ""}`}
                    onClick={() => setForm({ ...form, targetRole: chip })}
                  >
                    {chip}
                  </button>
                ))}
              </div>
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
                placeholder="At least 6 characters"
              />
            </div>

            {error && <div className="ats-error-banner"><span>{error}</span></div>}

            <button type="submit" className="command-btn command-btn--primary cmd-auth-submit" disabled={loading}>
              {loading ? "Creating Account..." : "Initialize Placement Profile →"}
            </button>
          </form>

          <p className="cmd-auth-switch">
            Already registered? <Link to="/login">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
