import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { HelpCircle, Sparkles, Zap, Shield, Info, CreditCard, Bot, ChevronRight, Github } from "lucide-react";

export function FAQSection() {
  const { t } = useTranslation();
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  const openFeedback = () => {
    window.dispatchEvent(new Event("open-feedback"));
  };

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
            // Adjust offset to 100px to account for the fixed navbar
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
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
    },
    {
      id: "helpImprove",
      icon: Info,
      q: t("faq.items.helpImprove.q"),
      title: t("faq.items.helpImprove.title"),
      content: [
        {
          label: t("faq.items.helpImprove.content"),
          items: [
            t("faq.items.helpImprove.content1"),
            t("faq.items.helpImprove.content2"),
            t("faq.items.helpImprove.content3")
          ]
        }
      ],
      footerAction: true
    }
  ];

  return (
    <section id="faq" className="pt-20 pb-16 sm:py-32 px-6 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(8,10,12,0.98),rgba(11,13,15,0.98))]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/25" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            <span className="text-primary font-black text-[10px] tracking-[0.3em]">
              {t("faq.badge")}
            </span>
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.95]">
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
                  // Adjust offset to 100px to account for the fixed navbar on mobile
                  const y = el.getBoundingClientRect().top + window.scrollY - 100;
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
                <AccordionTrigger className="px-6 sm:px-8 py-6 hover:no-underline group">
                  <div className="flex items-center gap-4 sm:gap-5 text-left">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-data-[state=open]:bg-primary group-data-[state=open]:text-white transition-all duration-500 shadow-lg">
                      <faq.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="font-black text-base sm:text-lg md:text-xl tracking-tight text-white">{faq.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2">
                  <div className="pl-0 sm:pl-[4.25rem] space-y-6 mt-4 sm:mt-0">
                    <p className="text-white font-bold text-lg">{faq.title}</p>
                    
                    {faq.content && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {faq.content.map((col, j) => (
                          <div key={j} className="space-y-3">
                            <h4 className="text-[10px] font-semibold tracking-[0.08em] text-primary">{col.label}</h4>
                            <ul className="space-y-2">
                              {col.items.map((item, k) => (
                                <li key={k} className="text-sm text-white/68 flex items-start gap-2 leading-relaxed">
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
                          <div key={j} className="flex items-start gap-4">
                            <span className="mt-0.5 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary border border-primary/20">{j+1}</span>
                            <div>
                              <p className="text-sm font-semibold text-white tracking-tight">{step.title}</p>
                              <p className="text-sm text-white/60 leading-relaxed">{step.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {faq.footer && (
                      <div className="pt-2">
                        <p className="text-sm text-primary font-semibold italic">{faq.footer}</p>
                      </div>
                    )}

                    {faq.footerAction && (
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          type="button"
                          onClick={openFeedback}
                          className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
                        >
                          <Sparkles className="w-4 h-4" />
                          {t("faq.items.helpImprove.action")}
                        </button>
                        <a
                          href="https://github.com/chrischtili/campingrouteapp"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white/88 transition-colors hover:bg-white/8"
                        >
                          <Github className="w-4 h-4 text-primary" />
                          {t("faq.items.helpImprove.github")}
                        </a>
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
