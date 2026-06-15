# Update: Alle Seiten + CMS mit Bilderserien-Funktion

Dieses Paket enthält den **kompletten, aktuellen Stand** deiner Website
inklusive der neuen Funktionen: Fotos bei News/Team/Seminaren und
Bilderserien (Galerien) bei News und Seminaren.

## Enthaltene Dateien

```
index.html
aktuelles.html
preise.html
seminare.html
trainerausbildung.html
cms-content.js
netlify.toml
admin/config.yml
admin/index.html
_data/aktuelles.json
_data/inhalte.json
_data/preise.json
_data/seminare.json
_data/stundenplan.json
_data/team.json
```

## So spielst du das Update ein

Am einfachsten und sichersten: **alle Dateien in einem Schritt über
GitHub hochladen** und dabei die bestehenden ersetzen lassen.

1. Gehe in dein GitHub-Repo, in den Ordner `FightandDefense-Website`
   (bzw. wie auch immer dein Ordner heißt – der Ordner, in dem `index.html`
   direkt liegt).
2. Klicke auf **"Add file" → "Upload files"**.
3. Ziehe **alle Dateien und Ordner aus diesem Paket** (also `index.html`,
   `aktuelles.html`, `_data/`, `admin/`, `cms-content.js`, usw.) per
   Drag&Drop in das Upload-Feld.
   - Wichtig: Ziehe den **Inhalt** des Ordners hinein, nicht den Ordner
     `fightanddefense-website` selbst.
4. GitHub zeigt an, dass diese Dateien bereits existieren und ersetzt
   werden. Das ist korrekt so.
5. Unten auf **"Commit changes"** klicken.

Netlify erkennt den neuen Commit automatisch und startet ein neues
Deployment (ca. 1 Minute).

## Was ist neu?

- **Aktuelles / News** (im CMS unter `/admin/`): pro Beitrag gibt es jetzt
  ein Feld **"Titelbild (optional)"** und ein Feld
  **"Bilderserie (optional)"**, bei dem du beliebig viele Fotos
  hinzufügen kannst.
- **Seminare**: gleiches Prinzip – Titelbild + Bilderserie.
- **Team**: pro Person ein Feld **"Foto (optional)"**, das den
  Buchstaben-Avatar ersetzt, wenn ein Foto hochgeladen wurde.
- Bilderserien werden als Raster angezeigt; ein Klick auf ein Bild
  öffnet es vergrößert.

## Kontrolle nach dem Upload

1. Im Browser `https://deine-domain.de` aufrufen – sollte aussehen wie
   gewohnt.
2. Unter `/admin/` einloggen und bei "Aktuelles" einen Testbeitrag mit
   Bild/Bilderserie anlegen, "Publish" klicken, dann die
   `aktuelles.html`-Seite neu laden, um das Ergebnis zu sehen.
