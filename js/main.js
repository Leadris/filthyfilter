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
    whatsapp: "421902279094"
  };

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
      problem: "Čo ma trápi",
      date: "Preferovaný termín",
      subject: "Dopyt z filthyfilter.sk"
    },
    en: {
      intro: "Hello, I am interested in:",
      place: "Town / postcode",
      units: "Number of units",
      unitsUnknown: "not sure",
      name: "Name",
      problem: "The problem",
      date: "Preferred date",
      subject: "Enquiry from filthyfilter.sk"
    }
  };

  // Services that make sense to count. Diagnostics and "not sure" do not.
  var COUNTABLE = { nastenna: 1, kazetova: 1, udrzba: 1, firmy: 1 };

  // Build the message from whatever the visitor actually filled in. Empty
  // fields are left out rather than sent as blank lines, so a two-line enquiry
  // stays a two-line enquiry.
  function buildMessage(data, lang) {
    var L = FIELDS[lang] || FIELDS.sk;
    var service = (SERVICES[data.service] && SERVICES[data.service][lang]) || "";
    var lines = [];
    if (service) lines.push(L.intro + " " + service + ".");
    if (data.place) lines.push(L.place + ": " + data.place);
    if (data.unitsUnknown) lines.push(L.units + ": " + L.unitsUnknown);
    else if (data.units) lines.push(L.units + ": " + data.units);
    if (data.name) lines.push(L.name + ": " + data.name);
    if (data.problem) lines.push(L.problem + ": " + data.problem);
    if (data.date) lines.push(L.date + ": " + data.date);
    return lines.join("\n");
  }

  // A blank template for the service cards, so the visitor lands in their app
  // with the prompts already written out.
  function buildTemplate(service, lang) {
    var L = FIELDS[lang] || FIELDS.sk;
    var name = (SERVICES[service] && SERVICES[service][lang]) || "";
    return [
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
  function updateInquiryLinks(lang) {
    var links = document.querySelectorAll("a[data-inquiry]");
    for (var i = 0; i < links.length; i++) {
      var key = links[i].getAttribute("data-inquiry");
      if (!SERVICES[key]) continue;
      var body = buildTemplate(key, lang);
      links[i].setAttribute("href",
        links[i].getAttribute("data-contact") === "email"
          ? mailLink(body, lang)
          : waLink(body));
    }
  }

  function initContact() {
    var destinations = {
      phone: "tel:" + CONTACT.phone,
      email: "mailto:" + CONTACT.email,
      whatsapp: "https://wa.me/" + CONTACT.whatsapp
    };
    document.querySelectorAll("a[data-contact]").forEach(function (link) {
      var href = destinations[link.getAttribute("data-contact")];
      if (href) link.setAttribute("href", href);
    });
  }
  var MUSIC_URL = new URL("../assets/backgroundMusic.mp3", document.currentScript.src).href;

  var META = {
    en: {
      title: "AC cleaning and service — Senec and surroundings | FilthyFilter by whispAir",
      desc: "AC cleaning, maintenance and servicing for homes and businesses. Senec and surroundings, up to approximately 100 km. Price based on the scope of work."
    },
    sk: {
      title: "Čistenie a servis klimatizácií — Senec a okolie | FilthyFilter by whispAir",
      desc: "Čistenie, údržba a servis klimatizácií pre domácnosti a firmy. Senec a okolie do približne 100 km. FilthyFilter by whispAir — cena podľa rozsahu."
    }
  };

  function applyLang(lang, persist) {
    if (lang !== "en" && lang !== "sk") lang = DEFAULT_LANG;

    document.documentElement.setAttribute("lang", lang);

    // swap text content
    var nodes = document.querySelectorAll("[data-en][data-sk]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var val = el.getAttribute("data-" + lang);
      if (val === null) continue;
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
      document.title = meta.title;
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute("content", meta.desc);
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
      problem: document.getElementById("inq-problem"),
      date: document.getElementById("inq-date"),
      preview: document.getElementById("inq-preview"),
      status: document.getElementById("inq-status")
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
        problem: els.problem.value.trim(),
        date: els.date.value.trim()
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

    function validate() {
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

      if (!ok && first) first.focus();
      return ok;
    }

    // Errors are only raised when the visitor tries to continue, but they are
    // cleared as soon as the field is fixed. Leaving a red line under a field
    // the visitor has already corrected is just nagging.
    function clearResolved() {
      var d = read();
      if (d.service) setError("inq-service", false);
      if (d.place) setError("inq-place", false);
      if (d.units === "" || /^[1-9][0-9]*$/.test(d.units)) setError("inq-units", false);
    }

    function refresh() {
      syncUnits();
      clearResolved();
      els.preview.value = buildMessage(read(), lang());
    }

    function say(key) {
      var msg = {
        sk: {
          wa: "Správa je pripravená vo WhatsApse. Odoslať ju musíte tam.",
          mail: "Správa je pripravená v poštovom klientovi. Odoslať ju musíte tam.",
          copied: "Text je skopírovaný. Vložte ho, kam potrebujete.",
          manual: "Kopírovanie sa nepodarilo. Text je vyššie, označte a skopírujte ho ručne."
        },
        en: {
          wa: "The message is waiting in WhatsApp. You send it from there.",
          mail: "The message is waiting in your mail client. You send it from there.",
          copied: "The text is copied. Paste it wherever you need.",
          manual: "Copying failed. The text is above; select and copy it by hand."
        }
      };
      els.status.textContent = (msg[lang()] || msg.sk)[key];
    }

    form.addEventListener("input", refresh);
    form.addEventListener("change", refresh);

    document.getElementById("inq-whatsapp").addEventListener("click", function () {
      if (!validate()) return;
      window.open(waLink(buildMessage(read(), lang())), "_blank", "noopener");
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
    refresh();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initContact();
    initMusic();
    initLang();
    initInquiry();
    initReveal();
    initMobileNav();
  });
})();
