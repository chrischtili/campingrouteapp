import { Star, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

export function TestimonialsSection() {
  const { t } = useTranslation();

  const testimonials = [
    {
      text: t("testimonials.julia.text"),
      author: t("testimonials.julia.name"),
      role: t("testimonials.julia.role"),
      rating: 5,
    },
    {
      text: t("testimonials.markus.text"),
      author: t("testimonials.markus.name"),
      role: t("testimonials.markus.role"),
      rating: 5,
    },
    {
      text: t("testimonials.sarah.text"),
      author: t("testimonials.sarah.name"),
      role: t("testimonials.sarah.role"),
      rating: 5,
    },
  ];

  return (
    <section className="pt-20 pb-16 sm:py-32 px-6 bg-background relative overflow-hidden" id="testimonials">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(8,10,12,0.98),rgba(11,13,15,0.98))]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/25" />
      <Quote className="absolute -top-10 -left-10 w-64 h-64 text-white/[0.03] -rotate-12 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md mb-8 reveal-once">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em]">
              {t("testimonials.badge")}
            </span>
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.95] reveal-once delay-1">
            {t("testimonials.title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 items-stretch">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="group flex flex-col h-full reveal-once"
              style={{ animationDelay: `${Math.min(i, 4) * 0.08}s` }}
            >
              <div className="relative flex-1 flex flex-col">
                <div
                  className="relative p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] shadow-2xl transition-all duration-500 group-hover:scale-[1.02] flex-1 flex flex-col justify-between"
                  style={{
                    background: "linear-gradient(180deg, rgba(31,33,37,0.94), rgba(24,26,30,0.97))",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.10)",
                    boxShadow: "0 22px 48px rgba(0,0,0,0.22)",
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 rounded-3xl sm:rounded-[3rem] border border-primary/0 opacity-0 transition-all duration-500 group-hover:border-primary/22 group-hover:opacity-100" />
                  <div>
                    <div className="flex gap-1 mb-6 shrink-0">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`w-4 h-4 ${j < t.rating ? "text-primary fill-primary" : "text-white/10"}`}
                        />
                      ))}
                    </div>
                    <p className="text-white/82 text-sm sm:text-[0.94rem] leading-7 font-medium italic">
                      "{t.text}"
                    </p>
                  </div>
                  <div className="mt-8 flex items-center gap-4 pt-6 border-t border-white/10">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xl shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      {t.author[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-[0.95rem] sm:text-[1.08rem] tracking-tight leading-none mb-1">{t.author}</h4>
                      <p className="text-white/38 text-[9px] uppercase tracking-[0.18em] font-black">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
