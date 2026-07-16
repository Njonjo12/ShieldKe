const crypto   = require("crypto");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const User     = require("../models/User");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/emailService");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const safeUser = (user) => ({
  _id:                user._id,
  name:               user.name,
  email:              user.email,
  role:               user.role,
  profilePhoto:       user.profilePhoto,
  isEmailVerified:    user.isEmailVerified,
  verificationStatus: user.verificationStatus,
  isVerified:         user.isVerified,
  rejectionReason:    user.rejectionReason,
  canReapply:         user.canReapply,
  specialization:     user.specialization,
  yearsOfExperience:  user.yearsOfExperience,
  consultationFee:    user.consultationFee,
  lskNumber:          user.lskNumber,
  location:           user.location,
  bio:                user.bio,
  authProvider:       user.authProvider,
});

/* ══════════════════════════════════════
   REGISTER
══════════════════════════════════════ */
const registerUser = async (req, res) => {
  try {
    const {
      name, email, phone, password, role,
      specialization, yearsOfExperience, consultationFee,
      lskNumber, location, bio
    } = req.body;

    const existingUser = await User.findOne({ email });

    /* lawyer reapplication */
    if (existingUser) {
      if (existingUser.role === "lawyer" && existingUser.verificationStatus === "rejected") {
        if (!existingUser.canReapply) {
          return res.status(403).json({
            message: "Your application was rejected. Please address admin feedback before reapplying.",
            rejectionReason: existingUser.rejectionReason
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let barCertificate = "", practicingCertificate = "", nationalIdDocument = "";
        if (req.files) {
          if (req.files.barCertificate)        barCertificate        = req.files.barCertificate[0].path;
          if (req.files.practicingCertificate) practicingCertificate = req.files.practicingCertificate[0].path;
          if (req.files.nationalIdDocument)    nationalIdDocument    = req.files.nationalIdDocument[0].path;
          if (req.files.profilePhoto)          existingUser.profilePhoto = req.files.profilePhoto[0].path;
        }
        Object.assign(existingUser, {
          name, phone, password: hashedPassword,
          specialization, yearsOfExperience, consultationFee, lskNumber, location, bio,
          barCertificate, practicingCertificate, nationalIdDocument,
          verificationStatus: "pending", isVerified: false, rejectionReason: ""
        });
        await existingUser.save();
        return res.status(200).json({ message: "Application resubmitted successfully" });
      }
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let barCertificate = "", practicingCertificate = "", nationalIdDocument = "", profilePhoto = "";
    if (req.files) {
      if (req.files.barCertificate)        barCertificate        = req.files.barCertificate[0].path;
      if (req.files.practicingCertificate) practicingCertificate = req.files.practicingCertificate[0].path;
      if (req.files.nationalIdDocument)    nationalIdDocument    = req.files.nationalIdDocument[0].path;
      if (req.files.profilePhoto)          profilePhoto          = req.files.profilePhoto[0].path;
    }

    /* email verification token */
    const verificationToken   = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      name, email, phone,
      password: hashedPassword,
      role,
      specialization, yearsOfExperience, consultationFee, lskNumber, location, bio,
      barCertificate, practicingCertificate, nationalIdDocument, profilePhoto,
      verificationStatus: role === "lawyer" ? "pending" : "verified",
      isVerified: role === "client",
      /* email not yet verified for local signups */
      isEmailVerified:          false,
      emailVerificationToken:   verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    /* send verification email — don't let email failure break registration */
    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailErr) {
      console.error("Verification email failed:", emailErr.message);
    }

    res.status(201).json({
      message: "Account created! Please check your email to verify your account.",
      user: safeUser(user)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ══════════════════════════════════════
   VERIFY EMAIL
══════════════════════════════════════ */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken:   token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Verification link is invalid or has expired."
      });
    }

    user.isEmailVerified          = true;
    user.emailVerificationToken   = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully! You can now sign in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ══════════════════════════════════════
   RESEND VERIFICATION EMAIL
══════════════════════════════════════ */
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.isEmailVerified) {
      /* generic response to avoid revealing whether an email exists */
      return res.json({ message: "If that email exists and isn't already verified, a new link has been sent." });
    }

    const token   = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.emailVerificationToken   = token;
    user.emailVerificationExpires = expires;
    await user.save();

    await sendVerificationEmail(user, token);
    res.json({ message: "Verification email resent. Please check your inbox." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ══════════════════════════════════════
   LOGIN
══════════════════════════════════════ */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    /* block OAuth accounts from password login */
    if (user.authProvider !== "local") {
      return res.status(400).json({
        message: `This account was created with ${user.authProvider}. Please sign in using that method.`
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    /* require email verification for local accounts */
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before signing in.",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
      });
    }

    res.json({ token: signToken(user), user: safeUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ══════════════════════════════════════
   FORGOT PASSWORD
══════════════════════════════════════ */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    /* always return 200 to avoid email enumeration */
    if (!user || user.authProvider !== "local") {
      return res.json({ message: "If that email exists in our system, a reset link has been sent." });
    }

    const token   = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    user.resetPasswordToken   = token;
    user.resetPasswordExpires = expires;
    await user.save();

    await sendPasswordResetEmail(user, token);
    res.json({ message: "Password reset link sent. Please check your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ══════════════════════════════════════
   RESET PASSWORD
══════════════════════════════════════ */
const resetPassword = async (req, res) => {
  try {
    const { token }    = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken:   token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset link is invalid or has expired."
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    user.password             = await bcrypt.hash(password, 10);
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ══════════════════════════════════════
   GOOGLE OAUTH
   Frontend sends the credential (id_token)
   from Google Identity Services.
   We verify it and create/find the user.
══════════════════════════════════════ */
const googleAuth = async (req, res) => {
  try {
    const { credential, role } = req.body;
    if (!credential) return res.status(400).json({ message: "No credential provided" });

    /* decode the JWT from Google (verify with Google's public keys in prod) */
    const payload = JSON.parse(
      Buffer.from(credential.split(".")[1], "base64").toString()
    );

    const { sub: googleId, email, name, picture } = payload;
    if (!email) return res.status(400).json({ message: "Could not get email from Google" });

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      /* new user — role required */
      if (!role) {
        return res.status(200).json({
          needsRole: true,
          email,
          name,
          googleId,
          picture,
        });
      }
      user = await User.create({
        name,
        email,
        googleId,
        authProvider:    "google",
        role,
        profilePhoto:    picture || "",
        isEmailVerified: true,           /* Google accounts are pre-verified */
        verificationStatus: role === "lawyer" ? "pending" : "verified",
        isVerified:         role === "client",
      });
    } else if (!user.googleId) {
      /* existing local account — link Google */
      user.googleId        = googleId;
      user.authProvider    = "google";
      user.isEmailVerified = true;
      if (picture && !user.profilePhoto) user.profilePhoto = picture;
      await user.save();
    }

    res.json({ token: signToken(user), user: safeUser(user) });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Google sign-in failed" });
  }
};

/* ══════════════════════════════════════
   LINKEDIN OAUTH — Step 1
   Redirect user to LinkedIn auth page
══════════════════════════════════════ */
const linkedinAuthRedirect = (req, res) => {
  const { role } = req.query;
  const params = new URLSearchParams({
    response_type: "code",
    client_id:     process.env.LINKEDIN_CLIENT_ID,
    redirect_uri:  process.env.LINKEDIN_REDIRECT_URI,
    scope:         "openid profile email",
    state:         role || "client",
  });
  res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`);
};

/* ══════════════════════════════════════
   LINKEDIN OAUTH — Step 2
   Handle callback, exchange code for token
══════════════════════════════════════ */
const linkedinAuthCallback = async (req, res) => {
  const FRONTEND = process.env.FRONTEND_URL || "https://shield.co.ke";
  try {
    const { code, state: role } = req.query;
    if (!code) throw new Error("No code returned from LinkedIn");

    /* exchange code for access token */
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "authorization_code",
        code,
        redirect_uri:  process.env.LINKEDIN_REDIRECT_URI,
        client_id:     process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("Failed to get LinkedIn access token");

    /* get user info via OpenID userinfo endpoint */
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    const { sub: linkedinId, email, name, picture } = profile;
    if (!email) throw new Error("Could not get email from LinkedIn");

    let user = await User.findOne({ $or: [{ linkedinId }, { email }] });

    if (!user) {
      user = await User.create({
        name,
        email,
        linkedinId,
        authProvider:    "linkedin",
        role:            role || "client",
        profilePhoto:    picture || "",
        isEmailVerified: true,
        verificationStatus: role === "lawyer" ? "pending" : "verified",
        isVerified:         role === "client" || role === undefined,
      });
    } else if (!user.linkedinId) {
      user.linkedinId      = linkedinId;
      user.authProvider    = "linkedin";
      user.isEmailVerified = true;
      if (picture && !user.profilePhoto) user.profilePhoto = picture;
      await user.save();
    }

    const token = signToken(user);

    /* redirect back to frontend with token in query param
       (frontend reads it and stores in localStorage) */
    res.redirect(`${FRONTEND}/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(safeUser(user)))}`);
  } catch (error) {
    console.error("LinkedIn auth error:", error);
    res.redirect(`${FRONTEND}/login?error=linkedin_failed`);
  }
};

/* ══════════════════════════════════════
   GET CURRENT USER
══════════════════════════════════════ */
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  registerUser,
  verifyEmail,
  resendVerification,
  loginUser,
  forgotPassword,
  resetPassword,
  googleAuth,
  linkedinAuthRedirect,
  linkedinAuthCallback,
  getMe,
};
