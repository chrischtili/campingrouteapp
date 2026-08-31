import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/route-planner/Footer";
import { Navbar } from "@/components/route-planner/Navbar";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MessageSquareHeart, Send, ThumbsUp, ThumbsDown, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AppBreadcrumbs } from "@/components/AppBreadcrumbs";
import { toast } from "sonner";

export default function FeedbackPage() {
  const { t } = useTranslation();
  const [rating, setRating] = useState<"helpful" | "not_helpful" | "">("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isFormValid = rating === "helpful" || (rating === "not_helpful" && message.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (!import.meta.env.DEV) {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating,
            message: message.trim(),
            mode: "standalone_page",
            timestamp: new Date().toISOString(),
          }),
        });
      }
      setIsSubmitted(true);
      toast.success(t("planner.feedback.thanks", "Vielen Dank für dein Feedback!"));
    } catch {
      toast.error(t("planner.feedback.error", "Fehler beim Senden des Feedbacks."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground dark:text-white transition-colors">
      <Navbar />
      <div className="pt-16 sm:pt-20">
        <AppBreadcrumbs />
      </div>

      <main className="flex-1 pt-10 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-3 mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[11px] uppercase tracking-wider">
                <MessageSquareHeart className="w-3.5 h-3.5" />
                {t("feedbackPage.badge", "Feedback & Anregungen")}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground dark:text-white">
                {t("feedbackPage.title", "Deine Meinung zu CampingRoute")}
              </h1>
              <p className="max-w-xl mx-auto text-sm sm:text-base text-foreground/70 dark:text-white/70 leading-relaxed">
                {t("feedbackPage.subtitle", "Hilf uns, CampingRoute noch besser zu machen. War der Prompt-Assistent hilfreich? Hast du Ideen oder Vorschläge?")}
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {isSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground dark:text-white">
                    {t("feedbackPage.successTitle", "Vielen Dank für deine Rückmeldung!")}
                  </h2>
                  <p className="text-sm text-foreground/70 dark:text-white/70 max-w-md mx-auto">
                    {t("feedbackPage.successDesc", "Dein Feedback hilft uns dabei, den Prompt-Assistenten und den MCP-Server kontinuierlich weiterzuentwickeln.")}
                  </p>
                  <div className="pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsSubmitted(false);
                        setRating("");
                        setMessage("");
                      }}
                      className="rounded-xl border-slate-300 font-bold"
                    >
                      {t("feedbackPage.sendMore", "Weiteres Feedback abgeben")}
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-sm font-extrabold text-slate-800 dark:text-slate-100 block text-left">
                      {t("planner.feedback.question", "Wie bewertest du CampingRoute?")}
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setRating("helpful")}
                        className={`flex items-center justify-center gap-2.5 rounded-2xl border-2 p-4 text-sm font-extrabold transition-all cursor-pointer ${
                          rating === "helpful"
                            ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-500 dark:text-emerald-200 shadow-sm scale-[1.02]"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        <ThumbsUp className={`h-5 w-5 ${rating === "helpful" ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
                        <span>{t("planner.feedback.helpful", "Hilfreich")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRating("not_helpful")}
                        className={`flex items-center justify-center gap-2.5 rounded-2xl border-2 p-4 text-sm font-extrabold transition-all cursor-pointer ${
                          rating === "not_helpful"
                            ? "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:border-amber-500 dark:text-amber-200 shadow-sm scale-[1.02]"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        <ThumbsDown className={`h-5 w-5 ${rating === "not_helpful" ? "text-amber-600 dark:text-amber-400" : ""}`} />
                        <span>{t("planner.feedback.notHelpful", "Verbesserungswürdig")}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="feedback-message" className="text-sm font-extrabold text-slate-800 dark:text-slate-100 block text-left">
                      {t("feedbackPage.messageLabel", "Deine Anmerkungen, Ideen oder Wünsche (optional):")}
                    </label>
                    <Textarea
                      id="feedback-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t("feedbackPage.messagePlaceholder", "Was hat dir gefallen? Was können wir verbessern? Welche Features oder Prompts vermisst du?")}
                      rows={5}
                      className="w-full rounded-2xl border-slate-300 bg-white p-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 text-left">
                      {t("planner.feedback.privacy", "Bitte keine personenbezogenen oder sensiblen Daten eingeben. Dein Feedback wird vertraulich zur Produktverbesserung genutzt.")}
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className="h-12 px-8 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-500 disabled:border-slate-300"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? t("buttons.loading", "Wird gesendet...") : t("feedbackPage.submit", "Feedback absenden")}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            <div className="text-center pt-4">
              <Link to="/" className="inline-flex items-center gap-2 text-foreground/60 dark:text-white/60 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-semibold text-xs group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {t("privacy.backToHome", "Zurück zur Startseite")}
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
