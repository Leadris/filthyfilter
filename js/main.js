/* =========================================================================
   FilthyFilter.nl — language toggle (NL/EN) + small UI niceties
   No dependencies. Translatable nodes carry data-nl / data-en.
   ========================================================================= */
(function () {
  "use strict";

  var STORE_KEY = "ff_lang";
  var DEFAULT_LANG = "nl";

  var META = {
    nl: {
      title: "FilthyFilter.nl — Airco Decontaminatie Divisie",
      desc: "Professionele reiniging van airconditioning. Wij sporen de schimmel op en ruimen ’m op. Vraag een FFFF-meting aan."
    },
    en: {
      title: "FilthyFilter.nl — Airco Decontamination Division",
      desc: "Professional air-conditioning cleaning. We detect the fungus and evict it. Request your FFFF assessment."
    },
    sk: {
      title: "FilthyFilter.nl — Divízia dekontaminácie klímy",
      desc: "Profesionálne čistenie klimatizácií. Pleseň nájdeme a vysťahujeme. Vyžiadajte si svoje FFFF meranie."
    }
  };

  function applyLang(lang) {
    if (lang !== "nl" && lang !== "en" && lang !== "sk") lang = DEFAULT_LANG;

    document.documentElement.setAttribute("lang", lang);

    // swap text content
    var nodes = document.querySelectorAll("[data-nl][data-en]");
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

    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
  }

  function initLang() {
    var stored = DEFAULT_LANG;
    try { stored = localStorage.getItem(STORE_KEY) || DEFAULT_LANG; } catch (e) {}
    applyLang(stored);

    var btns = document.querySelectorAll(".langswitch button");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () {
        applyLang(this.getAttribute("data-lang"));
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

  document.addEventListener("DOMContentLoaded", function () {
    initLang();
    initReveal();
    initMobileNav();
  });
})();
