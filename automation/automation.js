/* ============================================================
   b'steuern automation - /automation
   Repo: bsteuern/animation -> automation/automation.js
   Version 2 - Hero-Feld + Stimmen-Slider

   Laedt nach orbit-field.js. Enthaelt nur Seitenlogik,
   keine Komponenten.
   ============================================================ */
(function () {
  'use strict';

  /* ── 1 · Orbit-Field: Konfiguration je Breakpoint ─────────
     tiles, scale, ax, ay, orbits und rings stehen nicht in den
     LIVE_ATTRS der Komponente. Ein Attributwechsel allein loest
     also kein Neuzeichnen aus, deshalb render()/wire() explizit.
     ------------------------------------------------------- */

  var FIELD = {
    desktop: {
      tiles: "b'buchen,Qonto,Mollie,Outlook,Shopify,Lexware,Pennylane,BuchhaltungsButler,Gmail,SumUp,Stripe",
      orbits: '3', rings: '9', 'r-in': '185', 'r-out': '485',
      'ring-base': '220', 'ring-step': '150',
      scale: '1.24',
      ax: 'calc(50% + min(50%, 672px) - 108px)', ay: '66%'
    },
    tablet: {
      tiles: "Qonto,Stripe,Gmail,Outlook,Mollie,SumUp,Shopify,Pennylane,b'buchen",
      orbits: '2', rings: '7', 'r-in': '190', 'r-out': '355',
      'ring-base': '215', 'ring-step': '150',
      scale: '1.05',
      ax: '50%', ay: '235px'
    },
    mobile: {
      tiles: 'Qonto,Stripe,Gmail,Outlook,Mollie,SumUp,Shopify',
      orbits: '2', rings: '7', 'r-in': '190', 'r-out': '330',
      'ring-base': '215', 'ring-step': '150',
      scale: '0.95',
      ax: '50%', ay: '200px'
    }
  };

  function currentBand() {
    var w = window.innerWidth;
    if (w >= 992) return 'desktop';
    if (w >= 768) return 'tablet';
    return 'mobile';
  }

  function applyField(el, band) {
    var cfg = FIELD[band];
    if (!cfg) return;
    Object.keys(cfg).forEach(function (k) { el.setAttribute(k, cfg[k]); });
    if (typeof el.render === 'function' && el.shadowRoot) {
      el.render();
      if (typeof el.wire === 'function') el.wire();
    }
  }

  function initField() {
    var el = document.querySelector('.auto-hero__field orbit-field');
    if (!el) return;

    var band = currentBand();
    applyField(el, band);

    if (window.customElements && window.customElements.whenDefined) {
      window.customElements.whenDefined('orbit-field').then(function () {
        applyField(el, currentBand());
      });
    }

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var next = currentBand();
        if (next === band) return;
        band = next;
        applyField(el, band);
      }, 180);
    });
  }

  /* ── 2 · Stimmen-Slider ───────────────────────────────────
     Bewusst kein Auto-Marquee: Dauerbewegung widerspricht der
     Motion-Regel, und der duplizierte Track waere doppelter
     Content fuer Screenreader. Stattdessen nativer Scroll mit
     Scroll-Snap, Tastatur und zwei Schaltflaechen.
     ------------------------------------------------------- */

  function initVoices() {
    var track = document.querySelector('[data-voices="track"]');
    if (!track) return;

    var prev = document.querySelector('[data-voices="prev"]');
    var next = document.querySelector('[data-voices="next"]');
    var cards = track.querySelectorAll('.auto-voice');
    if (!cards.length) return;

    function step() {
      var a = cards[0].getBoundingClientRect();
      var gap = 24;
      if (cards.length > 1) {
        gap = Math.round(cards[1].getBoundingClientRect().left - a.right);
        if (!isFinite(gap) || gap < 0) gap = 24;
      }
      return Math.round(a.width + gap);
    }

    // Geometrisch statt ueber scrollLeft: robuster gegen
    // Scroll-Snap-Eigenheiten und gegen UA-Margins auf Kindelementen.
    function sync() {
      var box = track.getBoundingClientRect();
      var first = cards[0].getBoundingClientRect();
      var last = cards[cards.length - 1].getBoundingClientRect();
      if (prev) prev.disabled = first.left >= box.left - 2;
      if (next) next.disabled = last.right <= box.right + 2;
    }

    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step() }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step() }); });

    track.addEventListener('scroll', function () {
      window.requestAnimationFrame(sync);
    }, { passive: true });

    window.addEventListener('resize', sync);

    // Erst nach Layout und nach dem Laden der Schriften messen,
    // sonst ist scrollWidth beim ersten Aufruf noch 0.
    window.requestAnimationFrame(sync);
    window.addEventListener('load', sync);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
  }

  function init() {
    initField();
    initVoices();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
