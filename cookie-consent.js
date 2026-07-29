/**
 * Fight & Defense – Cookie Consent Banner
 * Einfache, abhängigkeitsfreie Consent-Lösung (TTDSG/DSGVO-konform: Opt-in, kein Opt-out)
 *
 * Marketing-Scripts (z. B. Meta Pixel) werden NICHT direkt eingebunden, sondern
 * über window.loadMarketingScripts registriert (siehe Head-Snippet in den Seiten).
 * Diese Funktion wird nur aufgerufen, wenn der Nutzer "Marketing" akzeptiert hat.
 */

(function () {
  const CONSENT_KEY = 'fud_cookie_consent';
  const CONSENT_VERSION = '1'; // hochzählen, wenn sich Kategorien/Zwecke ändern

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

  function storeConsent(categories) {
    const payload = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      categories: categories
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
    applyConsent(categories);
  }

  function applyConsent(categories) {
    if (categories.marketing && typeof window.loadMarketingScripts === 'function') {
      window.loadMarketingScripts();
    }
    document.dispatchEvent(new CustomEvent('fud-consent-updated', { detail: categories }));
  }

  function buildBanner() {
    const overlay = document.createElement('div');
    overlay.id = 'fud-cookie-banner';
    overlay.innerHTML = `
      <div class="fud-cookie-box">
        <p class="fud-cookie-text">
          Wir verwenden Cookies, um unsere Website zu betreiben und unsere Anzeigen
          (z. B. über Meta/Facebook) zu messen. Notwendige Cookies sind immer aktiv.
          Über "Einstellungen" kannst du auswählen, welchen weiteren Kategorien du zustimmst.
        </p>
        <div class="fud-cookie-actions">
          <button type="button" class="fud-btn fud-btn-ghost" id="fud-cookie-settings">Einstellungen</button>
          <button type="button" class="fud-btn fud-btn-outline" id="fud-cookie-reject">Nur notwendige</button>
          <button type="button" class="fud-btn fud-btn-primary" id="fud-cookie-accept">Alle akzeptieren</button>
        </div>
      </div>

      <div class="fud-cookie-box fud-cookie-settings-panel" id="fud-cookie-settings-panel" hidden>
        <h3 class="fud-cookie-heading">Cookie-Einstellungen</h3>

        <div class="fud-cookie-category">
          <div class="fud-cookie-category-head">
            <span>Notwendig</span>
            <input type="checkbox" checked disabled aria-label="Notwendige Cookies (immer aktiv)">
          </div>
          <p class="fud-cookie-desc">Erforderlich für den Betrieb der Website (z. B. Menü, Formulare). Kann nicht deaktiviert werden.</p>
        </div>

        <div class="fud-cookie-category">
          <div class="fud-cookie-category-head">
            <span>Marketing</span>
            <input type="checkbox" id="fud-cookie-marketing-checkbox" aria-label="Marketing-Cookies (Meta Pixel)">
          </div>
          <p class="fud-cookie-desc">Meta-Pixel zur Reichweitenmessung und Optimierung unserer Werbeanzeigen auf Facebook/Instagram.</p>
        </div>

        <div class="fud-cookie-actions">
          <button type="button" class="fud-btn fud-btn-outline" id="fud-cookie-reject-2">Nur notwendige</button>
          <button type="button" class="fud-btn fud-btn-primary" id="fud-cookie-save">Auswahl speichern</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const panel = overlay.querySelector('#fud-cookie-settings-panel');
    const mainBox = overlay.querySelector('.fud-cookie-box:not(.fud-cookie-settings-panel)');

    overlay.querySelector('#fud-cookie-accept').addEventListener('click', () => {
      storeConsent({ necessary: true, marketing: true });
      overlay.remove();
    });

    overlay.querySelector('#fud-cookie-reject').addEventListener('click', () => {
      storeConsent({ necessary: true, marketing: false });
      overlay.remove();
    });

    overlay.querySelector('#fud-cookie-reject-2').addEventListener('click', () => {
      storeConsent({ necessary: true, marketing: false });
      overlay.remove();
    });

    overlay.querySelector('#fud-cookie-settings').addEventListener('click', () => {
      mainBox.hidden = true;
      panel.hidden = false;
    });

    overlay.querySelector('#fud-cookie-save').addEventListener('click', () => {
      const marketingChecked = overlay.querySelector('#fud-cookie-marketing-checkbox').checked;
      storeConsent({ necessary: true, marketing: marketingChecked });
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
    if (stored && stored.categories.marketing) {
      overlay.querySelector('#fud-cookie-marketing-checkbox').checked = true;
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
