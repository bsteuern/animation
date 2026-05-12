<script>
<!-- Wird in späteren Phasen aktiviert -->
<!-- <script src="https://DEIN-USER.github.io/DEIN-REPO/preisrechner/preisrechner.js"></script> -->

/* ════════════════════════════════════════════════════════════
   b'STEUERN PREISRECHNER · ENGINE · ETAPPE 1 · v26
   Webflow → Pages → preis-2 → Page Settings → Before </body> tag
   ════════════════════════════════════════════════════════════ */

  /* =========================================================
     KONFIGURATION & PRICING (nach CRM-Spec)
     ---------------------------------------------------------
     Alle Werte hier sind authoritative Snapshots aus dem CRM.
     Bei Anpassungen: PACKAGES (Paketpreise), TX_TIERS, REVENUE_TIERS,
     VORJAHRE_PRICES und HOLDINGS_PRICE/HOLDINGS_VORJAHR aktualisieren.
     ========================================================= */

  const PACKAGES = {
    einzelunternehmer: {
      label: 'Einzelunternehmer',
      packages: [
        {
          id: 'selbststarter',
          name: 'Selbststarter',
          badge: 'Grundpaket',
          tagline: 'Günstigster Einstieg',
          price: 149,
          desc: 'Du buchst, wir übernehmen den Jahresabschluss.',
          features: [
            'EÜR & Jahresabschluss',
            'Alle betrieblichen Steuern',
            'Elektronische Übermittlung',
            '100 € Beratungsguthaben p.a.'
          ]
        },
        {
          id: 'sorglos',
          name: 'Begleitung',
          badge: 'Mittelpaket',
          tagline: 'Mit monatlichem Review',
          price: 199,
          desc: 'Wir reviewen monatlich, Du übermittelst die UVA selbst.',
          features: [
            'Alles aus Selbststarter',
            'Monatlicher Review (Belege >100 € im Fokus)',
            'Alles bereit für die UVA – Du übermittelst',
            '200 € Beratungsguthaben p.a.'
          ]
        },
        {
          id: 'vollservice',
          name: 'Vollservice',
          badge: 'Bald verfügbar',
          tagline: 'In Vorbereitung – Du wirst informiert',
          price: 269,
          comingSoon: true,
          desc: 'Wir kümmern uns um alles — Buchhaltung, UVA und Zusammenfassende Meldung.',
          features: [
            'Verbuchen der hochgeladenen Belege',
            'UVA-Übermittlung',
            'Zusammenfassende Meldung',
            '400 € Beratungsguthaben p.a.'
          ]
        }
      ]
    },
    personengesellschaft: {
      label: 'Personengesellschaft',
      packages: [
        { id: 'selbststarter', name: 'Selbststarter', badge: 'Grundpaket', tagline: 'Günstigster Einstieg', price: 199,
          desc: 'Du buchst, wir übernehmen den Jahresabschluss.',
          features: ['Bilanz & Jahresabschluss','Alle betrieblichen Steuern','Gesonderte Feststellung','100 € Beratungsguthaben p.a.'] },
        { id: 'sorglos', name: 'Begleitung', badge: 'Mittelpaket', tagline: 'Mit monatlichem Review', price: 249,
          desc: 'Wir reviewen monatlich, Du übermittelst die UVA selbst.',
          features: ['Alles aus Selbststarter','Monatlicher Review (Belege >100 € im Fokus)','Alles bereit für die UVA – Du übermittelst','200 € Beratungsguthaben p.a.'] },
        { id: 'vollservice', name: 'Vollservice', badge: 'Bald verfügbar', tagline: 'In Vorbereitung – Du wirst informiert', price: 319, comingSoon: true,
          desc: 'Wir kümmern uns um alles — Buchhaltung, UVA und Zusammenfassende Meldung.',
          features: ['Verbuchen der hochgeladenen Belege','UVA-Übermittlung','Zusammenfassende Meldung','400 € Beratungsguthaben p.a.'] }
      ]
    },
    juristische: {
      label: 'Juristische Person',
      packages: [
        { id: 'selbststarter', name: 'Selbststarter', badge: 'Grundpaket', tagline: 'Günstigster Einstieg', price: 249,
          desc: 'Du buchst, wir übernehmen den Jahresabschluss.',
          features: ['E-Bilanz & Jahresabschluss','KSt-, Gewerbe- & USt-Erklärung','Offenlegung Bundesanzeiger','100 € Beratungsguthaben p.a.'] },
        { id: 'sorglos', name: 'Begleitung', badge: 'Mittelpaket', tagline: 'Mit monatlichem Review', price: 299,
          desc: 'Wir reviewen monatlich, Du übermittelst die UVA selbst.',
          features: ['Alles aus Selbststarter','Monatlicher Review (Belege >100 € im Fokus)','Alles bereit für die UVA – Du übermittelst','200 € Beratungsguthaben p.a.'] },
        { id: 'vollservice', name: 'Vollservice', badge: 'Bald verfügbar', tagline: 'In Vorbereitung – Du wirst informiert', price: 369, comingSoon: true,
          desc: 'Wir kümmern uns um alles — Buchhaltung, UVA und Zusammenfassende Meldung.',
          features: ['Verbuchen der hochgeladenen Belege','UVA-Übermittlung','Zusammenfassende Meldung','400 € Beratungsguthaben p.a.'] }
      ]
    }
  };

  /* ── PRICING-KONSTANTEN nach CRM-Spec ──────────────────── */
  const HOLDINGS_PRICE   = 65;     // Holdings monatlich (flat)
  const HOLDINGS_VORJAHR = 780;    // Holdings Vorjahre pro Jahr (flat)
  const ONBOARDING       = 299;    // Onboarding-Pauschale (flat, no markup)
  const RATEN_COUNT      = 6;      // Anzahl Raten für Vormonate + Vorjahre

  /* ── TRANSAKTIONS-AUFSCHLAG (tier-based, kein Markup mehr) ──
     Bis 100 inkludiert. Über 500 ist Cap bei 250 € erreicht — kein
     weiterer Anstieg. Je Tier ist ein fester €-Wert, keine Continuous-
     Funktion mehr. Stepper läuft in 100er-Schritten, deckt also alle
     Tier-Übergänge sauber ab. */
  const TX_STEP     = 50;
  const TX_MIN      = 0;
  const TX_MAX      = 600;  // bei 600 ist der Cap-Tier erreicht; weiter ist redundant
  const TX_TIERS = [
    { upTo: 100,      cost: 0   },  // 0–100
    { upTo: 200,      cost: 50  },  // 100–200
    { upTo: 300,      cost: 100 },  // 200–300
    { upTo: 400,      cost: 150 },  // 300–400
    { upTo: 500,      cost: 200 },  // 400–500
    { upTo: Infinity, cost: 250 },  // >500 (Cap)
  ];

  /* ── UMSATZ-AUFSCHLAG ──────────────────────────────────────
     Markup % wird auf den monatlichen Paketpreis angewendet, NICHT
     auf den Transaktions-Aufschlag und NICHT auf das Onboarding.
     Markup gilt aber für Vormonate (= Back-Billing des Service) und
     Vorjahre (= Nachholbuchung früherer Geschäftsjahre). */
  const REVENUE_TIERS = [
    { value: 0,        label: 'bis 250k',  percent: 0  },
    { value: 250000,   label: '250–500k',  percent: 5  },
    { value: 500000,   label: '500k–1Mio', percent: 10 },
    { value: 1000000,  label: '1–2Mio',    percent: 15 },
    { value: 2000000,  label: '2–3Mio',    percent: 20 },
    { value: 3000000,  label: '3–4Mio',    percent: 25 },
    { value: 4000000,  label: '4–5Mio',    percent: 30 },
    { value: 5000000,  label: '>5Mio',     percent: 35 }
  ];

  function getRevenueTier(value) {
    return REVENUE_TIERS.find(t => t.value === value) || REVENUE_TIERS[0];
  }

  function revenueSurcharge(monthlyBase) {
    const tier = getRevenueTier(state.revenue);
    return monthlyBase * (tier.percent / 100);
  }

  /* ── VORJAHRES-PREISE (flat pro Jahr, pro Form, pro Paket) ──
     Markup % wird zusätzlich angewendet. Holding hat einen separaten
     Flat-Wert (HOLDINGS_VORJAHR) und keine Paket-Differenzierung. */
  const VORJAHRE_PRICES = {
    einzelunternehmer:    { selbststarter: 1788, sorglos: 2388, vollservice: 3228 },
    personengesellschaft: { selbststarter: 2388, sorglos: 2988, vollservice: 3828 },
    juristische:          { selbststarter: 2988, sorglos: 3588, vollservice: 4428 }
  };

  // PrevYears Stepper — wieviele Vorjahre kann der User wählen?
  // Dynamisch berechnet: currentYear − PY_ANCHOR. Anker-Jahr 2022 ist das
  // älteste wählbare Vorjahr. Bei aktuellem Jahr 2026 = 4 Vorjahre wählbar
  // (2022, 2023, 2024, 2025). Wenn der Calculator 2027 läuft = 5 Vorjahre.
  // Wenn Du den Anker-Jahres-Cut anders willst, hier ändern.
  const PY_MIN = 0;
  const PY_ANCHOR = 2022;
  const PY_MAX = new Date().getFullYear() - PY_ANCHOR;
  /* ─────────────────────────────────────────────────────── */

  const ACCENT_MAP = {
    indigo: '#3B3BC8',
    purple: '#C531A4',
    pink:   '#FF0670',
    teal:   '#1DB8C6',
    yellow: '#F6DF35'
  };

  const state = {
    form: 'einzelunternehmer',
    package: 'selbststarter',
    startMonth: 1,           // 1–12
    startYear: 2026,
    revenue: 0,              // chip data-value
    transactions: 100,       // multiple of 50
    prevYears: 0,            // 0–5
    accent: 'indigo',
    isStartup: false,        // Gründer/Startup-Toggle: 50 % Rabatt auf laufenden Service für 12 Monate

    // displayed values for animations
    displayedMonthly: 149,
    displayedTotalMonthly: 149,
    displayedTotalRaten: 0,
    displayedOneTime: 299,
    displayedTransactionsCost: 0,
    displayedBuchhaltungCost: 0,
    displayedPaket: 149,
    displayedPreMonthsRate: 0,
    displayedPreYearsRate: 0,
    displayedTxValue: 100,
    displayedPrevYears: 0,
    displayedStartupDiscount: 0,
    displayedBarMonthly: 149,
    displayedBarOneTime: 299,

    activeStepIdx: 0
  };

  // ═══════════════════════════════════════════════════════════════════
  //  GRÜNDER-RABATT — TABELLEN-BASIERT
  // ─────────────────────────────────────────────────────────────────
  //  Statt eines pauschalen 50%-Rabatts gibt es seit CRM-Update vom Feb 2026
  //  eine differenzierte Pauschale je Form-Kategorie und Transaktionsstufe.
  //  Die Pauschale ersetzt im 1. Geschäftsjahr den PAKET-Anteil; TX-Aufschlag
  //  und Umsatz-Aufschlag bleiben regulär.
  //
  //  Drei Tarif-Kategorien (= Spalten der CRM-Tabelle):
  //    EÜR    — Einzelunternehmer mit EÜR-Pflicht (Selbststarter-Paket)
  //    BILANZ — Einzelunternehmer mit Bilanzierungspflicht (höhere Pakete)
  //    JP_PG  — Juristische Personen + Personengesellschaften
  //
  //  Pauschalen sind JÄHRLICH (€). Werden im Display auf 12 Monate verteilt.
  //  Ab Monat 13 greift wieder der reguläre Paket-Preis.
  const STARTUP_DURATION_MONTHS = 12;
  const STARTUP_TARIFS = {
    'EÜR': [
      { txYearlyMax: 29,       yearly: 999,  txLabel: '< 30'    },
      { txYearlyMax: 60,       yearly: 1069, txLabel: 'bis 60'  },
      { txYearlyMax: 120,      yearly: 1299, txLabel: 'bis 120' },
      { txYearlyMax: 240,      yearly: 1499, txLabel: 'bis 240' },
      { txYearlyMax: 360,      yearly: 1599, txLabel: 'bis 360' },
      { txYearlyMax: 480,      yearly: 1788, txLabel: 'bis 480' },
      { txYearlyMax: Infinity, yearly: 1788, txLabel: '> 480'   }
    ],
    'BILANZ': [
      { txYearlyMax: 29,       yearly: 1099, txLabel: '< 30'    },
      { txYearlyMax: 60,       yearly: 1299, txLabel: 'bis 60'  },
      { txYearlyMax: 120,      yearly: 1499, txLabel: 'bis 120' },
      { txYearlyMax: 240,      yearly: 1799, txLabel: 'bis 240' },
      { txYearlyMax: 360,      yearly: 1999, txLabel: 'bis 360' },
      { txYearlyMax: 480,      yearly: 2149, txLabel: 'bis 480' },
      { txYearlyMax: Infinity, yearly: 2388, txLabel: '> 480'   }
    ],
    'JP_PG': [
      { txYearlyMax: 29,       yearly: 1299, txLabel: '< 30'    },
      { txYearlyMax: 60,       yearly: 1549, txLabel: 'bis 60'  },
      { txYearlyMax: 120,      yearly: 1799, txLabel: 'bis 120' },
      { txYearlyMax: 240,      yearly: 1999, txLabel: 'bis 240' },
      { txYearlyMax: 360,      yearly: 2249, txLabel: 'bis 360' },
      { txYearlyMax: 480,      yearly: 2499, txLabel: 'bis 480' },
      { txYearlyMax: Infinity, yearly: 2988, txLabel: '> 480'   }
    ]
  };
  const STARTUP_CATEGORY_LABELS = {
    'EÜR':    'Einzelunternehmer · EÜR',
    'BILANZ': 'Einzelunternehmer · Bilanz',
    'JP_PG':  'Juristische Person & Personengesellschaft'
  };

  // Mapping aktuelle Form + Paket → Tarif-Kategorie
  //   Einzelunternehmer.selbststarter  (149 €/Mo) → EÜR
  //   Einzelunternehmer.begleitung    (199 €/Mo) → BILANZ
  //   Einzelunternehmer.vollservice   (269 €/Mo) → BILANZ
  //   Personengesellschaft.*                      → JP_PG
  //   Juristische.*                               → JP_PG
  //   Holdings                                    → null (Asterisk-Mode)
  function getStartupTarifCategory() {
    if (state.form === 'holdings') return null;
    if (state.form === 'einzelunternehmer') {
      return state.package === 'selbststarter' ? 'EÜR' : 'BILANZ';
    }
    return 'JP_PG';
  }

  // Liefert das aktuelle Tarif-Tier basierend auf state.transactions × 12
  //   Returns: { category, yearly, monthly, txPerYear, txLabel } oder null
  function getStartupTarif() {
    const cat = getStartupTarifCategory();
    if (!cat) return null;
    const txPerYear = state.transactions * 12;
    const tiers = STARTUP_TARIFS[cat];
    const tier = tiers.find(t => txPerYear <= t.txYearlyMax) || tiers[tiers.length - 1];
    return {
      category: cat,
      categoryLabel: STARTUP_CATEGORY_LABELS[cat],
      yearly: tier.yearly,
      monthly: tier.yearly / 12,
      txPerYear,
      txLabel: tier.txLabel
    };
  }
  // ═══════════════════════════════════════════════════════════════════

  // Klassischer-Steuerberater-Vergleich: Multiplier pro Rechtsform. Begründung:
  // EÜR-Einzelunternehmer ist im klassischen StBVV-Pricing am günstigsten,
  // GmbH-Bilanzen am teuersten (höhere Faktoren, mehr Anlagen). Holdings nutzt
  // updateCompare nicht (eigener Display-Pfad mit Asterisk), daher kein Eintrag.
  const STB_MULTIPLIERS = {
    einzelunternehmer:    1.4,
    personengesellschaft: 1.6,
    juristische:          1.9
  };

  // ============= COUNT-UP ANIMATION =============
  const activeAnimations = new Map();
  const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animateValue(el, from, to, duration = 500, formatter = v => v) {
    if (!el) return;
    if (PREFERS_REDUCED_MOTION || Math.abs(from - to) < 0.005) { el.textContent = formatter(to); return; }
    const prior = activeAnimations.get(el);
    if (prior) cancelAnimationFrame(prior);
    const start = performance.now();
    const delta = to - from;
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      // Kein Math.round mehr — der Formatter (formatEuro / formatInt) macht
      // selbst die Rundung, sodass Cent-Präzision im Endwert erhalten bleibt
      const value = from + delta * eased;
      el.textContent = formatter(value);
      if (t < 1) activeAnimations.set(el, requestAnimationFrame(step));
      else activeAnimations.delete(el);
    }
    activeAnimations.set(el, requestAnimationFrame(step));
  }

  // ───────── Format-Helfer ─────────
  // Alle Euro-Beträge werden auf den nächsten ganzen Euro AUFGERUNDET
  // angezeigt — keine Cent-Beträge im UI. Das macht die Kalkulation
  // klarer lesbar und verhindert "krumme" Marketing-Preise.
  // Math.ceil garantiert, dass wir nie einen niedrigeren Preis suggerieren
  // als tatsächlich anfällt — Aufrundung statt Rundung ist hier ehrlich.
  function priceCeil(value) {
    return Math.ceil(value - 1e-9);
  }
  // Integer-Format (ohne Dezimal) für Anzahlen
  const formatInt = v => Math.round(v).toLocaleString('de-DE');
  // Euro auf nächste ganze Zahl, mit Suffix " €"
  const formatEuro = v => priceCeil(v).toLocaleString('de-DE') + ' €';
  // Wert-Only-Formatter: für Stellen wo das € separat gerendert wird
  // (z.B. Card-Preise haben eigene .option__price-currency-Span daneben).
  // Ohne diesen Helper würde es "1.270 € €" anzeigen — doppeltes €.
  const formatEuroValue = v => priceCeil(v).toLocaleString('de-DE');

  // ============= GLOSSAR-TOOLTIPS =============
  // Steuer-Jargon-Erklärungen, die als "i"-Tooltips in Feature-Listen erscheinen.
  // Tone: locker & modern, Du-Ansprache, kurz.
  const GLOSSARY = {
    'EÜR': {
      title: 'EÜR · Einnahmen-Überschuss-Rechnung',
      body: 'Die einfache Variante der Gewinnermittlung: Du listest auf, was reinkommt und rausgeht — die Differenz ist Dein Gewinn. Möglich für Einzelunternehmer und Freiberufler ohne Bilanzpflicht.'
    },
    'E-Bilanz': {
      title: 'E-Bilanz · Elektronische Bilanz',
      body: 'Bilanz und GuV digital ans Finanzamt. Pflicht für GmbHs, UGs und andere Kapitalgesellschaften — wir machen das für Dich.'
    },
    'Gesonderte Feststellung': {
      title: 'Gesonderte Feststellung',
      body: 'Bei Personengesellschaften wird der Gewinn erst gemeinsam ermittelt und dann auf die Gesellschafter verteilt. Diese Aufteilung ist Grundlage für die persönliche Steuer der einzelnen Gesellschafter.'
    },
    'Plausibilitätsprüfung': {
      title: 'Plausibilitätsprüfung',
      body: 'Wir checken Deine Buchhaltung jeden Monat auf Auffälligkeiten — fehlende Belege, ungewöhnliche Beträge, falsche Konten. Bevor was Richtung Finanzamt geht, weißt Du, ob alles stimmt.'
    },
    'UVA': {
      title: 'UVA · Umsatzsteuer-Voranmeldung',
      body: 'Monatliche oder quartalsweise Meldung der Umsatzsteuer ans Finanzamt. Bei Begleitung bereiten wir alles vor — Du übermittelst selbst. Beim Vollservice (in Vorbereitung) übernehmen wir die komplette Übermittlung.'
    },
    'Zusammenfassende Meldung': {
      title: 'Zusammenfassende Meldung',
      body: 'Pflichtmeldung ans Bundeszentralamt für Steuern für innergemeinschaftliche Lieferungen und Leistungen — also Geschäfte mit Kunden im EU-Ausland. Wer EU-weit verkauft, muss diese Meldung quartalsweise oder monatlich abgeben.'
    },
    'Bescheidprüfung': {
      title: 'Bescheidprüfung',
      body: 'Wenn das Finanzamt einen Steuerbescheid schickt, prüfen wir ihn auf Fehler — und legen bei Bedarf fristgerecht Einspruch ein. Spart oft mehr, als das Paket kostet.'
    },
    'Buchhaltungs-Review': {
      title: 'Buchhaltungs-Review',
      body: 'Tiefer Check der gesamten Buchhaltung — nicht nur stichprobenartig, sondern strukturell: Konten richtig angelegt, Buchungen korrekt zugeordnet, Belege vollständig.'
    },
    'Bundesanzeiger': {
      title: 'Offenlegung Bundesanzeiger',
      body: 'Kapitalgesellschaften müssen ihren Jahresabschluss im Bundesanzeiger veröffentlichen. Wir kümmern uns um Format und Übermittlung — fristgerecht und konform.'
    }
  };

  // Escapes a literal string for safe use in an HTML attribute
  function escAttr(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // Wraps known jargon terms in tooltip markup. Sorts by length DESC so longer
  // terms (E-Bilanz, Gesonderte Feststellung) are matched before shorter substrings.
  function wrapJargon(text) {
    const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
    let result = text;
    let counter = 0;
    terms.forEach(term => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Word-Boundary: davor String-Start oder Whitespace/Satzzeichen, danach Whitespace/Satzzeichen/Hyphen/Ende
      const re = new RegExp(`(^|[\\s,.;:!?])(${escaped})(?=[\\s,.;:!?\\-—]|$)`, 'g');
      result = result.replace(re, (match, before, m) => {
        const def = GLOSSARY[term];
        const id = `gloss-${term.replace(/\W+/g,'')}-${counter++}`;
        // Term IS Trigger, Bubble ist Child (statt Sibling) — kein Wrapper-Span
        // im Text-Flow, der inline-flex-Geister erzeugen könnte. Trigger hat
        // position:relative für die Bubble-Verankerung.
        return `${before}<span class="jargon tooltip-trigger" id="${id}" tabindex="0" role="button" aria-label="Was ist ${escAttr(term)}?" aria-expanded="false">${m}<span class="tooltip-bubble tooltip-bubble--left jargon__bubble" role="tooltip"><strong>${escAttr(def.title)}</strong>${escAttr(def.body)}</span></span>`;
      });
    });
    return result;
  }

  // ============= RENDER PACKAGES =============
  function renderPackages() {
    const container = document.getElementById('packageOptions');
    if (state.form === 'holdings') return; // skip for holdings
    const pkgs = PACKAGES[state.form].packages;
    // Wenn das aktuell selektierte Paket nicht mehr existiert ODER coming-soon ist,
    // auf den Selbststarter zurückfallen — die Coming-Soon-Karte darf nie aktiv sein.
    const current = pkgs.find(p => p.id === state.package);
    if (!current || current.comingSoon) state.package = 'selbststarter';

    container.innerHTML = pkgs.map(pkg => {
      const tier = pkg.id === 'selbststarter' ? 'grundpaket'
                 : pkg.id === 'vollservice' ? 'vollpaket'
                 : 'empfehlung';
      const cs = pkg.comingSoon;

      // Card-spezifischer Gründer-Hint: berechnet den maximal möglichen Rabatt
      // für DIESES Paket bei der aktuellen Form + TX-Stufe. Wenn isStartup
      // aktiv ist, zeigt jede Card ihren eigenen Discount-Prozentsatz statt
      // eines generischen "−50 %". Bei TX-Stufen ohne Rabatt: kein Hint.
      let startupHint = '';
      if (state.isStartup && !cs) {
        // Tarif-Kategorie für DIESE Card (kann anders sein als state.package!)
        let cardCat;
        if (state.form === 'einzelunternehmer') {
          cardCat = pkg.id === 'selbststarter' ? 'EÜR' : 'BILANZ';
        } else if (state.form !== 'holdings') {
          cardCat = 'JP_PG';
        }
        if (cardCat) {
          const txPerYear = state.transactions * 12;
          const tiers = STARTUP_TARIFS[cardCat];
          const cardTier = tiers.find(t => txPerYear <= t.txYearlyMax) || tiers[tiers.length - 1];
          const regularYearly = pkg.price * 12;
          const cardSaving = regularYearly - cardTier.yearly;
          if (cardSaving > 0) {
            const cardPct = Math.round((cardSaving / regularYearly) * 100);
            startupHint = `<span class="option__startup-hint">−${cardPct} % im 1. Jahr</span>`;
          }
        }
      }

      return `
      <button type="button" class="option option--pkg ${pkg.featured ? 'is-featured' : ''} ${cs ? 'is-coming-soon' : ''}" role="radio" aria-pressed="${!cs && pkg.id === state.package}" aria-disabled="${cs ? 'true' : 'false'}" data-pkg="${pkg.id}" ${cs ? 'tabindex="-1"' : ''}>
        <div class="option__header">
          <span class="option__badge ${pkg.featured ? 'option__badge--featured' : ''}" data-tier="${tier}">${pkg.badge || ''}</span>
          ${pkg.tagline ? `<span class="option__badge-sub">${pkg.tagline}</span>` : ''}
          <span class="option__label">${pkg.name}</span>
          <span class="option__desc">${pkg.desc}</span>
        </div>
        <div class="option__price-block">
          <span class="option__price-value" data-pkg-price="${pkg.id}">${pkg.price}</span><span class="option__price-currency"> €</span>
          <span class="option__price-unit">/ Monat</span>
        </div>
        ${startupHint}
        <hr class="option__divider" />
        <ul class="option__features">
          ${(pkg.features || []).map(f => `<li><span class="option__feature-text">${f}</span></li>`).join('')}
        </ul>
      </button>
    `;
    }).join('');

    container.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Coming-Soon-Karten sind nicht wählbar — Click wird komplett ignoriert
        if (btn.classList.contains('is-coming-soon')) {
          e.preventDefault();
          return;
        }
        container.querySelectorAll('.option:not(.is-coming-soon)').forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        state.package = btn.dataset.pkg;
        updateSummary();
      });
    });
  }

  // ============= COMPARE-TABELLE =============
  // Feature-Matrix: zeigt welche Features welches Paket hat
  const COMPARE_FEATURES = [
    { key: 'jahresabschluss', label: 'Jahresabschluss & Bilanz', selbststarter: true, sorglos: true, vollservice: true },
    { key: 'steuern', label: 'Alle betrieblichen Steuererklärungen', selbststarter: true, sorglos: true, vollservice: true },
    { key: 'feststellung', label: 'Gesonderte Feststellung', selbststarter: true, sorglos: true, vollservice: true },
    { key: 'guthaben', label: 'Beratungsguthaben p.a.', selbststarter: '100 €', sorglos: '200 €', vollservice: '400 €' },
    { key: 'review', label: 'Monatlicher Review (Belege >100 €)', selbststarter: false, sorglos: true, vollservice: true },
    { key: 'uva_prep', label: 'Alles bereit für die UVA – Du übermittelst', selbststarter: false, sorglos: true, vollservice: false },
    { key: 'verbuchen', label: 'Verbuchen der hochgeladenen Belege', selbststarter: false, sorglos: false, vollservice: true },
    { key: 'uva_send', label: 'UVA-Übermittlung durch uns', selbststarter: false, sorglos: false, vollservice: true },
    { key: 'zm', label: 'Zusammenfassende Meldung', selbststarter: false, sorglos: false, vollservice: true },
    { key: 'bwa', label: 'Betriebswirtschaftliche Auswertung', tooltip: 'Der Preis kalkuliert sich je nach Aufwand. Wir besprechen den Umfang im Erstgespräch.', selbststarter: false, sorglos: true, vollservice: true },
    { key: 'support', label: 'Antwortzeit auf Anfragen', selbststarter: '3 Werktage', sorglos: '2 Werktage', vollservice: '1 Werktag' },
  ];

  function renderCompareTable() {
    const container = document.getElementById('compareTable');
    if (!container) return;
    if (state.form === 'holdings') return;
    const pkgs = PACKAGES[state.form].packages;
    if (!pkgs || pkgs.length < 3) { container.innerHTML = ''; return; }

    const renderCell = (val) => {
      if (val === true) return '<span class="compare-table__check" aria-label="enthalten">✓</span>';
      if (val === false) return '<span class="compare-table__cross" aria-label="nicht enthalten">—</span>';
      return `<span class="compare-table__value">${val}</span>`;
    };

    // Coming-Soon-Status der Pakete einmal vorab ermitteln — wird sowohl
    // im Header als auch in jeder Body-Cell der entsprechenden Spalte genutzt.
    const csByPkg = {
      selbststarter: pkgs.find(p => p.id === 'selbststarter')?.comingSoon === true,
      sorglos:       pkgs.find(p => p.id === 'sorglos')?.comingSoon === true,
      vollservice:   pkgs.find(p => p.id === 'vollservice')?.comingSoon === true,
    };

    // Label-Renderer für Tabelle + Akkordeon: hängt i-Tooltip an wenn f.tooltip
    // gesetzt ist. Nutzt das bestehende .tooltip-wrap / .tooltip-bubble Pattern,
    // damit Smart-Flip + Outside-Close-Logik automatisch greift.
    const renderLabel = (f) => {
      if (!f.tooltip) return f.label;
      const tipId = `tipFeat-${f.key}`;
      return `${f.label}<span class="tooltip-wrap tooltip-wrap--inline">
        <button type="button" class="tooltip-trigger" id="${tipId}" aria-label="Mehr Info zu ${f.label}" aria-expanded="false">i</button>
        <div class="tooltip-bubble" role="tooltip">${f.tooltip}</div>
      </span>`;
    };

    container.innerHTML = `
      <div class="compare-table__inner">
        <div class="compare-table__head">
          <div class="compare-table__head-cell compare-table__head-cell--label">Leistungen</div>
          ${pkgs.map(pkg => {
            const tier = pkg.id === 'selbststarter' ? 'grundpaket'
                       : pkg.id === 'vollservice' ? 'vollpaket'
                       : 'empfehlung';
            const isCs = pkg.comingSoon === true;
            return `
            <div class="compare-table__head-cell ${pkg.featured ? 'is-featured' : ''} ${isCs ? 'is-coming-soon' : ''}">
              <span class="compare-table__pkg-badge ${pkg.featured ? 'compare-table__pkg-badge--featured' : ''}" data-tier="${tier}">${pkg.badge || ''}</span>
              <span class="compare-table__pkg-name">${pkg.name}</span>
              <span class="compare-table__pkg-price">ab ${pkg.price} €<small>/ Mo</small></span>
            </div>
          `;}).join('')}
        </div>
        <div class="compare-table__body">
          ${COMPARE_FEATURES.map(f => `
            <div class="compare-table__row">
              <div class="compare-table__cell compare-table__cell--label">${renderLabel(f)}</div>
              <div class="compare-table__cell ${csByPkg.selbststarter ? 'is-coming-soon' : ''}">${renderCell(f.selbststarter)}</div>
              <div class="compare-table__cell ${pkgs.find(p=>p.id==='sorglos')?.featured ? 'is-featured' : ''} ${csByPkg.sorglos ? 'is-coming-soon' : ''}">${renderCell(f.sorglos)}</div>
              <div class="compare-table__cell ${csByPkg.vollservice ? 'is-coming-soon' : ''}">${renderCell(f.vollservice)}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <!-- MOBILE-AKKORDEON — sichtbar nur unter 640px (CSS), Desktop sieht
           die Tabelle oben. Pro Paket eine native <details>, sodass kein
           horizontaler Scroll mehr nötig ist. Featured Paket auto-open. -->
      <div class="compare-cards">
        ${pkgs.map(pkg => {
          const tier = pkg.id === 'selbststarter' ? 'grundpaket'
                     : pkg.id === 'vollservice' ? 'vollpaket'
                     : 'empfehlung';
          const isCs = pkg.comingSoon === true;
          const isFeatured = !!pkg.featured;
          const autoOpen = isFeatured ? 'open' : '';
          return `
          <details class="compare-card ${isFeatured ? 'is-featured' : ''} ${isCs ? 'is-coming-soon' : ''}" ${autoOpen}>
            <summary class="compare-card__head">
              <span class="compare-card__pkg-badge" data-tier="${tier}">${pkg.badge || ''}</span>
              <span class="compare-card__pkg-name">${pkg.name}</span>
              <span class="compare-card__pkg-price">ab ${pkg.price} €<small> / Mo</small></span>
              <svg class="compare-card__chevron" width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
              </svg>
            </summary>
            <ul class="compare-card__features">
              ${COMPARE_FEATURES.map(f => `
                <li>
                  <span class="compare-card__feature-label">${renderLabel(f)}</span>
                  <span class="compare-card__feature-value">${renderCell(f[pkg.id])}</span>
                </li>
              `).join('')}
            </ul>
          </details>
        `;}).join('')}
      </div>
    `;
  }

  // Live-Update der Paketpreise basierend auf aktueller Konfig (TX + Aufschlag)
  function updatePackagePrices() {
    if (state.form === 'holdings') return;
    const pkgs = PACKAGES[state.form].packages;
    const txCost = computeTransactionsCost();
    const tier = getRevenueTier(state.revenue);
    const markupFactor = 1 + (tier.percent / 100);
    // Vormonate-Rate (verteilt über 6 Monate) — nutzt das jeweilige Paket × Markup
    const vormonate = computeVormonate();
    // Vorjahre-Rate — paket-abhängig per CRM-Spec: VORJAHRE_PRICES[form][pkg]
    const vorjahre = state.prevYears;
    // "Konfiguriert" = TX über Standard ODER Aufschlag ODER Vormonate ODER Vorjahre aktiv
    const isConfigured = (txCost > 0) || (tier.percent > 0) || (vormonate > 0) || (vorjahre > 0);

    pkgs.forEach(pkg => {
      const surcharge = pkg.price * (tier.percent / 100);
      // Vormonate: paket-eigener Preis × Markup × Anzahl, verteilt auf 6 Raten
      const vormonateRatePerCard = (vormonate * pkg.price * markupFactor) / RATEN_COUNT;
      // Vorjahre: paket-eigener Flat-Jahresbetrag × Markup × Anzahl, /6 Raten
      const vorjahreRatePerCard = (vorjahre * getVorjahrePerYearCost(pkg.id)) / RATEN_COUNT;
      const total = pkg.price + txCost + surcharge + vormonateRatePerCard + vorjahreRatePerCard;
      const priceEl = document.querySelector(`[data-pkg-price="${pkg.id}"]`);
      const prefixEl = document.querySelector(`[data-pkg-prefix="${pkg.id}"]`);
      if (priceEl) {
        const stateKey = `displayedPkg_${pkg.id}`;
        const from = state[stateKey] || pkg.price;
        animateValue(priceEl, from, total, 380, formatEuroValue);
        state[stateKey] = total;
      }
      // "ab" verschwindet wenn Konfig aktiv → klarer Live-Kontext
      if (prefixEl) {
        prefixEl.textContent = isConfigured ? '' : 'ab';
        prefixEl.classList.toggle('is-empty', isConfigured);
      }
    });
  }

  function currentPackage() {
    if (state.form === 'holdings') return null;
    return PACKAGES[state.form].packages.find(p => p.id === state.package);
  }

  // ============= COMPUTED VALUES =============
  function computeVormonate() {
    // Vormonate = Anzahl Monate in dem Vertragsjahr VOR dem Startmonat
    return Math.max(0, state.startMonth - 1);
  }

  function computeTransactionsCost() {
    // Tier-basiert: feste €-Werte pro Tier, kein 5% Markup mehr.
    // Cap bei 250 € erreicht über 500 TX. Stepper läuft in 100ern,
    // sodass alle Tier-Übergänge sauber getroffen werden.
    const tier = TX_TIERS.find(t => state.transactions <= t.upTo);
    return tier ? tier.cost : 0;
  }

  // Vorjahres-Kosten pro Jahr (mit Markup) — abhängig vom gewählten Paket.
  // Pro Vorjahr ein flat Jahres-Pauschalpreis aus VORJAHRE_PRICES, plus
  // anteiliger Umsatz-Markup. Onboarding wird hier NICHT addiert (separat).
  function getVorjahrePerYearCost(pkgId) {
    if (state.form === 'holdings') return HOLDINGS_VORJAHR;
    const formPrices = VORJAHRE_PRICES[state.form];
    if (!formPrices) return 0;
    const baseAnnual = formPrices[pkgId] || 0;
    const tier = getRevenueTier(state.revenue);
    return baseAnnual * (1 + tier.percent / 100);
  }

  // ============= SUMMARY UPDATE =============
  // Trigger pulse animation on Live-Indicators on every actual update
  function pulseLiveIndicators() {
    const els = document.querySelectorAll('.summary__live, .floating-bar__live');
    els.forEach(el => {
      el.classList.remove('is-pulsing');
      // Force reflow to restart animation
      void el.offsetWidth;
      el.classList.add('is-pulsing');
    });
  }
  function updateSummary() {
    if (state.form === 'holdings') {
      document.getElementById('step-holdings').hidden = false;
      renderHoldings();
      pulseLiveIndicators();
      return;
    }

    // Reset Holdings styling
    document.getElementById('step-holdings').hidden = true;
    document.getElementById('summary').classList.remove('is-holdings');
    document.querySelector('.calc-steps').classList.remove('is-holdings');
    document.getElementById('floatingBar').classList.remove('is-holdings');
    document.getElementById('sumPriceAsterisk').hidden = true;
    document.getElementById('sumPricePrefix').hidden = true;
    document.getElementById('sumPriceNote').hidden = true;
    // Paket-Line wieder sichtbar (falls vorher Holdings aktiv war)
    const paketLineReset = document.getElementById('sumLinePaket');
    if (paketLineReset) paketLineReset.hidden = false;

    const pkg = currentPackage();
    const monthly  = pkg.price;
    const txCost   = computeTransactionsCost();
    const surcharge = revenueSurcharge(monthly);
    const surchargeTier = getRevenueTier(state.revenue);
    const totalMonthly = monthly + txCost + surcharge;

    // Gründer-Rabatt (tabellen-basiert, Feb 2026):
    //   Wenn isStartup aktiv → Lookup in STARTUP_TARIFS basierend auf Form +
    //   Paket + Transaktionen/Jahr. Die Pauschale aus der Tabelle ersetzt
    //   den PAKET-Anteil; TX-Aufschlag und Umsatz-Aufschlag bleiben regulär.
    //   Gilt für 12 Monate; ab Monat 13 voller Paket-Preis.
    //   Onboarding, Vormonate, Vorjahre sind vom Rabatt ausgenommen.
    let startupTarif = null;          // { category, yearly, monthly, txPerYear, txLabel }
    let startupDiscount = 0;          // Ersparnis pro Monat
    let effectiveMonthly = totalMonthly;
    if (state.isStartup) {
      startupTarif = getStartupTarif();
      if (startupTarif) {
        // Effektiv: Pauschale-Monthly + reguläre TX + regulärer Aufschlag
        const candidateMonthly = startupTarif.monthly + txCost + surcharge;
        // Sicherheits-Check: nur anwenden wenn günstiger als regulär.
        // Bei tiefen Stufen (>480 TX) ist Pauschale = Vollpreis, also ohne Rabatt.
        if (candidateMonthly < totalMonthly) {
          effectiveMonthly = candidateMonthly;
          startupDiscount = totalMonthly - effectiveMonthly;
        }
      }
    }

    const vormonate = computeVormonate();
    const vorjahre  = state.prevYears;

    // CRM-Spec:
    //   Vormonate-Total = vormonate × monthlyBase × (1 + markup)
    //                     → reine Service-Nachholung, ohne TX-Aufschlag,
    //                       aber MIT Umsatz-Markup
    //   Vorjahre-Total  = vorjahre × VORJAHRE_PRICES[form][pkg] × (1 + markup)
    //                     → flat Jahresbetrag aus CRM-Tabelle, paket-abhängig,
    //                       MIT Umsatz-Markup
    //   Beides verteilt auf 6 Monatsraten.
    const markupFactor = 1 + (surchargeTier.percent / 100);
    const vormonateTotal = vormonate * monthly * markupFactor;
    const vorjahreTotal  = vorjahre * getVorjahrePerYearCost(state.package);
    const vormonateRate  = vormonateTotal / RATEN_COUNT;
    const vorjahreRate   = vorjahreTotal  / RATEN_COUNT;
    const totalRaten     = vormonateRate + vorjahreRate;

    const oneTimeTotal = ONBOARDING;

    const pkgLine = `${pkg.name} · ${PACKAGES[state.form].label}`;

    // Hauptpreis-Berechnung VORHER, damit der animateValue-Call darunter
    // den richtigen Zielwert kennt. monthlyWithRaten = laufender Service + Raten
    // (was tatsächlich pro Monat anfällt, nicht nur der Service-Anteil).
    const monthlyWithRaten = effectiveMonthly + (totalRaten || 0);

    // ── Hauptpreis (= was tatsächlich pro Monat fällig wird, inkl. Raten und Rabatt)
    //    Damit ist der große Wert oben identisch zum "Ab nächstem Monat"-Wert unten.
    //    formatEuroValue (nur Zahl, ohne €) — das € steht im Markup daneben in
    //    .summary__price-unit (" € / Monat"). formatEuro mit Suffix würde "149 €  € / Monat" rendern.
    animateValue(document.getElementById('sumMonthly'), state.displayedMonthly, monthlyWithRaten, 500, formatEuroValue);
    state.displayedMonthly = monthlyWithRaten;
    document.getElementById('sumPkgLine').textContent = pkgLine;

    // ── Items in der konsolidierten Liste
    //    Paket-Base als ERSTES Item — damit die Aufschlüsselung mathematisch
    //    den Hauptpreis ergibt. User kann nachrechnen: Paket + TX + Aufschlag
    //    + Rate − Rabatt = Hauptpreis.
    document.getElementById('sumPaketName').textContent = pkg.name;
    animateValue(document.getElementById('sumPaket'), state.displayedPaket, monthly, 380, formatEuro);
    state.displayedPaket = monthly;

    // ── Items in der konsolidierten Liste
    animateValue(document.getElementById('sumTransactions'), state.displayedTransactionsCost, txCost, 380, formatEuro);
    state.displayedTransactionsCost = txCost;
    document.getElementById('sumLineTransactions').hidden = (txCost === 0);

    animateValue(document.getElementById('sumBuchhaltung'), state.displayedBuchhaltungCost, surcharge, 380, formatEuro);
    state.displayedBuchhaltungCost = surcharge;
    document.getElementById('sumSurchargePct').textContent = `(${surchargeTier.percent}%)`;
    document.getElementById('sumLineBuchhaltung').hidden = (surcharge === 0);

    document.getElementById('sumPreMonthsCount').textContent = `(${vormonate})`;
    document.getElementById('sumPreMonths').textContent =
      vormonate > 0 ? `6 × ${formatEuro(vormonateRate)}` : '0 €';
    document.getElementById('sumLineVormonate').hidden = (vormonate === 0);

    document.getElementById('sumPreYearsCount').textContent = `(${vorjahre})`;
    document.getElementById('sumPreYears').textContent =
      vorjahre > 0 ? `6 × ${formatEuro(vorjahreRate)}` : '0 €';
    document.getElementById('sumLineVorjahre').hidden = (vorjahre === 0);

    // ── Gründer-Rabatt-Item: erscheint als negativer Posten in der Liste,
    //    sichtbar nur wenn Toggle aktiv UND tatsächlicher Rabatt > 0.
    //    Bei hoher TX-Stufe kann der Tabellen-Tarif gleich dem Vollpreis sein
    //    (z.B. >480 TX/Jahr) — dann gibt es keinen Effekt und die Line bleibt
    //    versteckt, damit der User nicht "−0 €" sieht.
    const startupEl = document.getElementById('sumStartupDiscount');
    if (startupEl) {
      animateValue(startupEl, -state.displayedStartupDiscount, -startupDiscount, 380,
        v => (v < 0 ? '−' : '') + formatEuro(Math.abs(v)));
      state.displayedStartupDiscount = startupDiscount;
    }
    const startupLine = document.getElementById('sumLineStartupDiscount');
    if (startupLine) startupLine.hidden = !state.isStartup || startupDiscount === 0;

    // ── Floating Bar — zeigt denselben Wert wie der Hauptpreis: monthlyWithRaten
    //    (= effektive Monatsrate inkl. Raten + nach Rabatt). Sticky-Bar muss
    //    konsistent mit der Calc-Card sein, sonst wirken die zwei Zahlen widersprüchlich.
    //    formatEuroValue (nur Zahl) — das € steht im Markup daneben hardcoded.
    animateValue(document.getElementById('barMonthly'), state.displayedBarMonthly, monthlyWithRaten, 400, formatEuroValue);
    state.displayedBarMonthly = monthlyWithRaten;

    // ── Tooltip-Beispiele live updaten
    updateTooltipExamples(monthly, surcharge, surchargeTier, vorjahre, vormonate);

    // ── Live-Preise auf den Paket-Karten updaten
    updatePackagePrices();

    // ── Steuerberater-Vergleich + Setup-Timeline updaten
    //    Wir vergleichen gegen monthlyWithRaten (= Hauptpreis = tatsächliche
    //    monatliche Belastung). Sonst wäre der STB-Wert kleiner als unser
    //    sichtbarer Hauptpreis, wenn Raten aktiv sind — das macht die
    //    "Du sparst X%"-Aussage widersinnig.
    if (typeof updateCompare === 'function') updateCompare(monthlyWithRaten);
    if (typeof updateSetupTimeline === 'function') updateSetupTimeline();

    // ── Totals-Compact: »Heute fällig« (Onboarding + erster Monat inkl. Raten)
    //    monthlyWithRaten ist bereits oben definiert (vor dem animateValue für sumMonthly).
    const dueTodayValue = oneTimeTotal + monthlyWithRaten;
    const dueTodayEl = document.getElementById('sumDueToday');
    if (dueTodayEl) dueTodayEl.textContent = formatEuro(dueTodayValue);

    // ── Phasen-Liste: Folgepreise je nach State.
    //   - Default (nichts aktiv): nur "Heute fällig" sichtbar
    //   - Nur Raten: + "Ab Monat 7" (Raten enden, Service-Preis ab dann)
    //   - Nur Rabatt: + "Ab Monat 13" (Rabatt endet, voller Paketpreis)
    //   - Beides: + "Ab Monat 7" (Raten weg, Rabatt aktiv) + "Ab Monat 13" (Vollpreis)
    // Damit zeigt jede Zeile einen konkreten Folgepreis statt Text-Caption.
    const hasRaten = (totalRaten || 0) > 0;
    const hasRabatt = state.isStartup && startupDiscount > 0;
    const phase2Row = document.getElementById('sumPhase2Row');
    const phase3Row = document.getElementById('sumPhase3Row');
    const phase2Label = document.getElementById('sumPhase2Label');
    const phase2Caption = document.getElementById('sumPhase2Caption');
    const phase2Value = document.getElementById('sumPhase2Value');
    const phase3Value = document.getElementById('sumPhase3Value');

    if (!hasRaten && !hasRabatt) {
      // Default: nur Heute fällig
      if (phase2Row) phase2Row.hidden = true;
      if (phase3Row) phase3Row.hidden = true;
    } else if (hasRaten && !hasRabatt) {
      // Nur Raten: nach Monat 6 fällt das Raten-Stück weg → voller Service-Preis
      if (phase2Row) phase2Row.hidden = false;
      if (phase3Row) phase3Row.hidden = true;
      if (phase2Label)   phase2Label.textContent = 'Ab Monat 7';
      if (phase2Caption) phase2Caption.textContent = 'Raten enden';
      if (phase2Value)   phase2Value.innerHTML = `${formatEuro(totalMonthly)}<small>/Mo</small>`;
    } else if (!hasRaten && hasRabatt) {
      // Nur Rabatt: nach Monat 12 fällt der Rabatt weg → voller Paketpreis
      if (phase2Row) phase2Row.hidden = false;
      if (phase3Row) phase3Row.hidden = true;
      if (phase2Label)   phase2Label.textContent = 'Ab Monat 13';
      if (phase2Caption) phase2Caption.textContent = 'Voller Paketpreis';
      if (phase2Value)   phase2Value.innerHTML = `${formatEuro(totalMonthly)}<small>/Mo</small>`;
    } else {
      // Beides: Raten enden zuerst (Monat 7), dann der Rabatt (Monat 13)
      if (phase2Row) phase2Row.hidden = false;
      if (phase3Row) phase3Row.hidden = false;
      if (phase2Label)   phase2Label.textContent = 'Ab Monat 7';
      if (phase2Caption) phase2Caption.textContent = 'Raten enden, Rabatt aktiv';
      if (phase2Value)   phase2Value.innerHTML = `${formatEuro(effectiveMonthly)}<small>/Mo</small>`;
      if (phase3Value)   phase3Value.innerHTML = `${formatEuro(totalMonthly)}<small>/Mo</small>`;
    }

    // ── Live-Indicator pulse NUR wenn sich der Preis tatsächlich geändert hat
    //    (nicht bei No-Op-Klicks z.B. Stepper auf Min-Wert)
    const priceChanged =
      state.lastDueToday !== dueTodayValue ||
      state.lastRecurring !== monthlyWithRaten ||
      state.lastTotalMonthly !== monthlyWithRaten;
    if (priceChanged) {
      pulseLiveIndicators();
    }
    state.lastDueToday = dueTodayValue;
    state.lastRecurring = monthlyWithRaten;
    state.lastTotalMonthly = monthlyWithRaten;
  }

  function renderHoldings() {
    document.getElementById('summary').classList.add('is-holdings');
    document.querySelector('.calc-steps').classList.add('is-holdings');
    document.getElementById('floatingBar').classList.add('is-holdings');

    document.getElementById('sumMonthly').textContent = HOLDINGS_PRICE;
    document.getElementById('sumPkgLine').textContent = 'Holdings · individuelle Lösung';
    // "ab"-Prefix + Asterisk + Caption: kommunizieren, dass 65 € der Einstiegs-
    // preis ist und die finale Kalkulation im Erstgespräch erfolgt.
    document.getElementById('sumPricePrefix').hidden = false;
    document.getElementById('sumPriceAsterisk').hidden = false;
    document.getElementById('sumPriceNote').hidden = false;
    // Gründer-Rabatt ist im Holdings-Pfad nicht anwendbar (manuelle Kalkulation
    // im Erstgespräch), Discount-Item ausblenden auch wenn Toggle aktiv ist.
    const startupLine = document.getElementById('sumLineStartupDiscount');
    if (startupLine) startupLine.hidden = true;
    // Paket-Item ausblenden — Holdings hat kein "Paket" im Standard-Sinne,
    // sondern ist eine individuell kalkulierte Lösung.
    const paketLine = document.getElementById('sumLinePaket');
    if (paketLine) paketLine.hidden = true;

    // Heute fällig + Ab nächstem Monat auch im Holdings-Modus korrekt:
    //   Heute fällig = 65 € (1. Monat) + 299 € Onboarding = 364 €
    //   Ab nächstem Monat = 65 €/Mo (kein Markup, keine Raten — Holdings ist flat)
    // Sonst bleiben hier veraltete Werte aus dem letzten Form-Modus stehen.
    const dueToday = HOLDINGS_PRICE + ONBOARDING;
    const dueTodayEl = document.getElementById('sumDueToday');
    if (dueTodayEl) dueTodayEl.textContent = formatEuro(dueToday);
    // Phasen-Liste komplett ausblenden — Holdings hat keine Phasen (Raten/Rabatt
    // nicht anwendbar, alles wird im Erstgespräch individuell kalkuliert).
    const phase2RowH = document.getElementById('sumPhase2Row');
    const phase3RowH = document.getElementById('sumPhase3Row');
    if (phase2RowH) phase2RowH.hidden = true;
    if (phase3RowH) phase3RowH.hidden = true;

    // Floating-Bar im Holdings-Mode: das Label kommt komplett aus CSS (is-holdings ::before),
    // wir setzen barMonthly auf einen Default-Fallback-Wert (wird visuell durch CSS verborgen)
    const barMonthlyEl = document.getElementById('barMonthly');
    if (barMonthlyEl) barMonthlyEl.textContent = HOLDINGS_PRICE;

    state.displayedMonthly       = HOLDINGS_PRICE;
    state.displayedBarMonthly    = HOLDINGS_PRICE;
  }

  // ============= ACCENT =============
  function setAccent(accent) {
    state.accent = accent;
    document.documentElement.style.setProperty('--accent', ACCENT_MAP[accent]);
  }

  // ============= FORM SELECTION =============
  document.querySelectorAll('[data-form]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('aria-pressed') === 'true') return;
      document.querySelectorAll('[data-form]').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      state.form = btn.dataset.form;
      setAccent(btn.dataset.accent);
      if (state.form !== 'holdings') {
        renderPackages();
      }
      // Step-1 collapsen + Pille anzeigen
      const label = btn.querySelector('.option__label').textContent.trim();
      collapseStep(1, label);
      updateSummary();
    });
  });

  // ============= STEP COLLAPSE / EXPAND =============
  function collapseStep(stepNum, label) {
    const stepEl = document.getElementById(`step-${stepNum}`);
    const pillEl = document.getElementById(`step${stepNum}Pill`);
    const textEl = document.getElementById(`step${stepNum}PillText`);
    if (!stepEl || !pillEl) return;
    stepEl.classList.add('is-collapsed');
    textEl.textContent = label;
    pillEl.hidden = false;
  }
  function expandStep(stepNum) {
    const stepEl = document.getElementById(`step-${stepNum}`);
    const pillEl = document.getElementById(`step${stepNum}Pill`);
    if (!stepEl || !pillEl) return;
    stepEl.classList.remove('is-collapsed');
    pillEl.hidden = true;
  }
  document.getElementById('step1PillClose').addEventListener('click', () => expandStep(1));

  // ============= VERTRAGSBEGINN + REVENUE: Custom Dropdowns =============
  function initDropdown(ddEl) {
    const trigger = ddEl.querySelector('.dd__trigger');
    const valueEl = ddEl.querySelector('[data-dd-value]');
    const list    = ddEl.querySelector('.dd__list');
    const items   = Array.from(ddEl.querySelectorAll('.dd__item'));
    const ddType  = ddEl.dataset.dd;

    function open() {
      // Close any other open dropdowns first
      document.querySelectorAll('.dd.is-open').forEach(other => {
        if (other !== ddEl) {
          other.classList.remove('is-open');
          other.querySelector('.dd__trigger').setAttribute('aria-expanded', 'false');
        }
      });
      ddEl.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function close() {
      ddEl.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function toggle() {
      if (ddEl.classList.contains('is-open')) close();
      else open();
    }

    trigger.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });

    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        items.forEach(i => i.classList.remove('is-selected'));
        item.classList.add('is-selected');
        const text = item.querySelector('.dd__item-text').textContent;
        valueEl.textContent = text;
        const value = parseInt(item.dataset.value, 10);
        if (ddType === 'month') state.startMonth = value;
        else if (ddType === 'year') state.startYear = value;
        else if (ddType === 'revenue') state.revenue = value;
        updateSummary();
        close();
        trigger.focus();
      });
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        open();
        const sel = ddEl.querySelector('.dd__item.is-selected') || items[0];
        if (sel) sel.focus();
      } else if (e.key === 'Escape' && ddEl.classList.contains('is-open')) {
        e.preventDefault();
        close();
      }
    });

    list.addEventListener('keydown', (e) => {
      const focused = document.activeElement;
      const idx = items.indexOf(focused);
      if (e.key === 'Escape') {
        e.preventDefault(); close(); trigger.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = items[Math.min(idx + 1, items.length - 1)];
        if (next) next.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = items[Math.max(idx - 1, 0)];
        if (prev) prev.focus();
      } else if (e.key === 'Home') {
        e.preventDefault(); items[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault(); items[items.length - 1].focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (focused && items.includes(focused)) focused.click();
      }
    });
  }

  document.querySelectorAll('.dd').forEach(initDropdown);

  // Click outside to close any open dropdown
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.dd.is-open').forEach(dd => {
      if (!dd.contains(e.target)) {
        dd.classList.remove('is-open');
        dd.querySelector('.dd__trigger').setAttribute('aria-expanded', 'false');
      }
    });
  });

  // ============= PREV YEARS STEPPER (Step 6) =============
  const pyValueEl = document.getElementById('pyValue');
  const pyDecBtn  = document.getElementById('pyDecrement');
  const pyIncBtn  = document.getElementById('pyIncrement');

  function updatePyButtons() {
    if (!pyDecBtn || !pyIncBtn) return;
    pyDecBtn.disabled = state.prevYears <= PY_MIN;
    pyIncBtn.disabled = state.prevYears >= PY_MAX;
  }

  function setPrevYears(value) {
    const clamped = Math.max(PY_MIN, Math.min(PY_MAX, value));
    if (clamped === state.prevYears) return;
    if (pyValueEl) animateValue(pyValueEl, state.displayedPrevYears, clamped, 240, formatInt);
    state.displayedPrevYears = clamped;
    state.prevYears = clamped;
    updatePyButtons();
    updateSummary();
  }

  if (pyDecBtn) pyDecBtn.addEventListener('click', () => setPrevYears(state.prevYears - 1));
  if (pyIncBtn) pyIncBtn.addEventListener('click', () => setPrevYears(state.prevYears + 1));

  // ============= TRANSACTIONS STEPPER (Step 5) =============
  const txValueEl = document.getElementById('txValue');
  const txDecBtn  = document.getElementById('txDecrement');
  const txIncBtn  = document.getElementById('txIncrement');

  function updateTxButtons() {
    txDecBtn.disabled = state.transactions <= TX_MIN;
    txIncBtn.disabled = state.transactions >= TX_MAX;
  }

  // Step-Size für den TX-Stepper: bei aktivem Gründer-Toggle feiner (5er bis 50,
  // dann 50er ab 50), sonst 50er durchgehend. Grund: die CRM-Gründer-Tabelle
  // hat feine TX-Stufen (60, 120, 240 TX/Jahr = 5, 10, 20 TX/Mo) — diese sind
  // mit reinem 50er-Stepper nicht erreichbar.
  const TX_STEP_FINE = 5;
  function getTxStep(current, direction) {
    if (!state.isStartup) return TX_STEP * direction;
    // Im Gründer-Mode:
    //   - Bei tx < 50 und increment: +5 (FINE)
    //   - Bei tx = 50 und decrement: -5 (zurück in FINE)
    //   - Bei tx >= 50 und increment: +50 (NORMAL)
    //   - Bei tx > 50 und decrement: -50 (NORMAL, bis 50)
    if (direction > 0) {
      return current < 50 ? TX_STEP_FINE : TX_STEP;
    } else {
      return current <= 50 ? -TX_STEP_FINE : -TX_STEP;
    }
  }

  function setTransactions(value) {
    const clamped = Math.max(TX_MIN, Math.min(TX_MAX, value));
    if (clamped === state.transactions) return;
    animateValue(txValueEl, state.displayedTxValue, clamped, 280, formatInt);
    state.displayedTxValue = clamped;
    state.transactions = clamped;
    updateTxButtons();
    // Bei aktivem Gründer-Toggle: Card-Hints (Discount %) ändern sich mit TX,
    // weil die Tabellen-Stufe von TX/Jahr abhängt. renderPackages neu rendern,
    // damit die Hints auf den Cards die aktuelle Stufe widerspiegeln.
    if (state.isStartup) renderPackages();
    updateSummary();
  }

  txDecBtn.addEventListener('click', () => setTransactions(state.transactions + getTxStep(state.transactions, -1)));
  txIncBtn.addEventListener('click', () => setTransactions(state.transactions + getTxStep(state.transactions, +1)));

  // ============= KEYBOARD NAV (radio groups) =============
  document.querySelectorAll('[role="radiogroup"]').forEach(group => {
    group.addEventListener('keydown', (e) => {
      const buttons = Array.from(group.querySelectorAll('[role="radio"]'));
      const focused = document.activeElement;
      const idx = buttons.indexOf(focused);
      if (idx === -1) return;
      let nextIdx = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % buttons.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (idx - 1 + buttons.length) % buttons.length;
      if (nextIdx !== null) {
        e.preventDefault();
        buttons[nextIdx].focus();
        buttons[nextIdx].click();
      }
    });
  });

  // ============= SCROLL REVEAL (MOBILE) =============
  const stepObserver = new IntersectionObserver(
    (entries) => entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-revealed');
    }),
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('.step').forEach(el => stepObserver.observe(el));

  // ============= APPLE-MAX STEP NAV =============
  const stepNav = document.getElementById('stepNav');
  const stepNavSlider = document.getElementById('stepNavSlider');
  const stepDots = document.querySelectorAll('.step-nav__num-btn');
  const hero = document.querySelector('.hero');
  const steps = Array.from(document.querySelectorAll('.step'));

  const heroObserver = new IntersectionObserver(
    ([entry]) => stepNav.classList.toggle('is-visible', !entry.isIntersecting),
    { threshold: 0.1 }
  );
  heroObserver.observe(hero);

  function applyActiveStep(idx) {
    if (idx === state.activeStepIdx) return;
    state.activeStepIdx = idx;
    stepNavSlider.style.transform = `translateY(-${idx * 1.4}rem)`;
    stepDots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === idx);
      dot.classList.toggle('is-done', i < idx);
    });
  }

  function detectActiveStep() {
    const viewportAnchor = window.innerHeight * 0.32;
    let activeIdx = 0;
    steps.forEach((step, i) => {
      const rect = step.getBoundingClientRect();
      if (rect.top <= viewportAnchor) activeIdx = i;
    });
    applyActiveStep(activeIdx);
  }

  let scrollRaf = null;
  window.addEventListener('scroll', () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      detectActiveStep();
      scrollRaf = null;
    });
  }, { passive: true });

  stepDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.stepTarget);
      if (!target) return;
      const topOffset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - topOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ============= SMART FLOATING BAR =============
  const floatingBar = document.getElementById('floatingBar');
  const summary = document.getElementById('summary');

  requestAnimationFrame(() => {
    setTimeout(() => floatingBar.classList.add('is-ready'), 450);
  });

  const summaryObserver = new IntersectionObserver(
    ([entry]) => floatingBar.classList.toggle('is-hidden', entry.intersectionRatio >= 0.3),
    { threshold: [0, 0.15, 0.3, 0.5, 1] }
  );
  summaryObserver.observe(summary);

  // ============= INTERACTIVE TOOLTIPS =============
  // Click-toggle behavior, schließt sich beim Outside-Click oder ESC.
  // Nutzt Event-Delegation am document — funktioniert automatisch für
  // dynamisch gerenderte Tooltips (z. B. Jargon-Begriffe in Paket-Karten).
  // Bubble kann entweder nextElementSibling sein (Konfigurator-Tooltips
  // mit eigenem .tooltip-wrap) oder direktes Child des Triggers (Jargon-
  // Begriffe — Bubble sitzt im Term selbst).
  function setupTooltips() {
    const isMobile = () => window.innerWidth <= 760;

    function findBubble(trigger) {
      // Erst Child mit .tooltip-bubble (Jargon-Pattern)
      const child = trigger.querySelector(':scope > .tooltip-bubble');
      if (child) return child;
      // Sonst nextElementSibling (Konfigurator-Pattern)
      const sib = trigger.nextElementSibling;
      if (sib && sib.classList.contains('tooltip-bubble')) return sib;
      return null;
    }

    function closeAll() {
      document.querySelectorAll('.tooltip-trigger.is-open').forEach(t => {
        t.classList.remove('is-open');
        t.setAttribute('aria-expanded', 'false');
        const b = findBubble(t);
        if (b) {
          b.style.removeProperty('top');
          b.style.removeProperty('bottom');
        }
      });
    }

    function openTrigger(trigger) {
      trigger.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      const bubble = findBubble(trigger);
      if (!bubble) return;
      if (isMobile()) {
        // Bubble dynamisch positionieren — unter Trigger, sonst darüber
        const tr = trigger.getBoundingClientRect();
        const vh = window.innerHeight;
        const estH = 200;
        if (tr.bottom + estH + 16 < vh) {
          bubble.style.top = `${tr.bottom + 8}px`;
          bubble.style.bottom = 'auto';
        } else {
          bubble.style.bottom = `${vh - tr.top + 8}px`;
          bubble.style.top = 'auto';
        }
      } else {
        // Desktop: Smart-Flip bidirektional + Container-bewusst.
        // Wir prüfen gegen sowohl Viewport-Edges als auch gegen den
        // nächsten Card-Container (.summary, .calc-card, .config-field, .option),
        // damit Bubbles nicht über Card-Grenzen hinaus laufen.
        requestAnimationFrame(() => {
          const padding = 16;
          // Boundary = nächster Card-Container, sonst Viewport
          const boundary = bubble.closest('.summary, .calc-card, .config-field, .option');
          let leftEdge = padding;
          let rightEdge = window.innerWidth - padding;
          if (boundary) {
            const br = boundary.getBoundingClientRect();
            leftEdge  = Math.max(leftEdge,  br.left  + 8);
            rightEdge = Math.min(rightEdge, br.right - 8);
          }
          // 1. Erste Messung: ragt es rechts raus? → wechsle auf right-anchored
          let rect = bubble.getBoundingClientRect();
          if (rect.right > rightEdge) {
            bubble.classList.remove('tooltip-bubble--left');
          }
          // 2. Re-Messung: ragt es jetzt links raus? → wechsle auf left-anchored
          rect = bubble.getBoundingClientRect();
          if (rect.left < leftEdge) {
            bubble.classList.add('tooltip-bubble--left');
          }
          // 3. Letzter Fallback: wenn auch jetzt rechts überragt (z.B. weil
          //    Container schmal ist und Bubble in keine Richtung passt),
          //    klemme über inline-Style-max-width und force-positioning.
          rect = bubble.getBoundingClientRect();
          if (rect.right > rightEdge || rect.left < leftEdge) {
            const containerWidth = rightEdge - leftEdge;
            bubble.style.maxWidth = `${Math.max(220, containerWidth - 16)}px`;
          } else {
            bubble.style.maxWidth = '';
          }
        });
      }
    }

    // Delegated click: Trigger toggeln, Outside schließen.
    // Klicks innerhalb einer offenen Bubble werden ignoriert (User soll
    // Text auswählen können, ohne dass die Bubble schließt).
    document.addEventListener('click', (e) => {
      if (e.target.closest('.tooltip-bubble')) return;
      const trigger = e.target.closest('.tooltip-trigger');
      if (trigger) {
        e.stopPropagation();
        e.preventDefault();
        const wasOpen = trigger.classList.contains('is-open');
        closeAll();
        if (!wasOpen) openTrigger(trigger);
      } else {
        closeAll();
      }
    });

    // Keyboard: Enter/Space öffnet span-basierte Trigger, ESC schließt alles
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeAll(); return; }
      if (e.key === 'Enter' || e.key === ' ') {
        const trigger = e.target.closest('.tooltip-trigger');
        if (trigger && (trigger.tagName === 'SPAN' || trigger.getAttribute('role') === 'button')) {
          e.preventDefault();
          const wasOpen = trigger.classList.contains('is-open');
          closeAll();
          if (!wasOpen) openTrigger(trigger);
        }
      }
    });
  }

  // Updated bei jedem updateSummary-Call: Beispielzahlen für Tooltips
  function updateTooltipExamples(monthly, surcharge, surchargeTier, vorjahre, vormonate) {
    // Aufschlag-Beispiel: konkret was der gewählte Tier in € bedeutet
    const exRevenueEl = document.getElementById('tipRevenueExample');
    if (exRevenueEl) {
      if (surcharge > 0) {
        // Mittelwert des aktuellen Tiers nehmen für plastisches Beispiel
        const tierMidpoint = surchargeTier.midpoint || surchargeTier.from + 100000;
        const tierLabel = surchargeTier.label || `${(tierMidpoint/1000).toFixed(0)}k`;
        exRevenueEl.innerHTML = `Bei ${tierLabel} Umsatz wären das <em>+${formatEuro(surcharge)}</em> pro Monat.`;
      } else {
        exRevenueEl.innerHTML = `Bis 250k Umsatz: <em>kein Aufschlag</em>. Du zahlst nur den Paketpreis.`;
      }
    }
    // Vorjahre-Beispiel
    // Vorjahre-Beispiel — paket-abhängiger Flat-Jahresbetrag aus VORJAHRE_PRICES,
    // mit Umsatz-Markup. Verteilt auf 6 Raten.
    const exPrevEl = document.getElementById('tipPrevYearsExample');
    if (exPrevEl) {
      if (vorjahre > 0) {
        const perYear = getVorjahrePerYearCost(state.package);
        const total = vorjahre * perYear;
        const perRate = total / RATEN_COUNT;
        exPrevEl.innerHTML = `${vorjahre} Vorjahr${vorjahre === 1 ? '' : 'e'} × ${formatEuro(perYear)}/Jahr = ${formatEuro(total)} → <em>6 × ${formatEuro(perRate)}/Monat</em>`;
      } else {
        exPrevEl.innerHTML = `Aktuell <em>keine</em> Vorjahre — Du startest mit einer sauberen Akte.`;
      }
    }
    // Vertragsbeginn-Beispiel: dynamisch nach gewähltem Monat/Jahr
    const exContractEl = document.getElementById('tipContractStartExample');
    if (exContractEl) {
      const months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
      const m = state.startMonth - 1;
      if (m === 0) {
        exContractEl.innerHTML = `Bei Start im <em>Januar</em> entstehen keine Vormonate — Du beginnst sauber mit dem neuen Geschäftsjahr.`;
      } else {
        const preMonths = m;
        const preMonthsTotal = preMonths * monthly;
        const perRate = preMonthsTotal / 6;
        exContractEl.innerHTML = `Bei Start im <em>${months[m]} ${state.startYear}</em> buchen wir die Monate Januar bis ${months[m-1]} nach — verteilt auf <em>6 × ${formatEuro(perRate)}/Monat</em>.`;
      }
    }
    // Transaktionen-Beispiel: konkrete Zusatzkosten + Paket-Bezug.
    // Tier-basiert nach CRM-Spec — kein Markup mehr, Cap bei 250 € über 500 TX.
    const exTxEl = document.getElementById('tipTransactionsExample');
    if (exTxEl) {
      const tx = state.transactions || 100;
      if (tx <= 100) {
        exTxEl.innerHTML = `Bis 100 Transaktionen: <em>im Paket inkludiert</em>. Erst ab 101 Transaktionen wirken die +50 €-Schritte.`;
      } else if (tx > 500) {
        const txCost = computeTransactionsCost();
        const newTotal = monthly + txCost;
        exTxEl.innerHTML = `Bei ${tx} Transaktionen ist der Aufschlag bei <em>${formatEuro(txCost)}</em> gedeckelt — Dein Paketpreis steigt damit auf <em>${formatEuro(newTotal)}/Mo</em>.`;
      } else {
        const txCost = computeTransactionsCost();
        const newTotal = monthly + txCost;
        exTxEl.innerHTML = `Bei ${tx} Transaktionen kommen <em>+${formatEuro(txCost)}</em> dazu — Dein Paketpreis steigt damit auf <em>${formatEuro(newTotal)}/Mo</em>.`;
      }
    }

    // Gründer-Tarif-Beispiel: zeigt aktuelle Tarif-Stufe + Pauschale + Ersparnis
    // gegenüber dem regulären Service. Wird in beiden Tooltips (am Toggle + in
    // der Discount-Line) parallel angezeigt. Inhalt ändert sich bei jeder
    // Änderung von Form, Paket oder Transaktionen — so kann der User
    // nachvollziehen wie sein Tarif zustande kommt.
    const renderStartupExample = (el) => {
      if (!el) return;
      const tarif = getStartupTarif();
      if (!tarif) {
        el.innerHTML = `Für Holdings nicht anwendbar — die Konditionen besprechen wir im Erstgespräch.`;
        return;
      }
      const regularYearly = monthly * 12;
      const savingYearly = Math.max(0, regularYearly - tarif.yearly);
      const savingPct = regularYearly > 0 ? Math.round((savingYearly / regularYearly) * 100) : 0;
      const txYearly = tarif.txPerYear;
      if (savingYearly === 0) {
        el.innerHTML = `<strong>${tarif.categoryLabel}</strong><br>` +
          `Bei ${txYearly} Transaktionen/Jahr (Stufe ${tarif.txLabel}) entspricht die Pauschale dem regulären Paketpreis — <em>kein Rabatt</em> für diese Konfiguration.`;
      } else {
        el.innerHTML = `<strong>${tarif.categoryLabel}</strong><br>` +
          `${txYearly} Transaktionen/Jahr (Stufe ${tarif.txLabel}) → Pauschale <em>${formatEuro(tarif.yearly)}/Jahr</em> statt regulär ${formatEuro(regularYearly)} → ` +
          `Du sparst <em>${formatEuro(savingYearly)} (${savingPct}%)</em> auf den Paket-Anteil.`;
      }
    };
    renderStartupExample(document.getElementById('tipStartupExample'));
    renderStartupExample(document.getElementById('tipStartupDiscountExample'));
  }

  setupTooltips();

  // ============= STEUERBERATER-VERGLEICH (DStG-Tabelle Approximation) =============
  // Klassischer Steuerberater nimmt Honorar nach DStG, das skaliert mit Umsatz.
  // Wir approximieren: ca. das 1.55-fache unseres Sorglos-PLUS-Preises bei gleichem Umsatz-Tier.
  function updateCompare(ourMonthlyPrice) {
    const compareEl = document.getElementById('sumCompareValue');
    const savingPctEl = document.getElementById('sumSavingPercent');
    const savingAmtEl = document.getElementById('sumSavingAmount');
    if (!compareEl) return;
    // Marketing-Approximation des klassischen Steuerberaters via Multiplier
    // pro Rechtsform (StBVV-Pricing ist real komplexer, aber der Multiplier
    // ist eine vereinfachte Schätzung; deshalb auch das ~-Zeichen im Display).
    // Fallback 1.55 als Sicherheitsnetz, falls state.form unerwartet leer ist.
    const STB_MULTIPLIER = STB_MULTIPLIERS[state.form] || 1.55;
    const stbCost = Math.round(ourMonthlyPrice * STB_MULTIPLIER);
    const saving = stbCost - ourMonthlyPrice;
    const savingPct = Math.round((saving / stbCost) * 100);
    compareEl.textContent = `~ ${formatEuro(stbCost)}/Mo`;
    if (savingPctEl) savingPctEl.textContent = `${savingPct} %`;
    if (savingAmtEl) savingAmtEl.textContent = `${formatEuro(saving)}`;
  }

  // ============= SETUP-TIMELINE LIVE-UPDATE =============
  // Phase 03 zeigt "Übergabe in monatliche Services" — Datum bleibt relativ
  // (Woche 4–6 nach Vertragsabschluss), nicht absolut zum Vertragsstart.
  // Die Funktion bleibt als Hook für zukünftige Anpassungen, ist aber
  // aktuell ein No-Op (Label ist im HTML statisch definiert).
  function updateSetupTimeline() {
    // Intentionally empty — no dynamic label updates needed for the
    // current timeline. Kept as function so other code that calls it
    // (updateSummary etc.) doesn't break.
  }

  // ============= PKG-SWITCH CROSSFADE =============
  // Beim Form-Wechsel renderPackages() mit fade-out/fade-in
  const optionsContainer = document.getElementById('packageOptions');
  function renderPackagesWithFade() {
    if (state.form === 'holdings' || !optionsContainer) {
      renderPackages();
      return;
    }
    optionsContainer.dataset.switching = 'true';
    setTimeout(() => {
      renderPackages();
      requestAnimationFrame(() => {
        optionsContainer.dataset.switching = 'false';
      });
    }, 180);
  }
  // Override original Form-Click: trigger fade-pkg-render statt direkt renderPackages
  document.querySelectorAll('[data-form]').forEach(btn => {
    btn.addEventListener('click', () => {
      // Original handler hat schon state.form etc. gesetzt — wir hooken renderPackages mit fade
      if (state.form !== 'holdings' && optionsContainer) {
        optionsContainer.dataset.switching = 'true';
        setTimeout(() => {
          requestAnimationFrame(() => {
            optionsContainer.dataset.switching = 'false';
          });
        }, 220);
      }
      // Compare-Table neu rendern wenn offen
      if (compareToggle && compareToggle.getAttribute('aria-pressed') === 'true') {
        renderCompareTable();
      }
    });
  });

  // ============= RESET-BUTTON =============
  document.getElementById('resetCalcBtn')?.addEventListener('click', () => {
    state.startMonth = 1;
    state.startYear = 2026;
    state.revenue = 0;
    state.transactions = 100;
    state.prevYears = 0;
    state.form = 'einzelunternehmer';
    state.package = 'selbststarter';
    state.accent = 'indigo';
    state.isStartup = false;

    // UI-Sync
    document.querySelectorAll('[data-form]').forEach(b =>
      b.setAttribute('aria-pressed', b.dataset.form === 'einzelunternehmer' ? 'true' : 'false'));
    // Gründer-Toggle visuell zurücksetzen
    const startupBtn = document.getElementById('startupToggle');
    if (startupBtn) startupBtn.setAttribute('aria-pressed', 'false');
    setAccent('indigo');
    expandStep(1);
    // Dropdowns auf Default
    const monthDD = document.querySelector('[data-dd="month"] [data-dd-value]');
    if (monthDD) monthDD.textContent = 'Januar';
    const yearDD = document.querySelector('[data-dd="year"] [data-dd-value]');
    if (yearDD) yearDD.textContent = '2026';
    const revDD = document.querySelector('[data-dd="revenue"] [data-dd-value]');
    if (revDD) revDD.textContent = 'bis 250k (0%)';
    document.querySelectorAll('[data-dd="month"] .dd__item, [data-dd="year"] .dd__item, [data-dd="revenue"] .dd__item').forEach(el => el.classList.remove('is-selected'));
    const m1 = document.querySelector('[data-dd="month"] [data-value="1"]'); if (m1) m1.classList.add('is-selected');
    const y1 = document.querySelector('[data-dd="year"] [data-value="2026"]'); if (y1) y1.classList.add('is-selected');
    const r1 = document.querySelector('[data-dd="revenue"] [data-value="0"]'); if (r1) r1.classList.add('is-selected');

    renderPackages();
    updateTxButtons();
    updatePyButtons();
    updateSummary();
  });

  // ============= GRÜNDER / STARTUP TOGGLE =============
  // Click flippt state.isStartup, syncronisiert aria-pressed und triggert
  // updateSummary + renderPackages (die Paket-Cards zeigen einen Rabatt-Hinweis,
  // wenn isStartup aktiv ist — muss bei jedem Toggle neu gerendert werden).
  document.getElementById('startupToggle')?.addEventListener('click', (e) => {
    state.isStartup = !state.isStartup;
    e.currentTarget.setAttribute('aria-pressed', state.isStartup ? 'true' : 'false');
    renderPackages();
    updateSummary();
  });


  // Skeleton-Removal nach Init
  function removeSummarySkeleton() {
    const sum = document.getElementById('summary');
    if (sum) sum.removeAttribute('data-loading');
  }

  // ============= COMPARE-TABLE TOGGLE =============
  const compareToggle = document.getElementById('compareToggle');
  const compareTable = document.getElementById('compareTable');
  if (compareToggle && compareTable) {
    compareToggle.addEventListener('click', () => {
      const isOpen = compareToggle.getAttribute('aria-pressed') === 'true';
      compareToggle.setAttribute('aria-pressed', isOpen ? 'false' : 'true');
      const label = compareToggle.querySelector('.compare-toggle__label');
      if (label) label.textContent = isOpen ? 'Pakete vergleichen' : 'Vergleich schließen';
      if (isOpen) {
        compareTable.hidden = true;
      } else {
        renderCompareTable();
        compareTable.hidden = false;
        // Smooth scroll-into-view
        setTimeout(() => compareTable.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
      }
    });
  }

  // ============= SUMMARY MOBILE-COLLAPSE TOGGLE =============
  const summaryToggle = document.getElementById('summaryToggle');
  const summaryEl = document.getElementById('summary');
  if (summaryToggle && summaryEl) {
    // Initial: auf Mobile collapsed
    if (window.innerWidth <= 1000) {
      summaryEl.dataset.mobileCollapsed = 'true';
      summaryToggle.setAttribute('aria-expanded', 'false');
    }
    summaryToggle.addEventListener('click', () => {
      const isCollapsed = summaryEl.dataset.mobileCollapsed === 'true';
      summaryEl.dataset.mobileCollapsed = isCollapsed ? 'false' : 'true';
      summaryToggle.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
      const label = document.getElementById('summaryToggleLabel');
      if (label) label.textContent = isCollapsed ? 'Details schließen' : 'Details anzeigen';
    });
    // Resize-Handler: bei Wechsel zu Desktop collapsed-state entfernen
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1000) {
        summaryEl.removeAttribute('data-mobile-collapsed');
      } else if (!summaryEl.dataset.mobileCollapsed) {
        summaryEl.dataset.mobileCollapsed = 'true';
      }
    });
  }

  // ============= FLOATING-BAR DETAILS-LINK — scrollt zur Sidebar + expandiert sie =============
  const barDetailsLink = document.getElementById('barDetailsLink');
  if (barDetailsLink && summaryEl) {
    barDetailsLink.addEventListener('click', () => {
      // Auf Mobile: Sidebar erst expandieren, dann smooth scrollen
      if (window.innerWidth <= 1000 && summaryEl.dataset.mobileCollapsed === 'true') {
        summaryEl.dataset.mobileCollapsed = 'false';
        summaryToggle?.setAttribute('aria-expanded', 'true');
        const label = document.getElementById('summaryToggleLabel');
        if (label) label.textContent = 'Details schließen';
      }
      // Smooth scroll zur Sidebar mit Offset für die Floating-Bar
      const offset = 80;  // Pixel über der Sidebar
      const targetY = summaryEl.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  }

  // ============= (2) STICKY DESKTOP NAV bei Long-Scroll =============
  // (5) Sidebar-Sticky-Verhalten: Wenn calc-grid (mit Sidebar) komplett raus ist → sticky-nav zeigen
  const stickyNav = document.getElementById('stickyNav');
  const stickyNavPkg = document.getElementById('stickyNavPkg');
  const stickyNavPrice = document.getElementById('stickyNavPrice');
  const calcGridForSticky = document.querySelector('.calc-grid');
  function updateStickyNav() {
    if (!stickyNav || !calcGridForSticky) return;
    const isMobile = window.innerWidth <= 1000;
    if (isMobile) {
      stickyNav.classList.remove('is-visible');
      return;
    }
    // calc-grid bottom < viewport mitte (also calc-grid-Bereich verlassen) → sticky an
    const gridRect = calcGridForSticky.getBoundingClientRect();
    const viewportMid = window.innerHeight / 2;
    const shouldShow = gridRect.bottom < viewportMid;
    stickyNav.classList.toggle('is-visible', shouldShow);
    // Werte sync
    if (shouldShow) {
      const pkg = document.getElementById('sumPkgLine')?.textContent;
      const price = document.getElementById('sumMonthly')?.textContent;
      if (pkg && stickyNavPkg) stickyNavPkg.textContent = pkg;
      if (price && stickyNavPrice) stickyNavPrice.textContent = `${price} €`;
    }
  }
  window.addEventListener('scroll', updateStickyNav, { passive: true });
  window.addEventListener('resize', updateStickyNav, { passive: true });

  // ============= (3) DRAG-TO-FILL / LONG-PRESS Stepper-Inputs =============
  function attachLongPress(btn, action) {
    if (!btn) return;
    let timer = null;
    let intervalId = null;
    let speed = 220;  // Initial speed (ms)
    const minSpeed = 50;
    const accel = 0.85;
    // Flag tracks ob start() bereits action() gefeuert hat — verhindert
    // dass der reguläre Click-Handler des Buttons (außerhalb attachLongPress)
    // nochmal action() triggert. Sonst würde ein einzelner Maus-Klick zwei
    // Mal wirken: einmal via mousedown→start(), einmal via dem nachfolgenden
    // synthetischen click-Event.
    let actionFired = false;
    function tick() {
      action();
      if (speed > minSpeed) {
        speed = Math.max(minSpeed, speed * accel);
        clearInterval(intervalId);
        intervalId = setInterval(tick, speed);
      }
    }
    const start = (e) => {
      if (e.type === 'mousedown' && e.button !== 0) return;
      action();  // first immediate (auch für Touch wichtig — dort wird der
                 // synthetische click oft durch preventDefault unterdrückt)
      actionFired = true;
      timer = setTimeout(() => {
        intervalId = setInterval(tick, speed);
      }, 350);  // 350ms hold before continuous start
    };
    const stop = () => {
      if (timer) clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
      timer = null; intervalId = null; speed = 220;
    };
    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', stop);
    btn.addEventListener('mouseleave', stop);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); start(e); }, { passive: false });
    btn.addEventListener('touchend', stop);
    btn.addEventListener('touchcancel', stop);
    // Capture-Phase-Listener läuft VOR den regulären Click-Handlern. Wenn
    // start() bereits action() gefeuert hat, unterdrücken wir den click,
    // damit es nicht doppelt zählt. Bei Keyboard-Aktivierung (Enter/Space
    // auf fokussiertem Button) gibt es keinen mousedown → actionFired bleibt
    // false → der reguläre Click-Handler feuert normal.
    btn.addEventListener('click', (e) => {
      if (actionFired) {
        actionFired = false;
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }, true);
  }
  // Hook auf TX + PY Stepper — Long-Press nutzt die selben setter-Funktionen
  // wie der reguläre Click-Handler (setTransactions / setPrevYears). Diese
  // rufen animateValue() korrekt auf, sodass die Anzeige live mitläuft.
  // Vorher wurde fälschlich .value auf <span>-Elements gesetzt — das tat
  // nichts, daher blieb die Anzeige stehen.
  attachLongPress(document.getElementById('txIncrement'), () => {
    setTransactions(state.transactions + getTxStep(state.transactions, +1));
  });
  attachLongPress(document.getElementById('txDecrement'), () => {
    setTransactions(state.transactions + getTxStep(state.transactions, -1));
  });
  attachLongPress(document.getElementById('pyIncrement'), () => {
    setPrevYears(state.prevYears + 1);
  });
  attachLongPress(document.getElementById('pyDecrement'), () => {
    setPrevYears(state.prevYears - 1);
  });

  // ============= (8) MOBILE CAROUSEL PAGINATION DOTS =============
  const carouselDots = document.querySelectorAll('.carousel-dot');
  const carouselContainer = document.querySelector('#step-2 .options--3');
  function updateCarouselDots() {
    if (!carouselContainer) return;
    if (window.innerWidth > 1000) return;  // nur Mobile
    const containerW = carouselContainer.offsetWidth;
    const scrollLeft = carouselContainer.scrollLeft;
    const cards = carouselContainer.querySelectorAll('.option--pkg');
    if (cards.length === 0) return;
    // Find center card
    const centerX = scrollLeft + containerW / 2;
    let activeIdx = 0;
    let minDist = Infinity;
    cards.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - centerX);
      if (dist < minDist) { minDist = dist; activeIdx = idx; }
    });
    carouselDots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === activeIdx);
    });
  }
  // Dot-Klick scrollt zum entsprechenden Paket
  carouselDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      const cards = carouselContainer?.querySelectorAll('.option--pkg');
      if (!cards || !cards[idx]) return;
      cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });
  carouselContainer?.addEventListener('scroll', updateCarouselDots, { passive: true });
  // Initial + bei Form-Wechsel
  setTimeout(updateCarouselDots, 200);
  document.querySelectorAll('[data-form]').forEach(btn => {
    btn.addEventListener('click', () => setTimeout(updateCarouselDots, 100));
  });

  // (3) Carousel Swipe-Hint — beim ersten Render kurz nach rechts wischen und zurück,
  // um dem User zu signalisieren dass es ein scrollbarer Carousel ist.
  // Nur 1× pro Session, nur wenn User noch nicht selbst gescrollt hat.
  function carouselSwipeHint() {
    if (!carouselContainer || window.innerWidth > 1000) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (sessionStorage.getItem('bsteuern_swipeHinted')) return;

    let userScrolled = false;
    const onUserScroll = () => { userScrolled = true; };
    carouselContainer.addEventListener('scroll', onUserScroll, { once: true, passive: true });

    // Erst nach 1.2s starten (damit Page-Load + Reveal-Animations fertig sind)
    setTimeout(() => {
      if (userScrolled) return;
      // Wischbewegung: 60px nach rechts (smooth) → kurze Pause → zurück
      carouselContainer.scrollTo({ left: 60, behavior: 'smooth' });
      setTimeout(() => {
        if (userScrolled) return;
        carouselContainer.scrollTo({ left: 0, behavior: 'smooth' });
        sessionStorage.setItem('bsteuern_swipeHinted', '1');
      }, 700);
    }, 1200);
  }
  carouselSwipeHint();


  // ============= (12) KONFETTI BEIM BUCHEN =============
  function fireConfetti(originX, originY) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x = (typeof originX === 'number') ? originX : window.innerWidth / 2;
    const y = (typeof originY === 'number') ? originY : window.innerHeight / 2;
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    // High-DPI für scharfe Konfetti-Stücke
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Brand-konform: nur Indigo + Yellow als Hauptfarben, Cream als subtle Accent
    const colors = ['#3B3BC8', '#3B3BC8', '#F6DF35', '#F6DF35', '#1DB8C6'];
    const pieces = [];
    const count = 120;  // mehr Stücke für sichtbareren Effekt
    for (let i = 0; i < count; i++) {
      // Spread-Winkel: Halbkreis nach oben (180°-Bogen)
      const angle = Math.PI + (Math.random() * Math.PI);
      // Langsamer als vorher (war 8-22, jetzt 6-14)
      const speed = Math.random() * 8 + 6;
      pieces.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        // Schwächere Gravitation = längerer Hang-Time
        gravity: 0.22,
        // Größere Stücke (war 4-12, jetzt 8-22)
        size: Math.random() * 14 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        // Etwas langsamere Rotation für sichtbares Tumbling
        rotationSpeed: (Math.random() - 0.5) * 0.18,
        opacity: 1,
        // Random shape: Quadrat oder schmales Rechteck (Streamer)
        shape: Math.random() > 0.4 ? 'square' : 'streamer',
      });
    }
    let frame = 0;
    const totalFrames = 280;  // doppelt so lange Sichtbarkeit (war 140)
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.vy += p.gravity;
        // Air-Resistance: leichtes Abbremsen für floating-Effekt
        p.vx *= 0.992;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        // Langsamerer Fade-Out (war 0.008, jetzt 0.0035)
        p.opacity = Math.max(0, p.opacity - 0.0035);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        if (p.shape === 'streamer') {
          // Schmales Rechteck = Streamer-Look
          ctx.fillRect(-p.size / 2, -p.size / 6, p.size, p.size / 3);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
      });
      frame++;
      if (frame < totalFrames) requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
  }

  // Hook auf alle CTAs (Sidebar-CTA, Floating-Bar-CTA, Sticky-Nav-CTA)
  const ctaSelectors = [
    '.summary__cta',
    '#barCtaBtn',
    '#stickyNavCta',
  ];
  ctaSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(cta => {
      cta.addEventListener('click', (e) => {
        e.preventDefault();
        // Multi-Burst: 3 gestaffelte Bursts an verschiedenen Origins
        const rect = cta.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        fireConfetti(cx, cy);
        setTimeout(() => fireConfetti(window.innerWidth * 0.2, window.innerHeight * 0.85), 200);
        setTimeout(() => fireConfetti(window.innerWidth * 0.8, window.innerHeight * 0.85), 400);

        const href = cta.getAttribute('href') || 'https://bsteuern.typeform.com/waitinglist';
        setTimeout(() => { window.location.href = href; }, 1400);
      });
    });
  });

  // ============= (6) COMPARE-TABELLE BEI FORM-WECHSEL re-render mit Animation =============
  // renderCompareTable schon vorhanden — die Animation in CSS triggert automatisch
  // weil neue rows neue animation-instances bekommen. Wir re-trigger durch Re-Append:
  function reRenderCompareIfOpen() {
    if (compareToggle?.getAttribute('aria-pressed') === 'true') {
      // Force animation restart by detaching+reattaching
      const t = document.getElementById('compareTable');
      if (t) {
        t.style.opacity = '0';
        renderCompareTable();
        requestAnimationFrame(() => {
          t.style.opacity = '1';
        });
      }
    }
  }
  document.querySelectorAll('[data-form]').forEach(btn => {
    btn.addEventListener('click', () => setTimeout(reRenderCompareIfOpen, 50));
  });

  // ============= INIT =============
  renderPackages();
  updateTxButtons();
  updatePyButtons();
  updateSummary();
  // Compare + Timeline beim init
  const initialTotal = parseInt(document.getElementById('sumMonthly').textContent.replace(/\D/g,''), 10) || 149;
  updateCompare(initialTotal);
  updateSetupTimeline();
  detectActiveStep();
  updateStickyNav();
  // Skeleton entfernen wenn alles ready
  requestAnimationFrame(removeSummarySkeleton);
</script>
