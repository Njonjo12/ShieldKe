import { useState, useRef } from "react";

/*
========================================
SHIELDKE WEBRTC CALL DIAGNOSTIC (v2)

Tests the SAME ICE_CONFIG that CallWindow.jsx
actually uses (hardcoded TURN, no backend
dependency) — so this diagnostic now reflects
exactly what real calls will experience.

Route: /call-diagnostic (temporary, remove
before final release)
========================================
*/

/* identical to the config in CallWindow.jsx */
const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302"  },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:openrelay.metered.ca:80"  },
    { urls: "turn:openrelay.metered.ca:80",                    username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turn:openrelay.metered.ca:443",                   username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turn:openrelay.metered.ca:443?transport=tcp",      username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turns:openrelay.metered.ca:443?transport=tcp",     username: "openrelayproject", credential: "openrelayproject" },
  ],
};

const STAGES = [
  "Camera/Mic access",
  "RTCPeerConnection creates",
  "ICE candidates generated",
  "TURN reachable (relay candidate)",
];

const STATUS = { idle: "idle", running: "running", pass: "pass", fail: "fail", warn: "warn" };

const DOT = {
  idle:    { bg: "#1E293B", color: "#64748B", label: "—" },
  running: { bg: "#1E3A5F", color: "#60A5FA", label: "…" },
  pass:    { bg: "#052E16", color: "#4ADE80", label: "✓" },
  fail:    { bg: "#3B0A0A", color: "#F87171", label: "✗" },
  warn:    { bg: "#422006", color: "#FBBF24", label: "!" },
};

export default function CallDiagnostic() {
  const [results, setResults] = useState(
    STAGES.map((label) => ({ label, status: STATUS.idle, detail: "" }))
  );
  const [running, setRunning] = useState(false);
  const [candidateLog, setCandidateLog] = useState([]);
  const pcRef = useRef(null);

  const setStage   = (i, status, detail = "") =>
    setResults((prev) => prev.map((r, idx) => (idx === i ? { ...r, status, detail } : r)));
  const markRunning = (i)    => setStage(i, STATUS.running);
  const markPass    = (i, d) => setStage(i, STATUS.pass, d);
  const markFail    = (i, d) => setStage(i, STATUS.fail, d);
  const markWarn    = (i, d) => setStage(i, STATUS.warn, d);

  const runDiagnostics = async () => {
    setRunning(true);
    setCandidateLog([]);
    setResults(STAGES.map((label) => ({ label, status: STATUS.idle, detail: "" })));
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }

    /* STAGE 0 — Camera/Mic */
    markRunning(0);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      markPass(0, `Tracks: ${stream.getTracks().map((t) => t.kind).join(", ")}`);
    } catch (err) {
      if (err.name === "NotFoundError") {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          markWarn(0, "Audio only — no camera detected");
        } catch (e2) {
          markFail(0, `${e2.name}: ${e2.message}`);
          setRunning(false); return;
        }
      } else {
        markFail(0, `${err.name}: ${err.message}`);
        setRunning(false); return;
      }
    }

    /* STAGE 1 — RTCPeerConnection */
    markRunning(1);
    let pc;
    try {
      pc = new RTCPeerConnection(ICE_CONFIG);
      pcRef.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      markPass(1, "Created with hardcoded ICE_CONFIG (same as CallWindow.jsx)");
    } catch (err) {
      markFail(1, err.message);
      stream.getTracks().forEach((t) => t.stop());
      setRunning(false); return;
    }

    /* STAGE 2 + 3 — candidates + relay */
    markRunning(2);
    markRunning(3);
    const seen = [];
    let s2 = false, s3 = false;

    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (!s2) markFail(2, "No candidates after 10s — WebRTC may be blocked on this network");
        if (!s3) markFail(3, "No relay candidate — TURN unreachable from this network/browser");
        resolve();
      }, 10000);

      pc.onicecandidate = (e) => {
        if (!e.candidate) {
          clearTimeout(timeout);
          if (!s2) markPass(2, `${seen.length} total candidate(s)`);
          if (!s3) markFail(3, `Gathering finished, ${seen.length} candidates, none were relay — TURN unreachable`);
          resolve();
          return;
        }
        const { type, protocol, address } = e.candidate;
        const entry = `${type} / ${protocol} / ${address || "?"}`;
        seen.push(entry);
        setCandidateLog((prev) => [...prev, entry]);

        if (!s2) { s2 = true; markPass(2, `First: ${entry}`); }
        if (!s3 && type === "relay") { s3 = true; markPass(3, `Relay via TURN: ${entry}`); }
      };

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") {
          clearTimeout(timeout);
          if (!s2) markPass(2, `${seen.length} candidate(s)`);
          if (!s3) markFail(3, "Gathering complete, no relay candidate — TURN unreachable");
          resolve();
        }
      };

      pc.createOffer()
        .then((o) => pc.setLocalDescription(o))
        .catch((err) => {
          clearTimeout(timeout);
          markFail(2, `createOffer failed: ${err.message}`);
          markFail(3, "Cannot gather — offer creation failed");
          resolve();
        });
    });

    pc.close();
    stream.getTracks().forEach((t) => t.stop());
    pcRef.current = null;
    setRunning(false);
  };

  const overall = results.some((r) => r.status === STATUS.fail) ? "fail"
                : results.some((r) => r.status === STATUS.running) ? "running"
                : results.every((r) => [STATUS.pass, STATUS.warn].includes(r.status)) ? "pass"
                : "idle";

  return (
    <div style={{ minHeight: "100vh", background: "#0B1F3A", fontFamily: "'Inter', system-ui, sans-serif", padding: "40px 20px", color: "#fff" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#00A86B", marginBottom: 10 }}>
            SHIELDKE WEBRTC DIAGNOSTIC · V2
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            TURN Connectivity Test
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 10, lineHeight: 1.7 }}>
            Tests the exact same hardcoded ICE config that CallWindow.jsx uses — no backend
            call involved. Run on both the caller's and callee's device/network.
          </p>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={running}
          style={{
            width: "100%", padding: "14px", borderRadius: 12,
            background: running ? "#1E293B" : "linear-gradient(135deg,#006B3F,#00A86B)",
            border: "none", color: running ? "rgba(255,255,255,0.4)" : "#fff",
            fontSize: 15, fontWeight: 700, cursor: running ? "not-allowed" : "pointer",
            fontFamily: "inherit", marginBottom: 28,
          }}
        >
          {running ? "Running…" : "Run Diagnostics"}
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {results.map((r, i) => {
            const d = DOT[r.status];
            return (
              <div key={i} style={{
                background: d.bg, borderRadius: 12, padding: "14px 18px",
                display: "flex", alignItems: "flex-start", gap: 14,
                border: `1px solid ${r.status === STATUS.fail ? "rgba(248,113,113,0.2)" : r.status === STATUS.pass ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.06)"}`,
              }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 800, color: d.color }}>
                  {d.label}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
                    Stage {i + 1} — {r.label}
                  </div>
                  {r.detail && (
                    <div style={{ fontSize: 12, color: d.color, lineHeight: 1.5, fontFamily: "monospace", wordBreak: "break-word" }}>
                      {r.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {candidateLog.length > 0 && (
          <div style={{ background: "#060F1D", borderRadius: 12, padding: "16px 18px", marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748B", marginBottom: 10 }}>
              ICE CANDIDATES ({candidateLog.length})
            </div>
            {candidateLog.map((c, i) => (
              <div key={i} style={{ fontSize: 12, fontFamily: "monospace", color: c.includes("relay") ? "#4ADE80" : "rgba(255,255,255,0.45)", padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {i + 1}. {c}
                {c.includes("relay") && <span style={{ marginLeft: 8, color: "#4ADE80", fontWeight: 700 }}>← TURN relay ✓</span>}
              </div>
            ))}
          </div>
        )}

        {!running && overall !== "idle" && (
          <div style={{
            background: overall === "pass" ? "rgba(74,222,128,0.06)" : "rgba(248,113,113,0.06)",
            border: `1px solid ${overall === "pass" ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
            borderRadius: 12, padding: "18px 20px",
          }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, color: overall === "pass" ? "#4ADE80" : "#F87171" }}>
              {overall === "pass" ? "✓ TURN is reachable — calls should connect" : "✗ See failed stage above"}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
              {results[0]?.status === STATUS.fail &&
                "→ Camera/mic blocked. Check browser site permissions."}
              {results[3]?.status === STATUS.fail && results[0]?.status !== STATUS.fail &&
                "→ TURN unreachable on this network. The free Metered relay may be blocked, rate-limited, or down. Next step: try a different network (mobile data vs WiFi) to isolate whether it's network-specific, or we switch to a paid TURN provider (Metered paid tier or Twilio NTS)."}
              {overall === "pass" &&
                "Run this on the OTHER device too. If both pass but calls still don't connect, the issue is in the signaling exchange (offer/answer/candidates not reaching each other via socket), not WebRTC itself."}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
