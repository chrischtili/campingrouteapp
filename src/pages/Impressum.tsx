import { Link } from "react-router-dom";
import { Footer } from "@/components/route-planner/Footer";
import { Navbar } from "@/components/route-planner/Navbar";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Mail, Github, Info, AlertTriangle, ArrowLeft } from "lucide-react";

export default function Impressum() {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground dark:text-white transition-colors">
      <Navbar />
      
      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="text-center space-y-3 mb-10">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                <span className="flex h-2 w-2 rounded-full bg-emerald-600" />
                {t("imprint.badge")}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground dark:text-white">
                {t("imprint.title")}
              </h1>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-8">
              {/* Project Info */}
              <section className="rounded-3xl border border-gray-200/80 bg-white p-7 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                    <Info className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground dark:text-white">
                    {t("imprint.project.title")}
                  </h2>
                </div>
                <p className="text-foreground/70 dark:text-white/70 leading-relaxed text-sm sm:text-base">
                  {i18n.language === 'de' ? (
                    <>
                      Camping Route ist ein privates, nicht-kommerzielles <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">Open-Source-Projekt</a> zur Planung von Wohnmobil-Routen mit Hilfe von KI. Die Webseite dient ausschließlich informativen und demonstrativen Zwecken.
                    </>
                  ) : i18n.language === 'nl' ? (
                    <>
                      Camping Route is een privé, niet‑commercieel <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">open‑sourceproject</a> voor het plannen van camperroutes met AI. De website is uitsluitend bedoeld voor informatieve en demonstratieve doeleinden.
                    </>
                  ) : i18n.language === 'fr' ? (
                    <>
                      Camping Route est un <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">projet open source</a> privé et non commercial pour planifier des itinéraires en camping‑car avec l’IA. Le site est destiné uniquement à des fins informatives et démonstratives.
                    </>
                  ) : i18n.language === 'it' ? (
                    <>
                      Camping Route è un <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">progetto open‑source</a> privato e non commerciale per pianificare itinerari in camper con l’IA. Il sito è destinato esclusivamente a scopi informativi e dimostrativi.
                    </>
                  ) : (
                    <>
                      Camping Route is a private, non-commercial <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">open-source project</a> for planning motorhome routes using AI. The website is for informational and demonstrative purposes only.
                    </>
                  )}
                </p>
              </section>

              {/* Contact */}
              <section className="rounded-3xl border border-gray-200/80 bg-white p-7 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground dark:text-white">
                    {t("imprint.contact.title")}
                  </h2>
                </div>
                <div className="space-y-3 text-foreground/80 dark:text-white/80 text-sm font-medium">
                  <p className="text-base font-bold text-foreground dark:text-white">{t("imprint.contact.name")}</p>
                  <p className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400">
                    <Mail className="w-4 h-4" />
                    {t("imprint.contact.email")}
                  </p>
                  <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" rel="noopener noreferrer" 
                     className="inline-flex items-center gap-2 text-foreground/70 dark:text-white/70 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                    <Github className="w-4 h-4" />
                    <span>GitHub Repository</span>
                  </a>
                </div>
              </section>

              {/* Disclaimer */}
              <section className="rounded-3xl border border-gray-200/80 bg-white p-7 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100/70 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground dark:text-white">
                    {t("imprint.disclaimer.title")}
                  </h2>
                </div>
                <div className="space-y-3 text-foreground/70 dark:text-white/60 text-xs sm:text-sm leading-relaxed">
                  <p>{t("imprint.disclaimer.description1")}</p>
                  <p>{t("imprint.disclaimer.description2")}</p>
                </div>
              </section>

              {/* Open Source */}
              <section className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-7 sm:p-8 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-300 mb-3">
                  {t("imprint.openSource.title")}
                </h2>
                <p className="text-emerald-800/80 dark:text-emerald-200/70 text-xs sm:text-sm leading-relaxed mb-6">
                  {t("imprint.openSource.description1")}
                </p>
                <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" rel="noopener noreferrer" 
                   className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 text-white font-semibold text-xs tracking-wider hover:bg-emerald-800 transition-all shadow-sm">
                  <Github className="w-4 h-4" />
                  {t("imprint.openSource.link")}
                </a>
              </section>
            </div>

            <div className="text-center pt-8">
              <Link to="/" className="inline-flex items-center gap-2 text-foreground/60 dark:text-white/60 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-semibold text-xs group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {t("imprint.backToHome")}
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
