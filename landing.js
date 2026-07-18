/* ══════════════════════════════════════════════════════════════
   LANDING.JS — Birthday gate + Music selector + Choice screen
   Clean rewrite: no volume control, reliable dropdown & music.
══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// CANVAS PARTICLES
// ─────────────────────────────────────────────────────────────
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = [
    'rgba(212,168,83,A)',
    'rgba(139,92,246,A)',
    'rgba(244,114,182,A)',
    'rgba(255,255,255,A)',
  ];
  function mkP() {
    const a = Math.random() * 0.45 + 0.05;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)].replace('A', a),
    };
  }
  const particles = Array.from({ length: 70 }, mkP);

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
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 80) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(212,168,83,${0.04 * (1 - d / 80)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  })();
})();

// ─────────────────────────────────────────────────────────────
// SONG LABELS
// ─────────────────────────────────────────────────────────────
const SONG_LABELS = {
  'Music/Aarzu.mp3': 'Aarzu',
  'Music/Arz Kiya Hai Coke Studio Bharat.mp3': 'Arz Kiya Hai',
  'Music/Lo Maan Liya.mp3': 'Lo Maan Liya',
  'Music/Phir Bhi Tumko Chaahunga.mp3': 'Phir Bhi Tumko Chaahunga',
  'Music/Phir Mohabbat.mp3': 'Phir Mohabbat',
  'Music/Thodi Jagah (From Marjaavaan).mp3': 'Thodi Jagah',
};

// ─────────────────────────────────────────────────────────────
// DOM REFS
// ─────────────────────────────────────────────────────────────
const bdayOverlay = document.getElementById('birthday-overlay');
const musicOverlay = document.getElementById('music-overlay');
const choiceScreen = document.getElementById('choice-screen');
const bdayInput = document.getElementById('bday-input');
const bdaySubmit = document.getElementById('bday-submit');
const bdayError = document.getElementById('bday-error');
const bdayHint = document.getElementById('bday-hint');
const musicDropdown = document.getElementById('music-dropdown');
const miniPlayer = document.getElementById('mini-player');
const miniSongName = document.getElementById('mini-song-name');
const musicConfirm = document.getElementById('music-confirm');
const bgAudio = document.getElementById('bg-audio');
const musicWidget = document.getElementById('music-widget');
const musicToggle = document.getElementById('music-toggle-btn');
const mwLabel = document.getElementById('mw-label');
const mwEq = document.querySelector('.mw-eq');

// ─────────────────────────────────────────────────────────────
// BIRTHDAY GATE
// ─────────────────────────────────────────────────────────────
const CORRECT_BIRTHDAY = '07/12/2005';
let wrongAttempts = 0;

bdayInput.addEventListener('input', (e) => {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
  if (v.length > 5) v = v.slice(0, 5) + '/' + v.slice(5);
  if (v.length > 10) v = v.slice(0, 10);
  e.target.value = v;
  bdayError.classList.add('hidden');
  bdayInput.classList.remove('error');
});

bdayInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') bdaySubmit.click();
});

bdaySubmit.addEventListener('click', () => {
  const raw = bdayInput.value.trim();
  const parts = raw.split('/');
  if (parts.length !== 3) { showBdayError(); return; }
  const [d, m, y] = parts;
  const norm = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  if (norm === CORRECT_BIRTHDAY) {
    bdayOverlay.classList.add('exit');
    sessionStorage.setItem('birthdayPassed', 'true');
    setTimeout(() => {
      window.location.hash = 'song';
    }, 500);
  } else {
    showBdayError();
  }
});

function showBdayError() {
  wrongAttempts++;
  bdayInput.classList.add('error');
  bdayError.classList.remove('hidden');
  setTimeout(() => bdayInput.classList.remove('error'), 600);
  if (wrongAttempts >= 2) bdayHint.classList.remove('hidden');
}

// ─────────────────────────────────────────────────────────────
// MUSIC POPUP
// ─────────────────────────────────────────────────────────────
function openMusicPopup() {
  musicOverlay.classList.add('active');
}

musicDropdown.addEventListener('change', () => {
  const val = musicDropdown.value;
  if (!val) {
    miniPlayer.classList.add('hidden');
    musicConfirm.disabled = true;
    return;
  }
  musicConfirm.disabled = false;
  miniSongName.textContent = SONG_LABELS[val] || val;
  miniPlayer.classList.remove('hidden');
});

musicConfirm.addEventListener('click', () => {
  const val = musicDropdown.value;
  if (!val) return;
  sessionStorage.setItem('selectedSong', val);
  sessionStorage.setItem('selectedSongName', SONG_LABELS[val] || val);
  musicOverlay.classList.add('exit');
  setTimeout(() => {
    window.location.hash = 'choice';
  }, 500);
});

// ─────────────────────────────────────────────────────────────
// CHOICE SCREEN
// ─────────────────────────────────────────────────────────────
function showChoiceScreen() {
  choiceScreen.classList.remove('hidden');
  requestAnimationFrame(() => choiceScreen.classList.add('visible'));
  // Homepage stays completely silent (no music widget shown)
}


// ─────────────────────────────────────────────────────────────
// PROPOSAL INTERACTIVE WIDGET
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const btnYes = document.getElementById('btn-love-yes');
  const btnNo = document.getElementById('btn-love-no');
  const magicWrap = document.getElementById('proposal-magic-wrap');
  const magicInput = document.getElementById('magic-input');
  const magicSubmit = document.getElementById('magic-submit');
  const magicError = document.getElementById('magic-error');

  if (!btnYes || !btnNo) return;

  // Click NO -> Redirect to Best Friend page
  btnNo.addEventListener('click', () => {
    fadeNavigate('friend.html');
  });

  // Click YES -> Reveal the secret input box
  btnYes.addEventListener('click', () => {
    magicWrap.classList.remove('hidden');
    magicWrap.classList.add('animate-slide-down');
    magicInput.focus();
  });

  // Check magical text input
  function checkMagicalText() {
    const val = magicInput.value.toLowerCase().trim();

    // Forgiving checks: "i love you", "i love you ", "iloveyou"
    if (val.includes('i love you') || val.replace(/\s+/g, '') === 'iloveyou') {
      magicError.classList.add('hidden');
      fadeNavigate('love.html');
    } else {
      magicError.classList.remove('hidden');
      magicError.classList.add('shake-anim');
      setTimeout(() => magicError.classList.remove('shake-anim'), 500);
    }
  }

  magicSubmit.addEventListener('click', checkMagicalText);
  magicInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkMagicalText();
  });

  function fadeNavigate(href) {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '0';
    setTimeout(() => {
      window.location.href = href;
    }, 500);
  }
});

// ─────────────────────────────────────────────────────────────
// NAVIGATION STATE / ROUTING (Hash Based)
// ─────────────────────────────────────────────────────────────
function handleNavigationState() {
  const hash = window.location.hash;
  
  // Hide all screens to reset before matching
  bdayOverlay.classList.remove('active', 'exit');
  bdayOverlay.style.display = '';
  musicOverlay.classList.remove('active', 'exit');
  musicOverlay.style.display = '';
  choiceScreen.classList.add('hidden');
  choiceScreen.classList.remove('visible');

  // Hide proposal magic inputs as well
  const magicWrap = document.getElementById('proposal-magic-wrap');
  if (magicWrap) magicWrap.classList.add('hidden');
  const magicInput = document.getElementById('magic-input');
  if (magicInput) magicInput.value = '';

  if (hash === '#choice') {
    // If she hasn't unlocked the birthday, force back to birthday
    if (sessionStorage.getItem('birthdayPassed') !== 'true') {
      window.location.hash = 'birthday';
      return;
    }
    showChoiceScreen();
  } else if (hash === '#song') {
    // If she hasn't unlocked the birthday, force back to birthday
    if (sessionStorage.getItem('birthdayPassed') !== 'true') {
      window.location.hash = 'birthday';
      return;
    }
    openMusicPopup();
  } else {
    // Default to birthday gate (either #birthday or empty)
    bdayOverlay.classList.add('active');
  }
}

// Bind navigation listeners
window.addEventListener('hashchange', handleNavigationState);
document.addEventListener('DOMContentLoaded', () => {
  // Check the initial state on load
  handleNavigationState();
});

// Reset body opacity in case page is restored from back-forward cache (bfcache)
window.addEventListener('pageshow', (event) => {
  document.body.style.opacity = '1';
});
