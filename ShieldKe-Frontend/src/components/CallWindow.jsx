import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import socket from "../socket";
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff,
  FiPhoneOff, FiMaximize2, FiMinimize2,
} from "react-icons/fi";

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.relay.metered.ca:80" },
    {
      urls:       "turn:standard.relay.metered.ca:80",
      username:   "874b43ab517f8dac22e9aa57",
      credential: "ARRbELPLdkPLAb3A",
    },
    {
      urls:       "turn:standard.relay.metered.ca:80?transport=tcp",
      username:   "874b43ab517f8dac22e9aa57",
      credential: "ARRbELPLdkPLAb3A",
    },
    {
      urls:       "turn:standard.relay.metered.ca:443",
      username:   "874b43ab517f8dac22e9aa57",
      credential: "ARRbELPLdkPLAb3A",
    },
    {
      urls:       "turns:standard.relay.metered.ca:443?transport=tcp",
      username:   "874b43ab517f8dac22e9aa57",
      credential: "ARRbELPLdkPLAb3A",
    },
  ],
};

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Avatar({ name, size = 90 }) {
  const initials = (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "rgba(0,168,107,0.15)", border: "2px solid rgba(0,168,107,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 800, color: "#00A86B",
      fontFamily: "inherit", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function CtrlBtn({ onClick, active, danger, label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
        onClick={onClick} title={label}
        style={{
          width: 54, height: 54, borderRadius: "50%", border: "none",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          background: danger ? "rgba(239,68,68,0.85)" : active ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.12)",
        }}
      >
        {children}
      </motion.button>
      {label && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{label}</div>}
    </div>
  );
}

export default function CallWindow({ consultationId, callType, isIncoming, offer, callerName, onEnd }) {

  const pcRef          = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteDescSet  = useRef(false);
  const pendingICE     = useRef([]);

  const [callStatus, setCallStatus] = useState("connecting");
  const [isMuted,    setIsMuted]    = useState(false);
  const [isCamOff,   setIsCamOff]   = useState(false);
  const [isPiP,      setIsPiP]      = useState(false);
  const [duration,   setDuration]   = useState(0);
  const [iceState,   setIceState]   = useState("new");

  const isVideo = callType === "video";
  const user    = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (callStatus !== "active") return;
    const t = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, [callStatus]);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    remoteDescSet.current  = false;
    pendingICE.current     = [];
  }, []);

  const drainICE = useCallback(async () => {
    const pc     = pcRef.current;
    const queued = pendingICE.current.splice(0);
    for (const c of queued) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); }
      catch (e) { console.warn("[ICE] queued candidate failed:", e.message); }
    }
    if (queued.length) console.log("[ICE] drained", queued.length, "queued candidate(s)");
  }, []);

  const getStream = async () => {
    const constraints = isVideo
      ? { audio: true, video: { width: 1280, height: 720, facingMode: "user" } }
      : { audio: true, video: false };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const buildPC = useCallback((stream) => {
    const pc = new RTCPeerConnection(ICE_CONFIG);
    pcRef.current = pc;

    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    pc.onicecandidate = ({ candidate }) => {
      if (!candidate) return;
      console.log("[ICE] sending", candidate.type);
      socket.emit("ice-candidate", { consultationId, candidate });
    };

    pc.oniceconnectionstatechange = () => {
      const s = pc.iceConnectionState;
      setIceState(s);
      console.log("[ICE] state:", s);
      if (s === "connected" || s === "completed") setCallStatus("active");
      if (s === "failed") setCallStatus("error");
    };

    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      console.log("[WebRTC] state:", s);
      if (s === "connected") setCallStatus("active");
      if (["failed","disconnected","closed"].includes(s)) setCallStatus("error");
    };

    pc.ontrack = ({ streams }) => {
      console.log("[Media] remote track received");
      if (remoteVideoRef.current && streams[0]) {
        remoteVideoRef.current.srcObject = streams[0];
      }
    };

    return pc;
  }, [consultationId]);

  const initiateCall = useCallback(async () => {
    try {
      const stream = await getStream();
      const pc     = buildPC(stream);
      const offer  = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("call-user", {
        consultationId, callType,
        offer:      pc.localDescription,
        callerName: user?.name,
        callerId:   user?._id,
      });
      console.log("[Call] offer sent");
    } catch (err) {
      console.error("[Call] initiateCall error:", err);
      setCallStatus("error");
    }
  }, [buildPC, consultationId, callType, user]);

  const acceptCall = useCallback(async () => {
    try {
      const stream = await getStream();
      const pc     = buildPC(stream);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      remoteDescSet.current = true;
      await drainICE();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("call-accepted", { consultationId, answer: pc.localDescription });
      console.log("[Call] answer sent");
    } catch (err) {
      console.error("[Call] acceptCall error:", err);
      setCallStatus("error");
    }
  }, [buildPC, offer, consultationId, drainICE]);

  const endCall = useCallback(() => {
    socket.emit("call-ended", { consultationId });
    cleanup();
    onEnd?.();
  }, [consultationId, cleanup, onEnd]);

  useEffect(() => {
    if (isIncoming) acceptCall();
    else            initiateCall();
  }, []); // eslint-disable-line

  useEffect(() => {
    const onAccepted = async ({ answer }) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        remoteDescSet.current = true;
        console.log("[SDP] remote answer set");
        await drainICE();
      } catch (err) {
        console.error("[SDP] setRemoteDescription failed:", err);
        setCallStatus("error");
      }
    };

    const onCandidate = async ({ candidate }) => {
      if (!candidate) return;
      if (!remoteDescSet.current || !pcRef.current) {
        pendingICE.current.push(candidate);
        return;
      }
      try { await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch (err) { console.warn("[ICE] addIceCandidate failed:", err.message); }
    };

    socket.on("call-accepted", onAccepted);
    socket.on("call-rejected", () => { setCallStatus("rejected"); cleanup(); });
    socket.on("call-ended",    () => { setCallStatus("ended");    cleanup(); });
    socket.on("ice-candidate", onCandidate);

    return () => {
      socket.off("call-accepted");
      socket.off("call-rejected");
      socket.off("call-ended");
      socket.off("ice-candidate");
      cleanup();
    };
  }, [cleanup, drainICE]);

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = isMuted; });
    setIsMuted((m) => !m);
  };
  const toggleCamera = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = isCamOff; });
    setIsCamOff((c) => !c);
  };

  const isEnded = ["ended","rejected","error"].includes(callStatus);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000, background: "#060F1D",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {isVideo && (
        <video ref={remoteVideoRef} autoPlay playsInline style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", opacity: callStatus === "active" ? 1 : 0.15,
          transition: "opacity 0.4s",
        }} />
      )}

      {callStatus !== "active" && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(6,15,29,0.8)", zIndex: 1 }} />
      )}

      {isVideo && (
        <motion.div drag dragMomentum={false} style={{
          position: "absolute", bottom: isPiP ? 90 : 24, right: 24,
          width: isPiP ? 80 : 140, height: isPiP ? 110 : 196,
          borderRadius: 12, overflow: "hidden",
          border: "2px solid rgba(255,255,255,0.2)",
          zIndex: 10, boxShadow: "0 4px 24px rgba(0,0,0,0.5)", cursor: "grab",
        }}>
          <video ref={localVideoRef} autoPlay playsInline muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <button onClick={() => setIsPiP((p) => !p)} style={{
            position: "absolute", top: 6, right: 6,
            background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 6,
            width: 24, height: 24, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer",
          }}>
            {isPiP ? <FiMaximize2 size={12} color="#fff" /> : <FiMinimize2 size={12} color="#fff" />}
          </button>
        </motion.div>
      )}

      <div style={{
        position: "relative", zIndex: 2, flex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 18, padding: "0 24px",
      }}>
        {callStatus !== "active" && (
          <>
            <motion.div
              animate={callStatus === "connecting" ? { scale: [1, 1.07, 1] } : {}}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              <Avatar name={isIncoming ? callerName : user?.name} />
            </motion.div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
                {callStatus === "connecting" && (isIncoming ? callerName : "Calling...")}
                {callStatus === "rejected"   && "Call Declined"}
                {callStatus === "ended"      && "Call Ended"}
                {callStatus === "error"      && "Connection Failed"}
              </div>
              {callStatus === "connecting" && (
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
                  {isIncoming ? "Connecting..." : "Waiting for the other person..."}
                </div>
              )}
              {callStatus === "error" && (
                <div style={{ fontSize: 13, color: "rgba(248,113,113,0.7)", maxWidth: 300 }}>
                  Could not establish a media connection. Check camera/mic permissions and try again.
                </div>
              )}
            </div>
            {isEnded && (
              <button onClick={() => { cleanup(); onEnd?.(); }} style={{
                marginTop: 8, padding: "11px 28px", borderRadius: 10,
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff", fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}>Close</button>
            )}
          </>
        )}
        {callStatus === "active" && (
          <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>
            {isVideo ? "Video" : "Audio"} Call  {fmt(duration)}
          </div>
        )}
      </div>

      {!isEnded && (
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", justifyContent: "center", alignItems: "center",
          gap: 22, paddingBottom: 48,
        }}>
          <CtrlBtn onClick={toggleMute} active={isMuted} label={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <FiMicOff size={20} color="#fff" /> : <FiMic size={20} color="#fff" />}
          </CtrlBtn>
          {isVideo && (
            <CtrlBtn onClick={toggleCamera} active={isCamOff} label={isCamOff ? "Show" : "Hide"}>
              {isCamOff ? <FiVideoOff size={20} color="#fff" /> : <FiVideo size={20} color="#fff" />}
            </CtrlBtn>
          )}
          <CtrlBtn onClick={endCall} danger label="End">
            <FiPhoneOff size={22} color="#fff" />
          </CtrlBtn>
        </div>
      )}

      <div style={{
        position: "absolute", top: 12, left: 12, zIndex: 20,
        background: "rgba(0,0,0,0.45)", borderRadius: 8,
        padding: "4px 10px", fontSize: 11, fontFamily: "monospace",
        color: ["connected","completed"].includes(iceState) ? "#4ADE80"
             : iceState === "failed" ? "#F87171" : "rgba(255,255,255,0.4)",
      }}>
        ICE: {iceState}
      </div>

    </div>
  );
}
