import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getToken } from "../utils/auth";
import DashboardShell from "../components/DashboardShell";
import ChatWindow from "../components/ChatWindow";
import useIsMobile from "../hooks/useIsMobile";
import { FiMessageSquare, FiCheckCircle, FiClock, FiXCircle, FiUser } from "react-icons/fi";

const API_URL = "http://localhost:5000/api";

export default function Consultations() {

  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const [consultations, setConsultations] = useState([]);
  const [activeConsultation, setActiveConsultation] = useState(null);

  /* ── FETCH ── */
  const fetchConsultations = async () => {
    try {
      const res = await fetch(`${API_URL}/consultations/client`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setConsultations(data);

        /* deep-link from a notification: ?consultationId=XXX */
        const deepLinkId = searchParams.get("consultationId");
        if (deepLinkId) {
          const match = data.find((c) => c._id === deepLinkId);
          if (match) setActiveConsultation(match);
        }
      }
      else setConsultations([]);
    } catch (error) {
      console.error("Consultation fetch error", error);
    }
  };

  useEffect(() => { fetchConsultations(); }, []);

  /* ── STATUS STYLE ── */
  const statusStyle = (status) => {
    if (status === "accepted") return { bg: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.25)" };
    if (status === "rejected") return { bg: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.25)" };
    return { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)" };
  };

  const statusIcon = (status) => {
    if (status === "accepted") return <FiCheckCircle size={14} color="#10B981" />;
    if (status === "rejected") return <FiXCircle size={14} color="#EF4444" />;
    return <FiClock size={14} color="#F59E0B" />;
  };

  return (
    <DashboardShell
      title="My Consultations"
      subtitle="Track your consultation requests and open accepted chats."
    >

      {/* ── STAT ROW ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: isMobile ? 12 : 20, marginBottom: isMobile ? 20 : 28 }}>
        {[
          { label: "Total",    value: consultations.length,                                          color: "#3B82F6", bg: "#EFF6FF" },
          { label: "Accepted", value: consultations.filter(c => c.status === "accepted").length,     color: "#10B981", bg: "#ECFDF5" },
          { label: "Pending",  value: consultations.filter(c => c.status === "pending").length,      color: "#F59E0B", bg: "#FFFBEB" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginTop: 4 }}>{s.label} Consultations</div>
          </div>
        ))}
      </div>

      {/* ── LIST ── */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

        {/* TABLE HEADER — desktop only, mobile uses stacked cards instead */}
        {!isMobile && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px", gap: 0, padding: "12px 24px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
            {["Lawyer", "Message", "Status", "Date"].map((h) => (
              <div key={h} style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {consultations.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "#9CA3AF" }}>
            <FiMessageSquare size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 15, fontWeight: 600 }}>No consultations yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Your consultation requests will appear here.</div>
          </div>
        )}

        {/* ROWS */}
        {consultations.map((c) => {
          const st = statusStyle(c.status);
          const isActive = activeConsultation?._id === c._id;

          if (isMobile) {
            return (
              <div
                key={c._id}
                onClick={() => setActiveConsultation(isActive ? null : c)}
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid #F3F4F6",
                  cursor: "pointer",
                  background: isActive ? "#F0FDF4" : "#fff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#3B82F6", flexShrink: 0 }}>
                    <FiUser size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1F3A" }}>{c.lawyer?.name || "Lawyer"}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{c.lawyer?.specialization || "Legal Professional"}</div>
                  </div>
                  <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, border: st.border, flexShrink: 0 }}>
                    {c.status?.charAt(0).toUpperCase() + c.status?.slice(1)}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#374151", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.message || "Consultation request"}
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                  {new Date(c.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
            );
          }

          return (
            <div
              key={c._id}
              onClick={() => setActiveConsultation(isActive ? null : c)}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 120px 100px",
                gap: 0,
                padding: "16px 24px",
                borderBottom: "1px solid #F3F4F6",
                cursor: "pointer",
                background: isActive ? "#F0FDF4" : "#fff",
                transition: "background 0.15s",
              }}
            >
              {/* LAWYER */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#3B82F6", flexShrink: 0 }}>
                  <FiUser size={15} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1F3A" }}>{c.lawyer?.name || "Lawyer"}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{c.lawyer?.specialization || "Legal Professional"}</div>
                </div>
              </div>

              {/* MESSAGE */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
                  {c.message || "Consultation request"}
                </span>
              </div>

              {/* STATUS */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {statusIcon(c.status)}
                <span style={{
                  padding: "4px 12px", borderRadius: 999,
                  fontSize: 12, fontWeight: 700,
                  background: st.bg, color: st.color, border: st.border,
                }}>
                  {c.status?.charAt(0).toUpperCase() + c.status?.slice(1)}
                </span>
              </div>

              {/* DATE */}
              <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: "#9CA3AF" }}>
                {new Date(c.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CHAT WINDOW ── */}
      {activeConsultation && activeConsultation.status === "accepted" && (
        <div style={{ marginTop: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 4, height: 20, background: "linear-gradient(135deg,#006B3F,#00A86B)", borderRadius: 4 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0B1F3A" }}>Consultation Chat</div>
          </div>
          <ChatWindow consultationId={activeConsultation._id} />
        </div>
      )}

    </DashboardShell>
  );
}
