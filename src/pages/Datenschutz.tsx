import { Link } from "react-router-dom";
import { Footer } from "@/components/route-planner/Footer";
import { Navbar } from "@/components/route-planner/Navbar";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Shield, Lock, EyeOff, Database, ArrowLeft } from "lucide-react";

export default function Datenschutz() {
  const { t } = useTranslation();

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
                {t("privacy.badge")}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground dark:text-white">
                {t("privacy.title")}
              </h1>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-8">
              {/* General */}
              <section className="rounded-3xl border border-gray-200/80 bg-white p-7 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground dark:text-white">
                    {t("privacy.general.title")}
                  </h2>
                </div>
                <p className="text-foreground/70 dark:text-white/70 leading-relaxed text-sm sm:text-base">
                  {t("privacy.general.description")}
                </p>
              </section>

              {/* Data Processing */}
              <section className="rounded-3xl border border-gray-200/80 bg-white p-7 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground dark:text-white">
                    {t("privacy.dataProcessing.title")}
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/50">
                    <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{t("privacy.dataProcessing.local.title")}</h3>
                    <p className="mt-2 text-foreground/70 dark:text-white/60 text-xs sm:text-sm leading-relaxed">{t("privacy.dataProcessing.local.description")}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/50">
                    <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{t("privacy.dataProcessing.ai.title")}</h3>
                    <p className="mt-2 text-foreground/70 dark:text-white/60 text-xs sm:text-sm leading-relaxed">{t("privacy.dataProcessing.ai.description")}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/50">
                    <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{t("privacy.dataProcessing.places.title")}</h3>
                    <p className="mt-2 text-foreground/70 dark:text-white/60 text-xs sm:text-sm leading-relaxed">{t("privacy.dataProcessing.places.description")}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/50">
                    <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{t("privacy.dataProcessing.feedback.title")}</h3>
                    <p className="mt-2 text-foreground/70 dark:text-white/60 text-xs sm:text-sm leading-relaxed">{t("privacy.dataProcessing.feedback.description")}</p>
                  </div>
                </div>
              </section>

              {/* Cookies */}
              <section className="rounded-3xl border border-gray-200/80 bg-white p-7 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground dark:text-white">
                    {t("privacy.cookies.title")}
                  </h2>
                </div>
                <div className="space-y-3 text-foreground/70 dark:text-white/60 text-xs sm:text-sm leading-relaxed">
                  <p>{t("privacy.cookies.sidebar.description")}</p>
                  <p>{t("privacy.cookies.noTracking.description")}</p>
                </div>
              </section>

              {/* Hosting */}
              <section className="rounded-3xl border border-gray-200/80 bg-white p-7 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground dark:text-white">
                    {t("privacy.hosting.title")}
                  </h2>
                </div>
                <p className="text-foreground/70 dark:text-white/60 text-xs sm:text-sm leading-relaxed">
                  {t("privacy.hosting.description")}
                </p>
              </section>

              {/* Rights */}
              <section className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-7 sm:p-8 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-emerald-900 dark:text-emerald-300 mb-3">
                  {t("privacy.rights.title")}
                </h2>
                <p className="text-emerald-800/80 dark:text-emerald-200/70 text-xs sm:text-sm leading-relaxed">
                  {t("privacy.rights.description")}
                </p>
              </section>
            </div>

            <div className="text-center pt-8">
              <Link to="/" className="inline-flex items-center gap-2 text-foreground/60 dark:text-white/60 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-semibold text-xs group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {t("privacy.backToHome")}
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
