import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useIsMobile from "../hooks/useIsMobile";
import { FiX, FiArrowRight, FiArrowLeft, FiShield } from "react-icons/fi";

/*
========================================
WELCOME ONBOARDING

A short, illustrated, animated walkthrough
shown once — right after a brand-new
user's first successful login — to explain
what ShieldKe is and how to use it.

Trigger logic: Register.jsx sets a
"justRegistered" flag in localStorage right
after a successful sign-up. This component
watches for that flag plus a logged-in user
on a dashboard route. The moment both are
true, it shows itself, then clears the flag
so it never shows again for that browser.

Deliberately NOT tied to "has this user ever
seen onboarding" — tying it to the
registration flag instead means existing
users (who registered before this feature
existed) are never interrupted by it.

Content branches by role (client vs lawyer)
since the two audiences need genuinely
different information, not a generic
one-size-fits-all message.
========================================
*/

const C = {
  navy:       "#0B1F3A",
  navyDark:   "#060F1D",
  navyMid:    "#132843",
  green:      "#006B3F",
  greenLight: "#00A86B",
  gold:       "#C9961A",
  goldLight:  "#F0BE4A",
  white:      "#FFFFFF",
};

/* ════════════════════════════════════════
   ILLUSTRATIONS — hand-built flat SVGs in
   the existing brand palette, no external
   image dependencies.
════════════════════════════════════════ */

function IllustrationWelcome() {
  return (
    <svg viewBox="0 0 220 200" width="100%" height="100%">
      <circle cx="110" cy="100" r="86" fill={C.greenLight} opacity="0.08" />
      <circle cx="110" cy="100" r="60" fill={C.gold} opacity="0.07" />
      <path d="M110 30 L162 50 V96 C162 134 140 160 110 172 C80 160 58 134 58 96 V50 Z"
        fill={`url(#shieldGrad)`} stroke={C.goldLight} strokeWidth="2" />
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.goldLight} />
        </linearGradient>
      </defs>
      <path d="M88 100 L103 116 L136 80" stroke={C.navy} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {[[42,56],[178,64],[36,128],[182,130],[60,170],[158,172]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 === 0 ? 3.5 : 2.5} fill={C.greenLight} opacity="0.7" />
      ))}
    </svg>
  );
}

function IllustrationReady() {
  return (
    <svg viewBox="0 0 220 200" width="100%" height="100%">
      <circle cx="110" cy="100" r="80" fill={C.greenLight} opacity="0.08" />
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const r1 = 70, r2 = 92;
        return (
          <line key={i}
            x1={110 + Math.cos(angle) * r1} y1={100 + Math.sin(angle) * r1}
            x2={110 + Math.cos(angle) * r2} y2={100 + Math.sin(angle) * r2}
            stroke={C.goldLight} strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
        );
      })}
      <circle cx="110" cy="100" r="52" fill={`url(#readyGrad)`} />
      <defs>
        <linearGradient id="readyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.green} />
          <stop offset="100%" stopColor={C.greenLight} />
        </linearGradient>
      </defs>
      <path d="M86 100 L103 118 L138 80" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function IllustrationBrowse() {
  return (
    <svg viewBox="0 0 220 200" width="100%" height="100%">
      <circle cx="110" cy="100" r="80" fill={C.greenLight} opacity="0.07" />
      {[[58,60,-6],[110,52,0],[162,60,6]].map(([x,y,rot],i) => (
        <g key={i} transform={`rotate(${rot} ${x} ${y+38})`}>
          <rect x={x-32} y={y} width="64" height="76" rx="10" fill={C.navyMid} stroke="rgba(255,255,255,0.1)" />
          <circle cx={x} cy={y+22} r="12" fill={i===1 ? C.goldLight : C.greenLight} opacity="0.85" />
          <rect x={x-18} y={y+42} width="36" height="6" rx="3" fill="rgba(255,255,255,0.35)" />
          <rect x={x-14} y={y+54} width="28" height="5" rx="2.5" fill="rgba(255,255,255,0.18)" />
        </g>
      ))}
      <circle cx="158" cy="148" r="18" fill="none" stroke={C.goldLight} strokeWidth="5" />
      <line x1="171" y1="161" x2="184" y2="174" stroke={C.goldLight} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function IllustrationVerify() {
  return (
    <svg viewBox="0 0 220 200" width="100%" height="100%">
      <circle cx="110" cy="100" r="80" fill={C.greenLight} opacity="0.07" />
      <rect x="62" y="40" width="96" height="124" rx="10" fill={C.navyMid} stroke="rgba(255,255,255,0.12)" />
      <rect x="78" y="58" width="64" height="6" rx="3" fill="rgba(255,255,255,0.3)" />
      <rect x="78" y="72" width="48" height="5" rx="2.5" fill="rgba(255,255,255,0.16)" />
      <rect x="78" y="92" width="64" height="5" rx="2.5" fill="rgba(255,255,255,0.12)" />
      <rect x="78" y="104" width="50" height="5" rx="2.5" fill="rgba(255,255,255,0.12)" />
      <rect x="78" y="116" width="58" height="5" rx="2.5" fill="rgba(255,255,255,0.12)" />
      <circle cx="148" cy="148" r="30" fill={`url(#verifyGrad)`} stroke={C.navy} strokeWidth="3" />
      <defs>
        <linearGradient id="verifyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.goldLight} />
        </linearGradient>
      </defs>
      <path d="M134 148 L144 158 L164 136" stroke={C.navy} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function IllustrationConnect() {
  return (
    <svg viewBox="0 0 220 200" width="100%" height="100%">
      <circle cx="110" cy="100" r="80" fill={C.greenLight} opacity="0.07" />
      <circle cx="56" cy="108" r="26" fill={C.navyMid} stroke={C.greenLight} strokeWidth="2.5" />
      <circle cx="56" cy="100" r="8" fill={C.greenLight} opacity="0.8" />
      <path d="M40 122 Q56 110 72 122" stroke={C.greenLight} strokeWidth="3" fill="none" opacity="0.8" />
      <circle cx="164" cy="108" r="26" fill={C.navyMid} stroke={C.goldLight} strokeWidth="2.5" />
      <circle cx="164" cy="100" r="8" fill={C.goldLight} opacity="0.85" />
      <path d="M148 122 Q164 110 180 122" stroke={C.goldLight} strokeWidth="3" fill="none" opacity="0.85" />
      <path d="M85 100 Q110 80 135 100" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeDasharray="5 6" fill="none" />
      <g transform="translate(86,52)">
        <rect width="48" height="34" rx="10" fill={`url(#connectGrad)`} />
        <path d="M14 34 L8 44 L20 34 Z" fill={C.greenLight} />
        <circle cx="14" cy="17" r="3" fill={C.navy} />
        <circle cx="24" cy="17" r="3" fill={C.navy} />
        <circle cx="34" cy="17" r="3" fill={C.navy} />
      </g>
      <defs>
        <linearGradient id="connectGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.green} />
          <stop offset="100%" stopColor={C.greenLight} />
        </linearGradient>
      </defs>
    </svg>
  );
}

function IllustrationInbox() {
  return (
    <svg viewBox="0 0 220 200" width="100%" height="100%">
      <circle cx="110" cy="100" r="80" fill={C.greenLight} opacity="0.07" />
      <path d="M48 90 L110 50 L172 90 V148 C172 154 167 159 161 159 H59 C53 159 48 154 48 148 Z"
        fill={C.navyMid} stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
      <path d="M48 90 L92 122 H128 L172 90" stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none" />
      <rect x="92" y="108" width="36" height="22" rx="4" fill={C.navy} stroke="rgba(255,255,255,0.15)" />
      <circle cx="160" cy="62" r="22" fill={`url(#inboxGrad)`} />
      <defs>
        <linearGradient id="inboxGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.goldLight} />
        </linearGradient>
      </defs>
      <circle cx="160" cy="62" r="5" fill={C.navy} />
      <circle cx="176" cy="48" r="7" fill="#EF4444" stroke={C.navyDark} strokeWidth="2.5" />
    </svg>
  );
}

function IllustrationPrivacy() {
  return (
    <svg viewBox="0 0 220 200" width="100%" height="100%">
      <circle cx="110" cy="100" r="80" fill={C.greenLight} opacity="0.07" />
      <path d="M110 36 L156 52 V92 C156 124 138 146 110 156 C82 146 64 124 64 92 V52 Z"
        fill={C.navyMid} stroke={C.greenLight} strokeWidth="2.5" />
      <rect x="92" y="92" width="36" height="30" rx="6" fill={`url(#privGrad)`} />
      <defs>
        <linearGradient id="privGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.green} />
          <stop offset="100%" stopColor={C.greenLight} />
        </linearGradient>
      </defs>
      <path d="M99 92 V80 a11 11 0 0122 0 V92" stroke={C.greenLight} strokeWidth="4.5" fill="none" />
      <circle cx="110" cy="106" r="4" fill={C.navy} />
      {[[40,60],[180,68],[36,140],[184,134]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill={C.goldLight} opacity="0.7" />
      ))}
    </svg>
  );
}

function IllustrationCommunicate() {
  return (
    <svg viewBox="0 0 220 200" width="100%" height="100%">
      <circle cx="110" cy="100" r="80" fill={C.greenLight} opacity="0.07" />
      <g transform="translate(38,76)">
        <rect width="50" height="68" rx="12" fill={C.navyMid} stroke="rgba(255,255,255,0.12)" />
        <rect x="10" y="14" width="30" height="36" rx="3" fill={C.navy} />
        <circle cx="25" cy="58" r="3" fill="rgba(255,255,255,0.3)" />
      </g>
      <g transform="translate(130,40)">
        <rect width="56" height="40" rx="9" fill={`url(#commGrad)`} />
        <path d="M14 40 L8 50 L20 40 Z" fill={C.goldLight} />
        <circle cx="16" cy="20" r="3" fill={C.navy} />
        <circle cx="28" cy="20" r="3" fill={C.navy} />
        <circle cx="40" cy="20" r="3" fill={C.navy} />
      </g>
      <defs>
        <linearGradient id="commGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.goldLight} />
        </linearGradient>
      </defs>
      <g transform="translate(110,118)">
        <rect width="48" height="34" rx="9" fill={C.navyMid} stroke={C.greenLight} strokeWidth="2" />
        <circle cx="24" cy="17" r="9" fill="none" stroke={C.greenLight} strokeWidth="3" />
        <path d="M19 17 L23 21 L30 12" stroke={C.greenLight} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/* ════════════════════════════════════════
   SLIDE CONTENT — branches by role
════════════════════════════════════════ */

const CLIENT_SLIDES = [
  {
    Illustration: IllustrationWelcome,
    title: "Welcome to ShieldKe",
    body: "Your rights, defended. ShieldKe connects you with LSK-verified lawyers across Kenya for fast, confidential legal help — wherever you are.",
  },
  {
    Illustration: IllustrationBrowse,
    title: "Find the right lawyer",
    body: "Browse verified advocates by specialization, location, and experience. Every lawyer on ShieldKe is vetted by our admin team before they can take clients.",
  },
  {
    Illustration: IllustrationConnect,
    title: "Request & connect",
    body: "Send a consultation request to any lawyer. Once they accept, you can chat, voice call, or video call them — all inside the app.",
  },
  {
    Illustration: IllustrationPrivacy,
    title: "Private by design",
    body: "Your conversations and shared documents stay between you and your lawyer. Nothing is shared with anyone else.",
  },
  {
    Illustration: IllustrationReady,
    title: "You're all set",
    body: "Let's find you a lawyer who fits your case.",
    cta: "Browse Lawyers",
    navigateTo: "/lawyers",
  },
];

const LAWYER_SLIDES = [
  {
    Illustration: IllustrationWelcome,
    title: "Welcome to ShieldKe",
    body: "Grow your practice with ShieldKe. Connect with clients across Kenya who are actively looking for legal help in your area of specialization.",
  },
  {
    Illustration: IllustrationVerify,
    title: "Getting verified",
    body: "Our admin team reviews your bar certificate, practicing certificate, and ID before activating your profile — so clients can trust you on sight. This usually takes a short while.",
  },
  {
    Illustration: IllustrationInbox,
    title: "Receive requests",
    body: "Once verified, clients can send you consultation requests directly. Accept the ones that fit — you're always in control of your caseload.",
  },
  {
    Illustration: IllustrationCommunicate,
    title: "Chat, call, connect",
    body: "Communicate with clients securely by chat, voice, or video — no need for outside apps or sharing your personal number.",
  },
  {
    Illustration: IllustrationReady,
    title: "You're all set",
    body: "Complete your profile so clients see your full experience and specialization.",
    cta: "Complete Profile",
    navigateTo: "/lawyer-profile",
  },
];

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */

export default function WelcomeOnboarding() {

  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [visible, setVisible]     = useState(false);
  const [step, setStep]           = useState(0);
  const [direction, setDirection] = useState(1);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role === "lawyer" ? "lawyer" : "client";
  const slides = role === "lawyer" ? LAWYER_SLIDES : CLIENT_SLIDES;

  /* trigger: only on a dashboard route, only once, only for users
     who just came through Register.jsx this session */
  useEffect(() => {
    const justRegistered = localStorage.getItem("justRegistered");
    const onDashboard = location.pathname === "/client" || location.pathname === "/lawyer";

    if (justRegistered && onDashboard && user) {
      setVisible(true);
      setStep(0);
    }
  }, [location.pathname]);

  const finish = (navigateTo) => {
    localStorage.removeItem("justRegistered");
    setVisible(false);
    if (navigateTo) navigate(navigateTo);
  };

  const goNext = () => {
    const isLast = step === slides.length - 1;
    if (isLast) { finish(slides[step].navigateTo); return; }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  };

  if (!visible) return null;

  const slide = slides[step];
  const Illustration = slide.Illustration;
  const isLast = step === slides.length - 1;

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: `linear-gradient(160deg, ${C.navyDark} 0%, ${C.navy} 55%, ${C.navyMid} 100%)`,
        display: "flex", flexDirection: "column",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── TOP BAR: progress dots + skip ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "20px 20px 0" : "28px 40px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiShield size={13} color={C.navy} strokeWidth={2.6} />
          </div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>ShieldKe</span>
        </div>

        {!isLast && (
          <button
            onClick={() => finish(null)}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}
          >
            Skip <FiX size={13} />
          </button>
        )}
      </div>

      {/* ── PROGRESS DOTS ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 7, padding: isMobile ? "20px 0 0" : "28px 0 0" }}>
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
            style={{
              width: i === step ? 22 : 7, height: 7, borderRadius: 4,
              background: i === step ? C.greenLight : "rgba(255,255,255,0.18)",
              cursor: "pointer", transition: "all 0.25s",
            }}
          />
        ))}
      </div>

      {/* ── SLIDE CONTENT ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: isMobile ? "20px" : "20px 40px" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: 420, width: "100%" }}
          >
            <div style={{ width: isMobile ? 180 : 220, height: isMobile ? 164 : 200, marginBottom: isMobile ? 24 : 32 }}>
              <Illustration />
            </div>

            <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 14, lineHeight: 1.2 }}>
              {slide.title}
            </h2>
            <p style={{ fontSize: isMobile ? 14.5 : 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, maxWidth: 360 }}>
              {slide.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── BOTTOM CONTROLS ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "0 20px 32px" : "0 40px 44px", maxWidth: 560, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        <button
          onClick={goBack}
          disabled={step === 0}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none",
            color: step === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
            fontSize: 14, fontWeight: 600, cursor: step === 0 ? "default" : "pointer",
            fontFamily: "inherit", padding: "10px 4px",
          }}
        >
          <FiArrowLeft size={15} /> {!isMobile && "Back"}
        </button>

        <button
          onClick={goNext}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: isLast ? "14px 30px" : "13px 26px",
            borderRadius: 12,
            background: `linear-gradient(135deg,${C.green},${C.greenLight})`,
            border: "none", color: "#fff",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 10px 28px rgba(0,107,63,0.35)",
          }}
        >
          {isLast ? slide.cta : "Next"} <FiArrowRight size={16} />
        </button>

      </div>

    </motion.div>
  );
}
