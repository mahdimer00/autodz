import { MessageSquareText, Search, Tags, ShieldCheck, Truck } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";

const STEPS = [
  {
    icon: MessageSquareText,
    title: "ترسل لنا معلومات السيارة والقطعة",
  },
  {
    icon: Search,
    title: "نبحث عنها عند الموردين",
  },
  {
    icon: Tags,
    title: "نرسل لك السعر والصور",
  },
  {
    icon: ShieldCheck,
    title: "نؤكد التوافق قبل الشحن",
  },
  {
    icon: Truck,
    title: "نرسلها لك بالتوصيل",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="خطوات بسيطة" title="كيف تعمل الخدمة؟" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map(({ icon: Icon, title }, i) => (
            <div
              key={title}
              className="relative flex flex-col items-center gap-3 rounded-2xl border border-silver-200 bg-silver-50 p-6 text-center transition-transform hover:-translate-y-1"
            >
              <span className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-extrabold text-white shadow-md">
                {i + 1}
              </span>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900">
                <Icon size={26} className="text-orange-400" strokeWidth={2.2} />
              </span>
              <p className="text-sm font-bold text-navy-900 leading-snug">
                {title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
