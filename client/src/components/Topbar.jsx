import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Icon.jsx";
import "./Topbar.css";

export default function Topbar({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "?";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="topbar">
      <div />
      <div className="topbar__right">
        <button className="topbar__bell" aria-label="Notifications">
          <Icon name="bell" size={19} />
          <span className="topbar__bell-dot" />
        </button>

        <div className="topbar__user">
          <button className="topbar__user-btn" onClick={() => setMenuOpen((o) => !o)}>
            <span className="topbar__avatar">{initial}</span>
            <span className="topbar__name">{user?.name || "Loading…"}</span>
            <Icon name="chevron-down" size={15} />
          </button>

          {menuOpen && (
            <div className="topbar__menu">
              <button onClick={() => { setMenuOpen(false); navigate("/profile"); }}>Profile</button>
              <button onClick={() => { setMenuOpen(false); navigate("/settings"); }}>Settings</button>
              <button onClick={handleLogout} className="topbar__menu-danger">Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
