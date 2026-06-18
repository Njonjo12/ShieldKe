import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getToken } from "../utils/auth";
import useIsMobile from "../hooks/useIsMobile";
import {
  FiUsers, FiBriefcase, FiClock, FiList,
  FiCheckCircle, FiXCircle, FiFileText, FiBell,
  FiMail, FiShield, FiMessageSquare,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_URL = API_URL.replace("/api", "");

export default function AdminDashboard() {

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const [lawyers, setLawyers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allConsultations, setAllConsultations] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => { fetchLawyers(); }, []);

  /* fetch users/consultations only when their tab is first opened, to avoid unnecessary calls */
  useEffect(() => {
    if (activeTab === "users" && allUsers.length === 0) fetchAllUsers();
    if (activeTab === "consultations" && allConsultations.length === 0) fetchAllConsultations();
  }, [activeTab]);

  /* ── FETCH LAWYERS ── */
  const fetchLawyers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/lawyers`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setLawyers(data);
    } catch (e) { console.error(e); }
  };

  /* ── FETCH ALL USERS (new) ── */
  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setAllUsers(data);
    } catch (e) { console.error(e); }
  };

  /* ── FETCH ALL CONSULTATIONS (new) ── */
  const fetchAllConsultations = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/consultations`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setAllConsultations(data);
    } catch (e) { console.error(e); }
  };

  /* ── APPROVE ── */
  const approveLawyer = async (id) => {
    try {
      await fetch(`${API_URL}/admin/approve-lawyer/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchLawyers();
    } catch (e) { console.error(e); }
  };

  /* ── REJECT ── */
  const rejectLawyer = async (id) => {
    try {
      const rejectionReason = rejectionReasons[id];
      if (!rejectionReason) { alert("Please provide rejection reason"); return; }
      await fetch(`${API_URL}/admin/reject-lawyer/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ rejectionReason })
      });
      fetchLawyers();
    } catch (e) { console.error(e); }
  };

  /* ── STATUS STYLE ── */
  const getStatusStyle = (status) => {
    if (status === "verified") return { bg:"rgba(16,185,129,0.12)", color:"#34D399", border:"1px solid rgba(16,185,129,0.25)" };
    if (status === "rejected") return { bg:"rgba(239,68,68,0.12)", color:"#F87171", border:"1px solid rgba(239,68,68,0.25)" };
    return { bg:"rgba(245,158,11,0.12)", color:"#FBBF24", border:"1px solid rgba(245,158,11,0.25)" };
  };

  const pending  = lawyers.filter(l => l.verificationStatus === "pending");
  const verified = lawyers.filter(l => l.verificationStatus === "verified");
  const rejected = lawyers.filter(l => l.verificationStatus === "rejected");

  const goTab = (tab) => navigate(`/admin?tab=${tab}`);

  const TAB_TITLES = {
    overview: "Overview",
    verifications: "Lawyer Verifications",
    users: "All Users",
    consultations: "All Consultations",
    settings: "Settings",
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#07131F" }}>

      <Sidebar role="admin" />

      <div style={{ marginLeft: isMobile ? 0 : 240, flex:1, display:"flex", flexDirection:"column", width: isMobile ? "100%" : "auto" }}>

        {/* ── TOP BAR ── */}
        <div style={{
          height:64, background:"#fff",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding: isMobile ? "0 16px 0 64px" : "0 32px", borderBottom:"1px solid #E5E7EB",
          position:"sticky", top:0, zIndex:50,
        }}>
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <div style={{ fontSize: isMobile ? 16 : 20, fontWeight:800, color:"#0B1F3A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{TAB_TITLES[activeTab]}</div>
            {!isMobile && <div style={{ fontSize:13, color:"#6B7280" }}>Welcome back, Admin</div>}
          </div>
          <div style={{ position:"relative", cursor:"pointer", padding: 6, flexShrink: 0 }} onClick={() => navigate("/notifications")}>
            <FiBell size={20} color="#374151"/>
            {pending.length > 0 && (
              <div style={{ position:"absolute", top:1, right:1, minWidth:16, height:16, padding: "0 3px", borderRadius:8, background:"#EF4444", color:"#fff", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #fff" }}>
                {pending.length > 9 ? "9+" : pending.length}
              </div>
            )}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: isMobile ? "20px 16px" : "32px", flex:1, background:"#F8FAFC" }}>

          {/* ── STAT CARDS — shown on every tab for quick context ── */}
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: isMobile ? 12 : 20, marginBottom: isMobile ? 20 : 32 }}>
            {[
              { icon:<FiUsers size={22}/>,     color:"#3B82F6", bg:"#EFF6FF", value: lawyers.length,  label:"Total Lawyers",           sub:"View all", tab: "verifications" },
              { icon:<FiBriefcase size={22}/>, color:"#10B981", bg:"#ECFDF5", value: verified.length, label:"Verified",               sub:"View all", tab: "verifications" },
              { icon:<FiClock size={22}/>,     color:"#F59E0B", bg:"#FFFBEB", value: pending.length,  label:"Pending Verifications",  sub:"View all", tab: "verifications" },
              { icon:<FiList size={22}/>,      color:"#8B5CF6", bg:"#F5F3FF", value: allConsultations.length || "—", label:"Consultations", sub:"View all", tab: "consultations" },
            ].map((s,i) => (
              <div key={i} style={{ background:"#fff", borderRadius:14, padding: isMobile ? "16px" : "22px 24px", border:"1px solid #E5E7EB", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ width: isMobile ? 38 : 48, height: isMobile ? 38 : 48, borderRadius:"50%", background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, marginBottom: isMobile ? 10 : 14 }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: isMobile ? 22 : 32, fontWeight:800, color:"#0B1F3A", lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize: isMobile ? 13 : 14, color:"#374151", fontWeight:600, marginTop:4 }}>{s.label}</div>
                <div onClick={() => goTab(s.tab)} style={{ fontSize:13, color:s.color, fontWeight:600, marginTop:4, cursor:"pointer" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ══════════════════════════════════════
              TAB: OVERVIEW
          ══════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 16 : 24, marginBottom:32 }}>

              {/* VERIFICATION REQUESTS */}
              <div style={{ background:"#fff", borderRadius:14, border:"1px solid #E5E7EB", padding: isMobile ? "18px" : "24px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize:16, fontWeight:700, color:"#0B1F3A", marginBottom:20 }}>Verification Requests</div>

                {pending.length === 0 && <p style={{ color:"#9CA3AF", fontSize:14 }}>No pending verifications.</p>}

                {pending.slice(0,4).map((l) => (
                  <div key={l._id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid #F3F4F6", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                    <img
                      src={
                        l.profilePhoto
                          ? `${SERVER_URL}/${l.profilePhoto}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(l.name)}&background=EFF6FF&color=1D4ED8&size=80`
                      }
                      alt={l.name}
                      style={{ width:40, height:40, borderRadius:"50%", objectFit:"cover", flexShrink:0 }}
                    />
                    <div style={{ flex:1, minWidth: isMobile ? "60%" : 0 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:"#0B1F3A" }}>{l.name}</div>
                      <div style={{ fontSize:12, color:"#6B7280" }}>{l.specialization || "Advocate"}</div>
                    </div>
                    {!isMobile && (
                      <span style={{ padding:"4px 10px", borderRadius:999, fontSize:12, fontWeight:700, background:"rgba(245,158,11,0.12)", color:"#FBBF24", border:"1px solid rgba(245,158,11,0.25)", flexShrink:0 }}>
                        Pending
                      </span>
                    )}
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => approveLawyer(l._id)}
                        style={{ padding:"5px 11px", borderRadius:6, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:"#10B981", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                        Approve
                      </button>
                      <button onClick={() => goTab("verifications")}
                        style={{ padding:"5px 11px", borderRadius:6, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#F87171", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                        Review
                      </button>
                    </div>
                  </div>
                ))}

                {pending.length > 4 && (
                  <div onClick={() => goTab("verifications")} style={{ marginTop:16, fontSize:13, color:"#3B82F6", fontWeight:600, cursor:"pointer" }}>
                    View all requests ›
                  </div>
                )}
              </div>

              {/* CONSULTATIONS OVERVIEW DONUT */}
              <div style={{ background:"#fff", borderRadius:14, border:"1px solid #E5E7EB", padding: isMobile ? "18px" : "24px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize:16, fontWeight:700, color:"#0B1F3A", marginBottom:20 }}>Lawyer Verification Mix</div>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap: isMobile ? 20 : 40, flexWrap: "wrap" }}>
                  <div style={{ position:"relative", width:140, height:140, flexShrink:0 }}>
                    <svg viewBox="0 0 36 36" style={{ width:140, height:140, transform:"rotate(-90deg)" }}>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F3F4F6" strokeWidth="3.2"/>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F59E0B" strokeWidth="3.2"
                        strokeDasharray={`${lawyers.length ? (pending.length/lawyers.length*100) : 0} 100`} strokeDashoffset="0"/>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10B981" strokeWidth="3.2"
                        strokeDasharray={`${lawyers.length ? (verified.length/lawyers.length*100) : 0} 100`}
                        strokeDashoffset={`-${lawyers.length ? (pending.length/lawyers.length*100) : 0}`}/>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EF4444" strokeWidth="3.2"
                        strokeDasharray={`${lawyers.length ? (rejected.length/lawyers.length*100) : 0} 100`}
                        strokeDashoffset={`-${lawyers.length ? ((pending.length+verified.length)/lawyers.length*100) : 0}`}/>
                    </svg>
                    <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ fontSize:26, fontWeight:800, color:"#0B1F3A" }}>{lawyers.length}</div>
                      <div style={{ fontSize:11, color:"#6B7280", fontWeight:600 }}>Total</div>
                    </div>
                  </div>

                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {[
                      { color:"#F59E0B", label:"Pending",  value: pending.length },
                      { color:"#10B981", label:"Verified", value: verified.length },
                      { color:"#EF4444", label:"Rejected", value: rejected.length },
                    ].map((item) => (
                      <div key={item.label} style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:10, height:10, borderRadius:"50%", background:item.color, flexShrink:0 }}/>
                        <span style={{ fontSize:13, color:"#374151" }}>{item.label}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:"#0B1F3A", marginLeft:"auto", paddingLeft:16 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div onClick={() => goTab("consultations")} style={{ marginTop:20, fontSize:13, color:"#3B82F6", fontWeight:600, cursor:"pointer", textAlign:"right" }}>
                  View all consultations ›
                </div>
              </div>

            </div>
          )}

          {/* ══════════════════════════════════════
              TAB: VERIFICATIONS — full lawyer review cards
          ══════════════════════════════════════ */}
          {activeTab === "verifications" && lawyers.map((lawyer) => {
            const st = getStatusStyle(lawyer.verificationStatus);
            return (
              <div key={lawyer._id} style={{ background:"#fff", borderRadius:14, border:"1px solid #E5E7EB", padding: isMobile ? "20px" : "28px", marginBottom:20, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>

                {/* HEADER */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22, flexWrap: isMobile ? "wrap" : "nowrap", gap: 12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <img
                      src={
                        lawyer.profilePhoto
                          ? `${SERVER_URL}/${lawyer.profilePhoto}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.name)}&background=EFF6FF&color=1D4ED8&size=80`
                      }
                      alt={lawyer.name}
                      style={{ width:56, height:56, borderRadius:"50%", objectFit:"cover", border:"3px solid #E5E7EB", flexShrink:0 }}
                    />
                    <div>
                      <div style={{ fontSize:18, fontWeight:800, color:"#0B1F3A" }}>{lawyer.name}</div>
                      <div style={{ fontSize:13, color:"#6B7280", marginTop:2 }}>{lawyer.email}</div>
                    </div>
                  </div>
                  <span style={{ padding:"7px 16px", borderRadius:999, fontSize:13, fontWeight:700, background:st.bg, color:st.color, border:st.border, textTransform:"capitalize" }}>
                    {lawyer.verificationStatus}
                  </span>
                </div>

                {/* INFO GRID */}
                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap:12, marginBottom:20 }}>
                  {[
                    { label:"SPECIALIZATION", value: lawyer.specialization || "—" },
                    { label:"EXPERIENCE",     value: `${lawyer.yearsOfExperience || 0} years` },
                    { label:"LSK NUMBER",     value: lawyer.lskNumber || "—" },
                    { label:"LOCATION",       value: lawyer.location || "—" },
                  ].map((info) => (
                    <div key={info.label} style={{ background:"#F8FAFC", borderRadius:9, padding:"13px 16px", border:"1px solid #E5E7EB" }}>
                      <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#9CA3AF", marginBottom:6 }}>{info.label}</div>
                      <div style={{ fontSize:14, fontWeight:600, color:"#0B1F3A" }}>{info.value}</div>
                    </div>
                  ))}
                </div>

                {/* BIO */}
                {lawyer.bio && (
                  <div style={{ background:"#F8FAFC", borderRadius:9, padding:"13px 16px", border:"1px solid #E5E7EB", marginBottom:16 }}>
                    <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"#9CA3AF", marginBottom:6 }}>BIO</div>
                    <div style={{ fontSize:14, color:"#374151", lineHeight:1.7 }}>{lawyer.bio}</div>
                  </div>
                )}

                {/* DOCUMENTS */}
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
                  {lawyer.barCertificate && (
                    <a href={`${SERVER_URL}/${lawyer.barCertificate}`} target="_blank" rel="noreferrer"
                      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:7, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", color:"#10B981", fontSize:13, fontWeight:700, textDecoration:"none" }}>
                      <FiFileText size={13}/> BAR Certificate
                    </a>
                  )}
                  {lawyer.practicingCertificate && (
                    <a href={`${SERVER_URL}/${lawyer.practicingCertificate}`} target="_blank" rel="noreferrer"
                      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:7, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", color:"#10B981", fontSize:13, fontWeight:700, textDecoration:"none" }}>
                      <FiFileText size={13}/> Practicing Certificate
                    </a>
                  )}
                  {lawyer.nationalIdDocument && (
                    <a href={`${SERVER_URL}/${lawyer.nationalIdDocument}`} target="_blank" rel="noreferrer"
                      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:7, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", color:"#10B981", fontSize:13, fontWeight:700, textDecoration:"none" }}>
                      <FiFileText size={13}/> National ID
                    </a>
                  )}
                </div>

                {/* REJECTION DISPLAY */}
                {lawyer.verificationStatus === "rejected" && lawyer.rejectionReason && (
                  <div style={{ padding:"12px 16px", borderRadius:9, background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)", marginBottom:14 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#F87171", marginBottom:4 }}>Rejection Reason:</div>
                    <div style={{ fontSize:14, color:"rgba(252,165,165,0.85)" }}>{lawyer.rejectionReason}</div>
                  </div>
                )}

                {/* REJECTION INPUT */}
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#9CA3AF", marginBottom:8 }}>
                    Reason for Rejection
                  </div>
                  <textarea
                    placeholder="Enter rejection reason before clicking Reject..."
                    value={rejectionReasons[lawyer._id] || ""}
                    onChange={e => setRejectionReasons({ ...rejectionReasons, [lawyer._id]: e.target.value })}
                    style={{ width:"100%", minHeight:90, padding:"12px 14px", borderRadius:9, border:"1px solid #E5E7EB", background:"#F8FAFC", color:"#374151", fontSize:14, fontFamily:"inherit", resize:"vertical", outline:"none", lineHeight:1.6, boxSizing: "border-box" }}
                  />
                </div>

                {/* ACTIONS */}
                <div style={{ display:"flex", gap:12, flexWrap: isMobile ? "wrap" : "nowrap" }}>
                  <button onClick={() => approveLawyer(lawyer._id)}
                    style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"11px 22px", borderRadius:9, background:"linear-gradient(135deg,#006B3F,#00A86B)", border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", flex: isMobile ? "1 1 100%" : "none", justifyContent: "center" }}>
                    <FiCheckCircle size={15}/> Approve Lawyer
                  </button>
                  <button onClick={() => rejectLawyer(lawyer._id)}
                    style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"11px 22px", borderRadius:9, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#F87171", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", flex: isMobile ? "1 1 100%" : "none", justifyContent: "center" }}>
                    <FiXCircle size={15}/> Reject Lawyer
                  </button>
                </div>

              </div>
            );
          })}

          {activeTab === "verifications" && lawyers.length === 0 && (
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #E5E7EB", padding:"48px 24px", textAlign:"center", color:"#9CA3AF" }}>
              No lawyer applications yet.
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB: USERS (new)
          ══════════════════════════════════════ */}
          {activeTab === "users" && (
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #E5E7EB", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>

              {!isMobile && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 120px 120px", padding:"12px 24px", background:"#F9FAFB", borderBottom:"1px solid #E5E7EB" }}>
                  {["Name", "Email", "Role", "Joined"].map((h) => (
                    <div key={h} style={{ fontSize:12, fontWeight:700, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</div>
                  ))}
                </div>
              )}

              {allUsers.length === 0 && (
                <div style={{ padding:"48px 24px", textAlign:"center", color:"#9CA3AF" }}>
                  <FiUsers size={32} style={{ marginBottom:10, opacity:0.4 }} />
                  <div>No users found.</div>
                </div>
              )}

              {allUsers.map((u) => (
                isMobile ? (
                  <div key={u._id} style={{ padding:"14px 16px", borderBottom:"1px solid #F3F4F6" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:"#0B1F3A" }}>{u.name}</div>
                      <span style={{ padding:"2px 10px", borderRadius:999, fontSize:11, fontWeight:700, textTransform:"capitalize", background: u.role === "lawyer" ? "#ECFDF5" : u.role === "admin" ? "#F5F3FF" : "#EFF6FF", color: u.role === "lawyer" ? "#10B981" : u.role === "admin" ? "#8B5CF6" : "#3B82F6" }}>
                        {u.role}
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:"#6B7280" }}>{u.email}</div>
                  </div>
                ) : (
                  <div key={u._id} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 120px 120px", padding:"14px 24px", borderBottom:"1px solid #F3F4F6", alignItems:"center" }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#0B1F3A" }}>{u.name}</div>
                    <div style={{ fontSize:13, color:"#6B7280", display: "flex", alignItems: "center", gap: 6 }}><FiMail size={12}/>{u.email}</div>
                    <span style={{ padding:"4px 10px", borderRadius:999, fontSize:12, fontWeight:700, textTransform:"capitalize", width: "fit-content", background: u.role === "lawyer" ? "#ECFDF5" : u.role === "admin" ? "#F5F3FF" : "#EFF6FF", color: u.role === "lawyer" ? "#10B981" : u.role === "admin" ? "#8B5CF6" : "#3B82F6" }}>
                      {u.role}
                    </span>
                    <div style={{ fontSize:13, color:"#9CA3AF" }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-KE", { month:"short", day:"numeric", year:"numeric" }) : "—"}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB: CONSULTATIONS (new)
          ══════════════════════════════════════ */}
          {activeTab === "consultations" && (
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #E5E7EB", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>

              {!isMobile && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 110px 110px", padding:"12px 24px", background:"#F9FAFB", borderBottom:"1px solid #E5E7EB" }}>
                  {["Client", "Lawyer", "Message", "Status", "Date"].map((h) => (
                    <div key={h} style={{ fontSize:12, fontWeight:700, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</div>
                  ))}
                </div>
              )}

              {allConsultations.length === 0 && (
                <div style={{ padding:"48px 24px", textAlign:"center", color:"#9CA3AF" }}>
                  <FiMessageSquare size={32} style={{ marginBottom:10, opacity:0.4 }} />
                  <div>No consultations on the platform yet.</div>
                </div>
              )}

              {allConsultations.map((c) => {
                const st = getStatusStyle(c.status === "accepted" ? "verified" : c.status === "rejected" ? "rejected" : "pending");
                return isMobile ? (
                  <div key={c._id} style={{ padding:"14px 16px", borderBottom:"1px solid #F3F4F6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#0B1F3A" }}>{c.client?.name || "Client"}</div>
                      <span style={{ padding:"2px 10px", borderRadius:999, fontSize:11, fontWeight:700, textTransform:"capitalize", background:st.bg, color:st.color }}>{c.status}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#6B7280", marginBottom: 2 }}>→ {c.lawyer?.name || "Lawyer"}</div>
                    <div style={{ fontSize:12, color:"#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.message}</div>
                  </div>
                ) : (
                  <div key={c._id} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 110px 110px", padding:"14px 24px", borderBottom:"1px solid #F3F4F6", alignItems:"center" }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#0B1F3A" }}>{c.client?.name || "Client"}</div>
                    <div style={{ fontSize:14, color:"#374151" }}>{c.lawyer?.name || "Lawyer"}</div>
                    <div style={{ fontSize:13, color:"#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{c.message}</div>
                    <span style={{ padding:"4px 10px", borderRadius:999, fontSize:12, fontWeight:700, textTransform:"capitalize", width: "fit-content", background:st.bg, color:st.color }}>{c.status}</span>
                    <div style={{ fontSize:13, color:"#9CA3AF" }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-KE", { month:"short", day:"numeric", year:"numeric" }) : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ══════════════════════════════════════
              TAB: SETTINGS
          ══════════════════════════════════════ */}
          {activeTab === "settings" && (
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #E5E7EB", padding: isMobile ? "20px" : "28px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", maxWidth: 480 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6", flexShrink: 0 }}>
                  <FiShield size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#0B1F3A" }}>{user?.name}</div>
                  <div style={{ fontSize: 13, color: "#6B7280" }}>{user?.email}</div>
                </div>
              </div>

              <div style={{ padding: "12px 16px", background: "#F5F3FF", borderRadius: 9, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <FiShield size={14} color="#8B5CF6" />
                <span style={{ fontSize: 13, color: "#6B21A8", fontWeight: 600 }}>Administrator Account</span>
              </div>

              <p style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.7 }}>
                Password changes, two-factor authentication, and team-member management are on the roadmap for a future update.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
