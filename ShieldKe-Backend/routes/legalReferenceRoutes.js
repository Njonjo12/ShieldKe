// routes/legalReferenceRoutes.js
const express = require("express");
const router = express.Router();
const { searchArticles, getArticleByNumber } = require("../utils/legalReference");

// GET /api/legal-reference/search?q=land+rights
router.get("/search", (req, res) => {
  const { q, limit } = req.query;
  if (!q) return res.status(400).json({ error: "Query param 'q' is required." });

  const results = searchArticles(q, limit ? Number(limit) : 5);
  res.json({ results });
});

// GET /api/legal-reference/article/43
router.get("/article/:number", (req, res) => {
  const article = getArticleByNumber(req.params.number);
  if (!article) return res.status(404).json({ error: "Article not found." });
  res.json({ article });
});

module.exports = router;

/*
Wire this up in your server file:

  const legalReferenceRoutes = require("./routes/legalReferenceRoutes");
  app.use("/api/legal-reference", legalReferenceRoutes);

This also gives you a standalone "Browse the Constitution" feature for free,
independent of Sheria — e.g. a frontend search box hitting /search, or a
deep-linkable article viewer hitting /article/:number.
*/
