(() => {
  'use strict';

  const root = document.documentElement;
  const gate = document.getElementById('gate');
  const envelope = document.getElementById('envelope');
  const openButton = document.getElementById('openInvitation');
  const invitation = document.getElementById('invitation');
  const soundToggle = document.getElementById('soundToggle');
  const canvas = document.getElementById('petalCanvas');
  const ctx = canvas.getContext('2d');
  const TARGET = new Date('2026-12-07T18:00:00+05:00').getTime();
  const themes = ['emerald', 'burgundy', 'sage'];
  let audioContext = null;
  let masterGain = null;
  let ambientNodes = [];
  let ambientEnabled = false;
  let petals = [];
  let envelopeOpened = false;

  document.querySelectorAll('.theme-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const nextTheme = button.dataset.themeChoice;
      if (!themes.includes(nextTheme)) return;
      root.dataset.theme = nextTheme;
      document.querySelectorAll('.theme-btn').forEach((b) => b.classList.toggle('active', b === button));
      try { localStorage.setItem('riwaayat-demo-theme', nextTheme); } catch (_) {}
    });
  });

  try {
    const savedTheme = localStorage.getItem('riwaayat-demo-theme');
    if (themes.includes(savedTheme)) {
      root.dataset.theme = savedTheme;
      document.querySelectorAll('.theme-btn').forEach((b) => b.classList.toggle('active', b.dataset.themeChoice === savedTheme));
    }
  } catch (_) {}

  function openInvitation() {
    if (envelopeOpened) return;
    envelopeOpened = true;
    envelope.classList.add('open');
    gate.classList.add('is-open');
    invitation.classList.remove('is-hidden');
    startAmbientSound();
    setTimeout(() => gate.remove(), 1100);
  }
  envelope.addEventListener('click', openInvitation);
  openButton.addEventListener('click', openInvitation);
  envelope.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openInvitation(); }
  });

  function createAmbientSound() {
    if (audioContext) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioContext = new AudioCtx();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.0001;
    masterGain.connect(audioContext.destination);
    const notes = [196, 246.94, 293.66, 392];
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = index % 2 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.008 + index * 0.0015;
      oscillator.connect(gain).connect(masterGain);
      oscillator.start();
      ambientNodes.push({ oscillator, gain });
    });
  }

  function setSoundState(enabled) {
    ambientEnabled = enabled;
    soundToggle.classList.toggle('playing', enabled);
    soundToggle.setAttribute('aria-pressed', String(enabled));
    if (!masterGain || !audioContext) return;
    const now = audioContext.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.linearRampToValueAtTime(enabled ? 0.06 : 0.0001, now + 0.8);
  }

  function startAmbientSound() {
    createAmbientSound();
    if (!audioContext) return;
    audioContext.resume().then(() => setSoundState(true)).catch(() => {});
  }

  soundToggle.addEventListener('click', () => {
    if (!audioContext) createAmbientSound();
    if (!audioContext) return;
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    setSoundState(!ambientEnabled);
  });

  function renderCountdown() {
    const grid = document.getElementById('countdownGrid');
    const distance = TARGET - Date.now();
    const values = distance > 0 ? [
      Math.floor(distance / 86400000),
      Math.floor((distance / 3600000) % 24),
      Math.floor((distance / 60000) % 60),
      Math.floor((distance / 1000) % 60)
    ] : [0, 0, 0, 0];
    grid.innerHTML = values.map((value, index) => `<div><strong>${String(value).padStart(2, '0')}</strong><span>${['Days','Hours','Minutes','Seconds'][index]}</span></div>`).join('');
  }
  renderCountdown();
  setInterval(renderCountdown, 1000);

  function setupScratch() {
    const card = document.getElementById('scratchCanvas');
    const wrapper = card.parentElement;
    const g = card.getContext('2d', { willReadFrequently: true });
    let drawing = false;
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      card.width = Math.max(1, wrapper.clientWidth * ratio);
      card.height = Math.max(1, wrapper.clientHeight * ratio);
      card.style.width = `${wrapper.clientWidth}px`;
      card.style.height = `${wrapper.clientHeight}px`;
      g.setTransform(ratio, 0, 0, ratio, 0, 0);
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#b69450';
      g.fillRect(0, 0, wrapper.clientWidth, wrapper.clientHeight);
      g.fillStyle = 'rgba(255,255,255,.08)';
      for (let i = 0; i < wrapper.clientWidth; i += 18) g.fillRect(i, 0, 2, wrapper.clientHeight);
    };
    const point = (event) => {
      const rect = card.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const scratch = (event) => {
      if (!drawing) return;
      event.preventDefault();
      const p = point(event);
      g.globalCompositeOperation = 'destination-out';
      g.beginPath();
      g.arc(p.x, p.y, 25, 0, Math.PI * 2);
      g.fill();
    };
    card.addEventListener('pointerdown', (event) => { drawing = true; card.setPointerCapture(event.pointerId); scratch(event); });
    card.addEventListener('pointermove', scratch);
    card.addEventListener('pointerup', () => { drawing = false; });
    card.addEventListener('pointercancel', () => { drawing = false; });
    window.addEventListener('resize', resize, { passive: true });
    resize();
  }
  setupScratch();

  document.querySelectorAll('.calendar-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const title = button.dataset.title || 'Wedding Event';
      const start = new Date(button.dataset.date);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const ics = [
        'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Riwaayat Venue//Wedding Template//EN','BEGIN:VEVENT',
        `DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,
        `SUMMARY:${title} — Ananya & Shubham`,'DESCRIPTION:Riwaayat Venue wedding invitation demo',
        'END:VEVENT','END:VCALENDAR'
      ].join('\r\n');
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `${title.toLowerCase().replace(/\s+/g,'-')}.ics`; link.click();
      URL.revokeObjectURL(url);
    });
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  document.querySelectorAll('.gallery-tile').forEach((tile) => tile.addEventListener('click', () => {
    lightboxImage.src = tile.dataset.full;
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
  }));
  const closeLightbox = () => { lightbox.classList.remove('show'); lightbox.setAttribute('aria-hidden','true'); lightboxImage.removeAttribute('src'); };
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });

  const form = document.getElementById('rsvpForm');
  const status = document.getElementById('rsvpStatus');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.guests = Number(data.guests);
    data.createdAt = new Date().toISOString();
    try {
      const existing = JSON.parse(localStorage.getItem('riwaayat-demo-rsvps') || '[]');
      existing.push(data);
      localStorage.setItem('riwaayat-demo-rsvps', JSON.stringify(existing));
      status.textContent = `Thank you, ${data.name}. Your demo RSVP has been saved on this browser.`;
      form.reset();
      form.elements.guests.value = 1;
    } catch (_) {
      status.textContent = 'This browser could not save the demo RSVP.';
    }
  });

  function resizeParticles() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = window.innerWidth < 700 ? 24 : 42;
    petals = Array.from({length: count}, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 3 + Math.random() * 5,
      speed: .25 + Math.random() * .75,
      drift: -.35 + Math.random() * .7,
      rotation: Math.random() * Math.PI,
      spin: -.02 + Math.random() * .04,
      opacity: .14 + Math.random() * .28
    }));
  }
  function drawParticles() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    petals.forEach((p) => {
      p.y += p.speed; p.x += Math.sin(p.y * .009) * p.drift; p.rotation += p.spin;
      if (p.y > window.innerHeight + 20) { p.y = -20; p.x = Math.random() * window.innerWidth; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.globalAlpha = p.opacity;
      ctx.beginPath(); ctx.ellipse(0,0,p.size,p.size*.55,0,0,Math.PI*2); ctx.strokeStyle = '#c9a44c'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
    });
    requestAnimationFrame(drawParticles);
  }
  window.addEventListener('resize', resizeParticles, { passive: true });
  resizeParticles(); drawParticles();
})();
