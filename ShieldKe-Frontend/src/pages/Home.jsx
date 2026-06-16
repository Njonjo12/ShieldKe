import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import Footer from "../components/Footer";
import {
  FiShield, FiCheckCircle, FiArrowRight, FiLock,
  FiClock, FiStar, FiMapPin, FiBriefcase, FiUsers,
  FiMessageSquare, FiFileText, FiAward,
} from "react-icons/fi";

/* ── palette (all inline — no dependency on broken CSS vars) ── */
const C = {
  navy:       "#0B1F3A",
  navyDark:   "#060F1D",
  navyMid:    "#132843",
  green:      "#006B3F",
  greenLight: "#00A86B",
  gold:       "#C9961A",
  goldLight:  "#F0BE4A",
  white:      "#FFFFFF",
  offWhite:   "#F8FAFC",
  muted:      "rgba(255,255,255,0.5)",
  border:     "rgba(255,255,255,0.08)",
};

/* ── mock lawyer cards shown in the hero visual ── */
const LAWYERS = [
  { name: "Wanjiku A.",    area: "Family Law",       exp: "12 yrs", rating: 4.9, initials: "WA", color: "#3B82F6" },
  { name: "Otieno J.",     area: "Corporate Law",    exp: "9 yrs",  rating: 4.8, initials: "OJ", color: "#8B5CF6" },
  { name: "Mwangi G.",     area: "Criminal Defence", exp: "15 yrs", rating: 4.9, initials: "MG", color: "#10B981" },
  { name: "Kamau P.",      area: "Property Law",     exp: "7 yrs",  rating: 4.7, initials: "KP", color: "#F59E0B" },
  { name: "Njoroge S.",    area: "Employment Law",   exp: "11 yrs", rating: 4.8, initials: "NS", color: "#EF4444" },
  { name: "Achieng F.",    area: "Immigration",      exp: "6 yrs",  rating: 4.6, initials: "AF", color: "#06B6D4" },
];

const PRACTICE_AREAS = [
  "Family Law", "Property Law", "Corporate Law",
  "Criminal Defence", "Employment Law", "Immigration",
  "Land Disputes", "Succession & Wills",
];

const STEPS = [
  { n: "01", icon: <FiUsers size={22}/>,       title: "Create Account",       body: "Sign up as a client in under 2 minutes. No paperwork, no queues." },
  { n: "02", icon: <FiCheckCircle size={22}/>, title: "Find a Verified Lawyer", body: "Browse LSK-registered advocates filtered by area, location and fee." },
  { n: "03", icon: <FiMessageSquare size={22}/>,title: "Get Legal Help",       body: "Chat securely, share documents and get the advice you need — fast." },
];

const TESTIMONIALS = [
  { name: "Brian K.", role: "Business Owner · Nairobi", quote: "I resolved a contract dispute in 3 days. Couldn't believe how fast it was.", stars: 5, initials: "BK", color: "#3B82F6" },
  { name: "Mercy A.", role: "Landlord · Mombasa",       quote: "Found a property lawyer who sorted my tenant issue the same week.", stars: 5, initials: "MA", color: "#10B981" },
  { name: "David M.", role: "Employee · Kisumu",        quote: "My wrongful termination case was handled professionally start to finish.", stars: 5, initials: "DM", color: "#F59E0B" },
];

/* ── tiny helpers ── */
const Chip = ({ children, color = C.greenLight }) => (
  <span style={{ display: "inline-flex", alignItems: "center", padding: "5px 13px", borderRadius: 999, background: color + "18", border: `1px solid ${color}30`, color, fontSize: 12, fontWeight: 700, letterSpacing: "0.02em" }}>
    {children}
  </span>
);

const Stars = ({ n }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {Array.from({ length: n }).map((_, i) => (
      <FiStar key={i} size={13} color={C.goldLight} fill={C.goldLight} />
    ))}
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const heroRef  = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY    = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <div style={{ background: C.navyDark, color: C.white, fontFamily: "'Inter', system-ui, sans-serif", overflowX: "hidden" }}>

      {/* ══════════════════════════════════════════════
          NAV
      ══════════════════════════════════════════════ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 66, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", background: "rgba(6,15,29,0.88)", backdropFilter: "blur(18px)", borderBottom: `1px solid ${C.border}` }}>

        {/* logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiShield size={17} color={C.navy} strokeWidth={2.6} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.white, letterSpacing: "-0.03em", lineHeight: 1 }}>ShieldKe</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>LEGAL CONNECT</div>
          </div>
        </div>

        {/* links */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {["How it works", "Practice Areas", "For Lawyers"].map((l) => (
            <button key={l} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "8px 14px", borderRadius: 8, fontFamily: "inherit" }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
            >{l}</button>
          ))}
          <button onClick={() => navigate("/login")}
            style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer", padding: "9px 20px", borderRadius: 9, fontFamily: "inherit", marginLeft: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          >Sign In</button>
          <button onClick={() => navigate("/register")}
            style={{ background: `linear-gradient(135deg,${C.green},${C.greenLight})`, border: "none", color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer", padding: "9px 22px", borderRadius: 9, fontFamily: "inherit" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >Get Started →</button>
        </div>

      </nav>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section ref={heroRef} style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", padding: "100px 48px 80px", gap: 60, position: "relative", overflow: "hidden" }}>

        {/* ambient blobs */}
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${C.green}22 0%, transparent 70%)`, top: -160, left: -160, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${C.gold}14 0%, transparent 70%)`, bottom: -100, right: 160, pointerEvents: "none" }} />

        {/* LEFT */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }} style={{ position: "relative", zIndex: 2 }}>

          {/* eyebrow */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, marginBottom: 28 }}>
            <span style={{ fontSize: 15 }}>🇰🇪</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Kenya's verified legal platform</span>
            <Chip>LSK Certified</Chip>
          </motion.div>

          {/* headline */}
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7 }}
            style={{ fontSize: "clamp(38px,5.5vw,64px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 24, color: C.white }}>
            Your Rights.<br />
            <span style={{ background: `linear-gradient(90deg,${C.greenLight},${C.goldLight})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Defended.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            style={{ fontSize: 18, lineHeight: 1.85, color: "rgba(255,255,255,0.5)", maxWidth: 500, marginBottom: 38 }}>
            ShieldKe connects you with <strong style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>LSK-registered advocates</strong> across Kenya for fast, confidential legal consultations — from land disputes to corporate law.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 44 }}>
            <button onClick={() => navigate("/register")}
              style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "16px 30px", borderRadius: 12, background: `linear-gradient(135deg,${C.green},${C.greenLight})`, border: "none", color: C.white, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 12px 32px rgba(0,107,63,0.35)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 18px 40px rgba(0,107,63,0.42)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,107,63,0.35)"; }}
            >
              Find a Lawyer <FiArrowRight size={17} />
            </button>
            <button onClick={() => navigate("/login")}
              style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "16px 28px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, color: C.white, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
            >
              Sign In
            </button>
          </motion.div>

          {/* trust row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {[
              { icon: <FiCheckCircle size={14} color={C.greenLight}/>, text: "All lawyers LSK-verified" },
              { icon: <FiLock size={14} color={C.greenLight}/>,        text: "End-to-end encrypted" },
              { icon: <FiClock size={14} color={C.greenLight}/>,       text: "Available 24 / 7" },
            ].map((t) => (
              <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                {t.icon} {t.text}
              </div>
            ))}
          </motion.div>

        </motion.div>

        {/* RIGHT — floating lawyer cards */}
        <motion.div style={{ y: heroY, position: "relative", zIndex: 2 }}
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.22,1,0.36,1] }}>

          {/* heading chip */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Verified Advocates Online</div>
            <Chip color={C.greenLight}>● Live</Chip>
          </div>

          {/* card grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {LAWYERS.map((l, i) => (
              <motion.div key={l.name}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 16px 36px rgba(0,0,0,0.35)" }}
                style={{ background: "rgba(19,40,67,0.85)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", backdropFilter: "blur(16px)", cursor: "default", transition: "box-shadow 0.2s, transform 0.2s" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: l.color + "20", border: `2px solid ${l.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: l.color, flexShrink: 0 }}>
                    {l.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.white, lineHeight: 1.2 }}>{l.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{l.exp} exp.</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.greenLight, fontWeight: 700, marginBottom: 8 }}>{l.area}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Stars n={Math.floor(l.rating)} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: C.white }}>{l.rating}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* bottom bar */}
          <div style={{ marginTop: 16, padding: "14px 18px", background: `linear-gradient(135deg,${C.green}22,${C.greenLight}14)`, border: `1px solid ${C.greenLight}25`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
              <strong style={{ color: C.white }}>47+</strong> verified lawyers ready to help
            </div>
            <button onClick={() => navigate("/register")}
              style={{ background: C.greenLight, border: "none", color: C.white, fontSize: 12, fontWeight: 800, padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>
              Get Help Now
            </button>
          </div>

        </motion.div>

      </section>

      {/* ══════════════════════════════════════════════
          STATS RIBBON
      ══════════════════════════════════════════════ */}
      <div style={{ background: `linear-gradient(135deg,${C.green},${C.greenLight})`, padding: "28px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, textAlign: "center" }}>
          {[
            { value: "47+",   label: "Verified Lawyers" },
            { value: "500+",  label: "Consultations Handled" },
            { value: "12",    label: "Practice Areas" },
            { value: "4.8★",  label: "Average Rating" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.white, letterSpacing: "-0.03em" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section style={{ padding: "100px 48px", background: C.navyDark }}>
        <div style={{ maxWidth: 1100, margin: "auto" }}>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: 64 }}>
            <Chip color={C.goldLight}>Simple Process</Chip>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.03em", marginTop: 16, marginBottom: 14, color: C.white }}>
              Legal help in three steps
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 17, maxWidth: 560, margin: "auto", lineHeight: 1.9 }}>
              No waiting rooms. No referral fees. Just fast access to qualified Kenyan advocates.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
            {STEPS.map((s, i) => (
              <motion.div key={s.n}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                style={{ background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: 20, padding: "34px 30px", position: "relative", overflow: "hidden" }}>

                {/* number watermark */}
                <div style={{ position: "absolute", top: -10, right: 16, fontSize: 80, fontWeight: 900, color: "rgba(255,255,255,0.03)", letterSpacing: "-0.05em", lineHeight: 1, userSelect: "none" }}>{s.n}</div>

                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${C.greenLight}18`, border: `1px solid ${C.greenLight}28`, display: "flex", alignItems: "center", justifyContent: "center", color: C.greenLight, marginBottom: 22 }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 19, fontWeight: 800, color: C.white, marginBottom: 10 }}>{s.title}</div>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}>{s.body}</p>

              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PRACTICE AREAS
      ══════════════════════════════════════════════ */}
      <section style={{ padding: "90px 48px", background: C.navy }}>
        <div style={{ maxWidth: 1100, margin: "auto" }}>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
            <div>
              <Chip color={C.greenLight}>Practice Areas</Chip>
              <h2 style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 900, letterSpacing: "-0.03em", marginTop: 14, color: C.white }}>
                Whatever your legal need,<br />we have a specialist.
              </h2>
            </div>
            <button onClick={() => navigate("/register")}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Browse All Lawyers <FiArrowRight size={15} />
            </button>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {[
              { area: "Family Law",       icon: <FiUsers size={22}/>,       desc: "Divorce, custody, matrimonial property",    color: "#3B82F6" },
              { area: "Property Law",     icon: <FiMapPin size={22}/>,      desc: "Land transfers, title deeds, disputes",    color: "#10B981" },
              { area: "Corporate Law",    icon: <FiBriefcase size={22}/>,   desc: "Business registration, contracts, M&A",    color: "#F59E0B" },
              { area: "Criminal Defence", icon: <FiShield size={22}/>,      desc: "Bail, trial representation, appeals",      color: "#EF4444" },
              { area: "Employment Law",   icon: <FiFileText size={22}/>,    desc: "Wrongful termination, contracts, COTU",    color: "#8B5CF6" },
              { area: "Immigration",      icon: <FiAward size={22}/>,       desc: "Work permits, citizenship, visas",         color: "#06B6D4" },
              { area: "Succession",       icon: <FiCheckCircle size={22}/>, desc: "Wills, probate, estate administration",   color: "#C9961A" },
              { area: "Land Disputes",    icon: <FiMapPin size={22}/>,      desc: "Boundary disputes, adverse possession",    color: "#F43F5E" },
            ].map((item, i) => (
              <motion.div key={item.area}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4, borderColor: item.color + "50" }}
                onClick={() => navigate("/register")}
                style={{ background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px 20px", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: item.color + "18", display: "flex", alignItems: "center", justifyContent: "center", color: item.color, marginBottom: 14 }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 6 }}>{item.area}</div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <section style={{ padding: "100px 48px", background: C.navyDark }}>
        <div style={{ maxWidth: 1100, margin: "auto" }}>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: 56 }}>
            <Chip color={C.goldLight}>Client Stories</Chip>
            <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 900, letterSpacing: "-0.03em", marginTop: 16, color: C.white }}>
              Real Kenyans. Real Results.
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                style={{ background: C.navyMid, border: `1px solid ${C.border}`, borderRadius: 20, padding: "30px 28px" }}>

                <Stars n={t.stars} />

                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.85, margin: "18px 0 24px", fontStyle: "italic" }}>
                  "{t.quote}"
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: t.color + "22", border: `2px solid ${t.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: t.color, flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.white }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{t.role}</div>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════ */}
      <section style={{ padding: "90px 48px", background: C.navy }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ maxWidth: 860, margin: "auto", textAlign: "center", background: `linear-gradient(135deg, ${C.navyMid}, ${C.green}22)`, border: `1px solid ${C.greenLight}20`, borderRadius: 28, padding: "64px 48px", position: "relative", overflow: "hidden" }}>

          {/* decoration rings */}
          <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", border: `1px solid ${C.greenLight}10`, top: -120, right: -80, pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", border: `1px solid ${C.gold}10`, bottom: -80, left: -60, pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <Chip color={C.goldLight}>Start Today — Free</Chip>
            <h2 style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, letterSpacing: "-0.03em", marginTop: 20, marginBottom: 16, color: C.white }}>
              Don't face legal issues alone.
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.9, maxWidth: 520, margin: "0 auto 36px" }}>
              Thousands of Kenyans have already used ShieldKe to resolve disputes, protect their rights, and get the legal clarity they deserve.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/register")}
                style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "16px 32px", borderRadius: 12, background: `linear-gradient(135deg,${C.green},${C.greenLight})`, border: "none", color: C.white, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 10px 28px rgba(0,107,63,0.35)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Create Free Account <FiArrowRight size={17} />
              </button>
              <button onClick={() => navigate("/login")}
                style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "16px 28px", borderRadius: 12, background: "rgba(255,255,255,0.07)", border: `1px solid ${C.border}`, color: C.white, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
              >
                Sign In
              </button>
            </div>
          </div>

        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          FOR LAWYERS STRIP
      ══════════════════════════════════════════════ */}
      <section style={{ padding: "60px 48px", background: `linear-gradient(135deg,${C.navy},${C.navyMid})`, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.white, marginBottom: 6 }}>Are you an Advocate?</div>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", margin: 0 }}>Join ShieldKe, get verified, and grow your client base across Kenya.</p>
          </div>
          <button onClick={() => navigate("/register")}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 26px", borderRadius: 12, background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, border: "none", color: C.navy, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            Register as a Lawyer <FiArrowRight size={16} />
          </button>
        </div>
      </section>

      <Footer />

    </div>
  );
}
