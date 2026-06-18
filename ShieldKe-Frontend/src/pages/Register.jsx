import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";
import { FiShield, FiArrowRight, FiUser, FiMail, FiLock, FiBriefcase } from "react-icons/fi";

const API_URL = "http://localhost:5000/api";

export default function Register() {

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "client",
    specialization: "", yearsOfExperience: "", lskNumber: "",
    location: "", bio: "", consultationFee: "",
  });
  const [profilePhoto,         setProfilePhoto]         = useState(null);
  const [photoPreview,         setPhotoPreview]         = useState(null);
  const [barCertificate,       setBarCertificate]       = useState(null);
  const [practicingCertificate,setPracticingCertificate] = useState(null);
  const [nationalIdDocument,   setNationalIdDocument]   = useState(null);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setProfilePhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (profilePhoto)          formData.append("profilePhoto",          profilePhoto);
      if (barCertificate)        formData.append("barCertificate",        barCertificate);
      if (practicingCertificate) formData.append("practicingCertificate", practicingCertificate);
      if (nationalIdDocument)    formData.append("nationalIdDocument",    nationalIdDocument);

      const res  = await fetch(`${API_URL}/auth/register`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed"); return; }
      navigate("/login");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* shared styles */
  const inputStyle = {
    width: "100%", padding: "11px 14px",
    borderRadius: 9, border: "1px solid #E5E7EB",
    background: "#F9FAFB", color: "#374151",
    fontSize: 14, fontFamily: "inherit", outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 700,
    color: "#6B7280", textTransform: "uppercase",
    letterSpacing: "0.06em", marginBottom: 7,
  };
  const fileStyle = {
    width: "100%", padding: "10px 14px",
    borderRadius: 9, border: "1px dashed #D1D5DB",
    background: "#F9FAFB", color: "#9CA3AF",
    fontSize: 13, fontFamily: "inherit", cursor: "pointer",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: isMobile ? "24px 14px" : "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 560 }}>

        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, justifyContent: "center", cursor: "pointer" }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#C9961A,#F0BE4A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiShield size={19} color="#0B1F3A" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#0B1F3A", letterSpacing: "-0.02em", lineHeight: 1 }}>ShieldKe</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.1em" }}>LEGAL CONNECT</div>
          </div>
        </div>

        <div style={{ fontSize: 26, fontWeight: 800, color: "#0B1F3A", marginBottom: 6, textAlign: "center" }}>Create your account</div>
        <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 28, textAlign: "center" }}>Join Kenya's leading legal platform</div>

        {/* ERROR */}
        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* FORM CARD */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: isMobile ? "24px 18px" : "32px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* ROLE TOGGLE */}
            <div>
              <label style={labelStyle}>I am a</label>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                {["client", "lawyer"].map((r) => (
                  <button
                    key={r} type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    style={{
                      padding: "11px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit",
                      fontSize: 14, fontWeight: 700, border: "2px solid",
                      borderColor: form.role === r ? "#0B1F3A" : "#E5E7EB",
                      background: form.role === r ? "#0B1F3A" : "#fff",
                      color: form.role === r ? "#fff" : "#374151",
                      transition: "all 0.15s",
                    }}
                  >
                    {r === "client" ? <><FiUser style={{ marginRight: 6, verticalAlign: "middle" }} />Client</> : <><FiBriefcase style={{ marginRight: 6, verticalAlign: "middle" }} />Lawyer</>}
                  </button>
                ))}
              </div>
            </div>

            {/* BASE FIELDS */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}><FiUser size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />Full Name</label>
                <input name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}><FiMail size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />Email</label>
                <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}><FiLock size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />Password</label>
              <input name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required style={inputStyle} />
            </div>

            {/* PROFILE PHOTO */}
            <div>
              <label style={labelStyle}>Profile Photo</label>

              {!photoPreview ? (
                <label
                  htmlFor="profilePhotoInput"
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 9,
                    border: "1px dashed #D1D5DB", background: "#F9FAFB",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#00A86B"; e.currentTarget.style.background = "#F0FDF4"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.background = "#F9FAFB"; }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "#fff", border: "1px solid #E5E7EB",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: 16,
                  }}>📷</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Click to upload a photo</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>JPG or PNG, up to 5MB</div>
                  </div>
                </label>
              ) : (
                <div style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 16px", borderRadius: 9,
                  border: "1px solid #A7F3D0", background: "#F0FDF4",
                }}>
                  <img
                    src={photoPreview}
                    alt="Selected profile"
                    style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: "2px solid #00A86B", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>✓ Photo selected</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {profilePhoto?.name}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removePhoto}
                    style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: "#6B7280", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
                  >
                    Remove
                  </button>
                </div>
              )}

              <input
                id="profilePhotoInput"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
            </div>

            {/* LAWYER-ONLY FIELDS */}
            {form.role === "lawyer" && (
              <>
                <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 4, height: 16, background: "linear-gradient(135deg,#006B3F,#00A86B)", borderRadius: 4 }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0B1F3A", textTransform: "uppercase", letterSpacing: "0.06em" }}>Lawyer Details</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Specialization</label>
                      <input name="specialization" placeholder="e.g. Family Law" value={form.specialization} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Years of Experience</label>
                      <input name="yearsOfExperience" type="number" placeholder="e.g. 5" value={form.yearsOfExperience} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>LSK Number</label>
                      <input name="lskNumber" placeholder="LSK/XXXX/XXXX" value={form.lskNumber} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Location</label>
                      <input name="location" placeholder="e.g. Nairobi" value={form.location} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Consultation Fee (KES)</label>
                      <input name="consultationFee" type="number" placeholder="e.g. 3000" value={form.consultationFee} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label style={labelStyle}>Professional Bio</label>
                    <textarea name="bio" placeholder="Brief professional background..." value={form.bio} onChange={handleChange}
                      style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.6 }} />
                  </div>
                </div>

                {/* DOCUMENTS */}
                <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 4, height: 16, background: "linear-gradient(135deg,#C9961A,#F0BE4A)", borderRadius: 4 }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0B1F3A", textTransform: "uppercase", letterSpacing: "0.06em" }}>Verification Documents</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                    {[
                      { label: "BAR Certificate",        setter: setBarCertificate },
                      { label: "Practicing Certificate", setter: setPracticingCertificate },
                      { label: "National ID",            setter: setNationalIdDocument },
                    ].map((doc) => (
                      <div key={doc.label}>
                        <label style={labelStyle}>{doc.label}</label>
                        <input type="file" onChange={e => doc.setter(e.target.files[0])} style={fileStyle} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TERMS AGREEMENT */}
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "14px 16px", borderRadius: 10,
              background: agreedToTerms ? "#F0FDF4" : "#F9FAFB",
              border: `1px solid ${agreedToTerms ? "#A7F3D0" : "#E5E7EB"}`,
              transition: "all 0.15s",
            }}>
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{
                  marginTop: 2, width: 17, height: 17, cursor: "pointer",
                  accentColor: "#006B3F", flexShrink: 0,
                }}
              />
              <label htmlFor="agreeTerms" style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, cursor: "pointer" }}>
                I agree to ShieldKe's{" "}
                <Link to="/terms-of-service" target="_blank" style={{ color: "#006B3F", fontWeight: 700, textDecoration: "underline" }}>
                  Terms of Service
                </Link>
                {" "}and{" "}
                <Link to="/privacy-policy" target="_blank" style={{ color: "#006B3F", fontWeight: 700, textDecoration: "underline" }}>
                  Privacy Policy
                </Link>
                {form.role === "lawyer" && (
                  <>
                    , and the{" "}
                    <Link to="/advocate-agreement" target="_blank" style={{ color: "#006B3F", fontWeight: 700, textDecoration: "underline" }}>
                      Advocate Agreement
                    </Link>
                  </>
                )}
                .
              </label>
            </div>

            {/* SUBMIT */}
            <button
              type="submit" disabled={loading || !agreedToTerms}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 10, background: (loading || !agreedToTerms) ? "#9CA3AF" : "linear-gradient(135deg,#0B1F3A,#1A3A6E)", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: (loading || !agreedToTerms) ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: 8 }}
            >
              {loading ? "Creating account..." : <><span>Create Account</span><FiArrowRight size={16} /></>}
            </button>

          </form>
        </div>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: "#6B7280" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#0B1F3A", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
        </div>

      </div>
    </div>
  );
}
