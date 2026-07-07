import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  insertRequest,
  markTelegramSent,
  cleanupOldTokens,
  listRequests,
  updateRequestStatus,
  REQUEST_STATUSES,
  getContactInfo,
  updateContactInfo,
  getStats,
} from "./db.js";
import { createFormToken, verifyFormToken, hashIp, integrityHash, shortFingerprint } from "./security.js";
import { sendTelegramNotification, isTelegramConfigured } from "./telegram.js";
import { adminAuth, isAdminConfigured } from "./adminAuth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 8787;
const ALLOWED_ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const TOKEN_MAX_AGE_MS = 30 * 60 * 1000;

const FIELD_LIMITS = {
  name: 100,
  phone: 30,
  wilaya: 60,
  car: 100,
  year: 10,
  engine: 60,
  part: 150,
  condition_wanted: 40,
  notes: 1000,
};

const app = express();
app.set("trust proxy", process.env.TRUST_PROXY === "1");

app.use(helmet());
app.use(express.json({ limit: "15kb" }));

// CORS only applies to the public endpoints the separately-hosted frontend
// calls cross-origin (e.g. Netlify). /gestion/* is always same-origin (served
// by this same process) and deliberately has no CORS middleware.
const publicCors = cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
});

const tokenLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

const contactInfoLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const CONTACT_FIELD_LIMITS = {
  phone: 30,
  email: 100,
  facebook: 200,
  instagram: 200,
  tiktok: 200,
};

app.get("/api/form-token", publicCors, tokenLimiter, (req, res) => {
  res.json({ token: createFormToken(req.headers["user-agent"]) });
});

function sanitizeField(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

app.post("/api/requests", publicCors, submitLimiter, async (req, res) => {
  const body = req.body || {};

  // Honeypot: real users never fill this hidden field. Pretend success so
  // bots don't learn their submission was rejected.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return res.json({ ok: true });
  }

  const tokenResult = verifyFormToken(body.token, req.headers["user-agent"]);
  if (!tokenResult.ok) {
    return res.status(400).json({ ok: false, error: "التحقق من الطلب فشل، حاول مرة أخرى." });
  }

  const name = sanitizeField(body.name, FIELD_LIMITS.name);
  const phone = sanitizeField(body.phone, FIELD_LIMITS.phone);
  const wilaya = sanitizeField(body.wilaya, FIELD_LIMITS.wilaya);
  const car = sanitizeField(body.car, FIELD_LIMITS.car);
  const part = sanitizeField(body.part, FIELD_LIMITS.part);

  if (!name || !phone || !wilaya || !car || !part) {
    return res.status(400).json({ ok: false, error: "الرجاء تعبئة جميع الحقول المطلوبة." });
  }

  const digitsOnly = phone.replace(/[^\d]/g, "");
  if (digitsOnly.length < 9 || digitsOnly.length > 15) {
    return res.status(400).json({ ok: false, error: "رقم الهاتف غير صالح." });
  }

  const record = {
    created_at: new Date().toISOString(),
    name,
    phone,
    wilaya,
    car,
    year: sanitizeField(body.year, FIELD_LIMITS.year),
    engine: sanitizeField(body.engine, FIELD_LIMITS.engine),
    part,
    condition_wanted: sanitizeField(body.condition, FIELD_LIMITS.condition_wanted),
    notes: sanitizeField(body.notes, FIELD_LIMITS.notes),
    ip_hash: hashIp(req.ip || "unknown"),
  };

  const hash = integrityHash(record);
  const id = insertRequest({ ...record, integrity_hash: hash, telegram_sent: 0 });

  const sent = await sendTelegramNotification(record, shortFingerprint(hash));
  if (sent) markTelegramSent(id);

  res.json({ ok: true, id });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, telegram: isTelegramConfigured(), admin: isAdminConfigured() });
});

// Public: the frontend (hosted separately, e.g. Netlify) reads current
// contact details here instead of baking them into the build.
app.get("/api/contact-info", publicCors, contactInfoLimiter, (req, res) => {
  res.json({ ok: true, contactInfo: getContactInfo() });
});

app.get("/gestion", adminLimiter, adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "gestion.html"));
});

app.get("/gestion.js", adminLimiter, adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "gestion.js"));
});

app.get("/api/gestion/requests", adminLimiter, adminAuth, (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.slice(0, 100) : "";
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  res.json({ ok: true, requests: listRequests({ search, limit, offset }) });
});

app.patch("/api/gestion/requests/:id", adminLimiter, adminAuth, (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};

  if (!Number.isInteger(id) || !REQUEST_STATUSES.includes(status)) {
    return res.status(400).json({ ok: false, error: "invalid_request" });
  }

  updateRequestStatus(id, status);
  res.json({ ok: true });
});

app.get("/api/gestion/stats", adminLimiter, adminAuth, (req, res) => {
  res.json({ ok: true, stats: getStats() });
});

app.patch("/api/gestion/contact-info", adminLimiter, adminAuth, (req, res) => {
  const body = req.body || {};
  const phone = sanitizeField(body.phone, CONTACT_FIELD_LIMITS.phone);
  const email = sanitizeField(body.email, CONTACT_FIELD_LIMITS.email);
  const facebook = sanitizeField(body.facebook, CONTACT_FIELD_LIMITS.facebook);
  const instagram = sanitizeField(body.instagram, CONTACT_FIELD_LIMITS.instagram);
  const tiktok = sanitizeField(body.tiktok, CONTACT_FIELD_LIMITS.tiktok);

  const digitsOnly = phone.replace(/[^\d]/g, "");
  if (!phone || digitsOnly.length < 9 || digitsOnly.length > 15) {
    return res.status(400).json({ ok: false, error: "رقم الهاتف غير صالح." });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: "البريد الإلكتروني غير صالح." });
  }

  updateContactInfo({ phone, email, facebook, instagram, tiktok });
  res.json({ ok: true });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, error: "not_found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[server] unhandled error:", err);
  res.status(500).json({ ok: false, error: "خطأ في الخادم." });
});

setInterval(
  () => cleanupOldTokens(new Date(Date.now() - TOKEN_MAX_AGE_MS).toISOString()),
  15 * 60 * 1000,
).unref();

app.listen(PORT, () => {
  console.log(`[server] AutoDz Vip API listening on http://localhost:${PORT}`);
  if (!isTelegramConfigured()) {
    console.warn(
      "[server] Telegram not configured — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env",
    );
  }
});
