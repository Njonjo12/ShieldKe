import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../socket";
import CallWindow from "./CallWindow";
import { FiPhone, FiX } from "react-icons/fi";

/*
========================================
GLOBAL CALL MANAGER

Mounted once at the app root (see App.jsx),
outside any specific page or chat window,
so an incoming call is detected and shown
no matter what page the user is currently
on — browsing lawyers, editing their
profile, reading notifications, anywhere.

This is now the ONLY place that listens for
"incoming-call". ChatWindow.jsx no longer
has its own copy of this listener — having
two active listeners at once would mean two
banners / two CallWindows fighting over the
same event whenever a chat happened to be
open at the moment a call came in.

It also re-registers the current user with
the socket server on every route change.
That isn't just for calls — the same
"registerUser" emit is what the backend
uses to know which socket belongs to which
user for ALL live push notifications (new
messages, consultation updates, etc). Before
this, that registration only ever happened
inside ChatWindow, meaning a user who hadn't
yet opened a chat this session was never
marked online at all.
========================================
*/

function Avatar({ name, size = 44 }) {
  const initials = (name || "?")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#00A86B22", border: "2px solid #00A86B40",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 800, color: "#00A86B",
      flexShrink: 0, fontFamily: "inherit",
    }}>
      {initials}
    </div>
  );
}

export default function GlobalCallManager() {

  const location = useLocation();
  const [incomingCall, setIncomingCall] = useState(null); // { consultationId, callType, offer, callerName }
  const [activeCall, setActiveCall] = useState(null);      // set once the user accepts

  /* ── keep this user registered as online on every navigation,
        not just when a chat happens to be open ── */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?._id) {
      socket.emit("registerUser", user._id);
    }
  }, [location.pathname]);

  /* ── single, app-wide incoming-call listener ── */
  useEffect(() => {
    const handleIncoming = ({ consultationId, callType, offer, callerName }) => {
      setIncomingCall({ consultationId, callType, offer, callerName });
    };
    socket.on("incoming-call", handleIncoming);
    return () => socket.off("incoming-call", handleIncoming);
  }, []);

  const acceptCall = () => {
    setActiveCall(incomingCall);
    setIncomingCall(null);
  };

  const declineCall = () => {
    if (incomingCall) {
      socket.emit("call-rejected", { consultationId: incomingCall.consultationId });
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    setActiveCall(null);
  };

  return (
    <>
      {/* ── FULL-SCREEN CALL OVERLAY (once accepted) ── */}
      <AnimatePresence>
        {activeCall && (
          <CallWindow
            consultationId={activeCall.consultationId}
            callType={activeCall.callType}
            isIncoming={true}
            offer={activeCall.offer}
            callerName={activeCall.callerName}
            onEnd={endCall}
          />
        )}
      </AnimatePresence>

      {/* ── INCOMING CALL BANNER ──
          width: calc(100vw - 32px) + left: 16px is the correct
          mobile approach. On real mobile browsers, scrollbars are
          overlay (0px wide), so 100vw equals the actual viewport
          width and the banner gets exactly 16px margins each side.
          We avoid both left+right (headless Chrome quirk) and
          left:50%+transform (framer-motion transform conflict). */}
      <AnimatePresence>
        {incomingCall && !activeCall && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            style={{
              position: "fixed",
              top: 16,
              left: 16,
              width: "calc(100vw - 32px)",
              maxWidth: 440,
              zIndex: 9999,
              background: "#0B1F3A",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <motion.div
                animate={{ scale: [1, 1.22, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <Avatar name={incomingCall.callerName} size={44} />
              </motion.div>
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", background: "#22C55E", border: "2px solid #0B1F3A" }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {incomingCall.callerName}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2, whiteSpace: "nowrap" }}>
                Incoming {incomingCall.callType === "video" ? "📹 video" : "📞 audio"} call
              </div>
            </div>

            <button
              onClick={acceptCall}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg,#006B3F,#00A86B)",
                border: "none", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,107,63,0.4)", flexShrink: 0,
              }}
            >
              <FiPhone size={17} color="#fff" />
            </button>

            <button
              onClick={declineCall}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", flexShrink: 0,
              }}
            >
              <FiX size={17} color="#F87171" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
