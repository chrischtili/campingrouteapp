import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    text: "Endlich ein Routenplaner, der wirklich auf meine Bedürfnisse eingeht! Die KI hat mir eine perfekte Route mit tollen Stellplätzen vorgeschlagen.",
    author: "Markus",
    role: "Wohnmobil-Reisender",
    rating: 5,
  },
  {
    text: "Die Filteroptionen sind genial! Ich kann nach Budget, Interessen und sogar Fahrzeuggröße filtern – das spart so viel Zeit!",
    author: "Sarah",
    role: "Camperin",
    rating: 5,
  },
  {
    text: "Perfekt für spontane Trips! Innerhalb von Minuten hatte ich eine detaillierte Route mit allen wichtigen Infos.",
    author: "Thomas",
    role: "Wochenend-Camper",
    rating: 4,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4" style={{ backgroundColor: 'rgb(252, 250, 248)' }} id="testimonials">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#F59B0A] font-semibold text-sm uppercase tracking-widest">
            Erfahrungen
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-3">
            Von Campern geliebt
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="relative rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300" style={{ backgroundColor: 'rgb(250, 248, 245)' }}
            >
              <Quote className="w-8 h-8 text-[#F59B0A]/30 mb-4" />
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${j < t.rating ? "text-[#F59B0A] fill-[#F59B0A]" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-foreground/80 leading-relaxed mb-6 italic">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: 'rgb(50, 110, 89)' }}>
                  {t.author[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.author}</p>
                  <p className="text-muted-foreground text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
