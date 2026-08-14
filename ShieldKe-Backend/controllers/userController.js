// controllers/userController.js
//
// Handles account self-service: profile updates and account deletion,
// for both clients and lawyers (role-agnostic — driven by req.user).
//
// ASSUMPTIONS — adjust these to match your actual codebase:
//   - You have an auth middleware (e.g. `protect` from middleware/authMiddleware.js)
//     that verifies the JWT and sets `req.user = { id, role, ... }`.
//   - Your User model is at models/User.js with fields roughly like:
//       { name, email, phone, password, role, isActive, deletedAt, ...roleSpecificFields }
//   - Passwords are hashed with bcrypt (adjust the require path if different).
// Swap these to match your real files — the logic below doesn't depend on
// exact field names beyond what's shown.

const bcrypt = require("bcryptjs"); // or "bcrypt" — match whatever authController.js uses
const User = require("../models/User");

// Fields a user is allowed to self-update. Deliberately NOT including
// `role`, `isActive`, `isVerified`, or anything admin-controlled (e.g.
// LSK verification status for lawyers) — those must stay admin-only.
const EDITABLE_FIELDS = [
  "name",
  "phone",
  "bio",
  "location",
  "practiceAreas",       // lawyer-specific — harmless no-op for clients if absent
  "specialization",      // lawyer-specific
  "yearsOfExperience",   // lawyer-specific
  "consultationFee",     // lawyer-specific
  "profilePhoto",
];
// Deliberately NOT editable by the user themselves: lskNumber, verificationStatus,
// role — those must stay admin-controlled since they're trust/verification signals.

// PUT /api/users/me
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const updates = {};

    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Password change is handled separately and requires current password
    // confirmation — never silently accept a bare "password" field here.
    if (req.body.password) {
      if (!req.body.currentPassword) {
        return res.status(400).json({
          error: "Current password is required to set a new password.",
        });
      }

      const user = await User.findById(userId).select("+password");
      if (!user) return res.status(404).json({ error: "User not found." });

      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Current password is incorrect." });
      }

      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    // Email change: flag as unverified again if you require re-verification
    // on email change (recommended, since email is the login identifier).
    if (req.body.email) {
      const existing = await User.findOne({ email: req.body.email, _id: { $ne: userId } });
      if (existing) {
        return res.status(409).json({ error: "That email is already in use." });
      }
      updates.email = req.body.email;
      updates.isVerified = false; // remove this line if you don't re-verify on email change
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({ user: updatedUser });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ error: "Could not update profile." });
  }
}

// DELETE /api/users/me
// Soft-delete: disables login and anonymizes personal fields, but preserves
// the document (and its id) so past consultations/reviews tied to this user
// remain intact for the other party's records.
async function deleteAccount(req, res) {
  try {
    const userId = req.user.id;
    const { password, confirm } = req.body;

    if (confirm !== "DELETE") {
      return res.status(400).json({
        error: 'Please confirm by sending confirm: "DELETE" in the request body.',
      });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) return res.status(404).json({ error: "User not found." });

    // Require password re-entry before a destructive action, even though
    // the user is already authenticated — standard practice for delete flows.
    if (!password) {
      return res.status(400).json({ error: "Password is required to delete your account." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    user.isActive = false;
    user.deletedAt = new Date();
    user.name = "Deleted User";
    user.email = `deleted-${user._id}@shieldke.invalid`; // frees up the real email for reuse
    user.phone = undefined;
    user.bio = undefined;
    user.profilePhoto = undefined;
    user.password = await bcrypt.hash(require("crypto").randomBytes(32).toString("hex"), 10); // kills login

    await user.save();

    // If you issue JWTs with short expiry + refresh tokens, also invalidate
    // any refresh token / session record here so existing sessions die immediately.

    return res.json({ message: "Account deleted." });
  } catch (err) {
    console.error("deleteAccount error:", err);
    return res.status(500).json({ error: "Could not delete account." });
  }
}

module.exports = { updateProfile, deleteAccount };

/*
NOTE on hard delete (admin-only, or for compliance erasure requests):
If you need a true hard-delete path later (e.g. an admin tool, or a formal
data-erasure request under the Data Protection Act 2019), add a separate
admin-only route like DELETE /api/admin/users/:id/hard that actually runs
User.findByIdAndDelete(id) plus cascades to remove/anonymize related
consultation & message records. Don't expose that one to self-service users.
*/
