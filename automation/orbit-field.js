/* b'steuern automation - <orbit-field>  [bsteuern/animation @ automation/orbit-field.js]
   Kraftfeld-Animation aus der Sektion "Detailseiten", als Web Component.
   Attribute:
     tiles       "Stripe,PayPal,..."   Beschriftungen (erste `inner` gehen auf die innere Bahn)
     inner       Anzahl Tiles innere Bahn (Default: 5)
     tone        fandango | light | dark
     r-in/r-out  Bahnradien in px (Bühnenmaßstab)
     rings       Anzahl Ringe (Default 7)
     ring-base   Durchmesser innerster Ring (Default 200)
     ring-step   Abstand (Default 140)
     stage-w/h   Bühnenmaß (Default 1200 x 1090)
     ax/ay       Bühnen-Anker in % der Host-Box (Default 50%/50%)
     scale       fixer Maßstab; sonst automatisch auf Hostbreite
     speed       Multiplikator der Umlaufdauer (Default 1)
     radial      "1" = Tiles richten sich nicht mit (rotieren mit der Bahn)
*/
(function () {
  var CSS = `
:host { position: relative; display: block; width: 100%; height: 100%; overflow: hidden; --k: 1; --ax: 50%; --ay: 50%; }
* { box-sizing: border-box; }
@keyframes of-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes of-spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
@keyframes of-ring { 0%, 100% { opacity: .22; } 50% { opacity: .9; } }
@keyframes of-ring-faint { 0%, 100% { opacity: .07; } 50% { opacity: .34; } }
@keyframes of-sonar { 0% { transform: translate(-50%,-50%) scale(var(--s0,.2)); opacity: 0; } 10% { opacity: .95; } 100% { transform: translate(-50%,-50%) scale(1); opacity: 0; } }

@keyframes of-seq-double { 0%, 100% { opacity: .2; } 10% { opacity: .9; } 26% { opacity: .3; } 40% { opacity: .85; } 62% { opacity: .2; } }
@keyframes of-flash { 0%, 100% { opacity: .2; } 50% { opacity: .92; } }
@keyframes of-stroke { 0%, 100% { border-width: 1px; opacity: .2; } 50% { border-width: 3px; opacity: 1; } }
@keyframes of-beacon { 0%, 100% { transform: translate(-50%,-50%) scale(.66); opacity: .6; } 55% { transform: translate(-50%,-50%) scale(1); opacity: 0; } }
@keyframes of-inflow { 0% { transform: translateY(0); opacity: 0; } 16% { opacity: .95; } 100% { transform: translateY(var(--d, 200px)); opacity: 0; } }
@keyframes of-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.stage { position: absolute; left: var(--ax); top: var(--ay); transform: translate(-50%, -50%) scale(var(--k)); }
.ring { position: absolute; left: 50%; top: 50%; border: 1px solid var(--of-ring); border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none; animation-fill-mode: backwards; }
.ring.s { border-color: var(--of-ring-strong); }
.orbit { position: absolute; left: 50%; top: 50%; width: 0; height: 0; }
.orbit-item { position: absolute; left: 0; top: 0; }
.orbit-label { width: 0; height: 0; position: relative; }
.orbit-pin { position: absolute; left: 0; top: 0; transform: translate(-50%, -50%); }
.fx-wrap { transition: transform 520ms cubic-bezier(.22,.9,.24,1); will-change: transform; }
.tile { will-change: filter; background: var(--of-tile-bg); border: 1px solid var(--of-tile-bd); color: var(--of-tile-fg);
  padding: 13px 20px; font-family: var(--font-body, "General Sans", system-ui, sans-serif);
  font-size: 15px; font-weight: 500; letter-spacing: -.01em; white-space: nowrap;
  backdrop-filter: blur(2px);
  transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 220ms ease, filter 240ms ease, opacity 240ms ease; }
.tile:hover, .tile.near { background: var(--of-near-bg); border-color: var(--of-near-bd); color: var(--of-near-fg);
  box-shadow: 0 10px 26px rgba(14,12,28,.14); }
.orbit-tile { animation: of-bob 11s ease-in-out infinite; }
.tile.logo { height: 38px; padding: 0 16px; display: flex; align-items: center; justify-content: center; }
.tile.logo image-slot { width: 80px; height: 24px; display: block; }
.tile.logo img { width: var(--lw, 70px); height: var(--lh, 20px); object-fit: contain; display: block; }
:host([data-hot][data-hp="fast"]) .ring { animation-name: of-seq-strong !important; animation-duration: 3.4s !important; }
:host([data-hot][data-hp="double"]) .ring { animation-name: of-seq-double !important; animation-duration: 5s !important; }
:host([data-hot][data-hp="flash"]) .ring { animation-name: of-flash !important; animation-duration: 1.9s !important; animation-delay: 0s !important; }
:host([data-hot][data-hp="inward"]) .ring { animation-name: of-seq-strong !important; animation-duration: 6s !important; animation-direction: reverse !important; }
.ladder { position: absolute; inset: 0; pointer-events: none; transition: opacity 620ms cubic-bezier(.3,.7,.3,1); }
:host([data-hot][data-hp="cross"]) .ladder { transition-duration: var(--of-fade-in, 120ms); }
.rwrap { position: absolute; inset: 0; pointer-events: none; }
@keyframes of-beat { from { opacity: .999; } to { opacity: 1; } }
.beat { position: absolute; left: 0; top: 0; width: 0; height: 0; animation: of-beat .12s linear infinite; pointer-events: none; }
.ladder.base { opacity: 1; }
.ladder.hot { opacity: 0; }
:host([data-hot][data-hp="cross"]) .ladder.base { opacity: 0; }
:host([data-hot][data-hp="cross"]) .ladder.hot { opacity: 1; }
.sweep, .beacon { position: absolute; left: 50%; top: 50%; border-radius: 50%; transform: translate(-50%,-50%); pointer-events: none; }
.sweep > i { display: block; width: 100%; height: 100%; border-radius: 50%;
  background: conic-gradient(from 0deg, var(--of-sweep, rgba(255,255,255,.40)), rgba(255,255,255,0) 82deg);
  -webkit-mask-image: radial-gradient(circle, transparent 19%, #000 20%); mask-image: radial-gradient(circle, transparent 19%, #000 20%);
  animation: of-spin 7s linear infinite; }
.beacon { background: radial-gradient(circle, var(--of-beacon, rgba(255,255,255,.5)), rgba(255,255,255,0) 70%); animation: of-beacon 3.6s ease-out infinite; }
.spokes { position: absolute; left: 50%; top: 50%; width: 0; height: 0; pointer-events: none; }
.spoke { position: absolute; left: 0; top: 0; }
.spoke > i { display: block; width: 2px; height: 58px; margin-left: -1px;
  background: linear-gradient(to bottom, rgba(255,255,255,0), var(--of-spoke, rgba(255,255,255,.92)));
  animation: of-inflow 3.6s cubic-bezier(.35,0,.5,1) infinite; }
.tile.logo.ink img, .tile.logo.hoverc img { filter: grayscale(1) brightness(.3); }
.tile.logo.hoverc img { transition: filter 280ms ease; }
.tile.logo.hoverc:hover img, .tile.logo.hoverc.near img { filter: none; }
.tile.logo.knock img { filter: brightness(0) invert(1); }
.tile.logo .ltext { color: #FFFFFF; font-size: 14px; font-weight: 500; letter-spacing: -.01em; white-space: nowrap; }
.orbit:has(.tile:hover), .orbit:has(.tile:hover) .orbit-label, .orbit:has(.tile:hover) .orbit-tile { animation-play-state: paused; }
.center { position: absolute; left: var(--ax); top: var(--ay); transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; pointer-events: none; }
.center ::slotted(*) { pointer-events: auto; }
@media (prefers-reduced-motion: reduce) {
  .orbit, .orbit-label, .orbit-tile, .ring, .fx-wrap, .sweep > i, .beacon, .spoke > i { animation: none !important; transition: none !important; }
  .beacon, .spoke > i { display: none; }
  .ring { opacity: .35; }
}`;

  var TONES = {
    fandango: { ring: 'rgba(255,255,255,0.30)', ringStrong: 'rgba(255,255,255,0.52)', tileBg: 'rgba(255,255,255,0.08)', tileBd: 'rgba(255,255,255,0.42)', tileFg: '#FFFFFF', nearBg: '#FFFFFF', nearBd: '#FFFFFF', nearFg: 'var(--auto-accent, #C531A4)' },
    light: { ring: 'rgba(197,49,164,0.28)', ringStrong: 'rgba(197,49,164,0.52)', tileBg: '#FFFFFF', tileBd: 'rgba(14,12,28,0.12)', tileFg: 'rgba(14,12,28,0.9)', nearBg: '#FFFFFF', nearBd: '#C531A4', nearFg: '#C531A4' },
    dark: { ring: 'rgba(255,255,255,0.16)', ringStrong: 'rgba(255,255,255,0.36)', tileBg: 'rgba(255,255,255,0.06)', tileBd: 'rgba(255,255,255,0.26)', tileFg: 'rgba(255,255,255,0.92)', nearBg: '#FFFFFF', nearBd: '#FFFFFF', nearFg: '#4A1240' }
  };

  var LOGO_CAP = {
    stripe: [70, 36], shopify: [70, 36], outlook: [24, 23], gmail: [62, 16],
    qonto: [62, 17], mollie: [62, 17], sumup: [62, 18], pennylane: [70, 12],
    lexware: [58, 9], buchhaltungsbutler: [128, 33], bbuchen: [66, 25]
  };

  var KNOCK_TEXT = { outlook: 1 };

  var DEFAULT_TILES = ['Stripe', 'Amazon', 'Qonto', 'Mollie', 'SumUp', 'easybill', 'Ablefy', 'PayPal', 'Shopify', 'lexoffice', 'Stripe Connect'];

  // React-Mounts liefern kebab-Attribute kleingeschrieben ohne Bindestrich (r-in -> rin)
  function attr(el, name) {
    var alts = [name, name.replace(/-/g, ''), name.replace(/-(.)/g, function (m, c) { return c.toUpperCase(); })];
    for (var i = 0; i < alts.length; i++) {
      var raw = el.getAttribute(alts[i]);
      if (raw !== null) return raw;
    }
    return null;
  }

  function num(el, name, dflt) {
    var alts = [name, name.replace(/-/g, ''), name.replace(/-(.)/g, function (m, c) { return c.toUpperCase(); })];
    for (var i = 0; i < alts.length; i++) {
      var raw = el.getAttribute(alts[i]);
      if (raw !== null) {
        var v = parseFloat(raw);
        if (!isNaN(v)) return v;
      }
    }
    return dflt;
  }

  var LIVE_ATTRS = ['rest-dur', 'hot-dur', 'rest-peak', 'hot-peak', 'outer-fade', 'fade-in-ms', 'blur-px', 'blur-op',
    'restdur', 'hotdur', 'restpeak', 'hotpeak', 'outerfade', 'fadeinms', 'blurpx', 'blurop', 'speed', 'repeat'];

  class OrbitField extends HTMLElement {
    static get observedAttributes() { return LIVE_ATTRS; }

    attributeChangedCallback() {
      if (!this._mounted) return;
      clearTimeout(this._reRender);
      this._reRender = setTimeout(function (el) {
        return function () {
          el.render();
          el.wire();
        };
      }(this), 40);
    }

    connectedCallback() {
      if (this._mounted) {
        if (this._restartHoverBind) this._restartHoverBind();
        return;
      }
      this._mounted = true;
      this.attachShadow({ mode: 'open' });
      this.render();
      this.wire();
    }

    disconnectedCallback() {
      if (this._ro) this._ro.disconnect();
      if (this._onResize) window.removeEventListener('resize', this._onResize);
    }

    render() {
      var tone = TONES[this.getAttribute('tone')] || TONES.fandango;
      var tiles = (this.getAttribute('tiles') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      if (!tiles.length) tiles = DEFAULT_TILES.slice();
      var reps = num(this, 'repeat', 1);
      if (reps > 1 && tiles.length) {
        var base = tiles.slice(), out = [];
        for (var r = 0; r < reps; r++) {
          var off = Math.round(base.length * r / reps);
          out = out.concat(base.slice(off).concat(base.slice(0, off)));
        }
        tiles = out;
      }
      var innerCount = num(this, 'inner', Math.min(5, Math.max(0, tiles.length - 4)));
      var rIn = num(this, 'r-in', 310), rOut = num(this, 'r-out', 500);
      var rings = num(this, 'rings', 7), rBase = num(this, 'ring-base', 200), rStep = num(this, 'ring-step', 140);
      var sw = num(this, 'stage-w', 1200), sh = num(this, 'stage-h', 1090);
      var speed = num(this, 'speed', 1);
      var radial = this.getAttribute('radial') === '1';
      var restDur = num(this, 'rest-dur', 7.5);
      var hotDur = num(this, 'hot-dur', 3.5);
      var restPeak = num(this, 'rest-peak', 0.75);
      var hotPeak = num(this, 'hot-peak', 0.95);
      var restBase = Math.min(restPeak * 0.34, restPeak);
      var hotBase = Math.min(hotPeak * 0.24, hotPeak);
      var outerFade = num(this, 'outer-fade', 0.35);
      var fadeInMs = num(this, 'fade-in-ms', 640);
      var mode = attr(this, 'ring-mode') || 'pulse';
      var logoTone = attr(this, 'logo-tone') || 'color';
      var logoCls = logoTone === 'ink' ? ' ink' : logoTone === 'hover' ? ' hoverc' : logoTone === 'white' ? ' knock' : '';
      var logos = attr(this, 'logos') === '1';
      var dir = attr(this, 'logo-dir');
      var prefix = attr(this, 'slot-prefix') || 'of';
      var content = function (label) {
        if (!logos) return label;
        var slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '');
        if (dir) {
          if (logoTone === 'white' && KNOCK_TEXT[slug]) return '<span class="ltext">' + label + '</span>';
          // Im gebündelten Offline-Export liegen die Logos als Blob-URLs bereit
          var res = (window.__resources || {})['logo-' + slug];
          var cap = LOGO_CAP[slug];
          var st = cap ? ' style="--lw:' + cap[0] + 'px;--lh:' + cap[1] + 'px"' : '';
          return '<img src="' + (res || (dir + '/' + slug + '-logo.svg')) + '" alt="' + label + '"' + st + ' loading="eager">';
        }
        return '<image-slot id="' + prefix + '-' + slug + '" shape="rect" fit="contain" placeholder="' + label + '"></image-slot>';
      };

      if (logos) {
        tone = logoTone === 'white'
          ? Object.assign({}, tone, { tileBg: 'rgba(255,255,255,0.06)', tileBd: 'rgba(255,255,255,0.45)', nearBg: 'rgba(255,255,255,0.16)', nearBd: '#FFFFFF' })
          : Object.assign({}, tone, { tileBg: '#FFFFFF', tileBd: 'rgba(14,12,28,0.10)', tileFg: 'rgba(14,12,28,0.75)', nearBg: '#FFFFFF', nearBd: tone.nearBd, nearFg: '#C531A4' });
      }
      var kf = '@keyframes of-seq{0%,100%{opacity:' + restBase.toFixed(3) + '}12%{opacity:' + restPeak.toFixed(3) + '}42%{opacity:' + restBase.toFixed(3) + '}}' +
        '@keyframes of-seq-strong{0%,100%{opacity:' + hotBase.toFixed(3) + '}12%{opacity:' + hotPeak.toFixed(3) + '}42%{opacity:' + hotBase.toFixed(3) + '}}' +
        '@keyframes of-seq-out{0%,100%{opacity:0}4%{opacity:0}22%{opacity:' + (restPeak * 0.9).toFixed(3) + '}46%{opacity:' + (restPeak * 0.25).toFixed(3) + '}68%{opacity:0}}';
      var css = kf + ':host{--of-fade-in:' + fadeInMs + 'ms;--of-ring:' + tone.ring + ';--of-ring-strong:' + tone.ringStrong +
        ';--of-tile-bg:' + tone.tileBg + ';--of-tile-bd:' + tone.tileBd + ';--of-tile-fg:' + tone.tileFg +
        ';--of-near-bg:' + tone.nearBg + ';--of-near-bd:' + tone.nearBd + ';--of-near-fg:' + tone.nearFg + '}' + CSS;

      var ax = this.getAttribute('ax'), ay = this.getAttribute('ay');
      if (ax) this.style.setProperty('--ax', ax);
      if (ay) this.style.setProperty('--ay', ay);

      var snap = function (r) {
        var best = r, bestD = Infinity;
        for (var i = 0; i < rings; i++) {
          var rr = (rBase + i * rStep) / 2;
          if (rr - r > 12) continue;
          var d = Math.abs(rr - r);
          if (d < bestD) { bestD = d; best = rr; }
        }
        return best;
      };
      rIn = snap(rIn); rOut = snap(rOut);

      var outerD = rBase + (rings - 1) * rStep;
      var ring = function (d, extra) { return '<div class="ring" style="width:' + d + 'px;height:' + d + 'px;' + extra + '"></div>'; };
      var ladder = function (extra) {
        var out = '';
        for (var i = 0; i < rings; i++) out += ring(rBase + i * rStep, typeof extra === 'function' ? extra(i) : extra);
        return out;
      };

      var html = '<div class="stage" style="width:' + sw + 'px;height:' + sh + 'px">';
      if (mode === 'sonar') {
        for (var i = 0; i < rings; i++) {
          html += ring(outerD, '--s0:' + (rBase / outerD).toFixed(3) + ';border-color:var(--of-ring-strong);animation:of-sonar 5.6s linear ' + (-(5.6 / rings) * i).toFixed(2) + 's infinite');
        }
      } else if (mode === 'sweep') {
        html += ladder('opacity:.34');
        html += '<div class="sweep" style="width:' + outerD + 'px;height:' + outerD + 'px"><i></i></div>';
      } else if (mode === 'sequence') {
        var FADE = [outerFade, outerFade * 0.7, outerFade * 0.47];
        var seqRing = function (i, hot) {
          var last = i === rings - 1;
          var name = last ? 'of-seq-out' : (hot ? 'of-seq-strong' : 'of-seq');
          var dur = hot ? hotDur : restDur;
          var step = (hot ? hotDur : restDur) * 0.058;
          var fadeIdx = i - (rings - FADE.length);
          var pk = fadeIdx >= 0 ? FADE[fadeIdx] : 1;
          return '<div class="rwrap" style="opacity:' + pk + '"><div class="ring" style="width:' + (rBase + i * rStep) + 'px;height:' + (rBase + i * rStep) +
            'px;border-color:var(--of-ring-strong);animation:' + name + ' ' + dur + 's ease-in-out ' + (step * i).toFixed(2) + 's infinite backwards"></div></div>';
        };
        html += '<div class="ladder base">';
        for (var i = 0; i < rings; i++) html += seqRing(i, false);
        html += '</div>';
        if (attr(this, 'hover-pulse') === 'cross') {
          html += '<div class="ladder hot">';
          for (var i = 0; i < rings; i++) html += seqRing(i, true);
          html += '</div>';
        }
      } else if (mode === 'stroke') {
        html += ladder(function (i) { return 'border-color:var(--of-ring-strong);animation:of-stroke 5s ease-in-out ' + (0.2 * i).toFixed(2) + 's infinite backwards'; });
      } else if (mode === 'dash') {
        html += ladder(function (i) { return 'border-style:dashed;border-color:var(--of-ring-strong);opacity:' + (0.34 + 0.05 * i).toFixed(2) + ';animation:' + (i % 2 ? 'of-spin' : 'of-spin-rev') + ' ' + (70 + i * 26) + 's linear infinite'; });
      } else if (mode === 'inflow') {
        html += ladder('opacity:.3');
        var R = outerD / 2, travel = Math.max(80, R - rBase / 2 - 46), N = 14;
        for (var i = 0; i < N; i++) {
          html += '<div class="spoke" style="transform:rotate(' + (360 / N * i) + 'deg) translateY(' + (-R) + 'px)"><i style="--d:' + travel.toFixed(0) + 'px;animation-delay:' + (-3.6 / N * i * 2).toFixed(2) + 's"></i></div>';
        }
      } else if (mode === 'beacon') {
        html += ladder('opacity:.28');
        html += ring(rBase, 'border-color:var(--of-ring-strong);animation:of-ring 4s ease-in-out infinite');
        html += '<div class="beacon" style="width:' + (rBase * 1.7).toFixed(0) + 'px;height:' + (rBase * 1.7).toFixed(0) + 'px"></div>';
      } else {
        html += ladder(function (i) {
          var strong = i >= Math.floor(rings / 2);
          return (strong ? 'border-color:var(--of-ring-strong);' : '') + 'animation:' + (strong ? 'of-ring' : 'of-ring-faint') + ' 13s ease-in-out ' + (-1.1 * i).toFixed(1) + 's infinite';
        });
      }

      var orbitCount = num(this, 'orbits', 2);
      var groups;
      var MIN_RING_GAP = 150;
      if (orbitCount > 2) {
        var maxOrbits = Math.max(1, Math.floor((rOut - rIn) / MIN_RING_GAP) + 1);
        if (orbitCount > maxOrbits) orbitCount = maxOrbits;
        var radii = [];
        for (var oi = 0; oi < orbitCount; oi++) radii.push(snap(rIn + MIN_RING_GAP * oi));
        var TILE_SLOT = 182;
        var caps = radii.map(function (r) { return Math.max(1, Math.floor(2 * Math.PI * r / TILE_SLOT)); });
        var capSum = caps.reduce(function (a, b) { return a + b; }, 0);
        if (tiles.length > capSum) tiles = tiles.slice(0, capSum);
        var sum = radii.reduce(function (a, b) { return a + b; }, 0);
        var counts = radii.map(function (r, i2) { return Math.min(caps[i2], Math.max(1, Math.round(tiles.length * r / sum))); });
        var drift = tiles.length - counts.reduce(function (a, b) { return a + b; }, 0);
        for (var d = 0; d < Math.abs(drift) * 4 && drift !== 0; d++) {
          var k = drift > 0 ? counts.length - 1 - (d % counts.length) : d % counts.length;
          if (drift > 0 && counts[k] < caps[k]) { counts[k]++; drift--; }
          else if (drift < 0 && counts[k] > 0) { counts[k]--; drift++; }
        }
        groups = [];
        var cur = 0;
        radii.forEach(function (r, oi) {
          var n = Math.max(0, counts[oi]);
          groups.push({
            list: tiles.slice(cur, cur + n), r: r,
            dur: (200 + 30 * oi) * speed,
            dir: oi % 2 ? 'of-spin-rev' : 'of-spin',
            back: oi % 2 ? 'of-spin' : 'of-spin-rev'
          });
          cur += n;
        });
      } else {
        if (rOut - rIn < MIN_RING_GAP) rIn = snap(rOut - MIN_RING_GAP);
        groups = [
          { list: tiles.slice(0, innerCount), r: rIn, dur: 210 * speed, dir: 'of-spin', back: 'of-spin-rev' },
          { list: tiles.slice(innerCount), r: rOut, dur: 300 * speed, dir: 'of-spin-rev', back: 'of-spin' }
        ];
      }
      groups.forEach(function (g, gi) {
        if (!g.list.length) return;
        var start = gi === 0 ? 15 : 0;
        html += '<div class="orbit orbit-' + gi + '" style="animation:' + g.dir + ' ' + g.dur + 's linear infinite">';
        g.list.forEach(function (label, i) {
          var a = start + (360 / g.list.length) * i + gi * 11;
          var t = 'rotate(' + a + 'deg) translate(' + g.r + 'px)' + (radial ? '' : ' rotate(' + (-a) + 'deg)');
          html += '<div class="orbit-item" style="transform:' + t + '">' +
            '<div class="orbit-label"' + (radial ? '' : ' style="animation:' + g.back + ' ' + g.dur + 's linear infinite"') + '>' +
            '<div class="orbit-pin"><div class="fx-wrap"><div class="tile' + (logos ? ' logo' + logoCls : '') + ' orbit-tile" style="animation-delay:' + (i * 0.8).toFixed(1) + 's">' +
            content(label) + '</div></div></div></div></div>';
        });
        html += '</div>';
      });
      if (attr(this, 'blur-over')) html += '<i class="beat"></i>';
      html += '</div><div class="center"><slot></slot></div>';

      this.shadowRoot.innerHTML = '<style>' + css + '</style>' + html;
      this._stageW = sw;
    }

    wire() {
      var host = this, fixed = parseFloat(this.getAttribute('scale'));
      var fit = function () {
        if (!isNaN(fixed)) { host.style.setProperty('--k', fixed); return; }
        var w = host.clientWidth;
        if (!w) return;
        host.style.setProperty('--k', Math.min(1, w / host._stageW).toFixed(3));
      };
      fit();
      this._onResize = fit;
      if (window.ResizeObserver) { this._ro = new ResizeObserver(fit); this._ro.observe(this); }
      window.addEventListener('resize', fit);
      window.addEventListener('load', fit);

      var slot = this.shadowRoot.querySelector('slot');
      var hoverPulse = attr(this, 'hover-pulse');
      if (hoverPulse) this.setAttribute('data-hp', hoverPulse);
      if (slot && hoverPulse) {
        var emit = function () {
          if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
          var ladder = host.shadowRoot.querySelector('.ladder.hot');
          if (!ladder) return;
          Array.prototype.slice.call(ladder.querySelectorAll('.ring')).forEach(function (r) {
            r.getAnimations().forEach(function (a) { a.currentTime = 0; a.play(); });
          });
        };
        var hot = function (on) {
          if (on) { host.setAttribute('data-hot', ''); emit(); }
          else host.removeAttribute('data-hot');
        };
        var bindSlot = function () {
          slot.assignedElements().forEach(function (el) {
            if (el._ofBound) return;
            el._ofBound = true;
            ['pointerenter', 'mouseenter', 'focusin'].forEach(function (ev) { el.addEventListener(ev, function () { hot(true); }); });
            ['pointerleave', 'mouseleave', 'focusout'].forEach(function (ev) { el.addEventListener(ev, function () { hot(false); }); });
          });
        };
        bindSlot();
        slot.addEventListener('slotchange', bindSlot);
        this._restartHoverBind = bindSlot;
      }

      var blurSel = attr(this, 'blur-over');
      if (blurSel) {
        var scope = this.closest('header') || document;
        var zoneEls = [];
        var lineRects = function () {
          // Beim ersten Aufbau steht die Copy noch nicht im Baum — Zonen erst
          // beim Tick suchen und danach nur nachziehen, wenn sie fehlen.
          if (!zoneEls.length || !zoneEls[0].isConnected) {
            zoneEls = Array.prototype.slice.call((host.closest('header') || scope || document).querySelectorAll(blurSel));
          }
          var out = [];
          zoneEls.forEach(function (el) {
            var rng = document.createRange();
            rng.selectNodeContents(el);
            Array.prototype.slice.call(rng.getClientRects()).forEach(function (r) {
              if (r.width > 4 && r.height > 4) out.push(r);
            });
          });
          return out;
        };
        host._blurCheck = function () {
          var zones = lineRects();
          Array.prototype.slice.call(host.shadowRoot.querySelectorAll('.tile')).forEach(function (t) {
            var b = t.getBoundingClientRect();
            var over = zones.some(function (z) {
              return b.right > z.left - 10 && b.left < z.right + 10 && b.bottom > z.top - 6 && b.top < z.bottom + 6;
            });
            var want = over ? 'blur(' + num(host, 'blur-px', 5) + 'px)' : '';
            if (t._ofBlur !== want) { t._ofBlur = want; t.style.filter = want; t.style.opacity = over ? String(num(host, 'blur-op', 0.72)) : ''; }
          });
        };
        // Drei Antriebe, weil je nach Kontext einzelne ausfallen: eine schnelle
        // CSS-Animation als Herzschlag (läuft, solange die Ringe laufen),
        // dazu Intervall und rAF.
        var beat = this.shadowRoot.querySelector('.beat');
        if (beat) beat.addEventListener('animationiteration', function () {
          if (host.isConnected && host._blurCheck) host._blurCheck();
        });
        if (host._blurTick) clearInterval(host._blurTick);
        host._blurTick = setInterval(function () {
          if (host.isConnected && host._blurCheck) host._blurCheck();
        }, 90);
        if (!host._blurRaf) {
          host._blurRaf = true;
          var last = 0;
          var loop = function (ts) {
            requestAnimationFrame(loop);
            if (ts - last < 90) return;
            last = ts;
            if (host.isConnected && host._blurCheck) host._blurCheck();
          };
          requestAnimationFrame(loop);
        }
      }

      var wraps = Array.prototype.slice.call(this.shadowRoot.querySelectorAll('.fx-wrap'));
      if (!wraps.length) return;

      var clear = function () {
        wraps.forEach(function (w) {
          w.style.transform = '';
          var t = w.querySelector('.tile');
          if (t) t.classList.remove('near');
        });
      };

      var push = function (e) {
        var k = parseFloat(getComputedStyle(host).getPropertyValue('--k')) || 1;
        var wide = host.clientWidth > 980;
        var R = (wide ? 320 : 220) * k;
        var PUSH = wide ? -36 : -14;
        var nearest = null, nearestD = Infinity;
        wraps.forEach(function (w) {
          var b = w.getBoundingClientRect();
          var dx = e.clientX - (b.left + b.width / 2);
          var dy = e.clientY - (b.top + b.height / 2);
          var d = Math.hypot(dx, dy) || 0.001;
          if (d < nearestD) { nearestD = d; nearest = w; }
          if (d < R) {
            var f = Math.pow(1 - d / R, 1.6);
            w.style.transform = 'translate(' + (dx / d * PUSH * f).toFixed(2) + 'px,' + (dy / d * PUSH * f).toFixed(2) + 'px)';
          } else { w.style.transform = ''; }
        });
        wraps.forEach(function (w) {
          var t = w.querySelector('.tile');
          if (t) t.classList.toggle('near', w === nearest && nearestD < R * 0.45);
        });
      };

      this.addEventListener('pointermove', push);
      this.addEventListener('pointerleave', clear);
      var timer;
      this.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse') return;
        push(e);
        clearTimeout(timer);
        timer = setTimeout(clear, 700);
      });
    }
  }

  if (!window.customElements.get('orbit-field')) window.customElements.define('orbit-field', OrbitField);
})();
