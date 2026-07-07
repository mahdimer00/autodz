import { MessageCircle, Phone } from "lucide-react";
import { DEFAULT_WHATSAPP_MESSAGE } from "../lib/constants";
import { useContactInfo } from "../context/ContactInfoContext";
import { trackEvent } from "../lib/fbPixel";

export default function FloatingButtons() {
  const { telHref, whatsappHref } = useContactInfo();

  return (
    <>
      <a
        href={whatsappHref(DEFAULT_WHATSAPP_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="راسلنا في واتساب"
        onClick={() => trackEvent("Contact", { method: "whatsapp" })}
        className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-green-900/40 animate-float active:scale-95 transition-transform"
      >
        <MessageCircle size={30} strokeWidth={2.2} />
      </a>

      <a
        href={telHref}
        aria-label="اتصال"
        onClick={() => trackEvent("Contact", { method: "call" })}
        className="fixed bottom-5 left-5 z-50 flex md:hidden items-center gap-2 rounded-full bg-orange-500 pl-5 pr-4 py-4 text-white shadow-2xl shadow-orange-900/40 active:scale-95 transition-transform"
      >
        <Phone size={22} strokeWidth={2.4} />
        <span className="text-sm font-extrabold">اتصال</span>
      </a>
    </>
  );
}
