import { useState, useEffect } from "react";
import socket from "../socket";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:5000/api";

export default function ChatWindow({ consultationId }) {

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {

    if (!consultationId) return;

    socket.emit("joinRoom", consultationId);

    const loadMessages = async () => {

      try {

        const res = await fetch(
          `${API_URL}/messages/${consultationId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`
            }
          }
        );

        const data = await res.json();

        if (Array.isArray(data)) {
          setMessages(data);
        }

      } catch (err) {

        console.error("Message load error", err);

      }

    };

    loadMessages();

    socket.on("receiveMessage", (msg) => {

      setMessages((prev) => [...prev, msg]);

    });

    return () => {

      socket.off("receiveMessage");

    };

  }, [consultationId]);


  const sendMessage = () => {

    if (!message.trim()) return;

    const msgData = {

      consultation: consultationId,
      sender: user._id,
      senderName: user.name,
      text: message

    };

    socket.emit("sendMessage", msgData);

    setMessage("");

  };


  return (

    <div style={{ marginTop: "20px" }}>

      <h3>Consultation Chat</h3>

      <div
        style={{
          border: "1px solid #ddd",
          height: "350px",
          overflowY: "auto",
          padding: "10px",
          marginBottom: "10px",
          background: "#f9f9f9"
        }}
      >

        {messages.map((msg) => {

              const senderId =
              typeof msg.sender === "object"
                ? msg.sender._id
                : msg.sender;

              const senderName =
              typeof msg.sender === "object"
                ? msg.sender.name
                : "User";

              const isMe = senderId === user._id;

          return (

            <div
              key={msg._id || Math.random()}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: "10px"
              }}
            >

              <div
                style={{
                  background: isMe ? "#DCF8C6" : "#fff",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: "1px solid #ddd",
                  maxWidth: "70%"
                }}
              >

                <div
                  style={{
                    fontSize: "12px",
                    color: "#555",
                    marginBottom: "4px"
                  }}
                >
                  {isMe ? "You" : senderName || "User"}
                </div>

                <div>{msg.text}</div>

              </div>

            </div>

          );

        })}

      </div>

      <div style={{ display: "flex", gap: "10px" }}>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            background: "#006B3F",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Send
        </button>

      </div>

    </div>

  );

}
