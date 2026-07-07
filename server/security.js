import crypto from "node:crypto";
import { isTokenUsed, markTokenUsed } from "./db.js";

const SECRET = process.env.HMAC_SECRET;

if (!SECRET || SECRET.length < 32) {
  throw new Error(
    "HMAC_SECRET is missing or too short (need at least 32 chars / 128 bits). " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"",
  );
}

const MIN_FILL_TIME_MS = 3000; // reject submissions faster than a human could plausibly fill the form
const MAX_TOKEN_AGE_MS = 30 * 60 * 1000; // form tokens expire after 30 minutes
const SIGNATURE_ALGO = "sha512";

function sign(payload) {
  return crypto.createHmac(SIGNATURE_ALGO, SECRET).update(payload).digest("hex");
}

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Bind a token to the requesting browser's session fingerprint (User-Agent),
// not its IP: mobile carriers in Algeria frequently rotate a phone's public
// IP mid-session, which would otherwise cause legitimate users to be
// rejected. Binding to the UA still blocks a token being lifted and replayed
// from a completely different client/script.
function sessionFingerprint(userAgent) {
  return crypto
    .createHash("sha256")
    .update(`${userAgent || "unknown"}:${SECRET}`)
    .digest("hex")
    .slice(0, 24);
}

export function createFormToken(userAgent) {
  const payload = JSON.stringify({
    ts: Date.now(),
    nonce: crypto.randomUUID(),
    fp: sessionFingerprint(userAgent),
  });
  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyFormToken(token, userAgent) {
  if (typeof token !== "string" || !token.includes(".")) {
    return { ok: false, reason: "malformed_token" };
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return { ok: false, reason: "malformed_token" };
  }

  const expectedSignature = sign(encoded);
  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(signature, expectedSignature)
  ) {
    return { ok: false, reason: "bad_signature" };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed_payload" };
  }

  const { ts, nonce, fp } = payload;
  if (typeof ts !== "number" || typeof nonce !== "string" || typeof fp !== "string") {
    return { ok: false, reason: "malformed_payload" };
  }

  if (fp !== sessionFingerprint(userAgent)) {
    return { ok: false, reason: "session_mismatch" };
  }

  const age = Date.now() - ts;
  if (age < MIN_FILL_TIME_MS) {
    return { ok: false, reason: "too_fast" };
  }
  if (age > MAX_TOKEN_AGE_MS) {
    return { ok: false, reason: "token_expired" };
  }

  if (isTokenUsed(nonce)) {
    return { ok: false, reason: "token_reused" };
  }
  markTokenUsed(nonce);

  return { ok: true };
}

export function hashIp(ip) {
  return crypto
    .createHash("sha256")
    .update(`${ip}:${SECRET}`)
    .digest("hex")
    .slice(0, 32);
}

export function integrityHash(record) {
  const canonical = JSON.stringify(record, Object.keys(record).sort());
  return crypto.createHmac(SIGNATURE_ALGO, SECRET).update(canonical).digest("hex");
}

export function shortFingerprint(hash) {
  return hash.slice(0, 8);
}
