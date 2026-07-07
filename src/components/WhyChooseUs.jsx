import { Clock, Network, ImageIcon, Truck, ListChecks, Puzzle } from "lucide-react";
import SectionHeading from "./ui/SectionHeading";

const REASONS = [
  { icon: Clock, title: "نبحث لك بدل ما تضيع وقتك" },
  { icon: Network, title: "شبكة موردين من عدة ولايات" },
  { icon: ImageIcon, title: "صور وسعر قبل التأكيد" },
  { icon: Truck, title: "توصيل لجميع ولايات الجزائر" },
  { icon: ListChecks, title: "متابعة الطلب حتى التسليم" },
  { icon: Puzzle, title: "مناسب للقطع النادرة والصعبة" },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-navy-900 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="ثقة أكثر من ألف عميل"
          title="لماذا تختار AutoDz Vip؟"
          dark
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map(({ icon: Icon, title }) => (
            <div
              key={title}
              className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/20">
                <Icon size={22} className="text-orange-400" strokeWidth={2.2} />
              </span>
              <p className="text-sm sm:text-base font-bold text-white leading-snug">
                {title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
