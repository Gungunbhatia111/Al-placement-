import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { updateMe } from "../api/auth.js";
import "./Profile.css";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  location: "",
  title: "",
  college: "",
  branch: "",
  degree: "B.Tech",
  graduationYear: "",
  targetRole: "Software Engineer",
  bio: "",
  linkedin: "",
  github: "",
  portfolio: "",
  leetcode: "",
  hackerrank: "",
  codechef: "",
  geeksforgeeks: "",
  skills: [],
  targetCompanies: [],
  preferredLocations: [],
};

function normalizeUser(user) {
  return {
    ...emptyProfile,
    ...user,
    degree: user?.degree || "B.Tech",
    targetRole: user?.targetRole || "Software Engineer",
    graduationYear: user?.graduationYear || "",
    skills: user?.skills?.length ? user.skills : ["React", "Node.js", "Java", "DSA", "SQL"],
    targetCompanies: user?.targetCompanies?.length ? user.targetCompanies : ["Google", "Amazon", "Microsoft"],
    preferredLocations: user?.preferredLocations?.length ? user.preferredLocations : ["Bangalore", "Hyderabad", "Remote"],
  };
}

function calculateCompleteness(p) {
  let score = 0;
  if (p.name) score += 10;
  if (p.email) score += 10;
  if (p.college) score += 10;
  if (p.branch) score += 10;
  if (p.graduationYear) score += 10;
  if (p.targetRole) score += 10;
  if (p.skills && p.skills.length > 0) score += 10;
  if (p.bio) score += 10;
  if (p.linkedin || p.github) score += 10;
  if (p.leetcode || p.hackerrank || p.codechef || p.geeksforgeeks) score += 10;
  return Math.min(100, score);
}

const EXTERNAL_PLATFORMS = [
  { key: "linkedin", label: "LinkedIn", icon: "💼", placeholder: "https://linkedin.com/in/username" },
  { key: "github", label: "GitHub", icon: "🐙", placeholder: "https://github.com/username" },
  { key: "leetcode", label: "LeetCode", icon: "🧠", placeholder: "https://leetcode.com/u/username" },
  { key: "hackerrank", label: "HackerRank", icon: "🟢", placeholder: "https://hackerrank.com/profile/username" },
  { key: "codechef", label: "CodeChef", icon: "👨‍🍳", placeholder: "https://codechef.com/users/username" },
  { key: "geeksforgeeks", label: "GeeksforGeeks", icon: "🟩", placeholder: "https://geeksforgeeks.org/user/username" },
];

function ProfileContent({ user }) {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(emptyProfile);
  const [draft, setDraft] = useState(emptyProfile);
  const [newSkill, setNewSkill] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const normalized = normalizeUser(user);
    setProfile(normalized);
    setDraft(normalized);
  }, [user]);

  const initials = useMemo(
    () => (profile.name || "Student").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    [profile.name]
  );

  const completenessPct = useMemo(() => calculateCompleteness(editing ? draft : profile), [editing, draft, profile]);

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const addListItem = (field, value, clear) => {
    const clean = value.trim();
    if (!clean) return;
    setDraft((current) => ({
      ...current,
      [field]: [...new Set([...(current[field] || []), clean])],
    }));
    clear("");
  };

  const removeListItem = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: (current[field] || []).filter((item) => item !== value),
    }));
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");
    try {
      const saved = await updateMe(token, {
        ...draft,
        graduationYear: draft.graduationYear ? Number(draft.graduationYear) : undefined,
      });
      const normalized = normalizeUser(saved);
      setProfile(normalized);
      setDraft(normalized);
      setEditing(false);
      setMessage("Placement Profile updated successfully.");
    } catch (err) {
      setMessage(err.message || "Could not save profile updates.");
    } finally {
      setSaving(false);
    }
  };

  const current = editing ? draft : profile;

  return (
    <div className="command-profile-page">
      <div className="command-profile-header">
        <div>
          <span className="command-profile-eyebrow">Student Identity</span>
          <h1 className="command-profile-title">Placement Profile & Practice Hub</h1>
          <p className="command-profile-sub">Single source of truth for your academic background, target roles, and external coding profiles.</p>
        </div>
        {!editing ? (
          <button className="command-btn command-btn--primary" onClick={() => setEditing(true)}>
            ✏️ Edit Profile
          </button>
        ) : (
          <div className="command-profile-actions">
            <button className="command-btn command-btn--ghost" onClick={() => { setDraft(profile); setEditing(false); }}>
              Cancel
            </button>
            <button className="command-btn command-btn--primary" onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        )}
      </div>

      {/* COMPLETENESS METER HERO */}
      <section className="command-card command-hero-card">
        <div className="command-hero-avatar">{initials}</div>
        <div className="command-hero-details">
          <h2>{current.name || "Placement Candidate"}</h2>
          <p className="command-hero-tagline">{current.targetRole} • {current.degree} in {current.branch || "CS"}</p>
          <p className="command-hero-meta">🏫 {current.college || "College Not Specified"} | Graduating {current.graduationYear || "2026"}</p>
        </div>
        <div className="command-completeness-box">
          <div className="command-circle-meter">
            <svg viewBox="0 0 36 36" className="command-circle-svg">
              <path
                className="command-circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="command-circle-fill"
                strokeDasharray={`${completenessPct}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="command-circle-text">{completenessPct}%</div>
          </div>
          <div className="command-completeness-info">
            <div className="command-completeness-title">Profile Completeness</div>
            {completenessPct < 100 ? (
              <span className="command-completeness-sub">Fill in missing fields to reach 100% placement readiness.</span>
            ) : (
              <span className="command-completeness-sub command-completeness-sub--done">✓ Profile Complete & Ready for Matching</span>
            )}
          </div>
        </div>
      </section>

      {message && <div className="command-toast-message">{message}</div>}

      {/* EXTERNAL PRACTICE HUB */}
      <section className="command-card">
        <div className="command-card-head">
          <h3>🌐 External Coding & Professional Practice Hub</h3>
          <p className="command-card-sub">Link your competitive coding & professional handles for single-click verification and recruiter visibility.</p>
        </div>
        <div className="command-hub-grid">
          {EXTERNAL_PLATFORMS.map((platform) => {
            const urlVal = current[platform.key] || "";
            const hasUrl = Boolean(urlVal.trim());
            return (
              <div key={platform.key} className={`command-hub-card ${hasUrl ? "command-hub-card--active" : ""}`}>
                <div className="command-hub-icon">{platform.icon}</div>
                <div className="command-hub-content">
                  <div className="command-hub-label">{platform.label}</div>
                  {editing ? (
                    <input
                      type="url"
                      className="command-input"
                      placeholder={platform.placeholder}
                      value={draft[platform.key] || ""}
                      onChange={(e) => updateDraft(platform.key, e.target.value)}
                    />
                  ) : hasUrl ? (
                    <a href={urlVal.startsWith("http") ? urlVal : `https://${urlVal}`} target="_blank" rel="noopener noreferrer" className="command-hub-link">
                      Visit Profile ↗
                    </a>
                  ) : (
                    <span className="command-hub-empty">+ Add {platform.label} Link</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ACADEMIC & PERSONAL DETAILS */}
      <section className="command-card">
        <div className="command-card-head">
          <h3>🎓 Academic & Personal Details</h3>
        </div>
        <div className="command-grid-2col">
          {[
            ["name", "Full Name"],
            ["email", "Email Address"],
            ["phone", "Phone Number"],
            ["location", "Current City / Location"],
            ["college", "College / University"],
            ["branch", "Branch / Specialization"],
            ["degree", "Degree (e.g. B.Tech, M.Tech, BCA)"],
            ["graduationYear", "Graduation Year"],
            ["targetRole", "Target Role (e.g. Software Engineer)"],
          ].map(([field, label]) => (
            <div key={field} className="command-field-group">
              <label>{label}</label>
              {editing && field !== "email" ? (
                <input
                  className="command-input"
                  value={draft[field] || ""}
                  onChange={(e) => updateDraft(field, e.target.value)}
                />
              ) : (
                <div className="command-val-box">{current[field] || "Not Specified"}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BIO & SUMMARY */}
      <section className="command-card">
        <h3>📝 Placement Bio & Objective Summary</h3>
        {editing ? (
          <textarea
            className="command-textarea"
            rows={4}
            value={draft.bio || ""}
            onChange={(e) => updateDraft("bio", e.target.value)}
            placeholder="Describe your technical background, career goals, and key engineering achievements..."
          />
        ) : (
          <p className="command-bio-text">{current.bio || "No summary provided yet. Add a short summary highlighting your core tech stack and placement aspirations."}</p>
        )}
      </section>

      {/* SKILLS & TARGET PREFERENCES */}
      <div className="command-grid-2col">
        <section className="command-card">
          <h3>⚡ Technical Skills</h3>
          <div className="command-tags-wrap">
            {(current.skills || []).map((skill) => (
              <span key={skill} className="command-tag command-tag--gold">
                {skill}
                {editing && <button type="button" onClick={() => removeListItem("skills", skill)}>✕</button>}
              </span>
            ))}
          </div>
          {editing && (
            <div className="command-add-row">
              <input
                className="command-input"
                placeholder="Add skill (e.g. Docker, Python)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <button type="button" className="command-btn command-btn--secondary" onClick={() => addListItem("skills", newSkill, setNewSkill)}>
                + Add
              </button>
            </div>
          )}
        </section>

        <section className="command-card">
          <h3>🎯 Target Companies</h3>
          <div className="command-tags-wrap">
            {(current.targetCompanies || []).map((company) => (
              <span key={company} className="command-tag command-tag--navy">
                {company}
                {editing && <button type="button" onClick={() => removeListItem("targetCompanies", company)}>✕</button>}
              </span>
            ))}
          </div>
          {editing && (
            <div className="command-add-row">
              <input
                className="command-input"
                placeholder="Add company (e.g. Microsoft, Atlassian)"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
              />
              <button type="button" className="command-btn command-btn--secondary" onClick={() => addListItem("targetCompanies", newCompany, setNewCompany)}>
                + Add
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <DashboardLayout>
      {(user) => <ProfileContent user={user} />}
    </DashboardLayout>
  );
}
