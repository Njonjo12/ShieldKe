import { useState, useRef, useEffect } from "react";
import { getToken } from "../utils/auth";

/*
========================================
SHIELDKE WEBRTC CALL DIAGNOSTIC

Temporarily add this route in App.jsx:
  import CallDiagnostic from "./pages/CallDiagnostic";
  <Route path="/call-diagnostic" element={<CallDiagnostic />} />

Then open /call-diagnostic in your browser.
Share a screenshot of the results so we can
see exactly which stage is failing.

Remove this route before final release.
========================================
*/

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STAGES = [
  "Backend reachable",
  "ICE config endpoint",
  "TURN servers in config",
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
  const [iceConfig, setIceConfig] = useState(null);
  const [candidateLog, setCandidateLog] = useState([]);
  const pcRef = useRef(null);

  const setStage = (i, status, detail = "") => {
    setResults((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, status, detail } : r))
    );
  };

  const markRunning = (i) => setStage(i, STATUS.running);
  const markPass    = (i, d) => setStage(i, STATUS.pass, d);
  const markFail    = (i, d) => setStage(i, STATUS.fail, d);
  const markWarn    = (i, d) => setStage(i, STATUS.warn, d);

  const runDiagnostics = async () => {
    setRunning(true);
    setCandidateLog([]);
    setResults(STAGES.map((label) => ({ label, status: STATUS.idle, detail: "" })));

    // clean up any previous PC
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }

    /* ─────────────────────────────────────────
       STAGE 0 — Backend reachable
    ───────────────────────────────────────── */
    markRunning(0);
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok || res.status === 401) {
        markPass(0, `HTTP ${res.status} — backend is up at ${API_URL}`);
      } else {
        markFail(0, `HTTP ${res.status} — unexpected response from backend`);
        setRunning(false); return;
      }
    } catch (err) {
      markFail(0, `Cannot reach backend at ${API_URL}: ${err.message}`);
      setRunning(false); return;
    }

    /* ─────────────────────────────────────────
       STAGE 1 — ICE config endpoint
    ───────────────────────────────────────── */
    markRunning(1);
    let cfg;
    try {
      const res = await fetch(`${API_URL}/calls/ice-config`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) {
        markFail(1, `HTTP ${res.status} — endpoint missing or not deployed yet`);
        setRunning(false); return;
      }
      cfg = await res.json();
      setIceConfig(cfg);
      markPass(1, `Received ${cfg.iceServers?.length ?? 0} ICE server entries`);
    } catch (err) {
      markFail(1, `Fetch failed: ${err.message}`);
      setRunning(false); return;
    }

    /* ─────────────────────────────────────────
       STAGE 2 — TURN servers in config
    ───────────────────────────────────────── */
    markRunning(2);
    const turnServers = (cfg.iceServers || []).filter(
      (s) => (Array.isArray(s.urls) ? s.urls.join(",") : s.urls)?.includes("turn:")
    );
    if (turnServers.length === 0) {
      markFail(2, "No TURN servers in config — only STUN. Calls will fail on mobile networks.");
    } else {
      markPass(2, `${turnServers.length} TURN server(s) configured`);
    }

    /* ─────────────────────────────────────────
       STAGE 3 — Camera/Mic access
    ───────────────────────────────────────── */
    markRunning(3);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const tracks = stream.getTracks().map((t) => t.kind);
      markPass(3, `Tracks obtained: ${tracks.join(", ")}`);
    } catch (err) {
      if (err.name === "NotAllowedError") {
        markFail(3, "Permission denied — user blocked camera/mic access");
      } else if (err.name === "NotFoundError") {
        markWarn(3, "No camera found — trying audio only");
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          markWarn(3, "Audio only — no camera detected");
        } catch (e2) {
          markFail(3, `No audio either: ${e2.message}`);
          setRunning(false); return;
        }
      } else {
        markFail(3, `${err.name}: ${err.message}`);
        setRunning(false); return;
      }
    }

    /* ─────────────────────────────────────────
       STAGE 4 — RTCPeerConnection creates
    ───────────────────────────────────────── */
    markRunning(4);
    let pc;
    try {
      pc = new RTCPeerConnection(cfg);
      pcRef.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      markPass(4, "RTCPeerConnection created successfully");
    } catch (err) {
      markFail(4, `RTCPeerConnection failed: ${err.message}`);
      stream.getTracks().forEach((t) => t.stop());
      setRunning(false); return;
    }

    /* ─────────────────────────────────────────
       STAGE 5 — ICE candidates generated
       STAGE 6 — TURN relay candidate appears
    ───────────────────────────────────────── */
    markRunning(5);
    markRunning(6);

    const candidatesSeen = [];
    let stage5Done = false;
    let stage6Done = false;

    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (!stage5Done) markFail(5, "No candidates generated after 8s — check browser WebRTC support");
        if (!stage6Done) markFail(6, "No relay candidate — TURN not reachable. Check firewall/TURN credentials.");
        resolve();
      }, 8000);

      pc.onicecandidate = (e) => {
        if (!e.candidate) {
          // gathering complete
          clearTimeout(timeout);
          if (!stage5Done) markPass(5, `${candidatesSeen.length} total candidate(s) gathered`);
          if (!stage6Done) markFail(6, `No relay candidates found in ${candidatesSeen.length} total — TURN unreachable`);
          resolve();
          return;
        }

        const { type, protocol, address } = e.candidate;
        const entry = `${type} / ${protocol} / ${address || "?"}`;
        candidatesSeen.push(entry);
        setCandidateLog((prev) => [...prev, entry]);

        if (!stage5Done && candidatesSeen.length >= 1) {
          stage5Done = true;
          markPass(5, `First candidate: ${entry}`);
        }

        if (!stage6Done && type === "relay") {
          stage6Done = true;
          markPass(6, `Relay candidate via TURN: ${entry}`);
        }
      };

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") {
          clearTimeout(timeout);
          if (!stage5Done) markPass(5, `${candidatesSeen.length} candidate(s) gathered`);
          if (!stage6Done) markFail(6, "Gathering complete but no relay candidate — TURN unreachable");
          resolve();
        }
      };

      // trigger gathering
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((err) => {
          clearTimeout(timeout);
          markFail(5, `createOffer failed: ${err.message}`);
          markFail(6, "Cannot gather candidates — offer creation failed");
          resolve();
        });
    });

    // cleanup
    pc.close();
    stream.getTracks().forEach((t) => t.stop());
    pcRef.current = null;
    setRunning(false);
  };

  const overall = results.some((r) => r.status === STATUS.fail)   ? "fail"
                : results.some((r) => r.status === STATUS.running) ? "running"
                : results.every((r) => r.status === STATUS.pass || r.status === STATUS.warn) ? "pass"
                : "idle";

  return (
    <div style={{
      minHeight: "100vh", background: "#0B1F3A",
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: "40px 20px", color: "#fff",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#00A86B", marginBottom: 10 }}>
            SHIELDKE WEBRTC DIAGNOSTIC
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            Call Connection Test
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 10, lineHeight: 1.7 }}>
            Tests every stage of WebRTC call setup in sequence and shows exactly which step is failing.
            Run this on both devices (caller + callee) and compare results.
          </p>
        </div>

        {/* RUN BUTTON */}
        <button
          onClick={runDiagnostics}
          disabled={running}
          style={{
            width: "100%", padding: "14px", borderRadius: 12,
            background: running ? "#1E293B" : "linear-gradient(135deg,#006B3F,#00A86B)",
            border: "none", color: running ? "rgba(255,255,255,0.4)" : "#fff",
            fontSize: 15, fontWeight: 700, cursor: running ? "not-allowed" : "pointer",
            fontFamily: "inherit", marginBottom: 28, transition: "all 0.2s",
          }}
        >
          {running ? "Running diagnostics…" : "Run Diagnostics"}
        </button>

        {/* STAGE RESULTS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {results.map((r, i) => {
            const d = DOT[r.status];
            return (
              <div key={i} style={{
                background: d.bg, borderRadius: 12, padding: "14px 18px",
                display: "flex", alignItems: "flex-start", gap: 14,
                border: `1px solid ${r.status === STATUS.fail ? "rgba(248,113,113,0.2)" : r.status === STATUS.pass ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.06)"}`,
                transition: "all 0.3s",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(0,0,0,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: 13, fontWeight: 800, color: d.color,
                }}>
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

        {/* ICE CANDIDATE LOG */}
        {candidateLog.length > 0 && (
          <div style={{ background: "#060F1D", borderRadius: 12, padding: "16px 18px", marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748B", marginBottom: 10 }}>
              ICE CANDIDATES GATHERED ({candidateLog.length})
            </div>
            {candidateLog.map((c, i) => (
              <div key={i} style={{
                fontSize: 12, fontFamily: "monospace", color: c.includes("relay") ? "#4ADE80" : "rgba(255,255,255,0.45)",
                padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                {i + 1}. {c}
                {c.includes("relay") && <span style={{ marginLeft: 8, color: "#4ADE80", fontWeight: 700 }}>← TURN relay ✓</span>}
              </div>
            ))}
          </div>
        )}

        {/* ICE CONFIG DUMP */}
        {iceConfig && (
          <div style={{ background: "#060F1D", borderRadius: 12, padding: "16px 18px", marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748B", marginBottom: 10 }}>
              ICE CONFIG FROM BACKEND
            </div>
            <pre style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "monospace", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {JSON.stringify(iceConfig, null, 2)}
            </pre>
          </div>
        )}

        {/* SUMMARY / WHAT TO DO */}
        {!running && overall !== "idle" && (
          <div style={{
            background: overall === "pass"    ? "rgba(74,222,128,0.06)"  :
                        overall === "fail"    ? "rgba(248,113,113,0.06)" :
                        "rgba(255,255,255,0.04)",
            border: `1px solid ${overall === "pass" ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
            borderRadius: 12, padding: "18px 20px",
          }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, color: overall === "pass" ? "#4ADE80" : "#F87171" }}>
              {overall === "pass" ? "✓ All stages passed — WebRTC is working on this device" : "✗ Diagnostic complete — see failed stage(s) above"}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
              {results.find((r) => r.status === STATUS.fail)?.label === "Backend reachable" &&
                "→ The frontend cannot reach the backend. Check your VITE_API_URL env var on Vercel and ensure the Render backend is running."}
              {results.find((r) => r.status === STATUS.fail)?.label === "ICE config endpoint" &&
                "→ The /api/calls/ice-config endpoint is missing. Make sure you deployed the latest backend index.js."}
              {results.find((r) => r.status === STATUS.fail)?.label === "TURN servers in config" &&
                "→ The ICE config is returning but has no TURN servers. The endpoint exists but is returning wrong config."}
              {results.find((r) => r.status === STATUS.fail)?.label === "Camera/Mic access" &&
                "→ Browser is blocking camera/mic. On mobile: check site permissions in browser settings. On desktop: check OS privacy settings."}
              {results.find((r) => r.status === STATUS.fail)?.label === "RTCPeerConnection creates" &&
                "→ RTCPeerConnection constructor failed. This is unusual — try a different browser."}
              {results.find((r) => r.status === STATUS.fail)?.label === "ICE candidates generated" &&
                "→ No ICE candidates at all. WebRTC may be blocked by an enterprise firewall or browser extension. Try a different network."}
              {results.find((r) => r.status === STATUS.fail)?.label === "TURN reachable (relay candidate)" &&
                "→ TURN servers are configured but not reachable from this network. The free openrelay.metered.ca servers may be rate-limited or blocked. You need a paid TURN server (Metered or Twilio NTS)."}
              {overall === "pass" && "If calls still don't connect, the issue is in the signaling flow (offer/answer exchange between the two peers), not in the local WebRTC setup. Run this on both devices and send screenshots of both results."}
            </div>
          </div>
        )}

        <div style={{ marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
          ShieldKe WebRTC Diagnostic · Remove /call-diagnostic route before release
        </div>
      </div>
    </div>
  );
}
