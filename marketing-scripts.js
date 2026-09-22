/**
 * Fight & Defense – Marketing-Skripte (Meta-Pixel, Google Ads)
 *
 * Diese Skripte werden ausschließlich nach Einwilligung geladen.
 * Gesteuert wird das von cookie-consent.js über
 *   window.fudLoadMetaPixel()  und  window.fudLoadGoogleAds().
 *
 * Google Consent Mode v2 (Basis-Modus):
 *   - Vor der Einwilligung wird das Google-Tag NICHT geladen.
 *   - Der Standardwert aller Einwilligungssignale ist "denied".
 *   - Nach Zustimmung zu "Google Ads" wird auf "granted" umgestellt
 *     und das Google-Tag geladen.
 */
(function () {
  var META_PIXEL_ID = '1442320771252879';
  var GOOGLE_ADS_ID = 'AW-18464213177';

  /**
   * Conversion-Labels aus Google Ads eintragen
   * (Ziele > Conversions > Aktion > Tag-Einrichtung > Ereignis-Snippet).
   * Im Snippet steht: 'send_to': 'AW-18464213177/AbCdEfGhIjKl'
   * Hier nur den Teil NACH dem Schrägstrich eintragen.
   * Solange ein Label leer ist, wird die jeweilige Conversion nicht gesendet.
   */
  var CONVERSION_LABELS = {
    anruf: '1qb5CIDMk4EdELmRtuRE',  // Klick auf eine Telefonnummer (tel:-Link)
    formular: ''                    // erfolgreich abgesendetes Probetraining-Formular
  };

  /**
   * Das Probetraining-Formular liegt in einem iframe von MATOOL
   * (ext.matool.de). Ob und wann es eine Erfolgsmeldung an die Seite sendet,
   * ist nicht dokumentiert. Nur auf true setzen, wenn getestet ist, dass
   * die Nachricht 99999999 ausschließlich nach erfolgreichem Absenden kommt.
   */
  var TRACK_MATOOL_MESSAGE = false;

  var state = { meta: false, google: false };
  window.fudMarketingState = state;

  // Google-Consent-Mode: Standard = alles abgelehnt (kein Netzwerkzugriff, keine Cookies)
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied'
  });

  window.fudLoadMetaPixel = function () {
    if (state.meta) return;
    state.meta = true;
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', META_PIXEL_ID);
    fbq('track', 'PageView');
  };

  window.fudLoadGoogleAds = function () {
    if (state.google) return;
    state.google = true;
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted'
    });
    gtag('js', new Date());
    gtag('config', GOOGLE_ADS_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ADS_ID;
    document.head.appendChild(s);
  };

  // Conversion an Google Ads senden (nur mit Einwilligung und eingetragenem Label)
  window.fudTrackConversion = function (key) {
    if (!state.google) return;
    var label = CONVERSION_LABELS[key];
    if (!label) return;
    gtag('event', 'conversion', { send_to: GOOGLE_ADS_ID + '/' + label });
  };

  // Klick auf Telefonnummer
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
    if (a) window.fudTrackConversion('anruf');
  });

  // Optional: Erfolgsmeldung des MATOOL-Formulars (standardmäßig aus)
  var matoolSent = false;
  window.addEventListener('message', function (e) {
    if (!TRACK_MATOOL_MESSAGE || matoolSent) return;
    if (e.origin !== 'https://ext.matool.de') return;
    if (e.data === 99999999) {
      matoolSent = true;
      window.fudTrackConversion('formular');
    }
  });
})();
