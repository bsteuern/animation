/*
 * b'steuern — Offene Rollen aus Homerun
 * rollen-homerun.js
 *
 * EIGENSTÄNDIG. Setzt in Webflow genau ein Element voraus:
 *
 *     <div class="rollen-ziel"></div>
 *
 * Kein Template, keine Collection List, keine Klassen an
 * Kindelementen, keine Werte im Designer. Das Script baut das
 * komplette Markup selbst, rollen-homerun.css bringt das
 * komplette Styling mit. Damit gibt es keinen Zustand im
 * Webflow-Projekt, der still danebengehen kann.
 *
 * Ablauf:
 *   1. Container suchen — fehlt er, steigt alles still aus
 *   2. Schriften der Sektion übernehmen (siehe unten)
 *   3. widget-de.html von Homerun holen
 *   4. Stellen daraus lesen
 *   5. Zeilen bauen und einsetzen
 *   6. Zahl auf der Join-Karte setzen, falls .join-anzahl existiert
 *
 * Fehlerfälle — in allen erscheint die Ausweichzeile mit Link auf
 * die Karriereseite, nie eine erfundene Stelle:
 *   fetch scheitert (offline, CORS, Timeout, HTTP ≠ 200)
 *   Homerun meldet null offene Stellen
 *   Homerun ändert sein Markup so, dass nichts gelesen wird
 *
 * Schriften: die Datei rät nicht, wie FeatureDeck und General Sans
 * im Projekt heißen. Sie liest die tatsächlich gerenderte Schrift
 * der Sektions-Überschrift aus und übernimmt sie. Findet sie keine,
 * greift der Notnagel aus dem CSS.
 *
 * Diagnose in der Konsole:  bsteuernRollen()
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════
     KONFIGURATION
     ══════════════════════════════════════════ */

  var HOMERUN = {
    aktiv:    true,
    id:       'liulak29bztrayg1bo4h',
    sprache:  'de',

    /* Zeichen, an dem ein Homerun-Jobtitel in Titel und Funktion
       geteilt wird. Steht kein solches Zeichen im Titel, wandert
       der ganze Titel nach oben und nur Ort und Umfang nach unten. */
    trenner:  '\u00B7',

    neuerTab: true,
    timeout:  6000,

    /* Linktexte, die keine Stelle sind */
    ignoriere: /^(alle\s|all\s|mehr\s|weitere\s|view\s+all|see\s+all)/i,

    /* Ausweichzeile, wenn nichts geladen werden konnte oder
       gerade keine Stelle offen ist */
    ausweich: {
      url:   'https://bsteuern.homerun.co/',
      titel: 'Offene Stellen ansehen',
      sub:   'Alle aktuellen Rollen \u00B7 direkt bei uns im Bewerbungsportal'
    }
  };

  /* Pfeil. viewBox 0 0 32 24, langer Schaft. Farbe, Strichstärke
     und Endenform kommen aus rollen-homerun.css. */
  var PFEIL =
    '<svg class="stellen-svg" viewBox="0 0 32 24" aria-hidden="true" focusable="false">' +
    '<path d="M1 12h29M22 4l8 8-8 8"></path></svg>';

  /* ══════════════════════════════════════════
     HELFER
     ══════════════════════════════════════════ */

  function quelle() {
    return 'https://embed.homerun.co/' + HOMERUN.id +
           '/widget-' + HOMERUN.sprache + '.html?t=' + Date.now();
  }

  function textNorm(wert) {
    return String(wert == null ? '' : wert).replace(/\s+/g, ' ').trim();
  }

  function warne() {
    if (!window.console || !console.warn) return;
    console.warn.apply(console, ['[rollen-homerun]'].concat(
      Array.prototype.slice.call(arguments)));
  }

  /* ══════════════════════════════════════════
     LESEN
     Homerun liefert HTML ohne zugesicherte Struktur. Deshalb wird
     grob gelesen: jeder Link mit Text ist eine Stelle.
     ══════════════════════════════════════════ */

  /* Steigt durch Wrapper hindurch, bis ein Knoten mit mehreren
     Kindern erreicht ist. Ohne das liefert
     <a><div><h3>Titel</h3><span>Vollzeit</span></div></a>
     ein einziges, verklebtes Textstück. */
  function entpacke(knoten) {
    var aktuell = knoten;

    for (var runde = 0; runde < 4; runde++) {
      var kinder = [];
      Array.prototype.forEach.call(aktuell.childNodes, function (kind) {
        if (kind.nodeType === 1) kinder.push(kind);
        else if (kind.nodeType === 3 && textNorm(kind.textContent)) kinder.push(kind);
      });
      if (kinder.length === 1 && kinder[0].nodeType === 1) {
        aktuell = kinder[0];
        continue;
      }
      break;
    }
    return aktuell;
  }

  /* Sammelt Textstücke EINZELN ein statt über textContent.
     Gemessen an der echten Homerun-Ausgabe: zwei benachbarte
     <span> ohne Leerzeichen ergeben sonst
     „KI-Steuerfachangestellte/rVollzeit". */
  function sammleTeile(knoten, ausser) {
    var teile = [];
    if (!knoten) return teile;

    Array.prototype.forEach.call(knoten.childNodes, function (kind) {
      if (ausser && kind === ausser) return;
      if (ausser && kind.contains && kind.contains(ausser)) return;

      var t = textNorm(kind.textContent);
      t = textNorm(t.replace(/^[\s\u00B7\u2022|,;]+/, ''));
      if (t && teile.indexOf(t) === -1) teile.push(t);
    });

    return teile;
  }

  function leseJobs(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var jobs = [];
    var gesehen = {};

    Array.prototype.forEach.call(doc.querySelectorAll('a[href]'), function (a) {
      var innen = sammleTeile(entpacke(a), null);
      var titel = innen.length ? innen[0] : textNorm(a.textContent);
      var extra = innen.slice(1);
      var href  = a.getAttribute('href') || '';

      if (!titel) return;
      if (HOMERUN.ignoriere.test(titel)) return;
      if (!href || href.charAt(0) === '#' || /^javascript:/i.test(href)) return;

      /* Der geparste Baum hat keine eigene Basis-URL. Relative Pfade
         müssen von Hand gegen den Widget-Host aufgelöst werden,
         sonst zeigen sie auf bsteuern.com. */
      try { href = new URL(href, 'https://embed.homerun.co/').href; } catch (e) {}

      if (gesehen[href]) return;
      gesehen[href] = true;

      var zeile = (a.closest && a.closest('li')) || a.parentNode;
      var draussen = sammleTeile(zeile, a).filter(function (t) {
        return t !== titel && extra.indexOf(t) === -1;
      });

      jobs.push({
        titel: titel,
        meta:  extra.concat(draussen).join(' \u00B7 '),
        url:   href
      });
    });

    return jobs;
  }

  /* „Zahlen mit Sorgfalt · Buchhaltung" + „Remote"
       → Titel: Zahlen mit Sorgfalt
         Sub:   Buchhaltung · Remote                     */
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

  /* ══════════════════════════════════════════
     BAUEN
     ══════════════════════════════════════════ */

  function baueZeile(job) {
    var a = document.createElement('a');
    a.className = 'stellen-zeile ist-neu';
    a.setAttribute('href', job.url);

    if (HOMERUN.neuerTab) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }

    var text = document.createElement('div');
    text.className = 'stellen-text';

    var titel = document.createElement('div');
    titel.className = 'stellen-titel';
    titel.textContent = job.titel;
    text.appendChild(titel);

    if (job.sub) {
      var sub = document.createElement('div');
      sub.className = 'stellen-sub';
      sub.textContent = job.sub;
      text.appendChild(sub);
    }

    var pfeil = document.createElement('div');
    pfeil.className = 'stellen-pfeil';
    pfeil.innerHTML = PFEIL;

    a.appendChild(text);
    a.appendChild(pfeil);
    return a;
  }

  function zeige(container, jobs) {
    var frag = document.createDocumentFragment();
    jobs.forEach(function (job) { frag.appendChild(baueZeile(job)); });

    container.innerHTML = '';
    container.appendChild(frag);
    container.classList.add('ist-gefuellt');
  }

  function zeigeAusweich(container) {
    zeige(container, [{
      titel: HOMERUN.ausweich.titel,
      sub:   HOMERUN.ausweich.sub,
      url:   HOMERUN.ausweich.url
    }]);
  }

  function zaehle(anzahl) {
    var ziel = document.querySelector('.join-anzahl');
    if (!ziel) return;

    ziel.textContent = (anzahl === 0)
      ? 'Initiativ bewerben'
      : anzahl + (anzahl === 1 ? ' offene Rolle' : ' offene Rollen');
  }

  /* Übernimmt die tatsächlich gerenderten Schriften der Sektion,
     statt Namen zu raten. Die Überschrift „Deine Kachel ist noch
     frei." steht in FeatureDeck, der Fließtext in General Sans —
     beides im Designer gesetzt, beides hier ablesbar. */
  function uebernehmeSchriften(container) {
    var sektion = container.closest ? container.closest('section, .sektion-werde-teil') : null;
    var suchraum = sektion || document;

    var display = suchraum.querySelector('.werde-titel') ||
                  suchraum.querySelector('h1, h2, h3') ||
                  document.querySelector('.werde-titel');

    var body = suchraum.querySelector('.werde-fliess') ||
               suchraum.querySelector('p') ||
               document.body;

    if (display) {
      var fd = window.getComputedStyle(display).fontFamily;
      if (fd) container.style.setProperty('--stellen-display-font', fd);
    }
    if (body) {
      var gs = window.getComputedStyle(body).fontFamily;
      if (gs) container.style.setProperty('--stellen-body-font', gs);
    }
  }

  /* ══════════════════════════════════════════
     START
     ══════════════════════════════════════════ */

  function start() {
    var container = document.querySelector('.rollen-ziel');
    if (!container) {
      warne('Kein Element mit der Klasse .rollen-ziel gefunden \u2014 ' +
            'in Webflow ein leeres Div Block mit genau dieser Klasse anlegen.');
      return;
    }

    uebernehmeSchriften(container);

    if (!HOMERUN.aktiv) { zeigeAusweich(container); zaehle(0); return; }

    if (typeof window.fetch !== 'function' || typeof window.DOMParser !== 'function') {
      zeigeAusweich(container);
      zaehle(0);
      return;
    }

    var abbruch = null, uhr = null;
    if (typeof AbortController === 'function') {
      abbruch = new AbortController();
      uhr = setTimeout(function () { abbruch.abort(); }, HOMERUN.timeout);
    }

    fetch(quelle(), {
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

        if (!jobs.length) {
          zeigeAusweich(container);
          zaehle(0);
          return;
        }

        zeige(container, jobs);
        zaehle(jobs.length);
      })
      .catch(function (fehler) {
        if (uhr) clearTimeout(uhr);
        warne('Homerun nicht erreichbar, Ausweichzeile steht. Grund:',
              fehler && fehler.message);
        zeigeAusweich(container);
        zaehle(0);
      });
  }

  /* Diagnose: zeigt das rohe Homerun-HTML und die daraus gelesenen
     Stellen. Beantwortet in einem Schritt, ob es am Holen, am Lesen
     oder am Einsetzen liegt. */
  window.bsteuernRollen = function () {
    var c = document.querySelector('.rollen-ziel');
    console.log('Container gefunden:', !!c);
    if (c) {
      console.log('Zeilen im Container:', c.querySelectorAll('.stellen-zeile').length);
      console.log('Display:', window.getComputedStyle(c).display);
    }
    return fetch(quelle(), { credentials: 'omit' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        console.log(html);
        console.table(leseJobs(html).map(teileJob));
        return html;
      })
      .catch(function (e) { console.error('fetch fehlgeschlagen:', e); });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
