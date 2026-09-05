/* =========================================================================
   FilthyFilter by whispAir — language toggle (SK/EN/NL) + small UI niceties
   No dependencies. Translatable nodes carry data-sk / data-en / data-nl.
   ========================================================================= */
(function () {
  "use strict";

  var STORE_KEY = "ff_lang";
  // Version the preference when the welcome experience changes so returning
  // visitors get one chance to see the new prompt.
  var SOUND_STORE_KEY = "ff_sound_v2";
  var DEFAULT_LANG = "sk";
  // Shared destination data for contact links and the planned inquiry builder.
  // Keep static HTML fallbacks in sync so direct contact works without JS.
  var CONTACT = {
    phone: "+421902279094",
    email: "info@filthyfilter.sk",
    whatsapp: "421902279094"
  };

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
    nl: {
      title: "Aircoreiniging en service — Senec en omgeving | FilthyFilter by whispAir",
      desc: "Aircoreiniging, onderhoud en service voor woningen en bedrijven. Senec en omgeving, tot ongeveer 100 km. Prijs op basis van de werkzaamheden."
    },
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
    var revealTimer = 0;
    var modal = null;
    var targetVolume = 0.28;
    audio.loop = true;
    audio.preload = "metadata";

    var control = document.createElement("button");
    control.className = "sound-toggle";
    control.type = "button";
    control.setAttribute("aria-pressed", "false");
    control.innerHTML = '<span aria-hidden="true">○</span> <b data-nl="Geluid uit" data-en="Sound off" data-sk="Zvuk vypnutý">Sound off</b>';
    document.body.appendChild(control);

    function setControl(playing) {
      control.classList.toggle("is-playing", playing);
      control.setAttribute("aria-pressed", playing ? "true" : "false");
      var label = control.querySelector("b");
      var indicator = control.querySelector("span");
      label.setAttribute("data-nl", playing ? "Geluid aan" : "Geluid uit");
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
      if (modal) closeModal();
    });

    var preference = null;
    try { preference = localStorage.getItem(SOUND_STORE_KEY); } catch (e) {}
    if (preference !== null) {
      setControl(false);
      return;
    }

    modal = document.createElement("div");
    modal.className = "sound-welcome";
    modal.innerHTML =
      '<div class="sound-welcome__panel" role="region" aria-labelledby="sound-title">' +
        '<div class="sound-welcome__speaker" aria-hidden="true"><span>◖</span><i></i><i></i></div>' +
        '<span class="tag">AUDIO SCAN // 001</span>' +
        '<h2 id="sound-title" data-nl="We detecteerden een gevaarlijk goede smaak." data-en="We detected dangerously good taste." data-sk="Detegovali sme nebezpečne dobrý vkus.">We detected dangerously good taste.</h2>' +
        '<p data-nl="Geluidsdecontaminatie activeren?" data-en="Activate sonic decontamination?" data-sk="Aktivovať zvukovú dekontamináciu?">Activate sonic decontamination?</p>' +
        '<div class="sound-welcome__actions">' +
          '<button class="btn btn--primary" type="button" data-sound-play data-nl="Start de procedure 🔊" data-en="Start the procedure 🔊" data-sk="Spustiť procedúru 🔊">Start the procedure 🔊</button>' +
          '<button class="btn btn--ghost" type="button" data-sound-quiet data-nl="Stille modus" data-en="Silent mode" data-sk="Tichý režim">Silent mode</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    revealTimer = window.setTimeout(function () {
      modal.classList.add("is-visible");
    }, 6000);

    function closeModal() {
      if (!modal) return;
      window.clearTimeout(revealTimer);
      modal.classList.add("is-closing");
      window.setTimeout(function () {
        modal.remove();
        modal = null;
      }, 260);
    }

    modal.querySelector("[data-sound-play]").addEventListener("click", function () {
      playMusic();
      closeModal();
    });
    modal.querySelector("[data-sound-quiet]").addEventListener("click", function () {
      stopMusic();
      closeModal();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initContact();
    initMusic();
    initLang();
    initReveal();
    initMobileNav();
  });
})();
