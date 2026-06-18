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

export default function AdvocateAgreement() {
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
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 999, background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            For LSK-Registered Advocates
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 900, color: "#0B1F3A", letterSpacing: "-0.03em", marginBottom: 10 }}>Advocate Agreement</h1>
          <p style={{ fontSize: 15, color: "#6B7280" }}>Effective Date: {UPDATED} · Last Updated: {UPDATED}</p>
          <a href="/docs/ShieldKe_Advocate_Agreement.docx" download
            style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 16, padding: "9px 18px", borderRadius: 9, background: "#0B1F3A", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            <FiDownload size={14} /> Download .docx
          </a>
        </div>

        {/* CARD */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: "40px 48px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

          <div style={{ padding: "14px 18px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, marginBottom: 32 }}>
            <P>This Agreement is entered into between ShieldKe and the legal professional registering to provide services through the platform. By completing registration and submitting your verification documents, you agree to be bound by this Agreement.</P>
          </div>

          <Section n="1" title="Nature of the Relationship">
            <P>The Advocate is an independent professional and <strong>NOT an employee, agent, partner, or representative of ShieldKe.</strong> ShieldKe provides a technology platform through which the Advocate may offer legal services to Clients. Nothing in this Agreement creates an employment relationship, agency, partnership, or joint venture.</P>
            <P>As an independent professional, the Advocate:</P>
            <Ul items={[
              "Sets their own consultation fees and availability",
              "Retains full professional autonomy and judgment in all legal matters",
              "Is solely responsible for all legal advice given to Clients",
              "Manages their own tax obligations as an independent professional",
              "Is not entitled to any employment benefits from ShieldKe",
            ]} />
          </Section>

          <Section n="2" title="Eligibility and Verification">
            <Sub title="2.1 Mandatory Eligibility Requirements">
              <P>To register and remain on the ShieldKe platform, the Advocate must at all times:</P>
              <Ul items={[
                "Hold a valid, current Practising Certificate issued by the Law Society of Kenya (LSK)",
                "Be a duly enrolled Advocate of the High Court of Kenya",
                "Not be subject to any LSK disciplinary proceedings or sanctions",
                "Not have been struck off the Roll of Advocates",
              ]} />
            </Sub>
            <Sub title="2.2 Verification Documents">
              <Ul items={[
                "LSK Practising Certificate (current year)",
                "BAR Certificate / Certificate of Enrolment",
                "National Identity Card or Passport",
              ]} />
            </Sub>
            <Sub title="2.3 Ongoing Compliance">
              <P>You must immediately notify ShieldKe at {EMAIL} if your LSK practising certificate is suspended, revoked, or not renewed, or if you become subject to any disciplinary investigation by the LSK or any court.</P>
            </Sub>
          </Section>

          <Section n="3" title="Confidentiality">
            <Sub title="3.1 Client Confidentiality">
              <P>The Advocate must maintain strict confidentiality with respect to all Client information, consistent with the Advocates Act (Cap 16), the LSK Code of Professional Conduct, and attorney-client privilege principles under Kenyan law.</P>
              <P>The Advocate must NOT:</P>
              <Ul items={[
                "Disclose any Client information to any third party without the Client's express written consent",
                "Use Client information for any purpose other than providing the requested legal service",
                "Share, reproduce, or distribute documents received from Clients",
              ]} />
            </Sub>
            <Sub title="3.2 Survival">
              <P>Confidentiality obligations survive the termination of this Agreement indefinitely.</P>
            </Sub>
          </Section>

          <Section n="4" title="Professional Conduct">
            <P>The Advocate agrees to conduct all interactions in accordance with the Advocates Act (Cap 16), the LSK Code of Professional Conduct, and all applicable Kenyan law. The Advocate specifically agrees to:</P>
            <Ul items={[
              "Respond to consultation requests within a reasonable time",
              "Communicate clearly, professionally, and honestly with Clients",
              "Promptly disclose to a Client any conflict of interest",
              "Not accept a consultation where a conflict of interest exists without the Client's informed written consent",
              "Not make misrepresentations about qualifications, experience, or expertise",
            ]} />
          </Section>

          <Section n="5" title="Liability and Indemnification">
            <Sub title="5.1 Advocate's Sole Liability">
              <P>The Advocate is solely responsible and liable for all legal advice, opinions, and services provided to Clients through the ShieldKe platform. ShieldKe accepts no liability whatsoever for any legal advice given, errors, omissions, or professional negligence by the Advocate.</P>
            </Sub>
            <Sub title="5.2 Indemnification">
              <P>The Advocate agrees to indemnify, defend, and hold harmless ShieldKe from and against any and all claims, liabilities, damages, and expenses arising from:</P>
              <Ul items={[
                "Legal advice or services provided by the Advocate through the platform",
                "The Advocate's breach of this Agreement or the ShieldKe Terms of Service",
                "Any claim by a Client arising from the Advocate's professional conduct",
                "Any misrepresentation made by the Advocate regarding qualifications or eligibility",
              ]} />
            </Sub>
          </Section>

          <Section n="6" title="Data Protection">
            <P>The Advocate acknowledges they will process Client personal data as an independent data processor and agrees to:</P>
            <Ul items={[
              "Process Client data only for the purpose of providing the requested legal services",
              "Comply with the Kenya Data Protection Act 2019 in all processing activities",
              "Immediately notify ShieldKe upon becoming aware of any actual or suspected personal data breach",
            ]} />
          </Section>

          <Section n="7" title="Fees and Tax">
            <P>The Advocate sets their own consultation fee rates. ShieldKe may charge a platform service fee on transactions, which will be disclosed at registration. The Advocate is responsible for all applicable taxes on income earned through the platform, including withholding tax and income tax levied by the Kenya Revenue Authority (KRA).</P>
          </Section>

          <Section n="8" title="Suspension and Termination">
            <Sub title="8.1 Termination by Advocate">
              <P>The Advocate may close their account at any time by giving 14 days' written notice to {EMAIL}. Outstanding consultation obligations must be completed or appropriately transferred before closure.</P>
            </Sub>
            <Sub title="8.2 Suspension or Termination by ShieldKe">
              <P>ShieldKe may suspend or permanently remove an Advocate from the platform for:</P>
              <Ul items={[
                "Failure to maintain a valid LSK Practising Certificate",
                "Suspension, revocation, or non-renewal of LSK membership",
                "Material breach of this Agreement or the ShieldKe Terms of Service",
                "Credible Client complaints alleging professional misconduct",
                "Any finding of professional misconduct by the LSK or a court",
              ]} />
            </Sub>
          </Section>

          <Section n="9" title="Governing Law">
            <P>This Agreement is governed by and construed in accordance with the laws of the Republic of Kenya.</P>
          </Section>

          <Section n="10" title="Contact">
            <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "16px 20px", border: "1px solid #E5E7EB" }}>
              <p style={{ fontWeight: 700, color: "#0B1F3A", marginBottom: 4 }}>ShieldKe Legal & Compliance Team</p>
              <p style={{ fontSize: 14, color: "#374151" }}>Email: {EMAIL}</p>
              <p style={{ fontSize: 14, color: "#374151" }}>Address: Nairobi, Kenya</p>
            </div>
          </Section>

          <div style={{ marginTop: 32, padding: "20px 24px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#92400E", marginBottom: 8 }}>Declaration</p>
            <P>By registering on the ShieldKe platform and submitting verification documents, you confirm that you have read, understood, and agree to be bound by this Advocate Agreement, that all information and documents submitted are accurate and genuine, and that you accept sole professional responsibility for all legal services you provide through the platform.</P>
            <a href="/docs/ShieldKe_Advocate_Agreement.docx" download
              style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 8, padding: "9px 18px", borderRadius: 9, background: "#C9961A", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              <FiDownload size={14} /> Download Full Agreement with Signature Block
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
