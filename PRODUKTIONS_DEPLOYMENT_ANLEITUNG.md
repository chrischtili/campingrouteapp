# 🎯 Produktions-Deployment Anleitung für Route Planner

## Übersicht

Diese Anleitung beschreibt das komplette Deployment der Route Planner Anwendung mit AI Proxy Server auf einem Produktionsserver, der bereits PM2 für andere Dienste (z.B. Statistik-Board auf Port 3001) verwendet.

## Voraussetzungen

### Server
- Ubuntu 20.04/22.04 LTS
- Node.js v18+
- PM2 (bereits installiert und läuft)
- Nginx (bereits installiert und konfiguriert)
- Git

### Bestehende Dienste
- Statistik-Board läuft auf Port 3001
- PM2 ist bereits für andere Prozesse konfiguriert

### Domain
- `campingroute.app` (an deine Domain anpassen)
- SSL-Zertifikat (bereits eingerichtet)

## Deployment-Schritte

### 1. Code auf den Server bringen

```bash
# Auf deinem Produktionsserver
cd /var/www/route-planner-pro
git pull origin feature/v0.2.15
```

### 2. Abhängigkeiten installieren

```bash
# Frontend Abhängigkeiten
npm install

# Server Abhängigkeiten (für den Proxy)
cd server
npm install --production
cd ..
```

### 3. Frontend bauen

```bash
npm run build
```

### 4. AI-Proxy mit PM2 starten

```bash
# Proxy-Server starten (Port 3002 - kein Konflikt mit Port 3001)
pm2 start server/ecosystem.config.js --name "ai-proxy"

# PM2 Konfiguration speichern
pm2 save

# Status überprüfen
pm2 list
```

**Erwartete Ausgabe:**
```
┌────────────────────┬──────────┬─────────────┬─────────┬─────────┬──────────┬──────────┬──────────┬──────────┐
│ App name           │ status   │ restarts    │ uptime  │ memory  │ watching │
├────────────────────┼──────────┼─────────────┼─────────┼─────────┼──────────┼──────────┼──────────┼──────────┤
│ ai-proxy           │ online   │ 0           │ 5s      │ 45.2MB  │ disabled │
│ dein-statistik-board │ online  │ 12          │ 7d      │ 60.1MB  │ disabled │
└────────────────────┴──────────┴─────────────┴─────────┴─────────┴──────────┴──────────┴──────────┴──────────┘
```

### 5. Nginx für AI-Proxy konfigurieren

```bash
sudo nano /etc/nginx/sites-available/deine-app
```

**Füge folgende Konfiguration hinzu** (innerhalb deines bestehenden `server` Blocks):

```nginx
# AI Proxy - Port 3002 (kein Konflikt mit Port 3001)
location /api/ {
    proxy_pass http://localhost:3002;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
}
```

### 6. Nginx neu laden

```bash
# Konfiguration testen
sudo nginx -t

# Nginx neu laden (kein Neustart nötig)
sudo systemctl reload nginx
```

### 7. Firewall überprüfen (falls aktiv)

```bash
# Port 3002 für lokalen Zugriff öffnen (falls Firewall aktiv)
sudo ufw allow 3002/tcp comment 'AI Proxy Server'
```

### 8. Funktionstest

```bash
# Health Check des Proxy-Servers
curl http://localhost:3002/health
```

**Erwartete Antwort:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123
}
```

### 9. Monitoring einrichten

```bash
# PM2 Monitoring Dashboard starten
pm2 monit

# Logs anzeigen
pm2 logs ai-proxy

# Log-Rotation aktivieren (optional)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 10
pm2 set pm2-logrotate:compress true
```

## Wartung & Updates

### Proxy-Server aktualisieren

```bash
cd /var/www/route-planner-pro
git pull origin feature/v0.2.15
pm2 restart ai-proxy
```

### Logs überprüfen

```bash
pm2 logs ai-proxy       # Echtzeit-Logs
pm2 flush              # Logs leeren
```

### Prozesse verwalten

```bash
pm2 list                # Alle Prozesse anzeigen
pm2 restart all         # Alle Prozesse neu starten
pm2 delete ai-proxy     # Proxy entfernen (falls nötig)
```

## Fehlerbehebung

### 1. 502 Bad Gateway

```bash
# Proxy-Server Status prüfen
pm2 list

# Logs prüfen
pm2 logs ai-proxy

# Nginx-Konfiguration testen
sudo nginx -t
```

### 2. Proxy nicht erreichbar

```bash
# Manuell testen
curl http://localhost:3002/health

# Port überprüfen
sudo lsof -i :3002
```

### 3. CORS-Fehler

```bash
# CORS-Konfiguration im Proxy prüfen
nano server/proxy-server.js

# Nginx-Header prüfen
sudo nginx -T | grep -A5 "location /api/"
```

## Sicherheitsempfehlungen

### 1. Fail2Ban installieren

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. SSH absichern

```bash
sudo nano /etc/ssh/sshd_config
```

```config
PermitRootLogin no
PasswordAuthentication no
X11Forwarding no
AllowUsers deploy
```

```bash
sudo systemctl restart sshd
```

### 3. Automatische Updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

## Erfolgskontrolle

Nach erfolgreicher Installation:

1. ✅ Frontend unter `https://campingroute.app` erreichbar
2. ✅ AI-Proxy auf Port 3002 läuft
3. ✅ Statistik-Board weiterhin auf Port 3001
4. ✅ Alle KI-Anbieter funktionieren (OpenAI, Mistral, Google)
5. ✅ Keine Port-Konflikte
6. ✅ PM2 Monitoring zeigt beide Prozesse

## Support

Bei Fragen oder Problemen:

1. Logs überprüfen (`pm2 logs ai-proxy`)
2. Nginx-Konfiguration testen (`sudo nginx -t`)
3. Proxy-Status prüfen (`pm2 list`)
4. Health Check durchführen (`curl http://localhost:3002/health`)

## Lizenz

MIT License - Copyright (c) 2024 Route Planner

---

**Erstellt am:** 2024
**Version:** 1.0.0
**Branch:** feature/v0.2.15