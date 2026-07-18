/* ============================================================
   SCRIPT.JS — Particles, Loader, Scroll Reveal, Confetti
   ============================================================ */

// ─────────────────────────────────────────────────────────────
//  LOADER
// ─────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const main   = document.getElementById('main');

  setTimeout(() => {
    loader.classList.add('fade-out');
    main.classList.remove('hidden');
    initParticles();
    initScrollReveal();
    // Music is handled by shared-music.js (loaded before this script)
  }, 2500);
});

// ─────────────────────────────────────────────────────────────
//  PARTICLE CANVAS
// ─────────────────────────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx    = canvas.getContext('2d');

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  const PARTICLE_COUNT = 80;
  const particles = [];

  const COLORS = [
    'rgba(212,168,83,ALPHA)',
    'rgba(139,92,246,ALPHA)',
    'rgba(244,114,182,ALPHA)',
    'rgba(255,255,255,ALPHA)',
  ];

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x     = Math.random() * canvas.width;
      this.y     = Math.random() * canvas.height;
      this.size  = Math.random() * 2.5 + 0.5;
      this.speedX= (Math.random() - 0.5) * 0.4;
      this.speedY= (Math.random() - 0.5) * 0.4;
      this.alpha = Math.random() * 0.6 + 0.1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)].replace('ALPHA', this.alpha);
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width ||
          this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });

    // Draw subtle connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(212,168,83,${0.05 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}

// ─────────────────────────────────────────────────────────────
//  SCROLL REVEAL
// ─────────────────────────────────────────────────────────────
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 120);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  reveals.forEach(el => observer.observe(el));
}

// ─────────────────────────────────────────────────────────────
//  CONFETTI BURST
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('confettiBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;

      const friendMsgInput = document.getElementById('friend-custom-msg');
      const message = friendMsgInput ? friendMsgInput.value.trim() : '';
      const errorEl = document.getElementById('friend-msg-error');

      if (!message) {
        if (friendMsgInput) {
          friendMsgInput.classList.add('shake-error');
          friendMsgInput.focus();
          setTimeout(() => friendMsgInput.classList.remove('shake-error'), 400);
        }
        if (errorEl) {
          errorEl.classList.remove('hidden');
          errorEl.classList.add('shake-error');
          setTimeout(() => errorEl.classList.remove('shake-error'), 400);
        }
        return;
      }

      // Temporarily disable inputs
      if (friendMsgInput) {
        friendMsgInput.disabled = true;
      }
      if (errorEl) {
        errorEl.classList.add('hidden');
      }

      btn.innerHTML = '<span>💖 Sending...</span>';
      btn.disabled = true;

      // Log to sheet
      if (typeof sendToSheet === 'function') {
        sendToSheet('Send Love - Friend Page', message);
      }

      triggerConfetti();

      // floating hearts burst
      for (let i = 0; i < 12; i++) {
        setTimeout(() => createFloatingHeart(), i * 100);
      }

      // After 3 seconds, reset for sending another message
      setTimeout(() => {
        if (friendMsgInput) {
          friendMsgInput.value = '';
          friendMsgInput.disabled = false;
        }
        btn.disabled = false;
        btn.innerHTML = '<span>🎉 Send Love!</span>';
        btn.style.background = '';
        btn.style.cursor = 'pointer';
      }, 3000);
    });

    const friendMsgInput = document.getElementById('friend-custom-msg');
    if (friendMsgInput) {
      friendMsgInput.addEventListener('input', () => {
        const errorEl = document.getElementById('friend-msg-error');
        if (errorEl) {
          errorEl.classList.add('hidden');
        }
      });
    }
  }
});

function triggerConfetti() {
  const colors = ['#d4a853', '#8b5cf6', '#f472b6', '#ffffff', '#a78bfa', '#fae9b0', '#000000'];
  for (let i = 0; i < 120; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left       = Math.random() * 100 + 'vw';
      piece.style.top        = '-20px';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width      = (Math.random() * 10 + 6) + 'px';
      piece.style.height     = (Math.random() * 10 + 6) + 'px';
      piece.style.borderRadius= Math.random() > 0.5 ? '50%' : '2px';
      piece.style.animationDuration   = (Math.random() * 2 + 2) + 's';
      piece.style.animationDelay      = Math.random() * 0.5 + 's';
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 4000);
    }, i * 20);
  }
}

function createFloatingHeart() {
  const heart = document.createElement('div');
  heart.textContent = ['🖤','🌸','💜','⭐','🥟','🏔️'][Math.floor(Math.random() * 6)];
  heart.style.cssText = `
    position: fixed;
    font-size: ${Math.random() * 20 + 16}px;
    left: ${Math.random() * 80 + 10}vw;
    bottom: 20vh;
    z-index: 9999;
    pointer-events: none;
    animation: floatUp 2s ease forwards;
    opacity: 1;
  `;
  document.body.appendChild(heart);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatUp {
      0%   { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-60vh) scale(0.5); opacity: 0; }
    }
  `;
  if (!document.querySelector('style[data-float]')) {
    style.setAttribute('data-float', '1');
    document.head.appendChild(style);
  }
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 2200);
}

// ─────────────────────────────────────────────────────────────
//  SMOOTH HERO PARALLAX
// ─────────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero-section');
  if (hero) {
    const scrollY = window.scrollY;
    hero.style.backgroundPositionY = scrollY * 0.4 + 'px';
  }
});

// ─────────────────────────────────────────────────────────────
//  INTERACTIVE CURSOR GLOW (desktop)
// ─────────────────────────────────────────────────────────────
if (window.innerWidth > 768) {
  const cursorGlow = document.createElement('div');
  cursorGlow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%);
    pointer-events: none;
    transform: translate(-50%, -50%);
    z-index: 1;
    transition: left 0.2s ease, top 0.2s ease;
  `;
  document.body.appendChild(cursorGlow);

  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top  = e.clientY + 'px';
  });
}

// Music is handled by shared-music.js using real MP3 files from /Music folder

// ─────────────────────────────────────────────────────────────
//  TYPEWRITER EFFECT FOR HERO SUBTITLE
// ─────────────────────────────────────────────────────────────
setTimeout(() => {
  const subtitle = document.querySelector('.hero-subtitle');
  if (subtitle) {
    const text = subtitle.innerHTML;
    subtitle.innerHTML = '';
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        subtitle.innerHTML += text[i];
        i++;
      } else {
        clearInterval(timer);
      }
    }, 35);
  }
}, 3500);

// ─────────────────────────────────────────────────────────────
//  CARD TILT EFFECT (3D on hover)
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const cards = document.querySelectorAll('.love-card, .reason-card, .k-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (y - 0.5) * 10;
        const tiltY = (x - 0.5) * -10;
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }, 3000);
});
