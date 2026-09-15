(() => {
  'use strict';
  if (window.__RIWAAYAT_UNIVERSAL_EVENT_FEATURES__) return;
  window.__RIWAAYAT_UNIVERSAL_EVENT_FEATURES__ = true;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  function slug() {
    const token = $$('body.classlist,body')[0] ? Array.from(document.body.classList).find((x) => x.startsWith('template-')) : null;
    return token ? token.slice(9).toLowerCase() : null;
  }

  function asset(name) {
    const key = slug() || 'royal-mandap';
    return `/assets/templates/${key}/${name}.webp`;
  }

  function installStyles() {
    if ($('#riwaayat-universal-style')) return;
    const style = document.createElement('style');
    style.id = 'riwaayat-universal-style';
    style.textContent = `
      #riwaayat-gate{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:22px;background:radial-gradient(circle at 50% 28%,#294e42 0,#0a211b 58%,#04100d 100%);color:#fff;transition:opacity .9s,visibility .9s}
      #riwaayat-gate.open{opacity:0;visibility:hidden;pointer-events:none}
      .rv-gate{text-align:center;width:min(520px,94vw)}
      .rv-gate-kicker{font:700 11px/1 system-ui,sans-serif;letter-spacing:.28em;text-transform:uppercase;color:#dec98f;margin-bottom:26px}
      .rv-envelope{position:relative;margin:auto;width:min(430px,88vw);aspect-ratio:1.45;background:#eee3cf;box-shadow:0 30px 90px rgba(0,0,0,.42);cursor:pointer;transform:translateZ(0);transition:transform .45s}
      .rv-envelope:hover{transform:translateY(-5px) rotate(-1deg)}
      .rv-back,.rv-front,.rv-flap{position:absolute;inset:0}.rv-back{background:linear-gradient(145deg,#f7f0e5,#d4c4a8)}
      .rv-front{background:linear-gradient(145deg,#eadfcb,#c8b696);clip-path:polygon(0 28%,50% 72%,100% 28%,100% 100%,0 100%)}
      .rv-flap{background:linear-gradient(145deg,#fbf3e7,#d5c5aa);clip-path:polygon(0 0,100% 0,50% 58%);transform-origin:50% 0;z-index:3;transition:transform .95s cubic-bezier(.75,0,.2,1)}
      .rv-envelope.open .rv-flap{transform:rotateX(180deg)}
      .rv-seal{position:absolute;left:50%;top:54%;z-index:5;transform:translate(-50%,-50%);width:92px;height:92px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#c76570,#7d1e2b 52%,#4d1017);border:4px solid rgba(255,236,198,.7);box-shadow:inset 0 6px 12px rgba(255,255,255,.15),0 15px 30px rgba(0,0,0,.25);font:44px/1 "Great Vibes",cursive;color:#f4ddaa;transition:transform .55s,opacity .4s}
      .rv-envelope.open .rv-seal{transform:translate(-50%,-50%) scale(.2) rotate(160deg);opacity:0}
      .rv-open{margin-top:24px;border:1px solid #d8bd72;border-radius:999px;padding:12px 20px;background:transparent;color:#f2ddb0;font:800 11px/1 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;cursor:pointer}
      .rv-hint{opacity:.55;font:14px/1.5 Georgia,serif;margin-top:11px}
      .rv-theme{position:fixed;right:18px;top:18px;z-index:1100;display:flex;gap:4px;padding:4px;border:1px solid rgba(255,255,255,.25);background:rgba(15,25,21,.5);backdrop-filter:blur(12px);border-radius:999px}
      .rv-theme button{border:0;border-radius:999px;background:transparent;color:#fff;padding:7px 10px;font:700 10px/1 system-ui,sans-serif;cursor:pointer}.rv-theme button.active{background:#c9a44c;color:#19140b}
      .rv-music{position:fixed;right:18px;bottom:18px;z-index:1100;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:10px 13px;background:rgba(14,24,20,.72);color:#fff;backdrop-filter:blur(10px);cursor:pointer;font:700 11px/1 system-ui,sans-serif}
      html[data-rv-theme="burgundy"]{--primary-gold:#d4ad55}html[data-rv-theme="sage"]{--primary-gold:#b09b63}
      @media(max-width:650px){.rv-theme{left:12px;right:12px;top:12px;justify-content:center}.rv-theme button{flex:1}.rv-envelope{width:min(370px,90vw)}.rv-music{bottom:12px;right:12px}}
    `;
    document.head.appendChild(style);
  }

  function addGate() {
    if ($('#riwaayat-gate')) return;
    const gate = document.createElement('div');
    gate.id = 'riwaayat-gate';
    gate.innerHTML = `<div class="rv-gate"><div class="rv-gate-kicker">A beautiful invitation awaits</div><div class="rv-envelope" tabindex="0" role="button" aria-label="Open invitation"><div class="rv-back"></div><div class="rv-front"></div><div class="rv-flap"></div><div class="rv-seal">A&amp;S</div></div><button class="rv-open" type="button">Tap to open <span>✦</span></button><div class="rv-hint">Your celebration will unfold with a little touch of magic.</div></div>`;
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

  function addThemes() {
    if ($('#riwaayat-theme-switcher')) return;
    const wrap = document.createElement('div');
    wrap.id = 'riwaayat-theme-switcher';
    wrap.className = 'rv-theme';
    wrap.setAttribute('aria-label', 'Invitation theme');
    wrap.innerHTML = '<button type="button" data-rv-theme="emerald">Emerald</button><button type="button" data-rv-theme="burgundy">Burgundy</button><button type="button" data-rv-theme="sage">Sage</button>';
    document.body.appendChild(wrap);
    const apply = (theme) => {
      const value = ['emerald','burgundy','sage'].includes(theme) ? theme : 'emerald';
      document.documentElement.dataset.rvTheme = value;
      $$('button', wrap).forEach((b) => b.classList.toggle('active', b.dataset.rvTheme === value));
      try { localStorage.setItem('riwaayat-event-theme', value); } catch (_) {}
    };
    $$('button', wrap).forEach((b) => b.addEventListener('click', () => apply(b.dataset.rvTheme)));
    let saved = null; try { saved = localStorage.getItem('riwaayat-event-theme'); } catch (_) {}
    apply(saved || 'emerald');
  }

  let audio = null;
  let audioTimer = null;
  let audioOn = false;
  function startMusic() {
    if (audioOn) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      audioOn = true;
      if (!$('#riwaayat-music')) {
        const b = document.createElement('button'); b.id = 'riwaayat-music'; b.className = 'rv-music'; b.type = 'button'; b.textContent = '♪ Music On'; document.body.appendChild(b);
        b.addEventListener('click', () => { if (audioOn) stopMusic(); else startMusic(); });
      }
      const notes = [261.63, 329.63, 392, 493.88]; let i = 0;
      const tick = () => {
        if (!audioOn || !audio) return;
        const osc = audio.createOscillator(); const gain = audio.createGain(); osc.type = 'sine'; osc.frequency.value = notes[i++ % notes.length]; gain.gain.setValueAtTime(.0001, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.018, audio.currentTime + .08); gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + 1.6); osc.connect(gain).connect(audio.destination); osc.start(); osc.stop(audio.currentTime + 1.7); audioTimer = setTimeout(tick, 1450);
      };
      tick();
      const b = $('#riwaayat-music'); if (b) b.textContent = '♪ Music On';
    } catch (_) {}
  }
  function stopMusic() { audioOn = false; clearTimeout(audioTimer); audioTimer = null; const b = $('#riwaayat-music'); if (b) b.textContent = '♪ Music'; }

  function ensureMedia() {
    const key = slug(); if (!key) return;
    const samples = [asset('hero'), asset('gallery-01'), asset('thumbnail')];
    const dynamic = $('#dynamic-sections'); if (!dynamic) return;

    const legacy = (src) => !src || /^\/?assets\/images\//i.test(src);
    const isUser = (src) => /^(https?:|data:|blob:|\/uploads\/|\/assets\/uploads\/)/i.test(src || '');

    const hero = $('.hero-avatar-img', dynamic);
    if (hero && legacy(hero.getAttribute('src')) && !isUser(hero.getAttribute('src'))) hero.src = samples[0];

    $$('.func-img', dynamic).forEach((img, i) => {
      const src = img.getAttribute('src');
      if (legacy(src) && !isUser(src)) img.src = samples[(i + 1) % samples.length];
    });

    const sections = $$('.event-section-wrap', dynamic);
    const gallery = sections.find((section) => /memories\s*&\s*smiles|photo album|photo highlights|gallery/i.test(section.textContent || ''));
    if (!gallery) return;
    const grid = $('div:last-child', gallery); if (!grid) return;
    const images = $$('img', grid);
    images.forEach((img, i) => {
      const src = img.getAttribute('src');
      if (legacy(src) && !isUser(src)) img.src = samples[i % samples.length];
      img.loading = img.loading || 'lazy';
    });
    for (let i = images.length; i < samples.length; i++) {
      const card = document.createElement('div');
      card.style.cssText = 'border-radius:12px;overflow:hidden;height:240px;cursor:pointer;border:3px solid #fff;box-shadow:var(--shadow-card,0 12px 28px rgba(0,0,0,.12));';
      card.innerHTML = `<img src="${samples[i]}" alt="Template sample moment" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .45s ease">`;
      card.addEventListener('mouseenter', () => { const img = $('img', card); if (img) img.style.transform = 'scale(1.06)'; });
      card.addEventListener('mouseleave', () => { const img = $('img', card); if (img) img.style.transform = 'scale(1)'; });
      card.addEventListener('click', () => { if (typeof window.openLightbox === 'function') window.openLightbox(samples[i], 'Template sample moment'); });
      grid.appendChild(card);
    }
  }

  function addCalendarButtons() {
    $$('.func-card').forEach((card, index) => {
      if ($('.rv-calendar', card)) return;
      const details = $('.func-details', card); if (!details) return;
      const button = document.createElement('button'); button.type = 'button'; button.className = 'rv-calendar btn-outline btn-sm'; button.style.cssText = 'margin-top:14px;align-self:flex-start;'; button.innerHTML = '<i class="fa-regular fa-calendar-plus"></i> Add to Calendar';
      button.addEventListener('click', () => {
        const title = ($('h3', card)?.textContent || 'Wedding Function').trim();
        const start = new Date(); start.setHours(Math.min(23, 17 + index), 0, 0, 0);
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
        const stamp = (d) => d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
        const body = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Riwaayat Venue//Event//EN','BEGIN:VEVENT',`UID:${Date.now()}-${index}@riwaayatvenue.com`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,`SUMMARY:${title.replace(/[\r\n,;\\]/g,' ')}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
        const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/gi,'-') || 'event'}.ics`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
      details.appendChild(button);
    });
  }

  function enhance() {
    installStyles();
    addThemes();
    addGate();
    ensureMedia();
    addCalendarButtons();
  }

  const boot = () => {
    if (!featureStarted) { featureStarted = true; enhance(); }
    else { ensureMedia(); addCalendarButtons(); }
  };

  let featureStarted = false;
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });

  const observer = new MutationObserver(() => { window.requestAnimationFrame(boot); });
  const observe = () => { if (document.body) observer.observe(document.body, { childList: true, subtree: true }); };
  if (document.body) observe(); else document.addEventListener('DOMContentLoaded', observe, { once: true });
})();
