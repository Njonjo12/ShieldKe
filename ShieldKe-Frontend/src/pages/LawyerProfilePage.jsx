import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import DashboardShell from "../components/DashboardShell";
import ProfilePhotoUploader from "../components/ProfilePhotoUploader";
import { FiMail, FiPhone, FiMapPin, FiBriefcase, FiAward, FiDollarSign, FiCheckCircle } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_URL = API_URL.replace("/api", "");

export default function LawyerProfilePage() {

  const [lawyer, setLawyer] = useState(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setLawyer(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!lawyer) return (
    <DashboardShell title="My Profile" subtitle="Loading...">
      <div style={{ background: "#fff", borderRadius: 14, padding: "48px 24px", textAlign: "center", color: "#9CA3AF", border: "1px solid #E5E7EB" }}>
        Loading profile...
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell title="My Profile" subtitle="Your public lawyer profile visible to clients.">

      {/* TOP PROFILE BANNER */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", padding: "28px 32px", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 24 }}>
        <ProfilePhotoUploader
          currentPhotoUrl={lawyer.profilePhoto ? `${SERVER_URL}/${lawyer.profilePhoto}` : null}
          userName={lawyer.name}
          uploadUrl={`${API_URL}/lawyers/profile/photo`}
          size={90}
          ringColor="#00A86B"
          onUpdated={(updated) => setLawyer((prev) => ({ ...prev, ...updated }))}
        />
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0B1F3A", marginBottom: 4 }}>{lawyer.name}</div>
          <div style={{ fontSize: 15, color: "#6B7280", marginBottom: 10 }}>{lawyer.specialization}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: "#ECFDF5", color: "#059669", fontSize: 13, fontWeight: 700, border: "1px solid #A7F3D0" }}>
            <FiCheckCircle size={13} /> {lawyer.verificationStatus}
          </div>
        </div>
      </div>

      {/* INFO GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { icon: <FiMail size={16} />,       label: "Email",            value: lawyer.email,                         color: "#3B82F6" },
          { icon: <FiPhone size={16} />,      label: "Phone",            value: lawyer.phone || "Not provided",        color: "#10B981" },
          { icon: <FiBriefcase size={16} />,  label: "Experience",       value: `${lawyer.yearsOfExperience || 0} years`, color: "#F59E0B" },
          { icon: <FiMapPin size={16} />,     label: "Location",         value: lawyer.location || "Not provided",     color: "#EF4444" },
          { icon: <FiDollarSign size={16} />, label: "Consultation Fee", value: `KES ${lawyer.consultationFee || 0}`, color: "#8B5CF6" },
          { icon: <FiAward size={16} />,      label: "LSK Number",       value: lawyer.lskNumber || "Not provided",    color: "#06B6D4" },
        ].map((item) => (
          <div key={item.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: item.color + "15", display: "flex", alignItems: "center", justifyContent: "center", color: item.color }}>
                {item.icon}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0B1F3A" }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* BIO */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", padding: "24px 28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#0B1F3A", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 20, background: "linear-gradient(135deg,#006B3F,#00A86B)", borderRadius: 4 }} />
          Professional Bio
        </div>
        <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.9 }}>
          {lawyer.bio || "No professional bio added yet."}
        </p>
      </div>

    </DashboardShell>
  );
}
