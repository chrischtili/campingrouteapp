# Deployment-Anleitung: campingroute_app (inkl. Entdecken) – Online-Betrieb

Dieses Dokument beschreibt, wie die vollständige Plattform auf einem Server betrieben wird.
Alles liegt in **einem Repo** (`campingroute_app`); das Entdecken-Backend liegt als Unterordner
`entdecken-backend/`. Es laufen **zwei Dienste** und **Nginx**:

```
Browser → https://campingroute.app/entdecken
   → Nginx (SSL)
     → /api/*          → campingroute-app-server (Port 3002)
     → /discover/*     → campingroute-app-server (3002) → /discover → entdecken-backend (3000)
     → statische Dateien → dist/
```

---

## Architektur

| Dienst | Port | Zweck | Ordner |
|---|---|---|---|
| **campingroute-app-server** | 3002 | Webseite (dist/), Finder-APIs, `/api/*`, `/discover`-Weiterleitung | `route-planner-pro/` |
| **entdecken-backend** | 3000 | KI-Suche (Entdecken), **keine Server-KI-Keys** (BYOK) | `route-planner-pro/entdecken-backend/` |

> Es gibt **kein** separates entdecken-Frontend mehr – die Entdecken-Seite ist in `campingroute_app` gebündelt.

---

## 1. Dateien auf den Server bringen

> Die großen Daten-Dateien sind **nicht in Git** und müssen manuell übertragen werden.

```bash
# komplettes Repo (ohne node_modules/dist; entdecken-backend kommt mit)
rsync -av --exclude node_modules --exclude dist . kopi@SERVER:/home/kopi/route-planner-pro/

# Große Daten-Dateien (nicht in Git):
scp places.sqlite place-index.json kopi@SERVER:/home/kopi/route-planner-pro/
scp entdecken-backend/campingroute_eu.db kopi@SERVER:/home/kopi/route-planner-pro/entdecken-backend/
```

---

## 2. campingroute_app bauen + Dienst

```bash
cd /home/kopi/route-planner-pro
npm install
npm run build          # → dist/
```

`/etc/systemd/system/campingroute.service`:
```ini
[Unit]
Description=CampingRoute.app
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/kopi/route-planner-pro
ExecStart=/usr/bin/node /home/kopi/route-planner-pro/server/index.cjs
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3002
Environment=HOST=0.0.0.0
Environment=DISCOVER_PORT=3000
Environment=DIST_DIR=/home/kopi/route-planner-pro/dist
Environment=GEOAPIFY_API_KEY=DEIN-GEOAPIFY-KEY
Environment=VITE_GEOAPIFY_MAPS_API_KEY=DEIN-GEOAPIFY-MAP-KEY
Environment=PLACE_DATABASE_PATH=/home/kopi/route-planner-pro/places.sqlite
Environment=PLACE_INDEX_PATH=/home/kopi/route-planner-pro/place-index.json

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now campingroute
curl http://localhost:3002/health
```

---

## 3. entdecken-Backend bauen + Dienst

```bash
cd /home/kopi/route-planner-pro/entdecken-backend
npm install
npm run build          # tsc → dist/
```

> **Keine `.env`, keine KI-Keys im Dienst.** Die Nutzer liefern ihren eigenen Key über das KI-Einstellungs-Panel (BYOK). Ohne Key: klare Queries deterministisch (0 €), unklare Queries → Keyword-Fallback.

`/etc/systemd/system/entdecken.service`:
```ini
[Unit]
Description=Entdecken Backend (KI-Suche)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/kopi/route-planner-pro/entdecken-backend
ExecStart=/usr/bin/node /home/kopi/route-planner-pro/entdecken-backend/dist/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now entdecken
curl http://localhost:3000/
# → {"name":"CampingRoute API","status":"online",...}
```

---

## 4. Nginx (Domain + SSL)

`/etc/nginx/sites-available/campingroute`:
```nginx
server {
  listen 80;
  server_name campingroute.app www.campingroute.app;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name campingroute.app www.campingroute.app;

  ssl_certificate     /etc/letsencrypt/live/campingroute.app/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/campingroute.app/privkey.pem;

  root /home/kopi/route-planner-pro/dist;

  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3002;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 300s;
  }
  location /discover/ {
    proxy_pass http://127.0.0.1:3002;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 300s;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
# SSL alternativ per certbot: sudo certbot --nginx -d campingroute.app -d www.campingroute.app
```

---

## 5. Testen

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://campingroute.app/entdecken
curl -s "https://campingroute.app/discover/api/search?q=Camping%20in%20Bayern&limit=1"   # {"total":948,...}
curl -s "https://campingroute.app/discover/api/countries/stats"                          # 21 Länder
```

---

## 6. Daten aktualisieren (Overpass / Wikidata)

Immer, wenn neue Plätze mit Website in OSM auftauchen:

```bash
cd /home/kopi/route-planner-pro/entdecken-backend

# 1) Dienst stoppen (verhindert DB-Locks)
sudo systemctl stop entdecken

# 2) Backup
cp campingroute_eu.db campingroute_eu.db.$(date +%Y%m%d)

# 3) Camping-/Stellplätze (alle 21 Länder, ~30-60 Min.) – im Hintergrund:
nohup npx tsx src/scripts/import-osm.ts > /tmp/import-osm.log 2>&1 &
tail -f /tmp/import-osm.log
# Nur bestimmte Länder:  COUNTRIES=DE,AT,FR npx tsx src/scripts/import-osm.ts

# 4) Sehenswürdigkeiten (Wikidata)
nohup npx tsx src/scripts/import-wikidata.ts > /tmp/import-wikidata.log 2>&1 &

# 5) Datenqualität (Bundesländer, Städte, Preise, Volltext-Index)
npx tsx src/scripts/migrate-data-quality.ts

# 6) Dienst starten + prüfen
sudo systemctl start entdecken
sqlite3 campingroute_eu.db "SELECT COUNT(*) FROM places;"
```

**Eigenschaften:**
- Import nur Plätze **mit Website**; idempotent (keine Duplikate, Abbruch unkritisch).
- Skripte brauchen **keine KI-Keys** – nur Netzwerk zu Overpass/Wikidata.
- `npx tsx` verfügbar, weil `npm install` inkl. Dev-Tools lief; alternativ `node dist/scripts/import-osm.js`.

---

## 7. Wartung / Updates

```bash
# entdecken
cd /home/kopi/route-planner-pro && git pull \
  && (cd entdecken-backend && npm install && npm run build) \
  && npm install && npm run build \
  && sudo systemctl restart campingroute entdecken

# campingroute_app
cd /home/kopi/route-planner-pro && git pull && npm install && npm run build && sudo systemctl restart campingroute
```

**Wichtig:**
- **Entdecken-Seite liegt im Repo** – nur das `entdecken-backend/`-Unterordner wird als eigener Dienst deployed (dist + DB).
- **Keine KI-Keys am Server** – Nutzer-Keys kommen per BYOK-Header aus dem Browser.
- Große Daten-Dateien (`campingroute_eu.db`, `places.sqlite`, `place-index.json`) manuell kopieren (gitignored).
- Beide Dienste binden nur `localhost`; erreichbar ist nur Nginx (443).
