const STATUSES = ["جديد", "تم التواصل", "منتهي"];
const rowsEl = document.getElementById("rows");
const emptyEl = document.getElementById("empty");
const countEl = document.getElementById("count");
const searchEl = document.getElementById("search");
const statsEl = document.getElementById("stats");
const loginScreen = document.getElementById("login-screen");
const appEl = document.getElementById("app");
const loginError = document.getElementById("login-error");

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

function showLogin() {
  loginScreen.style.display = "flex";
  appEl.style.display = "none";
}

function showApp() {
  loginScreen.style.display = "none";
  appEl.style.display = "block";
}

async function loadStats() {
  const res = await fetch("/api/gestion/stats");
  if (res.status === 401) {
    showLogin();
    return false;
  }
  if (!res.ok) return false;

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
  return true;
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
  if (res.status === 401) return showLogin();
  const data = await res.json().catch(() => ({}));
  msgEl.textContent = res.ok && data.ok ? "تم الحفظ بنجاح ✓" : (data.error || "فشل الحفظ");
  setTimeout(() => { msgEl.textContent = ""; }, 3000);
});

async function load() {
  const search = searchEl.value.trim();
  const res = await fetch(`/api/gestion/requests?search=${encodeURIComponent(search)}`);
  if (res.status === 401) {
    showLogin();
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

async function loadDashboard() {
  showApp();
  await load();
  await loadStats();
  await loadContactInfo();
}

rowsEl.addEventListener("change", async (e) => {
  if (e.target.tagName !== "SELECT") return;
  const id = e.target.dataset.id;
  const status = e.target.value;
  const res = await fetch(`/api/gestion/requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (res.status === 401) return showLogin();
  loadStats();
});

document.getElementById("refresh").addEventListener("click", () => {
  load();
  loadStats();
});

document.getElementById("logout").addEventListener("click", async () => {
  await fetch("/api/gestion/logout", { method: "POST" });
  showLogin();
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  const res = await fetch("/api/gestion/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));

  if (res.ok && data.ok) {
    document.getElementById("login-password").value = "";
    loadDashboard();
  } else {
    loginError.textContent = data.error || "فشل تسجيل الدخول.";
  }
});

let searchTimer;
searchEl.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(load, 300);
});

// On first load, try the dashboard directly — if there's still a valid
// session cookie from before, this skips the login screen entirely.
loadStats().then((ok) => {
  if (ok) loadDashboard();
});
