/*!
 * b'buchen Landingpage — konsolidiertes JS (v3)
 * Ans Seitenende. Keine Abhängigkeiten.
 * Shuffle-Stack-Logik entfernt (Flow-Sektion ist jetzt statisch).
 * "So funktioniert's" = Klick-zum-Wählen (kein Auto-Timer).
 */

/* ===== 1 · STATS Count-up (IntersectionObserver) ===== */
(function () {
  var section = document.getElementById('stats-section');
  if (!section) return;
  var nums = section.querySelectorAll('.js-count');
  if (!nums.length) return;
  var DURATION = 1400;
  var started = false;
  function run() {
    if (started) return;
    started = true;
    var targets = [];
    nums.forEach(function (el) {
      targets.push({
        el: el,
        to: parseFloat(el.getAttribute('data-count-to')) || 0,
        suffix: el.getAttribute('data-suffix') || ''
      });
    });
    var start = performance.now();
    function tick(now) {
      var t = Math.min(1, (now - start) / DURATION);
      var eased = 1 - Math.pow(1 - t, 3);
      targets.forEach(function (o) {
        o.el.textContent = Math.round(o.to * eased).toLocaleString('de-DE') + o.suffix;
      });
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { run(); io.disconnect(); }
    });
  }, { threshold: 0.4 });
  io.observe(section);
})();

/* ===== 2 · MOBILE-NAV ===== */
(function () {
  var nav = document.querySelector('.bb-nav-mobile');
  if (!nav) return;
  var burger = nav.querySelector('.nav-mob-burger');
  if (burger) burger.addEventListener('click', function () { nav.classList.toggle('is-open'); });
  nav.querySelectorAll('.nav-mob-menu a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('is-open'); });
  });
})();

/* ===== 3 · STEPS (Klick-zum-Wählen) ===== */
(function () {
  var rows = document.querySelectorAll('.step-row');
  if (!rows.length) return;
  var label = document.querySelector('.js-step-label');
  function activate(row) {
    rows.forEach(function (r) { r.classList.remove('is-active'); });
    row.classList.add('is-active');
    if (label) label.textContent = row.getAttribute('data-label') || '';
  }
  rows.forEach(function (row) {
    row.addEventListener('click', function () { activate(row); });
  });
})();

/* ===== 4 · PRICING-TOGGLE (monatlich/jährlich) ===== */
(function () {
  var root = document.querySelector('.pricing');
  if (!root) return;
  var sw = root.querySelector('.bill-switch');
  var annual = !root.classList.contains('is-monthly');
  function apply() {
    root.classList.toggle('is-annual', annual);
    root.classList.toggle('is-monthly', !annual);
    root.querySelectorAll('.js-price').forEach(function (el) {
      var v = el.getAttribute(annual ? 'data-annual' : 'data-monthly');
      if (v !== null) el.textContent = v;
    });
    root.querySelectorAll('.js-billnote').forEach(function (el) {
      var v = el.getAttribute(annual ? 'data-annual' : 'data-monthly');
      if (v !== null) el.textContent = v;
    });
    if (sw) sw.setAttribute('aria-pressed', String(annual));
  }
  if (sw) sw.addEventListener('click', function () { annual = !annual; apply(); });
  apply();
})();

/* ===== 5 · BRANCHEN-SWITCHER ===== */
(function () {
  var rows = document.querySelectorAll('.branch-row');
  var panels = document.querySelectorAll('.branch-panel');
  if (!rows.length || !panels.length) return;
  function activate(idx) {
    rows.forEach(function (r, i) { r.classList.toggle('is-active', i === idx); });
    panels.forEach(function (p, i) { p.classList.toggle('is-active', i === idx); });
  }
  rows.forEach(function (row, i) {
    row.addEventListener('click', function () { activate(i); });
  });
})();

/* ===== 6 · FAQ-ACCORDION (einzeln offen) ===== */
(function () {
  var rows = document.querySelectorAll('.faq-row');
  if (!rows.length) return;
  function setSign(row, open) {
    var s = row.querySelector('.faq-sign');
    if (s) s.textContent = open ? '\u2212' : '+';
  }
  rows.forEach(function (row) {
    setSign(row, row.classList.contains('is-open'));
    row.addEventListener('click', function () {
      var willOpen = !row.classList.contains('is-open');
      rows.forEach(function (r) { r.classList.remove('is-open'); setSign(r, false); });
      if (willOpen) { row.classList.add('is-open'); setSign(row, true); }
    });
  });
})();
