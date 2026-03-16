import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import Navbar from "../components/Navbar";
import ChatWindow from "../components/ChatWindow";

const API_URL = "http://localhost:5000/api";

export default function Consultations() {

  const [consultations, setConsultations] = useState([]);
  const [activeConsultation, setActiveConsultation] = useState(null);

  const fetchConsultations = async () => {

    try {

      const res = await fetch(
        `${API_URL}/consultations/client`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setConsultations(data);
      } else {
        setConsultations([]);
      }

    } catch (error) {

      console.error("Consultation fetch error", error);

    }

  };

  useEffect(() => {

    fetchConsultations();

  }, []);

  return (

    <div>

      <Navbar />

      <div style={{ padding: "40px" }}>

        <h1>Your Consultations</h1>

        {consultations.length === 0 && (
          <p>No consultations found.</p>
        )}

        {consultations.map((c) => (

          <div
            key={c._id}
            onClick={() => setActiveConsultation(c)}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "15px",
              cursor: "pointer"
            }}
          >

            <h3>{c.lawyer?.name}</h3>

            <p>
              <strong>Status:</strong> {c.status}
            </p>

            <p>{c.message}</p>

          </div>

        ))}

        {activeConsultation && activeConsultation.status === "accepted" && (

          <ChatWindow consultationId={activeConsultation._id} />

        )}

      </div>

    </div>

  );

}
