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

  var INQUIRY_TEMPLATE = {
    sk: function (service) {
      return [
        "Dobrý deň, mám záujem o: " + service + ".",
        "Obec / PSČ: ",
        "Počet jednotiek: ",
        "Čo ma trápi: ",
        "Preferovaný termín: "
      ].join("\n");
    },
    en: function (service) {
      return [
        "Hello, I am interested in: " + service + ".",
        "Town / postcode: ",
        "Number of units: ",
        "The problem: ",
        "Preferred date: "
      ].join("\n");
    }
  };

  // Rewrite every service CTA so the visitor's messaging app opens with the
  // right service already named. Nothing is stored or sent by the page itself.
  function updateInquiryLinks(lang) {
    var links = document.querySelectorAll("a[data-inquiry]");
    for (var i = 0; i < links.length; i++) {
      var key = links[i].getAttribute("data-inquiry");
      var service = SERVICES[key] && SERVICES[key][lang];
      if (!service) continue;
      var body = INQUIRY_TEMPLATE[lang](service);
      if (links[i].getAttribute("data-contact") === "email") {
        links[i].setAttribute("href", "mailto:" + CONTACT.email +
          "?subject=" + encodeURIComponent(service) + "&body=" + encodeURIComponent(body));
      } else {
        links[i].setAttribute("href", "https://wa.me/" + CONTACT.whatsapp +
          "?text=" + encodeURIComponent(body));
      }
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

  document.addEventListener("DOMContentLoaded", function () {
    initContact();
    initMusic();
    initLang();
    initReveal();
    initMobileNav();
  });
})();
