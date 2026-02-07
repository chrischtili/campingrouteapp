import { FormData, AISettings } from "@/types/routePlanner";

function formatGermanDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}.${month}.${year}`;
}

export function generatePrompt(data: FormData): string {
  return `Du bist ein professioneller Wohnmobil‑Routenplaner mit Spezialwissen für Deutschland und internationale Reiseziele. Erstelle auf Basis meiner Angaben eine praxisnahe, gut strukturierte Wohnmobilroute. Berücksichtige Fahrzeugspezifikationen, Reiseziele, Budgetvorgaben und persönliche Vorlieben. Falls dir Echtzeit‑Daten (z. B. zu Verkehr, Verfügbarkeit, exakten Preisen) nicht zur Verfügung stehen, arbeite mit plausiblen Schätzungen, markiere sie als solche und weise mich darauf hin, was ich selbst noch im Navi oder in einer Camping‑App prüfen sollte.

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
${data.fuelType ? '• Kraftstoffart: ' + data.fuelType + '\n' : ''}${data.solarPower ? '• Solaranlage: ' + data.solarPower + 'W\n' : ''}${data.batteryCapacity ? '• Aufbaubatterie: ' + data.batteryCapacity + 'Ah\n' : ''}${data.toiletteSystem ? '• Toilettensystem: ' + data.toiletteSystem + '\n' : ''}${data.routeAdditionalInfo ? '• Zusätzliche Routeninfo: ' + data.routeAdditionalInfo + '\n' : ''}

${(data.numberOfTravelers && data.numberOfTravelers !== '1') || data.travelCompanions.length > 0 || data.accommodationType.length > 0 || data.facilities?.length > 0 || data.avgCampsitePriceMax || data.accommodation ? `
🏕️ ÜBERNACHTUNGSOPTIONEN:
──────────────────────────
• Anzahl der Reisenden: ${data.numberOfTravelers || '2'} Personen
${data.travelCompanions.length ? '• Reisebegleitung: ' + data.travelCompanions.map(c => {
  const companionLabels = {
    'Partner': 'Partner / Ehepartner',
    'Freunde': 'Freunde',
    'Familie': 'Familie',
    'Kinder': 'Kinder',
    'Babys': 'Babys / Kleinkinder',
    'Haustiere': 'Haustiere / Hunde',
    'Mehrgenerationenreise': 'Mehrgenerationenreise',
    'Seniorengruppe': 'Seniorengruppe'
  };
  return companionLabels[c] || c;
}).join(', ') + '\n' : ''}
${data.accommodationType.length ? '• Unterkunftstypen: ' + data.accommodationType.join(', ') + '\n' : ''}
${data.facilities?.length ? '• Benötigte Ausstattung: ' + data.facilities.join(', ') + '\n' : ''}
${data.avgCampsitePriceMax ? '• Budget pro Nacht: bis ' + data.avgCampsitePriceMax + '€\n' : ''}
${data.accommodation ? '• Besondere Wünsche: ' + data.accommodation + '\n' : ''}
` : ''}

${data.travelStyle || data.activities.length > 0 ? `
🌟 BESONDERE INTERESSEN & AKTIVITÄTEN:
──────────────────────────────────
${data.travelStyle ? '• Bevorzugter Reisestil: ' + data.travelStyle + '\n' : ''}
${data.activities.length ? data.activities.map(a => {
  const activityLabels = {
    'Wandern': 'Wandern',
    'Fahrradfahren': 'Fahrradfahren',
    'Wassersport': 'Wassersport (Schwimmen, Segeln, Kanu)',
    'Klettern': 'Klettern / Bergsteigen',
    'Vogelbeobachtung': 'Vogelbeobachtung / Naturbeobachtung',
    'Fischen': 'Fischen',
    'Astronomie': 'Astronomie / Sternenbeobachtung',
    'Museen': 'Museen & Galerien',
    'Historische Stätten': 'Historische Stätten',
    'Märkte': 'Lokale Märkte & Handwerk',
    'Yoga': 'Yoga & Meditation',
    'Wellnessangebote': 'Wellnessangebote & Spa',
    'Gastronomie': 'Gastronomie & Weinverkostung',
    'Hundefreundlich': 'Hundefreundliche Aktivitäten',
    'Kinderfreundlich': 'Kinderfreundliche Aktivitäten',
    'Fotografieren': 'Fotografieren'
  };
  return '• ' + (activityLabels[a] || a);
}).join('\n') + '\n' : ''}
` : ''}

${data.routePreferences?.length > 0 || data.avoidHighways?.length > 0 ? `
🛣️ ROUTENOPTIMIERUNG:
───────────────────────
${data.routePreferences?.length ? '• Routenpräferenzen: ' + data.routePreferences.map(p => {
  const preferenceLabels = {
    'Autobahnen bevorzugen': 'Autobahnen bevorzugen (schnellste Route)',
    'Landstraßen bevorzugen': 'Landstraßen bevorzugen (entspannte Fahrt)',
    'Panoramastraßen': 'Panoramastraßen (landschaftlich reizvoll)',
    'Seenroute': 'Seen & Gewässer einbeziehen',
    'Bergstraßen': 'Bergpässe & Aussichtspunkte',
    'Küstenroute': 'Küstenstraßen & Meerblicke',
    'Waldrouten': 'Wälder & Naturparks',
    'Stau vermeiden': 'Stau & Rush-Hour vermeiden',
    'Tunnel vermeiden': 'Tunnel vermeiden',
    'Nachtfahrten minimieren': 'Nachtfahrten minimieren',
    'Baustellen umfahren': 'Baustellen umfahren',
    'Maut vermeiden': 'Mautstraßen vermeiden',
    'Städte einbeziehen': 'Städte & Kultur einbeziehen',
    'Ländliche Routen': 'Ländliche & abgelegene Routen',
    'Historische Routen': 'Historische Straßen (z.B. Römerstraßen)'
  };
  return preferenceLabels[p] || p;
}).join(', ') + '\n' : ''}
${data.avoidHighways?.length ? '• Autobahnen/Maut: ' + data.avoidHighways.join(', ') + '\n' : ''}
` : ''}

${data.additionalInfo ? `
✨ ZUSÄTZLICHE INFORMATIONEN & WÜNSCHE:
─────────────────────────────────────
${data.additionalInfo}

` : ''}
📌 Plane die Route mit obigen Parametern und gliedere deine Antwort nach den folgenden Bausteinen und strukturiere deine Antwort mit klaren Überschriften:

1. Etappenplanung (Tageskilometer, Fahrzeit, Pausen alle 2–3 h, ggf. Alternativroute und kurze Begründung).

2. Übernachtungen (konkrete Camping‑/Stellplätze (und Alternativen)mit kurzer Beschreibung; nenne soweit möglich Links und grobe Preisbereiche, aber markiere Preise als Richtwerte).

3. Highlights & Aktivitäten (Top 3 pro Etappe, kurz mit Kosten/Öffnungszeiten, wenn bekannt).

4. Praktische Tipps (Navigation, Entsorgung, Notfall‑Hinweise).

5. Beste Reisezeit & Dauer (Kurzabschnitt).

6. Service unterwegs (Tanken, Supermärkte, Werkstätten).

7. Zusatzinfos (Budget‑Orientierung, Nachhaltigkeit, Gesundheit, Konnektivität).

8. Technik & Ausrüstung (Kurz‑Checkliste, App‑Empfehlungen).

9.Flexibilität (Alternativrouten, rechtliche Hinweise zu Wildcamping, Tools zur weiteren Optimierung).

**WICHTIG: Nutze, wenn verfügbar, dein internes Kartenwissen, um Entfernungen und typische Fahrzeiten zwischen den Etappen grob zu berechnen. Gib Entfernungen in km und Fahrzeiten in Stunden/Minuten an und kennzeichne sie als Schätzung (z. B. „ca. 230 km / 3:00–3:30 h“). Vermeide exakte Präzision, wenn du keinen Zugriff auf aktuelle Routing‑Daten hast, und fordere mich ausdrücklich auf, die Route im Navi (z. B. Google Maps, Here, Garmin, OpenStreetMap‑App) final zu prüfen.**

**Beispiel für eine Etappe:** 
**Etappe 1: Startpunkt – Etappenziel 1**
- **Entfernung:** ca. 230 km
- **Fahrzeit:** ca. 3:00–3:30 h
- **Route:** Über die A1, dann Abfahrt auf die B123 (alternativ über die A2, ca. 250 km / 3:30–4:00 h, landschaftlich reizvoller)
- **Hinweis:** Bei starkem Verkehr kann die Fahrzeit länger dauern. Alternativroute über die B123 ist empfehlenswert, wenn man mehr Zeit hat und die Landschaft genießen möchte.
- **Empfehlung:** Tankstelle in Etappenziel 1 aufsuchen, um für die nächste Etappe vorbereitet zu sein.

**Beispiel für eine Übernachtung:** 
**Campingplatz „Sonnenschein“**
- **Lage:** Direkt am See, ca. 2 km vom Etappenziel entfernt
- **Ausstattung:** Stromanschluss, Sanitäranlagen, Hunde erlaubt
- **Preis:** ca. 25–30 € pro Nacht (je nach Saison und Ausstattung)
- **Bewertung:** 4,5/5 (sehr empfehlenswert)
- **Link:** [www.camping-sonnenschein.de](http://www.camping-sonnenschein.de)
- **Hinweis:** In der Hauptsaison frühzeitig reservieren, da der Platz sehr beliebt ist.
**alternative Übernachtung:** Stellplatz „Am Waldrand“ (ca. 15 € pro Nacht, einfache Ausstattung, ruhige Lage, keine Reservierung möglich, first come first serve)

**Empfehlung für die nächste Etappe:**
**Etappe 2: Etappenziel 1 – Etappenziel 2**
- **Entfernung:** ca. 180 km
- **Fahrzeit:** ca. 2:30–3:00 h
- **Route:** Über die B123, dann weiter auf die A3 (alternativ über die Landstraße, ca. 200 km / 3:00–3:30 h, ruhiger und landschaftlich schöner)
- **Hinweis:** Die A3 ist schneller, aber die Landstraße bietet mehr Möglichkeiten für Pausen und Sightseeing.
- **Empfehlung:** Auf der Landstraße gibt es mehrere schöne Rastplätze und Aussichtspunkte, die einen kurzen Stopp wert sind.

**Beispiel für ein Highlight:**
**Etappe 1: Highlight „Burg Hohenzollern“**
- **Beschreibung:** Eine beeindruckende mittelalterliche Burg auf einem Berg, die einen fantastischen Blick über die Umgebung bietet.
- **Kosten:** Eintritt ca. 15 € pro Person, Hunde erlaubt (Leinenpflicht)
- **Öffnungszeiten:** Täglich von 9:00 bis 18:00 Uhr (letzter Einlass um 17:00 Uhr)
- **Link:** [www.burg-hohenzollern.com](http://www.burg-hohenzollern.com)
- **Hinweis:** Besonders in der Hauptsaison kann es zu Wartezeiten kommen, daher empfiehlt es sich, früh am Tag zu besuchen oder Tickets im Voraus online zu buchen.
- **Empfehlung:** Die Burg ist ein Muss für jeden, der Geschichte und Natur liebt. Der Blick von oben ist atemberaubend und die Aussicht auf die umliegende Landschaft ist unvergesslich.

**Praktische Tipps:**
- **Navigation:** Nutze Google Maps oder Here für die Navigation, da sie aktuelle Verkehrsdaten bieten. OpenStreetMap‑Apps sind eine gute Alternative für Offline‑Navigation.
- **Pausen:** Plane alle 2–3 Stunden eine Pause ein, um dich zu erholen und die Umgebung zu genießen. Rastplätze entlang der Autobahnen bieten oft gute Möglichkeiten für kurze Pausen.
- **Notfall‑Hinweise:** Halte die Notfallnummern bereit (z. B. 112 in Europa) und informiere dich über die Standorte von Krankenhäusern und Werkstätten entlang der Route.
- **Tankstellen:** Nutze Apps wie Tankstellensucher oder Shell Box, um die günstigsten Preise zu finden. Plane Tankstopp für die Nachte Etappe ein, um sicherzustellen, dass du genug Kraftstoff hast.
- **Wetter:** Überprüfe das Wetter vor der Abfahrt und plane entsprechend. Regelmäßige Wetterupdates während der Reise sind ratsam, besonders in Gebieten mit starkem Wetter.

**Zusatzinformationen für die Route:**
- **Budget‑Orientierung:** Schätze die Gesamtkosten für Übernachtungen, Aktivitäten und Verpflegung grob ein, um eine Vorstellung von den Ausgaben zu bekommen. Berücksichtige dabei saisonale Preisunterschiede.
- **Nachhaltigkeit:** Berücksichtige umweltfreundliche Optionen, wie z. B. Campingplätze mit nachhaltigen Praktiken, Aktivitäten in der Natur und Möglichkeiten zur Müllvermeidung.
- **Gesundheit:** Informiere dich über die Verfügbarkeit von medizinischer Versorgung entlang der Route und packe eine gut ausgestattete Reiseapotheke ein.
- **Konnektivität:** Plane für Bereiche mit schlechter Mobilfunkabdeckung Offline‑Karten und wichtige Informationen auf Papier oder in einer Offline‑App zu speichern.

**Technik & Ausrüstung:**
- **Checkliste:** Erstelle eine kurze Checkliste für die Reise, die wichtige Ausrüstungsgegenstände, Dokumente und persönliche Gegenstände umfasst.
- **App‑Empfehlungen:** Empfehle nützliche Apps für die Reiseplanung, Navigation, Campingplatzsuche und Aktivitäten vor Ort.

**Flexibilität:**
- **Alternativrouten:** Biete alternative Routenoptionen an, falls es unterwegs zu unvorhergesehenen Ereignissen kommt (z. B. Verkehr, Wetter, Straßensperrungen).
- **Rechtliche Hinweise:** Informiere über die rechtlichen Bestimmungen zum Wildcamping in den jeweiligen Ländern und Regionen.
- **Tools zur Optimierung:** Empfehle Tools oder Apps, mit denen ich die Route unterwegs weiter optimieren oder anpassen kann (z. B. Routenplaner, Campingplatz-Apps, Verkehrs-Apps).

**Zusammenfassung:**
`;
}

export async function callAIAPI(formData: FormData, aiSettings: AISettings): Promise<string> {
  const prompt = generatePrompt(formData);
  
  // Log the API call details for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('=== AI API Call Details ===');
    console.log('Provider:', aiSettings.aiProvider);
    console.log('API Key present:', !!aiSettings.apiKey?.trim());
  }
  
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
      // Use the selected model directly (assuming these are actual OpenAI models)
      const actualModel = aiSettings.openaiModel || 'gpt-5.2';
      
      // For newer models, use max_completion_tokens instead of max_tokens
      // Assuming GPT-5 models use the newer parameter format
      const usesCompletionTokens = [
        'gpt-5.2',
        'gpt-5',
        'gpt-5-mini',
        'gpt-5-nano',
        'gpt-4o-2024-05-13',
        'gpt-4o-mini-2024-07-18',
        'gpt-4-turbo-2024-04-09',
        'gpt-4-0125-preview',
        'gpt-4-1106-preview'
      ].includes(actualModel);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('OpenAI Model:', aiSettings.openaiModel || 'default (gpt-5.2)');
        console.log('Actual model used:', actualModel);
        console.log('Using max_completion_tokens:', usesCompletionTokens);
      }
      
      requestData = {
        model: actualModel,
        messages: [
          { role: 'system', content: 'Du bist ein hilfreicher Wohnmobil-Routenplaner. Antworte in Markdown-Format.' },
          { role: 'user', content: prompt }
        ],
        ...(usesCompletionTokens ? { max_completion_tokens: 4000 } : { max_tokens: 4000 }),
        ...(['gpt-5', 'gpt-5.2', 'gpt-5-mini', 'gpt-5-nano'].includes(actualModel) ? { temperature: 1 } : { temperature: 0.7 })
      };
      break;
    

    
    case 'mistral':
      apiUrl = 'https://api.mistral.ai/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiSettings.apiKey}`
      };
      const mistralModel = aiSettings.mistralModel || 'mistral-large-latest';
      if (process.env.NODE_ENV === 'development') {
        console.log('Mistral Model:', mistralModel);
      }
      
      requestData = {
        model: mistralModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.7
      };
      break;
    
    case 'google':
      // Handle both current and future Gemini models
      const googleModel = aiSettings.googleModel || 'gemini-1.5-flash-001';
      console.log('Google Model:', googleModel);
      
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:generateContent?key=${aiSettings.apiKey}`;
      headers = { 'Content-Type': 'application/json' };
      requestData = {
        contents: [{ parts: [{ text: prompt }] }]
      };
      // Add safetyNet settings for better control
      if (googleModel.startsWith('gemini-3') || googleModel.startsWith('gemini-2.5')) {
        requestData.safetySettings = [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
        ];
        console.log('Added safety settings for newer Gemini models');
      }
      break;
    
    default:
      throw new Error('Unsupported AI provider');
  }
  
  console.log('===========================');
  
  let response;
  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData)
    });
  } catch (fetchError) {
    console.error('Network Error:', fetchError);
    if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
      throw new Error('Netzwerkfehler: Bitte überprüfe deine Internetverbindung');
    } else if (fetchError instanceof Error && fetchError.message.includes('timeout')) {
      throw new Error('Timeout: Die Anfrage hat zu lange gedauert. Bitte versuche es später erneut.');
    } else if (aiSettings.aiProvider === 'google') {
      throw new Error('Gemini API Fehler: Bitte überprüfe deinen API-Schlüssel und stelle sicher, dass er für Gemini freigeschaltet ist. Falls das Problem weiterhin besteht, könnte der Gemini-Server vorübergehend nicht verfügbar sein.');
    } else {
      throw new Error('Fehler beim Aufruf der KI. Bitte überprüfe deinen API-Schlüssel und deine Internetverbindung.');
    }
  }
  
  if (!response) {
    throw new Error('Keine Antwort vom Server erhalten. Bitte versuche es später erneut.');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || errorData.message || 'API request failed';
    console.error('API Error Response:', response.status, errorMessage);
    
    // Clean up error message to remove API key and provide user-friendly message
    let userFriendlyMessage = 'Fehler bei der API-Anfrage. ';
    
    if (errorMessage.includes('Incorrect API key') || errorMessage.includes('Invalid API key')) {
      userFriendlyMessage = 'Ungültiger API-Schlüssel. Bitte überprüfe deinen API-Schlüssel.';
    } else if (errorMessage.includes('API key not found') || errorMessage.includes('authentication')) {
      userFriendlyMessage = 'API-Schlüssel nicht gefunden oder ungültig. Bitte gib einen gültigen API-Schlüssel ein.';
    } else if (errorMessage.includes('Insufficient quota') || errorMessage.includes('quota')) {
      userFriendlyMessage = 'Dein API-Kontingent ist aufgebraucht. Bitte überprüfe dein Konto.';
    } else if (errorMessage.includes('Rate limit') || errorMessage.includes('rate limit')) {
      userFriendlyMessage = 'API-Ratenlimit erreicht. Bitte warte einen Moment oder erhöhe dein Limit.';
    } else if (errorMessage.includes('model not found') || errorMessage.includes('Model not found')) {
      userFriendlyMessage = 'Das ausgewählte Modell ist nicht verfügbar. Bitte wähle ein anderes Modell.';
    } else if (errorMessage.includes('permission') || errorMessage.includes('access')) {
      userFriendlyMessage = 'Zugriff verweigert. Bitte überprüfe deine API-Berechtigungen.';
    } else {
      // Generic error message that doesn't expose API details
      userFriendlyMessage = 'Fehler bei der API-Anfrage. Bitte überprüfe deine Einstellungen und Internetverbindung.';
    }
    
    throw new Error(userFriendlyMessage);
  }
  
  const responseData = await response.json();
  
  let aiResponse = '';
  switch (aiSettings.aiProvider) {
    case 'openai':
    case 'mistral':
      aiResponse = responseData.choices[0].message.content;
      break;
    case 'google':
      aiResponse = responseData.candidates[0].content.parts[0].text;
      break;
  }
  
  return aiResponse;
}
