/* b'steuern Landing Page v7 — JS for Webflow Custom Code (paste into Project Settings → Custom Code → Before </body>) */

/* Pricing v5 — Full-bleed compare grid + mobile switcher */
(function(){
  var checkSvg = '<svg class="ck" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 8L7.5 13.5L18 2.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" stroke-linejoin="miter"/></svg>';
  var groups = [
    { cls:'g-onboarding', label:'Onboarding', meta:'einmalig', rows:[
      { name:'Konfigurationscheck & Einrichtung Lexware Office', vals:[1,1,1] }
    ]},
    { cls:'g-annual', label:'Jahresabschluss & Steuern', meta:'jährlich', rows:[
      { name:'Plausibilitätsprüfung der Buchhaltung', desc:'In Vorsorge & Sorglos PLUS monatlich.', vals:[1,1,1] },
      { name:'Erstellung der Bilanz bzw. EÜR', vals:[1,1,1] },
      { name:'Jahresabschluss erstellen & elektronisch übermitteln', vals:[1,1,1] },
      { name:'Gewerbesteuererklärung', vals:[1,1,1] },
      { name:'Umsatzsteuererklärung', vals:[1,1,1] },
      { name:'Körperschaftsteuererklärung', vals:[0,1,1] },
      { name:'Offenlegungsbilanz & Hinterlegung Bundesanzeiger', vals:[0,1,1] },
      { name:'Gesondert und einheitliche Feststellung', vals:[0,1,1] },
      { name:'Kapitalertragssteuer', desc:'falls relevant', vals:[0,1,1] },
      { name:'Bescheidprüfung', vals:[0,0,1] }
    ]},
    { cls:'g-monthly', label:'Laufende Buchhaltung', meta:'monatlich', rows:[
      { name:'USt-Voranmeldung', vals:[0,1,1] },
      { name:'Zusammenfassende Meldung', vals:[0,1,1] },
      { name:'Vollständiger Review inkl. Korrekturbuchungen', vals:[0,0,1] },
      { name:'Kontrolle der ZM & Prüfung USt-ID-Nummern', vals:[0,0,1] },
      { name:'Buchhaltungsservice', desc:'zubuchbar', vals:[0,0,1] }
    ]}
  ];
  var pkgs = [
    { n:'Selbststarter', p:'ab 149€/mtl' },
    { n:'Vorsorge', p:'ab 199€/mtl' },
    { n:'Sorglos PLUS', p:'Preis folgt' }
  ];
  var body = document.getElementById('prCmpBody');
  if(!body) return;
  var html = '';
  groups.forEach(function(g){
    // Group head row (4 cells; cols 2-4 empty)
    html += '<div class="pr-row g-head-row '+g.cls+'" role="row">'
      + '<div class="pr-cell g-title-cell" role="cell"><span class="g-meta">'+g.meta+'</span><h4 class="g-title">'+g.label+'</h4></div>'
      + '<div class="pr-cell empty" role="cell"></div>'
      + '<div class="pr-cell empty" role="cell"></div>'
      + '<div class="pr-cell empty" role="cell"></div>'
      + '</div>';
    g.rows.forEach(function(r, idx){
      var darkCls = (idx % 2 === 1) ? ' is-dark' : '';
      var lastCls = (idx === g.rows.length - 1) ? ' is-last' : '';
      html += '<div class="pr-row g-row '+g.cls+darkCls+lastCls+'" role="row">';
      html += '<div class="pr-cell c-label" role="cell"><div class="feat-name">'+r.name+'</div>'+(r.desc?'<div class="feat-desc">'+r.desc+'</div>':'')+'</div>';
      for(var i=0;i<3;i++){
        html += '<div class="pr-cell c-val" role="cell">'
          + '<span class="pr-cmp-mob-label">'+pkgs[i].n+'<span class="mp">'+pkgs[i].p+'</span></span>'
          + (r.vals[i] ? checkSvg : '<span class="dash"></span>')
          + '</div>';
      }
      html += '</div>';
    });
    // Closing spacer keeps the dark row from butting up against the next section
    html += '<div class="g-closer '+g.cls+'"><div class="gc-1"></div><div class="gc-2"></div><div class="gc-3"></div></div>';
  });
  body.innerHTML = html;

  // Mobile tab switcher
  var cmp = document.querySelector('.pr-cmp');
  var tabs = document.querySelectorAll('.pr-mtab');
  var priceText = document.querySelector('[data-pkg-text]');
  var ctaSlot = document.querySelector('[data-pkg-cta]');
  var priceData = [
    'ab 149€ <span>/ mtl.*</span>',
    'ab 199€ <span>/ mtl.*</span>',
    'Preis folgt'
  ];
  var ctaData = [
    '<a href="https://www.bsteuern.com/lp/kostenlose-beratung" class="pr-mprice-btn">Paket wählen →</a>',
    '<a href="https://www.bsteuern.com/lp/kostenlose-beratung" class="pr-mprice-btn">Paket wählen →</a>',
    '<span class="pr-mprice-soon">Bald verfügbar</span>'
  ];
  function setPkg(idx){
    cmp.classList.remove('is-pkg-0','is-pkg-1','is-pkg-2');
    cmp.classList.add('is-pkg-'+idx);
    tabs.forEach(function(t,i){ t.classList.toggle('is-active', i===idx); });
    if (priceText) priceText.innerHTML = priceData[idx];
    if (ctaSlot) ctaSlot.innerHTML = ctaData[idx];
  }
  tabs.forEach(function(t){
    t.addEventListener('click', function(){
      setPkg(parseInt(t.dataset.pkg, 10));
    });
  });
  setPkg(0);
})();

/* FAQ-Accordion */
function bindAcc(sel){
  document.querySelectorAll(sel).forEach(btn=>{
    btn.addEventListener('click',()=>{
      const item=btn.parentElement;
      const open=item.classList.contains('open');
      item.parentElement.querySelectorAll('.open').forEach(i=>i.classList.remove('open'));
      if(!open)item.classList.add('open');
    });
  });
}
bindAcc('.faq-question');

/* Warum b'steuern · Auto-Advance Accordion (Jasper-Style) */
(function(){
  const DURATION=6000;
  const list=document.getElementById('whyList');
  const media=document.getElementById('whyMedia');
  if(!list)return;
  const items=[...list.querySelectorAll('.warum-item')];
  const imgs=[...media.querySelectorAll('.warum-media-img')];
  let active=0,timer=null,paused=false;

  function colorOf(i){return getComputedStyle(items[i]).getPropertyValue('--c').trim();}
  function setBar(item,run){
    const bar=item.querySelector('.warum-item-bar');
    bar.style.transition='none';bar.style.width='0%';
    void bar.offsetWidth;
    if(run){bar.style.transition='width '+DURATION+'ms linear';bar.style.width='100%';}
  }
  function open(i){
    items.forEach((it,idx)=>{
      it.classList.toggle('open',idx===i);
      if(idx!==i){const b=it.querySelector('.warum-item-bar');b.style.transition='none';b.style.width='0%';}
    });
    imgs.forEach((im,idx)=>im.classList.toggle('show',idx===i));
    list.style.setProperty('--line','color-mix(in srgb,'+colorOf(i)+' 32%,#fff)');
    active=i;
    setBar(items[i],!paused);
    clearTimeout(timer);
    if(!paused)timer=setTimeout(()=>open((active+1)%items.length),DURATION);
  }

  items.forEach((it,i)=>it.querySelector('.warum-item-question').addEventListener('click',()=>open(i)));
  list.addEventListener('mouseenter',()=>{paused=true;clearTimeout(timer);
    const bar=items[active].querySelector('.warum-item-bar');
    const w=getComputedStyle(bar).width;bar.style.transition='none';bar.style.width=w;});
  list.addEventListener('mouseleave',()=>{paused=false;open(active);});

  open(0);
})();

/* Services · Scrollytelling: sticky Mockup wechselt in Bildschirmmitte */
function bsteuernInitServices(){
  const steps=[...document.querySelectorAll('#svcSteps .services-step')];
  const stage=document.getElementById('svcStage');
  if(!steps.length||!stage)return;
  steps.forEach((step,i)=>{
    const mock=document.createElement('div');
    mock.className='services-mock'+(i===0?' show':'');
    const cs=getComputedStyle(step);
    const c=cs.getPropertyValue('--c').trim();
    const m=cs.getPropertyValue('--m').trim();
    if(c) mock.style.setProperty('--c',c);
    if(m) mock.style.setProperty('--m',m);
    mock.innerHTML=step.querySelector('.services-step-vis').innerHTML;
    stage.appendChild(mock);
  });
  const mocks=[...stage.querySelectorAll('.services-mock')];
  let current=-1;
  function update(){
    const mid=window.innerHeight/2;
    let best=0,bestDist=Infinity;
    steps.forEach((s,i)=>{
      const r=s.getBoundingClientRect();
      const c=r.top+r.height/2;
      const d=Math.abs(c-mid);
      if(d<bestDist){bestDist=d;best=i;}
    });
    if(best!==current){
      current=best;
      mocks.forEach((m,idx)=>m.classList.toggle('show',idx===best));
      steps.forEach((s,idx)=>s.classList.toggle('active',idx===best));
    }
  }
  let ticking=false;
  window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{update();ticking=false;});ticking=true;}},{passive:true});
  window.addEventListener('resize',update);
  update();
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',bsteuernInitServices);
}else{
  bsteuernInitServices();
}
