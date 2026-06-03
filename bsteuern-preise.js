/* ============================================================
   b'steuern — Preisseite
   JavaScript → Webflow Page Settings → Before </body> tag
   ============================================================ */

(function () {

  /* ── Paket-Daten ── */
  const PAKETE = {
    solo: {
      name: 'Einzelunternehmer',
      tag: 'Solo',
      price: 149,
      compareRef: 280,
      color: '#3D2BD5',
      cc: '#3D2BD5',
      cm: '#3D2BD5',
      ci: '#fff',
      flatPrice: false,
      advisor: {
        name:  'Janis Lambertz',
        title: 'Steuerberater',
        image: 'BILD_URL_JANIS'   /* ← Webflow Asset URL eintragen */
      },
      features: {
        'Buchhaltung': [
          'EÜR (Einnahmenüberschussrechnung)',
          'USt-Voranmeldung',
          'Buchführung & Belegverarbeitung'
        ],
        'Steuererklärungen': [
          'Einkommensteuererklärung',
          'Gewerbesteuererklärung (falls nötig)'
        ],
        'Service': [
          'Persönlicher Steuerberater',
          'Festpreis – keine Überraschungen',
          'Up- & Downgrade jederzeit'
        ]
      },
      specGroups: ['Buchhaltung', 'Steuererklärungen'],
      compare: [
        { label: 'Jahresabschluss',  value: 'EÜR' },
        { label: 'Buchführung',      value: 'Inkl.' },
        { label: 'USt-Voranmeldung', value: 'Inkl.' },
        { label: 'Transaktionen',    value: 'bis 100 inkl.' },
        { label: 'Onboarding',       value: '299 € einmalig' },
        { label: 'Laufzeit',         value: 'Monatlich kündbar' }
      ]
    },

    team: {
      name: 'Personengesellschaft',
      tag: 'Team',
      price: 199,
      compareRef: 380,
      color: '#00A1AA',
      cc: '#00A1AA',
      cm: '#00A1AA',
      ci: '#fff',
      flatPrice: false,
      advisor: {
        name:  'Philipp Rust',
        title: 'Steuerberater',
        image: 'BILD_URL_PHILIPP'  /* ← Webflow Asset URL eintragen */
      },
      features: {
        'Buchhaltung': [
          'Bilanz & Jahresabschluss (HGB)',
          'USt-Voranmeldung',
          'Buchführung & Belegverarbeitung'
        ],
        'Steuererklärungen': [
          'Ges. & einheitliche Feststellung',
          'Einkommensteuererklärung je Gesellschafter'
        ],
        'Service': [
          'Persönlicher Steuerberater',
          'Festpreis – keine Überraschungen',
          'Up- & Downgrade jederzeit'
        ]
      },
      specGroups: ['Buchhaltung', 'Steuererklärungen'],
      compare: [
        { label: 'Jahresabschluss',  value: 'Bilanz (HGB)' },
        { label: 'Buchführung',      value: 'Inkl.' },
        { label: 'USt-Voranmeldung', value: 'Inkl.' },
        { label: 'Transaktionen',    value: 'bis 100 inkl.' },
        { label: 'Onboarding',       value: '299 € einmalig' },
        { label: 'Laufzeit',         value: 'Monatlich kündbar' }
      ]
    },

    corp: {
      name: 'Kapitalgesellschaft',
      tag: 'Kapital',
      price: 299,
      compareRef: 520,
      color: '#FF0670',
      cc: '#FF0670',
      cm: '#FF0670',
      ci: '#fff',
      flatPrice: false,
      advisor: {
        name:  'Philipp Rust',
        title: 'Steuerberater',
        image: 'BILD_URL_PHILIPP'  /* ← Webflow Asset URL eintragen */
      },
      features: {
        'Buchhaltung': [
          'Bilanz & Jahresabschluss (HGB)',
          'E-Bilanz & elektronische Übermittlung',
          'Buchführung & Belegverarbeitung'
        ],
        'Steuererklärungen': [
          'KSt- & Gewerbesteuererklärung',
          'Offenlegung im Bundesanzeiger',
          'USt-Voranmeldung'
        ],
        'Service': [
          'Persönlicher Steuerberater',
          'Festpreis – keine Überraschungen',
          'Up- & Downgrade jederzeit'
        ]
      },
      specGroups: ['Buchhaltung', 'Steuererklärungen'],
      compare: [
        { label: 'Jahresabschluss', value: 'Bilanz (HGB)' },
        { label: 'E-Bilanz',        value: 'Inkl.' },
        { label: 'KSt & GewSt',     value: 'Inkl.' },
        { label: 'Transaktionen',   value: 'bis 100 inkl.' },
        { label: 'Onboarding',      value: '299 € einmalig' },
        { label: 'Laufzeit',        value: 'Monatlich kündbar' }
      ]
    },

    holding: {
      name: 'Holding',
      tag: 'Holding',
      price: 499,
      compareRef: null,
      color: '#C9A800',
      cc: '#C9A800',
      cm: '#F6DF35',
      ci: '#0E0C1C',
      flatPrice: true,
      advisor: {
        name:  'Christopher Plantener',
        title: 'Steuerberater',
        image: 'BILD_URL_CHRISTOPHER'  /* ← Webflow Asset URL eintragen */
      },
      features: {
        'Buchhaltung': [
          'Bilanz & Jahresabschluss (HGB)',
          'E-Bilanz & elektronische Übermittlung',
          'Konzern-/Beteiligungsstruktur'
        ],
        'Steuererklärungen': [
          'KSt- & Gewerbesteuererklärung',
          'Offenlegung im Bundesanzeiger',
          'Individuelle Gestaltungsberatung'
        ],
        'Service': [
          'Persönlicher Steuerberater',
          'Flachpreis – keine Aufschläge',
          'Up- & Downgrade jederzeit'
        ]
      },
      specGroups: ['Buchhaltung', 'Steuererklärungen'],
      compare: [
        { label: 'Jahresabschluss',      value: 'Bilanz (HGB)' },
        { label: 'Beteiligungsstruktur', value: 'Inkl.' },
        { label: 'KSt & GewSt',          value: 'Inkl.' },
        { label: 'Preis',                value: 'Flachpreis' },
        { label: 'Onboarding',           value: '299 € einmalig' },
        { label: 'Laufzeit',             value: 'Monatlich kündbar' }
      ]
    }
  };

  /* ── Hilfsfunktionen ── */
  function euro(n) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(n);
  }

  const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 6"/></svg>';

  /* ── State ── */
  let current       = null;
  let bandAdd       = 0;
  let founderActive = false;
  let activeTab     = 'ueberblick';

  /* ── DOM Refs ── */
  const cards          = document.querySelectorAll('.form-card');
  const resultWrap     = document.getElementById('result');
  const rcTag          = document.getElementById('rcTag');
  const rcName         = document.getElementById('rcName');
  const rcAmount       = document.getElementById('rcAmount');
  const rcCompare      = document.getElementById('rcCompare');
  const rcBand         = document.getElementById('rcBand');
  const rcFeat         = document.getElementById('rcFeat');
  const rcFounder      = document.getElementById('rcFounder');
  const priceCompare     = document.getElementById('priceCompare');
  const segItems       = document.querySelectorAll('.seg-item');
  const founderEl      = document.getElementById('founderToggle');
  const founderSvg     = document.getElementById('founderCheckSvg');
  const advisorImg     = document.getElementById('rcAdvisorImg');
  const advisorName    = document.getElementById('rcAdvisorName');

  /* ── Render: Hauptkarte ── */
  function render() {
    if (!current) return;
    const p = PAKETE[current];

    /* CSS-Variablen für Farbwechsel */
    document.documentElement.style.setProperty('--active-cc', p.cc);
    document.documentElement.style.setProperty('--active-cm', p.cm);
    document.documentElement.style.setProperty('--active-ci', p.ci);

    /* Tag & Name */
    rcTag.textContent  = p.tag;
    rcName.textContent = p.name;

    /* Preis */
    const total = p.flatPrice ? p.price : p.price + bandAdd;
    rcAmount.textContent = euro(total);

    /* Vergleichstext */
    if (p.flatPrice) {
      rcCompare.innerHTML = 'Flachpreis &ndash; keine Aufschl&auml;ge';
    } else {
      const save = Math.round((1 - p.price / p.compareRef) * 100);
      rcCompare.innerHTML =
        'Klassisch ca. ' + euro(p.compareRef) +
        ' &ndash; du sparst &nbsp;<span class="rc-save">ca. ' + save + '\u202f%</span>';
    }

    /* Band: nur bei Nicht-Flachpreis */
    if (rcBand) rcBand.style.display = p.flatPrice ? 'none' : '';

    /* Gründer-Banner */
    if (rcFounder) rcFounder.style.display = founderActive ? 'block' : 'none';

    /* Berater: Bild + Name */
    if (advisorImg) {
      advisorImg.src = p.advisor.image;
      advisorImg.alt = p.advisor.name;
    }
    if (advisorName) {
      advisorName.innerHTML =
        '<strong>' + p.advisor.name + '</strong>' + p.advisor.title;
    }

    /* Feature-Liste */
    renderFeatures(p);

    /* Summary-Zeilen */
    renderSummary(p);
  }

  /* ── Render: Feature-Liste ── */
  function renderFeatures(p) {
    if (!rcFeat) return;
    rcFeat.innerHTML = Object.entries(p.features).map(function (entry) {
      const grpName = entry[0];
      const items   = entry[1];
      const isSpec  = p.specGroups.includes(grpName);
      const listItems = items.map(function (item) {
        return '<li><span class="ck ' + (isSpec ? 'spec' : 'mut') + '">' +
          CHECK_SVG + '</span>' + item + '</li>';
      }).join('');
      return '<div class="grp"><div class="glab">' + grpName +
        '</div><ul>' + listItems + '</ul></div>';
    }).join('');
  }

  /* ── Render: Summary-Compare-Zeilen ── */
  function renderSummary(p) {
    if (!priceCompare) return;
    priceCompare.innerHTML = p.compare.map(function (row) {
      return '<div class="price-compare-row">' +
        '<span class="scr-label">' + row.label + '</span>' +
        '<span class="scr-value">' + row.value + '</span>' +
        '</div>';
    }).join('');
  }

  /* ── Karten-Klick ── */
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      cards.forEach(function (c) { c.classList.remove('is-active'); });
      card.classList.add('is-active');
      current = card.dataset.form;
      if (resultWrap) resultWrap.style.display = 'block';
      render();
    });
  });

  /* ── Segmenter-Klick ── */
  segItems.forEach(function (item) {
    item.addEventListener('click', function () {
      segItems.forEach(function (s) { s.classList.remove('is-active'); });
      item.classList.add('is-active');
      bandAdd = parseInt(item.dataset.band, 10);
      render();
    });
  });

  /* ── Gründer-Toggle ── */
  if (founderEl) {
    founderEl.addEventListener('click', function () {
      founderActive = !founderActive;
      founderEl.classList.toggle('is-checked', founderActive);
      if (founderSvg) founderSvg.style.opacity = founderActive ? '1' : '0';
      render();
    });
  }

  /* ============================================================
     MODAL
     ============================================================ */
  const backdrop  = document.getElementById('cmpBackdrop');
  const cmpClose  = document.getElementById('cmpClose');
  const cmpRows   = document.getElementById('cmpRows');
  const modalTabs = document.querySelectorAll('.modal-tab');

  const ORDER = ['solo', 'team', 'corp', 'holding'];

  const SUB = {
    solo:    'Freiberufler, Gewerbe, Kleinunternehmer',
    team:    'GbR, OHG, KG, Partnerschaft',
    corp:    'GmbH, UG, AG',
    holding: 'Beteiligungsstrukturen'
  };

  function buildCompare() {
    if (!cmpRows) return;

    cmpRows.innerHTML = ORDER.map(function (k) {
      const p   = PAKETE[k];
      const sel = k === current;
      let right = '';

      if (activeTab === 'ueberblick') {
        right = '<div class="cc-strong">ab ' + euro(p.price) + ' / Mo</div>';

      } else if (activeTab === 'leistungen') {
        const allItems = [].concat.apply([], Object.values(p.features));
        right = '<ul class="cc-list">' +
          allItems.map(function (t) {
            return '<li><span class="cc-ck">' + CHECK_SVG + '</span><span>' + t + '</span></li>';
          }).join('') + '</ul>';

      } else {
        const save = p.flatPrice ? null : Math.round((1 - p.price / p.compareRef) * 100);
        right = '<ul class="cc-list">' +
          '<li><span class="cc-ck">' + CHECK_SVG + '</span><span>' +
            '<strong>' + euro(p.price) + '</strong> / Monat ' +
            (p.flatPrice ? '· Flachpreis' : '· netto') +
          '</span></li>' +
          '<li><span class="cc-ck">' + CHECK_SVG + '</span><span>Onboarding ' + euro(299) + ' einmalig</span></li>' +
          (!p.flatPrice
            ? '<li><span class="cc-ck">' + CHECK_SVG + '</span><span>ca. ' + save + '\u202f% g&uuml;nstiger als klassisch</span></li>'
            : '') +
          '</ul>';
      }

      return '<div class="cmp-row' + (sel ? ' sel' : '') + '" style="--rc:' + p.color + '">' +
        '<div class="cmp-left">' +
          '<div class="cmp-name">' + p.name + '</div>' +
          (sel ? '<div class="cmp-badge">Aktuell gew&auml;hlt</div>' : '') +
          '<div class="cmp-sub">' + SUB[k] + '</div>' +
        '</div>' +
        '<div class="cmp-right">' + right + '</div>' +
      '</div>';
    }).join('');
  }

  function setTab(tab) {
    activeTab = tab;
    modalTabs.forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.tab === tab);
    });
    buildCompare();
  }

  function openModal() {
    buildCompare();
    if (backdrop) backdrop.style.display = 'flex';
    document.documentElement.classList.add('no-scroll');
  }

  function closeModal() {
    if (backdrop) backdrop.style.display = 'none';
    document.documentElement.classList.remove('no-scroll');
  }

  document.querySelectorAll('[data-open-compare]').forEach(function (el) {
    el.addEventListener('click', openModal);
  });

  if (cmpClose) cmpClose.addEventListener('click', closeModal);

  if (backdrop) {
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  modalTabs.forEach(function (b) {
    b.addEventListener('click', function () { setTab(b.dataset.tab); });
  });

  setTab('ueberblick');

  /* ── Compare-Dock: ausblenden wenn Final-CTA sichtbar ── */
  const dock     = document.querySelector('.compare-dock');
  const finalSec = document.querySelector('.final-section');

  if (dock && finalSec && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        dock.classList.toggle('is-hidden', e.isIntersecting);
      });
    }, { threshold: 0 }).observe(finalSec);
  }

})();
