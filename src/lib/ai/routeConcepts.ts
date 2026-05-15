import i18next from "i18next";
import { FormData, AISettings, RouteOption, RouteConceptResponse } from "@/types/routePlanner";
import { callAIAPIInternal } from "@/lib/promptGenerator";

/**
 * Generiert 3 unterschiedliche Routen-Konzepte basierend auf den Nutzereingaben.
 * Erzeugt einen speziellen Prompt, der die KI zwingt, im JSON-Format zu antworten.
 */
export async function generateRouteConcepts(
  formData: FormData,
  aiSettings: AISettings
): Promise<RouteOption[]> {
  const lang = (i18next.language || "de").toLowerCase();
  
  const systemPrompt = lang.startsWith("de")
    ? `Du bist ein erfahrener Reiseplaner. Deine Aufgabe ist es, 3 strategisch unterschiedliche Routen-Konzepte für einen Camping-Trip zu erstellen.
    ANTWORTE ZWINGEND NUR IM JSON-FORMAT.
    
    Jede Option muss enthalten:
    - id (1, 2, 3)
    - title (kurz & knackig)
    - theme (z.B. "Natur & Ruhe", "Kultur & Städte", "Schnellste Route")
    - estimatedDistance (ungefähre Gesamtkilometer)
    - highlights (Array von 3-5 konkreten Ortsnamen oder Sehenswürdigkeiten in chronologischer Reihenfolge der Reise)
    - shortDescription (1-2 Sätze)
    
    Struktur: { "options": [...] }`
    : `You are an expert travel planner. Create 3 strategically different route concepts for a camping trip.
    ANSWER STRICTLY IN JSON FORMAT ONLY.
    
    Each option must include:
    - id (1, 2, 3)
    - title (catchy title)
    - theme (e.g., "Nature & Quiet", "Culture & Cities", "Fastest Route")
    - estimatedDistance (approximate total km)
    - highlights (Array of 3-5 specific town names or landmarks in chronological travel order)
    - shortDescription (1-2 sentences about the character of the route)
    
    Structure: { "options": [...] }`;

  const userPrompt = `
    Start: ${formData.startPoint}
    Ziel: ${formData.destination}
    Dauer: ${formData.startDate} bis ${formData.endDate}
    Fahrzeug: ${formData.vehicleType}
    Vorlieben: ${formData.activities.join(", ")}
    Zusatzinfo: ${formData.additionalInfo}
  `;

  const combinedPrompt = `${systemPrompt}\n\nNutzereingaben:\n${userPrompt}`;

  try {
    const rawResponse = await callAIAPIInternal(combinedPrompt, aiSettings);
    
    // JSON aus der Antwort extrahieren (falls die KI Markdown-Blöcke drumherum baut)
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : rawResponse;
    
    const parsed: RouteConceptResponse = JSON.parse(cleanJson);
    return parsed.options || [];
  } catch (error) {
    console.error("Error generating route concepts:", error);
    throw new Error(i18next.t("planner.loading.error"));
  }
}

/**
 * Sucht per Geocoding nach den Koordinaten der Highlights, 
 * um sie auf der Karte visualisieren zu können.
 */
export async function geocodeHighlights(highlights: string[]): Promise<any[]> {
  const results = await Promise.all(
    highlights.map(async (query) => {
      if (!query || query.length < 2) return null;
      
      try {
        // Zuerst suggest endpoint versuchen (schnell)
        const params = new URLSearchParams({
          q: query.trim(),
          limit: "1",
        });
        const response = await fetch(`/api/places/suggest?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          const suggestion = data.suggestions?.[0];
          if (suggestion && suggestion.lat && suggestion.lon) {
            return { ...suggestion, originalQuery: query };
          }
        }
      } catch (e) {
        // Ignorieren und weitermachen
      }
      return null;
    })
  );
  
  const filtered = results.filter(Boolean);
  return filtered;
}
