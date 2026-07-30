/**
 * cms-content.js
 * Lädt Inhalte aus den Decap-CMS-JSON-Dateien und befüllt die
 * data-cms="..." Platzhalter im HTML.
 *
 * Pfade ggf. anpassen, falls eure Repo-Struktur abweicht
 * (z.B. "/content/inhalte.json" statt "/_data/inhalte.json").
 */

const PFAD_INHALTE = "/content/inhalte.json";
const PFAD_SEMINARE = "/content/seminare.json";

document.addEventListener("DOMContentLoaded", function () {
  ladeInhalte();
  ladeSeminare();
});

/* ---------- 1) Allgemeine, einfache Textfelder ---------- */
/* Mapping: data-cms Attributwert -> Pfad in inhalte.json (Punktnotation) */
const FELD_MAPPING = {
  "kontakt-telefon": "kontakt.telefon",
  "kontakt-email": "kontakt.email",
  // weitere einfache Felder hier ergänzen, z.B.:
  // "hero-tagline": "hero.tagline",
};

function ladeInhalte() {
  fetch(PFAD_INHALTE)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      // einfache 1:1 Felder
      Object.keys(FELD_MAPPING).forEach(function (attr) {
        const el = document.querySelector('[data-cms="' + attr + '"]');
        if (!el) return;
        const wert = getByPath(data, FELD_MAPPING[attr]);
        if (wert != null) el.textContent = wert;
      });

      // Adresse (zwei Zeilen, mit <br>)
      const adresseEl = document.querySelector('[data-cms="kontakt-adresse"]');
      if (adresseEl && data.kontakt) {
        adresseEl.innerHTML =
          escapeHtml(data.kontakt.adresse_zeile1) +
          "<br>" +
          escapeHtml(data.kontakt.adresse_zeile2);
      }
    })
    .catch(function (err) {
      console.error("inhalte.json konnte nicht geladen werden:", err);
    });
}

function getByPath(obj, path) {
  return path.split(".").reduce(function (o, key) {
    return o && o[key] !== undefined ? o[key] : null;
  }, obj);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

/* ---------- 2) Seminare: gruppiert nach Kurs, mehrere Termine ---------- */

function ladeSeminare() {
  const listeEl = document.querySelector('[data-cms="seminare-liste"]');
  if (!listeEl) return; // nicht auf dieser Seite

  const platzhalterEl = document.querySelector('[data-cms="seminare-platzhalter"]');
  const einleitungEl = document.querySelector('[data-cms="seminare-einleitung"]');

  fetch(PFAD_SEMINARE)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (einleitungEl && data.einleitungstext) {
        einleitungEl.textContent = data.einleitungstext;
        einleitungEl.style.display = "block";
      }

      const seminare = data.seminare || [];
      if (seminare.length === 0) return; // Platzhalter bleibt sichtbar

      const kurse = gruppiereSeminare(seminare);
      listeEl.innerHTML = kurse.map(renderKursKarte).join("");
      listeEl.style.display = "block";
      if (platzhalterEl) platzhalterEl.style.display = "none";
    })
    .catch(function (err) {
      console.error("seminare.json konnte nicht geladen werden:", err);
    });
}

/**
 * Fasst Einträge mit identischem Titel + Text zu einem Kurs mit
 * mehreren Terminen zusammen. So müssen sich wiederholende Kurse
 * (z.B. "Basic-Kurs Selbstverteidigung") nur einmal beschrieben werden,
 * jeder neue Termin ist einfach ein weiterer Eintrag in seminare.json
 * mit gleichem Titel/Text und eigenem Datum + Link.
 */
function gruppiereSeminare(seminare) {
  const gruppen = new Map();

  seminare.forEach(function (s) {
    const key = (s.titel || "") + "|" + (s.text || "");
    if (!gruppen.has(key)) {
      gruppen.set(key, {
        titel: s.titel,
        kategorie: s.kategorie,
        text: s.text,
        bild: s.bild,
        termine: [],
      });
    }
    gruppen.get(key).termine.push({
      datum: (s.datum || "").trim(),
      link: s.link,
    });
  });

  return Array.from(gruppen.values());
}

function renderKursKarte(kurs) {
  const mehrereTermine = kurs.termine.length > 1;

  const bildHtml = kurs.bild
    ? '<img class="seminar-img" src="' + kurs.bild + '" alt="' + escapeHtml(kurs.titel) + '" loading="lazy">'
    : "";

  const kategorieHtml = kurs.kategorie
    ? '<p class="seminar-kategorie">' + escapeHtml(kurs.kategorie) + "</p>"
    : "";

  const textHtml = escapeHtml(kurs.text).replace(/\n/g, "<br>");

  const termineHtml = kurs.termine
    .map(function (t) {
      return (
        '<a class="termin-chip" href="' +
        (t.link || "#") +
        '" target="_blank" rel="noopener">' +
        escapeHtml(t.datum) +
        "</a>"
      );
    })
    .join("");

  return (
    '<div class="seminar-card fade-in">' +
    bildHtml +
    '<div class="seminar-body">' +
    kategorieHtml +
    '<h3 class="seminar-titel">' + escapeHtml(kurs.titel) + "</h3>" +
    '<p class="seminar-text">' + textHtml + "</p>" +
    '<div class="seminar-termine-label">' + (mehrereTermine ? "Nächste Termine:" : "Termin:") + "</div>" +
    '<div class="seminar-termine">' + termineHtml + "</div>" +
    "</div>" +
    "</div>"
  );
}
