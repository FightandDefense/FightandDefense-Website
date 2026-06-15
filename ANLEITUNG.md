# Update: MATOOL-Formular für Probetraining einbinden

Dieses Update fügt im CMS ein neues Feld hinzu, über das du den
iframe-Embed-Code deines MATOOL-Formulars einfügen kannst. Sobald dort
ein Code hinterlegt ist, ersetzt er automatisch das bisherige interne
"Probetraining anfragen"-Formular auf der Startseite.

**Solange das Feld leer bleibt**, funktioniert die Seite wie bisher
(internes Formular). Du kannst das MATOOL-Formular also in Ruhe
vorbereiten und erst aktivieren, wenn du bereit bist.

## Enthaltene Dateien (4)

```
_data/inhalte.json
admin/config.yml
cms-content.js
index.html
```

## Einspielen

Diese 4 Dateien im GitHub-Repo öffnen und durch die Versionen aus diesem
Paket ersetzen (Inhalt löschen → neuen Inhalt einfügen → Commit).

## So aktivierst du das MATOOL-Formular

1. In MATOOL das Formular öffnen und den **Embed-/iframe-Code**
   kopieren. Das sieht ungefähr so aus:
   ```html
   <iframe src="https://matool.de/formulare/xyz123" width="100%" height="800"></iframe>
   ```
2. Im CMS unter `/admin/` → **"Allgemeine Inhalte"** → Abschnitt
   **"Probetraining-Formular (MATOOL)"** öffnen.
3. Den kompletten iframe-Code (inklusive `<iframe ...>` und
   `</iframe>`) in das Feld **"iframe-Einbettungscode von MATOOL"**
   einfügen.
4. Bei **"Höhe des Formulars (in Pixel)"** einen Wert eintragen, der zur
   tatsächlichen Höhe des MATOOL-Formulars passt (Standard: 600). Falls
   das Formular abgeschnitten wirkt oder zu viel Leerraum lässt, diesen
   Wert anpassen und erneut publizieren.
5. **Publish** klicken.

Nach ca. 1 Minute ersetzt das MATOOL-Formular automatisch das bisherige
interne Formular im Bereich "Probetraining buchen" auf der Startseite.
Überschrift ("Probetraining anfragen") und Beschreibungstext bleiben
unverändert erhalten.

## Zurück zum internen Formular wechseln

Falls du später wieder das interne Formular nutzen möchtest: einfach den
Inhalt des Felds "iframe-Einbettungscode von MATOOL" löschen (leer
lassen) und publizieren – das interne Formular erscheint automatisch
wieder.

## Hinweis zur Höhe

iframes übernehmen nicht automatisch die Höhe ihres Inhalts. Falls das
MATOOL-Formular nach dem Ausfüllen z.B. eine Erfolgsmeldung anzeigt, die
mehr Platz braucht, oder falls auf dem Smartphone mehr/weniger Platz
benötigt wird, kannst du die Höhe im CMS jederzeit nachjustieren – ohne
erneuten Code-Eingriff.
