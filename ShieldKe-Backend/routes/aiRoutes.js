// routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/aiController");

// Public route — no auth required, this widget lives on the pre-login homepage.
router.post("/chat", chat);

module.exports = router;

/*
Wire this up in your main server file (e.g. server.js / app.js):

  const aiRoutes = require("./routes/aiRoutes");
  app.use("/api/ai", aiRoutes);

Env var required on Render:
  ANTHROPIC_API_KEY=sk-ant-...

No new npm packages needed — this uses the global fetch available in Node 18+.
If your Render service runs an older Node version, either bump it in package.json
("engines": { "node": ">=18" }) or `npm install node-fetch` and require it at the
top of aiController.js instead of using global fetch.
*/
