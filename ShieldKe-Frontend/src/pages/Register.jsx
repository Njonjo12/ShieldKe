import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";
import { FiShield, FiArrowRight, FiUser, FiMail, FiLock, FiBriefcase, FiCheckCircle } from "react-icons/fi";

const API_URL    = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_URL = API_URL.replace("/api", "");
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function Register() {
  const navigate     = useNavigate();
  const isMobile     = useIsMobile();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({ name:"", email:"", password:"", role:"client", specialization:"", yearsOfExperience:"", consultationFee:"", lskNumber:"", location:"", bio:"" });
  const [profilePhoto,         setProfilePhoto]         = useState(null);
  const [photoPreview,         setPhotoPreview]         = useState(null);
  const [barCertificate,       setBarCertificate]       = useState(null);
  const [practicingCertificate,setPracticingCertificate]= useState(null);
  const [nationalIdDocument,   setNationalIdDocument]   = useState(null);
  const [error,    setError]   = useState("");
  const [loading,  setLoading] = useState(false);
  const [done,     setDone]    = useState(false);
  const [doneEmail,setDoneEmail]=useState("");

  /* pre-fill if coming from Google first-time flow */
  const googlePending = searchParams.get("google");
  useEffect(() => {
    if (!googlePending) return;
    try {
      const g = JSON.parse(decodeURIComponent(googlePending));
      setForm(f => ({ ...f, name: g.name || "", email: g.email || "" }));
    } catch {}
  }, []);

  /* load Google GSI */
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement("script");
    script.src   = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredential });
      window.google?.accounts.id.renderButton(
        document.getElementById("google-register-btn"),
        { theme:"filled_black", size:"large", shape:"rectangular", width: 320, text:"signup_with" }
      );
    };
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleChange      = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePhotoChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setProfilePhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };
  const removePhoto = () => { setProfilePhoto(null); setPhotoPreview(null); };

  /* Google — same handler as Login but posts with chosen role */
  const handleGoogleCredential = async (response) => {
    setError("");
    try {
      const res  = await fetch(`${API_URL}/auth/google`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ credential: response.credential, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Google sign-up failed"); return; }
      const { saveAuth } = await import("../utils/auth");
      saveAuth(data.user, data.token);
      if (data.user.role === "admin")        navigate("/admin");
      else if (data.user.role === "lawyer")  navigate("/lawyer");
      else                                   navigate("/client");
    } catch { setError("Google sign-up failed. Please try again."); }
  };

  /* LinkedIn */
  const handleLinkedIn = () => {
    window.location.href = `${SERVER_URL}/api/auth/linkedin?role=${form.role}`;
  };

  /* email/password registration */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (form.role === "lawyer" && !form.specialization) { setError("Please enter your specialization."); return; }
    if (form.role === "lawyer" && !barCertificate)      { setError("Please upload your bar certificate."); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      if (profilePhoto)          fd.append("profilePhoto",          profilePhoto);
      if (barCertificate)        fd.append("barCertificate",        barCertificate);
      if (practicingCertificate) fd.append("practicingCertificate", practicingCertificate);
      if (nationalIdDocument)    fd.append("nationalIdDocument",    nationalIdDocument);

      const res  = await fetch(`${API_URL}/auth/register`, {
        method:"POST",
        headers:{ Authorization: "" },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed"); return; }

      setDoneEmail(form.email);
      setDone(true);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const labelStyle  = { display:"block", fontSize:12, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 };
  const inputStyle  = { width:"100%", padding:"11px 14px", borderRadius:9, border:"1px solid #E5E7EB", background:"#F9FAFB", color:"#374151", fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" };
  const fileStyle   = { width:"100%", padding:"10px 14px", borderRadius:9, border:"1px dashed #D1D5DB", background:"#F9FAFB", color:"#6B7280", fontSize:13, fontFamily:"inherit", cursor:"pointer", boxSizing:"border-box" };

  /* ── SUCCESS SCREEN ── */
  if (done) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#060F1D,#0B1F3A)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"48px 40px", maxWidth:440, width:"100%", textAlign:"center" }}>
        <FiCheckCircle size={56} color="#4ADE80" style={{ marginBottom:20 }}/>
        <div style={{ fontSize:24, fontWeight:800, color:"#fff", marginBottom:12 }}>Check your email!</div>
        <div style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.8, marginBottom:8 }}>
          We sent a verification link to
        </div>
        <div style={{ fontSize:15, fontWeight:700, color:"#00A86B", marginBottom:24 }}>{doneEmail}</div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.8, marginBottom:32 }}>
          Click the link in the email to activate your account. The link expires in 24 hours. Check your spam folder if you don't see it.
        </div>
        <button onClick={() => navigate("/login")}
          style={{ width:"100%", padding:"13px", borderRadius:10, background:"linear-gradient(135deg,#006B3F,#00A86B)", border:"none", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
          Go to Sign In
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", display:"flex", alignItems:"flex-start", justifyContent:"center", padding: isMobile ? "24px 14px" : "40px 20px", fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ width:"100%", maxWidth:560 }}>

        {/* Logo */}
        <div onClick={() => navigate("/")} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28, justifyContent:"center", cursor:"pointer" }}>
          <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#C9961A,#F0BE4A)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <FiShield size={19} color="#0B1F3A" strokeWidth={2.5}/>
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:"#0B1F3A", letterSpacing:"-0.02em", lineHeight:1 }}>ShieldKe</div>
            <div style={{ fontSize:10, fontWeight:700, color:"#9CA3AF", letterSpacing:"0.1em" }}>LEGAL CONNECT</div>
          </div>
        </div>

        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E5E7EB", padding: isMobile ? "24px 18px" : "32px 28px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: isMobile ? 20 : 24, fontWeight:800, color:"#0B1F3A", marginBottom:6 }}>Create your account</div>
          <div style={{ fontSize:14, color:"#6B7280", marginBottom:24 }}>Join thousands of Kenyans getting legal help.</div>

          {/* Social sign-up */}
          <div style={{ marginBottom:20 }}>
            {GOOGLE_CLIENT_ID && <div id="google-register-btn" style={{ marginBottom:10 }}/>}
            <button onClick={handleLinkedIn}
              style={{ width:"100%", padding:"11px 16px", borderRadius:10, background:"#0A66C2", border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              Continue with LinkedIn
            </button>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <div style={{ flex:1, height:1, background:"#E5E7EB" }}/>
            <span style={{ fontSize:12, color:"#9CA3AF", fontWeight:500 }}>or register with email</span>
            <div style={{ flex:1, height:1, background:"#E5E7EB" }}/>
          </div>

          {error && (
            <div style={{ padding:"12px 16px", borderRadius:9, background:"#FEF2F2", border:"1px solid #FECACA", color:"#DC2626", fontSize:13, fontWeight:600, marginBottom:18 }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* ROLE */}
            <div>
              <label style={labelStyle}>I am a</label>
              <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:10 }}>
                {["client","lawyer"].map(r => (
                  <button type="button" key={r} onClick={() => setForm({...form, role:r})}
                    style={{ padding:"12px 16px", borderRadius:9, border:`2px solid ${form.role===r?"#0B1F3A":"#E5E7EB"}`, background: form.role===r?"#0B1F3A":"#fff", color: form.role===r?"#fff":"#374151", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    {r==="client" ? <FiUser size={15}/> : <FiBriefcase size={15}/>}
                    {r==="client" ? "Client" : "Lawyer / Advocate"}
                  </button>
                ))}
              </div>
            </div>

            {/* BASE FIELDS */}
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required style={inputStyle}
                  readOnly={!!googlePending}/>
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input name="password" type="password" placeholder="Min 8 characters" value={form.password} onChange={handleChange} required style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input name="location" placeholder="City / County" value={form.location} onChange={handleChange} style={inputStyle}/>
              </div>
            </div>

            {/* PROFILE PHOTO */}
            <div>
              <label style={labelStyle}>Profile Photo</label>
              {!photoPreview ? (
                <label htmlFor="profilePhotoInput" style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderRadius:9, border:"1px dashed #D1D5DB", background:"#F9FAFB", cursor:"pointer" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#00A86B";e.currentTarget.style.background="#F0FDF4";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#D1D5DB";e.currentTarget.style.background="#F9FAFB";}}>
                  <span style={{ fontSize:22 }}>📷</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#374151" }}>Click to upload a photo</div>
                    <div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>JPG or PNG, up to 5MB</div>
                  </div>
                </label>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px", borderRadius:9, border:"1px solid #A7F3D0", background:"#F0FDF4" }}>
                  <img src={photoPreview} alt="preview" style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover", border:"2px solid #00A86B", flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#059669" }}>✓ Photo selected</div>
                    <div style={{ fontSize:12, color:"#6B7280", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profilePhoto?.name}</div>
                  </div>
                  <button type="button" onClick={removePhoto} style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:7, padding:"6px 12px", fontSize:12, fontWeight:700, color:"#6B7280", cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>Remove</button>
                </div>
              )}
              <input id="profilePhotoInput" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display:"none" }}/>
            </div>

            {/* LAWYER FIELDS */}
            {form.role === "lawyer" && (
              <div style={{ display:"flex", flexDirection:"column", gap:14, padding:"20px", borderRadius:10, background:"#F8FAFC", border:"1px solid #E5E7EB" }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#374151", display:"flex", alignItems:"center", gap:6 }}><FiBriefcase size={14}/> Lawyer Details</div>

                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14 }}>
                  <div>
                    <label style={labelStyle}>Specialization *</label>
                    <input name="specialization" placeholder="e.g. Family Law" value={form.specialization} onChange={handleChange} required={form.role==="lawyer"} style={inputStyle}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Years of Experience</label>
                    <input name="yearsOfExperience" type="number" min="0" placeholder="0" value={form.yearsOfExperience} onChange={handleChange} style={inputStyle}/>
                  </div>
                  <div>
                    <label style={labelStyle}>LSK Number</label>
                    <input name="lskNumber" placeholder="LSK/ADV/..." value={form.lskNumber} onChange={handleChange} style={inputStyle}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Consultation Fee (KES)</label>
                    <input name="consultationFee" type="number" min="0" placeholder="0" value={form.consultationFee} onChange={handleChange} style={inputStyle}/>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Professional Bio</label>
                  <textarea name="bio" placeholder="Brief professional background..." value={form.bio} onChange={handleChange}
                    style={{ ...inputStyle, minHeight:80, resize:"vertical", lineHeight:1.6 }}/>
                </div>

                <div>
                  <label style={labelStyle}>Verification Documents</label>
                  <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:14 }}>
                    {[
                      { label:"BAR Certificate *", setter:setBarCertificate },
                      { label:"Practicing Certificate", setter:setPracticingCertificate },
                      { label:"National ID / Passport", setter:setNationalIdDocument },
                    ].map(doc => (
                      <div key={doc.label}>
                        <label style={{ ...labelStyle, marginBottom:6 }}>{doc.label}</label>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => doc.setter(e.target.files[0])} style={fileStyle}/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TERMS */}
            <div style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:13, color:"#6B7280" }}>
              <input type="checkbox" required style={{ marginTop:2, flexShrink:0 }}/>
              <span>
                I agree to ShieldKe's{" "}
                <Link to="/terms-of-service" style={{ color:"#0B1F3A", fontWeight:600 }}>Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy-policy" style={{ color:"#0B1F3A", fontWeight:600 }}>Privacy Policy</Link>
              </span>
            </div>

            <button type="submit" disabled={loading}
              style={{ padding:"13px", borderRadius:10, background:loading?"#9CA3AF":"linear-gradient(135deg,#006B3F,#00A86B)", border:"none", color:"#fff", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {loading ? "Creating account…" : <><span>Create Account</span><FiArrowRight size={16}/></>}
            </button>
          </form>

          <div style={{ marginTop:20, textAlign:"center", fontSize:14, color:"#6B7280" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color:"#0B1F3A", fontWeight:700, textDecoration:"none" }}>Sign in</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
