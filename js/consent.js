/* =========================================================================
   FilthyFilter by whispAir — tracking consent and Google Consent Mode v2.

   The page measures nothing until a Google tag id is filled in below, so while
   TAG_ID is empty this file draws no banner, sets no cookie and loads nothing.
   That is deliberate: a consent banner on a page that tracks nobody is noise,
   and asking for permission we do not use would be its own kind of dishonest.

   Once a tag id is set, consent defaults go out denied before the tag loads,
   which is what Consent Mode v2 expects. The tag then runs cookieless until
   the visitor accepts. If your legal advice is stricter and wants no Google
   script at all before a yes, move loadTag() inside the accept branch; the
   rest of this file does not care.

   Loads before main.js. The banner is built with data-sk / data-en so the
   existing language switch translates it like any other node.
   ========================================================================= */
(function () {
  "use strict";

  // Fill in to switch measurement on, e.g. "AW-123456789" or "GT-XXXXXXX".
  var TAG_ID = "";

  // Link shown next to the choice. Empty until the site has a privacy notice;
  // the link stays out rather than pointing at a page that does not exist.
  var PRIVACY_URL = "";

  var STORE_KEY = "ff_consent_v1";
  var GRANTED = "granted";
  var DENIED = "denied";

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function stored() {
    try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }

  function remember(value) {
    try { localStorage.setItem(STORE_KEY, value); } catch (e) {}
  }

  /* The four signals Consent Mode v2 asks for. ad_user_data and
     ad_personalization are the two added in v2; without them Google Ads treats
     the whole consent signal as missing. */
  function consentState(granted) {
    return {
      ad_storage: granted ? GRANTED : DENIED,
      ad_user_data: granted ? GRANTED : DENIED,
      ad_personalization: granted ? GRANTED : DENIED,
      analytics_storage: granted ? GRANTED : DENIED
    };
  }

  function loadTag() {
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(TAG_ID);
    document.head.appendChild(script);

    gtag("js", new Date());
    gtag("config", TAG_ID);
  }

  function banner(onChoice) {
    var box = document.createElement("div");
    box.className = "consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-labelledby", "consent-title");

    var privacy = PRIVACY_URL
      ? '<a class="consent__link" href="' + PRIVACY_URL + '"' +
        ' data-en="How we handle data" data-sk="Ako narábame s údajmi">Ako narábame s údajmi</a>'
      : "";

    box.innerHTML =
      '<div class="consent__inner">' +
        '<p class="consent__title" id="consent-title"' +
        ' data-en="Measuring where enquiries come from"' +
        ' data-sk="Meranie toho, odkiaľ chodia dopyty">Meranie toho, odkiaľ chodia dopyty</p>' +
        '<p class="consent__text"' +
        ' data-en="With your agreement we measure which advertisement brought you here, so we do not pay for ads that help nobody. Say no and the site works exactly the same."' +
        ' data-sk="S vaším súhlasom meriame, ktorá reklama vás sem priviedla, aby sme neplatili za reklamy, ktoré nikomu nepomáhajú. Ak odmietnete, stránka funguje presne rovnako.">S vaším súhlasom meriame, ktorá reklama vás sem priviedla, aby sme neplatili za reklamy, ktoré nikomu nepomáhajú. Ak odmietnete, stránka funguje presne rovnako.</p>' +
        '<div class="consent__actions">' +
          '<button type="button" class="btn btn--ghost" data-consent="reject"' +
          ' data-en="Decline" data-sk="Odmietnuť">Odmietnuť</button>' +
          '<button type="button" class="btn btn--primary" data-consent="accept"' +
          ' data-en="Agree" data-sk="Súhlasím">Súhlasím</button>' +
        '</div>' +
        privacy +
      '</div>';

    box.addEventListener("click", function (event) {
      var choice = event.target.getAttribute("data-consent");
      if (!choice) return;
      box.parentNode.removeChild(box);
      onChoice(choice === "accept");
    });

    document.body.appendChild(box);
  }

  if (!TAG_ID) return;

  // Denied first, always, and before the tag exists. A default that arrives
  // after the tag has already reported is not a default.
  gtag("consent", "default", consentState(false));

  var choice = stored();

  if (choice === "yes" || choice === "no") {
    if (choice === "yes") gtag("consent", "update", consentState(true));
    loadTag();
  } else {
    loadTag();
    banner(function (accepted) {
      remember(accepted ? "yes" : "no");
      if (accepted) gtag("consent", "update", consentState(true));
    });
  }
})();
