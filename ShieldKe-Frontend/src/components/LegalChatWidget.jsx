import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiX, FiSend, FiArrowRight } from "react-icons/fi";

// Matches the project's existing environment-aware URL pattern:
// VITE_API_URL already includes the "/api" suffix (see CallWindow.jsx etc.),
// so we call `${API_URL}/ai/chat`, not `${API_URL}/api/ai/chat`.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_URL = API_URL.replace("/api", "");

// Adjust to your actual lawyer-search route + query param.
const FIND_LAWYER_PATH = "/register";

/* Same palette values as Home.jsx's `C` — duplicated here so this component
   stays a drop-in file with no import coupling to the page. Keep these in
   sync if you ever tweak the brand colors. */
const C = {
  navy: "#0B1F3A",
  navyDark: "#060F1D",
  navyMid: "#132843",
  green: "#006B3F",
  greenLight: "#00A86B",
  gold: "#C9961A",
  goldLight: "#F0BE4A",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.5)",
  border: "rgba(255,255,255,0.08)",
};

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Habari! I'm Sheria, ShieldKe's legal assistant. Ask me a question about Kenyan law, or tell me what's going on and I'll help you figure out next steps.",
};

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "10px 14px" }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: C.greenLight }}
        />
      ))}
    </div>
  );
}

export default function LegalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [cta, setCta] = useState(null); // { category } | null
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .slice(-20),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Sheria couldn't respond right now.");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      if (data.cta) setCta(data.cta);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const panelWidth = isMobile ? "92vw" : 380;
  const panelHeight = isMobile ? "70vh" : 540;

  return (
    <div style={{ position: "fixed", bottom: isMobile ? 16 : 24, right: isMobile ? 16 : 24, zIndex: 95, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginBottom: 14,
              width: panelWidth,
              height: panelHeight,
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: 20,
              background: C.navyMid,
              border: `1px solid ${C.border}`,
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 18px",
                background: `linear-gradient(135deg,${C.green},${C.greenLight})`,
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.white, letterSpacing: "-0.02em" }}>
                  Sheria
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                  ShieldKe's legal assistant
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: 8,
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: C.white,
                }}
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background: C.navyDark,
              }}
            >
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "85%",
                      whiteSpace: "pre-wrap",
                      fontSize: 13.5,
                      lineHeight: 1.6,
                      padding: "10px 14px",
                      borderRadius: 14,
                      borderBottomRightRadius: m.role === "user" ? 4 : 14,
                      borderBottomLeftRadius: m.role === "assistant" ? 4 : 14,
                      background: m.role === "user" ? `linear-gradient(135deg,${C.green},${C.greenLight})` : C.navyMid,
                      color: m.role === "user" ? C.white : "rgba(255,255,255,0.85)",
                      border: m.role === "assistant" ? `1px solid ${C.border}` : "none",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{ borderRadius: 14, borderBottomLeftRadius: 4, background: C.navyMid, border: `1px solid ${C.border}` }}>
                    <TypingDots />
                  </div>
                </div>
              )}

              {error && (
                <p style={{ textAlign: "center", fontSize: 12, color: "#F87171", margin: 0 }}>{error}</p>
              )}

              {cta && (
                <div
                  style={{
                    borderRadius: 14,
                    padding: "14px 16px",
                    textAlign: "center",
                    background: `${C.gold}18`,
                    border: `1px solid ${C.goldLight}40`,
                  }}
                >
                  <p style={{ fontSize: 12, color: C.goldLight, fontWeight: 600, margin: "0 0 10px" }}>
                    This looks like a {cta.category.toLowerCase()} matter. Ready to talk to a verified lawyer?
                  </p>
                  <a
                    href={`${FIND_LAWYER_PATH}?category=${encodeURIComponent(cta.category)}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "10px 18px",
                      borderRadius: 10,
                      background: `linear-gradient(135deg,${C.gold},${C.goldLight})`,
                      color: C.navy,
                      fontSize: 13,
                      fontWeight: 800,
                      textDecoration: "none",
                    }}
                  >
                    Find a Lawyer <FiArrowRight size={14} />
                  </a>
                </div>
              )}
            </div>

            {/* Input */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                padding: 12,
                borderTop: `1px solid ${C.border}`,
                background: C.navyMid,
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your legal issue..."
                rows={1}
                style={{
                  flex: 1,
                  resize: "none",
                  maxHeight: 90,
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  background: C.navyDark,
                  color: C.white,
                  fontSize: 13.5,
                  fontFamily: "inherit",
                  padding: "10px 12px",
                  outline: "none",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: "none",
                  background: !input.trim() || isTyping ? "rgba(255,255,255,0.08)" : `linear-gradient(135deg,${C.green},${C.greenLight})`,
                  color: C.white,
                  cursor: !input.trim() || isTyping ? "default" : "pointer",
                  flexShrink: 0,
                }}
              >
                <FiSend size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle button */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close Sheria" : "Open Sheria, ShieldKe's legal assistant"}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: isOpen ? 14 : "13px 20px 13px 16px",
          borderRadius: 999,
          border: "none",
          background: `linear-gradient(135deg,${C.green},${C.greenLight})`,
          color: C.white,
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "inherit",
          cursor: "pointer",
          boxShadow: "0 12px 32px rgba(0,107,63,0.4)",
        }}
      >
        <FiMessageSquare size={18} />
        {!isOpen && <span>Ask Sheria</span>}
      </motion.button>
    </div>
  );
}
