import { Link } from "react-router-dom";

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto bg-card rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Datenschutzerklärung</h1>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Allgemeines</h2>
            <p className="text-sm">
              Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und Zweck der Verarbeitung von 
              personenbezogenen Daten im Rahmen der Nutzung unseres Wohnmobil-Routenplaners.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Verantwortlicher</h2>
            <p className="text-sm">
              Christian Kopmann<br/>
              E-Mail: info@campingroute.app
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Datenverarbeitung</h2>
            <p className="text-sm">
              <strong>Lokale Datenverarbeitung:</strong> Alle von Ihnen eingegebenen Daten (Reiserouten, Fahrzeugdaten, 
              Präferenzen) werden ausschließlich in Ihrem Browser gespeichert und nicht an unsere Server übertragen. 
              Die Daten bleiben auf Ihrem Gerät und werden gelöscht, wenn Sie den Browser-Cache leeren.
            </p>
            <p className="text-sm mt-2">
              <strong>KI-Integration:</strong> Wenn Sie die direkte KI-Funktion nutzen, werden Ihre Daten an den von 
              Ihnen konfigurierten KI-Dienst (z.B. OpenAI, Mistral) übermittelt. Wir haben keinen Zugriff auf diese 
              Daten und speichern sie nicht.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Cookies & Tracking</h2>
            <p className="text-sm">
              Diese Website verwendet keine Tracking-Cookies oder Analysetools. Es werden keine personenbezogenen 
              Daten für Werbezwecke gesammelt oder an Dritte weitergegeben.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Ihre Rechte</h2>
            <p className="text-sm">
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer 
              personenbezogenen Daten. Da wir keine Daten speichern, können Sie alle Ihre Daten einfach durch 
              Löschen des Browser-Caches entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Änderungen dieser Datenschutzerklärung</h2>
            <p className="text-sm">
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen oder 
              bei Änderungen des Dienstes anzupassen. Die aktuelle Version ist immer auf dieser Seite einsehbar.
            </p>
          </section>

          <div className="mt-8 pt-4 border-t border-border text-center">
            <Link to="/" className="text-primary hover:underline">
              ← Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}