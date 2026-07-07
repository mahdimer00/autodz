const STATUSES = ["جديد", "تم التواصل", "منتهي"];
const rowsEl = document.getElementById("rows");
const emptyEl = document.getElementById("empty");
const countEl = document.getElementById("count");
const searchEl = document.getElementById("search");
const statsEl = document.getElementById("stats");

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function statusOptions(current) {
  return STATUSES.map(
    (s) => `<option value="${s}" ${s === current ? "selected" : ""}>${s}</option>`,
  ).join("");
}

async function loadStats() {
  const res = await fetch("/api/gestion/stats");
  if (!res.ok) return;
  const data = await res.json();
  const s = data.stats;

  const cards = [
    { label: "إجمالي الطلبات", num: s.total },
    { label: "اليوم", num: s.today },
    { label: "آخر 7 أيام", num: s.last7Days },
    { label: "جديد", num: s.byStatus["جديد"] || 0 },
    { label: "تم التواصل", num: s.byStatus["تم التواصل"] || 0 },
    { label: "منتهي", num: s.byStatus["منتهي"] || 0 },
    { label: "أُرسل لتيليجرام", num: s.telegramSent },
  ];

  statsEl.innerHTML = cards
    .map((c) => `<div class="stat-card"><div class="num">${c.num}</div><div class="label">${c.label}</div></div>`)
    .join("");

  if (s.topWilayas.length) {
    const topHtml = s.topWilayas
      .map((w) => `<div class="stat-card"><div class="num">${w.count}</div><div class="label">${escapeHtml(w.wilaya)}</div></div>`)
      .join("");
    statsEl.innerHTML += topHtml;
  }
}

async function loadContactInfo() {
  const res = await fetch("/api/contact-info");
  if (!res.ok) return;
  const data = await res.json();
  const info = data.contactInfo;
  document.getElementById("ci-phone").value = info.phone || "";
  document.getElementById("ci-email").value = info.email || "";
  document.getElementById("ci-facebook").value = info.facebook || "";
  document.getElementById("ci-instagram").value = info.instagram || "";
  document.getElementById("ci-tiktok").value = info.tiktok || "";
}

document.getElementById("save-contact").addEventListener("click", async () => {
  const payload = {
    phone: document.getElementById("ci-phone").value.trim(),
    email: document.getElementById("ci-email").value.trim(),
    facebook: document.getElementById("ci-facebook").value.trim(),
    instagram: document.getElementById("ci-instagram").value.trim(),
    tiktok: document.getElementById("ci-tiktok").value.trim(),
  };
  const msgEl = document.getElementById("save-msg");
  msgEl.textContent = "جاري الحفظ...";
  const res = await fetch("/api/gestion/contact-info", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  msgEl.textContent = res.ok && data.ok ? "تم الحفظ بنجاح ✓" : (data.error || "فشل الحفظ");
  setTimeout(() => { msgEl.textContent = ""; }, 3000);
});

async function load() {
  const search = searchEl.value.trim();
  const res = await fetch(`/api/gestion/requests?search=${encodeURIComponent(search)}`);
  if (res.status === 401) {
    document.body.innerHTML = '<p class="muted" style="padding:20px;">انتهت صلاحية الجلسة، أعد تحميل الصفحة.</p>';
    return;
  }
  const data = await res.json();
  const items = data.requests || [];

  countEl.textContent = `${items.length} طلب`;
  emptyEl.hidden = items.length > 0;

  rowsEl.innerHTML = items
    .map(
      (r) => `
    <tr data-id="${r.id}">
      <td>${r.id}</td>
      <td>${escapeHtml(new Date(r.created_at).toLocaleString("ar-DZ"))}</td>
      <td>${escapeHtml(r.name)}</td>
      <td dir="ltr">${escapeHtml(r.phone)}</td>
      <td>${escapeHtml(r.wilaya)}</td>
      <td>${escapeHtml(r.car)}</td>
      <td>${escapeHtml(r.year)}</td>
      <td>${escapeHtml(r.engine)}</td>
      <td>${escapeHtml(r.part)}</td>
      <td>${escapeHtml(r.condition_wanted)}</td>
      <td class="notes">${escapeHtml(r.notes)}</td>
      <td>
        <span class="badge ${r.telegram_sent ? "sent" : "notsent"}">
          ${r.telegram_sent ? "أُرسل" : "لم يُرسل"}
        </span>
      </td>
      <td>
        <select data-id="${r.id}">${statusOptions(r.status)}</select>
      </td>
    </tr>
  `,
    )
    .join("");
}

rowsEl.addEventListener("change", async (e) => {
  if (e.target.tagName !== "SELECT") return;
  const id = e.target.dataset.id;
  const status = e.target.value;
  await fetch(`/api/gestion/requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  loadStats();
});

document.getElementById("refresh").addEventListener("click", () => {
  load();
  loadStats();
});

let searchTimer;
searchEl.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(load, 300);
});

load();
loadStats();
loadContactInfo();
