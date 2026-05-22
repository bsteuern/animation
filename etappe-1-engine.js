/* ════════════════════════════════════════════════════════════
   b'STEUERN PREISRECHNER · ENGINE · v32
   Page Settings → Before </body> → in <script>…</script>

   ÄNDERUNGEN v32:
   - COMPARE_FEATURES + renderCompareTable() vollständig ergänzt
   - bindCompareToggle(): Toggle öffnet/schließt Tabelle korrekt
   - Label wechselt: "Pakete vergleichen" ↔ "Vergleich schließen"
   - Bei Rechtsform-Wechsel wird offene Tabelle neu gerendert
   - Mobile: Akkordeon-Cards (compare-cards) werden mitgerendert
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
        id:         node.dataset.packageId,
        name:       node.dataset.packageName,
        badge:      node.dataset.packageBadge || '',
        badgeTier:  node.dataset.packageBadgeTier || '',
        tagline:    node.dataset.packageTagline || '',
        desc:       node.dataset.packageDesc || '',
        price:      parseFloat(node.dataset.packagePrice) || 0,
        comingSoon: (node.dataset.packageComingSoon || '').trim() === 'true',
        features:   (node.dataset.packageFeatures || '').split('|').map(s => s.trim()).filter(Boolean)
      };
      if (!grouped[form]) grouped[form] = { label: node.dataset.formLabel || form, packages: [] };
      grouped[form].packages.push(pkg);
    });
    Object.values(grouped).forEach(g => g.packages.sort((a, b) => a.price - b.price));
    return grouped;
  }

  /* ─── KONSTANTEN ─── */
  const HOLDINGS_PRICE = 65;
  const ONBOARDING     = 299;
  const RATEN_DEFAULT  = 3;

  const TX_STEP      = 50;
  const TX_STEP_FINE = 5;
  const TX_MIN       = 0;
  const TX_MAX       = 600;

  const TX_TIERS = [
    { upTo: 100, cost: 0   }, { upTo: 200, cost: 50  }, { upTo: 300, cost: 100 },
    { upTo: 400, cost: 150 }, { upTo: 500, cost: 200 }, { upTo: Infinity, cost: 250 }
  ];

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
      { txYearlyMax: 29,       yearly: 999  }, { txYearlyMax: 60,       yearly: 1069 },
      { txYearlyMax: 120,      yearly: 1299 }, { txYearlyMax: 240,      yearly: 1499 },
      { txYearlyMax: 360,      yearly: 1599 }, { txYearlyMax: 480,      yearly: 1788 },
      { txYearlyMax: Infinity, yearly: 1788 }
    ],
    'BILANZ': [
      { txYearlyMax: 29,       yearly: 1099 }, { txYearlyMax: 60,       yearly: 1299 },
      { txYearlyMax: 120,      yearly: 1499 }, { txYearlyMax: 240,      yearly: 1799 },
      { txYearlyMax: 360,      yearly: 1999 }, { txYearlyMax: 480,      yearly: 2149 },
      { txYearlyMax: Infinity, yearly: 2388 }
    ],
    'JP_PG': [
      { txYearlyMax: 29,       yearly: 1299 }, { txYearlyMax: 60,       yearly: 1549 },
      { txYearlyMax: 120,      yearly: 1799 }, { txYearlyMax: 240,      yearly: 1999 },
      { txYearlyMax: 360,      yearly: 2249 }, { txYearlyMax: 480,      yearly: 2499 },
      { txYearlyMax: Infinity, yearly: 2988 }
    ]
  };

  /* v31: Klassischer Steuerberater — Multiplier nach Rechtsform.
     Approximation auf Basis StBVV-Honorare; deshalb ~ im Display.
     Holdings nutzt eigenen Render-Pfad → kein Eintrag nötig. */
  const STB_MULTIPLIERS = {
    einzelunternehmer:    1.4,
    personengesellschaft: 1.6,
    juristische:          1.9
  };

  /* v32: Feature-Matrix für Paketvergleich — 1:1 aus Prototyp */
  const COMPARE_FEATURES = [
    { key: 'jahresabschluss', label: 'Jahresabschluss & Bilanz',                         selbststarter: true,      sorglos: true,      vollservice: true      },
    { key: 'steuern',        label: 'Alle betrieblichen Steuererklärungen',               selbststarter: true,      sorglos: true,      vollservice: true      },
    { key: 'feststellung',   label: 'Gesonderte Feststellung',                            selbststarter: true,      sorglos: true,      vollservice: true      },
    { key: 'guthaben',       label: 'Beratungsguthaben p.a.',                             selbststarter: '100 €',   sorglos: '200 €',   vollservice: '400 €'   },
    { key: 'review',         label: 'Monatlicher Review (Belege >100 €)',                 selbststarter: false,     sorglos: true,      vollservice: true      },
    { key: 'uva_prep',       label: 'Alles bereit für die UVA – Du übermittelst',         selbststarter: false,     sorglos: true,      vollservice: false     },
    { key: 'verbuchen',      label: 'Verbuchen der hochgeladenen Belege',                 selbststarter: false,     sorglos: false,     vollservice: true      },
    { key: 'uva_send',       label: 'Umsatzsteuer-Voranmeldung (Übermittlung durch uns)', selbststarter: false,     sorglos: false,     vollservice: true      },
    { key: 'zm',             label: 'Zusammenfassende Meldung',                           selbststarter: false,     sorglos: false,     vollservice: true      },
    { key: 'bwa',            label: 'Betriebswirtschaftliche Auswertung',
      tooltip: 'Der Preis kalkuliert sich je nach Aufwand. Wir besprechen den Umfang im Erstgespräch.',
                                                                                           selbststarter: false,     sorglos: true,      vollservice: true      },
    { key: 'support',        label: 'Antwortzeit auf Anfragen',                           selbststarter: '3 Werktage', sorglos: '2 Werktage', vollservice: '1 Werktag' },
  ];

  const FORM_LABELS = {
    einzelunternehmer:    'Einzelunternehmer',
    personengesellschaft: 'Personengesellschaft',
    juristische:          'Juristische Person',
    holdings:             'Holdings'
  };

  /* ─── STATE ─── */
  const PACKAGES_BY_FORM = parsePackagesFromCMS();
  let isFirstRender = true; /* v33: verhindert Zähl-Animation beim ersten Laden */
  const state = {
    form:         'einzelunternehmer',
    package:      'selbststarter',
    startMonth:   new Date().getMonth() + 1,
    startYear:    new Date().getFullYear(),
    revenue:      0,
    transactions: 100,
    isStartup:    false,
    ratenCount:   RATEN_DEFAULT,
    displayed: {
      monthly: 0, paket: 0, transactions: 0, buchhaltung: 0, barMonthly: 0
    }
  };

  /* ─── HELPERS ─── */
  const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const priceCeil  = v => Math.ceil(v - 1e-9);
  const formatEuro = v => priceCeil(v).toLocaleString('de-DE') + ' €';
  const fmtV       = v => priceCeil(v).toLocaleString('de-DE');

  const activeAnims = new Map();
  function animateValue(el, from, to, dur = 500, fmt = v => v) {
    if (!el) return;
    /* Beim ersten Render sofort setzen — keine Zähl-Animation */
    if (isFirstRender || PREFERS_REDUCED || Math.abs(from - to) < 0.005) {
      el.textContent = fmt(to);
      return;
    }
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

  /* toggleEl: entfernt/setzt hidden-Attribut UND überschreibt
     Webflow-CSS-basiertes display:none via inline-style-Fallback */
  function toggleEl(el, show) {
    if (!el) return;
    if (show) {
      el.removeAttribute('hidden');
      el.style.display = '';
    } else {
      el.setAttribute('hidden', '');
    }
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

  function getTxStep(current, dir) {
    if (!state.isStartup) return TX_STEP * dir;
    if (dir > 0) return current < 50 ? TX_STEP_FINE : TX_STEP;
    return current <= 50 ? -TX_STEP_FINE : -TX_STEP;
  }

  function calculate() {
    if (state.form === 'holdings') return null;
    const pkg = getCurrentPkg(); if (!pkg) return null;
    const basePrice     = pkg.price;
    const txCost        = txSurcharge(state.transactions);
    const revTier       = getRevenueTier(state.revenue);
    const surcharge     = basePrice * (revTier.percent / 100);
    const totalMonthly  = basePrice + surcharge + txCost;

    const currentYear     = new Date().getFullYear();
    const vormonate       = state.startYear === currentYear ? Math.max(0, state.startMonth - 1) : 0;
    const markupFactor    = 1 + revTier.percent / 100;
    const vormonateTotal  = vormonate * basePrice * markupFactor;
    const vormonateRate   = vormonate > 0 ? vormonateTotal / state.ratenCount : 0;

    return { basePrice, txCost, surcharge, revTier, totalMonthly, vormonate, vormonateTotal, vormonateRate };
  }

  /* ─── STEUERBERATER-VERGLEICH (v31) ─── */
  /* Berechnet den approximierten klassischen Steuerberater-Preis
     via Multiplier nach Rechtsform und aktualisiert die drei
     Display-Elemente in der Summary-Sidebar. */
  function updateCompare(totalMonthly) {
    const compareEl   = $('sumCompareValue');
    const savingPctEl = $('sumSavingPercent');
    const savingAmtEl = $('sumSavingAmount');
    if (!compareEl) return;

    const multiplier = STB_MULTIPLIERS[state.form] || 1.55;
    const stbCost    = Math.round(totalMonthly * multiplier);
    const saving     = stbCost - totalMonthly;
    const savingPct  = Math.round((saving / stbCost) * 100);

    compareEl.textContent = `~ ${priceCeil(stbCost).toLocaleString('de-DE')} €/Mo`;
    if (savingPctEl) savingPctEl.textContent = `${savingPct} %`;
    if (savingAmtEl) savingAmtEl.textContent = `${priceCeil(saving).toLocaleString('de-DE')} €`;
  }

  /* ─── COMPARE-TABELLE (v32) ─── */
  function renderCell(val) {
    if (val === true)  return '<span class="compare-table__check" aria-label="enthalten">✓</span>';
    if (val === false) return '<span class="compare-table__cross" aria-label="nicht enthalten">—</span>';
    return `<span class="compare-table__value">${val}</span>`;
  }

  function renderCompareTable() {
    const container = $('compareTable');
    if (!container || state.form === 'holdings') return;
    const group = PACKAGES_BY_FORM[state.form];
    if (!group || group.packages.length < 2) { container.innerHTML = ''; return; }
    const pkgs = group.packages;

    /* Tier aus Package-ID ableiten (identisch zu renderPackageCards) */
    const tier = pkg => pkg.comingSoon        ? 'coming-soon'
                      : pkg.id === 'selbststarter' ? 'grundpaket'
                      : pkg.id === 'vollservice'   ? 'vollpaket'
                      : 'empfehlung';

    /* Feature-Wert einer Zeile für ein bestimmtes Paket.
       Mapping: selbststarter / sorglos / vollservice — Fallback auf pkg.id */
    const featVal = (f, pkg) => {
      const key = pkg.id === 'sorglos' ? 'sorglos'
                : pkg.id === 'selbststarter' ? 'selbststarter'
                : pkg.id === 'vollservice' ? 'vollservice'
                : pkg.id;
      return f[key] !== undefined ? f[key] : false;
    };

    /* Label ohne Tooltip in der Tabelle */
    const renderLabel = f => f.label;

    /* Desktop-Tabelle */
    const tableHead = `
      <div class="compare-table__head">
        <div class="compare-table__head-cell compare-table__head-cell--label">Leistungen</div>
        ${pkgs.map(p => `
          <div class="compare-table__head-cell ${p.comingSoon ? 'is-coming-soon' : ''}">
            <span class="compare-table__pkg-badge" data-tier="${tier(p)}">${p.badge || ''}</span>
            <span class="compare-table__pkg-name">${p.name}</span>
            <span class="compare-table__pkg-price">ab ${priceCeil(p.price)} €<small>/ Mo</small></span>
          </div>`).join('')}
      </div>`;

    const tableBody = `
      <div class="compare-table__body">
        ${COMPARE_FEATURES.map(f => `
          <div class="compare-table__row">
            <div class="compare-table__cell compare-table__cell--label">${renderLabel(f)}</div>
            ${pkgs.map(p => `
              <div class="compare-table__cell ${p.comingSoon ? 'is-coming-soon' : ''}">
                ${renderCell(featVal(f, p))}
              </div>`).join('')}
          </div>`).join('')}
      </div>`;

    /* Mobile-Akkordeon */
    const mobileCards = `
      <div class="compare-cards">
        ${pkgs.map(p => `
          <details class="compare-card ${p.comingSoon ? 'is-coming-soon' : ''}" ${p.badge === 'Empfehlung' ? 'open' : ''}>
            <summary class="compare-card__head">
              <span class="compare-card__pkg-badge" data-tier="${tier(p)}">${p.badge || ''}</span>
              <span class="compare-card__pkg-name">${p.name}</span>
              <span class="compare-card__pkg-price">ab ${priceCeil(p.price)} €<small> / Mo</small></span>
              <svg class="compare-card__chevron" width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
              </svg>
            </summary>
            <ul class="compare-card__features">
              ${COMPARE_FEATURES.map(f => `
                <li>
                  <span class="compare-card__feature-label">${renderLabel(f)}</span>
                  <span class="compare-card__feature-value">${renderCell(featVal(f, p))}</span>
                </li>`).join('')}
            </ul>
          </details>`).join('')}
      </div>`;

    container.innerHTML = `<div class="compare-table__inner">${tableHead}${tableBody}</div>${mobileCards}`;
  }

  function bindCompareToggle() {
    const toggle = $('compareToggle');
    const table  = $('compareTable');
    if (!toggle || !table) return;
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-pressed') === 'true';
      toggle.setAttribute('aria-pressed', isOpen ? 'false' : 'true');
      const label = toggle.querySelector('.compare-toggle__label');
      if (label) label.textContent = isOpen ? 'Pakete vergleichen' : 'Vergleich schließen';
      if (isOpen) {
        table.hidden = true;
        table.style.display = '';
      } else {
        renderCompareTable();
        table.hidden = false;
        table.style.display = '';
        setTimeout(() => table.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
      }
    });
  }

  /* ─── SALES HINTS ─── */
  function updateHints() {
    const txHighEl      = $('sumHintTxHigh');
    const txHighActive  = state.transactions > 500;
    toggleEl(txHighEl, txHighActive);

    const revHighEl     = $('sumHintRevenueHigh');
    const tier          = getRevenueTier(state.revenue);
    const revHighActive = tier.percent >= 25;
    if (revHighEl) {
      toggleEl(revHighEl, revHighActive);
      if (revHighActive) revHighEl.textContent = `Bei dieser Umsatzgröße (${tier.label}) ist die Buchhaltung deutlich komplexer. Wir empfehlen eine individuelle Auslegung — besprechen wir gerne im Erstgespräch.`;
    }

    const complexEl     = $('sumHintComplex');
    const complexActive = state.form === 'juristische' && state.package !== 'selbststarter';
    toggleEl(complexEl, complexActive);

    const hintsSection  = $('sumHintsSection');
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
      /* Badge-Tier: coming-soon erhält eigene Klasse → schwarzer Badge */
      const badgeTier = pkg.comingSoon ? 'coming-soon' : (pkg.badgeTier || 'grundpaket');
      return `<div class="package-card${pkg.comingSoon ? ' is-coming-soon' : ''}"
          role="radio" aria-pressed="${isSelected}" tabindex="${pkg.comingSoon ? '-1' : '0'}"
          data-package="${pkg.id}" ${pkg.comingSoon ? 'aria-disabled="true"' : ''}>
        <div class="package-card-header">
          <span class="package-card-badge" data-tier="${badgeTier}">${pkg.badge}</span>
          ${pkg.tagline ? `<span class="package-card-tagline">${pkg.tagline}</span>` : ''}
          <span class="package-card-name">${pkg.name}</span>
          ${pkg.desc ? `<span class="package-card-desc">${pkg.desc}</span>` : ''}
          ${hint}
        </div>
        <div class="package-card-price">
          <span class="package-card-price-prefix">ab</span>
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
        /* Geklickte Card in die Mitte des Carousels scrollen */
        if (window.innerWidth <= 1000) {
          card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
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

  /* ─── RENDER: SUMMARY v31 ─── */
  function updateSummary() {
    if (state.form === 'holdings') { renderHoldings(); return; }

    /* Sections wieder sichtbar machen falls zuvor Holdings aktiv war */
    document.querySelectorAll('.summary-section-monatlich, .summary-section-einmalig').forEach(
      s => { s.removeAttribute('hidden'); s.style.display = ''; }
    );

    /* Compare-Sektion bei Nicht-Holdings sichtbar */
    const compareSection = $('sumCompare');
    if (compareSection) { compareSection.removeAttribute('hidden'); compareSection.style.display = ''; }

    /* Holdings-Card verstecken + is-holdings von Containern entfernen */
    /* Holdings-Card verstecken + is-holdings von Containern entfernen */
    toggleEl($('step-holdings'), false);
    /* startup-toggle-wrap wieder einblenden */
    const startupWrap = document.querySelector('.startup-toggle-wrap');
    if (startupWrap) toggleEl(startupWrap, true);
    $('calculatorSummary')?.classList.remove('is-holdings');
    $('floatingBar')?.classList.remove('is-holdings');
    document.querySelector('.calculator-steps')?.classList.remove('is-holdings');

    const calc = calculate();
    if (!calc) return;
    const { basePrice, txCost, surcharge, revTier, totalMonthly, vormonate, vormonateTotal, vormonateRate } = calc;

    /* Hauptpreis */
    animateValue($('sumMonthly'), state.displayed.monthly, totalMonthly, 500, fmtV);
    state.displayed.monthly = totalMonthly;

    /* Asterisk und Note (nur Holdings) */
    toggleEl($('sumPriceAsterisk'), false);
    toggleEl($('sumPriceNote'), false);

    /* Pkg-Line */
    const pkg     = getCurrentPkg();
    const group   = PACKAGES_BY_FORM[state.form];
    const pkgLine = pkg && group ? `${pkg.name} · ${group.label}` : '';
    const pkgLineEl = $('sumPkgLine'); if (pkgLineEl) pkgLineEl.textContent = pkgLine;

    /* ── SEKTION MONATLICH ── */
    const paketNameEl = $('sumPaketName'); if (paketNameEl && pkg) paketNameEl.textContent = pkg.name;
    animateValue($('sumPaket'), state.displayed.paket, basePrice, 380, formatEuro);
    state.displayed.paket = basePrice;

    toggleEl($('sumLineTransactions'), txCost > 0);
    animateValue($('sumTransactions'), state.displayed.transactions, txCost, 380, formatEuro);
    state.displayed.transactions = txCost;

    toggleEl($('sumLineBuchhaltung'), surcharge > 0);
    animateValue($('sumBuchhaltung'), state.displayed.buchhaltung, surcharge, 380, formatEuro);
    state.displayed.buchhaltung = surcharge;
    const spEl = $('sumSurchargePct'); if (spEl) spEl.textContent = `(${revTier.percent}%)`;

    toggleEl($('sumLineStartupDiscount'), state.isStartup);

    /* ── SEKTION EINMALIG ── */
    const onoEl = $('sumOnboardingValue');
    if (onoEl) onoEl.textContent = formatEuro(ONBOARDING);

    /* ── HINTS ── */
    updateHints();

    /* ── SEKTION RATENZAHLUNG ── */
    const ratenSection = $('sumRatenSection');
    const ratenContent = $('sumRatenContent');
    const ratenEmpty   = $('sumRatenEmpty');

    /* Sektion immer sichtbar — removeAttribute + style-Fallback für Webflow-CSS */
    if (ratenSection) {
      ratenSection.removeAttribute('hidden');
      ratenSection.style.display = '';
    }

    /* Content vs. Empty-State — sumRatenContent ist jetzt Geschwister von summary-raten-empty */
    if (ratenContent) {
      ratenContent.hidden = (vormonate === 0);
      ratenContent.style.removeProperty('display');
    }
    if (ratenEmpty) {
      ratenEmpty.hidden = (vormonate > 0);
      ratenEmpty.style.removeProperty('display');
    }

    if (vormonate > 0) {
      const preMonthsCountEl = $('sumPreMonthsCount');
      if (preMonthsCountEl) preMonthsCountEl.textContent = vormonate;

      const preMonthsLabelEl = $('sumPreMonthsLabel');
      if (preMonthsLabelEl) preMonthsLabelEl.textContent = vormonate === 1 ? 'Vormonat' : 'Vormonate';

      const preMonthsTotalEl = $('sumPreMonthsTotal');
      if (preMonthsTotalEl) preMonthsTotalEl.textContent = formatEuro(vormonateTotal);

      const preMonthsEl = $('sumPreMonths');
      if (preMonthsEl) preMonthsEl.textContent = formatEuro(vormonateRate);

      const ratenNoteCountEl = $('sumRatenNoteCount');
      if (ratenNoteCountEl) ratenNoteCountEl.textContent = state.ratenCount;
    }

    /* ── STEUERBERATER-VERGLEICH (v31: jetzt live) ── */
    updateCompare(totalMonthly);

    /* ── COMPARE-TABELLE: bei Rechtsform-Wechsel neu rendern wenn offen ── */
    const compareToggleEl = $('compareToggle');
    if (compareToggleEl?.getAttribute('aria-pressed') === 'true') {
      renderCompareTable();
    }

    /* ── FLOATING BAR ── */
    animateValue($('barMonthly'), state.displayed.barMonthly, totalMonthly, 400, fmtV);
    state.displayed.barMonthly = totalMonthly;

    /* Asterisk: sichtbar wenn Vormonate vorhanden */
    toggleEl($('barAsterisk'), vormonate > 0);

    /* Sheet-Inhalt aktualisieren */
    renderBarSheet({ basePrice, txCost, surcharge, vormonate, vormonateTotal, vormonateRate,
                     pkgName: pkgLine.split('·')[0].trim() });

    const barPkgLineEl   = $('barPkgLine');
    const barPkgLineWrap = $('barPkgLineWrap');
    if (barPkgLineEl) barPkgLineEl.textContent = pkgLine;
    if (barPkgLineWrap) { barPkgLineWrap.removeAttribute('hidden'); barPkgLineWrap.style.display = ''; }
  }

  /* ─── HOLDINGS ─── */
  function renderHoldings() {
    /* Holdings-Card einblenden + is-holdings auf Container setzen */
    /* Holdings-Card einblenden + is-holdings auf Container setzen */
    toggleEl($('step-holdings'), true);
    /* Ganzen startup-toggle-wrap verstecken — blendet Toggle + Tooltip aus
       und lässt step-holdings automatisch nach oben rücken */
    const startupWrap = document.querySelector('.startup-toggle-wrap');
    if (startupWrap) toggleEl(startupWrap, false);
    $('calculatorSummary')?.classList.add('is-holdings');
    $('floatingBar')?.classList.add('is-holdings');
    document.querySelector('.calculator-steps')?.classList.add('is-holdings');

    animateValue($('sumMonthly'), state.displayed.monthly, HOLDINGS_PRICE, 500, fmtV);
    state.displayed.monthly = HOLDINGS_PRICE;

    toggleEl($('sumPriceAsterisk'), true);
    toggleEl($('sumPriceNote'), true);

    const pkgLineEl = $('sumPkgLine');
    if (pkgLineEl) pkgLineEl.textContent = 'Holdings · individuelle Lösung';

    /* Monatlich + Einmalig verstecken */
    document.querySelectorAll('.summary-section-monatlich, .summary-section-einmalig').forEach(
      s => s.setAttribute('hidden', '')
    );

    /* Compare bei Holdings verstecken (kein sinnvoller Vergleichswert) */
    const compareSection = $('sumCompare');
    if (compareSection) compareSection.setAttribute('hidden', '');

    /* Raten-Sektion verstecken */
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
    const list    = ddEl.querySelector('[class*="dropdown-list"]');
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
      bindDropdown(yDD, [y, y + 1].map(yr => ({ value: yr, label: String(yr), selected: yr === state.startYear })), v => { state.startYear = +v; updateSummary(); });
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
      pill.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pill.click(); }
      });
    });
  }

  /* ─── TOOLTIPS ─── */
  function closeAllTooltips() {
    document.querySelectorAll('.tooltip-trigger').forEach(t =>
      t.setAttribute('aria-expanded', 'false')
    );
    document.querySelectorAll('.tooltip-bubble').forEach(b => {
      b.style.opacity       = '0';
      b.style.pointerEvents = 'none';
      b.style.transform     = 'translateY(4px)';
    });
  }

  function showTooltip(trigger) {
    const bubble = trigger.nextElementSibling;
    if (!bubble || !bubble.classList.contains('tooltip-bubble')) return;

    const rect    = trigger.getBoundingClientRect();
    const bWidth  = bubble.offsetWidth  || 280;
    const bHeight = bubble.offsetHeight || 120;
    const gap     = 10;

    const triggerCenterX = rect.left + rect.width / 2;
    let left = triggerCenterX - bWidth / 2;
    left = Math.max(gap, Math.min(left, window.innerWidth - bWidth - gap));

    const arrowLeft = Math.max(8, Math.min(triggerCenterX - left - 6, bWidth - 20));

    let top = rect.top - bHeight - gap;
    if (top < gap) top = rect.bottom + gap;

    bubble.style.left          = left + 'px';
    bubble.style.top           = top  + 'px';
    bubble.style.right         = 'auto';
    bubble.style.bottom        = 'auto';
    bubble.style.opacity       = '1';
    bubble.style.pointerEvents = 'auto';
    bubble.style.transform     = 'translateY(0)';
    bubble.style.setProperty('--arrow-left', arrowLeft + 'px');

    trigger.setAttribute('aria-expanded', 'true');
  }

  function bindTooltips() {
    document.querySelectorAll('.tooltip-trigger').forEach(t => {
      t.addEventListener('click', e => {
        e.stopPropagation();
        const wasOpen = t.getAttribute('aria-expanded') === 'true';
        closeAllTooltips();
        if (!wasOpen) showTooltip(t);
      });
      t.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); }
        if (e.key === 'Escape') closeAllTooltips();
      });
    });
    document.addEventListener('click', closeAllTooltips);
    window.addEventListener('scroll', closeAllTooltips, { passive: true });
    window.addEventListener('resize', closeAllTooltips, { passive: true });
  }

  /* ─── CAROUSEL ─── */
  function bindCarousel() {
    document.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx    = parseInt(dot.dataset.carouselIdx, 10);
        const gr     = PACKAGES_BY_FORM[state.form];
        if (!gr || !gr.packages[idx]) return;
        const target = gr.packages[idx];
        /* Coming-soon: zur Card scrollen aber nicht auswählen */
        if (target.comingSoon) {
          document.querySelector(`[data-package="${target.id}"]`)
            ?.scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' });
          return;
        }
        state.package = target.id;
        renderPackageCards();
        updateSummary();
        document.querySelector(`[data-package="${target.id}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
    });
  }

  /* ─── BAR SHEET RENDER ─── */
  function renderBarSheet({ basePrice, txCost, surcharge, vormonate,
                             vormonateTotal, vormonateRate, pkgName } = {}) {
    const el = $('barSheetContent');
    if (!el || window.innerWidth > 1000) return;

    const fmt = v => formatEuro(v);
    let h = '';

    h += `<p class="bar-sheet-label">Monatlich</p>`;
    h += `<div class="bar-sheet-row"><span>${pkgName || ''}</span><span>${fmt(basePrice)}</span></div>`;
    if (txCost > 0)   h += `<div class="bar-sheet-row bar-sheet-row--sub"><span>Transaktionen</span><span>+${fmt(txCost)}</span></div>`;
    if (surcharge > 0) h += `<div class="bar-sheet-row bar-sheet-row--sub"><span>Umsatz-Aufschlag</span><span>+${fmt(surcharge)}</span></div>`;

    h += `<div class="bar-sheet-divider"></div>`;
    h += `<p class="bar-sheet-label">Einmalig</p>`;
    h += `<div class="bar-sheet-row"><span>Onboarding</span><span>${fmt(ONBOARDING)}</span></div>`;

    if (vormonate > 0) {
      h += `<div class="bar-sheet-divider"></div>`;
      h += `<p class="bar-sheet-label">Ratenzahlung</p>`;
      h += `<div class="bar-sheet-row"><span><strong>${vormonate}</strong> Vormonate</span><span>${fmt(vormonateTotal)}</span></div>`;
      h += `<div style="font-size:.75rem;color:rgba(14,12,28,.55);margin-bottom:.35rem">Aufteilung</div>`;
      h += `<div class="bar-sheet-pills">${[1,3,6].map(r =>
        `<div class="bar-sheet-pill${r === state.ratenCount ? ' is-active' : ''}"
              onclick="(function(){state.ratenCount=${r};updateSummary();})()">${r} Mo</div>`
      ).join('')}</div>`;
      h += `<div class="bar-sheet-row"><span style="color:rgba(14,12,28,.55)">Monatliche Rate</span><span style="font-weight:500">${fmt(vormonateRate)}</span></div>`;
      h += `<div style="font-size:.68rem;color:rgba(14,12,28,.45);margin-top:2px">Befristet auf ${state.ratenCount} Monatsraten</div>`;
    }

    el.innerHTML = h;
  }

  /* ─── FLOATING BAR ─── */
  function bindFloatingBar() {
    const bar = $('floatingBar'), sum = $('calculatorSummary');
    if (!bar || window.innerWidth > 1000) return;
    bar.style.setProperty('display', 'block', 'important');
    setTimeout(() => bar.classList.add('is-ready'), 600);
    if (sum) {
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) bar.classList.add('is-hidden');
          else bar.classList.remove('is-hidden');
        });
      }, { threshold: 0.2 }).observe(sum);
    }

    const inner = bar.querySelector('.floating-bar-inner') || bar;

    /* Sheet erstellen */
    const sheet = document.createElement('div');
    sheet.id = 'barSheet';
    sheet.innerHTML = '<div class="bar-sheet-handle" id="barSheetHandle"></div><div id="barSheetContent"></div>';
    inner.prepend(sheet);

    /* CTA in Sheet verschieben — nur im Sheet sichtbar */
    const cta = inner.querySelector('.floating-bar-cta');
    if (cta) sheet.appendChild(cta);

    /* Handle schließt Sheet */
    document.getElementById('barSheetHandle')?.addEventListener('click', e => {
      e.stopPropagation();
      bar.classList.remove('is-expanded');
      if (bar._overlay) { bar._overlay.style.opacity = '0'; bar._overlay.style.pointerEvents = 'none'; }
    });

    /* Overlay */
    const overlay = document.createElement('div');
    overlay.id = 'barOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(14,12,28,.55);opacity:0;transition:opacity .3s ease;z-index:9000;pointer-events:none;';
    document.body.appendChild(overlay);
    bar._overlay = overlay;
  }

  /* ─── SUMMARY MOBILE COLLAPSE ─── */
  function bindSummaryToggle() {
    const toggle = $('summaryToggle');
    const summaryEl = $('calculatorSummary');
    if (!toggle || !summaryEl) return;
    /* Initial: auf Mobile collapsed */
    if (window.innerWidth <= 1000) {
      summaryEl.dataset.mobileCollapsed = 'true';
      toggle.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', () => {
      const isCollapsed = summaryEl.dataset.mobileCollapsed === 'true';
      summaryEl.dataset.mobileCollapsed = isCollapsed ? 'false' : 'true';
      toggle.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
      const label = $('summaryToggleLabel');
      if (label) label.textContent = isCollapsed ? 'Details schließen' : 'Details anzeigen';
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1000) {
        summaryEl.removeAttribute('data-mobile-collapsed');
      } else if (!summaryEl.dataset.mobileCollapsed) {
        summaryEl.dataset.mobileCollapsed = 'true';
      }
    });
  }

  /* ─── FLOATING BAR EXPAND/COLLAPSE ─── */
  function bindBarDetailsLink() {
    const link = $('barDetailsLink');
    const bar  = $('floatingBar');
    if (!link || !bar) return;

    const open = () => {
      bar.classList.add('is-expanded');
      if (bar._overlay) { bar._overlay.style.opacity = '1'; bar._overlay.style.pointerEvents = 'auto'; }
    };
    const close = () => {
      bar.classList.remove('is-expanded');
      if (bar._overlay) { bar._overlay.style.opacity = '0'; bar._overlay.style.pointerEvents = 'none'; }
    };

    link.addEventListener('click', e => {
      e.stopPropagation();
      bar.classList.contains('is-expanded') ? close() : open();
    });

    /* Tap auf Overlay → schließen */
    document.addEventListener('click', e => {
      if (!bar.contains(e.target)) close();
    });
  }

  /* ─── RESET ─── */
  function bindReset() {
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
  /* ─── FAQ TOGGLE ─── */
  function bindFaq() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-q');
      const a = item.querySelector('.faq-a');
      if (!q) return;
      /* Inline-Styles von gelöschten Webflow-Interactions entfernen */
      if (a) a.style.removeProperty('display');
      q.addEventListener('click', () => {
        const isOpen = item.classList.toggle('is-open');
        if (a) {
          /* Inline-Style leeren damit CSS-Regel greift */
          a.style.removeProperty('display');
          if (!isOpen) a.style.display = 'none';
        }
      });
    });
  }

  function init() {
    bindForm();
    bindStartupToggle();
    bindConfig();
    bindRatenPills();
    bindCompareToggle();
    bindTooltips();
    bindCarousel();
    bindFloatingBar();
    bindReset();
    bindFaq();
    bindSummaryToggle();
    bindBarDetailsLink();
    updateStep1Pill();
    renderPackageCards();
    updateSummary();
    isFirstRender = false; /* ab jetzt laufen Animationen normal */
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
