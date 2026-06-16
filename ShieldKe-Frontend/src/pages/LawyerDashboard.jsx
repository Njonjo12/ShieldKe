import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, saveAuth } from "../utils/auth";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import {
  FiDownload, FiBriefcase, FiStar, FiDollarSign,
  FiCheckCircle, FiAlertCircle, FiClock, FiBell,
  FiUser, FiMail,
} from "react-icons/fi";

const API_URL = "http://localhost:5000/api";

export default function LawyerDashboard() {

  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  /* ── FETCH USER ── */
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (res.ok) { setUser(data); saveAuth(data, getToken()); }
    } catch (e) { console.error(e); }
  };

  /* ── FETCH CONSULTATIONS ── */
  const fetchConsultations = async () => {
    try {
      const res = await fetch(`${API_URL}/consultations/lawyer`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Access denied"); return; }
      setConsultations(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchCurrentUser(); fetchConsultations(); }, []);

  /* ── UPDATE STATUS ── */
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/consultations/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status })
      });
      const updated = await res.json();
      setConsultations(prev => prev.map(c => c._id === id ? updated : c));
    } catch (e) { console.error(e); }
  };

  /* ── BADGE ── */
  const renderVerificationBadge = () => {
    if (user?.verificationStatus === "verified")
      return (
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:999, background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.25)", color:"#34D399", fontSize:13, fontWeight:700 }}>
          <FiCheckCircle size={13}/> Verified Lawyer
        </div>
      );
    if (user?.verificationStatus === "rejected")
      return (
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:999, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#F87171", fontSize:13, fontWeight:700 }}>
          <FiAlertCircle size={13}/> Application Rejected
        </div>
      );
    return (
      <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:999, background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.25)", color:"#FBBF24", fontSize:13, fontWeight:700 }}>
        <FiClock size={13}/> Verification Pending
      </div>
    );
  };

  const statusStyle = (s) => {
    if (s === "accepted") return { bg:"rgba(16,185,129,0.12)", color:"#34D399", border:"1px solid rgba(16,185,129,0.25)" };
    if (s === "rejected") return { bg:"rgba(239,68,68,0.12)", color:"#F87171", border:"1px solid rgba(239,68,68,0.25)" };
    return { bg:"rgba(245,158,11,0.12)", color:"#FBBF24", border:"1px solid rgba(245,158,11,0.25)" };
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#07131F" }}>

      <Sidebar role="lawyer" />

      <div style={{ marginLeft:240, flex:1, display:"flex", flexDirection:"column" }}>

        {/* ── TOP BAR ── */}
        <div style={{
          height:64, background:"#fff",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 32px", borderBottom:"1px solid #E5E7EB",
          position:"sticky", top:0, zIndex:50,
        }}>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:"#0B1F3A" }}>Overview</div>
            <div style={{ fontSize:13, color:"#6B7280" }}>Welcome back, {user?.name}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ position:"relative", cursor:"pointer" }} onClick={() => navigate("/notifications")}>
              <FiBell size={20} color="#374151"/>
              <div style={{ position:"absolute", top:-4, right:-4, width:16, height:16, borderRadius:"50%", background:"#EF4444", color:"#fff", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #fff" }}>3</div>
            </div>
            {renderVerificationBadge()}
            <button
              style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:"#10B981", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}
            >
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#10B981" }}/> Availability
            </button>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding:"32px", flex:1, background:"#F8FAFC" }}>

          {/* ── REJECTION / PENDING NOTICE ── */}
          {user?.verificationStatus === "rejected" && (
            <div style={{ padding:"18px 22px", borderRadius:12, background:"rgba(239,68,68,0.08)", borderLeft:"4px solid #EF4444", marginBottom:24 }}>
              <div style={{ color:"#F87171", fontWeight:700, marginBottom:4 }}>Application Rejected</div>
              <div style={{ color:"rgba(252,165,165,0.8)", fontSize:14 }}>{user.rejectionReason || "No feedback provided."}</div>
            </div>
          )}
          {user?.verificationStatus === "pending" && (
            <div style={{ padding:"18px 22px", borderRadius:12, background:"rgba(245,158,11,0.08)", borderLeft:"4px solid #F59E0B", marginBottom:24 }}>
              <div style={{ color:"#FBBF24", fontWeight:700, marginBottom:4 }}>Verification Pending</div>
              <div style={{ color:"rgba(252,211,77,0.7)", fontSize:14 }}>Your application is currently under review.</div>
            </div>
          )}

          {/* ── STAT CARDS ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, marginBottom:32 }}>
            {[
              { icon:<FiDownload size={22}/>,   color:"#F59E0B", bg:"#FFFBEB", value: consultations.filter(c=>c.status==="pending").length,  label:"New Requests",  sub:"View all" },
              { icon:<FiBriefcase size={22}/>,  color:"#3B82F6", bg:"#EFF6FF", value: consultations.filter(c=>c.status==="accepted").length, label:"Active Cases",   sub:"View all" },
              { icon:<FiStar size={22}/>,       color:"#10B981", bg:"#ECFDF5", value:"4.9",                                                  label:"Rating",        sub:"View reviews" },
              { icon:<FiDollarSign size={22}/>, color:"#8B5CF6", bg:"#F5F3FF", value:`KSh ${(user?.consultationFee||0)*consultations.filter(c=>c.status==="accepted").length}`, label:"Earnings", sub:"This month" },
            ].map((s,i) => (
              <div key={i} style={{ background:"#fff", borderRadius:14, padding:"22px 24px", border:"1px solid #E5E7EB", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, marginBottom:14 }}>
                  {s.icon}
                </div>
                <div style={{ fontSize:28, fontWeight:800, color:"#0B1F3A", lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:14, color:"#374151", fontWeight:600, marginTop:4 }}>{s.label}</div>
                <div style={{ fontSize:13, color:s.color, fontWeight:600, marginTop:4, cursor:"pointer" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {error && <div style={{ padding:"16px 20px", background:"rgba(239,68,68,0.08)", borderRadius:10, color:"#F87171", marginBottom:24, fontSize:14 }}>{error}</div>}

          {/* ── CONSULTATIONS TABLE ── */}
          {!error && user?.verificationStatus === "verified" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>

              {/* RECENT REQUESTS */}
              <div style={{ background:"#fff", borderRadius:14, border:"1px solid #E5E7EB", padding:"24px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize:16, fontWeight:700, color:"#0B1F3A", marginBottom:20 }}>Recent Requests</div>

                {consultations.length === 0 && <p style={{ color:"#9CA3AF", fontSize:14 }}>No requests yet.</p>}

                {consultations.slice(0,4).map((c) => {
                  const st = statusStyle(c.status);
                  return (
                    <div key={c._id}
                      onClick={() => setSelectedConsultation(c)}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #F3F4F6", cursor:"pointer" }}
                    >
                      <div style={{ flex:1, minWidth:0, marginRight:10 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:"#0B1F3A", marginBottom:2 }}>{c.message?.slice(0,34) || "Consultation"}</div>
                        <div style={{ fontSize:12, color:"#6B7280" }}>{c.client?.name}</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ padding:"4px 10px", borderRadius:999, fontSize:12, fontWeight:700, background:st.bg, color:st.color, border:st.border }}>
                          {c.status === "pending" ? "High" : c.status === "accepted" ? "Medium" : "Low"}
                        </span>
                        {c.status === "pending" && (
                          <div style={{ display:"flex", gap:6 }}>
                            <button onClick={e=>{e.stopPropagation();updateStatus(c._id,"accepted");}} style={{ padding:"5px 11px", borderRadius:6, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:"#10B981", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Accept</button>
                            <button onClick={e=>{e.stopPropagation();updateStatus(c._id,"rejected");}} style={{ padding:"5px 11px", borderRadius:6, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#F87171", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* UPCOMING CONSULTATIONS */}
              <div style={{ background:"#fff", borderRadius:14, border:"1px solid #E5E7EB", padding:"24px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize:16, fontWeight:700, color:"#0B1F3A", marginBottom:20 }}>Upcoming Consultations</div>

                {consultations.filter(c=>c.status==="accepted").length === 0 && (
                  <p style={{ color:"#9CA3AF", fontSize:14 }}>No upcoming consultations.</p>
                )}

                {consultations.filter(c=>c.status==="accepted").slice(0,4).map((c) => (
                  <div key={c._id}
                    onClick={() => setSelectedConsultation(c)}
                    style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #F3F4F6", cursor:"pointer" }}
                  >
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:"#0B1F3A", marginBottom:2 }}>{c.client?.name}</div>
                      <div style={{ fontSize:12, color:"#6B7280" }}>{c.message?.slice(0,30)}</div>
                    </div>
                    <span style={{ padding:"4px 12px", borderRadius:999, fontSize:12, fontWeight:700, background:"rgba(16,185,129,0.12)", color:"#10B981", border:"1px solid rgba(16,185,129,0.25)" }}>
                      Confirmed
                    </span>
                  </div>
                ))}

                {consultations.filter(c=>c.status==="accepted").length > 0 && (
                  <div style={{ marginTop:16, fontSize:13, color:"#3B82F6", fontWeight:600, cursor:"pointer" }}>
                    View all &rsaquo;&rsaquo;
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ── CHAT WINDOW ── */}
          {selectedConsultation && selectedConsultation.status === "accepted" && (
            <div style={{ marginTop:28 }}>
              <div style={{ fontSize:16, fontWeight:700, color:"#0B1F3A", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:4, height:20, background:"linear-gradient(135deg,#006B3F,#00A86B)", borderRadius:4 }}/>
                Consultation Chat
              </div>
              <ChatWindow consultationId={selectedConsultation._id} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
