import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { saveAuth } from "../utils/auth";
import { FiShield } from "react-icons/fi";

/*
  Handles the redirect from /auth/linkedin/callback.
  The backend redirects here with ?token=...&user=...
  We store them and send the user to their dashboard.
*/
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error || !token) {
      navigate("/login?error=oauth_failed");
      return;
    }

    try {
      const userRaw = searchParams.get("user");
      const user    = JSON.parse(decodeURIComponent(userRaw));
      saveAuth(user, token);

      if (user.role === "admin")  navigate("/admin");
      else if (user.role === "lawyer") navigate("/lawyer");
      else navigate("/client");
    } catch {
      navigate("/login?error=oauth_failed");
    }
  }, []);

  return (
    <div style={{
      minHeight:"100vh", background:"linear-gradient(160deg,#060F1D,#0B1F3A)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      fontFamily:"'Inter',system-ui,sans-serif", gap:20,
    }}>
      <div style={{ width:48, height:48, borderRadius:12, background:"linear-gradient(135deg,#C9961A,#F0BE4A)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <FiShield size={24} color="#0B1F3A" strokeWidth={2.5}/>
      </div>
      <div style={{ fontSize:16, color:"rgba(255,255,255,0.5)" }}>Signing you in…</div>
    </div>
  );
}
