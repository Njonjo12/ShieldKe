import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import Navbar from "../components/Navbar";
import ChatWindow from "../components/ChatWindow";

const API_URL = "http://localhost:5000/api";

export default function LawyerDashboard() {

  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  useEffect(() => {

    const fetchConsultations = async () => {

      try {

        const res = await fetch(`${API_URL}/consultations/lawyer`, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          setConsultations(data);
        } else {
          setConsultations([]);
        }

      } catch (error) {

        console.error("Failed to fetch consultations", error);

      }

    };

    fetchConsultations();

  }, []);


  const updateStatus = async (id, status) => {

    try {

      const res = await fetch(`${API_URL}/consultations/${id}/status`, {

        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },

        body: JSON.stringify({ status })

      });

      const updated = await res.json();

      setConsultations((prev) =>
        prev.map((c) => (c._id === id ? updated : c))
      );

      if (selectedConsultation && selectedConsultation._id === id) {
        setSelectedConsultation(updated);
      }

    } catch (error) {

      console.error("Status update failed", error);

    }

  };


  const statusColor = (status) => {

    if (status === "accepted") return "#006B3F";
    if (status === "rejected") return "#BB0000";

    return "#999";

  };


  return (

    <div>

      <Navbar />

      <div className="container">

        <h1>Consultation Requests</h1>

        {consultations.length === 0 && (
          <p>No consultation requests yet.</p>
        )}

        {consultations.map((c) => (

          <div
            key={c._id}
            className="card"
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedConsultation(c)}
          >

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>

              <h3 style={{ margin: 0 }}>
                {c.client?.name || "Client"}
              </h3>

              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  background: statusColor(c.status),
                  color: "white",
                  fontSize: "12px",
                  textTransform: "capitalize"
                }}
              >
                {c.status}
              </span>

            </div>

            <p style={{ marginTop: "8px", color: "#666" }}>
              {c.client?.email}
            </p>

            <p style={{ marginTop: "10px" }}>
              <strong>Message:</strong> {c.message}
            </p>

            {c.status === "pending" && (

              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  gap: "10px"
                }}
              >

                <button
                  className="primary-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStatus(c._id, "accepted");
                  }}
                >
                  Accept Consultation
                </button>

                <button
                  className="secondary-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStatus(c._id, "rejected");
                  }}
                >
                  Reject
                </button>

              </div>

            )}

          </div>

        ))}


        {selectedConsultation && selectedConsultation.status === "accepted" && (

          <div
            style={{
              marginTop: "40px"
            }}
          >

            <h2>Consultation Chat</h2>

            <ChatWindow consultationId={selectedConsultation._id} />

          </div>

        )}

      </div>

    </div>

  );

}
