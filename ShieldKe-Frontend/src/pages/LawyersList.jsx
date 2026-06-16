import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSearch, FiMapPin, FiBriefcase, FiCheckCircle, FiStar } from "react-icons/fi";
import DashboardShell from "../components/DashboardShell";

const API_URL = "http://localhost:5000/api";

export default function LawyersList() {

  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");

  /* ── FETCH ── */
  useEffect(() => { fetchLawyers(); }, []);

  const fetchLawyers = async () => {
    try {
      const res = await fetch(`${API_URL}/lawyers`);
      const data = await res.json();
      if (Array.isArray(data)) setLawyers(data);
      else setLawyers([]);
    } catch (error) {
      console.error("Lawyers fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ── FILTERS ── */
  const specializations = ["all", ...new Set(lawyers.map(l => l.specialization).filter(Boolean))];

  const filteredLawyers = lawyers.filter((l) => {
    const matchesSearch =
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = specializationFilter === "all" || l.specialization === specializationFilter;
    return matchesSearch && matchesSpec;
  });

  return (
    <DashboardShell
      title="Find a Lawyer"
      subtitle="Connect with verified legal professionals on ShieldKe."
    >

      {/* ── SEARCH + FILTER BAR ── */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>

        {/* SEARCH */}
        <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
          <FiSearch size={16} color="#9CA3AF" style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "11px 14px 11px 40px",
              borderRadius: 10, border: "1px solid #E5E7EB",
              background: "#fff", color: "#374151", fontSize: 14,
              outline: "none", fontFamily: "inherit",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          />
        </div>

        {/* FILTER */}
        <select
          value={specializationFilter}
          onChange={(e) => setSpecializationFilter(e.target.value)}
          style={{
            minWidth: 220, padding: "11px 14px",
            borderRadius: 10, border: "1px solid #E5E7EB",
            background: "#fff", color: "#374151", fontSize: 14,
            outline: "none", fontFamily: "inherit", cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          {specializations.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All Specializations" : s}</option>
          ))}
        </select>

      </div>

      {/* ── COUNT ── */}
      {!loading && (
        <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20, fontWeight: 500 }}>
          Showing <strong style={{ color: "#0B1F3A" }}>{filteredLawyers.length}</strong> verified lawyers
        </div>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ background: "#fff", borderRadius: 14, padding: "48px 24px", textAlign: "center", color: "#9CA3AF", border: "1px solid #E5E7EB" }}>
          Loading verified lawyers...
        </div>
      )}

      {/* ── EMPTY ── */}
      {!loading && filteredLawyers.length === 0 && (
        <div style={{ background: "#fff", borderRadius: 14, padding: "48px 24px", textAlign: "center", color: "#9CA3AF", border: "1px solid #E5E7EB" }}>
          No lawyers found matching your search.
        </div>
      )}

      {/* ── GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {filteredLawyers.map((lawyer, index) => (
          <motion.div
            key={lawyer._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
            onClick={() => navigate(`/lawyers/${lawyer._id}`)}
            style={{
              background: "#fff", borderRadius: 14,
              border: "1px solid #E5E7EB",
              padding: 24, cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              transition: "box-shadow 0.2s, transform 0.2s",
            }}
          >
            {/* AVATAR + NAME */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <img
                src={
                  lawyer.profilePhoto
                    ? `http://localhost:5000/${lawyer.profilePhoto}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.name)}&background=EFF6FF&color=1D4ED8&size=80`
                }
                alt={lawyer.name}
                style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "3px solid #DBEAFE", flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0B1F3A", marginBottom: 5 }}>{lawyer.name}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: "#ECFDF5", color: "#059669", fontSize: 12, fontWeight: 700, border: "1px solid #A7F3D0" }}>
                  <FiCheckCircle size={11} /> Verified
                </div>
              </div>
            </div>

            {/* DETAILS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6B7280" }}>
                <FiBriefcase size={13} color="#9CA3AF" />
                {lawyer.specialization || "General Practice"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6B7280" }}>
                <FiMapPin size={13} color="#9CA3AF" />
                {lawyer.location || "Location not provided"}
              </div>
            </div>

            {/* BIO */}
            <p style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.7, marginBottom: 16, minHeight: 58 }}>
              {lawyer.bio ? lawyer.bio.slice(0, 110) + "..." : "Experienced legal professional ready to assist with legal consultation and representation."}
            </p>

            {/* FOOTER */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid #F3F4F6" }}>
              <div style={{ display: "flex", flex: 1, gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, marginBottom: 2 }}>EXPERIENCE</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1F3A" }}>{lawyer.yearsOfExperience || 0} yrs</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, marginBottom: 2 }}>RATING</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 700, color: "#0B1F3A" }}>
                    <FiStar size={12} color="#F59E0B" fill="#F59E0B" />
                    {lawyer.rating || "4.8"}
                  </div>
                </div>
              </div>
              <button
                style={{ padding: "8px 16px", borderRadius: 8, background: "#0B1F3A", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                View Profile
              </button>
            </div>
          </motion.div>
        ))}
      </div>

    </DashboardShell>
  );
}
