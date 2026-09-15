(() => {
  'use strict';
  if (window.__RIWAAYAT_UNIVERSAL_EVENT_FEATURES__) return;
  window.__RIWAAYAT_UNIVERSAL_EVENT_FEATURES__ = true;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const PRESETS = {
    'royal-mandap':{gate:'royal',density:22},'marigold-bloom':{gate:'marigold',density:30},'mehendi-garden':{gate:'garden',density:24},'sangeet-afterglow':{gate:'afterglow',density:34},'palace-romance':{gate:'palace',density:18},'south-heritage':{gate:'mandapam',density:20},'blush-vows':{gate:'blush',density:28},'minimal-ivory':{gate:'minimal',density:10},'noor-nikah':{gate:'noor',density:18},'emerald-qasr':{gate:'qasr',density:18},'ivory-dua':{gate:'dua',density:12},'zafraan-evening':{gate:'zafraan',density:24},'resham-royale':{gate:'resham',density:16},'midnight-walima':{gate:'midnight',density:26},'pastel-party':{gate:'pastel',density:28},'little-star':{gate:'star',density:32},'elegant-soiree':{gate:'soiree',density:14},'neon-celebration':{gate:'neon',density:40}
  };
  let initialized = false;
  let audio = null, audioTimer = null, audioOn = false;

  function getSlug(){const token=Array.from(document.body?.classList||[]).find(x=>x.startsWith('template-'));return token?token.slice(9).toLowerCase():null;}
  function preset(){return PRESETS[getSlug()]||PRESETS['royal-mandap'];}
  function asset(name){const key=getSlug();return key?`/assets/templates/${key}/${name}.webp`:'';}

  function installStyles(){
    if($('#riwaayat-universal-style')) return;
    const style=document.createElement('style'); style.id='riwaayat-universal-style';
    style.textContent=`
      :root{--rv-accent:#d4af37;--rv-dark:#10140f}
      body[class*="template-"] #dynamic-sections{position:relative;z-index:1}
      body[class*="template-"] #dynamic-sections:before{content:"";position:fixed;inset:auto 0 0;height:22vh;pointer-events:none;z-index:-1;opacity:.15;background:radial-gradient(circle at 20% 40%,var(--rv-accent),transparent 34%),radial-gradient(circle at 82% 55%,var(--rv-accent),transparent 32%);filter:blur(35px)}
      #riwaayat-gate{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:22px;background:radial-gradient(circle at 50% 24%,#294e42 0,#0a211b 56%,#04100d 100%);color:#fff;transition:opacity .85s,visibility .85s}
      #riwaayat-gate.open{opacity:0;visibility:hidden;pointer-events:none}.rv-gate{text-align:center;width:min(560px,95vw)}
      .rv-gate-kicker{font:700 10px/1.2 system-ui,sans-serif;letter-spacing:.30em;text-transform:uppercase;color:#e1cf96;margin-bottom:24px}
      .rv-envelope{position:relative;margin:auto;width:min(450px,88vw);aspect-ratio:1.45;background:#eee3cf;box-shadow:0 32px 90px rgba(0,0,0,.45);cursor:pointer;transition:transform .45s,filter .4s}.rv-envelope:hover{transform:translateY(-5px) rotate(-1deg);filter:saturate(1.06)}
      .rv-back,.rv-front,.rv-flap{position:absolute;inset:0}.rv-back{background:linear-gradient(145deg,#f8f1e7,#d6c5a7)}.rv-front{background:linear-gradient(145deg,#eadfca,#c7b391);clip-path:polygon(0 28%,50% 72%,100% 28%,100% 100%,0 100%)}.rv-flap{background:linear-gradient(145deg,#fff7eb,#d7c5a6);clip-path:polygon(0 0,100% 0,50% 58%);transform-origin:50% 0;z-index:3;transition:transform .95s cubic-bezier(.75,0,.2,1)}.rv-envelope.open .rv-flap{transform:rotateX(180deg)}
      .rv-seal{position:absolute;left:50%;top:54%;z-index:5;transform:translate(-50%,-50%);width:94px;height:94px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#c76570,#7d1e2b 52%,#4d1017);border:4px solid rgba(255,236,198,.7);box-shadow:inset 0 6px 12px rgba(255,255,255,.15),0 15px 30px rgba(0,0,0,.25);font:40px/1 "Great Vibes",cursive;color:#f4ddaa;transition:transform .55s,opacity .4s}.rv-envelope.open .rv-seal{transform:translate(-50%,-50%) scale(.2) rotate(160deg);opacity:0}
      .rv-open{margin-top:24px;border:1px solid #d8bd72;border-radius:999px;padding:12px 20px;background:transparent;color:#f2ddb0;font:800 10px/1 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;cursor:pointer}.rv-hint{opacity:.58;font:14px/1.5 Georgia,serif;margin-top:11px}
      .rv-theme{position:fixed;right:18px;top:18px;z-index:1100;display:flex;gap:4px;padding:4px;border:1px solid rgba(255,255,255,.25);background:rgba(15,25,21,.5);backdrop-filter:blur(12px);border-radius:999px}.rv-theme button{border:0;border-radius:999px;background:transparent;color:#fff;padding:7px 10px;font:700 10px/1 system-ui,sans-serif;cursor:pointer}.rv-theme button.active{background:var(--rv-accent);color:#19140b}
      .rv-music{position:fixed;right:18px;bottom:18px;z-index:1100;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:10px 13px;background:rgba(14,24,20,.72);color:#fff;backdrop-filter:blur(10px);cursor:pointer;font:700 11px/1 system-ui,sans-serif}
      body.rv-gate-royal{--rv-accent:#d4af37}body.rv-gate-royal #riwaayat-gate{background:radial-gradient(circle at 50% 28%,#47331a,#130d08 62%,#060403)}
      body.rv-gate-marigold{--rv-accent:#d89d27}body.rv-gate-marigold #riwaayat-gate{background:radial-gradient(circle at 50% 20%,#6d3d17,#29130b 58%,#090503)}
      body.rv-gate-garden{--rv-accent:#6f9a67}body.rv-gate-garden #riwaayat-gate{background:radial-gradient(circle at 50% 20%,#38553b,#101d13 58%,#071009)}
      body.rv-gate-afterglow{--rv-accent:#d46aa0}body.rv-gate-afterglow #riwaayat-gate{background:radial-gradient(circle at 50% 18%,#58305f,#1a112a 56%,#08050d)}
      body.rv-gate-palace{--rv-accent:#bf9a4a}body.rv-gate-palace #riwaayat-gate{background:radial-gradient(circle at 50% 20%,#4a2b20,#1c0f0b 60%,#070403)}
      body.rv-gate-mandapam{--rv-accent:#c89b3c}body.rv-gate-mandapam #riwaayat-gate{background:radial-gradient(circle at 50% 18%,#4e3a16,#171207 58%,#060403)}
      body.rv-gate-blush{--rv-accent:#cf8f9b}body.rv-gate-blush #riwaayat-gate{background:radial-gradient(circle at 50% 20%,#683943,#29151b 58%,#0b0508)}
      body.rv-gate-minimal{--rv-accent:#9b8052}body.rv-gate-minimal #riwaayat-gate{background:linear-gradient(145deg,#2b2925,#0c0c0b)}
      body.rv-gate-noor{--rv-accent:#d7c184}body.rv-gate-noor #riwaayat-gate{background:radial-gradient(circle at 50% 18%,#293b53,#0d1320 59%,#05080f)}
      body.rv-gate-qasr{--rv-accent:#8eb89a}body.rv-gate-qasr #riwaayat-gate{background:radial-gradient(circle at 50% 18%,#244c40,#071510 60%,#030806)}
      body.rv-gate-dua{--rv-accent:#c8b38a}body.rv-gate-dua #riwaayat-gate{background:radial-gradient(circle at 50% 18%,#5a4b37,#1d170f 58%,#080604)}
      body.rv-gate-zafraan{--rv-accent:#cf8e2d}body.rv-gate-zafraan #riwaayat-gate{background:radial-gradient(circle at 50% 18%,#6a3e19,#241108 58%,#090402)}
      body.rv-gate-resham{--rv-accent:#ad6d6d}body.rv-gate-resham #riwaayat-gate{background:radial-gradient(circle at 50% 18%,#4e2430,#1d0d13 58%,#080405)}
      body.rv-gate-midnight{--rv-accent:#9db4d7}body.rv-gate-midnight #riwaayat-gate{background:radial-gradient(circle at 50% 18%,#26385d,#0a1020 60%,#02040a)}
      body.rv-gate-pastel{--rv-accent:#d49bb0}body.rv-gate-pastel #riwaayat-gate{background:radial-gradient(circle at 50% 18%,#5d4662,#21182a 58%,#08060b)}
      body.rv-gate-star{--rv-accent:#f3d37b}body.rv-gate-star #riwaayat-gate{background:radial-gradient(circle at 50% 10%,#263c6d,#0b1020 60%,#02040a)}
      body.rv-gate-soiree{--rv-accent:#d1b48b}body.rv-gate-soiree #riwaayat-gate{background:radial-gradient(circle at 50% 18%,#49423c,#171512 58%,#060505)}
      body.rv-gate-neon{--rv-accent:#54e5ff}body.rv-gate-neon #riwaayat-gate{background:radial-gradient(circle at 30% 20%,#27104e,#09111f 46%,#020306)}body.rv-gate-neon .rv-open{color:#7cecff;border-color:#54e5ff}
      .rv-template-mark{position:fixed;left:18px;top:18px;z-index:1090;border:1px solid color-mix(in srgb,var(--rv-accent),transparent 45%);border-radius:999px;padding:7px 11px;background:rgba(255,255,255,.09);backdrop-filter:blur(10px);color:rgba(255,255,255,.86);font:700 9px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;pointer-events:none}
      @media(max-width:650px){.rv-theme{left:12px;right:12px;top:12px;justify-content:center}.rv-theme button{flex:1}.rv-music{bottom:12px;right:12px}.rv-template-mark{left:12px;top:58px}.rv-envelope{width:min(370px,90vw)}}`;
    document.head.appendChild(style);
  }

  function applyPreset(){const key=getSlug();if(!key)return false;const p=preset();document.body.classList.add(`rv-gate-${p.gate}`);document.documentElement.dataset.rvTemplate=key;document.documentElement.style.setProperty('--rv-particle-density',p.density);if(!$('.rv-template-mark')){const mark=document.createElement('div');mark.className='rv-template-mark';mark.textContent=key.replace(/-/g,' ');document.body.appendChild(mark);}return true;}

  function addGate(){
    if($('#riwaayat-gate'))return;
    const gate=document.createElement('div');gate.id='riwaayat-gate';gate.innerHTML='<div class="rv-gate"><div class="rv-gate-kicker">A beautiful invitation awaits</div><div class="rv-envelope" tabindex="0" role="button" aria-label="Open invitation"><div class="rv-back"></div><div class="rv-front"></div><div class="rv-flap"></div><div class="rv-seal">✦</div></div><button class="rv-open" type="button">Tap to open <span>✦</span></button><div class="rv-hint">Your celebration will unfold with a little touch of magic.</div></div>';document.body.appendChild(gate);
    const envelope=$('.rv-envelope',gate),open=()=>{if(gate.classList.contains('open'))return;envelope.classList.add('open');gate.classList.add('open');startMusic();setTimeout(()=>gate.remove(),1100);};
    envelope.addEventListener('click',open);envelope.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});$('.rv-open',gate).addEventListener('click',open);
  }

  function addThemes(){
    if($('#riwaayat-theme-switcher'))return;
    const wrap=document.createElement('div');wrap.id='riwaayat-theme-switcher';wrap.className='rv-theme';wrap.setAttribute('aria-label','Invitation theme');wrap.innerHTML='<button type="button" data-rv-theme="emerald">Emerald</button><button type="button" data-rv-theme="burgundy">Burgundy</button><button type="button" data-rv-theme="sage">Sage</button>';document.body.appendChild(wrap);
    const apply=theme=>{const value=['emerald','burgundy','sage'].includes(theme)?theme:'emerald';document.documentElement.dataset.rvTheme=value;$$('button',wrap).forEach(b=>b.classList.toggle('active',b.dataset.rvTheme===value));try{localStorage.setItem('riwaayat-event-theme',value);}catch(_){};};
    $$('button',wrap).forEach(b=>b.addEventListener('click',()=>apply(b.dataset.rvTheme)));let saved=null;try{saved=localStorage.getItem('riwaayat-event-theme');}catch(_){}apply(saved||'emerald');
  }

  function startMusic(){
    if(audioOn)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();audioOn=true;if(!$('#riwaayat-music')){const b=document.createElement('button');b.id='riwaayat-music';b.className='rv-music';b.type='button';b.textContent='♪ Music On';document.body.appendChild(b);b.addEventListener('click',()=>audioOn?stopMusic():startMusic());}const notes=[261.63,329.63,392,493.88];let i=0;const tick=()=>{if(!audioOn||!audio)return;const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=notes[i++%notes.length];gain.gain.setValueAtTime(.0001,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.018,audio.currentTime+.08);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+1.6);osc.connect(gain).connect(audio.destination);osc.start();osc.stop(audio.currentTime+1.7);audioTimer=setTimeout(tick,1450);};tick();}catch(_){}
  }
  function stopMusic(){audioOn=false;clearTimeout(audioTimer);audioTimer=null;const b=$('#riwaayat-music');if(b)b.textContent='♪ Music';}

  function ensureMedia(){
    const key=getSlug(),dynamic=$('#dynamic-sections');if(!key||!dynamic)return;const samples=[asset('hero'),asset('gallery-01'),asset('thumbnail')].filter(Boolean);if(!samples.length)return;
    const legacy=src=>!src||/^\/?assets\/images\//i.test(src);const isUser=src=>/^(https?:|data:|blob:|\/uploads\/|\/assets\/uploads\/)/i.test(src||'');
    const hero=$('.hero-avatar-img',dynamic);if(hero&&legacy(hero.getAttribute('src'))&&!isUser(hero.getAttribute('src')))hero.src=samples[0];
    $$('.func-img',dynamic).forEach((img,i)=>{const src=img.getAttribute('src');if(legacy(src)&&!isUser(src))img.src=samples[(i+1)%samples.length];});
    const gallery=$$('.event-section-wrap',dynamic).find(s=>/memories\s*&\s*smiles|photo album|photo highlights|gallery/i.test(s.textContent||''));if(!gallery)return;const grid=$('div:last-child',gallery);if(!grid)return;const imgs=$$('img',grid);
    imgs.forEach((img,i)=>{const src=img.getAttribute('src');if(legacy(src)&&!isUser(src))img.src=samples[i%samples.length];img.loading=img.loading||'lazy';});
    for(let i=imgs.length;i<samples.length;i++){const card=document.createElement('div');card.style.cssText='border-radius:12px;overflow:hidden;height:240px;cursor:pointer;border:3px solid #fff;box-shadow:var(--shadow-card,0 12px 28px rgba(0,0,0,.12));';card.innerHTML=`<img src="${samples[i]}" alt="Template sample moment" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .45s ease">`;card.addEventListener('mouseenter',()=>{const img=$('img',card);if(img)img.style.transform='scale(1.06)';});card.addEventListener('mouseleave',()=>{const img=$('img',card);if(img)img.style.transform='scale(1)';});card.addEventListener('click',()=>{if(typeof window.openLightbox==='function')window.openLightbox(samples[i],'Template sample moment');});grid.appendChild(card);}
  }

  function addCalendarButtons(){
    $$('.func-card').forEach((card,index)=>{if($('.rv-calendar',card))return;const details=$('.func-details',card);if(!details)return;const button=document.createElement('button');button.type='button';button.className='rv-calendar btn-outline btn-sm';button.style.cssText='margin-top:14px;align-self:flex-start;';button.innerHTML='<i class="fa-regular fa-calendar-plus"></i> Add to Calendar';button.addEventListener('click',()=>{const title=($('h3',card)?.textContent||'Wedding Function').trim();const start=new Date();start.setHours(Math.min(23,17+index),0,0,0);const end=new Date(start.getTime()+2*60*60*1000);const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');const body=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Riwaayat Venue//Event//EN','BEGIN:VEVENT',`UID:${Date.now()}-${index}@riwaayatvenue.com`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,`SUMMARY:${title.replace(/[\r\n,;\\]/g,' ')}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');const url=URL.createObjectURL(new Blob([body],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`${title.toLowerCase().replace(/[^a-z0-9]+/gi,'-')||'event'}.ics`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});details.appendChild(button);});
  }

  function init(event){if(initialized||!event||!getSlug())return;const content=$('#event-content');if(!content||content.style.display==='none')return;initialized=true;installStyles();applyPreset();addThemes();addGate();ensureMedia();addCalendarButtons();}
  window.RiwaayatUniversalEventFeatures={init};

  const tryInit=()=>{if(initialized)return;const content=$('#event-content');if(!content||content.style.display==='none')return;const key=getSlug();if(!key)return;init({template:key});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tryInit,{once:true});else tryInit();
  const observer=new MutationObserver(()=>window.requestAnimationFrame(tryInit));
  const startObserver=()=>{if(document.body)observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});};
  if(document.body)startObserver();else document.addEventListener('DOMContentLoaded',startObserver,{once:true});
})();