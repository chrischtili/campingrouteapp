import { Link } from "react-router-dom";
import { Footer } from "@/components/route-planner/Footer";
import { Navbar } from "@/components/route-planner/Navbar";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Shield, Lock, EyeOff, Database, ArrowLeft } from "lucide-react";

export default function Datenschutz() {
  const { t } = useTranslation();

  return (
    <div className="legal-page min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Decorative background orb */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/5 via-transparent to-black/10 dark:from-black/30 dark:via-black/60 dark:to-black/80" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="text-center space-y-4 mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/12 border border-primary/20 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-primary" />
                <span className="text-primary font-semibold text-[10px] tracking-[0.08em]">
                  {t("privacy.badge")}
                </span>
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter">{t("privacy.title")}</h1>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* General */}
              <section className="legal-card p-10 rounded-[3rem] border-2 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight">{t("privacy.general.title")}</h2>
                </div>
                <p className="text-foreground/68 dark:text-white/65 leading-relaxed text-base italic font-serif">
                  {t("privacy.general.description")}
                </p>
              </section>

              {/* Data Processing */}
              <section className="legal-card p-10 rounded-[3rem] border-2 backdrop-blur-md shadow-2xl space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight">{t("privacy.dataProcessing.title")}</h2>
                </div>
                
                <div className="space-y-5">
                  <div className="rounded-[1.75rem] border border-black/6 bg-black/[0.02] px-6 py-5 dark:border-white/8 dark:bg-white/[0.03]">
                    <h3 className="font-semibold text-primary text-sm tracking-[0.04em]">{t("privacy.dataProcessing.local.title")}</h3>
                    <p className="mt-3 max-w-3xl text-foreground/68 dark:text-white/60 text-sm leading-7">{t("privacy.dataProcessing.local.description")}</p>
                  </div>
                  <div className="rounded-[1.75rem] border border-black/6 bg-black/[0.02] px-6 py-5 dark:border-white/8 dark:bg-white/[0.03]">
                    <h3 className="font-semibold text-primary text-sm tracking-[0.04em]">{t("privacy.dataProcessing.ai.title")}</h3>
                    <p className="mt-3 max-w-3xl text-foreground/68 dark:text-white/60 text-sm leading-7">{t("privacy.dataProcessing.ai.description")}</p>
                  </div>
                  <div className="rounded-[1.75rem] border border-black/6 bg-black/[0.02] px-6 py-5 dark:border-white/8 dark:bg-white/[0.03]">
                    <h3 className="font-semibold text-primary text-sm tracking-[0.04em]">{t("privacy.dataProcessing.places.title")}</h3>
                    <p className="mt-3 max-w-3xl text-foreground/68 dark:text-white/60 text-sm leading-7">{t("privacy.dataProcessing.places.description")}</p>
                  </div>
                  <div className="rounded-[1.75rem] border border-black/6 bg-black/[0.02] px-6 py-5 dark:border-white/8 dark:bg-white/[0.03]">
                    <h3 className="font-semibold text-primary text-sm tracking-[0.04em]">{t("privacy.dataProcessing.feedback.title")}</h3>
                    <p className="mt-3 max-w-3xl text-foreground/68 dark:text-white/60 text-sm leading-7">{t("privacy.dataProcessing.feedback.description")}</p>
                  </div>
                </div>
              </section>

              {/* Cookies */}
              <section className="legal-card p-10 rounded-[3rem] border-2 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/5 flex items-center justify-center text-foreground/40 dark:text-white/40">
                    <EyeOff className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight">{t("privacy.cookies.title")}</h2>
                </div>
                <div className="space-y-4 text-foreground/62 dark:text-white/60 text-sm">
                  <p>{t("privacy.cookies.sidebar.description")}</p>
                  <p>{t("privacy.cookies.noTracking.description")}</p>
                </div>
              </section>

              {/* Hosting */}
              <section className="legal-card p-10 rounded-[3rem] border-2 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight">{t("privacy.hosting.title")}</h2>
                </div>
                <p className="text-foreground/62 dark:text-white/60 text-sm leading-relaxed">
                  {t("privacy.hosting.description")}
                </p>
              </section>

              {/* Rights */}
              <section className="p-10 rounded-[3rem] border-2 border-primary/20 bg-primary/8 dark:bg-primary/5 shadow-2xl">
                <h2 className="text-xl md:text-2xl font-black tracking-tight mb-4">{t("privacy.rights.title")}</h2>
                <p className="text-foreground/72 dark:text-white/70 leading-relaxed">
                  {t("privacy.rights.description")}
                </p>
              </section>
            </div>

            <div className="text-center pt-12">
              <Link to="/" className="inline-flex items-center gap-2 text-foreground/40 dark:text-white/40 hover:text-primary transition-colors font-semibold text-[11px] tracking-[0.03em] group">
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
