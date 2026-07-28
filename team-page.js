/*
 * b'steuern — Teamseite
 * team-page.js  ·  konsolidiert
 *
 * Drei Module in einer Datei. Jedes Modul steigt still aus,
 * wenn seine Elemente fehlen — die Datei kann also schon
 * eingebunden werden, bevor die Sektionen gebaut sind.
 *
 *   1. initRaster()  Farbvergabe, Shuffle, Themen-Filter, Karten-Flip
 *   2. initZahlen()  Zähler-Animation der Stats-Leiste
 *   3. initPille()   „nach oben"-Pille ein-/ausblenden
 *   4. initRollen() Offene Rollen aus Homerun, ersetzt den CMS-Inhalt
 *
 * Erwartete Klassen siehe README im selben Ordner.
 * Kein Finsweet, keine Abhängigkeiten.
 *
 * ─── ÄNDERUNGEN GEGENÜBER DER VORVERSION ───
 * A) --k-akzent-text ergänzt: Akzentfarbe als TEXT auf weißem
 *    Grund („Frag mich über"-Thema). Happy Lemon wird zu Ink,
 *    sonst unlesbar. Prototyp-Parität, siehe topicColor.
 * B) KONTRAST_MODUS eingeführt. 'prototyp' bildet exakt die
 *    Prototyp-Regel ab (nur Gelb bekommt Ink). 'wcag' wählt
 *    zwischen Cream und Ink nach echtem WCAG-Kontrast — damit
 *    bestehen auch Crimson und Türkis AA. Umschalten ändert das
 *    Aussehen zweier Rückseiten, deshalb Default = 'prototyp'.
 * C) Palette auf vier Farben reduziert. Statt der Rec-601-Heuristik
 *    entscheidet jetzt eine explizite Tabelle (MARKENFARBEN). Die
 *    Heuristik bleibt nur noch als Notfall-Fallback für Hexwerte,
 *    die nicht zur Palette gehören — samt Konsolenwarnung.
 * D) --k-hover ergänzt: Indigo-Karten weichen beim Hover auf Ink
 *    aus, sonst wäre der Wechsel Indigo→Indigo unsichtbar.
 * E) Modul 4 (initRollen) ergänzt. Es holt die offenen Stellen aus
 *    Homerun und klont dafür die bestehende CMS-Zeile, statt eigenes
 *    Markup zu bauen — dieselbe DOM-Struktur, nur anderer Text, also
 *    zwangsläufig dieselbe Optik. Fällt Homerun aus, bleiben die
 *    CMS-Zeilen stehen. Konfiguration im Objekt HOMERUN.
 *    Enthält zugleich den Zähler aus Kapitel 7.7 (Weg B).
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════
     KONFIGURATION
     ══════════════════════════════════════════ */

  var CREAM = '#F5EFE3';
  var INK   = '#0E0C1C';
  var INDIGO = '#3D2BD5';

  /* 'prototyp' → Rückseitentext ist Cream, außer auf Happy Lemon.
                  Bildet den Prototyp exakt ab. Crimson und Türkis
                  bleiben damit unter WCAG AA.
     'wcag'     → Rückseitentext ist die kontraststärkere der beiden
                  Markenfarben. Betrifft genau zwei Farben.          */
  var KONTRAST_MODUS = 'prototyp';

  /* ─── PALETTE ───────────────────────────────────────────────────
     Vier Farben, bewusst reduziert. Schlüssel sind kleingeschrieben,
     die Werte kommen normalisiert aus dem CMS-Feld „Akzent-Hex".

       kontrast  Text AUF der Akzentfläche (Rückseite, Ecken-Button)
       text      Akzent ALS Text auf weißem Grund („Frag mich über")
       hover     Ecken-Button beim Hover — Indigo weicht auf Ink aus,
                 sonst wäre Indigo→Indigo unsichtbar

     Gemessene Kontraste:
       Farbe        Cream drauf  Ink drauf  als Text /Weiß
       Indigo              7.32       2.30            8.38
       Happy Lemon         1.18      14.27            1.35
       Crimson             3.33       5.07            3.81
       Türkis              2.75       6.14            3.14

     Als Thementext auf Weiß besteht nur Indigo AA (4.5). Die drei
     anderen stehen hier auf Prototyp-Parität — willst du AA, setz
     ihr „text" auf INK.                                             */
  var MARKENFARBEN = {
    '#3d2bd5': { name: 'Royal Indigo',      proto: CREAM, wcag: CREAM, text: '#3D2BD5', hover: INK    },
    '#f6df35': { name: 'Happy Lemon',       proto: INK,   wcag: INK,   text: INK,       hover: INDIGO },
    '#ff0670': { name: 'Crimson',           proto: CREAM, wcag: INK,   text: '#FF0670', hover: INDIGO },
    '#00a1aa': { name: 'Persian Turquoise', proto: CREAM, wcag: INK,   text: '#00A1AA', hover: INDIGO }
  };

  /* ─── HOMERUN ───────────────────────────────────────────────────
     Quelle der offenen Stellen. Die CMS-Collection „Offene Rollen"
     bleibt im Designer die einzige Design-Quelle und dient als
     Vorlage und als Ausfallnetz.

       aktiv      false → Modul rührt nichts an, CMS-Zeilen bleiben
       id         Widget-ID aus Homerun (Settings → Embed jobs)
       sprache    'de' → lädt widget-de.html
       trenner    Zeichen, an dem der Homerun-Jobtitel in Titel und
                  Funktion geteilt wird. Siehe Kapitel 7b.2.
       neuerTab   Homerun liegt auf fremder Domain
       timeout    ms, danach bleibt die CMS-Liste stehen
       ignoriere  Linktexte, die keine Stelle sind

     Der Endpunkt ist von Homerun nicht dokumentiert. Genau deshalb
     ist jeder Schritt hier ergebnisoffen: schlägt irgendetwas fehl,
     wird nichts ersetzt statt etwas Kaputtes gezeigt.              */
  var HOMERUN = {
    aktiv:     true,
    id:        'liulak29bztrayg1bo4h',
    sprache:   'de',
    trenner:   '\u00B7',
    neuerTab:  true,
    timeout:   6000,
    ignoriere: /^(alle\s|all\s|mehr\s|weitere\s|view\s+all|see\s+all)/i
  };

  /* ══════════════════════════════════════════
     HELFER
     ══════════════════════════════════════════ */

  function reduziert() {
    return !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function kannAnimieren() {
    return !reduziert() && typeof Element.prototype.animate === 'function';
  }

  /* Hex → [r,g,b]; null bei ungültiger Eingabe */
  function zuRgb(hex) {
    if (!hex) return null;
    hex = String(hex).trim().replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16)
    ];
  }

  /* Wahrgenommene Helligkeit nach Rec. 601 — die Regel des Prototyps */
  function istDunkel(hex) {
    var rgb = zuRgb(hex);
    if (!rgb) return true; // Fallback: Indigo gilt als dunkel
    return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) < 150;
  }

  /* Relative Luminanz nach WCAG 2.1 */
  function luminanz(hex) {
    var rgb = zuRgb(hex);
    if (!rgb) return 0;
    var k = rgb.map(function (c) {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2];
  }

  function kontrast(a, b) {
    var la = luminanz(a), lb = luminanz(b);
    var hoch = Math.max(la, lb), tief = Math.min(la, lb);
    return (hoch + 0.05) / (tief + 0.05);
  }

  /* Hex → '#rrggbb' kleingeschrieben, damit die Palette greift,
     egal wie es im CMS getippt wurde (#3D2BD5, 3d2bd5, #F63 …) */
  function normHex(hex) {
    var rgb = zuRgb(hex);
    if (!rgb) return null;
    return '#' + rgb.map(function (c) {
      return ('0' + c.toString(16)).slice(-2);
    }).join('');
  }

  var gemeldet = {};

  /* Liefert alle drei Folgefarben zu einem Akzent.
     Erst die Palette, dann — falls unbekannt — die alte Heuristik
     plus eine einmalige Warnung pro Hexwert. */
  function farbRegel(akzent) {
    var k = normHex(akzent);
    var e = k && MARKENFARBEN[k];

    if (e) {
      return {
        kontrast: KONTRAST_MODUS === 'wcag' ? e.wcag : e.proto,
        text: e.text,
        hover: e.hover
      };
    }

    if (k && !gemeldet[k] && window.console && console.warn) {
      gemeldet[k] = true;
      console.warn('[team-page] Akzentfarbe ' + k + ' geh\u00F6rt nicht zur ' +
        'Palette. Erlaubt: ' + Object.keys(MARKENFARBEN).join(', ') +
        '. Pr\u00FCf das CMS-Feld „Akzent-Hex" — h\u00E4ufigster Fall ist das ' +
        'alte T\u00FCrkis #00a896 statt #00a1aa. Fallback greift.');
    }

    /* Fallback: Heuristik wie zuvor */
    var dunkel = istDunkel(akzent);
    return {
      kontrast: KONTRAST_MODUS === 'wcag'
        ? (kontrast(CREAM, akzent) >= kontrast(INK, akzent) ? CREAM : INK)
        : (dunkel ? CREAM : INK),
      text: zuRgb(akzent) ? (dunkel ? akzent : INK) : INDIGO,
      hover: INDIGO
    };
  }

  function mischen(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ══════════════════════════════════════════
     1. TEAM-RASTER
     ══════════════════════════════════════════ */

  var ALLE = 'Alle';
  var JOIN_POS = 7; // Position 8, 0-basiert

  function initRaster() {
    var grid = document.querySelector('.team-grid');
    if (!grid) return;

    var items = Array.prototype.slice.call(grid.querySelectorAll('.team-item'));
    if (!items.length) return;

    /* Farbvergabe pro Person.
       Die Akzentfarbe kommt aus dem CMS (Feld „Akzent-Hex" →
       Custom Attribute data-akzent am .team-item). Webflow lässt
       kein style-Attribut binden, daher der Umweg.
       Abgeleitet werden hier drei Folgefarben:
         --k-kontrast     Text auf der Akzentfläche
         --k-akzent-text  Akzent als Text auf weißem Grund
         --k-hover        Ecken-Button beim Hover */
    items.forEach(function (el, i) {
      el.setAttribute('data-tid', 't' + i);

      var ausData = el.getAttribute('data-akzent');
      if (ausData && ausData.trim()) {
        el.style.setProperty('--k-akzent', ausData.trim());
      }

      var akzent = getComputedStyle(el).getPropertyValue('--k-akzent').trim();
      var regel = farbRegel(akzent);
      el.style.setProperty('--k-kontrast', regel.kontrast);
      el.style.setProperty('--k-akzent-text', regel.text);
      el.style.setProperty('--k-hover', regel.hover);
    });

    /* Join-Karte aus der Vorlage holen (optional) */
    var join = document.getElementById('karte-join-vorlage');
    if (join) {
      join.classList.add('team-item');
      join.removeAttribute('id');
      join.setAttribute('data-tid', 'join');
      join.classList.remove('ist-vorlage');
    }

    var reihenfolge = mischen(items);
    var aktivThema = ALLE;

    /* Chips aus den vorhandenen Daten ableiten */
    var themen = [];
    items.forEach(function (el) {
      var t = el.getAttribute('data-topic');
      if (t && themen.indexOf(t) === -1) themen.push(t);
    });
    themen.sort(function (a, b) { return a.localeCompare(b, 'de'); });

    var chipListe = document.querySelector('.chip-liste');
    var countEl = document.querySelector('.filter-count');
    var chips = {};

    function baueChips() {
      if (!chipListe || !themen.length) return;
      [ALLE].concat(themen).forEach(function (t) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.textContent = t;
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () { setThema(t); });
        chipListe.appendChild(b);
        chips[t] = b;
      });
    }

    function zeichneChips() {
      Object.keys(chips).forEach(function (t) {
        var aktiv = (t === aktivThema);
        chips[t].classList.toggle('ist-aktiv', aktiv);
        chips[t].setAttribute('aria-pressed', aktiv ? 'true' : 'false');
      });
    }

    function render() {
      var sichtbar = reihenfolge.filter(function (el) {
        return aktivThema === ALLE || el.getAttribute('data-topic') === aktivThema;
      });

      reihenfolge.forEach(function (el) {
        el.classList.toggle('ist-verborgen', sichtbar.indexOf(el) === -1);
        grid.appendChild(el);
      });

      if (join) {
        var anker = sichtbar[Math.min(JOIN_POS, sichtbar.length)] || null;
        grid.insertBefore(join, anker);
      }

      if (countEl) {
        countEl.textContent = sichtbar.length + ' von ' + items.length +
          ' \u00B7 zuf\u00E4llig gemischt, nie nach Rang';
      }
      zeichneChips();
      return sichtbar;
    }

    /* FLIP-Technik: Positionen vorher merken, Differenz animieren */
    function positionenVorher() {
      var m = {};
      Array.prototype.forEach.call(grid.children, function (el) {
        if (!el.classList.contains('ist-verborgen')) {
          m[el.getAttribute('data-tid')] = el.getBoundingClientRect();
        }
      });
      return m;
    }

    function gleiteAn(vorher) {
      if (!kannAnimieren()) return;
      Array.prototype.forEach.call(grid.children, function (el, i) {
        if (el.classList.contains('ist-verborgen')) return;
        var verzoegerung = Math.min(i, 22);
        var b = vorher[el.getAttribute('data-tid')];

        if (!b) {
          el.animate(
            [{ opacity: 0, transform: 'translateY(12px)' },
             { opacity: 1, transform: 'none' }],
            { duration: 380, delay: verzoegerung * 16,
              easing: 'cubic-bezier(0.2,0.8,0.2,1)' }
          );
          return;
        }

        var a = el.getBoundingClientRect();
        var dx = b.left - a.left, dy = b.top - a.top;
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;

        el.animate(
          [
            { transform: 'perspective(1400px) translate(' + dx + 'px,' + dy + 'px) rotateY(0deg)' },
            { transform: 'perspective(1400px) translate(' + (dx / 2) + 'px,' + (dy / 2) + 'px) rotateY(90deg) scale(0.96)', offset: 0.5 },
            { transform: 'perspective(1400px) translate(0px,0px) rotateY(0deg) scale(1)' }
          ],
          { duration: 880, delay: verzoegerung * 26,
            easing: 'cubic-bezier(0.45,0.05,0.3,1)' }
        );
      });
    }

    function setThema(t) {
      if (t === aktivThema) return;
      aktivThema = t;
      var vorher = positionenVorher();
      render();
      gleiteAn(vorher);
    }

    function neuMischen() {
      reihenfolge = mischen(items);
      var vorher = positionenVorher();
      render();
      gleiteAn(vorher);
    }

    /* Karten-Flip per Event-Delegation */
    function dreheKarte(karte) {
      karte.classList.toggle('ist-offen');
      var offen = karte.classList.contains('ist-offen');
      karte.setAttribute('aria-expanded', offen ? 'true' : 'false');
      karte.setAttribute('aria-label', offen ? 'Steuertipp schlie\u00DFen' : 'Steuertipp anzeigen');
    }

    grid.addEventListener('click', function (e) {
      if (!e.target.closest) return;
      var karte = e.target.closest('.karte-flip');
      if (!karte || !grid.contains(karte)) return;
      if (e.target.closest('a')) return; // Links der Join-Karte nicht abfangen
      dreheKarte(karte);
    });

    grid.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (!e.target.closest) return;
      var karte = e.target.closest('.karte-flip');
      if (!karte) return;
      e.preventDefault();
      dreheKarte(karte);
    });

    items.forEach(function (el) {
      var karte = el.querySelector('.karte-flip');
      if (!karte) return;
      karte.setAttribute('role', 'button');
      karte.setAttribute('tabindex', '0');
      karte.setAttribute('aria-expanded', 'false');
      karte.setAttribute('aria-label', 'Steuertipp anzeigen');
    });

    var btn = document.querySelector('.btn-mischen');
    if (btn) btn.addEventListener('click', neuMischen);

    baueChips();
    render();
  }

  /* ══════════════════════════════════════════
     2. ZÄHLER-ANIMATION
     Liest die echten Endwerte aus dem HTML und
     zählt nur visuell darauf zu. Ohne JS steht
     immer die richtige Zahl im Quelltext.
     ══════════════════════════════════════════ */

  function initZahlen() {
    var sek = document.querySelector('.sektion-zahlen');
    if (!sek) return;

    var els = sek.querySelectorAll('.zahl-wert');
    if (!els.length) return;
    if (reduziert() || typeof IntersectionObserver === 'undefined') return;

    var ziele = [];
    Array.prototype.forEach.call(els, function (el) {
      var m = el.textContent.match(/^([^0-9]*)(\d+)(.*)$/);
      if (!m) return;
      var ziel = parseInt(m[2], 10);
      ziele.push({
        el: el, pre: m[1], suf: m[3],
        start: ziel > 1000 ? ziel - 10 : 0,
        ziel: ziel
      });
    });
    if (!ziele.length) return;

    var fertig = false;
    function lauf() {
      if (fertig) return;
      fertig = true;
      var dauer = 1100, t0 = performance.now();
      function ease(x) { return 1 - Math.pow(1 - x, 3); }
      function tick(jetzt) {
        var p = Math.min(1, (jetzt - t0) / dauer), k = ease(p);
        ziele.forEach(function (z) {
          z.el.textContent = z.pre + Math.round(z.start + (z.ziel - z.start) * k) + z.suf;
        });
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    var io = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) { io.disconnect(); lauf(); }
      });
    }, { threshold: 0.01 });
    io.observe(sek);
    setTimeout(lauf, 1800); // Sicherheitsnetz
  }

  /* ══════════════════════════════════════════
     3. „NACH OBEN"-PILLE
     ══════════════════════════════════════════ */

  function initPille() {
    var p = document.querySelector('.pille-oben');
    if (!p) return;

    p.setAttribute('role', 'button');
    p.setAttribute('tabindex', '0');

    function hoch() {
      window.scrollTo({ top: 0, behavior: reduziert() ? 'auto' : 'smooth' });
    }
    p.addEventListener('click', hoch);
    p.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hoch(); }
    });

    var sichtbar = false;
    window.addEventListener('scroll', function () {
      var soll = window.scrollY > 700;
      if (soll !== sichtbar) {
        sichtbar = soll;
        p.classList.toggle('ist-sichtbar', soll);
      }
    }, { passive: true });
  }

  /* ══════════════════════════════════════════
     4. OFFENE ROLLEN AUS HOMERUN
     Zielcontainer:  .rollen-ziel     leeres Div im Designer
     Vorlage:        .rolle-vorlage   versteckte Zeile im Designer
     Ausfallnetz:    .rollen-fallback statischer Hinweis

     Ablauf:
       a) Zähler auf der Join-Karte auf die CMS-Zeilen setzen
       b) widget-de.html von Homerun holen
       c) Links daraus lesen (Titel + Standort/Typ)
       d) für jede Stelle die erste CMS-Zeile klonen, Text tauschen
       e) Zähler neu setzen

     Es wird bewusst kein eigenes Markup gebaut. Der Klon trägt
     alle Designer-Klassen, das Pfeil-SVG und die Hover-Regeln
     aus Abschnitt 8 der CSS — die Optik kann also gar nicht
     abweichen.

     Fehlerfälle und ihr Verhalten — in allen bleibt die Liste
     versteckt und der statische Hinweis .rollen-fallback steht:
       kein .rollen-ziel           → Modul steigt still aus
       keine Vorlage gefunden      → Modul steigt still aus
       fetch/CORS/Timeout/HTTP≠200 → Warnung in der Konsole
       Homerun liefert 0 Stellen   → still, das ist kein Fehler
     ══════════════════════════════════════════ */

  function homerunQuelle() {
    return 'https://embed.homerun.co/' + HOMERUN.id +
           '/widget-' + HOMERUN.sprache + '.html?t=' + Date.now();
  }

  function textNorm(wert) {
    return String(wert == null ? '' : wert).replace(/\s+/g, ' ').trim();
  }

  /* Setzt die Zahl auf der Join-Karte (Kapitel 7.7, Weg B).
     Ohne Argument werden die Zeilen gezählt — bewusst nur die INNERHALB
     von .rollen-ziel. Die versteckte Vorlage und die Zeile im
     Fallback-Hinweis tragen ebenfalls .rolle-zeile, stehen aber
     außerhalb; sie lägen sonst als Geisterstellen in der Zahl. */
  function zaehleRollen(anzahl) {
    var ziel = document.querySelector('.join-anzahl');
    if (!ziel) return;

    var n = (typeof anzahl === 'number')
      ? anzahl
      : document.querySelectorAll('.rollen-ziel .rolle-zeile').length;

    ziel.textContent = (n === 0)
      ? 'Initiativ bewerben'
      : n + (n === 1 ? ' offene Rolle' : ' offene Rollen');
  }

  /* Standort und Anstellungsart stehen als Geschwister neben dem
     Link. Sie werden EINZELN eingesammelt und mit dem Trennzeichen
     verbunden — sonst verkleben zwei benachbarte <span> gemessen zu
     „Remote Voll- oder Teilzeit" ohne Trenner dazwischen. */
  function sammleMeta(zeile, link, titel) {
    if (!zeile) return '';
    var teile = [];

    Array.prototype.forEach.call(zeile.childNodes, function (kind) {
      if (kind === link) return;
      if (kind.contains && kind.contains(link)) return;

      var t = textNorm(kind.textContent);
      t = textNorm(t.replace(/^[\s\u00B7\u2022|,;]+/, ''));
      if (t && t !== titel && teile.indexOf(t) === -1) teile.push(t);
    });

    if (teile.length) return teile.join(' \u00B7 ');

    /* Notfall: Meta steckt im selben Knoten wie der Link */
    var gesamt = textNorm(zeile.textContent);
    var rest = (gesamt.indexOf(titel) === 0)
      ? gesamt.slice(titel.length)
      : gesamt.split(titel).join(' ');
    return textNorm(rest.replace(/^[\s\u00B7\u2022|,;\-\u2013\u2014]+/, ''));
  }

  /* Homerun liefert HTML ohne zugesicherte Struktur. Deshalb wird
     generisch gelesen: jeder Link mit Text ist eine Stelle, der
     Rest seiner Zeile ist Standort und Anstellungsart. */
  function leseJobs(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var jobs = [];
    var gesehen = {};

    Array.prototype.forEach.call(doc.querySelectorAll('a[href]'), function (a) {
      var titel = textNorm(a.textContent);
      var href  = a.getAttribute('href') || '';

      if (!titel) return;
      if (HOMERUN.ignoriere.test(titel)) return;
      if (!href || href.charAt(0) === '#' || /^javascript:/i.test(href)) return;

      /* Der geparste Baum hat keine eigene Basis-URL — relative
         Pfade müssen von Hand gegen den Widget-Host aufgelöst
         werden, sonst zeigen sie auf bsteuern.com. */
      try { href = new URL(href, 'https://embed.homerun.co/').href; } catch (e) {}

      if (gesehen[href]) return;
      gesehen[href] = true;

      var zeile = (a.closest && a.closest('li')) || a.parentNode;
      jobs.push({ titel: titel, meta: sammleMeta(zeile, a, titel), url: href });
    });

    return jobs;
  }

  /* Teilt den Homerun-Jobtitel am Trennzeichen auf:
       „Der erste gute Eindruck · Onboarding & Betreuung"  + „Köln"
       →  Titel: Der erste gute Eindruck
          Sub:   Onboarding & Betreuung · Köln
     Ohne Trennzeichen wandert der ganze Titel nach oben und nur
     Standort/Typ in die Unterzeile. */
  function teileJob(job) {
    var titel = job.titel;
    var teile = [];
    var pos   = titel.indexOf(HOMERUN.trenner);

    if (pos > 0) {
      teile.push(textNorm(titel.slice(pos + HOMERUN.trenner.length)));
      titel = textNorm(titel.slice(0, pos));
    }
    if (job.meta) teile.push(job.meta);

    return {
      titel: titel,
      sub:   teile.filter(Boolean).join(' ' + HOMERUN.trenner + ' '),
      url:   job.url
    };
  }

  /* Klont die Vorlagenzeile und tauscht Text und Ziel */
  function baueZeile(vorlage, job) {
    var knoten = vorlage.cloneNode(true);

    /* Vorlagen-Merkmale abstreifen — sonst bleibt der Klon versteckt
       oder dupliziert eine ID. Gleiches Vorgehen wie bei der
       Join-Karte in initRaster(). */
    knoten.removeAttribute('id');
    knoten.removeAttribute('aria-hidden');
    knoten.classList.remove('rolle-vorlage');
    knoten.classList.remove('ist-vorlage');

    var link = knoten.classList.contains('rolle-zeile')
      ? knoten
      : (knoten.querySelector('.rolle-zeile') || knoten.querySelector('a[href]'));

    if (link) {
      link.classList.remove('rolle-vorlage');
      link.classList.remove('ist-vorlage');
      link.removeAttribute('id');
      link.setAttribute('href', job.url);
      link.classList.add('ist-neu');
      if (HOMERUN.neuerTab) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      } else {
        link.removeAttribute('target');
      }
    }

    var titel = knoten.querySelector('.rolle-titel');
    var sub   = knoten.querySelector('.rolle-sub');

    if (titel) titel.textContent = job.titel;
    if (sub) {
      sub.textContent = job.sub;
      sub.style.display = job.sub ? '' : 'none';
    }

    return knoten;
  }

  function initRollen() {
    /* .rollen-ziel, NICHT .rollen-liste. Bleibt die alte Collection
       List aus Kapitel 7 im Projekt stehen, trägt sie weiterhin
       .rollen-liste und steht im DOM davor — querySelector fände sie
       zuerst und das Script schriebe in die falsche Kiste. */
    var container = document.querySelector('.rollen-ziel');
    if (!container) return;

    /* Behälter: bei einer Collection List wäre es .w-dyn-items,
       beim leeren Div der Container selbst. */
    var behaelter = container.querySelector('.w-dyn-items') || container;
    var fallback  = document.querySelector('.rollen-fallback');

    /* Vorlage: bevorzugt die statische, versteckte Zeile aus dem
       Designer. Steht stattdessen noch eine Collection List, dient
       deren erste Zeile als Vorlage — beide Bauweisen laufen. */
    var vorlage = document.querySelector('.rolle-vorlage') ||
                  behaelter.querySelector('.w-dyn-item');

    /* Liegt die Vorlage im Behälter, wird sie beim Einsetzen mit
       geleert. Deshalb vorher eine Kopie sichern. */
    if (vorlage && behaelter.contains(vorlage)) {
      vorlage = vorlage.cloneNode(true);
    }

    /* Startzustand: die Liste ist per CSS versteckt und wird erst
       sichtbar, wenn wirklich Zeilen drinstehen. Schlägt das Holen
       fehl, bleibt es einfach dabei — es gibt nichts zurückzunehmen. */
    zaehleRollen();

    if (!HOMERUN.aktiv) return;
    if (!vorlage) return;
    if (typeof window.fetch !== 'function') return;
    if (typeof window.DOMParser !== 'function') return;

    var abbruch = null, uhr = null;
    if (typeof AbortController === 'function') {
      abbruch = new AbortController();
      uhr = setTimeout(function () { abbruch.abort(); }, HOMERUN.timeout);
    }

    fetch(homerunQuelle(), {
      credentials: 'omit',
      signal: abbruch ? abbruch.signal : undefined
    })
      .then(function (antwort) {
        if (!antwort.ok) throw new Error('HTTP ' + antwort.status);
        return antwort.text();
      })
      .then(function (html) {
        if (uhr) clearTimeout(uhr);

        var jobs = leseJobs(html).map(teileJob);

        /* Keine offene Stelle: Liste bleibt leer und versteckt,
           der Fallback-Hinweis bleibt stehen. */
        if (!jobs.length) {
          zaehleRollen(0);
          return;
        }

        var frag = document.createDocumentFragment();
        jobs.forEach(function (job) {
          frag.appendChild(baueZeile(vorlage, job));
        });

        behaelter.innerHTML = '';
        behaelter.appendChild(frag);
        container.classList.add('ist-gefuellt');
        if (fallback) fallback.classList.add('ist-verborgen');
        zaehleRollen(jobs.length);
      })
      .catch(function (fehler) {
        if (uhr) clearTimeout(uhr);
        if (window.console && console.warn) {
          console.warn('[team-page] Homerun nicht erreichbar \u2014 ' +
            'die Rollenliste bleibt leer, der Fallback-Hinweis steht. Grund:',
            fehler && fehler.message);
        }
      });
  }

  /* Diagnose für die Konsole: zeigt das rohe Homerun-HTML und
     die daraus gelesenen Stellen. Siehe Kapitel 7b.7. */
  window.bsteuernRollen = function () {
    return fetch(homerunQuelle(), { credentials: 'omit' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        console.log(html);
        console.table(leseJobs(html).map(teileJob));
        return html;
      });
  };

  /* ══════════════════════════════════════════
     START
     ══════════════════════════════════════════ */

  function start() {
    initRaster();
    initZahlen();
    initPille();
    initRollen();   // nach initRaster: die Join-Karte muss im DOM stehen
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
