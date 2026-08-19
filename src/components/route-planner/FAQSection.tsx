import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { HelpCircle, Shield, Info, CreditCard, Github } from "lucide-react";
import { RouteExampleContent } from "./RouteExampleSection";
import { useLocation, useNavigate } from "react-router-dom";

type FAQSectionProps = {
  onStartPlanning?: () => void;
};

export function FAQSection({ onStartPlanning }: FAQSectionProps) {
  const { t } = useTranslation();
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);
  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const faqItem = params.get("faq");
    if (!faqItem) return;

    setOpenItem(faqItem);
    setTimeout(() => {
      const el = document.getElementById(faqItem);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);

    params.delete("faq");
    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate]);

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
    <section id="faq" className="pt-16 pb-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden transition-colors">
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 space-y-3"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[11px] uppercase tracking-wider">
            <span className="flex h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            {t("faq.badge")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground dark:text-white tracking-tight">
            {t("faq.title")}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible value={openItem || ""} onValueChange={(val) => {
            setOpenItem(val || undefined);
            if (window.innerWidth < 768 && val) {
              setTimeout(() => {
                const el = document.getElementById(val);
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 100;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }, 300);
            }
          }} className="space-y-3.5">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.id}
                id={faq.id}
                value={faq.id}
                itemScope
                itemType="https://schema.org/Question"
                className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors"
              >
                <AccordionTrigger className="px-5 sm:px-7 py-5 hover:no-underline group">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center group-data-[state=open]:bg-emerald-600 group-data-[state=open]:text-white transition-colors shadow-sm">
                      <faq.icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                    <span itemProp="name" className="font-bold text-base sm:text-lg tracking-tight text-foreground dark:text-white">{faq.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="px-5 sm:px-7 pb-6 pt-1">
                  <div itemProp="text" className="pl-0 sm:pl-[3.25rem] space-y-5 mt-2 sm:mt-0">
                    <p className="text-foreground dark:text-white font-semibold text-base">{faq.title}</p>
                    
                    {faq.content && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {faq.content.map((col, j) => (
                          <div key={j} className="space-y-3">
                            <h4 className="text-[10px] font-semibold tracking-[0.08em] text-primary">{col.label}</h4>
                            <ul className="space-y-2">
                              {col.items.map((item, k) => (
                                <li key={k} className="text-sm text-foreground/70 dark:text-white/68 flex items-start gap-2 leading-relaxed">
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
                              <p className="text-sm font-semibold text-foreground dark:text-white tracking-tight">{step.title}</p>
                              <p className="text-sm text-foreground/65 dark:text-white/60 leading-relaxed">{step.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {faq.customContent && (
                      <RouteExampleContent onStartPlanning={onStartPlanning} />
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
                          <HelpCircle className="w-4 h-4" />
                          {t("faq.items.helpImprove.action")}
                        </button>
                        <a
                          href="https://github.com/chrischtili/campingrouteapp"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/70 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-card dark:border-white/12 dark:bg-white/5 dark:text-white/88 dark:hover:bg-white/8"
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
