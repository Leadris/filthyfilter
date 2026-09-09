/* Consent Mode v2, basic mode: no Google measurement script before agreement.
   One optional purpose: measuring advertising effectiveness, without personalised
   ads. The enquiry works independently. Consent is versioned and expires. */
(function () {
  "use strict";
  var TAG_ID = window.FILTHYFILTER_CONFIG
    ? window.FILTHYFILTER_CONFIG.gtmContainerId
    : "GTM-57M8XLQJ";
  var CONVERSION_LABELS = { lead_submitted: "" }; // GTM owns the existing mapping.
  var STORE_KEY = "ff_consent_v2";
  var VERSION = "2026-09-07";
  var MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  var loaded = false;
  var activeBox = null;
  var returnFocus = null;
  var choice = readChoice();
  var ownScript = document.currentScript;
  var PRIVACY_URL = ownScript ? new URL("../ochrana-osobnych-udajov/", ownScript.src).href : "/ochrana-osobnych-udajov/";

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  function readChoice() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (saved && saved.version === VERSION && typeof saved.accepted === "boolean" &&
          typeof saved.at === "number" && saved.at <= Date.now() && Date.now() - saved.at < MAX_AGE) return saved;
      localStorage.removeItem(STORE_KEY);
    } catch (e) {}
    return null;
  }
  function allowed() {
    return !!(TAG_ID && choice && choice.accepted && Date.now() - choice.at < MAX_AGE);
  }
  function signals(accepted) {
    return { ad_storage: accepted ? "granted" : "denied",
      analytics_storage: accepted ? "granted" : "denied",
      ad_user_data: accepted ? "granted" : "denied",
      ad_personalization: "denied" };
  }
  function clearMeasurement() {
    try { sessionStorage.removeItem("ff_attr_v1"); sessionStorage.removeItem("ff_attr_v2"); } catch (e) {}
    // Delete accessible Google measurement cookies for this site and parent domain.
    var domains = ["", location.hostname];
    var parts = location.hostname.split(".");
    while (parts.length > 2) { parts.shift(); domains.push(parts.join(".")); }
    var paths = ["/"];
    var segments = location.pathname.split("/").filter(Boolean);
    while (segments.length) { paths.push("/" + segments.join("/"), "/" + segments.join("/") + "/"); segments.pop(); }
    document.cookie.split(";").forEach(function (entry) {
      var name = entry.split("=")[0].trim();
      if (!/^(_ga($|_)|_gid$|_gat($|_)|_gcl_|_gac_)/.test(name)) return;
      domains.forEach(function (domain) {
        paths.forEach(function (path) {
          document.cookie = name + "=; Max-Age=0; path=" + path + (domain ? "; domain=" + domain : "") + "; SameSite=Lax";
        });
      });
    });
  }
  function loadTag() {
    if (loaded || !allowed()) return;
    loaded = true;
    var script = document.createElement("script");
    script.async = true;
    if (TAG_ID.indexOf("GTM-") === 0) {
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(TAG_ID);
    } else {
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(TAG_ID);
      gtag("js", new Date());
      gtag("config", TAG_ID);
    }
    document.head.appendChild(script);
  }
  function choose(accepted) {
    choice = { version: VERSION, accepted: accepted, at: Date.now() };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(choice)); } catch (e) {}
    gtag("consent", "update", signals(accepted));
    if (!accepted) clearMeasurement();
    document.dispatchEvent(new CustomEvent("ff:consentchange"));
    if (accepted) loadTag();
    // Already-loaded third-party listeners cannot be reliably unloaded in place.
    else if (loaded) window.location.reload();
  }
  function translate(box) {
    var lang = document.documentElement.lang === "en" ? "en" : "sk";
    box.querySelectorAll("[data-sk][data-en]").forEach(function (el) { el.textContent = el.getAttribute("data-" + lang); });
  }
  function close() {
    if (!activeBox) return;
    activeBox.remove();
    activeBox = null;
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
  }
  function banner(focus) {
    if (activeBox || !TAG_ID) return;
    returnFocus = focus ? document.activeElement : null;
    var box = document.createElement("div");
    activeBox = box;
    box.className = "consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-labelledby", "consent-title");
    box.setAttribute("aria-describedby", "consent-description");
    box.innerHTML = '<div class="consent__inner">' +
      '<p class="consent__title" id="consent-title" data-sk="Klímu čistíme. Reklamu meriame len s vaším súhlasom." data-en="We clean ACs. We measure ads only with your agreement."></p>' +
      '<p class="consent__text" id="consent-description" data-sk="Povolíte cookies Google a meranie návštevy, kliknutí a odoslania dopytu? Zdroj reklamy spojíme s dopytom. Pri meraní výslednej zákazky môže Google dostať aj jej hodnotu a zakódovaný e-mail či telefón. Personalizované reklamy nepovoľujeme. Odmietnutie neovplyvní objednávku; voľbu zmeníte v pätičke." data-en="Allow Google cookies and measurement of visits, clicks and enquiries? We link the ad source to the enquiry. To measure the resulting job, Google may receive its value and a hashed e-mail or phone number. We do not enable personalised ads. Declining does not affect your booking; change your choice in the footer."></p>' +
      (loaded ? '<p class="consent__text" data-sk="Odvolanie súhlasu obnoví túto stránku. Rozpísaný dopyt si predtým skopírujte." data-en="Withdrawing consent reloads this page. Copy any unfinished enquiry first."></p>' : '') +
      '<div class="consent__actions">' +
      '<button type="button" class="btn btn--ghost" data-consent="reject" data-sk="Odmietnuť meranie" data-en="Decline measurement"></button>' +
      '<button type="button" class="btn btn--ghost" data-consent="accept" data-sk="Povoliť meranie" data-en="Allow measurement"></button>' +
      (choice ? '<button type="button" class="btn btn--ghost" data-consent="close" data-sk="Zavrieť bez zmeny" data-en="Close without changes"></button>' : '') + '</div>' +
      '<a class="consent__link" href="' + PRIVACY_URL + '" data-sk="Osobné údaje a cookies" data-en="Personal data and cookies"></a></div>';
    box.addEventListener("click", function (event) {
      var action = event.target.getAttribute("data-consent");
      if (!action) return;
      close();
      if (action !== "close") choose(action === "accept");
    });
    box.addEventListener("keydown", function (event) { if (event.key === "Escape" && choice) close(); });
    translate(box);
    document.body.appendChild(box);
    if (focus) box.querySelector("button").focus();
  }
  window.ffConsent = { allowed: allowed, timestamp: function () { return choice ? choice.at : null; }, open: function () { banner(true); } };
  window.ffMeasure = {
    mode: !TAG_ID ? "off" : TAG_ID.indexOf("GTM-") === 0 ? "gtm" : "gtag",
    event: function (name, params) {
      if (!allowed()) return;
      params = params || {};
      if (TAG_ID.indexOf("GTM-") === 0) window.dataLayer.push(Object.assign({}, params, { event: name }));
      else {
        gtag("event", name, params);
        if (CONVERSION_LABELS[name]) gtag("event", "conversion", { send_to: CONVERSION_LABELS[name] });
      }
    }
  };
  try { localStorage.removeItem("ff_consent_v1"); } catch (e) {}
  gtag("consent", "default", signals(false));
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", false);
  if (allowed()) { gtag("consent", "update", signals(true)); loadTag(); }
  else clearMeasurement();
  if (!choice && TAG_ID) banner(false);
  document.querySelectorAll("[data-consent-settings]").forEach(function (button) {
    button.hidden = !TAG_ID;
    button.addEventListener("click", function () { banner(true); });
  });
  document.addEventListener("ff:langchange", function () { if (activeBox) translate(activeBox); });
  window.addEventListener("storage", function (event) {
    if (event.key !== STORE_KEY && event.key !== null) return;
    choice = readChoice();
    if (!allowed()) {
      gtag("consent", "update", signals(false));
      clearMeasurement();
      document.dispatchEvent(new CustomEvent("ff:consentchange"));
      if (loaded) window.location.reload();
      else if (!choice) banner(false);
    }
    // Accepting in another tab takes effect here on the next navigation.
  });
})();
