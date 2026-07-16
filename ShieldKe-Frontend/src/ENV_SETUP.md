# ShieldKe — New Environment Variables

## Vercel (Frontend)
Add in Vercel → Project → Settings → Environment Variables:

| Name                  | Value                                  |
|-----------------------|----------------------------------------|
| VITE_API_URL          | https://shieldke.onrender.com/api      |
| VITE_GOOGLE_CLIENT_ID | your Google OAuth client ID (see below)|

## Render (Backend)
Add in Render → Service → Environment:

| Name                   | Value                                              |
|------------------------|----------------------------------------------------|
| SMTP_HOST              | smtp-relay.brevo.com  (or smtp.gmail.com)          |
| SMTP_PORT              | 587                                                |
| SMTP_USER              | your sending email address                         |
| SMTP_PASS              | your SMTP password / app password                  |
| FROM_EMAIL             | ShieldKe <noreply@shield.co.ke>                    |
| FRONTEND_URL           | https://shield.co.ke                               |
| LINKEDIN_CLIENT_ID     | from LinkedIn Developer Portal (see below)         |
| LINKEDIN_CLIENT_SECRET | from LinkedIn Developer Portal                     |
| LINKEDIN_REDIRECT_URI  | https://shieldke.onrender.com/api/auth/linkedin/callback |

---

## Google OAuth Setup (5 minutes)
1. Go to https://console.cloud.google.com
2. Create a new project (or select existing)
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Application type: Web application
5. Authorised JavaScript origins:
     https://shield.co.ke
     https://www.shield.co.ke
     http://localhost:5173  (for local dev)
6. Authorised redirect URIs: (none needed — we use the Identity Services popup flow)
7. Copy the Client ID → set as VITE_GOOGLE_CLIENT_ID on Vercel

## LinkedIn OAuth Setup (10 minutes)
1. Go to https://www.linkedin.com/developers/apps
2. Create app → fill in name/logo
3. Products tab → add "Sign In with LinkedIn using OpenID Connect"
4. Auth tab → copy Client ID and Client Secret → set on Render
5. Authorised redirect URLs → add:
     https://shieldke.onrender.com/api/auth/linkedin/callback

## Email — Brevo (recommended, 300 free emails/day)
1. Sign up at https://brevo.com
2. SMTP & API → SMTP → Generate new SMTP key
3. SMTP_HOST=smtp-relay.brevo.com, SMTP_PORT=587
4. SMTP_USER=your_brevo_login_email
5. SMTP_PASS=the generated SMTP key

## Email — Gmail (quick start)
1. Enable 2FA on your Google account
2. Google Account → Security → App Passwords → create one
3. SMTP_HOST=smtp.gmail.com, SMTP_PORT=587
4. SMTP_USER=you@gmail.com, SMTP_PASS=the 16-char app password

---
After adding all env vars: redeploy both Render and Vercel.
