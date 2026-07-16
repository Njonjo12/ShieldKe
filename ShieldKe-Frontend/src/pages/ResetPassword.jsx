import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiShield, FiLock, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [status,    setStatus]    = useState("idle"); // idle | loading | success
  const [error,     setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8)       { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm)      { setError("Passwords do not match."); return; }
    setStatus("loading");
    try {
      const res  = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Reset failed."); setStatus("idle"); return; }
      setStatus("success");
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  };

  const strength = password.length === 0 ? 0
    : password.length < 6  ? 1
    : password.length < 10 ? 2
    : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "#F87171", "#FBBF24", "#4ADE80"];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#060F1D,#0B1F3A)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"48px 40px", maxWidth:440, width:"100%" }}>

        <div onClick={() => navigate("/")} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:36, cursor:"pointer" }}>
          <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#C9961A,#F0BE4A)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <FiShield size={19} color="#0B1F3A" strokeWidth={2.5}/>
          </div>
          <span style={{ fontSize:20, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>ShieldKe</span>
        </div>

        {status !== "success" ? (
          <>
            <div style={{ fontSize:24, fontWeight:800, color:"#fff", marginBottom:8 }}>Set a new password</div>
            <div style={{ fontSize:14, color:"rgba(255,255,255,0.45)", marginBottom:32 }}>
              Choose a strong password you haven't used before.
            </div>

            {error && (
              <div style={{ padding:"12px 16px", borderRadius:10, background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)", color:"#F87171", fontSize:14, marginBottom:20 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {/* new password */}
              <div>
                <div style={{ position:"relative" }}>
                  <FiLock size={16} color="#9CA3AF" style={{ position:"absolute", top:"50%", left:14, transform:"translateY(-50%)", pointerEvents:"none" }}/>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="New password"
                    required
                    style={{ width:"100%", padding:"12px 42px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    style={{ position:"absolute", top:"50%", right:14, transform:"translateY(-50%)", background:"none", border:"none", color:"#9CA3AF", cursor:"pointer" }}>
                    {showPw ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                  </button>
                </div>
                {password.length > 0 && (
                  <div style={{ marginTop:8, display:"flex", gap:6, alignItems:"center" }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i <= strength ? strengthColor[strength] : "rgba(255,255,255,0.1)", transition:"background 0.2s" }}/>
                    ))}
                    <span style={{ fontSize:11, color:strengthColor[strength], fontWeight:700, flexShrink:0 }}>{strengthLabel[strength]}</span>
                  </div>
                )}
              </div>

              {/* confirm */}
              <div style={{ position:"relative" }}>
                <FiLock size={16} color="#9CA3AF" style={{ position:"absolute", top:"50%", left:14, transform:"translateY(-50%)", pointerEvents:"none" }}/>
                <input
                  type={showPw ? "text" : "password"}
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  style={{ width:"100%", padding:"12px 14px 12px 42px", borderRadius:10, border:`1px solid ${confirm && confirm !== password ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.1)"}`, background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
                />
              </div>

              <button
                type="submit" disabled={status==="loading"}
                style={{ padding:"13px", borderRadius:10, background:status==="loading"?"#4B5563":"linear-gradient(135deg,#006B3F,#00A86B)", border:"none", color:"#fff", fontSize:15, fontWeight:700, cursor:status==="loading"?"not-allowed":"pointer", fontFamily:"inherit", marginTop:4 }}
              >
                {status === "loading" ? "Resetting…" : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign:"center" }}>
            <FiCheckCircle size={52} color="#4ADE80" style={{ marginBottom:20 }}/>
            <div style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:10 }}>Password reset!</div>
            <div style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.8, marginBottom:32 }}>
              Your password has been updated successfully. You can now sign in with your new password.
            </div>
            <button
              onClick={() => navigate("/login")}
              style={{ width:"100%", padding:"13px", borderRadius:10, background:"linear-gradient(135deg,#006B3F,#00A86B)", border:"none", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}
            >
              Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
