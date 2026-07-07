const VARIANTS = {
  primary:
    "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30",
  whatsapp:
    "bg-[#25D366] hover:bg-[#1fb959] text-white shadow-lg shadow-green-600/30",
  outline:
    "bg-white hover:bg-silver-100 text-navy-900 border-2 border-navy-900",
  ghost:
    "bg-navy-900/5 hover:bg-navy-900/10 text-navy-900",
};

export default function Button({
  as = "a",
  href,
  onClick,
  type = "button",
  variant = "primary",
  icon: Icon,
  children,
  className = "",
  full = false,
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold transition-all duration-200 active:scale-95 ${
    full ? "w-full" : ""
  } ${VARIANTS[variant]} ${className}`;

  if (as === "a") {
    return (
      <a href={href} onClick={onClick} className={classes} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
        {Icon && <Icon size={20} strokeWidth={2.5} />}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {Icon && <Icon size={20} strokeWidth={2.5} />}
      <span>{children}</span>
    </button>
  );
}
