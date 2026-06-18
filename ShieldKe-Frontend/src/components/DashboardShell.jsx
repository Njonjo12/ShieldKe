import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import useIsMobile from "../hooks/useIsMobile";
import useUnreadNotifications from "../hooks/useUnreadNotifications";
import { FiBell } from "react-icons/fi";

export default function DashboardShell({ role, title, subtitle, topRight, children }) {

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { unreadCount } = useUnreadNotifications();
  const user = JSON.parse(localStorage.getItem("user"));

  /* auto-detect role from localStorage if not passed */
  const resolvedRole = role || user?.role || "client";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC" }}>

      {/* ── SIDEBAR ── */}
      <Sidebar role={resolvedRole} />

      {/* ── RIGHT PANEL ── */}
      <div style={{ marginLeft: isMobile ? 0 : 240, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", width: isMobile ? "100%" : "auto" }}>

        {/* ── TOP BAR ── */}
        <div style={{
          height: 64,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 16px 0 64px" : "0 32px",
          borderBottom: "1px solid #E5E7EB",
          position: "sticky",
          top: 0,
          zIndex: 50,
          flexShrink: 0,
        }}>
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 800, color: "#0B1F3A", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {title}
            </div>
            {subtitle && !isMobile && (
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                {subtitle}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            {/* custom top-right slot (badges, buttons, etc) */}
            {topRight}

            {/* Bell — real unread count */}
            <div
              style={{ position: "relative", cursor: "pointer", padding: 6 }}
              onClick={() => navigate("/notifications")}
            >
              <FiBell size={20} color="#374151" />
              {unreadCount > 0 && (
                <div style={{
                  position: "absolute", top: 1, right: 1,
                  minWidth: 16, height: 16, padding: "0 3px", borderRadius: 8,
                  background: "#EF4444", color: "#fff",
                  fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid #fff",
                }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── PAGE CONTENT ── */}
        <div style={{ flex: 1, padding: isMobile ? "20px 16px" : "32px", background: "#F8FAFC", overflowY: "auto" }}>
          {children}
        </div>

      </div>
    </div>
  );
}
