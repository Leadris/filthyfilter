/* Consent Mode v2, basic mode: no measurement script before agreement. One
   optional purpose: measuring advertising effectiveness. Google runs without
   personalised ads; Meta has no such signal, so its pixel is simply not injected
   before a yes and never after a no. The enquiry works independently of both.
   Consent is versioned and expires. */
(function () {
  "use strict";
  var TAG_ID = window.FILTHYFILTER_CONFIG
    ? window.FILTHYFILTER_CONFIG.gtmContainerId
    : "GTM-57M8XLQJ";
  var META_PIXEL_ID = window.FILTHYFILTER_CONFIG
    ? window.FILTHYFILTER_CONFIG.metaPixelId || ""
    : "";
  // Either tag is reason enough to ask. Gating the banner on the Google id alone
  // would hide it from a future config that runs the pixel and nothing else.
  var CONFIGURED = !!(TAG_ID || META_PIXEL_ID);
  var CONVERSION_LABELS = { lead_submitted: "" }; // GTM owns the existing mapping.
  // Meta takes standard event names. Only what is named here travels to it: the
  // dataLayer params describe the page for our own reports and are not widened.
  var META_EVENTS = {
    phone_click: { name: "Contact", params: { channel: "phone" } },
    whatsapp_click: { name: "Contact", params: { channel: "whatsapp" } },
    lead_submitted: { name: "Lead" },
    form_start: { name: "InitiateCheckout" }
  };
  var STORE_KEY = "ff_consent_v2";
  var VERSION = "2026-09-12";
  var MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  var loaded = false;
  var pixelLoaded = false;
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
    return !!(CONFIGURED && choice && choice.accepted && Date.now() - choice.at < MAX_AGE);
  }
  function signals(accepted) {
    return { ad_storage: accepted ? "granted" : "denied",
      analytics_storage: accepted ? "granted" : "denied",
      ad_user_data: accepted ? "granted" : "denied",
      ad_personalization: "denied" };
  }
  function clearMeasurement() {
    try { sessionStorage.removeItem("ff_attr_v1"); sessionStorage.removeItem("ff_attr_v2"); } catch (e) {}
    // Delete accessible measurement cookies for this site and parent domain.
    var domains = ["", location.hostname];
    var parts = location.hostname.split(".");
    while (parts.length > 2) { parts.shift(); domains.push(parts.join(".")); }
    var paths = ["/"];
    var segments = location.pathname.split("/").filter(Boolean);
    while (segments.length) { paths.push("/" + segments.join("/"), "/" + segments.join("/") + "/"); segments.pop(); }
    document.cookie.split(";").forEach(function (entry) {
      var name = entry.split("=")[0].trim();
      if (!/^(_ga($|_)|_gid$|_gat($|_)|_gcl_|_gac_|_fbp$|_fbc$)/.test(name)) return;
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
  function loadPixel() {
    if (pixelLoaded || !META_PIXEL_ID || !allowed()) return;
    pixelLoaded = true;
    // The stub belongs here, not at file scope. If window.fbq existed before the
    // visitor agreed, an event fired earlier would sit in its queue and replay
    // into Meta the moment the library loaded. Nothing may reach Meta that way.
    var fbq = window.fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window._fbq = window._fbq || fbq;
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    fbq("init", META_PIXEL_ID);
    fbq("track", "PageView");
  }
  function choose(accepted) {
    choice = { version: VERSION, accepted: accepted, at: Date.now() };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(choice)); } catch (e) {}
    gtag("consent", "update", signals(accepted));
    if (!accepted) clearMeasurement();
    document.dispatchEvent(new CustomEvent("ff:consentchange"));
    if (accepted) { loadTag(); loadPixel(); }
    // Already-loaded third-party listeners cannot be reliably unloaded in place.
    else if (loaded || pixelLoaded) window.location.reload();
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
    if (activeBox || !CONFIGURED) return;
    returnFocus = focus ? document.activeElement : null;
    var box = document.createElement("div");
    activeBox = box;
    box.className = "consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-labelledby", "consent-title");
    box.setAttribute("aria-describedby", "consent-description");
    box.innerHTML = '<div class="consent__inner">' +
      '<p class="consent__title" id="consent-title" data-sk="Klímu čistíme. Reklamu meriame len s vaším súhlasom." data-en="We clean ACs. We measure ads only with your agreement."></p>' +
      '<p class="consent__text" id="consent-description" data-sk="Povolíte cookies a meranie návštevy, kliknutí a odoslania dopytu? Týka sa to reklamy na Googli aj na Facebooku a Instagrame, ktoré prevádzkuje Meta. Zdroj reklamy spojíme s dopytom. Pri meraní výslednej zákazky môže Google dostať aj jej hodnotu a zakódovaný e-mail či telefón. Googlu personalizované reklamy nepovoľujeme; Meta dostáva navštívené stránky a kliknutia a používa ich aj na optimalizáciu svojich reklám. Odmietnutie neovplyvní objednávku; voľbu zmeníte v pätičke." data-en="Allow cookies and measurement of visits, clicks and enquiries? This covers advertising on Google and on Facebook and Instagram, which Meta operates. We link the ad source to the enquiry. To measure the resulting job, Google may receive its value and a hashed e-mail or phone number. We do not allow Google to personalise ads; Meta receives the pages you visit and your clicks and also uses them to optimise its own ads. Declining does not affect your booking; change your choice in the footer."></p>' +
      (loaded || pixelLoaded ? '<p class="consent__text" data-sk="Odvolanie súhlasu obnoví túto stránku. Rozpísaný dopyt si predtým skopírujte." data-en="Withdrawing consent reloads this page. Copy any unfinished enquiry first."></p>' : '') +
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
  /* version() is read by attribution.js and travels with the enquiry. Storing the
     choice only in this browser was enough while nothing left the browser; an
     offline conversion export happens on a server months later and has to be able
     to say which notice was agreed to and when. */
  window.ffConsent = {
    allowed: allowed,
    timestamp: function () { return choice ? choice.at : null; },
    version: function () { return choice ? choice.version : null; },
    open: function () { banner(true); }
  };
  window.ffMeasure = {
    mode: !TAG_ID ? "off" : TAG_ID.indexOf("GTM-") === 0 ? "gtm" : "gtag",
    event: function (name, params) {
      if (!allowed()) return;
      params = params || {};
      if (TAG_ID.indexOf("GTM-") === 0) window.dataLayer.push(Object.assign({}, params, { event: name }));
      else if (TAG_ID) {
        gtag("event", name, params);
        if (CONVERSION_LABELS[name]) gtag("event", "conversion", { send_to: CONVERSION_LABELS[name] });
      }
      var meta = pixelLoaded && window.fbq ? META_EVENTS[name] : null;
      if (meta) window.fbq("track", meta.name, meta.params || {});
    }
  };
  try { localStorage.removeItem("ff_consent_v1"); } catch (e) {}
  gtag("consent", "default", signals(false));
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", false);
  if (allowed()) { gtag("consent", "update", signals(true)); loadTag(); loadPixel(); }
  else clearMeasurement();
  if (!choice && CONFIGURED) banner(false);
  document.querySelectorAll("[data-consent-settings]").forEach(function (button) {
    button.hidden = !CONFIGURED;
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
      if (loaded || pixelLoaded) window.location.reload();
      else if (!choice) banner(false);
    }
    // Accepting in another tab takes effect here on the next navigation.
  });
})();
