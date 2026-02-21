import { Link } from "react-router-dom";
import { Footer } from "@/components/route-planner/Footer";
import { Navbar } from "@/components/route-planner/Navbar";
import { useTranslation } from "react-i18next";

export default function Datenschutz() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto bg-card rounded-xl shadow-lg p-8" id="home">
          <h1 className="text-2xl font-bold mb-6 text-center dark:text-foreground">{t("privacy.title")}</h1>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">{t("privacy.general.title")}</h2>
              <p className="text-sm">
                {t("privacy.general.description")}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">{t("privacy.responsible.title")}</h2>
              <p className="text-sm">
                {t("privacy.responsible.name")}<br/>
                {t("privacy.responsible.email")}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">{t("privacy.dataProcessing.title")}</h2>
              <p className="text-sm">
                <strong>{t("privacy.dataProcessing.local.title")}</strong> {t("privacy.dataProcessing.local.description")}
              </p>
              <p className="text-sm mt-2">
                <strong>{t("privacy.dataProcessing.fonts.title")}</strong> {t("privacy.dataProcessing.fonts.description")}
              </p>
              <p className="text-sm mt-2">
                <strong>{t("privacy.dataProcessing.ai.title")}</strong> {t("privacy.dataProcessing.ai.description")}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">{t("privacy.cookies.title")}</h2>
              <p className="text-sm">
                {t("privacy.cookies.sidebar.description")}
              </p>
              <p className="text-sm mt-2">
                {t("privacy.cookies.noTracking.description")}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">{t("privacy.rights.title")}</h2>
              <p className="text-sm">
                {t("privacy.rights.description")}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">{t("privacy.changes.title")}</h2>
              <p className="text-sm">
                {t("privacy.changes.description")}
              </p>
            </section>

            <div className="mt-8 pt-4 border-t border-border text-center">
              <Link to="/" className="text-primary hover:underline">
                {t("privacy.backToHome")}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}