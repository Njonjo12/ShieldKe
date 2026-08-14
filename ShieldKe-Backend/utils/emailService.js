const nodemailer = require("nodemailer");

/*
=========================================================
  SHIELDKE EMAIL SERVICE
=========================================================

  Required Render Environment Variables:

  SMTP_HOST=smtp-relay.brevo.com
  SMTP_PORT=587
  SMTP_USER=your-brevo-smtp-login
  SMTP_PASS=your-brevo-smtp-key
  FROM_EMAIL=ShieldKe <noreply@shield.co.ke>
  FRONTEND_URL=https://shield.co.ke

  Gmail alternative:

  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-google-app-password

=========================================================
*/


/* ======================================================
   1. ENVIRONMENT CONFIGURATION
====================================================== */

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const FROM =
  process.env.FROM_EMAIL ||
  "ShieldKe <noreply@shield.co.ke>";

const APP =
  process.env.FRONTEND_URL ||
  "https://shield.co.ke";


/* ======================================================
   2. ENVIRONMENT DIAGNOSTICS
====================================================== */

console.log("\n========================================");
console.log("       SHIELDKE EMAIL SERVICE");
console.log("========================================");

console.log("SMTP Configuration:");

console.log(
  "SMTP_HOST:",
  SMTP_HOST || "❌ NOT SET"
);

console.log(
  "SMTP_PORT:",
  SMTP_PORT || "❌ NOT SET"
);

console.log(
  "SMTP_USER:",
  SMTP_USER || "❌ NOT SET"
);

console.log(
  "SMTP_PASS:",
  SMTP_PASS ? "✅ SET" : "❌ NOT SET"
);

console.log(
  "FROM_EMAIL:",
  FROM
);

console.log(
  "FRONTEND_URL:",
  APP
);

console.log("========================================\n");


/* ======================================================
   3. REQUIRED ENVIRONMENT VARIABLE CHECK
====================================================== */

const missingVariables = [];

if (!SMTP_HOST) {
  missingVariables.push("SMTP_HOST");
}

if (!SMTP_USER) {
  missingVariables.push("SMTP_USER");
}

if (!SMTP_PASS) {
  missingVariables.push("SMTP_PASS");
}

if (missingVariables.length > 0) {
  console.error(
    "❌ EMAIL CONFIGURATION ERROR"
  );

  console.error(
    "Missing environment variables:",
    missingVariables.join(", ")
  );

  console.error(
    "Go to Render → ShieldKe Backend → Environment and configure them."
  );
}


/* ======================================================
   4. CREATE SMTP TRANSPORTER
====================================================== */

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,

  port: SMTP_PORT,

  /*
    Port 587  → secure false
    Port 465  → secure true
  */
  secure: SMTP_PORT === 465,

  /*
    Render/Nodemailer connection diagnostics
  */
  connectionTimeout: 10000,

  greetingTimeout: 10000,

  socketTimeout: 20000,

  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },

  /*
    Enable SMTP logging only when explicitly requested.

    In Render, you can temporarily set:

    SMTP_DEBUG=true

    This is useful when diagnosing SMTP problems.
  */
  logger: process.env.SMTP_DEBUG === "true",

  debug: process.env.SMTP_DEBUG === "true",
});


/* ======================================================
   5. SMTP CONNECTION DIAGNOSTIC
====================================================== */

const verifySMTP = async () => {
  console.log("\n========================================");
  console.log("       SMTP CONNECTION TEST");
  console.log("========================================");

  if (!SMTP_HOST) {
    console.error(
      "❌ SMTP_HOST is missing."
    );

    return false;
  }

  if (!SMTP_USER) {
    console.error(
      "❌ SMTP_USER is missing."
    );

    return false;
  }

  if (!SMTP_PASS) {
    console.error(
      "❌ SMTP_PASS is missing."
    );

    return false;
  }

  console.log(
    `Connecting to SMTP server: ${SMTP_HOST}:${SMTP_PORT}`
  );

  console.log(
    `Secure connection: ${SMTP_PORT === 465}`
  );

  try {
    await transporter.verify();

    console.log(
      "✅ SMTP CONNECTION SUCCESSFUL"
    );

    console.log(
      "✅ SMTP server is ready to accept messages."
    );

    console.log("========================================\n");

    return true;

  } catch (error) {

    console.error(
      "❌ SMTP CONNECTION FAILED"
    );

    console.error(
      "----------------------------------------"
    );

    console.error(
      "Error code:",
      error.code || "UNKNOWN"
    );

    console.error(
      "Error command:",
      error.command || "UNKNOWN"
    );

    console.error(
      "Error message:",
      error.message || "UNKNOWN"
    );

    console.error(
      "SMTP host:",
      SMTP_HOST
    );

    console.error(
      "SMTP port:",
      SMTP_PORT
    );

    console.error(
      "SMTP user:",
      SMTP_USER
    );

    console.error(
      "SMTP password:",
      SMTP_PASS ? "SET" : "NOT SET"
    );

    console.error(
      "----------------------------------------"
    );

    if (error.code === "ETIMEDOUT") {
      console.error(
        "⚠️ SMTP CONNECTION TIMEOUT"
      );

      console.error(
        "Render could not establish a connection to the SMTP server."
      );

      console.error(
        "Check SMTP_HOST and SMTP_PORT."
      );

      console.error(
        "For Brevo, normally use smtp-relay.brevo.com:587."
      );
    }

    if (error.code === "ECONNREFUSED") {
      console.error(
        "⚠️ SMTP CONNECTION REFUSED"
      );

      console.error(
        "The SMTP server rejected the network connection."
      );
    }

    if (
      error.code === "EAUTH" ||
      error.responseCode === 535
    ) {
      console.error(
        "⚠️ SMTP AUTHENTICATION FAILED"
      );

      console.error(
        "Check SMTP_USER and SMTP_PASS."
      );

      console.error(
        "If using Gmail, use a Google App Password."
      );

      console.error(
        "If using Brevo, use the SMTP key."
      );
    }

    console.error("========================================\n");

    return false;
  }
};


/*
  Run the diagnostic when the application starts.

  IMPORTANT:
  We intentionally DO NOT crash the entire backend
  if email verification fails.

  This allows your API/server to continue running while
  Render logs show exactly what is wrong.
*/

verifySMTP().catch((error) => {
  console.error(
    "Unexpected SMTP diagnostic error:",
    error
  );
});


/* ======================================================
   6. HTML ESCAPING
====================================================== */

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};


/* ======================================================
   7. SEND EMAIL HELPER
====================================================== */

const sendEmail = async ({
  to,
  subject,
  html,
}) => {

  console.log("\n----------------------------------------");
  console.log("📧 SHIELDKE EMAIL");
  console.log("----------------------------------------");

  console.log(
    "Recipient:",
    to
  );

  console.log(
    "Subject:",
    subject
  );

  console.log(
    "SMTP:",
    `${SMTP_HOST}:${SMTP_PORT}`
  );

  try {

    const info = await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
    });

    console.log(
      "✅ EMAIL SENT SUCCESSFULLY"
    );

    console.log(
      "Message ID:",
      info.messageId
    );

    console.log(
      "Accepted:",
      info.accepted
    );

    console.log(
      "Rejected:",
      info.rejected
    );

    console.log("----------------------------------------\n");

    return info;

  } catch (error) {

    console.error(
      "❌ EMAIL SEND FAILED"
    );

    console.error(
      "----------------------------------------"
    );

    console.error(
      "Recipient:",
      to
    );

    console.error(
      "Subject:",
      subject
    );

    console.error(
      "Error code:",
      error.code || "UNKNOWN"
    );

    console.error(
      "Error command:",
      error.command || "UNKNOWN"
    );

    console.error(
      "Error response:",
      error.response || "NONE"
    );

    console.error(
      "Error message:",
      error.message || "UNKNOWN"
    );

    console.error(
      "----------------------------------------\n"
    );

    throw error;
  }
};


/* ======================================================
   8. VERIFY EMAIL
====================================================== */

exports.sendVerificationEmail = async (
  user,
  token
) => {

  if (!user || !user.email) {
    throw new Error(
      "Cannot send verification email: user email is missing."
    );
  }

  if (!token) {
    throw new Error(
      "Cannot send verification email: verification token is missing."
    );
  }

  const safeName = escapeHtml(
    user.name || "there"
  );

  const link =
    `${APP}/verify-email?token=${encodeURIComponent(token)}`;

  return sendEmail({
    to: user.email,

    subject:
      "Verify your ShieldKe account",

    html: `
      <div
        style="
          font-family:'Inter',Arial,sans-serif;
          max-width:520px;
          margin:auto;
          background:#f8fafc;
          border-radius:16px;
          overflow:hidden;
        "
      >

        <!-- HEADER -->

        <div
          style="
            background:#0B1F3A;
            padding:32px 40px;
            text-align:center;
          "
        >

          <div
            style="
              display:inline-flex;
              align-items:center;
              gap:10px;
            "
          >

            <div
              style="
                width:36px;
                height:36px;
                background:linear-gradient(
                  135deg,
                  #C9961A,
                  #F0BE4A
                );
                border-radius:9px;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:18px;
              "
            >
              🛡️
            </div>

            <span
              style="
                color:#fff;
                font-size:22px;
                font-weight:800;
                letter-spacing:-0.02em;
              "
            >
              ShieldKe
            </span>

          </div>

        </div>


        <!-- BODY -->

        <div style="padding:40px">

          <h2
            style="
              color:#0B1F3A;
              font-size:22px;
              font-weight:800;
              margin:0 0 12px;
            "
          >
            Welcome, ${safeName}!
          </h2>

          <p
            style="
              color:#6B7280;
              font-size:15px;
              line-height:1.8;
              margin:0 0 28px;
            "
          >
            Thanks for signing up.
            Click the button below to verify your
            email address and activate your account.
          </p>

          <a
            href="${link}"
            style="
              display:inline-block;
              background:linear-gradient(
                135deg,
                #006B3F,
                #00A86B
              );
              color:#fff;
              text-decoration:none;
              padding:14px 32px;
              border-radius:10px;
              font-weight:700;
              font-size:15px;
            "
          >
            Verify Email Address
          </a>

          <p
            style="
              color:#9CA3AF;
              font-size:13px;
              margin-top:28px;
              line-height:1.7;
            "
          >
            This link expires in
            <strong>24 hours</strong>.
            If you didn't create a ShieldKe account,
            you can safely ignore this email.
          </p>

          <p
            style="
              color:#D1D5DB;
              font-size:12px;
              margin-top:8px;
              word-break:break-all;
            "
          >
            ${escapeHtml(link)}
          </p>

        </div>

      </div>
    `,
  });
};


/* ======================================================
   9. PASSWORD RESET EMAIL
====================================================== */

exports.sendPasswordResetEmail = async (
  user,
  token
) => {

  if (!user || !user.email) {
    throw new Error(
      "Cannot send password reset email: user email is missing."
    );
  }

  if (!token) {
    throw new Error(
      "Cannot send password reset email: reset token is missing."
    );
  }

  const safeName = escapeHtml(
    user.name || "there"
  );

  const link =
    `${APP}/reset-password?token=${encodeURIComponent(token)}`;

  return sendEmail({
    to: user.email,

    subject:
      "Reset your ShieldKe password",

    html: `
      <div
        style="
          font-family:'Inter',Arial,sans-serif;
          max-width:520px;
          margin:auto;
          background:#f8fafc;
          border-radius:16px;
          overflow:hidden;
        "
      >

        <!-- HEADER -->

        <div
          style="
            background:#0B1F3A;
            padding:32px 40px;
            text-align:center;
          "
        >

          <div
            style="
              display:inline-flex;
              align-items:center;
              gap:10px;
            "
          >

            <div
              style="
                width:36px;
                height:36px;
                background:linear-gradient(
                  135deg,
                  #C9961A,
                  #F0BE4A
                );
                border-radius:9px;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:18px;
              "
            >
              🛡️
            </div>

            <span
              style="
                color:#fff;
                font-size:22px;
                font-weight:800;
                letter-spacing:-0.02em;
              "
            >
              ShieldKe
            </span>

          </div>

        </div>


        <!-- BODY -->

        <div style="padding:40px">

          <h2
            style="
              color:#0B1F3A;
              font-size:22px;
              font-weight:800;
              margin:0 0 12px;
            "
          >
            Reset your password
          </h2>

          <p
            style="
              color:#6B7280;
              font-size:15px;
              line-height:1.8;
              margin:0 0 28px;
            "
          >
            Hi ${safeName}, we received a request
            to reset your password.
            Click the button below to choose a new one.
          </p>

          <a
            href="${link}"
            style="
              display:inline-block;
              background:linear-gradient(
                135deg,
                #0B1F3A,
                #1A3A6E
              );
              color:#fff;
              text-decoration:none;
              padding:14px 32px;
              border-radius:10px;
              font-weight:700;
              font-size:15px;
            "
          >
            Reset Password
          </a>

          <p
            style="
              color:#9CA3AF;
              font-size:13px;
              margin-top:28px;
              line-height:1.7;
            "
          >
            This link expires in
            <strong>1 hour</strong>.
            If you didn't request a password reset,
            you can safely ignore this email —
            your password will not change.
          </p>

          <p
            style="
              color:#D1D5DB;
              font-size:12px;
              margin-top:8px;
              word-break:break-all;
            "
          >
            ${escapeHtml(link)}
          </p>

        </div>

      </div>
    `,
  });
};


/* ======================================================
   10. OPTIONAL MANUAL SMTP TEST
====================================================== */

/*
  You can call this from another file if you want
  to test the SMTP connection manually:

      const { testEmailConnection } = require("./email");

      await testEmailConnection();
*/

exports.testEmailConnection = verifySMTP;


/* ======================================================
   END OF EMAIL SERVICE
====================================================== */