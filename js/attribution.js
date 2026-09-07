/* First-touch ad attribution is collected only after measurement consent.
   Click identifiers can be personal data once linked to an enquiry. */
(function () {
  "use strict";
  var KEY = "ff_attr_v2";
  var PARAMS = { gclid: 512, gbraid: 512, wbraid: 512, utm_source: 256,
    utm_medium: 256, utm_campaign: 256, utm_term: 256, utm_content: 256 };
  var current = null;
  function allowed() { return !!(window.ffConsent && window.ffConsent.allowed()); }
  function clip(value, max) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
  function clear() {
    current = null;
    try { sessionStorage.removeItem(KEY); sessionStorage.removeItem("ff_attr_v1"); } catch (e) {}
  }
  function safeUrl(value, originOnly) {
    try {
      var url = new URL(value);
      if (url.protocol !== "https:" && url.protocol !== "http:") return "";
      return clip(url.origin + (originOnly ? "" : url.pathname), 2000);
    } catch (e) { return ""; }
  }
  function clean(record) {
    var out = {};
    Object.keys(PARAMS).forEach(function (key) {
      var value = clip(record[key], PARAMS[key]);
      if (value) out[key] = value;
    });
    out.landing_url = safeUrl(record.landing_url, false);
    out.referrer = safeUrl(record.referrer, true);
    return out;
  }
  function capture() {
    if (!allowed()) { clear(); return; }
    if (current) return;
    try {
      var saved = JSON.parse(sessionStorage.getItem(KEY));
      if (saved && saved.consentAt === window.ffConsent.timestamp()) current = clean(saved);
    } catch (e) {}
    if (current) return;
    var params = {};
    var search = new URLSearchParams(window.location.search);
    Object.keys(PARAMS).forEach(function (key) { params[key] = search.get(key); });
    params.landing_url = window.location.href;
    params.referrer = document.referrer;
    current = clean(params);
    var stored = Object.assign({}, current, { consentAt: window.ffConsent.timestamp() });
    try { sessionStorage.setItem(KEY, JSON.stringify(stored)); } catch (e) {}
  }
  try { sessionStorage.removeItem("ff_attr_v1"); } catch (e) {}
  capture();
  document.addEventListener("ff:consentchange", function () { clear(); capture(); });
  window.ffAttribution = {
    get: function () {
      capture();
      // This identifies the submitted form, even without advertising consent.
      var out = { landing_token: clip(document.body.getAttribute("data-ff-page") || "ff-home", 128) };
      if (allowed() && current) Object.keys(current).forEach(function (key) { out[key] = current[key]; });
      return out;
    },
    isPaid: function () {
      return !!(allowed() && current && (current.gclid || current.gbraid || current.wbraid));
    }
  };
})();
