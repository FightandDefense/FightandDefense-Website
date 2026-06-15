# Fight&Defense Website – Komplettes Update einspielen

Dieses Paket enthält den **vollständigen, aktuellen Stand** deiner
Website inklusive CMS, Foto-Upload, Bilderserien und der neuen, frei
editierbaren Preis-Tarife (Name, Laufzeit, Preis, Altersgruppe).

Da das komplette Ersetzen aller Dateien bei dir zuverlässig funktioniert
hat (im Gegensatz zum Austausch einzelner Dateien), ist dieses Paket
wieder als **Komplettpaket** aufgebaut: alle Dateien werden ersetzt.

---

## Enthaltene Dateien (16)

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
ANLEITUNG.md  (diese Datei)
```

---

## Schritt 1: ZIP entpacken

Entpacke das ZIP auf deinem Computer. Du erhältst einen Ordner
`fightanddefense-website` mit allen oben genannten Dateien und Ordnern
(`_data/`, `admin/`).

---

## Schritt 2: Alle Dateien im GitHub-Repo ersetzen

1. Öffne dein GitHub-Repo im Browser (den Ordner, in dem `index.html`
   direkt liegt – also z.B. `FightandDefense-Website`).
2. Klicke auf **"Add file" → "Upload files"**.
3. Ziehe **den Inhalt** des entpackten Ordners (alle Dateien und die
   Ordner `_data` und `admin`) per Drag&Drop in das Upload-Feld.
   - **Wichtig:** Ziehe die Dateien/Ordner selbst hinein, nicht den
     äußeren Ordner `fightanddefense-website`. Das Upload-Feld sollte
     direkt `index.html`, `_data`, `admin`, usw. anzeigen.
4. GitHub erkennt, dass diese Dateien bereits existieren, und ersetzt
   sie automatisch beim Commit. Das ist korrekt und gewollt.
5. Scrolle nach unten und klicke auf **"Commit changes"**.

---

## Schritt 3: Deployment abwarten

1. Wechsle ins Netlify-Dashboard zu deinem Projekt.
2. Unter dem Tab **"Deploys"** siehst du einen neuen Build starten
   (Status "Building").
3. Warte ca. 1 Minute, bis der Status auf **"Published"** wechselt.
4. Falls der Status **"Failed"** zeigt: auf den Deploy klicken, das
   Build-Log öffnen und mir die Fehlermeldung schicken – das lässt sich
   in der Regel schnell beheben (meist ein Tippfehler in der
   Publish-Directory-Einstellung).

---

## Schritt 4: Seite und CMS prüfen

1. Rufe deine Domain im Browser auf – die Seite sollte aussehen wie
   gewohnt (Design unverändert).
2. Rufe `https://deine-domain.de/admin/` auf und logge dich mit deinem
   bereits gesetzten Passwort ein.
3. Klicke auf **"Preise & Mitgliedschaft" → "Tarife"**. Du solltest jetzt
   eine Liste mit **10 Tarifen** sehen (aktuell als "Tarif 1" bis
   "Tarif 10" mit 0,00 € benannt – das sind Platzhalter).

---

## Schritt 5: Die 10 Tarife befüllen

Für jeden der 10 Tarife gibt es folgende Felder:

| Feld | Beschreibung | Beispiel |
|---|---|---|
| **Name** | Name des Tarifs/Kurses | Panthers, BJJ, Mini Panthers |
| **Laufzeit** | Vertragslaufzeit | 12 Monate, Flex · monatlich |
| **Altersgruppe** | Dropdown: Erwachsene oder Kinder | Erwachsene |
| **Preis (Euro)** | Ganzzahliger Euro-Betrag | 54 |
| **Preis (Cent)** | Zweistelliger Cent-Betrag | 90 |
| **Beschreibungstext** | Kurzer Werbetext zum Tarif | "Der Klassiker — ein Jahr voll dabei..." |
| **Sparhinweis** (optional) | Zusatzhinweis, z.B. bei günstigstem Tarif | ↓ Günstigster Tarif |
| **Beliebt** (Häkchen) | Hebt die Karte farblich hervor | an/aus |

So gehst du vor:

1. Klicke auf den ersten Eintrag ("Tarif 1"), um ihn zu öffnen.
2. Trage die echten Werte ein (Name, Laufzeit, Altersgruppe, Preis,
   Text, ggf. Sparhinweis/Beliebt).
3. Gehe zurück zur Liste (Pfeil/Zurück-Symbol oben) und öffne den
   nächsten Tarif.
4. Wiederhole das für alle 10 Tarife.
5. Falls du **weniger als 10 Tarife** brauchst: einen Eintrag öffnen und
   über das Mülleimer-Symbol löschen.
6. Falls du **mehr als 10 Tarife** brauchst: unten in der Liste auf
   "Tarife: Tarif hinzufügen" klicken.
7. Die **Reihenfolge** kannst du per Drag&Drop (an den Pfeilen/Griffen
   links neben jedem Eintrag) ändern – sie bestimmt auch die
   Anzeige-Reihenfolge auf der Webseite, innerhalb der jeweiligen
   Altersgruppe.

---

## Schritt 6: Veröffentlichen

1. Wenn alle Tarife korrekt befüllt sind, oben rechts auf **"Publish"**
   klicken (ggf. zuerst "Save", dann "Publish" – je nach CMS-Version).
2. Nach ca. 1 Minute ist die Änderung live.
3. Rufe `https://deine-domain.de/preise.html` auf und prüfe das
   Ergebnis: Die Tarife erscheinen automatisch gruppiert in zwei
   Abschnitten – **"Erwachsene"** und **"Kinder"** – je nachdem, welche
   Altersgruppe du pro Tarif gewählt hast. Jede Karte zeigt oben den
   Namen, darunter Laufzeit, Preis und Beschreibungstext.

---

## Zur Erinnerung: Weitere Funktionen in diesem Stand

- **Aktuelles / News**: Titelbild + Bilderserie (mehrere Fotos) pro
  Beitrag möglich
- **Seminare**: Titelbild + Bilderserie pro Seminar; "Demnächst
  verfügbar"-Platzhalter verschwindet automatisch, sobald ein Seminar
  angelegt wird
- **Team**: optionales Foto pro Person (ersetzt den Buchstaben-Avatar)
- **Stundenplan, Kontakt, Hero-Texte, Trainerausbildung**: wie bisher
  über die jeweiligen CMS-Bereiche editierbar

---

## Falls etwas nicht klappt

- **Deploy "Failed"**: Build-Log-Fehlermeldung schicken
- **Seite zeigt alte Inhalte**: Browser-Cache leeren (Strg+Shift+R) oder
  1-2 Minuten warten, bis das Deployment durch ist
- **CMS-Felder fehlen oder sehen anders aus als beschrieben**: Prüfen,
  ob `admin/config.yml` korrekt ersetzt wurde (Datei in GitHub öffnen,
  oben sollte "Tarife" als Feld-Label stehen, nicht "Tarif-Gruppen" oder
  "Erwachsene Tarife")
