/**
 * VIJAY & RASHIMA WEDDING - ROMANTIC FLOATING PARTICLES & PETALS ENGINE
 */

(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = window.innerWidth < 768 ? 24 : 45;
  const particles = [];

  const petalColors = [
    'rgba(255, 182, 193, 0.75)', // Soft Rose Pink
    'rgba(255, 209, 220, 0.7)',  // Pastel Pink
    'rgba(240, 230, 255, 0.7)',  // Lavender
    'rgba(255, 229, 217, 0.7)',  // Peach
    'rgba(212, 175, 55, 0.65)'   // Gold Sparkle
  ];

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -30;
      this.size = Math.random() * 9 + 7;
      this.speedY = Math.random() * 0.9 + 0.5;
      this.speedX = Math.random() * 0.8 - 0.4;
      this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.03;
      this.type = Math.random() > 0.4 ? 'petal' : 'heart';
      this.oscillation = Math.random() * 100;
      this.oscillationSpeed = Math.random() * 0.03 + 0.01;
    }

    update() {
      this.y += this.speedY;
      this.oscillation += this.oscillationSpeed;
      this.x += this.speedX + Math.sin(this.oscillation) * 0.6;
      this.rotation += this.rotationSpeed;

      if (this.y > height + 30 || this.x < -30 || this.x > width + 30) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;

      if (this.type === 'heart') {
        // Draw cute floating heart
        const s = this.size * 0.6;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s, -s * 0.6, -s * 1.4, s * 0.4, 0, s * 1.3);
        ctx.bezierCurveTo(s * 1.4, s * 0.4, s, -s * 0.6, 0, s * 0.3);
        ctx.fill();
      } else {
        // Draw delicate rose petal
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.quadraticCurveTo(this.size * 0.8, -this.size * 0.3, 0, this.size);
        ctx.quadraticCurveTo(-this.size * 0.8, -this.size * 0.3, 0, -this.size);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Initialize Particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animate);
  }

  animate();
})();
