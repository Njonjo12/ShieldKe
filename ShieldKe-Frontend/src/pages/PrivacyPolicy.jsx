import { useNavigate } from "react-router-dom";
import { FiShield, FiArrowLeft, FiDownload } from "react-icons/fi";

const UPDATED = "13 June 2026";
const EMAIL   = "legal@shieldke.co.ke";

const Section = ({ n, title, children }) => (
  <div style={{ marginBottom: 36 }}>
    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0B1F3A", marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #006B3F" }}>
      {n}. {title}
    </h2>
    {children}
  </div>
);

const Sub = ({ title, children }) => (
  <div style={{ marginBottom: 14 }}>
    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 8 }}>{title}</h3>
    {children}
  </div>
);

const P = ({ children }) => (
  <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.85, marginBottom: 10 }}>{children}</p>
);

const Ul = ({ items }) => (
  <ul style={{ paddingLeft: 22, marginBottom: 10 }}>
    {items.map((item, i) => (
      <li key={i} style={{ fontSize: 15, color: "#374151", lineHeight: 1.85, marginBottom: 6 }}>{item}</li>
    ))}
  </ul>
);

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* NAV */}
      <div style={{ background: "#0B1F3A", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#C9961A,#F0BE4A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiShield size={15} color="#0B1F3A" strokeWidth={2.5} />
          </div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>ShieldKe</span>
        </div>
        <button onClick={() => navigate(-1)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>
          <FiArrowLeft size={14} /> Back
        </button>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 999, background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#1D4ED8", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            Kenya Data Protection Act 2019 Compliant
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 900, color: "#0B1F3A", letterSpacing: "-0.03em", marginBottom: 10 }}>Privacy Policy</h1>
          <p style={{ fontSize: 15, color: "#6B7280" }}>Effective Date: {UPDATED} · Last Updated: {UPDATED}</p>
          <a href="/docs/ShieldKe_Privacy_Policy.docx" download
            style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 16, padding: "9px 18px", borderRadius: 9, background: "#0B1F3A", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            <FiDownload size={14} /> Download .docx
          </a>
        </div>

        {/* CARD */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: "40px 48px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

          <div style={{ padding: "14px 18px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, marginBottom: 32 }}>
            <P>ShieldKe is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, share, and protect your information in accordance with the Kenya Data Protection Act 2019.</P>
          </div>

          <Section n="1" title="Data Controller">
            <P>ShieldKe acts as the Data Controller for personal data collected through this platform, registered with the Office of the Data Protection Commissioner (ODPC) of Kenya.</P>
            <P>Contact: {EMAIL}</P>
          </Section>

          <Section n="2" title="Data We Collect">
            <Sub title="2.1 Information You Provide Directly">
              <Ul items={[
                "Full name and email address (required for registration)",
                "Phone number and location (optional profile information)",
                "Password (stored in encrypted/hashed form — we never see your plain-text password)",
                "Profile photo (optional)",
                "For Advocates: LSK number, years of experience, specialization, practising certificate, BAR certificate, and National ID document",
                "Messages and communications exchanged in consultations",
                "Documents uploaded during consultations",
              ]} />
            </Sub>
            <Sub title="2.2 Information Collected Automatically">
              <Ul items={[
                "IP address and approximate location derived from IP",
                "Browser type and version",
                "Device type and operating system",
                "Pages visited and time spent on each page",
              ]} />
            </Sub>
            <Sub title="2.3 Information We Do NOT Collect">
              <Ul items={[
                "Payment card numbers (processed by third-party providers)",
                "Biometric data",
                "National ID numbers beyond what is strictly required for Advocate verification",
              ]} />
            </Sub>
          </Section>

          <Section n="3" title="How We Use Your Data">
            <Sub title="3.1 To Provide the Platform">
              <Ul items={["Creating and managing your account", "Matching Clients with Advocates", "Enabling secure messaging and document sharing", "Processing and verifying Advocate applications"]} />
            </Sub>
            <Sub title="3.2 For Safety and Security">
              <Ul items={["Verifying the identity and credentials of Advocates", "Preventing fraud, abuse, and unauthorized access", "Investigating reported violations of our Terms of Service"]} />
            </Sub>
            <Sub title="3.3 For Legal Compliance">
              <Ul items={["Complying with court orders and valid legal processes", "Meeting our obligations under the KDPA and other Kenyan law"]} />
            </Sub>
          </Section>

          <Section n="4" title="Confidentiality of Consultation Data">
            <P>Documents, messages, and information exchanged between Clients and Advocates are treated as strictly confidential. ShieldKe staff do NOT read or process consultation content except in limited circumstances required by law or for platform security.</P>
            <P>Consultation data is stored in encrypted form. Access is restricted to the Client, the assigned Advocate, and ShieldKe system administrators for technical maintenance only.</P>
          </Section>

          <Section n="5" title="Data Sharing">
            <P>ShieldKe does NOT sell, rent, or trade your personal data to any third party. We may share your data only:</P>
            <Ul items={[
              "With the Advocate you select for a consultation (name, contact info, consultation message)",
              "With trusted technology providers contractually bound to process data only on our instructions",
              "Where required by a valid court order or legal process issued by a competent Kenyan authority",
            ]} />
          </Section>

          <Section n="6" title="Data Retention">
            <Ul items={[
              "Account information: duration of account plus 3 years after closure",
              "Consultation messages and documents: 5 years from date of consultation",
              "Advocate verification documents: 5 years from date of submission",
              "Activity logs: 12 months",
            ]} />
          </Section>

          <Section n="7" title="Data Security">
            <Ul items={[
              "All data transmitted is encrypted using TLS/HTTPS",
              "Passwords are hashed — we cannot recover your password",
              "Documents are stored with access controls restricting who can retrieve them",
              "Regular security reviews and vulnerability assessments",
            ]} />
            <P>In the event of a personal data breach, ShieldKe will notify the ODPC within 72 hours and affected users as soon as practicable, in accordance with the KDPA.</P>
          </Section>

          <Section n="8" title="Your Rights Under the KDPA">
            <P>As a data subject under the Kenya Data Protection Act 2019, you have the right to:</P>
            <Ul items={[
              "Access — request a copy of personal data ShieldKe holds about you",
              "Rectification — request correction of inaccurate or incomplete data",
              "Erasure — request deletion of your personal data where no longer necessary",
              "Object — object to processing of your data beyond what is strictly necessary",
              "Data Portability — receive your data in a machine-readable format",
              "Lodge a Complaint — with the ODPC at odpc.go.ke if you believe your rights have been violated",
            ]} />
            <P>To exercise any of the above rights, contact us at {EMAIL}. We will respond within 21 days as required by the KDPA.</P>
          </Section>

          <Section n="9" title="Cookies">
            <P>ShieldKe uses only essential cookies to maintain your login session and platform security. We do not use advertising or tracking cookies.</P>
          </Section>

          <Section n="10" title="Children's Privacy">
            <P>ShieldKe is not directed at persons under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has submitted data through our platform, contact us at {EMAIL}.</P>
          </Section>

          <Section n="11" title="Contact Us">
            <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "16px 20px", border: "1px solid #E5E7EB" }}>
              <p style={{ fontWeight: 700, color: "#0B1F3A", marginBottom: 4 }}>ShieldKe Data Protection Officer</p>
              <p style={{ fontSize: 14, color: "#374151" }}>Email: {EMAIL}</p>
              <p style={{ fontSize: 14, color: "#374151" }}>Address: Nairobi, Kenya</p>
              <p style={{ fontSize: 14, color: "#374151" }}>ODPC: odpc.go.ke</p>
            </div>
          </Section>

          <div style={{ marginTop: 32, padding: "16px 20px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10 }}>
            <P>This Privacy Policy is published in compliance with Section 31 of the Kenya Data Protection Act 2019.</P>
          </div>

        </div>
      </div>
    </div>
  );
}
