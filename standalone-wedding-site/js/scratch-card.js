/**
 * VIJAY & RASHIMA WEDDING - REALISTIC SCRATCH CARD REVEAL ENGINE
 */

(function () {
  const canvas = document.getElementById('scratch-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const progressFill = document.getElementById('scratch-progress');
  const progressText = document.getElementById('scratch-percent-text');
  const secretVenue = document.querySelector('.scratch-secret-content');

  let isDrawing = false;
  let isRevealed = false;
  let lastX = 0;
  let lastY = 0;
  let rect = canvas.getBoundingClientRect();

  function resizeCanvas() {
    rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    drawScratchCover();
  }

  function drawScratchCover() {
    if (isRevealed) return;

    // Reset composite operation to draw the cover
    ctx.globalCompositeOperation = 'source-over';

    // Luxury Golden Metallic Foil Gradient
    const goldGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    goldGrad.addColorStop(0, '#E5C378');
    goldGrad.addColorStop(0.25, '#D4AF37');
    goldGrad.addColorStop(0.5, '#FFF4D0');
    goldGrad.addColorStop(0.75, '#C59B27');
    goldGrad.addColorStop(1, '#E5C378');

    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle gold dust shimmer specks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 70; i++) {
      const rx = Math.random() * canvas.width;
      const ry = Math.random() * canvas.height;
      const r = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shimmering Border Outline
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Call to action text on the gold foil
    ctx.fillStyle = '#4A3508';
    ctx.font = 'bold 17px "Cinzel", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦ SCRATCH TO REVEAL ✦', canvas.width / 2, canvas.height / 2 - 12);

    ctx.font = 'italic 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#6E4E08';
    ctx.fillText('✨ The Auspicious Date & Venue ✨', canvas.width / 2, canvas.height / 2 + 16);
  }

  // Handle pointer coordinates
  function getCoordinates(e) {
    rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  // Scratch action
  function scratch(x, y) {
    if (isRevealed) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 36;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;

    // Check scratched percentage periodically
    checkScratchedPercentage();
  }

  let throttleTimer = null;
  function checkScratchedPercentage() {
    if (isRevealed) return;
    if (throttleTimer) return;

    throttleTimer = setTimeout(() => {
      throttleTimer = null;
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentCount = 0;
        const total = pixels.length / 4;

        // Sample every 4th pixel for high performance
        for (let i = 3; i < pixels.length; i += 16) {
          if (pixels[i] < 128) {
            transparentCount++;
          }
        }

        const sampledTotal = total / 4;
        const percent = Math.min(100, Math.round((transparentCount / sampledTotal) * 100));

        if (progressFill) progressFill.style.width = percent + '%';
        if (progressText) progressText.textContent = percent + '% Scratched';

        // Auto-complete if 48% or more scratched
        if (percent >= 48) {
          triggerFullReveal();
        }
      } catch (err) {
        console.warn('Scratch percentage check:', err);
      }
    }, 120);
  }

  function triggerFullReveal() {
    if (isRevealed) return;
    isRevealed = true;

    canvas.style.transition = 'opacity 0.7s ease';
    canvas.style.opacity = '0';
    setTimeout(() => {
      canvas.style.display = 'none';
    }, 700);

    if (progressFill) progressFill.style.width = '100%';
    if (progressText) progressText.textContent = '100% Revealed! 🎉';

    // Fire joyful celebration confetti!
    if (window.fireCelebrationConfetti) {
      window.fireCelebrationConfetti();
    }

    // Show toast message
    if (window.showWeddingToast) {
      window.showWeddingToast('✨ Date Unlocked: December 14, 2026 at Udaivilas, Udaipur! ✨');
    }
  }

  // Pointer & Mouse Events
  function onPointerDown(e) {
    isDrawing = true;
    const coords = getCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
    scratch(coords.x, coords.y);
  }

  function onPointerMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    scratch(coords.x, coords.y);
  }

  function onPointerUp() {
    isDrawing = false;
  }

  // Bind Mouse & Touch events
  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  canvas.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('touchend', onPointerUp);

  // Initialize
  window.addEventListener('load', resizeCanvas);
  window.addEventListener('resize', resizeCanvas);
  // Also run immediately if DOM is ready
  resizeCanvas();

  // Expose manual reveal button if guest wants instant reveal
  const quickRevealBtn = document.getElementById('quick-reveal-btn');
  if (quickRevealBtn) {
    quickRevealBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerFullReveal();
    });
  }
})();
