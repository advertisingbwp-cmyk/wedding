/**
 * VIJAY & RASHIMA WEDDING - MAIN INTERACTION CONTROLLER
 */

(function () {
  // 1. Header scroll effect
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll to Top Button
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (scrollTopBtn) {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  });

  // 2. Scroll to top handler
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 3. Mobile Navigation Drawer
  const mobileToggle = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close menu when clicking link
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  // 4. Meet The Family Tabs
  const familyTabBtns = document.querySelectorAll('.family-tab-btn');
  const familyGroups = document.querySelectorAll('.family-group');

  familyTabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      familyTabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.getAttribute('data-family');
      familyGroups.forEach((group) => {
        if (group.id === target) {
          group.classList.add('active');
        } else {
          group.classList.remove('active');
        }
      });
    });
  });

  // 5. FAQs Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const faqHeader = item.querySelector('.faq-header');
    if (faqHeader) {
      faqHeader.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach((f) => f.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // 6. Copy Wedding Hashtags
  window.copyHashtag = function (tag) {
    navigator.clipboard.writeText(tag).then(() => {
      showWeddingToast(`Copied ${tag} to clipboard! Tag your photos with love ❤️`);
      fireCelebrationConfetti();
    }).catch(() => {
      showWeddingToast(`Hashtag: ${tag}`);
    });
  };

  // 7. Wedding Toast System
  window.showWeddingToast = function (msg) {
    let toast = document.getElementById('wedding-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'wedding-toast';
      toast.className = 'wedding-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-sparkles"></i> <span>${msg}</span>`;
    toast.classList.add('show');

    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  };

  // 8. Celebration Confetti Engine
  window.fireCelebrationConfetti = function () {
    const confettiCanvas = document.getElementById('confetti-canvas');
    if (!confettiCanvas) return;

    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#D4AF37', '#FF8DA7', '#B794F6', '#FFE5D9', '#FFD700', '#FFFFFF', '#F06292'];

    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: confettiCanvas.width / 2 + (Math.random() - 0.5) * 200,
        y: confettiCanvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16 - 6,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    let frame = 0;
    function renderConfetti() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let alive = false;

      for (let p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.rSpeed;
        p.opacity -= 0.009;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }
      }

      frame++;
      if (alive && frame < 200) {
        requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }

    renderConfetti();
  };

  // 9. Romantic Wedding Melodic Synthesizer (Web Audio API)
  // Provides gentle acoustic flute/sitar romance arpeggios that play smoothly in any browser
  let audioCtx = null;
  let isPlayingMusic = false;
  let musicInterval = null;
  const musicBtn = document.getElementById('music-toggle-btn');

  // Pentatonic romantic raag notes (frequencies in Hz: D, E, F#, A, B)
  const notes = [
    293.66, 329.63, 369.99, 440.00, 493.88, // Octave 4
    587.33, 659.25, 739.99, 880.00, 987.77  // Octave 5
  ];

  const romanceSequence = [
    0, 2, 3, 5, 4, 3, 2, 0,
    1, 3, 4, 6, 5, 4, 3, 1,
    2, 4, 5, 7, 6, 5, 4, 2,
    3, 5, 7, 8, 7, 5, 3, 2
  ];

  let noteIndex = 0;

  function playGentleNote(freq, duration = 1.2) {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Soft sine flute wave with a warm second harmonic
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Smooth envelope attack and release
      const now = audioCtx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio play note error:', e);
    }
  }

  function startRomanticMelody() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlayingMusic = true;
    if (musicBtn) {
      musicBtn.classList.add('playing');
      musicBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      musicBtn.title = "Mute Romantic Music";
    }

    noteIndex = 0;
    playGentleNote(notes[romanceSequence[noteIndex]], 1.6);

    clearInterval(musicInterval);
    musicInterval = setInterval(() => {
      noteIndex = (noteIndex + 1) % romanceSequence.length;
      playGentleNote(notes[romanceSequence[noteIndex]], 1.4);
    }, 480);

    showWeddingToast('🎵 Playing soothing wedding melody');
  }

  function stopRomanticMelody() {
    isPlayingMusic = false;
    clearInterval(musicInterval);
    if (musicBtn) {
      musicBtn.classList.remove('playing');
      musicBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      musicBtn.title = "Play Romantic Music";
    }
    showWeddingToast('Music Muted');
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      if (!isPlayingMusic) {
        startRomanticMelody();
      } else {
        stopRomanticMelody();
      }
    });
  }
})();
