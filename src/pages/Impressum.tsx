import { Link } from "react-router-dom";
import { Footer } from "@/components/ui/footer";

export default function Impressum() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto bg-card rounded-xl shadow-lg p-8" id="home">
        <h1 className="text-2xl font-bold mb-6 text-center">Über dieses Projekt</h1>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Privates Wohnmobil-Routenplaner-Projekt</h2>
            <p>
              Camping Route ist ein privates, nicht-kommerzielles Open-Source-Projekt zur Planung von Wohnmobil-Routen 
              mit Hilfe von KI. Die Webseite dient ausschließlich informativen und demonstrativen Zwecken.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Kontakt</h2>
            <p>Bei Fragen oder Feedback zum Projekt:</p>
            <p>Christian Kopmann</p>
            <p>E-Mail: info@campingroute.app</p>
            <p>GitHub: <a href="https://github.com/chrischtili/route-planner-pro" className="text-primary hover:underline">
              https://github.com/chrischtili/route-planner-pro
            </a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Haftungsausschluss</h2>
            <p className="text-sm">
              Die auf dieser Website bereitgestellten Informationen und Tools dienen ausschließlich zu Demonstrations- 
              und Informationszwecken. Es wird keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität der 
              Inhalte übernommen. Die Nutzung erfolgt auf eigenes Risiko.
            </p>
            <p className="text-sm mt-2">
              Externe Links führen zu Inhalten Dritter, für deren Inhalte wir keine Verantwortung übernehmen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Open Source & Mitwirkung</h2>
            <p className="text-sm">
              Dieses Projekt ist Open Source und steht unter der MIT-Lizenz. Der Quellcode ist auf GitHub verfügbar.
              Beiträge und Verbesserungsvorschläge sind willkommen!
            </p>
            <p className="text-sm mt-2">
              <a href="https://github.com/chrischtili/route-planner-pro" className="text-primary hover:underline">
                → Zum GitHub-Repository
              </a>
            </p>
          </section>

          <div className="mt-8 pt-4 border-t border-border text-center">
            <Link to="/" className="text-primary hover:underline">
              ← Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}