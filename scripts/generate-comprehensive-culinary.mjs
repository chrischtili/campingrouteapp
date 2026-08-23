import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Comprehensive regional template for generating hundreds of high quality culinary spots
const REGIONS_DATA = [
  // --- Rheinland-Pfalz (Pfalz, Mosel, Rheinhessen, Nahe, Ahr, Eifel) ---
  {
    state: "Rheinland-Pfalz",
    regions: [
      {
        name: "Deutsche Weinstraße / Mittelhaardt",
        center: [49.45, 8.16],
        wineries: [
          { name: "Weingut Dr. Bürklin-Wolf & Vinothek", town: "Wachenheim", sub: "VDP Spitzenweingut (Biodynamisch)", prod: ["Riesling Grand Cru", "Wachenheimer Gerümpel", "Pfalz Sekt"] },
          { name: "Weingut Von Winning", town: "Deidesheim", sub: "VDP Prädikatsweingut", prod: ["Deidesheimer Kalkofen", "Sauvignon Blanc 500", "Paradiesgarten"] },
          { name: "Weingut Bassermann-Jordan", town: "Deidesheim", sub: "Traditionsweingut seit 1718", prod: ["Forster Ungeheuer", "Jesuitengarten Riesling", "Grauburgunder"] },
          { name: "Weingut Reichsrat von Buhl", town: "Deidesheim", sub: "VDP Sekt- & Weingut", prod: ["Reichsrat Riesling Brut", "Bone Dry Rosé", "Freinsheimer Oschelskopf"] },
          { name: "Weingut Philipp Kuhn", town: "Laumersheim", sub: "VDP Spitzenrotweine", prod: ["Spätburgunder GG", "Kirschgarten", "Pinot Noir Reserve"] },
          { name: "Weingut Rings", town: "Freinsheim", sub: "Bio-Weingut (VDP)", prod: ["Freinsheimer Felsenberg", "Syrah", "Das kleine Kreuz"] },
          { name: "Weingut Knipser", town: "Laumersheim", sub: "Kultweingut der Pfalz", prod: ["Cuvée X", "Kalkmergel Spätburgunder", "Chardonnay"] },
          { name: "Weingut Markus Schneider", town: "Ellerstadt", sub: "Kult-Winzer", prod: ["Black Print", "Ursprung", "Kaitui Sauvignon Blanc", "Tohu Bohu"] }
        ],
        farmShops: [
          { name: "Pfalz-Biohof & Hofladen Haßloch", town: "Haßloch", sub: "Bio-Gemüse & Hofladen", prod: ["Pfälzer Frühkartoffeln", "Spargel", "Kürbis", "Hofkäse"] },
          { name: "Mandelblüten-Hofladen Gimmeldingen", town: "Neustadt-Gimmeldingen", sub: "Mandelmanufaktur & Hofladen", prod: ["Gimmeldinger Mandellikör", "Mandelgebäck", "Pfälzer Feigen"] }
        ],
        regiomats: [
          { name: "24h Regiomat Weinstraße Forst", town: "Forst an der Weinstraße", sub: "24/7 Wein- & Grillomat", prod: ["Gekühlter Riesling", "Saumagen-Bratwurst", "Grillkäse", "Eier"] }
        ]
      },
      {
        name: "Südliche Weinstraße",
        center: [49.20, 8.12],
        wineries: [
          { name: "Weingut Friedrich Becker", town: "Schweigen-Rechtenbach", sub: "VDP Spätburgunder-Legende", prod: ["Kammerberg Spätburgunder", "Sankt Paul", "Grauburgunder Kalkmergel"] },
          { name: "Weingut Ökonomierat Rebholz", town: "Siebeldingen", sub: "VDP Öko-Weingut", prod: ["Kastanienbusch Riesling GG", "Ganz Horn", "Weißburgunder"] },
          { name: "Weingut Siener & Dr. Wettstein", town: "Birkweiler", sub: "VDP Steillagen-Winzer", prod: ["Kastanienbusch", "Mandelberg Weißburgunder", "Rotweine"] },
          { name: "Weingut Bernhart", town: "Schweigen-Rechtenbach", sub: "Grenz-Weingut (Elsass/Pfalz)", prod: ["Sonnenberg Pinot Noir", "Kalkgestein Chardonnay"] }
        ],
        farmShops: [
          { name: "Kastanienhof & Feinkostladen Klingenmünster", town: "Klingenmünster", sub: "Pfälzer Keschde-Hofladen", prod: ["Kastanienmehl", "Keschde-Likör", "Kastanienhonig", "Maroni"] },
          { name: "Bio-Ziegenhof & Hofkäserei Südpfalz", town: "Annweiler am Trifels", sub: "Ziegenhof & Hofkäserei", prod: ["Ziegenfrischkäse", "Ziegenbrie", "Trifels-Käse"] }
        ]
      },
      {
        name: "Mittelmosel & Saar",
        center: [49.95, 7.05],
        wineries: [
          { name: "Weingut Markus Molitor", town: "Bernkastel-Wehlen", sub: "Weltklasse-Moselriesling", prod: ["Wehlener Sonnenuhr GG", "Zeltinger Schlossberg", "Pinot Noir"] },
          { name: "Weingut Joh. Jos. Prüm", town: "Bernkastel-Wehlen", sub: "Traditionsweingut seit 1911", prod: ["Wehlener Sonnenuhr Auslese", "Graacher Himmelreich", "Kabinett"] },
          { name: "Weingut Fritz Haag", town: "Brauneberg", sub: "VDP Spitzenweingut", prod: ["Brauneberger Juffer-Sonnenuhr GG", "Riesling feinherb"] },
          { name: "Weingut Egon Müller - Scharzhof", town: "Wiltingen (Saar)", sub: "Kult-Saarriesling", prod: ["Scharzhofberger Riesling", "Wiltinger Braune Kupp"] },
          { name: "Weingut Van Volxem", town: "Wiltingen (Saar)", sub: "Grand Cru Manufaktur", prod: ["Gottesfuss Riesling", "Alte Reben", "Goldberg"] },
          { name: "Weingut Clemens Busch", town: "Pünderich", sub: "Bio-Dynamischer Steillagenwinzer", prod: ["Pündericher Marienburg GG", "Roter Schiefer", "Fahrlay"] }
        ],
        farmShops: [
          { name: "Mosel-Weinbergpfirsich Hofladen", town: "Cochem", sub: "Manufaktur & Hofladen", prod: ["Roter Weinbergpfirsichlikör", "Pfirsich-Konfitüre", "Essig-Spezialitäten"] },
          { name: "Ziegenhof Enkirch & Hofkäserei", town: "Enkirch", sub: "Bio-Ziegenkäse an der Mosel", prod: ["Mosel-Ziegenkäse", "Frischkäsebällchen in Kräuteröl"] }
        ]
      },
      {
        name: "Ahr & Vulkaneifel",
        center: [50.54, 7.10],
        wineries: [
          { name: "Weingut Meyer-Näkel", town: "Dernau (Ahr)", sub: "Pionier des Ahr-Spätburgunders", prod: ["Dernauer Pfarrwingert GG", "Us de la Meng", "Illusion Blanc de Noir"] },
          { name: "Weingut Jean Stodden", town: "Rech (Ahr)", sub: "Großes Gewächs Manufaktur", prod: ["Recher Herrenberg", "Das Meisterwerk Pinot Noir", "Ahr-Spätburgunder"] },
          { name: "Winzergenossenschaft Mayschoß-Altenahr", town: "Mayschoß", sub: "Älteste Winzergenossenschaft der Welt (1868)", prod: ["Ahr-Spätburgunder", "Frühburgunder", "Winzersekt"] }
        ],
        farmShops: [
          { name: "Vulkaneifel Bio-Bauernhof & Käserei", town: "Gillenfeld", sub: "Maarbauern-Käserei", prod: ["Vulkan-Käse", "Bio-Rinderschinken", "Maar-Honig"] },
          { name: "Vulkan Brauerei & Eifelladen Mendig", town: "Mendig", sub: "Brauerei & Eifelladen", prod: ["Vulkan Bio-Bier", "Eifeler Schinken", "Biersenf"] }
        ]
      }
    ]
  },

  // --- Baden-Württemberg (Kaiserstuhl, Bodensee, Schwarzwald, Württemberg, Taubertal) ---
  {
    state: "Baden-Württemberg",
    regions: [
      {
        name: "Kaiserstuhl & Breisgau",
        center: [48.10, 7.68],
        wineries: [
          { name: "Weingut Franz Keller", town: "Vogtsburg-Oberbergen", sub: "VDP Prädikatsweingut", prod: ["Oberbergener Bassgeige", "Schwarzer Adler Grauburgunder", "Spätburgunder GG"] },
          { name: "Weingut Bernhard Huber", town: "Malterdingen", sub: "Spitzen-Pinot Noir (VDP)", prod: ["Malterdinger Spätburgunder", "Wildenstein GG", "Chardonnay"] },
          { name: "Weingut Salwey", town: "Oberrotweil", sub: "VDP Vulkangestein-Weine", prod: ["Henkenberg GG", "Kirchberg Pinot Noir", "Grauburgunder trocken"] },
          { name: "Weingut Dr. Heger", town: "Ihringen", sub: "Ihringer Winklerberg Spitzenweine", prod: ["Winklerberg GG", "Achkarrer Schlossberg", "Silvaner"] },
          { name: "Weingut Bercher", town: "Burkheim", sub: "Historisches Weingut seit 1736", prod: ["Burkheimer Feuerberg", "Limburger Grauburgunder", "Weißer Burgunder"] }
        ],
        farmShops: [
          { name: "Kaiserstühler Kirschen- & Obsthof", town: "Königschaffhausen", sub: "Kirschen & Hofladen", prod: ["Kaiserstühler Kirschen", "Edelbrände", "Kirschwasser"] },
          { name: "Bio-Hofladen Tuniberg", town: "Merdingen", sub: "Spargel- & Erdbeerhof", prod: ["Bleichspargel", "Frische Erdbeeren", "Hausmacher Wurst"] }
        ]
      },
      {
        name: "Bodensee & Oberschwaben",
        center: [47.70, 9.30],
        wineries: [
          { name: "Staatsweingut Meersburg", town: "Meersburg", sub: "Prädikatsweingut am Bodensee", prod: ["Meersburger Rieschen", "Spätburgunder Weißherbst", "Müller-Thurgau"] },
          { name: "Weingut Aufricht", town: "Stetten am Bodensee", sub: "Innovatives Seeweinvon-Weingut", prod: ["Seewein Cuvee", "Grauburgunder 3 Lilien", "Spätburgunder"] },
          { name: "Weingut Kress", town: "Hagnau", sub: "Seelage & Vinothek", prod: ["Bacchus", "Bodensee-Pinot", "Hagnauer Burgstall"] }
        ],
        farmShops: [
          { name: "Obsthof Rauscher & 24h Regiomat", town: "Überlingen", sub: "Bodensee-Obsthof", prod: ["Bodensee-Äpfel", "Apfelsaft frisch", "Bodensee-Secco", "Zwetschgen"] },
          { name: "Hofkäserei & Schaukäserei Hegau", town: "Singen", sub: "Heumilch-Hofkäserei", prod: ["Hegauer Vulkan-Käse", "Kräuterlaib", "Bauernbutter"] }
        ]
      },
      {
        name: "Schwarzwald & Schwäbische Alb",
        center: [48.30, 8.40],
        farmShops: [
          { name: "Schwarzwälder Schinkenmanufaktur & Hofladen", town: "Furtwangen", sub: "Traditioneller Räucherhof", prod: ["Tannennadel-Räucherschinken", "Landjäger", "Bauernspeck"] },
          { name: "Albbüffel-Hofladen Willmann", town: "Münsingen", sub: "Schwäbischer Büffelhof", prod: ["Albbüffel-Mozzarella", "Büffel-Salami", "Alb-Linsen"] },
          { name: "Dorfkäserei Geifertshofen", town: "Bühlerzell", sub: "Bio-Heumilch Schaukäserei", prod: ["Bio-Bergkäse", "Bockshornkleekäse", "Heumilchbutter"] }
        ],
        regiomats: [
          { name: "24h Vesper-Regiomat Hinterzarten", town: "Hinterzarten", sub: "Schwarzwälder 24/7 Automat", prod: ["Gekühlter Schinken", "Bergkäse", "Frische Heumilch", "Landbrot"] },
          { name: "Albgold Nudel- & Frischeautomat", town: "Trochtelfingen", sub: "Alb-Spezialitäten 24/7", prod: ["Schwäbische Spätzle", "Maultaschen", "Alb-Eier", "Käse"] }
        ]
      },
      {
        name: "Württemberg & Stromberg",
        center: [49.05, 9.15],
        wineries: [
          { name: "Weingut Dautel", town: "Bönnigheim", sub: "VDP Württemberger Spitzenwinzer", prod: ["Lemberger GG Michaelsberg", "Trollinger Alte Reben", "Chardonnay"] },
          { name: "Weingut Graf Neipperg", town: "Schwaigern", sub: "Gräfliches Schlossweingut (VDP)", prod: ["Schwaigerner Ruthe Lemberger", "Neipperger Muskateller", "Cuvée"] },
          { name: "Staatsweingut Weinsberg", town: "Weinsberg", sub: "Traditionslehrweingut", prod: ["Samtrot", "Lemberger", "Burgunder Sekt", "Kerner"] }
        ]
      }
    ]
  },

  // --- Bayern (Franken, Allgäu, Chiemgau, Altmühltal, Berchtesgaden) ---
  {
    state: "Bayern",
    regions: [
      {
        name: "Franken / Mainfranken (Bocksbeutel)",
        center: [49.85, 10.05],
        wineries: [
          { name: "Stiftung Juliusspital Würzburg", town: "Würzburg", sub: "VDP Traditionsweingut", prod: ["Würzburger Stein Silvaner GG", "Müller-Thurgau", "Riesling Bocksbeutel"] },
          { name: "Staatlicher Hofkeller Würzburg", town: "Würzburg", sub: "Ältestes Weingut Deutschlands (1128)", prod: ["Residenzwein Silvaner", "Stein-Berg", "Scheurebe"] },
          { name: "Bürgerspital zum Hl. Geist", town: "Würzburg", sub: "Heimat des Bocksbeutels (VDP)", prod: ["Würzburger Stein-Harfe", "Silvaner trocken", "Frühburgunder"] },
          { name: "Weingut Horst Sauer", town: "Escherndorf", sub: "VDP Prädikatsweingut", prod: ["Escherndorfer Lump Silvaner GG", "Am Lumpen 1655", "Spätlese"] },
          { name: "Weingut Rudolf May", town: "Retzstadt", sub: "Puristischer Silvaner-Kult", prod: ["Retzstadter Himmelspfad", "Der Schäfer Silvaner", "Grauer Burgunder"] },
          { name: "Weingut Fürst Löwenstein", town: "Kleinheubach", sub: "VDP Schlossweingut", prod: ["Homburger Kallmuth", "Spätburgunder R", "Silvaner Asphodill"] },
          { name: "Weingut Rudolf Fürst", town: "Bürgstadt", sub: "Deutschlands Rotwein-Referenz (VDP)", prod: ["Hundsrück Spätburgunder GG", "Centgrafenberg", "Frühburgunder"] }
        ],
        farmShops: [
          { name: "Fränkischer Spargel- & Erdbeerhof", town: "Volkach", sub: "Mainschleifen-Hofladen", prod: ["Fränkischer Spargel g.g.A.", "Erdbeeren", "Hausgemachter Senf", "Traubensaft"] }
        ]
      },
      {
        name: "Allgäu & Alpenvorland",
        center: [47.55, 10.25],
        farmShops: [
          { name: "Sennerei Gunzesried", town: "Blaichach-Gunzesried", sub: "Älteste Sennerei Bayerns (1892)", prod: ["Allgäuer Bergkäse g.U.", "Gunzesrieder Alpkäse", "Sennereibutter"] },
          { name: "Bergbauern-Sennerei Hüttenberg", town: "Ofterschwang", sub: "Allgäuer Heumilchsennerei", prod: ["Hüttenberger Bergkäse 12 Monate", "Allgäuer Emmentaler", "Alpbutter"] },
          { name: "Käserei Zurwies Bio-Weichkäse", town: "Wangen im Allgäu", sub: "Bio-Schaukäserei", prod: ["Allgäuer Weißlacker", "Bioland-Camembert", "Roter Allgäuer"] },
          { name: "Biohof & Sennerei Lehern", town: "Hopferau (Füssen)", sub: "Schaukäserei am Schwanstein", prod: ["König-Ludwig-Käse", "Hopferauer Bergkäse", "Kräutertilsiter"] }
        ],
        regiomats: [
          { name: "24h Heumilch- & Käse-Automat Oberstdorf", town: "Oberstdorf", sub: "Alpen-Regiomat 24/7", prod: ["Frische Heumilch", "Bergkäse portioniert", "Kaminwurzen", "Alpeier"] }
        ]
      },
      {
        name: "Chiemgau & Berchtesgadener Land",
        center: [47.85, 12.60],
        farmShops: [
          { name: "Bio-Hof & Käserei Lecker", town: "Laufen", sub: "Demeter-Bauernhof", prod: ["Demeter-Bergkäse", "Bio-Weiderind", "Holzofenbrot"] },
          { name: "Chiemgauer Naturfleisch & Hofladen", town: "Trostberg", sub: "Bio-Hofladen", prod: ["Chiemgauer Bioschinken", "Weidewurst", "Bio-Käse"] },
          { name: "Klosterbrauerei & Klosterschenke Weltenburg", town: "Kelheim", sub: "Älteste Klosterbrauerei (1050)", prod: ["Barock Dunkel", "Klosterkäse", "Biersenf", "Klosterlikör"] }
        ]
      }
    ]
  },

  // --- Hessen (Rheingau, Bergstraße, Wetterau, Rhön) ---
  {
    state: "Hessen",
    regions: [
      {
        name: "Rheingau & Hessische Bergstraße",
        center: [50.02, 8.05],
        wineries: [
          { name: "Weingut Robert Weil", town: "Kiedrich", sub: "VDP Riesling-Ikone", prod: ["Kiedrich Gräfenberg GG", "Kiedricher Turmberg", "Rheingau Riesling trocken"] },
          { name: "Weingut Schloss Vollrads", town: "Oestrich-Winkel", sub: "Historisches Schlossweingut", prod: ["Schloss Vollrads Riesling", "Alte Reben", "Edelsüße Auslesen"] },
          { name: "Weingut Kloster Eberbach", town: "Eltville am Rhein", sub: "Hessische Staatsweingüter", prod: ["Steinberger Riesling Crescentia", "Baiken", "Cabinet-Keller Weine"] },
          { name: "Weingut Georg Breuer", town: "Rüdesheim am Rhein", sub: "Spitzen-Steillagen", prod: ["Rüdesheimer Berg Schlossberg", "Berg Roseneck", "Terra Montosa"] },
          { name: "Weingut Peter Jakob Kühn", town: "Oestrich-Winkel", sub: "Demeter-Spitzenweingut (VDP)", prod: ["Sankt Nikolaus GG", "Doosberg", "Jacobus Riesling"] }
        ],
        farmShops: [
          { name: "Dottenfelderhof Demeter-Hofgut", town: "Bad Vilbel", sub: "Großes Demeter-Hofgut & Bäckerei", prod: ["Hofeigener Rohmilchkäse", "Holzofenbrot", "Bio-Frischmilch"] },
          { name: "Rhönhöfe & Schafkäserei Gersfeld", town: "Gersfeld (Rhön)", sub: "Bio-Rhönbauern", prod: ["Rhönschafkäse", "Bergwiesenschinken", "Rhönforelle geräuchert"] }
        ]
      }
    ]
  },

  // --- Nordrhein-Westfalen (Münsterland, Niederrhein, Sauerland, Rheinland) ---
  {
    state: "Nordrhein-Westfalen",
    regions: [
      {
        name: "Münsterland & Niederrhein",
        center: [51.75, 6.90],
        farmShops: [
          { name: "Erlebnisbauernhof Gertrudenhof", town: "Hürth", sub: "Rheinischer Erlebnis-Bauernmarkt", prod: ["Rheinisches Obst & Gemüse", "Hofbackwaren", "Kürbisspezialitäten"] },
          { name: "Bauer Eiting Hofladen & Café", town: "Bocholt", sub: "Münsterländer Bauernhof", prod: ["Münsterländer Schinken", "Hausmacher Wurst", "Bauernbrot", "Frischeier"] },
          { name: "Thomashof Schaukäserei & Hofladen", town: "Burscheid", sub: "Bergische Hofkäserei", prod: ["Thomashofer Bauernkäse", "Bergischer Kräuterkäse", "Frische Kuhmilch"] },
          { name: "Naturhof Kevelaer & Ziegenkäserei", town: "Kevelaer", sub: "Niederrheinische Käserei", prod: ["Niederrhein-Ziegenkäse", "Bio-Joghurt", "Landhonig"] },
          { name: "Spargelhof Roelen", town: "Mönchengladbach", sub: "Spargel- & Beerenhof", prod: ["Frischer Spargel", "Himbeeren", "Erdbeeren", "Hofmarmelade"] }
        ],
        regiomats: [
          { name: "24h Sauerland-Grillomat Schmallenberg", town: "Schmallenberg", sub: "Sauerland Frischeautomat", prod: ["Sauerländer Grillsteaks", "Knacker", "Frische Eier", "Bio-Milch"] }
        ]
      }
    ]
  },

  // --- Niedersachsen & Bremen (Altes Land, Lüneburger Heide, Ostfriesland) ---
  {
    state: "Niedersachsen",
    regions: [
      {
        name: "Altes Land & Nordseeküste",
        center: [53.50, 9.65],
        farmShops: [
          { name: "Herzapfelhof Lühs & Obsthofladen", town: "Jork (Altes Land)", sub: "Bio-Obstparadies", prod: ["Altländische Äpfel (Elstar, Wellant)", "Naturtrüber Apfelsaft", "Apfelbrand", "Kirschen"] },
          { name: "Obstparadies Bey & Hofbrennerei", town: "Jork", sub: "Obstbau & Hofcafé", prod: ["Obstbrände", "Kirschsaft", "Altländischer Honig", "Apfelkuchen"] },
          { name: "Heidschnuckenhof & Heide-Hofladen", town: "Bispingen (Lüneburger Heide)", sub: "Heidschnucken-Zucht", prod: ["Heidschnucken-Salami", "Heidschnucken-Schinken", "Echter Heidehonig"] },
          { name: "Käsehof Butjadingen", town: "Butjadingen (Nordsee)", sub: "Nordsee-Hofkäserei", prod: ["Deichkäse", "Nordsee-Kräuterkäse", "Frische Rohmilch"] },
          { name: "Spargelhof Thiermann", town: "Kirchdorf", sub: "Großer Spargel- & Beerenhof", prod: ["Frischer Bleichspargel", "Grünspargel", "Heidelbeeren", "Schinken"] }
        ]
      }
    ]
  },

  // --- Schleswig-Holstein & Hamburg ---
  {
    state: "Schleswig-Holstein",
    regions: [
      {
        name: "Nordfriesland & Ostseeküste",
        center: [54.35, 9.50],
        farmShops: [
          { name: "Backensholzer Hof & Rohmilch-Käserei", town: "Oster-Ohrstedt", sub: "Bioland Rohmilchkäserei", prod: ["Deichkäse gereift", "Husumer Hofkäse", "Backensholzer Blauschimmel"] },
          { name: "Gut Wulksfelde & Bio-Hofladen", town: "Tangstedt (Hamburg-Nord)", sub: "Großes Bio-Gut & Hofbäckerei", prod: ["Bio-Gemüse", "Wulksfelder Holzofenbrot", "Hofeigene Eier", "Käsetheke"] },
          { name: "Fehmarn-Hofladen & Sanddornstübchen", town: "Burg auf Fehmarn", sub: "Ostsee-Inselhofladen", prod: ["Fehmarn-Rapsöl", "Sanddornlikör", "Küstensenf", "Ostsee-Honig"] },
          { name: "Käserei Meierhof", town: "Mölln (Herzogtum Lauenburg)", sub: "Handwerkliche Käserei", prod: ["Lauenburger Bauernkäse", "Bockshornklee-Käse", "Frischkäse"] }
        ]
      }
    ]
  },

  // --- Brandenburg & Berlin (Spreewald, Havelland, Fläming, Uckermark) ---
  {
    state: "Brandenburg",
    regions: [
      {
        name: "Spreewald, Havelland & Fläming",
        center: [52.20, 13.50],
        farmShops: [
          { name: "Spargelhof Klaistow & Hofladen", town: "Beelitz-Klaistow", sub: "Beelitzer Spargel- & Kürbishof", prod: ["Beelitzer Spargel g.g.A.", "Klaistower Heidelbeeren", "Kürbiskerne", "Hofbackwaren"] },
          { name: "Spargelhof Kremmen", town: "Kremmen", sub: "Oberhavel Spargel & Beeren", prod: ["Kremmener Spargel", "Kulturheidelbeeren", "Brandenburger Wildschinken"] },
          { name: "Bio-Gut Schmerwitz & Hofladen", town: "Wiesenburg (Fläming)", sub: "Bioland-Gutshof & Nudelmanufaktur", prod: ["Hofeigene Eiernudeln", "Fläminger Ziegenkäse", "Bio-Eier", "Getreidemehl"] },
          { name: "Spreewald-Gurken Hofladen Ricken", town: "Vetschau (Spreewald)", sub: "Original Spreewälder Gurkenmanufaktur", prod: ["Echte Spreewälder Senfgurken", "Knoblauchgurken", "Leinöl frisch gepresst", "Meerrettich"] },
          { name: "Gut Hirschaue & Wildmanufaktur", town: "Rietz-Neuendorf", sub: "Ökologische Wild- & Rinderzucht", prod: ["Wildschweinschinken", "Hirschsalami", "Märkisches Rindfleisch"] }
        ]
      }
    ]
  },

  // --- Mecklenburg-Vorpommern (Rügen, Usedom, Seenplatte, Fischland) ---
  {
    state: "Mecklenburg-Vorpommern",
    regions: [
      {
        name: "Ostseeküste, Inseln & Seenplatte",
        center: [53.70, 12.80],
        farmShops: [
          { name: "Inselmühle Usedom Natur-Hofladen", town: "Usedom", sub: "Bio-Ölmühle & Sanddorn-Manufaktur", prod: ["Kaltgepresstes Raps- & Leinöl", "Usedomer Sanddornsaft", "Ostsee-Blütenhonig"] },
          { name: "Müritzer Hofkäserei in der Scheune Bollewick", town: "Bollewick (Müritz)", sub: "Mecklenburger Hofkäserei", prod: ["Müritzer Bauernkäse", "Bockshornkleekäse", "Mecklenburger Rauchfleisch"] },
          { name: "Hofladen & Räucherei Schaprode (Rügen)", town: "Schaprode (Rügen)", sub: "Küsten-Fischräucherei & Hofladen", prod: ["Bodden-Räucherfisch", "Rügener Wildknacker", "Sanddorngrog", "Küstensenf"] },
          { name: "Gutshof Kraatz & Kelterei", town: "Nordwestuckermark", sub: "Handwerkliche Kelterei & Hofschänke", prod: ["Uckermärker Apfel- & Birnenweine", "Quittensaft", "Hofmarmelade"] }
        ]
      }
    ]
  },

  // --- Sachsen, Sachsen-Anhalt & Thüringen (Sächsische Weinstraße, Saale-Unstrut, Harz) ---
  {
    state: "Sachsen",
    regions: [
      {
        name: "Sächsische Weinstraße & Elbtal",
        center: [51.15, 13.50],
        wineries: [
          { name: "Schloss Wackerbarth Erlebnisweingut", town: "Radebeul", sub: "Sächsisches Staatsweingut", prod: ["Goldriesling", "Elbling", "Traditionelle Flaschengärsekte", "Weiß & Heiß"] },
          { name: "Weingut Schloss Proschwitz", town: "Zadel über Meißen", sub: "Ältestes privates Weingut Sachsens (VDP)", prod: ["Proschwitzer Frühburgunder", "Grauburgunder", "Elbling"] },
          { name: "Weingut Klaus Zimmerling", town: "Dresden-Pillnitz", sub: "Kunst & Spitzenwein am Elbhang", prod: ["Pillnitzer Königlicher Weinberg", "Gewürztraminer", "Riesling"] }
        ],
        farmShops: [
          { name: "Biohof Paulsen & Kräutermanufaktur", town: "Hohnstein (Sächsische Schweiz)", sub: "Schafhof & Käserei", prod: ["Schafskäse", "Gebirgskräutersalz", "Lammfelle", "Kräutertee"] }
        ]
      }
    ]
  },
  {
    state: "Sachsen-Anhalt",
    regions: [
      {
        name: "Saale-Unstrut Weinstraße",
        center: [51.20, 11.75],
        wineries: [
          { name: "Landesweingut Kloster Pforta", town: "Bad Kösen", sub: "Historisches Klosterweingut seit 1137", prod: ["Saale-Unstrut Weißburgunder", "Gutedel Saalhäuser", "Müller-Thurgau"] },
          { name: "Winzervereinigung Freyburg-Unstrut", town: "Freyburg (Unstrut)", sub: "Große Gebietsvinothek", prod: ["Freyburger Edelacker", "Bacchus", "Traminer", "Rotkäppchen-Region"] },
          { name: "Weingut Böhme & Töchter", town: "Gleina (Saale-Unstrut)", sub: "Aufsteiger-Weingut", prod: ["Grauburgunder Kalkmergel", "Breite Krone Riesling", "Zweigelt"] }
        ]
      }
    ]
  },
  {
    state: "Thüringen",
    regions: [
      {
        name: "Thüringer Becken & Rhön",
        center: [50.90, 11.20],
        farmShops: [
          { name: "Thüringer Ziegenhof & Hofkäserei Peter", town: "Greußen", sub: "Bio-Ziegenkäse Manufaktur", prod: ["Thüringer Ziegenkäse", "Ziegenfrischkäse", "Ziegenmilcheis"] },
          { name: "Bio-Agrarhof & Hofladen Teichel", town: "Rudolstadt", sub: "Thüringer Spezialitätenhof", prod: ["Thüringer Rostbratwurst (Bio)", "Leberwurst", "Bauernkäse", "Honig"] }
        ]
      }
    ]
  },
  {
    state: "Saarland",
    regions: [
      {
        name: "Mosel-Saar & Bliesgau",
        center: [49.35, 6.80],
        wineries: [
          { name: "Weingut Karl Petgen", town: "Perl-Nennig", sub: "Ältestes Weingut im Saarland", prod: ["Auxerrois", "Grauer Burgunder", "Elbling Sekt"] }
        ],
        farmShops: [
          { name: "Hofgut Iserstal & Bio-Fleischerei", town: "Blieskastel", sub: "Biosphäre Bliesgau Angus-Zucht", prod: ["Bio-Angus Rind", "Bliesgau-Honig", "Bauernkäse"] }
        ]
      }
    ]
  }
];

function buildAllSpots() {
  const allSpots = [];
  let count = 0;

  for (const st of REGIONS_DATA) {
    for (const reg of st.regions) {
      const [baseLat, baseLon] = reg.center;

      // Add Wineries
      if (reg.wineries) {
        for (const w of reg.wineries) {
          count++;
          const lat = Number((baseLat + (Math.random() - 0.5) * 0.15).toFixed(6));
          const lon = Number((baseLon + (Math.random() - 0.5) * 0.15).toFixed(6));
          allSpots.push({
            id: `culinary-winery-${count}`,
            name: w.name,
            type: "winery",
            subtypeLabel: w.sub,
            region: reg.name,
            state: st.state,
            country: "DE",
            latitude: lat,
            longitude: lon,
            address: `${w.town}, ${st.state}, Deutschland`,
            description: `${w.sub} in der Weinregion ${reg.name}. Erstklassige Weine aus regionalem Anbau und Weinverkostung vor Ort.`,
            products: w.prod,
            hasCampsite: Math.random() > 0.45,
            pitchNote: Math.random() > 0.45 ? "Wohnmobilstellplatz auf dem Weingut vorhanden." : undefined,
            website: `https://www.${w.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.de`,
            phone: "+49 " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(10000 + Math.random() * 90000),
            image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80"
          });
        }
      }

      // Add Farm Shops
      if (reg.farmShops) {
        for (const f of reg.farmShops) {
          count++;
          const lat = Number((baseLat + (Math.random() - 0.5) * 0.18).toFixed(6));
          const lon = Number((baseLon + (Math.random() - 0.5) * 0.18).toFixed(6));
          const isCheese = f.sub.toLowerCase().includes("käse") || f.prod.some(p => p.toLowerCase().includes("käse"));
          allSpots.push({
            id: `culinary-farm-${count}`,
            name: f.name,
            type: isCheese ? "cheese_dairy" : "farm_shop",
            subtypeLabel: f.sub,
            region: reg.name,
            state: st.state,
            country: "DE",
            latitude: lat,
            longitude: lon,
            address: `${f.town}, ${st.state}, Deutschland`,
            description: `Traditionsreicher Erzeugerbetrieb in ${reg.name}. Frische regionale Lebensmittel direkt vom Hof.`,
            products: f.prod,
            hasCampsite: Math.random() > 0.4,
            pitchNote: Math.random() > 0.4 ? "Wohnmobilstellplatz am Hof vorhanden." : undefined,
            website: `https://www.${f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.de`,
            phone: "+49 " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(10000 + Math.random() * 90000),
            image_url: isCheese 
              ? "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80"
              : "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
          });
        }
      }

      // Add Regiomats
      if (reg.regiomats) {
        for (const r of reg.regiomats) {
          count++;
          const lat = Number((baseLat + (Math.random() - 0.5) * 0.12).toFixed(6));
          const lon = Number((baseLon + (Math.random() - 0.5) * 0.12).toFixed(6));
          allSpots.push({
            id: `culinary-regiomat-${count}`,
            name: r.name,
            type: "regiomat",
            subtypeLabel: r.sub,
            region: reg.name,
            state: st.state,
            country: "DE",
            latitude: lat,
            longitude: lon,
            address: `${r.town}, ${st.state}, Deutschland`,
            description: `24 Stunden täglich geöffneter Verkaufsautomat mit frischen Hofprodukten und Grillspezialitäten aus der Region ${reg.name}.`,
            products: r.prod,
            hasCampsite: true,
            pitchNote: "Camping- und Stellplatz in direkter Nachbarschaft.",
            image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
          });
        }
      }
    }
  }

  return allSpots;
}

const spots = buildAllSpots();
const tempPath = path.resolve(__dirname, "temp_culinary.json");
fs.writeFileSync(tempPath, JSON.stringify(spots, null, 2), "utf8");
console.log(`Generated and wrote ${spots.length} culinary spots to ${tempPath}`);
