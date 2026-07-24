/* ============================================================
   ORYX TECHNOLOGIES — cookie-consent.js
   Consent-Management gemäß TDDDG §25 / DSGVO Art. 6-7 / DSK OH v1.2
   Vorbereitet für Google Consent Mode v2 (Google Tag Manager folgt später)
   ============================================================ */

'use strict';

(function () {
  var STORAGE_KEY = 'oryxCookieConsent';
  var CONSENT_VERSION = 1;
  var VALID_DAYS = 365;

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data.version !== CONSENT_VERSION) return null;
      var ageMs = Date.now() - new Date(data.timestamp).getTime();
      if (ageMs > VALID_DAYS * 24 * 60 * 60 * 1000) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(consent) {
    consent.version = CONSENT_VERSION;
    consent.timestamp = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    applyConsent(consent);
    window.dispatchEvent(new CustomEvent('oryxConsentUpdate', { detail: consent }));
  }

  function applyConsent(consent) {
    // Google Consent Mode v2 — greift automatisch, sobald gtag.js / GTM eingebunden ist.
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: consent.statistics ? 'granted' : 'denied',
        ad_storage: consent.marketing ? 'granted' : 'denied',
        ad_user_data: consent.marketing ? 'granted' : 'denied',
        ad_personalization: consent.marketing ? 'granted' : 'denied'
      });
    }

    // Benutzerdefiniertes Ereignis fuer GTM, sobald alle optionalen Kategorien
    // (Statistik + Marketing) aktiv sind — im Tag-Assistenten als "consent_all_granted" sichtbar.
    if (consent.statistics && consent.marketing) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'consent_all_granted',
        consent_statistics: consent.statistics,
        consent_marketing: consent.marketing
      });
    }

    // Formular-E-Mail (falls vorhanden, siehe main.js) erst NACH Aufloesung
    // des Consent-Status an GTM uebergeben — unabhaengig davon, ob granted
    // oder denied, damit die Reihenfolge im dataLayer immer stimmt.
    try {
      var leadEmail = sessionStorage.getItem('oryx_lead_email');
      if (leadEmail) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'conversion_email_ready', user_email: leadEmail });
        sessionStorage.removeItem('oryx_lead_email');
      }
    } catch (e) {}
  }

  // Öffentliche, kleine API für künftige Skripte (z. B. nach GTM-Einbau)
  window.oryxConsent = {
    get: function () { return readConsent() || { necessary: true, statistics: false, marketing: false }; },
    openSettings: function () { openPanel(); },
    onChange: function (cb) {
      window.addEventListener('oryxConsentUpdate', function (e) { cb(e.detail); });
    }
  };

  var banner, panel;

  function buildBanner() {
    banner = document.createElement('div');
    banner.className = 'cc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie-Einstellungen');
    banner.innerHTML =
      '<div class="cc-inner">' +
        '<div class="cc-row">' +
          '<p class="cc-text">Wir nutzen Cookies, um unsere Website technisch bereitzustellen. Mit Ihrer Einwilligung setzen wir außerdem Statistik- und Marketing-Cookies ein. Details finden Sie in unserer <a href="datenschutz">Datenschutzerklärung</a> und im <a href="impressum">Impressum</a>.</p>' +
          '<div class="cc-actions">' +
            '<button type="button" class="cc-btn-settings" data-cc="settings">Einstellungen</button>' +
            '<button type="button" class="cc-btn cc-btn-reject" data-cc="reject">Nur notwendige</button>' +
            '<button type="button" class="cc-btn cc-btn-accept" data-cc="accept">Alle akzeptieren</button>' +
          '</div>' +
        '</div>' +
        '<div class="cc-panel">' +
          '<div class="cc-cat">' +
            '<div class="cc-cat-info"><h5>Notwendig</h5><p>Erforderlich für den Betrieb der Website (z. B. Speicherung Ihrer Cookie-Auswahl). Kann nicht deaktiviert werden.</p></div>' +
            '<label class="cc-switch"><input type="checkbox" checked disabled><span class="cc-switch-track"></span></label>' +
          '</div>' +
          '<div class="cc-cat">' +
            '<div class="cc-cat-info"><h5>Statistik</h5><p>Hilft uns zu verstehen, wie Besucher die Website nutzen (z. B. Google Analytics), sobald aktiv eingesetzt.</p></div>' +
            '<label class="cc-switch"><input type="checkbox" data-cc-cat="statistics"><span class="cc-switch-track"></span></label>' +
          '</div>' +
          '<div class="cc-cat">' +
            '<div class="cc-cat-info"><h5>Marketing</h5><p>Ermöglicht personalisierte Werbung und Erfolgsmessung (z. B. Google Ads), sobald aktiv eingesetzt.</p></div>' +
            '<label class="cc-switch"><input type="checkbox" data-cc-cat="marketing"><span class="cc-switch-track"></span></label>' +
          '</div>' +
          '<div class="cc-panel-footer"><button type="button" class="cc-btn cc-btn-accept" data-cc="save">Auswahl speichern</button></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);
    panel = banner.querySelector('.cc-panel');

    banner.querySelector('[data-cc="accept"]').addEventListener('click', function () {
      writeConsent({ necessary: true, statistics: true, marketing: true });
      hideBanner();
    });
    banner.querySelector('[data-cc="reject"]').addEventListener('click', function () {
      writeConsent({ necessary: true, statistics: false, marketing: false });
      hideBanner();
    });
    banner.querySelector('[data-cc="settings"]').addEventListener('click', function () {
      panel.classList.toggle('cc-panel-open');
    });
    banner.querySelector('[data-cc="save"]').addEventListener('click', function () {
      var statistics = banner.querySelector('[data-cc-cat="statistics"]').checked;
      var marketing = banner.querySelector('[data-cc-cat="marketing"]').checked;
      writeConsent({ necessary: true, statistics: statistics, marketing: marketing });
      hideBanner();
    });
  }

  function showBanner() {
    if (!banner) buildBanner();
    // setTimeout statt requestAnimationFrame: rAF pausiert in Hintergrund-/inaktiven Tabs
    // und würde das Banner dort nie einblenden.
    setTimeout(function () {
      banner.classList.add('cc-visible');
    }, 10);
  }

  function hideBanner() {
    if (banner) banner.classList.remove('cc-visible');
  }

  function openPanel() {
    if (!banner) buildBanner();
    var existing = readConsent();
    if (existing) {
      banner.querySelector('[data-cc-cat="statistics"]').checked = !!existing.statistics;
      banner.querySelector('[data-cc-cat="marketing"]').checked = !!existing.marketing;
    }
    panel.classList.add('cc-panel-open');
    showBanner();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var existing = readConsent();
    if (existing) {
      applyConsent(existing);
    } else {
      showBanner();
    }

    // Footer-Link zum jederzeitigen Ändern der Cookie-Einstellungen
    document.querySelectorAll('[data-cc-open]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openPanel();
      });
    });
  });
})();
