import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function FAQSection() {
  const { t } = useTranslation();

  const faqs = [
    {
      q: t("faq.items.whatIs.q"),
      a: (
        <div>
          <p className="mb-4 text-xs md:text-sm"><strong>{t("faq.items.whatIs.title")}</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>🎯</span> {t("faq.items.whatIs.prec")}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs md:text-xs md:text-sm">
                <li>{t("faq.items.whatIs.prec1")}</li>
                <li>{t("faq.items.whatIs.prec2")}</li>
                <li>{t("faq.items.whatIs.prec3")}</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>🤖</span> {t("faq.items.whatIs.ai")}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs md:text-sm">
                <li>{t("faq.items.whatIs.ai1")}</li>
                <li>{t("faq.items.whatIs.ai2")}</li>
                <li>{t("faq.items.whatIs.ai3")}</li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mt-4">
            <p className="flex items-center gap-2 mb-2 text-xs md:text-sm">
              <span>💡</span>
              <strong>{t("faq.items.whatIs.flex")}</strong>
            </p>
            <p className="text-xs md:text-sm">{t("faq.items.whatIs.flexDesc")}</p>
          </div>
        </div>
      ),
    },
    {
      q: t("faq.items.diff.q"),
      a: (
        <div>
          <p className="mb-4 text-xs md:text-sm"><strong>{t("faq.items.diff.title")}</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>📝</span> {t("faq.items.diff.gen")}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs md:text-sm">
                <li><strong>{t("faq.items.diff.gen1")}</strong></li>
                <li>{t("faq.items.diff.gen2")}</li>
                <li>{t("faq.items.diff.gen3")}</li>
                <li>{t("faq.items.diff.gen4")}</li>
                <li>{t("faq.items.diff.gen5")}</li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>⚡</span> {t("faq.items.diff.ai")}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs md:text-sm">
                <li><strong>{t("faq.items.diff.ai1")}</strong></li>
                <li>{t("faq.items.diff.ai2")}</li>
                <li>Inklusive <strong>{t("faq.items.diff.ai3")}</strong></li>
                <li>{t("faq.items.diff.ai4")}</li>
                <li>{t("faq.items.diff.ai5")}</li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mt-4">
            <p className="mb-2">
              <strong>📥 {t("faq.items.diff.gpx")}</strong>
            </p>
            <p className="text-xs md:text-sm">{t("faq.items.diff.gpxDesc")}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg mt-4">
            <p className="flex items-center gap-2 mb-2 text-xs md:text-sm">
              <span>💡</span>
              <strong>{t("faq.items.diff.note")}</strong>
            </p>
            <p className="text-xs md:text-sm">{t("faq.items.diff.noteDesc")}</p>
          </div>
        </div>
      ),
    },
    {
      q: t("faq.items.vehicles.q"),
      a: (
        <div>
          <p className="mb-4 text-xs md:text-sm"><strong>{t("faq.items.vehicles.title")}</strong></p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-teal-50 dark:bg-teal-900 p-4 md:p-6 rounded-xl text-center border border-teal-200 dark:border-teal-800 shadow-sm">
              <h3 className="font-semibold text-foreground mb-3">{t("faq.items.vehicles.rv")}</h3>
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                ✅ {t("faq.items.vehicles.full")}
              </span>
            </div>
            <div className="bg-teal-50 dark:bg-teal-900 p-4 md:p-6 rounded-xl text-center border border-teal-200 dark:border-teal-800 shadow-sm">
              <h3 className="font-semibold text-foreground mb-3">{t("faq.items.vehicles.van")}</h3>
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                ✅ {t("faq.items.vehicles.full")}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-xl text-center border border-gray-200 dark:border-gray-700 shadow-sm opacity-80">
              <h3 className="font-semibold text-foreground mb-3">{t("faq.items.vehicles.caravan")}</h3>
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                🕒 {t("faq.items.vehicles.planned")}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-xl text-center border border-gray-200 dark:border-gray-700 shadow-sm opacity-80">
              <h3 className="font-semibold text-foreground mb-3">{t("faq.items.vehicles.moto")}</h3>
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                🕒 {t("faq.items.vehicles.planned")}
              </span>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg mt-4">
            <p className="flex items-center gap-2 mb-2 text-xs md:text-sm">
              <span>💡</span>
              <strong>{t("faq.items.vehicles.tip")}</strong>
            </p>
            <p className="text-xs md:text-sm">{t("faq.items.vehicles.tipDesc")}</p>
          </div>
        </div>
      ),
    },
    {
      q: t("faq.items.howItWorks.q"),
      a: (
        <div>
          <p className="mb-4 text-xs md:text-sm"><strong>{t("faq.items.howItWorks.title")}</strong></p>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>{t("faq.items.howItWorks.step1")}</span>
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs md:text-sm">
                <li>{t("faq.items.howItWorks.step1a")}</li>
                <li>{t("faq.items.howItWorks.step1b")}</li>
                <li>{t("faq.items.howItWorks.step1c")}</li>
                <li>{t("faq.items.howItWorks.step1d")}</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>{t("faq.items.howItWorks.step2")}</span>
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs md:text-sm">
                <li><strong>{t("faq.items.howItWorks.step2a")}</strong></li>
                <li><strong>{t("faq.items.howItWorks.step2b")}</strong></li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>{t("faq.items.howItWorks.step3")}</span>
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs md:text-sm">
                <li>{t("faq.items.howItWorks.step3a")}</li>
                <li>{t("faq.items.howItWorks.step3b")}</li>
                <li>{t("faq.items.howItWorks.step3c")}</li>
                <li>{t("faq.items.howItWorks.step3d")}</li>
              </ul>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg mt-4">
            <p className="flex items-center gap-2 mb-2 text-xs md:text-sm">
              <span>💡</span>
              <strong>{t("faq.items.diff.note")}</strong>
            </p>
            <p className="text-xs md:text-sm">{t("faq.items.diff.noteDesc")}</p>
          </div>
        </div>
      ),
    },
    {
      q: t("faq.items.cost.q"),
      a: (
        <div className="space-y-4">
          <p className="text-xs md:text-sm"><strong>✅ {t("faq.items.cost.title")}</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>🆓</span> {t("faq.items.cost.free")}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs md:text-sm">
                <li>{t("faq.items.cost.free1")}</li>
                <li>{t("faq.items.cost.free2")}</li>
                <li>{t("faq.items.cost.free3")}</li>
                <li>{t("faq.items.cost.free4")}</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>💰</span> {t("faq.items.cost.opt")}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs md:text-sm">
                <li>{t("faq.items.cost.opt1")}</li>
                <li>{t("faq.items.cost.opt2")}</li>
                <li>{t("faq.items.cost.opt3")}</li>
                <li>{t("faq.items.cost.opt4")}</li>
              </ul>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <p className="flex items-center gap-2 mb-2 text-xs md:text-sm">
              <span>ℹ️</span>
              <strong>{t("faq.items.cost.trans")}</strong>
            </p>
            <p className="text-xs md:text-sm">{t("faq.items.cost.transDesc")}</p>
          </div>
        </div>
      ),
    },
    {
      q: t("faq.items.privacy.q"),
      a: (
        <div>
          <p className="mb-4 text-xs md:text-sm"><strong>🔒 {t("faq.items.privacy.title")}</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>📱</span> {t("faq.items.privacy.device")}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs md:text-sm">
                <li><strong>{t("faq.items.privacy.device1")}</strong></li>
                <li><strong>{t("faq.items.privacy.device2")}</strong></li>
                <li><strong>{t("faq.items.privacy.device3")}</strong></li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>🛡️</span> {t("faq.items.privacy.sec")}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs md:text-sm">
                <li><strong>{t("faq.items.privacy.sec1")}</strong></li>
                <li><strong>{t("faq.items.privacy.sec2")}</strong></li>
                <li><strong>{t("faq.items.privacy.sec3")}</strong></li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mt-4">
            <p className="flex items-center gap-2 mb-2 text-xs md:text-sm">
              <span>ℹ️</span>
              <strong>{t("faq.items.privacy.trans")}</strong>
            </p>
            <p className="text-xs md:text-sm">{t("faq.items.privacy.transDesc")}</p>
          </div>
        </div>
      ),
    },
    {
      q: t("faq.items.offline.q"),
      a: (
        <div>
          <p className="mb-4 text-xs md:text-sm"><strong>✅ {t("faq.items.offline.title")}</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>📥</span> {t("faq.items.offline.exp")}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs md:text-sm">
                <li>{t("faq.items.offline.exp1")}</li>
                <li>{t("faq.items.offline.exp2")}</li>
                <li>{t("faq.items.offline.exp3")}</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>🌍</span> {t("faq.items.offline.use")}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs md:text-sm">
                <li>{t("faq.items.offline.use1")}</li>
                <li>{t("faq.items.offline.use2")}</li>
                <li>{t("faq.items.offline.use3")}</li>
              </ul>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg mt-4">
            <p className="flex items-center gap-2 mb-2 text-xs md:text-sm">
              <span>💡</span>
              <strong>{t("faq.items.offline.tip")}</strong>
            </p>
            <p className="text-xs md:text-sm">{t("faq.items.offline.tipDesc")}</p>
          </div>
        </div>
      ),
    },
    {
      q: t("faq.items.aiModel.q"),
      a: (
        <div>
          <p className="mb-4 text-xs md:text-sm"><strong>{t("faq.items.aiModel.title")}</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>🌟</span> {t("faq.items.aiModel.gemini")}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs">
                <li><strong>{t("faq.items.aiModel.gemini1")}</strong></li>
                <li>{t("faq.items.aiModel.gemini2")}</li>
                <li>{t("faq.items.aiModel.gemini3")}</li>
                <li>{t("hero.free")}</li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>🤖</span> {t("faq.items.aiModel.gpt")}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs">
                <li><strong>{t("faq.items.aiModel.gpt1")}</strong></li>
                <li>{t("faq.items.aiModel.gpt2")}</li>
                <li>{t("faq.items.aiModel.gpt3")}</li>
                <li>{t("hero.free")}</li>
              </ul>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-xs md:text-sm">
                <span>⚡</span> {t("faq.items.aiModel.mistral")}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-xs">
                <li><strong>{t("faq.items.aiModel.mistral1")}</strong></li>
                <li>{t("faq.items.aiModel.mistral2")}</li>
                <li>{t("faq.items.aiModel.mistral3")}</li>
                <li>{t("hero.free")}</li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mt-4">
            <p className="flex items-center gap-2 mb-2 text-xs md:text-sm">
              <span>💡</span>
              <strong>{t("faq.items.aiModel.rec")}</strong>
            </p>
            <p className="text-xs md:text-sm">{t("faq.items.aiModel.recDesc")}</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="faq" className="py-24 px-4 bg-[rgb(230,225,215)] dark:bg-gray-700">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#F59B0A] font-semibold text-sm uppercase tracking-widest">
            {t("faq.badge")}
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mt-3">
            {t("faq.title")}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden scroll-mt-24"
              >
                <AccordionTrigger
                  id={i === 7 ? "model-selection-faq" : undefined}
                  className="font-normal text-foreground hover:no-underline py-3 text-xs md:text-sm font-sans px-6 w-full text-left"
                >
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-foreground dark:text-white pt-4 pb-6 leading-relaxed font-sans px-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
