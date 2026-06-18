import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import { getToken } from "../utils/auth";
import DashboardShell from "../components/DashboardShell";
import {
  FiBell, FiCheckCircle, FiMessageSquare, FiAlertCircle,
  FiInfo, FiPhone, FiChevronRight,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_URL = API_URL.replace("/api", "");

export default function NotificationsPage() {

  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  /* ── LOAD + SOCKET ── */
  useEffect(() => {
    loadNotifications();
    socket.on("newNotification", (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });
    return () => { socket.off("newNotification"); };
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  /* ── MARK AS READ ── */
  const markAsRead = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    for (const n of unread) { await markAsRead(n._id); }
  };

  /* ── CLICK-THROUGH: jump to the exact related item ── */
  const goToNotification = (n) => {
    if (!n.isRead) markAsRead(n._id);

    const consultationId =
      typeof n.relatedConsultation === "object"
        ? n.relatedConsultation?._id
        : n.relatedConsultation;

    if (!consultationId) return; // verification/system notices have nowhere to deep-link to

    if (currentUser?.role === "lawyer") {
      navigate(`/lawyer?consultationId=${consultationId}`);
    } else if (currentUser?.role === "client") {
      navigate(`/consultations?consultationId=${consultationId}`);
    }
    /* admins don't have a single-consultation deep-link view yet —
       send them to the consultations tab instead */
    else if (currentUser?.role === "admin") {
      navigate(`/admin?tab=consultations`);
    }
  };

  /* ── ICON PER REAL TYPE (backend now sets this reliably) ── */
  const notifIcon = (type) => {
    if (type === "call")          return { icon: <FiPhone size={16} />,         color: "#8B5CF6", bg: "#F5F3FF" };
    if (type === "message")       return { icon: <FiMessageSquare size={16} />, color: "#3B82F6", bg: "#EFF6FF" };
    if (type === "consultation")  return { icon: <FiMessageSquare size={16} />, color: "#3B82F6", bg: "#EFF6FF" };
    if (type === "verification")  return { icon: <FiCheckCircle size={16} />,   color: "#10B981", bg: "#ECFDF5" };
    if (type === "payment")       return { icon: <FiAlertCircle size={16} />,   color: "#F59E0B", bg: "#FFFBEB" };
    return { icon: <FiInfo size={16} />, color: "#6B7280", bg: "#F3F4F6" };
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardShell
      title="Notifications"
      subtitle="Stay updated with consultations, chats, calls and verification updates."
    >

      {/* ── HEADER ROW ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FiBell size={20} color="#3B82F6" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0B1F3A" }}>
              All Notifications
            </div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{ padding: "8px 16px", borderRadius: 9, background: "#fff", border: "1px solid #E5E7EB", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* ── EMPTY STATE ── */}
      {notifications.length === 0 && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", padding: "64px 24px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <FiBell size={28} color="#D1D5DB" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 6 }}>No notifications yet</div>
          <div style={{ fontSize: 14, color: "#9CA3AF" }}>You're all caught up! Check back later.</div>
        </div>
      )}

      {/* ── NOTIFICATION LIST ── */}
      {notifications.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          {notifications.map((n, i) => {
            const { icon, color, bg } = notifIcon(n.type);
            const hasDeepLink = !!n.relatedConsultation;
            const senderName = n.sender?.name;

            return (
              <div
                key={n._id}
                onClick={() => goToNotification(n)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  padding: "18px 24px",
                  borderBottom: i < notifications.length - 1 ? "1px solid #F3F4F6" : "none",
                  background: n.isRead ? "#fff" : "#F0F9FF",
                  transition: "background 0.15s",
                  cursor: hasDeepLink ? "pointer" : "default",
                }}
              >
                {/* SENDER AVATAR (falls back to type icon if no sender) */}
                {senderName ? (
                  <img
                    src={
                      n.sender?.profilePhoto
                        ? `${SERVER_URL}/${n.sender.profilePhoto}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=EFF6FF&color=1D4ED8&size=80`
                    }
                    alt={senderName}
                    style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
                    {icon}
                  </div>
                )}

                {/* TEXT */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: n.isRead ? 600 : 800, color: "#0B1F3A" }}>
                      {n.title}
                    </div>
                    {!n.isRead && (
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6", flexShrink: 0 }} />
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{n.message}</div>
                  {senderName && (
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4, fontWeight: 600 }}>
                      from {senderName}
                    </div>
                  )}
                </div>

                {/* ACTION */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                  {!n.isRead && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}
                      style={{ padding: "5px 12px", borderRadius: 7, background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#3B82F6", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                    >
                      Mark read
                    </button>
                  )}
                  {n.isRead && !hasDeepLink && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9CA3AF" }}>
                      <FiCheckCircle size={12} color="#10B981" /> Read
                    </div>
                  )}
                  {hasDeepLink && (
                    <FiChevronRight size={16} color="#D1D5DB" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </DashboardShell>
  );
}
