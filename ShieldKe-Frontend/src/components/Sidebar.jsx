import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome, FiUsers, FiList, FiMessageSquare,
  FiUser, FiCheckSquare, FiSettings, FiLogOut, FiShield
} from "react-icons/fi";

export default function Sidebar({ role }) {

  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user"));

  /* ── nav items per role ── */
  const links = {
    client: [
      { label: "Overview",          icon: <FiHome size={17}/>,        path: "/client" },
      { label: "Find Lawyers",      icon: <FiUsers size={17}/>,       path: "/lawyers" },
      { label: "My Consultations",  icon: <FiList size={17}/>,        path: "/consultations" },
      { label: "Messages",          icon: <FiMessageSquare size={17}/>,path: "/consultations" },
      { label: "Profile",           icon: <FiUser size={17}/>,        path: "/client-profile" },
    ],
    lawyer: [
      { label: "Overview",   icon: <FiHome size={17}/>,         path: "/lawyer" },
      { label: "Requests",   icon: <FiList size={17}/>,         path: "/lawyer" },
      { label: "My Cases",   icon: <FiCheckSquare size={17}/>,  path: "/consultations" },
      { label: "Messages",   icon: <FiMessageSquare size={17}/>,path: "/consultations" },
      { label: "Profile",    icon: <FiUser size={17}/>,         path: "/lawyer-profile" },
    ],
    admin: [
      { label: "Overview",       icon: <FiHome size={17}/>,         path: "/admin" },
      { label: "Verifications",  icon: <FiCheckSquare size={17}/>,  path: "/admin" },
      { label: "Users",          icon: <FiUsers size={17}/>,        path: "/admin" },
      { label: "Consultations",  icon: <FiList size={17}/>,         path: "/admin" },
      { label: "Settings",       icon: <FiSettings size={17}/>,     path: "/admin" },
    ],
  };

  const portalLabel = { client: "Client Portal", lawyer: "Lawyer Portal", admin: "Admin Panel" };
  const accentColor  = { client: "#3B82F6",       lawyer: "#F59E0B",       admin: "#10B981" };
  const accent = accentColor[role] || "#10B981";
  const navItems = links[role] || links.client;

  return (
    <div style={{
      width: 240,
      minHeight: "100vh",
      background: "#0B1F3A",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0, left: 0, bottom: 0,
      zIndex: 100,
      borderRight: "1px solid rgba(255,255,255,0.06)",
    }}>

      {/* ── LOGO ── */}
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "linear-gradient(135deg,#C9961A,#F0BE4A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <FiShield size={18} color="#0B1F3A" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em", lineHeight: 1 }}>
              SHIELDKE
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", marginTop: 2 }}>
              LEGAL CONNECT
            </div>
          </div>
        </div>

        {/* portal pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 999,
          background: `${accent}18`,
          border: `1px solid ${accent}30`,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent }} />
          <span style={{ color: accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>
            {portalLabel[role]}
          </span>
        </div>
      </div>

      {/* ── NAV LINKS ── */}
      <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <motion.button
              key={item.label}
              whileHover={{ x: 3 }}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "11px 14px", borderRadius: 10,
                border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 14, fontWeight: active ? 700 : 500,
                background: active ? `${accent}18` : "transparent",
                color: active ? accent : "rgba(255,255,255,0.55)",
                textAlign: "left", width: "100%",
                transition: "all 0.15s",
                borderLeft: active ? `3px solid ${accent}` : "3px solid transparent",
              }}
            >
              {item.icon}
              {item.label}
            </motion.button>
          );
        })}
      </nav>

      {/* ── USER FOOTER ── */}
      <div style={{ padding: "14px 16px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <img
            src={
              user?.profilePhoto
                ? `http://localhost:5000/${user.profilePhoto}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=132843&color=fff&size=80`
            }
            alt="avatar"
            style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: `2px solid ${accent}`, flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name}
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textTransform: "capitalize" }}>
              {user?.role}
            </div>
          </div>
          <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 12 }}>
            ▾
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            padding: "9px 12px", borderRadius: 8,
            background: "rgba(185,28,28,0.12)", border: "1px solid rgba(185,28,28,0.2)",
            color: "#FCA5A5", fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          <FiLogOut size={14} /> Logout
        </button>
      </div>

    </div>
  );
}
