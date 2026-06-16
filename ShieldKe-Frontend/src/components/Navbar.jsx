import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiMenu, FiX, FiLogOut, FiHome, FiMessageSquare, FiUser } from "react-icons/fi";
import socket from "../socket";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:5000/api";

export default function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  /* ── FETCH NOTIFICATIONS ── */
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  /* ── SOCKET ── */
  useEffect(() => {
    if (!user?._id) return;
    socket.emit("registerUser", user._id);
    fetchNotifications();
    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });
    return () => { socket.off("newNotification"); };
  }, []);

  /* ── LOGOUT ── */
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  /* ── DASHBOARD REDIRECT ── */
  const goToDashboard = () => {
    if (user?.role === "admin") navigate("/admin");
    else if (user?.role === "lawyer") navigate("/lawyer");
    else navigate("/client");
  };

  /* ── UNREAD COUNT ── */
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ── NAV LINKS ── */
  const navLinks = [
    {
      label: "Dashboard",
      icon: <FiHome size={16} />,
      path: user?.role === "admin" ? "/admin" : user?.role === "lawyer" ? "/lawyer" : "/client"
    },
    {
      label: "Consultations",
      icon: <FiMessageSquare size={16} />,
      path: "/consultations"
    },
    {
      label: "Profile",
      icon: <FiUser size={16} />,
      path: user?.role === "lawyer" ? "/lawyer-profile" : "/client-profile"
    }
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(20px)",
        background: "rgba(7,19,31,0.92)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "0 28px",
        height: 68,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>

        {/* ── LOGO ── */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          onClick={goToDashboard}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #006B3F, #00A86B)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: "#fff",
          }}>⚖</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: "-0.03em" }}>
            Shield<span style={{ color: "#00A86B" }}>Ke</span>
          </div>
        </motion.div>

        {/* ── DESKTOP NAV ── */}
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 6 }}>

          {navLinks.map((link) => {
            const active = location.pathname === link.path;
            return (
              <motion.div
                key={link.label}
                whileHover={{ y: -1 }}
                onClick={() => navigate(link.path)}
                className={`nav-link-item ${active ? "active" : ""}`}
              >
                {link.icon}
                {link.label}
              </motion.div>
            );
          })}

          {/* ── BELL ── */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            onClick={() => navigate("/notifications")}
            className="notification-wrapper"
          >
            <FiBell color="white" size={20} />
            {unreadCount > 0 && (
              <div className="notification-badge">{unreadCount}</div>
            )}
          </motion.div>

          {/* ── USER CHIP ── */}
          <div className="nav-user-chip">
            <img
              src={
                user?.profilePhoto
                  ? `http://localhost:5000/${user.profilePhoto}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0B1F3A&color=fff`
              }
              alt="profile"
            />
            <div>
              <div className="nav-user-name">{user?.name}</div>
              <div className="nav-user-role">{user?.role}</div>
            </div>
          </div>

          {/* ── LOGOUT ── */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={logout}
            className="nav-logout-btn"
          >
            <FiLogOut size={15} /> Logout
          </motion.button>

        </div>

        {/* ── MOBILE TOGGLE ── */}
        <div className="mobile-menu-btn">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", padding: 4 }}
          >
            {mobileOpen ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>
        </div>

      </div>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", position: "absolute", top: 68, left: 0, right: 0, background: "rgba(7,19,31,0.97)", borderBottom: "1px solid rgba(255,255,255,0.07)", zIndex: 999 }}
          >
            <div className="mobile-nav-panel">
              {navLinks.map((link) => (
                <div key={link.label} className="mobile-nav-item"
                  onClick={() => { navigate(link.path); setMobileOpen(false); }}
                >
                  {link.icon} {link.label}
                </div>
              ))}
              <button className="mobile-logout-btn" onClick={logout}>
                <FiLogOut style={{ marginRight: 8, verticalAlign: "middle" }} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.nav>
  );
}
