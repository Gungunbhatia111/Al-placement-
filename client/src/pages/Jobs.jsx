import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { updateMe } from "../api/auth.js";
import "./Jobs.css";

const STORAGE_KEY = "placementAppliedJobs";

const JOBS = [
  {
    id: "google-swe-intern",
    company: "Google",
    mark: "G",
    role: "Software Engineering Intern",
    location: "Bengaluru",
    workMode: "Hybrid",
    type: "Internship",
    packageLpa: "18 LPA",
    experience: "Freshers / Students",
    deadline: "Due in 3 days",
    careerUrl: "https://careers.google.com/jobs/results/",
    skills: ["DSA", "JavaScript", "React", "Problem Solving", "SQL"],
    preferredSkills: ["Node.js", "System Design"],
    summary: "Build scalable web systems and product features used by millions globally.",
  },
  {
    id: "microsoft-ase",
    company: "Microsoft",
    mark: "M",
    role: "Associate Software Engineer",
    location: "Hyderabad",
    workMode: "Hybrid",
    type: "Full-time",
    packageLpa: "21 LPA",
    experience: "Freshers",
    deadline: "Due in 5 days",
    careerUrl: "https://jobs.careers.microsoft.com/global/en/search",
    skills: ["C++", "Java", "OOP", "System Design", "Cloud"],
    preferredSkills: ["Azure", "Docker"],
    summary: "Develop cloud-backed platform services with high engineering reliability.",
  },
  {
    id: "amazon-sde-i",
    company: "Amazon",
    mark: "A",
    role: "SDE I",
    location: "Chennai",
    workMode: "On-site",
    type: "Full-time",
    packageLpa: "24 LPA",
    experience: "Freshers",
    deadline: "Due today",
    careerUrl: "https://www.amazon.jobs/en/search",
    skills: ["Java", "DSA", "Node.js", "SQL", "DBMS"],
    preferredSkills: ["AWS", "Microservices"],
    summary: "Architect backend APIs and transaction processing engines at scale.",
  },
  {
    id: "tcs-ninja",
    company: "TCS",
    mark: "T",
    role: "TCS Ninja Developer",
    location: "Pan India",
    workMode: "On-site",
    type: "Full-time",
    packageLpa: "3.6 LPA",
    experience: "Freshers",
    deadline: "Campus Drive",
    careerUrl: "https://www.tcs.com/careers/india",
    skills: ["Java", "SQL", "Python", "Communication"],
    preferredSkills: ["Web Basics"],
    summary: "Entry-level engineering role for campus hiring and enterprise delivery.",
  },
  {
    id: "infosys-ses",
    company: "Infosys",
    mark: "I",
    role: "Systems Engineer Specialist",
    location: "Mysuru / Bengaluru",
    workMode: "On-site",
    type: "Full-time",
    packageLpa: "9.5 LPA",
    experience: "Freshers",
    deadline: "Campus Drive",
    careerUrl: "https://www.infosys.com/careers/apply.html",
    skills: ["Python", "DBMS", "Java", "Problem Solving"],
    preferredSkills: ["Cloud Fundamentals"],
    summary: "Specialist role focused on enterprise application development and problem solving.",
  },
  {
    id: "zoho-dev",
    company: "Zoho",
    mark: "Z",
    role: "Software Developer",
    location: "Chennai",
    workMode: "On-site",
    type: "Full-time",
    packageLpa: "8 LPA",
    experience: "Freshers",
    deadline: "Open",
    careerUrl: "https://www.zoho.com/careers/job-openings.html",
    skills: ["Java", "C++", "JavaScript", "React"],
    preferredSkills: ["Logical Thinking"],
    summary: "Product engineering role with emphasis on algorithmic thinking and clean code.",
  },
];

function getStoredApplications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function calculateJobMatch(user, job) {
  const userSkills = new Set((user?.skills || []).map((s) => s.toLowerCase()));
  const requiredSkills = job.skills || [];

  if (userSkills.size === 0) {
    return { score: null, label: "Insufficient data to evaluate", tone: "neutral", matchedSkills: [], missingSkills: requiredSkills };
  }

  const matchedSkills = requiredSkills.filter((s) => userSkills.has(s.toLowerCase()));
  const missingSkills = requiredSkills.filter((s) => !userSkills.has(s.toLowerCase()));

  const skillPct = Math.round((matchedSkills.length / Math.max(requiredSkills.length, 1)) * 100);
  const userRole = (user?.targetRole || user?.title || "").toLowerCase();
  const jobRole = job.role.toLowerCase();
  const roleMatch = userRole && (jobRole.includes(userRole) || userRole.includes(jobRole.split(" ")[0])) ? 100 : 50;
  const eduMatch = user?.degree || user?.college ? 90 : 60;

  const totalScore = Math.min(100, Math.round(skillPct * 0.6 + roleMatch * 0.25 + eduMatch * 0.15));

  let tone = "danger";
  let label = "Low Match";
  if (totalScore >= 80) { tone = "strong"; label = "Strong Match"; }
  else if (totalScore >= 60) { tone = "warn"; label = "Moderate Match"; }

  return {
    score: totalScore,
    label,
    tone,
    matchedSkills,
    missingSkills,
    whyYouMatch: `You possess ${matchedSkills.length} of ${requiredSkills.length} required skills (${matchedSkills.join(", ") || "General academic fit"}).`,
  };
}

function JobCard({ job, user, applicationStatus, onOpenDetail }) {
  const match = useMemo(() => calculateJobMatch(user, job), [user, job]);

  return (
    <article className="cmd-job-card card-lift">
      <div className="cmd-job-card__head">
        <div className="cmd-job-card__brand">
          <span className="cmd-job-card__mark">{job.mark}</span>
          <div>
            <h3 className="cmd-job-card__company">{job.company}</h3>
            <span className="cmd-job-card__meta">{job.location} • {job.workMode}</span>
          </div>
        </div>

        {match.score !== null ? (
          <span className={`cmd-match-pill cmd-match-pill--${match.tone}`}>
            🎯 {match.score}% ({match.label})
          </span>
        ) : (
          <span className="cmd-match-pill cmd-match-pill--neutral">⚠️ Complete Profile for Match</span>
        )}
      </div>

      <h2 className="cmd-job-card__role">{job.role}</h2>
      <p className="cmd-job-card__summary">{job.summary}</p>

      <div className="cmd-job-card__badges">
        <span className="cmd-badge">{job.packageLpa}</span>
        <span className="cmd-badge">{job.type}</span>
        <span className="cmd-badge cmd-badge--deadline">⏳ {job.deadline}</span>
      </div>

      <div className="cmd-job-card__skills">
        {job.skills.map((skill) => (
          <span key={skill} className="cmd-skill-chip">{skill}</span>
        ))}
      </div>

      <div className="cmd-job-card__actions">
        <button type="button" className="cmd-btn cmd-btn--primary" onClick={() => onOpenDetail(job)}>
          View Details & Apply
        </button>
        {applicationStatus && (
          <span className="cmd-status-tag">{applicationStatus}</span>
        )}
      </div>
    </article>
  );
}

function JobDetailModal({ job, user, application, onClose, onSaveApplication }) {
  const navigate = useNavigate();
  const match = useMemo(() => calculateJobMatch(user, job), [user, job]);
  const [pipelineStatus, setPipelineStatus] = useState(application?.status || "Saved");
  const [notes, setNotes] = useState(application?.notes || "");
  const token = localStorage.getItem("token");

  const handleStatusUpdate = async (newStatus) => {
    setPipelineStatus(newStatus);
    const updated = {
      jobId: job.id,
      company: job.company,
      role: job.role,
      packageLpa: job.packageLpa,
      status: newStatus,
      notes,
      deadline: job.deadline,
      savedAt: new Date().toISOString(),
    };
    onSaveApplication(updated);

    if (token) {
      try {
        const existingApps = user?.applications || [];
        const nextApps = [updated, ...existingApps.filter((a) => a.jobId !== job.id)];
        await updateMe(token, { applications: nextApps });
      } catch {
        // Fallback local persistence
      }
    }
  };

  const handlePrepareInterview = () => {
    navigate("/interview-questions", {
      state: {
        jobTitle: job.role,
        company: job.company,
        jobDescription: job.summary,
        requiredSkills: job.skills,
      },
    });
  };

  return (
    <div className="cmd-modal-overlay" onClick={onClose}>
      <div className="cmd-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-modal-head">
          <div>
            <span className="cmd-modal-company">{job.company}</span>
            <h2 className="cmd-modal-title">{job.role}</h2>
          </div>
          <button type="button" className="cmd-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* MATCH BREAKDOWN */}
        <div className="cmd-modal-match-box">
          <div className="cmd-modal-match-header">
            <span className="cmd-modal-match-val">Overall Match: <b>{match.score ? `${match.score}%` : "N/A"}</b></span>
            {match.label && <span className={`cmd-match-pill cmd-match-pill--${match.tone}`}>{match.label}</span>}
          </div>
          <p className="cmd-modal-match-desc">{match.whyYouMatch}</p>

          {match.missingSkills.length > 0 && (
            <div className="cmd-skill-gaps">
              <span>⚠️ <b>Skill Gaps to Practice:</b></span>
              <div className="cmd-gap-chips">
                {match.missingSkills.map((s) => (
                  <span key={s} className="cmd-gap-chip">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* JOB DETAILS */}
        <div className="cmd-modal-body">
          <div className="cmd-meta-row">
            <span>💰 <b>Package:</b> {job.packageLpa}</span>
            <span>📍 <b>Location:</b> {job.location} ({job.workMode})</span>
            <span>⏱ <b>Deadline:</b> {job.deadline}</span>
          </div>

          <div className="cmd-section-title">Required Technical Skills</div>
          <div className="cmd-job-card__skills">
            {job.skills.map((s) => (
              <span key={s} className="cmd-skill-chip">{s}</span>
            ))}
          </div>

          {job.preferredSkills && (
            <>
              <div className="cmd-section-title">Preferred Skills</div>
              <div className="cmd-job-card__skills">
                {job.preferredSkills.map((s) => (
                  <span key={s} className="cmd-skill-chip cmd-skill-chip--preferred">{s}</span>
                ))}
              </div>
            </>
          )}

          {/* APPLICATION PIPELINE STATUS TRACKER */}
          <div className="cmd-pipeline-box">
            <div className="cmd-section-title">Application Pipeline Status</div>
            <div className="cmd-pipeline-steps">
              {["Saved", "Applied", "Assessment", "Interview", "Selected"].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`cmd-pipeline-step ${pipelineStatus === st ? "cmd-pipeline-step--active" : ""}`}
                  onClick={() => handleStatusUpdate(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="cmd-modal-footer">
          <button type="button" className="cmd-btn cmd-btn--primary" onClick={handlePrepareInterview}>
            🎯 Prepare for Interview
          </button>
          <a href={job.careerUrl} target="_blank" rel="noreferrer" className="cmd-btn cmd-btn--ghost">
            Open Company Careers Site ↗
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Jobs() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [workMode, setWorkMode] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState(getStoredApplications);

  const applicationMap = useMemo(() => {
    const map = {};
    applications.forEach((a) => { map[a.jobId] = a.status; });
    return map;
  }, [applications]);

  const filteredJobs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return JOBS.filter((job) => {
      const matchesType = type === "All" || job.type === type;
      const matchesMode = workMode === "All" || job.workMode === workMode;
      const haystack = [job.company, job.role, job.location, job.packageLpa, ...job.skills].join(" ").toLowerCase();
      return matchesType && matchesMode && (!needle || haystack.includes(needle));
    });
  }, [query, type, workMode]);

  const saveApplication = (appData) => {
    const next = [appData, ...applications.filter((a) => a.jobId !== appData.jobId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setApplications(next);
  };

  return (
    <DashboardLayout>
      {(user) => (
        <div className="cmd-jobs-page">
          <div className="cmd-jobs-header">
            <div>
              <span className="cmd-profile-eyebrow">Real Job Engine</span>
              <h1 className="cmd-profile-title">Placement Openings & Application Pipeline</h1>
              <p className="cmd-profile-sub">Real job matching engine based on candidate profile evidence, skill gaps, and interview prep.</p>
            </div>
            <div className="cmd-jobs-stats">
              <div className="cmd-stat-box">
                <span className="cmd-stat-val">{JOBS.length}</span>
                <span className="cmd-stat-lbl">Openings</span>
              </div>
              <div className="cmd-stat-box">
                <span className="cmd-stat-val">{applications.length}</span>
                <span className="cmd-stat-lbl">In Pipeline</span>
              </div>
            </div>
          </div>

          {/* SEARCH & FILTERS */}
          <div className="cmd-toolbar-card">
            <div className="cmd-search-input-wrap">
              <span>🔍</span>
              <input
                className="cmd-search-input"
                placeholder="Search by role, company, skills, or location..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="cmd-filter-group">
              <span>Type:</span>
              {["All", "Full-time", "Internship"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`cmd-filter-btn ${type === t ? "cmd-filter-btn--active" : ""}`}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="cmd-filter-group">
              <span>Mode:</span>
              {["All", "Hybrid", "On-site"].map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`cmd-filter-btn ${workMode === m ? "cmd-filter-btn--active" : ""}`}
                  onClick={() => setWorkMode(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* JOB GRID */}
          <div className="cmd-jobs-grid">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                user={user}
                applicationStatus={applicationMap[job.id]}
                onOpenDetail={setSelectedJob}
              />
            ))}
          </div>

          {/* PIPELINE TRACKER SUMMARY */}
          {applications.length > 0 && (
            <div className="command-card">
              <h3>📋 Active Application Pipeline ({applications.length})</h3>
              <div className="cmd-pipeline-table-wrap">
                <table className="ats-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Package</th>
                      <th>Status Pipeline</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.jobId}>
                        <td className="ats-td-bold">{app.company}</td>
                        <td>{app.role}</td>
                        <td>{app.packageLpa}</td>
                        <td><span className="cmd-status-tag">{app.status}</span></td>
                        <td>{new Date(app.savedAt || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedJob && (
            <JobDetailModal
              job={selectedJob}
              user={user}
              application={applications.find((a) => a.jobId === selectedJob.id)}
              onClose={() => setSelectedJob(null)}
              onSaveApplication={saveApplication}
            />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
