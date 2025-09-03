import { useState } from "react";

function ClientProfileForm() {
  const [formData, setFormData] = useState({
    company: "",
    location: "",
    bio: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/clients/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Client profile saved successfully!");
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      setMessage("❌ Server error: " + err.message);
    }
  };

  return (
    <div>
      <h2>Client Profile Form</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Company:
          <input type="text" name="company" value={formData.company} onChange={handleChange} />
        </label>
        <br />

        <label>
          Location:
          <input type="text" name="location" value={formData.location} onChange={handleChange} />
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

export default ClientProfileForm;
