/* ============================================================
   bsteuern-404.js  ·  v1.0
   Fehlerseite "Beleg" — Logic Layer

   Zustaendigkeit bewusst eng gehalten:
   1) Hintergrundraster mit genug Kacheln fuellen
   2) Klickzaehler fuer das Easter Egg

   Was dieses Script NICHT tut:
   - keine Inline-Styles auf Elementen
   - keine Texte schreiben (alle Copy liegt in Webflow)
   - keine Pixelwerte, keine Breakpoint-Logik
     (alles davon steht in bsteuern-404.css)
   ============================================================ */

(function () {
  'use strict';

  var page = document.querySelector('.e404-page');
  if (!page) return;

  /* ---------- 1 · Raster fuellen -------------------------- */

  var grid = document.querySelector('.e404-grid');

  function countColumns(el) {
    var tracks = window.getComputedStyle(el).gridTemplateColumns;
    if (!tracks || tracks === 'none') return 1;
    return tracks.split(' ').filter(Boolean).length;
  }

  function fillGrid() {
    if (!grid) return;

    var width = grid.clientWidth;
    var height = grid.clientHeight;
    if (!width || !height) return;

    var cols = countColumns(grid);
    var cell = width / cols;
    var rows = Math.ceil(height / cell);
    var needed = cols * rows;

    while (grid.children.length > needed) {
      grid.removeChild(grid.lastElementChild);
    }
    while (grid.children.length < needed) {
      grid.appendChild(document.createElement('div'));
    }
  }

  /* Drosselung ueber requestAnimationFrame statt ueber einen
     Timer: Das Raster wird im naechsten Bildaufbau nachgezogen,
     also praktisch verzoegerungsfrei, ohne bei jedem einzelnen
     resize-Ereignis neu zu rechnen. Ein Timer mit 120 ms wuerde
     beim Ziehen des Fensterrands kurz eine Luecke am unteren
     Rand stehen lassen. */
  var frame = null;

  function onResize() {
    if (frame !== null) return;
    frame = window.requestAnimationFrame(function () {
      frame = null;
      fillGrid();
    });
  }

  fillGrid();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  window.addEventListener('load', fillGrid);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fillGrid).catch(function () {});
  }

  /* ---------- 2 · Datum und Uhrzeit ----------------------- */

  /* Der Beleg soll aussehen, als waere er in dem Moment gedruckt
     worden, in dem jemand auf der Fehlerseite landet. Deshalb wird
     die Zeit einmal beim Laden gesetzt und laeuft danach nicht
     weiter - ein tickender Kassenbon waere unglaubwuerdig.

     Zeitzone ist fest Europe/Berlin, nicht die des Besuchers.
     Intl beruecksichtigt die Sommerzeit selbst, es gibt hier also
     bewusst keine eigene Stundenrechnung.

     Die Werte im Embed sind der Rueckfallwert: Sollte Intl nicht
     verfuegbar sein, bleibt der statische Text stehen, statt dass
     eine leere Zeile entsteht. */

  function berlinTeile(zeitpunkt) {
    var formatter = new Intl.DateTimeFormat('de-DE', {
      timeZone: 'Europe/Berlin',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    });

    var teile = {};
    formatter.formatToParts(zeitpunkt).forEach(function (teil) {
      teile[teil.type] = teil.value;
    });
    return teile;
  }

  function datumSetzen() {
    var felder = document.querySelectorAll('[data-e404-live]');
    if (!felder.length) return;

    var t;
    try {
      t = berlinTeile(new Date());
    } catch (fehler) {
      return; /* Rueckfallwert aus dem Embed bleibt stehen */
    }

    if (!t.year || !t.hour) return;

    var datum = t.day + '.' + t.month + '.' + t.year;
    var werte = {
      'datum': datum,
      'datumzeit': datum + ' \u00B7 ' + t.hour + ':' + t.minute,
      'jahr': t.year,
      'jahr-gesperrt': t.year.split('').join(' ')
    };

    Array.prototype.forEach.call(felder, function (feld) {
      var wert = werte[feld.getAttribute('data-e404-live')];
      if (wert) feld.textContent = wert;
    });
  }

  datumSetzen();

  /* ---------- 3 · Easter Egg ------------------------------ */

  var bon = document.querySelector('.e404-bon');
  if (!bon) return;

  var THRESHOLD = 10;
  var clicks = 0;
  var isEgg = false;

  function setCount(n) {
    page.style.setProperty('--e404-feed-count', String(n));
  }

  function reset() {
    clicks = 0;
    isEgg = false;
    bon.classList.remove('is-egg');
    setCount(0);
  }

  bon.addEventListener('click', function () {
    if (isEgg) {
      reset();
      return;
    }

    clicks += 1;

    if (clicks >= THRESHOLD) {
      isEgg = true;
      bon.classList.add('is-egg');
      return;
    }

    setCount(clicks);
  });
})();
