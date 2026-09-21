/**
 * Fight & Defense – Cookie Consent Banner
 * Einfache, abhängigkeitsfreie Consent-Lösung (TDDDG/DSGVO-konform: Opt-in, kein Opt-out)
 *
 * Einwilligungen werden je Dienst abgefragt:
 *   - meta   -> Meta-Pixel (Facebook/Instagram)
 *   - google -> Google Ads (Conversion-Messung, Remarketing)
 *
 * Die Skripte selbst stehen in marketing-scripts.js und werden nur
 * nach Zustimmung geladen (window.fudLoadMetaPixel / window.fudLoadGoogleAds).
 */

(function () {
  const CONSENT_KEY = 'fud_cookie_consent';
  const CONSENT_VERSION = '2'; // hochzählen, wenn sich Kategorien/Zwecke ändern

  // Cookies, die beim Widerruf auf dieser Domain entfernt werden
  const COOKIES_META = ['_fbp', '_fbc'];
  const COOKIE_PREFIXES_GOOGLE = ['_gcl_', '_gac_'];

  function getStoredConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.version !== CONSENT_VERSION) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function expireCookie(name) {
    const host = location.hostname;
    const parts = host.split('.');
    const domains = [host, '.' + host];
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
    const past = '; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = name + '=' + past;
    domains.forEach(function (d) {
      document.cookie = name + '=' + past + '; domain=' + d;
    });
  }

  function clearCookies(exactNames, prefixes) {
    const names = document.cookie.split(';').map(function (c) { return c.split('=')[0].trim(); });
    names.forEach(function (n) {
      const hit = exactNames.indexOf(n) !== -1 ||
        prefixes.some(function (p) { return n.indexOf(p) === 0; });
      if (hit) expireCookie(n);
    });
  }

  function storeConsent(categories) {
    const state = window.fudMarketingState || { meta: false, google: false };
    // Wurde ein bereits geladener Dienst abgewählt? Dann Seite neu laden,
    // damit das Skript nicht weiterläuft.
    const revokedLoaded = (state.meta && !categories.meta) || (state.google && !categories.google);

    const payload = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      categories: categories
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
    } catch (e) { /* Speicher nicht verfügbar: Auswahl gilt nur für diese Seite */ }

    if (!categories.meta) clearCookies(COOKIES_META, []);
    if (!categories.google) clearCookies([], COOKIE_PREFIXES_GOOGLE);

    if (revokedLoaded) {
      location.reload();
      return;
    }
    applyConsent(categories);
  }

  function applyConsent(categories) {
    if (categories.meta && typeof window.fudLoadMetaPixel === 'function') {
      window.fudLoadMetaPixel();
    }
    if (categories.google && typeof window.fudLoadGoogleAds === 'function') {
      window.fudLoadGoogleAds();
    }
    document.dispatchEvent(new CustomEvent('fud-consent-updated', { detail: categories }));
  }

  function buildBanner() {
    const overlay = document.createElement('div');
    overlay.id = 'fud-cookie-banner';
    overlay.innerHTML = `
      <div class="fud-cookie-box">
        <p class="fud-cookie-text">
          Wir verwenden Cookies und ähnliche Technologien, damit unsere Website funktioniert
          und wir den Erfolg unserer Werbung messen können (Meta/Facebook/Instagram und Google Ads).
          Notwendige Cookies sind immer aktiv. Über \"Einstellungen\" kannst du einzeln auswählen,
          welchen Diensten du zustimmst. Mehr dazu in der
          <a href=\"/datenschutz.html\" class=\"fud-cookie-link\">Datenschutzerklärung</a>.
        </p>
        <div class=\"fud-cookie-actions\">
          <button type=\"button\" class=\"fud-btn fud-btn-ghost\" id=\"fud-cookie-settings\">Einstellungen</button>
          <button type=\"button\" class=\"fud-btn fud-btn-primary\" id=\"fud-cookie-reject\">Nur notwendige</button>
          <button type=\"button\" class=\"fud-btn fud-btn-primary\" id=\"fud-cookie-accept\">Alle akzeptieren</button>
        </div>
      </div>

      <div class=\"fud-cookie-box fud-cookie-settings-panel\" id=\"fud-cookie-settings-panel\" hidden>
        <h3 class=\"fud-cookie-heading\">Cookie-Einstellungen</h3>

        <div class=\"fud-cookie-category\">
          <div class=\"fud-cookie-category-head\">
            <span>Notwendig</span>
            <input type=\"checkbox\" checked disabled aria-label=\"Notwendige Cookies (immer aktiv)\">
          </div>
          <p class=\"fud-cookie-desc\">Erforderlich für den Betrieb der Website (z. B. Menü, Formulare, Speicherung deiner Auswahl). Kann nicht deaktiviert werden.</p>
        </div>

        <div class=\"fud-cookie-category\">
          <div class=\"fud-cookie-category-head\">
            <span>Marketing: Meta-Pixel</span>
            <input type=\"checkbox\" id=\"fud-cookie-meta-checkbox\" aria-label=\"Meta-Pixel (Facebook/Instagram)\">
          </div>
          <p class=\"fud-cookie-desc\">Meta-Pixel (Meta Platforms Ireland Limited) zur Reichweitenmessung und Optimierung unserer Werbeanzeigen auf Facebook und Instagram. Datenübermittlung in die USA möglich.</p>
        </div>

        <div class=\"fud-cookie-category\">
          <div class=\"fud-cookie-category-head\">
            <span>Marketing: Google Ads</span>
            <input type=\"checkbox\" id=\"fud-cookie-google-checkbox\" aria-label=\"Google Ads (Conversion-Messung und Remarketing)\">
          </div>
          <p class=\"fud-cookie-desc\">Google-Tag (Google Ireland Limited) zur Messung, ob nach einer Google-Anzeige eine Anfrage oder ein Anruf erfolgt, und für personalisierte Werbung. Datenübermittlung in die USA möglich.</p>
        </div>

        <p class=\"fud-cookie-desc\">Du kannst deine Auswahl jederzeit über \"Cookie-Einstellungen\" im Seitenfuß ändern oder widerrufen. Details in der <a href=\"/datenschutz.html\" class=\"fud-cookie-link\">Datenschutzerklärung</a>.</p>

        <div class=\"fud-cookie-actions\">
          <button type=\"button\" class=\"fud-btn fud-btn-primary\" id=\"fud-cookie-reject-2\">Nur notwendige</button>
          <button type=\"button\" class=\"fud-btn fud-btn-primary\" id=\"fud-cookie-save\">Auswahl speichern</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const panel = overlay.querySelector('#fud-cookie-settings-panel');
    const mainBox = overlay.querySelector('.fud-cookie-box:not(.fud-cookie-settings-panel)');

    overlay.querySelector('#fud-cookie-accept').addEventListener('click', () => {
      storeConsent({ necessary: true, meta: true, google: true });
      overlay.remove();
    });

    overlay.querySelector('#fud-cookie-reject').addEventListener('click', () => {
      storeConsent({ necessary: true, meta: false, google: false });
      overlay.remove();
    });

    overlay.querySelector('#fud-cookie-reject-2').addEventListener('click', () => {
      storeConsent({ necessary: true, meta: false, google: false });
      overlay.remove();
    });

    overlay.querySelector('#fud-cookie-settings').addEventListener('click', () => {
      mainBox.hidden = true;
      panel.hidden = false;
    });

    overlay.querySelector('#fud-cookie-save').addEventListener('click', () => {
      const meta = overlay.querySelector('#fud-cookie-meta-checkbox').checked;
      const google = overlay.querySelector('#fud-cookie-google-checkbox').checked;
      storeConsent({ necessary: true, meta: meta, google: google });
      overlay.remove();
    });
  }

  // Öffentliche Funktion, um die Einstellungen später erneut zu öffnen
  // (Footer-Link "Cookie-Einstellungen" ruft das auf)
  window.fudOpenCookieSettings = function () {
    const existing = document.getElementById('fud-cookie-banner');
    if (existing) existing.remove();
    buildBanner();
    const overlay = document.getElementById('fud-cookie-banner');
    overlay.querySelector('.fud-cookie-box:not(.fud-cookie-settings-panel)').hidden = true;
    overlay.querySelector('#fud-cookie-settings-panel').hidden = false;
    const stored = getStoredConsent();
    if (stored && stored.categories) {
      if (stored.categories.meta) overlay.querySelector('#fud-cookie-meta-checkbox').checked = true;
      if (stored.categories.google) overlay.querySelector('#fud-cookie-google-checkbox').checked = true;
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    const stored = getStoredConsent();
    if (stored) {
      applyConsent(stored.categories);
    } else {
      buildBanner();
    }
  });
})();
