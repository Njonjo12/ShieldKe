import { useRef, useState } from "react";
import { getToken, saveAuth } from "../utils/auth";
import { FiCamera, FiCheck, FiX, FiLoader } from "react-icons/fi";

/**
 * Reusable avatar upload widget.
 *
 * Props:
 *  - currentPhotoUrl : string  → fully resolved image URL to show right now
 *  - userName        : string → used for the ui-avatars initials fallback
 *  - uploadUrl        : string → full endpoint this widget PUTs the file to
 *  - size            : number  → avatar diameter in px (default 96)
 *  - ringColor       : string  → border accent color (default green)
 *  - onUpdated       : (updatedUser) => void → called after a successful save
 */
export default function ProfilePhotoUploader({
  currentPhotoUrl,
  userName,
  uploadUrl,
  size = 96,
  ringColor = "#00A86B",
  onUpdated,
}) {
  const [preview, setPreview] = useState(null);
  const [file, setFile]       = useState(null);
  const [status, setStatus]   = useState("idle"); // idle | uploading | success | error
  const [error, setError]     = useState("");
  const [hover, setHover]     = useState(false);
  const inputRef = useRef(null);

  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "User")}&background=0B1F3A&color=fff&size=${size * 2}`;
  const displayUrl  = preview || currentPhotoUrl || fallbackUrl;

  /* ── pick a file ── */
  const handlePick = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, or WEBP).");
      setStatus("error");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      setStatus("error");
      return;
    }

    setError("");
    setStatus("idle");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  /* ── cancel staged change ── */
  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setStatus("idle");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  /* ── upload the staged file ── */
  const handleSave = async () => {
    if (!file) return;
    setStatus("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("profilePhoto", file);

      const res = await fetch(uploadUrl, {
        method: "PUT",
        // NOTE: do NOT set Content-Type here — the browser must set the
        // multipart boundary itself. Only the auth header is needed.
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not update photo. Please try again.");
        setStatus("error");
        return;
      }

      /* keep the cached user object (and therefore Sidebar/Navbar avatars) in sync */
      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser   = { ...existingUser, ...data.user };
      saveAuth(updatedUser, getToken());

      setStatus("success");
      setFile(null);
      if (onUpdated) onUpdated(updatedUser);

      /* Sidebar / Navbar read localStorage directly on render, so a reload
         is the simplest way to guarantee every avatar on screen updates. */
      setTimeout(() => window.location.reload(), 700);

    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  const hasStaged = !!file && status !== "success";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>

      {/* ── AVATAR + HOVER OVERLAY ── */}
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => inputRef.current?.click()}
        style={{
          position: "relative",
          width: size, height: size,
          borderRadius: "50%",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <img
          src={displayUrl}
          alt={userName || "Profile"}
          style={{
            width: size, height: size,
            borderRadius: "50%",
            objectFit: "cover",
            border: `4px solid ${ringColor}`,
            display: "block",
          }}
        />

        {/* hover dim + camera icon */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: hover ? "rgba(11,31,58,0.55)" : "rgba(11,31,58,0)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.18s",
          pointerEvents: "none",
        }}>
          {hover && <FiCamera size={size * 0.26} color="#fff" />}
        </div>

        {/* status badge */}
        {status === "success" && (
          <div style={{
            position: "absolute", bottom: -2, right: -2,
            width: 26, height: 26, borderRadius: "50%",
            background: "#10B981", border: "2px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FiCheck size={14} color="#fff" />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handlePick}
        />
      </div>

      {/* ── HELPER TEXT (idle, no staged change) ── */}
      {!hasStaged && status === "idle" && (
        <div
          onClick={() => inputRef.current?.click()}
          style={{ fontSize: 12, fontWeight: 600, color: "#3B82F6", cursor: "pointer" }}
        >
          Change Photo
        </div>
      )}

      {/* ── SUCCESS MESSAGE ── */}
      {status === "success" && (
        <div style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>
          Photo updated ✓
        </div>
      )}

      {/* ── STAGED FILE — confirm / cancel ── */}
      {hasStaged && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 12, color: "#6B7280", textAlign: "center", maxWidth: 200 }}>
            {file.name.length > 28 ? file.name.slice(0, 25) + "…" : file.name}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={status === "uploading"}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8,
                background: status === "uploading" ? "#9CA3AF" : "linear-gradient(135deg,#006B3F,#00A86B)",
                border: "none", color: "#fff",
                fontSize: 12, fontWeight: 700, fontFamily: "inherit",
                cursor: status === "uploading" ? "not-allowed" : "pointer",
              }}
            >
              {status === "uploading"
                ? <><FiLoader size={12} className="spin" /> Saving…</>
                : <><FiCheck size={12} /> Save Photo</>}
            </button>
            <button
              onClick={handleCancel}
              disabled={status === "uploading"}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8,
                background: "#fff", border: "1px solid #E5E7EB",
                color: "#6B7280", fontSize: 12, fontWeight: 700,
                fontFamily: "inherit", cursor: "pointer",
              }}
            >
              <FiX size={12} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── ERROR ── */}
      {error && (
        <div style={{ fontSize: 12, color: "#DC2626", textAlign: "center", maxWidth: 220, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* spin keyframes (scoped, injected once) */}
      <style>{`
        @keyframes spinIcon { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spinIcon 0.8s linear infinite; }
      `}</style>

    </div>
  );
}
