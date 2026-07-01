/* ============================================================================
 * b'steuern — Partner-Subpage MOUNT-ENGINE (Hybrid, Vanilla, ein File)
 * ----------------------------------------------------------------------------
 * Du baust den Rahmen (Nav, Hero, Warum, Workflow, Deal, Stimmen, Verwandte)
 * nativ im Designer. Diese Engine füllt NUR die leeren Mount-Divs:
 *   #bs-facts  #bs-whypoints  #bs-features  #bs-who
 *   #bs-price  #bs-compare    #bs-trust     #bs-faq
 * Fehlt eine ID, wird der Block übersprungen.
 *
 * EINBAU (zwei HTML-Embeds im Partners-Collection-Template):
 *
 * 1) Datenschicht-Embed:
 *    <div id="partner-data" style="display:none"
 *      data-headerbg="{{BG-Header}}" data-accent="{{Akzent}}"
 *      data-pagebg="{{BG-Seite}}" data-inkdark="#262A3E"
 *      data-spotaccent="{{Spot-Akzent}}" data-productimg="{{Produkt-Bild}}">
 *      <script type="application/json" id="partner-detail">{{Detail-Daten}}</script>
 *    </div>
 *
 * 2) FAQ-Bridge (versteckte Collection-List Partner-FAQ, Filter Partner = Current):
 *    <div id="faq-bridge" style="display:none">
 *      <div class="b-faq" data-q="{{Name}}"><div class="b-faq-a">{{Antwort}}</div></div>
 *    </div>
 *
 * DEPLOY: dieses File -> Commit bsteuern/animation -> jsDelivr @<hash>
 *         -> Subpage Page-Settings "Before </body>":
 *         <script src="https://cdn.jsdelivr.net/gh/bsteuern/animation@<hash>/bsteuern-subpage-engine.js"></script>
 *
 * Marken-Regeln: Zero-Radius, Remixicon fill, FeatureDeck OHNE Georgia,
 * Motion "Gelassenheit" (langsame Eases, kein Bounce).
 * ==========================================================================*/
(function () {
  'use strict';

  var FD = "'FeatureDeck',sans-serif";          // iOS-Fix: kein Georgia
  var GS = "'General Sans',system-ui,sans-serif";
  var INK = '#0E0C1C';

  /* ---------- Helpers ---------- */
  function ready(fn){ document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function rgba(hex,a){ var h=String(hex||'#000').replace('#',''); if(h.length===3)h=h.split('').map(function(c){return c+c;}).join(''); var r=parseInt(h.substr(0,2),16),g=parseInt(h.substr(2,2),16),b=parseInt(h.substr(4,2),16); return 'rgba('+r+','+g+','+b+','+a+')'; }
  function byId(id){ return document.getElementById(id); }

  /* ---------- Daten lesen ---------- */
  function readData(){
    var d=byId('partner-data');
    if(!d){ console.error('[bsteuern] #partner-data fehlt'); return null; }
    var det={};
    try { var js=byId('partner-detail'); det=JSON.parse((js&&js.textContent||'{}').trim()); }
    catch(e){ console.warn('[bsteuern] Detail-Daten JSON ungültig:', e); }
    var ds=d.dataset;
    var c={
      headerBg: ds.headerbg||'#3D2BD5',
      accent:   ds.accent||'#3D2BD5',
      pageBg:   ds.pagebg||'#F5EFE3',
      inkDark:  ds.inkdark||'#262A3E',
      spotAccent: ds.spotaccent||ds.accent||'#3D2BD5',
      productImg: ds.productimg||'',
      facts: det.facts||[], whyPoints: det.whyPoints||[],
      features: det.features||[], who: det.who||[],
      priceTable: det.priceTable||null, pricing: det.pricing||[],
      compare: det.compare||null, trust: det.trust||[]
    };
    c.label = c.headerBg;
    c.slotBg = rgba(c.headerBg,.07);
    c.faq = Array.prototype.map.call(document.querySelectorAll('#faq-bridge .b-faq'),
      function(el){ var a=el.querySelector('.b-faq-a'); return {q:el.dataset.q, a:a?a.textContent.trim():''}; })
      .filter(function(f){return f.q;});
    return c;
  }

  /* ---------- Basis-CSS ---------- */
  function injectBase(){
    if(byId('bs-base')) return;
    var s=document.createElement('style'); s.id='bs-base';
    s.textContent =
      '.bs-block,.bs-block *{box-sizing:border-box;}'
    + '.bs-block button:focus-visible{outline:3px solid #1A73E8;outline-offset:2px;}'
    + '@keyframes bs-grow{from{width:0;}to{width:100%;}}'
    + '@media (max-width:760px){.bs-block [style*="grid-template-columns"]{grid-template-columns:1fr !important;}'
    + '.bs-block [style*="position:sticky"]{position:static !important;top:auto !important;}}';
    document.head.appendChild(s);
  }

  /* ===================== BLÖCKE ===================== */

  /* --- Steckbrief (facts) --- */
  function renderFacts(m,c){
    if(!c.facts.length){ return; }
    m.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:40px;">'
      + c.facts.map(function(f){
          return '<div>'
            + '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:rgba(14,12,28,.6);margin-bottom:14px;">'+esc(f.k)+'</div>'
            + '<div style="font-family:'+FD+';font-weight:500;font-size:22px;letter-spacing:-.02em;line-height:1.22;color:'+INK+';">'+esc(f.v)+'</div>'
            + '</div>';
        }).join('')
      + '</div>';
  }

  /* --- whyPoints --- */
  function renderWhyPoints(m,c){
    if(!c.whyPoints.length){ return; }
    m.innerHTML = '<div style="display:flex;flex-direction:column;gap:16px;border-top:1px solid rgba(14,12,28,.12);padding-top:26px;">'
      + c.whyPoints.map(function(pt){
          return '<div style="display:flex;align-items:center;gap:13px;font-size:15px;color:'+INK+';">'
            + '<i class="'+esc(pt.icon)+'" style="color:'+c.label+';font-size:21px;"></i>'+esc(pt.label)+'</div>';
        }).join('')
      + '</div>';
  }

  /* --- Trust --- */
  function renderTrust(m,c){
    if(!c.trust.length){ return; }
    m.innerHTML = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;">'
      + c.trust.map(function(x,i){
          var div = i>0 ? '1px solid rgba(14,12,28,.12)' : 'none';
          return '<div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:7px;padding:6px 20px;border-left:'+div+';">'
            + '<div style="display:flex;align-items:center;gap:10px;"><i class="'+esc(x.icon)+'" style="color:'+c.label+';font-size:21px;"></i>'
            + '<span style="font-weight:600;color:'+INK+';font-size:17px;">'+esc(x.v)+'</span></div>'
            + '<div style="color:rgba(14,12,28,.55);font-size:13px;line-height:1.45;">'+esc(x.k)+'</div></div>';
        }).join('')
      + '</div>';
  }

  /* --- Features (Tabs + Bild, auto-rotierend) --- */
  function renderFeatures(m,c){
    var list=c.features; if(!list.length){ return; }
    var active=0, iv;
    function panel(){
      if(c.productImg) return '<img src="'+esc(c.productImg)+'" alt="" style="width:100%;height:400px;object-fit:cover;display:block;background:'+c.slotBg+';border:1px solid rgba(14,12,28,.09);" />';
      return '<div style="width:100%;height:400px;background:'+c.slotBg+';border:1px solid rgba(14,12,28,.09);display:flex;align-items:center;justify-content:center;color:rgba(14,12,28,.4);font-size:13px;">Produkt-Visual</div>';
    }
    function draw(){
      var tabs=list.map(function(f,i){
        var on=i===active, tc=on?c.headerBg:'#16284A';
        return '<button type="button" data-i="'+i+'" style="display:block;width:100%;text-align:left;border:none;background:transparent;cursor:pointer;padding:18px 0;border-bottom:1px solid rgba(14,12,28,.09);position:relative;font-family:'+GS+';">'
          + '<div style="font-size:17px;font-weight:500;color:'+tc+';transition:color .3s;">'+esc(f.t)+'</div>'
          + (on?'<div style="font-size:14px;line-height:1.55;color:rgba(14,12,28,.68);margin-top:6px;">'+esc(f.d)+'</div>'
              +'<div style="position:absolute;left:0;bottom:-1px;height:3px;width:100%;overflow:hidden;"><div style="height:100%;background:'+c.headerBg+';animation:bs-grow 5s linear forwards;"></div></div>':'')
          + '</button>';
      }).join('');
      m.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start;">'
        + '<div>'+tabs+'</div>'
        + '<div style="position:sticky;top:80px;">'+panel()+'</div></div>';
      Array.prototype.forEach.call(m.querySelectorAll('[data-i]'),function(b){
        b.addEventListener('click',function(){ if(iv){clearInterval(iv);iv=null;} active=+b.getAttribute('data-i'); draw(); });
      });
    }
    draw();
    iv=setInterval(function(){ active=(active+1)%list.length; draw(); },5000);
  }

  /* --- Passt / Für wen (Tabs + hervorgehobene Karte) --- */
  function renderWho(m,c){
    var list=c.who; if(!list.length){ return; }
    var active=0, iv;
    function card(){
      var w=list[active];
      return '<div style="background:'+c.headerBg+';color:#fff;padding:44px 40px;height:100%;display:flex;flex-direction:column;">'
        + '<div style="font-family:'+FD+';font-weight:500;letter-spacing:-.025em;font-size:30px;line-height:1.05;margin-bottom:18px;">'+esc(w.label)+'</div>'
        + '<div style="font-size:17px;line-height:1.6;color:rgba(255,255,255,.85);margin-bottom:24px;">'+esc(w.why)+'</div>'
        + '<div style="display:flex;flex-direction:column;gap:13px;border-top:1px solid rgba(255,255,255,.18);padding-top:22px;margin-top:auto;">'
        + (w.points||[]).map(function(pt){
            return '<div style="display:flex;gap:12px;align-items:flex-start;font-size:15px;line-height:1.4;color:rgba(255,255,255,.92);"><span style="color:'+c.spotAccent+';font-weight:700;flex:none;">&#10003;</span><span>'+esc(pt)+'</span></div>';
          }).join('')
        + '</div></div>';
    }
    function draw(){
      var tabs=list.map(function(w,i){
        var on=i===active, tc=on?c.headerBg:'#16284A';
        return '<button type="button" data-i="'+i+'" style="display:block;width:100%;text-align:left;border:none;background:transparent;cursor:pointer;padding:18px 0;border-bottom:1px solid rgba(14,12,28,.09);position:relative;font-family:'+GS+';">'
          + '<div style="display:flex;align-items:center;gap:14px;"><i class="'+esc(w.icon)+'" style="font-size:20px;color:'+tc+';transition:color .3s;"></i>'
          + '<span style="font-size:17px;font-weight:500;color:'+tc+';transition:color .3s;">'+esc(w.label)+'</span></div>'
          + (on?'<div style="position:absolute;left:0;bottom:-1px;height:3px;width:100%;background:'+c.headerBg+';"></div>':'')
          + '</button>';
      }).join('');
      m.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:stretch;">'
        + '<div style="position:sticky;top:80px;height:100%;">'+card()+'</div>'
        + '<div>'+tabs+'</div></div>';
      Array.prototype.forEach.call(m.querySelectorAll('[data-i]'),function(b){
        b.addEventListener('click',function(){ if(iv){clearInterval(iv);iv=null;} active=+b.getAttribute('data-i'); draw(); });
      });
    }
    draw();
    iv=setInterval(function(){ active=(active+1)%list.length; draw(); },6000);
  }

  /* --- Tarife (Tabelle) --- */
  function renderPrice(m,c){
    var pt=c.priceTable; if(!pt||!pt.cols||!pt.cols.length){ return; }
    var n=pt.cols.length, gtc='1.5fr'+' 1fr'.repeat(n);
    var head='<div style="display:grid;grid-template-columns:'+gtc+';border-bottom:1px solid rgba(14,12,28,.14);">'
      + '<div style="padding:22px 20px;font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:rgba(14,12,28,.5);align-self:end;">Merkmal</div>'
      + pt.cols.map(function(col){
          return '<div style="padding:22px 18px;">'
            + '<div style="font-family:'+FD+';font-weight:500;font-size:23px;letter-spacing:-.02em;line-height:1;color:'+INK+';margin-bottom:7px;">'+esc(col.name)+'</div>'
            + '<div style="font-size:14px;color:'+c.label+';font-weight:600;">'+esc(col.price)+'</div></div>';
        }).join('')
      + '</div>';
    var rows=(pt.rows||[]).map(function(r){
      var cells=r.slice(1).map(function(v){
        var isChk=v==='\u2713', isDash=v==='\u2013';
        var color=isChk?c.label:(isDash?'rgba(14,12,28,.3)':INK), weight=isChk?'700':'400';
        return '<div style="padding:15px 18px;font-size:15px;text-align:left;color:'+color+';font-weight:'+weight+';">'+esc(v)+'</div>';
      }).join('');
      return '<div style="display:grid;grid-template-columns:'+gtc+';border-top:1px solid rgba(14,12,28,.08);">'
        + '<div style="padding:15px 20px;font-size:14px;color:rgba(14,12,28,.62);">'+esc(r[0])+'</div>'+cells+'</div>';
    }).join('');
    m.innerHTML = '<div style="border:1px solid rgba(14,12,28,.12);overflow:hidden;background:#fff;">'+head+rows+'</div>';
  }

  /* --- Vergleich (KONSTRUIERT — kein Prototyp-Markup; gleiche Bildsprache) --- */
  function renderCompare(m,c){
    var cm=c.compare; if(!cm||!cm.rows||!cm.rows.length){ return; }
    function mark(v){
      if(v==='yes')     return {i:'ri-check-line', col:c.headerBg, t:''};
      if(v==='no')      return {i:'ri-subtract-line', col:'rgba(14,12,28,.35)', t:''};
      if(v==='partial') return {i:'ri-contrast-2-line', col:'rgba(14,12,28,.6)', t:'teils'};
      return {i:'ri-information-line', col:'rgba(14,12,28,.6)', t:v};
    }
    function cell(v){ var k=mark(v);
      return '<div style="padding:15px 18px;display:flex;align-items:center;gap:8px;color:'+k.col+';font-size:15px;">'
        + '<i class="'+k.i+'" style="font-size:18px;"></i>'+(k.t?'<span>'+esc(k.t)+'</span>':'')+'</div>';
    }
    var head='<div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;border-bottom:1px solid rgba(14,12,28,.14);">'
      + '<div style="padding:20px;font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:rgba(14,12,28,.5);align-self:end;">Merkmal</div>'
      + '<div style="padding:20px;font-family:'+FD+';font-weight:500;font-size:20px;letter-spacing:-.02em;color:'+INK+';">Dieser Partner</div>'
      + '<div style="padding:20px;font-family:'+FD+';font-weight:500;font-size:20px;letter-spacing:-.02em;color:'+INK+';">'+esc(cm.name)+'</div></div>';
    var rows=cm.rows.map(function(r){
      return '<div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;border-top:1px solid rgba(14,12,28,.08);">'
        + '<div style="padding:15px 20px;font-size:14px;color:rgba(14,12,28,.62);">'+esc(r.dim)+'</div>'
        + cell(r.a)+cell(r.b)+'</div>';
    }).join('');
    m.innerHTML = '<div style="border:1px solid rgba(14,12,28,.12);overflow:hidden;background:#fff;">'+head+rows+'</div>';
  }

  /* --- FAQ (Akkordeon + JSON-LD) --- */
  function renderFaq(m,c){
    var list=c.faq; if(!list.length){ return; }
    var open=0;
    function draw(){
      m.innerHTML = '<div style="border-top:1px solid rgba(14,12,28,.14);">'
        + list.map(function(f,i){
            var on=i===open, qc=on?c.headerBg:INK, icon=on?'ri-close-line':'ri-add-line';
            return '<div style="border-bottom:1px solid rgba(14,12,28,.14);">'
              + '<button type="button" data-i="'+i+'" style="width:100%;text-align:left;border:none;background:transparent;cursor:pointer;font-family:'+GS+';display:flex;align-items:center;justify-content:space-between;gap:24px;padding:24px 0;">'
              + '<span style="font-size:17px;font-weight:500;color:'+qc+';transition:color .2s;">'+esc(f.q)+'</span>'
              + '<span style="width:34px;height:34px;flex:none;border:1px solid '+c.label+';border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:'+c.label+';"><i class="'+icon+'" style="font-size:17px;line-height:1;"></i></span>'
              + '</button>'
              + (on?'<p style="font-size:15px;line-height:1.7;color:rgba(14,12,28,.6);margin:0;padding:0 64px 30px 0;max-width:720px;">'+esc(f.a)+'</p>':'')
              + '</div>';
          }).join('')
        + '</div>';
      Array.prototype.forEach.call(m.querySelectorAll('[data-i]'),function(b){
        b.addEventListener('click',function(){ var i=+b.getAttribute('data-i'); open=(open===i?-1:i); draw(); });
      });
    }
    draw();
    if(!byId('bs-faq-schema')){
      var sc=document.createElement('script'); sc.type='application/ld+json'; sc.id='bs-faq-schema';
      sc.textContent=JSON.stringify({'@context':'https://schema.org','@type':'FAQPage',
        mainEntity:list.map(function(f){return {'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}};})});
      document.head.appendChild(sc);
    }
  }

  /* ===================== Mount ===================== */
  var BLOCKS = {
    'bs-facts': renderFacts, 'bs-whypoints': renderWhyPoints, 'bs-trust': renderTrust,
    'bs-features': renderFeatures, 'bs-who': renderWho, 'bs-price': renderPrice,
    'bs-compare': renderCompare, 'bs-faq': renderFaq
  };

  ready(function(){
    var c=readData(); if(!c) return;
    injectBase();
    Object.keys(BLOCKS).forEach(function(id){
      var m=byId(id); if(!m) return;       // Mount nicht vorhanden -> überspringen
      m.classList.add('bs-block');
      try { BLOCKS[id](m,c); } catch(e){ console.error('[bsteuern] Block '+id+' fehlgeschlagen:', e); }
    });
  });
})();
