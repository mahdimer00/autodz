import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "data", "requests.sqlite");

mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    wilaya TEXT NOT NULL,
    car TEXT NOT NULL,
    year TEXT,
    engine TEXT,
    part TEXT NOT NULL,
    condition_wanted TEXT,
    notes TEXT,
    ip_hash TEXT NOT NULL,
    integrity_hash TEXT NOT NULL,
    telegram_sent INTEGER NOT NULL DEFAULT 0
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS used_tokens (
    nonce TEXT PRIMARY KEY,
    used_at TEXT NOT NULL
  )
`);

try {
  db.exec("ALTER TABLE requests ADD COLUMN status TEXT NOT NULL DEFAULT 'جديد'");
} catch {
  // column already exists from a previous run
}

db.exec(`
  CREATE TABLE IF NOT EXISTS contact_info (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    phone TEXT NOT NULL,
    facebook TEXT NOT NULL DEFAULT '',
    instagram TEXT NOT NULL DEFAULT '',
    tiktok TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL
  )
`);

db.exec(`
  INSERT OR IGNORE INTO contact_info (id, phone, facebook, instagram, tiktok, email, updated_at)
  VALUES (
    1,
    '0770589042',
    'https://facebook.com/autodzvip',
    'https://instagram.com/autodzvip',
    'https://tiktok.com/@autodzvip',
    'contact@autodzvip.com',
    '${new Date().toISOString()}'
  )
`);

export const REQUEST_STATUSES = ["جديد", "تم التواصل", "منتهي"];

const insertRequestStmt = db.prepare(`
  INSERT INTO requests
    (created_at, name, phone, wilaya, car, year, engine, part, condition_wanted, notes, ip_hash, integrity_hash, telegram_sent)
  VALUES
    (@created_at, @name, @phone, @wilaya, @car, @year, @engine, @part, @condition_wanted, @notes, @ip_hash, @integrity_hash, @telegram_sent)
`);

const markTelegramSentStmt = db.prepare(
  "UPDATE requests SET telegram_sent = 1 WHERE id = ?",
);

const insertUsedTokenStmt = db.prepare(
  "INSERT INTO used_tokens (nonce, used_at) VALUES (?, ?)",
);

const isTokenUsedStmt = db.prepare(
  "SELECT 1 FROM used_tokens WHERE nonce = ?",
);

const cleanupOldTokensStmt = db.prepare(
  "DELETE FROM used_tokens WHERE used_at < ?",
);

const listRequestsStmt = db.prepare(`
  SELECT id, created_at, name, phone, wilaya, car, year, engine, part,
         condition_wanted, notes, status, telegram_sent
  FROM requests
  WHERE @search = ''
     OR name LIKE @likeSearch
     OR phone LIKE @likeSearch
     OR car LIKE @likeSearch
     OR part LIKE @likeSearch
  ORDER BY id DESC
  LIMIT @limit OFFSET @offset
`);

const updateStatusStmt = db.prepare(
  "UPDATE requests SET status = ? WHERE id = ?",
);

const getContactInfoStmt = db.prepare(
  "SELECT phone, facebook, instagram, tiktok, email FROM contact_info WHERE id = 1",
);

const updateContactInfoStmt = db.prepare(`
  UPDATE contact_info
  SET phone = @phone, facebook = @facebook, instagram = @instagram,
      tiktok = @tiktok, email = @email, updated_at = @updated_at
  WHERE id = 1
`);

const totalCountStmt = db.prepare("SELECT COUNT(*) AS n FROM requests");
const countByStatusStmt = db.prepare(
  "SELECT status, COUNT(*) AS n FROM requests GROUP BY status",
);
const countSinceStmt = db.prepare(
  "SELECT COUNT(*) AS n FROM requests WHERE created_at >= ?",
);
const telegramSentCountStmt = db.prepare(
  "SELECT COUNT(*) AS n FROM requests WHERE telegram_sent = 1",
);
const topWilayasStmt = db.prepare(`
  SELECT wilaya, COUNT(*) AS n FROM requests
  GROUP BY wilaya ORDER BY n DESC LIMIT 5
`);

export function insertRequest(record) {
  const result = insertRequestStmt.run(record);
  return Number(result.lastInsertRowid);
}

export function markTelegramSent(id) {
  markTelegramSentStmt.run(id);
}

export function isTokenUsed(nonce) {
  return Boolean(isTokenUsedStmt.get(nonce));
}

export function markTokenUsed(nonce) {
  insertUsedTokenStmt.run(nonce, new Date().toISOString());
}

export function cleanupOldTokens(olderThanIso) {
  cleanupOldTokensStmt.run(olderThanIso);
}

export function listRequests({ search = "", limit = 50, offset = 0 } = {}) {
  return listRequestsStmt.all({
    search,
    likeSearch: `%${search}%`,
    limit,
    offset,
  });
}

export function updateRequestStatus(id, status) {
  if (!REQUEST_STATUSES.includes(status)) {
    throw new Error("invalid_status");
  }
  updateStatusStmt.run(status, id);
}

export function getContactInfo() {
  return getContactInfoStmt.get();
}

export function updateContactInfo(fields) {
  updateContactInfoStmt.run({ ...fields, updated_at: new Date().toISOString() });
}

export function getStats() {
  const total = Number(totalCountStmt.get().n);
  const byStatus = Object.fromEntries(
    REQUEST_STATUSES.map((s) => [s, 0]),
  );
  for (const row of countByStatusStmt.all()) {
    byStatus[row.status] = Number(row.n);
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const today = Number(countSinceStmt.get(startOfToday.toISOString()).n);
  const last7Days = Number(countSinceStmt.get(sevenDaysAgo.toISOString()).n);
  const telegramSent = Number(telegramSentCountStmt.get().n);
  const topWilayas = topWilayasStmt.all().map((r) => ({
    wilaya: r.wilaya,
    count: Number(r.n),
  }));

  return { total, byStatus, today, last7Days, telegramSent, topWilayas };
}

export default db;
