import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function TestimonialsSection() {
  const { t } = useTranslation();

  const testimonials = [
    {
      text: t("testimonials.markus.text"),
      author: "Markus",
      role: t("testimonials.markus.role"),
      rating: 5,
    },
    {
      text: t("testimonials.sarah.text"),
      author: "Sarah",
      role: t("testimonials.sarah.role"),
      rating: 5,
    },
    {
      text: t("testimonials.thomas.text"),
      author: "Thomas",
      role: t("testimonials.thomas.role"),
      rating: 4,
    },
  ];

  return (
    <section className="py-24 px-4 bg-[rgb(252,250,248)] dark:bg-gray-800" id="testimonials">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#F59B0A] font-semibold text-sm uppercase tracking-widest">
            {t("testimonials.badge")}
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mt-3">
            {t("testimonials.title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 bg-background"
            >
              <Quote className="w-8 h-8 text-[#F59B0A]/30 mb-4" />
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${j < t.rating ? "text-[#F59B0A] fill-[#F59B0A]" : "text-gray-300 dark:text-gray-400"}`}
                  />
                ))}
              </div>
              <p className="text-foreground/80 leading-relaxed mb-6 italic">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white dark:text-foreground font-bold text-sm bg-[rgb(50,110,89)] dark:bg-[rgb(80,140,119)]">
                  {t.author[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.author}</p>
                  <p className="text-muted-foreground text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
