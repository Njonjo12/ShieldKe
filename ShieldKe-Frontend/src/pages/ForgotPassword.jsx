import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiShield, FiMail, FiArrowLeft } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email,    setEmail]   = useState("");
  const [status,   setStatus]  = useState("idle"); // idle | loading | sent
  const [error,    setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("loading");
    try {
      const res  = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Something went wrong."); setStatus("idle"); return; }
      setStatus("sent");
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#060F1D,#0B1F3A)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"48px 40px", maxWidth:440, width:"100%" }}>

        {/* Logo */}
        <div onClick={() => navigate("/")} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:36, cursor:"pointer" }}>
          <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#C9961A,#F0BE4A)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <FiShield size={19} color="#0B1F3A" strokeWidth={2.5}/>
          </div>
          <span style={{ fontSize:20, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>ShieldKe</span>
        </div>

        {status !== "sent" ? (
          <>
            <div style={{ fontSize:24, fontWeight:800, color:"#fff", marginBottom:8 }}>Forgot your password?</div>
            <div style={{ fontSize:14, color:"rgba(255,255,255,0.45)", marginBottom:32, lineHeight:1.7 }}>
              Enter your email address and we'll send you a link to reset your password.
            </div>

            {error && (
              <div style={{ padding:"12px 16px", borderRadius:10, background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)", color:"#F87171", fontSize:14, marginBottom:20 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ position:"relative" }}>
                <FiMail size={16} color="#9CA3AF" style={{ position:"absolute", top:"50%", left:14, transform:"translateY(-50%)", pointerEvents:"none" }}/>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  style={{ width:"100%", padding:"12px 14px 12px 42px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.06)", color:"#fff", fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
                />
              </div>
              <button
                type="submit" disabled={status === "loading"}
                style={{ padding:"13px", borderRadius:10, background:status==="loading" ? "#4B5563" : "linear-gradient(135deg,#0B1F3A,#1A3A6E)", border:"none", color:"#fff", fontSize:15, fontWeight:700, cursor:status==="loading"?"not-allowed":"pointer", fontFamily:"inherit" }}
              >
                {status === "loading" ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <div style={{ marginTop:24, textAlign:"center" }}>
              <Link to="/login" style={{ display:"inline-flex", alignItems:"center", gap:6, color:"rgba(255,255,255,0.4)", fontSize:14, textDecoration:"none" }}>
                <FiArrowLeft size={14}/> Back to Sign In
              </Link>
            </div>
          </>
        ) : (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:20 }}>📧</div>
            <div style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:10 }}>Check your inbox</div>
            <div style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.8, marginBottom:32 }}>
              If <strong style={{ color:"rgba(255,255,255,0.8)" }}>{email}</strong> is registered, you'll receive a password reset link within a few minutes. Check your spam folder if you don't see it.
            </div>
            <button
              onClick={() => navigate("/login")}
              style={{ width:"100%", padding:"13px", borderRadius:10, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}
            >
              Back to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
