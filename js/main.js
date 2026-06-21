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

  function indexInParent(el) {
    var i = 0, n = el;
    while ((n = n.previousElementSibling)) i++;
    return i;
  }

  /* Scroll-LINKED layered reveal — works on every browser (no dependency on CSS
     scroll-timelines). Each layer's opacity/transform is mapped to its position
     in the viewport, so content keeps moving AS YOU SCROLL, and different layer
     types use different entry distance (dist) + parallax (par) = depth. Grid
     children stagger their entry. Reads all rects then writes (no layout thrash);
     only runs on scroll via rAF. Respects reduced-motion. */
  function initScrollReveal() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // leave everything visible & static
    }
    // [selector, entry distance px, parallax px, isGridChild(stagger)]
    var defs = [
      [".section .section__head", 80, 26, false],
      [".section .panel:not(.card)", 54, 12, false],
      [".section .card", 72, 16, true],
      [".section .step", 72, 16, true],
      [".section .ffff", 64, 16, true],
      [".section .specimen", 70, 18, true],
      [".section .card__icon", 42, 34, false],
      [".section .step__icon", 42, 34, false],
      [".section .profile .pi", 42, 34, false]
    ];
    var layers = [];
    for (var d = 0; d < defs.length; d++) {
      var els = document.querySelectorAll(defs[d][0]);
      for (var i = 0; i < els.length; i++) {
        layers.push({
          el: els[i], dist: defs[d][1], par: defs[d][2],
          delay: defs[d][3] ? indexInParent(els[i]) * 0.06 : 0
        });
      }
    }
    if (!layers.length) return;

    // hide layers only now that JS will drive them (so no-JS keeps content visible)
    document.documentElement.classList.add("ff-js-reveal");
    var scale = (window.matchMedia && window.matchMedia("(max-width: 820px)").matches) ? 0.55 : 1;
    var ticking = false;

    function update() {
      ticking = false;
      var vh = window.innerHeight || 1;
      var n = layers.length, rects = new Array(n), i, L, r;
      for (i = 0; i < n; i++) rects[i] = layers[i].el.getBoundingClientRect();  // read pass
      for (i = 0; i < n; i++) {                                                  // write pass
        L = layers[i]; r = rects[i];
        if (r.bottom < -400 || r.top > vh + 400) continue;
        var e = (vh - r.top) / (vh * 0.82) - L.delay;
        e = e < 0 ? 0 : e > 1 ? 1 : e;
        var p = 1 - ((r.top + r.height / 2) / vh) * 2;   // +1 near top, -1 near bottom
        var ty = (1 - e) * L.dist * scale - p * L.par * scale * 0.6;
        L.el.style.opacity = e.toFixed(3);
        L.el.style.transform = "translate3d(0," + ty.toFixed(1) + "px,0)";
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
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
    initScrollReveal();
    initMobileNav();
  });
})();
