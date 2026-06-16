import { useEffect, useState } from "react";
import socket from "../socket";
import { getToken } from "../utils/auth";
import DashboardShell from "../components/DashboardShell";
import { FiBell, FiCheckCircle, FiMessageSquare, FiAlertCircle, FiInfo } from "react-icons/fi";

const API_URL = "http://localhost:5000/api";

export default function NotificationsPage() {

  const [notifications, setNotifications] = useState([]);

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

  /* ── ICON PER TYPE ── */
  const notifIcon = (title = "") => {
    const t = title.toLowerCase();
    if (t.includes("consult") || t.includes("message")) return { icon: <FiMessageSquare size={16} />, color: "#3B82F6", bg: "#EFF6FF" };
    if (t.includes("verif") || t.includes("approved")) return { icon: <FiCheckCircle size={16} />,    color: "#10B981", bg: "#ECFDF5" };
    if (t.includes("reject") || t.includes("denied"))  return { icon: <FiAlertCircle size={16} />,    color: "#EF4444", bg: "#FEF2F2" };
    return { icon: <FiInfo size={16} />, color: "#F59E0B", bg: "#FFFBEB" };
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardShell
      title="Notifications"
      subtitle="Stay updated with consultations, chats and verification updates."
    >

      {/* ── HEADER ROW ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
            const { icon, color, bg } = notifIcon(n.title);
            return (
              <div
                key={n._id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  padding: "18px 24px",
                  borderBottom: i < notifications.length - 1 ? "1px solid #F3F4F6" : "none",
                  background: n.isRead ? "#fff" : "#F0F9FF",
                  transition: "background 0.15s",
                }}
              >
                {/* ICON */}
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
                  {icon}
                </div>

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
                </div>

                {/* ACTION */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      style={{ padding: "5px 12px", borderRadius: 7, background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#3B82F6", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                    >
                      Mark read
                    </button>
                  )}
                  {n.isRead && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9CA3AF" }}>
                      <FiCheckCircle size={12} color="#10B981" /> Read
                    </div>
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
