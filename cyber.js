/* ================================================================
   cyber.js — Cyber.gov.au Homepage Interactions
   ================================================================ */

'use strict';

/* ── Slider State ─────────────────────────────────────────────── */
const slides   = document.querySelectorAll('.hero__slide');
const dots     = document.querySelectorAll('.hero__dot');
const prevBtn  = document.getElementById('heroPrev');
const nextBtn  = document.getElementById('heroNext');
const pauseBtn = document.getElementById('heroPause');

let current  = 0;
let total    = slides.length;
let timer    = null;
let isPaused = false;

function goTo(idx) {
  slides[current].classList.remove('active');
  dots[current].classList.remove('active');
  dots[current].setAttribute('aria-selected', 'false');

  current = (idx + total) % total;

  slides[current].classList.add('active');
  dots[current].classList.add('active');
  dots[current].setAttribute('aria-selected', 'true');
}

function startAuto() {
  stopAuto();
  if (!isPaused) {
    timer = setInterval(() => goTo(current + 1), 5500);
  }
}

function stopAuto() { clearInterval(timer); }

/* Arrow buttons */
prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

/* Dot buttons */
dots.forEach(dot => {
  dot.addEventListener('click', () => {
    goTo(parseInt(dot.dataset.idx));
    startAuto();
  });
});

/* Pause / play */
pauseBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  const icon = pauseBtn.querySelector('i');
  if (isPaused) {
    stopAuto();
    icon.className = 'fas fa-play';
    pauseBtn.setAttribute('aria-label', 'Play slideshow');
  } else {
    icon.className = 'fas fa-pause';
    pauseBtn.setAttribute('aria-label', 'Pause slideshow');
    startAuto();
  }
});

/* Touch / swipe */
let tx = 0;
const heroEl = document.querySelector('.hero');
heroEl.addEventListener('touchstart', e => { tx = e.changedTouches[0].screenX; }, { passive: true });
heroEl.addEventListener('touchend', e => {
  const dx = tx - e.changedTouches[0].screenX;
  if (Math.abs(dx) > 50) { goTo(dx > 0 ? current + 1 : current - 1); startAuto(); }
});

/* Keyboard */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  { goTo(current - 1); startAuto(); }
  if (e.key === 'ArrowRight') { goTo(current + 1); startAuto(); }
});

startAuto();

/* ── Search Toggle ────────────────────────────────────────────── */
const searchToggle = document.getElementById('searchToggle');
const searchBar    = document.getElementById('searchBar');
const siteSearch   = document.getElementById('siteSearch');

searchToggle.addEventListener('click', () => {
  const hidden = searchBar.hidden;
  searchBar.hidden = !hidden;
  if (!hidden === false) {  // now visible
    setTimeout(() => siteSearch && siteSearch.focus(), 60);
  }
  searchToggle.setAttribute('aria-expanded', String(!hidden));
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { searchBar.hidden = true; }
});

/* ── Mobile Nav ───────────────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const primaryNav = document.getElementById('primaryNav');
const navList    = document.getElementById('navList');

hamburger && hamburger.addEventListener('click', () => {
  const open = navList.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});

/* Close mobile nav on outside click */
document.addEventListener('click', e => {
  if (!e.target.closest('.primary-nav') && !e.target.closest('.hamburger')) {
    navList.classList.remove('open');
    hamburger && hamburger.classList.remove('open');
  }
});

/* ── Active nav link ──────────────────────────────────────────── */
document.querySelectorAll('.nav-item__link').forEach(link => {
  link.addEventListener('click', function (e) {
    // Don't follow link for demo
    // e.preventDefault();
    document.querySelectorAll('.nav-item__link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

/* ── Smooth Back to Top ───────────────────────────────────────── */
document.querySelectorAll('.back-to-top').forEach(btn => {
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});

/* ── Sticky header shadow on scroll ─────────────────────────────*/
const primaryNavEl = document.querySelector('.primary-nav');
window.addEventListener('scroll', () => {
  primaryNavEl.style.boxShadow = window.scrollY > 5
    ? '0 3px 16px rgba(0,0,0,.12)'
    : '0 2px 10px rgba(0,0,0,.07)';
}, { passive: true });
