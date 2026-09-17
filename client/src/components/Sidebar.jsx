import { NavLink, useNavigate } from "react-router-dom";
import { Icon } from "./Icon.jsx";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/resume-feedback", label: "Resume Feedback", icon: "feedback" },
  { to: "/interview-questions", label: "Interview Questions", icon: "interview" },
  { to: "/jobs", label: "Jobs", icon: "jobs" },
  { to: "/profile", label: "Profile", icon: "profile" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__mark">AP</span>
        <span className="sidebar__wordmark">
          Placement Cell
          <span className="sidebar__sub">AI Placement Assistant</span>
        </span>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar__item${isActive ? " sidebar__item--active" : ""}`}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar__logout" onClick={handleLogout}>
        <Icon name="logout" />
        <span>Logout</span>
      </button>
    </aside>
  );
}
