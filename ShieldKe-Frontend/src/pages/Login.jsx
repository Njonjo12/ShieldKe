import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveAuth } from "../utils/auth";
import useIsMobile from "../hooks/useIsMobile";
import { FiMail, FiLock, FiShield, FiArrowRight } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Login() {

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Login failed"); return; }
      saveAuth(data.user, data.token);
      if (data.user.role === "admin")  navigate("/admin");
      else if (data.user.role === "lawyer") navigate("/lawyer");
      else navigate("/client");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* shared input style */
  const inputStyle = {
    width: "100%", padding: "12px 14px 12px 42px",
    borderRadius: 10, border: "1px solid #E5E7EB",
    background: "#F9FAFB", color: "#374151",
    fontSize: 15, fontFamily: "inherit", outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", background: "#F8FAFC" }}>

      {/* ── LEFT — FORM ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "40px 20px" : "48px 40px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {/* LOGO */}
          <div
            onClick={() => navigate("/")}
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, cursor: "pointer", width: "fit-content" }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#C9961A,#F0BE4A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiShield size={20} color="#0B1F3A" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0B1F3A", letterSpacing: "-0.02em", lineHeight: 1 }}>ShieldKe</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.1em" }}>LEGAL CONNECT</div>
            </div>
          </div>

          <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800, color: "#0B1F3A", marginBottom: 8 }}>Welcome back</div>
          <div style={{ fontSize: 15, color: "#6B7280", marginBottom: 32 }}>Sign in to your ShieldKe account</div>

          {/* ERROR */}
          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* EMAIL */}
            <div style={{ position: "relative" }}>
              <FiMail size={16} color="#9CA3AF" style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                name="email" type="email" placeholder="Email address"
                value={form.email} onChange={handleChange}
                required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "#0B1F3A"; e.target.style.boxShadow = "0 0 0 3px rgba(11,31,58,0.08)"; }}
                onBlur={e  => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* PASSWORD */}
            <div style={{ position: "relative" }}>
              <FiLock size={16} color="#9CA3AF" style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                name="password" type="password" placeholder="Password"
                value={form.password} onChange={handleChange}
                required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "#0B1F3A"; e.target.style.boxShadow = "0 0 0 3px rgba(11,31,58,0.08)"; }}
                onBlur={e  => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit" disabled={loading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 10, background: loading ? "#9CA3AF" : "linear-gradient(135deg,#0B1F3A,#1A3A6E)", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: 4 }}
            >
              {loading ? "Signing in..." : <><span>Sign In</span> <FiArrowRight size={16} /></>}
            </button>

          </form>

          <div style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "#6B7280" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#0B1F3A", fontWeight: 700, textDecoration: "none" }}>
              Create one
            </Link>
          </div>

        </div>
      </div>

      {/* ── RIGHT — HERO (hidden on mobile to keep the form front and center) ── */}
      {!isMobile && (
        <div style={{ background: "linear-gradient(160deg,#0B1F3A 0%,#132843 50%,#006B3F 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 60px", position: "relative", overflow: "hidden" }}>

          {/* decorative circles */}
          <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", top: -100, right: -100 }} />
          <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", bottom: -60, left: -60 }} />

          <div style={{ position: "relative", zIndex: 2, maxWidth: 460 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600, marginBottom: 28 }}>
              🇰🇪 Kenya's #1 Legal Platform
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 20, letterSpacing: "-0.03em" }}>
              Justice is just a<br /><span style={{ color: "#00A86B" }}>click away</span>
            </div>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.9, marginBottom: 36 }}>
              Connect with verified, LSK-registered lawyers across Kenya for fast, confidential legal consultation.
            </p>

            {/* TRUST ITEMS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                "All lawyers are LSK-verified",
                "End-to-end encrypted consultations",
                "Available 24/7 across Kenya",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(0,168,107,0.2)", border: "1px solid rgba(0,168,107,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FiArrowRight size={11} color="#00A86B" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
