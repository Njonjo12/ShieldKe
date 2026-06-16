import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { FiBell } from "react-icons/fi";

export default function DashboardShell({ role, title, subtitle, topRight, children }) {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  /* auto-detect role from localStorage if not passed */
  const resolvedRole = role || user?.role || "client";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC" }}>

      {/* ── SIDEBAR ── */}
      <Sidebar role={resolvedRole} />

      {/* ── RIGHT PANEL ── */}
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── TOP BAR ── */}
        <div style={{
          height: 64,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          borderBottom: "1px solid #E5E7EB",
          position: "sticky",
          top: 0,
          zIndex: 50,
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#0B1F3A", lineHeight: 1.2 }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                {subtitle}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* custom top-right slot (badges, buttons, etc) */}
            {topRight}

            {/* Bell */}
            <div
              style={{ position: "relative", cursor: "pointer", padding: 6 }}
              onClick={() => navigate("/notifications")}
            >
              <FiBell size={20} color="#374151" />
            </div>
          </div>
        </div>

        {/* ── PAGE CONTENT ── */}
        <div style={{ flex: 1, padding: "32px", background: "#F8FAFC", overflowY: "auto" }}>
          {children}
        </div>

      </div>
    </div>
  );
}
