import { useState, useRef, Suspense, lazy } from "react";
import { Route, MapPin, Bot, Settings2, Truck, Bed, Heart, FileText, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormData, AISettings, initialFormData, initialAISettings } from "@/types/routePlanner";
import { generatePrompt, callAIAPI } from "@/lib/promptGenerator";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

// Statische Importe für wichtige UI-Teile
import { HeroSection } from "./HeroSection";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

// Lazy Imports für die Formular-Sektionen
const AISettingsSection = lazy(() => import("./AISettingsSection").then(m => ({ default: m.AISettingsSection })));
const RouteSection = lazy(() => import("./RouteSection").then(m => ({ default: m.RouteSection })));
const RouteOptimizationSection = lazy(() => import("./RouteOptimizationSection").then(m => ({ default: m.RouteOptimizationSection })));
const VehicleSection = lazy(() => import("./VehicleSection").then(m => ({ default: m.VehicleSection })));
const AccommodationSection = lazy(() => import("./AccommodationSection").then(m => ({ default: m.AccommodationSection })));
const ActivitiesSection = lazy(() => import("./ActivitiesSection").then(m => ({ default: m.ActivitiesSection })));
const OutputSection = lazy(() => import("./OutputSection").then(m => ({ default: m.OutputSection })));

// Lazy Imports für Landingpage-Sektionen
const FeaturesSection = lazy(() => import("./FeaturesSection").then(m => ({ default: m.FeaturesSection })));
const TestimonialsSection = lazy(() => import("./TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const RouteExampleSection = lazy(() => import("./RouteExampleSection").then(m => ({ default: m.RouteExampleSection })));
const FAQSection = lazy(() => import("./FAQSection").then(m => ({ default: m.FAQSection })));

export function RoutePlanner() {
  const { t } = useTranslation();
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
  
  const outputSectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

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

  const nextStep = () => {
    if (currentStep < steps.length) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
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
          outputSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      setAIError(t("planner.loading.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'rgb(250, 244, 235)' }} id="main-content">
      <Navbar onStartPlanning={() => {
        setShowForm(true);
        setTimeout(() => {
          document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }} />
      
      <HeroSection onStartPlanning={() => {
        setShowForm(true);
        setTimeout(() => {
          document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }} />

      <Suspense fallback={<div className="h-96" />}>
        <FeaturesSection />
        <TestimonialsSection />
        <RouteExampleSection />
      </Suspense>

      {!showForm && (
        <section className="py-16 px-4 bg-[rgb(252,250,248)] dark:bg-gray-800 text-center">
          <Button
            onClick={() => {
              setShowForm(true);
              setTimeout(() => {
                document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            className="gap-2 bg-[#F59B0A] hover:bg-[#E67E22] text-white dark:text-foreground text-lg px-8 py-6 rounded-full shadow-lg"
            size="lg"
          >
            <Route className="w-6 h-6" />
            {t("planner.cta")}
          </Button>
        </section>
      )}

      {showForm && (
        <section id="planner" className="py-24 px-4 bg-[rgb(252,250,248)] dark:bg-gray-800">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#F59B0A] font-semibold text-sm uppercase tracking-widest">{t("planner.badge")}</span>
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mt-3">{t("planner.title")}</h2>
            </div>

            {/* Progress */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = i + 1 === currentStep;
                  const isDone = completedSteps.includes(i + 1);
                  return (
                    <button
                      key={i}
                      onClick={() => goToStep(i + 1)}
                      disabled={!isDone && !isActive}
                      className={`flex flex-col items-center gap-1.5 transition-all ${isActive ? "text-[#F59B0A] scale-110" : isDone ? "text-primary" : "text-muted-foreground/40"}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? "bg-gradient-to-r from-[#F59B0A] to-[#E67E22] text-white" : isDone ? "bg-[rgb(50,110,89)] text-white" : "bg-gray-200 dark:bg-gray-700"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium hidden md:block">{step.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-[#F59B0A] transition-all duration-300" style={{ width: `${(currentStep / steps.length) * 100}%` }} />
              </div>
            </div>

            {/* Form Steps */}
            <div className="p-8 min-h-[240px] scroll-mt-24" ref={formRef}>
              <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
                {currentStep === 1 && <AISettingsSection aiSettings={aiSettings} onAISettingsChange={handleAISettingsChange} aiError={aiError} />}
                {currentStep === 2 && <RouteSection formData={formData} onChange={handleFormChange} />}
                {currentStep === 3 && <RouteOptimizationSection formData={formData} onCheckboxChange={handleCheckboxChange} />}
                {currentStep === 4 && <VehicleSection formData={formData} onChange={handleFormChange} />}
                {currentStep === 5 && <AccommodationSection formData={formData} onChange={handleFormChange} onCheckboxChange={handleCheckboxChange} />}
                {currentStep === 6 && <ActivitiesSection formData={formData} onChange={handleFormChange} onCheckboxChange={handleCheckboxChange} />}
                {currentStep === 7 && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-border">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">📋 {t("planner.summary.title")}</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span>{t("planner.summary.start")}:</span><strong>{formData.startPoint || t("planner.summary.notSpecified")}</strong></div>
                      <div className="flex justify-between"><span>{t("planner.summary.destination")}:</span><strong>{formData.destination || t("planner.summary.notSpecified")}</strong></div>
                      <div className="flex justify-between"><span>{t("planner.summary.method")}:</span><strong>{aiSettings.useDirectAI ? t("planner.summary.direct") : t("planner.summary.prompt")}</strong></div>
                    </div>
                  </div>
                )}
              </Suspense>
            </div>

            {/* Navigation */}
            {currentStep <= steps.length && (
              <div className="flex justify-between mt-8 pt-4 border-t border-border">
                {currentStep > 1 ? (
                  <Button variant="outline" onClick={prevStep} className="rounded-full">{t("planner.nav.back")}</Button>
                ) : <div />}
                
                {currentStep < steps.length ? (
                  <Button onClick={nextStep} disabled={!isStepValid()} className="bg-[#F59B0A] hover:bg-[#E67E22] text-white rounded-full">{t("planner.nav.next")}</Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isLoading || !formData.startPoint || !formData.destination} className="bg-[#F59B0A] hover:bg-[#E67E22] text-white rounded-full">
                    {aiSettings.useDirectAI ? t("planner.nav.generateRoute") : t("planner.nav.generatePrompt")}
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 max-w-4xl mx-auto scroll-mt-24" ref={outputSectionRef}>
            <Suspense fallback={null}>
              <OutputSection
                output={output}
                isLoading={isLoading}
                loadingMessage={loadingMessage}
                aiModel={aiModel}
                aiProvider={aiSettings.aiProvider}
                aiError={aiError}
                useDirectAI={aiSettings.useDirectAI}
              />
            </Suspense>
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
