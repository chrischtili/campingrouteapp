import { useState } from "react";
import { MessageSquareHeart, Send, Sparkles, ThumbsUp, Lightbulb, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface DiscoverFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  currentHub?: string;
  hubLabel?: string;
}

export function DiscoverFeedbackModal({
  open,
  onClose,
  currentHub = "all",
  hubLabel = "Übersicht"
}: DiscoverFeedbackModalProps) {
  const { i18n } = useTranslation();
  const [feedbackType, setFeedbackType] = useState<"praise" | "idea" | "bug">("idea");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage("");
      setEmail("");
      setFeedbackType("idea");
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const rating = feedbackType === "praise" ? "helpful" : "not_helpful";
    const typeLabel = feedbackType === "praise" ? "Lob & Positiv" : (feedbackType === "idea" ? "Idee & Wunsch" : "Fehler & Problem");
    const fullMessage = email.trim() 
      ? `[${typeLabel}] ${message.trim()}\n\nKontakt: ${email.trim()}`
      : `[${typeLabel}] ${message.trim()}`;

    const payload = {
      mode: "discover",
      rating,
      hub: currentHub,
      page: `Entdecken: ${hubLabel}`,
      message: fullMessage,
      language: i18n.language || "de",
      provider: "Entdecken Beta",
      timestamp: new Date().toISOString()
    };

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      toast.success("Vielen Dank für dein Feedback! Wir lesen jede Nachricht aufmerksam durch.");
      handleClose();
    } catch {
      toast.error("Feedback konnte nicht gesendet werden. Bitte versuche es später noch einmal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="theme-popup-shell max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto border border-emerald-500/20 p-0 shadow-2xl z-[99999]">
        <div className="rounded-3xl bg-white p-5 sm:p-7 dark:bg-slate-900">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <MessageSquareHeart className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <Sparkles className="h-3 w-3" />
                    <span>Early Beta Feedback</span>
                  </div>
                  <DialogTitle className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                    Hilf mit, Entdecken besser zu machen!
                  </DialogTitle>
                </div>
              </div>
            </div>
            <DialogDescription className="text-xs leading-relaxed text-gray-600 dark:text-slate-300">
              Wir bauen den neuen Entdecken-Bereich aktiv aus. Was gefällt dir, was fehlt dir oder was funktioniert noch nicht ganz rund?
            </DialogDescription>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 dark:bg-slate-800 dark:text-slate-300">
              <span>Bereich:</span>
              <strong className="text-emerald-700 dark:text-emerald-400">{hubLabel}</strong>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Feedback category tabs */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-slate-200">
                Art der Rückmeldung:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackType("idea")}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                    feedbackType === "idea"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-200"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400"
                  }`}
                >
                  <Lightbulb className={`h-4 w-4 ${feedbackType === "idea" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`} />
                  <span>Idee / Wunsch</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackType("praise")}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                    feedbackType === "praise"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-200"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400"
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${feedbackType === "praise" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`} />
                  <span>Gefällt mir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackType("bug")}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                    feedbackType === "bug"
                      ? "border-rose-600 bg-rose-50 text-rose-900 shadow-sm dark:border-rose-500 dark:bg-rose-950/50 dark:text-rose-200"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400"
                  }`}
                >
                  <AlertTriangle className={`h-4 w-4 ${feedbackType === "bug" ? "text-rose-600 dark:text-rose-400" : "text-gray-400"}`} />
                  <span>Problem</span>
                </button>
              </div>
            </div>

            {/* Message input */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-slate-200">
                Deine Nachricht: <span className="text-rose-500">*</span>
              </label>
              <Textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  feedbackType === "idea"
                    ? "Welche Funktionen, Filter oder Inhalte wünschst du dir für diesen Bereich?"
                    : (feedbackType === "praise"
                        ? "Was gefällt dir besonders gut an der Entdecken-Seite?"
                        : "Welches Problem ist aufgetreten (z. B. Karte lädt nicht, fehlende Angaben)?")
                }
                className="min-h-[100px] rounded-xl border-gray-200 text-xs sm:text-sm dark:border-slate-800 dark:bg-slate-800"
                maxLength={1000}
              />
            </div>

            {/* Email contact optional */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-slate-300">
                E-Mail für Rückfragen <span className="text-[10px] text-gray-400 font-normal">(optional)</span>:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine.email@beispiel.de"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-emerald-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-xl text-xs"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || isSubmitting}
                className="rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold gap-1.5 px-4"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Wird gesendet..." : "Feedback senden"}</span>
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
