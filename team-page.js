/*
 * b'steuern — Teamseite
 * team-page.js
 *
 * Ein Script, vier Aufgaben:
 *   1. Farbvergabe   data-c="0"–"9" nach CMS-Reihenfolge (fix pro Person)
 *   2. Shuffle       Fisher–Yates beim Laden + „neu mischen"-Button
 *   3. Themen-Filter Chips aus data-topic der Items generiert
 *   4. Karten-Flip   Klick dreht, Klick dreht zurück (alle Breakpoints)
 *
 * Erwartete Struktur (Webflow):
 *   .team-grid                 Collection List (.w-dyn-items) — das Grid
 *     .team-item               Collection Item, Attribut data-topic="…"
 *       .karte-flip
 *         .karte-vorne  /  .karte-hinten
 *   .chip-liste                leerer Div — Script füllt Chips ein
 *   .btn-mischen               Div role="button"
 *   .filter-count              Text-Element „X von Y · …"
 *   #karte-join-vorlage        statische Join-Karte, irgendwo auf der Seite
 *                              (Script setzt sie an Position 8 im Grid)
 *
 * Kein Finsweet. Keine Abhängigkeiten.
 */
(function () {
  'use strict';

  var ALLE = 'Alle';
  var JOIN_POS = 7; // Position 8 (0-basiert), wie im Prototyp

  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function init() {
    var grid = document.querySelector('.team-grid');
    if (!grid) return;

    var items = Array.prototype.slice.call(grid.querySelectorAll('.team-item'));
    if (!items.length) return;

    /* ── 1. Farbvergabe: fix pro Person, nach CMS-Reihenfolge ── */
    items.forEach(function (el, i) {
      el.setAttribute('data-c', String(i % 10));
      el.setAttribute('data-tid', 't' + i);
    });

    /* ── Join-Karte aus der Vorlage ins Grid holen ── */
    var join = document.getElementById('karte-join-vorlage');
    if (join) {
      join.classList.add('team-item');
      join.removeAttribute('id');
      join.setAttribute('data-tid', 'join');
      join.style.display = '';
    }

    var order = shuffle(items);
    var aktivThema = ALLE;

    /* ── Chips aus den Daten ableiten ── */
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
        b.addEventListener('click', function () { setThema(t); });
        chipListe.appendChild(b);
        chips[t] = b;
      });
    }

    function zeichneChips() {
      Object.keys(chips).forEach(function (t) {
        chips[t].classList.toggle('ist-aktiv', t === aktivThema);
      });
    }

    /* ── Rendern: Reihenfolge + Filter + Join-Position + Zähler ── */
    function render() {
      var sichtbar = order.filter(function (el) {
        return aktivThema === ALLE || el.getAttribute('data-topic') === aktivThema;
      });

      order.forEach(function (el) {
        el.classList.toggle('ist-verborgen', sichtbar.indexOf(el) === -1);
        grid.appendChild(el); // DOM in Shuffle-Reihenfolge
      });

      if (join) {
        var anker = sichtbar[Math.min(JOIN_POS, sichtbar.length)] || null;
        grid.insertBefore(join, anker);
      }

      if (countEl) {
        countEl.textContent = sichtbar.length + ' von ' + items.length + ' \u00B7 zuf\u00E4llig gemischt, nie nach Rang';
      }
      zeichneChips();
      return sichtbar;
    }

    /* ── FLIP-Animation: alte Positionen merken, Differenz animieren ── */
    function rectsVorher() {
      var m = {};
      Array.prototype.forEach.call(grid.children, function (el) {
        if (!el.classList.contains('ist-verborgen')) {
          m[el.getAttribute('data-tid')] = el.getBoundingClientRect();
        }
      });
      return m;
    }

    function animiere(vorher) {
      if (reduced() || typeof Element.prototype.animate !== 'function') return;
      Array.prototype.forEach.call(grid.children, function (el, i) {
        if (el.classList.contains('ist-verborgen')) return;
        var b = vorher[el.getAttribute('data-tid')];
        if (!b) {
          el.animate(
            [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
            { duration: 380, delay: Math.min(i, 22) * 16, easing: 'cubic-bezier(0.2,0.8,0.2,1)' }
          );
          return;
        }
        var a = el.getBoundingClientRect();
        var dx = b.left - a.left, dy = b.top - a.top;
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
        el.animate(
          [
            { transform: 'perspective(1400px) translate(' + dx + 'px,' + dy + 'px) rotateY(0deg)' },
            { transform: 'perspective(1400px) translate(' + dx / 2 + 'px,' + dy / 2 + 'px) rotateY(90deg) scale(0.96)', offset: 0.5 },
            { transform: 'perspective(1400px) translate(0px,0px) rotateY(0deg) scale(1)' }
          ],
          { duration: 880, delay: Math.min(i, 22) * 26, easing: 'cubic-bezier(0.45,0.05,0.3,1)' }
        );
      });
    }

    function setThema(t) {
      if (t === aktivThema) return;
      aktivThema = t;
      var vorher = rectsVorher();
      render();
      animiere(vorher);
    }

    function neuMischen() {
      order = shuffle(items);
      var vorher = rectsVorher();
      render();
      animiere(vorher);
    }

    /* ── Karten-Flip per Delegation (Klick + Tastatur) ── */
    function toggleFlip(karte) {
      karte.classList.toggle('ist-offen');
      var offen = karte.classList.contains('ist-offen');
      karte.setAttribute('aria-expanded', offen ? 'true' : 'false');
    }

    grid.addEventListener('click', function (e) {
      var karte = e.target.closest ? e.target.closest('.karte-flip') : null;
      if (!karte || !grid.contains(karte)) return;
      if (e.target.closest('a')) return; // Links (Join-Karte) nicht abfangen
      toggleFlip(karte);
    });

    grid.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var karte = e.target.closest ? e.target.closest('.karte-flip') : null;
      if (!karte) return;
      e.preventDefault();
      toggleFlip(karte);
    });

    /* Karten fokussierbar + ARIA */
    order.forEach(function (el) {
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
