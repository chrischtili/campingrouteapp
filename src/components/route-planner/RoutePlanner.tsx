import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { Route, MapPin, Bot, Settings2, Truck, Bed, Heart, FileText, ChevronLeft, ChevronRight, Loader2, Calendar, Users, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FormData, AISettings, initialFormData, initialAISettings } from "@/types/routePlanner";
import { generatePrompt, callAIAPI } from "@/lib/promptGenerator";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

// Statische Importe für ALLES was zum Formular gehört - SICHERHEIT GEHT VOR
import { HeroSection } from "./HeroSection";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { AISettingsSection } from "./AISettingsSection";
import { RouteSection } from "./RouteSection";
import { RouteOptimizationSection } from "./RouteOptimizationSection";
import { VehicleSection } from "./VehicleSection";
import { AccommodationSection } from "./AccommodationSection";
import { ActivitiesSection } from "./ActivitiesSection";
import { OutputSection } from "./OutputSection";

// Nur die Sektionen unter dem Formular bleiben Lazy
const FeaturesSection = lazy(() => import("./FeaturesSection").then(m => ({ default: m.FeaturesSection })));
const TestimonialsSection = lazy(() => import("./TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const RouteExampleSection = lazy(() => import("./RouteExampleSection").then(m => ({ default: m.RouteExampleSection })));
const FAQSection = lazy(() => import("./FAQSection").then(m => ({ default: m.FAQSection })));

export function RoutePlanner() {
  const { t, i18n } = useTranslation();
  const STORAGE_KEY = "cr_form_state_v1";
  const STORAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [aiSettings, setAISettings] = useState<AISettings>(initialAISettings);
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [aiError, setAIError] = useState<string>('');
  const [aiModel, setAiModel] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [saveFormLocally, setSaveFormLocally] = useState<boolean>(false);
  
  const outputSectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const sanitizeAISettings = (settings: AISettings): AISettings => ({
    ...settings,
    apiKey: ''
  });

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
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved?.savedAt || Date.now() - saved.savedAt > STORAGE_TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      if (saved?.saveFormLocally) {
        setFormData({ ...initialFormData, ...(saved.formData || {}) });
        setAISettings({ ...initialAISettings, ...(saved.aiSettings || {}), apiKey: '' });
        setSaveFormLocally(true);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!saveFormLocally) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const payload = {
      savedAt: Date.now(),
      saveFormLocally: true,
      formData,
      aiSettings: sanitizeAISettings(aiSettings),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [
    saveFormLocally,
    formData,
    aiSettings.aiProvider,
    aiSettings.useDirectAI,
    aiSettings.openaiModel,
    aiSettings.mistralModel,
    aiSettings.googleModel,
  ]);

  const steps = [
    { icon: Bot, label: t("planner.steps.ai.label"), description: t("planner.steps.ai.desc") },
    { icon: Route, label: t("planner.steps.route.label"), description: t("planner.steps.route.desc") },
    { icon: Settings2, label: t("planner.steps.optimization.label"), description: t("planner.steps.optimization.desc") },
    { icon: Truck, label: t("planner.steps.vehicle.label"), description: t("planner.steps.vehicle.desc") },
    { icon: Bed, label: t("planner.steps.accommodation.label"), description: t("planner.steps.accommodation.desc") },
    { icon: Heart, label: t("planner.steps.interests.label"), description: t("planner.steps.interests.desc") },
    { icon: FileText, label: t("planner.steps.summary.label"), description: t("planner.steps.summary.desc") },
  ];

  const handleFormChange = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleAISettingsChange = (settings: Partial<AISettings>) => {
    setAISettings(prev => ({ ...prev, ...settings }));
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = (prev[name as keyof FormData] as string[]) || [];
      if (checked) {
        return { ...prev, [name]: [...currentValues, value] };
      } else {
        return { ...prev, [name]: currentValues.filter(v => v !== value) };
      }
    });
  };

  const scrollToPlannerProgress = () => {
    setTimeout(() => {
      const element = document.getElementById('planner-progress');
      if (element) {
        const yOffset = -120;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      scrollToPlannerProgress();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollToPlannerProgress();
    }
  };

  const goToStep = (step: number) => {
    const isNavigable = (formData.startPoint && formData.destination) || completedSteps.includes(step) || step === currentStep;
    if (isNavigable) {
      setCurrentStep(step);
      scrollToPlannerProgress();
    }
  };

  const isModelSelected = () => {
    if (!aiSettings.useDirectAI) return true;
    const currentProvider = aiSettings.aiProvider;
    const modelKey = `${currentProvider}Model` as 'openaiModel' | 'mistralModel' | 'googleModel';
    return !!aiSettings[modelKey];
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        if (!aiSettings.useDirectAI) return true;
        return !!aiSettings.apiKey?.trim() && /^[A-Za-z0-9-_]{20,}$/.test(aiSettings.apiKey) && isModelSelected();
      case 2:
        return !!formData.startPoint && !!formData.destination;
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAIError('');
    setOutput('');

    try {
      if (aiSettings.useDirectAI) {
        setLoadingMessage(t("planner.loading.ai"));
        if (!aiSettings.apiKey?.trim() || !/^[A-Za-z0-9-_]{20,}$/.test(aiSettings.apiKey)) {
          setAIError(t("planner.loading.invalidKey"));
          setIsLoading(false);
          return;
        }
        const aiResponse = await callAIAPI(formData, aiSettings);
        setOutput(aiResponse);
        setAiModel(aiSettings.aiProvider.toUpperCase());
      } else {
        setLoadingMessage(t("planner.loading.prompt"));
        await new Promise(resolve => setTimeout(resolve, 800));
        const generatedOutput = generatePrompt(formData);
        setOutput(generatedOutput);
        setAiModel('');
      }
      
      setCurrentStep(steps.length + 1);
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
        <RouteExampleSection />
      </Suspense>

      {!showForm && (
        <section className="py-32 px-4 text-center bg-[#0b1110] relative overflow-hidden border-y border-white/5">
          <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-40">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="map-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="40" cy="40" r="1.5" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-grid)" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/80 pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <Button
              onClick={() => {
                setShowForm(true);
                setTimeout(() => {
                  const element = document.getElementById('planner');
                  if (element) {
                    const yOffset = -100;
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }, 100);
              }}
              className="relative inline-flex items-center gap-4 px-10 sm:px-12 py-5 sm:py-6 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md text-primary hover:text-primary hover:border-primary/50 transition overflow-hidden"
              size="lg"
              style={{
                background: "rgba(245, 155, 10, 0.2)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <span aria-hidden className="absolute inset-0">
                <span className="absolute -top-8 -left-10 h-32 w-32 rounded-full bg-primary/25 blur-2xl" />
                <span className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-secondary/35 blur-2xl" />
              </span>
              <span className="relative z-10 flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
              <span className="relative z-10 text-sm sm:text-base font-black uppercase tracking-[0.3em]">{t("planner.cta")}</span>
            </Button>
          </motion.div>
        </section>
      )}

      {showForm && (
        <section id="planner" className="py-24 px-4 bg-[#0b1110] text-white relative overflow-hidden border-y border-white/5">
          <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-40">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="map-grid-open" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="40" cy="40" r="1.5" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-grid-open)" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/80 pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10 text-white">
            <div className="text-center mb-24">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md"
              >
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                  {t("planner.badge")}
                </span>
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-7xl font-black text-white mt-8 tracking-tighter leading-none"
              >
                {t("planner.title")}
              </motion.h2>
            </div>

            {/* Modern Progress Steps - ARROW FLOW VERSION */}
            <div id="planner-progress" className="mb-8 md:mb-16 app-glass p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] relative z-20 shadow-xl sm:shadow-2xl overflow-x-auto md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex items-center justify-between relative px-2 pt-2 pb-4 md:pt-0 md:pb-0 min-w-[max-content] md:min-w-0 gap-6 md:gap-0">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  const stepNumber = i + 1;
                  const isActive = stepNumber === currentStep;
                  const isLast = i === steps.length - 1;
                  
                  // CHECK IF STEP IS ACTUALLY FILLED WITH DATA
                  const isStepCompleted = () => {
                    switch(stepNumber) {
                      case 1: return completedSteps.includes(1);
                      case 2: return !!(formData.startPoint && formData.destination);
                      case 3: return formData.routePreferences.length > 0;
                      case 4: 
                        return formData.vehicleLength !== initialFormData.vehicleLength || 
                               formData.vehicleWeight !== initialFormData.vehicleWeight;
                      case 5: return formData.travelCompanions.length > 0 || formData.accommodationType.length > 0;
                      case 6: return formData.activities.length > 0;
                      case 7: return !!output; 
                      default: return false;
                    }
                  };

                  const isDone = isStepCompleted();
                  const isNavigable = (formData.startPoint && formData.destination) || stepNumber <= currentStep || completedSteps.includes(stepNumber);

                  return (
                    <div key={i} className="flex flex-1 items-center">
                      <button
                        onClick={() => goToStep(stepNumber)}
                        disabled={!isNavigable}
                        className={`flex flex-col items-center group relative flex-1 transition-all duration-500 ${!isNavigable ? "opacity-20 cursor-not-allowed" : "opacity-100"}`}
                      >
                        <div className="relative">
                          <motion.div 
                            whileHover={isNavigable ? { scale: 1.1, rotate: 5 } : {}}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 shrink-0 ${
                              isActive 
                                ? "bg-primary border-primary text-white shadow-xl shadow-primary/40 scale-110 z-10" 
                                : isDone 
                                  ? "bg-[#1a2e1a] border-[#2d4d2d] text-[#4ade80] shadow-lg shadow-black/20" 
                                  : "bg-white/5 border-white/10 text-white/20"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </motion.div>
                          
                          {isDone && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#4ade80] rounded-full flex items-center justify-center border-2 border-[#0a140f] z-30 shadow-lg">
                              <Check className="w-3 h-3 text-[#0a140f] stroke-[4px]" />
                            </div>
                          )}
                        </div>
                        <span className={`text-[8px] sm:text-[10px] font-black mt-2 sm:mt-4 uppercase tracking-[0.1em] transition-colors text-center px-1 sm:px-2 ${isActive ? "text-primary" : isDone ? "text-[#4ade80]/60" : "text-white/20"}`}>
                          {step.label}
                        </span>
                      </button>

                      {!isLast && (
                        <div className="flex items-center justify-center mb-6 md:mb-8 lg:mb-10">
                          <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-500 shrink-0 ${
                            isActive 
                              ? "text-primary animate-pulse scale-125" 
                              : isDone 
                                ? "text-[#4ade80]/30" 
                                : "text-white/5"
                          }`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Steps */}
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="app-glass p-6 sm:p-10 md:p-16 rounded-3xl md:rounded-[3rem] relative overflow-hidden shadow-2xl" 
              ref={formRef}
            >
              <div className="space-y-12 relative z-10">
                {currentStep === 1 && <AISettingsSection aiSettings={aiSettings} onAISettingsChange={handleAISettingsChange} aiError={aiError} />}
                {currentStep === 2 && <RouteSection formData={formData} onChange={handleFormChange} />}
                {currentStep === 3 && <RouteOptimizationSection formData={formData} onCheckboxChange={handleCheckboxChange} />}
                {currentStep === 4 && <VehicleSection formData={formData} onChange={handleFormChange} />}
                {currentStep === 5 && <AccommodationSection formData={formData} onChange={handleFormChange} onCheckboxChange={handleCheckboxChange} />}
                {currentStep === 6 && <ActivitiesSection formData={formData} onChange={handleFormChange} onCheckboxChange={handleCheckboxChange} />}
                {currentStep >= 7 && (
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black flex items-center gap-3 uppercase tracking-tighter text-white">
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
                      <div className="md:col-span-2 lg:col-span-2 p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-white/5 border-2 border-white/10 shadow-xl flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/5 pb-6 gap-4 sm:gap-0">
                          <div className="flex flex-col gap-1 text-center sm:text-left">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{t("planner.summary.start")}</span>
                            <span className="text-xl font-black text-white">{formData.startPoint || t("planner.summary.notSpecified")}</span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 rotate-90 sm:rotate-0">
                            <ChevronRight className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col gap-1 text-center sm:text-right">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{t("planner.summary.destination")}</span>
                            <span className="text-xl font-black text-white">{formData.destination || t("planner.summary.notSpecified")}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{t("planner.summary.period")}</span>
                              <div className="flex flex-col text-xs font-bold text-white">
                                <span>{formData.startDate ? new Date(formData.startDate).toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US') : '?'} —</span>
                                <span>{formData.endDate ? new Date(formData.endDate).toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US') : '?'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                              <Route className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{t("planner.summary.maxDist")}</span>
                              <span className="text-sm font-bold text-white">{formData.maxDailyDistance} km / {t("planner.summary.perDay")}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-primary/5 border-2 border-primary/20 shadow-xl flex flex-col justify-between gap-6 sm:gap-0">
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 mb-6">
                          <Bot className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{t("planner.summary.method")}</span>
                          <h4 className="text-xl font-black text-white uppercase leading-tight">
                            {aiSettings.useDirectAI ? t("planner.summary.direct") : t("planner.summary.prompt")}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                      {[
                        { label: t("planner.summary.vehicle"), value: formData.vehicleWeight + "t", icon: Truck },
                        { label: t("planner.summary.people"), value: formData.numberOfTravelers, icon: Users },
                        { label: t("planner.summary.style"), value: formData.travelStyle ? t(`planner.route.style.options.${formData.travelStyle}`) : t("planner.summary.notSelected"), icon: Sparkles },
                        { label: t("planner.summary.interests"), value: formData.activities.length + " " + t("planner.summary.selected"), icon: Heart },
                      ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                          <stat.icon className="w-5 h-5 text-primary/80 group-hover:text-primary transition-colors" />
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">{stat.label}</span>
                            <span className="text-xs font-black text-white">{stat.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-white/5 border-2 border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-left">
                      <div className="space-y-2">
                        <div className="text-sm font-black uppercase tracking-[0.2em] text-white">
                          {t("planner.summary.save.title")}
                        </div>
                        <div className="text-xs text-white/60 leading-relaxed">
                          {t("planner.summary.save.desc")}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
                          {t("planner.summary.save.note")}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={saveFormLocally}
                          onCheckedChange={(checked) => setSaveFormLocally(checked)}
                          aria-label={t("planner.summary.save.title")}
                          className="border-primary/80 data-[state=unchecked]:bg-white/10 data-[state=checked]:bg-white/10 shadow-[0_0_0_2px_rgba(245,155,10,0.35)]"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSaveFormLocally(false);
                          }}
                          className="rounded-xl px-4 border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all active:scale-95"
                        >
                          {t("planner.summary.save.clear")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation - Only hide in the final result step (currentStep > 7) */}
              {currentStep <= steps.length && (
                <div className="flex justify-between items-center gap-4 mt-12 pt-8 border-t border-white/5 relative z-10">
                  {currentStep > 1 ? (
                    <Button 
                      variant="outline" 
                      onClick={prevStep} 
                      className="rounded-xl px-4 sm:px-6 border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all active:scale-95 flex items-center gap-2 h-12 text-sm sm:text-base"
                    >
                      <ChevronLeft className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline">{t("planner.nav.back")}</span>
                    </Button>
                  ) : <div />}
                  
                  {currentStep < steps.length ? (
                    <Button 
                      onClick={nextStep} 
                      disabled={!isStepValid()} 
                      className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 sm:px-8 font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 h-12 text-sm sm:text-base flex-1 sm:flex-none max-w-[200px] sm:max-w-none ml-auto flex items-center justify-center"
                    >
                      <span>{t("planner.nav.next")}</span>
                      <ChevronRight className="w-4 h-4 ml-2 shrink-0" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isLoading || !formData.startPoint || !formData.destination} 
                      className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 sm:px-10 py-6 font-black text-base sm:text-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex-1 sm:flex-none ml-auto text-center leading-tight"
                    >
                      {aiSettings.useDirectAI ? t("planner.nav.generateRoute") : t("planner.nav.generatePrompt")}
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          <div className="mt-16 max-w-5xl mx-auto scroll-mt-24" ref={outputSectionRef}>
            <OutputSection
              output={output}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              aiModel={aiModel}
              aiProvider={aiSettings.aiProvider}
              aiError={aiError}
              useDirectAI={aiSettings.useDirectAI}
            />
          </div>
        </section>
      )}

      <Suspense fallback={null}>
        <FAQSection />
      </Suspense>
      
      <Footer />
    </main>
  );
}
