// controllers/aiController.js
// Sheria — ShieldKe's AI legal assistant.
// Handles general Kenyan legal FAQs AND runs a structured intake flow that
// ends in a "Find a Lawyer" CTA, categorised so the frontend can route the
// user to the right specialism.

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

// Categories must match whatever you use to tag/filter lawyers on the platform.
// Keep this list in sync with your lawyer specialism taxonomy.
const VALID_CATEGORIES = [
  "Employment",
  "Land & Property",
  "Family & Marriage",
  "Succession & Inheritance",
  "Criminal",
  "Business & Contracts",
  "Consumer & Debt",
  "Other",
];

const SHERIA_SYSTEM_PROMPT = `You are Sheria, the AI legal assistant embedded on the ShieldKe homepage (shield.co.ke), a Kenyan legaltech platform that connects people with LSK-verified lawyers.

You have two jobs, and you move between them naturally in one conversation:

1. GENERAL FAQ MODE
Answer general questions about Kenyan law in plain, accessible language: Employment Act 2007, Land Act 2012, Land Registration Act 2012, Marriage Act 2014, Law of Succession Act (Cap 160), Consumer Protection Act, the Constitution of Kenya 2010, and other commonly-relevant statutes. Be accurate and concise. Always make clear this is general legal information, not legal advice for their specific situation, and that outcomes depend on facts and should be confirmed with a qualified lawyer.

2. INTAKE MODE
If the user describes a personal legal problem (not just a general question), switch into intake mode. Ask short, focused follow-up questions one or two at a time — not a wall of questions — to understand:
- What happened, and when
- Who the other party is (employer, family member, buyer/seller, landlord, etc.)
- Relevant location/county (Kenyan law can have county-level land/administrative nuances)
- What outcome they're hoping for

Once you have enough to categorise the issue with reasonable confidence, do three things in your final message of the intake:
a) Briefly summarise the issue back to them in 1-2 sentences so they feel heard.
b) Give one or two general pointers on what Kenyan law says about this kind of situation (still general info, not advice).
c) End the message with a line on its own, in exactly this format, with no other text on that line:
READY_FOR_LAWYER::<category>

Where <category> is exactly one of: ${VALID_CATEGORIES.join(", ")}.

Rules:
- Never invent case outcomes, never quote specific fees, never claim to represent ShieldKe's lawyers directly.
- Do not produce the READY_FOR_LAWYER line during general FAQ answers — only when intake is genuinely complete.
- Do not produce more than one READY_FOR_LAWYER line per message.
- If the user is in obvious distress (e.g. describing violence, abuse, immediate danger), gently prioritise their safety, suggest contacting relevant authorities or emergency services, and still offer the lawyer hand-off.
- Keep replies conversational and short — this is a chat widget, not an essay. Use plain text, occasional short lists, no markdown headers.`;

// --- Extremely lightweight in-memory rate limiter -------------------------
// This endpoint is public (pre-login), so it needs basic abuse protection
// before you're paying for real traffic. For anything beyond a single
// Render instance, replace this with a shared store (e.g. Redis).
const rateBuckets = new Map(); // ip -> { count, resetAt }
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 12; // messages per IP per minute

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

// Parse the CTA marker out of the model's reply, if present.
function extractCta(text) {
  const match = text.match(/^READY_FOR_LAWYER::(.+)$/m);
  if (!match) return { cleanText: text.trim(), cta: null };

  const rawCategory = match[1].trim();
  const category = VALID_CATEGORIES.includes(rawCategory) ? rawCategory : "Other";
  const cleanText = text.replace(match[0], "").trim();

  return { cleanText, cta: { category } };
}

async function chat(req, res) {
  try {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    if (isRateLimited(ip)) {
      return res.status(429).json({
        error: "Too many messages. Please wait a moment before continuing.",
      });
    }

    const { message, history } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }
    if (history && !Array.isArray(history)) {
      return res.status(400).json({ error: "history must be an array" });
    }

    // history items expected as { role: 'user' | 'assistant', content: string }
    const safeHistory = (history || [])
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .slice(-20) // cap context sent per request
      .map((m) => ({ role: m.role, content: m.content }));

    const messages = [...safeHistory, { role: "user", content: message }];

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set on the server");
      return res.status(500).json({ error: "AI assistant is not configured." });
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        system: SHERIA_SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return res.status(502).json({ error: "AI assistant is temporarily unavailable." });
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((b) => b.type === "text");
    const rawText = textBlock ? textBlock.text : "";

    const { cleanText, cta } = extractCta(rawText);

    return res.json({ reply: cleanText, cta });
  } catch (err) {
    console.error("Sheria chat error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

module.exports = { chat, VALID_CATEGORIES };
