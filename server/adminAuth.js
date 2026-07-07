import crypto from "node:crypto";

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.HMAC_SECRET;
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours
const COOKIE_NAME = "gestion_session";

function timingSafeStringEqual(a, b) {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function sign(payload) {
  return crypto.createHmac("sha512", SESSION_SECRET).update(payload).digest("hex");
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

export function isAdminConfigured() {
  return Boolean(ADMIN_USER && ADMIN_PASSWORD && SESSION_SECRET);
}

export function checkCredentials(user, password) {
  if (!isAdminConfigured()) return false;
  return (
    timingSafeStringEqual(String(user || ""), ADMIN_USER) &&
    timingSafeStringEqual(String(password || ""), ADMIN_PASSWORD)
  );
}

export function createSessionToken() {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE_MS });
  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function verifySessionToken(token) {
  if (typeof token !== "string" || !token.includes(".")) return false;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;

  const expected = sign(encoded);
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"))
  ) {
    return false;
  }

  try {
    const { exp } = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

export function requireSession(req, res, next) {
  if (!isAdminConfigured()) {
    return res.status(503).json({ ok: false, error: "admin_not_configured" });
  }

  const cookies = parseCookies(req.headers.cookie);
  if (verifySessionToken(cookies[COOKIE_NAME])) {
    return next();
  }

  return res.status(401).json({ ok: false, error: "unauthorized" });
}

export function setSessionCookie(res, req) {
  res.cookie(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: req.secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}
