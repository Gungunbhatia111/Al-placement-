import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="figma-header">
      {/* BRAND LOGO */}
      <Link to="/" className="figma-header__brand">
        <div className="figma-header__icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>
        <div className="figma-header__brand-text">
          <span className="figma-header__title">Placement Cell</span>
          <span className="figma-header__subtitle">AI PLACEMENT ASSISTANT</span>
        </div>
      </Link>

      {/* CENTER NAV LINKS */}
      <nav className="figma-header__center-nav">
        <a href="#features" className="figma-header__nav-link">Features</a>
        <Link to={token ? "/dashboard" : "/login"} className="figma-header__nav-link">Dashboard</Link>
        <Link to="/interview-questions" className="figma-header__nav-link">Practice</Link>
        <Link to="/jobs" className="figma-header__nav-link">Resources</Link>
      </nav>

      {/* RIGHT ACTIONS */}
      <div className="figma-header__actions">
        {token ? (
          <>
            <Link to="/dashboard" className="figma-header__login-link">
              Dashboard
            </Link>
            <button type="button" className="btn-pill-teal" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="figma-header__login-link">
              Log In
            </Link>
            <Link to="/signup" className="btn-pill-teal">
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
