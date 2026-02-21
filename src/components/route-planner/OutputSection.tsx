import { useState } from "react";
import { Copy, Printer, FileText, CheckCircle, Loader2, Route, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface OutputSectionProps {
  output: string;
  isLoading: boolean;
  loadingMessage: string;
  aiModel: string;
  aiProvider: string;
  aiError: string;
  useDirectAI: boolean;
}

export function OutputSection({ output, isLoading, loadingMessage, aiModel, aiProvider, aiError, useDirectAI }: OutputSectionProps) {
  const { t, i18n } = useTranslation();
  const [showSuccess, setShowSuccess] = useState(false);

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(output);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          return;
        } catch (clipboardError) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Moderne Clipboard API fehlgeschlagen, versuche Fallback:', clipboardError);
          }
        }
      }
      
      // Batch DOM operations to prevent layout thrashing
      const textarea = document.createElement('textarea');
      textarea.value = output;
      
      // Set all styles before appending to DOM
      Object.assign(textarea.style, {
        position: 'fixed',
        opacity: '0',
        top: '0',
        left: '0',
        width: '1px',
        height: '1px',
        pointerEvents: 'none',
        zIndex: '-1'
      });
      
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (successful) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('execCommand copy war nicht erfolgreich');
          }
          alert(t("planner.output.actions.copyError"));
        }
      } catch (execError) {
        document.body.removeChild(textarea);
        if (process.env.NODE_ENV === 'development') {
          console.error('execCommand Fehler:', execError);
        }
        alert(t("planner.output.actions.copyError"));
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Unerwarteter Fehler beim Kopieren:', err);
      }
      alert(t("planner.output.actions.copyError"));
    }
  };

  const extractAndDownloadGPX = () => {
    // Extrahiere GPX-Inhalt zwischen <?xml und </gpx>
    const gpxMatch = output.match(/<\?xml[^>]*>[\s\S]*?<\/gpx>/);

    if (gpxMatch) {
      const gpxContent = gpxMatch[0];
      const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'wohnmobil-route.gpx'; // Direkte .gpx Endung
      a.click();

      URL.revokeObjectURL(url);
    } else {
      alert(t("planner.output.print.gpxError"));
    }
  };

  const printOutput = () => {
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = 'none';
    printFrame.style.visibility = 'hidden';
    
    document.body.appendChild(printFrame);
    
    try {
      const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
      
      if (frameDoc) {
        const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';
        const now = new Date();
        
        frameDoc.open();
        frameDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${t("planner.output.print.title")}</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .model-info { background: #fef3c7; padding: 8px 16px; border-radius: 8px; margin: 10px 0; display: inline-block; font-size: 1em; }
                .content { font-size: 12pt; white-space: pre-wrap; }
                @media print { 
                  body { padding: 10mm; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
                  <img src="${window.location.origin}/favicon-final.svg" alt="Logo" style="height: 60px; width: 60px;" loading="lazy" />
                  <h1 style="margin: 0;">${t("planner.output.print.title")}</h1>
                </div>
                <p>${t("planner.output.print.generatedAt")}: ${now.toLocaleDateString(locale)} ${now.toLocaleTimeString(locale)}</p>
                ${aiModel ? `<p class="model-info">${t("planner.output.print.model")}: ${aiModel}</p>` : ''}
              </div>
              <div class="content">${output.replace(/\n/g, '<br>')}</div>
            </body>
          </html>
        `);
        frameDoc.close();
        
        setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          
          setTimeout(() => {
            document.body.removeChild(printFrame);
          }, 1000);
        }, 100);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Druckfehler:', error);
      }
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${t("planner.output.print.title")}</title>
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                };
              </script>
            </head>
            <body>
              <pre>${output}</pre>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  // Show output section if there's output, loading, or an error
  if (!output && !isLoading && !aiError) return null;

  return (
    <Card className="mt-8 overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-border">
        <CardTitle className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          {useDirectAI ? t("planner.output.title.direct") : t("planner.output.title.prompt")}
          {aiModel && (
            <span className="text-sm font-normal bg-primary/10 text-primary px-3 py-1 rounded-full ml-auto flex items-center gap-2">
              <Route className="h-4 w-4" />
              {aiModel}
            </span>
          )}
          {!useDirectAI && (
            <a
              href="#model-selection-faq"
              onClick={(e) => {
                e.preventDefault();
                const trigger = document.getElementById('model-selection-faq');
                if (trigger) {
                  trigger.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setTimeout(() => {
                    const accordionItem = trigger.closest('[data-state]');
                    if (accordionItem?.getAttribute('data-state') === 'closed') {
                      (trigger as HTMLElement).click();
                    }
                  }, 500);
                }
              }}
              className="text-sm font-normal text-primary hover:underline ml-auto flex items-center gap-1"
            >
              <Info className="h-4 w-4" />
              {t("planner.ai.provider.help")}
            </a>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-lg font-medium">{loadingMessage}</p>
            <p className="text-muted-foreground text-sm">{t("planner.output.loading.wait")}</p>
          </div>
        ) : (
          <>
            {aiError && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {aiError}
              </div>
            )}
            
            <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto">
              {output}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <Button onClick={copyToClipboard} variant="outline" size="lg" className="gap-2 min-h-[48px] px-6 py-3">
                {showSuccess ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                {showSuccess ? t("planner.output.actions.copied") : t("planner.output.actions.copy")}
              </Button>
              
              <Button onClick={printOutput} variant="outline" size="lg" className="gap-2 min-h-[48px] px-6 py-3">
                <Printer className="h-5 w-5" />
                {t("planner.output.actions.print")}
              </Button>
              
              {/* GPX Download Button - nur anzeigen wenn GPX-Daten vorhanden sind */}
              {output.includes('<?xml') && output.includes('</gpx>') && (
                <Button onClick={extractAndDownloadGPX} variant="outline" size="lg" className="gap-2 min-h-[48px] px-6 py-3">
                  <Route className="h-5 w-5" />
                  {t("planner.output.actions.downloadGPX")}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Export-Funktionen außerhalb der Komponente
export const exportAsHTML = (text: string) => {
  const htmlContent = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/# (.*?)/g, '<h1>$1</h1>')
    .replace(/## (.*?)/g, '<h2>$1</h2>')
    .replace(/### (.*?)/g, '<h3>$1</h3>');

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wohnmobil-route.html';
  a.click();
  URL.revokeObjectURL(url);
};

export const exportAsMarkdown = (text: string) => {
  const blob = new Blob([text], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wohnmobil-route.md';
  a.click();
  URL.revokeObjectURL(url);
};

export const exportAsPDF = async (text: string) => {
  console.log('PDF Export wird in Zukunft implementiert');
};
