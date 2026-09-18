// ================================================================
// ASD Document Portal — app.js
// Slider, pause, dots, arrows, mobile nav
// ================================================================

const slides      = document.querySelectorAll('.slide');
const dots        = document.querySelectorAll('.dot');
const prevBtn     = document.getElementById('prevBtn');
const nextBtn     = document.getElementById('nextBtn');
const pauseBtn    = document.getElementById('pauseBtn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navList     = document.querySelector('.nav-list');

let current  = 0;
let total    = slides.length;
let autoplay = null;
let paused   = false;

// ── Go to slide ──────────────────────────────────────────────────
function goTo(index) {
  slides[current].classList.remove('active');
  dots[current].classList.remove('active');

  current = (index + total) % total;

  slides[current].classList.add('active');
  dots[current].classList.add('active');
}

// ── Autoplay ─────────────────────────────────────────────────────
function startAutoplay() {
  autoplay = setInterval(() => {
    if (!paused) goTo(current + 1);
  }, 5000);
}

function stopAutoplay() {
  clearInterval(autoplay);
}

// ── Arrow buttons ─────────────────────────────────────────────────
prevBtn.addEventListener('click', () => {
  goTo(current - 1);
  stopAutoplay();
  startAutoplay();
});

nextBtn.addEventListener('click', () => {
  goTo(current + 1);
  stopAutoplay();
  startAutoplay();
});

// ── Dot buttons ───────────────────────────────────────────────────
dots.forEach(dot => {
  dot.addEventListener('click', () => {
    goTo(parseInt(dot.dataset.index));
    stopAutoplay();
    startAutoplay();
  });
});

// ── Pause / Play button ───────────────────────────────────────────
pauseBtn.addEventListener('click', () => {
  paused = !paused;
  const icon = pauseBtn.querySelector('i');
  if (paused) {
    icon.className = 'fas fa-play';
    pauseBtn.setAttribute('aria-label', 'Play slider');
  } else {
    icon.className = 'fas fa-pause';
    pauseBtn.setAttribute('aria-label', 'Pause slider');
  }
});

// ── Touch / Swipe on slider ───────────────────────────────────────
const heroSlider = document.getElementById('heroSlider');
let touchStartX = 0;

heroSlider.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

heroSlider.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].screenX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) goTo(current + 1);
    else          goTo(current - 1);
    stopAutoplay();
    startAutoplay();
  }
});

// ── Keyboard nav on slider ────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  { goTo(current - 1); stopAutoplay(); startAutoplay(); }
  if (e.key === 'ArrowRight') { goTo(current + 1); stopAutoplay(); startAutoplay(); }
});

// ── Mobile nav ────────────────────────────────────────────────────
mobileMenuBtn && mobileMenuBtn.addEventListener('click', () => {
  navList.classList.toggle('mobile-open');
  const isOpen = navList.classList.contains('mobile-open');
  mobileMenuBtn.innerHTML = isOpen
    ? '<i class="fas fa-times"></i>'
    : '<i class="fas fa-bars"></i>';
});

// Close mobile nav on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('.main-nav')) {
    navList.classList.remove('mobile-open');
    if (mobileMenuBtn) mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
  }
});

// ── Nav active link ───────────────────────────────────────────────
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function () {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

// ── Start autoplay ────────────────────────────────────────────────
startAutoplay();
