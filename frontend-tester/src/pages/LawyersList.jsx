import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:5000/api";

export default function LawyersList() {

  const [lawyers, setLawyers] = useState([]);
  const [messages, setMessages] = useState({});

  useEffect(() => {

    const fetchLawyers = async () => {

      try {

        const res = await fetch(`${API_URL}/lawyers`);
        const data = await res.json();

        setLawyers(data);

      } catch (error) {

        console.error("Failed to fetch lawyers", error);

      }

    };

    fetchLawyers();

  }, []);


  const requestConsultation = async (lawyerId) => {

    const message = messages[lawyerId];

    if (!message || !message.trim()) {
      alert("Please enter a message");
      return;
    }

    try {

      const res = await fetch(`${API_URL}/consultations`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },

        body: JSON.stringify({
          lawyerId,
          message
        })

      });

      if (res.ok) {

        alert("Consultation request sent");

        setMessages((prev) => ({
          ...prev,
          [lawyerId]: ""
        }));

      }

    } catch (error) {

      console.error("Consultation request failed", error);

    }

  };


  return (

    <div>

      <Navbar />

      <div style={{ padding: "40px" }}>

        <h1>Available Lawyers</h1>

        {lawyers.map((lawyer) => (

          <div
            key={lawyer._id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "15px"
            }}
          >

            <h3>{lawyer.name}</h3>

            <p>{lawyer.email}</p>

            <input
              placeholder="Message to lawyer..."
              value={messages[lawyer._id] || ""}
              onChange={(e) =>
                setMessages({
                  ...messages,
                  [lawyer._id]: e.target.value
                })
              }
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px"
              }}
            />

            <button
              onClick={() => requestConsultation(lawyer._id)}
              style={{
                background: "#006B3F",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Request Consultation
            </button>

          </div>

        ))}

      </div>

    </div>

  );

}
