import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../socket";
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff,
  FiPhoneOff, FiMaximize2, FiMinimize2, FiPhone,
} from "react-icons/fi";

/* ─── STUN servers (Google's free public servers) ─── */
const STUN_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

/* ─── helpers ─── */
function formatDuration(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function Avatar({ name, size = 80 }) {
  const initials = (name || "?")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg,#006B3F,#00A86B)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 900, color: "#fff",
      flexShrink: 0, border: "3px solid rgba(255,255,255,0.15)",
    }}>
      {initials}
    </div>
  );
}

/* ─── control button ─── */
function CtrlBtn({ onClick, active, danger, children, label }) {
  const [hover, setHover] = useState(false);
  const bg = danger
    ? (hover ? "#DC2626" : "#EF4444")
    : active
      ? (hover ? "#1D4ED8" : "#3B82F6")
      : (hover ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.1)");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: 56, height: 56, borderRadius: "50%",
          background: bg, border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.18s",
          transform: hover ? "scale(1.08)" : "scale(1)",
          boxShadow: danger ? "0 4px 16px rgba(239,68,68,0.4)" : "none",
        }}
      >
        {children}
      </button>
      {label && (
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.02em" }}>
          {label}
        </span>
      )}
    </div>
  );
}

export default function CallWindow({
  consultationId,
  callType,
  isIncoming,
  offer,
  callerName,
  onEnd,
}) {

  const [callStatus,  setCallStatus]  = useState(isIncoming ? "incoming" : "connecting");
  const [isMuted,     setIsMuted]     = useState(false);
  const [isCamOff,    setIsCamOff]    = useState(false);
  const [duration,    setDuration]    = useState(0);
  const [fullscreen,  setFullscreen]  = useState(false);

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef          = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef       = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  /* ══════════════════════════════════════
     TIMER
  ══════════════════════════════════════ */
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
  };

  /* ══════════════════════════════════════
     CLEANUP — stops media + closes PC
  ══════════════════════════════════════ */
  const cleanup = useCallback(() => {
    clearInterval(timerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    socket.off("call-accepted");
    socket.off("call-rejected");
    socket.off("call-ended");
    socket.off("ice-candidate");
  }, []);

  /* ══════════════════════════════════════
     END CALL
  ══════════════════════════════════════ */
  const endCall = useCallback((emit = true) => {
    if (emit) socket.emit("call-ended", { consultationId });
    cleanup();
    setCallStatus("ended");
    setTimeout(() => onEnd(), 900);
  }, [consultationId, cleanup, onEnd]);

  /* ══════════════════════════════════════
     GET LOCAL MEDIA
  ══════════════════════════════════════ */
  const getLocalMedia = async () => {
    const constraints = callType === "video"
      ? { video: { width: 1280, height: 720, facingMode: "user" }, audio: true }
      : { video: false, audio: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  };

  /* ══════════════════════════════════════
     BUILD RTCPeerConnection
  ══════════════════════════════════════ */
  const buildPC = (stream) => {
    const pc = new RTCPeerConnection(STUN_CONFIG);
    pcRef.current = pc;

    /* add all local tracks */
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    /* send ICE candidates to the other peer via socket */
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { consultationId, candidate: e.candidate });
      }
    };

    /* receive remote media */
    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    /* connection state transitions */
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setCallStatus("active");
        startTimer();
      }
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        endCall(false);
      }
    };

    return pc;
  };

  /* ══════════════════════════════════════
     INITIATE CALL (caller side)
  ══════════════════════════════════════ */
  const initiateCall = async () => {
    try {
      const stream = await getLocalMedia();
      const pc     = buildPC(stream);
      const sdpOffer = await pc.createOffer();
      await pc.setLocalDescription(sdpOffer);

      socket.emit("call-user", {
        consultationId,
        callType,
        offer:      pc.localDescription,
        callerName: user?.name,
      });

      /* callee accepted → set remote desc */
      socket.on("call-accepted", async ({ answer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      /* callee rejected */
      socket.on("call-rejected", () => {
        setCallStatus("rejected");
        setTimeout(() => endCall(false), 1600);
      });

    } catch (err) {
      console.error("Call error:", err);
      setCallStatus("error");
    }
  };

  /* ══════════════════════════════════════
     ACCEPT CALL (callee side)
  ══════════════════════════════════════ */
  const acceptCall = async () => {
    try {
      setCallStatus("connecting");
      const stream   = await getLocalMedia();
      const pc       = buildPC(stream);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer   = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("call-accepted", { consultationId, answer: pc.localDescription });
    } catch (err) {
      console.error("Accept error:", err);
      setCallStatus("error");
    }
  };

  /* ══════════════════════════════════════
     REJECT CALL (callee side)
  ══════════════════════════════════════ */
  const rejectCall = () => {
    socket.emit("call-rejected", { consultationId });
    onEnd();
  };

  /* ══════════════════════════════════════
     ICE + CALL-ENDED (both sides)
  ══════════════════════════════════════ */
  useEffect(() => {
    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        if (pcRef.current && candidate) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("ICE add error:", err);
      }
    });

    socket.on("call-ended", () => endCall(false));

    return () => { cleanup(); };
  }, [endCall, cleanup]);

  /* ══════════════════════════════════════
     AUTO-INITIATE (outgoing call)
  ══════════════════════════════════════ */
  useEffect(() => {
    if (!isIncoming) initiateCall();
  }, []); // eslint-disable-line

  /* ══════════════════════════════════════
     TOGGLE MUTE / CAMERA
  ══════════════════════════════════════ */
  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMuted(m => !m);
  };

  const toggleCamera = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsCamOff(c => !c);
  };

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  const isVideo = callType === "video";
  const remoteName = isIncoming ? callerName : "Connecting…";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(6,15,29,0.96)",
        backdropFilter: "blur(24px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >

      {/* ── CALL CARD ── */}
      <div style={{
        width: fullscreen ? "100vw" : "min(900px, 94vw)",
        height: fullscreen ? "100vh" : "min(580px, 92vh)",
        background: "#0B1F3A",
        borderRadius: fullscreen ? 0 : 24,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>

        {/* ══ REMOTE VIDEO / AUDIO AVATAR ══ */}
        <div style={{ flex: 1, position: "relative", background: "#060F1D", overflow: "hidden" }}>

          {/* Remote video (hidden for audio calls) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              display: isVideo ? "block" : "none",
            }}
          />

          {/* Audio-only / waiting overlay */}
          {(!isVideo || callStatus !== "active") && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: "linear-gradient(160deg,#0B1F3A,#060F1D)",
              gap: 20,
            }}>
              {/* Pulse rings */}
              {(callStatus === "active" || callStatus === "connecting") && (
                <div style={{ position: "relative", marginBottom: 8 }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i}
                      animate={{ scale: [1, 1.8 + i * 0.4], opacity: [0.3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
                      style={{
                        position: "absolute",
                        inset: -(i + 1) * 20,
                        borderRadius: "50%",
                        border: "2px solid #00A86B",
                        pointerEvents: "none",
                      }}
                    />
                  ))}
                  <Avatar name={isIncoming ? callerName : user?.name} size={100} />
                </div>
              )}

              {/* Incoming call avatar */}
              {callStatus === "incoming" && (
                <motion.div
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                >
                  <Avatar name={callerName} size={100} />
                </motion.div>
              )}

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
                  {callStatus === "incoming"   ? callerName   :
                   callStatus === "active"     ? (isIncoming ? callerName : "Connected") :
                   callStatus === "connecting" ? "Calling…"  :
                   callStatus === "rejected"   ? "Call Declined" :
                   callStatus === "ended"      ? "Call Ended"    :
                   callStatus === "error"      ? "Connection Failed" : ""}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
                  {callStatus === "active"
                    ? `${isVideo ? "Video" : "Audio"} Call · ${formatDuration(duration)}`
                    : callStatus === "incoming"
                      ? `Incoming ${isVideo ? "video" : "audio"} call`
                      : callStatus === "connecting"
                        ? "Waiting for the other person…"
                        : ""}
                </div>
              </div>
            </div>
          )}

          {/* ── LOCAL VIDEO (picture-in-picture) ── */}
          {isVideo && callStatus === "active" && (
            <motion.div
              drag dragConstraints={{ left: -600, right: 0, top: -400, bottom: 0 }}
              style={{
                position: "absolute", bottom: 20, right: 20,
                width: 160, height: 100, borderRadius: 12,
                overflow: "hidden", border: "2px solid rgba(255,255,255,0.2)",
                cursor: "grab", boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                zIndex: 10,
              }}
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover",
                  filter: isCamOff ? "brightness(0)" : "none" }}
              />
              {isCamOff && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#0B1F3A" }}>
                  <FiVideoOff size={20} color="rgba(255,255,255,0.4)" />
                </div>
              )}
            </motion.div>
          )}

          {/* ── FULLSCREEN TOGGLE ── */}
          <button
            onClick={() => setFullscreen(f => !f)}
            style={{
              position: "absolute", top: 16, right: 16,
              width: 36, height: 36, borderRadius: 8,
              background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
            }}
          >
            {fullscreen ? <FiMinimize2 size={15}/> : <FiMaximize2 size={15}/>}
          </button>

          {/* ── CALL DURATION (top left, active only) ── */}
          {callStatus === "active" && (
            <div style={{
              position: "absolute", top: 16, left: 16,
              padding: "6px 14px", borderRadius: 999,
              background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", gap: 7,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                {formatDuration(duration)}
              </span>
            </div>
          )}

        </div>

        {/* ══ CONTROLS BAR ══ */}
        <div style={{
          height: 100,
          background: "#0B1F3A",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          flexShrink: 0,
        }}>

          {/* INCOMING CALL — accept / reject */}
          {callStatus === "incoming" && (
            <>
              <CtrlBtn onClick={rejectCall} danger label="Decline">
                <FiPhoneOff size={22} color="#fff" />
              </CtrlBtn>
              <CtrlBtn onClick={acceptCall} active label="Accept">
                <FiPhone size={22} color="#fff" />
              </CtrlBtn>
            </>
          )}

          {/* ACTIVE / CONNECTING CALL */}
          {callStatus !== "incoming" && callStatus !== "ended" && callStatus !== "rejected" && callStatus !== "error" && (
            <>
              {/* MUTE */}
              <CtrlBtn onClick={toggleMute} active={isMuted} label={isMuted ? "Unmute" : "Mute"}>
                {isMuted
                  ? <FiMicOff size={20} color="#fff" />
                  : <FiMic    size={20} color="#fff" />}
              </CtrlBtn>

              {/* CAMERA (video only) */}
              {isVideo && (
                <CtrlBtn onClick={toggleCamera} active={isCamOff} label={isCamOff ? "Show Cam" : "Hide Cam"}>
                  {isCamOff
                    ? <FiVideoOff size={20} color="#fff" />
                    : <FiVideo    size={20} color="#fff" />}
                </CtrlBtn>
              )}

              {/* HANG UP */}
              <CtrlBtn onClick={() => endCall(true)} danger label="End Call">
                <FiPhoneOff size={22} color="#fff" />
              </CtrlBtn>
            </>
          )}

          {/* ENDED / REJECTED / ERROR */}
          {["ended","rejected","error"].includes(callStatus) && (
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 10 }}>
                {callStatus === "rejected" ? "Call was declined" :
                 callStatus === "error"    ? "Couldn't connect — check camera/mic permissions" :
                 "Call ended"}
              </div>
              <button onClick={() => onEnd()}
                style={{ padding: "10px 24px", borderRadius: 9, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Close
              </button>
            </div>
          )}

        </div>

      </div>
    </motion.div>
  );
}
