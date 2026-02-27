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
  summary?: {
    startPoint: string;
    destination: string;
    startDate: string;
    endDate: string;
    maxDailyDistance: string;
    routeType: string;
    travelPace: string;
    budgetLevel: string;
    quietPlaces: boolean;
  };
}

export function OutputSection({ 
  output, 
  isLoading, 
  loadingMessage, 
  aiModel, 
  aiError, 
  useDirectAI,
  gpxOutputMode,
  summary
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
      const cleaned = sanitizeCopyText(output);
      const textArea = document.createElement("textarea");
      textArea.value = cleaned;
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
    const cleaned = sanitizeCopyText(output);
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
            <pre style="font-size: 12px; white-space: pre-wrap;">${escapeHtml(cleaned)}</pre>
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

  const sanitizeGpxContent = (input: string) => {
    if (!input) return '';
    let text = input.trim();
    // Remove GPX marker wrappers
    text = text
      .replace(/BEGIN_GPX_GARMIN_WPT|END_GPX_GARMIN_WPT/gi, '')
      .replace(/BEGIN_GPX_ROUTE_TRACK|END_GPX_ROUTE_TRACK/gi, '')
      .replace(/BEGIN_GPX_GARMIN|END_GPX_GARMIN/gi, '')
      .replace(/BEGIN_GPX_WPT_ONLY|END_GPX_WPT_ONLY/gi, '');
    // Remove fenced code blocks and bold markers
    text = text
      .replace(/```(?:xml|gpx)?/gi, '')
      .replace(/```/g, '')
      .replace(/`/g, '')
      .replace(/^\*+\s*/g, '')
      .replace(/\s*\*+$/g, '');
    text = text.trim();
    // Keep only the GPX content if extra text slipped in
    const match = text.match(/<gpx[\s\S]*<\/gpx>/i);
    return match ? match[0].trim() : text;
  };

  const sanitizeCopyText = (text: string) => {
    return text
      // strip fenced code markers but keep the content
      .replace(/```(?:xml|gpx)?/gi, '')
      .replace(/```/g, '')
      // strip GPX marker wrappers
      .replace(/BEGIN_GPX_[A-Z_]+/gi, '')
      .replace(/END_GPX_[A-Z_]+/gi, '')
      // strip stray backticks
      .replace(/`/g, '')
      .trim();
  };

  const handleDownloadGPX = (gpxContent: string, filename: string, successKey: string) => {
    const cleaned = sanitizeGpxContent(gpxContent);
    if (cleaned) {
      const blob = new Blob([cleaned], { type: 'application/gpx+xml' });
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

          <div className="p-6 sm:p-10 md:p-16 space-y-10">
            {summary && (
              <div className="p-6 rounded-3xl bg-white/5 border-2 border-white/10 shadow-xl">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">
                  {t("planner.output.summary.title")}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80 font-semibold">
                  <div>• {t("planner.summary.start")}: {summary.startPoint || t("planner.summary.notSpecified")}</div>
                  <div>• {t("planner.summary.destination")}: {summary.destination || t("planner.summary.notSpecified")}</div>
                  <div>• {t("planner.summary.period")}: {summary.startDate ? new Date(summary.startDate).toLocaleDateString(i18n.language.startsWith('de') ? 'de-DE' : i18n.language.startsWith('nl') ? 'nl-NL' : i18n.language.startsWith('fr') ? 'fr-FR' : i18n.language.startsWith('it') ? 'it-IT' : 'en-US') : '?'} — {summary.endDate ? new Date(summary.endDate).toLocaleDateString(i18n.language.startsWith('de') ? 'de-DE' : i18n.language.startsWith('nl') ? 'nl-NL' : i18n.language.startsWith('fr') ? 'fr-FR' : i18n.language.startsWith('it') ? 'it-IT' : 'en-US') : '?'}</div>
                  <div>• {t("planner.summary.maxDist")}: {summary.maxDailyDistance || '250'} km</div>
                  <div>• {t("planner.summary.style")}: {summary.travelPace ? t(`planner.route.travelPace.options.${summary.travelPace}`) : t("planner.summary.notSelected")}</div>
                  <div>• {t("planner.accommodation.budgetLevel.label")}: {summary.budgetLevel ? t(`planner.accommodation.budgetLevel.options.${summary.budgetLevel}`) : t("planner.summary.notSelected")}</div>
                  <div>• {t("planner.route.type.label")}: {summary.routeType ? t(`planner.route.type.options.${summary.routeType}`) : t("planner.summary.notSelected")}</div>
                  <div>• {t("planner.accommodation.quietPlaces.label")}: {summary.quietPlaces ? t("prompt.labels.yes") : t("planner.summary.notSelected")}</div>
                </div>
              </div>
            )}
            {useDirectAI ? (
              <div className="space-y-8">
                <div
                  className="whitespace-pre-wrap font-sans text-xs sm:text-sm md:text-base text-white/90 leading-relaxed selection:bg-primary/30 selection:text-white outline-none"
                  dangerouslySetInnerHTML={{
                    __html: output
                      .split(/BEGIN_GPX_GARMIN_WPT|BEGIN_GPX_ROUTE_TRACK|BEGIN_GPX_GARMIN|BEGIN_GPX_WPT_ONLY/)[0]
                      .replace(/\n*#{2,3}\s*GPX[^\n]*$/i, '')
                      .replace(/\n*GPX[- ]?Dateien[^\n]*$/i, '')
                      .trim()
                      .replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/\"/g, "&quot;")
                      .replace(/'/g, "&#39;")
                      .replace(/(https?:\/\/[^\s)>\"]+)/g, '<a href=\"$1\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-primary underline underline-offset-4\">$1</a>')
                      .replace(/\n/g, '<br />'),
                  }}
                />
              </div>
            ) : (
              <div>
                <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm md:text-base text-white/90 leading-relaxed selection:bg-primary/30 selection:text-white outline-none">
                  {output}
                </pre>
              </div>
            )}

            <div className="p-6 rounded-3xl bg-white/5 border-2 border-white/10 shadow-xl">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">
                {t("planner.output.checklist.title")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/80 font-semibold">
                <div>• {t("planner.output.checklist.items.water")}</div>
                <div>• {t("planner.output.checklist.items.power")}</div>
                <div>• {t("planner.output.checklist.items.gas")}</div>
                <div>• {t("planner.output.checklist.items.waste")}</div>
                <div>• {t("planner.output.checklist.items.documents")}</div>
                <div>• {t("planner.output.checklist.items.apps")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!useDirectAI && (
        <div className="relative rounded-[3rem] border-2 border-white/10 shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 py-6 sm:py-8 gap-6 bg-white/5">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-lg">
                <ChevronRight className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary leading-none mb-1">
                  {t("planner.output.nextSteps.title")}
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-none">
                  {t("planner.output.customPrompt")}
                </h4>
                <p className="text-white/70 text-sm sm:text-base font-semibold">
                  {t("planner.output.nextSteps.description")}
                </p>
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
              <Button
                onClick={handlePrint}
                className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[9px] tracking-widest transition-all group/btn shrink-0"
              >
                <Printer className="w-3 h-3 mr-1 sm:mr-2 group-hover/btn:text-primary transition-colors" />
                {t("buttons.print")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {useDirectAI && (
        <div className="relative rounded-[3rem] border-2 border-white/10 shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 py-6 sm:py-8 gap-6 bg-white/5">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary leading-none mb-1">
                  {useDirectAI ? t("planner.output.results.title") : t("planner.output.customPrompt")}
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-none">
                  {useDirectAI ? t("planner.output.title.direct") : t("planner.output.title.prompt")}
                </h4>
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
        </div>
      )}
    </motion.div>
  );
}
