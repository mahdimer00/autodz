import { MessageCircle, Camera } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";
import Button from "./ui/Button";
import { useContactInfo } from "../context/ContactInfoContext";

const PARTS = [
  "Calculateur / ECU",
  "BSI / BCM",
  "Pompe ABS",
  "Turbo",
  "Injecteurs",
  "Capteurs",
  "Phares",
  "Pare-choc",
  "Moteur",
  "Boîte vitesse",
  "Pièces carrosserie",
  "Pièces voitures chinoises",
];

export default function SupportedParts() {
  const { whatsappHref } = useContactInfo();

  return (
    <section className="bg-silver-100 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading title="نبحث عن مختلف قطع الغيار" />

        <div className="flex flex-wrap justify-center gap-3">
          {PARTS.map((part) => (
            <span
              key={part}
              className="rounded-xl border border-silver-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-900 shadow-sm"
            >
              {part}
            </span>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl bg-white border border-silver-200 p-6 sm:p-8 text-center">
          <Camera size={30} className="text-orange-500" strokeWidth={2} />
          <p className="text-base sm:text-lg font-bold text-navy-900">
            إذا لم تجد القطعة في القائمة، أرسل لنا صورة وسنبحث عنها.
          </p>
          <Button
            href={whatsappHref("سلام، أريد أن أرسل صورة قطعة غيار أبحث عنها.")}
            variant="whatsapp"
            icon={MessageCircle}
          >
            أرسل صورة القطعة عبر واتساب
          </Button>
        </div>
      </div>
    </section>
  );
}
