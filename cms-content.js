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

  // Einfache Lightbox zum großen Anzeigen eines Galeriebilds (per Event-Delegation)
  if (!window.__fdLightboxInit) {
    window.__fdLightboxInit = true;
    document.addEventListener("click", function (e) {
      var img = e.target.closest && e.target.closest("[data-fd-fullsrc]");
      if (!img) return;
      var overlay = document.createElement("div");
      overlay.setAttribute("style",
        "position:fixed; inset:0; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:9999; cursor:zoom-out; padding:2rem;");
      overlay.innerHTML = '<img src="' + img.getAttribute("data-fd-fullsrc") + '" style="max-width:100%; max-height:100%; border-radius:6px; box-shadow:0 0 40px rgba(0,0,0,0.6);">';
      overlay.addEventListener("click", function () { overlay.remove(); });
      document.body.appendChild(overlay);
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
  function applyHighlight(data) {
    if (!data || !data.highlight_seminar) return;
    var h = data.highlight_seminar;
    setText('[data-cms="highlight-titel"]', h.titel);
    setText('[data-cms="highlight-datum"]', h.datum);
    setText('[data-cms="highlight-text"]', h.text);
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
      var imgHtml = item.bild
        ? '<img src="' + item.bild + '" alt="' + (item.titel || "") + '" style="width:100%; max-height:320px; object-fit:cover; border-radius:6px; margin-bottom:1.2rem;">'
        : '';
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
        '<div class="price-duration">' + item.laufzeit + '</div>' +
        '<div class="price-amount"><sup>€</sup>' + item.preis + '<sub>,' + item.cent + ' / Monat</sub></div>' +
        '<p class="price-note">' + item.hinweis + '</p>' +
        (item.sparhinweis ? '<p class="price-saving">' + item.sparhinweis + '</p>' : '');
      container.appendChild(div);
    });
  }

  function applyPreise(data) {
    if (!data) return;
    var erw = document.querySelector('[data-cms="preise-erwachsene"]');
    var kid = document.querySelector('[data-cms="preise-kinder"]');
    if (erw && data.erwachsene) renderPriceCards(erw, data.erwachsene);
    if (kid && data.kinder) renderPriceCards(kid, data.kinder);
    if (data.anmeldegebuehr) {
      setText('[data-cms="anmelde-titel"]', data.anmeldegebuehr.titel);
      setText('[data-cms="anmelde-text"]', data.anmeldegebuehr.text);
    }
  }

  // ---------- SEMINARE ----------
  function applySeminare(data) {
    if (!data) return;
    var container = document.querySelector('[data-cms="seminare-liste"]');
    var placeholder = document.querySelector('[data-cms="seminare-platzhalter"]');
    if (!container) return;
    if (!data.seminare || data.seminare.length === 0) {
      if (placeholder) placeholder.style.display = "";
      container.style.display = "none";
      return;
    }
    if (placeholder) placeholder.style.display = "none";
    container.style.display = "";
    container.innerHTML = "";
    data.seminare.forEach(function (s) {
      var div = document.createElement("div");
      div.className = "fade-in visible";
      div.setAttribute("style",
        "background: var(--card); border: 1px solid var(--border); padding: 2rem; border-radius: 8px; margin-bottom: 1.5rem;");
      var html =
        (s.bild ? '<img src="' + s.bild + '" alt="' + (s.titel || "") + '" style="width:100%; max-height:320px; object-fit:cover; border-radius:6px; margin-bottom:1.2rem;">' : '') +
        '<span style="color: var(--blue); font-weight: 600; font-size: 0.9rem;">' + (s.datum || "") + '</span>' +
        '<h3 style="font-family: \'Bebas Neue\'; font-size: 2rem; margin: 10px 0;">' + (s.titel || "") + '</h3>' +
        '<p style="color: var(--muted); line-height: 1.6;">' + (s.text || "") + '</p>' +
        renderGallery(s.galerie);
      if (s.link) {
        html += '<a href="' + s.link + '" class="btn btn-secondary" style="display: inline-block; margin-top: 1rem; padding: 0.6rem 1.6rem; background: transparent; border: 1px solid var(--blue); color: var(--blue); text-decoration: none; font-family: \'Barlow Condensed\', sans-serif; font-weight: 700; text-transform: uppercase;">Mehr erfahren</a>';
      }
      div.innerHTML = html;
      container.appendChild(div);
    });
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
        ? '<div class="team-avatar" style="background:none; padding:0; overflow:hidden;"><img src="' + member.foto + '" alt="' + member.name + '" style="width:100%; height:100%; object-fit:cover; border-radius:50%;"></div>'
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
    });

    if (document.querySelector('[data-cms="news-liste"]')) {
      fetchJSON(base + "aktuelles.json").then(applyNews);
    }

    if (document.querySelector('[data-cms="preise-erwachsene"]')) {
      fetchJSON(base + "preise.json").then(applyPreise);
    }

    if (document.querySelector('[data-cms="seminare-liste"]')) {
      fetchJSON(base + "seminare.json").then(applySeminare);
    }

    if (document.querySelector('[data-cms="stundenplan"]')) {
      fetchJSON(base + "stundenplan.json").then(applyStundenplan);
    }

    if (document.querySelector('[data-cms="team-liste"]')) {
      fetchJSON(base + "team.json").then(applyTeam);
    }
  });
})();
