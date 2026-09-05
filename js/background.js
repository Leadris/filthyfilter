/* =========================================================================
   FilthyFilter by whispAir — WebGL background (spores + mycelium) + parallax
   Raw WebGL1, no dependencies. One fullscreen canvas (#spore-field) renders
   BOTH layers. Animates on mobile too (GPU-budgeted). Respects reduced-motion.
   Falls back to a static 2D frame if WebGL is unavailable / context is lost.

   - Spores   : GPU point sprites (additive glow), drift + parallax in shader.
   - Mycelium : branch geometry generated ONCE on CPU, revealed by uProgress,
                pinned to the live .hero rect (so it scrolls with the hero).
   - Parallax : pointer (fine-pointer hero) + scroll (in-shader, GPU = mobile-safe).
   ========================================================================= */
(function () {
  "use strict";

  var CFG = {
    sporeCount:      700,    // desktop; scaled down on mobile
    sporeCountMob:   320,
    sporeSizeMin:    4.8,    // sprite diameter in CSS px — V0 parity (old r 0.6..2.6 drawn at r*4 radius)
    sporeSizeMax:    20.8,
    sporeSpeed:      0.018,  // upward drift (normalized/s)
    sporeParallax:   0.05,   // pointer influence
    scrollParallax:  0.35,   // scroll influence on spores
    mycBudget:       1400,   // desktop segment budget; scaled on mobile
    mycBudgetMob:    700,
    mycGrowSec:      7.0,     // grow duration
    mycHoldSec:      4.0,
    mycFadeSec:      2.4,
    fpsCap:          60
  };

  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var reduceMotion = mq("(prefers-reduced-motion: reduce)");
  var coarse       = mq("(pointer: coarse)");
  var smallScreen  = mq("(max-width: 820px)");
  var lowMem       = (navigator.deviceMemory || 8) <= 4;
  var MOBILE        = coarse || smallScreen || lowMem;

  var canvas = document.getElementById("spore-field");
  if (!canvas) return;

  /* tones (rgb 0..1): gold, copper, cream */
  var TONES = [[0.91, 0.69, 0.34], [0.78, 0.52, 0.18], [0.91, 0.86, 0.78]];
  var COPPER = [0.78, 0.52, 0.18];

  /* ---------- math helpers ---------- */
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* =====================================================================
     MYCELIUM GEOMETRY — generated once on CPU (local 0..1 hero space)
     ===================================================================== */
  function genMycelium(budget) {
    var pos = [], order = [], alpha = [];
    var N = 5, tips = [];
    for (var i = 0; i < N; i++) {
      tips.push({ x: 0.12 + 0.76 * (i / (N - 1)), y: rand(0.78, 0.96),
                  ang: -Math.PI / 2 + rand(-0.55, 0.55), life: 0 });
    }
    var seg = 0, branches = 0, maxBranches = 60;
    while (seg < budget && tips.length) {
      var next = [];
      for (var t = 0; t < tips.length; t++) {
        var tip = tips[t], px = tip.x, py = tip.y;
        tip.ang += rand(-0.11, 0.11);
        tip.x += Math.cos(tip.ang) * 0.006;
        tip.y += Math.sin(tip.ang) * 0.006;
        tip.life++;
        var a = Math.min(0.5, 0.12 + tip.life * 0.004);
        var o = seg / budget;
        pos.push(px, py, tip.x, tip.y);
        order.push(o, o);
        alpha.push(a, a);
        seg++;
        var alive = tip.x > -0.05 && tip.x < 1.05 && tip.y > -0.05 && tip.y < 1.05 && tip.life < 200;
        if (alive) {
          next.push(tip);
          if (branches < maxBranches && Math.random() < 0.02) {
            branches++;
            next.push({ x: tip.x, y: tip.y,
                        ang: tip.ang + (Math.random() < 0.5 ? 1 : -1) * rand(0.4, 1.0), life: 0 });
          }
        }
        if (seg >= budget) break;
      }
      tips = next;
    }
    return { pos: new Float32Array(pos), order: new Float32Array(order),
             alpha: new Float32Array(alpha), count: pos.length / 2 };
  }

  /* =====================================================================
     WEBGL
     ===================================================================== */
  var gl = null, W = 0, H = 0, dpr = 1;
  var progSpore, progMyc, sporeBuf = {}, mycBuf = {}, myc = null, sporeN = 0;
  var startT = 0;
  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  var scrollN = 0;
  var raf = null, running = false, lastFrame = 0;

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("shader:", gl.getShaderInfoLog(s)); return null;
    }
    return s;
  }
  function program(vsrc, fsrc) {
    var p = gl.createProgram();
    var vs = compile(gl.VERTEX_SHADER, vsrc), fs = compile(gl.FRAGMENT_SHADER, fsrc);
    if (!vs || !fs) return null;
    gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn("link:", gl.getProgramInfoLog(p)); return null;
    }
    return p;
  }

  var SPORE_VS = [
    "precision mediump float;",
    "attribute vec2 a_seed; attribute vec4 a_rnd; attribute float a_depth; attribute vec3 a_tone;",
    "uniform float u_time; uniform vec2 u_pointer; uniform float u_scroll; uniform float u_dpr;",
    "uniform float u_pAmp; uniform float u_sAmp;",
    "varying vec3 v_color; varying float v_alpha;",
    "void main(){",
    "  float y = fract(a_seed.y - u_time * a_rnd.y);",
    "  float x = a_seed.x + sin(u_time*0.6 + a_rnd.w) * a_rnd.z;",
    "  x += u_pointer.x * a_depth * u_pAmp;",
    "  y += u_pointer.y * a_depth * u_pAmp;",
    "  y += u_scroll * a_depth * u_sAmp;",
    "  x = fract(x); y = fract(y);",
    "  gl_Position = vec4(x*2.0-1.0, 1.0-y*2.0, 0.0, 1.0);",
    "  gl_PointSize = a_rnd.x * u_dpr;",
    "  v_color = a_tone; v_alpha = a_depth*0.35 + 0.12;",
    "}"
  ].join("\n");

  var SPORE_FS = [
    "precision mediump float;",
    "varying vec3 v_color; varying float v_alpha;",
    "void main(){",
    "  vec2 d = gl_PointCoord - 0.5;",
    "  float a = smoothstep(0.5, 0.0, length(d));",
    "  gl_FragColor = vec4(v_color, a * v_alpha);",
    "}"
  ].join("\n");

  var MYC_VS = [
    "precision mediump float;",
    "attribute vec2 a_local; attribute float a_order; attribute float a_alpha;",
    "uniform vec4 u_hero; uniform vec2 u_res; uniform vec2 u_pointer;",
    "uniform float u_progress; uniform float u_fade;",
    "varying float v_a;",
    "void main(){",
    "  float vis = step(a_order, u_progress);",
    "  vec2 px = u_hero.xy + a_local * u_hero.zw;",
    "  px += u_pointer * 16.0;",
    "  vec2 clip = vec2(px.x/u_res.x*2.0-1.0, 1.0-px.y/u_res.y*2.0);",
    "  gl_Position = vec4(clip, 0.0, 1.0);",
    "  v_a = a_alpha * vis * u_fade;",
    "}"
  ].join("\n");

  var MYC_FS = [
    "precision mediump float;",
    "uniform vec3 u_color; varying float v_a;",
    "void main(){",
    "  if (v_a <= 0.001) discard;",
    "  gl_FragColor = vec4(u_color, v_a);",
    "}"
  ].join("\n");

  function buildSpores() {
    sporeN = MOBILE ? CFG.sporeCountMob : CFG.sporeCount;
    var seed = new Float32Array(sporeN * 2);
    var rnd  = new Float32Array(sporeN * 4);
    var dep  = new Float32Array(sporeN);
    var tone = new Float32Array(sporeN * 3);
    for (var i = 0; i < sporeN; i++) {
      seed[i*2] = Math.random(); seed[i*2+1] = Math.random();
      rnd[i*4]   = rand(CFG.sporeSizeMin, CFG.sporeSizeMax); // diameter in CSS px; shader multiplies by u_dpr once
      rnd[i*4+1] = rand(0.4, 1.0) * CFG.sporeSpeed; // rise speed
      rnd[i*4+2] = rand(0.002, 0.012);            // sway amp
      rnd[i*4+3] = Math.random() * 6.28;          // phase
      dep[i] = Math.random();
      var c = TONES[(Math.random() * TONES.length) | 0];
      tone[i*3] = c[0]; tone[i*3+1] = c[1]; tone[i*3+2] = c[2];
    }
    sporeBuf.seed = makeBuf(seed); sporeBuf.rnd = makeBuf(rnd);
    sporeBuf.dep = makeBuf(dep);   sporeBuf.tone = makeBuf(tone);
  }
  function makeBuf(data) {
    var b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return b;
  }
  function attrib(prog, name, buf, size) {
    var loc = gl.getAttribLocation(prog, name);
    if (loc < 0) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  }

  function buildMycelium() {
    myc = genMycelium(MOBILE ? CFG.mycBudgetMob : CFG.mycBudget);
    mycBuf.local = makeBuf(myc.pos);
    mycBuf.order = makeBuf(myc.order);
    mycBuf.alpha = makeBuf(myc.alpha);
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, MOBILE ? 1.5 : 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function heroRect() {
    var hero = document.querySelector(".hero");
    if (!hero) return [0, 0, W, H * 0.6];
    var r = hero.getBoundingClientRect();
    return [r.left * dpr, r.top * dpr, r.width * dpr, r.height * dpr];
  }

  /* mycelium loop state */
  var mycT = 0;
  function mycState(dt) {
    mycT += dt;
    var total = CFG.mycGrowSec + CFG.mycHoldSec + CFG.mycFadeSec;
    var t = mycT % total;
    var progress, fade;
    if (t < CFG.mycGrowSec) { progress = t / CFG.mycGrowSec; fade = 1; }
    else if (t < CFG.mycGrowSec + CFG.mycHoldSec) { progress = 1; fade = 1; }
    else { progress = 1; fade = 1 - (t - CFG.mycGrowSec - CFG.mycHoldSec) / CFG.mycFadeSec; }
    return { progress: progress, fade: Math.max(0, fade) };
  }

  function drawFrame(timeSec, mstate) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);  // additive glow

    /* ---- mycelium ---- */
    if (progMyc && myc) {
      gl.useProgram(progMyc);
      gl.uniform4fv(gl.getUniformLocation(progMyc, "u_hero"), heroRect());
      gl.uniform2f(gl.getUniformLocation(progMyc, "u_res"), canvas.width, canvas.height);
      gl.uniform2f(gl.getUniformLocation(progMyc, "u_pointer"), pointer.x, pointer.y);
      gl.uniform1f(gl.getUniformLocation(progMyc, "u_progress"), mstate.progress);
      gl.uniform1f(gl.getUniformLocation(progMyc, "u_fade"), mstate.fade * 0.7);
      gl.uniform3fv(gl.getUniformLocation(progMyc, "u_color"), COPPER);
      attrib(progMyc, "a_local", mycBuf.local, 2);
      attrib(progMyc, "a_order", mycBuf.order, 1);
      attrib(progMyc, "a_alpha", mycBuf.alpha, 1);
      gl.drawArrays(gl.LINES, 0, myc.count);
    }

    /* ---- spores ---- */
    if (progSpore && sporeN) {
      gl.useProgram(progSpore);
      gl.uniform1f(gl.getUniformLocation(progSpore, "u_time"), timeSec);
      gl.uniform2f(gl.getUniformLocation(progSpore, "u_pointer"), pointer.x, pointer.y);
      gl.uniform1f(gl.getUniformLocation(progSpore, "u_scroll"), scrollN);
      gl.uniform1f(gl.getUniformLocation(progSpore, "u_dpr"), dpr);
      gl.uniform1f(gl.getUniformLocation(progSpore, "u_pAmp"), CFG.sporeParallax);
      gl.uniform1f(gl.getUniformLocation(progSpore, "u_sAmp"), CFG.scrollParallax);
      attrib(progSpore, "a_seed", sporeBuf.seed, 2);
      attrib(progSpore, "a_rnd", sporeBuf.rnd, 4);
      attrib(progSpore, "a_depth", sporeBuf.dep, 1);
      attrib(progSpore, "a_tone", sporeBuf.tone, 3);
      gl.drawArrays(gl.POINTS, 0, sporeN);
    }
  }

  /* ---------- DOM hero parallax (pointer) ---------- */
  var heroTitle = null, heroRings = null;
  function applyDomParallax() {
    if (coarse) return;
    if (!heroTitle) heroTitle = document.querySelector(".hero__title");
    if (!heroRings) heroRings = document.querySelector(".hero__rings");
    if (heroTitle) heroTitle.style.transform = "translate3d(" + (pointer.x * 8).toFixed(2) + "px," + (pointer.y * 6).toFixed(2) + "px,0)";
    if (heroRings) heroRings.style.transform = "translate3d(" + (pointer.x * 22).toFixed(2) + "px," + (pointer.y * 18).toFixed(2) + "px,0)";
  }

  var frameMin = 1000 / CFG.fpsCap;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (now - lastFrame < frameMin) return;
    // self-heal if the viewport was 0 at init (e.g. hidden ancestor) and is now real
    if (canvas.width === 0 && window.innerWidth > 0) size();
    var dt = lastFrame ? (now - lastFrame) / 1000 : 0.016;
    lastFrame = now;
    // lerp pointer
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    var timeSec = (now - startT) / 1000;
    drawFrame(timeSec, mycState(dt));
    applyDomParallax();
  }

  function start() { if (running) return; running = true; lastFrame = 0; raf = requestAnimationFrame(frame); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

  /* ---------- 2D fallback (no WebGL) ---------- */
  function fallback2D() {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    size();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    var n = MOBILE ? 40 : 70;
    for (var i = 0; i < n; i++) {
      var x = Math.random() * W, y = Math.random() * H, r = rand(0.6, 2.4);
      var c = TONES[(Math.random() * TONES.length) | 0];
      var col = "rgba(" + ((c[0]*255)|0) + "," + ((c[1]*255)|0) + "," + ((c[2]*255)|0) + ",";
      var g = ctx.createRadialGradient(x, y, 0, x, y, r * 8);
      g.addColorStop(0, col + (rand(0.1, 0.4)).toFixed(2) + ")");
      g.addColorStop(1, col + "0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r * 8, 0, 6.2832); ctx.fill();
    }
  }

  /* ---------- wiring ---------- */
  function initGL() {
    var opts = { alpha: true, premultipliedAlpha: true, antialias: true, depth: false, powerPreference: "low-power" };
    gl = canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts);
    if (!gl) return false;
    progSpore = program(SPORE_VS, SPORE_FS);
    progMyc = program(MYC_VS, MYC_FS);
    if (!progSpore || !progMyc) return false;
    size();
    buildSpores();
    buildMycelium();
    startT = performance.now();
    return true;
  }

  function onResize() {
    if (gl) { size(); } else { fallback2D(); }
  }
  var resizeT = null;
  function onResizeDebounced() {
    clearTimeout(resizeT);
    resizeT = setTimeout(onResize, 200);
  }

  function init() {
    if (!initGL()) { fallback2D(); return; }

    window.addEventListener("resize", onResizeDebounced, { passive: true });
    window.addEventListener("scroll", function () {
      scrollN = window.scrollY / Math.max(1, window.innerHeight);
    }, { passive: true });

    if (!coarse) {
      window.addEventListener("pointermove", function (e) {
        pointer.tx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
        pointer.ty = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      }, { passive: true });
    }

    canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); stop(); }, false);
    canvas.addEventListener("webglcontextrestored", function () { if (initGL()) start(); }, false);

    if (reduceMotion) {
      drawFrame(0, { progress: 1, fade: 0.7 });   // single static frame
      return;
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
