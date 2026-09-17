import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import InterviewQuestions from "./pages/InterviewQuestions.jsx";
import ResumeFeedback from "./pages/ResumeFeedback.jsx";
import Jobs from "./pages/Jobs.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (savedTheme === "system" && systemDark)) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/resume-feedback" element={<ResumeFeedback />} />
      <Route path="/interview-questions" element={<InterviewQuestions />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
