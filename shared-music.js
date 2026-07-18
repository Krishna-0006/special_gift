/* ══════════════════════════════════════════════════════════════
   SHARED-MUSIC.JS
   Reads song path from sessionStorage and plays it on
   friend.html and love.html at device volume (1.0).
   Shows a floating music toggle widget.
══════════════════════════════════════════════════════════════ */
(function SharedMusic() {
  const VOLUME = 1.0;

  window.addEventListener('DOMContentLoaded', () => {
    const songSrc  = sessionStorage.getItem('selectedSong')     || '';
    const songName = sessionStorage.getItem('selectedSongName') || '';

    if (!songSrc) return; // User chose no music

    // ── Create hidden audio element ──
    const audio = document.createElement('audio');
    audio.src    = songSrc;
    audio.volume = VOLUME;
    audio.loop   = true;
    audio.id     = 'shared-bg-audio';
    document.body.appendChild(audio);

    // Restore saved playback position (so music doesn't restart from 0)
    const savedTime = parseFloat(sessionStorage.getItem('musicCurrentTime') || '0');
    
    function applySavedTime() {
      if (savedTime > 0 && savedTime < audio.duration) {
        audio.currentTime = savedTime;
      }
    }

    if (savedTime > 0) {
      audio.addEventListener('loadedmetadata', applySavedTime);
      audio.addEventListener('loadeddata', applySavedTime);
      audio.addEventListener('canplay', applySavedTime);
      audio.addEventListener('play', applySavedTime);
    }
    
    // Clear saved time so it doesn't affect future fresh page loads
    sessionStorage.removeItem('musicCurrentTime');

    // ── Auto-play on first user interaction (browser policy) ──
    let started = false;
    function tryPlay() {
      if (started) return;
      started = true;
      audio.play().catch(() => {});
      document.removeEventListener('click',     tryPlay);
      document.removeEventListener('touchstart', tryPlay);
      document.removeEventListener('keydown',    tryPlay);
    }
    // Try immediately
    audio.play().then(() => { started = true; }).catch(() => {});
    document.addEventListener('click',     tryPlay, { once: true });
    document.addEventListener('touchstart', tryPlay, { once: true });
    document.addEventListener('keydown',    tryPlay, { once: true });

    // ── Build floating widget ──
    const style = document.createElement('style');
    style.textContent = `
      #shared-music-widget {
        position: fixed;
        bottom: clamp(1rem, 3vw, 2rem);
        right: clamp(1rem, 3vw, 2rem);
        z-index: 9000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(212,168,83,0.1);
        border: 1px solid rgba(212,168,83,0.3);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 50px;
        padding: 0.45rem 0.9rem 0.45rem 0.65rem;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        font-family: 'Poppins', sans-serif;
        font-size: clamp(0.7rem, 2.5vw, 0.78rem);
        font-weight: 500;
        color: #f0c96e;
        -webkit-tap-highlight-color: transparent;
        max-width: calc(100vw - 3rem);
      }
      #shared-music-widget:hover { background: rgba(212,168,83,0.2); transform: translateY(-2px); }
      .sm-eq-bars { display: flex; align-items: flex-end; gap: 2px; height: 13px; flex-shrink: 0; }
      .sm-eq-bars span {
        width: 3px; background: #d4a853; border-radius: 2px;
        animation: sm-eq-anim 0.9s ease-in-out infinite;
      }
      .sm-eq-bars span:nth-child(1){height:5px; animation-delay:0s}
      .sm-eq-bars span:nth-child(2){height:10px;animation-delay:0.1s}
      .sm-eq-bars span:nth-child(3){height:13px;animation-delay:0.2s}
      .sm-eq-bars span:nth-child(4){height:7px; animation-delay:0.3s}
      .sm-eq-bars span:nth-child(5){height:11px;animation-delay:0.4s}
      .sm-eq-bars.paused span { animation-play-state: paused; opacity: 0.3; }
      @keyframes sm-eq-anim {
        0%,100%{transform:scaleY(0.4);opacity:0.5} 50%{transform:scaleY(1);opacity:1}
      }
      #sm-widget-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 130px;
      }
      @media(max-width:400px) { #sm-widget-label { max-width: 90px; } }
    `;
    document.head.appendChild(style);

    const widget = document.createElement('div');
    widget.id = 'shared-music-widget';
    widget.setAttribute('role', 'button');
    widget.setAttribute('aria-label', 'Toggle music');
    widget.innerHTML = `
      <div class="sm-eq-bars" id="sm-eq">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <span id="sm-widget-label">${songName || '🎵 Music'}</span>
    `;
    document.body.appendChild(widget);

    // Toggle play/pause
    let playing = true;
    widget.addEventListener('click', () => {
      const eq = document.getElementById('sm-eq');
      const lb = document.getElementById('sm-widget-label');
      if (playing) {
        audio.pause();
        playing = false;
        eq && eq.classList.add('paused');
        if (lb) lb.textContent = 'Paused';
      } else {
        audio.play().catch(() => {});
        playing = true;
        eq && eq.classList.remove('paused');
        if (lb) lb.textContent = songName || '🎵 Music';
      }
    });
  });
})();
