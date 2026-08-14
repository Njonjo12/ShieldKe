// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { updateProfile, deleteAccount } = require("../controllers/userController");

// ASSUMPTION: adjust this import to wherever your auth middleware lives.
// It should verify the JWT and attach `req.user = { id, role, ... }`.
const { protect } = require("../middleware/authMiddleware");

router.put("/me", protect, updateProfile);
router.delete("/me", protect, deleteAccount);

module.exports = router;

/*
Wire this up in your server file:

  const userRoutes = require("./routes/userRoutes");
  app.use("/api/users", userRoutes);

This gives you:
  PUT    /api/users/me   — update own profile
  DELETE /api/users/me   — soft-delete own account (requires password + confirm: "DELETE")

Works identically for clients and lawyers since it's driven entirely by
req.user.id from the JWT — no role branching needed for these two actions.
*/
