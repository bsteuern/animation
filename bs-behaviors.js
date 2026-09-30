/*!
 * b'steuern Behaviors v1.0
 * Seite: Selbstgeführte Organisation (wiederverwendbar auf allen Seiten)
 * Hooks ausschließlich über data-Attribute, jede Instanz wird einzeln initialisiert.
 *   [data-reveal]        Einblenden beim Scrollen (optional data-delay="60|120|180")
 *   [data-mark]          Text-Marker, startet mit dem umgebenden Reveal
 *   [data-count]         Zählt bis zum Wert im Attribut (Endwert steht bereits im HTML)
 *   [data-count-scope]   Zählt alle rein numerischen Textelemente darin (z. B. Component "sektion/ Numbers")
 *   [data-carousel]      Akkordeon-Karussell (Items: [data-car-item], Bild: [data-car-img])
 *   [data-tp-stack]      Karten-Stapel (Karten: [data-tp-card])
 *   [data-follow]/[data-drift]/[data-target]  Pfeilfelder (SVG)
 */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE_NAV = 'cubic-bezier(0.19, 1, 0.22, 1)';
  var EASE_HOV = 'cubic-bezier(0.25, 1, 0.5, 1)';

  function each(root, sel, fn) { Array.prototype.forEach.call((root || document).querySelectorAll(sel), fn); }
  function onReady(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  /* ---------- Count-up ---------- */
  function countTo(el, target, pre, suf, delay) {
    if (!isFinite(target) || target <= 0 || reduce) return;
    setTimeout(function () {
      var t0 = performance.now();
      (function step(t) {
        var p = Math.min(1, (t - t0) / 900);
        el.textContent = pre + Math.round(target * (1 - Math.pow(1 - p, 3))) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, delay || 0);
  }
  function runCounts(scope) {
    each(scope, '[data-count]', function (el) {
      var host = el.closest('[data-delay]');
      countTo(el, parseFloat(el.getAttribute('data-count')), el.getAttribute('data-prefix') || '', el.getAttribute('data-suffix') || '',
        parseInt((host && host.getAttribute('data-delay')) || '0', 10));
    });
    var scopes = scope.matches && scope.matches('[data-count-scope]') ? [scope] : [];
    each(scope, '[data-count-scope]', function (s) { scopes.push(s); });
    scopes.forEach(function (s) {
      var i = 0;
      each(s, '*', function (el) {
        if (el.children.length) return;
        var m = /^(\D{0,8}?)(\d{1,4})(\D{0,3})$/.exec((el.textContent || '').trim());
        if (!m) return;
        countTo(el, parseInt(m[2], 10), m[1], m[3], (i++) * 60);
      });
    });
  }

  /* ---------- Reveal + Marker ---------- */
  function show(el) {
    if (el.classList.contains('is-visible')) return;
    el.classList.remove('is-pending');
    el.classList.add('is-visible');
    each(el, '[data-mark]', function (m, k) { setTimeout(function () { m.classList.add('is-on'); }, reduce ? 0 : 450 + k * 250); });
    runCounts(el);
  }
  function initReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) { Array.prototype.forEach.call(els, show); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -4% 0px' });
    var vh = window.innerHeight || document.documentElement.clientHeight;
    Array.prototype.forEach.call(els, function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.96 && r.bottom > 0) { show(el); return; }
      el.classList.add('is-pending');
      io.observe(el);
    });
    // Sicherheitsnetz: nichts bleibt dauerhaft unsichtbar (z. B. bei Anker-Sprüngen)
    window.addEventListener('load', function () {
      setTimeout(function () {
        each(document, '[data-reveal].is-pending', function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < (window.innerHeight || 0) && r.bottom > 0) { show(el); io.unobserve(el); }
        });
      }, 300);
    });
    // Zusätzlich: Elemente in Count-Scopes ohne eigenes Reveal
    each(document, '[data-count-scope]', function (s) {
      if (s.closest('[data-reveal]')) return;
      var o = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { runCounts(s); o.disconnect(); } }); }, { threshold: 0.3 });
      o.observe(s);
    });
  }

  /* ---------- Karussell ---------- */
  function initCarousel(root) {
    var st = root.querySelector('[data-car-stage]');
    if (!st) return;
    var items = Array.prototype.slice.call(st.querySelectorAll('[data-car-item]')), N = items.length;
    if (N < 2) return;
    var cap = root.querySelector('[data-car-caption]');
    var mobile = window.matchMedia('(max-width: 767px)');
    var cur = 0, hov = -1, lastS = items.map(function () { return null; }), capT;
    var NAV = 'left 750ms ' + EASE_NAV + ', width 750ms ' + EASE_NAV;
    var HOV = 'left 450ms ' + EASE_HOV + ', width 450ms ' + EASE_HOV;

    function layout(mode) {
      var W = st.clientWidth, gap = mobile.matches ? 6 : 8;
      var base = mobile.matches ? [80, 13, 5, 2] : [64, 16, 8, 4.5, 2.5, 1.5, 1];
      var vis = Math.min(base.length, N - 1), wts = base.slice(0, vis);
      var hd = hov < 0 ? -1 : (hov - cur + N) % N;
      if (hd > 0 && hd < vis) wts[hd] = wts[hd] * 1.45 + 1.2;
      var sum = wts.reduce(function (a, b) { return a + b; }, 0), avail = W - gap * (vis - 1);
      var w0 = avail * base[0] / base.slice(0, vis).reduce(function (a, b) { return a + b; }, 0);
      var pos = [], x = 0;
      for (var d = 0; d < vis; d++) { var w = avail * wts[d] / sum; pos.push([x, w]); x += w + gap; }
      items.forEach(function (el, i) {
        var dd = (i - cur + N) % N, s = dd === N - 1 ? -1 : dd, l, wi;
        if (dd < vis) { l = pos[dd][0]; wi = pos[dd][1]; }
        else if (s === -1) { wi = pos[0][1]; l = -wi - gap; }
        else { l = W + gap; wi = 0; }
        var jump = lastS[i] !== null && Math.abs(s - lastS[i]) > 1;
        el.style.transition = (jump || reduce) ? 'none' : (mode === 'hover' ? HOV : NAV);
        el.style.left = l + 'px'; el.style.width = wi + 'px';
        var img = el.querySelector('[data-car-img]'); if (img) img.style.width = Math.max(w0, wi) + 'px';
        el.style.cursor = dd === 0 ? 'default' : 'pointer';
        var visible = dd < vis && wi > 0;
        el.setAttribute('aria-hidden', dd === 0 ? 'false' : 'true');
        el.setAttribute('tabindex', visible && dd !== 0 ? '0' : '-1');
        if (visible && dd !== 0) { el.setAttribute('role', 'button'); el.setAttribute('aria-label', 'Bild ' + (i + 1) + ' anzeigen'); }
        else { el.removeAttribute('role'); el.removeAttribute('aria-label'); }
        if (jump) void el.offsetWidth;
        lastS[i] = s;
      });
    }
    function setCap() {
      if (!cap) return;
      var txt = items[cur].getAttribute('data-caption') || '';
      if (cap.textContent === txt) return;
      cap.classList.add('is-hidden'); clearTimeout(capT);
      capT = setTimeout(function () { cap.textContent = txt; cap.classList.remove('is-hidden'); }, 180);
    }
    function go(n) { cur = (n + N) % N; hov = -1; layout('nav'); setCap(); }
    function key(fn) { return function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }; }

    var prev = root.querySelector('[data-car-prev]'), next = root.querySelector('[data-car-next]');
    if (prev) { prev.addEventListener('click', function () { go(cur - 1); }); prev.addEventListener('keydown', key(function () { go(cur - 1); })); }
    if (next) { next.addEventListener('click', function () { go(cur + 1); }); next.addEventListener('keydown', key(function () { go(cur + 1); })); }
    items.forEach(function (el, i) {
      el.addEventListener('click', function () { if (i !== cur) go(i); });
      el.addEventListener('keydown', key(function () { if (i !== cur) go(i); }));
      el.addEventListener('mouseenter', function () { if (hov !== i) { hov = i === cur ? -1 : i; layout('hover'); } });
    });
    st.addEventListener('mouseleave', function () { if (hov !== -1) { hov = -1; layout('hover'); } });
    root.addEventListener('keydown', function (e) {
      if (!root.contains(document.activeElement)) return;
      if (e.key === 'ArrowLeft') go(cur - 1);
      if (e.key === 'ArrowRight') go(cur + 1);
    });
    var sx = null;
    st.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    st.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); });
    var rT; window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { layout('hover'); }, 100); });
    layout('nav');
  }

  /* ---------- Karten-Stapel ---------- */
  function initStack(box) {
    var cards = Array.prototype.slice.call(box.querySelectorAll('[data-tp-card]')), active = null;
    function activate(c) { cards.forEach(function (o) { o.classList.toggle('is-active', o === c); }); active = c; }
    cards.forEach(function (c) {
      c.addEventListener('mouseenter', function () { activate(c); });
      c.addEventListener('focus', function () { activate(c); });
      c.addEventListener('click', function () { activate(active === c ? null : c); });
    });
    box.addEventListener('mouseleave', function () { activate(null); });
    box.addEventListener('focusout', function (e) { if (!box.contains(e.relatedTarget)) activate(null); });
  }

  /* ---------- Pfeilfelder ---------- */
  function parseUse(u) {
    var m = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)\s*rotate\(([-\d.]+)\)/.exec(u.getAttribute('transform') || '');
    return m ? { el: u, x: +m[1], y: +m[2], a: +m[3], cur: +m[3] } : null;
  }
  function initDrift(g) {
    if (reduce) return;
    var svg = g.ownerSVGElement;
    var parts = Array.prototype.slice.call(g.querySelectorAll('use')).map(parseUse).filter(Boolean);
    parts.forEach(function (p) { p.seed = Math.random() * 6.28; p.speed = 0.4 + Math.random() * 0.6; });
    loopWhileVisible(svg, function (tm) {
      parts.forEach(function (p) {
        p.el.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') rotate(' + (p.a + Math.sin(tm * 0.0009 * p.speed + p.seed) * 55).toFixed(1) + ')');
      });
    });
  }
  function initFollow(g) {
    var svg = g.ownerSVGElement, tgt = svg.querySelector('[data-target]');
    if (!tgt) return;
    var panel = svg.parentElement, vb = svg.viewBox.baseVal;
    var follow = Array.prototype.slice.call(g.querySelectorAll('use')).map(parseUse).filter(Boolean);
    var hm = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(tgt.getAttribute('transform') || '');
    if (!hm) return;
    var home = { x: +hm[1], y: +hm[2] }, goal = { x: home.x, y: home.y }, pos = { x: home.x, y: home.y };
    var aligned = false, hover = false;
    function toSvg(cx, cy) { var pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy; var mm = svg.getScreenCTM(); return mm ? pt.matrixTransform(mm.inverse()) : home; }
    function point(cx, cy) { var p = toSvg(cx, cy); goal.x = Math.max(76, Math.min(vb.width - 76, p.x)); goal.y = Math.max(15, Math.min(vb.height - 15, p.y)); hover = true; aligned = true; }
    panel.addEventListener('mousemove', function (ev) { point(ev.clientX, ev.clientY); });
    panel.addEventListener('mouseleave', function () { goal.x = home.x; goal.y = home.y; hover = false; });
    panel.addEventListener('touchmove', function (ev) { if (ev.touches[0]) point(ev.touches[0].clientX, ev.touches[0].clientY); }, { passive: true });
    panel.addEventListener('touchend', function () { goal.x = home.x; goal.y = home.y; hover = false; });
    function frame() {
      pos.x += (goal.x - pos.x) * 0.14; pos.y += (goal.y - pos.y) * 0.14;
      tgt.setAttribute('transform', 'translate(' + pos.x.toFixed(1) + ' ' + pos.y.toFixed(1) + ')');
      follow.forEach(function (p) {
        var want = aligned ? Math.atan2(pos.y - p.y, pos.x - p.x) * 180 / Math.PI : p.cur;
        if (Math.hypot(pos.x - p.x, pos.y - p.y) < 24) want = p.cur;
        var d = ((want - p.cur + 540) % 360) - 180;
        p.cur += d * (reduce ? 1 : (hover ? 0.18 : 0.08));
        p.el.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') rotate(' + p.cur.toFixed(1) + ')');
      });
    }
    // Beim ersten Sichtbarwerden richten sich die Pfeile auf das Ziel aus
    loopWhileVisible(svg, frame, function () { aligned = true; });
  }
  // Animationsschleife läuft nur, solange das Element sichtbar ist
  function loopWhileVisible(el, fn, onFirstVisible) {
    var running = false, raf = 0, first = true;
    function tick(t) { fn(t); if (running) raf = requestAnimationFrame(tick); }
    if (!('IntersectionObserver' in window)) { running = true; raf = requestAnimationFrame(tick); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !running) {
          if (first && onFirstVisible) { onFirstVisible(); first = false; }
          running = true; raf = requestAnimationFrame(tick);
        } else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
      });
    }, { threshold: 0.1 }).observe(el);
  }

  onReady(function () {
    initReveal();
    each(document, '[data-carousel]', initCarousel);
    each(document, '[data-tp-stack]', initStack);
    each(document, '[data-drift]', initDrift);
    each(document, '[data-follow]', initFollow);
  });
})();
