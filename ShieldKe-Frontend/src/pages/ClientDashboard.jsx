import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";
import Sidebar from "../components/Sidebar";
import {
  FiList, FiBriefcase, FiMessageSquare, FiShield,
  FiStar, FiArrowRight, FiBell
} from "react-icons/fi";

const API_URL = "http://localhost:5000/api";

export default function ClientDashboard() {

  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchConsultations();
    fetchLawyers();
  }, []);

  const fetchConsultations = async () => {
    try {
      const res = await fetch(`${API_URL}/consultations/client`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setConsultations(data);
    } catch (e) { console.error(e); }
  };

  const fetchLawyers = async () => {
    try {
      const res = await fetch(`${API_URL}/lawyers`);
      const data = await res.json();
      if (Array.isArray(data)) setLawyers(data.slice(0, 3));
    } catch (e) { console.error(e); }
  };

  const statusStyle = (status) => {
    if (status === "accepted") return { background: "rgba(16,185,129,0.15)", color: "#34D399", border: "1px solid rgba(16,185,129,0.3)" };
    if (status === "rejected") return { background: "rgba(239,68,68,0.15)", color: "#F87171", border: "1px solid rgba(239,68,68,0.3)" };
    return { background: "rgba(245,158,11,0.15)", color: "#FBBF24", border: "1px solid rgba(245,158,11,0.3)" };
  };

  const recent = consultations.slice(0, 3);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#07131F" }}>

      <Sidebar role="client" />

      {/* ── MAIN ── */}
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* ── TOP BAR ── */}
        <div style={{
          height: 64, background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", borderBottom: "1px solid #E5E7EB",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#0B1F3A" }}>Overview</div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>Welcome back, {user?.name}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", cursor: "pointer" }}
              onClick={() => navigate("/notifications")}>
              <FiBell size={20} color="#374151" />
              <div style={{
                position: "absolute", top: -4, right: -4,
                width: 16, height: 16, borderRadius: "50%",
                background: "#EF4444", color: "#fff",
                fontSize: 9, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #fff",
              }}>2</div>
            </div>
            <button
              onClick={() => navigate("/lawyers")}
              style={{
                background: "#3B82F6", color: "#fff", border: "none",
                padding: "9px 18px", borderRadius: 8,
                fontWeight: 700, fontSize: 14, cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              + New Consultation
            </button>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: "32px 32px", flex: 1, background: "#F8FAFC" }}>

          {/* ── STAT CARDS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 32 }}>

            {[
              { icon: <FiList size={22} />, color: "#3B82F6", bg: "#EFF6FF", value: consultations.length, label: "Consultations", sub: "View all" },
              { icon: <FiBriefcase size={22} />, color: "#F59E0B", bg: "#FFFBEB", value: consultations.filter(c => c.status === "accepted").length, label: "Active Cases", sub: "View all" },
              { icon: <FiMessageSquare size={22} />, color: "#10B981", bg: "#ECFDF5", value: consultations.filter(c => c.status === "accepted").length, label: "Messages", sub: "View all" },
              { icon: <FiShield size={22} />, color: "#8B5CF6", bg: "#F5F3FF", value: null, label: "Verified Account", sub: "Verified", subColor: "#10B981" },
            ].map((s, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 14,
                padding: "22px 24px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: s.bg, display: "flex", alignItems: "center",
                  justifyContent: "center", color: s.color, marginBottom: 14,
                }}>
                  {s.icon}
                </div>
                {s.value !== null
                  ? <div style={{ fontSize: 32, fontWeight: 800, color: "#0B1F3A", lineHeight: 1 }}>{s.value}</div>
                  : null
                }
                <div style={{ fontSize: 14, color: "#374151", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                <div style={{ fontSize: 13, color: s.subColor || "#3B82F6", fontWeight: 600, marginTop: 4, cursor: "pointer" }}>{s.sub}</div>
              </div>
            ))}

          </div>

          {/* ── TWO COLUMN ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* RECENT CONSULTATIONS */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0B1F3A" }}>Recent Consultations</div>
                <span onClick={() => navigate("/consultations")}
                  style={{ fontSize: 13, color: "#3B82F6", fontWeight: 600, cursor: "pointer" }}>
                  View all &rsaquo;
                </span>
              </div>

              {recent.length === 0 && (
                <p style={{ color: "#9CA3AF", fontSize: 14 }}>No consultations yet.</p>
              )}

              {recent.map((c) => (
                <div key={c._id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "13px 0", borderBottom: "1px solid #F3F4F6",
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1F3A" }}>
                      {c.message?.slice(0, 36) || "Consultation request"}
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>
                      {c.lawyer?.name || "Lawyer"}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{
                      ...statusStyle(c.status),
                      padding: "4px 12px", borderRadius: 999,
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {c.status?.charAt(0).toUpperCase() + c.status?.slice(1)}
                    </span>
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                      {new Date(c.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* TOP RATED LAWYERS */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0B1F3A" }}>Top Rated Lawyers</div>
                <span onClick={() => navigate("/lawyers")}
                  style={{ fontSize: 13, color: "#3B82F6", fontWeight: 600, cursor: "pointer" }}>
                  View all &rsaquo;
                </span>
              </div>

              {lawyers.length === 0 && (
                <p style={{ color: "#9CA3AF", fontSize: 14 }}>No lawyers found.</p>
              )}

              {lawyers.map((l) => (
                <div key={l._id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 0", borderBottom: "1px solid #F3F4F6",
                }}>
                  <img
                    src={
                      l.profilePhoto
                        ? `http://localhost:5000/${l.profilePhoto}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(l.name)}&background=EFF6FF&color=1D4ED8&size=80`
                    }
                    alt={l.name}
                    style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1F3A" }}>{l.name}</div>
                    <div style={{ fontSize: 12, color: "#6B7280" }}>
                      {l.specialization || "General Law"} · {l.yearsOfExperience || 0}+ years
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 10 }}>
                    <FiStar size={13} color="#F59E0B" fill="#F59E0B" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>
                      {l.rating || "4.8"}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/lawyers/${l._id}`)}
                    style={{
                      padding: "6px 14px", borderRadius: 7,
                      background: "transparent", border: "1px solid #D1D5DB",
                      color: "#374151", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Book
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
