import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";
import { getUser } from "../utils/auth";


const API_URL = "http://localhost:5000/api";

export default function LawyerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        const res = await fetch(`${API_URL}/lawyers/${id}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });

        const data = await res.json();
        setLawyer(data);
      } catch (err) {
        console.error("Failed to fetch lawyer", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyer();
  }, [id]);

  if (loading) return <p style={{ padding: "40px" }}>Loading profile...</p>;
  if (!lawyer) return <p>Lawyer not found.</p>;

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      
      <button onClick={() => navigate(-1)} style={{ marginBottom: "20px" }}>
        ← Back
      </button>

      <h1>{lawyer.name}</h1>

      {lawyer.isVerified && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          ✔ LSK Verified Advocate
        </p>
      )}

      <p><strong>Specialization:</strong> {lawyer.specialization || "General Practice"}</p>
      <p><strong>Experience:</strong> {lawyer.yearsOfExperience || 0} years</p>
      <p><strong>Location:</strong> {lawyer.location || "Not specified"}</p>

      <div style={{ marginTop: "20px" }}>
        <h3>About</h3>
        <p>{lawyer.bio || "No biography provided."}</p>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h2>Consultation Fee</h2>
        <p style={{ fontSize: "20px", fontWeight: "bold" }}>
          KES {lawyer.consultationFee || "To be discussed"}
        </p>
      </div>

      <button
  onClick={async () => {
    const user = getUser();

    try {
      await fetch(`${API_URL}/consultations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          clientId: user._id,
          lawyerId: lawyer._id,
          message: "I would like to request a consultation."
        })
      });

      alert("Consultation request sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send request.");
    }
  }}
  style={{
    marginTop: "30px",
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#000",
    color: "#fff",
    cursor: "pointer"
  }}
>
  Request Consultation
</button>

    </div>
  );
}
