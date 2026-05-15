/* ════════════════════════════════════════════════════════════
   b'STEUERN PREISRECHNER · ENGINE · v30
   Page Settings → Before </body> → in <script>…</script>
   
   SELBST-CHECK:
   - Alle IDs stimmen mit dem Tutorial überein
   - Keine Button-Elemente — Div Blocks in Webflow
   - Raten-Pills: role="radio", data-raten Attribut
   - Reset: role="button", id="resetCalcBtn"
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── CMS BRIDGE ─── */
  function parsePackagesFromCMS() {
    const nodes = document.querySelectorAll('[data-cms-package]');
    const grouped = {};
    nodes.forEach(node => {
      const form = node.dataset.form;
      if (!form) return;
      const pkg = {
        id:        node.dataset.packageId,
        name:      node.dataset.packageName,
        badge:     node.dataset.packageBadge || '',
        badgeTier: node.dataset.packageBadgeTier || '',
        tagline:   node.dataset.packageTagline || '',
        price:     parseFloat(node.dataset.packagePrice) || 0,
        comingSoon: node.dataset.packageComingSoon === 'true',
        features:  (node.dataset.packageFeatures || '').split('|').map(s => s.trim()).filter(Boolean)
      };
      if (!grouped[form]) grouped[form] = { label: node.dataset.formLabel || form, packages: [] };
      grouped[form].packages.push(pkg);
    });
    Object.values(grouped).forEach(g => g.packages.sort((a, b) => a.price - b.price));
    return grouped;
  }

  /* ─── KONSTANTEN ─── */
  const HOLDINGS_PRICE  = 65;
  const ONBOARDING      = 299;
  const RATEN_DEFAULT   = 6;

  const TX_STEP      = 50;
  const TX_STEP_FINE = 5;
  const TX_MIN       = 0;
  const TX_MAX       = 600;

  const TX_TIERS = [
    { upTo: 100, cost: 0 }, { upTo: 200, cost: 50 },  { upTo: 300, cost: 100 },
    { upTo: 400, cost: 150 }, { upTo: 500, cost: 200 }, { upTo: Infinity, cost: 250 }
  ];

  /* v30: Revenue-Labels mit Prozent */
  const REVENUE_TIERS = [
    { value: 0,       label: 'bis 250k (0%)',   percent: 0  },
    { value: 250000,  label: '250–500k (5%)',   percent: 5  },
    { value: 500000,  label: '500k–1Mio (10%)', percent: 10 },
    { value: 1000000, label: '1–2Mio (15%)',    percent: 15 },
    { value: 2000000, label: '2–3Mio (20%)',    percent: 20 },
    { value: 3000000, label: '3–4Mio (25%)',    percent: 25 },
    { value: 4000000, label: '4–5Mio (30%)',    percent: 30 },
    { value: 5000000, label: '>5Mio (35%)',     percent: 35 }
  ];

  const STARTUP_TARIFS = {
    'EÜR': [
      { txYearlyMax: 29, yearly: 999 },    { txYearlyMax: 60, yearly: 1069 },
      { txYearlyMax: 120, yearly: 1299 },  { txYearlyMax: 240, yearly: 1499 },
      { txYearlyMax: 360, yearly: 1599 },  { txYearlyMax: 480, yearly: 1788 },
      { txYearlyMax: Infinity, yearly: 1788 }
    ],
    'BILANZ': [
      { txYearlyMax: 29, yearly: 1099 },   { txYearlyMax: 60, yearly: 1299 },
      { txYearlyMax: 120, yearly: 1499 },  { txYearlyMax: 240, yearly: 1799 },
      { txYearlyMax: 360, yearly: 1999 },  { txYearlyMax: 480, yearly: 2149 },
      { txYearlyMax: Infinity, yearly: 2388 }
    ],
    'JP_PG': [
      { txYearlyMax: 29, yearly: 1299 },   { txYearlyMax: 60, yearly: 1549 },
      { txYearlyMax: 120, yearly: 1799 },  { txYearlyMax: 240, yearly: 1999 },
      { txYearlyMax: 360, yearly: 2249 },  { txYearlyMax: 480, yearly: 2499 },
      { txYearlyMax: Infinity, yearly: 2988 }
    ]
  };

  const FORM_LABELS = {
    einzelunternehmer:    'Einzelunternehmer',
    personengesellschaft: 'Personengesellschaft',
    juristische:          'Juristische Person',
    holdings:             'Holdings'
  };

  /* ─── STATE ─── */
  const PACKAGES_BY_FORM = parsePackagesFromCMS();
  const state = {
    form:         'einzelunternehmer',
    package:      'selbststarter',
    startMonth:   new Date().getMonth() + 1,
    startYear:    new Date().getFullYear(),
    revenue:      0,
    transactions: 100,
    isStartup:    false,
    ratenCount:   RATEN_DEFAULT,   /* v30: User-wählbare Raten-Anzahl */
    displayed: {
      monthly: 0, paket: 0, transactions: 0, buchhaltung: 0, barMonthly: 0
    }
  };

  /* ─── HELPERS ─── */
  const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const priceCeil  = v => Math.ceil(v - 1e-9);
  const formatEuro = v => priceCeil(v).toLocaleString('de-DE') + ' €';
  const fmtV       = v => priceCeil(v).toLocaleString('de-DE');     /* ohne €, für animierte Werte */

  const activeAnims = new Map();
  function animateValue(el, from, to, dur = 500, fmt = v => v) {
    if (!el) return;
    if (PREFERS_REDUCED || Math.abs(from - to) < 0.005) { el.textContent = fmt(to); return; }
    const prior = activeAnims.get(el);
    if (prior) cancelAnimationFrame(prior);
    const start = performance.now(), delta = to - from;
    function tick(now) {
      const t = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - t, 4);
      el.textContent = fmt(from + delta * e);
      if (t < 1) activeAnims.set(el, requestAnimationFrame(tick));
      else activeAnims.delete(el);
    }
    activeAnims.set(el, requestAnimationFrame(tick));
  }

  function toggleEl(el, show) {
    if (!el) return;
    if (show) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
  }

  const $ = id => document.getElementById(id);

  /* ─── PRICING ─── */
  function getRevenueTier(v) {
    return REVENUE_TIERS.find(t => t.value === v) || REVENUE_TIERS[0];
  }

  function getCurrentPkg() {
    if (state.form === 'holdings') return null;
    const group = PACKAGES_BY_FORM[state.form];
    return group ? (group.packages.find(p => p.id === state.package) || group.packages[0]) : null;
  }

  function txSurcharge(tx) {
    return (TX_TIERS.find(t => tx <= t.upTo) || TX_TIERS.at(-1)).cost;
  }

  function getStartupCat() {
    if (state.form === 'holdings') return null;
    if (state.form === 'einzelunternehmer') return state.package === 'selbststarter' ? 'EÜR' : 'BILANZ';
    return 'JP_PG';
  }

  function getTxStep(current, dir) {
    if (!state.isStartup) return TX_STEP * dir;
    if (dir > 0) return current < 50 ? TX_STEP_FINE : TX_STEP;
    return current <= 50 ? -TX_STEP_FINE : -TX_STEP;
  }

  function calculate() {
    if (state.form === 'holdings') return null;
    const pkg = getCurrentPkg(); if (!pkg) return null;
    const basePrice  = pkg.price;
    const txCost     = txSurcharge(state.transactions);
    const revTier    = getRevenueTier(state.revenue);
    const surcharge  = basePrice * (revTier.percent / 100);
    const totalMonthly = basePrice + surcharge + txCost;

    const currentYear   = new Date().getFullYear();
    const vormonate     = state.startYear === currentYear ? Math.max(0, state.startMonth - 1) : 0;
    const markupFactor  = 1 + revTier.percent / 100;
    const vormonateTotal = vormonate * basePrice * markupFactor;
    /* v30: User-wählbare Raten-Anzahl */
    const vormonateRate  = vormonate > 0 ? vormonateTotal / state.ratenCount : 0;

    return { basePrice, txCost, surcharge, revTier, totalMonthly, vormonate, vormonateTotal, vormonateRate };
  }

  /* ─── SALES HINTS ─── */
  function updateHints() {
    const txHighEl     = $('sumHintTxHigh');
    const txHighActive = state.transactions > 500;
    toggleEl(txHighEl, txHighActive);

    const revHighEl    = $('sumHintRevenueHigh');
    const tier         = getRevenueTier(state.revenue);
    const revHighActive = tier.percent >= 25;
    if (revHighEl) {
      toggleEl(revHighEl, revHighActive);
      if (revHighActive) revHighEl.textContent = `Bei dieser Umsatzgröße (${tier.label}) ist die Buchhaltung deutlich komplexer. Wir empfehlen eine individuelle Auslegung — besprechen wir gerne im Erstgespräch.`;
    }

    const complexEl    = $('sumHintComplex');
    const complexActive = state.form === 'juristische' && state.package !== 'selbststarter';
    toggleEl(complexEl, complexActive);

    const hintsSection = $('sumHintsSection');
    toggleEl(hintsSection, txHighActive || revHighActive || complexActive);
  }

  /* ─── RENDER: PACKAGE CARDS ─── */
  function renderPackageCards() {
    const wrap  = $('packageCards');
    const step2 = $('step-2');
    if (!wrap || !step2) return;
    if (state.form === 'holdings') { step2.hidden = true; wrap.innerHTML = ''; return; }
    step2.hidden = false;
    const group = PACKAGES_BY_FORM[state.form];
    if (!group) { wrap.innerHTML = '<p style="color:rgba(14,12,28,0.55)">CMS-Daten fehlen.</p>'; return; }

    wrap.innerHTML = group.packages.map(pkg => {
      const isSelected = pkg.id === state.package && !pkg.comingSoon;
      let hint = '';
      if (state.isStartup && !pkg.comingSoon) {
        const cat = state.form === 'einzelunternehmer' && pkg.id === 'selbststarter' ? 'EÜR'
                  : state.form === 'einzelunternehmer' ? 'BILANZ' : 'JP_PG';
        const txPerYear = state.transactions * 12;
        const tier = STARTUP_TARIFS[cat].find(t => txPerYear <= t.txYearlyMax) || STARTUP_TARIFS[cat].at(-1);
        const saving = Math.round(Math.max(0, pkg.price * 12 - tier.yearly) / (pkg.price * 12) * 100);
        if (saving > 0) hint = `<span class="package-card-startup-hint">−${saving} % im 1. Jahr</span>`;
      }
      return `<div class="package-card${pkg.comingSoon ? ' is-coming-soon' : ''}"
          role="radio" aria-pressed="${isSelected}" tabindex="0"
          data-package="${pkg.id}" ${pkg.comingSoon ? 'aria-disabled="true"' : ''}>
        <div class="package-card-header">
          <span class="package-card-badge" data-tier="${pkg.badgeTier}">${pkg.badge}</span>
          <span class="package-card-name">${pkg.name}</span>
          <span class="package-card-tagline">${pkg.tagline}</span>
          ${hint}
        </div>
        <div class="package-card-price">
          <span class="package-card-price-value">${fmtV(pkg.price)}</span>
          <span class="package-card-price-currency">€</span>
          <span class="package-card-price-unit">/ Monat</span>
        </div>
        <div class="package-card-divider"></div>
        <ul class="package-card-features">
          ${pkg.features.map(f => `<li class="package-card-feature">${f}</li>`).join('')}
        </ul>
      </div>`;
    }).join('');

    wrap.querySelectorAll('.package-card').forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('is-coming-soon')) return;
        state.package = card.dataset.package;
        renderPackageCards();
        updateSummary();
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    syncCarouselDots();
  }

  function syncCarouselDots() {
    const dots = document.querySelectorAll('.carousel-dot');
    if (!dots.length) return;
    const group = PACKAGES_BY_FORM[state.form];
    if (!group) return;
    const idx = Math.max(0, group.packages.findIndex(p => p.id === state.package));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
  }

  /* ─── RENDER: SUMMARY v30 ─── */
  function updateSummary() {
    if (state.form === 'holdings') { renderHoldings(); return; }

    /* Sections wieder sichtbar machen falls zuvor Holdings aktiv war */
    document.querySelectorAll('.summary-section-monatlich, .summary-section-einmalig').forEach(
      s => s.removeAttribute('hidden')
    );

    const calc = calculate();
    if (!calc) return;
    const { basePrice, txCost, surcharge, revTier, totalMonthly, vormonate, vormonateTotal, vormonateRate } = calc;

    /* Hauptpreis = totalMonthly (inkl. Paket + TX-Aufschlag + Umsatz-Aufschlag) */
    animateValue($('sumMonthly'), state.displayed.monthly, totalMonthly, 500, fmtV);
    state.displayed.monthly = totalMonthly;

    /* Asterisk und Note (nur Holdings) */
    toggleEl($('sumPriceAsterisk'), false);
    toggleEl($('sumPriceNote'), false);

    /* Pkg-Line */
    const pkg   = getCurrentPkg();
    const group = PACKAGES_BY_FORM[state.form];
    const pkgLine = pkg && group ? `${pkg.name} · ${group.label}` : '';
    const pkgLineEl = $('sumPkgLine'); if (pkgLineEl) pkgLineEl.textContent = pkgLine;

    /* ── SEKTION MONATLICH ── */
    /* Paket-Basis (immer sichtbar) */
    const paketNameEl = $('sumPaketName'); if (paketNameEl && pkg) paketNameEl.textContent = pkg.name;
    animateValue($('sumPaket'), state.displayed.paket, basePrice, 380, formatEuro);
    state.displayed.paket = basePrice;

    /* Transaktionen (nur wenn > 0) */
    toggleEl($('sumLineTransactions'), txCost > 0);
    animateValue($('sumTransactions'), state.displayed.transactions, txCost, 380, formatEuro);
    state.displayed.transactions = txCost;

    /* Umsatz-Aufschlag (nur wenn > 0) */
    toggleEl($('sumLineBuchhaltung'), surcharge > 0);
    animateValue($('sumBuchhaltung'), state.displayed.buchhaltung, surcharge, 380, formatEuro);
    state.displayed.buchhaltung = surcharge;
    const spEl = $('sumSurchargePct'); if (spEl) spEl.textContent = `(${revTier.percent}%)`;

    /* Gründer-Tarif-Hinweis (nur wenn Toggle aktiv) */
    toggleEl($('sumLineStartupDiscount'), state.isStartup);

    /* ── SEKTION EINMALIG ── */
    const onoEl = $('sumOnboardingValue');   /* v30: ID ist sumOnboardingValue */
    if (onoEl) onoEl.textContent = formatEuro(ONBOARDING);

    /* ── HINTS ── */
    updateHints();

    /* ── SEKTION RATENZAHLUNG ── */
    const ratenSection  = $('sumRatenSection');
    const ratenContent  = $('sumRatenContent');
    const ratenEmpty    = $('sumRatenEmpty');

    /* Sektion immer sichtbar */
    if (ratenSection) ratenSection.removeAttribute('hidden');

    /* Content nur wenn Vormonate > 0, sonst Empty-State */
    if (ratenContent) ratenContent.hidden = (vormonate === 0);
    if (ratenEmpty)   ratenEmpty.hidden   = (vormonate > 0);

    if (vormonate > 0) {
      const preMonthsCountEl = $('sumPreMonthsCount');
      if (preMonthsCountEl) preMonthsCountEl.textContent = vormonate;

      const preMonthsLabelEl = $('sumPreMonthsLabel');
      if (preMonthsLabelEl) preMonthsLabelEl.textContent = vormonate === 1 ? 'Vormonat' : 'Vormonate';

      const preMonthsTotalEl = $('sumPreMonthsTotal');
      if (preMonthsTotalEl) preMonthsTotalEl.textContent = formatEuro(vormonateTotal);

      /* Monatliche Rate = Total / ratenCount */
      const preMonthsEl = $('sumPreMonths');    /* ID des result-value */
      if (preMonthsEl) preMonthsEl.textContent = formatEuro(vormonateRate);

      const ratenNoteCountEl = $('sumRatenNoteCount');
      if (ratenNoteCountEl) ratenNoteCountEl.textContent = state.ratenCount;
    }

    /* ── FLOATING BAR ── */
    /* v30: barMonthly = totalMonthly (nicht mehr basePrice) */
    animateValue($('barMonthly'), state.displayed.barMonthly, totalMonthly, 400, fmtV);
    state.displayed.barMonthly = totalMonthly;

    /* v30: Sub-Row = Pkg-Line, nicht "Heute fällig" */
    const barPkgLineEl   = $('barPkgLine');
    const barPkgLineWrap = $('barPkgLineWrap');
    if (barPkgLineEl) barPkgLineEl.textContent = pkgLine;
    if (barPkgLineWrap) barPkgLineWrap.removeAttribute('hidden');
  }

  function renderHoldings() {
    animateValue($('sumMonthly'), state.displayed.monthly, HOLDINGS_PRICE, 500, fmtV);
    state.displayed.monthly = HOLDINGS_PRICE;

    toggleEl($('sumPriceAsterisk'), true);
    toggleEl($('sumPriceNote'), true);

    const pkgLineEl = $('sumPkgLine');
    if (pkgLineEl) pkgLineEl.textContent = 'Holdings · individuelle Lösung';

    /* Monatlich + Einmalig Sektionen verstecken (CSS-Klassen als Selektoren) */
    document.querySelectorAll('.summary-section-monatlich, .summary-section-einmalig').forEach(
      s => s.setAttribute('hidden', '')
    );

    /* Raten-Sektion bei Holdings verstecken */
    const ratenSection = $('sumRatenSection');
    if (ratenSection) ratenSection.setAttribute('hidden', '');

    /* Hints weg */
    const hintsSection = $('sumHintsSection');
    if (hintsSection) hintsSection.setAttribute('hidden', '');

    /* Floating Bar: Holdings-Modus */
    animateValue($('barMonthly'), state.displayed.barMonthly, HOLDINGS_PRICE, 400, fmtV);
    state.displayed.barMonthly = HOLDINGS_PRICE;
    const barPkgLineWrap = $('barPkgLineWrap');
    if (barPkgLineWrap) barPkgLineWrap.setAttribute('hidden', '');
  }

  /* ─── STEP 1 + PILL ─── */
  function updateStep1Pill() {
    const pill = $('step1Pill'), txt = $('step1PillText');
    if (!pill || !txt) return;
    txt.textContent = FORM_LABELS[state.form] || '';
    pill.hidden = false;
  }

  function bindForm() {
    const tiles = document.querySelectorAll('[data-form]');
    tiles.forEach(tile => {
      tile.addEventListener('click', () => {
        state.form = tile.dataset.form;
        const gr = PACKAGES_BY_FORM[state.form];
        if (gr) { const f = gr.packages.find(p => !p.comingSoon); if (f) state.package = f.id; }
        tiles.forEach(x => x.setAttribute('aria-pressed', x === tile ? 'true' : 'false'));
        updateStep1Pill();
        renderPackageCards();
        updateSummary();
      });
      /* Keyboard support für Div-Block-Tiles */
      tile.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tile.click(); }
      });
    });

    $('step1PillClose')?.addEventListener('click', () => {
      state.form = 'einzelunternehmer'; state.package = 'selbststarter';
      tiles.forEach(t => t.setAttribute('aria-pressed', t.dataset.form === 'einzelunternehmer' ? 'true' : 'false'));
      updateStep1Pill(); renderPackageCards(); updateSummary();
    });
  }

  /* ─── GRÜNDER-TOGGLE ─── */
  function bindStartupToggle() {
    const btn = $('startupToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      state.isStartup = !state.isStartup;
      this.setAttribute('aria-pressed', state.isStartup ? 'true' : 'false');
      renderPackageCards();
      updateSummary();
    });
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  }

  /* ─── DROPDOWNS ─── */
  function bindDropdown(ddEl, options, onSelect) {
    const trigger = ddEl.querySelector('.dropdown-trigger');
    const list    = ddEl.querySelector('.dropdown-list');
    const $value  = ddEl.querySelector('.dropdown-value');
    if (!trigger || !list) return;

    const checkSVG = `<svg class="dropdown-item-check" width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden="true"><path d="M1 4L4.5 7.5L11 1" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="bevel"/></svg>`;
    list.innerHTML = options.map(o =>
      `<div class="dropdown-item" role="option" data-value="${o.value}" aria-selected="${o.selected ? 'true' : 'false'}"><span class="dropdown-item-text">${o.label}</span>${checkSVG}</div>`
    ).join('');

    const init = options.find(o => o.selected);
    if (init && $value) $value.textContent = init.label;

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelectorAll('.dropdown.is-open').forEach(d => {
        if (d !== ddEl) { d.classList.remove('is-open'); d.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', 'false'); }
      });
      const open = ddEl.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    list.querySelectorAll('.dropdown-item').forEach(opt => {
      opt.addEventListener('click', () => {
        list.querySelectorAll('.dropdown-item').forEach(o => o.setAttribute('aria-selected', o === opt ? 'true' : 'false'));
        if ($value) $value.textContent = opt.querySelector('.dropdown-item-text').textContent;
        ddEl.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        onSelect(opt.dataset.value);
      });
    });
  }

  function bindConfig() {
    const months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

    const mDD = document.querySelector('[data-dropdown="month"]');
    if (mDD) bindDropdown(mDD, months.map((m, i) => ({ value: i + 1, label: m, selected: i + 1 === state.startMonth })), v => { state.startMonth = +v; updateSummary(); });

    const yDD = document.querySelector('[data-dropdown="year"]');
    if (yDD) {
      const y = new Date().getFullYear();
      bindDropdown(yDD, [y, y+1].map(yr => ({ value: yr, label: String(yr), selected: yr === state.startYear })), v => { state.startYear = +v; updateSummary(); });
    }

    const rDD = document.querySelector('[data-dropdown="revenue"]');
    if (rDD) bindDropdown(rDD, REVENUE_TIERS.map(t => ({ value: t.value, label: t.label, selected: t.value === state.revenue })), v => { state.revenue = +v; updateSummary(); });

    /* TX Stepper */
    const txD = $('txDecrement'), txI = $('txIncrement'), txV = $('txValue');
    function setTx(v) {
      state.transactions = Math.max(TX_MIN, Math.min(TX_MAX, v));
      if (txV) txV.textContent = state.transactions;
      if (txD) txD.disabled = state.transactions <= TX_MIN;
      if (txI) txI.disabled = state.transactions >= TX_MAX;
      if (state.isStartup) renderPackageCards();
      updateSummary();
    }
    txD?.addEventListener('click', () => setTx(state.transactions + getTxStep(state.transactions, -1)));
    txI?.addEventListener('click', () => setTx(state.transactions + getTxStep(state.transactions, +1)));
    setTx(state.transactions);

    /* Klick außerhalb schließt Dropdowns */
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown.is-open').forEach(d => {
        d.classList.remove('is-open');
        d.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ─── RATEN-PILLS v30 ─── */
  function bindRatenPills() {
    /* Div Blocks mit role="radio" und data-raten Attribut */
    const pills = document.querySelectorAll('.summary-raten-pill[data-raten]');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const value = parseInt(pill.dataset.raten, 10);
        if (state.ratenCount === value) return;
        state.ratenCount = value;
        pills.forEach(p => {
          const isActive = parseInt(p.dataset.raten, 10) === value;
          p.classList.toggle('is-active', isActive);
          p.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
        updateSummary();
      });
      /* Keyboard support */
      pill.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pill.click(); }
      });
    });
  }

  /* ─── TOOLTIPS ─── */
  function bindTooltips() {
    document.querySelectorAll('.tooltip-trigger').forEach(t => {
      t.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = t.getAttribute('aria-expanded') === 'true';
        document.querySelectorAll('.tooltip-trigger').forEach(x => x.setAttribute('aria-expanded', 'false'));
        t.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('.tooltip-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
    });
  }

  /* ─── CAROUSEL ─── */
  function bindCarousel() {
    document.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.carouselIdx, 10);
        const gr  = PACKAGES_BY_FORM[state.form];
        if (!gr || !gr.packages[idx]) return;
        const target = gr.packages[idx];
        if (target.comingSoon) return;
        state.package = target.id;
        renderPackageCards();
        updateSummary();
        document.querySelector(`[data-package="${target.id}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
    });
  }

  /* ─── FLOATING BAR ─── */
  function bindFloatingBar() {
    const bar = $('floatingBar'), sum = $('calculatorSummary');
    if (!bar || window.innerWidth > 1000) return;
    setTimeout(() => bar.classList.add('is-ready'), 600);
    if (sum) {
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) bar.classList.add('is-hidden');
          else bar.classList.remove('is-hidden');
        });
      }, { threshold: 0.2 }).observe(sum);
    }
  }

  /* ─── RESET ─── */
  function bindReset() {
    /* ID: resetCalcBtn — ist in v30 ein Div Block in summary-meta */
    const btn = $('resetCalcBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      state.form         = 'einzelunternehmer';
      state.package      = 'selbststarter';
      state.startMonth   = new Date().getMonth() + 1;
      state.startYear    = new Date().getFullYear();
      state.revenue      = 0;
      state.transactions = 100;
      state.isStartup    = false;
      state.ratenCount   = RATEN_DEFAULT;

      document.querySelectorAll('[data-form]').forEach(t =>
        t.setAttribute('aria-pressed', t.dataset.form === 'einzelunternehmer' ? 'true' : 'false'));

      const startupBtn = $('startupToggle');
      if (startupBtn) startupBtn.setAttribute('aria-pressed', 'false');

      /* Raten-Pills zurücksetzen */
      document.querySelectorAll('.summary-raten-pill[data-raten]').forEach(pill => {
        const isDefault = parseInt(pill.dataset.raten, 10) === RATEN_DEFAULT;
        pill.classList.toggle('is-active', isDefault);
        pill.setAttribute('aria-checked', isDefault ? 'true' : 'false');
      });

      updateStep1Pill();
      renderPackageCards();
      updateSummary();
    });
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  }

  /* ─── INIT ─── */
  function init() {
    bindForm();
    bindStartupToggle();
    bindConfig();
    bindRatenPills();    /* v30: neu */
    bindTooltips();
    bindCarousel();
    bindFloatingBar();
    bindReset();
    updateStep1Pill();
    renderPackageCards();
    updateSummary();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
