import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getToken, getUser } from "../utils/auth";
import DashboardShell from "./DashboardShell";
import { FiBriefcase, FiMapPin, FiDollarSign, FiAward, FiArrowLeft, FiCheckCircle } from "react-icons/fi";

const API_URL = "http://localhost:5000/api";

export default function LawyerProfile() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        const res = await fetch(`${API_URL}/lawyers/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        setLawyer(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLawyer();
  }, [id]);

  if (!lawyer) return (
    <DashboardShell title="Lawyer Profile" subtitle="Loading...">
      <div style={{ background: "#fff", borderRadius: 14, padding: "48px 24px", textAlign: "center", color: "#9CA3AF", border: "1px solid #E5E7EB" }}>
        Loading profile...
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell title="Lawyer Profile" subtitle={lawyer.name}>

      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, background: "#fff", border: "1px solid #E5E7EB", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <FiArrowLeft size={15} /> Back
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "start" }}>

        {/* LEFT — PROFILE CARD */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", textAlign: "center" }}>
          <img
            src={
              lawyer.profilePhoto
                ? `http://localhost:5000/${lawyer.profilePhoto}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.name)}&background=EFF6FF&color=1D4ED8&size=160`
            }
            alt={lawyer.name}
            style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "4px solid #DBEAFE", margin: "0 auto 16px" }}
          />
          <div style={{ fontSize: 20, fontWeight: 800, color: "#0B1F3A", marginBottom: 6 }}>{lawyer.name}</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}>{lawyer.specialization}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 999, background: "#ECFDF5", color: "#059669", fontSize: 12, fontWeight: 700, border: "1px solid #A7F3D0", marginBottom: 24 }}>
            <FiCheckCircle size={12} /> Verified Lawyer
          </div>

          {/* STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            {[
              { label: "Experience", value: `${lawyer.yearsOfExperience || 0} yrs`, icon: <FiBriefcase size={14} /> },
              { label: "Location",   value: lawyer.location || "N/A",               icon: <FiMapPin size={14} /> },
              { label: "Fee",        value: `KES ${lawyer.consultationFee || 0}`,   icon: <FiDollarSign size={14} /> },
              { label: "LSK No.",    value: lawyer.lskNumber || "N/A",              icon: <FiAward size={14} /> },
            ].map((item) => (
              <div key={item.label} style={{ background: "#F9FAFB", borderRadius: 9, padding: "10px 12px", border: "1px solid #E5E7EB", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#9CA3AF", fontSize: 11, fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {item.icon} {item.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0B1F3A" }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* REQUEST BUTTON */}
          <button
            style={{ width: "100%", padding: "13px", borderRadius: 10, background: "linear-gradient(135deg,#006B3F,#00A86B)", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            onClick={async () => {
              const user = getUser();
              try {
                await fetch(`${API_URL}/consultations`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
                  body: JSON.stringify({ clientId: user._id, lawyerId: lawyer._id, message: "I would like legal consultation." })
                });
                alert("Consultation request sent!");
              } catch (error) {
                console.error(error);
              }
            }}
          >
            Request Consultation
          </button>
        </div>

        {/* RIGHT — BIO CARD */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0B1F3A", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 4, height: 20, background: "linear-gradient(135deg,#006B3F,#00A86B)", borderRadius: 4 }} />
            Professional Bio
          </div>
          <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.9 }}>
            {lawyer.bio || "No professional bio added yet."}
          </p>
        </div>

      </div>

    </DashboardShell>
  );
}
