import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getToken, getUser } from "../utils/auth";
import DashboardShell from "./DashboardShell";
import { FiBriefcase, FiMapPin, FiDollarSign, FiAward, FiArrowLeft, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_URL = API_URL.replace("/api", "");

export default function LawyerProfile() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);
  const [existingConsultation, setExistingConsultation] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', text }

  useEffect(() => {
    fetchLawyer();
    fetchOwnConsultations();
  }, [id]);

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

  /* check whether the current client already has a pending/accepted
     consultation with THIS lawyer, so we can show that status up
     front instead of letting them click and find out via an error */
  const fetchOwnConsultations = async () => {
    try {
      const res = await fetch(`${API_URL}/consultations/client`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const blocking = data.find(
          (c) => c.lawyer?._id === id && (c.status === "pending" || c.status === "accepted")
        );
        setExistingConsultation(blocking || null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const requestConsultation = async () => {
    const user = getUser();
    setRequesting(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_URL}/consultations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ clientId: user._id, lawyerId: lawyer._id, message: "I would like legal consultation." })
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", text: data.message || "Could not send request. Please try again." });
        /* a 409 means a blocking consultation already exists somewhere —
           refresh so the UI reflects it instead of staying stale */
        if (res.status === 409) fetchOwnConsultations();
        return;
      }

      setFeedback({ type: "success", text: "Consultation request sent! The lawyer will respond shortly." });
      setExistingConsultation(data);
    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", text: "Network error. Please try again." });
    } finally {
      setRequesting(false);
    }
  };

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
                ? `${SERVER_URL}/${lawyer.profilePhoto}`
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

          {/* REQUEST BUTTON — or existing-consultation status */}
          {existingConsultation ? (
            <div style={{
              padding: "14px 16px", borderRadius: 10,
              background: existingConsultation.status === "pending" ? "#FFFBEB" : "#ECFDF5",
              border: `1px solid ${existingConsultation.status === "pending" ? "#FDE68A" : "#A7F3D0"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 6, color: existingConsultation.status === "pending" ? "#92400E" : "#059669", fontWeight: 700, fontSize: 13 }}>
                {existingConsultation.status === "pending" ? <FiClock size={14} /> : <FiCheckCircle size={14} />}
                {existingConsultation.status === "pending" ? "Request Pending" : "Active Consultation"}
              </div>
              <div style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.6, marginBottom: 10 }}>
                {existingConsultation.status === "pending"
                  ? "You'll be notified once this lawyer responds."
                  : "You already have an active consultation with this lawyer."}
              </div>
              <button
                onClick={() => navigate("/consultations")}
                style={{ width: "100%", padding: "9px", borderRadius: 8, background: "#fff", border: "1px solid #D1D5DB", color: "#374151", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                View Consultation
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={requestConsultation}
                disabled={requesting}
                style={{ width: "100%", padding: "13px", borderRadius: 10, background: requesting ? "#9CA3AF" : "linear-gradient(135deg,#006B3F,#00A86B)", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: requesting ? "not-allowed" : "pointer", fontFamily: "inherit" }}
              >
                {requesting ? "Sending..." : "Request Consultation"}
              </button>

              {feedback && (
                <div style={{
                  marginTop: 12, padding: "10px 14px", borderRadius: 9,
                  background: feedback.type === "success" ? "#ECFDF5" : "#FEF2F2",
                  border: `1px solid ${feedback.type === "success" ? "#A7F3D0" : "#FECACA"}`,
                  color: feedback.type === "success" ? "#059669" : "#DC2626",
                  fontSize: 12.5, display: "flex", alignItems: "flex-start", gap: 7, textAlign: "left", lineHeight: 1.6,
                }}>
                  {feedback.type === "success" ? <FiCheckCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> : <FiAlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />}
                  {feedback.text}
                </div>
              )}
            </>
          )}
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
