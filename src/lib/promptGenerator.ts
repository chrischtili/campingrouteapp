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
    data.vehicleType === 'car' ||
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
  const wantsCamping = data.accommodationType.length === 0 || data.accommodationType.some(t => ['camping', 'pitch', 'farm', 'small', 'wild'].includes(t));
  const wantsRental = data.accommodationType.some(t => ['apartment', 'holidayHome'].includes(t));
  const wantsGlamping = data.accommodationType.includes('premium');

  const dataSourcePolicy = (() => {
    if (lang.startsWith('de')) {
      if (wantsRental && !wantsCamping) {
        return 'Recherchiere Unterkünfte über etablierte verifizierte Quellen (z. B. Booking.com, FeWo-direkt / Vrbo, Traum-Ferienwohnungen, Airbnb, Holidu, Interhome und offizielle regionale Tourismusverbände). Vermeide Doppelnennungen und überprüfe Verfügbarkeit sowie realistische Preise.';
      }
      if (wantsRental && wantsCamping) {
        return 'Recherchiere Campingplätze, Stellplätze sowie Ferienunterkünfte über etablierte verifizierte Quellen (camping.info, stellplatz.info, Park4Night, Booking.com, FeWo-direkt, Airbnb und offizielle Betreiberwebsites). Vermeide Doppelnennungen und überprüfe zwingend Öffnungszeiten sowie realistische Preise.';
      }
      return 'Recherchiere Übernachtungsplätze über etablierte verifizierte Quellen (z. B. camping.info, stellplatz.info, Park4Night, Promobil Mobil Life, ADAC Pincamp, Campercontact und offizielle Platzwebsites). Vermeide Doppelnennungen desselben Platzes und überprüfe zwingend Öffnungszeiten sowie realistische Preise.';
    }

    if (lang.startsWith('nl')) {
      if (wantsRental && !wantsCamping) {
        return 'Zoek accommodaties via toonaangevende geverifieerde bronnen (bijv. Booking.com, Vrbo, Natuurhuisje, Airbnb, Holidu, Belvilla en officiële toeristenbureaus). Vermijd dubbele vermeldingen en controleer altijd realistische prijzen.';
      }
      if (wantsRental && wantsCamping) {
        return 'Zoek campings, camperplaatsen en vakantiehuizen via geverifieerde bronnen (camping.info, stellplatz.info, Booking.com, Vrbo, Airbnb en officiële websites). Vermijd dubbele vermeldingen en controleer altijd openingstijden en prijzen.';
      }
      return 'Zoek overnachtingsplekken via toonaangevende geverifieerde bronnen (bijv. camping.info, stellplatz.info, Park4Night, Promobil, ADAC Pincamp, Campercontact en officiële websites). Vermijd dubbele vermeldingen en controleer altijd openingstijden en realistische prijzen.';
    }

    if (lang.startsWith('fr')) {
      if (wantsRental && !wantsCamping) {
        return 'Recherche les hébergements via des sources vérifiées reconnues (ex. Booking.com, Abritel / Vrbo, Airbnb, Gîtes de France, Holidu et offices de tourisme officiels). Évite les doublons et vérifie la disponibilité et des prix réalistes.';
      }
      if (wantsRental && wantsCamping) {
        return 'Recherche campings, aires de camping-car et locations de vacances via des sources reconnues (camping.info, stellplatz.info, Booking.com, Abritel, Airbnb et sites officiels). Évite les doublons et vérifie heures d\'ouverture et prix réalistes.';
      }
      return 'Recherche les hébergements via des sources vérifiées reconnues (ex. camping.info, stellplatz.info, Park4Night, Promobil, ADAC Pincamp, Campercontact et sites officiels). Évite impérativement les doublons et vérifie les heures d\'ouverture ainsi que des prix réalistes.';
    }

    if (lang.startsWith('it')) {
      if (wantsRental && !wantsCamping) {
        return 'Cerca alloggi tramite fonti verificate riconosciute (es. Booking.com, Vrbo, Airbnb, Holidu, Agriturismo.it e consorzi turistici locali). Evita duplicati e verifica disponibilità e prezzi realistici.';
      }
      if (wantsRental && wantsCamping) {
        return 'Cerca campeggi, aree sosta e strutture ricettive tramite fonti verificate (camping.info, stellplatz.info, Booking.com, Vrbo, Airbnb e siti ufficiali). Evita duplicati e verifica orari di apertura e prezzi realistici.';
      }
      return 'Cerca alloggi tramite fonti verificate riconosciute (es. camping.info, stellplatz.info, Park4Night, Promobil, ADAC Pincamp, Campercontact e siti ufficiali). Evita rigorosamente i duplicati e verifica orari di apertura e prezzi realistici.';
    }

    if (wantsRental && !wantsCamping) {
      return 'Search accommodations via established verified sources (e.g. Booking.com, Vrbo, Airbnb, Holidu, Interhome, and official regional tourism boards). Avoid duplicate mentions and verify availability and realistic prices.';
    }
    if (wantsRental && wantsCamping) {
      return 'Search campsites, motorhome pitches, and holiday accommodations via established verified sources (camping.info, stellplatz.info, Park4Night, Booking.com, Vrbo, Airbnb, and official websites). Avoid duplicates and verify opening hours and prices.';
    }
    return 'Search overnight stops via established verified sources (e.g. camping.info, stellplatz.info, Park4Night, Promobil, ADAC Pincamp, Campercontact, and official campsite websites). Avoid duplicate mentions of the same place and strictly verify opening hours and realistic prices.';
  })();

  const openCampingMapPolicy = (() => {
    if (lang.startsWith('de')) {
      const parts: string[] = [];
      if (wantsCamping) {
        parts.push(
          'Such- und Preis-Regeln für Camping- und Stellplätze:\n' +
          '- Nutze führende verifizierte Quellen (z. B. camping.info, stellplatz.info, Park4Night, Promobil Mobil Life, ADAC Pincamp, Campercontact sowie offizielle Betreiber-/Gemeindewebsites).\n' +
          '- Doppelnennungen zwingend vermeiden: Führe jeden Platz pro Etappe nur genau EINMAL auf (auch wenn er in mehreren Stellplatzführern gelistet ist).\n' +
          '- Preisangabe verpflichtend: Gib für JEDEN vorgeschlagenen Platz (Hauptvorschlag und Alternativen) eine realistische geschätzte Preisspanne pro Nacht an (z. B. "ca. 12–18 € / Nacht inkl. Strom & Kurtaxe" bzw. "kostenlos").\n' +
          '- Überprüfe zwingend, ob der Platz zur angegebenen Reisezeit geöffnet hat. Ist ein Platz geschlossen oder unklar, füge einen deutlichen Hinweis hinzu.\n' +
          '- Verlinke die gefundenen Plätze direkt mit der offiziellen Website oder der Portalseite (camping.info, stellplatz.info, Park4Night, Promobil, Pincamp, Campercontact).'
        );
      }
      if (wantsRental) {
        parts.push(
          'Such- und Preis-Regeln für Ferienwohnungen & Ferienhäuser:\n' +
          '- Recherchiere verifizierte Unterkünfte über führende Ferienhaus- & Fewo-Portale (z. B. Booking.com, FeWo-direkt / Vrbo, Traum-Ferienwohnungen, Airbnb, Holidu, Interhome) sowie offizielle regionale Tourismusverbände.\n' +
          '- Nenne für jede empfohlene Unterkunft den genauen Typ (Fewo, Ferienhaus, Chalet), ungefähre Bettenzahl/Zimmer, Lage und eine realistische Preisspanne pro Nacht.\n' +
          '- Verlinke direkt zur Buchungsseite oder zum Tourismusportal.'
        );
      }
      if (wantsGlamping) {
        parts.push(
          'Such- und Preis-Regeln für Glamping & Mietunterkünfte:\n' +
          '- Recherchiere Glamping-Unterkünfte (Safarizelte, Baumhäuser, Pods, Mobilheime, Tipis) über Portale wie glamping.info, camping.info, Campspace sowie direkte Anbieter-Websites.\n' +
          '- Gib Unterkunftstyp, Komfortausstattung und realistische Nachtpreise an.'
        );
      }
      parts.push('- Erfinde niemals Plätze, Unterkünfte, Links, Adressen, Preise oder Telefonnummern.');
      return parts.join('\n\n');
    }

    if (lang.startsWith('nl')) {
      const parts: string[] = [];
      if (wantsCamping) {
        parts.push(
          'Zoek- en prijsregels voor campings en camperplaatsen:\n' +
          '- Gebruik toonaangevende geverifieerde bronnen (bijv. camping.info, stellplatz.info, Park4Night, Promobil, ADAC Pincamp, Campercontact en officiële websites).\n' +
          '- Vermijd dubbele vermeldingen: vermeld elke overnachtingsplek per etappe slechts ÉÉN KEER.\n' +
          '- Prijsopgave verplicht: geef voor ELKE voorgestelde plek een realistische prijsindicatie per nacht (bijv. "ca. 12–18 € / nacht incl. stroom" of "gratis").\n' +
          '- Controleer altijd of de plaats geopend is tijdens de geplande reistijd.\n' +
          '- Link direct naar de officiële website of het portaal (camping.info, stellplatz.info, Park4Night, Campercontact, etc.).'
        );
      }
      if (wantsRental) {
        parts.push(
          'Zoek- en prijsregels voor vakantiehuizen & appartementen:\n' +
          '- Zoek geverifieerde accommodaties via toonaangevende portals (bijv. Booking.com, Vrbo, Natuurhuisje, Airbnb, Holidu, Belvilla) en regionale toeristenbureaus.\n' +
          '- Vermeld accommodatietype, capaciteit, ligging en realistische prijs per nacht.\n' +
          '- Link direct naar de boekingspagina of officiële website.'
        );
      }
      if (wantsGlamping) {
        parts.push(
          'Zoek- en prijsregels voor glamping:\n' +
          '- Zoek via glamping.info, camping.info, Campspace en directe aanbieders naar safaritenten, pods en boomhutten.'
        );
      }
      parts.push('- Verzin nooit plaatsen, links, adressen, prijzen of telefoonnummers.');
      return parts.join('\n\n');
    }

    if (lang.startsWith('fr')) {
      const parts: string[] = [];
      if (wantsCamping) {
        parts.push(
          'Règles de recherche et de prix pour campings et aires de camping-car :\n' +
          '- Utilise des sources vérifiées réputées (ex. camping.info, stellplatz.info, Park4Night, Promobil, ADAC Pincamp, Campercontact et sites officiels).\n' +
          '- Évite impérativement les doublons : ne mentionne chaque emplacement qu\'UNE SEULE FOIS par étape.\n' +
          '- Indication de prix obligatoire : indique pour CHAQUE emplacement proposé une fourchette de prix réaliste par nuit (ex. "env. 12–18 € / nuit avec électricité" ou "gratuit").\n' +
          '- Vérifie impérativement si l\'emplacement est ouvert pendant la période de voyage prévue.\n' +
          '- Lie directement vers le site officiel ou la fiche (camping.info, stellplatz.info, Park4Night, Campercontact, etc.).'
        );
      }
      if (wantsRental) {
        parts.push(
          'Règles de recherche pour gîtes, appartements et maisons de vacances :\n' +
          '- Recherche via des portails reconnus (ex. Booking.com, Abritel / Vrbo, Airbnb, Gîtes de France, Holidu) et offices de tourisme officiels.\n' +
          '- Précise le type de logement, la capacité, la localisation et le prix estimé par nuit.\n' +
          '- Lie directement vers le site de réservation ou l\'office de tourisme.'
        );
      }
      if (wantsGlamping) {
        parts.push(
          'Règles pour le glamping :\n' +
          '- Recherche des tentes safari, pods ou cabanes via glamping.info, camping.info, Campspace ou sites directs.'
        );
      }
      parts.push('- N\'invente jamais de lieux, liens, adresses, prix ou numéros de téléphone.');
      return parts.join('\n\n');
    }

    if (lang.startsWith('it')) {
      const parts: string[] = [];
      if (wantsCamping) {
        parts.push(
          'Regole di ricerca e di prezzo per campeggi e aree di sosta:\n' +
          '- Utilizza fonti verificate affidabili (es. camping.info, stellplatz.info, Park4Night, Promobil, ADAC Pincamp, Campercontact e siti ufficiali).\n' +
          '- Evita rigorosamente i duplicati: elenca ogni posto tappa solo UNA VOLTA.\n' +
          '- Prezzo obbligatorio: indica per OGNI posto proposto una stima realistica del prezzo a notte (es. "circa 12–18 € / notte con elettricità" o "gratuito").\n' +
          '- Verifica sempre se il campeggio/area di sosta è aperto durante il periodo previsto.\n' +
          '- Collega direttamente al sito ufficiale o alla scheda del portale.'
        );
      }
      if (wantsRental) {
        parts.push(
          'Regole per case vacanze e appartamenti:\n' +
          '- Cerca strutture verificate su portali affidabili (es. Booking.com, Vrbo, Airbnb, Holidu, Agriturismo.it) e consorzi turistici locali.\n' +
          '- Specifica tipologia, capienza, posizione e fascia di prezzo a notte.\n' +
          '- Inserisci link diretti alla prenotazione o al portale turistico.'
        );
      }
      if (wantsGlamping) {
        parts.push(
          'Regole per glamping:\n' +
          '- Cerca tende safari, lodge e case sull\'albero su glamping.info, camping.info, Campspace o siti dedicati.'
        );
      }
      parts.push('- Non inventare mai posti, link, indirizzi, prezzi o numeri di telefono.');
      return parts.join('\n\n');
    }

    const parts: string[] = [];
    if (wantsCamping) {
      parts.push(
        'Search and pricing rules for campsites and motorhome pitches:\n' +
        '- Use leading verified sources (e.g. camping.info, stellplatz.info, Park4Night, Promobil, ADAC Pincamp, Campercontact, and official websites).\n' +
        '- Strictly avoid duplicate entries: list each overnight location only ONCE per stage.\n' +
        '- Mandatory price estimates: for EVERY proposed stop (primary and alternatives), provide a realistic price range per night (e.g. "approx. €12–€18 / night incl. electricity & tourist tax" or "free").\n' +
        '- Always verify if the place is open during the planned travel period.\n' +
        '- Link directly to the official website or verified listing.'
      );
    }
    if (wantsRental) {
      parts.push(
        'Search and pricing rules for holiday homes & apartments:\n' +
        '- Search verified accommodations via leading portals (e.g. Booking.com, Vrbo, Airbnb, Holidu, Interhome) and official regional tourism boards.\n' +
        '- State accommodation type (apartment, chalet, holiday home), capacity, location, and realistic nightly price.\n' +
        '- Link directly to the listing or official booking source.'
      );
    }
    if (wantsGlamping) {
      parts.push(
        'Search and pricing rules for glamping:\n' +
        '- Search safari tents, treehouses, pods, and luxury mobile homes via glamping.info, camping.info, Campspace, or direct hosts.'
      );
    }
    parts.push('- Never invent places, links, addresses, prices, or phone numbers.');
    return parts.join('\n\n');
  })();

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
  const linkPolicyInstruction = lang.startsWith('de')
    ? '\n\nLink- & Preis-Policy: Gib für JEDE genannte Unterkunft / jeden Platz (Hauptvorschlag UND Alternativen) zwingend einen funktionierenden Link sowie eine realistische Preisspanne pro Nacht an. Verwende direkte Links zur offiziellen Website, zu Buchungsportalen oder etablierten Führern (camping.info, stellplatz.info, Booking.com, FeWo-direkt, Airbnb, Park4Night, Promobil, Pincamp, Campercontact). Vermeide Doppelnennungen. Nenne niemals ein Ziel ohne Link.'
    : '\n\nLink & Price Policy: Provide a working link and realistic price estimate per night for EVERY place / accommodation mentioned (main suggestion AND alternatives). Use direct links to official websites, booking portals, or established guides (camping.info, stellplatz.info, Booking.com, Vrbo, Airbnb, Park4Night, Promobil, Pincamp, Campercontact). Avoid duplicate mentions. Never name a place without a link.';
  const dailyLimitBufferInstruction = buildDailyLimitBufferInstruction(lang, maxDailyDistance, maxDailyDriveHours);
  const logicalScheduleInstruction = buildLogicalScheduleInstruction(lang, data, maxDailyDistance, maxDailyDriveHours);
  const pdfDownloadInstruction = lang.startsWith('de')
    ? '\n\nPDF-Datei: Wenn deine Plattform Datei-Downloads oder Artefakte unterstützt, erstelle zusätzlich eine PDF-Datei mit der vollständigen Route und den Routeninfos und biete sie zum Download an. Die PDF darf keine Kurzfassung oder kompakte Zusammenfassung sein, sondern soll die normale Antwort inhaltlich so vollständig wie möglich spiegeln. Übernimm alle Hauptabschnitte 1 bis 9, alle Etappen mit Zeiten, Bewertungen und Pausenlogik, alle Übernachtungen mit Hauptplatz und Alternativen sowie die dazugehörigen camping.info/stellplatz.info-Links, offiziellen Platz-Links und wichtigen Restaurant-, Aktivitäts- oder Zusatzlinks. Lasse keine Links, Alternativen, Warnhinweise oder Serviceinfos weg, nur um die PDF kürzer zu halten. Verwende in der PDF vollständige, anklickbare URLs statt bloßer Link-Platzhalter, Referenznummern oder Fußnotenmarker. Wenn die PDF dadurch länger wird, nutze lieber zusätzliche Seiten statt Inhalte zu verdichten oder zusammenzufassen. Falls zusätzlich eine GPX-Datei ausgegeben wird, muss der vollständige GPX-XML-Block nicht in die PDF kopiert werden; erwähne die GPX-Datei dann kurz als separaten Download. Verwende für die PDF einen sinnvollen Dateinamen wie campingroute-reiseplan.pdf. Wenn kein PDF-Download möglich ist, gib stattdessen nur die normale formatierte Antwort aus und behaupte keinen Download.'
    : '\n\nPDF file: If your platform supports file downloads or artifacts, also create a PDF file with the full route and the route details and offer it as a download. The PDF must not be a short version or compact summary; it should mirror the normal answer as completely as possible. Include all main sections 1 to 9, all legs with times, ratings, and break logic, all overnight stays with primary place and alternatives, plus the related camping.info/stellplatz.info links, official place links, and important restaurant, activity, or supporting links. Do not drop links, alternatives, warnings, or service notes just to make the PDF shorter. In the PDF, use full clickable URLs instead of bare link placeholders, reference numbers, or footnote markers. If that makes the PDF longer, prefer extra pages over compressing or summarizing the content. If a GPX file is also generated, the full GPX XML block does not need to be copied into the PDF; briefly mention the GPX file as a separate download instead. Use a sensible filename such as campingroute-travel-plan.pdf. If PDF download is not possible, provide only the normal formatted response and do not claim that a download exists.';
  const largeVehicleStopInstruction = shouldUseLargeVehicleStopLogic
    ? lang.startsWith('de')
      ? '\n\nWichtig: Bevorzuge für dieses größere Fahrzeug bzw. Gespann gut zugängliche Tankstellen, Autohof- und Rastanlagen mit ausreichend Platz zum An- und Abfahren. Meide kleine Tankstellen, enge Rastplätze oder Stopps ohne vernünftige Zufahrt für große Fahrzeuge bzw. ohne geeignete Lkw-/Langfahrzeug-Zufahrt. Wenn ein geplanter Service-Stopp problematisch wirkt, nenne stattdessen eine besser geeignete Alternative.'
      : lang.startsWith('nl')
        ? '\n\nBelangrijk: geef voor dit grotere voertuig of deze combinatie de voorkeur aan goed toegankelijke tankstations, truckstops en rustplaatsen mit genoeg ruimte om in en uit te rijden. Vermijd kleine tankstations, krappe rustplaatsen of stops zonder goede toegang voor grote voertuigen of zonder geschikte truck-/langevoertuigtoegang. Als een geplande servicestop lastig lijkt, noem dan een beter passend alternatief.'
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
        // Deutlichere Kennzeichnung für die KI, dass dieser Stopp unveränderlich ist
        let bookedLabel = 'CENTRAL ANCHOR POINT: This stay is FIXED and IMMUTABLE';
        if (lang.startsWith('de')) bookedLabel = 'ZENTRALER ANKERPUNKT: Dieser Aufenthalt ist FEST GEBUCHT und UNVERÄNDERLICH';
        else if (lang.startsWith('nl')) bookedLabel = 'CENTRAAL ANKERPUNT: Dit verblijf is VAST GEBOEKT en ONVERANDERLIJK';
        else if (lang.startsWith('fr')) bookedLabel = 'POINT D\'ANCRAGE CENTRAL : Ce séjour est RÉSERVÉ et IMMUABLE';
        else if (lang.startsWith('it')) bookedLabel = 'PUNTO DI ANCORAGGIO CENTRALE: Questo soggiorno è PRENOTATO e IMMUTABILE';
        
        lines.push(`• ${bookedLabel}`);
      }
      if (stage.detailsEnabled || stage.booked) {
        if (stage.arrivalDate) lines.push(`  - ${t('prompt.labels.stageArrivalDate', { num: index + 1 })}: ${formatDate(stage.arrivalDate)}`);
        if (stage.arrivalTime) lines.push(`  - ${t('prompt.labels.stageArrivalTime', { num: index + 1 })}: ${stage.arrivalTime}`);
        if (stage.departureDate) lines.push(`  - ${t('prompt.labels.stageDepartureDate', { num: index + 1 })}: ${formatDate(stage.departureDate)}`);
        if (stage.departureTime) lines.push(`  - ${t('prompt.labels.stageDepartureTime', { num: index + 1 })}: ${stage.departureTime}`);
      }
      return lines.join('\n');
    })
    .filter(Boolean)
    .join('\n');

  const isRoundTrip = data.startPoint && data.destination && data.startPoint.toLowerCase().trim() === data.destination.toLowerCase().trim();

  let roundTripLabel = '';
  if (isRoundTrip) {
    if (lang.startsWith('de')) {
      roundTripLabel = `• RUNDREISE: Die Reise beginnt und endet am selben Ort (${data.startPoint}). Plane die Route so, dass alle Etappen und das Urlaubsziel innerhalb des Zeitrahmens liegen und die Rückkehr rechtzeitig erfolgt.`;
    } else if (lang.startsWith('nl')) {
      roundTripLabel = `• RONDREIS: De reis begint en eindigt op dezelfde locatie (${data.startPoint}). Plan de route zo dat alle etappes en de vakantiebestemming binnen het tijdschema passen en de terugkeer op tijd is.`;
    } else if (lang.startsWith('fr')) {
      roundTripLabel = `• VOYAGE ALLER-RETOUR : Le voyage commence et se termine au même endroit (${data.startPoint}). Planifie l'itinéraire de manière à ce que toutes les étapes et la destination de vacances respectent le calendrier et que le retour se fasse à temps.`;
    } else if (lang.startsWith('it')) {
      roundTripLabel = `• VIAGGIO DI ANDATA E RITORNO: Il viaggio inizia e finisce nello stesso luogo (${data.startPoint}). Pianifica l'itinerario in modo che tutte le tappe e la destinazione della vacanza rientrino nei tempi previsti e il ritorno avvenga puntualmente.`;
    } else {
      roundTripLabel = `• ROUND TRIP: The journey starts and ends at the same location (${data.startPoint}). Plan the route so that all stages and the holiday destination fit within the timeframe and the return journey is on time.`;
    }
  }

  const routeLines = [
    `• ${t('prompt.labels.start')}: ${data.startPoint}`,
    `• ${t('prompt.labels.destination')}: ${data.destination}`,
    roundTripLabel,
    data.targetRegions ? `• ${t('prompt.labels.targetRegions')}: ${data.targetRegions}` : '',
    data.preferScenicLongerStops ? `• ${t('prompt.labels.preferScenicLongerStops')}` : '',
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
${linkPolicyInstruction}
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

  return callAIAPIInternal(prompt, aiSettings);
}

export async function callAIAPIInternal(prompt: string, aiSettings: AISettings): Promise<string> {
  const lang = (i18next.language || 'en').toLowerCase();
  let apiUrl = '';
  let headers: Record<string, string> = {};
  let requestData: unknown = {};
  const webSearchDirective = lang.startsWith('de')
    ? [
        'Wichtig fuer die Websuche:',
        '- Nutze vor der Antwort zwingend die Websuche.',
        '- Suche pro Etappe und pro Ort gezielt nach verifizierten Stell- und Campingplätzen (z. B. auf camping.info, stellplatz.info, Park4Night, Promobil, Pincamp, Campercontact).',
        '- Vermeide Doppelnennungen: Nenne jeden Übernachtungsplatz pro Etappe nur genau einmal.',
        '- Wenn mehrere Kandidaten auftauchen, waehle den mit dem klarsten Ortsbezug, der passendsten Uebernachtungsart und dem kleinsten Umweg.',
        '- Verwende keine Meta-Antworten wie "wenn du moechtest, kann ich ..." oder "ich kann im naechsten Schritt ...". Liefere die bestmoeglichen Ergebnisse direkt.',
        '- Link- und Preis-Extraktion: Extrahiere IMMER direkte URLs (offizielle Website oder führende Stellplatzführer) und gib eine geschätzte Preisspanne pro Nacht an. Gib keine Links aus, die erst zu einer Google-Suche führen.',
        '- Pruefe stets die Oeffnungszeiten zur Reisezeit! Ist dies nicht moeglich oder der Platz geschlossen, weise den Nutzer deutlich darauf hin.',
        '- Erfinde keine Plaetze, Links, Adressen, Preise oder Telefonnummern. Wenn nach mehreren gezielten Suchen nichts Sicheres auffindbar ist, sage das knapp und mache mit dem naechsten Ort weiter.'
      ].join('\n')
    : [
        'Important for web search:',
        '- Always use web search before answering.',
        '- Search targeted and specifically on established campsite platforms (camping.info, stellplatz.info, Park4Night, Promobil, Pincamp, Campercontact) for each leg and location.',
        '- Strictly avoid duplicate entries for the same place.',
        '- If several candidates appear, choose the one with the clearest location match, the best fitting accommodation type and the smallest detour.',
        '- Do not produce meta answers like "if you want, I can..." or "in the next step I can...". Deliver the best possible result directly.',
        '- Link and price extraction: ALWAYS extract direct URLs (official site or verified guides) and provide estimated price ranges per night. Do not provide links that lead to a search engine.',
        '- Always check the opening times during the travel period! If this is not possible or the place is closed, point this out clearly to the user.',
        '- Do not invent places, links, addresses, prices, or phone numbers. After several targeted searches, if nothing reliable is found, say so briefly and continue with the next place.'
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

    case 'google':
      let geminiModel = aiSettings.googleModel || DEFAULT_GEMINI_MODEL;
      
      // Fixup fuer veraltete oder inkorrekte Model-Namen aus dem LocalStorage
      if (geminiModel === 'gemini-3.1-flash-live') geminiModel = 'gemini-3-flash-preview';
      if (geminiModel === 'gemini-3.1-pro') geminiModel = 'gemini-3.1-pro-preview';
      if (geminiModel === 'gemini-3.1-flash-lite') geminiModel = 'gemini-3.1-flash-lite-preview';
      if (geminiModel === 'gemini-3.0-flash') geminiModel = 'gemini-3-flash-preview';

      // v1beta ist fuer Live-Suche (Grounding) bei Gemini 3.1 erforderlich
      // v1 liefert bei Grounding-Tools oft 400 Bad Request
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${aiSettings.apiKey}`;
      headers = { 'Content-Type': 'application/json' };
      
      let geminiSystemMessage = 'You are a helpful route planner for camping, RVs, caravans, tents, and motorcycles. Respond STRICTLY in Markdown format. NEVER use HTML tags like <b> or <i>. Use **bold** or *italic* instead.';
      if (lang.startsWith('de')) geminiSystemMessage = 'Du bist ein hilfreicher Routenplaner für Camping, Wohnmobil, Wohnwagen, Zelt und Motorrad. Antworte STRENG im Markdown-Format. Nutze NIEMALS HTML-Tags wie <b> oder <i>. Nutze stattdessen **fett** oder *kursiv*.';
      else if (lang.startsWith('nl')) geminiSystemMessage = 'Je bent een behulpzame routeplanner voor kamperen, camper, caravan, tent en motor. Antwoord STRIKT in Markdown-formaat. Gebruik NOOIT HTML-tags zoals <b> of <i>. Gebruik in plaats daarvan **vet** of *cursief*.';
      else if (lang.startsWith('fr')) geminiSystemMessage = 'Tu es un planificateur d\'itinéraires utile pour le camping, le camping-car, la caravane, la tente et la moto. Réponds STRICTEMENT au format Markdown. N\'utilise JAMAIS de balises HTML comme <b> ou <i>. Utilise plutôt du **gras** ou de l\'*italique*.';
      else if (lang.startsWith('it')) geminiSystemMessage = 'Sei un utile pianificatore di itinerari per campeggio, camper, roulotte, tenda e moto. Rispondi RIGOROSAMENTE in formato Markdown. Non usare MAI tag HTML come <b> o <i>. Usa invece il **grassetto** o il *corsivo*.';

      let truncationInstruction = '\n\nIMPORTANT: Always generate the response completely. Use ONLY Markdown for formatting (no HTML). Never stop in the middle of a sentence or section. If the route is very long, be more concise in descriptions, but deliver all sections (1 to 9) and all GPX blocks until the very end.';
      if (lang.startsWith('de')) truncationInstruction = '\n\nWICHTIG: Erzeuge die Antwort IMMER vollständig. Nutze für die Formatierung ausschließlich Markdown (kein HTML). Brich niemals mitten im Satz oder mitten in einer Sektion ab. Wenn die Route sehr lang ist, fasse dich in den Beschreibungen etwas kürzer, aber liefere alle Sektionen (1 bis 9) und alle GPX-Blöcke bis zum Ende aus.';
      else if (lang.startsWith('nl')) truncationInstruction = '\n\nBELANGRIJK: Genereer het antwoord ALTIJD volledig. Gebruik voor de opmaak uitsluitend Markdown (geen HTML). Stop nooit midden in een zin of sectie. Als de route erg lang is, wees dan iets beknopter in de beschrijvingen, maar lever alle secties (1 tot 9) en alle GPX-blokken tot aan het einde uit.';
      else if (lang.startsWith('fr')) truncationInstruction = '\n\nIMPORTANT : Génère TOUJOURS la réponse complète. Utilise uniquement Markdown pour la mise en forme (pas de HTML). Ne t\'arrête jamais au milieu d\'une phrase ou d\'une section. Si l\'itinéraire est très long, sois plus concis dans les descriptions, mais fournis toutes les sections (1 à 9) et tous les blocs GPX jusqu\'à la fin.';
      else if (lang.startsWith('it')) truncationInstruction = '\n\nIMPORTANTE: Genera SEMPRE la risposta completa. Usa solo Markdown per la formattazione (niente HTML). Non fermarti mai a metà di una frase o di una sezione. Se l\'itinerario è molto lungo, sii più conciso nelle descrizioni, ma fornisci tutte le sezioni (da 1 a 9) e tutti i blocchi GPX fino alla fine.';

      requestData = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${geminiSystemMessage}\n\n${webSearchDirective}\n\n${prompt}${truncationInstruction}` }]
          }
        ],
        system_instruction: {
          parts: [{ text: geminiSystemMessage }]
        },
        tools: [
          {
            google_search: {} 
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 65536
        }
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
    console.error("Fetch error:", fetchError);
    throw new Error(i18next.t("planner.loading.error"));
  }
  
  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
      console.error("AI API Error Details:", errorData);
    } catch {
      // ignore parse errors
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
    
    if (responseData.choices?.[0]?.message?.content) {
      return responseData.choices[0].message.content;
    }
  }

  if (aiSettings.aiProvider === 'google') {
    const geminiText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (geminiText) {
      return geminiText;
    }
  }

  return responseData.choices?.[0]?.message?.content || "";
}
