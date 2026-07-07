import { useState } from "react";
import { Menu, X, Phone, Wrench } from "lucide-react";
import { useContactInfo } from "../context/ContactInfoContext";

const NAV_LINKS = [
  { label: "الرئيسية", href: "#home" },
  { label: "كيف تعمل الخدمة", href: "#how-it-works" },
  { label: "اطلب قطعة", href: "#request-form" },
  { label: "تواصل معنا", href: "#contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { telHref, phone } = useContactInfo();

  return (
    <header className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur border-b border-white/10 shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#home" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
            <Wrench size={22} className="text-white" strokeWidth={2.5} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-extrabold text-white">AutoDz Vip</span>
            <span className="mt-1 text-[11px] font-semibold text-orange-400">
              قطع غيار حسب الطلب
            </span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-silver-100 hover:text-orange-400 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <a
            href={telHref}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/30"
          >
            <Phone size={18} strokeWidth={2.5} />
            اتصل الآن
          </a>
        </div>

        <button
          className="md:hidden text-white p-1.5"
          onClick={() => setOpen((v) => !v)}
          aria-label="فتح القائمة"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-navy-900 px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-silver-100 hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <a
              href={telHref}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white"
            >
              <Phone size={18} strokeWidth={2.5} />
              اتصل الآن — {phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
