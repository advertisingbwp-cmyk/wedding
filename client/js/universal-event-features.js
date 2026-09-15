(() => {
  'use strict';
  if (window.__RIWAAYAT_UNIVERSAL_EVENT_FEATURES_V2__) return;
  window.__RIWAAYAT_UNIVERSAL_EVENT_FEATURES_V2__ = true;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const PRESETS = {
    'royal-mandap':      { gate:'royal',    accent:'#c9a24d', bg:'#f5eddf', ink:'#3e1712', soft:'#ead8bd', radius:'4px',  display:'Cinzel', body:'Cormorant Garamond', density:24, mode:'grand' },
    'marigold-bloom':    { gate:'marigold',  accent:'#d78f1f', bg:'#fff7e8', ink:'#503014', soft:'#f1d294', radius:'28px', display:'Cormorant Garamond', body:'Plus Jakarta Sans', density:32, mode:'floral' },
    'mehendi-garden':    { gate:'garden',    accent:'#507b59', bg:'#f1f5ed', ink:'#1f3425', soft:'#cadbc5', radius:'24px', display:'Cormorant Garamond', body:'Plus Jakarta Sans', density:24, mode:'botanical' },
    'sangeet-afterglow': { gate:'afterglow', accent:'#cc5d9b', bg:'#171125', ink:'#f8eafb', soft:'#583b63', radius:'18px', display:'Cinzel', body:'Plus Jakarta Sans', density:38, mode:'nightlife' },
    'palace-romance':    { gate:'palace',   accent:'#a77a43', bg:'#f3e9dc', ink:'#40251a', soft:'#d9c0a0', radius:'10px', display:'Cormorant Garamond', body:'Plus Jakarta Sans', density:18, mode:'palace' },
    'south-heritage':    { gate:'mandapam', accent:'#b88933', bg:'#fff8e9', ink:'#4c2712', soft:'#e9cf91', radius:'2px',  display:'Cinzel', body:'Cormorant Garamond', density:22, mode:'heritage' },
    'blush-vows':        { gate:'blush',    accent:'#ba7886', bg:'#fff3f5', ink:'#4c2730', soft:'#e9c5cb', radius:'30px', display:'Great Vibes', body:'Plus Jakarta Sans', density:28, mode:'romantic' },
    'minimal-ivory':     { gate:'minimal',  accent:'#9c8155', bg:'#f7f5ef', ink:'#272521', soft:'#ddd5c7', radius:'0px',  display:'Cinzel', body:'Plus Jakarta Sans', density:12, mode:'editorial' },
    'noor-nikah':        { gate:'noor',     accent:'#c7aa66', bg:'#f4f0e8', ink:'#243247', soft:'#d8c79c', radius:'8px',  display:'Cormorant Garamond', body:'Plus Jakarta Sans', density:18, mode:'islamic' },
    'emerald-qasr':      { gate:'qasr',     accent:'#8cad7b', bg:'#eef5f0', ink:'#12342a', soft:'#bfd4c7', radius:'16px', display:'Cinzel', body:'Plus Jakarta Sans', density:20, mode:'geometric' },
    'ivory-dua':         { gate:'dua',      accent:'#b59a70', bg:'#fbfaf6', ink:'#373126', soft:'#ded6c5', radius:'12px', display:'Cormorant Garamond', body:'Plus Jakarta Sans', density:12, mode:'paper' },
    'zafraan-evening':   { gate:'zafraan',  accent:'#c98226', bg:'#fbf0df', ink:'#4a2810', soft:'#e4c49a', radius:'20px', display:'Cinzel', body:'Plus Jakarta Sans', density:26, mode:'saffron' },
    'resham-royale':     { gate:'resham',   accent:'#a8636c', bg:'#f6eceb', ink:'#3e2028', soft:'#dcc0c2', radius:'14px', display:'Cormorant Garamond', body:'Plus Jakarta Sans', density:18, mode:'silk' },
    'midnight-walima':   { gate:'midnight', accent:'#8ca8ce', bg:'#090e1c', ink:'#eef3ff', soft:'#263755', radius:'14px', display:'Cinzel', body:'Plus Jakarta Sans', density:30, mode:'starlit' },
    'pastel-party':      { gate:'pastel',   accent:'#d092a8', bg:'#fff8fc', ink:'#442d3b', soft:'#ecd2df', radius:'32px', display:'Great Vibes', body:'Plus Jakarta Sans', density:34, mode:'pastel' },
    'little-star':       { gate:'star',     accent:'#d9b657', bg:'#eef4ff', ink:'#18305a', soft:'#cbd8ee', radius:'26px', display:'Cormorant Garamond', body:'Plus Jakarta Sans', density:38, mode:'storybook' },
    'elegant-soiree':    { gate:'soiree',   accent:'#b79a73', bg:'#f5f1e9', ink:'#29241d', soft:'#d9cfbe', radius:'6px', display:'Cinzel', body:'Plus Jakarta Sans', density:14, mode:'blacktie' },
    'neon-celebration':  { gate:'neon',     accent:'#57e7ff', bg:'#070b13', ink:'#ebfcff', soft:'#1d3952', radius:'18px', display:'Cinzel', body:'Plus Jakarta Sans', density:44, mode:'neon' }
  };

  let initialized = false;
  let music = null;
  let musicTimer = null;
  let musicOn = false;

  function getSlug() {
    const cls = Array.from(document.body?.classList || []);
    const hit = cls.find((v) => v.indexOf('template-') === 0);
    return hit ? hit.slice(9).toLowerCase() : null;
  }

  function getPreset() {
    return PRESETS[getSlug()] || PRESETS['royal-mandap'];
  }

  function asset(name) {
    const key = getSlug();
    return key ? `/assets/templates/${key}/${name}.webp` : '';
  }

  function installStyles() {
    if ($('#riwaayat-universal-style-v2')) return;
    const s = document.createElement('style');
    s.id = 'riwaayat-universal-style-v2';
    s.textContent = `
      body[class*="template-"]{
        --rv-accent: #c9a24d;
        --rv-bg: #f7f3ea;
        --rv-ink: #2d241b;
        --rv-soft: #ddd0bd;
        --rv-radius: 18px;
        --rv-display: Cinzel;
        --rv-body: "Plus Jakarta Sans";
        background: var(--rv-bg) !important;
        color: var(--rv-ink) !important;
      }
      body[class*="template-"] #dynamic-sections{position:relative;isolation:isolate}
      body[class*="template-"] #dynamic-sections::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:-1;opacity:.11;background-image:radial-gradient(circle at 15% 10%,var(--rv-accent) 0 1px,transparent 2px),radial-gradient(circle at 78% 64%,var(--rv-accent) 0 1px,transparent 2px);background-size:38px 38px,54px 54px}
      body[class*="template-"] .section-title{font-family:var(--rv-display),var(--font-display),serif !important;color:var(--rv-ink) !important;letter-spacing:.015em}
      body[class*="template-"] .section-subtitle{color:var(--rv-accent) !important;letter-spacing:.18em}
      body[class*="template-"] .event-section-wrap{position:relative;overflow:hidden;background:color-mix(in srgb,var(--rv-bg),white 28%) !important;border-color:color-mix(in srgb,var(--rv-accent),transparent 76%) !important}
      body[class*="template-"] .glass-panel, body[class*="template-"] .func-card{border-radius:var(--rv-radius) !important;border-color:color-mix(in srgb,var(--rv-accent),transparent 68%) !important;background:color-mix(in srgb,var(--rv-bg),white 62%) !important;box-shadow:0 18px 45px color-mix(in srgb,var(--rv-ink),transparent 88%) !important}
      body[class*="template-"] .func-card{transition:transform .35s ease,box-shadow .35s ease}
      body[class*="template-"] .func-card:hover{transform:translateY(-6px);box-shadow:0 24px 60px color-mix(in srgb,var(--rv-ink),transparent 82%) !important}
      body[class*="template-"] .func-img{border-radius:calc(var(--rv-radius) - 2px) !important}
      body[class*="template-"] .btn-gold{background:var(--rv-accent) !important;border-color:var(--rv-accent) !important;color:#fff !important}
      body[class*="template-"] .btn-outline{border-color:color-mix(in srgb,var(--rv-accent),transparent 30%) !important;color:var(--rv-ink) !important;background:transparent}

      /* 18 distinct layout identities */
      body.rv-mode-grand .hero-container{max-width:1180px !important;gap:64px !important}
      body.rv-mode-grand .hero-avatar-box{border:7px double var(--rv-accent) !important;border-radius:28px !important;box-shadow:0 25px 70px rgba(68,31,18,.22) !important}
      body.rv-mode-grand .event-section-wrap:nth-child(odd){background:linear-gradient(180deg,#f8f0e2,#efe1ca) !important}

      body.rv-mode-floral .hero-container{grid-template-columns:.9fr 1.1fr !important}
      body.rv-mode-floral .hero-avatar-box{border-radius:50% 50% 44% 56% / 56% 46% 54% 44% !important;border:10px solid #fff3d8 !important}
      body.rv-mode-floral .event-section-wrap::before{content:"✿";position:absolute;right:4%;top:18px;font-size:80px;color:color-mix(in srgb,var(--rv-accent),transparent 75%);transform:rotate(-15deg)}

      body.rv-mode-botanical .hero-container{grid-template-columns:1fr 1fr !important}
      body.rv-mode-botanical .hero-avatar-box{border-radius:46% 54% 48% 52% / 38% 42% 58% 62% !important;border:5px solid #dfeadb !important}
      body.rv-mode-botanical .event-section-wrap{background:linear-gradient(135deg,#f6f8f2,#e9f0e4) !important}

      body.rv-mode-nightlife{background:#110d1d !important;color:#f8ebfb !important}
      body.rv-mode-nightlife .event-section-wrap{background:linear-gradient(140deg,#1a1327,#100b19) !important}
      body.rv-mode-nightlife .section-title,body.rv-mode-nightlife .glass-panel h3,body.rv-mode-nightlife .glass-panel h4{color:#fff !important}
      body.rv-mode-nightlife .func-card{background:linear-gradient(135deg,#23172e,#171020) !important;box-shadow:0 0 0 1px rgba(204,93,155,.18),0 18px 50px rgba(0,0,0,.35) !important}

      body.rv-mode-palace .hero-container{max-width:1120px !important}
      body.rv-mode-palace .hero-avatar-box{border-radius:12px !important;border:5px solid #d9bd95 !important}
      body.rv-mode-palace .event-section-wrap:nth-child(even){background:linear-gradient(180deg,#f3e7d8,#ead8bf) !important}

      body.rv-mode-heritage .hero-full{min-height:96vh !important}
      body.rv-mode-heritage .hero-avatar-box{border-radius:2px !important;border:8px solid #fff8e6 !important;box-shadow:0 18px 0 -10px #b88933,0 28px 55px rgba(89,43,16,.2) !important}
      body.rv-mode-heritage .event-section-wrap{border-radius:0 !important}

      body.rv-mode-romantic .hero-avatar-box{border-radius:48% 52% 52% 48% / 42% 46% 54% 58% !important;border:10px solid #fff8fa !important}
      body.rv-mode-romantic .glass-panel{border-radius:28px !important;background:rgba(255,248,250,.85) !important}
      body.rv-mode-romantic .event-section-wrap::before{content:"♡";position:absolute;left:3%;bottom:4%;font-size:110px;color:rgba(186,120,134,.1)}

      body.rv-mode-editorial{background:#f7f5ef !important}
      body.rv-mode-editorial .hero-container{grid-template-columns:1.25fr .75fr !important;gap:80px !important}
      body.rv-mode-editorial .hero-avatar-box{border-radius:0 !important;border:1px solid #c9bda8 !important;box-shadow:14px 14px 0 #ebe5d8 !important}
      body.rv-mode-editorial .event-section-wrap{border-radius:0 !important;box-shadow:none !important}

      body.rv-mode-islamic .event-section-wrap::after, body.rv-mode-geometric .event-section-wrap::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.08;background-image:linear-gradient(45deg,transparent 46%,var(--rv-accent) 47%,var(--rv-accent) 53%,transparent 54%),linear-gradient(-45deg,transparent 46%,var(--rv-accent) 47%,var(--rv-accent) 53%,transparent 54%);background-size:34px 34px}
      body.rv-mode-islamic .hero-avatar-box{border:6px solid #fffaf0 !important;box-shadow:0 20px 60px rgba(35,47,62,.16) !important}
      body.rv-mode-geometric .glass-panel{border-radius:16px !important;box-shadow:0 0 0 1px rgba(140,173,123,.22),0 20px 50px rgba(18,52,42,.1) !important}

      body.rv-mode-paper .hero-avatar-box{border-radius:12px !important;border:1px solid #d9cfbd !important;box-shadow:8px 10px 0 #eee7dc !important}
      body.rv-mode-paper .glass-panel{background:rgba(255,254,249,.9) !important;border-radius:12px !important;box-shadow:0 9px 22px rgba(65,52,31,.08) !important}

      body.rv-mode-saffron .event-section-wrap:nth-child(odd){background:linear-gradient(135deg,#fff5e5,#f7e3c4) !important}
      body.rv-mode-saffron .hero-avatar-box{border-radius:24px !important;border:7px solid #fff2d8 !important;box-shadow:0 22px 52px rgba(116,62,22,.2) !important}

      body.rv-mode-silk .hero-avatar-box{border-radius:18px !important;border:7px solid #f3dedf !important}
      body.rv-mode-silk .event-section-wrap:nth-child(even){background:linear-gradient(120deg,#f9eeee,#f0dddd) !important}
      body.rv-mode-silk .glass-panel{background:linear-gradient(145deg,#fffafa,#f4e6e7) !important}

      body.rv-mode-starlit{background:#080d19 !important;color:#eef3ff !important}
      body.rv-mode-starlit .event-section-wrap{background:linear-gradient(165deg,#0d1425,#080d19) !important}
      body.rv-mode-starlit .section-title,body.rv-mode-starlit .glass-panel h3,body.rv-mode-starlit .glass-panel h4{color:#eef3ff !important}
      body.rv-mode-starlit .glass-panel{background:rgba(18,29,50,.82) !important;border-color:rgba(140,168,206,.35) !important}
      body.rv-mode-starlit .hero-avatar-box{border:2px solid #8ca8ce !important;box-shadow:0 0 45px rgba(116,152,207,.2) !important}

      body.rv-mode-pastel .hero-avatar-box{border-radius:32px !important;border:9px solid #fff !important;box-shadow:0 25px 55px rgba(155,91,123,.16) !important}
      body.rv-mode-pastel .func-card{border-radius:28px !important}

      body.rv-mode-storybook .hero-container{grid-template-columns:1fr !important;text-align:center !important}
      body.rv-mode-storybook .hero-avatar-box{max-width:520px !important;margin:0 auto !important;border-radius:34px !important;border:10px solid #fff !important;box-shadow:0 18px 0 #d6dfef,0 36px 60px rgba(27,48,90,.16) !important}
      body.rv-mode-storybook .event-section-wrap{background:linear-gradient(180deg,#f5f8ff,#eaf1ff) !important}

      body.rv-mode-blacktie{background:#f4f0e8 !important}
      body.rv-mode-blacktie .hero-container{grid-template-columns:.75fr 1.25fr !important}
      body.rv-mode-blacktie .hero-avatar-box{border-radius:0 !important;border:1px solid #b79a73 !important;box-shadow:18px 18px 0 #e4dccf !important}
      body.rv-mode-blacktie .func-card{border-radius:6px !important;background:linear-gradient(145deg,#faf7f0,#eee7dc) !important}

      body.rv-mode-neon{background:#05080e !important;color:#eaffff !important}
      body.rv-mode-neon .event-section-wrap{background:linear-gradient(135deg,#07101a,#04070d) !important;border-color:rgba(87,231,255,.26) !important}
      body.rv-mode-neon .section-title,body.rv-mode-neon .glass-panel h3,body.rv-mode-neon .glass-panel h4{color:#eaffff !important;text-shadow:0 0 18px rgba(87,231,255,.28)}
      body.rv-mode-neon .glass-panel{background:rgba(8,20,32,.86) !important;border-color:rgba(87,231,255,.3) !important;box-shadow:0 0 28px rgba(87,231,255,.08) !important}
      body.rv-mode-neon .hero-avatar-box{border:2px solid #57e7ff !important;box-shadow:0 0 35px rgba(87,231,255,.24),0 0 0 8px rgba(87,231,255,.05) !important}

      #riwaayat-gate{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:22px;background:radial-gradient(circle at 50% 20%,#2f4d42,#091914 60%,#030806);color:#fff;transition:opacity .85s,visibility .85s}
      #riwaayat-gate.open{opacity:0;visibility:hidden;pointer-events:none}
      .rv-gate{text-align:center;width:min(560px,94vw)}
      .rv-gate-kicker{font:700 10px/1.2 system-ui,sans-serif;letter-spacing:.3em;text-transform:uppercase;color:color-mix(in srgb,var(--rv-accent),white 35%);margin-bottom:24px}
      .rv-envelope{position:relative;margin:auto;width:min(450px,88vw);aspect-ratio:1.45;background:#eee3cf;box-shadow:0 30px 90px rgba(0,0,0,.45);cursor:pointer;transition:transform .45s,filter .4s}
      .rv-envelope:hover{transform:translateY(-5px) rotate(-1deg);filter:saturate(1.06)}
      .rv-back,.rv-front,.rv-flap{position:absolute;inset:0}.rv-back{background:linear-gradient(145deg,#f8f1e7,#d6c5a7)}.rv-front{background:linear-gradient(145deg,#eadfca,#c7b391);clip-path:polygon(0 28%,50% 72%,100% 28%,100% 100%,0 100%)}.rv-flap{background:linear-gradient(145deg,#fff7eb,#d7c5a6);clip-path:polygon(0 0,100% 0,50% 58%);transform-origin:50% 0;z-index:3;transition:transform .95s cubic-bezier(.75,0,.2,1)}.rv-envelope.open .rv-flap{transform:rotateX(180deg)}
      .rv-seal{position:absolute;left:50%;top:54%;z-index:5;transform:translate(-50%,-50%);width:94px;height:94px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,color-mix(in srgb,var(--rv-accent),white 28%),color-mix(in srgb,var(--rv-accent),black 45%) 58%,#331116);border:4px solid rgba(255,240,205,.72);box-shadow:inset 0 6px 12px rgba(255,255,255,.15),0 15px 30px rgba(0,0,0,.25);font:40px/1 "Great Vibes",cursive;color:#f4ddaa;transition:transform .55s,opacity .4s}.rv-envelope.open .rv-seal{transform:translate(-50%,-50%) scale(.2) rotate(160deg);opacity:0}
      .rv-open{margin-top:24px;border:1px solid color-mix(in srgb,var(--rv-accent),white 15%);border-radius:999px;padding:12px 20px;background:transparent;color:#f2ddb0;font:800 10px/1 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;cursor:pointer}.rv-hint{opacity:.58;font:14px/1.5 Georgia,serif;margin-top:11px}
      .rv-theme{position:fixed;right:18px;top:18px;z-index:1100;display:flex;gap:4px;padding:4px;border:1px solid rgba(255,255,255,.25);background:rgba(15,25,21,.5);backdrop-filter:blur(12px);border-radius:999px}.rv-theme button{border:0;border-radius:999px;background:transparent;color:#fff;padding:7px 10px;font:700 10px/1 system-ui,sans-serif;cursor:pointer}.rv-theme button.active{background:var(--rv-accent);color:#19140b}
      .rv-music{position:fixed;right:18px;bottom:18px;z-index:1100;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:10px 13px;background:rgba(14,24,20,.72);color:#fff;backdrop-filter:blur(10px);cursor:pointer;font:700 11px/1 system-ui,sans-serif}
      .rv-template-mark{position:fixed;left:18px;top:18px;z-index:1090;border:1px solid color-mix(in srgb,var(--rv-accent),transparent 45%);border-radius:999px;padding:7px 11px;background:rgba(255,255,255,.08);backdrop-filter:blur(10px);color:rgba(255,255,255,.88);font:700 9px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;pointer-events:none}
      .rv-petal-layer{position:fixed;inset:0;z-index:900;pointer-events:none;overflow:hidden}
      .rv-petal{position:absolute;top:-30px;width:10px;height:15px;border-radius:80% 20% 80% 20%;background:color-mix(in srgb,var(--rv-accent),white 35%);opacity:.58;filter:blur(.1px);animation:rvFall linear infinite}
      @keyframes rvFall{to{transform:translate3d(var(--dx),110vh,0) rotate(520deg)}}
      body[class*="template-"] .rv-calendar{font:700 10px/1 system-ui,sans-serif;letter-spacing:.06em;border:1px solid color-mix(in srgb,var(--rv-accent),transparent 35%);border-radius:999px;padding:8px 12px;background:transparent;color:var(--rv-ink);cursor:pointer;margin-top:12px}
      @media(max-width:700px){body[class*="template-"] .hero-container{grid-template-columns:1fr !important;gap:28px !important;text-align:center !important}body[class*="template-"] .hero-avatar-box{max-width:620px;margin:0 auto}.rv-theme{left:12px;right:12px;top:12px;justify-content:center}.rv-theme button{flex:1}.rv-music{bottom:12px;right:12px}.rv-template-mark{left:12px;top:58px}.rv-envelope{width:min(370px,90vw)}}
    `;
    document.head.appendChild(s);
  }

  function applyPreset() {
    const key = getSlug();
    if (!key) return false;
    const p = getPreset();
    document.body.classList.add(`rv-mode-${p.mode}`, `rv-gate-${p.gate}`);
    document.documentElement.style.setProperty('--rv-accent', p.accent);
    document.documentElement.style.setProperty('--rv-bg', p.bg);
    document.documentElement.style.setProperty('--rv-ink', p.ink);
    document.documentElement.style.setProperty('--rv-soft', p.soft);
    document.documentElement.style.setProperty('--rv-radius', p.radius);
    document.documentElement.style.setProperty('--rv-display', p.display);
    document.documentElement.style.setProperty('--rv-body', p.body);
    document.documentElement.dataset.rvTemplate = key;
    document.documentElement.dataset.rvDensity = String(p.density);
    if (!$('.rv-template-mark')) {
      const mark = document.createElement('div');
      mark.className = 'rv-template-mark';
      mark.textContent = key.replace(/-/g, ' ');
      document.body.appendChild(mark);
    }
    return true;
  }

  function addGate() {
    if ($('#riwaayat-gate')) return;
    const gate = document.createElement('div');
    gate.id = 'riwaayat-gate';
    gate.innerHTML = '<div class="rv-gate"><div class="rv-gate-kicker">An invitation awaits</div><div class="rv-envelope" tabindex="0" role="button" aria-label="Open invitation"><div class="rv-back"></div><div class="rv-front"></div><div class="rv-flap"></div><div class="rv-seal">✦</div></div><button class="rv-open" type="button">Tap to open <span>✦</span></button><div class="rv-hint">Open the envelope to enter the celebration.</div></div>';
    document.body.appendChild(gate);
    const envelope = $('.rv-envelope', gate);
    const open = () => {
      if (gate.classList.contains('open')) return;
      envelope.classList.add('open');
      gate.classList.add('open');
      startMusic();
      setTimeout(() => gate.remove(), 1100);
    };
    envelope.addEventListener('click', open);
    envelope.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    $('.rv-open', gate).addEventListener('click', open);
  }

  function addThemeSwitcher() {
    if ($('#riwaayat-theme-switcher')) return;
    const wrap = document.createElement('div');
    wrap.id = 'riwaayat-theme-switcher';
    wrap.className = 'rv-theme';
    wrap.innerHTML = '<button type="button" data-theme="original">Original</button><button type="button" data-theme="warm">Warm</button><button type="button" data-theme="green">Garden</button>';
    document.body.appendChild(wrap);
    const root = document.documentElement;
    const preset = getPreset();
    const apply = (value) => {
      root.dataset.rvAccentMode = value;
      if (value === 'warm') root.style.setProperty('--rv-accent', '#b56f58');
      else if (value === 'green') root.style.setProperty('--rv-accent', '#6f8f69');
      else root.style.setProperty('--rv-accent', preset.accent);
      $$('button', wrap).forEach((b) => b.classList.toggle('active', b.dataset.theme === value));
      try { localStorage.setItem(`rv-theme:${getSlug()}`, value); } catch (_) {}
    };
    let saved = 'original';
    try { saved = localStorage.getItem(`rv-theme:${getSlug()}`) || 'original'; } catch (_) {}
    $$('button', wrap).forEach((b) => b.addEventListener('click', () => apply(b.dataset.theme)));
    apply(saved);
  }

  function startMusic() {
    if (musicOn) return;
    try {
      music = music || new (window.AudioContext || window.webkitAudioContext)();
      if (music.state === 'suspended') music.resume();
      musicOn = true;
      if (!$('#riwaayat-music')) {
        const b = document.createElement('button');
        b.id = 'riwaayat-music'; b.className = 'rv-music'; b.type = 'button'; b.textContent = '♪ Music On';
        document.body.appendChild(b);
        b.addEventListener('click', () => musicOn ? stopMusic() : startMusic());
      }
      const notes = getSlug() === 'neon-celebration' ? [220,277.18,329.63,415.3] : [261.63,329.63,392,493.88];
      let i = 0;
      const tick = () => {
        if (!musicOn || !music) return;
        const osc = music.createOscillator(), gain = music.createGain();
        osc.type = getSlug() === 'neon-celebration' ? 'triangle' : 'sine';
        osc.frequency.value = notes[i++ % notes.length];
        gain.gain.setValueAtTime(.0001, music.currentTime);
        gain.gain.exponentialRampToValueAtTime(.014, music.currentTime + .08);
        gain.gain.exponentialRampToValueAtTime(.0001, music.currentTime + 1.5);
        osc.connect(gain).connect(music.destination); osc.start(); osc.stop(music.currentTime + 1.6);
        musicTimer = setTimeout(tick, 1450);
      };
      tick();
    } catch (_) {}
  }

  function stopMusic() { musicOn = false; clearTimeout(musicTimer); musicTimer = null; const b = $('#riwaayat-music'); if (b) b.textContent = '♪ Music'; }

  function addPetals() {
    if ($('.rv-petal-layer')) return;
    const layer = document.createElement('div'); layer.className = 'rv-petal-layer';
    const count = Math.min(44, Math.max(10, getPreset().density));
    for (let i = 0; i < count; i++) {
      const petal = document.createElement('span'); petal.className = 'rv-petal';
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.setProperty('--dx', `${(Math.random() * 2 - 1) * 24}vw`);
      petal.style.animationDuration = `${8 + Math.random() * 10}s`;
      petal.style.animationDelay = `${-Math.random() * 14}s`;
      petal.style.transform = `rotate(${Math.random() * 180}deg)`;
      petal.style.opacity = String(.28 + Math.random() * .4);
      layer.appendChild(petal);
    }
    document.body.appendChild(layer);
    if (getSlug() === 'minimal-ivory' || getSlug() === 'elegant-soiree') layer.style.opacity = '.45';
  }

  function ensureMedia() {
    const key = getSlug(); if (!key) return;
    const dynamic = $('#dynamic-sections'); if (!dynamic) return;
    const samples = [asset('hero'), asset('gallery-01'), asset('thumbnail')];
    const isLocalLegacy = (src) => !src || /^\/?assets\/images\//i.test(src);
    const isUserMedia = (src) => /^(https?:|data:|blob:|\/uploads\/|\/assets\/uploads\/)/i.test(src || '');
    $$('#dynamic-sections img[src]').forEach((img, i) => {
      const src = img.getAttribute('src') || '';
      if (isLocalLegacy(src) && !isUserMedia(src)) {
        const sample = samples[Math.min(i, samples.length - 1)];
        if (sample) img.setAttribute('src', sample);
      }
    });
    const gallery = $$('#dynamic-sections .event-section-wrap').find((s) => /memories|portraiture|moments|gallery|photos|highlights|album/i.test(s.textContent || ''));
    if (!gallery) return;
    const grid = gallery.querySelector('div:last-child');
    if (!grid) return;
    const imgs = $$('img', grid);
    samples.forEach((src, i) => {
      if (!src || imgs[i]) return;
      const card = document.createElement('div');
      card.style.cssText = 'overflow:hidden;min-height:220px;border-radius:var(--rv-radius);border:1px solid color-mix(in srgb,var(--rv-accent),transparent 70%);cursor:pointer;';
      const img = document.createElement('img');
      img.src = src; img.alt = 'Template sample moment'; img.loading = 'lazy'; img.style.cssText = 'width:100%;height:100%;min-height:220px;object-fit:cover;display:block;transition:transform .5s ease';
      card.appendChild(img); grid.appendChild(card);
      card.addEventListener('mouseenter', () => img.style.transform = 'scale(1.05)');
      card.addEventListener('mouseleave', () => img.style.transform = 'scale(1)');
      card.addEventListener('click', () => { if (typeof window.openLightbox === 'function') window.openLightbox(src, 'Template sample moment'); });
    });
  }

  function addCalendarButtons() {
    $$('.func-card').forEach((card, index) => {
      if ($('.rv-calendar', card)) return;
      const detail = $('.func-details', card); if (!detail) return;
      const btn = document.createElement('button'); btn.type='button'; btn.className='rv-calendar'; btn.innerHTML='<i class="fa-regular fa-calendar-plus"></i> Add to Calendar';
      btn.addEventListener('click', () => {
        const title = ($('h3', card)?.textContent || 'Celebration Function').trim();
        const start = new Date(); start.setHours(17 + Math.min(index, 5), 0, 0, 0);
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
        const stamp = (d) => d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
        const body = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Riwaayat Venue//Event//EN','BEGIN:VEVENT',`UID:${Date.now()}-${index}@riwaayatvenue.com`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,`SUMMARY:${title.replace(/[\r\n,;\\]/g,' ')}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
        const url = URL.createObjectURL(new Blob([body], {type:'text/calendar;charset=utf-8'}));
        const a = document.createElement('a'); a.href=url; a.download=`${title.toLowerCase().replace(/[^a-z0-9]+/gi,'-')||'celebration'}.ics`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
      detail.appendChild(btn);
    });
  }

  function init(event) {
    if (initialized || !event || !getSlug()) return;
    const content = $('#event-content');
    if (!content || content.style.display === 'none') return;
    initialized = true;
    installStyles();
    applyPreset();
    addThemeSwitcher();
    addGate();
    addPetals();
    ensureMedia();
    addCalendarButtons();
  }

  window.RiwaayatUniversalEventFeatures = { init };

  const tryInit = () => {
    if (initialized) return;
    const content = $('#event-content');
    if (!content || content.style.display === 'none') return;
    const key = getSlug();
    if (!key) return;
    init({ template: key });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tryInit, { once:true });
  else tryInit();

  const observer = new MutationObserver(() => window.requestAnimationFrame(tryInit));
  const startObserver = () => { if (document.body) observer.observe(document.body, {childList:true,subtree:true,attributes:true,attributeFilter:['class','style']}); };
  if (document.body) startObserver();
  else document.addEventListener('DOMContentLoaded', startObserver, {once:true});
})();
