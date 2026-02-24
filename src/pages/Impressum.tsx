import { Link } from "react-router-dom";
import { Footer } from "@/components/route-planner/Footer";
import { Navbar } from "@/components/route-planner/Navbar";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FileText, Mail, Github, Info, AlertTriangle, ArrowLeft } from "lucide-react";

export default function Impressum() {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0a140f] text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Decorative background orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/40 dark:from-black/30 dark:via-black/60 dark:to-black/80" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="text-center space-y-4 mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                  {t("imprint.badge")}
                </span>
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{t("imprint.title")}</h1>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Project Info */}
              <section className="p-10 rounded-[3rem] border-2 border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                    <Info className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{t("imprint.project.title")}</h2>
                </div>
                <p className="text-white/60 leading-relaxed text-lg italic font-serif">
                  {i18n.language === 'de' ? (
                    <>
                      Camping Route ist ein privates, nicht-kommerzielles <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline decoration-primary/30 underline-offset-4">Open-Source-Projekt</a> zur Planung von Wohnmobil-Routen mit Hilfe von KI. Die Webseite dient ausschließlich informativen und demonstrativen Zwecken.
                    </>
                  ) : (
                    <>
                      Camping Route is a private, non-commercial <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline decoration-primary/30 underline-offset-4">open-source project</a> for planning motorhome routes using AI. The website is for informational and demonstrative purposes only.
                    </>
                  )}
                </p>
              </section>

              {/* Contact */}
              <section className="p-10 rounded-[3rem] border-2 border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary border border-secondary/20">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{t("imprint.contact.title")}</h2>
                </div>
                <div className="space-y-4 text-white/80 font-bold">
                  <p className="text-xl">{t("imprint.contact.name")}</p>
                  <p className="flex items-center gap-3 text-primary">
                    <Mail className="w-5 h-5" />
                    {t("imprint.contact.email")}
                  </p>
                  <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-3 hover:text-primary transition-colors">
                    <Github className="w-5 h-5" />
                    <span>GitHub Repository</span>
                  </a>
                </div>
              </section>

              {/* Disclaimer */}
              <section className="p-10 rounded-[3rem] border-2 border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{t("imprint.disclaimer.title")}</h2>
                </div>
                <div className="space-y-4 text-white/60 leading-relaxed">
                  <p>{t("imprint.disclaimer.description1")}</p>
                  <p>{t("imprint.disclaimer.description2")}</p>
                </div>
              </section>

              {/* Open Source */}
              <section className="p-10 rounded-[3rem] border-2 border-primary/20 bg-primary/5 shadow-2xl">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-6">{t("imprint.openSource.title")}</h2>
                <p className="text-white/70 mb-8 leading-relaxed">
                  {t("imprint.openSource.description1")}
                </p>
                <a href="https://github.com/chrischtili/campingrouteapp" target="_blank" rel="noopener noreferrer" 
                   className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20">
                  <Github className="w-5 h-5" />
                  {t("imprint.openSource.link")}
                </a>
              </section>
            </div>

            <div className="text-center pt-12">
              <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-primary transition-colors font-black uppercase text-[10px] tracking-widest group">
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
