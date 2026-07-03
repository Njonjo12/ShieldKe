import { useState, useRef } from "react";

/*
========================================
SHIELDKE WEBRTC DIAGNOSTIC v3
Tests the SAME ICE_CONFIG as CallWindow.jsx
including the real Metered credentials.
Route: /call-diagnostic
========================================
*/

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

const STAGES = [
  "Camera/Mic access",
  "RTCPeerConnection creates",
  "ICE candidates generated",
  "TURN reachable (relay candidate)",
];

const S = { idle:"idle", running:"running", pass:"pass", fail:"fail", warn:"warn" };
const DOT = {
  idle:    { bg:"#1E293B", color:"#64748B", label:"—" },
  running: { bg:"#1E3A5F", color:"#60A5FA", label:"…" },
  pass:    { bg:"#052E16", color:"#4ADE80", label:"✓" },
  fail:    { bg:"#3B0A0A", color:"#F87171", label:"✗" },
  warn:    { bg:"#422006", color:"#FBBF24", label:"!" },
};

export default function CallDiagnostic() {
  const [results, setResults] = useState(STAGES.map((label) => ({ label, status: S.idle, detail: "" })));
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const pcRef = useRef(null);

  const set   = (i, status, detail="") => setResults(p => p.map((r,idx) => idx===i ? {...r,status,detail} : r));
  const run   = (i)    => set(i, S.running);
  const pass  = (i, d) => set(i, S.pass, d);
  const fail  = (i, d) => set(i, S.fail, d);
  const warn  = (i, d) => set(i, S.warn, d);

  const runDiagnostics = async () => {
    setRunning(true); setLog([]);
    setResults(STAGES.map((label) => ({ label, status: S.idle, detail: "" })));
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }

    /* Stage 0 — camera/mic */
    run(0);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio:true, video:true });
      pass(0, `Tracks: ${stream.getTracks().map(t=>t.kind).join(", ")}`);
    } catch(err) {
      if (err.name === "NotFoundError") {
        try { stream = await navigator.mediaDevices.getUserMedia({ audio:true }); warn(0,"Audio only — no camera"); }
        catch(e2) { fail(0, `${e2.name}: ${e2.message}`); setRunning(false); return; }
      } else { fail(0, `${err.name}: ${err.message}`); setRunning(false); return; }
    }

    /* Stage 1 — RTCPeerConnection */
    run(1);
    let pc;
    try {
      pc = new RTCPeerConnection(ICE_CONFIG);
      pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      pass(1, "Created with Metered credentials (874b43ab…)");
    } catch(err) {
      fail(1, err.message);
      stream.getTracks().forEach(t => t.stop());
      setRunning(false); return;
    }

    /* Stage 2 + 3 — candidates */
    run(2); run(3);
    const seen = []; let s2=false, s3=false;

    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (!s2) fail(2, "No candidates after 10s");
        if (!s3) fail(3, `Gathering timed out — ${seen.length} candidates, none relay.\nNetwork is blocking TURN ports (80/443 UDP+TCP) to standard.relay.metered.ca`);
        resolve();
      }, 10000);

      pc.onicecandidate = (e) => {
        if (!e.candidate) {
          clearTimeout(timeout);
          if (!s2) pass(2, `${seen.length} candidate(s)`);
          if (!s3) fail(3, `Gathering complete — ${seen.length} candidates, none relay.\nNetwork blocks TURN. Try mobile data to confirm.`);
          resolve(); return;
        }
        const { type, protocol, address } = e.candidate;
        const entry = `${type} / ${protocol} / ${address||"?"}`;
        seen.push(entry);
        setLog(p => [...p, entry]);
        if (!s2) { s2=true; pass(2, `First: ${entry}`); }
        if (!s3 && type==="relay") { s3=true; pass(3, `Relay via TURN: ${entry}`); }
      };

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") {
          clearTimeout(timeout);
          if (!s2) pass(2, `${seen.length} candidate(s)`);
          if (!s3) fail(3, `Complete — ${seen.length} candidates, none relay.\nTURN blocked on this network. Try mobile data.`);
          resolve();
        }
      };

      pc.createOffer().then(o => pc.setLocalDescription(o)).catch(err => {
        clearTimeout(timeout);
        fail(2, `createOffer: ${err.message}`); fail(3, "Cannot gather"); resolve();
      });
    });

    pc.close(); stream.getTracks().forEach(t => t.stop()); pcRef.current = null;
    setRunning(false);
  };

  const overall = results.some(r=>r.status===S.fail) ? "fail"
                : results.some(r=>r.status===S.running) ? "running"
                : results.every(r=>[S.pass,S.warn].includes(r.status)) ? "pass" : "idle";

  return (
    <div style={{ minHeight:"100vh", background:"#0B1F3A", fontFamily:"'Inter',system-ui,sans-serif", padding:"40px 20px", color:"#fff" }}>
      <div style={{ maxWidth:640, margin:"0 auto" }}>

        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:"#00A86B", marginBottom:8 }}>SHIELDKE WEBRTC DIAGNOSTIC · V3</div>
          <h1 style={{ fontSize:26, fontWeight:800, margin:0, letterSpacing:"-0.02em" }}>TURN Connectivity Test</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginTop:8, lineHeight:1.7 }}>
            Uses your real Metered credentials (874b43ab…). Run on WiFi first, then again on mobile data to isolate whether the block is network-specific.
          </p>
        </div>

        <button onClick={runDiagnostics} disabled={running} style={{
          width:"100%", padding:"14px", borderRadius:12,
          background: running ? "#1E293B" : "linear-gradient(135deg,#006B3F,#00A86B)",
          border:"none", color: running ? "rgba(255,255,255,0.4)" : "#fff",
          fontSize:15, fontWeight:700, cursor: running ? "not-allowed" : "pointer",
          fontFamily:"inherit", marginBottom:24,
        }}>
          {running ? "Running…" : "Run Diagnostics"}
        </button>

        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
          {results.map((r,i) => {
            const d = DOT[r.status];
            return (
              <div key={i} style={{
                background:d.bg, borderRadius:12, padding:"14px 18px",
                display:"flex", alignItems:"flex-start", gap:14,
                border:`1px solid ${r.status===S.fail?"rgba(248,113,113,0.2)":r.status===S.pass?"rgba(74,222,128,0.12)":"rgba(255,255,255,0.06)"}`,
              }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(0,0,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:13, fontWeight:800, color:d.color }}>
                  {d.label}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:"#fff", marginBottom:2 }}>Stage {i+1} — {r.label}</div>
                  {r.detail && <div style={{ fontSize:12, color:d.color, lineHeight:1.6, fontFamily:"monospace", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{r.detail}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {log.length > 0 && (
          <div style={{ background:"#060F1D", borderRadius:12, padding:"16px 18px", marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", color:"#64748B", marginBottom:10 }}>ICE CANDIDATES ({log.length})</div>
            {log.map((c,i) => (
              <div key={i} style={{ fontSize:12, fontFamily:"monospace", color:c.includes("relay")?"#4ADE80":"rgba(255,255,255,0.45)", padding:"3px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                {i+1}. {c}{c.includes("relay") && <span style={{ marginLeft:8, color:"#4ADE80", fontWeight:700 }}> ← TURN relay ✓</span>}
              </div>
            ))}
          </div>
        )}

        {!running && overall !== "idle" && (
          <div style={{
            background: overall==="pass" ? "rgba(74,222,128,0.06)" : "rgba(248,113,113,0.06)",
            border:`1px solid ${overall==="pass"?"rgba(74,222,128,0.2)":"rgba(248,113,113,0.2)"}`,
            borderRadius:12, padding:"18px 20px",
          }}>
            <div style={{ fontWeight:800, fontSize:15, marginBottom:8, color:overall==="pass"?"#4ADE80":"#F87171" }}>
              {overall==="pass" ? "✓ TURN working — calls will connect" : "✗ TURN blocked — see Stage 4 detail"}
            </div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", lineHeight:1.8 }}>
              {results[3]?.status===S.fail &&
                "Next step: turn off WiFi and run this on mobile data (Safaricom/Airtel). If Stage 4 turns green on mobile data, the block is your current WiFi network (router, ISP, or corporate firewall) — not your code or TURN credentials. Most users on their own mobile data will connect fine. If it also fails on mobile data, reply with that result and we'll investigate further."}
              {overall==="pass" &&
                "Run on the other device too. If both pass, real calls should connect. The ICE chip in the top-left corner of the call screen will show 'connected' when media is flowing."}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
