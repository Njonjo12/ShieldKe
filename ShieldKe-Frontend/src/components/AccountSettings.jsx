import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const C = {
  navy: "#0B1F3A",
  navyDark: "#060F1D",
  navyMid: "#132843",
  green: "#006B3F",
  greenLight: "#00A86B",
  gold: "#C9961A",
  goldLight: "#F0BE4A",
  white: "#FFFFFF",
  border: "rgba(255,255,255,0.08)",
};

const inputStyle = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 10,
  border: `1px solid ${C.border}`,
  background: C.navyDark,
  color: C.white,
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  marginBottom: 14,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "rgba(255,255,255,0.5)",
  marginBottom: 6,
  display: "block",
};


export default function AccountSettings({ user, getToken, onUpdated }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    bio: user?.bio || "",
  });
  const [passwordFields, setPasswordFields] = useState({ currentPassword: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [saveErr, setSaveErr] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    setSaveErr(null);

    try {
      const body = { ...form };
      if (passwordFields.password) {
        body.password = passwordFields.password;
        body.currentPassword = passwordFields.currentPassword;
      }

      const res = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update profile.");

      setSaveMsg("Profile updated.");
      setPasswordFields({ currentPassword: "", password: "" });
      onUpdated?.(data.user);
    } catch (err) {
      setSaveErr(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    setDeleteErr(null);

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
      if (!res.ok) throw new Error(data.error || "Could not delete account.");

     
      localStorage.removeItem("token"); 
      navigate("/");
    } catch (err) {
      setDeleteErr(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      {/* ── Update profile ── */}
      <form onSubmit={handleSave} style={{ background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: C.white, marginTop: 0, marginBottom: 18 }}>Edit Profile</h3>

        <label style={labelStyle}>Full Name</label>
        <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <label style={labelStyle}>Email</label>
        <input type="email" style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

        <label style={labelStyle}>Phone</label>
        <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

        <label style={labelStyle}>Bio</label>
        <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 4, marginBottom: 6 }}>
          <label style={labelStyle}>Current Password <span style={{ opacity: 0.5 }}>(only needed if changing password)</span></label>
          <input type="password" style={inputStyle} value={passwordFields.currentPassword}
            onChange={(e) => setPasswordFields({ ...passwordFields, currentPassword: e.target.value })} />

          <label style={labelStyle}>New Password</label>
          <input type="password" style={inputStyle} value={passwordFields.password}
            onChange={(e) => setPasswordFields({ ...passwordFields, password: e.target.value })} />
        </div>

        {saveErr && <p style={{ color: "#F87171", fontSize: 13, marginBottom: 12 }}>{saveErr}</p>}
        {saveMsg && <p style={{ color: C.greenLight, fontSize: 13, marginBottom: 12 }}>{saveMsg}</p>}

        <button type="submit" disabled={saving}
          style={{ background: `linear-gradient(135deg,${C.green},${C.greenLight})`, border: "none", color: C.white, fontSize: 14, fontWeight: 800, padding: "12px 22px", borderRadius: 10, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, fontFamily: "inherit" }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* ── Danger zone ── */}
      <div style={{ background: C.navyMid, border: "1px solid rgba(239,68,68,0.25)", borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#F87171", marginTop: 0, marginBottom: 8 }}>Delete Account</h3>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 16 }}>
          This disables your login and removes your personal details. Past consultations stay on record for the other party involved, as required for legal record-keeping.
        </p>
        <button onClick={() => setShowDeleteModal(true)}
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#F87171", fontSize: 13, fontWeight: 700, padding: "10px 18px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit" }}>
          Delete My Account
        </button>
      </div>

      {/* ── Confirm delete modal ── */}
      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: C.navy, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, maxWidth: 420, width: "100%" }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: C.white, marginTop: 0 }}>Confirm account deletion</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
              This can't be undone from the app. Enter your password and type <strong style={{ color: C.white }}>DELETE</strong> to confirm.
            </p>

            <label style={labelStyle}>Password</label>
            <input type="password" style={inputStyle} value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />

            <label style={labelStyle}>Type DELETE to confirm</label>
            <input style={inputStyle} value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} />

            {deleteErr && <p style={{ color: "#F87171", fontSize: 13, marginBottom: 12 }}>{deleteErr}</p>}

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, color: C.white, fontSize: 14, fontWeight: 700, padding: "11px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteConfirmText !== "DELETE" || deleting}
                style={{ flex: 1, background: "#DC2626", border: "none", color: C.white, fontSize: 14, fontWeight: 700, padding: "11px", borderRadius: 9, cursor: deleteConfirmText === "DELETE" ? "pointer" : "default", opacity: deleteConfirmText === "DELETE" ? 1 : 0.5, fontFamily: "inherit" }}>
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
