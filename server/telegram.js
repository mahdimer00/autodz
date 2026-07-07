const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function escapeMarkdown(value) {
  return String(value ?? "").replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

export function isTelegramConfigured() {
  return Boolean(BOT_TOKEN && CHAT_ID);
}

export async function sendTelegramNotification(request, fingerprint) {
  if (!isTelegramConfigured()) {
    console.warn(
      "[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set — skipping notification.",
    );
    return false;
  }

  const lines = [
    "*طلب قطعة غيار جديد \\- AutoDz Vip*",
    "",
    `*الاسم:* ${escapeMarkdown(request.name)}`,
    `*الهاتف:* ${escapeMarkdown(request.phone)}`,
    `*الولاية:* ${escapeMarkdown(request.wilaya)}`,
    `*السيارة:* ${escapeMarkdown(request.car)}`,
    `*السنة:* ${escapeMarkdown(request.year || "-")}`,
    `*المحرك:* ${escapeMarkdown(request.engine || "-")}`,
    `*القطعة:* ${escapeMarkdown(request.part)}`,
    `*الحالة المطلوبة:* ${escapeMarkdown(request.condition_wanted || "-")}`,
    `*ملاحظات:* ${escapeMarkdown(request.notes || "-")}`,
    "",
    `🕒 ${escapeMarkdown(request.created_at)}`,
    `🔑 التحقق: \`${fingerprint}\``,
  ];

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: lines.join("\n"),
        parse_mode: "MarkdownV2",
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[telegram] sendMessage failed:", res.status, body);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[telegram] sendMessage error:", err.message);
    return false;
  }
}
