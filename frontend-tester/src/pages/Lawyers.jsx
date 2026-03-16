import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:5000/api";

export default function Lawyers() {

  const [lawyers, setLawyers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {

    const fetchLawyers = async () => {

      try {

        const res = await fetch(`${API_URL}/auth/lawyers`, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });

        const data = await res.json();

        setLawyers(data);

      } catch (err) {

        console.error("Failed to fetch lawyers", err);

      }

    };

    fetchLawyers();

  }, []);

  const requestConsultation = async (lawyerId) => {

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

      if (!res.ok) {
        alert("Consultation request failed");
        return;
      }

      alert("Consultation request sent");

      setMessage("");

    } catch (err) {

      console.error("Consultation error", err);

    }

  };

  return (

    <div style={{ padding: "40px" }}>

      <h1>Available Lawyers</h1>

      {lawyers.map((lawyer) => (

        <div
          key={lawyer._id}
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px"
          }}
        >

          <h3>{lawyer.name}</h3>

          <p>{lawyer.email}</p>

          <textarea
            placeholder="Describe your legal issue..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />

          <button onClick={() => requestConsultation(lawyer._id)}>
            Request Consultation
          </button>

        </div>

      ))}

    </div>

  );

}
