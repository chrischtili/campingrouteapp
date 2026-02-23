import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { HelpCircle, Sparkles, Zap, Shield, Info, CreditCard, Bot, ChevronRight } from "lucide-react";

export function FAQSection() {
  const { t } = useTranslation();
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleOpenFAQ = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail === 'string') {
        setOpenItem(customEvent.detail);
        
        // Scroll smoothly to the FAQ section with better positioning
        setTimeout(() => {
          const el = document.getElementById(customEvent.detail);
          if (el) {
            // Calculate position to scroll to top of the accordion item
            const y = el.getBoundingClientRect().top + window.scrollY - 20; // 20px offset
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 100);
      }
    };
    
    window.addEventListener('open-faq', handleOpenFAQ);
    return () => window.removeEventListener('open-faq', handleOpenFAQ);
  }, []);

  const faqs = [
    {
      id: "whatIs",
      icon: HelpCircle,
      q: t("faq.items.whatIs.q"),
      title: t("faq.items.whatIs.title"),
      content: [
        { label: t("faq.items.whatIs.prec"), items: [t("faq.items.whatIs.prec1"), t("faq.items.whatIs.prec2"), t("faq.items.whatIs.prec3")] },
        { label: t("faq.items.whatIs.ai"), items: [t("faq.items.whatIs.ai1"), t("faq.items.whatIs.ai2"), t("faq.items.whatIs.ai3")] }
      ]
    },
    {
      id: "diff",
      icon: Sparkles,
      q: t("faq.items.diff.q"),
      title: t("faq.items.diff.title"),
      content: [
        { label: t("faq.items.diff.gen"), items: [t("faq.items.diff.gen1"), t("faq.items.diff.gen2"), t("faq.items.diff.gen3"), t("faq.items.diff.gen4")] },
        { label: t("faq.items.diff.ai"), items: [t("faq.items.diff.ai1"), t("faq.items.diff.ai2"), t("faq.items.diff.ai4")] }
      ]
    },
    {
      id: "howItWorks",
      icon: Info,
      q: t("faq.items.howItWorks.q"),
      title: t("faq.items.howItWorks.title"),
      steps: [
        { title: t("faq.items.howItWorks.step1"), desc: t("faq.items.howItWorks.step1a") },
        { title: t("faq.items.howItWorks.step2"), desc: t("faq.items.howItWorks.step2a") },
        { title: t("faq.items.howItWorks.step3"), desc: t("faq.items.howItWorks.step3a") }
      ]
    },
    {
      id: "cost",
      icon: CreditCard,
      q: t("faq.items.cost.q"),
      title: t("faq.items.cost.title"),
      content: [
        { label: t("faq.items.cost.free"), items: [t("faq.items.cost.free1"), t("faq.items.cost.free2")] },
        { label: t("faq.items.cost.opt"), items: [t("faq.items.cost.transDesc")] }
      ]
    },
    {
      id: "privacy",
      icon: Shield,
      q: t("faq.items.privacy.q"),
      title: t("faq.items.privacy.title"),
      content: [
        { label: t("faq.items.privacy.device"), items: [t("faq.items.privacy.device1")] },
        { label: t("faq.items.privacy.sec"), items: [t("faq.items.privacy.sec1")] }
      ]
    },
    {
      id: "aiModel",
      icon: Bot,
      q: t("faq.items.aiModel.q"),
      title: t("faq.items.aiModel.title"),
      content: [
        { label: t("faq.items.aiModel.gemini"), items: [t("faq.items.aiModel.gemini1")] },
        { label: t("faq.items.aiModel.gpt"), items: [t("faq.items.aiModel.gpt1")] },
        { label: t("faq.items.aiModel.mistral"), items: [t("faq.items.aiModel.mistral1")] }
      ],
      footer: t("faq.items.aiModel.recDesc")
    }
  ];

  return (
    <section id="faq" className="py-32 px-6 bg-secondary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-6 py-2 rounded-full border-2 border-primary/20 bg-primary/10 text-primary font-black uppercase text-[10px] tracking-[0.4em] mb-8">
            {t("faq.badge")}
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
            {t("faq.title")}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible value={openItem || ""} onValueChange={(val) => {
            setOpenItem(val || undefined);
            // Scroll to top of opened accordion item on mobile
            if (window.innerWidth < 768 && val) {
              setTimeout(() => {
                const el = document.getElementById(val);
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 20;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }, 300); // Wait for animation to complete
            }
          }} className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.id}
                id={faq.id}
                value={faq.id}
                className="rounded-3xl border-2 border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04]"
              >
                <AccordionTrigger className="px-8 py-6 hover:no-underline group">
                  <div className="flex items-center gap-5 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-data-[state=open]:bg-primary group-data-[state=open]:text-white transition-all duration-500 shadow-lg">
                      <faq.icon className="w-6 h-6" />
                    </div>
                    <span className="font-black text-lg md:text-xl tracking-tight text-white uppercase">{faq.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-8 pt-2">
                  <div className="pl-16 space-y-6">
                    <p className="text-white font-bold text-lg">{faq.title}</p>
                    
                    {faq.content && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {faq.content.map((col, j) => (
                          <div key={j} className="space-y-3 p-6 rounded-2xl bg-white/5 border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{col.label}</h4>
                            <ul className="space-y-2">
                              {col.items.map((item, k) => (
                                <li key={k} className="text-sm text-white/60 flex items-start gap-2 leading-relaxed">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {faq.steps && (
                      <div className="grid grid-cols-1 gap-4">
                        {faq.steps.map((step, j) => (
                          <div key={j} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group/step hover:bg-white/10 transition-colors">
                            <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-black text-primary border border-primary/20">{j+1}</span>
                            <div>
                              <p className="text-sm font-bold text-white uppercase tracking-tight">{step.title}</p>
                              <p className="text-xs text-white/40">{step.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {faq.footer && (
                      <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20">
                        <p className="text-sm text-primary font-bold italic">{faq.footer}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
