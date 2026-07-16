import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiShield, FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus]   = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Invalid verification link."); return; }

    fetch(`${API_URL}/auth/verify-email/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.message?.toLowerCase().includes("success")) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      })
      .catch(() => { setStatus("error"); setMessage("Network error. Please try again."); });
  }, [token]);

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#060F1D,#0B1F3A)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"48px 40px", maxWidth:440, width:"100%", textAlign:"center" }}>

        {/* Logo */}
        <div onClick={() => navigate("/")} style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:36, cursor:"pointer" }}>
          <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#C9961A,#F0BE4A)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <FiShield size={19} color="#0B1F3A" strokeWidth={2.5}/>
          </div>
          <span style={{ fontSize:20, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>ShieldKe</span>
        </div>

        {status === "loading" && (
          <>
            <FiLoader size={48} color="#00A86B" style={{ animation:"spin 1s linear infinite", marginBottom:20 }}/>
            <div style={{ fontSize:18, fontWeight:700, color:"#fff" }}>Verifying your email…</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {status === "success" && (
          <>
            <FiCheckCircle size={52} color="#4ADE80" style={{ marginBottom:20 }}/>
            <div style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:10 }}>Email Verified!</div>
            <div style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.8, marginBottom:32 }}>{message}</div>
            <button
              onClick={() => navigate("/login")}
              style={{ width:"100%", padding:"13px", borderRadius:10, background:"linear-gradient(135deg,#006B3F,#00A86B)", border:"none", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}
            >
              Sign In to Your Account
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <FiXCircle size={52} color="#F87171" style={{ marginBottom:20 }}/>
            <div style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:10 }}>Verification Failed</div>
            <div style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.8, marginBottom:32 }}>{message}</div>
            <button
              onClick={() => navigate("/login")}
              style={{ width:"100%", padding:"13px", borderRadius:10, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit", marginBottom:12 }}
            >
              Back to Sign In
            </button>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.35)" }}>
              Link expired? Sign in and request a new one.
            </div>
          </>
        )}

      </div>
    </div>
  );
}
