/* b'steuern automation · Tool-Seite · Rechner und »Was dazugehört«
   Stand 25.11.2026. Braucht automation-rechner-regeln.js (window.bstAutomationRechner).

   Was hier steht: nur Verhalten. Zustände umschalten, Zahlen einsetzen, Listen aus Vorlagen bauen.
   Was hier nicht steht: Preise (CMS, Preisbausteine), Texte je Tool (CMS, Preisprofil),
   Rechenregeln (automation-rechner-regeln.js).

   Vertrag mit Webflow, alles über data-Attribute:
   [data-aktuelles-tool]          Slug des Tools der Seite
   [data-schluessel][data-tool]   ein Preisbaustein, data-tool = Slug des Tools, leer = für alle
   [data-profil]                  Texte aus dem Preisprofil als data-Attribute
   [data-flag="…"]                Schalter aus dem Preisprofil, sichtbar = an (bedingte Sichtbarkeit in Webflow)
   [data-rechner]                 Wurzel des Rechners
   [data-module]                  Wurzel von »Was dazugehört«
   [data-vorlage="…"]             Vorlage, wird geklont und bleibt selbst versteckt */

(function () {
  'use strict';
  var R = window.bstAutomationRechner;
  if (!R || typeof document === 'undefined') return;
  /* Das Skript kann vor dem Rechner im Dokument stehen: erst starten, wenn alles geladen ist */
  var gestartet = false;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  function start() {
    if (gestartet) return;
    gestartet = true;

  var $ = function (wurzel, sel) { return wurzel ? wurzel.querySelector(sel) : null; };
  var $$ = function (wurzel, sel) { return wurzel ? Array.prototype.slice.call(wurzel.querySelectorAll(sel)) : []; };
  var text = function (el, t) { if (el) el.textContent = t; };
  var zeige = function (el, an) { if (el) el.hidden = !an; };
  /* Tabs, Chips und Pläne sind Links mit role=button: Klick ohne Sprung, Leertaste wie Enter */
  var beiWahl = function (el, fn) {
    el.addEventListener('click', function (ev) { ev.preventDefault(); fn(); });
    el.addEventListener('keydown', function (ev) { if (ev.key === ' ') { ev.preventDefault(); fn(); } });
  };
  var klon = function (v) { var k = v.cloneNode(true); k.removeAttribute('data-vorlage'); k.hidden = false; return k; };
  /* Mehrzeiliger Text aus Webflow: Zeilenumbrüche kommen als <br> oder als echte Umbrüche */
  var rohText = function (el) {
    if (!el) return '';
    var d = document.createElement('div');
    d.innerHTML = el.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    return d.textContent;
  };

  /* ===== Tool der Seite und Filter nach Tool ===== */
  var toolEl = $(document, '[data-aktuelles-tool]');
  var tool = toolEl ? (toolEl.getAttribute('data-aktuelles-tool') || '') : '';

  /* Bausteine mit eigenem Tool gehen vor Bausteinen ohne Tool. Fremde Tools fallen weg. */
  function bausteineDerSeite() {
    var alle = $$(document, '[data-schluessel]');
    var eigen = {};
    alle.forEach(function (el) { if (el.getAttribute('data-tool') === tool) eigen[el.getAttribute('data-schluessel')] = true; });
    return alle.filter(function (el) {
      var t = el.getAttribute('data-tool') || '';
      var s = el.getAttribute('data-schluessel');
      if (!s) return false;
      if (t === tool) return true;
      return t === '' && !eigen[s];
    });
  }

  /* Module: nur die des aktuellen Tools. Wird überflüssig, sobald in Webflow der Filter »Tool = aktuelles Tool« gesetzt ist. */
  $$(document, '[data-modul][data-tool]').forEach(function (el) {
    if (el.getAttribute('data-tool') !== tool) el.parentNode.removeChild(el);
  });

  var profil = $(document, '[data-profil]');
  var P = function (name) { return profil ? (profil.getAttribute('data-' + name) || '') : ''; };
  function flag(name) {
    var el = $(document, '[data-flag="' + name + '"]');
    return !!el && !el.classList.contains('w-condition-invisible');
  }

  /* Ohne Preisprofil zeigen die neuen Sektionen nichts Sinnvolles: ausblenden. */
  if (!P('titel-basis')) {
    $$(document, '[data-bind="sek-pakete"], [data-bind="sek-rechner"], [data-bind="sek-module"]').forEach(function (el) { el.style.display = 'none'; });
  } else {
    /* Mit Preisprofil ersetzen Pakete und Rechner den alten Block »Preise«. */
    $$(document, '[data-bind="sek-preise"]').forEach(function (el) { el.style.display = 'none'; });
    /* Paketkarte ohne eigenen Link (leeres CMS-Feld, Webflow schreibt »#«): zum Rechner. */
    $$(document, '[data-bind="sek-pakete"] a[href="#"], [data-bind="sek-pakete"] a:not([href])').forEach(function (a) { a.setAttribute('href', '#rechner'); });
  }

  var quellen = bausteineDerSeite();
  if (!quellen.length) return;
  var bausteine = R.leseBausteine(quellen);
  if (!bausteine.basis) return;
  var regelTexte = R.texteAusRegeln();
  var euro = R.euro;

  /* Preise und Platzhalter überall auf der Seite */
  R.fuellePreise($$(document, '[data-preis]'), bausteine);
  $$(document, '[data-platzhalter]').forEach(function (el) {
    el.textContent = R.setzePreiseEin(el.textContent, bausteine, el.getAttribute('data-platzhalter') || 'S');
  });
  $$(document, '[data-regeltext]').forEach(function (el) { text(el, regelTexte[el.getAttribute('data-regeltext')] || el.textContent); });

  /* ===== Umschalter mit gleitender Marke (E-100, Motion nach 11-motion) ===== */
  function umschalter(leiste, wert, nachWahl) {
    if (!leiste) return { setze: function () {} };
    var tabs = $$(leiste, '[data-wert]');
    var marke = $(leiste, '.tabbar-schieber');
    function setze(w, ohneBewegung) {
      tabs.forEach(function (t) {
        var an = t.getAttribute('data-wert') === String(w);
        t.setAttribute('aria-pressed', an ? 'true' : 'false');
        t.classList.toggle('is-aktiv', an);
        if (an && marke) {
          if (ohneBewegung) marke.style.transition = 'none';
          marke.style.width = t.offsetWidth + 'px';
          marke.style.transform = 'translateX(' + t.offsetLeft + 'px)';
          if (ohneBewegung) { void marke.offsetWidth; marke.style.transition = ''; }
        }
      });
    }
    tabs.forEach(function (t) {
      beiWahl(t, function () {
        var w = t.getAttribute('data-wert'); setze(w); nachWahl(w);
        /* Auf dem Handy scrollt die Leiste waagerecht: gewählten Reiter ganz ins Bild holen. */
        if (leiste.scrollWidth > leiste.clientWidth && t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
    });
    setze(wert, true);
    window.addEventListener('resize', function () { var a = $(leiste, '[aria-pressed="true"]'); if (a) setze(a.getAttribute('data-wert'), true); });
    return { setze: setze };
  }

  /* ===== Rechner ===== */
  var wurzel = $(document, '[data-rechner]');
  if (wurzel && P('titel-basis')) rechner(wurzel);

  function rechner(w) {
    var z = { stufe: 'M', konten: 1, paket: 'basis', zahlweise: 'm', eu: null, drittland: null, fremdwaehrung: null, prap: null };
    var bald = flag('rechnungen-bald');
    var LABEL = R.REGELN.stufenLabel;
    var ZAHLWORT = { 1: 'ein', 2: 'zwei', 3: 'drei' };
    var gross = function () { return R.REGELN.grosseStufen.indexOf(z.stufe) > -1; };

    /* Liste »Das ist drin« aus dem Preisprofil: Text | Regel | Text EU Firmen | Text EU Privat */
    var drin = P('rechner-drin').split(/\n+/).map(function (zeile) {
      var t = zeile.split('|').map(function (s) { return s.trim(); });
      return { text: t[0], regel: t[1] || 'immer', b2b: t[2], b2c: t[3] };
    }).filter(function (d) { return d.text; });
    var hatBeleg = drin.some(function (d) { return d.regel === 'beleg'; });

    umschalter($(w, '[data-tabbar="stufe"]'), z.stufe, function (v) { z.stufe = v; zeichne(); });
    umschalter($(w, '[data-tabbar="konten"]'), z.konten, function (v) { z.konten = Number(v); zeichne(); });
    umschalter($(w, '[data-tabbar="zahlweise"]'), z.zahlweise, function (v) { z.zahlweise = v; zeichne(); });

    $$(w, '[data-plan]').forEach(function (b) {
      beiWahl(b, function () { z.paket = b.getAttribute('data-plan'); zeichne(); });
    });
    $$(w, '[data-frage]').forEach(function (f) {
      var key = f.getAttribute('data-frage');
      $$(f, '[data-wert]').forEach(function (c) {
        beiWahl(c, function () { z[key] = c.getAttribute('data-wert'); zeichne(); });
      });
    });

    var vorlageDrin = $(w, '[data-vorlage="drin"]');
    var vorlageEin = $(w, '[data-vorlage="einrichtung"]');

    function zeichne() {
      var anfrage = z.stufe === 'X';
      var auto = z.paket === 'autopilot';
      var rech = z.paket === 'rechnung';
      var autoQ = auto && !anfrage;
      var eu = z.eu || 'nein', dr = z.drittland === 'ja', fx = z.fremdwaehrung === 'ja', pr = z.prap === 'ja';
      var st = anfrage ? 'XL' : z.stufe;
      var paketFuer = function (p) {
        return R.rechne({ stufe: z.stufe, konten: z.konten, paket: p, jaehrlich: z.zahlweise === 'j',
          eu: eu, drittland: dr, fremdwaehrung: fx, prap: pr }, bausteine, { einrichtungAb: Number(P('einrichtung-ab')) || 0 });
      };
      var e = paketFuer(z.paket);

      /* Schritt 3: Pläne */
      $$(w, '[data-plan]').forEach(function (b) {
        var p = b.getAttribute('data-plan');
        var an = p === z.paket;
        b.setAttribute('aria-pressed', an ? 'true' : 'false');
        b.classList.toggle('is-aktiv', an);
        var preis, einheit = 'netto im Monat', fuss = '30 Tage kostenlos';
        if (p === 'basis') {
          preis = euro(bausteine.basis[st] * z.konten);
          if (hatBeleg && gross()) fuss = 'ab 500 nur ' + P('einheit') + ' · 30 Tage kostenlos';
        }
        if (p === 'rechnung') {
          preis = euro(bausteine.basis[st] * z.konten);
          einheit = 'netto im Monat, plus ' + euro(bausteine['rechnung-stueck'][st]) + ' je Rechnung';
          fuss = bald ? 'bald verfügbar' : 'höchstens ' + euro(bausteine['rechnungen-deckel'][st]) + ' für Rechnungen · 30 Tage kostenlos';
        }
        if (p === 'autopilot') {
          preis = anfrage ? 'Anfrage' : euro(bausteine.autopilot[st] * (1 + R.REGELN.aufschlagJeWeiteremKonto * (z.konten - 1)));
          einheit = anfrage ? '' : 'netto im Monat';
          fuss = anfrage ? 'ab 5.000 ' + P('einheit') : 'Einrichtung ab ' + euro(R.aufNeun(Number(P('einrichtung-ab')) * R.REGELN.volumenfaktorEinrichtung[st]));
          zeige($(b, '[data-r="plan-ab"]'), !anfrage);
        }
        text($(b, '[data-r="plan-preis"]'), preis);
        text($(b, '[data-r="plan-einheit"]'), einheit);
        text($(b, '[data-r="plan-fuss"]'), fuss);
      });
      zeige($(w, '[data-hinweis="klein"]'), !gross());
      zeige($(w, '[data-hinweis="gross"]'), gross());

      /* Schritt 4 */
      zeige($(w, '[data-r="schritt4"]'), autoQ);
      $$(w, '[data-frage]').forEach(function (f) {
        var key = f.getAttribute('data-frage');
        $$(f, '[data-wert]').forEach(function (c) {
          var an = z[key] === c.getAttribute('data-wert');
          c.setAttribute('aria-pressed', an ? 'true' : 'false');
          c.classList.toggle('is-aktiv', an);
        });
        /* Vor der ersten Wahl keine Notiz, außer bei pRAP: dort erklärt »nein« die Frage */
        var gewaehlt = z[key] || (key === 'prap' ? 'nein' : null);
        $$(f, '[data-notiz]').forEach(function (n) { zeige(n, n.getAttribute('data-notiz') === gewaehlt); });
      });

      /* Ergebnis */
      var name = auto ? (anfrage ? P('titel-autopilot') : 'Dein Autopilot') : (rech ? 'Basis + Rechnungen' : P('titel-basis'));
      text($(w, '[data-r="name"]'), name);
      zeige($(w, '[data-r="empfohlen"]'), auto);
      zeige($(w, '[data-r="bald"]'), rech && bald);

      var teile;
      if (autoQ) {
        teile = ['DE'];
        if (eu !== 'nein') teile.push({ b2b: 'EU Firmen', b2c: 'EU Privat', beide: 'EU Firmen + Privat' }[eu]);
        if (dr) teile.push('Drittland');
        if (fx) teile.push('Fremdwährungen');
        if (pr) teile.push('pRAP');
        teile.push(LABEL[st] + ' ' + P('einheit'));
        if (z.konten > 1) teile.push(ZAHLWORT[z.konten] + ' ' + P('konto-mehrzahl'));
      } else if (auto) {
        teile = ['mehr als 5.000 ' + P('einheit') + ' im Monat'];
      } else {
        teile = [LABEL[z.stufe] + ' ' + P('einheit') + (z.konten > 1 ? ' · ' + ZAHLWORT[z.konten] + ' ' + P('konto-mehrzahl') : '')];
      }
      text($(w, '[data-r="fuer"]'), teile.join(' · '));

      /* Das ist drin: erst was drin ist, dann was fehlt */
      var liste = $(w, '[data-r="drin"]');
      if (liste && vorlageDrin) {
        liste.innerHTML = '';
        var zeilen = drin.map(function (d) {
          var an = false, notiz = '', t = d.text, istBald = false;
          if (d.regel === 'immer') an = true;
          if (d.regel === 'beleg') { an = !(!auto && gross()); notiz = an ? '' : 'ab 500 nicht'; }
          if (d.regel === 'rechnungen') { an = rech || auto; istBald = an && bald; }
          if (d.regel === 'autopilot') an = auto;
          if (d.regel === 'eu') { an = autoQ && eu !== 'nein'; if (an && eu === 'b2b' && d.b2b) t = d.b2b; if (an && eu === 'b2c' && d.b2c) t = d.b2c; }
          if (d.regel === 'drittland') an = autoQ && dr;
          if (d.regel === 'fremdwaehrung') an = autoQ && fx;
          if (d.regel === 'prap') an = autoQ && pr;
          return { an: an, t: t, notiz: notiz, bald: istBald };
        });
        zeilen.filter(function (d) { return d.an; }).concat(zeilen.filter(function (d) { return !d.an; })).forEach(function (d) {
          var k = klon(vorlageDrin);
          k.classList.toggle('is-aus', !d.an);
          text($(k, '[data-r="drin-sr"]'), d.an ? 'enthalten: ' : 'nicht enthalten: ');
          text($(k, '[data-r="drin-text"]'), d.t + (d.notiz ? ' (' + d.notiz + ')' : ''));
          zeige($(k, '[data-r="drin-bald"]'), d.bald);
          zeige($(k, '[data-r="drin-an"]'), d.an);
          zeige($(k, '[data-r="drin-aus"]'), !d.an);
          liste.appendChild(k);
        });
      }

      /* Preis */
      var jaehrlich = z.zahlweise === 'j';
      var monat = e.monatlich;
      var gezeigt = jaehrlich && monat !== null ? e.monatlichBeiJaehrlich : monat;
      text($(w, '[data-r="preis"]'), auto && anfrage ? 'Auf Anfrage' : euro(gezeigt));
      text($(w, '[data-r="einheit"]'), auto && anfrage ? '' : (jaehrlich ? ' im Monat, jährlich' : ' im Monat'));
      var notiz = '';
      if (!auto) {
        notiz = '30 Tage kostenlos · monatlich kündbar';
        if (rech) notiz = '+ ' + euro(bausteine['rechnung-stueck'][st]) + ' je Rechnung, höchstens ' + euro(e.deckelRechnungen) + ' im Monat · 30 Tage kostenlos';
        if (jaehrlich) notiz = euro(e.jahresbetrag) + ' jährlich statt ' + euro(monat * 12) + (rech ? ' · Rechnungen nach Verbrauch' : '');
      }
      if (autoQ) {
        notiz = 'monatlich kündbar · Einrichtung einmalig, siehe unten';
        if (jaehrlich) notiz = euro(e.jahresbetrag) + ' jährlich statt ' + euro(monat * 12);
      }
      if (auto && anfrage) notiz = 'Ab 5.000 ' + P('einheit') + ' machen wir dir ein Angebot.';
      text($(w, '[data-r="preis-notiz"]'), notiz);

      /* Einrichtung */
      zeige($(w, '[data-r="einrichtung-keine"]'), !auto);
      zeige($(w, '[data-r="einrichtung"]'), autoQ);
      var ein = $(w, '[data-r="einrichtung-zeilen"]');
      if (ein && vorlageEin && autoQ) {
        ein.innerHTML = '';
        var bLabel = function (s) { var el = $(document, '[data-schluessel="' + s + '"][data-tool="' + tool + '"]') || $(document, '[data-schluessel="' + s + '"]'); return el ? el.getAttribute('data-label') || s : s; };
        var EU_ZUSATZ = { b2b: ' an Firmen', b2c: ' an Privat', beide: ' Firmen und Privat' };
        e.zeilen.forEach(function (zl) {
          var k = klon(vorlageEin), titel;
          if (zl.schluessel === 'grund') titel = bLabel('autopilot');
          else if (zl.schluessel === 'volumen') titel = 'Mehr Volumen +' + Math.round((R.REGELN.volumenfaktorEinrichtung[st] - 1) * 100) + ' %';
          else if (zl.schluessel === 'weitere-konten') titel = z.konten === 2 ? P('konto-weiteres') : 'Zwei weitere ' + P('konto-mehrzahl');
          else if (zl.schluessel === 'prap') titel = bLabel('prap');
          else if (/^eu/.test(zl.schluessel)) titel = bLabel(zl.schluessel) + EU_ZUSATZ[eu];
          else titel = bLabel(zl.schluessel);
          text($(k, '[data-r="ein-titel"]'), titel);
          text($(k, '[data-r="ein-betrag"]'), (zl.schluessel === 'grund' ? '' : '+') + euro(zl.betrag));
          ein.appendChild(k);
        });
        text($(w, '[data-r="einrichtung-summe"]'), euro(e.einrichtung));
      }

      /* CTA: Basis testet selbst, alles andere bucht einen Termin. Pfeil nur beim Seitenwechsel. */
      var cta = $(w, '[data-r="cta"]');
      if (cta) {
        /* Ohne Self-Service-Link (etwa Shopify) bucht auch Basis einen Termin. */
        var selbst = (z.paket === 'basis' || (rech && !bald)) && !!P('self-service-link');
        var ziel = selbst ? P('self-service-link') : P('termin-link');
        text($(cta, '[data-r="cta-text"]'), selbst ? '30 Tage kostenlos testen' : 'Termin buchen');
        zeige($(cta, '[data-r="cta-pfeil"]'), selbst);
        if (ziel) { cta.setAttribute('href', ziel); cta.hidden = false; } else { cta.hidden = true; }
      }
    }

    zeichne();
  }

  /* ===== Was dazugehört: Reiter aus den Modul-Panels ===== */
  var mod = $(document, '[data-module]');
  if (mod) module(mod);

  function module(m) {
    var panels = $$(m, '[data-modul]');
    /* Reihenfolge aus dem CMS, bis in Webflow die Sortierung der Liste gesetzt ist */
    panels.sort(function (a, b) { return (Number(a.getAttribute('data-reihenfolge')) || 0) - (Number(b.getAttribute('data-reihenfolge')) || 0); });
    var leiste = $(m, '[data-tabbar="module"]');
    var vorlage = $(m, '[data-vorlage="reiter"]');
    if (!panels.length || !leiste || !vorlage) { if (!panels.length) m.style.display = 'none'; return; }
    var MARKE = { 'Inklusive': 'is-drin', 'Option': 'is-option', 'Bald': 'is-bald' };
    panels.forEach(function (p, i) {
      var r = klon(vorlage);
      r.setAttribute('data-wert', String(i));
      r.id = 'modul-reiter-' + i;
      text($(r, '[data-r="reiter-text"]'), p.getAttribute('data-reiter') || '');
      var ico = $(r, '[data-r="reiter-icon"]');
      if (ico && p.getAttribute('data-icon')) ico.classList.add('ri-' + p.getAttribute('data-icon'));
      leiste.appendChild(r);
      p.id = 'modul-panel-' + i;
      p.setAttribute('role', 'region');
      p.setAttribute('aria-labelledby', r.id);
      /* Marke nach Typ einfärben */
      var mk = $(p, '[data-r="marke"]');
      if (mk && MARKE[mk.textContent.trim()]) mk.classList.add(MARKE[mk.textContent.trim()]);
      if (mk && !mk.textContent.trim()) mk.hidden = true;
      /* UI-Beispiel aus den Rohtexten */
      var kopf = $(p, '[data-roh="kopf"]');
      if (kopf) {
        var kt = rohText(kopf).split('|').map(function (s) { return s.trim(); });
        text($(p, '[data-r="kopf-links"]'), kt[0] || '');
        var kr = kt[1] || '';
        zeige($(p, '[data-r="kopf-punkt"]'), /^●/.test(kr));
        text($(p, '[data-r="kopf-rechts"]'), kr.replace(/^●\s*/, ''));
      }
      var roh = $(p, '[data-roh="zeilen"]');
      var zv = $(p, '[data-vorlage="ui-zeile"]');
      var ziel = $(p, '[data-r="zeilen"]');
      if (roh && zv && ziel) {
        rohText(roh).split(/\n+/).forEach(function (zeile) {
          var t = zeile.split('|').map(function (s) { return s.trim(); });
          if (!t[0]) return;
          var k = klon(zv);
          text($(k, '[data-r="ui-links"]'), t[0]);
          var rechts = t[1] || '';
          var ok = /^✓/.test(rechts), punkt = /^●/.test(rechts);
          text($(k, '[data-r="ui-rechts"]'), rechts.replace(/^[✓●]\s*/, ''));
          zeige($(k, '[data-r="ui-ok"]'), ok);
          zeige($(k, '[data-r="ui-punkt"]'), punkt);
          ziel.appendChild(k);
        });
      }
      var fuss = $(p, '[data-r="fuss"]');
      if (fuss && !fuss.textContent.trim()) fuss.hidden = true;
      var link = $(p, '[data-r="link"]');
      var ziel2 = link ? (link.getAttribute('href') || '') : '';
      if (link && (!ziel2 || ziel2 === '#' || !link.textContent.trim())) link.hidden = true;
    });
    var u = umschalter(leiste, '0', function (v) {
      panels.forEach(function (p, i) { p.hidden = String(i) !== v; });
    });
    panels.forEach(function (p, i) { p.hidden = i !== 0; });
    u.setze('0', true);
  }
  }
})();
