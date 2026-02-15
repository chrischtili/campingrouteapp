# Google Search Console - Weiterleitungsfix für campingroute.app

## Problemstellung
Google meldet zwei Seitenindexierungsprobleme:
- `http://campingroute.app` 
- `http://www.campingroute.app`

Beide werden als "Seite mit Weiterleitung" markiert, was zu SEO-Problemen führt.

## Lösung: .htaccess Weiterleitungsregeln

### Warum ist das nötig?
1. **Google testet explizit HTTP**: Auch 2024 prüft der Crawler beide Versionen
2. **Duplicate Content**: Ohne Weiterleitung sieht Google http/https als separate Seiten
3. **WWW vs Non-WWW**: Beide Domains müssen auf eine kanonische Version zeigen
4. **Sicherheit**: Erzwingt HTTPS für alle Besucher

### Die Lösung (für public/.htaccess):

```apache
# Weiterleitungen für SEO und Sicherheit
<IfModule mod_rewrite.c>
  RewriteEngine On

  # 1. www auf non-www weiterleiten
  RewriteCond %{HTTP_HOST} ^www\.campingroute\.app$ [NC]
  RewriteRule ^(.*)$ https://campingroute.app/$1 [L,R=301]

  # 2. HTTP auf HTTPS weiterleiten
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # 3. Kanonische URL erzwingen (Parameter bereinigen)
  RewriteCond %{THE_REQUEST} \s/+([^.?\s]*)[?][^\s]*\s [NC]
  RewriteRule ^ %1? [R=301,L]
</IfModule>

<IfModule mod_deflate.c>
  # Komprimierung aktivieren
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
  AddOutputFilterByType DEFLATE application/json

  # Kompressionslevel
  DeflateCompressionLevel 6
</IfModule>

<IfModule mod_expires.c>
  # Expires-Header für Caching
  ExpiresActive On
  ExpiresDefault "access plus 10 minutes"
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType image/webp "access plus 1 week"
  ExpiresByType image/png "access plus 1 week"
  ExpiresByType image/jpeg "access plus 1 week"
  ExpiresByType image/svg+xml "access plus 1 week"
  ExpiresByType text/css "access plus 10 minutes"
  ExpiresByType application/javascript "access plus 10 minutes"
  ExpiresByType application/json "access plus 10 minutes"
</IfModule>

<IfModule mod_headers.c>
  # Cache-Control-Header
  <FilesMatch "\.(ico|pdf|flv|jpg|jpeg|png|gif|webp|svg)$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>
  <FilesMatch "\.(js|css)$">
    Header set Cache-Control "public, max-age=600"
  </FilesMatch>
  <FilesMatch "\.(html|htm)$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
</IfModule>
```

## Was die Regeln bewirken:

1. **WWW-Weiterleitung**: 
   `https://www.campingroute.app/seite` → `https://campingroute.app/seite` (301)

2. **HTTPS-Erzwingung**:
   `http://campingroute.app/seite` → `https://campingroute.app/seite` (301)

3. **Parameter-Bereinigung**:
   `https://campingroute.app/seite?id=123` → `https://campingroute.app/seite` (301)

## Implementierungsschritte:

1. **Lokale Anpassung**: 
   - Ersetze den Inhalt von `public/.htaccess` mit dem oben stehenden Code
   - Teste lokal mit `curl -I http://localhost` (sollte 301 zeigen)

2. **Deployment**:
   - Push zum Feature-Branch
   - Nach Deployment auf Staging/Production testen:
     ```bash
     curl -I http://campingroute.app
     curl -I http://www.campingroute.app
     ```
   - Erwartetes Ergebnis: `HTTP/301` mit `Location: https://campingroute.app`

3. **Google informieren**:
   - In Search Console die URLs zur erneuten Prüfung einreichen
   - Kanonische URLs in `<head>` prüfen (sollten auf HTTPS zeigen)

## Erwarteter Zeitrahmen:
- Google benötigt **3-14 Tage** zur Neubewertung
- Die Warnungen sollten danach verschwinden
- Die HTTP-Versionen werden nach ~30 Tagen aus dem Index fallen

## Technische Voraussetzungen:
- Apache Webserver mit `mod_rewrite` (standardmäßig aktiviert)
- `.htaccess`-Datei muss im Document Root liegen (ist sie, da in `/public`)
- SSL-Zertifikat muss für die Domain konfiguriert sein (ist es bei dir)

## Monitoring:
- **Google Search Console**: "Abdeckung" → "Ausgeschlossen" prüfen
- **Server-Logs**: 301-Weiterleitungen sollten sichtbar sein
- **SEO-Tools**: Ahrefs/Screaming Frog können die Weiterleitungen validieren

---

*Erstellt für campingroute.app | Letzte Aktualisierung: 2024*
