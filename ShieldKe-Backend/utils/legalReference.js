// utils/legalReference.js
//
// Loads, cleans, and provides search over the Constitution of Kenya (2010)
// dataset sourced from https://github.com/kibmuikia/ke-katiba-digest.
//
// The raw source data has two known parsing artifacts from its PDF-extraction
// pipeline (verified by inspection before this was built):
//   1. Page-footer text ("Constitution of Kenya 2010 <page number>") bleeds
//      into ~68 clauses at page-break boundaries — stripped below.
//   2. 4 articles (24, 217, 225, 257) have a spurious near-empty duplicate
//      entry (blank title, 0-1 clauses) alongside the real, complete one —
//      filtered out below by dropping any article entry with an empty title
//      when a populated entry for the same number exists.
//
// Everything is loaded and cleaned once at server startup and kept in
// memory — the dataset is under 1MB, so there's no need for a database
// round-trip on every search.

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/constitution_kenya_2010.json");
const FOOTER_PATTERN = /Constitution of Kenya 2010\s*\d*/gi;

let flatArticles = null; // populated lazily on first use

function cleanText(text) {
  if (!text) return "";
  return text.replace(FOOTER_PATTERN, "").replace(/\s+/g, " ").trim();
}

function flattenArticle(article, chapterNumber, chapterTitle, partTitle) {
  const clauseTexts = (article.clauses || []).map((c) => {
    const subText = (c.subclauses || [])
      .map((s) => `(${s.identifier}) ${cleanText(s.text)}`)
      .join(" ");
    return [cleanText(c.text), subText].filter(Boolean).join(" ");
  });

  return {
    number: article.number,
    canonicalRef: article.canonical_ref || `Article ${article.number}`,
    title: article.title,
    chapterNumber,
    chapterTitle,
    partTitle: partTitle || null,
    fullText: clauseTexts.join(" ").trim(),
  };
}

function loadAndClean() {
  const raw = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const byNumber = new Map(); // dedupe: keep the populated entry per article number

  for (const chapter of raw.chapters || []) {
    for (const article of chapter.articles || []) {
      if (!article.title) continue; // drop phantom empty-title duplicates
      const flat = flattenArticle(article, chapter.number, chapter.title, null);
      byNumber.set(flat.number, flat);
    }
    for (const part of chapter.parts || []) {
      for (const article of part.articles || []) {
        if (!article.title) continue;
        const flat = flattenArticle(article, chapter.number, chapter.title, part.title);
        byNumber.set(flat.number, flat);
      }
    }
  }

  return Array.from(byNumber.values()).sort((a, b) => a.number - b.number);
}

function getArticles() {
  if (!flatArticles) {
    flatArticles = loadAndClean();
    console.log(`Legal reference: loaded ${flatArticles.length} constitution articles.`);
  }
  return flatArticles;
}

// Simple keyword-overlap scoring — no external search dependency needed
// for a dataset this size. Title matches are weighted higher than body matches.
function searchArticles(query, limit = 5) {
  if (!query || !query.trim()) return [];

  const articles = getArticles();
  const terms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 2); // skip tiny stopword-ish tokens

  if (terms.length === 0) return [];

  const scored = articles.map((a) => {
    const titleLower = a.title.toLowerCase();
    const textLower = a.fullText.toLowerCase();
    let score = 0;

    for (const term of terms) {
      if (titleLower.includes(term)) score += 3;
      if (textLower.includes(term)) score += 1;
    }

    return { article: a, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.article);
}

// Fetch a single article by number, e.g. for a "view Article 43" deep link.
function getArticleByNumber(number) {
  return getArticles().find((a) => a.number === Number(number)) || null;
}

module.exports = { searchArticles, getArticleByNumber, getArticles };
