export default function WelcomeIllustration() {
  return (
    <svg viewBox="0 0 260 180" className="welcome-illustration" aria-hidden="true">
      <ellipse cx="130" cy="165" rx="95" ry="10" fill="rgba(22,35,63,0.08)" />
      {/* desk */}
      <rect x="40" y="120" width="180" height="10" rx="2" fill="var(--color-navy)" />
      <rect x="55" y="130" width="8" height="30" fill="var(--color-navy)" />
      <rect x="197" y="130" width="8" height="30" fill="var(--color-navy)" />
      {/* laptop */}
      <rect x="95" y="95" width="70" height="26" rx="3" fill="#fffdf8" stroke="var(--color-paper-line)" />
      <rect x="100" y="100" width="60" height="16" rx="1" fill="var(--color-navy)" />
      <rect x="90" y="118" width="80" height="6" rx="2" fill="var(--color-navy-soft)" />
      {/* person */}
      <circle cx="130" cy="55" r="18" fill="#e0c065" />
      <path
        d="M100 100c2-22 14-34 30-34s28 12 30 34"
        fill="var(--color-navy)"
      />
      {/* resume card floating */}
      <rect x="180" y="45" width="34" height="44" rx="3" fill="#fffdf8" stroke="var(--color-brass)" strokeWidth="1.5" />
      <line x1="186" y1="55" x2="208" y2="55" stroke="var(--color-paper-line)" strokeWidth="2" />
      <line x1="186" y1="62" x2="208" y2="62" stroke="var(--color-paper-line)" strokeWidth="2" />
      <line x1="186" y1="69" x2="200" y2="69" stroke="var(--color-paper-line)" strokeWidth="2" />
      {/* chat bubble */}
      <rect x="35" y="50" width="30" height="22" rx="6" fill="var(--color-maroon)" />
      <path d="M42 72l-4 8 10-8" fill="var(--color-maroon)" />
      {/* check badge */}
      <circle cx="205" cy="95" r="12" fill="#2f6b46" />
      <path d="M199 95l4 4 8-8" stroke="#fffdf8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* plant */}
      <rect x="45" y="140" width="14" height="16" rx="2" fill="var(--color-maroon)" />
      <path d="M52 140c-6-4-8-14-4-20 4 6 4 14 4 20Zm0 0c6-4 8-14 4-20-4 6-4 14-4 20Z" fill="#5a8a5f" />
    </svg>
  );
}
