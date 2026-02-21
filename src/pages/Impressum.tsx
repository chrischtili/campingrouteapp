import { Link } from "react-router-dom";
import { Footer } from "@/components/route-planner/Footer";
import { Navbar } from "@/components/route-planner/Navbar";
import { useTranslation } from "react-i18next";

export default function Impressum() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto bg-card rounded-xl shadow-lg p-8" id="home">
          <h1 className="text-2xl font-bold mb-6 text-center dark:text-foreground">{t("imprint.title")}</h1>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">{t("imprint.project.title")}</h2>
              <p>
                {t("imprint.project.description")}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">{t("imprint.contact.title")}</h2>
              <p>{t("imprint.contact.description")}</p>
              <p>{t("imprint.contact.name")}</p>
              <p>{t("imprint.contact.email")}</p>
              <p>GitHub: <a href="https://github.com/chrischtili/campingrouteapp" className="text-primary hover:underline">
                https://github.com/chrischtili/campingrouteapp
              </a></p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">{t("imprint.disclaimer.title")}</h2>
              <p className="text-sm">
                {t("imprint.disclaimer.description1")}
              </p>
              <p className="text-sm mt-2">
                {t("imprint.disclaimer.description2")}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">{t("imprint.openSource.title")}</h2>
              <p className="text-sm">
                {t("imprint.openSource.description1")}
              </p>
              <p className="text-sm mt-2">
                <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {t("imprint.openSource.link")}
                </a>
              </p>
            </section>

            <div className="mt-8 pt-4 border-t border-border text-center">
              <Link to="/" className="text-primary hover:underline">
                {t("imprint.backToHome")}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}