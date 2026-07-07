import { Phone, MessageCircle, Mail } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Button from "./ui/Button";
import { DEFAULT_WHATSAPP_MESSAGE } from "../lib/constants";
import { useContactInfo } from "../context/ContactInfoContext";
import { trackEvent } from "../lib/fbPixel";

function TiktokIcon({ size = 24, className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
      <path d="M16.6 5.82a4.28 4.28 0 0 1-3.14-1.4A4.24 4.24 0 0 1 12.4 2h-3.1v13.7a2.6 2.6 0 1 1-1.85-2.49v-3.16a5.75 5.75 0 1 0 4.95 5.7V9.02a7.4 7.4 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-.1-1.48Z" />
    </svg>
  );
}

function FacebookIcon({ size = 24, className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
      <path d="M13.5 21v-7.6h2.55l.38-2.96h-2.93V8.55c0-.86.24-1.44 1.47-1.44h1.57V4.46A21 21 0 0 0 14.2 4.3c-2.24 0-3.78 1.37-3.78 3.87v2.27H7.85v2.96h2.57V21h3.08Z" />
    </svg>
  );
}

function InstagramIcon({ size = 24, className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={size} height={size} className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Contact() {
  const { phone, email, facebook, instagram, tiktok, telHref, emailHref, whatsappHref } =
    useContactInfo();

  const cards = [
    {
      icon: Phone,
      title: "اتصال مباشر",
      value: phone,
      button: "اتصل الآن",
      href: telHref,
      variant: "primary",
      pixelMethod: "call",
    },
    {
      icon: MessageCircle,
      title: "واتساب",
      value: phone,
      button: "راسلنا في واتساب",
      href: whatsappHref(DEFAULT_WHATSAPP_MESSAGE),
      variant: "whatsapp",
      pixelMethod: "whatsapp",
    },
    {
      icon: FacebookIcon,
      title: "فيسبوك",
      value: "AutoDz Vip",
      button: "زيارة الصفحة",
      href: facebook,
      variant: "outline",
    },
    {
      icon: InstagramIcon,
      title: "إنستغرام",
      value: "@autodzvip",
      button: "Instagram",
      href: instagram,
      variant: "outline",
    },
    {
      icon: TiktokIcon,
      title: "تيك توك",
      value: "@autodzvip",
      button: "TikTok",
      href: tiktok,
      variant: "outline",
    },
    {
      icon: Mail,
      title: "البريد الإلكتروني",
      value: email,
      button: "إرسال Email",
      href: emailHref,
      variant: "outline",
    },
  ];

  return (
    <section id="contact" className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="نحن هنا لمساعدتك"
          title="تواصل معنا الآن"
          subtitle="اختر الطريقة الأسهل بالنسبة لك، ونحن نرد بسرعة."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ icon: Icon, title, value, button, href, variant, pixelMethod }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 rounded-2xl border border-silver-200 bg-silver-50 p-6 text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900">
                <Icon size={24} className="text-orange-400" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-sm font-bold text-navy-900">{title}</p>
                <p dir="ltr" className="text-sm text-navy-700/70">{value}</p>
              </div>
              <Button
                href={href}
                variant={variant}
                full
                onClick={pixelMethod ? () => trackEvent("Contact", { method: pixelMethod }) : undefined}
              >
                {button}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
