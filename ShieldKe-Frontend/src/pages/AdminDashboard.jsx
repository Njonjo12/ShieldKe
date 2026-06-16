import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getToken } from "../utils/auth";
import {
  FiUsers, FiBriefcase, FiClock, FiList,
  FiCheckCircle, FiXCircle, FiFileText, FiBell,
} from "react-icons/fi";

const API_URL = "http://localhost:5000/api";

export default function AdminDashboard() {

  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => { fetchLawyers(); }, []);

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

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#07131F" }}>

      <Sidebar role="admin" />

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
            <div style={{ fontSize:13, color:"#6B7280" }}>Welcome back, Admin</div>
          </div>
          <div style={{ position:"relative", cursor:"pointer" }} onClick={() => navigate("/notifications")}>
            <FiBell size={20} color="#374151"/>
            {pending.length > 0 && (
              <div style={{ position:"absolute", top:-4, right:-4, width:16, height:16, borderRadius:"50%", background:"#EF4444", color:"#fff", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #fff" }}>
                {pending.length}
              </div>
            )}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding:"32px", flex:1, background:"#F8FAFC" }}>

          {/* ── STAT CARDS ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20, marginBottom:32 }}>
            {[
              { icon:<FiUsers size={22}/>,    color:"#3B82F6", bg:"#EFF6FF", value: lawyers.length,  label:"Total Users",           sub:"View all" },
              { icon:<FiBriefcase size={22}/>, color:"#10B981", bg:"#ECFDF5", value: verified.length, label:"Lawyers",               sub:"View all" },
              { icon:<FiClock size={22}/>,    color:"#F59E0B", bg:"#FFFBEB", value: pending.length,  label:"Pending Verifications", sub:"View all" },
              { icon:<FiList size={22}/>,     color:"#8B5CF6", bg:"#F5F3FF", value: lawyers.length,  label:"Consultations",         sub:"View all" },
            ].map((s,i) => (
              <div key={i} style={{ background:"#fff", borderRadius:14, padding:"22px 24px", border:"1px solid #E5E7EB", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, marginBottom:14 }}>
                  {s.icon}
                </div>
                <div style={{ fontSize:32, fontWeight:800, color:"#0B1F3A", lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:14, color:"#374151", fontWeight:600, marginTop:4 }}>{s.label}</div>
                <div style={{ fontSize:13, color:s.color, fontWeight:600, marginTop:4, cursor:"pointer" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ── TWO COLUMN ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:32 }}>

            {/* VERIFICATION REQUESTS */}
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #E5E7EB", padding:"24px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize:16, fontWeight:700, color:"#0B1F3A", marginBottom:20 }}>Verification Requests</div>

              {pending.length === 0 && <p style={{ color:"#9CA3AF", fontSize:14 }}>No pending verifications.</p>}

              {pending.slice(0,4).map((l) => (
                <div key={l._id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid #F3F4F6" }}>
                  <img
                    src={
                      l.profilePhoto
                        ? `http://localhost:5000/${l.profilePhoto}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(l.name)}&background=EFF6FF&color=1D4ED8&size=80`
                    }
                    alt={l.name}
                    style={{ width:40, height:40, borderRadius:"50%", objectFit:"cover", flexShrink:0 }}
                  />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#0B1F3A" }}>{l.name}</div>
                    <div style={{ fontSize:12, color:"#6B7280" }}>{l.specialization || "Advocate"}</div>
                    <div style={{ fontSize:11, color:"#9CA3AF" }}>
                      {new Date(l.createdAt).toLocaleDateString("en-KE", { month:"short", day:"numeric", year:"numeric" })}
                    </div>
                  </div>
                  <span style={{ padding:"4px 10px", borderRadius:999, fontSize:12, fontWeight:700, background:"rgba(245,158,11,0.12)", color:"#FBBF24", border:"1px solid rgba(245,158,11,0.25)", flexShrink:0 }}>
                    Pending
                  </span>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => approveLawyer(l._id)}
                      style={{ padding:"5px 11px", borderRadius:6, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:"#10B981", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                      Approve
                    </button>
                    <button onClick={() => {
                        if (!rejectionReasons[l._id]) {
                          setRejectionReasons(p => ({ ...p, [l._id]: "Incomplete documents" }));
                          setTimeout(() => rejectLawyer(l._id), 100);
                        } else { rejectLawyer(l._id); }
                      }}
                      style={{ padding:"5px 11px", borderRadius:6, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#F87171", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}

              {pending.length > 4 && (
                <div style={{ marginTop:16, fontSize:13, color:"#3B82F6", fontWeight:600, cursor:"pointer" }}>
                  View all requests
                </div>
              )}
            </div>

            {/* CONSULTATIONS OVERVIEW DONUT */}
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #E5E7EB", padding:"24px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize:16, fontWeight:700, color:"#0B1F3A", marginBottom:20 }}>Consultations Overview</div>

              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:40 }}>
                {/* Donut */}
                <div style={{ position:"relative", width:140, height:140, flexShrink:0 }}>
                  <svg viewBox="0 0 36 36" style={{ width:140, height:140, transform:"rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F3F4F6" strokeWidth="3.2"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F59E0B" strokeWidth="3.2"
                      strokeDasharray="28 72" strokeDashoffset="0"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10B981" strokeWidth="3.2"
                      strokeDasharray="45 55" strokeDashoffset="-28"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3B82F6" strokeWidth="3.2"
                      strokeDasharray="20 80" strokeDashoffset="-73"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EF4444" strokeWidth="3.2"
                      strokeDasharray="7 93" strokeDashoffset="-93"/>
                  </svg>
                  <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ fontSize:26, fontWeight:800, color:"#0B1F3A" }}>{lawyers.length}</div>
                    <div style={{ fontSize:11, color:"#6B7280", fontWeight:600 }}>Total</div>
                  </div>
                </div>

                {/* Legend */}
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

              <div style={{ marginTop:20, fontSize:13, color:"#3B82F6", fontWeight:600, cursor:"pointer", textAlign:"right" }}>
                View all consultations
              </div>
            </div>

          </div>

          {/* ── FULL LAWYER REVIEW CARDS ── */}
          {lawyers.map((lawyer) => {
            const st = getStatusStyle(lawyer.verificationStatus);
            return (
              <div key={lawyer._id} style={{ background:"#fff", borderRadius:14, border:"1px solid #E5E7EB", padding:"28px", marginBottom:20, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>

                {/* HEADER */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <img
                      src={
                        lawyer.profilePhoto
                          ? `http://localhost:5000/${lawyer.profilePhoto}`
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
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
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
                    <a href={`http://localhost:5000/${lawyer.barCertificate}`} target="_blank" rel="noreferrer"
                      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:7, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", color:"#10B981", fontSize:13, fontWeight:700, textDecoration:"none" }}>
                      <FiFileText size={13}/> BAR Certificate
                    </a>
                  )}
                  {lawyer.practicingCertificate && (
                    <a href={`http://localhost:5000/${lawyer.practicingCertificate}`} target="_blank" rel="noreferrer"
                      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:7, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", color:"#10B981", fontSize:13, fontWeight:700, textDecoration:"none" }}>
                      <FiFileText size={13}/> Practicing Certificate
                    </a>
                  )}
                  {lawyer.nationalIdDocument && (
                    <a href={`http://localhost:5000/${lawyer.nationalIdDocument}`} target="_blank" rel="noreferrer"
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
                    style={{ width:"100%", minHeight:90, padding:"12px 14px", borderRadius:9, border:"1px solid #E5E7EB", background:"#F8FAFC", color:"#374151", fontSize:14, fontFamily:"inherit", resize:"vertical", outline:"none", lineHeight:1.6 }}
                  />
                </div>

                {/* ACTIONS */}
                <div style={{ display:"flex", gap:12 }}>
                  <button onClick={() => approveLawyer(lawyer._id)}
                    style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"11px 22px", borderRadius:9, background:"linear-gradient(135deg,#006B3F,#00A86B)", border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                    <FiCheckCircle size={15}/> Approve Lawyer
                  </button>
                  <button onClick={() => rejectLawyer(lawyer._id)}
                    style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"11px 22px", borderRadius:9, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#F87171", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                    <FiXCircle size={15}/> Reject Lawyer
                  </button>
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
