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
 *
 * Erwartete Klassen siehe README im selben Ordner.
 * Kein Finsweet, keine Abhängigkeiten.
 */
(function () {
  'use strict';

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

    /* Farbvergabe: fix pro Person, nach CMS-Reihenfolge.
       Wandert NICHT beim Mischen mit. */
    items.forEach(function (el, i) {
      el.setAttribute('data-c', String(i % 10));
      el.setAttribute('data-tid', 't' + i);
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
     START
     ══════════════════════════════════════════ */

  function start() {
    initRaster();
    initZahlen();
    initPille();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
