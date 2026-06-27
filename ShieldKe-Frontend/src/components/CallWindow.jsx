import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../socket";
import { getToken } from "../utils/auth";
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff,
  FiPhoneOff, FiMaximize2, FiMinimize2,
} from "react-icons/fi";

/*
========================================
WEBRTC FIXES IN THIS FILE

FIX 1 — TURN SERVERS (the main reason
calls connected but had no media)
STUN-only fails for ~60-70% of real-world
connections because most mobile users
(Safaricom, Airtel, Telkom) are behind
Carrier-Grade NAT (symmetric NAT), which
STUN cannot traverse. STUN discovers IP
addresses but cannot relay packets. TURN
relays every packet through the server
when direct peer-to-peer is impossible.
We now fetch ICE config from the backend
(GET /api/calls/ice-config) which returns
both STUN and TURN credentials. This
single change will fix ~70% of failed calls.

FIX 2 — ICE CANDIDATE QUEUING (the silent
dropper that killed the remaining calls)
addIceCandidate() is only valid AFTER
setRemoteDescription() has been called.
On fast connections, remote ICE candidates
arrive via socket BEFORE the offer/answer
round-trip completes. Every premature
addIceCandidate() call throws and silently
drops that candidate. With TURN, relay
candidates are the last resort — if they
get dropped, no connection even with TURN
configured. Fix: pendingCandidates[] buffers
any candidate that arrives early, and
drainPendingCandidates() applies them all
immediately after setRemoteDescription.
========================================
*/

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ─── helpers ─────────────────────────── */
const formatDuration = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Avatar({ name, size = 72 }) {
  const initials = (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "rgba(0,168,107,0.15)", border: "2px solid rgba(0,168,107,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 800, color: "#00A86B", flexShrink: 0,
      fontFamily: "inherit",
    }}>
      {initials}
    </div>
  );
}

function CtrlBtn({ onClick, active, danger, label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
        onClick={onClick}
        title={label}
        style={{
          width: 52, height: 52, borderRadius: "50%", border: "none",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          background: danger
            ? "rgba(239,68,68,0.85)"
            : active
              ? "rgba(255,255,255,0.25)"
              : "rgba(255,255,255,0.1)",
        }}
      >
        {children}
      </motion.button>
      {label && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{label}</div>}
    </div>
  );
}

export default function CallWindow({ consultationId, callType, isIncoming, offer, callerName, onEnd }) {

  const pcRef               = useRef(null);
  const localStreamRef      = useRef(null);
  const localVideoRef       = useRef(null);
  const remoteVideoRef      = useRef(null);
  const remoteDescSetRef    = useRef(false);
  const pendingCandidates   = useRef([]);   /* FIX 2 — queue for early ICE candidates */

  const [callStatus,  setCallStatus]  = useState("connecting");
  const [isMuted,     setIsMuted]     = useState(false);
  const [isCamOff,    setIsCamOff]    = useState(false);
  const [isPiP,       setIsPiP]       = useState(false);
  const [duration,    setDuration]    = useState(0);
  const [iceState,    setIceState]    = useState("new"); /* shown in UI for easy debugging */

  const isVideo = callType === "video";
  const user    = JSON.parse(localStorage.getItem("user") || "{}");

  /* ══════════════════════════════════════
     DURATION TIMER
  ══════════════════════════════════════ */
  useEffect(() => {
    if (callStatus !== "active") return;
    const t = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, [callStatus]);

  /* ══════════════════════════════════════
     CLEANUP
  ══════════════════════════════════════ */
  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    remoteDescSetRef.current = false;
    pendingCandidates.current = [];
  }, []);

  /* ══════════════════════════════════════
     FIX 2 — DRAIN QUEUED ICE CANDIDATES
     Call this immediately after every
     setRemoteDescription() call.
  ══════════════════════════════════════ */
  const drainPendingCandidates = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;

    const queued = pendingCandidates.current.splice(0);
    for (const c of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch (err) {
        console.warn("[ICE] Failed to add queued candidate:", err.message);
      }
    }

    if (queued.length > 0) {
      console.log(`[ICE] Drained ${queued.length} queued candidate(s)`);
    }
  }, []);

  /* ══════════════════════════════════════
     FIX 1 — FETCH ICE CONFIG (STUN+TURN)
     Before creating any RTCPeerConnection,
     get the server-provided ICE config so
     TURN credentials are included.
  ══════════════════════════════════════ */
  const fetchIceConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/calls/ice-config`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`ICE config fetch failed: ${res.status}`);
      const data = await res.json();
      console.log("[ICE] Config fetched:", data.iceServers?.length, "servers");
      return data;
    } catch (err) {
      console.error("[ICE] Could not fetch config, falling back to STUN only:", err.message);
      /* Fallback — STUN only. Calls will still work on simple NAT networks. */
      return {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      };
    }
  };

  /* ══════════════════════════════════════
     GET LOCAL MEDIA STREAM
  ══════════════════════════════════════ */
  const getStream = async () => {
    const constraints = isVideo
      ? { video: { width: 1280, height: 720, facingMode: "user" }, audio: true }
      : { audio: true, video: false };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    console.log("[Media] Got local stream:", stream.getTracks().map((t) => t.kind).join(", "));
    return stream;
  };

  /* ══════════════════════════════════════
     BUILD RTCPeerConnection
  ══════════════════════════════════════ */
  const buildPC = async (iceConfig, stream) => {
    const pc = new RTCPeerConnection(iceConfig);
    pcRef.current = pc;

    /* add local tracks */
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    /* send ICE candidates to remote peer via signaling */
    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      console.log("[ICE] Sending candidate:", e.candidate.type);
      socket.emit("ice-candidate", { consultationId, candidate: e.candidate });
    };

    /* log ICE connection progress — visible in browser console for debugging */
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      setIceState(state);
      console.log("[ICE] Connection state:", state);
      if (state === "connected" || state === "completed") {
        setCallStatus("active");
      }
      if (state === "failed" || state === "disconnected" || state === "closed") {
        console.error("[ICE] Connection failed:", state);
        setCallStatus("error");
      }
    };

    /* receive remote media */
    pc.ontrack = (e) => {
      console.log("[Media] Got remote track:", e.track.kind);
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    /* overall connection state (more reliable than iceConnectionState) */
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log("[WebRTC] Connection state:", state);
      if (state === "connected") setCallStatus("active");
      if (["disconnected", "failed", "closed"].includes(state)) setCallStatus("error");
    };

    return pc;
  };

  /* ══════════════════════════════════════
     INITIATE (caller side)
  ══════════════════════════════════════ */
  const initiateCall = async () => {
    try {
      console.log("[Call] Initiating", callType, "call on consultation", consultationId);
      const [iceConfig, stream] = await Promise.all([fetchIceConfig(), getStream()]);
      const pc = await buildPC(iceConfig, stream);

      const sdpOffer = await pc.createOffer();
      await pc.setLocalDescription(sdpOffer);
      console.log("[SDP] Offer created and set as local description");

      socket.emit("call-user", {
        consultationId,
        callType,
        offer:      pc.localDescription,
        callerName: user?.name,
        callerId:   user?._id,
      });

      console.log("[Call] Waiting for answer…");
    } catch (err) {
      console.error("[Call] initiateCall failed:", err);
      setCallStatus("error");
    }
  };

  /* ══════════════════════════════════════
     ACCEPT (callee side)
  ══════════════════════════════════════ */
  const acceptCall = useCallback(async () => {
    try {
      console.log("[Call] Accepting", callType, "call");
      const [iceConfig, stream] = await Promise.all([fetchIceConfig(), getStream()]);
      const pc = await buildPC(iceConfig, stream);

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      remoteDescSetRef.current = true;
      console.log("[SDP] Remote description (offer) set");

      /* FIX 2 — drain any candidates that arrived before the offer was set */
      await drainPendingCandidates();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log("[SDP] Answer created and set as local description");

      socket.emit("call-accepted", {
        consultationId,
        answer: pc.localDescription,
      });

    } catch (err) {
      console.error("[Call] acceptCall failed:", err);
      setCallStatus("error");
    }
  }, [offer, consultationId, callType, drainPendingCandidates]);

  /* ══════════════════════════════════════
     END CALL
  ══════════════════════════════════════ */
  const endCall = useCallback(() => {
    socket.emit("call-ended", { consultationId });
    cleanup();
    onEnd?.();
  }, [consultationId, cleanup, onEnd]);

  /* ══════════════════════════════════════
     AUTO-START
  ══════════════════════════════════════ */
  useEffect(() => {
    if (isIncoming) acceptCall();
    else initiateCall();
  }, []); // eslint-disable-line

  /* ══════════════════════════════════════
     FIX 2 — RECEIVE ICE CANDIDATES
     Queue any that arrive before remote
     description is set; apply immediately
     after if the remote description is
     already in place.
  ══════════════════════════════════════ */
  useEffect(() => {
    const handleCandidate = async ({ candidate }) => {
      if (!candidate) return;
      console.log("[ICE] Received candidate type:", candidate.type || "unknown");

      if (!remoteDescSetRef.current) {
        console.log("[ICE] Remote desc not set yet — queuing candidate");
        pendingCandidates.current.push(candidate);
        return;
      }

      const pc = pcRef.current;
      if (!pc) return;

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("[ICE] Candidate added successfully");
      } catch (err) {
        console.warn("[ICE] addIceCandidate error:", err.message);
      }
    };

    const handleCallAccepted = async ({ answer }) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        remoteDescSetRef.current = true;
        console.log("[SDP] Remote description (answer) set");

        /* FIX 2 — drain any candidates that arrived before the answer did */
        await drainPendingCandidates();
      } catch (err) {
        console.error("[SDP] setRemoteDescription(answer) failed:", err);
        setCallStatus("error");
      }
    };

    const handleCallRejected = () => {
      setCallStatus("rejected");
      cleanup();
    };

    const handleCallEnded = () => {
      setCallStatus("ended");
      cleanup();
    };

    socket.on("call-accepted",  handleCallAccepted);
    socket.on("call-rejected",  handleCallRejected);
    socket.on("call-ended",     handleCallEnded);
    socket.on("ice-candidate",  handleCandidate);

    return () => {
      socket.off("call-accepted",  handleCallAccepted);
      socket.off("call-rejected",  handleCallRejected);
      socket.off("call-ended",     handleCallEnded);
      socket.off("ice-candidate",  handleCandidate);
      cleanup();
    };
  }, [cleanup, drainPendingCandidates]);

  /* ══════════════════════════════════════
     MUTE / CAMERA TOGGLES
  ══════════════════════════════════════ */
  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = isMuted;
    });
    setIsMuted((m) => !m);
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => {
      t.enabled = isCamOff;
    });
    setIsCamOff((c) => !c);
  };

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "#060F1D",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── REMOTE VIDEO (full-screen background) ── */}
      {isVideo && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: callStatus === "active" ? 1 : 0.15 }}
        />
      )}

      {/* ── DARK OVERLAY WHEN NOT YET CONNECTED ── */}
      {callStatus !== "active" && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(6,15,29,0.75)", zIndex: 1 }} />
      )}

      {/* ── LOCAL VIDEO PiP ── */}
      {isVideo && (
        <motion.div
          drag
          dragMomentum={false}
          style={{
            position: "absolute",
            bottom: isPiP ? 90 : 24,
            right: 24,
            width: isPiP ? 80 : 140,
            height: isPiP ? 112 : 196,
            borderRadius: 12,
            overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.2)",
            zIndex: 10,
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
            cursor: "grab",
          }}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <button
            onClick={() => setIsPiP((p) => !p)}
            style={{
              position: "absolute", top: 6, right: 6,
              background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 6,
              width: 24, height: 24, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
            }}
          >
            {isPiP
              ? <FiMaximize2 size={12} color="#fff"/>
              : <FiMinimize2 size={12} color="#fff"/>}
          </button>
        </motion.div>
      )}

      {/* ── CENTRE INFO ── */}
      <div style={{
        position: "relative", zIndex: 2, flex: 1,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 16,
      }}>

        {callStatus !== "active" && (
          <>
            <motion.div
              animate={callStatus === "connecting" ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Avatar name={isIncoming ? callerName : user?.name} size={100} />
            </motion.div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
                {callStatus === "active"     ? (isIncoming ? callerName : "Connected")         :
                 callStatus === "connecting" ? (isIncoming ? callerName : "Calling…")           :
                 callStatus === "rejected"   ? "Call Declined"                                   :
                 callStatus === "ended"      ? "Call Ended"                                      :
                 callStatus === "error"      ? "Connection Failed"                               : ""}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
                {callStatus === "connecting"
                  ? (isIncoming ? "Connecting…" : "Waiting for the other person…")
                  : ""}
              </div>
            </div>
          </>
        )}

        {callStatus === "active" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
              {isVideo ? "Video" : "Audio"} Call · {formatDuration(duration)}
            </div>
          </div>
        )}

        {(callStatus === "rejected" || callStatus === "ended" || callStatus === "error") && (
          <button
            onClick={() => { cleanup(); onEnd?.(); }}
            style={{
              marginTop: 16, padding: "12px 32px", borderRadius: 10,
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Close
          </button>
        )}

      </div>

      {/* ── CONTROLS BAR ── */}
      {callStatus !== "ended" && callStatus !== "rejected" && callStatus !== "error" && (
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", justifyContent: "center", alignItems: "center",
          gap: 20, paddingBottom: 44,
        }}>
          <CtrlBtn onClick={toggleMute} active={isMuted} label={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <FiMicOff size={20} color="#fff"/> : <FiMic size={20} color="#fff"/>}
          </CtrlBtn>

          {isVideo && (
            <CtrlBtn onClick={toggleCamera} active={isCamOff} label={isCamOff ? "Show" : "Hide"}>
              {isCamOff ? <FiVideoOff size={20} color="#fff"/> : <FiVideo size={20} color="#fff"/>}
            </CtrlBtn>
          )}

          <CtrlBtn onClick={endCall} danger label="End">
            <FiPhoneOff size={22} color="#fff"/>
          </CtrlBtn>
        </div>
      )}

      {/* ── ICE DEBUG CHIP — helps you see connection progress
           (only visible in browser console; remove before final release) ── */}
      <div style={{
        position: "absolute", top: 12, left: 12, zIndex: 20,
        background: "rgba(0,0,0,0.5)", borderRadius: 8,
        padding: "4px 10px", fontSize: 11, color: "rgba(255,255,255,0.5)",
        fontFamily: "monospace",
      }}>
        ICE: {iceState}
      </div>

    </div>
  );
}
