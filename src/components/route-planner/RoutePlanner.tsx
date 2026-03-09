import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { Route, Bot, Truck, FileText, Calendar, Clock3, Users, Sparkles, Wallet, Save, FolderOpen, Trash2, ChevronRight, Copy, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormData, AISettings, RouteStage, initialFormData, initialAISettings } from "@/types/routePlanner";
import { generatePrompt, callAIAPI } from "@/lib/promptGenerator";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Statische Importe für ALLES was zum Formular gehört - SICHERHEIT GEHT VOR
import { HeroSection } from "./HeroSection";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { AISettingsSection } from "./AISettingsSection";
import { RouteSection } from "./RouteSection";
import { RouteOptimizationSection } from "./RouteOptimizationSection";
import { VehicleSection } from "./VehicleSection";
import { AccommodationSection } from "./AccommodationSection";
import { OutputSection } from "./OutputSection";
import { FeedbackModal } from "./FeedbackModal";

// Nur die Sektionen unter dem Formular bleiben Lazy
const FeaturesSection = lazy(() => import("./FeaturesSection").then(m => ({ default: m.FeaturesSection })));
const TestimonialsSection = lazy(() => import("./TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const RouteExampleSection = lazy(() => import("./RouteExampleSection").then(m => ({ default: m.RouteExampleSection })));
const FAQSection = lazy(() => import("./FAQSection").then(m => ({ default: m.FAQSection })));

const getStageMinimumDate = (stages: RouteStage[], index: number, startDate: string) => {
  if (index === 0) return startDate;
  return stages[index - 1]?.departureDate || stages[index - 1]?.arrivalDate || startDate;
};

const isMeaningfulStage = (stage: Partial<RouteStage> | undefined) => {
  if (!stage) return false;
  return Boolean(
    stage.destination?.trim() ||
    stage.booked ||
    stage.detailsEnabled ||
    stage.arrivalDate ||
    stage.arrivalTime ||
    stage.departureDate ||
    stage.departureTime
  );
};

const normalizeOptionalSummaryText = (value: string | undefined, placeholders: string[]) => {
  const trimmed = value?.trim() || "";
  if (!trimmed) return "";
  return placeholders.includes(trimmed) ? "" : trimmed;
};

const normalizeStoredDateValue = (value: string | undefined) => {
  const trimmed = value?.trim() || "";
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const localizedMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!localizedMatch) return trimmed;

  const [, day, month, year] = localizedMatch;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const normalizeStoredAISettings = (settings?: Partial<AISettings>): AISettings => ({
  ...initialAISettings,
  ...settings,
  aiProvider: "openai",
  apiKey: "",
});

const normalizePlannerDates = (
  formData: FormData,
  patch: Partial<FormData>,
  options: { didStartDateChange?: boolean } = {},
): FormData => {
  const nextFormData = { ...formData };
  const shouldNormalizeEndDate = !!options.didStartDateChange;
  const shouldNormalizeStages =
    !!options.didStartDateChange ||
    Object.prototype.hasOwnProperty.call(patch, "stages");

  if (nextFormData.startDate && shouldNormalizeEndDate) {
    if (nextFormData.endDate && nextFormData.endDate < nextFormData.startDate) {
      nextFormData.endDate = nextFormData.startDate;
    }
  }

  if (nextFormData.startDate && shouldNormalizeStages) {
    nextFormData.stages = nextFormData.stages.map((stage, index, currentStages) => {
      if (!stage.detailsEnabled) {
        return stage;
      }

      const nextStage = { ...stage };
      const minimumDate = getStageMinimumDate(currentStages, index, nextFormData.startDate);

      if (minimumDate) {
        if (nextStage.arrivalDate && nextStage.arrivalDate < minimumDate) {
          nextStage.arrivalDate = minimumDate;
        }
      }

      const departureMinimumDate = nextStage.arrivalDate || minimumDate;
      if (departureMinimumDate) {
        if (nextStage.departureDate && nextStage.departureDate < departureMinimumDate) {
          nextStage.departureDate = departureMinimumDate;
        }
      }

      return nextStage;
    });
  }

  return nextFormData;
};

export function RoutePlanner() {
  const { t, i18n } = useTranslation();
  const SAVED_PLANS_KEY = "cr_saved_plans_v1";
  const FEEDBACK_LATER_KEY = "cr_feedback_prompt_later_until";
  const FEEDBACK_DONE_KEY = "cr_feedback_submitted_at";
  const FEEDBACK_RELEASE_KEY = "cr_feedback_release_seen_version";
  const MAX_SAVED_PLANS = 5;

  type SavedPlan = {
    id: string;
    label: string;
    savedAt: number;
    formData: FormData;
    aiSettings: Omit<AISettings, "apiKey"> & { apiKey?: string };
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [aiSettings, setAISettings] = useState<AISettings>(initialAISettings);
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [aiError, setAIError] = useState<string>('');
  const [aiModel, setAiModel] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [activeSavedPlanId, setActiveSavedPlanId] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [feedbackMode, setFeedbackMode] = useState<"prompt" | "route">("prompt");
  const [feedbackEligible, setFeedbackEligible] = useState<boolean>(false);
  const [releaseVersion, setReleaseVersion] = useState<string>("");
  const [promptReadyToCopy, setPromptReadyToCopy] = useState<boolean>(false);
  
  const outputSectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const notSpecifiedLabel = t("planner.summary.notSpecified");
  const summaryTextPlaceholders = [
    notSpecifiedLabel,
    "Nicht angegeben",
    "Not specified",
    "Non spécifié",
    "Non specificato",
    "Niet opgegeven",
  ];
  const summaryPrimaryDestination = formData.destination;
  const selectedStageNames = formData.stages
    .map((stage) => stage.destination?.trim())
    .filter(Boolean) as string[];
  const targetRegionsSummary = normalizeOptionalSummaryText(formData.targetRegions, summaryTextPlaceholders);
  const locale = i18n.language.startsWith('de')
    ? 'de-DE'
    : i18n.language.startsWith('nl')
      ? 'nl-NL'
      : i18n.language.startsWith('fr')
        ? 'fr-FR'
        : i18n.language.startsWith('it')
          ? 'it-IT'
          : 'en-US';
  const hasDateWindow = !!formData.startDate || !!formData.endDate;
  const hasDistanceLimit = Number(formData.maxDailyDistance || 0) > 0;
  const hasDriveTimeLimit = Number(formData.maxDailyDriveHours || 0) > 0;
  const hasValidDirectApiKey = !!aiSettings.apiKey?.trim() && /^[A-Za-z0-9-_]{20,}$/.test(aiSettings.apiKey);
  const plannerSectionClass = "theme-band -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-7 rounded-[2rem] sm:rounded-[2.5rem]";
  const validActivityValues = new Set([
    "nature",
    "hiking",
    "cycling",
    "bathing",
    "cityCulture",
    "gastronomy",
    "relaxation",
  ]);

  const sanitizeFormData = (data: Partial<FormData> & { travelCompanions?: string[]; dogFriendly?: boolean }): FormData => {
    const legacyDogFriendly = typeof data.dogFriendly === "boolean"
      ? data.dogFriendly
      : ((data.travelCompanions as string[] | undefined) || []).includes("pets");
    const facilities = Array.isArray(data.facilities) ? [...data.facilities] : [];
    const normalizedStages = ((data.stages as RouteStage[] | undefined) || [])
      .filter(isMeaningfulStage)
      .map((stage) => ({
        ...stage,
        arrivalDate: normalizeStoredDateValue(stage.arrivalDate),
        departureDate: normalizeStoredDateValue(stage.departureDate),
      }));

    if (legacyDogFriendly && !facilities.includes("dogs")) {
      facilities.push("dogs");
    }

    return {
      ...initialFormData,
      ...data,
      startDate: normalizeStoredDateValue(data.startDate),
      endDate: normalizeStoredDateValue(data.endDate),
      destinationDepartureDate: normalizeStoredDateValue(data.destinationDepartureDate),
      stages: normalizedStages,
      facilities,
      activities: ((data.activities as string[] | undefined) || []).filter((value) =>
        validActivityValues.has(value)
      ),
    };
  };

  const sanitizeAISettings = (settings: AISettings): AISettings => normalizeStoredAISettings(settings);

  const persistSavedPlans = (plans: SavedPlan[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(plans));
  };

  const buildSavedPlanLabel = (data: FormData) => {
    const start = data.startPoint?.trim() || t("planner.summary.notSpecified");
    const destination = data.destination?.trim() || t("planner.summary.notSpecified");
    const firstStage = data.stages.find((stage) => stage.destination?.trim())?.destination?.trim();
    const region = normalizeOptionalSummaryText(data.targetRegions, summaryTextPlaceholders);
    const suffix = firstStage || region || "";
    return suffix ? `${start} → ${destination} · ${suffix}` : `${start} → ${destination}`;
  };

  const getOpenAIModelLabel = (model: string) => {
    if (model === "gpt-5.4") return "ChatGPT 5.4";
    return "ChatGPT 5.2";
  };

  const getSummaryModelLabel = () => {
    if (!aiSettings.useDirectAI) return "—";
    return `OpenAI ${getOpenAIModelLabel(aiSettings.openaiModel)}`;
  };

  const saveCurrentPlan = (overrideId?: string) => {
    const nextEntry: SavedPlan = {
      id: overrideId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`),
      label: buildSavedPlanLabel(formData),
      savedAt: Date.now(),
      formData: sanitizeFormData(formData),
      aiSettings: sanitizeAISettings(aiSettings),
    };

    const nextPlans = overrideId
      ? savedPlans.map((plan) => (plan.id === overrideId ? nextEntry : plan))
      : [nextEntry, ...savedPlans].slice(0, MAX_SAVED_PLANS);

    setSavedPlans(nextPlans);
    setActiveSavedPlanId(nextEntry.id);
    persistSavedPlans(nextPlans);
    toast.success(overrideId ? t("planner.summary.savedPlans.updated") : t("planner.summary.savedPlans.saved"));
  };

  const duplicateSavedPlan = (plan: SavedPlan) => {
    const duplicateEntry: SavedPlan = {
      ...plan,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      label: `${plan.label} · ${t("planner.summary.savedPlans.variantSuffix")}`,
      savedAt: Date.now(),
    };

    const nextPlans = [duplicateEntry, ...savedPlans].slice(0, MAX_SAVED_PLANS);
    setSavedPlans(nextPlans);
    setActiveSavedPlanId(duplicateEntry.id);
    persistSavedPlans(nextPlans);

    setActiveSavedPlanId(plan.id);
    setFormData(sanitizeFormData(plan.formData));
    setAISettings(normalizeStoredAISettings(plan.aiSettings));
    setOutput("");
    setAIError("");
    toast.success(t("planner.summary.savedPlans.duplicated"));
    requestAnimationFrame(() => scrollToPlannerContent());
  };

  const loadSavedPlan = (plan: SavedPlan) => {
    setActiveSavedPlanId(plan.id);
    setFormData(sanitizeFormData(plan.formData));
    setAISettings(normalizeStoredAISettings(plan.aiSettings));
    setOutput("");
    setAIError("");
    toast.success(t("planner.summary.savedPlans.loaded"));
    requestAnimationFrame(() => scrollToPlannerContent());
  };

  const deleteSavedPlan = (planId: string) => {
    const nextPlans = savedPlans.filter((plan) => plan.id !== planId);
    setSavedPlans(nextPlans);
    if (activeSavedPlanId === planId) {
      setActiveSavedPlanId(null);
    }
    persistSavedPlans(nextPlans);
    toast.success(t("planner.summary.savedPlans.deleted"));
  };

  const clearPlannerData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SAVED_PLANS_KEY);
    }
    setSavedPlans([]);
    setActiveSavedPlanId(null);
    setFormData(initialFormData);
    setOutput("");
    setAIError("");
    toast.success(t("planner.summary.savedPlans.clearedAll"));
  };

  const exportCurrentPlanToFile = () => {
    const exportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      formData: sanitizeFormData(formData),
      aiSettings: sanitizeAISettings(aiSettings),
    };

    const safeStart = formData.startPoint?.trim().replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/^-+|-+$/g, "");
    const safeDestination = formData.destination?.trim().replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/^-+|-+$/g, "");
    const nameCore = [safeStart, safeDestination].filter(Boolean).join("_") || "planung";
    const dateStamp = new Date().toISOString().slice(0, 10);
    const fileName = `campingroute-${nameCore}-${dateStamp}.json`;

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(t("planner.summary.savedPlans.exported"));
  };

  const triggerPlanImport = () => {
    importFileRef.current?.click();
  };

  const importPlanFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      if (!parsed?.formData) {
        throw new Error("invalid");
      }

      setActiveSavedPlanId(null);
      setFormData(sanitizeFormData(parsed.formData));
      setAISettings(normalizeStoredAISettings(parsed.aiSettings || {}));
      setOutput("");
      setAIError("");
      setPromptReadyToCopy(false);
      toast.success(t("planner.summary.savedPlans.imported"));
      requestAnimationFrame(() => scrollToPlannerContent());
    } catch {
      toast.error(t("planner.summary.savedPlans.importError"));
    } finally {
      event.target.value = "";
    }
  };

  // AUTO-OPEN LOGIC
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('plan') === 'true') {
      setShowForm(true);
      setTimeout(() => {
        const element = document.getElementById('planner');
        if (element) {
          const yOffset = -100;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 500);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const handleOpenFeedback = () => {
      setFeedbackMode(aiSettings.useDirectAI ? "route" : "prompt");
      setShowFeedbackModal(true);
    };

    window.addEventListener("open-feedback", handleOpenFeedback);
    return () => window.removeEventListener("open-feedback", handleOpenFeedback);
  }, [aiSettings.useDirectAI]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(SAVED_PLANS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        localStorage.removeItem(SAVED_PLANS_KEY);
        return;
      }
      const normalized = parsed
        .filter((entry) => entry?.id && entry?.formData)
        .map((entry) => ({
          id: String(entry.id),
          label: String(entry.label || buildSavedPlanLabel(sanitizeFormData(entry.formData))),
          savedAt: Number(entry.savedAt || Date.now()),
          formData: sanitizeFormData(entry.formData),
          aiSettings: normalizeStoredAISettings(entry.aiSettings || {}),
        }))
        .sort((a, b) => b.savedAt - a.savedAt)
        .slice(0, MAX_SAVED_PLANS);
      setSavedPlans(normalized);
      setActiveSavedPlanId(null);
    } catch {
      localStorage.removeItem(SAVED_PLANS_KEY);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadVersion = async () => {
      try {
        const response = await fetch(`/version.json?ts=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) return;
        const versionInfo = await response.json();
        if (!isMounted) return;
        if (typeof versionInfo?.version === "string") {
          setReleaseVersion(versionInfo.version);
        }
      } catch {
        // Ignore version fetch issues. Feedback will fall back to normal cadence.
      }
    };

    loadVersion();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFormChange = (data: Partial<FormData>) => {
    setPromptReadyToCopy(false);
    setFormData(prev => {
      const nextFormData = { ...prev, ...data };
      const didStartDateChange =
        Object.prototype.hasOwnProperty.call(data, "startDate") && data.startDate !== prev.startDate;

      return normalizePlannerDates(nextFormData, data, { didStartDateChange });
    });
  };

  const handleAISettingsChange = (settings: Partial<AISettings>) => {
    setPromptReadyToCopy(false);
    setAISettings(prev => ({ ...prev, ...settings, aiProvider: "openai" }));
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setPromptReadyToCopy(false);
    setFormData(prev => {
      const currentValues = (prev[name as keyof FormData] as string[]) || [];
      if (checked) {
        return { ...prev, [name]: [...currentValues, value] };
      } else {
        return { ...prev, [name]: currentValues.filter(v => v !== value) };
      }
    });
  };

  const scrollToPlannerContent = () => {
    setTimeout(() => {
      const element = formRef.current;
      if (element) {
        const yOffset = -96;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  const scrollToApiKeyInput = () => {
    setTimeout(() => {
      const element = document.getElementById('apiKey');
      if (element) {
        const yOffset = -96;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        if (element instanceof HTMLInputElement) {
          element.focus();
        }
      }
    }, 120);
  };

  const isModelSelected = () => {
    if (!aiSettings.useDirectAI) return true;
    return !!aiSettings.openaiModel;
  };
  const hasInvalidStage = formData.stages.some((stage) => !stage.destination?.trim());
  const isRouteStepValid = !!formData.startPoint && !!formData.destination && !hasInvalidStage;

  const shouldPromptForFeedback = () => {
    if (typeof window === "undefined") return false;
    const submittedAt = Number(localStorage.getItem(FEEDBACK_DONE_KEY) || "0");
    const remindAt = Number(localStorage.getItem(FEEDBACK_LATER_KEY) || "0");
    const seenReleaseVersion = localStorage.getItem(FEEDBACK_RELEASE_KEY) || "";
    const now = Date.now();
    const hasUnseenRelease = !!releaseVersion && seenReleaseVersion !== releaseVersion;

    if (submittedAt && now - submittedAt < 90 * 24 * 60 * 60 * 1000) return false;
    if (hasUnseenRelease) return true;
    if (remindAt && remindAt > now) return false;
    return true;
  };

  const handleFeedbackClose = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(FEEDBACK_LATER_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
      if (releaseVersion) {
        localStorage.setItem(FEEDBACK_RELEASE_KEY, releaseVersion);
      }
    }
    setShowFeedbackModal(false);
  };

  const handleFeedbackSubmit = async ({ rating, message }: { rating: "helpful" | "not_helpful"; message: string }) => {
    const payload = {
      rating,
      message,
      mode: feedbackMode,
      language: i18n.language,
      provider: aiSettings.useDirectAI ? "openai" : "prompt",
      model: aiSettings.useDirectAI ? aiSettings.openaiModel : "prompt-generator",
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Feedback is optional and must not block the planner flow.
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(FEEDBACK_DONE_KEY, String(Date.now()));
      localStorage.removeItem(FEEDBACK_LATER_KEY);
      if (releaseVersion) {
        localStorage.setItem(FEEDBACK_RELEASE_KEY, releaseVersion);
      }
    }

    setShowFeedbackModal(false);
    toast.success(t("planner.feedback.thanks"));
  };

  const handleOutputEngagement = () => {
    if (!feedbackEligible || !shouldPromptForFeedback()) return;
    setFeedbackMode(aiSettings.useDirectAI ? "route" : "prompt");
    setShowFeedbackModal(true);
    setFeedbackEligible(false);
  };

  const trackGeneration = async (mode: "prompt" | "route") => {
    if (import.meta.env.DEV) {
      return;
    }

    try {
      await fetch("/api/count-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode }),
      });
    } catch {
      // Stats tracking must never block the planner flow.
    }
  };

  const normalizeAIOutput = (text: string) => {
    let normalized = text;

    // Normalize OpenCampingMap fallback links generated as #position=lat,lon,zoom
    // to the stable hash format #zoom/lat/lon.
    normalized = normalized.replace(
      /https?:\/\/opencampingmap\.org\/#position=([+-]?\d+(?:\.\d+)?),([+-]?\d+(?:\.\d+)?)(?:,(\d{1,2}))?/gi,
      (_match, lat: string, lon: string, zoom?: string) =>
        `https://opencampingmap.org/#${zoom || "16"}/${lat}/${lon}`,
    );
    normalized = normalized.replace(
      /https?:\/\/opencampingmap\.org\/#position=(\d{1,2})\/([+-]?\d+(?:\.\d+)?)\/([+-]?\d+(?:\.\d+)?)/gi,
      (_match, zoom: string, lat: string, lon: string) =>
        `https://opencampingmap.org/#${zoom}/${lat}/${lon}`,
    );

    // Force exactly two blank lines between adjacent GPX blocks.
    normalized = normalized.replace(/<\/gpx>\s*<gpx/gi, "</gpx>\n\n\n<gpx");

    return normalized;
  };

  const copyPromptOutput = async () => {
    if (!output || aiSettings.useDirectAI) return;

    try {
      const textArea = document.createElement("textarea");
      textArea.value = output;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        handleOutputEngagement();
        setPromptReadyToCopy(false);
        toast.success(t("planner.output.actions.copied"));
      } else {
        toast.error(t("planner.output.actions.copyError"));
      }
    } catch {
      toast.error(t("planner.output.actions.copyError"));
    }
  };

  const runGeneration = async () => {
    setIsLoading(true);
    setAIError('');
    setOutput('');
    setFeedbackEligible(false);
    setPromptReadyToCopy(false);
    setTimeout(() => {
      outputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    try {
      if (aiSettings.useDirectAI) {
        setLoadingMessage(t("planner.loading.ai"));
        if (!aiSettings.apiKey?.trim() || !/^[A-Za-z0-9-_]{20,}$/.test(aiSettings.apiKey)) {
          setAIError(t("planner.loading.invalidKey"));
          setIsLoading(false);
          return;
        }
        const aiResponse = await callAIAPI(formData, { ...aiSettings, aiProvider: "openai" });
        setOutput(normalizeAIOutput(aiResponse));
        setAiModel(getOpenAIModelLabel(aiSettings.openaiModel));
        setFeedbackEligible(true);
        setPromptReadyToCopy(false);
        void trackGeneration("route");
      } else {
        setLoadingMessage(t("planner.loading.prompt"));
        await new Promise(resolve => setTimeout(resolve, 800));
        const generatedOutput = generatePrompt(formData, { gpxFormat: 'codeblock' });
        setOutput(generatedOutput);
        setAiModel('');
        setFeedbackEligible(true);
        setPromptReadyToCopy(true);
        void trackGeneration("prompt");
      }
      
      setTimeout(() => {
        if (outputSectionRef.current) {
          const yOffset = -100;
          const y = outputSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      setAIError(t("planner.loading.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const isStickyPromptCopyMode = !aiSettings.useDirectAI && promptReadyToCopy && !!output && !isLoading && !aiError;

  return (
    <main className="min-h-screen bg-background" id="main-content">
      <Navbar onStartPlanning={() => {
        setShowForm(true);
        setTimeout(() => {
          const element = document.getElementById('planner');
          if (element) {
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 100);
      }} />
      
      <HeroSection onStartPlanning={() => {
        setShowForm(true);
        setTimeout(() => {
          const element = document.getElementById('planner');
          if (element) {
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 100);
      }} />

      <Suspense fallback={<div className="h-96" />}>
        <FeaturesSection />
        <TestimonialsSection />
        <RouteExampleSection onStartPlanning={() => {
          setShowForm(true);
          setTimeout(() => {
            const element = document.getElementById('planner');
            if (element) {
              const yOffset = -100;
              const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }, 100);
        }} />
      </Suspense>

      {showForm && (
        <section id="planner" className="planner-scope relative overflow-hidden py-24 px-4 text-foreground dark:text-white">
          <div className="absolute inset-0 pointer-events-none content-section-dark content-section-testimonials" />
          <div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.06] dark:opacity-[0.08]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="map-grid-open" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="40" cy="40" r="0.9" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-grid-open)" />
            </svg>
          </div>
          <div className="absolute inset-0 z-[3] bg-gradient-to-b from-black/4 via-black/6 to-black/10 pointer-events-none dark:from-white/[0.02] dark:via-black/8 dark:to-black/14" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-foreground dark:text-white">
            <div className="text-center mb-24">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md"
              >
                <span className="flex h-2 w-2 rounded-full bg-primary" />
                <span className="text-primary font-black text-[10px] tracking-[0.3em]">
                  {t("planner.badge")}
                </span>
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-8 text-3xl font-black tracking-tighter leading-none text-foreground dark:text-white md:text-7xl"
              >
                {t("planner.title")}
              </motion.h2>
            </div>

            <div className={`${plannerSectionClass} theme-band-vehicle mb-8 md:mb-12 space-y-6 text-left`}>
              <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-lg font-black tracking-tight text-foreground dark:text-white">
                    {t("planner.summary.savedPlans.title")}
                  </div>
                  <div className="text-sm leading-relaxed text-foreground/78 dark:text-white/72">
                    {t("planner.summary.savedPlans.desc")}
                  </div>
                  <div className="text-[13px] leading-relaxed font-medium text-foreground/82 dark:text-white/78">
                    {t("planner.summary.save.note")}
                  </div>
                </div>
                <div className="w-full xl:max-w-[60rem] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      type="button"
                      onClick={() => saveCurrentPlan()}
                      disabled={!formData.startPoint || !formData.destination}
                      className="rounded-xl px-5 h-12 w-full border-2 border-primary/30 bg-primary/15 hover:bg-primary/20 text-white font-semibold transition-all active:scale-95 inline-flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {t("planner.summary.savedPlans.saveCurrent")}
                    </Button>
                    <Button
                      type="button"
                      onClick={runGeneration}
                      disabled={isLoading || !formData.startPoint || !formData.destination || hasInvalidStage || (aiSettings.useDirectAI && !hasValidDirectApiKey)}
                      className="rounded-xl px-5 h-12 w-full border-2 border-primary/30 bg-primary hover:bg-primary/90 text-white font-semibold transition-all active:scale-95 inline-flex items-center justify-center gap-2"
                    >
                      <Bot className="w-4 h-4" />
                      {aiSettings.useDirectAI ? t("planner.nav.generateRoute") : t("planner.nav.generatePrompt")}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={exportCurrentPlanToFile}
                      className="rounded-xl px-4 h-11 w-full border border-slate-500/20 bg-white/88 text-slate-800 font-semibold transition-all active:scale-95 inline-flex items-center justify-center gap-2 hover:bg-white"
                    >
                      <Download className="w-4 h-4" />
                      {t("planner.summary.savedPlans.export")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={triggerPlanImport}
                      className="rounded-xl px-4 h-11 w-full border border-slate-500/20 bg-white/88 text-slate-800 font-semibold transition-all active:scale-95 inline-flex items-center justify-center gap-2 hover:bg-white"
                    >
                      <Upload className="w-4 h-4" />
                      {t("planner.summary.savedPlans.import")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearPlannerData}
                      className="rounded-xl px-4 h-11 w-full border border-red-300/55 bg-red-50 text-red-700 transition-all active:scale-95 hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-100 font-semibold"
                    >
                      {t("planner.summary.save.clear")}
                    </Button>
                  </div>
                </div>
                <input
                  ref={importFileRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={importPlanFromFile}
                />
              </div>

              {aiSettings.useDirectAI && !hasValidDirectApiKey && (
                <div className="rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-[0_12px_30px_rgba(120,74,0,0.08)] dark:border-amber-400/28 dark:bg-amber-400/12 dark:text-amber-50">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-semibold text-amber-950 dark:text-amber-50">{t("planner.summary.savedPlans.apiKeyMissing")}</span>
                    <button
                      type="button"
                      onClick={scrollToApiKeyInput}
                      className="inline-flex items-center justify-center rounded-xl border border-amber-400/60 bg-white/70 px-3 py-1.5 text-xs font-bold text-amber-900 transition hover:bg-white dark:border-amber-200/35 dark:bg-amber-200/14 dark:text-amber-50 dark:hover:bg-amber-200/20"
                    >
                      {t("planner.summary.savedPlans.apiKeyJump")}
                    </button>
                  </div>
                </div>
              )}

              {savedPlans.length === 0 ? (
                <div className="rounded-2xl border border-primary/30 bg-white/60 px-4 py-5 text-sm text-foreground/60 shadow-sm dark:bg-white/[0.04] dark:text-white/50">
                  {t("planner.summary.savedPlans.empty")}
                </div>
              ) : (
                <div className="space-y-3">
                  {savedPlans.map((plan) => {
                    const isActivePlan = activeSavedPlanId === plan.id;
                    const isLatestPlan = savedPlans[0]?.id === plan.id;

                    return (
                    <div
                      key={plan.id}
                      className={`rounded-2xl px-4 py-4 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_21rem] gap-4 transition-all ${isActivePlan ? "border-2 border-primary/55 bg-primary/[0.06] shadow-[0_12px_30px_rgba(0,0,0,0.10),0_0_0_1px_rgba(255,128,0,0.10)]" : "border border-primary/35 bg-white/[0.04] shadow-[inset_0_0_0_1px_rgba(255,128,0,0.08)]"}`}
                    >
                      <div className="space-y-3 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {isActivePlan && (
                            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[10px] font-medium text-primary/90">
                              {t("planner.summary.savedPlans.active")}
                            </span>
                          )}
                          {isLatestPlan && (
                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/65">
                              {t("planner.summary.savedPlans.latest")}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-white/38">
                          {new Date(plan.savedAt).toLocaleString(locale)}
                        </div>
                        <div className="space-y-2 text-sm text-white/76 leading-relaxed">
                          <div className="font-semibold text-white leading-snug break-words">
                            {plan.formData.startPoint || t("planner.summary.notSpecified")} → {plan.formData.destination || t("planner.summary.notSpecified")}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div>
                              <span className="text-white/38">{t("planner.summary.start")} / {t("planner.summary.destination")}:</span>{" "}
                              <span className="text-white/68">{plan.formData.startPoint || t("planner.summary.notSpecified")} · {plan.formData.destination || t("planner.summary.notSpecified")}</span>
                            </div>
                            {plan.formData.stages.some((stage) => stage.destination?.trim()) && (
                              <div>
                                <span className="text-white/38">{t("planner.summary.stops")}:</span>{" "}
                                <span className="text-white/68">
                                  {plan.formData.stages
                                    .map((stage) => stage.destination?.trim())
                                    .filter(Boolean)
                                    .join(" · ")}
                                </span>
                              </div>
                            )}
                            {normalizeOptionalSummaryText(plan.formData.targetRegions, summaryTextPlaceholders) && (
                              <div>
                                <span className="text-white/38">{t("prompt.labels.targetRegions")}:</span>{" "}
                                <span className="text-white/68">
                                  {normalizeOptionalSummaryText(plan.formData.targetRegions, summaryTextPlaceholders)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 w-full min-w-0 self-start xl:self-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => loadSavedPlan(plan)}
                          disabled={isActivePlan}
                          className={`rounded-xl min-h-[42px] px-3 border-2 font-semibold transition-all active:scale-95 inline-flex items-center justify-center gap-2 w-full ${isActivePlan ? "border-primary/20 bg-primary/10 text-white/60 cursor-default" : "border-white/10 bg-white/5 hover:bg-white/10 text-white"}`}
                        >
                          <FolderOpen className="w-4 h-4" />
                          {isActivePlan ? t("planner.summary.savedPlans.active") : t("planner.summary.savedPlans.load")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => duplicateSavedPlan(plan)}
                          className="rounded-xl min-h-[42px] px-3 border-2 border-primary/20 bg-primary/10 hover:bg-primary/15 text-white font-semibold transition-all active:scale-95 inline-flex items-center justify-center gap-2 w-full"
                        >
                          <Sparkles className="w-4 h-4" />
                          {t("planner.summary.savedPlans.duplicate")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => saveCurrentPlan(plan.id)}
                          disabled={!formData.startPoint || !formData.destination}
                          className={`rounded-xl min-h-[42px] px-3 border-2 font-semibold transition-all active:scale-95 w-full justify-center ${isActivePlan ? "border-primary/30 bg-primary/15 hover:bg-primary/20 text-white" : "border-primary/16 bg-primary/8 hover:bg-primary/12 text-white/85"}`}
                        >
                          {t("planner.summary.savedPlans.overwrite")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => deleteSavedPlan(plan.id)}
                          className="rounded-xl min-h-[42px] px-3 border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white/85 font-semibold transition-all active:scale-95 inline-flex items-center justify-center gap-2 w-full"
                        >
                          <Trash2 className="w-4 h-4" />
                          {t("planner.summary.savedPlans.delete")}
                        </Button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-8 items-start">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-visible pb-28 sm:pb-32" 
              ref={formRef}
            >
              <div className="space-y-6 relative z-10">
                <div className={`${plannerSectionClass} theme-band-ai`}>
                  <AISettingsSection
                    aiSettings={aiSettings}
                    onAISettingsChange={handleAISettingsChange}
                    aiError={aiError}
                  />
                </div>

                <div className={`${plannerSectionClass} theme-band-vehicle`}>
                  <RouteSection formData={formData} onChange={handleFormChange} />
                </div>

                <div className={`${plannerSectionClass} theme-band-ai`}>
                  <VehicleSection formData={formData} onChange={handleFormChange} />
                </div>

                <div className={`${plannerSectionClass} theme-band-vehicle`}>
                  <AccommodationSection formData={formData} onChange={handleFormChange} onCheckboxChange={handleCheckboxChange} />
                </div>

                <div className={`${plannerSectionClass} theme-band-ai`}>
                  <RouteOptimizationSection formData={formData} onCheckboxChange={handleCheckboxChange} onChange={handleFormChange} />
                </div>

                <div className={`${plannerSectionClass} theme-band-vehicle space-y-10`}>
                    <div className="space-y-4">
                      <h3 className="text-2xl sm:text-3xl font-black flex items-center gap-3 tracking-tight text-white">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary border-2 border-primary/20">
                          <FileText className="w-6 h-6" />
                        </div>
                        {t("planner.summary.title")}
                      </h3>
                      {!output && (
                        <p className="text-white/40 italic text-sm ml-16 text-left">
                          {t("planner.summary.check")}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                      <div className="md:col-span-2 lg:col-span-2 p-6 sm:p-8 rounded-[1.75rem] sm:rounded-[2.2rem] bg-white/7 border border-white/8 shadow-[0_18px_50px_rgba(0,0,0,0.14)] flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/5 pb-6 gap-4 sm:gap-0">
                          <div className="flex flex-col gap-1 text-center sm:text-left">
                            <span className="text-[10px] font-semibold tracking-[0.08em] text-primary">{t("planner.summary.start")}</span>
                            <span className="text-xl font-black text-white">{formData.startPoint || t("planner.summary.notSpecified")}</span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 rotate-90 sm:rotate-0">
                            <ChevronRight className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col gap-1 text-center sm:text-right">
                            <span className="text-[10px] font-semibold tracking-[0.08em] text-primary">{t("planner.summary.destination")}</span>
                            <span className="text-xl font-black text-white">{summaryPrimaryDestination || t("planner.summary.notSpecified")}</span>
                          </div>
                        </div>

                        
                        {(hasDateWindow || hasDistanceLimit || hasDriveTimeLimit) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                            {hasDateWindow && (
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                                  <Calendar className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black tracking-widest text-white/30">{t("planner.summary.period")}</span>
                                  <div className="flex flex-col text-xs font-bold text-white">
                                    {formData.startDate && <span>{new Date(formData.startDate).toLocaleDateString(locale)}</span>}
                                    {formData.endDate && <span>{new Date(formData.endDate).toLocaleDateString(locale)}</span>}
                                  </div>
                                </div>
                              </div>
                            )}
                            {(hasDistanceLimit || hasDriveTimeLimit) && (
                              <div className="flex items-center gap-4">
                                {(() => {
                                  const preferDriveTime = formData.dailyLimitPriority === "time" && hasDriveTimeLimit;
                                  const mainIsDistance = hasDistanceLimit && !preferDriveTime;
                                  const mainLabel = mainIsDistance ? t("planner.summary.maxDist") : t("planner.route.maxDriveTime");
                                  const mainValue = mainIsDistance
                                    ? `${formData.maxDailyDistance} km / ${t("planner.summary.perDay")}`
                                    : `${formData.maxDailyDriveHours} h / ${t("planner.summary.perDay")}`;
                                  const secondaryValue = mainIsDistance
                                    ? (hasDriveTimeLimit ? `${formData.maxDailyDriveHours} h / ${t("planner.summary.perDay")}` : "")
                                    : (hasDistanceLimit ? `${formData.maxDailyDistance} km / ${t("planner.summary.perDay")}` : "");

                                  return (
                                    <>
                                      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                                        {mainIsDistance ? <Route className="w-5 h-5" /> : <Clock3 className="w-5 h-5" />}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-black tracking-widest text-white/30">
                                          {mainLabel}
                                        </span>
                                        <span className="text-sm font-bold text-white">{mainValue}</span>
                                        {secondaryValue && (
                                          <span className="text-xs font-semibold text-white/70 mt-1">
                                            {secondaryValue}
                                          </span>
                                        )}
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        )}

                        {(selectedStageNames.length > 0 || targetRegionsSummary) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 border-t border-white/5 pt-6">
                            {selectedStageNames.length > 0 && (
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                                  <Route className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[10px] font-black tracking-widest text-white/30">
                                    {t("planner.summary.stops")}
                                  </span>
                                  <span className="text-sm font-bold text-white break-words">
                                    {selectedStageNames.join(" · ")}
                                  </span>
                                </div>
                              </div>
                            )}
                            {targetRegionsSummary && (
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                                  <Map className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[10px] font-black tracking-widest text-white/30">
                                    {t("prompt.labels.targetRegions")}
                                  </span>
                                  <span className="text-sm font-bold text-white break-words">
                                    {targetRegionsSummary}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-6 sm:p-8 rounded-[1.75rem] sm:rounded-[2.2rem] bg-white/5 border border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.14)] flex flex-col justify-between gap-6 sm:gap-0">
                        <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-6">
                          <Bot className="w-6 h-6" />
                        </div>
                        <div className="space-y-3">
                          <span className="text-[10px] font-semibold tracking-[0.08em] text-primary/80">{t("planner.summary.method")}</span>
                          <h4 className="text-xl font-black text-white leading-tight">
                            {aiSettings.useDirectAI ? t("planner.summary.direct") : t("planner.summary.prompt")}
                          </h4>
                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold tracking-[0.08em] text-white/35">{t("planner.summary.model")}</span>
                            <p className="text-sm sm:text-base font-bold text-white/85 leading-snug">
                              {getSummaryModelLabel()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                      {[
                        { 
                          label: t("planner.summary.vehicle"), 
                          value: (() => {
                            const typeLabel = formData.vehicleType ? t(`planner.vehicle.type.options.${formData.vehicleType}`) : "";
                            const weightLabel = formData.weightClass ? t(`planner.vehicle.weightClass.options.${formData.weightClass}`) : "";
                            if (typeLabel && weightLabel) return `${typeLabel} · ${weightLabel}`;
                            if (typeLabel) return typeLabel;
                            if (weightLabel) return weightLabel;
                            return t("planner.summary.notSelected");
                          })(),
                          icon: Truck 
                        },
                        { label: t("planner.summary.people"), value: formData.numberOfTravelers, icon: Users },
                        {
                          label: t("planner.summary.budget"),
                          value: Number(formData.avgCampsitePriceMax || 0) > 0
                            ? `${formData.avgCampsitePriceMax} €`
                            : t("planner.summary.notSelected"),
                          icon: Wallet
                        },
                        { label: t("planner.summary.interests"), value: formData.activities.length + " " + t("planner.summary.selected"), icon: Sparkles },
                      ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                          <stat.icon className="w-5 h-5 text-primary/80 group-hover:text-primary transition-colors" />
                          <div className="flex flex-col">
                            <span className="text-[8px] font-semibold tracking-[0.08em] text-white/35">{stat.label}</span>
                            <span className="text-xs font-black text-white">{stat.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-3 text-center px-2 py-2">
                      <div className="text-[11px] sm:text-xs text-foreground/62 dark:text-white/64 leading-relaxed max-w-lg">
                        {t("planner.summary.save.coffeeHint")}
                      </div>
                      <a
                        href="https://www.buymeacoffee.com/campingroute"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-w-[290px] items-center justify-center gap-3 px-6 py-4 rounded-[1.5rem] border border-primary/50 text-white bg-[linear-gradient(135deg,rgba(201,123,0,0.24),rgba(201,123,0,0.12))] hover:bg-[linear-gradient(135deg,rgba(201,123,0,0.3),rgba(201,123,0,0.16))] transition-all duration-200 shadow-[0_18px_42px_rgba(201,123,0,0.2)] hover:shadow-[0_22px_48px_rgba(201,123,0,0.28)] hover:-translate-y-0.5"
                      >
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" aria-hidden="true">
                          ☕
                        </span>
                        <span className="flex flex-col items-start text-left leading-none">
                          <span className="text-base sm:text-lg font-black tracking-tight text-primary">
                            {t("planner.summary.save.coffee")}
                          </span>
                          <span className="mt-1 text-[11px] sm:text-xs font-semibold text-white/72 tracking-[0.02em]">
                            Buy me a coffee
                          </span>
                        </span>
                      </a>
                    </div>
                </div>
              </div>
            </motion.div>
            </div>
          </div>

      {showForm && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:px-6">
          <div className="theme-surface mx-auto max-w-[calc(100%-1rem)] rounded-[1.1rem] px-3 py-3 sm:max-w-[calc(100%-3rem)] sm:px-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold tracking-[0.08em] text-primary">
                  {aiSettings.useDirectAI ? t("planner.summary.direct") : t("planner.summary.prompt")}
                </div>
                <div className="truncate text-sm font-semibold text-foreground/78 dark:text-white/78">
                  {formData.startPoint || t("planner.summary.notSpecified")} → {summaryPrimaryDestination || t("planner.summary.notSpecified")}
                </div>
                {aiSettings.useDirectAI && !hasValidDirectApiKey && (
                  <button
                    type="button"
                    onClick={scrollToApiKeyInput}
                    className="mt-1 inline-flex items-center gap-2 text-[11px] font-semibold text-amber-900 hover:text-amber-950 dark:text-amber-200 dark:hover:text-amber-100"
                  >
                    <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
                    {t("planner.summary.savedPlans.apiKeyMissing")}
                  </button>
                )}
              </div>
              <Button
                type="button"
                onClick={isStickyPromptCopyMode ? copyPromptOutput : runGeneration}
                disabled={isLoading || !formData.startPoint || !formData.destination || hasInvalidStage || (aiSettings.useDirectAI && !hasValidDirectApiKey)}
                className={`ml-auto h-12 w-full rounded-2xl text-white font-semibold sm:w-auto sm:min-w-[260px] ${
                  isStickyPromptCopyMode
                    ? "bg-emerald-600/90 hover:bg-emerald-600 shadow-[0_14px_36px_rgba(5,150,105,0.28)]"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {isStickyPromptCopyMode ? (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    {t("planner.nav.copyPrompt")}
                  </>
                ) : (
                  aiSettings.useDirectAI ? t("planner.nav.generateRoute") : t("planner.nav.generatePrompt")
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {(output || isLoading || aiError) && (
        <div
          className="theme-surface mx-auto mt-16 max-w-[calc(100%-1rem)] scroll-mt-24 rounded-[1.5rem] px-3 py-3 sm:max-w-[calc(100%-3rem)] sm:px-4 sm:py-4"
          ref={outputSectionRef}
        >
          <OutputSection
            output={output}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            aiModel={aiModel}
            aiError={aiError}
            useDirectAI={aiSettings.useDirectAI}
            gpxOutputMode={formData.gpxOutputMode}
            summary={{
              startPoint: formData.startPoint,
              destination: formData.destination,
              stages: formData.stages,
              destinationDetailsEnabled: formData.destinationDetailsEnabled,
              destinationDepartureDate: formData.destinationDepartureDate,
              destinationDepartureTime: formData.destinationDepartureTime,
              startDate: formData.startDate,
              endDate: formData.endDate,
              maxDailyDistance: formData.maxDailyDistance,
              maxDailyDriveHours: formData.maxDailyDriveHours,
              dailyLimitPriority: formData.dailyLimitPriority,
              targetRegions: formData.targetRegions,
              preferScenicLongerStops: formData.preferScenicLongerStops,
              travelPace: formData.travelPace,
              avgCampsitePriceMax: formData.avgCampsitePriceMax,
              quietPlaces: formData.quietPlaces,
            }}
            onEngagement={handleOutputEngagement}
          />
        </div>
      )}
        </section>
      )}

      <FeedbackModal
        open={showFeedbackModal}
        mode={feedbackMode}
        onClose={handleFeedbackClose}
        onSubmit={handleFeedbackSubmit}
      />

      <Suspense fallback={null}>
        <FAQSection />
      </Suspense>
      
      <Footer />
    </main>
  );
}
