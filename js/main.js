/* =========================================================================
   FilthyFilter by whispAir — language toggle (SK/EN) + small UI niceties
   No dependencies. Translatable nodes carry data-sk / data-en.
   ========================================================================= */
(function () {
  "use strict";

  var STORE_KEY = "ff_lang";
  // Music never autoplays; the key only remembers the visitor's last choice.
  var SOUND_STORE_KEY = "ff_sound_v2";
  var DEFAULT_LANG = "sk";
  // Shared destination data for contact links and the planned inquiry builder.
  // Keep static HTML fallbacks in sync so direct contact works without JS.
  var CONTACT = {
    phone: "+421902279094",
    email: "info@filthyfilter.sk",
    whatsapp: "421902279094",
    // Google Business Profile. FilthyFilter is the cleaning division of
    // whispAir and reviews are collected on the one whispAir profile, so this
    // points there. Leave it empty and every reviews element stays hidden:
    // better no button than one that leads nowhere.
    reviews: "https://www.google.com/maps/place/whispAir/@48.2049312,17.3510103,17z/data=!3m1!4b1!4m6!3m5!1s0x476c85d17c386543:0x6daa2776af7e64fc!8m2!3d48.2049312!4d17.3510103!16s%2Fg%2F11ftb828lv"
  };

  // Where the enquiry goes. whispair-api stores the lead with its attribution
  // and later reports the finished job's value back to Google Ads, which is the
  // whole reason the form posts anywhere at all. The preview host and the local
  // preview talk to staging, so a test enquiry never reaches the field inbox.
  function apiBase() {
    var host = location.hostname;
    var staging = host === "dev.filthyfilter.sk" ||
                  host === "127.0.0.1" ||
                  host === "localhost";
    return staging ? "https://api-dev.whispair.sk" : "https://api.whispair.sk";
  }

  var LEAD_PATH = "/api/v1/leads";

  /* Measurement is optional. No event is queued without current consent. */
  function track(name, params) {
    if (!window.ffConsent || !window.ffConsent.allowed()) return;
    try {
      // js/consent.js owns the send, because how an event reaches Google depends
      // on which kind of tag is installed and sending the wrong shape loses it
      // without an error. The dataLayer fallback keeps events visible if that
      // file is ever absent.
      if (window.ffMeasure && typeof window.ffMeasure.event === "function") {
        window.ffMeasure.event(name, params || {});
        return;
      }
      window.dataLayer = window.dataLayer || [];
      var payload = { event: name };
      for (var key in params || {}) {
        if (Object.prototype.hasOwnProperty.call(params, key)) payload[key] = params[key];
      }
      window.dataLayer.push(payload);
    } catch (e) {
      // Measurement must never break the page it measures.
    }
  }

  // Service labels for the prefilled enquiry message. Keys match data-inquiry
  // in the HTML; the plain wa.me/mailto href stays as the no-JS fallback.
  var SERVICES = {
    nastenna:    { sk: "Hĺbkové čistenie nástennej jednotky", en: "Deep clean - wall unit" },
    kazetova:    { sk: "Hĺbkové čistenie kazetovej jednotky", en: "Deep clean - cassette unit" },
    udrzba:      { sk: "Preventívna údržba",                  en: "Preventive maintenance" },
    diagnostika: { sk: "Diagnostika a servis",                en: "Diagnostics and service" },
    firmy:       { sk: "Pravidelný servis pre firmy",         en: "Recurring service for businesses" },
    obhliadka:   { sk: "Neviem, potrebujem poradiť",          en: "Not sure, I need advice" }
  };

  // Field labels used when composing the message. The message is plain text,
  // because it has to survive being pasted into WhatsApp, a mail client or a
  // text field, none of which agree on anything richer.
  var FIELDS = {
    sk: {
      intro: "Dobrý deň, mám záujem o:",
      place: "Obec / PSČ",
      units: "Počet jednotiek",
      unitsUnknown: "neviem",
      name: "Meno",
      phone: "Telefón",
      email: "E-mail",
      problem: "Čo ma trápi",
      date: "Preferovaný termín",
      express: "Prednostný termín do 24 hodín: áno, s príplatkom {{p-expres}} s DPH",
      subject: "Dopyt z filthyfilter.sk",
      origin: "Dopyt z filthyfilter.sk"
    },
    en: {
      intro: "Hello, I am interested in:",
      place: "Town / postcode",
      units: "Number of units",
      unitsUnknown: "not sure",
      name: "Name",
      phone: "Phone",
      email: "E-mail",
      problem: "The problem",
      date: "Preferred date",
      express: "Priority appointment within 24 hours: yes, surcharge {{p-expres}} incl. VAT",
      subject: "Enquiry from filthyfilter.sk",
      origin: "Enquiry from filthyfilter.sk"
    }
  };

  // Services that make sense to count. Diagnostics and "not sure" do not.
  var COUNTABLE = { nastenna: 1, kazetova: 1, udrzba: 1, firmy: 1 };

  /* The package code that owns the price of a chosen service, so an enquiry can
     be joined to the catalog without matching on a label. PRICES below is the
     one place those codes are written down, and the service keys line up with
     its tokens. "firmy" and "obhliadka" have no single package by design: one
     is quoted per site, the other is a visit to find out what is needed. */
  function serviceCode(service) {
    var price = PRICES["p-" + service];
    return (price && price.code) || "";
  }

  /* =======================================================================
     PRICES — the one place a figure is written down.

     Before this existed the same four amounts were typed out 77 times across
     three pages, in two languages, in prose and in the price chips. Changing
     one meant finding all of them, and missing one meant the site quietly
     contradicted itself.

     Translated text now writes {{p-nastenna}} and applyLang() substitutes the
     amount for the current language. The literal figure still sits in the HTML
     between the tags as a fallback for the moment before scripts run; it is
     overwritten immediately and checkPriceDrift() below reports any that have
     fallen out of step, but only in the local preview.

     The currency sits on the side the language puts it: 79 € and €79.

     `code` points at the service package in the portal that owns this figure.
     The public feed enhances these fallbacks after the initial render. Only
     known FF packages in EUR including VAT can replace them. Publishing is a
     separate portal action; an empty feed is a valid response.
     ======================================================================= */
  var PRICES = {
    "p-nastenna":    { code: "FF-CIST-NASTENNA", sk: "79 €",  en: "€79" },
    "p-kazetova":    { code: "FF-CIST-KAZETOVA", sk: "129 €", en: "€129" },
    "p-udrzba":      { code: "FF-UDRZBA",        sk: "49 €",  en: "€49" },
    "p-diagnostika": { code: "FF-DIAGNOSTIKA",   sk: "49 €",  en: "€49" },
    // A surcharge, not a service on its own: it is added to whichever cleaning
    // or service package the visitor picked above.
    "p-expres":      { code: "FF-EXPRES-24H",    sk: "49 €",  en: "€49" }
  };

  var PRICE_TOKEN = /\{\{(p-[a-z]+)\}\}/g;

  function refreshPriceText() {
    var lang = document.documentElement.getAttribute("lang") || DEFAULT_LANG;
    document.querySelectorAll("[data-sk][data-en]").forEach(function (el) {
      var raw = el.getAttribute("data-" + lang);
      if (raw.indexOf("{{p-") === -1) return;
      var target = el.getAttribute("data-attr-target");
      if (target) el.setAttribute(target, withPrices(raw, lang));
      else el.textContent = withPrices(raw, lang);
    });
    var meta = (window.FF_META && window.FF_META[lang]) || META[lang];
    if (meta) {
      document.title = withPrices(meta.title, lang);
      var description = document.querySelector('meta[name="description"]');
      if (description) description.setAttribute("content", withPrices(meta.desc, lang));
    }
  }

  function initPrices() {
    if (!window.fetch || !document.querySelector('[data-sk*="{{p-"]')) return;
    var controller = window.AbortController ? new AbortController() : null;
    var expired = false;
    var timeout = setTimeout(function () {
      expired = true;
      if (controller) controller.abort();
    }, 4000);
    var options = { credentials: "omit", referrerPolicy: "no-referrer" };
    if (controller) options.signal = controller.signal;
    fetch(apiBase() + "/api/v1/service-packages/published", options)
      .then(function (response) {
        if (!response.ok) throw new Error("Price feed unavailable");
        return response.json();
      })
      .then(function (body) {
        if (expired || !body || body.success !== true || !Array.isArray(body.servicePackages)) return;
        var changed = false;
        Object.keys(PRICES).forEach(function (key) {
          var matches = body.servicePackages.filter(function (pkg) {
            return pkg && pkg.packageCode === PRICES[key].code;
          });
          // Duplicate codes, null, strings, non-EUR or ambiguous VAT: keep fallback.
          if (matches.length !== 1) return;
          var pkg = matches[0];
          if (pkg.currency !== "EUR" || pkg.priceVatMode !== "vat_included" ||
              typeof pkg.priceAmount !== "number" || !isFinite(pkg.priceAmount) ||
              pkg.priceAmount <= 0 || pkg.priceAmount > 1000000) return;
          var cents = Math.round(pkg.priceAmount * 100);
          if (Math.abs(pkg.priceAmount * 100 - cents) > 0.000001) return;
          var amount = (cents / 100).toFixed(cents % 100 ? 2 : 0);
          PRICES[key].sk = amount.replace(".", ",") + " €";
          PRICES[key].en = "€" + amount;
          changed = true;
        });
        if (changed) {
          refreshPriceText();
          document.dispatchEvent(new CustomEvent("ff:priceschange"));
        }
      })
      .catch(function () { /* Static prices keep working when the API does not. */ })
      .then(function () { clearTimeout(timeout); });
  }

  function withPrices(text, lang) {
    if (text.indexOf("{{") === -1) return text;
    return text.replace(PRICE_TOKEN, function (whole, key) {
      var price = PRICES[key];
      return price ? (price[lang] || price.sk) : whole;
    });
  }

  /* Local preview only, and only on the very first pass, because after that the
     text has been overwritten from the table and would always agree with itself.

     It compares against the Slovak value on purpose: the literal figure between
     the tags is always the Slovak fallback, whatever language the visitor last
     chose. Two things are worth a warning while editing: a fallback that has
     fallen behind the table, and a figure typed straight into the copy instead
     of using a token. Neither is worth a word to a visitor, so this never runs
     in production. */
  var priceDriftChecked = false;

  function checkPriceDrift(nodes) {
    var host = location.hostname;
    if (priceDriftChecked) return;
    priceDriftChecked = true;
    if (host !== "127.0.0.1" && host !== "localhost") return;

    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.getAttribute("data-attr-target")) continue;
      var raw = el.getAttribute("data-sk");
      if (raw === null) continue;

      if (raw.indexOf("{{") !== -1) {
        var expected = withPrices(raw, "sk");
        if (el.textContent.trim() !== expected.trim()) {
          console.warn("[ceny] záložný text v HTML nesedí s tabuľkou:", el.textContent.trim(), "->", expected.trim());
        }
      } else if (/\d+\s*€|€\s*\d+/.test(raw)) {
        console.warn("[ceny] suma napísaná mimo tabuľky, použi značku:", raw.slice(0, 90));
      }
    }
  }

  /* Build the message from whatever the visitor actually filled in. Empty fields
     are left out rather than sent as blank lines, so a two-line enquiry stays a
     two-line enquiry.

     omitContact drops the name, the contact details and the town. The API stores
     those as their own columns and appends them to the message body itself, so
     leaving them in would print every enquiry's contact twice in the field inbox.
     WhatsApp and the mail draft have no such columns, so there they stay. */
  function buildMessage(data, lang, opts) {
    var L = FIELDS[lang] || FIELDS.sk;
    var service = (SERVICES[data.service] && SERVICES[data.service][lang]) || "";
    var withContact = !(opts && opts.omitContact);
    // First line names the brand. The phone number and the field inbox are
    // shared with whispAir, so without it nobody can tell a cleaning enquiry
    // from a unit sale, on WhatsApp or in the inbox. landing_token records the
    // same thing in the attribution row, but a technician does not read that.
    var lines = [L.origin];
    if (service) lines.push(L.intro + " " + service + ".");
    if (withContact && data.place) lines.push(L.place + ": " + data.place);
    if (data.unitsUnknown) lines.push(L.units + ": " + L.unitsUnknown);
    else if (data.units) lines.push(L.units + ": " + data.units);
    if (withContact && data.name) lines.push(L.name + ": " + data.name);
    if (withContact && data.phone) lines.push(L.phone + ": " + data.phone);
    if (withContact && data.email) lines.push(L.email + ": " + data.email);
    if (data.problem) lines.push(L.problem + ": " + data.problem);
    if (data.date) lines.push(L.date + ": " + data.date);
    // Only written when it is ticked. A line saying "no" would make every
    // ordinary enquiry read like a refused upsell.
    if (data.express) lines.push(withPrices(L.express, lang));
    return lines.join("\n");
  }

  // A blank template for the service cards, so the visitor lands in their app
  // with the prompts already written out.
  //
  // Same first line as buildMessage, and for the same reason: the number is
  // shared with whispAir and the API reads the brand out of the message text.
  // An ad click is told apart by its destination URL, but a visitor who finds
  // the site on their own and taps a service card has nothing else to go on.
  function buildTemplate(service, lang) {
    var L = FIELDS[lang] || FIELDS.sk;
    var name = (SERVICES[service] && SERVICES[service][lang]) || "";
    return [
      L.origin,
      L.intro + " " + name + ".",
      L.place + ": ",
      L.units + ": ",
      L.problem + ": ",
      L.date + ": "
    ].join("\n");
  }

  function waLink(text) {
    return "https://wa.me/" + CONTACT.whatsapp + "?text=" + encodeURIComponent(text);
  }
  function mailLink(text, lang) {
    var L = FIELDS[lang] || FIELDS.sk;
    return "mailto:" + CONTACT.email +
      "?subject=" + encodeURIComponent(L.subject) +
      "&body=" + encodeURIComponent(text);
  }

  // Rewrite every service CTA so the visitor's messaging app opens with the
  // right service already named. Nothing is stored or sent by the page itself.
  //
  // The plain WhatsApp buttons — the floating mobile bar and the contact panel
  // — name no service, but they still open with the origin line rather than an
  // empty box. The number is shared with whispAir and the API reads the brand
  // out of the message text, so a WhatsApp lead that names nothing cannot be
  // told from a unit sale. Rebuilt on every language change, because the
  // visitor may switch after the page has loaded.
  function updateInquiryLinks(lang) {
    var L = FIELDS[lang] || FIELDS.sk;
    var links = document.querySelectorAll('a[data-inquiry], a[data-contact="whatsapp"]');
    for (var i = 0; i < links.length; i++) {
      // Only a link that names its channel is ours to rewrite. Without this a
      // stray data-inquiry on an in-page anchor is enough to turn a button
      // that says "go to the form" into a WhatsApp link, and nothing about
      // the markup would say so.
      var kind = links[i].getAttribute("data-contact");
      if (kind !== "whatsapp" && kind !== "email") continue;
      var key = links[i].getAttribute("data-inquiry");
      if (key && !SERVICES[key]) continue;
      var body = key ? buildTemplate(key, lang) : L.origin;
      links[i].setAttribute("href", kind === "email" ? mailLink(body, lang) : waLink(body));
    }
  }

  function initContact() {
    var destinations = {
      phone: "tel:" + CONTACT.phone,
      email: "mailto:" + CONTACT.email,
      whatsapp: "https://wa.me/" + CONTACT.whatsapp
    };
    document.querySelectorAll("a[data-contact]").forEach(function (link) {
      var kind = link.getAttribute("data-contact");
      var href = destinations[kind];
      if (href) link.setAttribute("href", href);

      // Intent, not contact. A tapped number is not a call and a tapped
      // WhatsApp link is not a message, so these stay secondary next to
      // lead_submitted and must never be optimised against on their own.
      if (kind === "phone" || kind === "whatsapp") {
        link.addEventListener("click", function () {
          track(kind === "phone" ? "phone_click" : "whatsapp_click", {
            placement: link.getAttribute("data-inquiry") || "generic"
          });
        });
      }
    });

    // Reviews live on the Google profile, not on this page. Without a profile
    // URL there is nothing to link to, so the whole block stays hidden.
    var hasProfile = !!CONTACT.reviews;
    document.querySelectorAll("a[data-reviews]").forEach(function (link) {
      if (hasProfile) link.setAttribute("href", CONTACT.reviews);
      link.hidden = !hasProfile;
    });
    document.querySelectorAll("[data-reviews-block]").forEach(function (block) {
      block.hidden = !hasProfile;
    });
  }
  var MUSIC_URL = new URL("../assets/backgroundMusic.mp3", document.currentScript.src).href;

  var META = {
    en: {
      title: "FilthyFilter by whispAir — AC cleaning and service, on the record",
      desc: "The AC decontamination division. Photographs before and after, the FFFF scale, and a price agreed before we start. Bratislava, Trnava, Nitra and 20 km around them."
    },
    sk: {
      title: "FilthyFilter by whispAir — čistenie a servis klimatizácií so záznamom",
      desc: "Divízia dekontaminácie klímy. Fotografie pred zásahom a po ňom, škála FFFF a cena dohodnutá vopred. Bratislava, Trnava, Nitra a okolie do 20 km."
    }
  };

  function applyLang(lang, persist) {
    if (lang !== "en" && lang !== "sk") lang = DEFAULT_LANG;

    document.documentElement.setAttribute("lang", lang);

    // swap text content
    var nodes = document.querySelectorAll("[data-en][data-sk]");
    checkPriceDrift(nodes);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var val = el.getAttribute("data-" + lang);
      if (val === null) continue;
      val = withPrices(val, lang);
      // attribute-targeted swaps: data-attr-target="aria-label" etc.
      var attrTarget = el.getAttribute("data-attr-target");
      if (attrTarget) {
        el.setAttribute(attrTarget, val);
      } else {
        el.textContent = val;
      }
    }

    // meta + title — a page may override via window.FF_META (per-city pages)
    var meta = (window.FF_META && window.FF_META[lang]) || META[lang];
    if (meta) {
      document.title = withPrices(meta.title, lang);
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute("content", withPrices(meta.desc, lang));
    }

    // active button state
    var btns = document.querySelectorAll(".langswitch button");
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.toggle("active", btns[j].getAttribute("data-lang") === lang);
      btns[j].setAttribute("aria-pressed", btns[j].getAttribute("data-lang") === lang ? "true" : "false");
    }

    updateInquiryLinks(lang);
    document.dispatchEvent(new CustomEvent("ff:langchange"));

    if (persist) {
      try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
    }
  }

  function initLang() {
    var selected = null;
    try { selected = localStorage.getItem(STORE_KEY); } catch (e) {}
    applyLang(selected || DEFAULT_LANG, false);

    var btns = document.querySelectorAll(".langswitch button");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () {
        applyLang(this.getAttribute("data-lang"), true);
      });
    }
  }

  /* Section fade-in: each .reveal container fades + slides up once, when it
     first scrolls into view. One-shot (unobserve after), no scroll-linked
     motion. Falls back to "just show everything" without IntersectionObserver. */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add("in");
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    for (var k = 0; k < els.length; k++) io.observe(els[k]);
  }

  /* One FAQ answer open at a time.

     Modern browsers do this natively: <details> elements sharing a name
     attribute behave as one exclusive group, with no script involved. This
     only fills the gap for browsers that do not support it yet, where the
     items would otherwise open independently. */
  function initFaq() {
    var items = document.querySelectorAll("details.faq__item[name]");
    if (!items.length) return;
    if (typeof HTMLDetailsElement !== "undefined" &&
        "name" in HTMLDetailsElement.prototype) return;

    for (var i = 0; i < items.length; i++) {
      items[i].addEventListener("toggle", function () {
        if (!this.open) return;
        for (var j = 0; j < items.length; j++) {
          if (items[j] !== this) items[j].open = false;
        }
      });
    }
  }

  /* Touch has no hover, so a tap flips the tile instead. Pointer devices keep
     using :hover and the keyboard uses :focus-visible; this only adds the case
     CSS cannot express. */
  function initFlipTiles() {
    var tiles = document.querySelectorAll(".ffff");
    for (var i = 0; i < tiles.length; i++) {
      tiles[i].addEventListener("click", function () {
        this.classList.toggle("is-flipped");
      });
      tiles[i].addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        this.classList.toggle("is-flipped");
      });
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector(".nav__toggle");
    var links = document.querySelector(".nav__links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  function initMusic() {
    if (document.body.getAttribute("data-ff-page") === "ff-privacy") return;
    var audio = new Audio(MUSIC_URL);
    var fadeFrame = 0;
    var targetVolume = 0.28;
    audio.loop = true;
    audio.preload = "metadata";

    var control = document.createElement("button");
    control.className = "sound-toggle";
    control.type = "button";
    control.setAttribute("aria-pressed", "false");
    control.innerHTML = '<span aria-hidden="true">○</span> <b data-en="Sound off" data-sk="Zvuk vypnutý">Zvuk vypnutý</b>';
    document.body.appendChild(control);

    function setControl(playing) {
      control.classList.toggle("is-playing", playing);
      control.setAttribute("aria-pressed", playing ? "true" : "false");
      var label = control.querySelector("b");
      var indicator = control.querySelector("span");
      label.setAttribute("data-en", playing ? "Sound on" : "Sound off");
      label.setAttribute("data-sk", playing ? "Zvuk zapnutý" : "Zvuk vypnutý");
      var lang = document.documentElement.getAttribute("lang") || DEFAULT_LANG;
      label.textContent = label.getAttribute("data-" + lang);
      indicator.textContent = playing ? "●" : "○";
      control.setAttribute("aria-label", label.textContent);
    }

    function fadeIn() {
      cancelAnimationFrame(fadeFrame);
      audio.volume = 0;
      var started = performance.now();
      function step(now) {
        var progress = Math.min((now - started) / 4000, 1);
        audio.volume = targetVolume * (1 - Math.pow(1 - progress, 3));
        if (progress < 1) fadeFrame = requestAnimationFrame(step);
      }
      fadeFrame = requestAnimationFrame(step);
    }

    function playMusic() {
      audio.play().then(function () {
        fadeIn();
        setControl(true);
        try { localStorage.setItem(SOUND_STORE_KEY, "on"); } catch (e) {}
      }).catch(function () {
        setControl(false);
      });
    }

    function stopMusic() {
      cancelAnimationFrame(fadeFrame);
      audio.pause();
      audio.currentTime = 0;
      setControl(false);
      try { localStorage.setItem(SOUND_STORE_KEY, "off"); } catch (e) {}
    }

    control.addEventListener("click", function () {
      if (audio.paused) playMusic(); else stopMusic();
    });

    setControl(false);

  }

  /* ---------------------------------------------------------------------
     Enquiry builder. No server, no storage: the page composes a plain-text
     message and hands it to the visitor's own WhatsApp or mail client, where
     they send it themselves and can attach photos. The page never claims the
     message was delivered, because it has no way of knowing.
     --------------------------------------------------------------------- */
  function initInquiry() {
    var form = document.getElementById("inquiry-form");
    if (!form) return;

    var els = {
      service: document.getElementById("inq-service"),
      place: document.getElementById("inq-place"),
      units: document.getElementById("inq-units"),
      unitsUnknown: document.getElementById("inq-units-unknown"),
      unitsField: document.getElementById("inq-units-field"),
      name: document.getElementById("inq-name"),
      phone: document.getElementById("inq-phone"),
      email: document.getElementById("inq-email-addr"),
      company: document.getElementById("inq-company"),
      problem: document.getElementById("inq-problem"),
      date: document.getElementById("inq-date"),
      express: document.getElementById("inq-express"),
      preview: document.getElementById("inq-preview"),
      status: document.getElementById("inq-status"),
      send: document.getElementById("inq-send")
    };

    function lang() {
      return document.documentElement.getAttribute("lang") === "en" ? "en" : "sk";
    }

    function read() {
      var countable = !!COUNTABLE[els.service.value];
      return {
        service: els.service.value,
        place: els.place.value.trim(),
        units: countable && !els.unitsUnknown.checked ? els.units.value.trim() : "",
        unitsUnknown: countable && els.unitsUnknown.checked,
        name: els.name.value.trim(),
        phone: els.phone.value.trim(),
        email: els.email.value.trim(),
        company: els.company ? els.company.value.trim() : "",
        problem: els.problem.value.trim(),
        date: els.date.value.trim(),
        express: !!(els.express && els.express.checked)
      };
    }

    function setError(id, on) {
      var err = document.getElementById(id + "-err");
      var input = document.getElementById(id);
      if (err) err.hidden = !on;
      if (input) input.setAttribute("aria-invalid", on ? "true" : "false");
    }

    // Units only apply where counting them means something.
    function syncUnits() {
      var countable = !!COUNTABLE[els.service.value];
      els.unitsField.hidden = !countable;
      els.units.disabled = !countable || els.unitsUnknown.checked;
      if (els.unitsUnknown.checked) els.units.value = "";
    }

    /* Two levels on purpose. Sending to the API needs a name and a way to reply,
       because nobody can act on an anonymous row in the inbox. WhatsApp and the
       mail draft need neither: the visitor's own app carries their identity, and
       demanding it twice would put friction on the channel that exists to avoid
       friction. Passing strict=false keeps those buttons as light as before. */
    function validate(strict) {
      var d = read();
      var ok = true;
      var first = null;

      if (!d.service) { setError("inq-service", true); ok = false; first = first || els.service; }
      else setError("inq-service", false);

      if (!d.place) { setError("inq-place", true); ok = false; first = first || els.place; }
      else setError("inq-place", false);

      // A count is optional, but if one is given it has to be a whole
      // positive number rather than "a few" or "3.5".
      var badUnits = d.units !== "" && !/^[1-9][0-9]*$/.test(d.units);
      if (badUnits) { setError("inq-units", true); ok = false; first = first || els.units; }
      else setError("inq-units", false);

      if (strict) {
        // The API rejects a submission without these, so refusing here saves
        // the visitor a pointless round trip to find that out.
        if (!d.name) { setError("inq-name", true); ok = false; first = first || els.name; }
        else setError("inq-name", false);

        if (!hasContact(d)) {
          setContactError(true);
          ok = false;
          first = first || els.phone;
        } else {
          setContactError(false);
        }
      }

      if (!ok && first) first.focus();
      return ok;
    }

    function hasContact(d) {
      return d.phone !== "" || d.email !== "";
    }

    // One message covers both fields, because either one on its own is enough.
    // Marking them both invalid would read as two separate mistakes.
    function setContactError(on) {
      var err = document.getElementById("inq-contact-err");
      if (err) err.hidden = !on;
      els.phone.setAttribute("aria-invalid", on ? "true" : "false");
      els.email.setAttribute("aria-invalid", on ? "true" : "false");
    }

    // Errors are only raised when the visitor tries to continue, but they are
    // cleared as soon as the field is fixed. Leaving a red line under a field
    // the visitor has already corrected is just nagging.
    function clearResolved() {
      var d = read();
      if (d.service) setError("inq-service", false);
      if (d.place) setError("inq-place", false);
      if (d.units === "" || /^[1-9][0-9]*$/.test(d.units)) setError("inq-units", false);
      if (d.name) setError("inq-name", false);
      if (hasContact(d)) setContactError(false);
    }

    function refresh() {
      syncUnits();
      clearResolved();
      els.preview.value = buildMessage(read(), lang());
    }

    function say(key, bad) {
      var msg = {
        sk: {
          wa: "Správa je pripravená vo WhatsApse. Odoslať ju musíte tam.",
          mail: "Správa je pripravená v poštovom klientovi. Odoslať ju musíte tam.",
          copied: "Text je skopírovaný. Vložte ho, kam potrebujete.",
          manual: "Kopírovanie sa nepodarilo. Text je vyššie, označte a skopírujte ho ručne.",
          sending: "Odosielam dopyt…",
          sent: "Dopyt je u nás. Ozveme sa vám na uvedený kontakt.",
          rejected: "Dopyt sa nepodarilo odoslať, skontrolujte vyplnené údaje.",
          failed: "Odoslanie zlyhalo. Použite tlačidlo WhatsApp alebo nám zavolajte, text je pripravený vyššie."
        },
        en: {
          wa: "The message is waiting in WhatsApp. You send it from there.",
          mail: "The message is waiting in your mail client. You send it from there.",
          copied: "The text is copied. Paste it wherever you need.",
          manual: "Copying failed. The text is above; select and copy it by hand.",
          sending: "Sending the enquiry…",
          sent: "We have your enquiry. We will reply to the contact you gave us.",
          rejected: "The enquiry was not accepted; please check what you filled in.",
          failed: "Sending failed. Use the WhatsApp button or call us; the text above is ready to go."
        }
      };
      els.status.textContent = (msg[lang()] || msg.sk)[key];
      els.status.classList.toggle("inquiry__status--bad", !!bad);
    }

    form.addEventListener("input", refresh);
    form.addEventListener("change", refresh);

    /* One form_start per visit, on the first real keystroke. Firing it on focus
       would count everyone who tabbed past the form on their way to the phone
       number, which is the opposite of what the number is for. */
    var started = false;
    form.addEventListener("input", function () {
      if (started) return;
      started = true;
      track("form_start", { form: "inquiry" });
    });

    /* The enquiry goes to whispair-api, where it becomes a captured message in
       the same field inbox as every other lead, with its attribution attached.
       When the network or the API is down the visitor is not left staring at a
       dead button: the composed text is still there and WhatsApp still works. */
    function send() {
      if (!validate(true)) return;

      // A browser too old for fetch still deserves a working enquiry, and it
      // already has one: the composed message and WhatsApp.
      if (typeof window.fetch !== "function") {
        say("failed", true);
        return;
      }

      var d = read();
      var text = buildMessage(d, lang(), { omitContact: true });
      var attribution = (window.ffAttribution && window.ffAttribution.get()) || {};

      var payload = {
        name: d.name,
        phone: d.phone,
        email: d.email,
        address: d.place,
        // The composed text stays the message body a technician reads. It
        // carries the same answers in the visitor's own words.
        message: text,
        company: d.company, // honeypot; a person leaves this empty
        // The same answers as fields. Prose cannot be priced, booked or
        // counted by service; these can. The API stores them beside the text,
        // and ignores any it does not know, so an older API is not broken by
        // a newer page.
        business_brand: "filthyfilter",
        service_key: d.service,
        service_code: serviceCode(d.service),
        place: d.place,
        preferred_time_text: d.date,
        express: d.express
      };
      if (d.unitsUnknown) payload.unit_count_unknown = true;
      else if (d.units) payload.unit_count = d.units;

      for (var key in attribution) {
        if (Object.prototype.hasOwnProperty.call(attribution, key)) payload[key] = attribution[key];
      }

      els.send.disabled = true;
      say("sending");

      fetch(apiBase() + LEAD_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (res.ok) {
          // Counted only once the API has taken the lead. A click on the button
          // is not a lead, and reporting it as one teaches Google the wrong thing.
          track("lead_submitted", {
            service: d.service,
            page: attribution.landing_token || "ff-home"
          });
          form.reset();
          syncUnits();
          els.preview.value = "";
          say("sent");
          return;
        }
        // 422 is our own validation disagreeing; anything else is a fault on
        // our side, and the visitor should be pushed to a channel that works.
        say(res.status === 422 ? "rejected" : "failed", true);
      }).catch(function () {
        say("failed", true);
      }).then(function () {
        els.send.disabled = false;
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      send();
    });

    document.getElementById("inq-whatsapp").addEventListener("click", function () {
      if (!validate()) return;
      window.open(waLink(buildMessage(read(), lang())), "_blank", "noopener");
      track("whatsapp_click", { placement: "inquiry" });
      say("wa");
    });

    document.getElementById("inq-email").addEventListener("click", function () {
      if (!validate()) return;
      window.location.href = mailLink(buildMessage(read(), lang()), lang());
      say("mail");
    });

    document.getElementById("inq-copy").addEventListener("click", function () {
      if (!validate()) return;
      var text = buildMessage(read(), lang());
      els.preview.value = text;
      // The clipboard API is unavailable over plain HTTP and in some
      // browsers, so fall back to selecting the text for a manual copy.
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { say("copied"); },
                                                 function () { selectPreview(); });
      } else {
        selectPreview();
      }
    });

    function selectPreview() {
      els.preview.focus();
      els.preview.select();
      var done = false;
      try { done = document.execCommand("copy"); } catch (e) {}
      say(done ? "copied" : "manual");
    }

    // Language changes have to redraw the preview, since the message is
    // composed in whichever language the visitor is reading.
    document.addEventListener("ff:langchange", refresh);
    document.addEventListener("ff:priceschange", refresh);
    refresh();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initContact();
    initMusic();
    initLang();
    initPrices();
    initInquiry();
    initFaq();
    initFlipTiles();
    initReveal();
    initMobileNav();
  });
})();
