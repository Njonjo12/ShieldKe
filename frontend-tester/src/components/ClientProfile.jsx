import { useEffect, useState } from "react";
import { authHeaders } from "../utils/api";

const API_URL = "http://localhost:5000/api/clients/profile";

export default function ClientProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone: "", location: "", bio: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(API_URL, { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          setForm(data.profile);
        }
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch(API_URL, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.success) setMessage("Profile updated successfully");
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div>
      <h2>My Profile</h2>

      {message && <p style={{ color: "green" }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
        <br />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />
        <br />

        <textarea
          name="bio"
          placeholder="Bio"
          value={form.bio}
          onChange={handleChange}
        />
        <br />

        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}
