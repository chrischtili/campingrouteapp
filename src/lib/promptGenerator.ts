import { FormData, AISettings } from "@/types/routePlanner";
import i18next from "i18next";

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const lang = (i18next.language || 'en').toLowerCase();
  const locale = lang.startsWith('de') ? 'de-DE' : lang.startsWith('nl') ? 'nl-NL' : lang.startsWith('fr') ? 'fr-FR' : lang.startsWith('it') ? 'it-IT' : 'en-US';
  return date.toLocaleDateString(locale);
}

type GpxFormat = 'codeblock' | 'plain';

function buildGpxInstructions(
  data: FormData,
  t: (key: string, options?: any) => string,
  format: GpxFormat
): string {
  const modes = data.gpxOutputMode || [];
  if (modes.length === 0) return '';
  const baseKey = format === 'codeblock' ? 'prompt.gpx' : 'prompt.gpxPlain';
  const wantsGarmin = modes.includes('garmin');
  const wantsRouteTrack = modes.includes('routeTrack');
  if (wantsGarmin && wantsRouteTrack) return t(`${baseKey}.both`);
  if (wantsGarmin) return t(`${baseKey}.garmin`);
  return t(`${baseKey}.routeTrack`);
}

export function generatePrompt(data: FormData, options?: { gpxFormat?: GpxFormat }): string {
  const t = (key: string, options?: any) => i18next.t(key, options);
  const lang = (i18next.language || 'en').toLowerCase();
  const languageName = lang.startsWith('de') ? 'Deutsch' : lang.startsWith('nl') ? 'Nederlands' : lang.startsWith('fr') ? 'Français' : lang.startsWith('it') ? 'Italiano' : 'English';
  const gpxInstructions = buildGpxInstructions(data, t, options?.gpxFormat ?? 'codeblock');
  const isMotorcycleTent = data.vehicleType === 'motorcycleTent';
  const maxDailyDistance = Number(data.maxDailyDistance || 0);
  const maxDailyDriveHours = Number(data.maxDailyDriveHours || 0);
  const hasDailyLimitPriority = maxDailyDistance > 0 && maxDailyDriveHours > 0 && !!data.dailyLimitPriority;
  const wantsRestaurantLinks = (data.facilities || []).some((facility) => facility === 'restaurant' || facility === 'restaurantNearby');
  const dataSourcePolicy = t('prompt.dataSourcePolicy');
  const accommodationTypeTagPolicy = t('prompt.accommodationTypeTagPolicy');
  const openCampingMapPolicy = lang.startsWith('de')
    ? [
        'OpenCampingMap-Regeln:',
        '- Bevorzuge fuer jeden Uebernachtungsort zuerst einen konkreten OpenCampingMap-Eintrag oder einen stabilen OpenCampingMap-Kartenlink.',
        '- Suche pro Ort nicht nur einmal, sondern gezielt mit Ortsname, Regionsname, Platztyp und ggf. bekanntem Platznamen.',
        '- Wenn mehrere OpenCampingMap-Treffer moeglich sind, bevorzuge den klarsten Namensbezug zum Zielort, die passendste Uebernachtungsart und den kleinsten Umweg zur Route.',
        '- Verwende einen OpenCampingMap-Objektlink nur, wenn Ort und Platz wirklich zusammenpassen. Bei Unsicherheit nutze stattdessen einen Kartenlink.',
        '- Wenn nach mehreren gezielten Suchen kein sicherer OpenCampingMap-Treffer auffindbar ist, sage das knapp und gehe direkt zum naechsten Ort weiter.',
        '- Erfinde niemals OpenCampingMap-Objekte, IDs, Platznamen, Adressen, Telefonnummern oder Ausstattungen.'
      ].join('\n')
    : [
        'OpenCampingMap rules:',
        '- Prefer a concrete OpenCampingMap entry or a stable OpenCampingMap map link for each overnight stop.',
        '- Search each place repeatedly using place name, region, accommodation type and known campsite name if available.',
        '- If several OpenCampingMap candidates exist, prefer the clearest name match to the target area, the best fitting accommodation type and the smallest detour from the route.',
        '- Only use a direct OpenCampingMap object link if place and campsite clearly match. If uncertain, use a map link instead.',
        '- If no reliable OpenCampingMap result can be found after several targeted searches, say so briefly and continue with the next place.',
        '- Never invent OpenCampingMap objects, IDs, campsite names, addresses, phone numbers or facilities.'
      ].join('\n');
  const hasBaseAccommodationType = data.accommodationType.includes('camping') || data.accommodationType.includes('pitch');
  const hasSpecificAccommodationType = data.accommodationType.some(type => type !== 'camping' && type !== 'pitch');
  const noAccommodationPreference = hasBaseAccommodationType && hasSpecificAccommodationType;
  const accommodationTypesLine = data.accommodationType.length
    ? '• ' + t('prompt.labels.accommodationTypes') + ': ' + data.accommodationType.map(at => t(`planner.accommodation.categories.type.options.${at}`)).join(', ') + '\n'
    : '';
  const accommodationTypePriorityLine = noAccommodationPreference
    ? '• ' + t('prompt.labels.accommodationTypePriorityNote') + '\n'
    : '';
  const restaurantLinkInstruction = wantsRestaurantLinks
    ? lang.startsWith('de')
      ? '\n\nWichtig: Wenn bei einem vorgeschlagenen Platz ein Restaurant am Platz oder ein gutes Restaurant in fußläufiger Entfernung auffindbar ist, nenne 1 bis 3 konkrete Restaurants mit direktem Link. Erfinde keine Restaurants oder URLs. Wenn kein verlässlicher Restaurant-Link auffindbar ist, sage das knapp.'
      : '\n\nImportant: If a proposed stop has a restaurant on site or a good restaurant within walking distance, include 1 to 3 concrete restaurants with direct links. Never invent restaurants or URLs. If no reliable restaurant link can be found, state that briefly.'
    : '';

  const stageLines = (data.stages || [])
    .map((stage, index) => {
      if (!stage.destination?.trim()) return '';
      const lines = [`• ${t('prompt.labels.stage', { num: index + 1 })}: ${stage.destination.trim()}`];
      if (stage.booked) {
        lines.push(`• ${t('prompt.labels.stageBookedNoSearch', { num: index + 1 })}`);
      }
      if (stage.detailsEnabled) {
        if (stage.arrivalDate) lines.push(`• ${t('prompt.labels.stageArrivalDate', { num: index + 1 })}: ${formatDate(stage.arrivalDate)}`);
        if (stage.arrivalTime) lines.push(`• ${t('prompt.labels.stageArrivalTime', { num: index + 1 })}: ${stage.arrivalTime}`);
        if (stage.departureDate) lines.push(`• ${t('prompt.labels.stageDepartureDate', { num: index + 1 })}: ${formatDate(stage.departureDate)}`);
        if (stage.departureTime) lines.push(`• ${t('prompt.labels.stageDepartureTime', { num: index + 1 })}: ${stage.departureTime}`);
      }
      return lines.join('\n');
    })
    .filter(Boolean)
    .join('\n');

  const routeLines = [
    `• ${t('prompt.labels.start')}: ${data.startPoint}`,
    `• ${t('prompt.labels.destination')}: ${data.destination}`,
    data.targetRegions ? `• ${t('prompt.labels.targetRegions')}: ${data.targetRegions}` : '',
    data.preferScenicLongerStops ? `• ${t('prompt.labels.preferScenicLongerStops')}` : '',
    data.destinationBooked ? `• ${t('prompt.labels.destinationBookedNoSearch')}` : '',
    stageLines,
    data.startDate ? `• ${t('prompt.labels.startDeparture')}: ${formatDate(data.startDate)}` : '',
    data.startTime ? `• ${t('prompt.labels.startDepartureTime')}: ${data.startTime}` : '',
    data.endDate ? `• ${t('prompt.labels.finalArrival')}: ${formatDate(data.endDate)}` : '',
    data.endTime ? `• ${t('prompt.labels.finalArrivalTime')}: ${data.endTime}` : '',
    data.distance ? `• ${t('prompt.labels.totalDistance')}: ${data.distance} km` : '',
    maxDailyDistance > 0 ? `• ${t('prompt.labels.maxDailyDistance')}: ${data.maxDailyDistance} km` : '',
    maxDailyDriveHours > 0 ? `• ${t('prompt.labels.maxDailyDriveTime')}: ${data.maxDailyDriveHours} h` : '',
    hasDailyLimitPriority ? `• ${t('prompt.labels.dailyLimitPriority')}: ${t(`planner.route.limitPriority.options.${data.dailyLimitPriority}`)}` : '',
    data.travelPace ? `• ${t('prompt.labels.travelPace')}: ${t(`planner.route.travelPace.options.${data.travelPace}`)} (${t('prompt.labels.travelPaceNote')})` : '',
    data.routeAdditionalInfo ? `• ${t('prompt.labels.additional.label')}: ${data.routeAdditionalInfo}` : '',
  ].filter(Boolean).join('\n');

  return `${t('prompt.systemRole', { language: languageName })}
${dataSourcePolicy}
${accommodationTypeTagPolicy}
${openCampingMapPolicy}

🗺️ ${t('prompt.sections.route')}:
──────────────
${routeLines}

🚐 ${t('prompt.sections.vehicle')}:
───────────────────────────
${!isMotorcycleTent ? `• ${t('prompt.labels.length')}: ${data.vehicleLength || '7'} m
• ${t('prompt.labels.height')}: ${data.vehicleHeight || '2.9'} m
• ${t('prompt.labels.width')}: ${data.vehicleWidth || '2.3'} m
` : ''}${data.weightClass ? '• ' + t('prompt.labels.weightClass') + ': ' + t(`planner.vehicle.weightClass.options.${data.weightClass}`) + '\n' : ''}${data.vehicleType ? '• ' + t('prompt.labels.vehicleType') + ': ' + t(`planner.vehicle.type.options.${data.vehicleType}`) + '\n' : ''}${!isMotorcycleTent && data.fuelType ? '• ' + t('prompt.labels.fuelType') + ': ' + t(`planner.vehicle.fuel.options.${data.fuelType}`) + '\n' : ''}${!isMotorcycleTent && data.solarPower ? '• ' + t('prompt.labels.solar') + ': ' + data.solarPower + 'W\n' : ''}${!isMotorcycleTent && data.batteryCapacity ? '• ' + t('prompt.labels.battery') + ': ' + data.batteryCapacity + 'Ah\n' : ''}${!isMotorcycleTent && data.autonomyDays ? '• ' + t('prompt.labels.autonomyDays') + ': ' + data.autonomyDays + ' ' + t('prompt.labels.autonomyUnit') + '\n' : ''}${!isMotorcycleTent && data.heatingSystem ? '• ' + t('prompt.labels.heating') + ': ' + t(`planner.vehicle.heating.options.${data.heatingSystem}`) + '\n' : ''}${!isMotorcycleTent && data.levelingJacks ? '• ' + t('prompt.labels.levelingJacks') + ': ' + t(`planner.vehicle.levelingJacks.options.${data.levelingJacks}`) + '\n' : ''}${!isMotorcycleTent && data.toiletteSystem ? '• ' + t('prompt.labels.toilet') + ': ' + t(`planner.vehicle.toilet.options.${data.toiletteSystem}`) + '\n' : ''}

${(data.numberOfTravelers && data.numberOfTravelers !== '1') || data.accommodationType.length > 0 || data.facilities?.length > 0 || data.avgCampsitePriceMax || data.quietPlaces || data.accommodation ? `
🏕️ ${t('prompt.sections.accommodation')}:
──────────────────────────
• ${t('prompt.labels.travelers')}: ${data.numberOfTravelers || '2'} ${t('prompt.labels.travelersUnit')}
${data.dogFriendly ? '• ' + t('planner.accommodation.dogFriendlyToggle.label') + ': ' + t('prompt.labels.yes') + '\n' : ''}
${accommodationTypesLine}${accommodationTypePriorityLine}
${data.facilities?.length ? '• ' + t('prompt.labels.facilities') + ': ' + data.facilities.map(f => t(`planner.accommodation.categories.facilities.options.${f}`)).join(', ') + '\n' : ''}
${data.avgCampsitePriceMax ? '• ' + t('prompt.labels.budget') + ': ' + t('prompt.labels.budgetUpTo') + ' ' + data.avgCampsitePriceMax + '€\n' : ''}
${data.quietPlaces ? '• ' + t('prompt.labels.quietPlaces') + ': ' + t('prompt.labels.yes') + '\n' : ''}
${data.accommodation ? '• ' + t('prompt.labels.specialWishes') + ': ' + data.accommodation + '\n' : ''}
` : ''}

${data.activities.length > 0 ? `
🌟 ${t('prompt.sections.interests')}:
──────────────────────────────────
${data.activities.length ? data.activities.map(a => '• ' + t(`planner.interests.options.${a}`)).join('\n') + '\n' : ''}
` : ''}

${data.routePreferences?.length > 0 || data.avoidHighways?.length > 0 || data.avoidRegions ? `
🛣️ ${t('prompt.sections.optimization')}:
───────────────────────
${data.routePreferences?.length ? '• ' + t('prompt.labels.preferences') + ': ' + data.routePreferences.map(p => {
  const categories = ['roadType', 'landscape', 'avoidances', 'restrictions', 'experiences'];
  for (const cat of categories) {
    const key = `planner.optimization.categories.${cat}.options.${p}`;
    const translation = t(key);
    if (translation !== key) return translation;
  }
  return p;
}).join(', ') + '\n' : ''}
${data.avoidHighways?.length ? '• ' + t('prompt.labels.highwayMaut') + ': ' + data.avoidHighways.join(', ') + '\n' : ''}
${data.avoidRegions ? '• ' + t('prompt.labels.avoidRegions') + ': ' + data.avoidRegions + '\n' : ''}
` : ''}

${data.additionalInfo ? `
✨ ${t('prompt.sections.additional')}:
─────────────────────────────────────
${data.additionalInfo}

` : ''}

${t('prompt.instructions')}
${t('prompt.instructionsCamperPlanning')}
${restaurantLinkInstruction}
${gpxInstructions ? `\n\n${gpxInstructions}` : ''}
`;
}

export async function callAIAPI(formData: FormData, aiSettings: AISettings): Promise<string> {
  const prompt = generatePrompt(formData, { gpxFormat: 'plain' });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('=== AI API Call Details ===');
    console.log('Provider:', 'openai');
    console.log('API Key present:', !!aiSettings.apiKey?.trim());
  }

  return _callAIAPIInternal(prompt, aiSettings);
}

async function _callAIAPIInternal(prompt: string, aiSettings: AISettings): Promise<string> {
  const lang = (i18next.language || 'en').toLowerCase();
  let apiUrl = '';
  let headers: Record<string, string> = {};
  let requestData: unknown = {};
  const webSearchDirective = lang.startsWith('de')
    ? [
        'Wichtig fuer die Websuche:',
        '- Nutze vor der Antwort zwingend die Websuche.',
        '- Wenn OpenCampingMap die Primaerquelle sein soll, suche pro Etappe und pro Ort mehrfach gezielt auf OpenCampingMap statt nach dem ersten unsicheren Treffer abzubrechen.',
        '- Suche OpenCampingMap gezielt mit Ortsname, Region, Platztyp und ggf. bekanntem Platznamen statt nur mit einer einzelnen Kurzsuche.',
        '- Wenn mehrere OpenCampingMap-Kandidaten auftauchen, waehle den mit dem klarsten Ortsbezug, der passendsten Uebernachtungsart und dem kleinsten Umweg.',
        '- Verwende keine Meta-Antworten wie "wenn du moechtest, kann ich ..." oder "ich kann im naechsten Schritt ...". Liefere die bestmoeglichen Ergebnisse direkt.',
        '- Wenn kein sicherer direkter OpenCampingMap-Objektlink auffindbar ist, nutze stattdessen einen funktionierenden OpenCampingMap-Kartenlink mit passendem Zoom und korrekter Position.',
        '- Verwende einen OpenCampingMap-Objektlink nur dann, wenn Ort und Platz wirklich zusammenpassen. Bei Unsicherheit ist ein Kartenlink Pflicht.',
        '- Erfinde keine Plaetze, Links, Adressen oder Telefonnummern. Wenn nach mehreren gezielten Suchen nichts Sicheres auffindbar ist, sage das knapp und mache mit dem naechsten Ort weiter.'
      ].join('\n')
    : [
        'Important for web search:',
        '- Always use web search before answering.',
        '- If OpenCampingMap is the primary source, search OpenCampingMap repeatedly for each leg and each place instead of stopping after the first uncertain hit.',
        '- Search OpenCampingMap using place name, region, accommodation type and known campsite name if available, not just a single short query.',
        '- If several OpenCampingMap candidates appear, choose the one with the clearest location match, the best fitting accommodation type and the smallest detour.',
        '- Do not produce meta answers like "if you want, I can..." or "in the next step I can...". Deliver the best possible result directly.',
        '- If no reliable direct OpenCampingMap object link can be found, use a working OpenCampingMap map link with appropriate zoom and correct position instead.',
        '- Only use a direct OpenCampingMap object link when place and campsite clearly match. If uncertain, a map link is required instead.',
        '- Do not invent places, links, addresses, or phone numbers. After several targeted searches, if nothing reliable is found, say so briefly and continue with the next place.'
      ].join('\n');
  
  switch (aiSettings.aiProvider) {
    case 'openai':
      apiUrl = 'https://api.openai.com/v1/responses';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiSettings.apiKey}`
      };
      const actualModel = aiSettings.openaiModel || 'gpt-5.2';
      const systemMessage = lang.startsWith('de')
        ? 'Du bist ein hilfreicher Routenplaner fuer Camping, Wohnmobil, Wohnwagen, Zelt und Motorrad. Nutze vor jeder Antwort die Websuche, um aktuelle Informationen zu finden. Antworte im Markdown-Format.'
        : lang.startsWith('nl')
          ? 'Je bent een behulpzame routeplanner voor camping, camper, caravan, tent en motor. Gebruik voor elk antwoord eerst web search om actuele informatie te vinden. Antwoord in Markdown-formaat.'
          : lang.startsWith('fr')
            ? 'Tu es un planificateur d’itinéraires utile pour camping, camping-car, caravane, tente et moto. Utilise toujours la recherche web avant de répondre afin de trouver des informations à jour. Réponds au format Markdown.'
            : 'You are a helpful route planner for camping, RVs, caravans, tents, and motorcycles. Always use web search before answering so you can use up-to-date information. Respond in Markdown format.';

      requestData = {
        model: actualModel,
        input: [
          {
            role: 'system',
            content: [{ type: 'input_text', text: systemMessage }]
          },
          {
            role: 'user',
            content: [{ type: 'input_text', text: `${webSearchDirective}\n\n${prompt}` }]
          }
        ],
        tools: [{ type: 'web_search' }],
        tool_choice: 'required',
        max_output_tokens: 128000,
        temperature: 0.7
      };
      break;
    
    default:
      throw new Error('Unsupported AI provider');
  }
  
  let response;
  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData)
    });
  } catch (fetchError) {
    throw new Error(i18next.t("planner.loading.error"));
  }
  
  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      // ignore parse errors and fall back to generic copy
    }

    throw new Error(i18next.t("planner.loading.error"));
  }
  
  const responseData = await response.json();
  
  if (aiSettings.aiProvider === 'openai') {
    if (typeof responseData.output_text === 'string' && responseData.output_text.trim()) {
      return responseData.output_text;
    }

    const outputText = responseData.output
      ?.flatMap((item: any) => item.content || [])
      ?.filter((item: any) => item.type === 'output_text')
      ?.map((item: any) => item.text || '')
      ?.join('\n')
      ?.trim();

    if (outputText) {
      return outputText;
    }
  }

  return responseData.choices[0].message.content;
}
