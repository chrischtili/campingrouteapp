import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Copy, Check, Printer, Sparkles, FileText, ChevronRight, AlertCircle, Download } from "lucide-react";
import { useMemo, useState } from "react";
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
    vacationDestination?: string;
    destinationStayPlanned?: boolean;
    startDate: string;
    endDate: string;
    maxDailyDistance: string;
    routeType: string;
    travelPace: string;
    budgetLevel: string;
    quietPlaces: boolean;
  };
  onEngagement?: () => void;
}

interface OutputSectionLink {
  id: string;
  label: string;
}

export function OutputSection({ 
  output, 
  isLoading, 
  loadingMessage, 
  aiModel, 
  aiError, 
  useDirectAI,
  gpxOutputMode,
  summary,
  onEngagement
}: OutputSectionProps) {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [outputView, setOutputView] = useState<"formatted" | "raw">("formatted");
  const locale = i18n.language.startsWith('de')
    ? 'de-DE'
    : i18n.language.startsWith('nl')
      ? 'nl-NL'
      : i18n.language.startsWith('fr')
        ? 'fr-FR'
        : i18n.language.startsWith('it')
          ? 'it-IT'
          : 'en-US';
  const summaryDestinationLabel = summary?.destinationStayPlanned ? t("planner.route.returnDestination.label") : t("planner.summary.destination");

  const garminMatch = output.match(/BEGIN_GPX_GARMIN\s*([\s\S]*?)\s*END_GPX_GARMIN/);
  const garminWptMatch = output.match(/BEGIN_GPX_GARMIN_WPT\s*([\s\S]*?)\s*END_GPX_GARMIN_WPT/);
  const routeTrackMatch = output.match(/BEGIN_GPX_ROUTE_TRACK\s*([\s\S]*?)\s*END_GPX_ROUTE_TRACK/);
  const wptOnlyMatch = output.match(/BEGIN_GPX_WPT_ONLY\s*([\s\S]*?)\s*END_GPX_WPT_ONLY/);
  const gpxBlocks = output.match(/<gpx[\s\S]*?<\/gpx>/gi) || [];
  const hasWaypoints = (gpx: string) => /<wpt[\s>]/i.test(gpx);
  const hasRouteOrTrack = (gpx: string) => /<rte[\s>]|<trk[\s>]/i.test(gpx);
  const isValidGarminBlock = (gpx: string) => hasWaypoints(gpx) && !hasRouteOrTrack(gpx) && !/\.\.\./.test(gpx);
  const isValidRouteTrackBlock = (gpx: string) => hasWaypoints(gpx) && hasRouteOrTrack(gpx) && !/\.\.\./.test(gpx);
  const stripRteTrk = (gpx: string) => gpx
    .replace(/<rte[\s\S]*?<\/rte>/gi, '')
    .replace(/<trk[\s\S]*?<\/trk>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  let gpxGarmin = garminWptMatch?.[1]?.trim() || garminMatch?.[1]?.trim() || '';
  let gpxWptOnly = routeTrackMatch?.[1]?.trim() || wptOnlyMatch?.[1]?.trim() || '';
  const firstBlock = gpxBlocks[0]?.trim() || '';
  const secondBlock = gpxBlocks[1]?.trim() || '';
  let gpxBlocksSwapped = false;

  if (!gpxGarmin && firstBlock && isValidGarminBlock(firstBlock)) {
    gpxGarmin = firstBlock;
  }

  if (!gpxWptOnly && secondBlock && isValidRouteTrackBlock(secondBlock)) {
    gpxWptOnly = secondBlock;
  }

  if (!gpxWptOnly || !gpxGarmin) {
    const classified = gpxBlocks.reduce<{ garmin?: string; routeTrack?: string }>((acc, block) => {
      if (isValidRouteTrackBlock(block)) acc.routeTrack = acc.routeTrack || block;
      else if (isValidGarminBlock(block)) acc.garmin = acc.garmin || block;
      return acc;
    }, {});
    gpxGarmin = gpxGarmin || classified.garmin || '';
    gpxWptOnly = gpxWptOnly || classified.routeTrack || '';
  }

  if (gpxWptOnly && gpxGarmin && hasRouteOrTrack(gpxGarmin) && !hasRouteOrTrack(gpxWptOnly)) {
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
        onEngagement?.();
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
    onEngagement?.();
    const escapeHtml = (text: string) =>
      text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    const titleMatch = output.match(/^#\s*([^\n]+)/m);
    const docTitle = titleMatch?.[1]?.trim() || t("planner.output.title.direct");
    const printBody = outputView === "formatted"
      ? `
        <div class="formatted-output">${formattedHtml}</div>
      `
      : `
        <pre class="raw-output">${escapeHtml(sanitizeCopyText(outputBody))}</pre>
      `;
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
              body { font-family: Inter, Arial, sans-serif; padding: 32px; line-height: 1.6; color: #111; background: #fff; }
              h1 { font-size: 26px; color: #c97b00; border-bottom: 2px solid #eee; padding-bottom: 10px; margin: 0 0 24px; }
              h2 { font-size: 20px; margin: 28px 0 12px; color: #111; }
              h3 { font-size: 16px; margin: 22px 0 10px; color: #222; }
              p { margin: 0 0 14px; }
              ul, ol { margin: 0 0 18px 20px; padding: 0; }
              li { margin-bottom: 6px; }
              a { color: #c97b00; text-decoration: underline; }
              hr { border: 0; border-top: 1px solid #ddd; margin: 24px 0; }
              .raw-output { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre-wrap; font-size: 12px; line-height: 1.5; }
              .formatted-output strong { font-weight: 800; }
              .footer { margin-top: 30px; font-size: 10px; color: #666; border-top: 1px solid #eee; padding-top: 10px; }
            </style>
          </head>
          <body>
            <h1>${escapeHtml(docTitle)}</h1>
            ${printBody}
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
    // Keep only one GPX document if extra text or multiple blocks slipped in
    const match = text.match(/<gpx[\s\S]*?<\/gpx>/i);
    const gpxOnly = (match ? match[0] : text).trim();
    return gpxOnly.startsWith('<?xml')
      ? gpxOnly
      : `<?xml version="1.0" encoding="UTF-8"?>
${gpxOnly}`;
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

  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const inlineFormat = (text: string) => {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-black text-white">$1</strong>')
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-4 decoration-primary/60 hover:decoration-primary">$1</a>');
  };

  const slugifySection = (text: string) =>
    text
      .toLowerCase()
      .replace(/&amp;/g, "und")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "");

  const extractSectionLinks = (text: string): OutputSectionLink[] => {
    const links: OutputSectionLink[] = [];
    const seen = new Set<string>();
    const lines = text.replace(/\r\n/g, "\n").split("\n");

    for (const line of lines) {
      const headingMatch = line.match(/^\s*##\s+(.+)$/);
      if (!headingMatch) continue;

      const cleaned = headingMatch[1].trim().replace(/^\d+\.\s*/, "");
      if (/^gpx\b|^block\s+\d+/i.test(cleaned)) continue;
      if (!cleaned) continue;
      const id = slugifySection(cleaned);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      links.push({ id, label: cleaned });
    }

    return links;
  };

  const buildFormattedHtml = (text: string, sectionLinks: OutputSectionLink[]) => {
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const orderedHeadingIds = sectionLinks.map((section) => section.id);
    let headingIndex = 0;
    const html: string[] = [];
    let paragraphBuffer: string[] = [];
    let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;

    const flushParagraph = () => {
      if (!paragraphBuffer.length) return;
      html.push(
        `<p class="text-white/88 leading-8 mb-5">${paragraphBuffer
          .map((line) => inlineFormat(line))
          .join("<br />")}</p>`
      );
      paragraphBuffer = [];
    };

    const flushList = () => {
      if (!listBuffer) return;
      const tag = listBuffer.type;
      html.push(
        `<${tag} class="${tag === "ul" ? "list-disc" : "list-decimal"} pl-5 space-y-2 mb-6 text-white/88">` +
          listBuffer.items.map((item) => `<li class="pl-1 leading-7">${inlineFormat(item)}</li>`).join("") +
          `</${tag}>`
      );
      listBuffer = null;
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        flushParagraph();
        flushList();
        continue;
      }

      if (/^---+$/.test(line)) {
        flushParagraph();
        flushList();
        html.push('<hr class="my-8 border-0 border-t border-white/10" />');
        continue;
      }

      const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        flushParagraph();
        flushList();
        const level = headingMatch[1].length;
        const headingText = headingMatch[2].trim();
        const cleanLabel = headingText.replace(/^\d+\.\s*/, "");
        const headingId = orderedHeadingIds[headingIndex] ?? slugifySection(cleanLabel);
        headingIndex += 1;
        const tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
        const className =
          level === 1
            ? "mt-12 mb-6 text-2xl sm:text-3xl font-black uppercase tracking-[0.1em] text-white"
            : level === 2
              ? "mt-12 mb-5 text-xl sm:text-2xl font-black uppercase tracking-[0.12em] text-white"
              : "mt-10 mb-4 text-lg sm:text-xl font-black uppercase tracking-[0.16em] text-white";
        html.push(`<${tag} id="${headingId}" class="${className}">${inlineFormat(headingText)}</${tag}>`);
        continue;
      }

      const unorderedMatch = line.match(/^[-*•]\s+(.+)$/);
      if (unorderedMatch) {
        flushParagraph();
        if (!listBuffer || listBuffer.type !== "ul") {
          flushList();
          listBuffer = { type: "ul", items: [] };
        }
        listBuffer.items.push(unorderedMatch[1]);
        continue;
      }

      const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
      if (orderedMatch) {
        flushParagraph();
        if (!listBuffer || listBuffer.type !== "ol") {
          flushList();
          listBuffer = { type: "ol", items: [] };
        }
        listBuffer.items.push(orderedMatch[1]);
        continue;
      }

      flushList();
      paragraphBuffer.push(line);
    }

    flushParagraph();
    flushList();

    return html.join("");
  };

  const directAiBody = output
    .split(/BEGIN_GPX_GARMIN_WPT|BEGIN_GPX_ROUTE_TRACK|BEGIN_GPX_GARMIN|BEGIN_GPX_WPT_ONLY/)[0]
    .replace(/\n*#{2,3}\s*GPX[^\n]*$/i, '')
    .replace(/\n*GPX[- ]?Dateien[^\n]*$/i, '')
    .trim();

  const outputBody = useDirectAI ? directAiBody : output;
  const sectionLinks = useMemo(() => extractSectionLinks(outputBody), [outputBody]);
  const formattedHtml = useMemo(() => buildFormattedHtml(outputBody, sectionLinks), [outputBody, sectionLinks]);

  const handleDownloadGPX = (gpxContent: string, filename: string, successKey: string) => {
    const cleaned = sanitizeGpxContent(gpxContent);
    if (cleaned) {
      onEngagement?.();
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

  const summaryItems = [
    { label: t("planner.summary.start"), value: summary?.startPoint || t("planner.summary.notSpecified") },
    { label: summaryDestinationLabel, value: summary?.destination || t("planner.summary.notSpecified") },
    ...(summary?.destinationStayPlanned && summary?.vacationDestination
      ? [{ label: t("planner.route.vacationDestination.label"), value: summary.vacationDestination }]
      : []),
    {
      label: t("planner.summary.period"),
      value: `${summary?.startDate ? new Date(summary.startDate).toLocaleDateString(locale) : '?'} — ${summary?.endDate ? new Date(summary.endDate).toLocaleDateString(locale) : '?'}`
    },
    { label: t("planner.summary.maxDist"), value: `${summary?.maxDailyDistance || '250'} km` },
    {
      label: t("planner.summary.style"),
      value: summary?.travelPace ? t(`planner.route.travelPace.options.${summary.travelPace}`) : t("planner.summary.notSelected")
    },
    {
      label: t("planner.accommodation.budgetLevel.label"),
      value: summary?.budgetLevel ? t(`planner.accommodation.budgetLevel.options.${summary.budgetLevel}`) : t("planner.summary.notSelected")
    },
    {
      label: t("planner.route.type.label"),
      value: summary?.routeType ? t(`planner.route.type.options.${summary.routeType}`) : t("planner.summary.notSelected")
    },
    {
      label: t("planner.accommodation.quietPlaces.label"),
      value: summary?.quietPlaces ? t("prompt.labels.yes") : t("planner.summary.notSelected")
    },
  ];

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
            background: "linear-gradient(180deg, rgba(10,14,12,0.96), rgba(10,14,12,0.93))",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
          }}
        >
          <div className="relative flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 py-6 sm:py-8 border-b border-white/10 gap-6 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-[0_12px_32px_rgba(245,155,10,0.16)]">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.38em] text-primary leading-none mb-2">
                  {useDirectAI ? `AI Route (${aiModel})` : t("planner.output.customPrompt")}
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight leading-none">
                  {useDirectAI ? t("planner.output.title.direct") : t("planner.output.title.prompt")}
                </h2>
                <p className="mt-2 text-sm text-white/55 font-medium">
                  {useDirectAI ? t("planner.output.results.title") : t("planner.output.nextSteps.description")}
                </p>
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
                className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[9px] tracking-widest transition-all group/btn shrink-0 shadow-sm"
              >
                {copied ? <Check className="w-3 h-3 mr-1 sm:mr-2 text-green-400" /> : <Copy className="w-3 h-3 mr-1 sm:mr-2 text-primary transition-colors" />}
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
                <Printer className="w-3 h-3 mr-1 sm:mr-2 text-primary transition-colors" />
                {t("buttons.print")}
              </Button>
            </div>
          </div>

          <div className="p-6 sm:p-10 md:p-14 space-y-10 bg-[linear-gradient(180deg,rgba(8,12,10,0.82),rgba(8,12,10,0.88))]">
            {summary && (
              <div className="p-6 sm:p-8 rounded-[2rem] bg-[linear-gradient(180deg,rgba(9,13,11,0.96),rgba(9,13,11,0.92))] border-2 border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-5">
                  {t("planner.output.summary.title")}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {summaryItems.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35 mb-2">
                        {item.label}
                      </div>
                      <div className="text-sm sm:text-base font-bold text-white/90 leading-snug">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {sectionLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {sectionLinks.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/70 transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-white"
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[rgba(8,12,10,0.92)] p-2">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35 px-3">
                {t("planner.output.view.label")}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOutputView("formatted")}
                  className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-colors ${
                    outputView === "formatted"
                      ? "bg-primary text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {t("planner.output.view.formatted")}
                </button>
                <button
                  type="button"
                  onClick={() => setOutputView("raw")}
                  className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-colors ${
                    outputView === "raw"
                      ? "bg-primary text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {t("planner.output.view.raw")}
                </button>
              </div>
            </div>
            {useDirectAI ? (
              <div className="space-y-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,11,0.98),rgba(9,13,11,0.94))] px-6 sm:px-8 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_16px_rgba(245,155,10,0.8)]" />
                  <div className="text-[10px] font-black uppercase tracking-[0.32em] text-white/45">
                    {t("planner.output.title.direct")}
                  </div>
                </div>
                {outputView === "formatted" ? (
                  <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(6,9,8,0.99),rgba(6,9,8,0.97))] px-5 sm:px-6 py-5 shadow-inner">
                    <div
                      className="whitespace-pre-wrap font-sans text-sm sm:text-[15px] md:text-base text-white/88 leading-8 selection:bg-primary/30 selection:text-white outline-none"
                      dangerouslySetInnerHTML={{ __html: formattedHtml }}
                    />
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm md:text-base text-white/90 leading-relaxed selection:bg-primary/30 selection:text-white outline-none">
                    {outputBody}
                  </pre>
                )}
              </div>
            ) : (
              <div className="space-y-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,11,0.98),rgba(9,13,11,0.94))] px-6 sm:px-8 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_16px_rgba(245,155,10,0.8)]" />
                  <div className="text-[10px] font-black uppercase tracking-[0.32em] text-white/45">
                    {t("planner.output.title.prompt")}
                  </div>
                </div>
                {outputView === "formatted" ? (
                  <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(6,9,8,0.99),rgba(6,9,8,0.97))] px-5 sm:px-6 py-5 shadow-inner">
                    <div
                      className="font-sans text-sm sm:text-[15px] md:text-base text-white/88 leading-8 selection:bg-primary/30 selection:text-white outline-none"
                      dangerouslySetInnerHTML={{ __html: formattedHtml }}
                    />
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm md:text-base text-white/90 leading-relaxed selection:bg-primary/30 selection:text-white outline-none">
                    {outputBody}
                  </pre>
                )}
              </div>
            )}

            <div className="p-6 sm:p-8 rounded-[2rem] bg-[linear-gradient(180deg,rgba(9,13,11,0.96),rgba(9,13,11,0.92))] border-2 border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">
                {t("planner.output.checklist.title")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/80 font-semibold">
                <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">• {t("planner.output.checklist.items.water")}</div>
                <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">• {t("planner.output.checklist.items.power")}</div>
                <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">• {t("planner.output.checklist.items.gas")}</div>
                <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">• {t("planner.output.checklist.items.waste")}</div>
                <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">• {t("planner.output.checklist.items.documents")}</div>
                <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">• {t("planner.output.checklist.items.apps")}</div>
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
                {copied ? <Check className="w-3 h-3 mr-1 sm:mr-2 text-green-400" /> : <Copy className="w-3 h-3 mr-1 sm:mr-2 text-primary transition-colors" />}
                {t("buttons.copy")}
              </Button>
              <Button
                onClick={handlePrint}
                className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[9px] tracking-widest transition-all group/btn shrink-0"
              >
                <Printer className="w-3 h-3 mr-1 sm:mr-2 text-primary transition-colors" />
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
                {copied ? <Check className="w-3 h-3 mr-1 sm:mr-2 text-green-400" /> : <Copy className="w-3 h-3 mr-1 sm:mr-2 text-primary transition-colors" />}
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
                <Printer className="w-3 h-3 mr-1 sm:mr-2 text-primary transition-colors" />
                {t("buttons.print")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
