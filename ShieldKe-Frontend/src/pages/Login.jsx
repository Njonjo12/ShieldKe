import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { saveAuth } from "../utils/auth";
import useIsMobile from "../hooks/useIsMobile";
import { FiMail, FiLock, FiShield, FiArrowRight } from "react-icons/fi";

const API_URL    = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_URL = API_URL.replace("/api", "");
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function Login() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendStatus,    setResendStatus]    = useState("idle"); // idle | sending | sent

  /* handle oauth error param */
  useEffect(() => {
    if (searchParams.get("error") === "oauth_failed") {
      setError("Social sign-in failed. Please try again or use email/password.");
    }
  }, []);

  /* load Google Identity Services script */
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement("script");
    script.src   = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback:  handleGoogleCredential,
      });
      window.google?.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { theme: "filled_black", size: "large", shape: "rectangular", width: 320, text: "signin_with" }
      );
    };
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  /* email/password login */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setUnverifiedEmail("");
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(data.email || form.email);
        } else {
          setError(data.message || "Invalid credentials");
        }
        return;
      }

      saveAuth(data.user, data.token);
      if (data.user.role === "admin")  navigate("/admin");
      else if (data.user.role === "lawyer") navigate("/lawyer");
      else navigate("/client");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* resend verification */
  const handleResend = async () => {
    setResendStatus("sending");
    try {
      await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      setResendStatus("sent");
    } catch {
      setResendStatus("idle");
    }
  };

  /* Google credential callback */
  const handleGoogleCredential = async (response) => {
    setError("");
    try {
      const res  = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();

      if (data.needsRole) {
        /* first-time Google user — redirect to register to pick a role */
        navigate("/register?google=" + encodeURIComponent(JSON.stringify({
          credential: response.credential,
          email:      data.email,
          name:       data.name,
        })));
        return;
      }

      if (!res.ok) { setError(data.message || "Google sign-in failed"); return; }
      saveAuth(data.user, data.token);
      if (data.user.role === "admin")  navigate("/admin");
      else if (data.user.role === "lawyer") navigate("/lawyer");
      else navigate("/client");
    } catch {
      setError("Google sign-in failed. Please try again.");
    }
  };

  /* LinkedIn — redirect to backend which handles OAuth flow */
  const handleLinkedIn = () => {
    window.location.href = `${SERVER_URL}/api/auth/linkedin?role=client`;
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px 12px 42px",
    borderRadius: 10, border: "1px solid #E5E7EB",
    background: "#F9FAFB", color: "#374151",
    fontSize: 15, fontFamily: "inherit", outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight:"100vh", display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", background:"#F8FAFC" }}>

      {/* LEFT — FORM */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding: isMobile ? "40px 20px" : "48px 40px" }}>
        <div style={{ width:"100%", maxWidth:440 }}>

          {/* Logo */}
          <div onClick={() => navigate("/")} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:36, cursor:"pointer", width:"fit-content" }}>
            <div style={{ width:40, height:40, borderRadius:10, background:"linear-gradient(135deg,#C9961A,#F0BE4A)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <FiShield size={20} color="#0B1F3A" strokeWidth={2.5}/>
            </div>
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:"#0B1F3A", letterSpacing:"-0.02em", lineHeight:1 }}>ShieldKe</div>
              <div style={{ fontSize:10, fontWeight:700, color:"#9CA3AF", letterSpacing:"0.1em" }}>LEGAL CONNECT</div>
            </div>
          </div>

          <div style={{ fontSize: isMobile ? 22 : 26, fontWeight:800, color:"#0B1F3A", marginBottom:6 }}>Welcome back</div>
          <div style={{ fontSize:14, color:"#6B7280", marginBottom:28 }}>Sign in to your ShieldKe account</div>

          {/* unverified email banner */}
          {unverifiedEmail && (
            <div style={{ padding:"14px 16px", borderRadius:10, background:"#FFFBEB", border:"1px solid #FDE68A", marginBottom:20 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#92400E", marginBottom:4 }}>Email not verified</div>
              <div style={{ fontSize:13, color:"#78350F", lineHeight:1.6, marginBottom:10 }}>
                Please verify your email before signing in.
              </div>
              {resendStatus !== "sent" ? (
                <button onClick={handleResend} disabled={resendStatus==="sending"}
                  style={{ fontSize:13, fontWeight:700, color:"#D97706", background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:"inherit" }}>
                  {resendStatus==="sending" ? "Sending…" : "Resend verification email →"}
                </button>
              ) : (
                <div style={{ fontSize:13, color:"#059669", fontWeight:600 }}>✓ Verification email sent — check your inbox</div>
              )}
            </div>
          )}

          {/* error */}
          {error && (
            <div style={{ padding:"12px 16px", borderRadius:10, background:"#FEF2F2", border:"1px solid #FECACA", color:"#DC2626", fontSize:14, fontWeight:600, marginBottom:20 }}>
              {error}
            </div>
          )}

          {/* email/password form */}
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ position:"relative" }}>
              <FiMail size={16} color="#9CA3AF" style={{ position:"absolute", top:"50%", left:14, transform:"translateY(-50%)", pointerEvents:"none" }}/>
              <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} required style={inputStyle}
                onFocus={e=>{e.target.style.borderColor="#0B1F3A";}} onBlur={e=>{e.target.style.borderColor="#E5E7EB";}}/>
            </div>
            <div>
              <div style={{ position:"relative" }}>
                <FiLock size={16} color="#9CA3AF" style={{ position:"absolute", top:"50%", left:14, transform:"translateY(-50%)", pointerEvents:"none" }}/>
                <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={inputStyle}
                  onFocus={e=>{e.target.style.borderColor="#0B1F3A";}} onBlur={e=>{e.target.style.borderColor="#E5E7EB";}}/>
              </div>
              <div style={{ textAlign:"right", marginTop:6 }}>
                <Link to="/forgot-password" style={{ fontSize:13, color:"#3B82F6", fontWeight:600, textDecoration:"none" }}>
                  Forgot password?
                </Link>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"13px", borderRadius:10, background:loading?"#9CA3AF":"linear-gradient(135deg,#0B1F3A,#1A3A6E)", border:"none", color:"#fff", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:"inherit" }}>
              {loading ? "Signing in…" : <><span>Sign In</span><FiArrowRight size={16}/></>}
            </button>
          </form>

          {/* divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
            <div style={{ flex:1, height:1, background:"#E5E7EB" }}/>
            <span style={{ fontSize:13, color:"#9CA3AF", fontWeight:500 }}>or continue with</span>
            <div style={{ flex:1, height:1, background:"#E5E7EB" }}/>
          </div>

          {/* Google button — rendered by Google GSI SDK */}
          {GOOGLE_CLIENT_ID && (
            <div id="google-signin-btn" style={{ marginBottom:12 }}/>
          )}

          {/* LinkedIn button */}
          <button onClick={handleLinkedIn}
            style={{ width:"100%", padding:"11px 16px", borderRadius:10, background:"#0A66C2", border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            Continue with LinkedIn
          </button>

          <div style={{ marginTop:22, textAlign:"center", fontSize:14, color:"#6B7280" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color:"#0B1F3A", fontWeight:700, textDecoration:"none" }}>Create one</Link>
          </div>

        </div>
      </div>

      {/* RIGHT — hero panel (hidden on mobile) */}
      {!isMobile && (
        <div style={{ background:"linear-gradient(160deg,#0B1F3A,#132843 50%,#006B3F)", display:"flex", alignItems:"center", justifyContent:"center", padding:"60px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.06)", top:-100, right:-100 }}/>
          <div style={{ position:"absolute", width:280, height:280, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.06)", bottom:-60, left:-60 }}/>
          <div style={{ position:"relative", zIndex:2, maxWidth:420 }}>
            <div style={{ fontSize:38, fontWeight:900, color:"#fff", lineHeight:1.15, marginBottom:18, letterSpacing:"-0.03em" }}>
              Justice is just a<br/><span style={{ color:"#00A86B" }}>click away</span>
            </div>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", lineHeight:1.9, marginBottom:32 }}>
              Connect with verified, LSK-registered lawyers across Kenya for fast, confidential legal consultation.
            </p>
            {["All lawyers are LSK-verified","End-to-end encrypted consultations","Available 24/7 across Kenya"].map(item => (
              <div key={item} style={{ display:"flex", alignItems:"center", gap:10, fontSize:14, color:"rgba(255,255,255,0.65)", marginBottom:12 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(0,168,107,0.2)", border:"1px solid rgba(0,168,107,0.35)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <FiArrowRight size={11} color="#00A86B"/>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
