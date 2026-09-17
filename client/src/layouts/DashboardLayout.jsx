import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import GungunChat from "../components/GungunChat.jsx";
import { getMe } from "../api/auth.js";
import "./DashboardLayout.css";

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);

    if (!savedToken) {
      navigate("/login");
      return;
    }

    getMe(savedToken)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        navigate("/login");
      });
  }, [navigate]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-layout__main">
        <Topbar user={user} />
        <div className="dashboard-layout__content">
          {typeof children === "function" ? children(user) : children}
        </div>
      </div>
      <GungunChat token={token} />
    </div>
  );
}
