/* =========================================================================
   FilthyFilter by whispAir — first-touch attribution capture.

   Reads the Google click ids and the UTM set out of the landing URL and keeps
   them for the length of the visit, so the enquiry that goes to whispair-api
   can say which ad paid for it. Without this the funnel stops at "someone
   filled the form" and no job value can ever be reported back to Google Ads.

   First touch wins: a visitor who lands on an ad, wanders off to the case page
   and comes back must still be credited to that ad. Nothing here identifies a
   person, nothing is read back later by us, and it all dies with the tab.

   Loads before main.js and exposes window.ffAttribution.
   ========================================================================= */
(function () {
  "use strict";

  var KEY = "ff_attr_v1";

  // Field name -> maximum length accepted by lead_attribution in whispair-api.
  // Truncating here keeps a padded URL from being rejected at the far end.
  var PARAMS = {
    gclid: 512,
    gbraid: 512,
    wbraid: 512,
    utm_source: 256,
    utm_medium: 256,
    utm_campaign: 256,
    utm_term: 256,
    utm_content: 256
  };

  var URL_MAX = 2000;

  function clip(value, max) {
    if (typeof value !== "string") return "";
    value = value.trim();
    return value.length > max ? value.slice(0, max) : value;
  }

  /* Reads the attribution parameters out of the current URL. Returns null when
     the visitor arrived without a single one of them, so an organic visit does
     not overwrite an earlier paid landing with a row full of empties. */
  function fromUrl() {
    var found = null;
    var search = window.location.search;
    if (!search || search.length < 2) return null;

    var pairs = search.slice(1).split("&");
    for (var i = 0; i < pairs.length; i++) {
      var eq = pairs[i].indexOf("=");
      if (eq < 1) continue;

      var name = decodeURIComponent(pairs[i].slice(0, eq).replace(/\+/g, " ")).toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(PARAMS, name)) continue;

      var raw = "";
      try {
        raw = decodeURIComponent(pairs[i].slice(eq + 1).replace(/\+/g, " "));
      } catch (e) {
        continue; // a malformed escape is not worth failing the page over
      }

      var value = clip(raw, PARAMS[name]);
      if (value === "") continue;

      found = found || {};
      found[name] = value;
    }

    return found;
  }

  function load() {
    try {
      var stored = window.sessionStorage.getItem(KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null; // private mode, blocked storage, or someone else's junk
    }
  }

  function save(record) {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(record));
    } catch (e) {
      // Storage can be full or refused. The visit still works; only the credit
      // for a later page view is lost, and the current page keeps its copy.
    }
  }

  /* The landing page identifier travels as landing_token. It tells the field
     inbox which page and which brand produced the lead without touching the
     source enum in captured_messages. */
  function pageToken() {
    var token = document.body && document.body.getAttribute("data-ff-page");
    return clip(token || "ff-home", 128);
  }

  var current = load();

  if (!current) {
    var params = fromUrl();
    current = params || {};
    current.landing_url = clip(window.location.href, URL_MAX);
    current.referrer = clip(document.referrer || "", URL_MAX);
    save(current);
  }

  window.ffAttribution = {
    /* A flat copy for the lead payload. The token is resolved per page rather
       than stored, so a visitor who landed on the cleaning page and submitted
       from the service page is reported against the page that took the lead. */
    get: function () {
      var out = {};
      for (var key in current) {
        if (Object.prototype.hasOwnProperty.call(current, key)) out[key] = current[key];
      }
      out.landing_token = pageToken();
      return out;
    },

    /* True when this visit carries a Google click id, so the caller can tell a
       paid visit from an organic one without inspecting the payload. */
    isPaid: function () {
      return !!(current.gclid || current.gbraid || current.wbraid);
    }
  };
})();
