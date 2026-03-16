import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Chat({ consultationId, user }) {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {

    socket.emit("joinRoom", consultationId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");

  }, [consultationId]);

  const sendMessage = () => {

    if (!message.trim()) return;

    const msgData = {
      consultation: consultationId,
      sender: user._id,
      text: message
    };

    socket.emit("sendMessage", msgData);

    setMessage("");
  };

  return (
    <div>

      <div>

        {messages.map((msg, i) => (
          <p key={i}>
            <strong>{msg.sender}</strong>: {msg.text}
          </p>
        ))}

      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>
        Send
      </button>

    </div>
  );
}
