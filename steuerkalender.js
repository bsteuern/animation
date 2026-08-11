/* ============================================================
   b'steuern — Steuerkalender Engine
   Version 1.0.0
   Kein Framework. Rendert in die im Webflow gebauten Ziel-Divs.
   Diagnose:  bsteuernKalenderVersion   /   bsteuernKalender()
   ============================================================ */
(function () {
  'use strict';

  var VERSION = '2.1.0';
  window.bsteuernKalenderVersion = VERSION;

  /* ---------- 1. Stammdaten ---------- */

  var MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  var SHORT_WD = ['M', 'D', 'M', 'D', 'F', 'S', 'S'];

  var KINDS = {
    monat:   { color: 'var(--kal-teal)',   onColor: 'var(--kal-ink)', label: 'Monatlich' },
    quartal: { color: 'var(--kal-indigo)', onColor: '#ffffff',       label: 'Quartal' },
    jahr:    { color: 'var(--kal-yellow)', onColor: 'var(--kal-ink)', label: 'Jahrestermin' }
  };

  var FALLBACK_RULES = [
    {
      id: 'ustva-q', day: 10, months: [0, 3, 6, 9], rhythm: 'quartal', kind: 'quartal',
      audience: ['solo', 'corp'],
      title: 'Umsatzsteuer-Voranmeldung', short: 'UStVA',
      who: 'Alle, die vierteljährlich melden — ab dem dritten Jahr die Regel, wenn die Umsatzsteuer im Vorjahr unter 9 000 € lag.',
      what: 'Die Umsätze und Vorsteuern des abgelaufenen Quartals, elektronisch ans Finanzamt.',
      risk: 'Verspätungszuschlag und pro angefangenem Monat 1 % Säumniszuschlag auf die Zahlung.',
      wir: 'Wir buchen laufend und melden zum Quartal — du siehst vorher, was abgeht.'
    },
    {
      id: 'ustva', day: 10, rhythm: 'monat', kind: 'monat', audience: ['solo', 'corp'],
      title: 'Umsatzsteuer-Voranmeldung', short: 'UStVA',
      who: 'Alle, die monatlich melden — in den ersten zwei Jahren nach der Gründung ist das die Regel.',
      what: 'Die Umsätze und Vorsteuern des Vormonats, elektronisch ans Finanzamt.',
      risk: 'Verspätungszuschlag und pro angefangenem Monat 1 % Säumniszuschlag auf die Zahlung.',
      wir: 'Wir buchen laufend, prüfen die Vorsteuer und melden fristgerecht — du bekommst nur die Info, was abgeht.'
    },
    {
      id: 'lohn', day: 10, kind: 'monat', audience: ['staff'],
      title: 'Lohnsteuer-Anmeldung', short: 'Lohnsteuer',
      who: 'Betriebe mit Angestellten oder Minijobbern — auch dich selbst, wenn du angestellter Geschäftsführer bist.',
      what: 'Die einbehaltene Lohnsteuer des Vormonats für alle Beschäftigten.',
      risk: 'Haftung des Geschäftsführers persönlich, dazu Verspätungs- und Säumniszuschläge.',
      wir: 'Wir übernehmen die Lohnabrechnung samt Meldung an Finanzamt und Krankenkassen.'
    },
    {
      id: 'zm', day: 25, kind: 'monat', audience: ['solo', 'corp'],
      title: 'Zusammenfassende Meldung', short: 'ZM',
      who: 'Alle, die Leistungen an Unternehmen im EU-Ausland abrechnen.',
      what: 'Eine Aufstellung deiner EU-Umsätze — ans Bundeszentralamt für Steuern, nicht ans Finanzamt.',
      risk: 'Bußgeld bis 5 000 €, und die Steuerfreiheit deiner EU-Umsätze kann rückwirkend kippen.',
      wir: 'Wir erkennen EU-Umsätze bei der Buchung und melden sie automatisch mit.'
    },
    {
      id: 'estkst', day: 10, months: [2, 5, 8, 11], kind: 'quartal', audience: ['solo', 'corp'],
      title: 'Einkommen- und Körperschaftsteuer', short: 'ESt / KSt',
      who: 'Selbstständige und Gesellschaften, sobald das Finanzamt einmal Steuern festgesetzt hat.',
      what: 'Die Vorauszahlung auf das laufende Jahr, geschätzt anhand des letzten Bescheids.',
      risk: 'Säumniszuschläge; bei dauerhaft zu niedrigen Vorauszahlungen droht eine hohe Nachzahlung.',
      wir: 'Wir vergleichen laufend mit deinen echten Zahlen und beantragen eine Anpassung, wenn das Jahr anders läuft.'
    },
    {
      id: 'gewst', day: 15, months: [1, 4, 7, 10], kind: 'quartal', audience: ['corp'],
      title: 'Gewerbesteuer', short: 'GewSt',
      who: 'Gewerbebetriebe — Freiberufler zahlen keine Gewerbesteuer.',
      what: 'Die Vorauszahlung an die Gemeinde, deren Hebesatz die Höhe bestimmt.',
      risk: 'Säumniszuschläge der Gemeinde, die eigenständig vollstreckt.',
      wir: 'Wir behalten den Hebesatz im Blick und rechnen bei einem Umzug oder Wachstum neu.'
    },
    {
      id: 'esterkl-berater', day: 28, months: [1], kind: 'jahr', audience: ['solo', 'corp', 'staff'],
      title: 'Steuererklärung mit Berater', short: 'Erklärung',
      who: 'Alle, die von einem Steuerberater vertreten werden — für das Jahr davor.',
      what: 'Einkommen-, Umsatz-, Gewerbe- und Körperschaftsteuererklärung des Vorvorjahres.',
      risk: 'Nach Ablauf setzt das Finanzamt Verspätungszuschläge fest, mindestens 25 € pro Monat.',
      wir: 'Wir nutzen die verlängerte Frist und sammeln über das Jahr, statt im Juli zu hetzen.'
    },
    {
      id: 'esterkl', day: 31, months: [6], kind: 'jahr', audience: ['solo', 'corp', 'staff'],
      title: 'Steuererklärung ohne Berater', short: 'Erklärung',
      who: 'Alle, die selbst abgeben — ohne Vertretung endet die Frist am 31. Juli.',
      what: 'Sämtliche Jahreserklärungen für das Vorjahr.',
      risk: 'Verspätungszuschlag, Schätzung durch das Finanzamt, im Wiederholungsfall Zwangsgeld.',
      wir: 'Sobald wir für dich gemeldet sind, verlängert sich diese Frist um sieben Monate — automatisch.'
    },
    {
      id: 'offenlegung', day: 31, months: [11], kind: 'jahr', audience: ['corp'],
      title: 'Offenlegung Jahresabschluss', short: 'Offenlegung',
      who: 'GmbHs, UGs und AGs.',
      what: 'Der Jahresabschluss des Vorjahres beim Unternehmensregister; kleine Gesellschaften nur verkürzt.',
      risk: 'Ordnungsgeldverfahren des Bundesamts für Justiz, 2 500 € und mehr.',
      wir: 'Wir erstellen den Abschluss und übernehmen die Offenlegung mit.'
    }
  ];

  /* ---------- 1b. Aktive Regelmenge ----------
     RULES wird beim Start aus dem DOM gelesen. Findet sich dort nichts
     Brauchbares, bleiben die eingebauten Regeln stehen. Der Kalender
     kann dadurch nie leer sein. */

  var RULES = FALLBACK_RULES;
  var REGELQUELLE = 'eingebaut';
  var REGELWARNUNGEN = [];

  var LAENDER = [
    ['BW', 'Baden-Württemberg'], ['BY', 'Bayern'], ['BE', 'Berlin'], ['BB', 'Brandenburg'],
    ['HB', 'Bremen'], ['HH', 'Hamburg'], ['HE', 'Hessen'], ['MV', 'Mecklenburg-Vorpommern'],
    ['NI', 'Niedersachsen'], ['NW', 'Nordrhein-Westfalen'], ['RP', 'Rheinland-Pfalz'], ['SL', 'Saarland'],
    ['SN', 'Sachsen'], ['ST', 'Sachsen-Anhalt'], ['SH', 'Schleswig-Holstein'], ['TH', 'Thüringen']
  ];

  /* ---------- 1c. Regeln aus dem DOM lesen ---------- */

  var ERLAUBTE_ZIELGRUPPEN = ['solo', 'corp', 'staff'];

  function feldText(node, name) {
    var n = node.querySelector('[data-feld="' + name + '"]');
    if (!n) return '';
    return (n.textContent || '').replace(/\s+/g, ' ').trim();
  }

  /* "1,4,7,10" (menschlich, 1–12) → [0,3,6,9] (JavaScript, 0–11) */
  function parseMonate(raw) {
    if (!raw) return null;
    var out = [];
    raw.split(/[,;\s]+/).forEach(function (t) {
      if (!t) return;
      var n = parseInt(t, 10);
      if (n >= 1 && n <= 12) out.push(n - 1);
    });
    return out.length ? out : null;
  }

  function pruefeRegel(r, index) {
    var f = [];
    if (!r.id) f.push('data-id fehlt');
    if (!(r.day >= 1 && r.day <= 31)) f.push('data-tag muss 1 bis 31 sein');
    if (!KINDS[r.kind]) f.push('data-art muss monat, quartal oder jahr sein');
    if (r.rhythm && r.rhythm !== 'monat' && r.rhythm !== 'quartal') {
      f.push('data-rhythmus muss monat, quartal oder leer sein');
    }
    if (!r.audience.length) f.push('data-fuer fehlt');
    r.audience.forEach(function (a) {
      if (ERLAUBTE_ZIELGRUPPEN.indexOf(a) === -1) f.push('data-fuer kennt "' + a + '" nicht');
    });
    if (r.months) {
      r.months.forEach(function (m) {
        if (!(m >= 0 && m <= 11)) f.push('data-monate enthält einen Wert außerhalb 1 bis 12');
      });
    }
    ['title', 'short', 'who', 'what', 'risk', 'wir'].forEach(function (k) {
      if (!r[k]) f.push('Textfeld "' + FELDNAMEN[k] + '" ist leer');
    });
    if (f.length) {
      REGELWARNUNGEN.push({
        position: index + 1,
        id: r.id || '(ohne data-id)',
        titel: r.title || '(ohne Titel)',
        probleme: f
      });
      return false;
    }
    return true;
  }

  var FELDNAMEN = {
    title: 'titel', short: 'kurz', who: 'wen',
    what: 'was', risk: 'risiko', wir: 'wir'
  };

  function regelnAusDOM(root) {
    var nodes = root.querySelectorAll('[data-regel]');
    if (!nodes.length) return null;

    var gelesen = Array.prototype.map.call(nodes, function (n) {
      return {
        id:       (n.getAttribute('data-id') || '').trim(),
        day:      parseInt(n.getAttribute('data-tag'), 10),
        months:   parseMonate(n.getAttribute('data-monate')),
        rhythm:   (n.getAttribute('data-rhythmus') || '').trim() || null,
        kind:     (n.getAttribute('data-art') || '').trim(),
        audience: (n.getAttribute('data-fuer') || '').trim().split(/\s+/).filter(Boolean),
        title:    feldText(n, 'titel'),
        short:    feldText(n, 'kurz'),
        termin:   feldText(n, 'termin'),
        who:      feldText(n, 'wen'),
        what:     feldText(n, 'was'),
        risk:     feldText(n, 'risiko'),
        wir:      feldText(n, 'wir'),
        knoten:   n
      };
    });

    var gueltig = gelesen.filter(pruefeRegel);

    /* doppelte IDs abfangen — sie würden das Detailpanel verwirren */
    var gesehen = {};
    gueltig = gueltig.filter(function (r) {
      if (gesehen[r.id]) {
        REGELWARNUNGEN.push({
          position: 0, id: r.id, titel: r.title,
          probleme: ['data-id kommt mehrfach vor, dieser Block wurde übergangen']
        });
        return false;
      }
      gesehen[r.id] = true;
      return true;
    });

    return gueltig.length ? gueltig : null;
  }

  function ladeRegeln(root) {
    REGELWARNUNGEN = [];
    var ausDom = regelnAusDOM(root);
    if (ausDom) {
      RULES = ausDom;
      REGELQUELLE = 'dom';
    } else {
      RULES = FALLBACK_RULES;
      REGELQUELLE = 'eingebaut';
    }
    if (REGELWARNUNGEN.length) {
      console.warn('[Steuerkalender] ' + REGELWARNUNGEN.length +
        ' Regelblock/Regelblöcke wurden übergangen. Details: bsteuernKalender().warnungen');
    }
  }

  /* ---------- 1d. Termintext gegen Attribute prüfen ---------- */

  function erwarteterTermintext(r) {
    var tag = r.day + '.';
    if (!r.months) return tag + ' jeden Monats';
    var namen = r.months.slice().sort(function (a, b) { return a - b; })
      .map(function (m) { return MONTHS[m]; });
    if (namen.length === 1) return tag + ' ' + namen[0];
    return tag + ' ' + namen.join(', ');
  }

  function normalisiere(s) {
    return String(s || '').toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s+und\s+/g, ', ')
      .trim();
  }

  /* ---------- 2. Zustand ---------- */

  var state = {
    offset: 0,
    solo: true,
    corp: true,
    staff: true,
    ustQuarterly: false,
    land: 'BE',
    selected: null   /* { id, due, nominal } */
  };

  var STORE = 'bsteuern.kalender.v1';

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORE);
      if (!raw) return;
      var s = JSON.parse(raw);
      if (typeof s.solo === 'boolean') state.solo = s.solo;
      if (typeof s.corp === 'boolean') state.corp = s.corp;
      if (typeof s.staff === 'boolean') state.staff = s.staff;
      if (typeof s.ustQuarterly === 'boolean') state.ustQuarterly = s.ustQuarterly;
      if (typeof s.land === 'string') state.land = s.land;
    } catch (e) { /* Storage blockiert — egal */ }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORE, JSON.stringify({
        solo: state.solo, corp: state.corp, staff: state.staff,
        ustQuarterly: state.ustQuarterly, land: state.land
      }));
    } catch (e) { /* egal */ }
  }

  /* ---------- 3. Feiertage ---------- */

  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100;
    var d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31);
    var day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
  }

  var holCache = {};

  function holidays(y) {
    var key = y + '-' + state.land;
    if (holCache[key]) return holCache[key];

    var land = state.land;
    var set = {};
    function put(d) { set[d.getMonth() + '-' + d.getDate()] = true; }
    function shift(base, days) {
      return new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
    }
    var e = easter(y);

    /* bundesweit */
    [[0, 1], [4, 1], [9, 3], [11, 25], [11, 26]].forEach(function (p) {
      put(new Date(y, p[0], p[1]));
    });
    put(shift(e, -2));   /* Karfreitag */
    put(shift(e, 1));    /* Ostermontag */
    put(shift(e, 39));   /* Christi Himmelfahrt */
    put(shift(e, 50));   /* Pfingstmontag */

    /* länderspezifisch */
    if (['BW', 'BY', 'ST'].indexOf(land) > -1) put(new Date(y, 0, 6));            /* Hl. Drei Könige */
    if (['BE', 'MV'].indexOf(land) > -1) put(new Date(y, 2, 8));                  /* Frauentag */
    if (['BW', 'BY', 'HE', 'NW', 'RP', 'SL'].indexOf(land) > -1) put(shift(e, 60)); /* Fronleichnam */
    if (land === 'SL') put(new Date(y, 7, 15));                                   /* Mariä Himmelfahrt */
    if (land === 'TH') put(new Date(y, 8, 20));                                   /* Weltkindertag */
    if (['BB', 'MV', 'SN', 'ST', 'TH', 'HB', 'HH', 'NI', 'SH'].indexOf(land) > -1) put(new Date(y, 9, 31));
    if (['BW', 'BY', 'NW', 'RP', 'SL'].indexOf(land) > -1) put(new Date(y, 10, 1)); /* Allerheiligen */
    if (land === 'SN') {                                                          /* Buß- und Bettag */
      var d = new Date(y, 10, 22);
      while (d.getDay() !== 3) d.setDate(d.getDate() - 1);
      put(d);
    }

    holCache[key] = set;
    return set;
  }

  function isHoliday(d) {
    return !!holidays(d.getFullYear())[d.getMonth() + '-' + d.getDate()];
  }

  /* ---------- 4. Fristenlogik ---------- */

  function activeAudience() {
    var a = [];
    if (state.solo) a.push('solo');
    if (state.corp) a.push('corp');
    if (state.staff) a.push('staff');
    return a;
  }

  function visibleRules() {
    var active = activeAudience();
    if (!active.length) return [];
    var wanted = state.ustQuarterly ? 'quartal' : 'monat';
    return RULES
      .filter(function (r) { return !r.rhythm || r.rhythm === wanted; })
      .filter(function (r) {
        return r.audience.some(function (x) { return active.indexOf(x) > -1; });
      });
  }

  /* § 108 Abs. 3 AO: Sa / So / Feiertag → nächster Werktag */
  function workday(d) {
    var out = new Date(d.getTime());
    while (out.getDay() === 0 || out.getDay() === 6 || isHoliday(out)) {
      out.setDate(out.getDate() + 1);
    }
    return out;
  }

  function shiftReason(nominal, due) {
    if (due.getTime() === nominal.getTime()) return '';
    var day = nominal.getDay();
    if (isHoliday(nominal)) return 'verschoben vom ' + nominal.getDate() + '., Feiertag';
    if (day === 0 || day === 6) return 'verschoben vom ' + nominal.getDate() + '., Wochenende';
    return 'verschoben vom ' + nominal.getDate() + '.';
  }

  function dayKey(d) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function fmtLong(d) { return d.getDate() + '. ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }

  function occurrences(fromMonthOffset, monthsAhead) {
    var now = new Date();
    var base = new Date(now.getFullYear(), now.getMonth() + fromMonthOffset, 1);
    var out = [];
    var rules = visibleRules();
    for (var k = 0; k < monthsAhead; k++) {
      var y = base.getFullYear();
      var m = base.getMonth() + k;
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        var nominal = new Date(y, m, r.day);
        if (nominal.getDate() !== r.day) continue;              /* z. B. 31. Februar */
        if (r.months && r.months.indexOf(nominal.getMonth()) === -1) continue;
        out.push({ rule: r, nominal: nominal, due: workday(nominal) });
      }
    }
    out.sort(function (a, b) { return a.due - b.due; });
    return out;
  }

  /* ---------- 5. ICS ---------- */

  function buildIcs(list) {
    function stamp(d) {
      return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    }
    function esc(s) {
      return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;')
        .replace(/,/g, '\\,').replace(/\n/g, '\\n');
    }
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0',
      'PRODID:-//bsteuern//Steuerkalender//DE',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'X-WR-CALNAME:Steuertermine b\u2019steuern'
    ];
    list.forEach(function (o) {
      var end = new Date(o.due.getTime());
      end.setDate(end.getDate() + 1);
      lines.push('BEGIN:VEVENT');
      lines.push('UID:' + o.rule.id + '-' + stamp(o.due) + '@bsteuern.com');
      lines.push('DTSTAMP:' + stamp(new Date()) + 'T080000Z');
      lines.push('DTSTART;VALUE=DATE:' + stamp(o.due));
      lines.push('DTEND;VALUE=DATE:' + stamp(end));
      lines.push('SUMMARY:' + esc(o.rule.title));
      lines.push('DESCRIPTION:' + esc(o.rule.what));
      lines.push('BEGIN:VALARM', 'TRIGGER:-P3D', 'ACTION:DISPLAY',
        'DESCRIPTION:' + esc(o.rule.title), 'END:VALARM');
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  /* ---------- 6. DOM-Helfer ---------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var dom = {};

  function collect() {
    dom.root      = $('[data-kal-root]');
    if (!dom.root) return false;
    dom.year      = $('[data-kal-year]', dom.root);
    dom.summary   = $('[data-kal-summary]', dom.root);
    dom.land      = $('[data-kal-land]', dom.root);
    dom.upcoming  = $('[data-kal-upcoming]', dom.root);
    dom.ics       = $('[data-kal-ics]', dom.root);
    dom.month     = $('[data-kal-month]', dom.root);
    dom.range     = $('[data-kal-range]', dom.root);
    dom.grid      = $('[data-kal-grid]', dom.root);
    dom.agenda    = $('[data-kal-agenda]', dom.root);
    dom.agendaTtl = $('[data-kal-agenda-title]', dom.root);
    dom.detail    = $('[data-kal-detail]', dom.root);
    return true;
  }

  /* ---------- 7. Rendering ---------- */

  function render() {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var view = new Date(today.getFullYear(), today.getMonth() + state.offset, 1);
    var y = view.getFullYear();
    var m = view.getMonth();
    var first = (new Date(y, m, 1).getDay() + 6) % 7;      /* Montag = 0 */
    var count = new Date(y, m + 1, 0).getDate();
    var total = Math.ceil((first + count) / 7) * 7;

    /* Termine aus Vor-, Anzeige- und Folgemonat einsammeln */
    var byDay = {};
    var spanStart = new Date(y, m - 1, 1);
    var rules = visibleRules();
    for (var k = 0; k < 3; k++) {
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        var nominal = new Date(spanStart.getFullYear(), spanStart.getMonth() + k, r.day);
        if (nominal.getDate() !== r.day) continue;
        if (r.months && r.months.indexOf(nominal.getMonth()) === -1) continue;
        var due = workday(nominal);
        var kk = dayKey(due);
        if (!byDay[kk]) byDay[kk] = [];
        byDay[kk].push({ rule: r, nominal: nominal, due: due });
      }
    }

    /* --- Tage --- */
    var days = [];
    for (var d = 0; d < total; d++) {
      var num = d - first + 1;
      var inMonth = num >= 1 && num <= count;
      var date = new Date(y, m, num);
      days.push({
        num: inMonth ? String(num) : '',
        date: date,
        inMonth: inMonth,
        isToday: inMonth && date.getTime() === today.getTime(),
        isPast: inMonth && date < today,
        occ: inMonth ? (byDay[dayKey(date)] || []) : []
      });
    }

    var monthCount = days.reduce(function (n, x) {
      return n + (x.inMonth ? x.occ.length : 0);
    }, 0);

    /* --- Kopfzeilen --- */
    if (dom.year) dom.year.textContent = String(today.getFullYear());
    if (dom.month) dom.month.textContent = MONTHS[m] + ' ' + y;
    if (dom.range) {
      dom.range.textContent = '1.–' + count + '. ' + MONTHS[m] + ' · ' +
        (monthCount === 1 ? '1 Frist' : monthCount + ' Fristen');
    }
    if (dom.agendaTtl) dom.agendaTtl.textContent = 'Deine Fristen im ' + MONTHS[m];

    /* --- Profil-Zusammenfassung --- */
    var picked = [];
    if (state.solo) picked.push('Selbstständige');
    if (state.corp) picked.push('GmbH und UG');
    if (state.staff) picked.push('Lohn');
    if (dom.summary) {
      dom.summary.textContent = picked.length
        ? monthCount + (monthCount === 1 ? ' Frist' : ' Fristen') +
          ' in diesem Monat · ' + picked.join(', ')
        : 'Ohne Auswahl zeigt der Kalender keine Fristen.';
    }

    /* --- Toggle-Zustände --- */
    setToggle('solo', state.solo);
    setToggle('corp', state.corp);
    setToggle('staff', state.staff);
    setUst();

    /* --- Kalenderraster --- */
    renderGrid(days);

    /* --- Agenda --- */
    renderAgenda(days, m);

    /* --- Nächste Termine --- */
    renderUpcoming(today);

    /* --- Detailpanel --- */
    renderDetail();
  }

  function setToggle(name, on) {
    var n = dom.root.querySelectorAll('[data-kal-toggle="' + name + '"]');
    for (var i = 0; i < n.length; i++) {
      n[i].classList.toggle('is-active', !!on);
      n[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function setUst() {
    var n = dom.root.querySelectorAll('[data-kal-ust]');
    for (var i = 0; i < n.length; i++) {
      var want = n[i].getAttribute('data-kal-ust');
      var on = (want === 'quartal') === state.ustQuarterly;
      n[i].classList.toggle('is-active', on);
      n[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function renderGrid(days) {
    if (!dom.grid) return;
    var frag = document.createDocumentFragment();

    for (var w = 0; w < 7; w++) {
      var head = el('div', 'gitter-wochentag');
      head.appendChild(el('span', 'wochentag-lang', WEEKDAYS[w]));
      head.appendChild(el('span', 'wochentag-kurz', SHORT_WD[w]));
      head.setAttribute('aria-hidden', 'true');
      frag.appendChild(head);
    }

    days.forEach(function (d) {
      var cell = el('div', 'gitter-zelle');
      if (!d.inMonth) cell.classList.add('is-out');
      if (d.isPast) cell.classList.add('is-past');
      if (d.occ.length) {
        cell.classList.add('has-events');
        cell.setAttribute('data-kal-daykey', dayKey(d.date));
      }

      var top = el('div', 'zelle-kopf');
      top.appendChild(el('span', 'zelle-zahl', d.num));
      if (d.isToday) top.appendChild(el('span', 'zelle-heute', 'Heute'));
      cell.appendChild(top);

      var events = el('div', 'zelle-termine');
      var dots = el('div', 'zelle-punkte');

      d.occ.forEach(function (o) {
        var kind = KINDS[o.rule.kind];
        var b = el('button', 'termin-chip', o.rule.short);
        b.type = 'button';
        b.style.setProperty('--kal-akzent', kind.color);
        b.style.setProperty('--kal-akzent-fg', kind.onColor);
        b.setAttribute('data-kal-open', o.rule.id + '|' + o.due.getTime() + '|' + o.nominal.getTime());
        b.setAttribute('aria-label', o.rule.title + ' am ' + fmtLong(o.due));
        if (isSelected(o)) b.classList.add('is-selected');
        events.appendChild(b);

        var dot = el('span', 'punkt-bs');
        dot.style.setProperty('--kal-akzent', kind.color);
        dots.appendChild(dot);
      });

      cell.appendChild(events);
      cell.appendChild(dots);
      frag.appendChild(cell);
    });

    dom.grid.innerHTML = '';
    dom.grid.appendChild(frag);
  }

  function renderAgenda(days, m) {
    if (!dom.agenda) return;
    var groups = days.filter(function (d) { return d.inMonth && d.occ.length; });
    dom.agenda.innerHTML = '';

    if (!groups.length) {
      dom.agenda.appendChild(el('div', 'agenda-leer',
        'In diesem Monat steht in deiner Auswahl keine Frist an.'));
      return;
    }

    var frag = document.createDocumentFragment();
    groups.forEach(function (d) {
      var g = el('div', 'agenda-gruppe');
      g.id = 'tag-' + dayKey(d.date);
      g.appendChild(el('div', 'agenda-tag', d.num + '. ' + MONTHS[m]));

      var items = el('div', 'agenda-eintraege');
      d.occ.forEach(function (o) {
        var kind = KINDS[o.rule.kind];
        var btn = el('button', 'agenda-eintrag');
        btn.type = 'button';
        btn.setAttribute('data-kal-open', o.rule.id + '|' + o.due.getTime() + '|' + o.nominal.getTime());
        if (isSelected(o)) btn.classList.add('is-selected');

        var sw = el('span', 'agenda-marke');
        sw.style.setProperty('--kal-akzent', kind.color);
        btn.appendChild(sw);
        btn.appendChild(el('span', 'agenda-titel', o.rule.title));
        btn.appendChild(el('span'));

        var note = shiftReason(o.nominal, o.due);
        btn.appendChild(el('span', 'agenda-meta', o.rule.who + (note ? ' ' + note : '')));
        items.appendChild(btn);
      });

      g.appendChild(items);
      frag.appendChild(g);
    });
    dom.agenda.appendChild(frag);
  }

  function renderUpcoming(today) {
    if (!dom.upcoming) return;
    var list = occurrences(0, 4).filter(function (o) { return o.due >= today; }).slice(0, 5);
    dom.upcoming.innerHTML = '';

    if (!list.length) {
      dom.upcoming.appendChild(el('div', 'termin-leer', 'Keine Frist in deiner Auswahl.'));
      if (dom.ics) { dom.ics.classList.add('is-disabled'); dom.ics.setAttribute('aria-disabled', 'true'); }
      return;
    }
    if (dom.ics) { dom.ics.classList.remove('is-disabled'); dom.ics.removeAttribute('aria-disabled'); }

    var frag = document.createDocumentFragment();
    list.forEach(function (o) {
      frag.appendChild(el('span', 'termin-datum',
        pad(o.due.getDate()) + '.' + pad(o.due.getMonth() + 1) + '.'));
      frag.appendChild(el('span', 'termin-titel', o.rule.title));
    });
    dom.upcoming.appendChild(frag);
  }

  function isSelected(o) {
    return !!state.selected &&
      state.selected.id === o.rule.id &&
      state.selected.due === o.due.getTime();
  }

  function renderDetail() {
    if (!dom.detail) return;
    dom.detail.innerHTML = '';

    var sel = state.selected;
    var rule = sel ? RULES.filter(function (r) { return r.id === sel.id; })[0] : null;

    if (!rule) {
      dom.detail.appendChild(el('div', 'detail-hinweis',
        'Klick auf einen Termin im Kalender, um zu sehen, wen er betrifft, was abzugeben ist und was passiert, wenn er verstreicht.'));
      return;
    }

    var kind = KINDS[rule.kind];
    var due = new Date(sel.due);
    var nominal = new Date(sel.nominal);

    var card = el('div', 'detail-karte');
    var main = el('div', 'detail-haupt');

    var meta = el('div', 'detail-meta');
    var kindEl = el('span', 'detail-art', kind.label);
    kindEl.style.setProperty('--kal-akzent', kind.color);
    kindEl.style.setProperty('--kal-akzent-fg', kind.onColor);
    meta.appendChild(kindEl);
    meta.appendChild(el('span', 'detail-datum', fmtLong(due)));
    var note = shiftReason(nominal, due);
    if (note) meta.appendChild(el('span', 'detail-verschoben', note));
    main.appendChild(meta);

    main.appendChild(el('h3', 'detail-titel', rule.title));

    var dl = el('div', 'detail-liste');
    [['Wen es betrifft', rule.who], ['Was abgegeben wird', rule.what], ['Wenn du sie verpasst', rule.risk]]
      .forEach(function (p) {
        dl.appendChild(el('span', 'detail-label', p[0]));
        dl.appendChild(el('span', 'detail-wert', p[1]));
      });
    main.appendChild(dl);

    var side = el('div', 'detail-seite');
    side.appendChild(el('span', 'seite-label', 'Mit b\u2019steuern'));
    side.appendChild(el('span', 'seite-text', rule.wir));
    var cta = el('a', 'btn-primaer btn-gross', 'Erstgespräch buchen →');
    cta.href = 'https://www.bsteuern.com/lp/kostenlose-beratung';
    side.appendChild(cta);
    var close = el('button', 'btn-primaer btn-text', 'Schließen');
    close.type = 'button';
    close.setAttribute('data-kal-close', '');
    side.appendChild(close);

    card.appendChild(main);
    card.appendChild(side);
    dom.detail.appendChild(card);
  }

  /* ---------- 8. Interaktion ---------- */

  function bind() {
    dom.root.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-kal-toggle], [data-kal-ust], [data-kal-nav], [data-kal-open], [data-kal-close], [data-kal-ics], .gitter-zelle.has-events');
      if (!t || !dom.root.contains(t)) return;

      /* Profil-Toggles */
      var tg = t.getAttribute('data-kal-toggle');
      if (tg) { state[tg] = !state[tg]; state.selected = null; saveState(); return render(); }

      /* Umsatzsteuer-Rhythmus */
      var ust = t.getAttribute('data-kal-ust');
      if (ust) {
        state.ustQuarterly = (ust === 'quartal');
        state.selected = null; saveState(); return render();
      }

      /* Monatsnavigation */
      var nav = t.getAttribute('data-kal-nav');
      if (nav) {
        if (nav === 'prev') state.offset -= 1;
        else if (nav === 'next') state.offset += 1;
        else state.offset = 0;
        return render();
      }

      /* Termin öffnen */
      var open = t.getAttribute('data-kal-open');
      if (open !== null) {
        var p = open.split('|');
        state.selected = { id: p[0], due: parseInt(p[1], 10), nominal: parseInt(p[2], 10) };
        render();
        if (dom.detail) {
          dom.detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
      }

      /* Schließen */
      if (t.hasAttribute('data-kal-close')) {
        state.selected = null;
        return render();
      }

      /* ICS-Download */
      if (t.hasAttribute('data-kal-ics')) {
        if (t.classList.contains('is-disabled')) return;
        return downloadIcs();
      }

      /* Mobile: Tag antippen → zur Agenda springen */
      if (t.classList.contains('gitter-zelle') && window.innerWidth <= 479) {
        var target = document.getElementById('tag-' + t.getAttribute('data-kal-daykey'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    /* Tastatur: Div-Buttons Enter / Space */
    dom.root.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      var t = ev.target;
      if (t.getAttribute && t.getAttribute('role') === 'button') {
        ev.preventDefault();
        t.click();
      }
    });

    /* Bundesland */
    if (dom.land) {
      dom.land.value = state.land;
      dom.land.addEventListener('change', function () {
        state.land = dom.land.value;
        state.selected = null;
        holCache = {};
        saveState();
        render();
      });
    }
  }

  function downloadIcs() {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var list = occurrences(0, 12).filter(function (o) { return o.due >= today; });
    if (!list.length) return;
    var blob = new Blob([buildIcs(list)], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'bsteuern-steuertermine.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }


  /* ---------- 13. Fristenübersicht: auf- und zuklappen ----------
     Rein visuell. Die Regeln liest die Engine unabhängig davon
     aus dem Markup — auch aus zugeklappten Gruppen. */

  function bindeFristen() {
    var liste = document.querySelector('.fristen-liste');
    if (!liste) return;

    liste.addEventListener('click', function (ev) {
      var g = ev.target.closest('.gruppe-kopf');
      if (g && liste.contains(g)) {
        g.setAttribute('aria-expanded',
          g.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
        return;
      }
      var f = ev.target.closest('.frist-zeile');
      if (!f || !liste.contains(f)) return;
      var offen = f.getAttribute('aria-expanded') === 'true';
      f.setAttribute('aria-expanded', offen ? 'false' : 'true');
      var plus = f.querySelector('.frist-plus');
      if (plus) plus.textContent = offen ? '+' : '\u2013';
    });

    console.log('[Steuerkalender] Fristenübersicht: ' +
      liste.querySelectorAll('.fristen-gruppe').length + ' Gruppen, ' +
      liste.querySelectorAll('[data-regel]').length + ' Blöcke.');
  }

  /* ---------- 9. Bundesland-Optionen ---------- */

  function fillLaender() {
    if (!dom.land || dom.land.options.length > 1) return;
    var frag = document.createDocumentFragment();
    LAENDER.forEach(function (p) {
      var o = document.createElement('option');
      o.value = p[0];
      o.textContent = p[1];
      frag.appendChild(o);
    });
    dom.land.innerHTML = '';
    dom.land.appendChild(frag);
  }

  /* ---------- 10. Start ---------- */

  function init() {
    if (!collect()) {
      console.warn('[Steuerkalender] Kein Element mit data-kal-root gefunden.');
      return;
    }
    loadState();
    ladeRegeln(dom.root);
    fillLaender();
    bind();
    bindeFristen();
    render();
    console.log('[Steuerkalender] v' + VERSION + ' aktiv. Regeln: ' +
      RULES.length + ' aus ' + (REGELQUELLE === 'dom' ? 'der Seite' : 'dem Fallback im Skript') + '.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---------- 11. Diagnose ---------- */

  window.bsteuernKalender = function () {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return {
      version: VERSION,
      regelquelle: REGELQUELLE === 'dom'
        ? 'DOM — die Regeln kommen aus der Seite'
        : 'Fallback — die Regeln kommen aus dem Skript',
      anzahlRegeln: RULES.length,
      warnungen: REGELWARNUNGEN,
      state: JSON.parse(JSON.stringify({
        offset: state.offset, solo: state.solo, corp: state.corp,
        staff: state.staff, ustQuarterly: state.ustQuarterly,
        land: state.land, selected: state.selected
      })),
      sichtbareRegeln: visibleRules().map(function (r) { return r.id; }),
      naechste12Monate: occurrences(0, 12)
        .filter(function (o) { return o.due >= today; })
        .map(function (o) {
          return fmtLong(o.due) + ' — ' + o.rule.title +
            (shiftReason(o.nominal, o.due) ? ' (' + shiftReason(o.nominal, o.due) + ')' : '');
        }),
      zielelemente: Object.keys(dom).reduce(function (acc, k) {
        acc[k] = !!dom[k]; return acc;
      }, {})
    };
  };

  /* ---------- 12. Regelprüfung ----------
     Vergleicht die Regeln auf der Seite mit den eingebauten und prüft,
     ob der sichtbare Termintext zu den Attributen passt.
     Rückgabe ist bewusst maschinenlesbar — das Node-Skript liest sie aus. */

  window.bsteuernRegelnPruefen = function () {
    var VERGLEICHSFELDER = ['day', 'months', 'rhythm', 'kind', 'audience',
      'title', 'short', 'who', 'what', 'risk', 'wir'];

    function wert(v) {
      if (Array.isArray(v)) return v.slice().sort().join(', ');
      if (v === null || v === undefined) return '';
      return String(v);
    }

    var fallbackNachId = {};
    FALLBACK_RULES.forEach(function (r) { fallbackNachId[r.id] = r; });
    var domNachId = {};
    RULES.forEach(function (r) { domNachId[r.id] = r; });

    var abweichungen = [];
    var termine = [];

    RULES.forEach(function (r) {
      /* Termintext gegen Attribute */
      if (r.termin !== undefined) {
        var soll = erwarteterTermintext(r);
        termine.push({
          id: r.id,
          sichtbar: r.termin,
          erwartet: soll,
          stimmt: normalisiere(r.termin) === normalisiere(soll)
        });
      }
      /* Feldvergleich gegen den Fallback */
      var f = fallbackNachId[r.id];
      if (!f) {
        abweichungen.push({ id: r.id, feld: '(ganze Regel)', seite: r.title, skript: 'nicht vorhanden' });
        return;
      }
      VERGLEICHSFELDER.forEach(function (k) {
        if (wert(r[k]) !== wert(f[k])) {
          abweichungen.push({ id: r.id, feld: k, seite: wert(r[k]), skript: wert(f[k]) });
        }
      });
    });

    FALLBACK_RULES.forEach(function (f) {
      if (!domNachId[f.id]) {
        abweichungen.push({ id: f.id, feld: '(ganze Regel)', seite: 'fehlt auf der Seite', skript: f.title });
      }
    });

    var terminfehler = termine.filter(function (t) { return !t.stimmt; });

    return {
      quelle: REGELQUELLE,
      anzahlRegeln: RULES.length,
      warnungen: REGELWARNUNGEN,
      termine: termine,
      terminfehler: terminfehler,
      abweichungen: abweichungen,
      sauber: REGELWARNUNGEN.length === 0 && terminfehler.length === 0
    };
  };
})();
