# Update: CTA-Streifen & Trainingsbereich auf der Startseite editierbar

Dieses Update macht zwei weitere Bereiche der Startseite über das CMS
bearbeitbar:

1. **CTA-Streifen** (der farbige Block direkt unter dem Hero-Bereich mit
   "Fit für die Straße. Stark im Ring." + Button)
2. **Trainingsbereich** ("Unser Training" mit den drei Kästchen
   Selbstverteidigung, Kampfsport, Fitness)

Alle bisherigen Texte bleiben unverändert – du kannst sie jetzt einfach
über `/admin/` anpassen.

## Enthaltene Dateien (4)

```
_data/inhalte.json
admin/config.yml
cms-content.js
index.html
```

## Einspielen

Diese 4 Dateien im GitHub-Repo öffnen und durch die Versionen aus diesem
Paket ersetzen (Inhalt löschen → neuen Inhalt einfügen → Commit), oder
den Inhalt dieses Pakets per "Add file → Upload files" hochladen
(überschreibt automatisch die bestehenden 4 Dateien).

## Was ist neu im CMS?

Unter `/admin/` → **"Allgemeine Inhalte"** gibt es jetzt zwei neue
Abschnitte:

### "Startseite – CTA-Streifen"

- **Überschrift Teil 1**: erste Zeile, normale Farbe
  (z.B. "Fit für die Straße. Stark im Ring.")
- **Überschrift Teil 2**: zweite Zeile, hervorgehoben in Blau
  (z.B. "Bereit für dich selbst.")
- **Untertext**: der Fließtext darunter
- **Button-Text**: Text auf dem Button (Link bleibt auf
  "Probetraining buchen"-Bereich)

### "Startseite – Trainingsbereich"

- **Label über der Überschrift**: kleiner Text oben
  (z.B. "Was wir trainieren")
- **Überschrift Teil 1**: z.B. "Unser" (normale Farbe)
- **Überschrift Teil 2**: z.B. "Training" (hervorgehoben in Blau)
- **Beschreibungstext**: der Fließtext darunter
- **Kästchen**: Liste mit den drei (oder mehr/weniger) Trainingskästchen,
  jedes mit:
  - **Kategorie-Label** (kleiner Text oben im Kästchen, z.B.
    "Selbstverteidigung")
  - **Titel** (z.B. "Effektiv. Real. Skalierbar.")
  - **Text** (Beschreibung)

## Kästchen hinzufügen/entfernen/sortieren

- **Hinzufügen**: unten in der Liste "Kästchen" auf "Kästchen
  hinzufügen" klicken
- **Entfernen**: einen Eintrag öffnen und über das Mülleimer-Symbol
  löschen (mindestens 1 Kästchen muss bestehen bleiben)
- **Reihenfolge ändern**: per Drag&Drop an den Griffen links neben jedem
  Eintrag – die Reihenfolge in der Liste entspricht der Anzeige auf der
  Webseite

## Nach dem Bearbeiten

Wie gewohnt: **Publish** klicken, nach ca. 1 Minute ist die Änderung auf
der Startseite sichtbar.
