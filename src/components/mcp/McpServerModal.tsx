import React, { useState } from 'react';
import { Cpu, Sparkles, Copy, Check, X, Terminal, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface McpServerModalProps {
  open: boolean;
  onClose: () => void;
}

export const MCP_TOOLS_LIST = [
  { name: 'search_places', cat: '🏕️ Camping & Stellplätze', desc: 'Sucht europaweit nach Campingplätzen, Stellplätzen & Sehenswürdigkeiten mit Filtern nach Land, Region, Ort, Typ & Merkmalen.' },
  { name: 'get_place_details', cat: '🏕️ Camping & Stellplätze', desc: 'Liefert vollständige Kontaktdaten, Koordinaten, Preise, Sanitär-Ausstattung und Details zu einem Platz.' },
  { name: 'get_german_trails', cat: '🥾 Wandern & Radfahren', desc: 'Durchsucht offizielle Wander- und Radfernwege mit GPX-Streckenverlauf, Höhenmetern und nahen Campingplätzen (DZT Knowledge Graph).' },
  { name: 'get_german_events', cat: '📅 Events & Weinfeste', desc: 'Findet offizielle deutsche Weinfeste, Festivals, Kultur- und Sportveranstaltungen über ganz Deutschland (DZT Knowledge Graph).' },
  { name: 'get_german_pois', cat: '🏰 Sehenswürdigkeiten', desc: 'Liefert verifizierte Sehenswürdigkeiten, Schlösser, Naturparke und Kultur-Highlights für Roadtrips (DZT Knowledge Graph).' },
  { name: 'get_reviews', cat: '⭐ Bewertungen', desc: 'Ruft echte Reiseberichte und Bewertungen von Campern zu einem Platz ab.' },
  { name: 'add_review', cat: '⭐ Bewertungen', desc: 'Schreibt eine neue Bewertung und vergibt Sterne für einen besuchten Platz.' },
  { name: 'get_lists', cat: '📁 Reiselisten', desc: 'Gibt alle erstellten Reiselisten und Favoriten-Sammlungen zurück.' },
  { name: 'create_list', cat: '📁 Reiselisten', desc: 'Erstellt eine neue Reiseliste (z. B. für eine geplante Route oder Favoriten).' },
  { name: 'save_to_list', cat: '📁 Reiselisten', desc: 'Speichert einen Campingplatz oder Spot in einer bestimmten Reiseliste.' }
];

export function McpServerModal({ open, onClose }: McpServerModalProps) {
  const { t } = useTranslation();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  if (!open) return null;

  const endpointUrl = "https://campingroute.app/discover/mcp";

  const claudeConfigJson = JSON.stringify({
    mcpServers: {
      campingroute: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-sse", endpointUrl]
      }
    }
  }, null, 2);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(endpointUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(claudeConfigJson);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                CampingRoute MCP-Server
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Model Context Protocol für Claude Desktop, Cursor, Antigravity & KI-Agenten
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          
          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-emerald-50/60 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-emerald-950/30 border border-indigo-200/80 dark:border-indigo-800/60">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed">
              <strong className="block font-bold text-indigo-900 dark:text-indigo-100 mb-1">
                Verbinde deine eigene KI mit 20.000+ Campingplätzen & Touren in Europa
              </strong>
              Mit dem offiziellen MCP-Server kann dein KI-Assistent (z. B. Claude Desktop, Cursor oder eigene Agenten) in Echtzeit auf verifizierte Campingplätze, Stellplätze, Ausstattungen, Wander-/Radwege und Events zugreifen.
            </div>
          </div>

          {/* Endpoint URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              MCP Server Endpoint URL (SSE)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={endpointUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-800 dark:text-emerald-400 font-mono text-xs font-bold select-all focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
              >
                {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedUrl ? 'Kopiert!' : 'URL kopieren'}</span>
              </button>
            </div>
          </div>

          {/* Config Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>Konfiguration für Claude Desktop & Cursor (claude_desktop_config.json)</span>
              </label>
              <button
                type="button"
                onClick={handleCopyConfig}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedConfig ? 'JSON kopiert!' : 'JSON kopieren'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
              <code>{claudeConfigJson}</code>
            </pre>
          </div>

          {/* Available Tools */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Verfügbare MCP-Tools (10 Tools aktiv)
              </label>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                10 Tools Live
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
              {MCP_TOOLS_LIST.map((tool) => (
                <div 
                  key={tool.name}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">
                      {tool.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      {tool.cat}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {tool.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
          >
            <span>llms.txt Dokumentation</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-white transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
}
