import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authHeaders } from "../utils/api";

// Original endpoint — kept as-is for phone/location/bio, unchanged behavior.
const PROFILE_API_URL = "http://localhost:5000/api/clients/profile";

// New endpoint (added for Sheria's account update/delete feature).
// Handles email + password changes and full account deletion.
// Same host as PROFILE_API_URL above — if you migrate this file to
// VITE_API_URL later, update both constants together.
const ACCOUNT_API_URL = "http://localhost:5000/api/users/me";

export default function ClientProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    phone: "",
    location: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ── Account & Security (email + password) ──
  const [accountForm, setAccountForm] = useState({
    email: "",
    currentPassword: "",
    password: "",
  });
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");
  const [accountError, setAccountError] = useState("");

  // ── Delete account ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  /*
  ========================================
  LOAD PROFILE
  ========================================
  */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(PROFILE_API_URL, {
          headers: authHeaders(),
        });
        const data = await res.json();

        if (data?.profile) {
          setProfile(data.profile);
          setForm({
            phone: data.profile.phone || "",
            location: data.profile.location || "",
            bio: data.profile.bio || "",
          });
          setAccountForm((prev) => ({ ...prev, email: data.profile.email || "" }));
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
  PROFILE FORM HANDLERS (unchanged from before)
  ========================================
  */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e .target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const res = await fetch(PROFILE_API_URL, {
        method: "PUT",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
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
  ACCOUNT & SECURITY HANDLERS 
  ========================================
  */
  const handleAccountChange = (e) => {
    setAccountForm({ ...accountForm, [e.target.name]: e.target.value });
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingAccount(true);
      setAccountMessage("");
      setAccountError("");

      const body = { email: accountForm.email };
      if (accountForm.password) {
        body.password = accountForm.password;
        body.currentPassword = accountForm.currentPassword;
      }

      const res = await fetch(ACCOUNT_API_URL, {
        method: "PUT",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update account");

      setAccountMessage("Account details updated");
      setAccountForm((prev) => ({ ...prev, currentPassword: "", password: "" }));
    } catch (err) {
      console.error(err);
      setAccountError(err.message);
    } finally {
      setSavingAccount(false);
    }
  };

  /*
  ========================================
  DELETE ACCOUNT 
  ========================================
  */
  const handleDelete = async () => {
    if (deleteConfirmText !== "DELETE") return;
    try {
      setDeleting(true);
      setDeleteError("");

      const res = await fetch(ACCOUNT_API_URL, {
        method: "DELETE",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: deletePassword, confirm: deleteConfirmText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete account");

      localStorage.removeItem("token"); // adjust if your auth token key differs
      navigate("/");
    } catch (err) {
      console.error(err);
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
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
        <h1 className="dashboard-title">My Profile</h1>
        <p className="dashboard-subtitle">
          Manage your personal details and keep your account up to date.
        </p>

        {message && <div style={{ color: "#22c55e", marginTop: "15px" }}>{message}</div>}
        {error && <div style={{ color: "#ef4444", marginTop: "15px" }}>{error}</div>}

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

          <button type="submit" className="primary-btn" style={{ marginTop: "25px" }} disabled={saving}>
            {saving ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      {/* ── Account & Security ── */}
      <div className="profile-card" style={{ marginTop: "24px" }}>
        <h2 className="dashboard-title" style={{ fontSize: "20px" }}>Account & Security</h2>
        <p className="dashboard-subtitle">Update your email or password.</p>

        {accountMessage && <div style={{ color: "#22c55e", marginTop: "15px" }}>{accountMessage}</div>}
        {accountError && <div style={{ color: "#ef4444", marginTop: "15px" }}>{accountError}</div>}

        <form onSubmit={handleAccountSubmit} className="profile-form">
          <div className="profile-item">
            <label>Email</label>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="Email address"
              value={accountForm.email}
              onChange={handleAccountChange}
            />
          </div>

          <div className="profile-grid" style={{ marginTop: "16px" }}>
            <div className="profile-item">
              <label>Current Password <span style={{ opacity: 0.6, fontWeight: 400 }}>(only if changing password)</span></label>
              <input
                className="input"
                type="password"
                name="currentPassword"
                value={accountForm.currentPassword}
                onChange={handleAccountChange}
              />
            </div>
            <div className="profile-item">
              <label>New Password</label>
              <input
                className="input"
                type="password"
                name="password"
                value={accountForm.password}
                onChange={handleAccountChange}
              />
            </div>
          </div>

          <button type="submit" className="primary-btn" style={{ marginTop: "25px" }} disabled={savingAccount}>
            {savingAccount ? "Saving..." : "Save Account Changes"}
          </button>
        </form>
      </div>

      {/* ── Danger Zone ── */}
      <div className="profile-card" style={{ marginTop: "24px", border: "1px solid #fecaca" }}>
        <h2 className="dashboard-title" style={{ fontSize: "20px", color: "#ef4444" }}>Delete Account</h2>
        <p className="dashboard-subtitle">
          This disables your login and removes your personal details. Past consultations
          stay on record for the other party involved, as required for legal record-keeping.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="primary-btn"
          style={{ marginTop: "10px", background: "#ef4444" }}
        >
          Delete My Account
        </button>
      </div>

      {/* ── Confirm delete modal ── */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, padding: "20px",
          }}
        >
          <div className="card" style={{ maxWidth: "420px", width: "100%" }}>
            <h3 style={{ marginTop: 0 }}>Confirm account deletion</h3>
            <p style={{ color: "#6b7280" }}>
              This can't be undone from the app. Enter your password and type{" "}
              <strong>DELETE</strong> to confirm.
            </p>

            <label>Password</label>
            <input
              className="input"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              style={{ marginBottom: "14px" }}
            />

            <label>Type DELETE to confirm</label>
            <input
              className="input"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              style={{ marginBottom: "14px" }}
            />

            {deleteError && <p style={{ color: "#ef4444" }}>{deleteError}</p>}

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="primary-btn"
                style={{ flex: 1, background: "#e5e7eb", color: "#111827" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="primary-btn"
                style={{
                  flex: 1,
                  background: "#ef4444",
                  opacity: deleteConfirmText === "DELETE" ? 1 : 0.5,
                }}
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
