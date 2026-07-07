const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function getFormToken() {
  const res = await fetch(`${API_BASE}/api/form-token`);
  if (!res.ok) throw new Error("token_failed");
  const data = await res.json();
  return data.token;
}

export async function submitRequest(payload) {
  const res = await fetch(`${API_BASE}/api/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.ok) {
    throw new Error(data.error || "submit_failed");
  }

  return data;
}
