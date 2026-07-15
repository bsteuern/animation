/* ════════════════════════════════════════════════════════════════════
 * b'steuern · Preise und Gebühren — preise-gebuehren.js
 * Reihenfolge: (1) Webflow-Glue  (2) Tabellen-Renderer/Scrollspy  (3) Mobile-Sheet
 * Im Webflow-Footer-Custom-Code via jsDelivr einbinden (defer empfohlen).
 * ════════════════════════════════════════════════════════════════════ */

(function () {
  var MOBILE_MAX = 720;
  var NAV_FALLBACK = 80;
  var DELTA = 6;
  var root = document.documentElement;

  function findNav() {
    return document.querySelector('.w-nav') ||
           document.querySelector('[class*="navbar"]') ||
           null;
  }
  var navEl = findNav();

  function fixBeratungLinks() {
    var BERATUNG = 'https://www.bsteuern.com/lp/kostenlose-beratung';
    document.querySelectorAll('a[href="#beratung"]').forEach(function (a) {
      a.setAttribute('href', BERATUNG);
    });
  }

  var lastNavH = -1;
  function updateNavH() {
    var h;
    if (navEl) {
      h = Math.max(0, Math.round(navEl.getBoundingClientRect().bottom));
    } else {
      h = NAV_FALLBACK;
    }
    if (h !== lastNavH) {
      lastNavH = h;
      root.style.setProperty('--wf-nav-h', h + 'px');
    }
  }

  var sel = document.querySelector('.mobile-selector');
  var lastY = window.scrollY;
  function updateSelector() {
    if (!sel) return;
    if (window.innerWidth > MOBILE_MAX) {
      sel.classList.remove('is-visible');
      return;
    }
    var y = window.scrollY;
    var pastTop = y > (lastNavH + 40);
    if (!pastTop) {
      sel.classList.remove('is-visible');
    } else if (y < lastY - DELTA) {
      sel.classList.add('is-visible');
    } else if (y > lastY + DELTA) {
      sel.classList.remove('is-visible');
    }
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateNavH();
        updateSelector();
        lastY = window.scrollY;
        ticking = false;
      });
      ticking = true;
    }
  }

  function init() {
    navEl = navEl || findNav();
    fixBeratungLinks();
    updateNavH();
    updateSelector();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      updateNavH();
      updateSelector();
    }, { passive: true });
    window.addEventListener('load', updateNavH);
    if ('ResizeObserver' in window && navEl) {
      try { new ResizeObserver(updateNavH).observe(navEl); } catch (e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ──────────────────────────────────────────────────────────────────── */

(function () {
  const CHECK_SVG = '<svg class="bs-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="M5 12l5 5L20 6"/></svg>';
  const NO_GLYPH  = '<span class="cell-no" aria-label="nicht enthalten">—</span>';

  function renderCell(v) {
    if (v === true)  return '<span class="cell-check" aria-label="enthalten">' + CHECK_SVG + '</span>';
    if (v === false) return NO_GLYPH;
    if (typeof v === 'string') return '<span class="cell-price">' + v + '</span>';
    if (v && v.check) {
      return '<span class="cell-val--note"><span class="cell-check" aria-label="enthalten">' + CHECK_SVG + '</span><span class="cell-note">' + v.note + '</span></span>';
    }
    return '';
  }

  const dataBetrieblich = [
    { sec: 'Jährliche Services', meta: 'pro Jahr', rows: [
      { title: 'Plausibilitätscheck der Buchhaltung',
        desc:  'Korrekturbuchungen werden ggf. separat in Rechnung gestellt',
        v: [true, true, true] },
      { title: 'Durchführung nötiger Korrekturen',
        desc:  'Nach Zeitaufwand abgerechnet',
        v: ['120 €/Std*', '120 €/Std*', true] },
      { title: 'Jahresabschlussarbeiten',
        desc:  'EÜR oder Bilanz inkl. GuV, Erstellung Anlageverzeichnis',
        v: [true, true, true] },
      { title: 'Elektronische Übermittlung an das Finanzamt',
        desc:  'EÜR oder E-Bilanz',
        v: [true, true, true] },
      { title: 'Gewerbesteuererklärung', v: [true, true, true] },
      { title: 'Körperschaftsteuererklärung', v: [true, true, true] },
      { title: 'Umsatzsteuererklärung', v: [true, true, true] },
      { title: 'Gesondert- und einheitliche Feststellung',
        desc:  'Z. B. bei Personengesellschaften',
        v: [true, true, true] },
      { title: 'Hinter- bzw. Offenlegung des Jahresabschlusses',
        desc:  'Beim Bundesanzeiger',
        v: [true, true, true] },
    ]},
    { sec: 'Laufende Services', meta: 'monatlich', rows: [
      { title: 'Plausibilitätscheck der Buchhaltung',
        desc:  'Monatlich, statt nur am Jahresende',
        v: [false, true, true] },
      { title: 'Durchführung nötiger Korrekturen',
        desc:  'Nach Zeitaufwand abgerechnet',
        v: ['120 €/Std*', '120 €/Std*', true] },
      { title: 'Vollständiger Review der Buchhaltung',
        desc:  'Inkl. Prüfung von Eingangsbelegen',
        v: [false, false, true] },
      { title: 'Umsatzsteuer-Voranmeldung',
        desc:  'Inkl. Zusammenfassender Meldung',
        v: [false, true, true] },
      { title: 'Übernahme der gesamten Buchhaltung',
        desc:  'Belege lädst du hoch, wir buchen',
        v: [false, false, 'Bald verfügbar'] },
    ]},
    { sec: 'Beratung', meta: 'pro Jahr', rows: [
      { title: 'Beratungsguthaben inklusive',
        desc:  'Anrufe, E-Mails, Termine — alles drin bis zum Guthaben',
        v: ['100 €', '200 €', '300 €'] },
    ]},
    { sec: 'Zusätzliche Leistungen', meta: 'optional', rows: [
      { title: 'Jährliche Services für Vor- und Altjahre',
        desc:  'Bei Vertragsabschluss — nur mit laufender Betreuung',
        v: ['ab 1.908 €*', 'ab 2.628 €*', 'ab 3.588 €*'] },
    ]},
    { sec: 'Onboarding', meta: 'einmalig', rows: [
      { title: 'Konfigurationscheck & Einrichtung',
        desc:  'Wir schauen uns deine Prozesse und Tools an und legen gemeinsam fest, wie wir in Zukunft zusammenarbeiten',
        v: ['399 €*', '399 €*', '399 €*'] },
    ]},
  ];

  const idealBetrieblich = [
    'Freelancer und kleine Unternehmen, die gerade starten und alle gesetzlichen Anforderungen erfüllen wollen.',
    'Freelancer und Unternehmen, die sich auf ihr Kerngeschäft konzentrieren möchten und korrekte, aktuelle Zahlen brauchen — ohne 8 Wochen auf den Steuerberater zu warten.',
    'Ambitionierte Freelancer und Unternehmen, die das Beste wollen, um ihr Business voranzubringen. Wir kümmern uns um alles — du gewinnst Zeit zurück.'
  ];

  const dataEinkommen = [
    { sec: 'Basic', meta: 'in allen Paketen', rows: [
      { title: 'Mantelbogen',
        desc:  'Name, Anschrift, Religionszugehörigkeit, Familienstand, Beruf, Kontoverbindung usw',
        v: [true, true, true] },
      { title: 'Zusammenveranlagung',
        desc:  'Gemeinsame Einkommensteuererklärung mit dem Ehepartner',
        v: [{ check: true, note: 'Ehepartner ohne Einkünfte' }, true, true] },
      { title: 'Anlage S — Selbständige Einnahmen',
        desc:  'Für Einkünfte aus einer selbständigen Tätigkeit',
        v: [true, true, true] },
      { title: 'Anlage G — Einnahmen aus Gewerbebetrieb',
        desc:  'Für Einkünfte aus einem Gewerbebetrieb',
        v: [true, true, true] },
      { title: 'Sonderausgaben',
        desc:  'Versicherungsbeiträge, Kirchensteuer, Spenden, Mitgliedsbeiträge usw',
        v: [true, true, true] },
      { title: 'Anlage für Kinder bis 18 Jahre',
        desc:  'Betreuungs- und Ausbildungskosten',
        v: [true, true, true] },
      { title: 'Haushaltsnahe Aufwendungen',
        desc:  'Putzen, Garten, Handwerksarbeiten, privat veranlasste Umzüge usw',
        v: [true, true, true] },
      { title: 'Anlage AV — Rente',
        desc:  'Riester-Versicherung u. ä',
        v: [true, true, true] },
    ]},
    { sec: 'Extra', meta: 'je nach Paket inkl. oder Pauschale', rows: [
      { title: 'Außergewöhnliche Belastungen',
        desc:  'Krankheits-, Kur-, Pflege-, Bestattungskosten usw',
        v: ['99 €*', true, true] },
      { title: 'Anlage N — Angestellte',
        desc:  'Einkommen aus einer Angestellten-Tätigkeit',
        v: ['99 €*', true, true] },
      { title: 'Anlage für Kinder ab 18 Jahre',
        desc:  'Betreuungs- und Ausbildungskosten',
        v: ['99 €*', true, true] },
      { title: 'Anlage V&V — Vermietung und Verpachtung',
        desc:  'Pauschale für erstmalige Erstellung bei Neuanschaffung — Pakete M und L: 99 €',
        v: ['120 €/Std*', { check: true, note: '1 Objekt inkl.' }, { check: true, note: '3 Objekte inkl.' }] },
      { title: 'Anlage R — Renteneinkünfte', v: ['99 €*', true, true] },
      { title: 'Anlage KAP — Langfristige Investments',
        desc:  'Kapitaleinkünfte, Investments, Crypto',
        v: ['120 €/Std*', '120 €/Std*', { check: true, note: 'kein Trading' }] },
      { title: 'Unterhalt',
        desc:  'Eltern, Ehepartner, bedürftige Angehörige etc',
        v: ['99 €*', '99 €*', true] },
      { title: 'Anlage SO — Sonstige Einkünfte',
        desc:  'Private Veräußerungsgeschäfte, erhaltene Unterhaltszahlungen usw',
        v: ['99 €*', '99 €*', true] },
      { title: 'Prüfung des Einkommensteuerbescheids', v: ['59 €*', '59 €*', true] },
      { title: 'Anlage AUS — Ausländische Einkünfte',
        desc:  'Ausländische Einkünfte und Steuern',
        v: ['99 €*', '99 €*', '99 €*'] },
      { title: 'Gesonderte und einheitliche Feststellung',
        desc:  'Wenn Betriebs- und Wohnsitz an verschiedenen Orten liegen',
        v: ['99 €*', '99 €*', '99 €*'] },
      { title: 'Für Vor- und Altjahre',
        desc:  'Bei Vertragsabschluss, nur mit laufender Betreuung',
        v: ['359 €*', '539 €*', '899 €*'] },
      { title: 'Einspruch gegen Steuerbescheid', v: ['180 €/Std*', '180 €/Std*', '180 €/Std*'] },
      { title: 'Gebühr für die zu späte Abgabe von Unterlagen',
        desc:  'Verzögerungen stören Prozesse erheblich — die Pauschale gleicht den Mehraufwand aus',
        v: ['99 €*', '99 €*', '99 €*'] },
    ]},
  ];

  function renderTable(targetId, groups, idealRow) {
    const tbody = document.getElementById(targetId);
    if (!tbody) return;
    const html = [];
    let rowIdx = 0;

    groups.forEach(function (g, idx) {
      if (idx > 0) {
        html.push('<tr class="gap"><td colspan="4"></td></tr>');
      }
      html.push(
        '<tr class="sec"><td colspan="4">' +
          '<span class="sec-meta">' + g.meta + '</span>' +
          '<h3 class="sec-title">' + g.sec + '</h3>' +
        '</td></tr>'
      );
      rowIdx = 0;
      g.rows.forEach(function (r) {
        const cls = (rowIdx % 2 === 0) ? 'is-light' : 'is-dark';
        rowIdx++;
        html.push(
          '<tr class="row ' + cls + '">' +
            '<td class="cell-label">' +
              '<span class="feat-title">' + r.title + '</span>' +
              (r.desc ? '<span class="feat-desc">' + r.desc + '</span>' : '') +
            '</td>' +
            '<td class="cell-val pkg-col pkg-1">' + renderCell(r.v[0]) + '</td>' +
            '<td class="cell-val pkg-col pkg-2">' + renderCell(r.v[1]) + '</td>' +
            '<td class="cell-val pkg-col pkg-3">' + renderCell(r.v[2]) + '</td>' +
          '</tr>'
        );
      });
    });

    if (idealRow) {
      html.push(
        '<tr class="row-ideal">' +
          '<td><span class="ideal-label">Ideal für</span></td>' +
          idealRow.map(function(t, i){
            return '<td class="pkg-col pkg-' + (i+1) + '"><p class="ideal-text">' + t + '</p></td>';
          }).join('') +
        '</tr>'
      );
    }

    tbody.innerHTML = html.join('');
  }

  var dataLohn = [
    { sec: 'Einrichtung', meta: 'einmalig', rows: [
      { title: 'Ersteinrichtung',
        desc: 'Wir unterstützen dich auf Wunsch bei der Einrichtung von Lexware Office Lohn & Gehalt.',
        v: '149 €*' },
    ]},
    { sec: 'Laufend', meta: 'nach Aufwand', rows: [
      { title: 'Laufende Unterstützung',
        desc: 'Du kümmerst dich selbst um deine Löhne – möchtest unsere Hilfe aber hier und da in Anspruch nehmen.',
        v: '120 €/Std*' },
    ]},
  ];

  var dataExtra = [
    { sec: 'Allgemein', meta: 'Stundensätze', rows: [
      { title: 'Stundenhonorar Buchhaltung', v: '120 €/Std*' },
      { title: 'Stundenhonorar Steuerberatung', v: '180 €/Std*' },
    ]},
    { sec: 'Gründung', meta: 'einmalig', rows: [
      { title: 'Beantragung USt-ID', v: '59 €*' },
      { title: 'Steuerlicher Erfassungsbogen', v: '199 €*' },
      { title: 'EB-Bilanz bei Neugründung', v: '159 €*' },
    ]},
    { sec: 'Bescheinigungen', meta: 'pro Bescheinigung', rows: [
      { title: 'Einkommensteuernachweis / EÜR', v: '69 €*' },
      { title: 'Unterschriebene BWA', v: '120 €/Std*' },
      { title: 'Bestätigung selbstständige Tätigkeit', v: '120 €/Std*' },
    ]},
    { sec: 'Zusammenarbeit', meta: 'Pauschalen', rows: [
      { title: 'Kommunikation mit dem Finanzamt', desc: 'nach Zeitaufwand', v: '120 €/Std*' },
      { title: 'Expresszuschlag', desc: 'unter 6 Wochen Bearbeitungszeit', v: '399 €*' },
      { title: 'Verspätungszuschlag', desc: 'zu spät abgegebene Unterlagen', v: '99 €*' },
      { title: 'Erneute Hinterlegung der Vollmacht beim Finanzamt', v: '49 €*' },
      { title: 'Gebühr bei fehlender Mitarbeit', desc: 'nach 2-maliger Aufforderung / pro Fall', v: '99 €*' },
    ]},
    { sec: 'Andere Dienstleistungen', meta: 'einzeln', rows: [
      { title: 'Zusenden physischer Dokumente', desc: 'anstelle digitaler / pro Dokument', v: '39 €*' },
      { title: 'Anmeldung Kapitalertragsteuer', desc: 'bei Gewinnausschüttungen', v: '120 €/Std*' },
      { title: 'Ersteintrag & Änderungen im Transparenzregister', v: '119 €*' },
      { title: 'Vorbereitung & Unterstützung Bankgespräch', v: '180 €/Std*' },
      { title: 'Dauerfristverlängerung beantragen', v: '99 €*' },
      { title: 'Steuerbescheid prüfen', desc: 'je Steuerbescheid', v: '59 €*' },
      { title: 'Einspruch gegen Steuerbescheid', v: '180 €/Std*' },
      { title: 'Eröffnungsbilanz', desc: 'bei Wechsel der Gewinnermittlungsart / Umwandlung', v: '180 €/Std*' },
      { title: 'Anpassung Einkommensteuer-Vorauszahlungen', v: '79 €*' },
      { title: 'Anpassung Gewerbesteuer-Vorauszahlungen', v: '79 €*' },
      { title: 'Beratung PKW Anschaffung', desc: 'Kauf, Finanzierung, Leasing und Auswirkungen', v: '99 €*' },
      { title: 'Betriebswirtschaftliche Beratungsgespräche', desc: 'ca. 60 min · je Termin · jährlich / halbjährlich / vierteljährlich / monatlich', v: '199 €*' },
      { title: 'Alle weiteren Beratungsthemen', desc: 'Investitionsabzugsbeträge, Sonderabschreibungen, Unterhaltsleistungen, Scheidungskosten, Handwerker- & haushaltsnahe Dienstleistungen, Betriebsprüfungen, Kleinunternehmer-Regelung, Vertrags-Durchsicht, Wegzugberatung, Abfindungsgestaltung, Beteiligungen, freiberufliche Einstufung u. v. m.', v: '180 €/Std*' },
    ]},
  ];

  function renderSingleTable(targetId, groups) {
    var tbody = document.getElementById(targetId);
    if (!tbody) return;
    var out = [];
    groups.forEach(function (g, idx) {
      if (idx > 0) out.push('<tr class="gap"><td colspan="2"></td></tr>');
      out.push(
        '<tr class="sec"><td colspan="2">' +
          '<span class="sec-meta">' + g.meta + '</span>' +
          '<h3 class="sec-title">' + g.sec + '</h3>' +
        '</td></tr>'
      );
      g.rows.forEach(function (r, ri) {
        var cls = (ri % 2 === 0) ? 'is-light' : 'is-dark';
        var val = r.v ? '<span class="cell-price">' + r.v + '</span>' : '';
        out.push(
          '<tr class="row ' + cls + '">' +
            '<td class="cell-label">' +
              '<span class="feat-title">' + r.title + '</span>' +
              (r.desc ? '<span class="feat-desc">' + r.desc + '</span>' : '') +
            '</td>' +
            '<td class="cell-val">' + val + '</td>' +
          '</tr>'
        );
      });
    });
    tbody.innerHTML = out.join('');
  }

  function initMobileTabs() {
    document.querySelectorAll('.group').forEach(function (group) {
      const tabs = group.querySelectorAll('.pkg-tab');
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          const pkg = tab.getAttribute('data-pkg');
          group.setAttribute('data-active', pkg);
          tabs.forEach(function (t) {
            const on = t === tab;
            t.classList.toggle('is-active', on);
            t.setAttribute('aria-selected', on ? 'true' : 'false');
          });
        });
      });
    });
  }

  function initScrollSpy() {
    const links = Array.prototype.slice.call(document.querySelectorAll('.anchor-link'));
    const sections = links
      .map(function (l) { return document.querySelector(l.getAttribute('href')); })
      .filter(Boolean);
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          const id = '#' + e.target.id;
          links.forEach(function (l) {
            l.classList.toggle('is-current', l.getAttribute('href') === id);
          });
        }
      });
    }, { rootMargin: '-50% 0px -45% 0px' });
    sections.forEach(function (s) { obs.observe(s); });
  }

  function initAnchorMini() {
    var nav = document.querySelector('.anchor-nav');
    var mini = document.querySelector('.anchor-mini');
    if (!nav || !mini) return;
    var lastY = window.scrollY;
    var ticking = false;
    var delta = 6;
    function update() {
      var y = window.scrollY;
      var navBottom = nav.offsetTop + nav.offsetHeight;
      var scrolledPastNav = y > navBottom;
      if (!scrolledPastNav) {
        mini.classList.remove('is-visible');
      } else if (y < lastY - delta) {
        mini.classList.add('is-visible');
      } else if (y > lastY + delta) {
        mini.classList.remove('is-visible');
      }
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  function init() {
    renderTable('tbl-betrieblich', dataBetrieblich, idealBetrieblich);
    renderTable('tbl-einkommen', dataEinkommen, null);
    renderSingleTable('tbl-lohn', dataLohn);
    renderSingleTable('tbl-extra', dataExtra);
    initMobileTabs();
    initScrollSpy();
    initAnchorMini();
    initPkgTabsStuckDetection();
  }

  function initPkgTabsStuckDetection() {
    var tabs = document.querySelectorAll('.pkg-tabs');
    if (!tabs.length || !('IntersectionObserver' in window)) return;
    tabs.forEach(function(el) {
      var s = document.createElement('div');
      s.style.cssText = 'height:1px;width:100%;';
      el.parentNode.insertBefore(s, el);
      var obs = new IntersectionObserver(function(entries) {
        el.classList.toggle('is-stuck', !entries[0].isIntersecting);
      }, { threshold: 0, rootMargin: '-60px 0px 0px 0px' });
      obs.observe(s);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ──────────────────────────────────────────────────────────────────── */

(function(){
  var SECTION_ICONS = {
    'Betriebliche Steuererklärung': '<svg viewBox="0 0 24 24"><path d="M4 22h16M6 22V4h12v18M9 8h2M9 12h2M9 16h2M13 8h2M13 12h2M13 16h2"/></svg>',
    'Einkommensteuererklärung': '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/></svg>',
    'Lohnabrechnung': '<svg viewBox="0 0 24 24"><path d="M5 4h14v18H5zM9 2h6v4H9zM9 11h6M9 15h6"/></svg>',
    'Zusätzliche Leistungen': '<svg viewBox="0 0 24 24"><path d="M4 12h16M12 4v16"/></svg>'
  };
  var SECTION_COLORS = {
    'Betriebliche Steuererklärung': 'var(--color-indigo)',
    'Einkommensteuererklärung': 'var(--color-lavender)',
    'Lohnabrechnung': 'var(--color-teal)',
    'Zusätzliche Leistungen': 'var(--color-coral)'
  };
  var sel = document.getElementById('mobSelector');
  var btn = document.getElementById('mobSelectorBtn');
  var sheet = document.getElementById('mobSheet');
  var backdrop = document.getElementById('mobBackdrop');
  var selText = document.getElementById('mobSelText');
  var selIco = document.getElementById('mobSelIco');
  if (!sel || !btn) return;

  function openSheet() { sheet.classList.add('is-open'); backdrop.classList.add('is-open'); sel.classList.add('is-open'); }
  function closeSheet() { sheet.classList.remove('is-open'); backdrop.classList.remove('is-open'); sel.classList.remove('is-open'); }
  btn.addEventListener('click', openSheet);
  backdrop.addEventListener('click', closeSheet);

  document.querySelectorAll('.mobile-sheet-opt').forEach(function(opt) {
    opt.addEventListener('click', function() {
      var value = opt.dataset.value;
      var href = opt.dataset.href;
      document.querySelectorAll('.mobile-sheet-opt').forEach(function(o){ o.classList.remove('is-active'); });
      opt.classList.add('is-active');
      selText.textContent = value;
      if (SECTION_ICONS[value]) selIco.innerHTML = SECTION_ICONS[value];
      if (SECTION_COLORS[value]) selIco.style.background = SECTION_COLORS[value];
      closeSheet();
      var target = document.querySelector(href);
      if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  if ('IntersectionObserver' in window) {
    var groups = document.querySelectorAll('.group[id]');
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          var id = '#' + e.target.id;
          document.querySelectorAll('.mobile-sheet-opt').forEach(function(o) {
            var match = o.dataset.href === id;
            o.classList.toggle('is-active', match);
            if (match) {
              var value = o.dataset.value;
              selText.textContent = value;
              if (SECTION_ICONS[value]) selIco.innerHTML = SECTION_ICONS[value];
              if (SECTION_COLORS[value]) selIco.style.background = SECTION_COLORS[value];
            }
          });
        }
      });
    }, { rootMargin: '-30% 0px -50% 0px' });
    groups.forEach(function(g){ obs.observe(g); });
  }
})();
