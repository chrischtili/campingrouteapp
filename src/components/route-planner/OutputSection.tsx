import { useState } from "react";
import { Copy, Printer, FileText, CheckCircle, Loader2, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OutputSectionProps {
  output: string;
  isLoading: boolean;
  loadingMessage: string;
  aiModel: string;
  aiError: string;
  useDirectAI: boolean;
}

export function OutputSection({ output, isLoading, loadingMessage, aiModel, aiError, useDirectAI }: OutputSectionProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output).then(() => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    });
  };

  const printOutput = () => {
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head>
          <title>Wohnmobil-Route</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.8; color: #333; padding: 20mm; max-width: 800px; margin: 0 auto; }
            h1 { color: #b45309; text-align: center; }
            .header { text-align: center; margin-bottom: 20px; }
            .model-info { background: #fef3c7; padding: 8px 16px; border-radius: 8px; margin: 10px 0; display: inline-block; font-size: 0.9em; }
            .content { font-size: 11pt; white-space: pre-wrap; }
            @media print { 
              body { padding: 10mm; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚐 Wohnmobil-Route</h1>
            <p>Generiert am: ${new Date().toLocaleDateString('de-DE')} ${new Date().toLocaleTimeString('de-DE')}</p>
            ${aiModel ? `<p class="model-info">KI-Modell: ${aiModel}</p>` : ''}
          </div>
          <div class="content">${output.replace(/\n/g, '<br>')}</div>
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #b45309; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
              Drucken
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow?.document.close();
    setTimeout(() => {
      printWindow?.focus();
      printWindow?.print();
    }, 500);
  };

  if (!output && !isLoading) return null;

  return (
    <Card className="mt-8 overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-border">
        <CardTitle className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          {useDirectAI ? 'KI-Routenplanung' : 'Generierter Prompt'}
          {aiModel && (
            <span className="text-sm font-normal bg-primary/10 text-primary px-3 py-1 rounded-full ml-auto flex items-center gap-2">
              <Route className="h-4 w-4" />
              {aiModel}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-lg font-medium">{loadingMessage}</p>
            <p className="text-muted-foreground text-sm">Bitte warten, dies kann einen Moment dauern.</p>
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
              <Button onClick={copyToClipboard} variant="outline" className="gap-2">
                {showSuccess ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {showSuccess ? 'Kopiert!' : 'In Zwischenablage kopieren'}
              </Button>
              
              <Button onClick={printOutput} variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Drucken / Als PDF speichern
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
