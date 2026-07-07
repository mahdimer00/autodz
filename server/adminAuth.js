import crypto from "node:crypto";

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function timingSafeStringEqual(a, b) {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function isAdminConfigured() {
  return Boolean(ADMIN_USER && ADMIN_PASSWORD);
}

export function adminAuth(req, res, next) {
  if (!isAdminConfigured()) {
    return res.status(503).send("Admin panel is not configured.");
  }

  const header = req.headers.authorization || "";
  const [scheme, encoded] = header.split(" ");

  if (scheme !== "Basic" || !encoded) {
    res.set("WWW-Authenticate", 'Basic realm="AutoDz Vip Admin"');
    return res.status(401).send("Authentication required.");
  }

  let decoded;
  try {
    decoded = Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    res.set("WWW-Authenticate", 'Basic realm="AutoDz Vip Admin"');
    return res.status(401).send("Invalid credentials.");
  }

  const sepIndex = decoded.indexOf(":");
  const user = sepIndex === -1 ? decoded : decoded.slice(0, sepIndex);
  const pass = sepIndex === -1 ? "" : decoded.slice(sepIndex + 1);

  const ok =
    timingSafeStringEqual(user, ADMIN_USER) &&
    timingSafeStringEqual(pass, ADMIN_PASSWORD);

  if (!ok) {
    res.set("WWW-Authenticate", 'Basic realm="AutoDz Vip Admin"');
    return res.status(401).send("Invalid credentials.");
  }

  next();
}
