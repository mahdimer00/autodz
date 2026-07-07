export default function SectionHeading({ eyebrow, title, subtitle, center = true, dark = false }) {
  return (
    <div className={`mb-10 ${center ? "text-center" : ""}`}>
      {eyebrow && (
        <span
          className={`inline-block rounded-full px-4 py-1.5 text-sm font-bold mb-3 ${
            dark ? "bg-orange-500/15 text-orange-400" : "bg-orange-500/10 text-orange-600"
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug ${
          dark ? "text-white" : "text-navy-900"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-base sm:text-lg max-w-2xl mx-auto ${
            dark ? "text-silver-200/80" : "text-navy-700/80"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
