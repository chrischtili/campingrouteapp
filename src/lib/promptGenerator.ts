import { FormData, AISettings } from "@/types/routePlanner";

function formatGermanDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}.${month}.${year}`;
}

export function generatePrompt(data: FormData): string {
  return `Du bist ein professioneller Wohnmobil-Routenplaner mit Spezialwissen für Deutschland und internationale Reiseziele. Erstelle eine maßgeschneiderte Wohnmobilroute basierend auf den folgenden Parametern. Berücksichtige dabei Fahrzeugspezifikationen, Reiseziele, Budgetvorgaben und individuelle Präferenzen. Die Route soll praxisorientiert, flexibel anpassbar und für alle Erfahrungsstufen geeignet sein.

🗺️ REISEROUTE:
──────────────
• Startpunkt: ${data.startPoint}
• Ziel: ${data.destination}
• Abreisedatum: ${formatGermanDate(data.startDate)}
• Ankunftsdatum: ${formatGermanDate(data.endDate)}
${data.distance ? '• Geschätzte Gesamtdistanz: ' + data.distance + ' km\n' : ''}${data.maxDailyDistance ? '• Max. Fahrstrecke pro Tag: ' + data.maxDailyDistance + ' km\n' : ''}${data.routeType ? '• Routentyp: ' + data.routeType + '\n' : ''}

🚐 FAHRZEUGSPEZIFISCHE FILTER:
───────────────────────────
• Länge: ${data.vehicleLength || '7'} m
• Höhe: ${data.vehicleHeight || '2.9'} m
• Breite: ${data.vehicleWidth || '2.3'} m
• Zulässiges Gesamtgewicht: ${data.vehicleWeight || '3.5'} t
• Achslast: ${data.axleLoad || '2.5'} t pro Achse
${data.fuelType ? '• Kraftstoffart: ' + data.fuelType + '\n' : ''}${data.solarPower ? '• Solaranlage: ' + data.solarPower + 'W\n' : ''}${data.batteryCapacity ? '• Aufbaubatterie: ' + data.batteryCapacity + 'Ah\n' : ''}${data.toiletteSystem ? '• Toilettensystem: ' + data.toiletteSystem + '\n' : ''}${data.routeAdditionalInfo ? '• Zusätzliche Routeninfo: ' + data.routeAdditionalInfo + '\n' : ''}${data.routePreferences?.length ? '• Routenpräferenzen: ' + data.routePreferences.join(', ') + '\n' : ''}

🏕️ ÜBERNACHTUNGSOPTIONEN:
──────────────────────────
${data.accommodationType.length ? '• Unterkunftstypen: ' + data.accommodationType.join(', ') + '\n' : '• Unterkunftstypen: Keine spezifischen Präferenzen\n'}
${data.facilities?.length ? '• Benötigte Ausstattung: ' + data.facilities.join(', ') + '\n' : '• Benötigte Ausstattung: Keine spezifischen Anforderungen\n'}
${data.avgCampsitePriceMax ? '• Budget pro Nacht: bis ' + data.avgCampsitePriceMax + '€\n' : '• Budget pro Nacht: Keine spezifischen Budgetvorgaben\n'}
${data.accommodation ? '• Besondere Wünsche: ' + data.accommodation + '\n' : '• Besondere Wünsche: Keine zusätzlichen Wünsche\n'}

🌟 BESONDERE INTERESSEN & AKTIVITÄTEN:
──────────────────────────────────
• Anzahl der Reisenden: ${data.numberOfTravelers || '2'} Personen
${data.travelStyle ? '• Bevorzugter Reisestil: ' + data.travelStyle + '\n' : '• Bevorzugter Reisestil: Keine spezifische Präferenz\n'}
${data.activities.length ? '• Aktivitäten & Interessen: ' + data.activities.join(', ') + '\n' : '• Aktivitäten & Interessen: Keine spezifischen Aktivitäten\n'}
${data.travelCompanions.length ? '• Reisebegleitung: ' + data.travelCompanions.join(', ') + '\n' : '• Reisebegleitung: Keine spezifischen Angaben\n'}

🛣️ ROUTENPRÄFERENZ:
───────────────────────
${data.avoidHighways.length ? '• Autobahnen/Maut: ' + data.avoidHighways.join(', ') + '\n' : '• Autobahnen/Maut: Keine spezifischen Präferenzen\n'}

✨ ZUSÄTZLICHE INFORMATIONEN & WÜNSCHE:
─────────────────────────────────────
${data.additionalInfo ? data.additionalInfo + '\n\n' : 'Keine zusätzlichen Informationen\n\n'}
📌 Plane eine optimierte Wohnmobilroute für mich mit diesen Schwerpunkten:

**WICHTIG: Berechne Entfernungen und Fahrtzeiten ausschließlich anhand aktueller Kartendaten (z. B. OpenStreetMap, Google Maps API, Here Maps). Gib nur bestätigte Werte aus und weise auf Unsicherheiten hin (z. B. ‚Entfernung ca. XYZ km, basierend auf [Quelle]'). Vermeide Schätzungen oder Halluzinationen – falls keine Daten verfügbar sind, gib dies klar an.**

1. Etappenplanung:
- Tagesetappen mit Fahrtzeiten, Distanzen, Pausenempfehlungen (alle 2–3 Std.) und Alternativrouten (Stau/Baustellen/landschaftliche Highlights).
- Höhenprofile, Steigungen, Gewichtsbeschränkungen (siehe obiges zul. Gesamtgewicht), Maut/Vignetten (national/international).

2. Übernachtungen:
- Camping-/Stellplätze: Finde konkrete Übernachtungsmöglichkeiten mit direkten Buchungslinks, aktuellen Preisen, detaillierter Ausstattung (Strom, Wasser, Entsorgung, WLAN, etc.), Stellplatzgrößen, Hunde- und Familienfreundlichkeit, aktuellen Bewertungen (Ruhe, Sauberkeit, Service) und Reservierungspflicht.
- Alternativplätze: Gib immer 2-3 Alternativen pro Etappe an, falls der Hauptplatz ausgebucht ist.

3. Highlights & Aktivitäten:
- Top 3 pro Etappe (Natur/Kultur/Kulinarik), Parkmöglichkeiten für Wohnmobile, Geheimtipps, Kosten/Öffnungszeiten.

4. Praktische Tipps:
- Navigation (z. B. Garmin Camper, Park4Night), Entsorgungsstationen, Notfallkontakte (Werkstätten/Pannendienste/Krankenhäuser), Wetter-/Straßeninfos, Lärm-/Umweltvorschriften.

5. Beste Reisezeit & Dauer:
- Klimatische Empfehlungen, regionale Events, Hauptreisezeiten vermeiden.

6. Service unterwegs:
- 24/7-Tankstellen (Diesel/LPG), Supermärkte mit Wohnmobil-Parkplätzen, Werkstätten, Waschmöglichkeiten.

7. Zusatzinfos:
- Budget (Sprit/Maut/Übernachtungen/Aktivitäten), Nachhaltigkeit (Eco-Camping, Mülltrennung), Gesundheit (Apotheken/Tierärzte), SIM-Karten/EU-Roaming, benötigte Dokumente, Sprachhilfen.

8. Technik & Ausrüstung:
- Empfohlene Ausrüstung (z. B. Leveling-Blöcke), Checkliste für Abfahrt, nützliche Apps (Stellplatzsuche/Wetter).

9. Flexibilität:
- Alternativrouten, Wildcampen (wo erlaubt), Tools zur Routenoptimierung (ADAC/Google Maps Offline oder ähnliches).
`;
}

export async function callAIAPI(formData: FormData, aiSettings: AISettings): Promise<string> {
  const prompt = generatePrompt(formData);
  
  let apiUrl = '';
  let headers: Record<string, string> = {};
  let requestData: unknown = {};
  
  switch (aiSettings.aiProvider) {
    case 'openai':
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiSettings.apiKey}`
      };
      requestData = {
        model: aiSettings.openaiModel || 'gpt-4o-2024-05-13',
        messages: [
          { role: 'system', content: 'Du bist ein hilfreicher Wohnmobil-Routenplaner. Antworte in Markdown-Format.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.7
      };
      break;
    
    case 'anthropic':
      apiUrl = 'https://api.anthropic.com/v1/messages';
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': aiSettings.apiKey,
        'anthropic-version': '2023-06-01'
      };
      requestData = {
        model: aiSettings.anthropicModel || 'claude-3-5-sonnet-20240620',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      };
      break;
    
    case 'mistral':
      apiUrl = 'https://api.mistral.ai/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiSettings.apiKey}`
      };
      requestData = {
        model: aiSettings.mistralModel || 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.7
      };
      break;
    
    case 'google':
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${aiSettings.googleModel || 'gemini-1.5-flash-001'}:generateContent?key=${aiSettings.apiKey}`;
      headers = { 'Content-Type': 'application/json' };
      requestData = {
        contents: [{ parts: [{ text: prompt }] }]
      };
      break;
    
    default:
      throw new Error('Unsupported AI provider');
  }
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestData)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'API request failed');
  }
  
  const responseData = await response.json();
  
  let aiResponse = '';
  switch (aiSettings.aiProvider) {
    case 'openai':
    case 'mistral':
      aiResponse = responseData.choices[0].message.content;
      break;
    case 'anthropic':
      aiResponse = responseData.content[0].text;
      break;
    case 'google':
      aiResponse = responseData.candidates[0].content.parts[0].text;
      break;
  }
  
  return aiResponse;
}
