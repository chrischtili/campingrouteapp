import { FormData, AISettings } from "@/types/routePlanner";
import i18next from "i18next";
import { DEFAULT_OPENAI_MODEL } from "@/config/ai";

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const lang = (i18next.language || 'en').toLowerCase();
  const locale = lang.startsWith('de') ? 'de-DE' : lang.startsWith('nl') ? 'nl-NL' : lang.startsWith('fr') ? 'fr-FR' : lang.startsWith('it') ? 'it-IT' : 'en-US';
  return date.toLocaleDateString(locale);
}

type GpxFormat = 'codeblock' | 'plain';

function roundDownToStep(value: number, step: number): number {
  return Math.max(step, Math.floor(value / step) * step);
}

function formatDurationHours(hours: number): string {
  const totalMinutes = Math.max(5, Math.floor(hours * 60 / 5) * 5);
  const fullHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${fullHours}:${minutes.toString().padStart(2, '0')} h`;
}

function buildDailyLimitBufferInstruction(
  lang: string,
  maxDailyDistance: number,
  maxDailyDriveHours: number
): string {
  const hasDistanceLimit = maxDailyDistance > 0;
  const hasDriveTimeLimit = maxDailyDriveHours > 0;

  if (!hasDistanceLimit && !hasDriveTimeLimit) return '';

  const distanceLower = hasDistanceLimit ? roundDownToStep(maxDailyDistance * 0.84, 5) : 0;
  const distanceUpper = hasDistanceLimit ? roundDownToStep(maxDailyDistance * 0.92, 5) : 0;
  const driveTimeLower = hasDriveTimeLimit ? formatDurationHours(maxDailyDriveHours * 0.84) : '';
  const driveTimeUpper = hasDriveTimeLimit ? formatDurationHours(maxDailyDriveHours * 0.92) : '';

  if (lang.startsWith('de')) {
    if (hasDistanceLimit && hasDriveTimeLimit) {
      return `\n\nWichtig: Behandle die eingegebenen Tageslimits nicht als Zielwert zum Ausreizen, sondern als Obergrenze mit Sicherheitsabstand, weil Entfernungen und Fahrzeiten nur grob geschätzt sind. Plane pro Etappe nach Möglichkeit eher mit ca. ${distanceLower}-${distanceUpper} km und ca. ${driveTimeLower}-${driveTimeUpper} statt genau auf ${maxDailyDistance} km oder ${maxDailyDriveHours} h zu zielen. Wenn es zeitlich sonst zu knapp wird, schlage lieber eine zusätzliche Etappe oder Zwischenübernachtung vor.`;
    }

    if (hasDistanceLimit) {
      return `\n\nWichtig: Behandle das eingegebene km-Limit nicht als Zielwert zum Ausreizen, sondern als Obergrenze mit Sicherheitsabstand, weil Entfernungen nur grob geschätzt sind. Plane pro Etappe nach Möglichkeit eher mit ca. ${distanceLower}-${distanceUpper} km statt genau auf ${maxDailyDistance} km zu zielen. Wenn es sonst zu knapp wird, schlage lieber eine zusätzliche Etappe oder Zwischenübernachtung vor.`;
    }

    return `\n\nWichtig: Behandle das eingegebene Fahrzeit-Limit nicht als Zielwert zum Ausreizen, sondern als Obergrenze mit Sicherheitsabstand, weil Fahrzeiten nur grob geschätzt sind. Plane pro Etappe nach Möglichkeit eher mit ca. ${driveTimeLower}-${driveTimeUpper} statt genau auf ${maxDailyDriveHours} h zu zielen. Wenn es sonst zu knapp wird, schlage lieber eine zusätzliche Etappe oder Zwischenübernachtung vor.`;
  }

  if (lang.startsWith('nl')) {
    if (hasDistanceLimit && hasDriveTimeLimit) {
      return `\n\nBelangrijk: behandel de ingevoerde daglimieten niet als streefwaarde om volledig te benutten, maar als bovengrens met veiligheidsmarge, omdat afstanden en reistijden slechts grof worden geschat. Plan per etappe indien mogelijk eerder rond ${distanceLower}-${distanceUpper} km en ${driveTimeLower}-${driveTimeUpper} in plaats van precies op ${maxDailyDistance} km of ${maxDailyDriveHours} h te mikken. Als het anders te krap wordt, stel dan liever een extra etappe of overnachting voor.`;
    }

    if (hasDistanceLimit) {
      return `\n\nBelangrijk: behandel de ingevoerde km-limiet niet als streefwaarde om volledig te benutten, maar als bovengrens met veiligheidsmarge, omdat afstanden slechts grof worden geschat. Plan per etappe indien mogelijk eerder rond ${distanceLower}-${distanceUpper} km in plaats van precies op ${maxDailyDistance} km te mikken. Als het anders te krap wordt, stel dan liever een extra etappe of overnachting voor.`;
    }

    return `\n\nBelangrijk: behandel de ingevoerde rijtijdlimiet niet als streefwaarde om volledig te benutten, maar als bovengrens met veiligheidsmarge, omdat reistijden slechts grof worden geschat. Plan per etappe indien mogelijk eerder rond ${driveTimeLower}-${driveTimeUpper} in plaats van precies op ${maxDailyDriveHours} h te mikken. Als het anders te krap wordt, stel dan liever een extra etappe of overnachting voor.`;
  }

  if (lang.startsWith('fr')) {
    if (hasDistanceLimit && hasDriveTimeLimit) {
      return `\n\nImportant : ne traite pas les limites journalières saisies comme une cible à exploiter au maximum, mais comme une limite haute avec marge de sécurité, car les distances et temps de trajet ne sont que des estimations grossières. Essaie de planifier chaque étape plutôt autour de ${distanceLower}-${distanceUpper} km et de ${driveTimeLower}-${driveTimeUpper} au lieu de viser exactement ${maxDailyDistance} km ou ${maxDailyDriveHours} h. Si cela devient trop serré, propose plutôt une étape ou une nuit supplémentaire.`;
    }

    if (hasDistanceLimit) {
      return `\n\nImportant : ne traite pas la limite de kilomètres saisie comme une cible à exploiter au maximum, mais comme une limite haute avec marge de sécurité, car les distances ne sont qu’estimées grossièrement. Essaie de planifier chaque étape plutôt autour de ${distanceLower}-${distanceUpper} km au lieu de viser exactement ${maxDailyDistance} km. Si cela devient trop serré, propose plutôt une étape ou une nuit supplémentaire.`;
    }

    return `\n\nImportant : ne traite pas la limite de temps de conduite saisie comme une cible à exploiter au maximum, mais comme une limite haute avec marge de sécurité, car les temps de trajet ne sont qu’estimés grossièrement. Essaie de planifier chaque étape plutôt autour de ${driveTimeLower}-${driveTimeUpper} au lieu de viser exactement ${maxDailyDriveHours} h. Si cela devient trop serré, propose plutôt une étape ou une nuit supplémentaire.`;
  }

  if (lang.startsWith('it')) {
    if (hasDistanceLimit && hasDriveTimeLimit) {
      return `\n\nImportante: non trattare i limiti giornalieri inseriti come un valore da sfruttare al massimo, ma come un limite superiore con margine di sicurezza, perché distanze e tempi di guida sono solo stime approssimative. Per ogni tappa cerca di pianificare piuttosto intorno a ${distanceLower}-${distanceUpper} km e ${driveTimeLower}-${driveTimeUpper} invece di puntare esattamente a ${maxDailyDistance} km o ${maxDailyDriveHours} h. Se altrimenti diventa troppo stretto, proponi piuttosto una tappa o un pernottamento aggiuntivo.`;
    }

    if (hasDistanceLimit) {
      return `\n\nImportante: non trattare il limite km inserito come un valore da sfruttare al massimo, ma come un limite superiore con margine di sicurezza, perché le distanze sono solo stime approssimative. Per ogni tappa cerca di pianificare piuttosto intorno a ${distanceLower}-${distanceUpper} km invece di puntare esattamente a ${maxDailyDistance} km. Se altrimenti diventa troppo stretto, proponi piuttosto una tappa o un pernottamento aggiuntivo.`;
    }

    return `\n\nImportante: non trattare il limite di guida giornaliero inserito come un valore da sfruttare al massimo, ma come un limite superiore con margine di sicurezza, perché i tempi di guida sono solo stime approssimative. Per ogni tappa cerca di pianificare piuttosto intorno a ${driveTimeLower}-${driveTimeUpper} invece di puntare esattamente a ${maxDailyDriveHours} h. Se altrimenti diventa troppo stretto, proponi piuttosto una tappa o un pernottamento aggiuntivo.`;
  }

  if (hasDistanceLimit && hasDriveTimeLimit) {
    return `\n\nImportant: Treat the entered daily limits as an upper bound with safety margin, not as a target to fully use, because distances and driving times are only rough estimates. For each leg, aim more for about ${distanceLower}-${distanceUpper} km and ${driveTimeLower}-${driveTimeUpper} instead of pushing right up to ${maxDailyDistance} km or ${maxDailyDriveHours} h. If that still makes the plan too tight, propose an extra leg or overnight stop instead.`;
  }

  if (hasDistanceLimit) {
    return `\n\nImportant: Treat the entered km limit as an upper bound with safety margin, not as a target to fully use, because distances are only rough estimates. For each leg, aim more for about ${distanceLower}-${distanceUpper} km instead of pushing right up to ${maxDailyDistance} km. If that still makes the plan too tight, propose an extra leg or overnight stop instead.`;
  }

  return `\n\nImportant: Treat the entered daily driving-time limit as an upper bound with safety margin, not as a target to fully use, because driving times are only rough estimates. For each leg, aim more for about ${driveTimeLower}-${driveTimeUpper} instead of pushing right up to ${maxDailyDriveHours} h. If that still makes the plan too tight, propose an extra leg or overnight stop instead.`;
}

function buildLogicalScheduleInstruction(
  lang: string,
  data: FormData,
  maxDailyDistance: number,
  maxDailyDriveHours: number
): string {
  const hasStart = !!data.startDate;
  const hasAnyArrival = !!data.endDate || (data.stages || []).some(s => s.arrivalDate);
  const hasLimits = maxDailyDistance > 0 || maxDailyDriveHours > 0;

  if (hasStart || !hasAnyArrival || !hasLimits) return '';

  const limitText = maxDailyDistance > 0 
    ? `${maxDailyDistance} km` 
    : `${maxDailyDriveHours} h`;
  const bothLimitsText = maxDailyDistance > 0 && maxDailyDriveHours > 0 
    ? `${maxDailyDistance} km und ${maxDailyDriveHours} h` 
    : limitText;

  if (lang.startsWith('de')) {
    return `\n\nZENTRALE PLANUNGSANWEISUNG: Da kein explizites Abfahrtsdatum am Startpunkt vorgegeben wurde, aber Ankunftsziele mit festen Terminen und Tageslimits (${bothLimitsText}) existieren, musst du zwingend rückwärts rechnen. Berechne den optimalen Abreisezeitpunkt am Startpunkt so, dass alle Tageslimits und Zwischenziele unter Einhaltung der maximalen ${bothLimitsText} pro Tag realistisch erreichbar sind. Wenn die Strecke zum ersten Ziel mehr als ein Tageslimit beansprucht (z.B. 600km bei 250km Limit), verschiebe das Startdatum am Startpunkt logisch um die entsprechende Anzahl an Tagen (z.B. 3 Tage) nach vorne. Gib dieses berechnete Startdatum explizit in deiner Antwort an.`;
  }
  
  if (lang.startsWith('nl')) {
    return `\n\nCENTRALE PLANINSTRUCTIE: Omdat er geen expliciete vertrekdatum vanaf het startpunt is opgegeven, maar er wel aankomstdoelen met vaste data en daglimieten (${bothLimitsText}) zijn, moet je dwingend terugrekenen. Bereken het optimale vertrekmoment vanaf het startpunt zodat alle daglimieten en tussenstops realistisch haalbaar zijn binnen de maximale ${bothLimitsText} per dag. Als de afstand naar de eerste bestemming meer dan één daglimiet vereist, verschuif dan de startdatum logisch met het juiste aantal dagen naar voren. Vermeld deze berekende startdatum expliciet in je antwoord.`;
  }

  if (lang.startsWith('fr')) {
    return `\n\nINSTRUCTION DE PLANIFICATION CENTRALE : Étant donné qu’aucune date de départ explicite n’a été fournie pour le point de départ, mais qu’il existe des objectifs d’arrivée avec des dates fixes et des limites journalières (${bothLimitsText}), tu dois impérativement calculer à l’envers. Détermine le moment de départ optimal au point de départ de sorte que toutes les limites journalières et étapes intermédiaires soient réalistement atteignables en respectant le maximum de ${bothLimitsText} par jour. Si la distance jusqu’à la première destination dépasse une limite journalière, décale logiquement la date de départ du nombre de jours nécessaire. Indique explicitement cette date de départ calculée dans ta réponse.`;
  }

  if (lang.startsWith('it')) {
    return `\n\nISTRUZIONE CENTRALE DI PIANIFICAZIONE: Poiché non è stata fornita una data di partenza esplicita dal punto di partenza, ma esistono obiettivi di arrivo con date fisse e limiti giornalieri (${bothLimitsText}), devi obbligatoriamente calcolare a ritroso. Calcola il momento ottimale di partenza in modo che tutti i limiti giornalieri e le tappe intermedie siano realisticamente raggiungibili rispettando il massimo di ${bothLimitsText} al giorno. Se la distanza verso la prima destinazione richiede più di un limite giornaliero, sposta logicamente in avanti la data di inizio del numero di giorni necessario. Indica esplicitamente questa data di partenza calcolata nella tua risposta.`;
  }

  return `\n\nCENTRAL PLANNING INSTRUCTION: Since no explicit departure date at the starting point was provided, but arrival goals with fixed dates and daily limits (${bothLimitsText}) exist, you MUST calculate backwards. Determine the optimal departure time at the starting point so that all daily limits and intermediate goals are realistically achievable while staying within the maximum ${bothLimitsText} per day. If the distance to the first destination requires more than one daily limit (e.g., 600km with a 250km limit), logically shift the start date forward by the required number of days (e.g., 3 days). Clearly state this calculated start date in your response.`;
}

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
  const isLightweightVehicle =
    data.vehicleType === 'carTent' ||
    data.vehicleType === 'carRoofTent' ||
    data.vehicleType === 'bicycleTent' ||
    data.vehicleType === 'motorcycleTent';
  const maxDailyDistance = Number(data.maxDailyDistance || 0);
  const maxDailyDriveHours = Number(data.maxDailyDriveHours || 0);
  const hasDailyLimitPriority = maxDailyDistance > 0 && maxDailyDriveHours > 0 && !!data.dailyLimitPriority;
  const wantsRestaurantLinks = (data.facilities || []).some((facility) => facility === 'restaurant' || facility === 'restaurantNearby');
  const vehicleLength = Number(data.vehicleLength || 0);
  const wantsEnvironmentalZoneAvoidance = (data.routePreferences || []).includes('environmentalZones');
  const shouldUseLargeVehicleStopLogic = !isLightweightVehicle && (
    vehicleLength >= 8 ||
    data.vehicleType === 'caravan' ||
    data.vehicleType === 'expedition' ||
    data.weightClass === 'gt75'
  );
  const vehicleDimensionLines = !isLightweightVehicle
    ? [
        data.vehicleLength ? `• ${t('prompt.labels.length')}: ${data.vehicleLength} m` : '',
        data.vehicleHeight ? `• ${t('prompt.labels.height')}: ${data.vehicleHeight} m` : '',
        data.vehicleWidth ? `• ${t('prompt.labels.width')}: ${data.vehicleWidth} m` : '',
      ].filter(Boolean).join('\n')
    : '';
  const dataSourcePolicy = t('prompt.dataSourcePolicy');
  const accommodationTypeTagPolicy = t('prompt.accommodationTypeTagPolicy');
  const openCampingMapPolicy = lang.startsWith('de')
    ? [
        'OpenCampingMap-Regeln:',
        '- Bevorzuge fuer jeden Uebernachtungsort zuerst einen konkreten OpenCampingMap-Eintrag oder einen stabilen OpenCampingMap-Kartenlink.',
        '- Suche pro Ort nicht nur einmal, sondern gezielt mit Ortsname, Regionsname, Platztyp und ggf. bekanntem Platznamen.',
        '- Wenn mehrere OpenCampingMap-Treffer moeglich sind, bevorzuge den klarsten Namensbezug zum Zielort, die passendste Uebernachtungsart und den kleinsten Umweg zur Route.',
        '- Link-Formate: Nutze entweder Objekt-Links (`https://opencampingmap.org/de/node/ID` oder `https://opencampingmap.org/de/way/ID`) oder Karten-Links (`https://opencampingmap.org/#18/lat/lon`).',
        '- Nutze bei Koordinaten-Links zwingend das Format `#zoom/lat/lon` (z.B. `#18/48.13/11.57`). Vermeide Links ohne `#`.',
        '- Link-Extraktion: Wenn du die Websuche nutzt, extrahiere IMMER die direkten URLs aus den Suchergebnissen. Gib keine Links aus, die erst zu einer Google-Suche oder einer anderen Suchmaschine fuehren.',
        '- Verwende einen OpenCampingMap-Objektlink nur, wenn Ort und Platz wirklich zusammenpassen. Bei Unsicherheit nutze STATTDESSEN IMMER einen Karten-Link mit den passenden Koordinaten.',
        '- Wenn nach mehreren gezielten Suchen kein sicherer OpenCampingMap-Treffer auffindbar ist, sage das knapp und gehe direkt zum naechsten Ort weiter.',
        '- Erfinde niemals OpenCampingMap-Objekte, IDs, Platznamen, Adressen, Telefonnummern oder Ausstattungen.'
      ].join('\n')
    : lang.startsWith('nl')
      ? [
          'OpenCampingMap-regels:',
          '- Geef voor elke overnachtingsplaats de voorkeur aan een concreet OpenCampingMap-item of een stabiele OpenCampingMap-kaartlink.',
          '- Zoek per plaats herhaaldelijk met plaatsnaam, regionaam, accommodatietype en indien bekend de naam van de camping.',
          '- Als er meerdere OpenCampingMap-kandidaten zijn, geef dan de voorkeur aan de duidelijkste naamovereenkomst met de bestemming, het best passende accommodatietype en de kleinste omweg.',
          '- Link-formaten: Gebruik object-links (`https://opencampingmap.org/nl/node/ID` of `https://opencampingmap.org/nl/way/ID`) of kaartlinks (`https://opencampingmap.org/#18/lat/lon`).',
          '- Gebruik voor coördinaatlinks altijd het formaat `#zoom/lat/lon` (bijv. `#18/48.13/11.57`). Vermijd links zonder `#`.',
          '- Linkextractie: Als je web search gebruikt, extraheer dan ALTIJD de directe URL\'s uit de zoekresultaten. Geef geen links die eerst naar een Google-zoekopdracht leiden.',
          '- Gebruik alleen een directe OpenCampingMap-objectlink als de plaats en camping echt bij elkaar passen. Gebruik bij twijfel ALTIJD een kaartlink met de juiste coördinaten.',
          '- Als er na meerdere gerichte zoekopdrachten geen betrouwbaar OpenCampingMap-resultaat wordt gevonden, zeg dit dan kort en ga door naar de volgende plaats.',
          '- Verzin nooit OpenCampingMap-objecten, ID\'s, campingnamen, adressen, telefoonnummers of voorzieningen.'
        ].join('\n')
      : lang.startsWith('fr')
        ? [
            'Règles OpenCampingMap :',
            '- Préfère pour chaque lieu d’hébergement une entrée concrète OpenCampingMap ou un lien de carte OpenCampingMap stable.',
            '- Recherche chaque lieu à plusieurs reprises en utilisant le nom du lieu, la région, le type d’hébergement et, si possible, le nom du camping.',
            '- Si plusieurs candidats OpenCampingMap existent, privilégie la correspondance de nom la plus claire, le type d’hébergement le plus adapté et le plus petit détour.',
            '- Formats de liens : utilise soit des liens d’objet (`https://opencampingmap.org/fr/node/ID` ou `https://opencampingmap.org/fr/way/ID`), soit des liens de carte (`https://opencampingmap.org/#18/lat/lon`).',
            '- Pour les liens de coordonnées, utilise impérativement le format `#zoom/lat/lon` (ex: `#18/48.13/11.57`). Évite les liens sans `#`.',
            '- Extraction de liens : si tu utilises la recherche web, extrais TOUJOURS les URL directes des résultats. Ne donne pas de liens menant d’abord à une recherche Google.',
            '- N’utilise un lien d’objet OpenCampingMap que si le lieu et le terrain correspondent vraiment. En cas d’incertitude, utilise TOUJOURS un lien de carte avec les coordonnées appropriées.',
            '- Si aucun résultat OpenCampingMap fiable n’est trouvé après plusieurs recherches, dis-le brièvement et passe au lieu suivant.',
            '- N’invente jamais d’objets OpenCampingMap, d’ID, de noms de campings, d’adresses, de numéros de téléphone ou d’équipements.'
          ].join('\n')
        : lang.startsWith('it')
          ? [
              'Regole OpenCampingMap:',
              '- Preferisci per ogni luogo di pernottamento una voce concreta di OpenCampingMap o un link alla mappa stabile.',
              '- Cerca ogni luogo ripetutamente usando il nome della località, la regione, il tipo di alloggio e, se noto, il nome del campeggio.',
              '- Se esistono più candidati OpenCampingMap, preferisci quello con il nome più corrispondente, il tipo di alloggio più adatto e la deviazione minore.',
              '- Formati dei link: usa link all’oggetto (`https://opencampingmap.org/it/node/ID` o `https://opencampingmap.org/it/way/ID`) oppure link alla mappa (`https://opencampingmap.org/#18/lat/lon`).',
              '- Per i link con coordinate, usa obbligatoriamente il formato `#zoom/lat/lon` (es. `#18/48.13/11.57`). Evita link senza `#`.',
              '- Estrazione link: se usi la ricerca web, estrai SEMPRE gli URL diretti dai risultati. Non fornire link che portano prima a una ricerca su Google.',
              '- Usa un link all’oggetto OpenCampingMap solo se località e campeggio corrispondono davvero. In caso di incertezza, usa SEMPRE un link alla mappa con le coordinate appropriate.',
              '- Se dopo diverse ricerche non trovi un risultato affidabile, dillo brevemente e passa al luogo successivo.',
              '- Non inventare mai oggetti OpenCampingMap, ID, nomi di campeggi, indirizzi, numeri di telefono o dotazioni.'
            ].join('\n')
          : [
              'OpenCampingMap rules:',
              '- Prefer a concrete OpenCampingMap entry or a stable OpenCampingMap map link for each overnight stop.',
              '- Search each place repeatedly using place name, region, accommodation type and known campsite name if available.',
              '- If several OpenCampingMap candidates exist, prefer the clearest name match to the target area, the best fitting accommodation type and the smallest detour from the route.',
              '- Link formats: Use either object links (`https://opencampingmap.org/en/node/ID` or `https://opencampingmap.org/en/way/ID`) or map links (`https://opencampingmap.org/#18/lat/lon`).',
              '- For coordinate links, always use the format `#zoom/lat/lon` (e.g., `#18/48.13/11.57`). Avoid links without `#`.',
              '- Link extraction: If you use web search, ALWAYS extract direct URLs from search results. Do not provide links that lead to a Google search or another search engine first.',
              '- Only use a direct OpenCampingMap object link if place and campsite clearly match. If uncertain, ALWAYS USE a map link with appropriate coordinates instead.',
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
  const verificationInstruction = t('prompt.verificationInstruction');
  const dailyLimitBufferInstruction = buildDailyLimitBufferInstruction(lang, maxDailyDistance, maxDailyDriveHours);
  const logicalScheduleInstruction = buildLogicalScheduleInstruction(lang, data, maxDailyDistance, maxDailyDriveHours);
  const pdfDownloadInstruction = lang.startsWith('de')
    ? '\n\nPDF-Datei: Wenn deine Plattform Datei-Downloads oder Artefakte unterstützt, erstelle zusätzlich eine PDF-Datei mit der vollständigen Route und den Routeninfos und biete sie zum Download an. Die PDF darf keine Kurzfassung oder kompakte Zusammenfassung sein, sondern soll die normale Antwort inhaltlich so vollständig wie möglich spiegeln. Übernimm alle Hauptabschnitte 1 bis 9, alle Etappen mit Zeiten, Bewertungen und Pausenlogik, alle Übernachtungen mit Hauptplatz und Alternativen sowie die dazugehörigen OpenCampingMap-Links, offiziellen Platz-Links und wichtigen Restaurant-, Aktivitäts- oder Zusatzlinks. Lasse keine Links, Alternativen, Warnhinweise oder Serviceinfos weg, nur um die PDF kürzer zu halten. Verwende in der PDF vollständige, anklickbare URLs statt bloßer Link-Platzhalter, Referenznummern oder Fußnotenmarker. Wenn die PDF dadurch länger wird, nutze lieber zusätzliche Seiten statt Inhalte zu verdichten oder zusammenzufassen. Falls zusätzlich eine GPX-Datei ausgegeben wird, muss der vollständige GPX-XML-Block nicht in die PDF kopiert werden; erwähne die GPX-Datei dann kurz als separaten Download. Verwende für die PDF einen sinnvollen Dateinamen wie campingroute-reiseplan.pdf. Wenn kein PDF-Download möglich ist, gib stattdessen nur die normale formatierte Antwort aus und behaupte keinen Download.'
    : '\n\nPDF file: If your platform supports file downloads or artifacts, also create a PDF file with the full route and the route details and offer it as a download. The PDF must not be a short version or compact summary; it should mirror the normal answer as completely as possible. Include all main sections 1 to 9, all legs with times, ratings, and break logic, all overnight stays with primary place and alternatives, plus the related OpenCampingMap links, official place links, and important restaurant, activity, or supporting links. Do not drop links, alternatives, warnings, or service notes just to make the PDF shorter. In the PDF, use full clickable URLs instead of bare link placeholders, reference numbers, or footnote markers. If that makes the PDF longer, prefer extra pages over compressing or summarizing the content. If a GPX file is also generated, the full GPX XML block does not need to be copied into the PDF; briefly mention the GPX file as a separate download instead. Use a sensible filename such as campingroute-travel-plan.pdf. If PDF download is not possible, provide only the normal formatted response and do not claim that a download exists.';
  const largeVehicleStopInstruction = shouldUseLargeVehicleStopLogic
    ? lang.startsWith('de')
      ? '\n\nWichtig: Bevorzuge für dieses größere Fahrzeug bzw. Gespann gut zugängliche Tankstellen, Autohof- und Rastanlagen mit ausreichend Platz zum An- und Abfahren. Meide kleine Tankstellen, enge Rastplätze oder Stopps ohne vernünftige Zufahrt für große Fahrzeuge bzw. ohne geeignete Lkw-/Langfahrzeug-Zufahrt. Wenn ein geplanter Service-Stopp problematisch wirkt, nenne stattdessen eine besser geeignete Alternative.'
      : lang.startsWith('nl')
        ? '\n\nBelangrijk: geef voor dit grotere voertuig of deze combinatie de voorkeur aan goed toegankelijke tankstations, truckstops en rustplaatsen met genoeg ruimte om in en uit te rijden. Vermijd kleine tankstations, krappe rustplaatsen of stops zonder goede toegang voor grote voertuigen of zonder geschikte truck-/langevoertuigtoegang. Als een geplande servicestop lastig lijkt, noem dan een beter passend alternatief.'
        : lang.startsWith('fr')
          ? '\n\nImportant : pour ce vehicule plus grand ou cet ensemble, privilegie les stations-service, aires de repos et truck-stops bien accessibles avec suffisamment de place pour entrer et sortir. Evite les petites stations-service, les aires etroites ou les arrets sans acces correct pour les grands vehicules ou sans acces adaptes aux poids lourds / ensembles longs. Si un arret de service semble delicat, propose plutot une alternative mieux adaptee.'
          : lang.startsWith('it')
            ? '\n\nImportante: per questo veicolo piu grande o questo convoglio privilegia stazioni di servizio, aree di sosta e truck stop facilmente accessibili con spazio sufficiente per entrare e uscire. Evita piccole stazioni di servizio, aree strette o soste senza accesso adeguato per veicoli grandi o senza accesso adatto a camion / mezzi lunghi. Se una sosta di servizio prevista sembra problematica, indica invece un’alternativa piu adatta.'
            : '\n\nImportant: For this larger vehicle or combination, prefer fuel stations, truck stops, and rest areas with easy access and enough room to enter and leave. Avoid small fuel stations, tight rest areas, or stops without sensible access for large vehicles or without suitable truck/long-vehicle access. If a planned service stop looks problematic, name a better suited alternative instead.'
    : '';
  const environmentalZoneInstruction = wantsEnvironmentalZoneAvoidance
    ? lang.startsWith('de')
      ? '\n\nWichtig: Meide auf der Route nach Möglichkeit Umweltzonen, Low-Emission-Zones oder ähnliche Zufahrtsbeschränkungen. Wenn das nicht sinnvoll möglich ist, nenne die betroffenen Abschnitte klar und schlage eine geeignete Umfahrung oder praktikable Alternative vor.'
      : lang.startsWith('nl')
        ? '\n\nBelangrijk: vermijd op de route waar mogelijk milieuzones, low-emission zones of vergelijkbare toegangsbeperkingen. Als dat niet zinvol mogelijk is, benoem de betreffende trajecten duidelijk en stel een geschikte omleiding of praktisch alternatief voor.'
        : lang.startsWith('fr')
          ? '\n\nImportant : evite si possible sur l’itineraire les zones environnementales, low-emission zones ou restrictions d’acces similaires. Si ce n’est pas raisonnablement possible, indique clairement les troncons concernes et propose un contournement adapte ou une alternative praticable.'
          : lang.startsWith('it')
            ? '\n\nImportante: evita lungo il percorso, se possibile, zone ambientali, low-emission zones o restrizioni di accesso simili. Se non e ragionevolmente possibile, indica chiaramente i tratti interessati e proponi una deviazione adatta oppure un’alternativa praticabile.'
            : '\n\nImportant: Avoid environmental zones, low-emission zones, or similar access restrictions along the route where possible. If that is not reasonably possible, clearly name the affected sections and propose a suitable bypass or practical alternative.'
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
${vehicleDimensionLines ? `${vehicleDimensionLines}\n` : ''}${!isLightweightVehicle && data.weightClass ? '• ' + t('prompt.labels.weightClass') + ': ' + t(`planner.vehicle.weightClass.options.${data.weightClass}`) + '\n' : ''}${data.vehicleType ? '• ' + t('prompt.labels.vehicleType') + ': ' + t(`planner.vehicle.type.options.${data.vehicleType}`) + '\n' : ''}${!isLightweightVehicle && data.fuelType ? '• ' + t('prompt.labels.fuelType') + ': ' + t(`planner.vehicle.fuel.options.${data.fuelType}`) + '\n' : ''}${!isLightweightVehicle && data.solarPower ? '• ' + t('prompt.labels.solar') + ': ' + data.solarPower + 'W\n' : ''}${!isLightweightVehicle && data.batteryCapacity ? '• ' + t('prompt.labels.battery') + ': ' + data.batteryCapacity + 'Ah\n' : ''}${!isLightweightVehicle && data.autonomyDays ? '• ' + t('prompt.labels.autonomyDays') + ': ' + data.autonomyDays + ' ' + t('prompt.labels.autonomyUnit') + '\n' : ''}${!isLightweightVehicle && data.heatingSystem ? '• ' + t('prompt.labels.heating') + ': ' + t(`planner.vehicle.heating.options.${data.heatingSystem}`) + '\n' : ''}${!isLightweightVehicle && data.levelingJacks ? '• ' + t('prompt.labels.levelingJacks') + ': ' + t(`planner.vehicle.levelingJacks.options.${data.levelingJacks}`) + '\n' : ''}${!isLightweightVehicle && data.toiletteSystem ? '• ' + t('prompt.labels.toilet') + ': ' + t(`planner.vehicle.toilet.options.${data.toiletteSystem}`) + '\n' : ''}

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
${verificationInstruction}
${dailyLimitBufferInstruction}
${logicalScheduleInstruction}
${pdfDownloadInstruction}
${largeVehicleStopInstruction}
${environmentalZoneInstruction}
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
        '- Link-Extraktion: Extrahiere IMMER die direkten URLs aus den Suchergebnissen. Gib keine Links aus, die erst zu einer Google-Suche oder einer anderen Suchmaschine fuehren.',
        '- Wenn kein sicherer direkter OpenCampingMap-Objektlink auffindbar ist, nutze stattdessen einen funktionierenden OpenCampingMap-Kartenlink mit passendem Zoom und korrekter Position (Format: `https://opencampingmap.org/de/#zoom/lat/lon`).',
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
        '- Link extraction: ALWAYS extract direct URLs from search results. Do not provide links that lead to a Google search or another search engine first.',
        '- If no reliable direct OpenCampingMap object link can be found, use a working OpenCampingMap map link with appropriate zoom and correct position instead (Format: `https://opencampingmap.org/en/#zoom/lat/lon`).',
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
      const actualModel = aiSettings.openaiModel || DEFAULT_OPENAI_MODEL;
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
