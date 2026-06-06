/* ============================================================
   b'steuern — Preisseite v3 (preise-7 final)
   Alle interaktiven Elemente = Div Blocks
   Webflow: Page Settings → Before </body> tag

   FIXES vs. ursprüngliche Version:
   1. syncDisc() — kein style.display mehr; steuert nur noch das
      hidden-Attribut, damit .rc-disc-panel[hidden]{display:none}
      im CSS sauber greift und kein Konflikt entsteht.
      Das Panel-Padding sitzt jetzt im CSS (.rc-disc-panel.open),
      nicht mehr als Inline-Style aus JS.
   2. discSec — removeAttribute('hidden') statt style.display.
   3. rcard — removeAttribute('hidden') statt style.display,
      weil Webflow das hidden-Attribut setzt.
   4. rcAdvisor — initial display:none in Webflow, JS schaltet
      per removeAttribute('hidden') / style.display='flex' ein.
   5. rcFounder — konsequent nur per classList / removeAttribute
      gesteuert, kein Mischen mit style.display.
   6. hint — removeAttribute('hidden') / setAttribute('hidden')
      statt style.display, konsistent mit HTML-Ausgangszustand.
   ============================================================ */
(function () {

  var PAKETE = {
    solo:    { name:'Selbststarter',  price:149, flatPrice:false, color:'#3D2BD5', mixColor:'#3D2BD5', iconColor:'#fff'    },
    team:    { name:'Gesellschaft',   price:199, flatPrice:false, color:'#00A1AA', mixColor:'#00A1AA', iconColor:'#fff'    },
    corp:    { name:'GmbH · UG · AG', price:249, flatPrice:false, color:'#FF0670', mixColor:'#FF0670', iconColor:'#fff'    },
    holding: { name:'Holding',        price:65,  flatPrice:true,  color:'#C9A800', mixColor:'#F6DF35', iconColor:'#0E0C1C' }
  };

  var RECHTSFORM = {
    solo:'Einzelunternehmer', team:'Personengesellschaft',
    corp:'Kapitalgesellschaft', holding:'Holding'
  };

  var PKG_TIERS = {
    solo: [
      { id:'selbststarter', name:'Selbststarter', tagline:'Günstigster Einstieg',                   price:149, features:['EÜR & Jahresabschluss','Alle betrieblichen Steuern','Elektronische Übermittlung','100\u00a0€ Beratungsguthaben p.\u202fa.'] },
      { id:'sorglos',       name:'Vorsorge',       tagline:'Mit monatlichem Review',                price:199, features:['Alles aus Selbststarter','Monatlicher Review (Belege\u00a0>\u00a0100\u00a0€)','Alles bereit für die UVA – Du übermittelst','200\u00a0€ Beratungsguthaben p.\u202fa.'] },
      { id:'vollservice',   name:'Sorglos PLUS',   tagline:'In Vorbereitung – Du wirst informiert', price:299, comingSoon:true, features:['Verbuchen der hochgeladenen Belege','UVA-Übermittlung','Zusammenfassende Meldung','400\u00a0€ Beratungsguthaben p.\u202fa.'] }
    ],
    team: [
      { id:'selbststarter', name:'Selbststarter', tagline:'Günstigster Einstieg',                   price:199, features:['Bilanz & Jahresabschluss','Alle betrieblichen Steuern','Gesonderte Feststellung','100\u00a0€ Beratungsguthaben p.\u202fa.'] },
      { id:'sorglos',       name:'Vorsorge',       tagline:'Mit monatlichem Review',                price:249, features:['Alles aus Selbststarter','Monatlicher Review (Belege\u00a0>\u00a0100\u00a0€)','Alles bereit für die UVA – Du übermittelst','200\u00a0€ Beratungsguthaben p.\u202fa.'] },
      { id:'vollservice',   name:'Sorglos PLUS',   tagline:'In Vorbereitung – Du wirst informiert', price:349, comingSoon:true, features:['Verbuchen der hochgeladenen Belege','UVA-Übermittlung','Zusammenfassende Meldung','400\u00a0€ Beratungsguthaben p.\u202fa.'] }
    ],
    corp: [
      { id:'selbststarter', name:'Selbststarter', tagline:'Günstigster Einstieg',                   price:249, features:['E-Bilanz & Jahresabschluss','KSt-, Gewerbe- & USt-Erklärung','Offenlegung Bundesanzeiger','100\u00a0€ Beratungsguthaben p.\u202fa.'] },
      { id:'sorglos',       name:'Vorsorge',       tagline:'Mit monatlichem Review',                price:299, features:['Alles aus Selbststarter','Monatlicher Review (Belege\u00a0>\u00a0100\u00a0€)','Alles bereit für die UVA – Du übermittelst','200\u00a0€ Beratungsguthaben p.\u202fa.'] },
      { id:'vollservice',   name:'Sorglos PLUS',   tagline:'In Vorbereitung – Du wirst informiert', price:399, comingSoon:true, features:['Verbuchen der hochgeladenen Belege','UVA-Übermittlung','Zusammenfassende Meldung','400\u00a0€ Beratungsguthaben p.\u202fa.'] }
    ]
  };

  var COMMON = ['Steuerberater als fester Ansprechpartner','Bescheidprüfung & Einspruch inklusive','Wechsel & Onboarding übernehmen wir komplett'];

  var FEATURES = {
    solo:    ['EÜR & Jahresabschluss','Alle betrieblichen Steuern','Elektronische Übermittlung','100\u00a0€ Beratungsguthaben p.\u202fa.'],
    team:    ['Bilanz & Jahresabschluss','Alle betrieblichen Steuern','Gesonderte Feststellung','100\u00a0€ Beratungsguthaben p.\u202fa.'],
    corp:    ['E-Bilanz & Jahresabschluss','KSt-, Gewerbe- & USt-Erklärung','Offenlegung Bundesanzeiger','100\u00a0€ Beratungsguthaben p.\u202fa.'],
    holding: ['Buchhaltung aller Gesellschaften','E-Bilanzen & Jahresabschlüsse','Beteiligungserträge & §8b KStG','Körperschaft- & Gewerbesteuer']
  };

  /* ── Berater — Bilder nach Upload in Webflow Assets eintragen ── */
  var ADVISORS = {
    solo:    { name:'Janis Lambertz',        role:"Steuerberater bei b'steuern", image:'BILD_URL_JANIS'       },
    team:    { name:'Philipp Rust',           role:"Steuerberater bei b'steuern", image:'BILD_URL_PHILIPP'     },
    corp:    { name:'Philipp Rust',           role:"Steuerberater bei b'steuern", image:'BILD_URL_PHILIPP'     },
    holding: { name:'Christopher Plantener', role:"Steuerberater bei b'steuern", image:'BILD_URL_CHRISTOPHER' }
  };

  var BOOK   = 'https://bsteuern.typeform.com/waitinglist';
  function euro(n) { return n.toLocaleString('de-DE') + '\u00a0€'; }
  var CHECK   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 6"/></svg>';
  var ARROW   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var SHIELD  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 4v5c0 4.4-3.1 7.6-8 9-4.9-1.4-8-4.6-8-9V7z"/></svg>';
  var PORTRAIT= '<svg class="pf-img" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true"><circle cx="24" cy="17" r="9"/><path d="M6 46c0-9.5 8-15 18-15s18 5.5 18 15z"/></svg>';

  function bookingUrl(tierData) {
    if (!current) return BOOK;
    var q = new URLSearchParams();
    q.set('rechtsform', RECHTSFORM[current]);
    if (tierData) q.set('paket', tierData.name);
    q.set('gruender', founderCb.checked ? 'ja' : 'nein');
    return BOOK + '?' + q.toString();
  }

  /* ── DOM Refs ── */
  var formBtns    = document.querySelectorAll('.form-btn');
  var founderCb   = document.getElementById('founder');
  var rcFounder   = document.getElementById('rcFounder');
  var card        = document.getElementById('rcard');
  var hint        = document.getElementById('hint');
  var rcOpts      = document.getElementById('rcOpts');
  var rcDetail    = document.getElementById('rcDetail');
  var rcHeadName  = document.getElementById('rcHeadName');
  var rcAdvisor   = document.getElementById('rcAdvisor');
  var stickyCta   = document.getElementById('stickyCta');
  var mbName      = document.getElementById('mbName');
  var mbAdvisor   = document.querySelector('.mb-advisor');
  var rcDiscBtn   = document.getElementById('rcDiscBtn');
  var rcDiscPanel = document.getElementById('rcDiscPanel');
  var discSec     = document.getElementById('discSec');
  var step2sec    = document.getElementById('step2sec');

  var current     = null;
  var selectedPkg = 'selbststarter';
  var detailsOpen = false;

  /* ── Initialzustand erzwingen ──────────────────────────────
     cssText mit !important ist die einzig zuverlässige Methode
     um Webflow Inline-Styles zu überschreiben. ── */
  function forceHide(el) {
    if (!el) return;
    el.style.removeProperty('display');
    el.style.setProperty('display', 'none', 'important');
  }
  function forceShow(el, disp) {
    if (!el) return;
    el.style.removeProperty('display');
    el.style.setProperty('display', disp || 'block', 'important');
  }

  forceHide(card);
  forceHide(discSec);
  forceHide(rcAdvisor);

  /* ── HTML-Helfer ── */

  function advisorHtml(form) {
    var a = ADVISORS[form] || ADVISORS.solo;
    var imgHtml = (a.image && a.image.indexOf('BILD_URL') === -1)
      ? '<img src="' + a.image + '" alt="' + a.name + '" style="width:100%;height:100%;object-fit:cover;display:block;">'
      : PORTRAIT;
    return '<span class="ph" aria-hidden="true">' + imgHtml + '</span>' +
      '<span class="tx"><strong>Im Erstgespräch sprichst du mit ' + a.name + '</strong>' +
      a.role + ' – kein Callcenter, kein Bot.</span>';
  }

  function optRowHtml(t) {
    var soon = !!t.comingSoon;
    var sel  = t.id === selectedPkg && !soon;
    var tag  = soon
      ? '<span class="rc-opt-tag soon">Bald</span>'
      : '';
    var price = soon
      ? '<span class="soon-lbl">Preis folgt</span>'
      : '<span class="f">ab</span>' + euro(t.price) + '<span class="p">/Mo</span>';
    return '<div class="rc-opt' + (sel ? ' selected' : '') + (soon ? ' soon' : '') +
      '" role="radio" aria-checked="' + sel + '"' +
      (soon ? ' aria-disabled="true"' : '') +
      ' data-pkg="' + t.id + '">' +
      '<span class="rc-opt-check" aria-hidden="true">' + CHECK + '</span>' +
      '<span class="rc-opt-main">' +
        '<span class="rc-opt-name">' + t.name + tag + '</span>' +
        '<span class="rc-opt-desc">' + t.tagline + '</span>' +
      '</span>' +
      '<span class="rc-opt-price">' + price + '</span>' +
      '</div>';
  }

  function detailHtml(t) {
    return '<a class="cta-full" href="' + bookingUrl(t) + '">' +
      t.name + ' – kostenloses Erstgespräch buchen' + ARROW +
      '</a><p class="rc-reassure">Unverbindlich · ca. 20 Minuten · ' +
      '<strong>finaler Preis fix nach dem Gespräch</strong></p>';
  }

  function holdingDetailHtml() {
    return '<div class="rc-hold-price"><span class="f">ab</span>' +
      '<span class="amt">' + euro(65) + '</span>' +
      '<span class="per">/ Monat · Flachpreis</span></div>' +
      '<a class="cta-full" href="' + bookingUrl(null) + '">' +
      'Holding – kostenloses Erstgespräch buchen' + ARROW + '</a>' +
      '<p class="rc-reassure">Keine Transaktions-Aufschläge · ' +
      '<strong>exakter Preis nach dem Gespräch</strong></p>';
  }

  function featList(arr) {
    return '<ul class="rc-disc-feats">' + arr.map(function (f) {
      return '<li><span class="ck" aria-hidden="true">' + CHECK + '</span><span>' + f + '</span></li>';
    }).join('') + '</ul>';
  }

  function sizeRows() {
    var rows = [
      ['bis 100 Belege','inklusive'],
      ['100–200','+50\u00a0€'],
      ['200–300','+100\u00a0€'],
      ['300–400','+150\u00a0€'],
      ['400–500','+200\u00a0€'],
      ['über 500','+250\u00a0€ · max.']
    ];
    return '<div class="rc-size">' + rows.map(function (r) {
      return '<div class="rc-size-tr"><span>' + r[0] + '</span><span class="rc-size-v">' + r[1] + '</span></div>';
    }).join('') + '</div>';
  }

  function discPanelHtml(selPkg, isHolding) {
    var leist = isHolding
      ? '<div class="rc-disc-grp"><div class="rc-disc-lab">Im Flachpreis enthalten</div>' + featList(FEATURES.holding) + '</div>'
      : '<div class="rc-disc-grp"><div class="rc-disc-lab">Im Paket ' + selPkg.name + ' enthalten</div>' + featList(selPkg.features) + '</div>' +
        '<div class="rc-disc-grp"><div class="rc-disc-lab">Bei jedem Paket inklusive</div>' + featList(COMMON) + '</div>';
    var groesse = isHolding
      ? '<div class="rc-disc-grp"><div class="rc-disc-lab">Preis</div><div class="rc-disc-info">' + SHIELD +
        '<span><strong>Flachpreis ' + euro(65) + '/Monat</strong> – keine Transaktions-Aufschläge. Exakter Preis im Erstgespräch.</span></div></div>'
      : '<div class="rc-disc-grp"><div class="rc-disc-lab">Größe &amp; Preis</div>' + sizeRows() +
        '<div class="rc-disc-note">Der Aufschlag ist bei <strong>+250\u00a0€/Monat gedeckelt</strong> – egal wie viele Belege.</div></div>';
    var gut = '<div class="rc-disc-grp"><div class="rc-disc-lab">Gut zu wissen</div>' +
      '<ul class="rc-disc-points">' +
      '<li><strong>Einmaliges Onboarding: ' + euro(299) + '.</strong> Wir holen alle Daten beim alten Berater ab und richten alles ein.</li>' +
      '<li><strong>Mitten im Jahr gestartet?</strong> Wir betreuen dein komplettes Steuerjahr und verteilen fair auf Monatsraten.</li>' +
      '</ul></div>';
    return leist + groesse + gut;
  }

  /* ── FIX 1: syncDisc steuert hidden-Attribut, kein style.display/padding mehr.
     Das Padding wenn geöffnet kommt aus CSS: .rc-disc-panel.open { padding: 0.125rem 2rem 1.625rem }
     → Füge diese Regel in bsteuern-preise-v3.css ein (siehe Kommentar am Ende). ── */
  function syncDisc() {
    var expanded = detailsOpen ? 'true' : 'false';
    rcDiscBtn.setAttribute('aria-expanded', expanded);

    if (detailsOpen) {
      rcDiscPanel.removeAttribute('hidden');
      rcDiscPanel.classList.add('open');
    } else {
      rcDiscPanel.setAttribute('hidden', '');
      rcDiscPanel.classList.remove('open');
    }
  }

  /* ── Haupt-Render ── */
  function render() {
    if (!current) return;
    var p     = PAKETE[current];
    var tiers = PKG_TIERS[current] || null;

    /* CI-Farben setzen */
    var r = document.documentElement.style;
    r.setProperty('--active-cc', p.color);
    r.setProperty('--active-cm', p.mixColor);
    r.setProperty('--active-ci', p.iconColor);

    rcHeadName.textContent = 'Wähle dein Paket · ' + RECHTSFORM[current];

    /* FIX 2: rcAdvisor — in Webflow auf Display:None setzen;
       hier aktivieren wir ihn explizit per style, damit Webflow-
       Initialzustand (hidden oder display:none) sauber überschrieben wird. */
    if (rcAdvisor) {
      rcAdvisor.removeAttribute('hidden');
      forceShow(rcAdvisor, 'flex');
      rcAdvisor.innerHTML = advisorHtml(current);
    }

    /* Mobile-Bar Berater */
    var adv = ADVISORS[current] || ADVISORS.solo;
    if (mbName) {
      var parts = adv.name.split(' ');
      mbName.innerHTML = parts.shift() + '<br>' + parts.join(' ');
    }
    if (mbAdvisor) {
      mbAdvisor.innerHTML = (adv.image && adv.image.indexOf('BILD_URL') === -1)
        ? '<img src="' + adv.image + '" alt="' + adv.name + '" style="width:100%;height:100%;object-fit:cover;display:block;">'
        : PORTRAIT;
    }

    var selPkg = null;

    if (p.flatPrice) {
      /* Holding — kein Paketselektor */
      rcOpts.style.display = 'none';

      /* FIX 3: rcFounder bei Holding verstecken, konsistent ohne style.display-Mischen */
      if (rcFounder) {
        rcFounder.classList.remove('show');
      }

      rcDetail.style.display = 'block';
      rcDetail.innerHTML     = holdingDetailHtml();
      rcDiscPanel.innerHTML  = discPanelHtml(null, true);

    } else {
      /* Solo / Team / Corp — Paketselektor */
      rcOpts.style.display = 'flex';
      rcDetail.style.display = 'block';

      selPkg = tiers.filter(function (t) { return t.id === selectedPkg && !t.comingSoon; })[0];
      if (!selPkg) {
        selPkg = tiers.filter(function (t) { return t.id === 'selbststarter'; })[0] || tiers[0];
        selectedPkg = selPkg.id;
      }

      rcOpts.innerHTML      = tiers.map(optRowHtml).join('');
      rcDetail.innerHTML    = detailHtml(selPkg);
      rcDiscPanel.innerHTML = discPanelHtml(selPkg, false);

      /* Klick-Handler auf neu gerenderte Paket-Zeilen */
      rcOpts.querySelectorAll('.rc-opt:not(.soon)').forEach(function (b) {
        b.addEventListener('click', function () {
          if (selectedPkg === b.dataset.pkg) return;
          selectedPkg = b.dataset.pkg;
          render();
        });
      });

      /* FIX 4: rcFounder nur per classList steuern — display kommt aus CSS */
      if (rcFounder) {
        rcFounder.style.removeProperty('display'); /* inline-style aus alter Version löschen */
        rcFounder.classList.toggle('show', founderCb.checked);
      }
    }

    /* FIX 5: discSec — hidden-Attribut entfernen statt style.display setzen */
    if (discSec) {
      discSec.removeAttribute('hidden');
      forceShow(discSec, 'block');
    }

    /* Disc-Panel Zustand synchronisieren (kein Reset beim Re-render) */
    syncDisc();

    /* Sticky CTA aktualisieren */
    if (stickyCta) stickyCta.href = bookingUrl(selPkg);
  }

  /* ── Event-Listener ── */

  formBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      formBtns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      current     = b.dataset.form;
      selectedPkg = 'selbststarter';

      /* FIX 6: hint und rcard über hidden-Attribut steuern, nicht style.display,
         damit das .rcard[hidden]{display:none} im CSS sauber greift. */
      if (hint) hint.setAttribute('hidden', '');
      forceShow(card, 'block');

      render();

      if (step2sec) step2sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  if (founderCb) {
    founderCb.addEventListener('change', render);
  }

  /* Founder-Div klickbar machen (kein label-Tag in Webflow möglich) */
  var founderDiv = document.querySelector('.founder');
  if (founderDiv && founderCb) {
    founderDiv.addEventListener('click', function (e) {
      if (e.target === founderCb) return; /* nativer Klick auf Input selbst */
      founderCb.checked = !founderCb.checked;
      render();
    });
  }

  if (rcDiscBtn) {
    rcDiscBtn.addEventListener('click', function () {
      detailsOpen = !detailsOpen;
      syncDisc();
    });
  }

  /* ============================================================
     ERFORDERLICHE CSS-ERGÄNZUNG in bsteuern-preise-v3.css
     (Zeile nach ".rc-disc-panel[hidden] { display: none; }" einfügen):

     .rc-disc-panel.open {
       padding: 0.125rem 2rem 1.625rem;
     }

     Tablet (nach ".rc-disc-panel { padding: 0; }" im 51.25em-Block):
     .rc-disc-panel.open { padding: 0.125rem 1.5rem 1.625rem; }

     Mobile (nach ".rc-disc-panel { padding: 0; }" im 30em-Block):
     .rc-disc-panel.open { padding: 0.125rem 1.125rem 1.25rem; }
     ============================================================ */

})();
