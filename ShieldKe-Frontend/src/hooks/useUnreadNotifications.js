import { useState, useEffect } from "react";
import socket from "../socket";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:5000/api";

/*
========================================
useUnreadNotifications

Single source of truth for the bell badge
count, used on every dashboard so they
all show the exact same, real number
instead of hardcoded placeholders.

Fetches once on mount, then increments
live whenever the server pushes a
"newNotification" socket event.
========================================
*/

export default function useUnreadNotifications() {

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {

    try {

      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      }

    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }

  };

  useEffect(() => {

    fetchNotifications();

    const handleNew = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("newNotification", handleNew);

    return () => socket.off("newNotification", handleNew);

  }, []);

  return { notifications, unreadCount, refetch: fetchNotifications };
}
