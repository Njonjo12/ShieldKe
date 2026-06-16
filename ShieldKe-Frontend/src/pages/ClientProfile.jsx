import { useEffect, useState } from "react";
import { authHeaders } from "../utils/api";

const API_URL = "http://localhost:5000/api/clients/profile";

export default function ClientProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    phone: "",
    location: "",
    bio: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /*
  ========================================
  LOAD PROFILE
  ========================================
  */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const res = await fetch(API_URL, {
          headers: authHeaders()
        });

        const data = await res.json();

        if (data?.profile) {
          setProfile(data.profile);
          setForm({
            phone: data.profile.phone || "",
            location: data.profile.location || "",
            bio: data.profile.bio || ""
          });
        } else {
          setError("Profile not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /*
  ========================================
  FORM HANDLERS
  ========================================
  */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const res = await fetch(API_URL, {
        method: "PUT",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      setProfile(data.profile || form);
      setMessage("Profile updated successfully");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /*
  ========================================
  LOADING STATE
  ========================================
  */
  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  /*
  ========================================
  ERROR STATE
  ========================================
  */
  if (error && !profile) {
    return (
      <div className="container">
        <div className="card">
          <p style={{ color: "#ef4444" }}>{error}</p>
        </div>
      </div>
    );
  }

  /*
  ========================================
  UI
  ========================================
  */
  return (
    <div className="container profile-container">

      <div className="profile-card">

        <h1 className="dashboard-title">
          My Profile
        </h1>

        <p className="dashboard-subtitle">
          Manage your personal details and keep your account up to date.
        </p>

        {message && (
          <div style={{ color: "#22c55e", marginTop: "15px" }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ color: "#ef4444", marginTop: "15px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">

          <div className="profile-grid">

            <div className="profile-item">
              <label>Phone</label>
              <input
                className="input"
                name="phone"
                placeholder="Phone number"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="profile-item">
              <label>Location</label>
              <input
                className="input"
                name="location"
                placeholder="Your location"
                value={form.location}
                onChange={handleChange}
              />
            </div>

          </div>

          <div style={{ marginTop: "20px" }}>
            <label>Bio</label>
            <textarea
              className="input"
              name="bio"
              placeholder="Tell us about yourself"
              rows="5"
              value={form.bio}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="primary-btn"
            style={{ marginTop: "25px" }}
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Profile"}
          </button>

        </form>

      </div>

    </div>
  );
}