import { Star, Quote, User } from "lucide-react";
import { motion } from "framer-motion";
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
    <section className="py-32 px-6 bg-secondary relative overflow-hidden" id="testimonials">
      {/* Decorative background element for depth */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent opacity-10" />
      <Quote className="absolute -top-10 -left-10 w-64 h-64 text-white/5 -rotate-12 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <span className="inline-block px-6 py-2 rounded-full border-2 border-primary/20 bg-primary/10 text-primary font-black uppercase text-[10px] tracking-[0.4em] mb-8">
            {t("testimonials.badge")}
          </span>
          <h2 className="text-3xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
            {t("testimonials.title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 items-stretch">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col h-full"
            >
              <div className="relative flex-1 flex flex-col mb-8">
                {/* The "Frosted Glass" Style with h-full to match heights */}
                <div 
                  className="relative p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] shadow-2xl transition-all duration-500 group-hover:scale-[1.02] flex-1 flex flex-col justify-start"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "2px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <div className="flex gap-1 mb-6 shrink-0">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`w-4 h-4 ${j < t.rating ? "text-primary fill-primary" : "text-white/10"}`}
                      />
                    ))}
                  </div>
                  <p className="text-white/90 text-lg leading-relaxed font-bold italic">
                    "{t.text}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 px-4 shrink-0 mt-auto">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xl shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  {t.author[0]}
                </div>
                <div>
                  <h4 className="font-black text-white text-lg tracking-tight leading-none mb-1">{t.author}</h4>
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-black">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
