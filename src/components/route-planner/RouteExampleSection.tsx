import { MapPin, Clock, Euro, Wine, Landmark, ChevronRight } from "lucide-react";

const stages = [
  {
    from: "Karlsruhe",
    to: "Volkach",
    distance: "180 km",
    duration: "3h",
    highlight: "Fränkisches Weinland",
    icon: Wine,
    details: "Weinproben & historische Altstadt",
  },
  {
    from: "Volkach",
    to: "Naumburg",
    distance: "210 km",
    duration: "3h",
    highlight: "Thüringer Wald",
    icon: Landmark,
    details: "UNESCO-Weltkulturerbe Dom",
  },
  {
    from: "Naumburg",
    to: "Perleberg",
    distance: "230 km",
    duration: "3h",
    highlight: "Brandenburg erleben",
    icon: MapPin,
    details: "Historische Fachwerkstadt",
  },
];

export function RouteExampleSection() {
  return (
    <section id="example-route" className="py-24 px-4" style={{ backgroundColor: 'rgb(250, 244, 235)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#F59B0A] font-semibold text-sm uppercase tracking-widest">
            KI-Beispielroute
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-3">
            Karlsruhe → Perleberg
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            3 Tage • 620 km • Slow Travel mit Wein & Geschichte
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gray-200 md:-translate-x-px" />

          {stages.map((stage, i) => {
            const Icon = stage.icon;
            const isRight = i % 2 === 1;

            return (
              <div
                key={i}
                className={`relative flex items-start mb-12 last:mb-0 ${
                  isRight ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-6 md:left-1/2 w-3 h-3 rounded-full bg-[#F59B0A] border-4 border-white -translate-x-1.5 mt-6 z-10" />

                {/* Card */}
                <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${isRight ? "md:mr-auto md:ml-8" : "md:ml-auto md:mr-8"}`}>
                  <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-2 text-[#F59B0A] font-semibold text-xs uppercase tracking-wider mb-2">
                      <Icon className="w-4 h-4" />
                      Etappe {i + 1}
                    </div>
                    <h3 className="font-bold text-xl text-foreground mb-1">
                      {stage.from} <ChevronRight className="inline w-4 h-4 text-muted-foreground" /> {stage.to}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">{stage.highlight}</p>
                    <div className="flex gap-4 text-sm text-foreground/70">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {stage.distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {stage.duration}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground italic">
                      {stage.details}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-center gap-8 text-center">
          {[
            { label: "Gesamtstrecke", value: "620 km" },
            { label: "Reisedauer", value: "3 Tage" },
            { label: "Budget", value: "350–400€" },
            { label: "Stil", value: "Slow Travel" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
