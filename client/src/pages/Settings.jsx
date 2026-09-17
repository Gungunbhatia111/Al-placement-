import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import "./Settings.css";

const STORAGE_KEY = "placementSettings";

const defaultSettings = {
  theme: localStorage.getItem("theme") || "system",
  fontSize: "normal",
  reducedMotion: false,
  newJobs: true,
  interviewReminders: true,
  resumeTips: true,
  weeklyDigest: false,
  profileVisible: true,
  showLocation: true,
  showPackagePreference: false,
  shareDataUsage: true,
};

function readSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return defaultSettings;
  }
}

function ApplyTheme(themeMode) {
  localStorage.setItem("theme", themeMode);
  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");
  }
}

function iOSToggle({ label, desc, checked, onChange }) {
  return (
    <div className="cmd-setting-row">
      <div className="cmd-setting-info">
        <strong className="cmd-setting-label">{label}</strong>
        {desc && <p className="cmd-setting-desc">{desc}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`cmd-ios-switch ${checked ? "cmd-ios-switch--active" : ""}`}
        onClick={onChange}
      >
        <span className="cmd-ios-thumb" />
      </button>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState(readSettings);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2800);
  };

  const updateField = (field, value) => {
    setSettings((prev) => {
      const next = { ...prev, [field]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    showToast("Preferences Updated Successfully");
  };

  const handleThemeChange = (newTheme) => {
    updateField("theme", newTheme);
    ApplyTheme(newTheme);
  };

  const handleResetData = () => {
    if (window.confirm("Reset all local settings and preferences to default?")) {
      localStorage.removeItem(STORAGE_KEY);
      setSettings(defaultSettings);
      handleThemeChange("system");
      showToast("Settings Reset to Defaults");
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "placement_candidate_settings.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Candidate Data Exported");
  };

  return (
    <DashboardLayout>
      <div className="cmd-settings-page">
        {/* HEADER */}
        <div className="cmd-settings-header">
          <div>
            <span className="command-profile-eyebrow">Account Preferences</span>
            <h1 className="command-profile-title">System Settings & Customization</h1>
            <p className="command-profile-sub">
              Manage appearance, dark mode theme, notification alerts, privacy preferences, and local data.
            </p>
          </div>
        </div>

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="cmd-toast-banner">
            <span>✓ {toastMessage}</span>
          </div>
        )}

        {/* 1. APPEARANCE & THEME CARD */}
        <section className="command-card cmd-settings-card">
          <div className="cmd-card-title-row">
            <span className="cmd-section-icon">🎨</span>
            <div>
              <h3>Appearance & Visual Theme</h3>
              <p className="cmd-card-sub">Select your preferred color mode and visual layout options.</p>
            </div>
          </div>

          <div className="cmd-theme-grid">
            <button
              type="button"
              className={`cmd-theme-option ${settings.theme === "light" ? "cmd-theme-option--active" : ""}`}
              onClick={() => handleThemeChange("light")}
            >
              <span className="cmd-theme-icon">☀️</span>
              <strong>Light Mode</strong>
              <span className="cmd-theme-desc">Warm Ivory #FDFBF7</span>
            </button>

            <button
              type="button"
              className={`cmd-theme-option ${settings.theme === "dark" ? "cmd-theme-option--active" : ""}`}
              onClick={() => handleThemeChange("dark")}
            >
              <span className="cmd-theme-icon">🌙</span>
              <strong>Dark Mode</strong>
              <span className="cmd-theme-desc">Deep Charcoal #0F172A</span>
            </button>

            <button
              type="button"
              className={`cmd-theme-option ${settings.theme === "system" ? "cmd-theme-option--active" : ""}`}
              onClick={() => handleThemeChange("system")}
            >
              <span className="cmd-theme-icon">💻</span>
              <strong>System Default</strong>
              <span className="cmd-theme-desc">Matches OS Preference</span>
            </button>
          </div>

          <div className="cmd-settings-divider" />

          <div className="command-grid-2col">
            <div className="command-field-group">
              <label>Interface Font Size</label>
              <select
                className="command-input"
                value={settings.fontSize}
                onChange={(e) => updateField("fontSize", e.target.value)}
              >
                <option value="normal">Normal (Default)</option>
                <option value="compact">Compact (Dense)</option>
                <option value="large">Large (High Legibility)</option>
              </select>
            </div>

            <iOSToggle
              label="Reduced Motion"
              desc="Minimize transition effects and card animations."
              checked={settings.reducedMotion}
              onChange={() => updateField("reducedMotion", !settings.reducedMotion)}
            />
          </div>
        </section>

        {/* 2. NOTIFICATIONS CARD */}
        <section className="command-card cmd-settings-card">
          <div className="cmd-card-title-row">
            <span className="cmd-section-icon">🔔</span>
            <div>
              <h3>Notification Alerts</h3>
              <p className="cmd-card-sub">Control how you receive job matches and practice reminders.</p>
            </div>
          </div>

          <div className="cmd-settings-group">
            <iOSToggle
              label="New Job Matches"
              desc="Notify when high-match job openings are published to the portal."
              checked={settings.newJobs}
              onChange={() => updateField("newJobs", !settings.newJobs)}
            />

            <iOSToggle
              label="Interview Reminders"
              desc="Remind me to complete timed mock sessions before scheduled drives."
              checked={settings.interviewReminders}
              onChange={() => updateField("interviewReminders", !settings.interviewReminders)}
            />

            <iOSToggle
              label="Resume Tips & Gap Alerts"
              desc="Show personalized ATS improvement suggestions on dashboard."
              checked={settings.resumeTips}
              onChange={() => updateField("resumeTips", !settings.resumeTips)}
            />

            <iOSToggle
              label="Weekly Placement Digest"
              desc="Summarize weekly job applications, mock scores, and streak data."
              checked={settings.weeklyDigest}
              onChange={() => updateField("weeklyDigest", !settings.weeklyDigest)}
            />
          </div>
        </section>

        {/* 3. PRIVACY & SECURITY CARD */}
        <section className="command-card cmd-settings-card">
          <div className="cmd-card-title-row">
            <span className="cmd-section-icon">🔒</span>
            <div>
              <h3>Privacy & Candidate Visibility</h3>
              <p className="cmd-card-sub">Control profile visibility for recruiters and placement cell admins.</p>
            </div>
          </div>

          <div className="cmd-settings-group">
            <iOSToggle
              label="Placement Profile Visible"
              desc="Allow campus placement officers to view verified readiness score."
              checked={settings.profileVisible}
              onChange={() => updateField("profileVisible", !settings.profileVisible)}
            />

            <iOSToggle
              label="Show Preferred Location"
              desc="Include location preferences in automated job match scoring."
              checked={settings.showLocation}
              onChange={() => updateField("showLocation", !settings.showLocation)}
            />

            <iOSToggle
              label="Show Expected LPA Preference"
              desc="Display expected compensation range in corporate match metrics."
              checked={settings.showPackagePreference}
              onChange={() => updateField("showPackagePreference", !settings.showPackagePreference)}
            />
          </div>
        </section>

        {/* 4. ACCOUNT & DATA SETTINGS CARD */}
        <section className="command-card cmd-settings-card">
          <div className="cmd-card-title-row">
            <span className="cmd-section-icon">🔑</span>
            <div>
              <h3>Account & Local Data Management</h3>
              <p className="cmd-card-sub">Manage client-side cache, backup preferences, and reset data.</p>
            </div>
          </div>

          <div className="cmd-data-actions">
            <button
              type="button"
              className="command-btn command-btn--secondary"
              onClick={handleExportData}
            >
              📥 Export Candidate Preferences (JSON)
            </button>

            <button
              type="button"
              className="command-btn command-btn--danger"
              onClick={handleResetData}
            >
              ⚠️ Reset Local Settings to Defaults
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
