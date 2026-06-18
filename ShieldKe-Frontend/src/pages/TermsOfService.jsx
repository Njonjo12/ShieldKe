import { useNavigate } from "react-router-dom";
import { FiShield, FiArrowLeft, FiDownload } from "react-icons/fi";

const UPDATED = "13 June 2026";
const EMAIL   = "legal@shieldke.co.ke";

/* ── shared mini-components ── */
const Section = ({ n, title, children }) => (
  <div style={{ marginBottom: 36 }}>
    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0B1F3A", marginBottom: 12,
      paddingBottom: 8, borderBottom: "2px solid #006B3F" }}>
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

const Ol = ({ items }) => (
  <ol style={{ paddingLeft: 22, marginBottom: 10 }}>
    {items.map((item, i) => (
      <li key={i} style={{ fontSize: 15, color: "#374151", lineHeight: 1.85, marginBottom: 6 }}>{item}</li>
    ))}
  </ol>
);

export default function TermsOfService() {
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
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 999, background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#059669", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            Legal Document
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 900, color: "#0B1F3A", letterSpacing: "-0.03em", marginBottom: 10 }}>Terms of Service</h1>
          <p style={{ fontSize: 15, color: "#6B7280" }}>Effective Date: {UPDATED} · Last Updated: {UPDATED}</p>
          <a href="/docs/ShieldKe_Terms_of_Service.docx" download
            style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 16, padding: "9px 18px", borderRadius: 9, background: "#0B1F3A", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            <FiDownload size={14} /> Download .docx
          </a>
        </div>

        {/* CARD */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: "40px 48px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

          <div style={{ padding: "14px 18px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, marginBottom: 32 }}>
            <P>These Terms of Service govern your use of ShieldKe. By creating an account or accessing any part of this platform, you confirm that you have read, understood, and agree to be bound by these terms.</P>
          </div>

          <Section n="1" title="About ShieldKe">
            <P>ShieldKe is a technology platform that facilitates connections between persons seeking legal assistance ("Clients") and independent, LSK-registered legal professionals ("Advocates"). <strong>ShieldKe is NOT a law firm and does NOT provide legal advice, legal representation, or any legal services whatsoever.</strong></P>
            <P>ShieldKe operates solely as a neutral marketplace. Legal services are provided exclusively by independent Advocates registered on the platform, not by ShieldKe.</P>
          </Section>

          <Section n="2" title="Eligibility">
            <P>To use ShieldKe you must:</P>
            <Ul items={[
              "Be at least 18 years of age",
              "Be a Kenyan citizen, permanent resident, or person with legal standing to enter contracts under Kenyan law",
              "Provide accurate, truthful, and complete registration information",
              "Have the legal capacity to agree to these terms",
            ]} />
          </Section>

          <Section n="3" title="User Accounts">
            <P>You are responsible for maintaining the confidentiality of your account credentials. You agree to:</P>
            <Ul items={[
              `Immediately notify ShieldKe at ${EMAIL} if you suspect any unauthorized use of your account`,
              "Not share your login credentials with any third party",
              "Not create more than one account without prior written consent from ShieldKe",
              "Ensure your account information remains accurate and up to date",
            ]} />
          </Section>

          <Section n="4" title="Client Terms">
            <Sub title="4.1 Nature of the Relationship">
              <P>When you engage an Advocate through ShieldKe, you enter into a direct attorney-client relationship with that Advocate. ShieldKe is not a party to that relationship. The Advocate is solely responsible for the quality, accuracy, legality, and outcome of any legal services provided to you.</P>
            </Sub>
            <Sub title="4.2 Client Obligations">
              <Ul items={[
                "Provide accurate and complete information to your Advocate",
                "Pay agreed consultation fees directly or as arranged on the platform",
                "Treat all Advocates with professional respect",
                "Not use the platform to solicit fraudulent, illegal, or unethical legal assistance",
                "Not share documents or messages from Advocates with third parties without written consent",
              ]} />
            </Sub>
            <Sub title="4.3 No Guarantee of Outcome">
              <P>ShieldKe makes no representation, warranty, or guarantee regarding the outcome of any legal matter. Case results depend entirely on the facts, applicable law, and the professional judgment of the Advocate you engage.</P>
            </Sub>
          </Section>

          <Section n="5" title="Prohibited Conduct">
            <P>You agree NOT to use ShieldKe to:</P>
            <Ul items={[
              "Engage in any unlawful, fraudulent, or deceptive activity",
              "Harass, threaten, or intimidate any Advocate or other user",
              "Upload or transmit malicious code, viruses, or harmful content",
              "Attempt to gain unauthorized access to any system, account, or data",
              "Impersonate any person or entity",
              "Use the platform to facilitate money laundering, terrorism financing, or any other criminal enterprise",
            ]} />
          </Section>

          <Section n="6" title="Confidentiality of Communications">
            <P>All communications, documents, and information exchanged between Clients and Advocates through ShieldKe are strictly confidential between the parties. ShieldKe staff do not access consultation content except where required by a valid court order, to investigate illegal activity, or to maintain platform security.</P>
            <P>Users are legally bound to maintain confidentiality of all consultation information. Unauthorized disclosure may constitute a breach of these Terms and may attract civil or criminal liability under Kenyan law.</P>
          </Section>

          <Section n="7" title="Limitation of Liability">
            <P>To the maximum extent permitted by Kenyan law:</P>
            <Ul items={[
              "ShieldKe provides the platform on an 'as is' and 'as available' basis without warranties of any kind",
              "ShieldKe is not liable for any loss or damage arising from legal advice given by Advocates on the platform",
              "ShieldKe's total liability for any claim shall not exceed fees paid by you to ShieldKe in the three months preceding the claim",
            ]} />
          </Section>

          <Section n="8" title="Dispute Resolution">
            <Ol items={[
              "Informal resolution: parties shall first attempt resolution by good-faith negotiation for 30 days",
              "Mediation: if informal resolution fails, parties shall submit to mediation under the Nairobi Centre for International Arbitration (NCIA) rules",
              "Litigation: if mediation fails, disputes shall be subject to the exclusive jurisdiction of the courts of Kenya",
            ]} />
          </Section>

          <Section n="9" title="Governing Law">
            <P>These Terms are governed by and construed in accordance with the laws of the Republic of Kenya, including the Kenya Data Protection Act 2019, the Computer Misuse and Cybercrimes Act 2018, and the Advocates Act (Cap 16).</P>
          </Section>

          <Section n="10" title="Contact">
            <P>For questions or concerns regarding these Terms, contact:</P>
            <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "16px 20px", border: "1px solid #E5E7EB" }}>
              <p style={{ fontWeight: 700, color: "#0B1F3A", marginBottom: 4 }}>ShieldKe Legal Team</p>
              <p style={{ fontSize: 14, color: "#374151" }}>Email: {EMAIL}</p>
              <p style={{ fontSize: 14, color: "#374151" }}>Address: Nairobi, Kenya</p>
            </div>
          </Section>

          <div style={{ marginTop: 32, padding: "16px 20px", background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 10 }}>
            <P><strong>By using ShieldKe, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.</strong></P>
          </div>

        </div>
      </div>
    </div>
  );
}
