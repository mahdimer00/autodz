import { Wrench, Phone } from "lucide-react";
import { useContactInfo } from "../context/ContactInfoContext";

const QUICK_LINKS = [
  { label: "الرئيسية", href: "#home" },
  { label: "كيف تعمل الخدمة", href: "#how-it-works" },
  { label: "اطلب قطعة", href: "#request-form" },
  { label: "تواصل معنا", href: "#contact" },
];

export default function Footer() {
  const { telHref, phone } = useContactInfo();

  return (
    <footer className="bg-navy-950 pb-28 pt-12 sm:pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-right max-w-sm">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500">
                <Wrench size={18} className="text-white" strokeWidth={2.5} />
              </span>
              <span className="text-lg font-extrabold text-white">AutoDz Vip</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-silver-300/70">
              AutoDz Vip — خدمة توفير قطع غيار السيارات حسب الطلب في الجزائر.
              توصيل متوفر لجميع الولايات.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-silver-200/90">
            {QUICK_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-orange-400 transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          <a
            href={telHref}
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
          >
            <Phone size={18} className="text-orange-400" strokeWidth={2.5} />
            {phone}
          </a>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-silver-300/50">
          © {new Date().getFullYear()} AutoDz Vip. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
