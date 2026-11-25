/* b'steuern automation · Preisrechner · Regeln und Rechnung
   Stand 25.11.2026. Entscheidung 1: Rechenregeln stehen hier, Geld steht im CMS.

   Geld kommt aus zwei CMS-Sammlungen und nie aus dieser Datei:
   - Automation Preisbausteine: ein Eintrag je Baustein, Monatspreis je Volumenstufe und Einrichtung.
   - Automation Preisprofile: ein Eintrag je Tool, u. a. die Grundeinrichtung (Einrichtung ab).

   Jeder Text auf der Seite, der eine Regel nennt (zwei Monate gratis, +50 %, +10 bis 50 %),
   kommt aus texteAusRegeln(). So kann keine Regel im Rechner anders sein als im Text. */

(function (wurzel) {
  'use strict';

  /* ===== Regeln. Nur hier ändern, danach die Probe-Rechnungen laufen lassen. ===== */
  var REGELN = {
    stufen: ['S', 'M', 'L', 'XL'],                    // bis 100, bis 500, bis 2.000, bis 5.000
    stufenLabel: { S: 'bis 100', M: 'bis 500', L: 'bis 2.000', XL: 'bis 5.000', X: 'mehr als 5.000' },
    volumenfaktorEinrichtung: { S: 1, M: 1.1, L: 1.25, XL: 1.5 },
    aufschlagJeWeiteremKonto: 0.5,                    // +50 % auf Monatspreis und Einrichtung, nur Autopilot
    bezahlteMonateBeiJaehrlich: 10,                   // jährlich zahlen: 10 von 12 Monaten
    grosseStufen: ['L', 'XL', 'X'],                   // ab 500: Hinweis groß, Basis ohne Rechnungen als Beleg
    maxKonten: 3
  };

  /* data-Attribute der Preisbausteine an der versteckten Collection List.
     Gelesen mit getAttribute: dataset macht aus data-preis-bis-100 den Schlüssel »preisBis-100«, nicht »preisBis100«. */
  var STUFE_ZU_ATTR = { S: 'data-preis-bis-100', M: 'data-preis-bis-500', L: 'data-preis-bis-2000', XL: 'data-preis-bis-5000' };
  function attr(el, name) { return el.getAttribute ? el.getAttribute(name) : null; }

  function zahl(wert) {
    if (wert === null || wert === undefined || wert === '') return null;
    var n = Number(String(wert).trim().replace(/\s|€/g, '').replace(',', '.'));
    return isFinite(n) ? n : null;
  }

  /* Rundung der Einrichtung auf …9 €, z. B. 548,90 → 549, 1.798,50 → 1.799 */
  function aufNeun(x) { return Math.ceil((x + 1) / 10) * 10 - 1; }

  /* Cent-genau runden, damit 9,99 × 3 nicht 29,969999… ergibt */
  function cent(x) { return Math.round(x * 100) / 100; }

  /* ===== Preisbausteine aus dem DOM lesen =====
     Erwartet je Baustein ein Element mit data-schluessel, data-preis-bis-100 … data-preis-bis-5000, data-einrichtung. */
  function leseBausteine(elemente) {
    var b = {};
    var fehler = [];
    elemente.forEach(function (el) {
      var s = attr(el, 'data-schluessel');
      if (!s) return;
      b[s] = { einrichtung: zahl(attr(el, 'data-einrichtung')) || 0 };
      REGELN.stufen.forEach(function (st) {
        var v = zahl(attr(el, STUFE_ZU_ATTR[st]));
        if (v === null) fehler.push(s + ' ' + st);
        b[s][st] = v;
      });
    });
    ['basis', 'autopilot', 'eu-einseitig', 'eu-beides', 'drittland', 'fremdwaehrung', 'prap', 'rechnungen-deckel', 'rechnung-stueck']
      .forEach(function (s) { if (!b[s]) fehler.push(s + ' fehlt'); });
    if (fehler.length && typeof console !== 'undefined') console.warn('[Automation-Rechner] Preisbausteine unvollständig:', fehler.join(', '));
    return b;
  }

  /* ===== Rechnung =====
     eingabe: { stufe: 'S'|'M'|'L'|'XL'|'X', konten: 1..3, paket: 'basis'|'rechnung'|'autopilot',
                jaehrlich: bool, eu: 'nein'|'b2b'|'b2c'|'beide', drittland: bool, fremdwaehrung: bool, prap: bool }
     profil:  { einrichtungAb: Zahl }  aus dem Preisprofil des Tools */
  function rechne(eingabe, bausteine, profil) {
    var st = eingabe.stufe;
    var anfrage = st === 'X';
    var konten = Math.min(Math.max(eingabe.konten || 1, 1), REGELN.maxKonten);
    var weitere = konten - 1;
    var faktorKonten = 1 + REGELN.aufschlagJeWeiteremKonto * weitere;
    var ergebnis = { anfrage: anfrage, monatlich: null, einrichtung: 0, deckelRechnungen: null, jahresbetrag: null, monatlichBeiJaehrlich: null, zeilen: [] };

    if (eingabe.paket === 'basis' || eingabe.paket === 'rechnung') {
      var z = anfrage ? 'XL' : st;
      ergebnis.monatlich = cent(bausteine.basis[z] * konten);
      if (eingabe.paket === 'rechnung') ergebnis.deckelRechnungen = bausteine['rechnungen-deckel'][z];
    }

    if (eingabe.paket === 'autopilot') {
      if (anfrage) return ergebnis;
      var m = bausteine.autopilot[st];
      var e = profil.einrichtungAb;
      ergebnis.zeilen.push({ schluessel: 'grund', betrag: e });
      if (eingabe.eu && eingabe.eu !== 'nein') {
        var euKey = eingabe.eu === 'beide' ? 'eu-beides' : 'eu-einseitig';
        m += bausteine[euKey][st]; e += bausteine[euKey].einrichtung;
        ergebnis.zeilen.push({ schluessel: euKey, betrag: bausteine[euKey].einrichtung });
      }
      [['drittland', 'drittland'], ['fremdwaehrung', 'fremdwaehrung'], ['prap', 'prap']].forEach(function (p) {
        if (eingabe[p[0]]) {
          m += bausteine[p[1]][st]; e += bausteine[p[1]].einrichtung;
          ergebnis.zeilen.push({ schluessel: p[1], betrag: bausteine[p[1]].einrichtung });
        }
      });
      var einr = aufNeun(e * REGELN.volumenfaktorEinrichtung[st]);
      if (REGELN.volumenfaktorEinrichtung[st] > 1) ergebnis.zeilen.push({ schluessel: 'volumen', betrag: einr - e });
      if (weitere > 0) {
        var mitKonten = aufNeun(einr * faktorKonten);
        ergebnis.zeilen.push({ schluessel: 'weitere-konten', betrag: mitKonten - einr });
        einr = mitKonten;
        m = m * faktorKonten;
      }
      ergebnis.monatlich = cent(m);
      ergebnis.einrichtung = einr;
    }

    if (eingabe.jaehrlich && ergebnis.monatlich !== null) {
      ergebnis.jahresbetrag = cent(ergebnis.monatlich * REGELN.bezahlteMonateBeiJaehrlich);
      ergebnis.monatlichBeiJaehrlich = cent(ergebnis.jahresbetrag / 12);
    }
    return ergebnis;
  }

  /* ===== Texte, die eine Regel nennen. Nie von Hand in Webflow schreiben. ===== */
  var ZAHLWORT = { 1: 'einen Monat', 2: 'zwei Monate', 3: 'drei Monate' };
  function prozent(f) { return Math.round(f * 100) + ' %'; }

  function texteAusRegeln() {
    var gratis = 12 - REGELN.bezahlteMonateBeiJaehrlich;
    var faktoren = REGELN.stufen.map(function (s) { return REGELN.volumenfaktorEinrichtung[s] - 1; }).filter(function (f) { return f > 0; });
    return {
      stoererJaehrlich: (ZAHLWORT[gratis] || gratis + ' Monate') + ' gratis',
      hinweisJaehrlich: (ZAHLWORT[gratis] || gratis + ' Monate').replace(/^./, function (c) { return c.toUpperCase(); }) + ' gratis, für alle Pakete. Die Einrichtung zahlst du einmalig wie bei monatlich.',
      weiteresKonto: '+' + prozent(REGELN.aufschlagJeWeiteremKonto),
      mehrVolumen: '+' + prozent(Math.min.apply(null, faktoren)).replace(' %', '') + ' bis ' + prozent(Math.max.apply(null, faktoren))
    };
  }

  /* {deckel} und {stueck} in CMS-Texten durch echte Preise ersetzen */
  function setzePreiseEin(text, bausteine, stufe) {
    var z = stufe && stufe !== 'X' ? stufe : 'XL';
    var fehlt = ['basis', 'autopilot', 'rechnungen-deckel', 'rechnung-stueck'].some(function (k) { return !bausteine[k]; });
    if (fehlt) return String(text);
    return String(text)
      .replace(/\{deckel\}/g, euro(bausteine['rechnungen-deckel'][z]))
      .replace(/\{stueck\}/g, euro(bausteine['rechnung-stueck'][z]))
      .replace(/\{basis-jahr\}/g, euro(bausteine.basis[z] * REGELN.bezahlteMonateBeiJaehrlich))
      .replace(/\{basis\}/g, euro(bausteine.basis[z]))
      .replace(/\{autopilot\}/g, euro(bausteine.autopilot.S))
      .replace(/\{weiteres-konto\}/g, texteAusRegeln().weiteresKonto);
  }

  function euro(n) {
    var v = cent(n);
    if (v < 1 && v > 0) return Math.round(v * 100) + ' ct';
    return v.toLocaleString('de-DE', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }) + ' €';
  }

  /* ===== Preise in statischen Elementen (z. B. Pakete-Karten) =====
     <span data-preis="basis"></span>                       9,99 €
     <span data-preis="basis" data-preis-mal="jahr"></span>  Jahresbetrag (bezahlte Monate aus REGELN)
     <span data-preis="rechnungen-deckel" data-preis-stufe="XL"></span>
     Stufe ohne Angabe: S. Fehlt ein Baustein, bleibt das Element leer und es gibt eine Warnung. */
  function fuellePreise(elemente, bausteine) {
    var fehlt = [];
    elemente.forEach(function (el) {
      var d = el.dataset || el;
      var b = bausteine[d.preis];
      var st = d.preisStufe || 'S';
      if (!b || b[st] === null || b[st] === undefined) { fehlt.push(d.preis + ' ' + st); return; }
      var wert = b[st];
      if (d.preisMal === 'jahr') wert = wert * REGELN.bezahlteMonateBeiJaehrlich;
      var text = euro(wert);
      if (el.dataset) el.textContent = text; else el.text = text;
    });
    if (fehlt.length && typeof console !== 'undefined') console.warn('[Automation-Rechner] Preis fehlt:', fehlt.join(', '));
  }

  var api = { REGELN: REGELN, leseBausteine: leseBausteine, rechne: rechne, texteAusRegeln: texteAusRegeln, setzePreiseEin: setzePreiseEin, euro: euro, aufNeun: aufNeun, fuellePreise: fuellePreise };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else wurzel.bstAutomationRechner = api;
})(this);
