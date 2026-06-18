import { useEffect, useRef, useState } from "react";
import socket from "../socket";
import { getToken } from "../utils/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend, FiPaperclip, FiX, FiDownload,
  FiFileText, FiVideo, FiPhone,
} from "react-icons/fi";
import CallWindow from "./CallWindow";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const C = {
  bg:         "#F0F4F8",
  surface:    "#FFFFFF",
  navyDark:   "#0B1F3A",
  navyMid:    "#132843",
  green:      "#006B3F",
  greenLight: "#00A86B",
  border:     "#E5E7EB",
  muted:      "#9CA3AF",
  textDark:   "#111827",
  textMid:    "#374151",
};

function Avatar({ name, size = 32, color = C.greenLight }) {
  const initials = (name || "?")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "22", border: `2px solid ${color}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 800, color,
      flexShrink: 0, fontFamily: "inherit",
    }}>
      {initials}
    </div>
  );
}

function isImage(url = "") {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
}

export default function ChatWindow({ consultationId }) {

  /* ── CHAT STATE (unchanged) ── */
  const [message,  setMessage]  = useState("");
  const [file,     setFile]     = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending,  setSending]  = useState(false);

  /* ── CALL STATE ──
     Incoming-call detection now lives in GlobalCallManager
     (mounted once at the app root) so it works no matter what
     page the user is on, not just while this chat is open.
     This component only needs to handle OUTGOING calls — the
     ones the current viewer starts by clicking the buttons below. */
  const [callActive,    setCallActive]    = useState(false);
  const [callType,      setCallType]      = useState(null);   // 'video' | 'audio'

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const fileInputRef   = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  /* ══════════════════════════════════════
     SCROLL
  ══════════════════════════════════════ */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ══════════════════════════════════════
     SOCKET + LOAD (unchanged logic)
  ══════════════════════════════════════ */
  useEffect(() => {
    if (!consultationId) return;
    socket.emit("registerUser", user._id);
    socket.emit("joinRoom", consultationId);
    fetchMessages();

    socket.on("receiveMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [consultationId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  /* ══════════════════════════════════════
     FETCH HISTORY (unchanged)
  ══════════════════════════════════════ */
  const fetchMessages = async () => {
    try {
      const res  = await fetch(`${API_URL}/messages/${consultationId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  /* ══════════════════════════════════════
     SEND MESSAGE (unchanged)
  ══════════════════════════════════════ */
  const sendMessage = async () => {
    if (!message.trim() && !file) return;
    setSending(true);
    let fileUrl = "";
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const uploadRes  = await fetch(`${API_URL}/messages/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        fileUrl = uploadData.fileUrl;
      } catch (error) {
        console.error("Upload error:", error);
      }
    }
    const msgData = {
      consultation: consultationId,
      sender:       user._id,
      text:         message,
      fileUrl,
    };
    socket.emit("sendMessage", msgData);
    setMessage("");
    setFile(null);
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ══════════════════════════════════════
     GROUP MESSAGES (unchanged)
  ══════════════════════════════════════ */
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = msg.createdAt
      ? new Date(msg.createdAt).toLocaleDateString("en-KE", {
          weekday: "long", month: "long", day: "numeric",
        })
      : "Today";
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  const getSenderName = (msg) =>
    typeof msg.sender === "object" ? msg.sender.name || "User" : "";
  const getSenderId = (msg) =>
    typeof msg.sender === "object" ? msg.sender._id : msg.sender;

  /* ══════════════════════════════════════
     CALL HANDLERS (outgoing only — see note above)
  ══════════════════════════════════════ */
  const startCall = (type) => {
    setCallType(type);
    setCallActive(true);
  };

  const handleCallEnd = () => {
    setCallActive(false);
    setCallType(null);
  };

  return (
    <>
      {/* ══════════════════════════════════════
          CALL WINDOW (portal-style full-screen)
          Outgoing calls only — see note above.
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {callActive && (
          <CallWindow
            consultationId={consultationId}
            callType={callType}
            isIncoming={false}
            offer={null}
            callerName=""
            onEnd={handleCallEnd}
          />
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          CHAT SHELL
      ══════════════════════════════════════ */}
      <div style={{
        display: "flex", flexDirection: "column",
        height: 600,
        background: C.bg,
        borderRadius: 18,
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>

        {/* ── HEADER ── */}
        <div style={{
          background: C.navyDark,
          padding: "0 18px",
          height: 62,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          {/* left: icon + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${C.green},${C.greenLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚖</div>
              <div style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: "#22C55E", border: "2px solid #0B1F3A" }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>Consultation Chat</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
                Secure & encrypted
              </div>
            </div>
          </div>

          {/* right: call buttons + badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* AUDIO CALL */}
            <button
              onClick={() => startCall("audio")}
              title="Start audio call"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,168,107,0.2)"; e.currentTarget.style.borderColor = "rgba(0,168,107,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
            >
              <FiPhone size={16} color="#fff" />
            </button>

            {/* VIDEO CALL */}
            <button
              onClick={() => startCall("video")}
              title="Start video call"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,168,107,0.2)"; e.currentTarget.style.borderColor = "rgba(0,168,107,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
            >
              <FiVideo size={16} color="#fff" />
            </button>

            {/* PRIVATE badge */}
            <div style={{ padding: "5px 12px", borderRadius: 999, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)", color: "#22C55E", fontSize: 12, fontWeight: 700 }}>
              🔒 Private
            </div>
          </div>
        </div>

        {/* ── MESSAGES AREA (unchanged) ── */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "20px 20px 8px",
          display: "flex", flexDirection: "column", gap: 0,
          scrollbarWidth: "thin", scrollbarColor: "#D1D5DB transparent",
        }}>

          {messages.length === 0 && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.muted, textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>💬</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.textMid, marginBottom: 6 }}>Start the conversation</div>
              <div style={{ fontSize: 13, color: C.muted, maxWidth: 260, lineHeight: 1.7 }}>
                All messages are private and securely encrypted between you and your advocate.
              </div>
            </div>
          )}

          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 14px" }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{date}</div>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              {msgs.map((msg, idx) => {
                const isMe       = getSenderId(msg) === user._id;
                const senderName = getSenderName(msg);
                const prevSender = idx > 0 ? getSenderId(msgs[idx - 1]) : null;
                const showAvatar = !isMe && prevSender !== getSenderId(msg);
                return (
                  <motion.div
                    key={msg._id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 8, marginBottom: 4 }}
                  >
                    {!isMe && (
                      <div style={{ width: 28, flexShrink: 0 }}>
                        {showAvatar && <Avatar name={senderName} size={28} color={C.greenLight} />}
                      </div>
                    )}
                    <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                      {!isMe && showAvatar && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.greenLight, marginBottom: 4, paddingLeft: 2 }}>{senderName}</div>
                      )}
                      <div style={{
                        padding: msg.fileUrl && !msg.text ? "8px" : "11px 16px",
                        borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: isMe ? C.navyDark : C.surface,
                        color: isMe ? "#fff" : C.textDark,
                        boxShadow: isMe ? "0 2px 8px rgba(11,31,58,0.2)" : "0 2px 8px rgba(0,0,0,0.06)",
                        border: isMe ? "none" : `1px solid ${C.border}`,
                        wordBreak: "break-word",
                      }}>
                        {msg.text && <div style={{ fontSize: 14, lineHeight: 1.6 }}>{msg.text}</div>}
                        {msg.fileUrl && (
                          <div style={{ marginTop: msg.text ? 10 : 0 }}>
                            {isImage(msg.fileUrl) ? (
                              <img src={msg.fileUrl} alt="attachment" style={{ maxWidth: 240, maxHeight: 200, borderRadius: 10, display: "block", objectFit: "cover" }} />
                            ) : (
                              <a href={msg.fileUrl} target="_blank" rel="noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10, background: isMe ? "rgba(255,255,255,0.12)" : "#F3F4F6", border: isMe ? "1px solid rgba(255,255,255,0.15)" : `1px solid ${C.border}`, color: isMe ? "#fff" : C.textMid, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                                <FiFileText size={15} /> View Document <FiDownload size={13} style={{ opacity: 0.7 }} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* ── FILE PREVIEW STRIP (unchanged) ── */}
        <AnimatePresence>
          {file && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", background: "#EFF6FF", borderTop: "1px solid #DBEAFE" }}>
                <FiFileText size={16} color="#3B82F6" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1D4ED8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                <span style={{ fontSize: 12, color: "#6B7280" }}>{(file.size / 1024).toFixed(0)} KB</span>
                <button onClick={() => setFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 2, display: "flex" }}>
                  <FiX size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── INPUT BAR (unchanged) ── */}
        <div style={{ padding: "14px 16px", background: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
          <label style={{ width: 40, height: 40, borderRadius: "50%", background: file ? "#EFF6FF" : "#F3F4F6", border: `1px solid ${file ? "#BFDBFE" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#EFF6FF"}
            onMouseLeave={e => e.currentTarget.style.background = file ? "#EFF6FF" : "#F3F4F6"}
          >
            <FiPaperclip size={17} color={file ? "#3B82F6" : C.muted} />
            <input ref={fileInputRef} type="file" hidden onChange={e => setFile(e.target.files[0])} />
          </label>

          <div style={{ flex: 1 }}>
            <textarea
              ref={inputRef}
              placeholder="Type your message…"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{ width: "100%", padding: "11px 16px", borderRadius: 22, border: `1.5px solid ${C.border}`, background: C.bg, color: C.textDark, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "none", lineHeight: 1.5, maxHeight: 120, overflowY: "auto", boxSizing: "border-box", transition: "border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor = C.greenLight}
              onBlur={e  => e.target.style.borderColor = C.border}
              onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={sendMessage}
            disabled={sending || (!message.trim() && !file)}
            style={{ width: 42, height: 42, borderRadius: "50%", background: (message.trim() || file) && !sending ? `linear-gradient(135deg,${C.green},${C.greenLight})` : "#E5E7EB", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: (message.trim() || file) ? "pointer" : "not-allowed", flexShrink: 0, transition: "background 0.2s", boxShadow: (message.trim() || file) ? "0 4px 14px rgba(0,107,63,0.3)" : "none" }}
          >
            <FiSend size={17} color={(message.trim() || file) ? "#fff" : C.muted} />
          </motion.button>
        </div>

      </div>
    </>
  );
}
