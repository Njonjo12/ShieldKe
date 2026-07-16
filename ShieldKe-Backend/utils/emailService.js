const nodemailer = require("nodemailer");

/*
========================================
EMAIL SERVICE

Configure these env vars on Render:
  SMTP_HOST     e.g. smtp.gmail.com
  SMTP_PORT     e.g. 587
  SMTP_USER     your sending email
  SMTP_PASS     app password or API key
  FROM_EMAIL    e.g. noreply@shield.co.ke
  FRONTEND_URL  e.g. https://shield.co.ke

Gmail quick-start:
  1. Enable 2FA on your Google account
  2. Go to Google Account → Security → App Passwords
  3. Create an app password → copy it
  4. SMTP_HOST=smtp.gmail.com, SMTP_PORT=587
  5. SMTP_USER=you@gmail.com, SMTP_PASS=<app-password>

Brevo (free 300 emails/day — recommended):
  Sign up at brevo.com → SMTP & API → SMTP keys
  SMTP_HOST=smtp-relay.brevo.com, SMTP_PORT=587
========================================
*/

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.FROM_EMAIL || `ShieldKe <noreply@shield.co.ke>`;
const APP  = process.env.FRONTEND_URL || "https://shield.co.ke";

/* ── Verify email ── */
exports.sendVerificationEmail = async (user, token) => {
  const link = `${APP}/verify-email?token=${token}`;
  await transporter.sendMail({
    from:    FROM,
    to:      user.email,
    subject: "Verify your ShieldKe account",
    html: `
      <div style="font-family:'Inter',Arial,sans-serif;max-width:520px;margin:auto;background:#f8fafc;border-radius:16px;overflow:hidden">
        <div style="background:#0B1F3A;padding:32px 40px;text-align:center">
          <div style="display:inline-flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;background:linear-gradient(135deg,#C9961A,#F0BE4A);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:18px">🛡️</div>
            <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em">ShieldKe</span>
          </div>
        </div>
        <div style="padding:40px">
          <h2 style="color:#0B1F3A;font-size:22px;font-weight:800;margin:0 0 12px">Welcome, ${user.name}!</h2>
          <p style="color:#6B7280;font-size:15px;line-height:1.8;margin:0 0 28px">
            Thanks for signing up. Click the button below to verify your email address and activate your account.
          </p>
          <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#006B3F,#00A86B);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px">
            Verify Email Address
          </a>
          <p style="color:#9CA3AF;font-size:13px;margin-top:28px;line-height:1.7">
            This link expires in <strong>24 hours</strong>. If you didn't create a ShieldKe account, you can safely ignore this email.
          </p>
          <p style="color:#D1D5DB;font-size:12px;margin-top:8px;word-break:break-all">
            ${link}
          </p>
        </div>
      </div>
    `,
  });
};

/* ── Password reset ── */
exports.sendPasswordResetEmail = async (user, token) => {
  const link = `${APP}/reset-password?token=${token}`;
  await transporter.sendMail({
    from:    FROM,
    to:      user.email,
    subject: "Reset your ShieldKe password",
    html: `
      <div style="font-family:'Inter',Arial,sans-serif;max-width:520px;margin:auto;background:#f8fafc;border-radius:16px;overflow:hidden">
        <div style="background:#0B1F3A;padding:32px 40px;text-align:center">
          <div style="display:inline-flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;background:linear-gradient(135deg,#C9961A,#F0BE4A);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:18px">🛡️</div>
            <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em">ShieldKe</span>
          </div>
        </div>
        <div style="padding:40px">
          <h2 style="color:#0B1F3A;font-size:22px;font-weight:800;margin:0 0 12px">Reset your password</h2>
          <p style="color:#6B7280;font-size:15px;line-height:1.8;margin:0 0 28px">
            Hi ${user.name}, we received a request to reset your password. Click the button below to choose a new one.
          </p>
          <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#0B1F3A,#1A3A6E);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px">
            Reset Password
          </a>
          <p style="color:#9CA3AF;font-size:13px;margin-top:28px;line-height:1.7">
            This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password will not change.
          </p>
          <p style="color:#D1D5DB;font-size:12px;margin-top:8px;word-break:break-all">
            ${link}
          </p>
        </div>
      </div>
    `,
  });
};
