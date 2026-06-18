import { useEffect, useState } from "react";
import { authHeaders } from "../utils/api";
import DashboardShell from "./DashboardShell";
import ProfilePhotoUploader from "./ProfilePhotoUploader";
import useIsMobile from "../hooks/useIsMobile";
import { FiPhone, FiMapPin, FiCheckCircle } from "react-icons/fi";

const API_URL = "http://localhost:5000/api/clients/profile";

export default function ClientProfile() {

  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone: "", location: "", bio: "" });
  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch(API_URL, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => {
        /* a brand-new client has no profile sub-document yet — the
           backend correctly returns a 404 with no `profile` key in
           that case. That's expected, not an error: just means the
           form below should render blank instead of pre-filled. */
        if (data.profile) {
          setProfile(data.profile);
          setForm({
            phone: data.profile.phone || "",
            location: data.profile.location || "",
            bio: data.profile.bio || "",
          });
        }
      })
      .catch((err) => console.error("Profile fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Profile updated successfully");
        setProfile(data.profile || form);
      }
    } catch (err) {
      console.error("Profile save error:", err);
    }
  };

  /* only the initial fetch attempt gates the page now — not whether
     a profile sub-document happens to exist yet */
  if (loading) return (
    <DashboardShell title="My Profile" subtitle="Loading...">
      <div style={{ background: "#fff", borderRadius: 14, padding: "48px 24px", textAlign: "center", color: "#9CA3AF", border: "1px solid #E5E7EB" }}>
        Loading profile...
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell title="My Profile" subtitle="Manage your personal information.">

      {/* PROFILE BANNER */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", padding: isMobile ? "20px" : "28px 32px", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: isMobile ? 16 : 24, flexWrap: isMobile ? "wrap" : "nowrap" }}>
        <ProfilePhotoUploader
          currentPhotoUrl={user?.profilePhoto ? `http://localhost:5000/${user.profilePhoto}` : null}
          userName={user?.name}
          uploadUrl="http://localhost:5000/api/clients/profile/photo"
          size={isMobile ? 64 : 80}
          ringColor="#3B82F6"
        />
        <div>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#0B1F3A", marginBottom: 4 }}>{user?.name}</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>{user?.email}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "#EFF6FF", color: "#3B82F6", fontSize: 12, fontWeight: 700, border: "1px solid #BFDBFE" }}>
            <FiCheckCircle size={12} /> Client Account
          </div>
        </div>
      </div>

      {/* GENTLE NUDGE — only shown the first time, before any profile sub-document exists */}
      {!profile && (
        <div style={{ padding: "14px 18px", borderRadius: 10, background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E", fontSize: 14, marginBottom: 20 }}>
          You haven't added your phone, location or bio yet — fill in the form below so lawyers can get to know you better.
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {message && (
        <div style={{ padding: "14px 18px", borderRadius: 10, background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#059669", fontSize: 14, fontWeight: 600, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <FiCheckCircle size={15} /> {message}
        </div>
      )}

      {/* EDIT FORM */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", padding: isMobile ? "20px" : "28px 32px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#0B1F3A", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 20, background: "linear-gradient(135deg,#006B3F,#00A86B)", borderRadius: 4 }} />
          Edit Profile
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>

            {/* PHONE */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                <FiPhone size={13} /> Phone
              </label>
              <input
                name="phone"
                placeholder="Phone number"
                value={form.phone}
                onChange={handleChange}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#374151", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* LOCATION */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                <FiMapPin size={13} /> Location
              </label>
              <input
                name="location"
                placeholder="City or region"
                value={form.location}
                onChange={handleChange}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#374151", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
              />
            </div>

          </div>

          {/* BIO */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Bio
            </label>
            <textarea
              name="bio"
              placeholder="Tell lawyers a bit about yourself and what kind of legal help you need..."
              value={form.bio}
              onChange={handleChange}
              style={{ width: "100%", minHeight: 100, padding: "11px 14px", borderRadius: 9, border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#374151", fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            style={{ padding: "12px 28px", borderRadius: 10, background: "linear-gradient(135deg,#006B3F,#00A86B)", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", width: isMobile ? "100%" : "auto" }}
          >
            Save Changes
          </button>
        </form>
      </div>

    </DashboardShell>
  );
}
