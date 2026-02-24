import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Copy, Check, Printer, Sparkles, FileText, ChevronRight, AlertCircle, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OutputSectionProps {
  output: string;
  isLoading: boolean;
  loadingMessage?: string;
  aiModel?: string;
  aiError?: string;
  useDirectAI: boolean;
  gpxOutputMode: string[];
}

export function OutputSection({ 
  output, 
  isLoading, 
  loadingMessage, 
  aiModel, 
  aiError, 
  useDirectAI,
  gpxOutputMode
}: OutputSectionProps) {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);

  const garminMatch = output.match(/BEGIN_GPX_GARMIN\s*([\s\S]*?)\s*END_GPX_GARMIN/);
  const garminWptMatch = output.match(/BEGIN_GPX_GARMIN_WPT\s*([\s\S]*?)\s*END_GPX_GARMIN_WPT/);
  const routeTrackMatch = output.match(/BEGIN_GPX_ROUTE_TRACK\s*([\s\S]*?)\s*END_GPX_ROUTE_TRACK/);
  const wptOnlyMatch = output.match(/BEGIN_GPX_WPT_ONLY\s*([\s\S]*?)\s*END_GPX_WPT_ONLY/);
  const looksLikeGarmin = (gpx: string) => /<rte[\s>]|<trk[\s>]/i.test(gpx);
  const stripRteTrk = (gpx: string) => gpx
    .replace(/<rte[\s\S]*?<\/rte>/gi, '')
    .replace(/<trk[\s\S]*?<\/trk>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  let gpxGarmin = garminWptMatch?.[1]?.trim() || garminMatch?.[1]?.trim() || '';
  let gpxWptOnly = routeTrackMatch?.[1]?.trim() || wptOnlyMatch?.[1]?.trim() || '';
  let gpxBlocksSwapped = false;

  if (!gpxWptOnly || !gpxGarmin) {
    const gpxBlocks = output.match(/<gpx[\s\S]*?<\/gpx>/gi) || [];
    const classified = gpxBlocks.reduce<{ wpt?: string; garmin?: string }>((acc, block) => {
      if (looksLikeGarmin(block)) acc.garmin = acc.garmin || block;
      else acc.wpt = acc.wpt || block;
      return acc;
    }, {});
    gpxWptOnly = gpxWptOnly || classified.garmin || '';
    gpxGarmin = gpxGarmin || classified.wpt || '';
  }

  if (gpxWptOnly && gpxGarmin && looksLikeGarmin(gpxGarmin) && !looksLikeGarmin(gpxWptOnly)) {
    const tmp = gpxWptOnly;
    gpxWptOnly = gpxGarmin;
    gpxGarmin = tmp;
    gpxBlocksSwapped = true;
  }

  if (!gpxWptOnly && gpxGarmin) {
    gpxWptOnly = stripRteTrk(gpxGarmin);
  }

  const handleCopy = async () => {
    if (!output) return;
    try {
      const textArea = document.createElement("textarea");
      textArea.value = output;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopied(true);
        toast.success(t("planner.output.actions.copied"));
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      toast.error(t("planner.output.actions.copyError"));
    }
  };

  const handlePrint = () => {
    if (!output) return;
    const escapeHtml = (text: string) =>
      text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    const titleMatch = output.match(/^#\s*([^\n]+)/m);
    const docTitle = titleMatch?.[1]?.trim() || t("planner.output.title.direct");
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.write(`
        <html>
          <head>
            <title>CampingRoute.app - ${escapeHtml(docTitle)}</title>
            <style>
              body { font-family: monospace; padding: 30px; line-height: 1.5; white-space: pre-wrap; color: #000; background: #fff; }
              h1 { font-family: sans-serif; color: #f59e0b; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 0; }
              .footer { margin-top: 30px; font-size: 10px; color: #666; border-top: 1px solid #eee; padding-top: 10px; }
            </style>
          </head>
          <body>
            <h1>${escapeHtml(docTitle)}</h1>
            <pre style="font-size: 12px; white-space: pre-wrap;">${escapeHtml(output)}</pre>
            <div class="footer">Erstellt mit CampingRoute.app am ${new Date().toLocaleDateString()}</div>
          </body>
        </html>
      `);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 500);
    }
  };

  const handleDownloadGPX = (gpxContent: string, filename: string, successKey: string) => {
    if (gpxContent) {
      const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t(successKey));
    } else {
      toast.error(t("planner.output.print.gpxError") || "Keine GPX-Daten gefunden");
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-sm">
            {loadingMessage || (useDirectAI ? t("planner.loading.ai") : t("planner.loading.prompt"))}
          </h3>
          <p className="text-white text-base sm:text-lg font-semibold drop-shadow-sm">
            {t("planner.output.loading.wait")}
          </p>
        </div>
      </div>
    );
  }

  if (aiError) {
    return (
      <Alert variant="destructive" className="rounded-[2rem] border-destructive/20 bg-destructive/10 p-8">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <AlertDescription className="font-bold text-lg text-white ml-2">{aiError}</AlertDescription>
      </Alert>
    );
  }

  if (!output) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="relative group">
        <div 
          className="relative rounded-[3rem] border-2 border-white/10 shadow-2xl overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 py-6 sm:py-8 border-b border-white/10 gap-6 bg-white/5">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary leading-none mb-1">
                  {useDirectAI ? `AI Route (${aiModel})` : t("planner.output.customPrompt")}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-none">
                  {useDirectAI ? t("planner.output.title.direct") : t("planner.output.title.prompt")}
                </h2>
                {gpxBlocksSwapped && (
                  <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
                    {t("planner.output.actions.gpxSwapNote")}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
              <Button
                onClick={handleCopy}
                className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[9px] tracking-widest transition-all group/btn shrink-0"
              >
                {copied ? <Check className="w-3 h-3 mr-1 sm:mr-2 text-green-400" /> : <Copy className="w-3 h-3 mr-1 sm:mr-2 group-hover/btn:text-primary transition-colors" />}
                {t("buttons.copy")}
              </Button>
              
              {useDirectAI && gpxOutputMode?.length > 0 && (
                <>
                  {(gpxOutputMode.includes('routeTrack')) && (
                    <Button
                      onClick={() => handleDownloadGPX(
                        gpxWptOnly,
                        `camping-route-route-track-${new Date().toISOString().split('T')[0]}.gpx`,
                        "planner.output.actions.gpxDownloadedWpt"
                      )}
                      className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl border-2 border-primary/20 bg-primary/10 hover:bg-primary/20 hover:border-primary/40 text-primary font-black uppercase text-[9px] tracking-widest transition-all shrink-0"
                    >
                      <Download className="w-3 h-3 mr-1 sm:mr-2" />
                      {t("planner.output.actions.downloadWpt")}
                    </Button>
                  )}
                  {(gpxOutputMode.includes('garmin')) && (
                    <Button
                      onClick={() => handleDownloadGPX(
                        gpxGarmin,
                        `camping-route-garmin-waypoints-${new Date().toISOString().split('T')[0]}.gpx`,
                        "planner.output.actions.gpxDownloadedGarmin"
                      )}
                      className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl border-2 border-primary/20 bg-primary/10 hover:bg-primary/20 hover:border-primary/40 text-primary font-black uppercase text-[9px] tracking-widest transition-all shrink-0"
                    >
                      <Download className="w-3 h-3 mr-1 sm:mr-2" />
                      {t("planner.output.actions.downloadGarmin")}
                    </Button>
                  )}
                </>
              )}

              <Button
                onClick={handlePrint}
                className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[9px] tracking-widest transition-all group/btn shrink-0"
              >
                <Printer className="w-3 h-3 mr-1 sm:mr-2 group-hover/btn:text-primary transition-colors" />
                {t("buttons.print")}
              </Button>
            </div>
          </div>

          <div className="p-6 sm:p-10 md:p-16">
            <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm md:text-base text-white/80 leading-relaxed selection:bg-primary/30 selection:text-white outline-none">
              {output}
            </pre>
          </div>
        </div>
      </div>

      {!useDirectAI && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] border-2 border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center gap-8 shadow-xl"
        >
          <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-white shrink-0 shadow-2xl shadow-primary/40 rotate-3">
            <ChevronRight className="w-8 h-8" />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl font-black text-white uppercase tracking-tighter">{t("planner.output.nextSteps.title")}</h4>
            <p className="text-white/60 text-base leading-relaxed">
              {t("planner.output.nextSteps.description")}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
