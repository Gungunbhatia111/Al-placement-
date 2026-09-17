import "./NoticeTicker.css";

const DEFAULT_NOTICES = [
  "TCS NQT registrations close in 4 days",
  "Resume Feedback now supports 3 target roles",
  "Amazon SDE-1 drive — apply before Fri",
  "New feature: AI-generated interview follow-ups",
  "127 students placed this season",
];

export default function NoticeTicker({ notices = DEFAULT_NOTICES }) {
  const items = [...notices, ...notices]; // duplicate for seamless loop

  return (
    <div className="ticker" role="marquee" aria-label="Placement cell updates">
      <span className="ticker__label">NOTICES</span>
      <div className="ticker__track">
        <div className="ticker__content">
          {items.map((item, i) => (
            <span className="ticker__item" key={i}>
              {item}
              <span className="ticker__dot">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
