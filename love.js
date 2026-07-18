/* ══════════════════════════════════════════════════════════════
   LOVE.JS — Romantic page logic: loader, particles, scroll
   reveal, confetti, 3D cards, cursor glow
══════════════════════════════════════════════════════════════ */

// ── LOADER ──
window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('love-loader');
  const main   = document.getElementById('love-main');

  setTimeout(() => {
    loader.classList.add('fade-out');
    main.classList.remove('love-hidden');
    initLoveCanvas();
    initLoveReveal();
    initLoveCursor();
    initLoveTilt();
  }, 2500);
});

// ── PARTICLE CANVAS (rose/pink theme) ──
function initLoveCanvas() {
  const canvas = document.getElementById('love-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = [
    'rgba(244,63,94,A)',
    'rgba(251,113,133,A)',
    'rgba(244,114,182,A)',
    'rgba(255,255,255,A)',
    'rgba(212,168,83,A)',
  ];

  const particles = Array.from({length: 85}, () => mkP());

  function mkP() {
    const alpha = Math.random() * 0.5 + 0.05;
    return {
      x:  Math.random() * (window.innerWidth  || 1200),
      y:  Math.random() * (window.innerHeight || 800),
      r:  Math.random() * 2.2 + 0.4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      color: COLORS[Math.floor(Math.random()*COLORS.length)].replace('A', alpha),
    };
  }

  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
        Object.assign(p, mkP());
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    // rose-tinted connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 90) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(244,63,94,${0.04*(1-d/90)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  })();
}

// ── SCROLL REVEAL ──
function initLoveReveal() {
  const reveals = document.querySelectorAll('.lv-reveal');
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 120);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  reveals.forEach(el => obs.observe(el));
}

// ── CURSOR ROSE GLOW ──
function initLoveCursor() {
  if (window.innerWidth <= 768) return;
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed; width:280px; height:280px;
    border-radius:50%;
    background:radial-gradient(circle, rgba(244,63,94,0.07) 0%, transparent 70%);
    pointer-events:none;
    transform:translate(-50%,-50%);
    z-index:1;
    transition:left 0.2s ease, top 0.2s ease;
  `;
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

// ── 3D CARD TILT ──
function initLoveTilt() {
  setTimeout(() => {
    document.querySelectorAll('.lv-card, .lv-reason, .lv-k-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const x  = (e.clientX - r.left) / r.width;
        const y  = (e.clientY - r.top)  / r.height;
        const tx = (y - 0.5) * 12;
        const ty = (x - 0.5) * -12;
        card.style.transform = `perspective(1000px) rotateX(${tx}deg) rotateY(${ty}deg) translateY(-8px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }, 3000);
}

// ── LOVE BURST CONFETTI ──
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('loveBurstBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    
    const loveMsgInput = document.getElementById('love-custom-msg');
    const message = loveMsgInput ? loveMsgInput.value.trim() : '';
    const errorEl = document.getElementById('love-msg-error');
    
    if (!message) {
      if (loveMsgInput) {
        loveMsgInput.classList.add('shake-error');
        loveMsgInput.focus();
        setTimeout(() => loveMsgInput.classList.remove('shake-error'), 400);
      }
      if (errorEl) {
        errorEl.classList.remove('hidden');
        errorEl.classList.add('shake-error');
        setTimeout(() => errorEl.classList.remove('shake-error'), 400);
      }
      return;
    }
    
    // Temporarily disable inputs
    if (loveMsgInput) {
      loveMsgInput.disabled = true;
    }
    if (errorEl) {
      errorEl.classList.add('hidden');
    }
    
    btn.textContent = '💕 Sending Love...';
    btn.disabled = true;
    
    // Log to sheet
    if (typeof sendToSheet === 'function') {
      sendToSheet('Send Love - Love Page', message);
    }
    
    triggerLoveBurst();
    
    // After 3 seconds, reset for sending another message
    setTimeout(() => {
      if (loveMsgInput) {
        loveMsgInput.value = '';
        loveMsgInput.disabled = false;
      }
      btn.disabled = false;
      btn.textContent = '💕 Send My Love!';
      btn.style.background = '';
      btn.style.boxShadow = '';
      btn.style.cursor = 'pointer';
    }, 3000);
  });

  const loveMsgInput = document.getElementById('love-custom-msg');
  if (loveMsgInput) {
    loveMsgInput.addEventListener('input', () => {
      const errorEl = document.getElementById('love-msg-error');
      if (errorEl) {
        errorEl.classList.add('hidden');
      }
    });
  }
});

function triggerLoveBurst() {
  const colors = ['#f43f5e','#fb7185','#f472b6','#f9a8d4','#fff','#d4a853','#fecdd3'];
  const emojis = ['💕','🌹','✨','💗','🌸','💫','🖤','💕'];

  // Confetti pieces
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'lv-confetti';
      piece.style.left   = Math.random() * 100 + 'vw';
      piece.style.top    = '-20px';
      piece.style.background = colors[Math.floor(Math.random()*colors.length)];
      piece.style.width  = (Math.random()*9+5)+'px';
      piece.style.height = (Math.random()*9+5)+'px';
      piece.style.borderRadius = Math.random()>0.4 ? '50%' : '2px';
      piece.style.animationDuration = (Math.random()*2+2)+'s';
      piece.style.animationDelay   = (Math.random()*0.5)+'s';
      document.body.appendChild(piece);
      setTimeout(()=>piece.remove(), 4500);
    }, i * 18);
  }

  // Floating emojis
  for (let i = 0; i < 14; i++) {
    setTimeout(() => {
      const e = document.createElement('div');
      e.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      e.style.cssText = `
        position:fixed; pointer-events:none; z-index:9999;
        font-size:${Math.random()*18+16}px;
        left:${Math.random()*80+10}vw;
        bottom:20vh;
        animation:lv-float-up 2.2s ease forwards;
        opacity:1;
      `;
      document.body.appendChild(e);
      setTimeout(()=>e.remove(), 2300);
    }, i*100);
  }

  // Inject float animation once
  if (!document.querySelector('[data-lv-anim]')) {
    const s = document.createElement('style');
    s.setAttribute('data-lv-anim','1');
    s.textContent = `
      @keyframes lv-float-up {
        0%   { transform:translateY(0) scale(1); opacity:1; }
        100% { transform:translateY(-65vh) scale(0.4); opacity:0; }
      }
    `;
    document.head.appendChild(s);
  }
}

// ── PARALLAX HERO ──
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.lv-hero');
  if (hero) hero.style.backgroundPositionY = window.scrollY * 0.4 + 'px';
});

// ── PIHU'S LOVE JAR INTERACTIVITY ──
document.addEventListener('DOMContentLoaded', () => {
  const LOVE_NOTES = [
    "The way you laugh, Pihu — it's the most beautiful sound in my world 😍",
    "Our late night conversations are my favourite part of every single day 🌙",
    "You're so strong, Pihu, even when you think you're not — I see it and admire it 🖤",
    "You challenge me, inspire me, and make me want to be a better person 🎯",
    "You feel like home — even from a thousand kilometres away, Pihu 💕",
    "Meeting you on WePlay was the best thing that ever happened to me, Pihu ✨",
    "You make even ordinary moments feel like something magical and warm 🌹",
    "I fall for you more every single day, and I wouldn't have it any other way 💖"
  ];

  const envelopes = document.querySelectorAll('.love-envelope:not(.video-envelope)');
  const modal     = document.getElementById('love-note-modal');
  const closeBtn  = document.getElementById('close-modal');
  const modalTitle = document.getElementById('modal-note-title');
  const modalText  = document.getElementById('modal-note-text');

  if (!modal || !closeBtn) return;

  envelopes.forEach(env => {
    env.addEventListener('click', () => {
      const index = parseInt(env.getAttribute('data-note') || '0');
      const noteContent = LOVE_NOTES[index] || "I love you! 💖";
      
      // Get envelope title safely (without the small sub-message text)
      const numEl = env.querySelector('.envelope-num');
      let cleanTitle = `Note #${index + 1}`;
      if (numEl) {
        const temp = numEl.cloneNode(true);
        const sub = temp.querySelector('.env-small-msg');
        if (sub) sub.remove();
        cleanTitle = temp.textContent.trim();
      }

      // Update modal text
      modalTitle.textContent = `${cleanTitle} 🖤`;
      modalText.textContent = noteContent;
      
      // Open modal
      modal.classList.add('active');
      
      // Add animation states
      env.classList.add('opened');
    });
  });

  // Close modal
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Close modal on click outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // ── SPECIAL VIDEO ENVELOPE CONTROLLER ──
  const videoEnv    = document.getElementById('video-envelope');
  const videoModal  = document.getElementById('love-video-modal');
  const videoClose  = document.getElementById('close-video-modal');
  const loveVideo   = document.getElementById('love-video');
  let wasPlayingBeforeVideo = false;

  if (videoEnv && videoModal && videoClose && loveVideo) {
    videoEnv.addEventListener('click', () => {
      const sharedAudio = document.getElementById('shared-bg-audio');
      
      // Save current state of background music and pause it
      if (sharedAudio) {
        wasPlayingBeforeVideo = !sharedAudio.paused;
        sharedAudio.pause();
        
        // Update floating widget visuals
        const eq = document.getElementById('sm-eq');
        const lb = document.getElementById('sm-widget-label');
        if (eq) eq.classList.add('paused');
        if (lb) lb.textContent = 'Paused';
      }

      // Show video modal and play
      videoModal.classList.add('active');
      videoEnv.classList.add('opened');
      loveVideo.currentTime = 0;
      loveVideo.play().catch(() => {});
    });

    function closeVideo() {
      videoModal.classList.remove('active');
      loveVideo.pause();

      // Resume background music if it was playing previously
      const sharedAudio = document.getElementById('shared-bg-audio');
      if (sharedAudio && wasPlayingBeforeVideo) {
        sharedAudio.play().catch(() => {});
        
        // Update widget visuals
        const eq = document.getElementById('sm-eq');
        const lb = document.getElementById('sm-widget-label');
        const songName = sessionStorage.getItem('selectedSongName') || 'Music';
        if (eq) eq.classList.remove('paused');
        if (lb) lb.textContent = songName;
      }
    }

    videoClose.addEventListener('click', closeVideo);
    
    // Close video on clicking outside modal box
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) {
        closeVideo();
      }
    });
  }

  // ── PIHU'S GALLERY LIGHTBOX & HEART REACTS ──
  const galleryMemories = [
    {
      title: "Captivating Smile",
      desc: "That smile has a way of brightening up even my darkest days. It's my absolute favourite sight. 💖",
      src: "Images/IMG_20260717_194022_803.webp"
    },
    {
      title: "Pure Elegance",
      desc: "The way you carry yourself with so much grace. You look like a dream, Pihu. ✨",
      src: "Images/IMG_20260717_194140_245.webp"
    },
    {
      title: "Those Beautiful Eyes",
      desc: "I could lose myself in your eyes forever. There's a whole universe in them. 👁️🖤",
      src: "Images/IMG_20260717_194144_463.webp"
    },
    {
      title: "Cute Moments",
      desc: "The cutest girl in the world. Every little expression of yours makes my heart skip a beat. 🌸",
      src: "Images/IMG_20260717_194147_258.webp"
    },
    {
      title: "Simply Stunning",
      desc: "No makeup, no filters, just you being your naturally gorgeous self. I'm so lucky. 💗",
      src: "Images/IMG_20260717_194151_064.webp"
    },
    {
      title: "My Heartbeat",
      desc: "This picture right here is a reminder of why you are, and always will be, the center of my universe. ♾️💕",
      src: "Images/IMG_20260718_021315.webp"
    }
  ];

  const galleryCards  = document.querySelectorAll('.love-gallery-card');
  const lightboxModal = document.getElementById('love-lightbox-modal');
  const lightboxClose = document.getElementById('close-lightbox');
  const lightboxImg   = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc  = document.getElementById('lightbox-desc');
  const lightboxPrev  = document.getElementById('lightbox-prev');
  const lightboxNext  = document.getElementById('lightbox-next');
  const lightboxLike  = document.getElementById('lightbox-like-btn');

  let currentPhotoIndex = 0;

  if (lightboxModal && lightboxClose && lightboxImg) {
    
    // Open Lightbox
    function openLightbox(index) {
      currentPhotoIndex = index;
      updateLightboxContent();
      lightboxModal.classList.add('active');
    }

    // Close Lightbox
    function closeLightbox() {
      lightboxModal.classList.remove('active');
    }

    // Update Lightbox image & texts
    function updateLightboxContent() {
      const photo = galleryMemories[currentPhotoIndex];
      if (!photo) return;
      
      // Temporarily hide image for smooth fade-in zoom
      lightboxImg.style.opacity = '0';
      lightboxImg.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        lightboxImg.src = photo.src;
        lightboxTitle.textContent = photo.title;
        lightboxDesc.textContent = photo.desc;
        lightboxImg.style.opacity = '1';
        lightboxImg.style.transform = 'scale(1)';
      }, 150);
    }

    // Nav: Next
    function nextPhoto() {
      currentPhotoIndex = (currentPhotoIndex + 1) % galleryMemories.length;
      updateLightboxContent();
    }

    // Nav: Prev
    function prevPhoto() {
      currentPhotoIndex = (currentPhotoIndex - 1 + galleryMemories.length) % galleryMemories.length;
      updateLightboxContent();
    }

    // Attach click events to gallery cards
    galleryCards.forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-index') || '0');
        openLightbox(idx);
      });
    });

    // Close button click
    lightboxClose.addEventListener('click', closeLightbox);

    // Navigation clicks
    if (lightboxNext) lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      nextPhoto();
    });
    if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      prevPhoto();
    });

    // Close lightbox on clicking outside modal content
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!lightboxModal.classList.contains('active')) return;
      if (e.key === 'ArrowRight') nextPhoto();
      else if (e.key === 'ArrowLeft') prevPhoto();
      else if (e.key === 'Escape') closeLightbox();
    });

    // ── LIGHTBOX LIKE BUTTON - HEART BURST EFFECT ──
    if (lightboxLike) {
      lightboxLike.addEventListener('click', (e) => {
        createHeartBurstAt(e.clientX, e.clientY);
        
        // Custom text updates for more cuteness
        const label = lightboxLike.querySelector('.like-label');
        if (label) {
          label.textContent = "Loved!";
          setTimeout(() => {
            label.textContent = "React with Love";
          }, 1500);
        }

        // Send a custom burst logs to sheets
        if (typeof sendToSheet === 'function') {
          const photo = galleryMemories[currentPhotoIndex];
          sendToSheet('Reacted Love to Photo', photo.title);
        }
      });
    }

    // Custom heart burst particle builder
    function createHeartBurstAt(clientX, clientY) {
      const heartCount = 20;
      const emojis = ['💕', '💖', '❤️', '🌸', '✨', '💘', '💗'];
      
      for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart-particle';
        heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        
        // Position at coordinates
        heart.style.left = clientX + 'px';
        heart.style.top = clientY + 'px';
        
        // Random drift direction (translate X and Y values)
        const tx = (Math.random() - 0.5) * 300;
        const ty = -100 - Math.random() * 200; // float upwards
        const rot = (Math.random() - 0.5) * 360; // rotation
        
        heart.style.setProperty('--tx', `${tx}px`);
        heart.style.setProperty('--ty', `${ty}px`);
        heart.style.setProperty('--rot', `${rot}deg`);
        
        // Random size and delay
        const scale = Math.random() * 0.8 + 0.6;
        heart.style.transform = `scale(${scale})`;
        heart.style.animationDelay = `${Math.random() * 0.15}s`;
        
        document.body.appendChild(heart);
        
        // Clean up
        setTimeout(() => heart.remove(), 1800);
      }
    }

    // Tap-to-explode heart effects directly on polaroid cards too!
    galleryCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.borderColor = 'var(--rose)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = '';
      });
    });
  }
});

