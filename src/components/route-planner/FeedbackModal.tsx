import { useState } from "react";
import { MessageSquareHeart, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

interface FeedbackModalProps {
  open: boolean;
  mode: "prompt" | "route";
  onClose: () => void;
  onSubmit: (payload: { rating: "helpful" | "not_helpful"; message: string }) => Promise<void> | void;
}

export function FeedbackModal({ open, mode, onClose, onSubmit }: FeedbackModalProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState<"helpful" | "not_helpful" | "">("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isSubmitting) {
      setRating("");
      setMessage("");
      onClose();
    }
  };

  const isFormValid = rating === "helpful" || (rating === "not_helpful" && message.trim().length > 0);

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ rating, message: message.trim() });
      setRating("");
      setMessage("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="theme-popup-shell max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-xl overflow-y-auto border-2 p-0 shadow-[0_36px_140px_rgba(0,0,0,0.22)] ring-2 ring-primary/35 sm:w-full dark:shadow-[0_36px_140px_rgba(0,0,0,0.74)]">
        <div className="rounded-3xl border border-slate-900/8 bg-[radial-gradient(circle_at_top_left,rgba(255,128,0,0.10),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.42))] p-4 sm:p-8 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(255,128,0,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                <MessageSquareHeart className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-[0.12em] text-primary">
                  {t("planner.feedback.badge")}
                </p>
                <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground dark:text-white">
                  {t("planner.feedback.title")}
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-xs sm:text-sm leading-relaxed text-foreground/70 dark:text-white/70">
              {t(`planner.feedback.description.${mode}`)}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setRating("helpful")}
              className={`rounded-2xl border p-3 sm:p-4 text-left transition-all ${
                rating === "helpful"
                  ? "border-primary bg-primary/10 text-foreground shadow-lg shadow-primary/10 dark:text-white"
                  : "border-slate-900/12 bg-white/55 text-foreground/78 hover:border-primary/40 hover:bg-white/72 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-white/25 dark:hover:bg-white/10"
              }`}
            >
              <div className="mb-3 flex items-center gap-3">
                <ThumbsUp className="h-5 w-5 text-primary" />
                <span className="text-sm sm:text-base font-bold">{t("planner.feedback.options.helpful")}</span>
              </div>
              <p className="text-xs sm:text-sm text-foreground/60 dark:text-white/60">{t("planner.feedback.options.helpfulHint")}</p>
            </button>

            <button
              type="button"
              onClick={() => setRating("not_helpful")}
              className={`rounded-2xl border p-3 sm:p-4 text-left transition-all ${
                rating === "not_helpful"
                  ? "border-primary bg-primary/10 text-foreground shadow-lg shadow-primary/10 dark:text-white"
                  : "border-slate-900/12 bg-white/55 text-foreground/78 hover:border-primary/40 hover:bg-white/72 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-white/25 dark:hover:bg-white/10"
              }`}
            >
              <div className="mb-3 flex items-center gap-3">
                <ThumbsDown className="h-5 w-5 text-primary" />
                <span className="text-sm sm:text-base font-bold">{t("planner.feedback.options.notHelpful")}</span>
              </div>
              <p className="text-xs sm:text-sm text-foreground/60 dark:text-white/60">{t("planner.feedback.options.notHelpfulHint")}</p>
            </button>
          </div>

          <div className="mt-4 sm:mt-5">
            <label className="mb-2 block text-xs sm:text-sm font-semibold text-foreground/85 dark:text-white/85">
              {t("planner.feedback.messageLabel")}
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("planner.feedback.messagePlaceholder")}
              className="min-h-[96px] sm:min-h-[120px] rounded-2xl border border-slate-900/12 bg-white/72 text-xs sm:text-sm text-foreground placeholder:text-foreground/35 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/35"
              maxLength={800}
            />
            <p className="mt-2 text-[11px] sm:text-xs text-foreground/48 dark:text-white/45">{t("planner.feedback.privacy")}</p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-2xl border border-slate-900/12 bg-white/60 text-foreground hover:bg-white/78 hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
            >
              {t("planner.feedback.actions.later")}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="rounded-2xl bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? t("planner.feedback.actions.sending") : t("planner.feedback.actions.send")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
