/* ============================================================
   b'steuern automation - /automation
   Repo: bsteuern/animation -> automation/automation.js
   Stand: Schritt M3 (Hero)

   Laedt nach orbit-field.js. Enthaelt nur Seitenlogik,
   keine Komponenten.
   ============================================================ */
(function () {
  'use strict';

  /* ── Orbit-Field: Konfiguration je Breakpoint ─────────────
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
    // Neuzeichnen erzwingen, sobald die Komponente montiert ist.
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

    // Erst nach dem Upgrade des Custom Elements ein zweites Mal setzen,
    // damit die Konfiguration auch bei spaetem Laden von orbit-field.js greift.
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initField);
  } else {
    initField();
  }
})();
