import { useState } from "react";

function LawyerProfileForm() {
  const [formData, setFormData] = useState({
    specialization: "",
    experience: "",
    bio: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/lawyers/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Lawyer profile saved successfully!");
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      setMessage("❌ Server error: " + err.message);
    }
  };

  return (
    <div>
      <h2>Lawyer Profile Form</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Specialization:
          <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} />
        </label>
        <br />

        <label>
          Experience (years):
          <input type="number" name="experience" value={formData.experience} onChange={handleChange} />
        </label>
        <br />

        <label>
          Bio:
          <textarea name="bio" value={formData.bio} onChange={handleChange}></textarea>
        </label>
        <br />

        <button type="submit">Save Profile</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default LawyerProfileForm;
