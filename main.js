/* ============================================================
   ORYX TECHNOLOGIES — main.js
   ============================================================ */

'use strict';

/* ---- Nav scroll ---- */
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---- Mobile nav ---- */
const burger  = document.querySelector('.nav-burger');
const mobileNav = document.querySelector('.nav-mobile');
if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });
  // Close on link click
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ---- Mobile dropdown toggle ---- */
document.querySelectorAll('.mobile-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const sub = btn.nextElementSibling;
    if (sub) sub.classList.toggle('open');
    btn.querySelector('.chevron')?.classList.toggle('rotated');
  });
});

/* ---- Scroll fade-in ---- */
const fadeEls = document.querySelectorAll('.fade-up');
if (fadeEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
  fadeEls.forEach(el => io.observe(el));
}

/* ---- 3D card tilt ---- */
document.querySelectorAll('.pcard[data-tilt]').forEach(card => {
  const STRENGTH = 4;
  card.addEventListener('mousemove', e => {
    const r   = card.getBoundingClientRect();
    const x   = (e.clientX - r.left) / r.width  - 0.5;
    const y   = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `translateY(-5px) rotateX(${-y * STRENGTH}deg) rotateY(${x * STRENGTH}deg)`;
    card.style.transition = 'box-shadow 0.15s ease, border-color 0.35s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease, box-shadow 0.35s ease, border-color 0.35s ease';
  });
});

/* ---- Form submission ---- */
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', function (e) {
    const btn  = this.querySelector('.form-submit');
    const orig = btn.textContent;
    btn.textContent  = 'Wird gesendet …';
    btn.disabled     = true;
    btn.style.opacity = '0.7';
    // Web3Forms handles the POST + redirect; this just gives UX feedback.
  });
}

/* ---- Smooth anchor offset (fixed nav) ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  const href = a.getAttribute('href');
  if (href.length <= 1) return; // "#" allein (z.B. Cookie-Einstellungen-Link) ist kein Sprungziel
  a.addEventListener('click', e => {
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

/* ---- Sprungziel beim Laden anspringen (z. B. Link von anderer Seite mit #anker) ----
   Nativer Anker-Sprung beim Seitenaufruf kann mit scroll-behavior:smooth kollidieren
   und dadurch inkonsistent ausfallen — deshalb explizit mit Nav-Offset nachgezogen. */
if (window.location.hash.length > 1) {
  window.addEventListener('load', () => {
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    const offset = 80;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
}

/* ---- Produktinteresse aus URL-Parameter vorauswählen (z. B. ?produkt=kabelkennzeichnung) ---- */
const produktSelect = document.getElementById('produkt');
if (produktSelect) {
  const produktParam = new URLSearchParams(window.location.search).get('produkt');
  if (produktParam && produktSelect.querySelector(`option[value="${produktParam}"]`)) {
    produktSelect.value = produktParam;
  }
}
