import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function ConsultationChat({ consultationId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/messages/${consultationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  useEffect(() => {
    if (consultationId) {
      fetchMessages();
    }
  }, [consultationId]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          consultationId,
          content: newMessage
        })
      });

      setNewMessage("");
      fetchMessages(); // refresh after sending
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
      <h3>Consultation Chat</h3>

      <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "1rem" }}>
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} style={{ marginBottom: "0.5rem" }}>
              <strong>{msg.sender.name}:</strong> {msg.content}
            </div>
          ))
        )}
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1 }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
