import { MessageCircle, Phone, MapPinCheck, ShieldCheck, Camera, Wallet } from "lucide-react";
import Button from "./ui/Button";
import { DEFAULT_WHATSAPP_MESSAGE } from "../lib/constants";
import { useContactInfo } from "../context/ContactInfoContext";
import { trackEvent } from "../lib/fbPixel";

const TRUST_BADGES = [
  { icon: MapPinCheck, label: "توصيل 58 ولاية" },
  { icon: ShieldCheck, label: "تأكيد قبل الشحن" },
  { icon: Camera, label: "صور القطعة قبل الإرسال" },
  { icon: Wallet, label: "دفع عند الاستلام متوفر حسب الطلب" },
];

export default function Hero() {
  const { telHref, whatsappHref } = useContactInfo();

  return (
    <section id="home" className="relative overflow-hidden bg-navy-900">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,122,26,0.4), transparent 40%), radial-gradient(circle at 80% 60%, rgba(36,82,156,0.6), transparent 45%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-orange-400 mb-5">
            لا تحتاج تبحث في السوق، نحن نبحث لك
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-white">
            ما لقيتش قطعة سيارتك في ولايتك؟
          </h1>
          <p className="mt-5 text-base sm:text-lg text-silver-200/90 leading-relaxed">
            أرسل لنا معلومات السيارة وصورة القطعة، ونحن نبحث لك عنها عند شبكة
            موردين ونرسلها لك بالتوصيل لجميع ولايات الجزائر.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Button
              href={whatsappHref(DEFAULT_WHATSAPP_MESSAGE)}
              variant="whatsapp"
              icon={MessageCircle}
              onClick={() => trackEvent("Contact", { method: "whatsapp" })}
              full
            >
              اطلب عبر واتساب
            </Button>
            <Button
              href={telHref}
              variant="primary"
              icon={Phone}
              onClick={() => trackEvent("Contact", { method: "call" })}
              full
            >
              اتصل الآن
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-3 py-4 text-center"
              >
                <Icon size={22} className="text-orange-400" strokeWidth={2.2} />
                <span className="text-xs sm:text-sm font-semibold text-silver-100">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
