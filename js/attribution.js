/* First-touch ad attribution is collected only after measurement consent.
   Click identifiers can be personal data once linked to an enquiry. */
(function () {
  "use strict";
  var KEY = "ff_attr_v2";
  // fbclid is here for the same reason as the Google three: the first paid
  // channel is Meta, and without it a Meta lead can be counted but not traced
  // back to the ad that paid for it.
  var PARAMS = { gclid: 512, gbraid: 512, wbraid: 512, fbclid: 512, utm_source: 256,
    utm_medium: 256, utm_campaign: 256, utm_term: 256, utm_content: 256,
    // Google's own numeric ids, written by the ValueTrack final URL suffix. A
    // renamed campaign changes utm_campaign and leaves these alone, which is
    // what lets a lead be matched to a downloaded cost report without relying
    // on names. Empty until the suffix is configured in the Ads account.
    campaignid: 64, adgroupid: 64, targetid: 64 };
  // URL spelling on the left, the API's column on the right.
  var AD_ID_FIELDS = { campaignid: "campaign_id", adgroupid: "adgroup_id", targetid: "keyword_id" };
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
      if (!allowed()) return out;
      if (current) Object.keys(current).forEach(function (key) {
        out[AD_ID_FIELDS[key] || key] = current[key];
      });
      /* The proof that travels with the identifiers. The server stores it beside
         them and the upload workers refuse to export a row that has none, so a
         click id sent months from now can still say what was agreed to and when.
         Both halves go together or neither does; the server enforces the same. */
      var version = window.ffConsent.version();
      var at = window.ffConsent.timestamp();
      if (version && at) {
        out.consent_version = clip(version, 32);
        out.consent_at = new Date(at).toISOString();
      }
      return out;
    },
    isPaid: function () {
      return !!(allowed() && current &&
        (current.gclid || current.gbraid || current.wbraid || current.fbclid));
    }
  };
})();
