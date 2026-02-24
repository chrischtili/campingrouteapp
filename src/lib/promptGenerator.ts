import { FormData, AISettings } from "@/types/routePlanner";
import i18next from "i18next";

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const locale = i18next.language === 'de' ? 'de-DE' : 'en-US';
  return date.toLocaleDateString(locale);
}

function buildGpxInstructions(data: FormData, t: (key: string, options?: any) => string): string {
  const modes = data.gpxOutputMode || [];
  if (modes.length === 0) return '';
  const wantsGarmin = modes.includes('garmin');
  const wantsRouteTrack = modes.includes('routeTrack');
  if (wantsGarmin && wantsRouteTrack) return t("prompt.gpx.both");
  if (wantsGarmin) return t("prompt.gpx.garmin");
  return t("prompt.gpx.routeTrack");
}

export function generatePrompt(data: FormData): string {
  const t = (key: string, options?: any) => i18next.t(key, options);
  const languageName = i18next.language === 'de' ? 'Deutsch' : 'English';
  const gpxInstructions = buildGpxInstructions(data, t);

  return `${t("prompt.systemRole", { language: languageName })}

🗺️ ${t("prompt.sections.route")}:
──────────────
• ${t("prompt.labels.start")}: ${data.startPoint}
• ${t("prompt.labels.destination")}: ${data.destination}
${data.stageDestination1 ? '• ' + t("prompt.labels.stage", { num: 1 }) + ': ' + data.stageDestination1 + '\n' : ''}${data.stageDestination2 ? '• ' + t("prompt.labels.stage", { num: 2 }) + ': ' + data.stageDestination2 + '\n' : ''}• ${t("prompt.labels.departure")}: ${formatDate(data.startDate)}
• ${t("prompt.labels.arrival")}: ${formatDate(data.endDate)}
${data.distance ? '• ' + t("prompt.labels.totalDistance") + ': ' + data.distance + ' km\n' : ''}${data.maxDailyDistance ? '• ' + t("prompt.labels.maxDailyDistance") + ': ' + data.maxDailyDistance + ' km\n' : ''}${data.routeType ? '• ' + t("prompt.labels.routeType") + ': ' + t(`planner.route.type.options.${data.routeType}`) + '\n' : ''}

🚐 ${t("prompt.sections.vehicle")}:
───────────────────────────
• ${t("prompt.labels.length")}: ${data.vehicleLength || '7'} m
• ${t("prompt.labels.height")}: ${data.vehicleHeight || '2.9'} m
• ${t("prompt.labels.width")}: ${data.vehicleWidth || '2.3'} m
• ${t("prompt.labels.weight")}: ${data.vehicleWeight || '3.5'} t
• ${t("prompt.labels.axleLoad")}: ${data.axleLoad || '2.5'} ${t("prompt.labels.axleLoadUnit")}
${data.fuelType ? '• ' + t("prompt.labels.fuelType") + ': ' + t(`planner.vehicle.fuel.options.${data.fuelType}`) + '\n' : ''}${data.solarPower ? '• ' + t("prompt.labels.solar") + ': ' + data.solarPower + 'W\n' : ''}${data.batteryCapacity ? '• ' + t("prompt.labels.battery") + ': ' + data.batteryCapacity + 'Ah\n' : ''}${data.autonomyDays ? '• ' + t("prompt.labels.autonomyDays") + ': ' + data.autonomyDays + ' ' + t("prompt.labels.autonomyUnit") + '\n' : ''}${data.heatingSystem ? '• ' + t("prompt.labels.heating") + ': ' + t(`planner.vehicle.heating.options.${data.heatingSystem}`) + '\n' : ''}${data.levelingJacks ? '• ' + t("prompt.labels.levelingJacks") + ': ' + t(`planner.vehicle.levelingJacks.options.${data.levelingJacks}`) + '\n' : ''}${data.toiletteSystem ? '• ' + t("prompt.labels.toilet") + ': ' + t(`planner.vehicle.toilet.options.${data.toiletteSystem}`) + '\n' : ''}${data.routeAdditionalInfo ? '• ' + t("prompt.labels.additional.label") + ': ' + data.routeAdditionalInfo + '\n' : ''}

${(data.numberOfTravelers && data.numberOfTravelers !== '1') || data.travelCompanions.length > 0 || data.accommodationType.length > 0 || data.facilities?.length > 0 || data.avgCampsitePriceMax || data.accommodation ? `
🏕️ ${t("prompt.sections.accommodation")}:
──────────────────────────
• ${t("prompt.labels.travelers")}: ${data.numberOfTravelers || '2'} ${t("prompt.labels.travelersUnit")}
${data.travelCompanions.length ? '• ' + t("prompt.labels.companions") + ': ' + data.travelCompanions.map(c => t(`planner.accommodation.categories.companions.options.${c}`)).join(', ') + '\n' : ''}
${data.accommodationType.length ? '• ' + t("prompt.labels.accommodationTypes") + ': ' + data.accommodationType.map(at => t(`planner.accommodation.categories.type.options.${at}`)).join(', ') + '\n' : ''}
${data.facilities?.length ? '• ' + t("prompt.labels.facilities") + ': ' + data.facilities.map(f => t(`planner.accommodation.categories.facilities.options.${f}`)).join(', ') + '\n' : ''}
${data.avgCampsitePriceMax ? '• ' + t("prompt.labels.budget") + ': ' + t("prompt.labels.budgetUpTo") + ' ' + data.avgCampsitePriceMax + '€\n' : ''}
${data.accommodation ? '• ' + t("prompt.labels.specialWishes") + ': ' + data.accommodation + '\n' : ''}
` : ''}

${data.travelStyle || data.activities.length > 0 ? `
🌟 ${t("prompt.sections.interests")}:
──────────────────────────────────
${data.travelStyle ? '• ' + t("prompt.labels.travelStyle") + ': ' + t(`planner.route.style.options.${data.travelStyle}`) + '\n' : ''}
${data.activities.length ? data.activities.map(a => '• ' + t(`planner.interests.options.${a}`)).join('\n') + '\n' : ''}
` : ''}

${data.routePreferences?.length > 0 || data.avoidHighways?.length > 0 ? `
🛣️ ${t("prompt.sections.optimization")}:
───────────────────────
${data.routePreferences?.length ? '• ' + t("prompt.labels.preferences") + ': ' + data.routePreferences.map(p => {
  // We need to find which category this key belongs to
  const categories = ['roadType', 'landscape', 'avoidances', 'experiences'];
  for (const cat of categories) {
    const key = `planner.optimization.categories.${cat}.options.${p}`;
    const translation = t(key);
    if (translation !== key) return translation;
  }
  return p;
}).join(', ') + '\n' : ''}
${data.avoidHighways?.length ? '• ' + t("prompt.labels.highwayMaut") + ': ' + data.avoidHighways.join(', ') + '\n' : ''}
` : ''}

${data.additionalInfo ? `
✨ ${t("prompt.sections.additional")}:
─────────────────────────────────────
${data.additionalInfo}

` : ''}

${t("prompt.instructions")}
${gpxInstructions ? `\n\n${gpxInstructions}` : ''}
`;
}

export async function callAIAPI(formData: FormData, aiSettings: AISettings): Promise<string> {
  const prompt = generatePrompt(formData);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('=== AI API Call Details ===');
    console.log('Provider:', aiSettings.aiProvider);
    console.log('API Key present:', !!aiSettings.apiKey?.trim());
  }

  return _callAIAPIInternal(prompt, aiSettings);
}

async function _callAIAPIInternal(prompt: string, aiSettings: AISettings): Promise<string> {
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
      const actualModel = aiSettings.openaiModel || 'gpt-5.2';
      const usesCompletionTokens = [
        'gpt-5.2', 'gpt-5', 'gpt-5-mini', 'gpt-5-nano',
        'gpt-4o-2024-05-13', 'gpt-4o-mini-2024-07-18', 'gpt-4-turbo-2024-04-09'
      ].includes(actualModel);
      
      requestData = {
        model: actualModel,
        messages: [
          { role: 'system', content: i18next.language === 'de' ? 'Du bist ein hilfreicher Wohnmobil-Routenplaner. Antworte in Markdown-Format.' : 'You are a helpful motorhome route planner. Respond in Markdown format.' },
          { role: 'user', content: prompt }
        ],
        ...(usesCompletionTokens ? { max_completion_tokens: 128000 } : { max_tokens: 128000 }),
        temperature: 0.7
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
        max_tokens: 32000,
        temperature: 0.7
      };
      break;
    
    case 'google':
      const googleModel = aiSettings.googleModel || 'gemini-1.5-flash-001';
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:generateContent?key=${aiSettings.apiKey}`;
      headers = { 'Content-Type': 'application/json' };
      requestData = {
        contents: [{ parts: [{ text: prompt }] }]
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
    throw new Error(i18next.t("planner.loading.error"));
  }
  
  const responseData = await response.json();
  
  if (aiSettings.aiProvider === 'google') {
    return responseData.candidates[0].content.parts[0].text;
  }
  return responseData.choices[0].message.content;
}
