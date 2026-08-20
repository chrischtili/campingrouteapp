import { getDb } from '../db/db.js';
import { upsertPlace, NormalizedPlace } from './lib/import-utils.js';

function premiumPlace(
  item: {
    id: string; name: string; type: string; latitude: number; longitude: number;
    country: string; state?: string; description: string; amenities: string;
    rating: number; price: string; price_min?: number; price_max?: number;
    website: string; address: string; city?: string; postal_code?: string; street?: string;
  }
): NormalizedPlace {
  const imageMatch = item.description.match(/!\[.*?\]\((.*?)\)/);
  const imageUrl = imageMatch ? imageMatch[1] : null;
  const description = item.description.replace(/!\[.*?\]\(.*?\)/g, '').trim();
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country,
    state: item.state || null,
    city: item.city || null,
    postal_code: item.postal_code || null,
    street: item.street || null,
    description,
    amenities: item.amenities,
    image_url: imageUrl,
    rating: item.rating,
    price: item.price,
    price_min: item.price_min ?? null,
    price_max: item.price_max ?? null,
    currency: /€|EUR/.test(item.price) ? 'EUR' : null,
    is_free: /kostenlos|free/i.test(item.price),
    contact: `Website: ${item.website}`,
    website: item.website,
    address: item.address,
    source: 'custom',
    data_quality: 2
  };
}

async function run() {
  const db = await getDb();
  
  const rawAttractions = [
    // Berlin
    {
      id: 'custom-berlin-brandenburger-tor',
      name: 'Brandenburger Tor',
      type: 'attraction',
      latitude: 52.516275,
      longitude: 13.377704,
      country: 'DE',
      state: 'Berlin',
      description: '![Brandenburger Tor](https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=800&q=80)\n\nDas weltberühmte frühklassizistische Triumphtor ist das bekannteste Wahrzeichen Berlins und ein nationales Symbol für die deutsche Einheit.',
      amenities: 'guided-tours,restrooms,wheelchair-accessible',
      rating: 4.8,
      price: 'Kostenlos',
      is_free: true,
      website: 'https://www.berlin.de/sehenswuerdigkeiten/3560266-3558930-brandenburger-tor.html',
      address: 'Pariser Platz, 10117 Berlin, Deutschland',
      city: 'Berlin',
      postal_code: '10117',
      street: 'Pariser Platz'
    },
    {
      id: 'custom-berlin-reichstag',
      name: 'Reichstagsgebäude',
      type: 'attraction',
      latitude: 52.518621,
      longitude: 13.376187,
      country: 'DE',
      state: 'Berlin',
      description: '![Reichstag](https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80)\n\nDer Sitz des Deutschen Bundestages. Besonders spektakulär ist die begehbare Glaskuppel, die einen fantastischen Blick über das Berliner Regierungsviertel bietet.',
      amenities: 'guided-tours,wheelchair-accessible,security-check',
      rating: 4.7,
      price: 'Kostenlos (Anmeldung erforderlich)',
      is_free: true,
      website: 'https://www.bundestag.de/besuche/kuppel',
      address: 'Platz der Republik 1, 11011 Berlin, Deutschland',
      city: 'Berlin',
      postal_code: '11011',
      street: 'Platz der Republik 1'
    },
    {
      id: 'custom-berlin-fernsehturm',
      name: 'Berliner Fernsehturm',
      type: 'attraction',
      latitude: 52.520814,
      longitude: 13.409418,
      country: 'DE',
      state: 'Berlin',
      description: '![Fernsehturm](https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=800&q=80)\n\nMit 368 Metern das höchste Bauwerk Deutschlands. Die Aussichtsplattform bietet ein atemberaubendes 360-Grad-Panorama über die gesamte Metropole.',
      amenities: 'restaurant,souvenir-shop,elevator,wheelchair-accessible',
      rating: 4.6,
      price: 'Ab 22,50 €',
      price_min: 22.5,
      price_max: 22.5,
      website: 'https://tv-turm.de/',
      address: 'Panoramastraße 1a, 10178 Berlin, Deutschland',
      city: 'Berlin',
      postal_code: '10178',
      street: 'Panoramastraße 1a'
    },
    {
      id: 'custom-berlin-dom',
      name: 'Berliner Dom',
      type: 'attraction',
      latitude: 52.519062,
      longitude: 13.401038,
      country: 'DE',
      state: 'Berlin',
      description: '![Berliner Dom](https://images.unsplash.com/photo-1588263823525-4277d33d8753?auto=format&fit=crop&w=800&q=80)\n\nDie größte Kirche Berlins mit ihrer markanten Kuppel. Sie beherbergt die Hohenzollerngruft und bietet nach dem Aufstieg einen weiten Ausblick.',
      amenities: 'guided-tours,concert-hall,restrooms',
      rating: 4.7,
      price: '10,00 €',
      price_min: 10,
      price_max: 10,
      website: 'https://www.berlinerdom.de/',
      address: 'Am Lustgarten, 10178 Berlin, Deutschland',
      city: 'Berlin',
      postal_code: '10178',
      street: 'Am Lustgarten'
    },
    // Bayerischer Wald
    {
      id: 'custom-baywald-nationalpark',
      name: 'Nationalpark Bayerischer Wald',
      type: 'attraction',
      latitude: 48.9667,
      longitude: 13.3833,
      country: 'DE',
      state: 'Bayern',
      description: '![Bayerischer Wald](https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80)\n\nDer älteste Nationalpark Deutschlands. Hier darf sich die Natur nach ihren eigenen Gesetzen zu einer grenzenlosen Waldwildnis entwickeln. Ein Paradies zum Wandern.',
      amenities: 'parking,restrooms,hiking-trails,visitor-center',
      rating: 4.9,
      price: 'Kostenlos',
      is_free: true,
      website: 'https://www.nationalpark-bayerischer-wald.bayern.de/',
      address: 'Falkenstein-Rachel-Lusen, 94481 Grafenau, Deutschland',
      city: 'Grafenau',
      postal_code: '94481',
      street: 'Falkenstein-Rachel-Lusen'
    },
    {
      id: 'custom-baywald-baumwipfelpfad',
      name: 'Baumwipfelpfad Bayerischer Wald',
      type: 'attraction',
      latitude: 48.891122,
      longitude: 13.486221,
      country: 'DE',
      state: 'Bayern',
      description: '![Baumwipfelpfad](https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80)\n\nEin spektakulärer Holzsteg in 8 bis 25 Metern Höhe über dem Waldboden. Der Höhepunkt ist das 44 Meter hohe "Waldei" mit gigantischer Aussicht.',
      amenities: 'parking,restaurant,restrooms,souvenir-shop,wheelchair-accessible',
      rating: 4.8,
      price: '12,00 €',
      price_min: 12,
      price_max: 12,
      website: 'https://www.baumwipfelpfade.de/bayerischer-wald/',
      address: 'Böhmstraße 43, 94556 Neuschönau, Deutschland',
      city: 'Neuschönau',
      postal_code: '94556',
      street: 'Böhmstraße 43'
    },
    {
      id: 'custom-baywald-arber',
      name: 'Großer Arber',
      type: 'attraction',
      latitude: 49.112838,
      longitude: 13.131944,
      country: 'DE',
      state: 'Bayern',
      description: '![Großer Arber](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80)\n\nDer "König des Bayerischen Waldes" ist mit 1.456 Metern der höchste Berg der Region. Perfekt für Skifahrer im Winter und Wanderer im Sommer.',
      amenities: 'cable-car,restaurant,hiking-trails,parking',
      rating: 4.7,
      price: 'Kostenlos (Gondelbahn kostenpflichtig)',
      is_free: true,
      website: 'https://www.arber.de/',
      address: 'Großer Arber 1, 94252 Bayerisch Eisenstein, Deutschland',
      city: 'Bayerisch Eisenstein',
      postal_code: '94252',
      street: 'Großer Arber 1'
    },
    // Bremen
    {
      id: 'custom-bremen-roland',
      name: 'Bremer Roland',
      type: 'attraction',
      latitude: 53.0760,
      longitude: 8.8080,
      country: 'DE',
      state: 'Bremen',
      description: '![Bremer Roland](https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80)\n\nDie Statue des Roland auf dem Marktplatz vor dem Rathaus ist das Wahrzeichen der Stadt Bremen und steht als Symbol für Freiheit und Marktrechte seit 1404.',
      amenities: 'wheelchair-accessible',
      rating: 4.7,
      price: 'Kostenlos',
      is_free: true,
      website: 'https://www.bremen-tourismus.de/bremer-roland',
      address: 'Am Markt, 28195 Bremen, Deutschland',
      city: 'Bremen',
      postal_code: '28195',
      street: 'Am Markt'
    },
    {
      id: 'custom-bremen-stadtmusikanten',
      name: 'Bremer Stadtmusikanten',
      type: 'attraction',
      latitude: 53.0762,
      longitude: 8.8075,
      country: 'DE',
      state: 'Bremen',
      description: '![Bremer Stadtmusikanten](https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=800&q=80)\n\nDie berühmte Bronzestatue von Gerhard Marcks erinnert an das Märchen der Gebrüder Grimm. Ein Berühren der Vorderbeine des Esels bringt Glück!',
      amenities: 'wheelchair-accessible',
      rating: 4.8,
      price: 'Kostenlos',
      is_free: true,
      website: 'https://www.bremen-tourismus.de/bremer-stadtmusikanten',
      address: 'Schoppensteel, 28195 Bremen, Deutschland',
      city: 'Bremen',
      postal_code: '28195',
      street: 'Schoppensteel'
    },
    {
      id: 'custom-bremen-schnoor',
      name: 'Schnoorviertel',
      type: 'attraction',
      latitude: 53.0730,
      longitude: 8.8095,
      country: 'DE',
      state: 'Bremen',
      description: '![Schnoorviertel](https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80)\n\nBremens ältestes Stadtviertel. In den engen, verwinkelten Gassen stehen kleine Fachwerkhäuser aus dem 15. und 16. Jahrhundert wie Perlen an einer Schnur aufgereiht.',
      amenities: 'shopping,restaurants,guided-tours',
      rating: 4.8,
      price: 'Kostenlos',
      is_free: true,
      website: 'https://www.bremen-tourismus.de/schnoorviertel',
      address: 'Schnoor, 28195 Bremen, Deutschland',
      city: 'Bremen',
      postal_code: '28195',
      street: 'Schnoor'
    },
    // Hamburg
    {
      id: 'custom-hamburg-elbphilharmonie',
      name: 'Elbphilharmonie',
      type: 'attraction',
      latitude: 53.5413,
      longitude: 9.9841,
      country: 'DE',
      state: 'Hamburg',
      description: '![Elbphilharmonie](https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=800&q=80)\n\nDas spektakuläre Konzerthaus im Hamburger Hafen mit seiner markanten Glaswellen-Architektur. Die Aussichtsplattform Plaza bietet einen gigantischen Rundumblick.',
      amenities: 'restaurant,souvenir-shop,elevator,wheelchair-accessible,guided-tours',
      rating: 4.8,
      price: 'Plaza-Ticket: 2,00 €',
      price_min: 2,
      price_max: 2,
      website: 'https://www.elbphilharmonie.de/',
      address: 'Platz der Deutschen Einheit 1, 20457 Hamburg, Deutschland',
      city: 'Hamburg',
      postal_code: '20457',
      street: 'Platz der Deutschen Einheit 1'
    },
    {
      id: 'custom-hamburg-speicherstadt',
      name: 'Speicherstadt',
      type: 'attraction',
      latitude: 53.5444,
      longitude: 9.9911,
      country: 'DE',
      state: 'Hamburg',
      description: '![Speicherstadt](https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=800&q=80)\n\nDer größte historische Lagerhauskomplex der Welt und UNESCO-Weltkulturerbe. Die wilhelminischen Backsteinbauten auf Eichenpfählen sind von malerischen Kanälen (Fleeten) durchzogen.',
      amenities: 'guided-tours,museums,boat-tours',
      rating: 4.8,
      price: 'Kostenlos',
      is_free: true,
      website: 'https://www.hamburg.de/speicherstadt/',
      address: 'Am Sandtorkai, 20457 Hamburg, Deutschland',
      city: 'Hamburg',
      postal_code: '20457',
      street: 'Am Sandtorkai'
    },
    {
      id: 'custom-hamburg-wunderland',
      name: 'Miniatur Wunderland',
      type: 'attraction',
      latitude: 53.5439,
      longitude: 9.9890,
      country: 'DE',
      state: 'Hamburg',
      description: '![Miniatur Wunderland](https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80)\n\nDie größte Modelleisenbahnanlage der Welt in der historischen Speicherstadt. Ein faszinierendes Meisterwerk mit liebevollen Miniaturdetails aus aller Welt.',
      amenities: 'restaurant,souvenir-shop,wheelchair-accessible,restrooms',
      rating: 4.9,
      price: 'Ab 20,00 €',
      price_min: 20,
      price_max: 20,
      website: 'https://www.miniatur-wunderland.de/',
      address: 'Kehrwieder 2, 20457 Hamburg, Deutschland',
      city: 'Hamburg',
      postal_code: '20457',
      street: 'Kehrwieder 2'
    },
    // Niederlande – kuratierte Ergänzung (fehlt in OSM)
    {
      id: 'custom-camping-alkmaar',
      name: 'Camping Alkmaar',
      type: 'campground',
      latitude: 52.6420315,
      longitude: 4.7232437,
      country: 'NL',
      state: 'Noord-Holland',
      description: 'Familien-Campingplatz direkt an der Bergerweg zwischen Alkmaar und Bergen. Ideal als Basis für Fahrradtouren in die Altstadt von Alkmaar (Käsemarkt), an die Nordseeküste oder nach Bergen. Saisonplätze und Touring-Pitches, freundliche Atmosphäre.',
      amenities: 'hookups,showers,toilets,wifi',
      rating: 4.5,
      price: 'Paid',
      website: 'https://www.campingalkmaar.nl/',
      address: 'Bergerweg 201, 1817 ML Alkmaar, Niederlande',
      city: 'Alkmaar',
      postal_code: '1817 ML',
      street: 'Bergerweg 201'
    }
  ];

  const places = rawAttractions.map(a => premiumPlace(a));
  for (const item of places) {
    await upsertPlace(db, item);
  }
  console.log(`Successfully inserted/updated ${places.length} custom premium attractions.`);
}

run().catch(console.error);
