import { useEffect, useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { WILAYAS } from "../lib/constants";
import { getFormToken, submitRequest } from "../lib/api";
import { trackEvent } from "../lib/fbPixel";

const CONDITIONS = ["جديدة", "مستعملة", "أي خيار متوفر"];

const initialState = {
  name: "",
  phone: "",
  wilaya: "",
  car: "",
  year: "",
  engine: "",
  part: "",
  condition: "",
  notes: "",
  website: "", // honeypot: must stay empty
};

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-right">
      <span className="text-sm font-bold text-navy-900">{label}</span>
      {children}
    </label>
  );
}

const inputClasses =
  "w-full rounded-xl border border-silver-300 bg-white px-4 py-3 text-sm text-navy-950 placeholder:text-navy-700/40 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20";

export default function RequestForm() {
  const [form, setForm] = useState(initialState);
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getFormToken()
      .then(setToken)
      .catch(() => setToken(null));
  }, []);

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setErrorMessage("");

    try {
      await submitRequest({ ...form, token });

      trackEvent("Lead", { content_name: "car_part_request" });
      setStatus("success");
      setForm(initialState);
      getFormToken().then(setToken).catch(() => setToken(null));
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err.message && err.message !== "submit_failed"
          ? err.message
          : "تعذر إرسال الطلب، حاول مرة أخرى أو اتصل بنا مباشرة.",
      );
    }
  };

  return (
    <section id="request-form" className="bg-silver-100 py-14 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
            اطلب قطعة سيارتك بسهولة
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-5 sm:p-8 shadow-xl shadow-navy-900/5 border border-silver-200"
        >
          {/* Honeypot field: hidden from real users, only bots fill it in */}
          <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden">
            <label>
              لا تملأ هذا الحقل
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={update("website")}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="الاسم">
              <input
                required
                value={form.name}
                onChange={update("name")}
                placeholder="مثال: أحمد بن علي"
                className={inputClasses}
              />
            </Field>

            <Field label="رقم الهاتف">
              <input
                required
                type="tel"
                value={form.phone}
                onChange={update("phone")}
                placeholder="0770589042"
                className={inputClasses}
              />
            </Field>

            <Field label="الولاية">
              <select
                required
                value={form.wilaya}
                onChange={update("wilaya")}
                className={inputClasses}
              >
                <option value="" disabled>
                  اختر ولايتك
                </option>
                {WILAYAS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="نوع السيارة">
              <input
                required
                value={form.car}
                onChange={update("car")}
                placeholder="Renault Clio 4"
                className={inputClasses}
              />
            </Field>

            <Field label="سنة السيارة">
              <input
                value={form.year}
                onChange={update("year")}
                placeholder="2016"
                className={inputClasses}
              />
            </Field>

            <Field label="نوع المحرك">
              <input
                value={form.engine}
                onChange={update("engine")}
                placeholder="1.5 dCi"
                className={inputClasses}
              />
            </Field>

            <Field label="اسم القطعة المطلوبة">
              <input
                required
                value={form.part}
                onChange={update("part")}
                placeholder="Pompe ABS / Phare / Calculateur"
                className={inputClasses}
              />
            </Field>

            <Field label="الحالة المطلوبة">
              <select
                value={form.condition}
                onChange={update("condition")}
                className={inputClasses}
              >
                <option value="" disabled>
                  اختر الحالة
                </option>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-4">
            <Field label="ملاحظات إضافية">
              <textarea
                rows={3}
                value={form.notes}
                onChange={update("notes")}
                placeholder="أي تفاصيل إضافية تساعدنا في البحث..."
                className={inputClasses}
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/30 transition-all active:scale-95 hover:bg-orange-600 disabled:opacity-60 disabled:active:scale-100"
          >
            {status === "sending" ? (
              <>
                <Loader2 size={20} strokeWidth={2.5} className="animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send size={20} strokeWidth={2.5} />
                إرسال الطلب
              </>
            )}
          </button>

          {status === "success" && (
            <p className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-green-700">
              <CheckCircle2 size={18} />
              تم استلام طلبك بنجاح، سنتواصل معك قريباً.
            </p>
          )}

          {status === "error" && (
            <p className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-red-600">
              <AlertCircle size={18} />
              {errorMessage}
            </p>
          )}

          <p className="mt-4 text-center text-sm text-navy-700/70">
            كلما أرسلت معلومات أكثر، زادت فرصة إيجاد القطعة الصحيحة بسرعة.
          </p>
        </form>
      </div>
    </section>
  );
}
