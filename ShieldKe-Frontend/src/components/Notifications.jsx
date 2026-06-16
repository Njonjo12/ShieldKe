import { useEffect, useState } from "react";

import socket from "../socket";

import { getToken } from "../utils/auth";

const API_URL = "http://localhost:5000/api";

export default function Notifications() {

  const [notifications, setNotifications] =
    useState([]);

  useEffect(() => {

    loadNotifications();

    socket.on(
      "newNotification",
      (notification) => {

        setNotifications((prev) => [
          notification,
          ...prev
        ]);

      }
    );

    return () => {

      socket.off("newNotification");

    };

  }, []);


  const loadNotifications = async () => {

    try {

      const res = await fetch(

        `${API_URL}/notifications`,

        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }

      );

      const data = await res.json();

      setNotifications(data);

    } catch (error) {

      console.error(error);

    }

  };


  const markAsRead = async (id) => {

    try {

      await fetch(

        `${API_URL}/notifications/${id}/read`,

        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }

      );

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id
            ? { ...n, isRead: true }
            : n
        )
      );

    } catch (error) {

      console.error(error);

    }

  };


  return (

    <div className="card">

      <h3>
        Notifications
      </h3>

      {notifications.length === 0 && (
        <p>No notifications</p>
      )}

      {notifications.map((n) => (

        <div
          key={n._id}
          style={{
            padding: "10px",
            marginBottom: "10px",
            background:
              n.isRead
                ? "#f5f5f5"
                : "#DCF8C6",
            borderRadius: "8px"
          }}
        >

          <strong>
            {n.title}
          </strong>

          <p>
            {n.message}
          </p>

          {!n.isRead && (

            <button
              onClick={() =>
                markAsRead(n._id)
              }
            >
              Mark as Read
            </button>

          )}

        </div>

      ))}

    </div>

  );

}