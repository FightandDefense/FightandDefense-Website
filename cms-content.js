/* Fight&Defense – Content Loader
   Lädt Inhalte aus den JSON-Dateien in /_data/ und befüllt
   die mit data-cms="..." markierten Elemente automatisch.
   Wird per Decap CMS unter /admin gepflegt. */

(function () {
  function fetchJSON(path) {
    return fetch(path, { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("Konnte " + path + " nicht laden");
        return res.json();
      })
      .catch(function (err) {
        console.warn(err);
        return null;
      });
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (value !== undefined && value !== null) el.textContent = value;
    });
  }

  function setHTML(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (value !== undefined && value !== null) el.innerHTML = value;
    });
  }

  // Rendert eine Bilderserie als responsives Grid mit Klick-Vergrößerung (Lightbox)
  function renderGallery(items) {
    if (!items || !items.length) return "";
    var thumbs = items.map(function (entry) {
      var src = typeof entry === "string" ? entry : entry.bild;
      if (!src) return "";
      return '<div class="fd-gallery-thumb" style="aspect-ratio:1/1; overflow:hidden; border-radius:6px; cursor:pointer;">' +
        '<img src="' + src + '" loading="lazy" data-fd-fullsrc="' + src + '" ' +
        'style="width:100%; height:100%; object-fit:cover; transition:0.3s;">' +
        '</div>';
    }).join("");
    return '<div class="fd-gallery" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(120px, 1fr)); gap:0.6rem; margin-top:1.2rem;">' + thumbs + '</div>';
  }

  // Einfache Lightbox zum großen Anzeigen eines Bilds (Galerie & Trainerfotos, per Event-Delegation)
  if (!window.__fdLightboxInit) {
    window.__fdLightboxInit = true;
    var fdOpenLightbox = function (img) {
      if (document.querySelector(".fd-lightbox")) return;
      var overlay = document.createElement("div");
      overlay.className = "fd-lightbox";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("style",
        "position:fixed; inset:0; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:9999; cursor:zoom-out; padding:2rem;");
      var big = document.createElement("img");
      big.src = img.getAttribute("data-fd-fullsrc");
      big.alt = img.getAttribute("alt") || "";
      big.setAttribute("style", "max-width:100%; max-height:100%; object-fit:contain; border-radius:6px; box-shadow:0 0 40px rgba(0,0,0,0.6);");
      overlay.appendChild(big);
      var prevOverflow = document.body.style.overflow;
      var close = function () {
        overlay.remove();
        document.body.style.overflow = prevOverflow;
        document.removeEventListener("keydown", onKey);
        if (img.focus) img.focus();
      };
      var onKey = function (ev) { if (ev.key === "Escape") close(); };
      overlay.addEventListener("click", close);
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      document.body.appendChild(overlay);
    };
    document.addEventListener("click", function (e) {
      var img = e.target.closest && e.target.closest("[data-fd-fullsrc]");
      if (img) fdOpenLightbox(img);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var img = e.target.closest && e.target.closest("[data-fd-fullsrc]");
      if (!img) return;
      e.preventDefault();
      fdOpenLightbox(img);
    });
    document.addEventListener("mouseover", function (e) {
      var img = e.target.closest && e.target.closest(".fd-gallery-thumb img");
      if (img) img.style.transform = "scale(1.05)";
    });
    document.addEventListener("mouseout", function (e) {
      var img = e.target.closest && e.target.closest(".fd-gallery-thumb img");
      if (img) img.style.transform = "scale(1)";
    });
  }

  // ---------- KONTAKT (auf allen Seiten) ----------
  function applyKontakt(data) {
    if (!data || !data.kontakt) return;
    var k = data.kontakt;
    setHTML('[data-cms="kontakt-adresse"]',
      k.adresse_zeile1 + '<br>' + k.adresse_zeile2);
    var telLinks = document.querySelectorAll('[data-cms="kontakt-telefon"]');
    telLinks.forEach(function (el) {
      el.textContent = k.telefon;
      if (el.tagName === 'A') el.href = 'tel:' + k.telefon_link;
    });
    var mailLinks = document.querySelectorAll('[data-cms="kontakt-email"]');
    mailLinks.forEach(function (el) {
      el.textContent = k.email;
      if (el.tagName === 'A') el.href = 'mailto:' + k.email;
    });
  }

  // ---------- STARTSEITE: HERO ----------
  function applyHero(data) {
    if (!data || !data.hero) return;
    setText('[data-cms="hero-tagline"]', data.hero.tagline);
    setText('[data-cms="hero-untertext"]', data.hero.untertext);
  }

  // ---------- STARTSEITE: AKTUELLES-HIGHLIGHT ----------
  // Liest automatisch den neuesten hervorgehobenen Beitrag aus aktuelles.json.
  // Fallback: manuelles highlight_seminar-Feld aus inhalte.json.
  function applyHighlight(inhalteData) {
    if (!document.querySelector('[data-cms="highlight-titel"]')) return;
    fetchJSON("/_data/aktuelles.json").then(function (aktuellesData) {
      var h = null;
      if (aktuellesData && aktuellesData.news) {
        var hervorgehobene = aktuellesData.news.filter(function (n) {
          return n.hervorgehoben === true;
        });
        if (hervorgehobene.length > 0) h = hervorgehobene[0];
      }
      if (!h && inhalteData && inhalteData.highlight_seminar) {
        h = inhalteData.highlight_seminar;
      }
      if (!h) return;
      setText('[data-cms="highlight-titel"]', h.titel);
      setText('[data-cms="highlight-datum"]', h.datum);
      setText('[data-cms="highlight-text"]', h.text);
      var bildEl = document.querySelector('[data-cms="highlight-bild"]');
      if (bildEl) {
        if (h.bild) {
          bildEl.src = h.bild;
          bildEl.alt = h.titel || "";
          bildEl.style.display = "block";
        } else {
          bildEl.style.display = "none";
        }
      }
    });
  }

  // ---------- STARTSEITE: CTA-STREIFEN ----------
  function applyCtaStrip(data) {
    if (!data || !data.cta_strip) return;
    var c = data.cta_strip;
    setText('[data-cms="cta-headline1"]', c.headline_teil1);
    setText('[data-cms="cta-headline2"]', c.headline_teil2);
    setText('[data-cms="cta-untertext"]', c.untertext);
    setText('[data-cms="cta-button"]', c.button_text);
  }

  // ---------- STARTSEITE: TRAININGSBEREICH ----------
  function applyTrainingBereich(data) {
    if (!data || !data.training_bereich) return;
    var t = data.training_bereich;
    setText('[data-cms="training-label"]', t.section_label);
    setText('[data-cms="training-titel1"]', t.titel_teil1);
    setText('[data-cms="training-titel2"]', t.titel_teil2);
    setText('[data-cms="training-beschreibung"]', t.beschreibung);

    var container = document.querySelector('[data-cms="training-karten"]');
    if (container && t.karten) {
      container.innerHTML = "";
      t.karten.forEach(function (karte) {
        var div = document.createElement("div");
        div.className = "training-card fade-in visible";
        div.innerHTML =
          '<span class="training-icon">' + (karte.icon_label || "") + '</span>' +
          '<h3>' + (karte.titel || "") + '</h3>' +
          '<p>' + (karte.text || "") + '</p>';
        container.appendChild(div);
      });
    }
  }

  // ---------- TRAINERAUSBILDUNG ----------
  function applyTrainerausbildung(data) {
    if (!data || !data.trainerausbildung) return;
    var t = data.trainerausbildung;
    setText('[data-cms="trainer-text1"]', t.text1);
    setText('[data-cms="trainer-text2"]', t.text2);
    if (t.youtube_link) {
      var box = document.querySelector('[data-cms="trainer-video"]');
      if (box) {
        var embed = t.youtube_link.replace("watch?v=", "embed/");
        box.outerHTML = '<div class="video-embed" style="margin-top:1.8rem; aspect-ratio:16/9;">' +
          '<iframe width="100%" height="100%" src="' + embed + '" title="Trainerausbildung Video" ' +
          'frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
      }
    }
  }

  // ---------- PROBETRAINING-FORMULAR (MATOOL oder intern) ----------
  function applyProbetrainingFormular(data) {
    if (!data || !data.probetraining_formular) return;
    var p = data.probetraining_formular;
    if (!p.iframe_code) return; // kein Code hinterlegt -> internes Formular bleibt aktiv
    var container = document.querySelector('[data-cms="probetraining-formular"]');
    if (!container) return;
    var hoehe = p.hoehe || 600;
    container.innerHTML =
      '<div class="matool-embed" style="width:100%; height:' + hoehe + 'px;">' + p.iframe_code + '</div>';
    // Falls der eingefügte iframe keine eigene Höhe/Breite mitbringt, sinnvolle Defaults setzen
    var iframe = container.querySelector("iframe");
    if (iframe) {
      if (!iframe.style.height && !iframe.getAttribute("height")) iframe.style.height = "100%";
      if (!iframe.style.width && !iframe.getAttribute("width")) iframe.style.width = "100%";
      iframe.style.border = "0";
    }
  }

  // ---------- TRAINERAUSBILDUNG-FORMULAR (MATOOL oder intern) ----------
  function applyTrainerausbildungFormular(data) {
    if (!data || !data.trainerausbildung_formular) return;
    var p = data.trainerausbildung_formular;
    if (!p.iframe_code) return; // kein Code hinterlegt -> internes Formular bleibt aktiv
    var container = document.querySelector('[data-cms="trainerausbildung-formular"]');
    if (!container) return;
    var hoehe = p.hoehe || 600;
    container.innerHTML =
      '<div class="matool-embed" style="width:100%; height:' + hoehe + 'px;">' + p.iframe_code + '</div>';
    // Falls der eingefügte iframe keine eigene Höhe/Breite mitbringt, sinnvolle Defaults setzen
    var iframe = container.querySelector("iframe");
    if (iframe) {
      if (!iframe.style.height && !iframe.getAttribute("height")) iframe.style.height = "100%";
      if (!iframe.style.width && !iframe.getAttribute("width")) iframe.style.width = "100%";
      iframe.style.border = "0";
    }
  }

  // ---------- TRAINING IN UELZEN: TEXTE, BILDER & DOWNLOAD ----------
  function applyUelzen(data) {
    if (!data) return;
    setText('[data-cms="uelzen-text1"]', data.text1);
    setText('[data-cms="uelzen-text2"]', data.text2);

    var galerieBox = document.querySelector('[data-cms="uelzen-galerie"]');
    if (galerieBox) {
      galerieBox.innerHTML = renderGallery(data.galerie);
    }

    var downloadLink = document.querySelector('[data-cms="uelzen-mitgliedsantrag"]');
    if (downloadLink) {
      if (data.mitgliedsantrag_pdf) {
        downloadLink.setAttribute("href", data.mitgliedsantrag_pdf);
        downloadLink.style.display = "";
      } else {
        downloadLink.style.display = "none";
      }
    }

    if (data.adresse) {
      setText('[data-cms="uelzen-adresse-name"]', data.adresse.name);
      setHTML('[data-cms="uelzen-adresse"]',
        (data.adresse.strasse || '') + '<br>' + (data.adresse.ort || ''));
    }

    applyUelzenPreise(data.preise);
    applyUelzenFormular(data.formular);
  }

  // ---------- TRAINING IN UELZEN: PREISE (eigener Standort) ----------
  function applyUelzenPreise(data) {
    if (!data) return;
    var container = document.querySelector('[data-cms="uelzen-preise-gruppen"]');
    if (container && data.tarife) {
      container.innerHTML = "";
      if (!data.tarife.length) {
        container.innerHTML = '<p style="color: var(--muted); font-size: 0.9rem; text-align:center;">Die Preise für Uelzen werden in Kürze ergänzt.</p>';
      } else {
        var reihenfolge = ["Erwachsene", "Kinder"];
        var gruppen = {};
        data.tarife.forEach(function (item) {
          var key = item.altersgruppe || "Weitere";
          if (!gruppen[key]) gruppen[key] = [];
          gruppen[key].push(item);
        });
        var alleGruppen = reihenfolge.filter(function (g) { return gruppen[g]; });
        Object.keys(gruppen).forEach(function (g) {
          if (alleGruppen.indexOf(g) === -1) alleGruppen.push(g);
        });
        alleGruppen.forEach(function (gruppenName) {
          var wrapper = document.createElement("div");
          wrapper.className = "fade-in visible";
          var title = document.createElement("p");
          title.className = "price-section-title";
          title.textContent = gruppenName;
          var grid = document.createElement("div");
          grid.className = "price-grid";
          renderPriceCards(grid, gruppen[gruppenName]);
          wrapper.appendChild(title);
          wrapper.appendChild(grid);
          container.appendChild(wrapper);
        });
      }
    }
    if (data.anmeldegebuehr) {
      setText('[data-cms="uelzen-anmelde-titel"]', data.anmeldegebuehr.titel);
      setText('[data-cms="uelzen-anmelde-text"]', data.anmeldegebuehr.text);
    }
  }

  // ---------- TRAINING IN UELZEN-FORMULAR (MATOOL oder intern) ----------
  function applyUelzenFormular(p) {
    if (!p || !p.iframe_code) return; // kein Code hinterlegt -> internes Formular bleibt aktiv
    var container = document.querySelector('[data-cms="uelzen-formular"]');
    if (!container) return;
    var hoehe = p.hoehe || 600;
    container.innerHTML =
      '<div class="matool-embed" style="width:100%; height:' + hoehe + 'px;">' + p.iframe_code + '</div>';
    var iframe = container.querySelector("iframe");
    if (iframe) {
      if (!iframe.style.height && !iframe.getAttribute("height")) iframe.style.height = "100%";
      if (!iframe.style.width && !iframe.getAttribute("width")) iframe.style.width = "100%";
      iframe.style.border = "0";
    }
  }

  // ---------- STUNDENPLAN UELZEN (KACHELFORM) ----------
  function applyStundenplanUelzen(data) {
    if (!data || !data.tage) return;
    var container = document.querySelector('[data-cms="stundenplan-uelzen-kacheln"]');
    if (!container) return;
    container.innerHTML = "";
    if (!data.tage.length) {
      container.innerHTML = '<p style="color: var(--muted); font-size: 0.9rem;">Der Stundenplan für Uelzen wird in Kürze ergänzt.</p>';
      return;
    }
    data.tage.forEach(function (tag) {
      var card = document.createElement("div");
      card.className = "form-card fade-in visible";
      card.style.paddingTop = "1.8rem";
      var rows = (tag.kurse || []).map(function (k) {
        return '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">' +
          '<span style="color: var(--muted); font-family: \'Barlow Condensed\', sans-serif; font-weight: 600;">' + k.zeit + '</span>' +
          '<span style="color: var(--white); font-weight: 500; text-align: right;">' + k.name + '</span></div>';
      }).join("");
      card.innerHTML =
        '<div class="form-card-accent" style="background: linear-gradient(90deg, var(--blue), var(--blue2));"></div>' +
        '<h3 class="form-card-title">' + tag.tag + '</h3>' +
        '<div style="margin-top: 0.8rem;">' + (rows || '<p style="color: var(--muted); font-size: 0.9rem;">Kein Training</p>') + '</div>';
      container.appendChild(card);
    });
  }

  // Titelbild eines News-Beitrags: Format & Ausschnitt per CMS steuerbar, Klick öffnet die Lightbox
  var NEWS_FORMATE = { "16:9": "16 / 9", "21:9": "21 / 9", "4:3": "4 / 3", "1:1": "1 / 1" };
  var NEWS_AUSSCHNITT = { "oben": "center top", "mitte": "center center", "unten": "center bottom" };
  function renderNewsBild(item) {
    var alt = (item.titel || "").replace(/"/g, "&quot;");
    var ratio = NEWS_FORMATE[item.bild_format];
    var pos = NEWS_AUSSCHNITT[item.bild_ausschnitt] || "center center";
    var imgAttr = ' src="' + item.bild + '" alt="' + alt + '" data-fd-fullsrc="' + item.bild + '" tabindex="0" role="button" title="Bild vergrößern" loading="lazy"';
    if (ratio) {
      // Fester Rahmen, Bild füllt ihn aus (Ränder werden je nach Ausschnitt beschnitten)
      return '<div class="news-bild" style="aspect-ratio:' + ratio + '; overflow:hidden; border-radius:6px; margin-bottom:1.2rem; cursor:zoom-in; background:#000;">' +
        '<img' + imgAttr + ' style="width:100%; height:100%; object-fit:cover; object-position:' + pos + '; display:block;"></div>';
    }
    // Standard: ganzes Bild ohne Beschnitt, hohe Hochformat-Bilder werden in der Höhe begrenzt
    return '<div class="news-bild" style="border-radius:6px; overflow:hidden; margin-bottom:1.2rem; cursor:zoom-in; background:#000; display:flex; justify-content:center;">' +
      '<img' + imgAttr + ' style="display:block; width:auto; max-width:100%; height:auto; max-height:520px;"></div>';
  }

  // ---------- AKTUELLES / NEWS ----------
  function applyNews(data) {
    if (!data || !data.news) return;
    var container = document.querySelector('[data-cms="news-liste"]');
    if (!container) return;
    container.innerHTML = "";
    data.news.forEach(function (item) {
      var div = document.createElement("div");
      div.className = "news-item fade-in visible";
      var style = item.hervorgehoben
        ? "background: var(--card); border: 1px solid var(--border); padding: 2rem; border-radius: 8px; margin-bottom: 2rem;"
        : "background: var(--card); border: 1px solid var(--border); padding: 2rem; border-radius: 8px; opacity: 0.7; margin-bottom: 2rem;";
      div.setAttribute("style", style);
      var dateStyle = item.hervorgehoben
        ? "color: var(--blue); font-weight: 600; font-size: 0.9rem;"
        : "color: var(--muted); font-weight: 600; font-size: 0.9rem;";
      var imgHtml = item.bild ? renderNewsBild(item) : '';
      div.innerHTML =
        imgHtml +
        '<span style="' + dateStyle + '">' + (item.datum || "").toUpperCase() + '</span>' +
        '<h3 style="font-family: \'Bebas Neue\'; font-size: 2rem; margin: 10px 0;">' + (item.titel || "") + '</h3>' +
        '<p style="color: var(--muted); line-height: 1.6;">' + (item.text || "") + '</p>' +
        renderGallery(item.galerie);
      container.appendChild(div);
    });
  }

  // ---------- PREISE ----------
  function renderPriceCards(container, items) {
    container.innerHTML = "";
    items.forEach(function (item) {
      var div = document.createElement("div");
      div.className = "price-card fade-in visible" + (item.beliebt ? " popular" : "");
      div.innerHTML =
        (item.beliebt ? '<div class="popular-badge">Beliebt</div>' : '') +
        (item.name ? '<div class="price-name" style="font-family:\'Bebas Neue\', sans-serif; font-size:1.3rem; letter-spacing:0.05em; color:var(--white); margin-bottom:0.2rem;">' + item.name + '</div>' : '') +
        '<div class="price-duration">' + item.laufzeit + '</div>' +
        '<div class="price-amount"><sup>€</sup>' + item.preis + '<sub>,' + item.cent + ' / ' + (item.einheit || 'Monat') + '</sub></div>' +
        '<p class="price-note">' + item.hinweis + '</p>' +
        (item.sparhinweis ? '<p class="price-saving">' + item.sparhinweis + '</p>' : '');
      container.appendChild(div);
    });
  }

  function applyPreise(data) {
    if (!data) return;
    var container = document.querySelector('[data-cms="preise-gruppen"]');
    if (container && data.tarife) {
      container.innerHTML = "";
      // Reihenfolge der Altersgruppen: Erwachsene zuerst, dann Kinder, dann ggf. weitere
      var reihenfolge = ["Erwachsene", "Kinder"];
      var gruppen = {};
      data.tarife.forEach(function (item) {
        var key = item.altersgruppe || "Weitere";
        if (!gruppen[key]) gruppen[key] = [];
        gruppen[key].push(item);
      });
      var alleGruppen = reihenfolge.filter(function (g) { return gruppen[g]; });
      Object.keys(gruppen).forEach(function (g) {
        if (alleGruppen.indexOf(g) === -1) alleGruppen.push(g);
      });
      alleGruppen.forEach(function (gruppenName) {
        var wrapper = document.createElement("div");
        wrapper.className = "fade-in visible";
        var title = document.createElement("p");
        title.className = "price-section-title";
        title.textContent = gruppenName;
        var grid = document.createElement("div");
        grid.className = "price-grid";
        renderPriceCards(grid, gruppen[gruppenName]);
        wrapper.appendChild(title);
        wrapper.appendChild(grid);
        container.appendChild(wrapper);
      });
    }
    if (data.anmeldegebuehr) {
      setText('[data-cms="anmelde-titel"]', data.anmeldegebuehr.titel);
      setText('[data-cms="anmelde-text"]', data.anmeldegebuehr.text);
    }
  }

  // ---------- SEMINARE (mit Online-Buchung) ----------
  // Jeder Eintrag in seminare.json ist ein Termin. Einträge mit identischem
  // Titel+Text werden zu einem Kurs mit mehreren Terminen zusammengefasst.
  // Online buchbar ist ein Termin, wenn "beginn" gepflegt ist und Preise
  // vorhanden sind (eigene "preise" am Termin, sonst "standardpreise").
  // Alle Einstellungen (Bankdaten, Stornofristen, Webhook ...) stehen im
  // CMS unter Seminare > "Buchung & Zahlung".

  var SEM_WT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var SEM_STORNO_ZUSATZ =
    "Ein Ersatzteilnehmer kann jederzeit kostenfrei benannt werden. " +
    "Dir bleibt der Nachweis gestattet, dass uns kein oder ein wesentlich geringerer Schaden entstanden ist. " +
    "Sagen wir das Seminar ab (z. B. wegen Krankheit der Trainer oder zu geringer Teilnehmerzahl), " +
    "erhältst du den Preis vollständig zurück oder einen Ersatztermin.";
  var SEM_WIDERRUF =
    "Für diesen Vertrag besteht gemäß § 312g Abs. 2 Nr. 9 BGB kein gesetzliches Widerrufsrecht " +
    "(Freizeitdienstleistung mit festem Termin).";

  function semEsc(s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function semNum(v) {
    if (typeof v === "number") return isNaN(v) ? null : v;
    var n = parseFloat(String(v === undefined || v === null ? "" : v).replace(",", "."));
    return isNaN(n) ? null : n;
  }

  function semEuro(n) {
    return n.toFixed(2).replace(".", ",") + " €";
  }

  // "2026-10-25T11:00" -> Objekt; "tag" = fortlaufende Tageszahl (zeitzonenfrei)
  function semParseBeginn(str) {
    var m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(String(str || ""));
    if (!m) return null;
    return {
      iso: m[1] + "-" + m[2] + "-" + m[3] + "T" + m[4] + ":" + m[5],
      tag: Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000)
    };
  }

  // Heutiges Datum in Deutschland als Tageszahl
  function semHeute() {
    var iso;
    try {
      iso = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit"
      }).format(new Date());
    } catch (e) {
      var n = new Date();
      iso = n.getFullYear() + "-" + ("0" + (n.getMonth() + 1)).slice(-2) + "-" + ("0" + n.getDate()).slice(-2);
    }
    var p = iso.split("-");
    return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000);
  }

  function semTagFmt(tag, mitWochentag) {
    var d = new Date(tag * 86400000);
    var s = ("0" + d.getUTCDate()).slice(-2) + "." + ("0" + (d.getUTCMonth() + 1)).slice(-2) + "." + d.getUTCFullYear();
    return mitWochentag ? SEM_WT[d.getUTCDay()] + ", " + s : s;
  }

  // Wochenenden auf den Montag schieben (Feiertage werden im Text berücksichtigt)
  function semBankTag(tag) {
    var wd = new Date(tag * 86400000).getUTCDay();
    if (wd === 6) return tag + 2;
    if (wd === 0) return tag + 1;
    return tag;
  }

  function semTagCompact(tag) {
    var d = new Date(tag * 86400000);
    return d.getUTCFullYear() + ("0" + (d.getUTCMonth() + 1)).slice(-2) + ("0" + d.getUTCDate()).slice(-2);
  }

  function semConfig(data) {
    var b = (data && data.buchung) || {};
    function n(v, def) { var x = semNum(v); return x === null ? def : x; }
    return {
      webhook: String(b.webhook_url || "").trim(),
      anschrift: b.anschrift || "Auf dem Schmaarkamp 1b, 21339 Lüneburg",
      ort: b.ort || "Auf dem Schmaarkamp 1b, 21339 Lüneburg",
      email: b.kontakt_email || "info@fightanddefense.de",
      veranstalter: b.veranstalter || "Fight & Defense GbR",
      kontoinhaber: b.kontoinhaber || "Fight & Defense GbR",
      iban: b.iban || "",
      bic: b.bic || "",
      bank: b.bank || "",
      glaeubigerId: b.glaeubiger_id || "",
      ust: n(b.ust_satz, 19),
      ueberweisungTage: n(b.ueberweisung_frist_tage, 7),
      anmeldeschluss: n(b.anmeldeschluss_tage, 2),
      maxWeitere: n(b.max_weitere_personen, 5),
      einzugTageVor: n(b.einzug_tage_vor, 7),
      vorabTage: n(b.vorabinformation_tage, 2),
      stornoN2: n(b.storno_stufe2_ab_tage, 14),
      stornoP2: n(b.storno_stufe2_prozent, 50),
      stornoN3: n(b.storno_stufe3_ab_tage, 7),
      stornoP3: n(b.storno_stufe3_prozent, 100),
      stornoZusatz: b.storno_zusatz || SEM_STORNO_ZUSATZ,
      teilnahmeText: b.teilnahme_text ||
        "Ich bin gesundheitlich in der Lage, an dem Seminar teilzunehmen, und nehme auf eigene Verantwortung teil."
    };
  }

  function semPreise(termin, standard) {
    var quelle = (termin.preise && termin.preise.length) ? termin.preise : (standard || []);
    var out = [];
    quelle.forEach(function (p) {
      var betrag = semNum(p && p.betrag);
      if (!p || !p.bezeichnung || betrag === null || betrag < 0) return;
      out.push({ bezeichnung: String(p.bezeichnung), betrag: betrag, nachweis: String(p.nachweis_hinweis || "") });
    });
    return out;
  }

  // Stornofristen für einen Seminarbeginn (bTag) berechnen.
  // Stufe 2 gilt ab N2 Tagen vor Beginn, Stufe 3 ab N3 Tagen vor Beginn.
  function semStorno(cfg, bTag, heute) {
    var t2von = bTag - cfg.stornoN2;   // erster Tag mit Stornogebühr Stufe 2
    var t1 = t2von - 1;                // letzter kostenfreier Tag
    var t3ab = bTag - cfg.stornoN3;    // erster Tag mit Stornogebühr Stufe 3
    var t2bis = t3ab - 1;              // letzter Tag der Stufe 2
    return {
      t1: t1, t2von: t2von, t2bis: t2bis, t3ab: t3ab,
      aktuell: heute < t2von ? 1 : (heute < t3ab ? 2 : 3)
    };
  }

  function semStornoText(cfg, st, betrag) {
    function pct(p) {
      var s = p + " % des gezahlten Preises";
      if (betrag !== null && betrag !== undefined) s += " (" + semEuro(Math.round(betrag * p) / 100) + ")";
      return s;
    }
    var z = [];
    z.push("Bis einschließlich " + semTagFmt(st.t1, true) + " (mehr als " + cfg.stornoN2 + " Tage vor Seminarbeginn): kostenfrei, volle Erstattung.");
    if (st.t2von <= st.t2bis) {
      var bis = cfg.stornoN3 + 1;
      z.push("Vom " + semTagFmt(st.t2von, true) + " bis einschließlich " + semTagFmt(st.t2bis, true) +
        " (" + (bis === cfg.stornoN2 ? bis + " Tage" : cfg.stornoN2 + " bis " + bis + " Tage") +
        " vor Seminarbeginn): Stornogebühr " + pct(cfg.stornoP2) + ".");
    }
    z.push("Ab " + semTagFmt(st.t3ab, true) + " (" + cfg.stornoN3 + " Tage vor Seminarbeginn und später) sowie bei Nichterscheinen: Stornogebühr " + pct(cfg.stornoP3) + ".");
    z.push("Die Stornierung erfolgt per E-Mail an " + cfg.email + "; maßgeblich ist der Eingang der Nachricht.");
    return z;
  }

  function semIbanOk(iban) {
    var s = String(iban || "").replace(/\s+/g, "").toUpperCase();
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(s)) return false;
    if (s.slice(0, 2) === "DE" && s.length !== 22) return false;
    var r = s.slice(4) + s.slice(0, 4), rem = 0;
    for (var i = 0; i < r.length; i++) {
      var c = r.charCodeAt(i);
      var v = c >= 65 ? String(c - 55) : r.charAt(i);
      for (var j = 0; j < v.length; j++) rem = (rem * 10 + (+v.charAt(j))) % 97;
    }
    return rem === 1;
  }

  function semIbanFmt(iban) {
    return String(iban || "").replace(/\s+/g, "").toUpperCase().replace(/(.{4})/g, "$1 ").trim();
  }

  function semIbanMask(iban) {
    var s = String(iban || "").replace(/\s+/g, "").toUpperCase();
    return s.slice(0, 4) + " **** **** **** " + s.slice(-4);
  }

  function semRef(bTag) {
    var abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", out = "", arr = null;
    try {
      arr = new Uint8Array(5);
      (window.crypto || window.msCrypto).getRandomValues(arr);
    } catch (e) { arr = null; }
    for (var i = 0; i < 5; i++) {
      out += abc.charAt((arr ? arr[i] : Math.floor(Math.random() * 256)) % abc.length);
    }
    return "FD-" + semTagCompact(bTag) + "-" + out;
  }

  // ----- Styles für Chips und Buchungsformular (einmalig eingefügt) -----
  function semInjectCss() {
    if (document.getElementById("fudb-css")) return;
    var css =
      '.termin-chip--buchbar{cursor:pointer;}' +
      '.termin-chip-preis{margin-left:.55rem;padding-left:.55rem;border-left:1px solid rgba(26,184,232,.5);opacity:.9;}' +
      '.termin-chip--voll{border-color:var(--border);color:var(--muted);background:transparent;cursor:default;}' +
      '.termin-chip--voll:hover{background:transparent;color:var(--muted);}' +
      '.seminar-hinweis{color:var(--muted);font-size:.8rem;margin:.9rem 0 0;line-height:1.5;}' +
      '.fudb-overlay{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.78);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:1.5rem 1rem;-webkit-overflow-scrolling:touch;}' +
      '.fudb-overlay[hidden]{display:none;}' +
      '.fudb-dialog{position:relative;width:100%;max-width:680px;background:var(--card);border:1px solid var(--border);border-top:3px solid var(--blue);border-radius:6px;padding:1.8rem 1.6rem 2rem;margin:auto;box-shadow:0 0 40px var(--glow);color:var(--white);text-align:left;outline:none;}' +
      '.fudb-close{position:absolute;top:.5rem;right:.7rem;background:none;border:0;color:var(--muted);font-size:2rem;line-height:1;cursor:pointer;padding:.2rem .5rem;}' +
      '.fudb-close:hover{color:var(--white);}' +
      '.fudb-kicker{font-family:"Barlow Condensed",sans-serif;font-size:.8rem;letter-spacing:.15em;text-transform:uppercase;color:var(--blue);margin:0 0 .3rem;}' +
      '.fudb-titel{font-family:"Bebas Neue",sans-serif;font-size:2rem;letter-spacing:.03em;margin:0 0 .8rem;color:var(--white);}' +
      '.fudb-facts{font-size:.92rem;color:var(--muted);line-height:1.7;margin-bottom:1.2rem;}' +
      '.fudb-facts b{color:var(--white);font-weight:600;}' +
      '.fudb-beschr{margin-top:.7rem;max-height:130px;overflow-y:auto;border:1px solid var(--border);border-radius:4px;padding:.6rem .8rem;font-size:.85rem;line-height:1.55;background:rgba(0,0,0,.2);}' +
      '.fudb-frage{font-size:.92rem;color:var(--white);margin:.9rem 0 .5rem;}' +
      '.fudb-wp{border:1px solid var(--border);border-radius:4px;padding:.8rem .9rem .3rem;margin:0 0 .8rem;background:rgba(255,255,255,.02);}' +
      '.fudb-wp-kopf{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;font-family:"Barlow Condensed",sans-serif;letter-spacing:.1em;text-transform:uppercase;font-size:.85rem;color:var(--blue);}' +
      '.fudb-linkbtn{background:none;border:0;color:var(--muted);cursor:pointer;font-size:.85rem;text-decoration:underline;padding:0;}' +
      '.fudb-linkbtn:hover{color:var(--white);}' +
      '.fudb-btn2{background:transparent;border:1px solid var(--blue);color:var(--blue);padding:.55rem 1rem;border-radius:20px;cursor:pointer;font-size:.9rem;}' +
      '.fudb-btn2:hover{background:var(--blue);color:var(--black);}' +
      '.fudb-btn2:disabled{opacity:.4;cursor:default;}' +
      '#fudb input[type=date]{appearance:auto;-webkit-appearance:auto;width:100%;min-height:2.8rem;}' +
      '#fudb select{width:100%;}' +
      '.fudb-dsinfo{font-size:.8rem;line-height:1.5;color:var(--muted);margin:.2rem 0 .7rem;}' +
      '.fudb-set{border:0;border-top:1px solid var(--border);margin:0;padding:1.1rem 0 .4rem;min-width:0;}' +
      '.fudb-set legend{font-family:"Barlow Condensed",sans-serif;font-size:.95rem;letter-spacing:.1em;text-transform:uppercase;color:var(--blue);padding:0 .6rem 0 0;}' +
      '.fudb-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 .9rem;}' +
      '.fudb-grid .fudb-full{grid-column:1/-1;}' +
      '.fudb-grid .fudb-plz{grid-column:auto;}' +
      '#fudb label{display:block;font-family:"Barlow Condensed",sans-serif;font-size:.78rem;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin:0 0 .35rem;}' +
      '#fudb .fudb-field{margin-bottom:.9rem;}' +
      '#fudb input[type=text],#fudb input[type=email],#fudb input[type=tel]{width:100%;}' +
      '#fudb .fudb-invalid{border-color:#e8501a !important;box-shadow:0 0 0 3px rgba(232,80,26,.18) !important;}' +
      '#fudb label.fudb-choice,#fudb label.fudb-check{display:flex;gap:.7rem;align-items:flex-start;text-transform:none;letter-spacing:0;font-family:"Barlow",sans-serif;font-size:.92rem;color:var(--white);margin:0 0 .6rem;cursor:pointer;line-height:1.5;}' +
      '#fudb label.fudb-choice{border:1px solid var(--border);border-radius:4px;padding:.7rem .9rem;background:rgba(255,255,255,.03);}' +
      '#fudb label.fudb-choice:hover{border-color:var(--blue);}' +
      '#fudb label.fudb-choice em{display:block;font-style:normal;color:var(--muted);font-size:.85rem;}' +
      '#fudb label.fudb-choice small{display:block;color:var(--muted);font-size:.8rem;margin-top:.15rem;}' +
      '#fudb input[type=radio],#fudb input[type=checkbox]{appearance:auto;-webkit-appearance:auto;width:1.1rem;height:1.1rem;min-width:1.1rem;padding:0;margin:.2rem 0 0;accent-color:var(--blue);flex:none;box-shadow:none;}' +
      '.fudb-panel{border:1px solid var(--border);border-radius:4px;padding:1rem;margin:.2rem 0 .8rem;background:rgba(255,255,255,.02);font-size:.9rem;line-height:1.6;}' +
      '.fudb-panel[hidden]{display:none;}' +
      '.fudb-panel dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:.2rem .9rem;}' +
      '.fudb-panel dt{color:var(--muted);}' +
      '.fudb-panel dd{margin:0;color:var(--white);word-break:break-word;}' +
      '.fudb-mandat{max-height:210px;overflow-y:auto;font-size:.82rem;color:var(--muted);line-height:1.55;border:1px solid var(--border);border-radius:4px;padding:.8rem .9rem;margin:.4rem 0 .8rem;background:rgba(0,0,0,.25);}' +
      '.fudb-mandat b{color:var(--white);}' +
      '.fudb-storno{font-size:.88rem;line-height:1.55;color:var(--muted);border:1px solid var(--border);border-radius:4px;padding:.8rem .9rem;margin:.2rem 0 .9rem;background:rgba(0,0,0,.25);}' +
      '.fudb-storno ul{margin:.3rem 0 .5rem 1.1rem;padding:0;}' +
      '.fudb-storno li{margin-bottom:.25rem;}' +
      '.fudb-storno li.fudb-aktuell{color:var(--white);font-weight:600;}' +
      '.fudb-storno p{margin:.4rem 0 0;}' +
      '.fudb-warn{color:#ffb86b;font-weight:600;}' +
      '.fudb-summary{margin:1.1rem 0 .9rem;padding:.9rem 1rem;border:1px solid var(--blue);border-radius:4px;background:rgba(26,184,232,.08);font-size:.95rem;line-height:1.6;}' +
      '.fudb-summary strong{font-size:1.25rem;color:var(--white);}' +
      '.fudb-submit{display:block;width:100%;background:var(--blue);color:var(--black);border:0;font-family:"Barlow Condensed",sans-serif;font-weight:700;font-size:1.1rem;letter-spacing:.1em;text-transform:uppercase;padding:.95rem;cursor:pointer;clip-path:polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%);transition:background .2s,box-shadow .2s;}' +
      '.fudb-submit:hover:not(:disabled){background:#fff;box-shadow:0 0 30px var(--glow);}' +
      '.fudb-submit:disabled{opacity:.6;cursor:wait;}' +
      '.fudb-error{color:#ff8a65;font-size:.9rem;margin:.8rem 0 0;line-height:1.5;}' +
      '.fudb-error[hidden]{display:none;}' +
      '.fudb-hp{position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;}' +
      '.fudb-done h3{font-family:"Bebas Neue",sans-serif;font-size:2rem;color:var(--blue);margin:0 0 .6rem;}' +
      '.fudb-done p{line-height:1.65;font-size:.95rem;color:var(--muted);}' +
      '.fudb-done p strong,.fudb-done dd{color:var(--white);}' +
      '@media (max-width:560px){.fudb-dialog{padding:1.4rem 1rem 1.6rem;}.fudb-grid{grid-template-columns:1fr;}.fudb-titel{font-size:1.7rem;}}';
    var st = document.createElement("style");
    st.id = "fudb-css";
    st.textContent = css;
    document.head.appendChild(st);
  }

  // ----- Buchungsformular (Modal) -----
  var semModal = null;
  var semState = null;
  var semLastFocus = null;

  function semBuildModal() {
    if (semModal) return semModal;
    semInjectCss();
    var el = document.createElement("div");
    el.id = "fudb";
    el.className = "fudb-overlay";
    el.hidden = true;
    el.innerHTML =
      '<div class="fudb-dialog" role="dialog" aria-modal="true" aria-labelledby="fudb-titel" tabindex="-1">' +
        '<button type="button" class="fudb-close" id="fudb-close" aria-label="Schließen">&times;</button>' +
        '<div id="fudb-formview">' +
          '<p class="fudb-kicker">Verbindliche Buchung</p>' +
          '<h3 class="fudb-titel" id="fudb-titel"></h3>' +
          '<div class="fudb-facts" id="fudb-facts"></div>' +
          '<form id="fudb-form" novalidate>' +
            '<fieldset class="fudb-set"><legend>1 · Ticket wählen</legend><div id="fudb-preise"></div></fieldset>' +
            '<fieldset class="fudb-set"><legend>2 · Deine Daten</legend>' +
              '<div class="fudb-grid">' +
                '<div class="fudb-field"><label for="fudb-vorname">Vorname *</label><input type="text" id="fudb-vorname" name="vorname" autocomplete="given-name"></div>' +
                '<div class="fudb-field"><label for="fudb-nachname">Nachname *</label><input type="text" id="fudb-nachname" name="nachname" autocomplete="family-name"></div>' +
                '<div class="fudb-field fudb-full"><label for="fudb-strasse">Straße und Hausnummer *</label><input type="text" id="fudb-strasse" name="strasse" autocomplete="street-address"></div>' +
                '<div class="fudb-field"><label for="fudb-plz">PLZ *</label><input type="text" id="fudb-plz" name="plz" inputmode="numeric" autocomplete="postal-code"></div>' +
                '<div class="fudb-field"><label for="fudb-ort">Ort *</label><input type="text" id="fudb-ort" name="ort" autocomplete="address-level2"></div>' +
                '<div class="fudb-field"><label for="fudb-email">E-Mail *</label><input type="email" id="fudb-email" name="email" autocomplete="email"></div>' +
                '<div class="fudb-field"><label for="fudb-telefon">Telefon (optional)</label><input type="tel" id="fudb-telefon" name="telefon" autocomplete="tel"></div>' +
              '</div>' +
              '<div id="fudb-weitere-wrap">' +
                '<p class="fudb-frage">Möchtest du weitere Personen anmelden?</p>' +
                '<label class="fudb-choice"><input type="radio" name="weitere" value="nein" checked><span><b>Nein, nur mich</b></span></label>' +
                '<label class="fudb-choice"><input type="radio" name="weitere" value="ja"><span><b>Ja, weitere Personen</b><small>Für jede Person fällt ein eigenes Ticket an. Die Zahlung erfolgt gesammelt über deine Buchung.</small></span></label>' +
                '<div class="fudb-panel" id="fudb-weitere-panel" hidden>' +
                  '<div id="fudb-weitere-liste"></div>' +
                  '<button type="button" class="fudb-btn2" id="fudb-weitere-add">+ Weitere Person hinzufügen</button>' +
                  '<p class="fudb-dsinfo" id="fudb-weitere-max" style="margin-top:.6rem"></p>' +
                '</div>' +
              '</div>' +
            '</fieldset>' +
            '<fieldset class="fudb-set"><legend>3 · Zahlungsart</legend>' +
              '<label class="fudb-choice"><input type="radio" name="zahlungsart" value="ueberweisung" checked><span><b>Überweisung</b><small id="fudb-ue-hinweis"></small></span></label>' +
              '<div class="fudb-panel" id="fudb-pay-ueberweisung"></div>' +
              '<label class="fudb-choice" id="fudb-ls-choice"><input type="radio" name="zahlungsart" value="lastschrift"><span><b>SEPA-Lastschrift</b><small id="fudb-ls-hinweis"></small></span></label>' +
              '<div class="fudb-panel" id="fudb-pay-lastschrift" hidden>' +
                '<div class="fudb-field"><label for="fudb-kontoinhaber">Kontoinhaber *</label><input type="text" id="fudb-kontoinhaber" name="kontoinhaber" autocomplete="off"></div>' +
                '<div class="fudb-field"><label for="fudb-iban">IBAN *</label><input type="text" id="fudb-iban" name="iban" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="DE00 0000 0000 0000 0000 00"></div>' +
                '<div class="fudb-field"><label for="fudb-kianschrift">Anschrift des Kontoinhabers (nur wenn abweichend von deiner Anschrift)</label><input type="text" id="fudb-kianschrift" name="ki_anschrift" autocomplete="off" placeholder="Straße Hausnummer, PLZ Ort"></div>' +
                '<div class="fudb-mandat" id="fudb-mandat"></div>' +
                '<label class="fudb-check"><input type="checkbox" name="zustimmung_mandat"><span>Ich erteile das SEPA-Lastschriftmandat (einmalige Zahlung) und stimme der Verkürzung der Vorabinformation wie oben beschrieben zu. *</span></label>' +
              '</div>' +
            '</fieldset>' +
            '<fieldset class="fudb-set"><legend>4 · Bedingungen</legend>' +
              '<div class="fudb-storno" id="fudb-storno"></div>' +
              '<label class="fudb-check"><input type="checkbox" name="zustimmung_storno"><span>Ich habe die Stornobedingungen gelesen und akzeptiere sie. Mir ist bekannt, dass für diesen Vertrag kein gesetzliches Widerrufsrecht besteht (§ 312g Abs. 2 Nr. 9 BGB). *</span></label>' +
              '<label class="fudb-check" id="fudb-weitere-zust-wrap" hidden><input type="checkbox" name="zustimmung_weitere"><span>Ich bin berechtigt, die weiteren Personen anzumelden und ihre Daten anzugeben. Für Minderjährige bin ich erziehungsberechtigt. Die Bedingungen und Bestätigungen gelten auch für die weiteren Personen. *</span></label>' +
              '<label class="fudb-check" id="fudb-nachweis-wrap" hidden><input type="checkbox" name="zustimmung_nachweis"><span id="fudb-nachweis-text"></span></label>' +
              '<label class="fudb-check"><input type="checkbox" name="zustimmung_teilnahme"><span id="fudb-teilnahme-text"></span></label>' +
              '<p class="fudb-dsinfo"><b style="color:var(--white)">Datenschutz:</b> Wir verarbeiten deine Angaben, um das Seminar zu buchen und abzurechnen (Art. 6 Abs. 1 lit. b DSGVO). ' +
                'Die Daten werden dafür über unsere Dienstleister Make, Google (Buchungsliste) und Microsoft (E-Mail-Versand) verarbeitet und nach Ablauf der gesetzlichen Aufbewahrungsfristen gelöscht. ' +
                'Die Angabe deiner Telefonnummer ist freiwillig. Meldest du weitere Personen an, verarbeiten wir auch deren Namen und Geburtsdaten für die Anmeldung. Alle Informationen findest du in der Datenschutzerklärung.</p>' +
              '<label class="fudb-check"><input type="checkbox" name="zustimmung_datenschutz"><span>Ich habe die <a href="datenschutz.html" target="_blank" rel="noopener" style="color:var(--blue);">Datenschutzerklärung</a> zur Kenntnis genommen. *</span></label>' +
            '</fieldset>' +
            '<div class="fudb-hp" aria-hidden="true"><label>Bitte leer lassen<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
            '<div class="fudb-summary" id="fudb-summary"></div>' +
            '<button type="submit" class="fudb-submit" id="fudb-submit">Zahlungspflichtig buchen</button>' +
            '<p class="fudb-error" id="fudb-error" role="alert" hidden></p>' +
          '</form>' +
        '</div>' +
        '<div id="fudb-doneview" class="fudb-done" hidden></div>' +
      '</div>';
    document.body.appendChild(el);
    semModal = el;

    el.addEventListener("click", function (ev) { if (ev.target === el) semCloseBuchung(); });
    el.querySelector("#fudb-close").addEventListener("click", semCloseBuchung);
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && semModal && !semModal.hidden) semCloseBuchung();
    });
    var form = el.querySelector("#fudb-form");
    form.addEventListener("submit", semSubmit);
    form.addEventListener("change", function (ev) {
      var n = ev.target && ev.target.name;
      if (n === "preis") semUpdatePreis();
      if (n === "zahlungsart") semUpdateZahlungsart();
      if (n === "weitere") semUpdateWeitere(true);
      if (ev.target && ev.target.classList && ev.target.classList.contains("fudb-wp-tk")) semUpdatePreis();
    });
    form.addEventListener("click", function (ev) {
      var t = ev.target;
      if (!t) return;
      if (t.id === "fudb-weitere-add") { semAddWeitere(); semUpdatePreis(); }
      if (t.classList && t.classList.contains("fudb-wp-del")) {
        var row = t.closest(".fudb-wp");
        if (row && row.parentNode) row.parentNode.removeChild(row);
        semUpdateWeitere(false);
        semUpdatePreis();
      }
    });
    form.addEventListener("input", function (ev) {
      if (ev.target && ev.target.classList) ev.target.classList.remove("fudb-invalid");
      if (ev.target && ev.target.name === "nachname") {
        var vwz = el.querySelector("#fudb-vwz");
        if (vwz && semState) vwz.textContent = semState.ref + (ev.target.value.trim() ? " " + ev.target.value.trim() : "");
      }
    });
    return el;
  }

  function semCloseBuchung() {
    if (!semModal) return;
    semModal.hidden = true;
    document.body.style.overflow = semState && semState.bodyOverflow !== undefined ? semState.bodyOverflow : "";
    if (semLastFocus && semLastFocus.focus) { try { semLastFocus.focus(); } catch (e) {} }
  }

  function semOpenBuchung(kurs, termin, cfg, preise) {
    var el = semBuildModal();
    var heute = semHeute();
    var b = semParseBeginn(termin.beginn);
    var ls = {};
    ls.einzug = semBankTag(Math.max(b.tag - cfg.einzugTageVor, heute + cfg.vorabTage + 1));
    ls.moeglich = ls.einzug <= b.tag - 1 && !!cfg.glaeubigerId;
    var faellig = Math.max(heute, Math.min(heute + cfg.ueberweisungTage, b.tag - 1));

    semState = {
      kurs: kurs, termin: termin, cfg: cfg, preise: preise, b: b, heute: heute,
      ref: semRef(b.tag), ls: ls, faellig: faellig, offenSeit: Date.now(), sending: false,
      bodyOverflow: document.body.style.overflow
    };
    semLastFocus = document.activeElement;

    el.querySelector("#fudb-formview").hidden = false;
    el.querySelector("#fudb-doneview").hidden = true;
    el.querySelector("#fudb-doneview").innerHTML = "";
    el.querySelector("#fudb-form").reset();
    var err = el.querySelector("#fudb-error");
    err.hidden = true; err.textContent = "";
    var btn = el.querySelector("#fudb-submit");
    btn.disabled = false;
    btn.textContent = "Zahlungspflichtig buchen";
    Array.prototype.forEach.call(el.querySelectorAll(".fudb-invalid"), function (x) { x.classList.remove("fudb-invalid"); });

    el.querySelector("#fudb-titel").textContent = (kurs.titel || "Seminar");
    el.querySelector("#fudb-facts").innerHTML =
      '<b>Termin:</b> ' + semEsc((termin.datum || "").trim() || semTagFmt(b.tag, true)) + '<br>' +
      '<b>Ort:</b> ' + semEsc(cfg.ort) +
      (kurs.text ? '<div class="fudb-beschr"><b>Leistung:</b><br>' + semEsc(kurs.text).replace(/\n/g, "<br>") + '</div>' : '');

    // Preise
    var html = "";
    preise.forEach(function (p, i) {
      html += '<label class="fudb-choice"><input type="radio" name="preis" value="' + i + '"' + (i === 0 ? " checked" : "") + '>' +
        '<span><b>' + semEsc(p.bezeichnung) + '</b><em>' + semEuro(p.betrag) + ' inkl. ' + semEsc(String(cfg.ust).replace(".", ",")) + ' % MwSt.</em>' +
        (p.nachweis ? '<small>Nachweis erforderlich: ' + semEsc(p.nachweis) + '</small>' : '') + '</span></label>';
    });
    el.querySelector("#fudb-preise").innerHTML = html;

    // Überweisung
    var ue = el.querySelector("#fudb-pay-ueberweisung");
    ue.innerHTML =
      '<dl>' +
      '<dt>Empfänger</dt><dd>' + semEsc(cfg.kontoinhaber) + '</dd>' +
      '<dt>IBAN</dt><dd>' + semEsc(semIbanFmt(cfg.iban)) + '</dd>' +
      (cfg.bic ? '<dt>BIC</dt><dd>' + semEsc(cfg.bic) + '</dd>' : '') +
      (cfg.bank ? '<dt>Bank</dt><dd>' + semEsc(cfg.bank) + '</dd>' : '') +
      '<dt>Verwendungszweck</dt><dd id="fudb-vwz"></dd>' +
      '<dt>Zahlbar bis</dt><dd>' + semTagFmt(faellig, true) + '</dd>' +
      '</dl>' +
      '<p style="margin:.7rem 0 0;color:var(--muted);">Die Daten erhältst du zusätzlich in der Buchungsbestätigung per E-Mail.</p>';
    el.querySelector("#fudb-ue-hinweis").textContent = "Bitte überweise den Betrag bis zum " + semTagFmt(faellig, false) + ".";

    // Lastschrift
    var lsChoice = el.querySelector("#fudb-ls-choice");
    var lsRadio = lsChoice.querySelector("input");
    lsRadio.disabled = !ls.moeglich;
    lsChoice.style.opacity = ls.moeglich ? "" : ".5";
    el.querySelector("#fudb-ls-hinweis").textContent = ls.moeglich
      ? "Der Einzug erfolgt am " + semTagFmt(ls.einzug, false) + " (bei Bankfeiertag am nächsten Bankarbeitstag)."
      : (cfg.glaeubigerId ? "Für diesen Termin leider nicht mehr möglich (zu kurzfristig)." : "Derzeit nicht verfügbar.");

    el.querySelector("#fudb-weitere-liste").innerHTML = "";
    el.querySelector("#fudb-weitere-panel").hidden = true;
    el.querySelector("#fudb-weitere-wrap").hidden = !(cfg.maxWeitere > 0);
    el.querySelector("#fudb-weitere-max").textContent = "Du kannst bis zu " + cfg.maxWeitere + " weitere Personen angeben.";

    semState.bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el.hidden = false;
    el.scrollTop = 0;
    semUpdateZahlungsart();
    semUpdatePreis();
    var dlg = el.querySelector(".fudb-dialog");
    if (dlg && dlg.focus) dlg.focus();
  }

  function semAktPreis() {
    var f = semModal.querySelector("#fudb-form");
    var sel = f.querySelector('input[name="preis"]:checked');
    var idx = sel ? parseInt(sel.value, 10) : 0;
    return semState.preise[idx] || semState.preise[0];
  }

  // ----- Weitere Personen -----
  function semWeitereAktiv() {
    var r = semModal.querySelector('input[name="weitere"]:checked');
    return !!r && r.value === "ja" && semState.cfg.maxWeitere > 0;
  }

  function semAddWeitere() {
    var s = semState, liste = semModal.querySelector("#fudb-weitere-liste");
    var anzahl = liste.querySelectorAll(".fudb-wp").length;
    if (anzahl >= s.cfg.maxWeitere) return;
    var hauptIdx = semAktPreis() ? s.preise.indexOf(semAktPreis()) : 0;
    var opts = s.preise.map(function (p, i) {
      return '<option value="' + i + '"' + (i === hauptIdx ? " selected" : "") + '>' + semEsc(p.bezeichnung) + " – " + semEuro(p.betrag) + '</option>';
    }).join("");
    var div = document.createElement("div");
    div.className = "fudb-wp";
    div.innerHTML =
      '<div class="fudb-wp-kopf"><span class="fudb-wp-nr"></span><button type="button" class="fudb-linkbtn fudb-wp-del">Entfernen</button></div>' +
      '<div class="fudb-grid">' +
        '<div class="fudb-field"><label>Vorname *</label><input type="text" class="fudb-wp-vn" autocomplete="off"></div>' +
        '<div class="fudb-field"><label>Nachname *</label><input type="text" class="fudb-wp-nn" autocomplete="off"></div>' +
        '<div class="fudb-field"><label>Geburtsdatum *</label><input type="date" class="fudb-wp-gb" max="' + semIsoHeute() + '" min="1900-01-01"></div>' +
        '<div class="fudb-field"><label>Ticket</label><select class="fudb-wp-tk">' + opts + '</select></div>' +
      '</div>';
    liste.appendChild(div);
    semUpdateWeitere(false);
  }

  function semIsoHeute() {
    return semTagFmt(semHeute(), false).split(".").reverse().join("-");
  }

  function semUpdateWeitere(umgeschaltet) {
    var el = semModal, liste = el.querySelector("#fudb-weitere-liste");
    var aktiv = semWeitereAktiv();
    el.querySelector("#fudb-weitere-panel").hidden = !aktiv;
    if (aktiv && umgeschaltet && !liste.querySelector(".fudb-wp")) semAddWeitere();
    var rows = liste.querySelectorAll(".fudb-wp");
    Array.prototype.forEach.call(rows, function (r, i) {
      r.querySelector(".fudb-wp-nr").textContent = "Person " + (i + 2);
    });
    el.querySelector("#fudb-weitere-add").disabled = rows.length >= semState.cfg.maxWeitere;
    var hat = aktiv && rows.length > 0;
    var zw = el.querySelector("#fudb-weitere-zust-wrap");
    zw.hidden = !hat;
    if (!hat) zw.querySelector("input").checked = false;
    semUpdatePreis();
  }

  // Liefert alle Teilnehmer: zuerst die buchende Person, danach die weiteren
  function semPersonen() {
    var s = semState;
    var out = [{ haupt: true, vorname: "", nachname: "", geb: "", preis: semAktPreis() }];
    if (!semWeitereAktiv()) return out;
    Array.prototype.forEach.call(semModal.querySelectorAll(".fudb-wp"), function (r) {
      var idx = parseInt(r.querySelector(".fudb-wp-tk").value, 10);
      out.push({
        haupt: false,
        vorname: r.querySelector(".fudb-wp-vn").value.trim(),
        nachname: r.querySelector(".fudb-wp-nn").value.trim(),
        geb: r.querySelector(".fudb-wp-gb").value.trim(),
        preis: s.preise[idx] || s.preise[0],
        zeile: r
      });
    });
    return out;
  }

  function semGesamt(personen) {
    return personen.reduce(function (sum, x) { return sum + x.preis.betrag; }, 0);
  }

  // Geburtsdatum aus <input type=date> (JJJJ-MM-TT) oder Text (TT.MM.JJJJ) -> {iso, de} oder null
  function semGeb(str) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str) || null, y, mo, d;
    if (m) { y = +m[1]; mo = +m[2]; d = +m[3]; }
    else {
      var t = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(str);
      if (!t) return null;
      d = +t[1]; mo = +t[2]; y = +t[3];
    }
    var dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
    if (y < 1900) return null;
    var tag = Math.round(dt.getTime() / 86400000);
    if (tag > semHeute()) return null;
    return { iso: y + "-" + ("0" + mo).slice(-2) + "-" + ("0" + d).slice(-2), de: ("0" + d).slice(-2) + "." + ("0" + mo).slice(-2) + "." + y };
  }

  function semUpdatePreis() {
    var s = semState, cfg = s.cfg;
    var personen = semPersonen();
    var gesamt = semGesamt(personen);
    var el = semModal;
    // Verwendungszweck
    var nn = (el.querySelector("#fudb-nachname").value || "").trim();
    var vwz = el.querySelector("#fudb-vwz");
    if (vwz) vwz.textContent = s.ref + (nn ? " " + nn : "");
    // Nachweis-Checkbox (gilt für alle Personen mit Nachweis-Ticket)
    var nw = el.querySelector("#fudb-nachweis-wrap");
    var mitNachweis = personen.filter(function (x) { return x.preis.nachweis; });
    if (mitNachweis.length) {
      var seen = {}, teile = [];
      mitNachweis.forEach(function (x) {
        var k = x.preis.bezeichnung + "|" + x.preis.nachweis;
        if (!seen[k]) { seen[k] = 1; teile.push("„" + x.preis.bezeichnung + "“: " + x.preis.nachweis); }
      });
      nw.hidden = false;
      el.querySelector("#fudb-nachweis-text").textContent = personen.length === 1
        ? "Ich bestätige, dass ich Anspruch auf den Preis „" + mitNachweis[0].preis.bezeichnung + "“ habe (" + mitNachweis[0].preis.nachweis + ") und den Nachweis am Seminartag vorlege. *"
        : "Ich bestätige, dass für die gewählten ermäßigten Tickets (" + teile.join("; ") + ") jeweils ein Anspruch besteht und die Nachweise am Seminartag vorgelegt werden. *";
    } else {
      nw.hidden = true;
      nw.querySelector("input").checked = false;
    }
    el.querySelector("#fudb-teilnahme-text").textContent = cfg.teilnahmeText +
      (personen.length > 1 ? " Das gilt auch für die weiteren angemeldeten Personen." : "") + " *";
    // Storno (Gebühr bezieht sich auf den Gesamtpreis)
    var st = semStorno(cfg, s.b.tag, s.heute);
    var z = semStornoText(cfg, st, personen.length > 1 ? null : gesamt);
    var h = "<b style='color:var(--white)'>Stornobedingungen</b><ul>";
    z.slice(0, z.length - 1).forEach(function (t, i) {
      var aktiv = (i + 1 === st.aktuell) || (st.t2von > st.t2bis && i === 1 && st.aktuell === 3);
      h += "<li" + (aktiv ? ' class="fudb-aktuell"' : "") + ">" + semEsc(t) + "</li>";
    });
    h += "</ul>";
    if (st.aktuell > 1) {
      h += "<p class='fudb-warn'>Wichtig: Der Seminarbeginn liegt innerhalb der letzten " +
        (st.aktuell === 2 ? cfg.stornoN2 : cfg.stornoN3) +
        " Tage. Für diese Buchung gilt daher bereits jetzt eine Stornogebühr von " +
        (st.aktuell === 2 ? cfg.stornoP2 : cfg.stornoP3) + " % des gezahlten Preises.</p>";
    }
    s.stornoEinzel = personen.length > 1
      ? "Bei einer Buchung mit mehreren Teilnehmern kann jede Person einzeln storniert werden. Die Stornogebühr berechnet sich dann vom Ticketpreis der stornierten Person."
      : "";
    if (s.stornoEinzel) h += "<p>" + semEsc(s.stornoEinzel) + "</p>";
    h += "<p>" + semEsc(z[z.length - 1]) + "</p><p>" + semEsc(cfg.stornoZusatz) + "</p><p>" + semEsc(SEM_WIDERRUF) + "</p>";
    el.querySelector("#fudb-storno").innerHTML = h;
    s.stornoZeilen = z;
    s.stornoStufe = st;
    semUpdateMandat();
    semUpdateSummary();
  }

  function semUpdateMandat() {
    var s = semState, cfg = s.cfg, personen = semPersonen(), gesamt = semGesamt(personen);
    var iban = semModal.querySelector("#fudb-iban").value;
    var m =
      "<b>SEPA-Lastschriftmandat (einmalige Zahlung)</b><br>" +
      "Zahlungsempfänger: " + semEsc(cfg.veranstalter) + ", " + semEsc(cfg.anschrift) + "<br>" +
      "Gläubiger-Identifikationsnummer: " + semEsc(cfg.glaeubigerId) + "<br>" +
      "Mandatsreferenz: " + semEsc(s.ref) + "<br><br>" +
      "Ich ermächtige die " + semEsc(cfg.veranstalter) + ", die Zahlung von " + semEuro(gesamt) +
      " (Seminargebühr „" + semEsc(s.kurs.titel || "Seminar") + "“, " + semEsc(semTagFmt(s.b.tag, false)) +
      (personen.length > 1 ? ", " + personen.length + " Teilnehmer" : "") + ") einmalig von meinem Konto mittels SEPA-Lastschrift einzuziehen. " +
      "Zugleich weise ich mein Kreditinstitut an, die von der " + semEsc(cfg.veranstalter) + " auf mein Konto gezogene Lastschrift einzulösen.<br><br>" +
      "Hinweis: Ich kann innerhalb von acht Wochen, beginnend mit dem Belastungsdatum, die Erstattung des belasteten Betrages verlangen. " +
      "Es gelten dabei die mit meinem Kreditinstitut vereinbarten Bedingungen.<br><br>" +
      "Ich stimme zu, dass die 14-tägige Frist für die Vorabinformation (Pre-Notification) auf " + cfg.vorabTage + " Tage vor Fälligkeit verkürzt wird. " +
      "Die Vorabinformation mit Betrag und Fälligkeitsdatum erhalte ich mit der Buchungsbestätigung per E-Mail. " +
      "Der Einzug erfolgt am " + semEsc(semTagFmt(s.ls.einzug, false)) + " (fällt dieser Tag nicht auf einen Bankarbeitstag, am nächsten Bankarbeitstag).";
    semModal.querySelector("#fudb-mandat").innerHTML = m;
    s.mandatText = m.replace(/<br>/g, "\n").replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    s.ibanVorschau = iban;
  }

  function semZahlungsart() {
    var r = semModal.querySelector('input[name="zahlungsart"]:checked');
    return r ? r.value : "ueberweisung";
  }

  function semUpdateZahlungsart() {
    var za = semZahlungsart();
    semModal.querySelector("#fudb-pay-ueberweisung").hidden = (za !== "ueberweisung");
    semModal.querySelector("#fudb-pay-lastschrift").hidden = (za !== "lastschrift");
    if (za === "lastschrift") {
      var ki = semModal.querySelector("#fudb-kontoinhaber");
      if (!ki.value) {
        var vn = (semModal.querySelector("#fudb-vorname").value || "").trim();
        var nn = (semModal.querySelector("#fudb-nachname").value || "").trim();
        ki.value = (vn + " " + nn).trim();
      }
    }
    semUpdateSummary();
  }

  function semUpdateSummary() {
    var s = semState, za = semZahlungsart();
    var personen = semPersonen(), gesamt = semGesamt(personen);
    var t = "<strong>" + semEuro(gesamt) + "</strong> inkl. " + semEsc(String(s.cfg.ust).replace(".", ",")) + " % MwSt.<br>" +
      semEsc(s.kurs.titel || "Seminar") + " · " + semEsc(semTagFmt(s.b.tag, false)) + "<br>";
    if (personen.length === 1) {
      t += semEsc(personen[0].preis.bezeichnung) + "<br>";
    } else {
      personen.forEach(function (x, i) {
        var name = x.haupt ? "Du" : ((x.vorname + " " + x.nachname).trim() || "Person " + (i + 1));
        t += semEsc(name) + ": " + semEsc(x.preis.bezeichnung) + ", " + semEuro(x.preis.betrag) + "<br>";
      });
    }
    t += za === "lastschrift"
      ? "Zahlung per SEPA-Lastschrift, Einzug am " + semEsc(semTagFmt(s.ls.einzug, false)) + "."
      : "Zahlung per Überweisung bis zum " + semEsc(semTagFmt(s.faellig, false)) + ".";
    semModal.querySelector("#fudb-summary").innerHTML = t;
  }

  function semFehler(felder, nachricht) {
    var err = semModal.querySelector("#fudb-error");
    err.textContent = nachricht;
    err.hidden = false;
    var first = null;
    felder.forEach(function (n) {
      var f = semModal.querySelector('[name="' + n + '"]');
      if (!f) return;
      if (f.type === "checkbox" || f.type === "radio") {
        var l = f.closest("label"); if (l) l.classList.add("fudb-invalid");
      } else {
        f.classList.add("fudb-invalid");
      }
      if (!first) first = f;
    });
    if (first && first.focus) first.focus();
  }

  function semSubmit(ev) {
    ev.preventDefault();
    var s = semState;
    if (!s || s.sending) return;
    var cfg = s.cfg, form = semModal.querySelector("#fudb-form"), el = form.elements;
    Array.prototype.forEach.call(semModal.querySelectorAll(".fudb-invalid"), function (x) { x.classList.remove("fudb-invalid"); });
    semModal.querySelector("#fudb-error").hidden = true;

    function v(n) { return (el[n] && el[n].value || "").trim(); }
    var za = semZahlungsart();
    var personen = semPersonen();
    var p = personen[0].preis;
    var gesamt = semGesamt(personen);
    var mitNachweis = personen.filter(function (x) { return x.preis.nachweis; });
    var fehl = [];

    if (!v("vorname")) fehl.push("vorname");
    if (!v("nachname")) fehl.push("nachname");
    if (!v("strasse") || !/\d/.test(v("strasse"))) fehl.push("strasse");
    if (!/^[0-9A-Za-z \-]{4,10}$/.test(v("plz"))) fehl.push("plz");
    if (!v("ort")) fehl.push("ort");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email"))) fehl.push("email");
    if (fehl.length) {
      return semFehler(fehl, "Bitte prüfe die markierten Felder. Wir brauchen Name, vollständige Anschrift und eine gültige E-Mail-Adresse.");
    }

    if (personen.length > 1) {
      var wFehler = false, erster = null;
      personen.slice(1).forEach(function (x) {
        var r = x.zeile;
        [["fudb-wp-vn", !x.vorname], ["fudb-wp-nn", !x.nachname], ["fudb-wp-gb", !semGeb(x.geb)]].forEach(function (c) {
          var f = r.querySelector("." + c[0]);
          if (c[1]) { f.classList.add("fudb-invalid"); wFehler = true; if (!erster) erster = f; }
        });
      });
      if (wFehler) {
        var er = semModal.querySelector("#fudb-error");
        er.textContent = "Bitte gib für jede weitere Person Vor- und Nachname sowie ein gültiges Geburtsdatum an, oder entferne die Person.";
        er.hidden = false;
        if (erster && erster.focus) erster.focus();
        return;
      }
    }
    if (za === "lastschrift") {
      if (!s.ls.moeglich) return semFehler(["zahlungsart"], "Lastschrift ist für diesen Termin nicht mehr möglich. Bitte wähle Überweisung.");
      if (!v("kontoinhaber")) fehl.push("kontoinhaber");
      if (!semIbanOk(v("iban"))) fehl.push("iban");
      if (fehl.length) return semFehler(fehl, "Bitte prüfe Kontoinhaber und IBAN. Die IBAN scheint nicht gültig zu sein.");
      var kiName = v("kontoinhaber").toLowerCase().replace(/\s+/g, " ");
      var bestName = (v("vorname") + " " + v("nachname")).toLowerCase().replace(/\s+/g, " ");
      if (kiName !== bestName && !v("ki_anschrift")) {
        return semFehler(["ki_anschrift"], "Der Kontoinhaber weicht von deinem Namen ab. Bitte gib zusätzlich die Anschrift des Kontoinhabers an.");
      }
      if (!el.zustimmung_mandat.checked) return semFehler(["zustimmung_mandat"], "Bitte erteile das SEPA-Lastschriftmandat, wenn du per Lastschrift zahlen möchtest.");
    }
    if (!cfg.iban && za === "ueberweisung") {
      return semFehler([], "Die Online-Buchung ist gerade nicht verfügbar. Bitte schreib uns kurz an " + cfg.email + ".");
    }
    if (!el.zustimmung_storno.checked) fehl.push("zustimmung_storno");
    if (mitNachweis.length && !el.zustimmung_nachweis.checked) fehl.push("zustimmung_nachweis");
    if (personen.length > 1 && !el.zustimmung_weitere.checked) fehl.push("zustimmung_weitere");
    if (!el.zustimmung_teilnahme.checked) fehl.push("zustimmung_teilnahme");
    if (!el.zustimmung_datenschutz.checked) fehl.push("zustimmung_datenschutz");
    if (fehl.length) return semFehler(fehl, "Bitte bestätige die mit * gekennzeichneten Punkte, um zu buchen.");

    // Spam: Honeypot und Mindestdauer
    if (v("website") || (Date.now() - s.offenSeit) < 6000) {
      return semFehler([], "Bitte nimm dir einen Moment Zeit und sende das Formular erneut ab.");
    }
    if (!cfg.webhook) {
      return semFehler([], "Die Online-Buchung ist gerade nicht verfügbar. Bitte schreib uns kurz an " + cfg.email + ".");
    }

    var st = s.stornoStufe;
    var zeilen = s.stornoZeilen || [];
    var iban = v("iban").replace(/\s+/g, "").toUpperCase();
    var daten = {
      buchungsnummer: s.ref,
      zeitstempel: new Date().toISOString(),
      seite: location.href,
      seminar_titel: s.kurs.titel || "Seminar",
      seminar_datum: (s.termin.datum || "").trim() || semTagFmt(s.b.tag, true),
      seminar_beginn: s.b.iso,
      seminar_datum_kurz: semTagFmt(s.b.tag, true),
      seminar_ort: cfg.ort,
      preis_bezeichnung: p.bezeichnung,
      preis_betrag: gesamt.toFixed(2),
      preis_betrag_de: semEuro(gesamt),
      teilnehmer_anzahl: String(personen.length),
      positionen: personen.map(function (x) {
        if (x.haupt) return v("vorname") + " " + v("nachname") + " (buchende Person): " + x.preis.bezeichnung + ", " + semEuro(x.preis.betrag);
        var g = semGeb(x.geb);
        return x.vorname + " " + x.nachname + ", geb. " + (g ? g.de : x.geb) + ": " + x.preis.bezeichnung + ", " + semEuro(x.preis.betrag);
      }).join("\n"),
      weitere_personen: personen.slice(1).map(function (x) {
        var g = semGeb(x.geb);
        return x.vorname + " " + x.nachname + ", geb. " + (g ? g.de : x.geb) + ", " + x.preis.bezeichnung + " " + semEuro(x.preis.betrag);
      }).join("\n"),
      zustimmung_weitere: personen.length > 1 ? "ja" : "nicht erforderlich",
      ust_satz: String(cfg.ust),
      vorname: v("vorname"),
      nachname: v("nachname"),
      strasse: v("strasse"),
      plz: v("plz"),
      ort: v("ort"),
      email: v("email"),
      telefon: v("telefon"),
      zahlungsart: za,
      storno_frei_bis: semTagFmt(st.t1, true),
      storno_stufe2_von: semTagFmt(st.t2von, true),
      storno_stufe2_bis: semTagFmt(st.t2bis, true),
      storno_stufe3_ab: semTagFmt(st.t3ab, true),
      storno_aktuelle_stufe: String(st.aktuell),
      storno_text: zeilen.join("\n") + (s.stornoEinzel ? "\n" + s.stornoEinzel : "") + "\n" + cfg.stornoZusatz,
      widerruf_hinweis: SEM_WIDERRUF,
      zustimmung_storno: "ja",
      zustimmung_datenschutz: "ja",
      zustimmung_teilnahme: "ja",
      zustimmung_nachweis: mitNachweis.length ? "ja" : "nicht erforderlich",
      nachweis_hinweis: mitNachweis.map(function (x) { return x.preis.bezeichnung + ": " + x.preis.nachweis; }).filter(function (e, i, a) { return a.indexOf(e) === i; }).join("; "),
      veranstalter: cfg.veranstalter,
      veranstalter_anschrift: cfg.anschrift,
      ueberweisung_empfaenger: cfg.kontoinhaber,
      ueberweisung_iban: semIbanFmt(cfg.iban),
      ueberweisung_bic: cfg.bic,
      ueberweisung_bank: cfg.bank,
      verwendungszweck: s.ref + " " + v("nachname"),
      zahlung_faellig_bis: semTagFmt(s.faellig, true),
      website: ""
    };
    if (za === "lastschrift") {
      daten.kontoinhaber = v("kontoinhaber");
      daten.iban = iban;
      daten.iban_maskiert = semIbanMask(iban);
      daten.mandatsreferenz = s.ref;
      daten.glaeubiger_id = cfg.glaeubigerId;
      daten.einzugsdatum = semTagFmt(s.ls.einzug, true);
      daten.vorabinformation_tage = String(cfg.vorabTage);
      daten.kontoinhaber_anschrift = v("ki_anschrift") || (v("strasse") + ", " + v("plz") + " " + v("ort"));
      daten.mandat_zustimmung_zeit = new Date().toISOString();
      daten.mandat_text = s.mandatText +
        "\n\nZahlungspflichtiger (Kontoinhaber): " + daten.kontoinhaber +
        "\nAnschrift: " + daten.kontoinhaber_anschrift +
        "\nIBAN: " + semIbanFmt(iban) +
        "\nMandat erteilt am: " + daten.mandat_zustimmung_zeit + " (online, per Bestätigung im Buchungsformular)";
    }

    var body = new URLSearchParams();
    Object.keys(daten).forEach(function (k) { body.append(k, daten[k]); });

    s.sending = true;
    var btn = semModal.querySelector("#fudb-submit");
    btn.disabled = true;
    btn.textContent = "Wird gesendet …";

    fetch(cfg.webhook, { method: "POST", body: body })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        semErfolg(daten);
      })
      .catch(function (e) {
        console.warn(e);
        s.sending = false;
        btn.disabled = false;
        btn.textContent = "Zahlungspflichtig buchen";
        var err = semModal.querySelector("#fudb-error");
        err.hidden = false;
        err.innerHTML = "Die Buchung konnte nicht bestätigt werden. Bitte prüfe in ca. 10 Minuten dein E-Mail-Postfach (auch den Spam-Ordner). " +
          "Kommt keine Bestätigung, versuche es erneut oder schreib uns an <a href=\"mailto:" + semEsc(cfg.email) +
          "\" style=\"color:var(--blue);\">" + semEsc(cfg.email) + "</a> (Referenz: " + semEsc(s.ref) + ").";
      });
  }

  function semErfolg(d) {
    var s = semState, cfg = s.cfg;
    var done = semModal.querySelector("#fudb-doneview");
    var h = "<h3>Vielen Dank, " + semEsc(d.vorname) + "!</h3>" +
      "<p>Deine Buchung ist eingegangen. Die Buchungsbestätigung mit allen Details schicken wir an <strong>" + semEsc(d.email) + "</strong>. " +
      "Bitte schau auch im Spam-Ordner nach, falls nichts ankommt.</p>" +
      "<div class='fudb-panel'><dl>" +
      "<dt>Buchungsnummer</dt><dd>" + semEsc(d.buchungsnummer) + "</dd>" +
      "<dt>Seminar</dt><dd>" + semEsc(d.seminar_titel) + "</dd>" +
      "<dt>Termin</dt><dd>" + semEsc(d.seminar_datum) + "</dd>" +
      "<dt>Teilnehmer</dt><dd>" + semEsc(d.positionen).replace(/\n/g, "<br>") + "</dd>" +
      "<dt>Gesamtpreis</dt><dd>" + semEsc(d.preis_betrag_de) + "</dd>";
    if (d.zahlungsart === "lastschrift") {
      h += "<dt>Zahlung</dt><dd>SEPA-Lastschrift, Einzug am " + semEsc(d.einzugsdatum) + "</dd>" +
        "<dt>Konto</dt><dd>" + semEsc(d.iban_maskiert) + "</dd>";
    } else {
      h += "<dt>Zahlung</dt><dd>Überweisung bis " + semEsc(d.zahlung_faellig_bis) + "</dd>" +
        "<dt>Empfänger</dt><dd>" + semEsc(d.ueberweisung_empfaenger) + "</dd>" +
        "<dt>IBAN</dt><dd>" + semEsc(d.ueberweisung_iban) + "</dd>" +
        "<dt>Verwendungszweck</dt><dd>" + semEsc(d.verwendungszweck) + "</dd>";
    }
    h += "</dl></div>" +
      "<button type='button' class='fudb-submit' id='fudb-done-close'>Schließen</button>";
    done.innerHTML = h;
    semModal.querySelector("#fudb-formview").hidden = true;
    done.hidden = false;
    semModal.scrollTop = 0;
    done.querySelector("#fudb-done-close").addEventListener("click", semCloseBuchung);
  }

  // ----- Kurse / Termine / Karten -----
  function gruppiereSeminare(seminare) {
    var gruppen = [];
    var index = {};
    seminare.forEach(function (s) {
      var key = (s.titel || "") + "|" + (s.text || "");
      if (index[key] === undefined) {
        index[key] = gruppen.length;
        gruppen.push({
          titel: s.titel,
          kategorie: s.kategorie,
          text: s.text,
          bild: s.bild,
          galerie: s.galerie,
          termine: []
        });
      }
      gruppen[index[key]].termine.push({
        datum: (s.datum || "").trim(),
        link: s.link,
        beginn: s.beginn,
        ausgebucht: s.ausgebucht === true,
        preise: s.preise
      });
    });
    return gruppen;
  }

  function applySeminare(data) {
    if (!data) return;
    if (data.einleitungstext) {
      setText('[data-cms="seminare-einleitung"]', data.einleitungstext);
    }
    // Kein CMS-Text gepflegt -> die im HTML hinterlegte Standardbeschreibung bleibt sichtbar
    var container = document.querySelector('[data-cms="seminare-liste"]');
    var placeholder = document.querySelector('[data-cms="seminare-platzhalter"]');
    if (!container) return;
    if (!data.seminare || data.seminare.length === 0) {
      if (placeholder) placeholder.style.display = "";
      container.style.display = "none";
      return;
    }

    semInjectCss();
    var cfg = semConfig(data);
    var heute = semHeute();
    var kurse = gruppiereSeminare(data.seminare);
    container.innerHTML = "";
    var angezeigt = 0;

    kurse.forEach(function (kurs) {
      // Vergangene Termine (nur wenn "beginn" gepflegt ist) ausblenden
      var termine = kurs.termine.filter(function (t) {
        var b = semParseBeginn(t.beginn);
        return !b || b.tag >= heute;
      });
      if (!termine.length) return;
      angezeigt++;

      var mehrereTermine = termine.length > 1;
      var div = document.createElement("div");
      div.className = "seminar-card fade-in visible";
      var gibtBuchbare = false;

      var termineHtml = termine.map(function (t, idx) {
        var b = semParseBeginn(t.beginn);
        var preise = semPreise(t, data.standardpreise);
        var datum = semEsc(t.datum || (b ? semTagFmt(b.tag, true) : ""));

        if (b && preise.length) {
          if (t.ausgebucht) {
            return '<span class="termin-chip termin-chip--voll">' + datum + ' · ausgebucht</span>';
          }
          var offen = (b.tag - heute) >= cfg.anmeldeschluss;
          if (offen) {
            gibtBuchbare = true;
            var min = preise.reduce(function (m, p) { return p.betrag < m ? p.betrag : m; }, preise[0].betrag);
            return '<a class="termin-chip termin-chip--buchbar" href="#buchen" role="button" data-sem-idx="' + idx + '">' + datum +
              '<span class="termin-chip-preis">' + (preise.length > 1 ? "ab " : "") + semEuro(min) + '</span></a>';
          }
        }
        // Fallback: alter Link (z. B. Eventbrite) oder Anfrage per E-Mail
        if (t.link) {
          return '<a class="termin-chip" href="' + semEsc(t.link) + '" target="_blank" rel="noopener">' + datum + '</a>';
        }
        var betreff = encodeURIComponent("Anfrage Seminar: " + (kurs.titel || "") + " " + (t.datum || ""));
        return '<a class="termin-chip" href="mailto:' + semEsc(cfg.email) + '?subject=' + betreff + '">' + datum + ' · Anfrage per E-Mail</a>';
      }).join("");

      var html =
        (kurs.bild ? '<img class="seminar-img" src="' + kurs.bild + '" alt="' + (kurs.titel || "") + '" loading="lazy">' : '') +
        '<div class="seminar-body">' +
        (kurs.kategorie ? '<p class="seminar-kategorie">' + kurs.kategorie + '</p>' : '') +
        '<h3 class="seminar-titel">' + (kurs.titel || "") + '</h3>' +
        '<p class="seminar-text">' + (kurs.text || "").replace(/\n/g, "<br>") + '</p>' +
        renderGallery(kurs.galerie) +
        '<div class="seminar-termine-label">' + (mehrereTermine ? "Nächste Termine:" : "Termin:") + '</div>' +
        '<div class="seminar-termine">' + termineHtml + '</div>' +
        (gibtBuchbare ? '<p class="seminar-hinweis">Termin anklicken, um direkt zu buchen. Alle Preise inkl. gesetzl. MwSt.</p>' : '') +
        '</div>';

      div.innerHTML = html;
      container.appendChild(div);

      Array.prototype.forEach.call(div.querySelectorAll("[data-sem-idx]"), function (a) {
        a.addEventListener("click", function (ev) {
          ev.preventDefault();
          var t = termine[parseInt(a.getAttribute("data-sem-idx"), 10)];
          semOpenBuchung(kurs, t, cfg, semPreise(t, data.standardpreise));
        });
      });
    });

    if (!angezeigt) {
      if (placeholder) placeholder.style.display = "";
      container.style.display = "none";
      return;
    }
    if (placeholder) placeholder.style.display = "none";
    container.style.display = "";
  }

  // ---------- STUNDENPLAN ----------
  function applyStundenplan(data) {
    if (!data || !data.tage) return;
    var container = document.querySelector('[data-cms="stundenplan"]');
    if (!container) return;
    container.innerHTML = "";
    data.tage.forEach(function (tag) {
      var dayDiv = document.createElement("div");
      dayDiv.setAttribute("style", "border-bottom: 1px solid var(--border); padding-bottom: 1rem;");
      var rows = (tag.kurse || []).map(function (k) {
        return '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem;">' +
          '<span style="color: var(--muted); font-family: \'Barlow Condensed\', sans-serif; font-weight: 600;">' + k.zeit + '</span>' +
          '<span style="color: var(--white); font-weight: 500;">' + k.name + '</span></div>';
      }).join("");
      dayDiv.innerHTML =
        '<h4 style="font-family: \'Bebas Neue\', sans-serif; color: var(--blue); font-size: 1.4rem; letter-spacing: 0.05em; margin-bottom: 0.6rem;">' + tag.tag + '</h4>' +
        '<div style="display: grid; gap: 0.5rem;">' + rows + '</div>';
      container.appendChild(dayDiv);
    });
  }

  // ---------- STUNDENPLAN (KACHELFORM, z.B. Preise-Seite) ----------
  function applyStundenplanKacheln(data) {
    if (!data || !data.tage) return;
    var container = document.querySelector('[data-cms="stundenplan-kacheln"]');
    if (!container) return;
    container.innerHTML = "";
    data.tage.forEach(function (tag) {
      var card = document.createElement("div");
      card.className = "form-card fade-in visible";
      card.style.paddingTop = "1.8rem";
      var rows = (tag.kurse || []).map(function (k) {
        return '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">' +
          '<span style="color: var(--muted); font-family: \'Barlow Condensed\', sans-serif; font-weight: 600;">' + k.zeit + '</span>' +
          '<span style="color: var(--white); font-weight: 500; text-align: right;">' + k.name + '</span></div>';
      }).join("");
      card.innerHTML =
        '<div class="form-card-accent" style="background: linear-gradient(90deg, var(--blue), var(--blue2));"></div>' +
        '<h3 class="form-card-title">' + tag.tag + '</h3>' +
        '<div style="margin-top: 0.8rem;">' + (rows || '<p style="color: var(--muted); font-size: 0.9rem;">Kein Training</p>') + '</div>';
      container.appendChild(card);
    });
  }

  // ---------- FIRMENSEMINARE ----------
  function applyFirmenseminare(data) {
    if (!data) return;

    if (data.hero) {
      var h = data.hero;
      setText('[data-cms="firmenseminare-hero-label"]', h.label);
      setText('[data-cms="firmenseminare-hero-titel1"]', h.titel_teil1);
      setText('[data-cms="firmenseminare-hero-titel2"]', h.titel_teil2);
      setText('[data-cms="firmenseminare-hero-text"]', h.text);
    }

    if (data.warum) {
      var w = data.warum;
      setText('[data-cms="firmenseminare-warum-label"]', w.label);
      setText('[data-cms="firmenseminare-warum-titel1"]', w.titel_teil1);
      setText('[data-cms="firmenseminare-warum-titel2"]', w.titel_teil2);
      setText('[data-cms="firmenseminare-warum-text"]', w.text);
    }

    if (data.formate) {
      var f = data.formate;
      setText('[data-cms="firmenseminare-formate-label"]', f.label);
      setText('[data-cms="firmenseminare-formate-titel1"]', f.titel_teil1);
      setText('[data-cms="firmenseminare-formate-titel2"]', f.titel_teil2);
      var container = document.querySelector('[data-cms="firmenseminare-formate-karten"]');
      if (container && f.karten) {
        container.innerHTML = "";
        f.karten.forEach(function (karte) {
          var div = document.createElement("div");
          div.className = "training-card fade-in visible";
          div.innerHTML =
            '<span class="training-icon">' + (karte.icon_label || "") + '</span>' +
            '<h3>' + (karte.titel || "") + '</h3>' +
            '<p>' + (karte.text || "") + '</p>';
          container.appendChild(div);
        });
      }
    }

    if (data.ablauf) {
      var a = data.ablauf;
      setText('[data-cms="firmenseminare-ablauf-label"]', a.label);
      setText('[data-cms="firmenseminare-ablauf-titel1"]', a.titel_teil1);
      setText('[data-cms="firmenseminare-ablauf-titel2"]', a.titel_teil2);
      setText('[data-cms="firmenseminare-ablauf-text1"]', a.text1);
      setText('[data-cms="firmenseminare-ablauf-text2"]', a.text2);
      setText('[data-cms="firmenseminare-ablauf-text3"]', a.text3);
    }

    if (data.kontakt_hinweis) {
      var kh = data.kontakt_hinweis;
      setText('[data-cms="firmenseminare-kontakt-titel"]', kh.titel);
      setText('[data-cms="firmenseminare-kontakt-text"]', kh.text);
    }
  }

  // ---------- TEAM ----------
  function applyTeam(data) {
    if (!data || !data.team) return;
    var container = document.querySelector('[data-cms="team-liste"]');
    if (!container) return;
    container.innerHTML = "";
    data.team.forEach(function (member) {
      var div = document.createElement("div");
      div.className = "team-card fade-in visible";
      var avatarHtml = member.foto
        ? '<div class="team-avatar" style="background:none; padding:0; overflow:hidden; cursor:zoom-in;"><img src="' + member.foto + '" alt="' + member.name + '" data-fd-fullsrc="' + member.foto + '" tabindex="0" role="button" title="Foto vergrößern" style="width:100%; height:100%; object-fit:cover; border-radius:50%;"></div>'
        : '<div class="team-avatar">' + member.kuerzel + '</div>';
      div.innerHTML =
        avatarHtml +
        '<div class="team-name">' + member.name + '</div>' +
        '<div class="team-role">' + member.rolle + '</div>' +
        '<p class="team-bio">' + member.bio + '</p>';
      container.appendChild(div);
    });
  }

  // ---------- INIT ----------
  document.addEventListener("DOMContentLoaded", function () {
    var base = "/_data/";

    fetchJSON(base + "inhalte.json").then(function (data) {
      applyKontakt(data);
      applyHero(data);
      applyHighlight(data);
      applyTrainerausbildung(data);
      applyProbetrainingFormular(data);
      applyTrainerausbildungFormular(data);
      applyCtaStrip(data);
      applyTrainingBereich(data);
    });

    if (document.querySelector('[data-cms="news-liste"]')) {
      fetchJSON(base + "aktuelles.json").then(applyNews);
    }

    if (document.querySelector('[data-cms="preise-gruppen"]')) {
      fetchJSON(base + "preise.json").then(applyPreise);
    }

    if (document.querySelector('[data-cms="seminare-liste"]')) {
      fetchJSON(base + "seminare.json").then(applySeminare);
    }

    if (document.querySelector('[data-cms="stundenplan"]')) {
      fetchJSON(base + "stundenplan.json").then(applyStundenplan);
    }

    if (document.querySelector('[data-cms="stundenplan-kacheln"]')) {
      fetchJSON(base + "stundenplan.json").then(applyStundenplanKacheln);
    }

    if (document.querySelector('[data-cms="stundenplan-uelzen-kacheln"]')) {
      fetchJSON(base + "stundenplan_uelzen.json").then(applyStundenplanUelzen);
    }

    if (document.querySelector('[data-cms="uelzen-text1"]')) {
      fetchJSON(base + "training_uelzen.json").then(applyUelzen);
    }

    if (document.querySelector('[data-cms="firmenseminare-hero-titel1"]')) {
      fetchJSON(base + "firmenseminare.json").then(applyFirmenseminare);
    }

    if (document.querySelector('[data-cms="team-liste"]')) {
      fetchJSON(base + "team.json").then(applyTeam);
    }

    if (document.querySelector('[data-cms="impressum-angaben"]')) {
      fetchJSON(base + "impressum.json").then(applyImpressum);
    }
  });

  function applyImpressum(d) {
    var keys = ["angaben","kontakt_impressum","steuer","inhalt","haftung","links","urheberrecht"];
    keys.forEach(function(key) {
      if (!d[key]) return;
      var hEl = document.querySelector('[data-cms="impressum-h-' + key + '"]');
      var tEl = document.querySelector('[data-cms="impressum-' + key + '"]');
      if (hEl && d[key].h) hEl.textContent = d[key].h;
      if (tEl && d[key].text) {
        // Preserve newlines as <br>
        tEl.innerHTML = d[key].text.replace(/\n/g, '<br>');
      }
    });
  }
})();
