/* ============================================================
   b'steuern Footer — Verhalten
   Version 2.1 · für den im Webflow Designer gebauten Footer
   Kein Custom-CSS nötig. Sämtliche Gestaltung liegt im Designer.

   Neu in 2.1:
   Die Zustandsfarben der Statuszeile laufen über Combo-Klassen
   (is-warnung / is-ueberfaellig) statt über Inline-Stile.
   Weil Webflow beim Veröffentlichen die Regeln ungenutzter Klassen
   entfernt, prüft das Skript beim Start selbst, ob die Combo-Stile
   tatsächlich im CSS angekommen sind, und fällt sonst auf Inline
   zurück. Siehe CONFIG.colorMode.
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     1 — Konfiguration
     ---------------------------------------------------------- */
  var CONFIG = {
    warnDays: 3,              /* ab wann die Zeile auf Happy Lemon springt */
    actionText: '',           /* Beschriftung Handlungslink. Leer = ausgeblendet */
    actionHref: '',
    shiftToWorkday: true,     /* § 108 Abs. 3 AO */
    berlinHolidays: true,     /* 8. März als Berliner Landesfeiertag */
    forceState: null,         /* Test: 'calm' | 'soon' | 'over' | 'aus' */
    mobileMax: 479,           /* Breakpoint des Aufklapp-Menüs */

    /* --- Farbsteuerung der Statuszeile ---
       'auto'   = Combo-Klassen verwenden, wenn ihre Stile im
                  veröffentlichten CSS vorhanden sind. Sonst Inline.
       'klasse' = immer Combo-Klassen, nie Inline. Ohne Netz.
       'inline' = immer Inline, Klassen werden trotzdem gesetzt.        */
    colorMode: 'auto',

    /* Klassennamen, exakt wie im Webflow Designer angelegt */
    bandClass:  'footer-band',
    classWarn:  'is-warnung',
    classOver:  'is-ueberfaellig'
  };

  /* Rückfallfarben für den Inline-Modus.
     Müssen mit den Webflow-Variablen übereinstimmen.
     'calm' bleibt leer — dann greift die Gestaltung aus dem Designer. */
  var STATE_COLORS = {
    calm: { bg: '',        fg: ''        },
    soon: { bg: '#F6DF35', fg: '#0E0C1C' },
    over: { bg: '#FF0670', fg: '#FFFFFF' }
  };

  var RULES = [
    { title: 'Umsatzsteuer-Voranmeldung', short: 'UStVA',           day: 10 },
    { title: 'Lohnsteuer-Anmeldung',      short: 'Lohnsteuer',      day: 10 },
    { title: 'Zusammenfassende Meldung',  short: 'ZM',              day: 25 },
    { title: 'Einkommensteuererklärung',  short: 'Einkommensteuer', day: 31, month: 6 }
  ];

  var MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli',
                'August','September','Oktober','November','Dezember'];

  /* ----------------------------------------------------------
     2 — Datum und Feiertage
     ---------------------------------------------------------- */
  function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function today() { return midnight(new Date()); }
  function key(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }

  /* Ostersonntag nach Meeus/Jones/Butcher */
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100;
    var d = Math.floor(b / 4), e = b % 4;
    var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var mo = Math.floor((h + l - 7 * m + 114) / 31);
    var da = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, mo - 1, da);
  }

  var holidayCache = {};
  function holidays(y) {
    if (holidayCache[y]) return holidayCache[y];
    var e = easter(y), set = {};
    var list = [
      new Date(y, 0, 1),   addDays(e, -2),      addDays(e, 1),
      new Date(y, 4, 1),   addDays(e, 39),      addDays(e, 50),
      new Date(y, 9, 3),   new Date(y, 11, 25), new Date(y, 11, 26)
    ];
    if (CONFIG.berlinHolidays) list.push(new Date(y, 2, 8));
    list.forEach(function (d) { set[key(d)] = true; });
    holidayCache[y] = set;
    return set;
  }

  function isFreeDay(d) {
    var wd = d.getDay();
    if (wd === 0 || wd === 6) return true;
    return holidays(d.getFullYear())[key(d)] === true;
  }

  function toWorkday(d) {
    if (!CONFIG.shiftToWorkday) return d;
    var out = d, guard = 0;
    while (isFreeDay(out) && guard < 14) { out = addDays(out, 1); guard++; }
    return out;
  }

  function build(year, monthIndex, day) {
    var d = new Date(year, monthIndex, day);
    return d.getDate() === day ? d : null;
  }

  /* ----------------------------------------------------------
     3 — Fristen ermitteln
     ---------------------------------------------------------- */
  function scan(direction) {
    var t = today(), best = null;
    var to = direction > 0 ? 24 : -24;

    RULES.forEach(function (r) {
      for (var k = 0; direction > 0 ? k <= to : k >= to; k += direction) {
        var base = new Date(t.getFullYear(), t.getMonth() + k, 1);
        if (r.month !== undefined && base.getMonth() !== r.month) continue;
        var raw = build(base.getFullYear(), base.getMonth(), r.day);
        if (!raw) continue;
        var d = toWorkday(raw);
        if (direction > 0 && d < t) continue;
        if (direction < 0 && d >= t) continue;
        if (!best ||
            (direction > 0 && d < best.date) ||
            (direction < 0 && d > best.date)) {
          best = { title: r.title, short: r.short, date: d, shifted: d.getTime() !== raw.getTime() };
        }
        break;
      }
    });

    if (best) best.days = Math.round((best.date - t) / 86400000);
    return best;
  }

  /* ----------------------------------------------------------
     4 — Texte
     ---------------------------------------------------------- */
  function fmt(d) { return d.getDate() + '. ' + MONTHS[d.getMonth()]; }

  function relative(days) {
    if (days < 0) {
      var n = Math.abs(days);
      return 'seit ' + n + (n === 1 ? ' Tag' : ' Tagen') + ' offen';
    }
    if (days === 0) return 'heute';
    if (days === 1) return 'morgen';
    return 'in ' + days + ' Tagen';
  }

  function isNarrow() { return window.matchMedia('(max-width: 767px)').matches; }

  function copyFor(state, ref) {
    var name = isNarrow() ? (ref.short || ref.title) : ref.title;
    if (state === 'calm') return {
      text: isNarrow() ? ('Nächste Frist: ' + name)
                       : ('Nächste Frist: ' + name + ' am ' + fmt(ref.date)),
      note: isNarrow() ? fmt(ref.date) : relative(ref.days)
    };
    if (state === 'soon') return {
      text: name + ' fällig ' + relative(ref.days), note: fmt(ref.date)
    };
    if (state === 'over') return {
      text: isNarrow() ? (name + ' überfällig')
                       : (name + ' war am ' + fmt(ref.date) + ' fällig'),
      note: relative(ref.days)
    };
    return { text: '', note: '' };
  }

  /* ----------------------------------------------------------
     5 — Zustandsfarben: Combo-Klasse oder Inline
     ---------------------------------------------------------- */

  /* Misst die Hintergrundfarbe einer Klassenkombination an einem
     kurzlebigen Element außerhalb des sichtbaren Bereichs.
     transition wird abgeschaltet, damit nicht ein Zwischenwert
     einer laufenden Überblendung gemessen wird. */
  function probeBackground(className) {
    var el = document.createElement('div');
    el.className = className;
    el.style.position = 'absolute';
    el.style.left = '-99999px';
    el.style.top = '0';
    el.style.width = '1px';
    el.style.height = '1px';
    el.style.transition = 'none';
    document.body.appendChild(el);
    var value = window.getComputedStyle(el).backgroundColor;
    document.body.removeChild(el);
    return value;
  }

  /* Ergebnis wird einmal ermittelt und gemerkt. */
  var comboAvailable = null;

  function useClasses() {
    if (comboAvailable !== null) return comboAvailable;

    if (CONFIG.colorMode === 'klasse') { comboAvailable = true;  return true; }
    if (CONFIG.colorMode === 'inline') { comboAvailable = false; return false; }

    try {
      var plain = probeBackground(CONFIG.bandClass);
      var warn  = probeBackground(CONFIG.bandClass + ' ' + CONFIG.classWarn);
      comboAvailable = (plain !== warn);
    } catch (e) {
      comboAvailable = false;
    }

    if (!comboAvailable && window.console && console.info) {
      console.info('[bsteuern-footer] Die Combo-Klasse "' + CONFIG.classWarn +
        '" hat im veröffentlichten CSS keine eigene Hintergrundfarbe. ' +
        'Webflow entfernt die Regeln ungenutzter Klassen beim Publish. ' +
        'Die Farben werden ersatzweise per Inline-Stil gesetzt.');
    }
    return comboAvailable;
  }

  function classFor(state) {
    if (state === 'soon') return CONFIG.classWarn;
    if (state === 'over') return CONFIG.classOver;
    return null;
  }

  /* Setzt den Zustand an einem Element.
     Die Klassen werden in jedem Modus gesetzt — sie sind auch als
     Anknüpfungspunkt für eigenes CSS oder Analytics nützlich.
     Inline-Farben nur, wenn die Combo-Stile nicht verfügbar sind. */
  function applyState(el, state, withBackground) {
    if (!el) return;

    el.classList.remove(CONFIG.classWarn, CONFIG.classOver);
    var cls = classFor(state);
    if (cls) el.classList.add(cls);

    if (useClasses()) {
      if (withBackground) el.style.backgroundColor = '';
      el.style.color = '';
      return;
    }

    var c = STATE_COLORS[state] || STATE_COLORS.calm;
    if (withBackground) el.style.backgroundColor = c.bg;
    el.style.color = c.fg;
  }

  /* ----------------------------------------------------------
     6 — Statuszeile zeichnen
     ---------------------------------------------------------- */
  function pick(root, name) { return root.querySelector('[data-bs="' + name + '"]'); }

  function renderBand(root) {
    var band = pick(root, 'band');
    if (!band) return;

    var next = scan(1);
    if (!next) { band.style.display = 'none'; return; }

    var state = CONFIG.forceState || (next.days <= CONFIG.warnDays ? 'soon' : 'calm');

    if (state === 'aus') { band.style.display = 'none'; return; }
    band.style.display = '';

    var ref = state === 'over' ? (scan(-1) || next) : next;
    var copy = copyFor(state, ref);

    var elText = pick(band, 'text');
    var elNote = pick(band, 'note');
    if (elText) elText.textContent = copy.text;
    if (elNote) elNote.textContent = copy.note;

    applyState(band, state, true);

    var action = pick(band, 'action');
    if (action) {
      if (CONFIG.actionText && CONFIG.actionHref) {
        var t = pick(action, 'action-text');
        if (t) t.textContent = CONFIG.actionText;
        action.setAttribute('href', CONFIG.actionHref);
        action.style.display = '';
        applyState(action, state, false);
      } else {
        action.style.display = 'none';
      }
    }
  }

  /* ----------------------------------------------------------
     7 — Aufklapp-Navigation
     ---------------------------------------------------------- */
  var mqMobile = window.matchMedia('(max-width: ' + CONFIG.mobileMax + 'px)');
  var mqNarrow = window.matchMedia('(max-width: 767px)');

  function setOpen(col, open) {
    var toggle  = pick(col, 'toggle');
    var body    = pick(col, 'body');
    var head    = pick(col, 'head');
    var chevron = pick(col, 'chevron');
    var mobile  = mqMobile.matches;

    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');

    /* Ab 480 px werden alle Inline-Stile entfernt, damit die
       Designer-Gestaltung wieder greift. Das ist der Grund, warum
       hier kein Webflow-Interaction verwendet wird. */
    var hide = mobile && !open ? 'none' : '';
    if (body) body.style.display = hide;
    if (head) head.style.display = hide;
    if (chevron) chevron.style.transform = (mobile && open) ? 'rotate(90deg)' : '';
  }

  function initAccordion(root) {
    var cols = root.querySelectorAll('[data-bs="col"]');
    Array.prototype.forEach.call(cols, function (col, i) {
      var toggle = pick(col, 'toggle');
      var body   = pick(col, 'body');
      if (!toggle || !body) return;

      var id = 'footer-panel-' + (i + 1);
      body.setAttribute('id', id);
      toggle.setAttribute('aria-controls', id);

      function flip() {
        if (!mqMobile.matches) return;
        setOpen(col, toggle.getAttribute('aria-expanded') !== 'true');
      }

      toggle.addEventListener('click', flip);
      toggle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          flip();
        }
      });

      setOpen(col, !mqMobile.matches);
    });
  }

  function resetAccordion(root) {
    Array.prototype.forEach.call(root.querySelectorAll('[data-bs="col"]'), function (col) {
      setOpen(col, !mqMobile.matches);
    });
  }

  /* ----------------------------------------------------------
     8 — Start
     ---------------------------------------------------------- */
  function boot() {
    var root = document.querySelector('.footer');
    if (!root) return;

    var year = pick(root, 'year');
    if (year) year.textContent = String(new Date().getFullYear());

    renderBand(root);
    initAccordion(root);

    /* Nur auf echte Breakpoint-Wechsel hören. Ein resize-Listener würde
       auf iOS beim Ein- und Ausblenden der Adressleiste alles zuklappen. */
    function onBreak()  { resetAccordion(root); renderBand(root); }
    function onNarrow() { renderBand(root); }

    if (mqMobile.addEventListener) {
      mqMobile.addEventListener('change', onBreak);
      mqNarrow.addEventListener('change', onNarrow);
    } else if (mqMobile.addListener) {
      mqMobile.addListener(onBreak);
      mqNarrow.addListener(onNarrow);
    }

    setInterval(function () { renderBand(root); }, 60 * 60 * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* Diagnose: bsteuernFristen() in der Browser-Konsole */
  window.bsteuernFristen = function () {
    var n = scan(1), p = scan(-1);
    var band = document.querySelector('[data-bs="band"]');
    return {
      heute: today().toISOString().slice(0, 10),
      naechste: n && { titel: n.title, datum: n.date.toISOString().slice(0, 10), tage: n.days, verschoben: n.shifted },
      letzte:   p && { titel: p.title, datum: p.date.toISOString().slice(0, 10), tage: p.days, verschoben: p.shifted },
      zustand: CONFIG.forceState || (n && n.days <= CONFIG.warnDays ? 'soon' : 'calm'),
      farbmodus: CONFIG.colorMode,
      comboStileGefunden: useClasses(),
      klassenAmBand: band ? band.className : null
    };
  };
})();
