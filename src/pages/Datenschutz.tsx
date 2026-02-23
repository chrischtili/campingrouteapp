import { Link } from "react-router-dom";
import { Footer } from "@/components/route-planner/Footer";
import { Navbar } from "@/components/route-planner/Navbar";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Shield, Lock, EyeOff, Database, ArrowLeft } from "lucide-react";

export default function Datenschutz() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0a140f] text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Decorative background orb */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="text-center space-y-4 mb-16">
              <span className="inline-block px-6 py-2 rounded-full border-2 border-primary/20 bg-primary/10 text-primary font-black uppercase text-[10px] tracking-[0.4em]">
                {t("privacy.badge")}
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{t("privacy.title")}</h1>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* General */}
              <section className="p-10 rounded-[3rem] border-2 border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{t("privacy.general.title")}</h2>
                </div>
                <p className="text-white/60 leading-relaxed italic font-serif">
                  {t("privacy.general.description")}
                </p>
              </section>

              {/* Data Processing */}
              <section className="p-10 rounded-[3rem] border-2 border-white/10 bg-white/5 backdrop-blur-md shadow-2xl space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                    <Database className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{t("privacy.dataProcessing.title")}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h3 className="font-black text-primary uppercase text-sm tracking-widest">{t("privacy.dataProcessing.local.title")}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{t("privacy.dataProcessing.local.description")}</p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-black text-primary uppercase text-sm tracking-widest">{t("privacy.dataProcessing.ai.title")}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{t("privacy.dataProcessing.ai.description")}</p>
                  </div>
                </div>
              </section>

              {/* Cookies */}
              <section className="p-10 rounded-[3rem] border-2 border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                    <EyeOff className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{t("privacy.cookies.title")}</h2>
                </div>
                <div className="space-y-4 text-white/60 text-sm">
                  <p>{t("privacy.cookies.sidebar.description")}</p>
                  <p>{t("privacy.cookies.noTracking.description")}</p>
                </div>
              </section>

              {/* Hosting */}
              <section className="p-10 rounded-[3rem] border-2 border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{t("privacy.hosting.title")}</h2>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  {t("privacy.hosting.description")}
                </p>
              </section>

              {/* Rights */}
              <section className="p-10 rounded-[3rem] border-2 border-primary/20 bg-primary/5 shadow-2xl">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4">{t("privacy.rights.title")}</h2>
                <p className="text-white/70 leading-relaxed">
                  {t("privacy.rights.description")}
                </p>
              </section>
            </div>

            <div className="text-center pt-12">
              <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-primary transition-colors font-black uppercase text-[10px] tracking-widest group">
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
