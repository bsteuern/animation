/* b'steuern Landing Page v7 — JS for Webflow Custom Code (paste into Project Settings → Custom Code → Before </body>) */

/* Pricing: Jasper-Style Switcher */
(function(){
  const data = {
    selbststarter: {
      pkg: 'Selbststarter',
      amt: '<span class="ab">ab</span><span class="num">149€</span><span class="per">/mtl*</span>',
      value: 'Kein Papierchaos, kein Fristenstress. Wir übernehmen den Jahresabschluss — du konzentrierst dich auf dein Business.',
      cta: 'Selbststarter wählen →',
      foot: '* Je nach Unternehmensform. Keine Stundenabrechnung.',
      feat: [
        ['Jährlich', ['Plausibilitätsprüfung der Buchhaltung', 'Erstellung der Bilanz bzw. EÜR', 'Jahresabschluss erstellen & elektronisch übermitteln', 'Gewerbesteuererklärung', 'Umsatzsteuererklärung']],
        ['Onboarding', ['Konfigurationscheck & Einrichtung Lexware Office']]
      ]
    },
    vorsorge: {
      pkg: 'Vorsorge',
      amt: '<span class="ab">ab</span><span class="num">199€</span><span class="per">/mtl*</span>',
      value: 'Für +50 € im Monat haben wir deine Buchhaltung monatlich im Griff — keine bösen Überraschungen beim Jahresabschluss.',
      cta: 'Vorsorge wählen →',
      foot: 'Inkl. allem aus <b>Selbststarter</b>. * Je nach Unternehmensform.',
      feat: [
        ['Monatlich', ['Plausibilitätsprüfung der Buchhaltung', 'USt-Voranmeldung', 'Zusammenfassende Meldung']],
        ['Jährlich', ['Körperschaftsteuererklärung', 'Offenlegungsbilanz & Hinterlegung Bundesanzeiger', 'Gesondert und einheitliche Feststellung', 'Kapitalertragssteuer (falls relevant)']]
      ]
    },
    sorglos: {
      pkg: 'Sorglos PLUS',
      amt: '<span class="num" style="font-size:48px;">Preis folgt</span>',
      value: 'Du machst Business. Wir machen den Rest — Buchhaltung, Review, Jahresabschluss. Alles aus einer Hand.',
      cta: 'Benachrichtige mich →',
      foot: 'Inkl. allem aus <b>Vorsorge</b>. Verfügbarkeit in Kürze.',
      feat: [
        ['Monatlich', ['Vollständiger Review inkl. Korrekturbuchungen', 'Kontrolle der ZM & Prüfung USt-ID-Nummern', 'Buchhaltungsservice zubuchbar']],
        ['Jährlich', ['Bescheidprüfung']]
      ]
    }
  };

  const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 6"/></svg>';

  const tabs = document.querySelectorAll('.pricing-tab');
  const detail = document.getElementById('prDetail');
  tabs.forEach(t => t.addEventListener('click', () => {
    const k = t.dataset.pkg;
    const d = data[k];
    if(!d) return;
    tabs.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    detail.classList.toggle('soon', t.classList.contains('soon'));
    document.getElementById('prPkg').textContent = d.pkg;
    document.getElementById('prAmt').innerHTML = d.amt;
    document.getElementById('prValue').textContent = d.value;
    document.getElementById('prCta').innerHTML = d.cta;
    document.getElementById('prFoot').innerHTML = d.foot;
    document.getElementById('prFeat').innerHTML = d.feat.map(g =>
      '<div class="pricing-feature-group"><div class="pricing-feature-head">' + g[0] + '</div><ul class="pricing-feature-list">' + g[1].map(i => '<li><span class="ck" aria-hidden="true">' + CHECK_SVG + '</span><span>' + i + '</span></li>').join('') + '</ul></div>'
    ).join('');
  }));
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
