import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";
import DashboardShell from "../components/DashboardShell";
import ProfilePhotoUploader from "../components/ProfilePhotoUploader";
import {
  FiMail, FiPhone, FiMapPin, FiBriefcase, FiAward, FiDollarSign,
  FiCheckCircle, FiEdit2, FiX as FiClose, FiAlertTriangle,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_URL = API_URL.replace("/api", "");

// Shared light-theme card style, matching the rest of this page.
const card = {
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  padding: "24px 28px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const label = { fontSize: 13, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6 };

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 9,
  border: "1px solid #E5E7EB",
  fontSize: 14,
  color: "#0B1F3A",
  outline: "none",
  marginBottom: 14,
};

const primaryBtn = {
  background: "linear-gradient(135deg,#006B3F,#00A86B)",
  border: "none",
  color: "#fff",
  fontSize: 14,
  fontWeight: 700,
  padding: "11px 22px",
  borderRadius: 10,
  cursor: "pointer",
};

export default function LawyerProfilePage() {
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", location: "", bio: "",
    specialization: "", yearsOfExperience: "", consultationFee: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");

  // ── Password change ──
  const [pwForm, setPwForm] = useState({ currentPassword: "", password: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  // ── Delete account ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setLawyer(data);
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        location: data.location || "",
        bio: data.bio || "",
        specialization: data.specialization || "",
        yearsOfExperience: data.yearsOfExperience || "",
        consultationFee: data.consultationFee || "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    setSaveErr("");
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update profile");

      setLawyer((prev) => ({ ...prev, ...data.user }));
      setSaveMsg("Profile updated");
      setIsEditing(false);
    } catch (err) {
      setSaveErr(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value });

  const handlePwSave = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    setPwMsg("");
    setPwErr("");
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update password");

      setPwMsg("Password updated");
      setPwForm({ currentPassword: "", password: "" });
    } catch (err) {
      setPwErr(err.message);
    } finally {
      setSavingPw(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    setDeleteErr("");
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ password: deletePassword, confirm: deleteConfirmText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete account");

      localStorage.removeItem("token"); // adjust if your auth token key differs
      navigate("/");
    } catch (err) {
      setDeleteErr(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (!lawyer) return (
    <DashboardShell title="My Profile" subtitle="Loading...">
      <div style={{ ...card, padding: "48px 24px", textAlign: "center", color: "#9CA3AF" }}>
        Loading profile...
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell title="My Profile" subtitle="Your public lawyer profile visible to clients.">
      {/* TOP PROFILE BANNER */}
      <div style={{ ...card, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <ProfilePhotoUploader
            currentPhotoUrl={lawyer.profilePhoto ? `${SERVER_URL}/${lawyer.profilePhoto}` : null}
            userName={lawyer.name}
            uploadUrl={`${API_URL}/lawyers/profile/photo`}
            size={90}
            ringColor="#00A86B"
            onUpdated={(updated) => setLawyer((prev) => ({ ...prev, ...updated }))}
          />
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0B1F3A", marginBottom: 4 }}>{lawyer.name}</div>
            <div style={{ fontSize: 15, color: "#6B7280", marginBottom: 10 }}>{lawyer.specialization}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: "#ECFDF5", color: "#059669", fontSize: 13, fontWeight: 700, border: "1px solid #A7F3D0" }}>
              <FiCheckCircle size={13} /> {lawyer.verificationStatus}
            </div>
          </div>
        </div>

        <button onClick={() => setIsEditing((v) => !v)} style={{ ...primaryBtn, background: isEditing ? "#F3F4F6" : "linear-gradient(135deg,#006B3F,#00A86B)", color: isEditing ? "#374151" : "#fff", display: "inline-flex", alignItems: "center", gap: 8 }}>
          {isEditing ? <><FiClose size={15} /> Cancel</> : <><FiEdit2 size={15} /> Edit Profile</>}
        </button>
      </div>

      {/* EDIT FORM (toggle) */}
      {isEditing && (
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0B1F3A", marginBottom: 18 }}>Edit Profile Details</div>

          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={label}>Full Name</label>
                <input style={input} name="name" value={form.name} onChange={handleFormChange} />
              </div>
              <div>
                <label style={label}>Phone</label>
                <input style={input} name="phone" value={form.phone} onChange={handleFormChange} />
              </div>
              <div>
                <label style={label}>Location</label>
                <input style={input} name="location" value={form.location} onChange={handleFormChange} />
              </div>
              <div>
                <label style={label}>Specialization</label>
                <input style={input} name="specialization" value={form.specialization} onChange={handleFormChange} />
              </div>
              <div>
                <label style={label}>Years of Experience</label>
                <input style={input} type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleFormChange} />
              </div>
              <div>
                <label style={label}>Consultation Fee (KES)</label>
                <input style={input} type="number" name="consultationFee" value={form.consultationFee} onChange={handleFormChange} />
              </div>
            </div>

            <label style={label}>Bio</label>
            <textarea style={{ ...input, resize: "vertical" }} rows={4} name="bio" value={form.bio} onChange={handleFormChange} />

            {saveErr && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{saveErr}</p>}
            {saveMsg && <p style={{ color: "#059669", fontSize: 13, marginBottom: 12 }}>{saveMsg}</p>}

            <button type="submit" disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <div style={{ borderTop: "1px solid #E5E7EB", marginTop: 24, paddingTop: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1F3A", marginBottom: 14 }}>Change Password</div>
            <form onSubmit={handlePwSave}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={label}>Current Password</label>
                  <input style={input} type="password" name="currentPassword" value={pwForm.currentPassword} onChange={handlePwChange} />
                </div>
                <div>
                  <label style={label}>New Password</label>
                  <input style={input} type="password" name="password" value={pwForm.password} onChange={handlePwChange} />
                </div>
              </div>
              {pwErr && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{pwErr}</p>}
              {pwMsg && <p style={{ color: "#059669", fontSize: 13, marginBottom: 12 }}>{pwMsg}</p>}
              <button type="submit" disabled={savingPw} style={{ ...primaryBtn, background: "#374151", opacity: savingPw ? 0.6 : 1 }}>
                {savingPw ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* INFO GRID (unchanged) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { icon: <FiMail size={16} />, label: "Email", value: lawyer.email, color: "#3B82F6" },
          { icon: <FiPhone size={16} />, label: "Phone", value: lawyer.phone || "Not provided", color: "#10B981" },
          { icon: <FiBriefcase size={16} />, label: "Experience", value: `${lawyer.yearsOfExperience || 0} years`, color: "#F59E0B" },
          { icon: <FiMapPin size={16} />, label: "Location", value: lawyer.location || "Not provided", color: "#EF4444" },
          { icon: <FiDollarSign size={16} />, label: "Consultation Fee", value: `KES ${lawyer.consultationFee || 0}`, color: "#8B5CF6" },
          { icon: <FiAward size={16} />, label: "LSK Number", value: lawyer.lskNumber || "Not provided", color: "#06B6D4" },
        ].map((item) => (
          <div key={item.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: item.color + "15", display: "flex", alignItems: "center", justifyContent: "center", color: item.color }}>
                {item.icon}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0B1F3A" }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* BIO (unchanged) */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#0B1F3A", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 20, background: "linear-gradient(135deg,#006B3F,#00A86B)", borderRadius: 4 }} />
          Professional Bio
        </div>
        <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.9 }}>
          {lawyer.bio || "No professional bio added yet."}
        </p>
      </div>

      {/* DANGER ZONE */}
      <div style={{ ...card, border: "1px solid #FECACA" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#DC2626", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <FiAlertTriangle size={16} /> Delete Account
        </div>
        <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7, marginBottom: 16 }}>
          This disables your login and removes your personal details. Past consultations stay on
          record for the client's side, as required for legal record-keeping. Your LSK verification
          status is not affected by this action for existing records.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 13, fontWeight: 700, padding: "10px 18px", borderRadius: 9, cursor: "pointer" }}
        >
          Delete My Account
        </button>
      </div>

      {/* CONFIRM DELETE MODAL */}
      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ ...card, maxWidth: 420, width: "100%" }}>
            <h3 style={{ marginTop: 0, color: "#0B1F3A" }}>Confirm account deletion</h3>
            <p style={{ color: "#6B7280", fontSize: 14 }}>
              This can't be undone from the app. Enter your password and type <strong>DELETE</strong> to confirm.
            </p>

            <label style={label}>Password</label>
            <input style={input} type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />

            <label style={label}>Type DELETE to confirm</label>
            <input style={input} value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} />

            {deleteErr && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{deleteErr}</p>}

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ ...primaryBtn, flex: 1, background: "#F3F4F6", color: "#374151" }}>
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                style={{ ...primaryBtn, flex: 1, background: "#DC2626", opacity: deleteConfirmText === "DELETE" ? 1 : 0.5 }}
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
