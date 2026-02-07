import { useState } from "react";
import { Map, Calendar, Euro, Star, Tent, Mountain, Compass, Sun, Moon, Droplets, Wind, Thermometer, Clock, Fuel, Utensils, Wine, TreePine, Fish, Bike, Activity, Camera, ShoppingBag, Info, AlertTriangle, CheckCircle, Route as RouteIcon, CarFront, Dog, GasPump, BatteryFull, Water, Trash2, Wrench, Smartphone, CreditCard, Scale, Ruler, Gauge, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Beispielroute basierend auf der KI-Ausgabe
export function KIExampleRoute() {
  const [showSuccess, setShowSuccess] = useState(false);
  
  const copyToClipboard = async () => {
    try {
      const exampleText = `Hallo! Als dein professioneller Wohnmobil-Routenplaner habe ich eine entspannte „Slow Travel“-Route für dich ausgearbeitet...`;
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(exampleText);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Kopieren fehlgeschlagen:', err);
    }
  };

  const exampleRoute = {
    title: "Slow Travel Route: Karlsruhe → Perleberg",
    subtitle: "Entspannte 3-Tage-Reise durch Mitteldeutschland",
    duration: "3 Tage",
    distance: "650 km",
    season: "Frühsommer",
    vehicle: "Wohnmobil (7,2m, 5,5t, 3,3m Höhe)",
    travelers: "2 Erwachsene + Hund",
    budget: "€€ (mittel)",
    
    vehicleInfo: {
      weight: "5,5 t",
      height: "3,3 m",
      length: "7,2 m",
      autonomy: "600Ah Lithium, 600W Solar, Clesana-Toilette",
      speedLimits: {
        autobahn: "100 km/h",
        landstrasse: "80 km/h",
        city: "50 km/h"
      }
    },
    
    importantNotes: [
      {
        title: "Gewicht (5,5 t)",
        icon: Scale,
        description: "Tempo 100 auf Autobahnen, 80 auf Landstraßen. Achte auf Überholverbote für Lkw (Zeichen 277)."
      },
      {
        title: "Datum (04.06.2026 - Fronleichnam)",
        icon: Calendar,
        description: "Starker Ausflugsverkehr in Baden-Württemberg. Starte früh (vor 7:00) oder später (nach Mittag)."
      },
      {
        title: "Höhe (3,3 m)",
        icon: Ruler,
        description: "Vorsicht bei Brücken in Ortschaften und Tankstellendächern. Navi auf Lkw-Maße einstellen!"
      },
      {
        title: "Autarkie",
        icon: BatteryFull,
        description: "Mit 600Ah Lithium, 600W Solar und Clesana-Toilette bist du extrem unabhängig. Naturnahe Stellplätze möglich."
      }
    ],
    
    overview: {
      description: "Diese entspannte 'Slow Travel'-Route führt dich durch die landschaftlich reizvolle 'Mitteldeutschland-Linie' (A81/A71), um die staugefährdete A5/A7-Hauptachse zu meiden. Die Route ist perfekt für dein schweres Wohnmobil und bietet eine Mischung aus Natur, Kultur und Entspannung.",
      routeStrategy: "Vermeidung von Hauptverkehrsachsen durch Nutzung der A81/A71",
      highlights: [
        "Thüringer Wald Autobahn (A71) - eine der schönsten Autobahnen Deutschlands",
        "Wasserstraßenkreuz Magdeburg - technisches Meisterwerk",
        "Tangermünde - malerische Backsteingotik-Stadt an der Elbe",
        "Schloss Saaleck mit Weinbergwanderung",
        "Kyffhäuser Denkmal mit Panoramablick"
      ]
    },
    
    budgetBreakdown: {
      total: "€210 - €270",
      items: [
        { category: "Diesel (ca. 14L/100km)", amount: "€150 - €180", icon: Fuel },
        { category: "Übernachtungen", amount: "€60 - €90", icon: Tent },
        { category: "Verpflegung", amount: "€50 - €80", icon: Utensils },
        { category: "Aktivitäten", amount: "€20 - €50", icon: Activity }
      ]
    },
    
    days: [
      {
        day: 1,
        title: "Karlsruhe → Hammelburg (Fränkisches Weinland)",
        date: "Donnerstag, 04.06.2026",
        location: "Hammelburg, Bayern",
        coordinates: "50.1167° N, 9.8833° E",
        description: "Die erste Etappe führt dich durch Baden-Württemberg nach Bayern. Du meidest die Hauptverkehrsachsen und genießt die landschaftlich reizvolle Strecke durch das fränkische Weinland.",
        route: {
          distance: "190 km",
          duration: "2:45 - 3:30 h",
          details: "A5 Richtung Norden → A6 Richtung Heilbronn → A81 Richtung Würzburg → A7 → B287 Richtung Hammelburg",
          trafficNotes: "Vermeide die Rush-Hour in Heilbronn"
        },
        campsites: [
          {
            name: "Wohnmobilstellplatz Am Bleichrasen",
            rating: 4.5,
            price: "€10 - €15",
            amenities: ["V+E", "Strom", "Fester Untergrund", "Hundefreundlich"],
            location: "Direkt an der Fränkischen Saale, fußläufig zur Altstadt",
            dogFriendly: true,
            notes: "Münzen für Strom bereithalten"
          },
          {
            name: "Weingut-Stellplatz (via Landvergnügen)",
            rating: 4.3,
            price: "€5 - €10",
            amenities: ["Wasser auf Anfrage", "Idyllische Lage"],
            location: "In den Weinbergen",
            dogFriendly: true,
            notes: "Wasser auf Anfrage verfügbar"
          }
        ],
        activities: [
          {
            name: "Technik Museum Sinsheim",
            type: "Museum",
            icon: Camera,
            description: "Concorde und Tupolev sind schon von der Autobahn aus zu sehen. Großer Parkplatz für 7m+ Fahrzeuge.",
            suitableForLargeVehicles: true
          },
          {
            name: "Schloss Saaleck",
            type: "Wanderung",
            icon: Mountain,
            description: "Schöne Wanderung durch die Weinberge zur Burgruine mit tollem Ausblick.",
            dogFriendly: true
          },
          {
            name: "Würzburger Residenz (UNESCO)",
            type: "Kultur",
            icon: Camera,
            description: "Barocke Pracht, aber Parken mit 7,2m ist schwierig. Nutze Parkplatz Talavera.",
            parkingNote: "Parkplatz Talavera nutzen"
          }
        ],
        food: [
          {
            name: "Weinstube Hammelburg",
            type: "Regional",
            recommendation: "Fränkische Spezialitäten mit lokalem Wein",
            price: "€€",
            dogFriendly: true
          }
        ],
        travelTips: [
          "A81 ist entspannter als die A5",
          "Landschaftlich sehr schöne Strecke durch Franken",
          "Achte auf Tempolimits für schwere Wohnmobile"
        ]
      },
      {
        day: 2,
        title: "Hammelburg → Bernburg/Plötzky (Saale)",
        date: "Freitag, 05.06.2026",
        location: "Bernburg/Plötzky, Sachsen-Anhalt",
        coordinates: "51.7833° N, 11.7333° E",
        description: "Heute durchquerst du den Thüringer Wald auf der A71, einer der schönsten Autobahnen Deutschlands. Genieße die spektakuläre Berglandschaft.",
        route: {
          distance: "240 km",
          duration: "3:15 - 4:00 h",
          details: "A71 (Thüringer Wald Autobahn) → A38 → A14",
          trafficNotes: "Nutze Tempomat auf 95-100 km/h für entspannte Fahrt"
        },
        campsites: [
          {
            name: "Ferienpark Plötzky",
            rating: 4.7,
            price: "€35 - €45",
            amenities: ["V+E", "Strom", "Duschen", "Restaurant", "Hundefreundlich", "Waldspaziergänge"],
            location: "Idyllisch im Wald-/Seengebiet",
            dogFriendly: true,
            notes: "Reservierung empfohlen (Freitagabend)"
          },
          {
            name: "Marina Bernburg",
            rating: 4.4,
            price: "€15 - €20",
            amenities: ["V+E", "Seeblick", "Restaurant"],
            location: "Direkt an der Saale, unterhalb des Schlosses",
            dogFriendly: true,
            notes: "Anfahrt prüfen (Brückenhöhen)"
          }
        ],
        activities: [
          {
            name: "Thüringer Wald Rastplätze",
            type: "Aussicht",
            icon: Mountain,
            description: "Spektakuläre Aussicht von den Brücken und Rastplätzen im Gebirge.",
            suitableForLargeVehicles: true
          },
          {
            name: "Kyffhäuser Denkmal",
            type: "Kultur",
            icon: Camera,
            description: "Riesiges Denkmal mit tollem Blick. Steile Anfahrt - Motorbremse nutzen!",
            parkingNote: "Für 5,5t machbar, aber vorsichtig"
          },
          {
            name: "Wasserstraßenkreuz Magdeburg",
            type: "Technik",
            icon: Camera,
            description: "Technisches Meisterwerk: Mittellandkanal fließt über die Elbe.",
            suitableForLargeVehicles: true
          }
        ],
        food: [
          {
            name: "Gasthaus Zum Löwen",
            type: "Regional",
            recommendation: "Thüringer Klöße mit Sauce",
            price: "€€",
            dogFriendly: true
          }
        ],
        travelTips: [
          "A71 gilt als eine der schönsten Autobahnen Deutschlands",
          "Viele Tunnel und Brücken - spektakuläre Fahrt",
          "Perfekt für Slow Travel mit Tempomat"
        ]
      },
      {
        day: 3,
        title: "Bernburg → Perleberg",
        date: "Samstag, 06.06.2026",
        location: "Perleberg, Brandenburg",
        coordinates: "53.0736° N, 11.8558° E",
        description: "Die letzte Etappe führt dich durch Sachsen-Anhalt nach Brandenburg. Du wechselst von der Autobahn auf Bundesstraßen und genießt die flache Landschaft der Prignitz.",
        route: {
          distance: "150 km",
          duration: "2:15 - 2:45 h",
          details: "A14 Richtung Magdeburg → B189 Richtung Stendal → Wittenberge → Perleberg",
          trafficNotes: "Achte auf Wildwechsel in den Waldgebieten"
        },
        campsites: [
          {
            name: "Stellplatz Perleberg",
            rating: 4.2,
            price: "€10 - €15",
            amenities: ["V+E", "Strom", "Zentral gelegen"],
            location: "Nah am Stadtzentrum",
            dogFriendly: true
          }
        ],
        activities: [
          {
            name: "Tangermünde",
            type: "Kultur",
            icon: Camera,
            description: "Wunderschöne Backsteingotik-Stadt an der Elbe. Großer Hafenparkplatz.",
            suitableForLargeVehicles: true
          },
          {
            name: "Elbbrücke Wittenberge",
            type: "Aussicht",
            icon: Camera,
            description: "Das Tor zur Prignitz - spektakuläre Flussüberquerung.",
            suitableForLargeVehicles: true
          },
          {
            name: "Perleberg Altstadt",
            type: "Kultur",
            icon: Camera,
            description: "Historischer Stadtkern mit Roland-Statue.",
            dogFriendly: true
          }
        ],
        food: [
          {
            name: "Ratskeller Perleberg",
            type: "Regional",
            recommendation: "Brandenburgische Spezialitäten",
            price: "€€",
            dogFriendly: true
          }
        ],
        travelTips: [
          "B189 ist gut ausgebaut, aber Wildwechsel beachten",
          "Elbe-Überquerung in Wittenberge ist ein Highlight",
          "Perleberg bietet schöne Altstadt für den Abschluss"
        ]
      }
    ],
    
    tips: {
      navigation: [
        "Nutze Waze/Google Maps für Live-Traffic, aber prüfe gegen Lkw-Restriktionen",
        "Apps wie CoPilot GPS oder Sygic Truck für Höhen/Gewichts-Eingabe",
        "ADAC TruckService Nummer speichern für Pannenhilfe >3,5t"
      ],
      wasteManagement: [
        "Clesana-Beutel dürfen im normalen Restmüll entsorgt werden",
        "Suche nach großen Müllcontainern an Raststätten",
        "Keine Entsorgungsstationen nötig"
      ],
      refueling: [
        "Tanke in Thüringen/Sachsen-Anhalt (oft günstiger als BaWü)",
        "Autohöfe bevorzugen (z.B. Autohof Bad Kissingen)",
        "High-Speed-Pistole vorsichtig nutzen"
      ],
      shopping: [
        "Hammelburg und Bernburg haben große Supermärkte mit Lkw-Parkplätzen",
        "Achte auf Höhenbegrenzungen bei Einfahrten"
      ],
      sustainability: [
        "Slow Travel (Tempo 90-100) spart massiv Sprit",
        "Nutze deine 600W Solaranlage - kein Landstrom nötig",
        "Vermeide unnötige Leerfahrten"
      ],
      equipmentChecklist: [
        "Fahrzeugschein (für Gewichtskontrollen)",
        "Ausreichend Folienliner für Clesana",
        "Wasserschlauch & Gießkanne",
        "Auffahrkeile (Heavy Duty für 5,5t)"
      ],
      recommendedApps: [
        "Park4Night (Filter: >7m Länge)",
        "Promobil Stellplatz-Radar",
        "Mehr-Tanken (Dieselpreise)",
        "Landvergnügen (Bauernhof-Stellplätze)"
      ]
    },
    
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d260416.30500000003!2d9.6856!3d47.5475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDMzJzE4LjQiTiA5wrM0MCc0MC4wIkU!5e0!3m2!1sen!2sde!4v1234567890"
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Info className="h-4 w-4" />
          KI-Beispielroute anzeigen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <RouteIcon className="h-6 w-6 text-primary" />
            KI-Beispielroute: {exampleRoute.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Header mit Routeninfo */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-primary flex items-center gap-3">
                  <Map className="h-5 w-5" />
                  {exampleRoute.title}
                </h2>
                <p className="text-muted-foreground mt-1">{exampleRoute.subtitle}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {exampleRoute.duration}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <RouteIcon className="h-3 w-3" /> {exampleRoute.distance}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CarFront className="h-3 w-3" /> {exampleRoute.vehicle}
                </Badge>
              </div>
            </div>
            
            {/* Wichtige Hinweise */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {exampleRoute.importantNotes.map((note, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <note.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        {note.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {note.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs für verschiedene Ansichten */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-4">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="itinerary">Reiseplan</TabsTrigger>
              <TabsTrigger value="tips">Tipps</TabsTrigger>
              <TabsTrigger value="vehicle">Fahrzeuginfo</TabsTrigger>
            </TabsList>

            {/* Übersicht Tab */}
            <TabsContent value="overview">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Compass className="h-5 w-5 text-primary" />
                    Routenbeschreibung
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {exampleRoute.overview.description}
                  </p>
                  
                  <div className="bg-secondary/5 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      Routenstrategie
                    </h4>
                    <p className="text-sm mb-3">{exampleRoute.overview.routeStrategy}</p>
                    
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      Highlights
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {exampleRoute.overview.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" />
                    Kartenansicht
                  </h3>
                  <div className="aspect-video rounded-lg overflow-hidden border">
                    <iframe
                      src={exampleRoute.mapEmbed}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Reiseplan Tab */}
            <TabsContent value="itinerary">
              <div className="space-y-6">
                {exampleRoute.days.map((day, dayIndex) => (
                  <Accordion key={dayIndex} type="single" collapsible>
                    <AccordionItem value={`day-${dayIndex}`}>
                      <AccordionTrigger className="bg-primary/5 hover:bg-primary/10 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-4 w-full">
                          <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold">
                            {day.day}
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-medium">{day.title}</h3>
                            <p className="text-sm text-muted-foreground">{day.location}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <RouteIcon className="h-4 w-4" />
                            {day.route.distance} • {day.route.duration}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-6">
                          {/* Routeninformationen */}
                          <div className="bg-secondary/5 rounded-lg p-4">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <RouteIcon className="h-5 w-5 text-primary" />
                              Routeninformationen
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Distanz:</span>
                                <span>{day.route.distance}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Dauer:</span>
                                <span>{day.route.duration}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Route:</span>
                                <span>{day.route.details}</span>
                              </div>
                              {day.route.trafficNotes && (
                                <div className="mt-2 p-2 bg-yellow-50 rounded">
                                  <span className="text-yellow-600 text-xs font-medium">Verkehrshinweis:</span>
                                  <p className="text-xs text-yellow-700 mt-1">{day.route.trafficNotes}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Campingplätze */}
                          <div className="space-y-4">
                            <h4 className="font-medium flex items-center gap-2">
                              <Tent className="h-5 w-5 text-primary" />
                              Übernachtungsmöglichkeiten
                            </h4>
                            {day.campsites.map((campsite, i) => (
                              <div key={i} className="bg-white p-4 rounded-lg border">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-medium">{campsite.name}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs flex items-center gap-1">
                                        <Star className="h-3 w-3" /> {campsite.rating}/5
                                      </span>
                                      <span className="text-sm font-medium">{campsite.price}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{campsite.location}</p>
                                  </div>
                                  {campsite.dogFriendly && (
                                    <div className="bg-green-50 p-1 rounded-full">
                                      <Dog className="h-4 w-4 text-green-600" />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {campsite.amenities.map((amenity, j) => (
                                    <Badge key={j} variant="outline" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                </div>
                                
                                {campsite.notes && (
                                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                    <Info className="h-3 w-3" /> {campsite.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Aktivitäten */}
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Activity className="h-5 w-5 text-primary" />
                              Aktivitäten
                            </h4>
                            <div className="space-y-3">
                              {day.activities.map((activity, i) => {
                                const ActivityIcon = activity.icon;
                                return (
                                  <div key={i} className="flex gap-3">
                                    <div className="bg-primary/10 p-2 rounded-lg">
                                      <ActivityIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-medium text-sm flex items-center gap-2">
                                        {activity.name}
                                        {activity.dogFriendly && <Dog className="h-3 w-3 text-green-600" />}
                                        {activity.suitableForLargeVehicles && <CarFront className="h-3 w-3 text-blue-600" />}
                                      </h5>
                                      <p className="text-xs text-muted-foreground">{activity.type}</p>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {activity.description}
                                      </p>
                                      {activity.parkingNote && (
                                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                          <Info className="h-3 w-3" /> {activity.parkingNote}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Essen & Trinken */}
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Utensils className="h-5 w-5 text-primary" />
                              Essen & Trinken
                            </h4>
                            <div className="space-y-3">
                              {day.food.map((food, i) => (
                                <div key={i} className="flex gap-3">
                                  <div className="bg-secondary/10 p-2 rounded-lg">
                                    <Utensils className="h-5 w-5 text-secondary" />
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-sm flex items-center gap-2">
                                      {food.name}
                                      {food.dogFriendly && <Dog className="h-3 w-3 text-green-600" />}
                                    </h5>
                                    <p className="text-xs text-muted-foreground">{food.type} • {food.price}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {food.recommendation}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Reise-Tipps */}
                          <div className="bg-secondary/5 rounded-lg p-4">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Compass className="h-5 w-5 text-primary" />
                              Reise-Tipps
                            </h4>
                            <ul className="space-y-2 text-sm">
                              {day.travelTips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            </TabsContent>

            {/* Tipps Tab */}
            <TabsContent value="tips">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    Navigation
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {exampleRoute.tips.navigation.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-primary" />
                    Abfallmanagement
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {exampleRoute.tips.wasteManagement.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-primary" />
                    Tankstellen
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {exampleRoute.tips.refueling.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Einkaufen
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {exampleRoute.tips.shopping.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Nachhaltigkeit
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {exampleRoute.tips.sustainability.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Ausrüstung
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {exampleRoute.tips.equipmentChecklist.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    Empfohlene Apps
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {exampleRoute.tips.recommendedApps.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Fahrzeuginfo Tab */}
            <TabsContent value="vehicle">
              <div className="space-y-6">
                <div className="bg-secondary/5 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-3">
                    <CarFront className="h-6 w-6" />
                    Fahrzeuginformationen
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="bg-primary/10 inline-block p-3 rounded-lg mb-2">
                        <Scale className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Gewicht</p>
                      <p className="font-bold">{exampleRoute.vehicleInfo.weight}</p>
                    </div>
                    <div>
                      <div className="bg-primary/10 inline-block p-3 rounded-lg mb-2">
                        <Ruler className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Höhe</p>
                      <p className="font-bold">{exampleRoute.vehicleInfo.height}</p>
                    </div>
                    <div>
                      <div className="bg-primary/10 inline-block p-3 rounded-lg mb-2">
                        <Gauge className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Länge</p>
                      <p className="font-bold">{exampleRoute.vehicleInfo.length}</p>
                    </div>
                    <div>
                      <div className="bg-primary/10 inline-block p-3 rounded-lg mb-2">
                        <BatteryFull className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Autarkie</p>
                      <p className="font-bold text-xs">{exampleRoute.vehicleInfo.autonomy}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <RouteIcon className="h-5 w-5 text-primary" />
                    Geschwindigkeitsbegrenzungen
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(exampleRoute.vehicleInfo.speedLimits).map(([road, limit]) => (
                      <div key={road} className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <RouteIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{road}</p>
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-primary">{limit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Wichtige Hinweise für schwere Wohnmobile
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span><strong>Überholverbote:</strong> Zeichen 277 (Lkw-Überholverbot) gilt oft auch für Wohnmobile {'>'}3,5t</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span><strong>Brückenhöhen:</strong> Besonders in kleinen Ortschaften und bei Tankstellen prüfen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span><strong>Navigationssystem:</strong> Immer auf Lkw/Camper-Maße einstellen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span><strong>Pannendienst:</strong> ADAC TruckService für Fahrzeuge {'>'}3,5t nutzen</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Aktionsbuttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button onClick={copyToClipboard} variant="outline" size="lg" className="gap-2 min-h-[48px] px-6 py-3">
              {showSuccess ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              {showSuccess ? 'Kopiert!' : 'Beispielroute kopieren'}
            </Button>
            
            <Button variant="outline" size="lg" className="gap-2 min-h-[48px] px-6 py-3">
              <Printer className="h-5 w-5" />
              Drucken / Als PDF speichern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}