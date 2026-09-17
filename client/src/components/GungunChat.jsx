import { useEffect, useRef, useState } from "react";
import { getChat, sendMessage } from "../api/chat.js";
import "./GungunChat.css";

function GungunFace({ size = 32, color = "#7a1f2b", glow = "#d6b329", blink = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="24" y1="5" x2="24" y2="12" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="24" cy="4" r="2.5" fill={glow} />
      <ellipse cx="24" cy="26" rx="16" ry="15" fill="white" stroke={color} strokeWidth="2" />
      <ellipse cx="14.5" cy="30" rx="3.5" ry="2" fill={glow} opacity="0.35" />
      <ellipse cx="33.5" cy="30" rx="3.5" ry="2" fill={glow} opacity="0.35" />
      {blink ? (
        <>
          <line x1="17.5" y1="24" x2="21.5" y2="24" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
          <line x1="26.5" y1="24" x2="30.5" y2="24" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="19.5" cy="24" r="2.8" fill={color} />
          <circle cx="28.5" cy="24" r="2.8" fill={color} />
          <circle cx="20.5" cy="23" r="1" fill="white" />
          <circle cx="29.5" cy="23" r="1" fill="white" />
        </>
      )}
      <path d="M18 30 Q24 35.5 30 30" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M17 38 Q24 52 31 38" fill={color} opacity="0.18" />
      <path d="M20 37.5 Q24 48 28 37.5" fill={color} opacity="0.5" />
    </svg>
  );
}

const MODES = [
  {
    id: "resume",
    label: "Resume",
    color: "#7a1f2b",
    glow: "#b04b45",
    greeting: "Hi, I am Gungun. Share your resume doubts and I will help you improve impact, keywords, and formatting.",
    placeholder: "Ask about resume feedback...",
  },
  {
    id: "interview",
    label: "Interview",
    color: "#16233f",
    glow: "#4f6fa8",
    greeting: "Hi, I am Gungun. I can help you practice HR, technical, and role-specific interview questions.",
    placeholder: "Ask for interview practice...",
  },
  {
    id: "jobs",
    label: "Jobs",
    color: "#a47f13",
    glow: "#d6b329",
    greeting: "Hi, I am Gungun. Tell me your role or company target and I will help you prepare for job opportunities.",
    placeholder: "Ask about jobs or companies...",
  },
  {
    id: "career",
    label: "Career Plan",
    color: "#2f7d5c",
    glow: "#65b88a",
    greeting: "Hi, I am Gungun. I can help you choose skills, projects, and next steps for placement readiness.",
    placeholder: "Ask for a placement roadmap...",
  },
];

function GungunOrb({ mode, onClick, open }) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3400);
    return () => clearInterval(interval);
  }, []);

  return (
    <button className={`gungun-orb ${open ? "gungun-orb--open" : ""}`} onClick={onClick} aria-label="Open Gungun AI">
      <GungunFace size={40} color={mode.color} glow={mode.glow} blink={blink} />
    </button>
  );
}

function TypingDots({ color }) {
  return (
    <span className="gungun-typing-dots" aria-label="Gungun is typing">
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ backgroundColor: color, animationDelay: `${i * 0.2}s` }} />
      ))}
    </span>
  );
}

export default function GungunChat({ token: tokenProp }) {
  const [open, setOpen] = useState(false);
  const [modeIdx, setModeIdx] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const bottomRef = useRef(null);

  const token = tokenProp || localStorage.getItem("token");
  const mode = MODES[modeIdx];

  useEffect(() => {
    if (open && !loadedOnce && token) {
      getChat(token)
        .then((chat) => {
          setMessages(chat.messages || []);
          setLoadedOnce(true);
        })
        .catch(() => setLoadedOnce(true));
    }
  }, [open, loadedOnce, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleModeChange = (index) => {
    setModeIdx(index);
    if (messages.length === 0) return;
    setMessages((prev) => [...prev, { role: "assistant", content: MODES[index].greeting }]);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || !token || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendMessage(token, text);
      setMessages(data.messages || []);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong reaching Gungun. Try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  const visibleMessages = messages.length > 0 ? messages : [{ role: "assistant", content: mode.greeting }];

  return (
    <div className="gungun-widget" style={{ "--gungun-color": mode.color, "--gungun-glow": mode.glow }}>
      {open && (
        <section className="gungun-panel" aria-label="Gungun AI chat">
          <header className="gungun-panel__header">
            <div className="gungun-panel__title-row">
              <span className="gungun-panel__face">
                <GungunFace size={30} color={mode.color} glow={mode.glow} />
              </span>
              <div>
                <p className="gungun-panel__title">Gungun AI</p>
                <p className="gungun-panel__subtitle">Placement assistant</p>
              </div>
            </div>
            <button className="gungun-panel__close" onClick={() => setOpen(false)} aria-label="Close Gungun AI">
              X
            </button>
          </header>

          <div className="gungun-modes" aria-label="Chat focus">
            {MODES.map((item, index) => (
              <button
                key={item.id}
                className={`gungun-mode ${index === modeIdx ? "gungun-mode--active" : ""}`}
                onClick={() => handleModeChange(index)}
                style={{
                  "--mode-color": item.color,
                  "--mode-glow": item.glow,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="gungun-messages">
            {visibleMessages.map((message, index) => (
              <div
                key={index}
                className={`gungun-message ${
                  message.role === "user" ? "gungun-message--user" : "gungun-message--assistant"
                }`}
              >
                {message.role !== "user" && (
                  <span className="gungun-message__avatar">
                    <GungunFace size={22} color={mode.color} glow={mode.glow} />
                  </span>
                )}
                <p className="gungun-message__bubble">{message.content}</p>
              </div>
            ))}
            {loading && (
              <div className="gungun-message gungun-message--assistant">
                <span className="gungun-message__avatar">
                  <GungunFace size={22} color={mode.color} glow={mode.glow} />
                </span>
                <p className="gungun-message__bubble">
                  <TypingDots color={mode.color} />
                </p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="gungun-input-row" onSubmit={handleSend}>
            <input
              className="gungun-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode.placeholder}
            />
            <button className="gungun-send" type="submit" disabled={loading || !input.trim()} aria-label="Send message">
              ^
            </button>
          </form>
        </section>
      )}

      <div className={open ? "" : "gungun-orb-float"}>
        <GungunOrb mode={mode} onClick={() => setOpen((value) => !value)} open={open} />
      </div>
    </div>
  );
}
