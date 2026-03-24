import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Copy, Check, Printer, Sparkles, FileText, ChevronRight, ChevronDown, AlertCircle, Download, Map as MapIcon, CalendarRange, Route as RouteIcon, Clock3, Wallet, Trees, Award, BedDouble, TriangleAlert, Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";

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
    stages?: Array<{ destination: string }>;
    startDate: string;
    endDate: string;
    maxDailyDistance: string;
    maxDailyDriveHours?: string;
    dailyLimitPriority?: string;
    destinationDetailsEnabled?: boolean;
    destinationDepartureDate?: string;
    destinationDepartureTime?: string;
    targetRegions?: string;
    preferScenicLongerStops?: boolean;
    travelPace: string;
    avgCampsitePriceMax?: string;
    quietPlaces: boolean;
  };
  onEngagement?: () => void;
}

interface OutputSectionLink {
  id: string;
  label: string;
}

interface StageRiskItem {
  title: string;
  level: "safe" | "caution" | "critical";
  detail: string;
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
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);
  const [outputView, setOutputView] = useState<"formatted" | "raw">("formatted");
  const [checklistOpen, setChecklistOpen] = useState(false);
  const locale = i18n.language.startsWith('de')
    ? 'de-DE'
    : i18n.language.startsWith('nl')
      ? 'nl-NL'
      : i18n.language.startsWith('fr')
        ? 'fr-FR'
        : i18n.language.startsWith('it')
          ? 'it-IT'
          : 'en-US';

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
    const placeholders: string[] = [];
    let working = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label: string, url: string) => {
      const index = placeholders.length;
      placeholders.push(
        `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-4 decoration-primary/60 hover:decoration-primary">${escapeHtml(label)}</a>`
      );
      return `__LINK_PLACEHOLDER_${index}__`;
    });

    working = escapeHtml(working)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(https?:\/\/[^\s<]+)/g, (match) => {
        const cleanUrl = match.replace(/[),.;!?]+$/g, "");
        const trailing = match.slice(cleanUrl.length);
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-4 decoration-primary/60 hover:decoration-primary">${cleanUrl}</a>${trailing}`;
      });

    return working.replace(/__LINK_PLACEHOLDER_(\d+)__/g, (_, index) => placeholders[Number(index)] || "");
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
        `<p class="leading-8 mb-5">${paragraphBuffer
          .map((line) => inlineFormat(line))
          .join("<br />")}</p>`
      );
      paragraphBuffer = [];
    };

    const flushList = () => {
      if (!listBuffer) return;
      const tag = listBuffer.type;
      html.push(
        `<${tag} class="${tag === "ul" ? "list-disc" : "list-decimal"} pl-5 space-y-2 mb-6">` +
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
        html.push('<hr class="my-8 border-0 border-t" />');
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
            ? "mt-12 mb-6 text-2xl sm:text-3xl font-black tracking-[0.08em]"
            : level === 2
              ? "mt-12 mb-5 text-xl sm:text-2xl font-black tracking-[0.08em]"
              : "mt-10 mb-4 text-lg sm:text-xl font-black tracking-[0.08em]";
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
  const analysisLines = useMemo(() => {
    const skipRegex = /^(wichtig|important|importante|belangrijk|plane die route|gib zuerst|falls deine plattform|gpx-datei|anforderungen|nutze ausschließlich|erfinde keine|falls kein download möglich ist|wenn ich|verwende diese drei begriffe|block\s+\d+|gib die gpx-datei)/i;
    return outputBody
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.replace(/^[-*•\d.\s]+/, "").trim())
      .filter(Boolean)
      .filter((line) => !skipRegex.test(line));
  }, [outputBody]);

  const stageRiskItems = useMemo<StageRiskItem[]>(() => {
    const patterns = [
      { level: "critical" as const, regex: /\b(eher ungeeignet|für dieses fahrzeug eher ungeeignet|rather unsuitable|unsuitable for this vehicle|plutôt inadaptée|piuttosto inadatta|eerder ongeschikt)\b/i },
      { level: "caution" as const, regex: /\b(mit vorsicht|use caution|avec prudence|con prudenza|met voorzichtigheid)\b/i },
      { level: "safe" as const, regex: /\b(unkritisch|uncritical|sans problème|senza criticità|onkritisch)\b/i },
    ];
    const ratingLeadRegex = /^(bewertung|rating|évaluation|valutazione|beoordeling)\s*[:–-]/i;
    const stageContextRegex = /\b(etappe|stage|leg|fahrtabschnitt|trajet)\b/i;

    const items: StageRiskItem[] = [];
    const seen = new Set<string>();

    for (const line of analysisLines) {
      const match = patterns.find((entry) => entry.regex.test(line));
      if (!match) continue;
      if (!ratingLeadRegex.test(line) && !stageContextRegex.test(line)) continue;

      const detail = line.replace(ratingLeadRegex, "").trim() || line;
      const title = t(`planner.output.risk.${match.level}`);
      const key = `${match.level}:${detail}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ title, level: match.level, detail });
      if (items.length >= 5) break;
    }

    return items;
  }, [analysisLines, t]);

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

  const summaryItems = [
    { label: t("planner.summary.start"), value: summary?.startPoint || t("planner.summary.notSpecified") },
    { label: t("planner.summary.destination"), value: summary?.destination || t("planner.summary.notSpecified") },
    ...(summary?.stages?.filter((stage) => stage.destination?.trim()).length
      ? [{ label: t("planner.summary.stops"), value: String(summary.stages.filter((stage) => stage.destination?.trim()).length) }]
      : []),
    ...((summary?.startDate || summary?.endDate)
      ? [{
          label: t("planner.summary.period"),
          value: [summary?.startDate ? new Date(summary.startDate).toLocaleDateString(locale) : "", summary?.endDate ? new Date(summary.endDate).toLocaleDateString(locale) : ""]
            .filter(Boolean)
            .join(" — ")
        }]
      : []),
    ...(Number(summary?.maxDailyDistance || 0) > 0
      ? [{ label: t("planner.summary.maxDist"), value: `${summary?.maxDailyDistance} km` }]
      : []),
    ...(Number(summary?.maxDailyDriveHours || 0) > 0
      ? [{ label: t("planner.route.maxDriveTime"), value: `${summary?.maxDailyDriveHours} h` }]
      : []),
    ...(summary?.dailyLimitPriority
      ? [{ label: t("planner.route.limitPriority.label"), value: t(`planner.route.limitPriority.options.${summary.dailyLimitPriority}`) }]
      : []),
    {
      label: t("planner.summary.style"),
      value: summary?.travelPace ? t(`planner.route.travelPace.options.${summary.travelPace}`) : t("planner.summary.notSelected")
    },
    {
      label: t("planner.accommodation.quietPlaces.label"),
      value: summary?.quietPlaces ? t("prompt.labels.yes") : t("planner.summary.notSelected")
    },
  ];

  const overviewRoute = useMemo(() => {
    const routeStops = [
      summary?.startPoint,
      ...(summary?.stages?.map((stage) => stage.destination?.trim()).filter(Boolean) || []),
      summary?.destination,
    ].filter(Boolean) as string[];

    if (summary?.targetRegions?.trim()) {
      routeStops.push(summary.targetRegions.trim());
    }

    if (!routeStops.length) return t("planner.summary.notSpecified");
    if (routeStops.length <= 4) return routeStops.join(" → ");
    return `${routeStops.slice(0, 3).join(" → ")} → … → ${routeStops[routeStops.length - 1]}`;
  }, [summary, t]);

  const overviewDays = useMemo(() => {
    if (!summary?.startDate || !summary?.endDate) return t("planner.summary.notSelected");
    const start = new Date(summary.startDate);
    const end = new Date(summary.endDate);
    const diff = end.getTime() - start.getTime();
    if (Number.isNaN(diff) || diff < 0) return t("planner.summary.notSelected");
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    return t("planner.output.overview.daysValue", { count: days });
  }, [summary, t]);

  const overviewDrivingFocus = useMemo(() => {
    if (summary?.travelPace) {
      return t(`planner.route.travelPace.options.${summary.travelPace}`);
    }
    if (summary?.dailyLimitPriority) {
      return t(`planner.route.limitPriority.options.${summary.dailyLimitPriority}`);
    }
    if (Number(summary?.maxDailyDriveHours || 0) > 0) {
      return t("planner.route.limitPriority.options.time");
    }
    if (Number(summary?.maxDailyDistance || 0) > 0) {
      return t("planner.route.limitPriority.options.distance");
    }
    return t("planner.summary.notSelected");
  }, [summary, t]);

  const overviewBudget = useMemo(() => {
    if (Number(summary?.avgCampsitePriceMax || 0) > 0) {
      return `${t("prompt.labels.budgetUpTo")} ${summary?.avgCampsitePriceMax}€`;
    }
    return t("planner.summary.notSelected");
  }, [summary?.avgCampsitePriceMax, t]);

  const overviewScenicStops = useMemo(() => {
    if (summary?.preferScenicLongerStops) return t("prompt.labels.yes");
    if (summary?.targetRegions?.trim()) return t("planner.output.overview.onRequest");
    return t("planner.summary.notSelected");
  }, [summary, t]);

  const overviewCards = [
    { id: "route", icon: MapIcon, label: t("planner.output.overview.route"), value: overviewRoute },
    { id: "duration", icon: CalendarRange, label: t("planner.output.overview.duration"), value: overviewDays },
    { id: "drivingFocus", icon: RouteIcon, label: t("planner.output.overview.drivingFocus"), value: overviewDrivingFocus },
    { id: "dailyWindow", icon: Clock3, label: t("planner.output.overview.dailyWindow"), value: [
      Number(summary?.maxDailyDistance || 0) > 0 ? `${summary?.maxDailyDistance} km` : "",
      Number(summary?.maxDailyDriveHours || 0) > 0 ? `${summary?.maxDailyDriveHours} h` : "",
    ].filter(Boolean).join(" / ") || t("planner.summary.notSelected") },
    { id: "budget", icon: Wallet, label: t("planner.output.overview.budget"), value: overviewBudget },
    { id: "scenic", icon: Trees, label: t("planner.output.overview.longerStops"), value: overviewScenicStops },
  ];

  const spotlightCards = useMemo(() => {
    if (!useDirectAI) return [];

    const safeLeg = stageRiskItems.find((item) => item.level === "safe");
    const criticalLeg = stageRiskItems.find((item) => item.level === "critical") || stageRiskItems.find((item) => item.level === "caution");
    const overnightLine = analysisLines.find((line) => /^(durchreise-stopp|2-3-nächte-platz|urlaubsziel|transit stop|2-3 night stay|holiday base|halte de transit|séjour 2-3 nuits|base de vacances|sosta di passaggio|soggiorno di 2-3 notti|base vacanza|doorreisstop|plek voor 2-3 nachten|vakantiebasis)\b/i.test(line));
    const overnightMatch = overnightLine?.match(/^(?:durchreise-stopp|2-3-nächte-platz|urlaubsziel|transit stop|2-3 night stay|holiday base|halte de transit|séjour 2-3 nuits|base de vacances|sosta di passaggio|soggiorno di 2-3 notti|base vacanza|doorreisstop|plek voor 2-3 nachten|vakantiebasis)\s*:?\s*(.+)$/i);
    const recommendationLine = analysisLines.find((line) =>
      /^(top-empfehlung|empfehlung|fazit|recommendation|summary|conclusion|recommandation|conclusione|aanbeveling|samenvatting)\b/i.test(line),
    );
    const recommendationMatch = recommendationLine?.match(/^[^:–-]+[:–-]\s*(.+)$/);
    const topRecommendation = recommendationMatch?.[1]?.trim()
      || overnightMatch?.[1]?.trim()
      || (summary?.targetRegions?.trim()
        ? (summary.preferScenicLongerStops ? `${summary.targetRegions.trim()} — ${t("planner.output.overview.onRequest")}` : summary.targetRegions.trim())
        : overviewRoute);

    return [
      {
        id: "top",
        icon: Award,
        label: t("planner.output.spotlight.topRecommendation"),
        value: topRecommendation || t("planner.summary.notSelected"),
      },
      {
        id: "bestLeg",
        icon: RouteIcon,
        label: t("planner.output.spotlight.bestLeg"),
        value: safeLeg ? safeLeg.detail : t("planner.output.spotlight.notFound"),
      },
      {
        id: "overnight",
        icon: BedDouble,
        label: t("planner.output.spotlight.bestOvernight"),
        value: overnightMatch?.[1]?.trim().replace(/^[,.;:\s]+/, "") || t("planner.output.spotlight.notFound"),
      },
      {
        id: "critical",
        icon: TriangleAlert,
        label: t("planner.output.spotlight.criticalLeg"),
        value: criticalLeg ? criticalLeg.detail : t("planner.output.spotlight.notFound"),
      },
    ];
  }, [analysisLines, overviewRoute, stageRiskItems, summary, t, useDirectAI]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-foreground dark:text-white tracking-tighter drop-shadow-sm">
            {loadingMessage || (useDirectAI ? t("planner.loading.ai") : t("planner.loading.prompt"))}
          </h3>
          <p className="text-muted-foreground dark:text-white text-base sm:text-lg font-semibold drop-shadow-sm">
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
        <AlertDescription className="font-bold text-lg text-foreground dark:text-white ml-2">{aiError}</AlertDescription>
      </Alert>
    );
  }

  if (!output) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="output-scope space-y-6"
    >
      <div className="relative group">
        <div
          className={`relative overflow-hidden ${
            isMobile
              ? "space-y-4"
              : "space-y-5"
          }`}
        >
          <div className="output-header relative flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-[2rem] px-4 sm:px-6 py-4 sm:py-5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <div className="w-11 h-11 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-[0_12px_32px_rgba(255,128,0,0.16)]">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-semibold tracking-[0.08em] text-primary leading-none mb-1.5">
                  {useDirectAI ? `AI Route (${aiModel})` : t("planner.output.customPrompt")}
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-foreground dark:text-white tracking-tight leading-none">
                  {useDirectAI ? t("planner.output.title.direct") : t("planner.output.title.prompt")}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground dark:text-white/55 font-medium">
                  {useDirectAI ? t("planner.output.results.title") : t("planner.output.nextSteps.description")}
                </p>
                {gpxBlocksSwapped && (
                  <span className="mt-1.5 text-[9px] font-semibold tracking-[0.06em] text-primary/80">
                    {t("planner.output.actions.gpxSwapNote")}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 w-full lg:w-auto">
              <Button
                onClick={handleCopy}
                className="h-10 px-3 sm:px-4 rounded-xl border-2 border-border bg-card/70 hover:bg-card text-foreground dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/10 dark:text-white font-semibold text-[10px] tracking-[0.04em] transition-all group/btn shadow-sm"
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
                      className="h-10 px-3 sm:px-4 rounded-xl border-2 border-primary/20 bg-primary/10 hover:bg-primary/20 hover:border-primary/40 text-primary font-semibold text-[10px] tracking-[0.04em] transition-all"
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
                      className="h-10 px-3 sm:px-4 rounded-xl border-2 border-primary/20 bg-primary/10 hover:bg-primary/20 hover:border-primary/40 text-primary font-semibold text-[10px] tracking-[0.04em] transition-all"
                    >
                      <Download className="w-3 h-3 mr-1 sm:mr-2" />
                      {t("planner.output.actions.downloadGarmin")}
                    </Button>
                  )}
                </>
              )}

              <Button
                onClick={handlePrint}
                className="h-10 px-3 sm:px-4 rounded-xl border-2 border-border bg-card/70 hover:bg-card text-foreground dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/10 dark:text-white font-semibold text-[10px] tracking-[0.04em] transition-all group/btn"
              >
                <Printer className="w-3 h-3 mr-1 sm:mr-2 text-primary transition-colors" />
                {t("buttons.print")}
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5">
            {!useDirectAI && (
              <div className="flex flex-col items-center gap-3 rounded-[1.4rem] border border-primary/16 bg-[linear-gradient(180deg,rgba(241,244,250,0.96),rgba(233,238,247,0.96))] px-4 py-5 text-center dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(60,71,93,0.72),rgba(44,53,70,0.78))]">
                <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                  <Heart className="h-3.5 w-3.5 fill-current" />
                  {t("planner.summary.save.coffeeBadge")}
                </div>
                <div className="min-w-0">
                  <div className="text-base font-black tracking-tight text-foreground dark:text-white">
                    {t("planner.summary.save.coffeeTagline")}
                  </div>
                </div>
                <a
                  href="https://www.buymeacoffee.com/campingroute"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-primary/45 bg-primary px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_12px_24px_rgba(201,123,0,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/92 hover:shadow-[0_16px_28px_rgba(201,123,0,0.32)]"
                >
                  <span className="text-base leading-none" aria-hidden="true">☕</span>
                  {t("planner.summary.save.coffee")}
                  <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </a>
                <p className="max-w-3xl text-xs sm:text-sm leading-relaxed text-muted-foreground dark:text-white/68 md:whitespace-nowrap">
                  {t("planner.summary.save.coffeeHint")}
                </p>
              </div>
            )}

            {summary && (
              <div className="space-y-3 sm:space-y-4">
                {useDirectAI && spotlightCards.length > 0 && (
                  <div className={`p-4 sm:p-5 ${isMobile ? "rounded-[1.25rem]" : "output-panel rounded-[1.5rem]"}`}>
                    <div className="text-[9px] font-semibold tracking-[0.08em] text-primary mb-3">
                      {t("planner.output.spotlight.title")}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {spotlightCards.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.id} className="output-card rounded-2xl px-3.5 py-3">
                            <div className="flex items-center gap-2.5 mb-1.5">
                              <div className="w-8 h-8 rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center text-primary">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="text-[9px] font-semibold tracking-[0.05em] text-muted-foreground dark:text-white/45">
                                {item.label}
                              </div>
                            </div>
                            <div className="text-sm sm:text-[15px] font-bold text-foreground dark:text-white/92 leading-snug">
                              {item.value}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className={`p-4 sm:p-5 ${isMobile ? "rounded-[1.25rem]" : "output-panel rounded-[1.5rem]"}`}>
                  <div className="text-[9px] font-semibold tracking-[0.08em] text-primary mb-3">
                    {t("planner.output.overview.title")}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    {overviewCards.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.id} className="output-card rounded-2xl px-3.5 py-3">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <div className="w-8 h-8 rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center text-primary">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-[9px] font-semibold tracking-[0.05em] text-muted-foreground dark:text-white/45">
                              {item.label}
                            </div>
                          </div>
                          <div className="text-sm sm:text-[15px] font-bold text-foreground dark:text-white/92 leading-snug">
                            {item.value}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={`p-4 sm:p-5 ${isMobile ? "rounded-[1.25rem]" : "output-panel rounded-[1.5rem]"}`}>
                  <div className="text-[9px] font-semibold tracking-[0.08em] text-primary mb-3">
                  {t("planner.output.summary.title")}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    {summaryItems.map((item) => (
                      <div key={item.label} className="output-card rounded-2xl px-3.5 py-3">
                        <div className="text-[9px] font-semibold tracking-[0.05em] text-muted-foreground dark:text-white/45 mb-2">
                          {item.label}
                        </div>
                        <div className="text-sm sm:text-base font-bold text-foreground dark:text-white/90 leading-snug">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {useDirectAI && stageRiskItems.length > 0 && (
              <div className={`p-4 sm:p-5 ${isMobile ? "rounded-[1.25rem]" : "output-panel rounded-[1.5rem]"}`}>
                <div className="text-[9px] font-semibold tracking-[0.08em] text-primary mb-3">
                  {t("planner.output.risk.title")}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {stageRiskItems.map((item, index) => {
                    const config = item.level === "safe"
                      ? {
                          dot: "bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.55)]",
                          badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
                          label: t("planner.output.risk.safe"),
                        }
                      : item.level === "caution"
                        ? {
                            dot: "bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.5)]",
                            badge: "border-amber-400/25 bg-amber-400/10 text-amber-300",
                            label: t("planner.output.risk.caution"),
                          }
                        : {
                            dot: "bg-red-400 shadow-[0_0_16px_rgba(248,113,113,0.5)]",
                            badge: "border-red-400/25 bg-red-400/10 text-red-300",
                            label: t("planner.output.risk.critical"),
                          };

                    return (
                      <div key={`${item.title}-${index}`} className="output-card rounded-2xl px-3.5 py-3">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`mt-1 h-3 w-3 rounded-full shrink-0 ${config.dot}`} />
                            <div className="text-sm sm:text-base font-bold text-foreground dark:text-white/92 leading-snug">
                              {item.title}
                            </div>
                          </div>
                          <span className={`shrink-0 rounded-full border px-3 py-1 text-[9px] font-semibold tracking-[0.05em] ${config.badge}`}>
                            {config.label}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground dark:text-white/68 leading-5 sm:leading-6">
                          {item.detail}
                        </div>
                      </div>
                    );
                  })}
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
                    className="rounded-full border border-border bg-card/70 px-4 py-2 text-[9px] font-semibold tracking-[0.05em] text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-foreground dark:border-white/10 dark:bg-white/8 dark:text-white/70 dark:hover:text-white"
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            )}
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl p-2 ${isMobile ? "bg-transparent border-0" : "output-togglebar"}`}>
              <div className="text-[9px] font-semibold tracking-[0.05em] text-muted-foreground dark:text-white/45 px-3 py-1 sm:py-0">
                {t("planner.output.view.label")}
              </div>
              <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center">
                <button
                  type="button"
                  onClick={() => setOutputView("formatted")}
                  className={`min-w-0 rounded-xl px-3 sm:px-4 py-2 text-[10px] font-semibold tracking-[0.04em] transition-colors ${
                    outputView === "formatted"
                      ? "bg-primary text-white"
                      : "bg-card/70 text-muted-foreground hover:bg-card hover:text-foreground dark:bg-white/8 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  {t("planner.output.view.formatted")}
                </button>
                <button
                  type="button"
                  onClick={() => setOutputView("raw")}
                  className={`min-w-0 rounded-xl px-3 sm:px-4 py-2 text-[10px] font-semibold tracking-[0.04em] transition-colors ${
                    outputView === "raw"
                      ? "bg-primary text-white"
                      : "bg-card/70 text-muted-foreground hover:bg-card hover:text-foreground dark:bg-white/8 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  {t("planner.output.view.raw")}
                </button>
              </div>
            </div>
            {useDirectAI ? (
            <div className={`space-y-5 px-4 sm:px-6 py-5 ${isMobile ? "rounded-[1.25rem]" : "output-panel rounded-[1.5rem]"}`}>
                <div className="flex items-center gap-3 pb-4 border-b border-border/80 dark:border-white/10">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_16px_rgba(255,128,0,0.8)]" />
                  <div className="text-[9px] font-semibold tracking-[0.06em] text-muted-foreground dark:text-white/45">
                    {t("planner.output.title.direct")}
                  </div>
                </div>
                {outputView === "formatted" ? (
                  <div
                    className="output-formatted whitespace-pre-wrap font-sans text-sm sm:text-[15px] md:text-base leading-6 sm:leading-7 selection:bg-primary/30 selection:text-white outline-none"
                    dangerouslySetInnerHTML={{ __html: formattedHtml }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm md:text-base text-foreground dark:text-white/90 leading-6 sm:leading-relaxed selection:bg-primary/30 selection:text-white outline-none">
                    {outputBody}
                  </pre>
                )}
              </div>
            ) : (
            <div className={`space-y-5 px-4 sm:px-6 py-5 ${isMobile ? "rounded-[1.25rem]" : "output-panel rounded-[1.5rem]"}`}>
                <div className="flex items-center gap-3 pb-4 border-b border-border/80 dark:border-white/10">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_16px_rgba(255,128,0,0.8)]" />
                  <div className="text-[9px] font-semibold tracking-[0.06em] text-muted-foreground dark:text-white/45">
                    {t("planner.output.title.prompt")}
                  </div>
                </div>
                {outputView === "formatted" ? (
                  <div
                    className="output-formatted font-sans text-sm sm:text-[15px] md:text-base leading-6 sm:leading-7 selection:bg-primary/30 selection:text-white outline-none"
                    dangerouslySetInnerHTML={{ __html: formattedHtml }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm md:text-base text-foreground dark:text-white/90 leading-6 sm:leading-relaxed selection:bg-primary/30 selection:text-white outline-none">
                    {outputBody}
                  </pre>
                )}
              </div>
            )}

            <div className={`${isMobile ? "rounded-[1.25rem]" : "output-panel rounded-[1.5rem]"} overflow-hidden`}>
              <button
                type="button"
                onClick={() => setChecklistOpen((open) => !open)}
                className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-3.5 text-left"
              >
                <div>
                  <div className="text-[9px] font-semibold tracking-[0.08em] text-primary mb-1">
                    {t("planner.output.checklist.title")}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground dark:text-white/55">
                    {t("planner.output.checklist.items.water")} · {t("planner.output.checklist.items.power")} · {t("planner.output.checklist.items.gas")}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground dark:text-white/55 transition-transform ${checklistOpen ? "rotate-180" : ""}`} />
              </button>
              {checklistOpen && (
                <div className="px-4 sm:px-5 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-foreground dark:text-white/78 font-medium">
                    <div className="output-checklist-item rounded-2xl px-3.5 py-2.5">• {t("planner.output.checklist.items.water")}</div>
                    <div className="output-checklist-item rounded-2xl px-3.5 py-2.5">• {t("planner.output.checklist.items.power")}</div>
                    <div className="output-checklist-item rounded-2xl px-3.5 py-2.5">• {t("planner.output.checklist.items.gas")}</div>
                    <div className="output-checklist-item rounded-2xl px-3.5 py-2.5">• {t("planner.output.checklist.items.waste")}</div>
                    <div className="output-checklist-item rounded-2xl px-3.5 py-2.5">• {t("planner.output.checklist.items.documents")}</div>
                    <div className="output-checklist-item rounded-2xl px-3.5 py-2.5">• {t("planner.output.checklist.items.apps")}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!useDirectAI && (
        <div className="output-shell relative rounded-[3rem] overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 py-6 sm:py-8 gap-6 output-header">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-lg">
                <ChevronRight className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold tracking-[0.12em] text-primary leading-none mb-1">
                  {t("planner.output.nextSteps.title")}
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-foreground dark:text-white tracking-tight leading-none">
                  {t("planner.output.customPrompt")}
                </h4>
                <p className="text-muted-foreground dark:text-white/70 text-sm sm:text-base font-semibold">
                  {t("planner.output.nextSteps.description")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
              <Button
                onClick={handleCopy}
                className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl border-2 border-border bg-card/70 hover:bg-card text-foreground dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/10 dark:text-white font-black text-[9px] tracking-widest transition-all group/btn shrink-0"
              >
                {copied ? <Check className="w-3 h-3 mr-1 sm:mr-2 text-green-400" /> : <Copy className="w-3 h-3 mr-1 sm:mr-2 text-primary transition-colors" />}
                {t("buttons.copy")}
              </Button>
              <Button
                onClick={handlePrint}
                className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl border-2 border-border bg-card/70 hover:bg-card text-foreground dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/10 dark:text-white font-black text-[9px] tracking-widest transition-all group/btn shrink-0"
              >
                <Printer className="w-3 h-3 mr-1 sm:mr-2 text-primary transition-colors" />
                {t("buttons.print")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {useDirectAI && (
        <div className="output-shell relative rounded-[3rem] overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 py-6 sm:py-8 gap-6 output-header">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold tracking-[0.12em] text-primary leading-none mb-1">
                  {useDirectAI ? t("planner.output.results.title") : t("planner.output.customPrompt")}
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-foreground dark:text-white tracking-tight leading-none">
                  {useDirectAI ? t("planner.output.title.direct") : t("planner.output.title.prompt")}
                </h4>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
              <Button
                onClick={handleCopy}
                className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl border-2 border-border bg-card/70 hover:bg-card text-foreground dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/10 dark:text-white font-black text-[9px] tracking-widest transition-all group/btn shrink-0"
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
                      className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl border-2 border-primary/20 bg-primary/10 hover:bg-primary/20 hover:border-primary/40 text-primary font-black text-[9px] tracking-widest transition-all shrink-0"
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
                      className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl border-2 border-primary/20 bg-primary/10 hover:bg-primary/20 hover:border-primary/40 text-primary font-black text-[9px] tracking-widest transition-all shrink-0"
                    >
                      <Download className="w-3 h-3 mr-1 sm:mr-2" />
                      {t("planner.output.actions.downloadGarmin")}
                    </Button>
                  )}
                </>
              )}

              <Button
                onClick={handlePrint}
                className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-xl border-2 border-border bg-card/70 hover:bg-card text-foreground dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/10 dark:text-white font-black text-[9px] tracking-widest transition-all group/btn shrink-0"
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
