  /* =========================================================
     V17 — KONFIGURATION & PREIS-PLATZHALTER
     ⚠️  Alle hier markierten Werte sind PLATZHALTER.
         Bitte mit echten Zahlen / Logik ersetzen.
     ========================================================= */

  const PACKAGES = {
    einzelunternehmer: {
      label: 'Einzelunternehmer',
      packages: [
        {
          id: 'selbststarter',
          name: 'Selbststarter',
          price: 149,
          desc: 'Du machst die Buchhaltung, wir übernehmen den Jahresabschluss.',
          features: [
            'EÜR & Jahresabschluss',
            'Alle betrieblichen Steuern',
            'Elektronische Übermittlung',
            '100 € Beratungsguthaben p.a.'
          ]
        },
        {
          id: 'sorglos',
          name: 'Sorglos',
          price: 199,
          desc: 'Wir prüfen Deine Buchhaltung monatlich und übernehmen alle Erklärungen.',
          featured: true,
          features: [
            'Alles aus Selbststarter',
            'Monatliche Plausibilitätsprüfung',
            'USt-Voranmeldung & ZM',
            '200 € Beratungsguthaben p.a.'
          ]
        },
        {
          id: 'vollservice',
          name: 'Vollservice',
          price: 269,
          desc: 'Kompletter Buchhaltungs-Review. Du kümmerst Dich um nichts mehr.',
          features: [
            'Alles aus Sorglos',
            'Voller Buchhaltungs-Review',
            'Bescheidprüfung',
            '400 € Beratungsguthaben p.a.'
          ]
        }
      ]
    },
    personengesellschaft: {
      label: 'Personengesellschaft',
      packages: [
        { id: 'selbststarter', name: 'Selbststarter', price: 199,
          desc: 'Du machst die Buchhaltung, wir übernehmen den Jahresabschluss.',
          features: ['Bilanz & Jahresabschluss','Alle betrieblichen Steuern','Gesonderte Feststellung','100 € Beratungsguthaben p.a.'] },
        { id: 'sorglos', name: 'Sorglos', price: 249, featured: true,
          desc: 'Wir prüfen Deine Buchhaltung monatlich und übernehmen alle Erklärungen.',
          features: ['Alles aus Selbststarter','Monatliche Plausibilitätsprüfung','USt-Voranmeldung & ZM','200 € Beratungsguthaben p.a.'] },
        { id: 'vollservice', name: 'Vollservice', price: 319,
          desc: 'Kompletter Buchhaltungs-Review. Du kümmerst Dich um nichts mehr.',
          features: ['Alles aus Sorglos','Voller Buchhaltungs-Review','Bescheidprüfung','400 € Beratungsguthaben p.a.'] }
      ]
    },
    juristische: {
      label: 'Juristische Person',
      packages: [
        { id: 'selbststarter', name: 'Selbststarter', price: 249,
          desc: 'Du machst die Buchhaltung, wir übernehmen den kompletten Jahresabschluss.',
          features: ['E-Bilanz & Jahresabschluss','KSt-, Gewerbe- & USt-Erklärung','Offenlegung Bundesanzeiger','100 € Beratungsguthaben p.a.'] },
        { id: 'sorglos', name: 'Sorglos', price: 299, featured: true,
          desc: 'Wir prüfen Deine Buchhaltung monatlich und übernehmen alle Erklärungen.',
          features: ['Alles aus Selbststarter','Monatliche Plausibilitätsprüfung','USt-Voranmeldung & ZM','200 € Beratungsguthaben p.a.'] },
        { id: 'vollservice', name: 'Vollservice', price: 369,
          desc: 'Kompletter Buchhaltungs-Review. Du kümmerst Dich um nichts mehr.',
          features: ['Alles aus Sorglos','Voller Buchhaltungs-Review','Bescheidprüfung','400 € Beratungsguthaben p.a.'] }
      ]
    }
  };

  /* ── PLATZHALTER-PREISE ────────────────────────────────── */
  const HOLDINGS_PRICE   = 65;     // PLATZHALTER: Holdings-Einstiegspreis
  const ONBOARDING       = 299;    // PLATZHALTER: Onboarding-Pauschale
  const RATEN_COUNT      = 6;      // Anzahl Raten für Vormonate + Vorjahre

  // Transactions: bis TX_INCLUDED inkludiert, danach +TX_PRICE_PER_STEP € je TX_STEP
  const TX_INCLUDED      = 100;    // PLATZHALTER
  const TX_STEP          = 50;
  const TX_PRICE_PER_STEP = 5;     // PLATZHALTER
  const TX_MIN           = 0;
  const TX_MAX           = 1000;   // PLATZHALTER: Obergrenze Stepper

  // Umsatzabhängiger %-Aufschlag auf den monatlichen Paketpreis
  // (PLATZHALTER — Stufen + Prozentwerte bitte mit echten Werten ersetzen)
  const REVENUE_TIERS = [
    { value: 0,        label: 'bis 250k',  percent: 0  },
    { value: 250000,   label: '250–500k',  percent: 5  },
    { value: 500000,   label: '500k–1Mio', percent: 10 },
    { value: 1000000,  label: '1–2Mio',    percent: 15 },
    { value: 2000000,  label: '2–3Mio',    percent: 20 },
    { value: 3000000,  label: '3–4Mio',    percent: 25 },
    { value: 4000000,  label: '4–5Mio',    percent: 30 },
    { value: 5000000,  label: '>5Mio',     percent: 35 }
  ];

  function getRevenueTier(value) {
    return REVENUE_TIERS.find(t => t.value === value) || REVENUE_TIERS[0];
  }

  function revenueSurcharge(monthlyBase) {
    const tier = getRevenueTier(state.revenue);
    return monthlyBase * (tier.percent / 100);
  }

  // PrevYears Stepper — Bounds
  const PY_MIN = 0;
  const PY_MAX = 5;
  /* ─────────────────────────────────────────────────────── */

  const ACCENT_MAP = {
    indigo: '#3B3BC8',
    purple: '#C531A4',
    pink:   '#FF0670',
    teal:   '#1DB8C6',
    yellow: '#F6DF35'
  };

  const state = {
    form: 'einzelunternehmer',
    package: 'selbststarter',
    startMonth: 1,           // 1–12
    startYear: 2026,
    revenue: 0,              // chip data-value
    transactions: 100,       // multiple of 50
    prevYears: 0,            // 0–5
    accent: 'indigo',

    // displayed values for animations
    displayedMonthly: 149,
    displayedTotalMonthly: 149,
    displayedTotalRaten: 0,
    displayedOneTime: 299,
    displayedTransactionsCost: 0,
    displayedBuchhaltungCost: 0,
    displayedPreMonthsRate: 0,
    displayedPreYearsRate: 0,
    displayedTxValue: 100,
    displayedPrevYears: 0,
    displayedBarMonthly: 149,
    displayedBarOneTime: 299,

    activeStepIdx: 0
  };

  // ============= COUNT-UP ANIMATION =============
  const activeAnimations = new Map();
  const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animateValue(el, from, to, duration = 500, formatter = v => v) {
    if (!el) return;
    if (PREFERS_REDUCED_MOTION || from === to) { el.textContent = formatter(to); return; }
    const prior = activeAnimations.get(el);
    if (prior) cancelAnimationFrame(prior);
    const start = performance.now();
    const delta = to - from;
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      const value = Math.round(from + delta * eased);
      el.textContent = formatter(value);
      if (t < 1) activeAnimations.set(el, requestAnimationFrame(step));
      else activeAnimations.delete(el);
    }
    activeAnimations.set(el, requestAnimationFrame(step));
  }

  const formatInt = v => Math.round(v).toLocaleString('de-DE');
  const formatEuro = v => Math.round(v).toLocaleString('de-DE') + ' €';

  // ============= RENDER PACKAGES =============
  function renderPackages() {
    const container = document.getElementById('packageOptions');
    if (state.form === 'holdings') return; // skip for holdings
    const pkgs = PACKAGES[state.form].packages;
    if (!pkgs.find(p => p.id === state.package)) state.package = 'selbststarter';

    container.innerHTML = pkgs.map(pkg => `
      <button class="option option--pkg" role="radio" aria-pressed="${pkg.id === state.package}" data-pkg="${pkg.id}">
        ${pkg.featured ? `
          <div class="option__featured-group">
            <span class="option__featured">Empfehlung</span>
            <span class="option__featured-sub">Beliebteste Wahl bei GmbHs</span>
          </div>
        ` : ''}
        <span class="option__label">${pkg.name}</span>
        <span class="option__desc">${pkg.desc}</span>
        <div class="option__price-block">
          <span class="option__price-prefix" data-pkg-prefix="${pkg.id}">ab</span>
          <span class="option__price-value" data-pkg-price="${pkg.id}">${pkg.price}</span><span class="option__price-currency"> €</span>
          <span class="option__price-unit">/ Monat</span>
        </div>
        <hr class="option__divider" />
        <ul class="option__features">
          ${(pkg.features || []).map(f => `<li>${f}</li>`).join('')}
        </ul>
      </button>
    `).join('');

    container.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.option').forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        state.package = btn.dataset.pkg;
        updateSummary();
      });
    });
  }

  // ============= COMPARE-TABELLE =============
  // Feature-Matrix: zeigt welche Features welches Paket hat
  const COMPARE_FEATURES = [
    { key: 'jahresabschluss', label: 'Jahresabschluss & Bilanz', selbststarter: true, sorglos: true, vollservice: true },
    { key: 'steuern', label: 'Alle betrieblichen Steuererklärungen', selbststarter: true, sorglos: true, vollservice: true },
    { key: 'feststellung', label: 'Gesonderte Feststellung', selbststarter: true, sorglos: true, vollservice: true },
    { key: 'guthaben', label: 'Beratungsguthaben p.a.', selbststarter: '100 €', sorglos: '200 €', vollservice: '400 €' },
    { key: 'buchhaltung', label: 'Monatliche Buchhaltung', selbststarter: false, sorglos: true, vollservice: true },
    { key: 'plausi', label: 'Monatliche Plausibilitätsprüfung', selbststarter: false, sorglos: true, vollservice: true },
    { key: 'ust', label: 'USt-Voranmeldung & Zusammenfassende Meldung', selbststarter: false, sorglos: true, vollservice: true },
    { key: 'review', label: 'Voller Buchhaltungs-Review', selbststarter: false, sorglos: false, vollservice: true },
    { key: 'bescheid', label: 'Bescheidprüfung', selbststarter: false, sorglos: false, vollservice: true },
    { key: 'support', label: 'Antwortzeit auf Anfragen', selbststarter: '48h', sorglos: '24h', vollservice: '4h' },
  ];

  function renderCompareTable() {
    const container = document.getElementById('compareTable');
    if (!container) return;
    if (state.form === 'holdings') return;
    const pkgs = PACKAGES[state.form].packages;
    if (!pkgs || pkgs.length < 3) { container.innerHTML = ''; return; }

    const renderCell = (val) => {
      if (val === true) return '<span class="compare-table__check" aria-label="enthalten">✓</span>';
      if (val === false) return '<span class="compare-table__cross" aria-label="nicht enthalten">—</span>';
      return `<span class="compare-table__value">${val}</span>`;
    };

    container.innerHTML = `
      <div class="compare-table__inner">
        <div class="compare-table__head">
          <div class="compare-table__head-cell compare-table__head-cell--label">Leistungen</div>
          ${pkgs.map(pkg => `
            <div class="compare-table__head-cell ${pkg.featured ? 'is-featured' : ''}">
              <span class="compare-table__pkg-name">${pkg.name}</span>
              <span class="compare-table__pkg-price">ab ${pkg.price} €<small>/ Mo</small></span>
            </div>
          `).join('')}
        </div>
        <div class="compare-table__body">
          ${COMPARE_FEATURES.map(f => `
            <div class="compare-table__row">
              <div class="compare-table__cell compare-table__cell--label">${f.label}</div>
              <div class="compare-table__cell">${renderCell(f.selbststarter)}</div>
              <div class="compare-table__cell ${pkgs.find(p=>p.id==='sorglos')?.featured ? 'is-featured' : ''}">${renderCell(f.sorglos)}</div>
              <div class="compare-table__cell">${renderCell(f.vollservice)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Live-Update der Paketpreise basierend auf aktueller Konfig (TX + Aufschlag)
  function updatePackagePrices() {
    if (state.form === 'holdings') return;
    const pkgs = PACKAGES[state.form].packages;
    const txCost = computeTransactionsCost();
    const tier = getRevenueTier(state.revenue);
    // "Konfiguriert" = TX über Standard ODER Aufschlag aktiv
    const isConfigured = (txCost > 0) || (tier.percent > 0);

    pkgs.forEach(pkg => {
      const surcharge = pkg.price * (tier.percent / 100);
      const total = pkg.price + txCost + surcharge;
      const priceEl = document.querySelector(`[data-pkg-price="${pkg.id}"]`);
      const prefixEl = document.querySelector(`[data-pkg-prefix="${pkg.id}"]`);
      if (priceEl) {
        const stateKey = `displayedPkg_${pkg.id}`;
        const from = state[stateKey] || pkg.price;
        animateValue(priceEl, from, total, 380, formatInt);
        state[stateKey] = total;
      }
      // "ab" verschwindet wenn Konfig aktiv → klarer Live-Kontext
      if (prefixEl) {
        prefixEl.textContent = isConfigured ? '' : 'ab';
        prefixEl.classList.toggle('is-empty', isConfigured);
      }
    });
  }

  function currentPackage() {
    if (state.form === 'holdings') return null;
    return PACKAGES[state.form].packages.find(p => p.id === state.package);
  }

  // ============= COMPUTED VALUES =============
  function computeVormonate() {
    // Vormonate = Anzahl Monate in dem Vertragsjahr VOR dem Startmonat
    return Math.max(0, state.startMonth - 1);
  }

  function computeTransactionsCost() {
    if (state.transactions <= TX_INCLUDED) return 0;
    return ((state.transactions - TX_INCLUDED) / TX_STEP) * TX_PRICE_PER_STEP;
  }

  // ============= SUMMARY UPDATE =============
  // Trigger pulse animation on Live-Indicators on every actual update
  function pulseLiveIndicators() {
    const els = document.querySelectorAll('.summary__live, .floating-bar__live');
    els.forEach(el => {
      el.classList.remove('is-pulsing');
      // Force reflow to restart animation
      void el.offsetWidth;
      el.classList.add('is-pulsing');
    });
  }
  function updateSummary() {
    if (state.form === 'holdings') {
      document.getElementById('step-holdings').hidden = false;
      renderHoldings();
      pulseLiveIndicators();
      return;
    }

    // Reset Holdings styling
    document.getElementById('step-holdings').hidden = true;
    document.getElementById('summary').classList.remove('is-holdings');
    document.querySelector('.calc-steps').classList.remove('is-holdings');
    document.getElementById('floatingBar').classList.remove('is-holdings');
    document.getElementById('sumPriceAsterisk').hidden = true;

    const pkg = currentPackage();
    const monthly  = pkg.price;
    const txCost   = computeTransactionsCost();
    const surcharge = revenueSurcharge(monthly);
    const surchargeTier = getRevenueTier(state.revenue);
    const totalMonthly = monthly + txCost + surcharge;

    const vormonate = computeVormonate();
    const vorjahre  = state.prevYears;

    // Vormonate-Kosten = Anzahl × Paketpreis (auf 6 Raten verteilt)
    // Vorjahre-Kosten   = Anzahl × Paketpreis × 12 (auf 6 Raten verteilt)
    const vormonateTotal = vormonate * monthly;
    const vorjahreTotal  = vorjahre  * monthly * 12;
    const vormonateRate  = vormonateTotal / RATEN_COUNT;
    const vorjahreRate   = vorjahreTotal  / RATEN_COUNT;
    const totalRaten     = vormonateRate + vorjahreRate;

    const oneTimeTotal = ONBOARDING;

    const pkgLine = `${pkg.name} · ${PACKAGES[state.form].label}`;

    // ── Hauptpreis (= Monatlich gesamt: Grundpreis + TX + Aufschlag)
    animateValue(document.getElementById('sumMonthly'), state.displayedMonthly, totalMonthly, 500, formatInt);
    state.displayedMonthly = totalMonthly;
    document.getElementById('sumPkgLine').textContent = pkgLine;

    // ── Items in der konsolidierten Liste
    animateValue(document.getElementById('sumTransactions'), state.displayedTransactionsCost, txCost, 380, formatEuro);
    state.displayedTransactionsCost = txCost;
    document.getElementById('sumLineTransactions').hidden = (txCost === 0);

    animateValue(document.getElementById('sumBuchhaltung'), state.displayedBuchhaltungCost, surcharge, 380, formatEuro);
    state.displayedBuchhaltungCost = surcharge;
    document.getElementById('sumSurchargePct').textContent = `(${surchargeTier.percent}%)`;
    document.getElementById('sumLineBuchhaltung').hidden = (surcharge === 0);

    document.getElementById('sumPreMonthsCount').textContent = `(${vormonate})`;
    document.getElementById('sumPreMonths').textContent =
      vormonate > 0 ? `6 × ${formatEuro(vormonateRate)}` : '0 €';
    document.getElementById('sumLineVormonate').hidden = (vormonate === 0);

    document.getElementById('sumPreYearsCount').textContent = `(${vorjahre})`;
    document.getElementById('sumPreYears').textContent =
      vorjahre > 0 ? `6 × ${formatEuro(vorjahreRate)}` : '0 €';
    document.getElementById('sumLineVorjahre').hidden = (vorjahre === 0);

    // ── Floating Bar
    animateValue(document.getElementById('barMonthly'), state.displayedBarMonthly, totalMonthly, 400, formatInt);
    state.displayedBarMonthly = totalMonthly;

    // ── Tooltip-Beispiele live updaten
    updateTooltipExamples(monthly, surcharge, surchargeTier, vorjahre, vormonate);

    // ── Live-Preise auf den Paket-Karten updaten
    updatePackagePrices();

    // ── Steuerberater-Vergleich + Setup-Timeline updaten
    if (typeof updateCompare === 'function') updateCompare(totalMonthly);
    if (typeof updateSetupTimeline === 'function') updateSetupTimeline();

    // ── Sublink "Warum Ratenzahlung" nur sichtbar wenn Ratenzahlung > 0
    const ratenLink = document.getElementById('sumRatenLink');
    if (ratenLink) ratenLink.hidden = (totalRaten || 0) === 0;

    // ── Totals-Compact: »Heute fällig« (Onboarding + erster Monat inkl. Raten)
    //    + »Ab nächstem Monat« (totalMonthly + Raten für Monate 2-6, dann nur totalMonthly)
    const monthlyWithRaten = totalMonthly + (totalRaten || 0);
    const dueTodayValue = oneTimeTotal + monthlyWithRaten;
    const dueTodayEl = document.getElementById('sumDueToday');
    if (dueTodayEl) dueTodayEl.textContent = formatEuro(dueTodayValue);

    const recurringEl = document.getElementById('sumRecurring');
    if (recurringEl) {
      recurringEl.innerHTML = `${formatEuro(monthlyWithRaten)}<small>/Mo</small>`;
    }
    const recurringCaption = document.getElementById('sumRecurringCaption');
    if (recurringCaption) recurringCaption.hidden = !totalRaten || totalRaten === 0;

    // ── Live-Indicator pulse NUR wenn sich der Preis tatsächlich geändert hat
    //    (nicht bei No-Op-Klicks z.B. Stepper auf Min-Wert)
    const priceChanged =
      state.lastDueToday !== dueTodayValue ||
      state.lastRecurring !== monthlyWithRaten ||
      state.lastTotalMonthly !== totalMonthly;
    if (priceChanged) {
      pulseLiveIndicators();
    }
    state.lastDueToday = dueTodayValue;
    state.lastRecurring = monthlyWithRaten;
    state.lastTotalMonthly = totalMonthly;
  }

  function renderHoldings() {
    document.getElementById('summary').classList.add('is-holdings');
    document.querySelector('.calc-steps').classList.add('is-holdings');
    document.getElementById('floatingBar').classList.add('is-holdings');

    document.getElementById('sumMonthly').textContent = HOLDINGS_PRICE;
    document.getElementById('sumPkgLine').textContent = 'Holdings · individuelle Lösung';
    document.getElementById('sumPriceAsterisk').hidden = false;

    // Floating-Bar im Holdings-Mode: das Label kommt komplett aus CSS (is-holdings ::before),
    // wir setzen barMonthly auf einen Default-Fallback-Wert (wird visuell durch CSS verborgen)
    const barMonthlyEl = document.getElementById('barMonthly');
    if (barMonthlyEl) barMonthlyEl.textContent = HOLDINGS_PRICE;

    state.displayedMonthly       = HOLDINGS_PRICE;
    state.displayedBarMonthly    = HOLDINGS_PRICE;
  }

  // ============= ACCENT =============
  function setAccent(accent) {
    state.accent = accent;
    document.documentElement.style.setProperty('--accent', ACCENT_MAP[accent]);
  }

  // ============= FORM SELECTION =============
  document.querySelectorAll('[data-form]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('aria-pressed') === 'true') return;
      document.querySelectorAll('[data-form]').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      state.form = btn.dataset.form;
      setAccent(btn.dataset.accent);
      if (state.form !== 'holdings') {
        renderPackages();
      }
      // Step-1 collapsen + Pille anzeigen
      const label = btn.querySelector('.option__label').textContent.trim();
      collapseStep(1, label);
      updateSummary();
    });
  });

  // ============= STEP COLLAPSE / EXPAND =============
  function collapseStep(stepNum, label) {
    const stepEl = document.getElementById(`step-${stepNum}`);
    const pillEl = document.getElementById(`step${stepNum}Pill`);
    const textEl = document.getElementById(`step${stepNum}PillText`);
    if (!stepEl || !pillEl) return;
    stepEl.classList.add('is-collapsed');
    textEl.textContent = label;
    pillEl.hidden = false;
  }
  function expandStep(stepNum) {
    const stepEl = document.getElementById(`step-${stepNum}`);
    const pillEl = document.getElementById(`step${stepNum}Pill`);
    if (!stepEl || !pillEl) return;
    stepEl.classList.remove('is-collapsed');
    pillEl.hidden = true;
  }
  document.getElementById('step1PillClose').addEventListener('click', () => expandStep(1));

  // ============= VERTRAGSBEGINN + REVENUE: Custom Dropdowns =============
  function initDropdown(ddEl) {
    const trigger = ddEl.querySelector('.dd__trigger');
    const valueEl = ddEl.querySelector('[data-dd-value]');
    const list    = ddEl.querySelector('.dd__list');
    const items   = Array.from(ddEl.querySelectorAll('.dd__item'));
    const ddType  = ddEl.dataset.dd;

    function open() {
      // Close any other open dropdowns first
      document.querySelectorAll('.dd.is-open').forEach(other => {
        if (other !== ddEl) {
          other.classList.remove('is-open');
          other.querySelector('.dd__trigger').setAttribute('aria-expanded', 'false');
        }
      });
      ddEl.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function close() {
      ddEl.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function toggle() {
      if (ddEl.classList.contains('is-open')) close();
      else open();
    }

    trigger.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });

    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        items.forEach(i => i.classList.remove('is-selected'));
        item.classList.add('is-selected');
        const text = item.querySelector('.dd__item-text').textContent;
        valueEl.textContent = text;
        const value = parseInt(item.dataset.value, 10);
        if (ddType === 'month') state.startMonth = value;
        else if (ddType === 'year') state.startYear = value;
        else if (ddType === 'revenue') state.revenue = value;
        updateSummary();
        close();
        trigger.focus();
      });
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        open();
        const sel = ddEl.querySelector('.dd__item.is-selected') || items[0];
        if (sel) sel.focus();
      } else if (e.key === 'Escape' && ddEl.classList.contains('is-open')) {
        e.preventDefault();
        close();
      }
    });

    list.addEventListener('keydown', (e) => {
      const focused = document.activeElement;
      const idx = items.indexOf(focused);
      if (e.key === 'Escape') {
        e.preventDefault(); close(); trigger.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = items[Math.min(idx + 1, items.length - 1)];
        if (next) next.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = items[Math.max(idx - 1, 0)];
        if (prev) prev.focus();
      } else if (e.key === 'Home') {
        e.preventDefault(); items[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault(); items[items.length - 1].focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (focused && items.includes(focused)) focused.click();
      }
    });
  }

  document.querySelectorAll('.dd').forEach(initDropdown);

  // Click outside to close any open dropdown
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.dd.is-open').forEach(dd => {
      if (!dd.contains(e.target)) {
        dd.classList.remove('is-open');
        dd.querySelector('.dd__trigger').setAttribute('aria-expanded', 'false');
      }
    });
  });

  // ============= PREV YEARS STEPPER (Step 6) =============
  const pyValueEl = document.getElementById('pyValue');
  const pyDecBtn  = document.getElementById('pyDecrement');
  const pyIncBtn  = document.getElementById('pyIncrement');

  function updatePyButtons() {
    if (!pyDecBtn || !pyIncBtn) return;
    pyDecBtn.disabled = state.prevYears <= PY_MIN;
    pyIncBtn.disabled = state.prevYears >= PY_MAX;
  }

  function setPrevYears(value) {
    const clamped = Math.max(PY_MIN, Math.min(PY_MAX, value));
    if (clamped === state.prevYears) return;
    if (pyValueEl) animateValue(pyValueEl, state.displayedPrevYears, clamped, 240);
    state.displayedPrevYears = clamped;
    state.prevYears = clamped;
    updatePyButtons();
    updateSummary();
  }

  if (pyDecBtn) pyDecBtn.addEventListener('click', () => setPrevYears(state.prevYears - 1));
  if (pyIncBtn) pyIncBtn.addEventListener('click', () => setPrevYears(state.prevYears + 1));

  // ============= TRANSACTIONS STEPPER (Step 5) =============
  const txValueEl = document.getElementById('txValue');
  const txDecBtn  = document.getElementById('txDecrement');
  const txIncBtn  = document.getElementById('txIncrement');

  function updateTxButtons() {
    txDecBtn.disabled = state.transactions <= TX_MIN;
    txIncBtn.disabled = state.transactions >= TX_MAX;
  }

  function setTransactions(value) {
    const clamped = Math.max(TX_MIN, Math.min(TX_MAX, value));
    if (clamped === state.transactions) return;
    animateValue(txValueEl, state.displayedTxValue, clamped, 280);
    state.displayedTxValue = clamped;
    state.transactions = clamped;
    updateTxButtons();
    updateSummary();
  }

  txDecBtn.addEventListener('click', () => setTransactions(state.transactions - TX_STEP));
  txIncBtn.addEventListener('click', () => setTransactions(state.transactions + TX_STEP));

  // ============= KEYBOARD NAV (radio groups) =============
  document.querySelectorAll('[role="radiogroup"]').forEach(group => {
    group.addEventListener('keydown', (e) => {
      const buttons = Array.from(group.querySelectorAll('[role="radio"]'));
      const focused = document.activeElement;
      const idx = buttons.indexOf(focused);
      if (idx === -1) return;
      let nextIdx = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % buttons.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (idx - 1 + buttons.length) % buttons.length;
      if (nextIdx !== null) {
        e.preventDefault();
        buttons[nextIdx].focus();
        buttons[nextIdx].click();
      }
    });
  });

  // ============= SCROLL REVEAL (MOBILE) =============
  const stepObserver = new IntersectionObserver(
    (entries) => entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-revealed');
    }),
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('.step').forEach(el => stepObserver.observe(el));

  // ============= APPLE-MAX STEP NAV =============
  const stepNav = document.getElementById('stepNav');
  const stepNavSlider = document.getElementById('stepNavSlider');
  const stepDots = document.querySelectorAll('.step-nav__num-btn');
  const hero = document.querySelector('.hero');
  const steps = Array.from(document.querySelectorAll('.step'));

  const heroObserver = new IntersectionObserver(
    ([entry]) => stepNav.classList.toggle('is-visible', !entry.isIntersecting),
    { threshold: 0.1 }
  );
  heroObserver.observe(hero);

  function applyActiveStep(idx) {
    if (idx === state.activeStepIdx) return;
    state.activeStepIdx = idx;
    stepNavSlider.style.transform = `translateY(-${idx * 1.4}rem)`;
    stepDots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === idx);
      dot.classList.toggle('is-done', i < idx);
    });
  }

  function detectActiveStep() {
    const viewportAnchor = window.innerHeight * 0.32;
    let activeIdx = 0;
    steps.forEach((step, i) => {
      const rect = step.getBoundingClientRect();
      if (rect.top <= viewportAnchor) activeIdx = i;
    });
    applyActiveStep(activeIdx);
  }

  let scrollRaf = null;
  window.addEventListener('scroll', () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      detectActiveStep();
      scrollRaf = null;
    });
  }, { passive: true });

  stepDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.stepTarget);
      if (!target) return;
      const topOffset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - topOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ============= SMART FLOATING BAR =============
  const floatingBar = document.getElementById('floatingBar');
  const summary = document.getElementById('summary');

  requestAnimationFrame(() => {
    setTimeout(() => floatingBar.classList.add('is-ready'), 450);
  });

  const summaryObserver = new IntersectionObserver(
    ([entry]) => floatingBar.classList.toggle('is-hidden', entry.intersectionRatio >= 0.3),
    { threshold: [0, 0.15, 0.3, 0.5, 1] }
  );
  summaryObserver.observe(summary);

  // ============= INTERACTIVE TOOLTIPS =============
  // Click-toggle behavior, schließt sich beim Outside-Click oder ESC
  function setupTooltips() {
    const triggers = document.querySelectorAll('.tooltip-trigger');
    const isMobile = () => window.innerWidth <= 760;
    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = trigger.classList.contains('is-open');
        // Andere Tooltips schließen
        triggers.forEach(t => {
          t.classList.remove('is-open');
          t.setAttribute('aria-expanded', 'false');
          const b = t.nextElementSibling;
          if (b && b.classList.contains('tooltip-bubble')) {
            b.style.removeProperty('top');
            b.style.removeProperty('bottom');
          }
        });
        if (!wasOpen) {
          trigger.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          // Auf Mobile: Bubble dynamisch positionieren — direkt unter Trigger,
          // wenn das nicht passt (zu nah am Bottom), dann darüber
          if (isMobile()) {
            const bubble = trigger.nextElementSibling;
            if (bubble && bubble.classList.contains('tooltip-bubble')) {
              const tr = trigger.getBoundingClientRect();
              const vh = window.innerHeight;
              // Bubble height schätzen (max 280px)
              const estH = 200;
              if (tr.bottom + estH + 16 < vh) {
                // Genug Platz unten → Bubble unter Trigger
                bubble.style.top = `${tr.bottom + 8}px`;
                bubble.style.bottom = 'auto';
              } else {
                // Wenig Platz → Bubble über Trigger
                bubble.style.bottom = `${vh - tr.top + 8}px`;
                bubble.style.top = 'auto';
              }
            }
          } else {
            // Desktop: Smart-Position — wenn Bubble rechts aus Viewport rausragt,
            // dann nach links spiegeln (--left Variante anwenden).
            const bubble = trigger.nextElementSibling;
            if (bubble && bubble.classList.contains('tooltip-bubble')) {
              // Reset auf default-anchor, dann messen
              bubble.classList.remove('tooltip-bubble--left');
              // RAF damit Browser layout neu berechnet bevor wir messen
              requestAnimationFrame(() => {
                const rect = bubble.getBoundingClientRect();
                const vw = window.innerWidth;
                const padding = 16;
                if (rect.right > vw - padding) {
                  bubble.classList.add('tooltip-bubble--left');
                }
              });
            }
          }
        }
      });
    });
    // Outside click → close all
    document.addEventListener('click', () => {
      triggers.forEach(t => {
        t.classList.remove('is-open');
        t.setAttribute('aria-expanded', 'false');
        const b = t.nextElementSibling;
        if (b && b.classList.contains('tooltip-bubble')) {
          b.style.removeProperty('top');
          b.style.removeProperty('bottom');
        }
      });
    });
    // ESC closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        triggers.forEach(t => {
          t.classList.remove('is-open');
          t.setAttribute('aria-expanded', 'false');
          const b = t.nextElementSibling;
          if (b && b.classList.contains('tooltip-bubble')) {
            b.style.removeProperty('top');
            b.style.removeProperty('bottom');
          }
        });
      }
    });
  }

  // Updated bei jedem updateSummary-Call: Beispielzahlen für Tooltips
  function updateTooltipExamples(monthly, surcharge, surchargeTier, vorjahre, vormonate) {
    // Aufschlag-Beispiel: konkret was der gewählte Tier in € bedeutet
    const exRevenueEl = document.getElementById('tipRevenueExample');
    if (exRevenueEl) {
      if (surcharge > 0) {
        // Mittelwert des aktuellen Tiers nehmen für plastisches Beispiel
        const tierMidpoint = surchargeTier.midpoint || surchargeTier.from + 100000;
        const tierLabel = surchargeTier.label || `${(tierMidpoint/1000).toFixed(0)}k`;
        exRevenueEl.innerHTML = `Bei ${tierLabel} Umsatz wären das <em>+${formatEuro(surcharge)}</em> pro Monat.`;
      } else {
        exRevenueEl.innerHTML = `Bis 250k Umsatz: <em>kein Aufschlag</em>. Du zahlst nur den Paketpreis.`;
      }
    }
    // Vorjahre-Beispiel
    const exPrevEl = document.getElementById('tipPrevYearsExample');
    if (exPrevEl) {
      if (vorjahre > 0) {
        const total = vorjahre * monthly * 12;
        const perRate = total / 6;
        exPrevEl.innerHTML = `${vorjahre} Vorjahr${vorjahre === 1 ? '' : 'e'} × 12 Monate × ${formatEuro(monthly)} = ${formatEuro(total)} → <em>6 × ${formatEuro(perRate)}/Monat</em>`;
      } else {
        exPrevEl.innerHTML = `Aktuell <em>keine</em> Vorjahre — Du startest mit einer sauberen Akte.`;
      }
    }
    // Vertragsbeginn-Beispiel: dynamisch nach gewähltem Monat/Jahr
    const exContractEl = document.getElementById('tipContractStartExample');
    if (exContractEl) {
      const months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
      const m = state.startMonth - 1;
      if (m === 0) {
        exContractEl.innerHTML = `Bei Start im <em>Januar</em> entstehen keine Vormonate — Du beginnst sauber mit dem neuen Geschäftsjahr.`;
      } else {
        const preMonths = m;
        const preMonthsTotal = preMonths * monthly;
        const perRate = preMonthsTotal / 6;
        exContractEl.innerHTML = `Bei Start im <em>${months[m]} ${state.startYear}</em> buchen wir die Monate Januar bis ${months[m-1]} nach — verteilt auf <em>6 × ${formatEuro(perRate)}/Monat</em>.`;
      }
    }
    // Transaktionen-Beispiel: konkrete Zusatzkosten
    const exTxEl = document.getElementById('tipTransactionsExample');
    if (exTxEl) {
      const tx = state.transactions || 100;
      if (tx <= 100) {
        exTxEl.innerHTML = `Bis 100 Transaktionen: <em>im Paket inkludiert</em>. Erst ab 101 Transaktionen wirken die +5 €-Schritte.`;
      } else {
        const txCost = Math.ceil((tx - 100) / 50) * 5;
        exTxEl.innerHTML = `Bei ${tx} Transaktionen kommen <em>+${formatEuro(txCost)}</em> pro Monat dazu (${(tx - 100) / 50} Schritt${(tx - 100) / 50 === 1 ? '' : 'e'} à 5 €).`;
      }
    }
  }

  setupTooltips();

  // ============= STEUERBERATER-VERGLEICH (DStG-Tabelle Approximation) =============
  // Klassischer Steuerberater nimmt Honorar nach DStG, das skaliert mit Umsatz.
  // Wir approximieren: ca. das 1.55-fache unseres Vollservice-Preises bei gleichem Umsatz-Tier.
  function updateCompare(totalMonthly) {
    const compareEl = document.getElementById('sumCompareValue');
    const savingPctEl = document.getElementById('sumSavingPercent');
    const savingAmtEl = document.getElementById('sumSavingAmount');
    if (!compareEl) return;
    const STB_MULTIPLIER = 1.55;
    const stbCost = Math.round(totalMonthly * STB_MULTIPLIER);
    const saving = stbCost - totalMonthly;
    const savingPct = Math.round((saving / stbCost) * 100);
    compareEl.textContent = `~ ${formatEuro(stbCost)}/Mo`;
    if (savingPctEl) savingPctEl.textContent = `${savingPct} %`;
    if (savingAmtEl) savingAmtEl.textContent = `${formatEuro(saving)}`;
  }

  // ============= SETUP-TIMELINE LIVE-UPDATE =============
  // "Ab April 2026" updated sich basierend auf state.startMonth + state.startYear
  const MONTH_NAMES = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  function updateSetupTimeline() {
    const labelEl = document.getElementById('setupStartLabel');
    if (!labelEl) return;
    const monthName = MONTH_NAMES[(state.startMonth || 1) - 1];
    const year = state.startYear || 2026;
    labelEl.textContent = `Ab ${monthName} ${year} · Erste Buchhaltung`;
  }

  // ============= PKG-SWITCH CROSSFADE =============
  // Beim Form-Wechsel renderPackages() mit fade-out/fade-in
  const optionsContainer = document.getElementById('packageOptions');
  function renderPackagesWithFade() {
    if (state.form === 'holdings' || !optionsContainer) {
      renderPackages();
      return;
    }
    optionsContainer.dataset.switching = 'true';
    setTimeout(() => {
      renderPackages();
      requestAnimationFrame(() => {
        optionsContainer.dataset.switching = 'false';
      });
    }, 180);
  }
  // Override original Form-Click: trigger fade-pkg-render statt direkt renderPackages
  document.querySelectorAll('[data-form]').forEach(btn => {
    btn.addEventListener('click', () => {
      // Original handler hat schon state.form etc. gesetzt — wir hooken renderPackages mit fade
      if (state.form !== 'holdings' && optionsContainer) {
        optionsContainer.dataset.switching = 'true';
        setTimeout(() => {
          requestAnimationFrame(() => {
            optionsContainer.dataset.switching = 'false';
          });
        }, 220);
      }
      // Compare-Table neu rendern wenn offen
      if (compareToggle && compareToggle.getAttribute('aria-pressed') === 'true') {
        renderCompareTable();
      }
    });
  });

  // ============= RESET-BUTTON =============
  document.getElementById('resetCalcBtn')?.addEventListener('click', () => {
    state.startMonth = 1;
    state.startYear = 2026;
    state.revenue = 0;
    state.transactions = 100;
    state.prevYears = 0;
    state.form = 'einzelunternehmer';
    state.package = 'selbststarter';
    state.accent = 'indigo';

    // UI-Sync
    document.querySelectorAll('[data-form]').forEach(b =>
      b.setAttribute('aria-pressed', b.dataset.form === 'einzelunternehmer' ? 'true' : 'false'));
    setAccent('purple');
    expandStep(1);
    // Dropdowns auf Default
    const monthDD = document.querySelector('[data-dd="month"] [data-dd-value]');
    if (monthDD) monthDD.textContent = 'Januar';
    const yearDD = document.querySelector('[data-dd="year"] [data-dd-value]');
    if (yearDD) yearDD.textContent = '2026';
    const revDD = document.querySelector('[data-dd="revenue"] [data-dd-value]');
    if (revDD) revDD.textContent = 'bis 250k (0%)';
    document.querySelectorAll('[data-dd="month"] .dd__item, [data-dd="year"] .dd__item, [data-dd="revenue"] .dd__item').forEach(el => el.classList.remove('is-selected'));
    const m1 = document.querySelector('[data-dd="month"] [data-value="1"]'); if (m1) m1.classList.add('is-selected');
    const y1 = document.querySelector('[data-dd="year"] [data-value="2026"]'); if (y1) y1.classList.add('is-selected');
    const r1 = document.querySelector('[data-dd="revenue"] [data-value="0"]'); if (r1) r1.classList.add('is-selected');

    renderPackages();
    updateTxButtons();
    updatePyButtons();
    updateSummary();
  });

  // ============= E-MAIL MODAL =============
  const emailModal = document.getElementById('emailModal');
  const emailModalBackdrop = document.getElementById('emailModalBackdrop');
  const emailModalClose = document.getElementById('emailModalClose');
  const emailCalcBtn = document.getElementById('emailCalcBtn');
  const emailForm = document.getElementById('emailModalForm');
  const emailInput = document.getElementById('emailModalInput');
  const emailConsent = document.getElementById('emailModalConsent');
  const emailSubmit = document.getElementById('emailModalSubmit');
  const emailSuccess = document.getElementById('emailModalSuccess');

  function openEmailModal() {
    if (!emailModal) return;
    // Snapshot-Vorschau befüllen
    const isHoldings = state.form === 'holdings';
    if (isHoldings) {
      document.getElementById('emailPreviewPkg').textContent = 'Holdings · individuelle Lösung';
      document.getElementById('emailPreviewMonthly').textContent = `ab ${HOLDINGS_PRICE}`;
      document.getElementById('emailPreviewOnetime').textContent = '–';
    } else {
      document.getElementById('emailPreviewPkg').textContent = document.getElementById('sumPkgLine').textContent;
      document.getElementById('emailPreviewMonthly').textContent = document.getElementById('sumMonthly').textContent;
      document.getElementById('emailPreviewOnetime').textContent = '299';
    }
    // Reset state
    emailForm.hidden = false;
    emailSuccess.hidden = true;
    emailInput.value = '';
    emailConsent.checked = false;
    emailModal.hidden = false;
    setTimeout(() => emailInput.focus(), 100);
  }
  function closeEmailModal() {
    if (!emailModal) return;
    emailModal.hidden = true;
  }
  emailCalcBtn?.addEventListener('click', openEmailModal);
  emailModalBackdrop?.addEventListener('click', closeEmailModal);
  emailModalClose?.addEventListener('click', closeEmailModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !emailModal.hidden) closeEmailModal();
  });
  emailForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!emailInput.value || !emailConsent.checked) return;
    // Hier würde echter Mail-Send-Endpoint hin (z.B. fetch zu /api/send-snapshot)
    // Aktuell: Simulation
    emailSubmit.disabled = true;
    emailSubmit.querySelector('.email-modal__submit-label').textContent = 'Wird gesendet...';
    setTimeout(() => {
      emailForm.hidden = true;
      emailSuccess.hidden = false;
      document.getElementById('emailSentTo').textContent = emailInput.value;
      emailSubmit.disabled = false;
      emailSubmit.querySelector('.email-modal__submit-label').textContent = 'Kalkulation senden';
    }, 1100);
  });

  // updateCompare + updateSetupTimeline beim updateSummary triggern
  // (Wir hooken über ein wrapper Pattern — lass updateSummary normal laufen, dann ergänzen)
  const _updateSummaryOriginal = updateSummary;
  // Hook-Pattern: bei jedem updateSummary auch Compare + Timeline updaten
  // (geht einfacher: Werte aus DOM lesen nach updateSummary läuft)
  // → Inline ist schon im updateSummary, also separater Call hier nach den fertigen Updates
  // — der erste init-Call macht das richtig

  // Skeleton-Removal nach Init
  function removeSummarySkeleton() {
    const sum = document.getElementById('summary');
    if (sum) sum.removeAttribute('data-loading');
  }

  // ============= COMPARE-TABLE TOGGLE =============
  const compareToggle = document.getElementById('compareToggle');
  const compareTable = document.getElementById('compareTable');
  if (compareToggle && compareTable) {
    compareToggle.addEventListener('click', () => {
      const isOpen = compareToggle.getAttribute('aria-pressed') === 'true';
      compareToggle.setAttribute('aria-pressed', isOpen ? 'false' : 'true');
      const label = compareToggle.querySelector('.compare-toggle__label');
      if (label) label.textContent = isOpen ? 'Pakete vergleichen' : 'Vergleich schließen';
      if (isOpen) {
        compareTable.hidden = true;
      } else {
        renderCompareTable();
        compareTable.hidden = false;
        // Smooth scroll-into-view
        setTimeout(() => compareTable.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
      }
    });
  }

  // ============= SUMMARY MOBILE-COLLAPSE TOGGLE =============
  const summaryToggle = document.getElementById('summaryToggle');
  const summaryEl = document.getElementById('summary');
  if (summaryToggle && summaryEl) {
    // Initial: auf Mobile collapsed
    if (window.innerWidth <= 1000) {
      summaryEl.dataset.mobileCollapsed = 'true';
      summaryToggle.setAttribute('aria-expanded', 'false');
    }
    summaryToggle.addEventListener('click', () => {
      const isCollapsed = summaryEl.dataset.mobileCollapsed === 'true';
      summaryEl.dataset.mobileCollapsed = isCollapsed ? 'false' : 'true';
      summaryToggle.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
      const label = document.getElementById('summaryToggleLabel');
      if (label) label.textContent = isCollapsed ? 'Details schließen' : 'Details anzeigen';
    });
    // Resize-Handler: bei Wechsel zu Desktop collapsed-state entfernen
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1000) {
        summaryEl.removeAttribute('data-mobile-collapsed');
      } else if (!summaryEl.dataset.mobileCollapsed) {
        summaryEl.dataset.mobileCollapsed = 'true';
      }
    });
  }

  // ============= FLOATING-BAR DETAILS-LINK — scrollt zur Sidebar + expandiert sie =============
  const barDetailsLink = document.getElementById('barDetailsLink');
  if (barDetailsLink && summaryEl) {
    barDetailsLink.addEventListener('click', () => {
      // Auf Mobile: Sidebar erst expandieren, dann smooth scrollen
      if (window.innerWidth <= 1000 && summaryEl.dataset.mobileCollapsed === 'true') {
        summaryEl.dataset.mobileCollapsed = 'false';
        summaryToggle?.setAttribute('aria-expanded', 'true');
        const label = document.getElementById('summaryToggleLabel');
        if (label) label.textContent = 'Details schließen';
      }
      // Smooth scroll zur Sidebar mit Offset für die Floating-Bar
      const offset = 80;  // Pixel über der Sidebar
      const targetY = summaryEl.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  }

  // ============= (2) STICKY DESKTOP NAV bei Long-Scroll =============
  // (5) Sidebar-Sticky-Verhalten: Wenn calc-grid (mit Sidebar) komplett raus ist → sticky-nav zeigen
  const stickyNav = document.getElementById('stickyNav');
  const stickyNavPkg = document.getElementById('stickyNavPkg');
  const stickyNavPrice = document.getElementById('stickyNavPrice');
  const calcGridForSticky = document.querySelector('.calc-grid');
  function updateStickyNav() {
    if (!stickyNav || !calcGridForSticky) return;
    const isMobile = window.innerWidth <= 1000;
    if (isMobile) {
      stickyNav.classList.remove('is-visible');
      return;
    }
    // calc-grid bottom < viewport mitte (also calc-grid-Bereich verlassen) → sticky an
    const gridRect = calcGridForSticky.getBoundingClientRect();
    const viewportMid = window.innerHeight / 2;
    const shouldShow = gridRect.bottom < viewportMid;
    stickyNav.classList.toggle('is-visible', shouldShow);
    // Werte sync
    if (shouldShow) {
      const pkg = document.getElementById('sumPkgLine')?.textContent;
      const price = document.getElementById('sumMonthly')?.textContent;
      if (pkg && stickyNavPkg) stickyNavPkg.textContent = pkg;
      if (price && stickyNavPrice) stickyNavPrice.textContent = `${price} €`;
    }
  }
  window.addEventListener('scroll', updateStickyNav, { passive: true });
  window.addEventListener('resize', updateStickyNav, { passive: true });

  // ============= (3) DRAG-TO-FILL / LONG-PRESS Stepper-Inputs =============
  function attachLongPress(btn, action) {
    if (!btn) return;
    let timer = null;
    let intervalId = null;
    let speed = 220;  // Initial speed (ms)
    const minSpeed = 50;
    const accel = 0.85;
    function tick() {
      action();
      if (speed > minSpeed) {
        speed = Math.max(minSpeed, speed * accel);
        clearInterval(intervalId);
        intervalId = setInterval(tick, speed);
      }
    }
    const start = (e) => {
      if (e.type === 'mousedown' && e.button !== 0) return;
      action();  // first immediate
      timer = setTimeout(() => {
        intervalId = setInterval(tick, speed);
      }, 350);  // 350ms hold before continuous start
    };
    const stop = () => {
      if (timer) clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
      timer = null; intervalId = null; speed = 220;
    };
    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', stop);
    btn.addEventListener('mouseleave', stop);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); start(e); }, { passive: false });
    btn.addEventListener('touchend', stop);
    btn.addEventListener('touchcancel', stop);
  }
  // Hook auf TX + PY Stepper — die haben schon Click-Handler, wir hängen nur Long-Press dazu
  // (single-click weiter funktional, hold = continuous)
  attachLongPress(document.getElementById('txIncrement'), () => {
    state.transactions = Math.min(state.transactions + 50, 9999);
    document.getElementById('txValue').value = state.transactions;
    updateSummary();
    if (typeof updateTxButtons === 'function') updateTxButtons();
  });
  attachLongPress(document.getElementById('txDecrement'), () => {
    state.transactions = Math.max(state.transactions - 50, 0);
    document.getElementById('txValue').value = state.transactions;
    updateSummary();
    if (typeof updateTxButtons === 'function') updateTxButtons();
  });
  attachLongPress(document.getElementById('pyIncrement'), () => {
    state.prevYears = Math.min(state.prevYears + 1, 7);
    document.getElementById('pyValue').value = state.prevYears;
    updateSummary();
    if (typeof updatePyButtons === 'function') updatePyButtons();
  });
  attachLongPress(document.getElementById('pyDecrement'), () => {
    state.prevYears = Math.max(state.prevYears - 1, 0);
    document.getElementById('pyValue').value = state.prevYears;
    updateSummary();
    if (typeof updatePyButtons === 'function') updatePyButtons();
  });

  // ============= (8) MOBILE CAROUSEL PAGINATION DOTS =============
  const carouselDots = document.querySelectorAll('.carousel-dot');
  const carouselContainer = document.querySelector('#step-2 .options--3');
  function updateCarouselDots() {
    if (!carouselContainer) return;
    if (window.innerWidth > 1000) return;  // nur Mobile
    const containerW = carouselContainer.offsetWidth;
    const scrollLeft = carouselContainer.scrollLeft;
    const cards = carouselContainer.querySelectorAll('.option--pkg');
    if (cards.length === 0) return;
    // Find center card
    const centerX = scrollLeft + containerW / 2;
    let activeIdx = 0;
    let minDist = Infinity;
    cards.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - centerX);
      if (dist < minDist) { minDist = dist; activeIdx = idx; }
    });
    carouselDots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === activeIdx);
    });
  }
  // Dot-Klick scrollt zum entsprechenden Paket
  carouselDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      const cards = carouselContainer?.querySelectorAll('.option--pkg');
      if (!cards || !cards[idx]) return;
      cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });
  carouselContainer?.addEventListener('scroll', updateCarouselDots, { passive: true });
  // Initial + bei Form-Wechsel
  setTimeout(updateCarouselDots, 200);
  document.querySelectorAll('[data-form]').forEach(btn => {
    btn.addEventListener('click', () => setTimeout(updateCarouselDots, 100));
  });

  // (3) Carousel Swipe-Hint — beim ersten Render kurz nach rechts wischen und zurück,
  // um dem User zu signalisieren dass es ein scrollbarer Carousel ist.
  // Nur 1× pro Session, nur wenn User noch nicht selbst gescrollt hat.
  function carouselSwipeHint() {
    if (!carouselContainer || window.innerWidth > 1000) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (sessionStorage.getItem('bsteuern_swipeHinted')) return;

    let userScrolled = false;
    const onUserScroll = () => { userScrolled = true; };
    carouselContainer.addEventListener('scroll', onUserScroll, { once: true, passive: true });

    // Erst nach 1.2s starten (damit Page-Load + Reveal-Animations fertig sind)
    setTimeout(() => {
      if (userScrolled) return;
      // Wischbewegung: 60px nach rechts (smooth) → kurze Pause → zurück
      carouselContainer.scrollTo({ left: 60, behavior: 'smooth' });
      setTimeout(() => {
        if (userScrolled) return;
        carouselContainer.scrollTo({ left: 0, behavior: 'smooth' });
        sessionStorage.setItem('bsteuern_swipeHinted', '1');
      }, 700);
    }, 1200);
  }
  carouselSwipeHint();

  // ============= (12) KONFETTI BEIM BUCHEN =============
  function fireConfetti(originX, originY) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Wenn keine Origin angegeben: Viewport-Mitte als fallback
    const x = (typeof originX === 'number') ? originX : window.innerWidth / 2;
    const y = (typeof originY === 'number') ? originY : window.innerHeight / 2;
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const colors = ['#3B3BC8', '#F6DF35', '#FF0670', '#1DB8C6', '#C531A4'];
    const pieces = [];
    const count = 80;
    for (let i = 0; i < count; i++) {
      // Spread-Winkel: Halbkreis nach oben (180°-Bogen)
      const angle = Math.PI + (Math.random() * Math.PI);  // 180° bis 360° (also nach oben)
      const speed = Math.random() * 14 + 8;
      pieces.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.45,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        opacity: 1,
      });
    }
    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, p.opacity - 0.008);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      frame++;
      if (frame < 140) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  // Hook auf alle CTAs (Sidebar-CTA, Floating-Bar-CTA, Sticky-Nav-CTA)
  const ctaSelectors = [
    '.summary__cta',
    '#barCtaBtn',
    '#stickyNavCta',
  ];
  ctaSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(cta => {
      cta.addEventListener('click', (e) => {
        e.preventDefault();
        // Konfetti aus dem Button-Center triggern
        const rect = cta.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        fireConfetti(cx, cy);
        const href = cta.getAttribute('href') || 'https://bsteuern.typeform.com/waitinglist';
        setTimeout(() => { window.location.href = href; }, 600);
      });
    });
  });

  // ============= (6) COMPARE-TABELLE BEI FORM-WECHSEL re-render mit Animation =============
  // renderCompareTable schon vorhanden — die Animation in CSS triggert automatisch
  // weil neue rows neue animation-instances bekommen. Wir re-trigger durch Re-Append:
  function reRenderCompareIfOpen() {
    if (compareToggle?.getAttribute('aria-pressed') === 'true') {
      // Force animation restart by detaching+reattaching
      const t = document.getElementById('compareTable');
      if (t) {
        t.style.opacity = '0';
        renderCompareTable();
        requestAnimationFrame(() => {
          t.style.opacity = '1';
        });
      }
    }
  }
  document.querySelectorAll('[data-form]').forEach(btn => {
    btn.addEventListener('click', () => setTimeout(reRenderCompareIfOpen, 50));
  });

  // ============= INIT =============
  renderPackages();
  updateTxButtons();
  updatePyButtons();
  updateSummary();
  // Compare + Timeline beim init
  const initialTotal = parseInt(document.getElementById('sumMonthly').textContent.replace(/\D/g,''), 10) || 149;
  updateCompare(initialTotal);
  updateSetupTimeline();
  detectActiveStep();
  updateStickyNav();
  // Skeleton entfernen wenn alles ready
  requestAnimationFrame(removeSummarySkeleton);
