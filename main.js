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
    // Formspree handles the POST; this just gives UX feedback.
    // If the action is still the placeholder, prevent submit and warn.
    if (this.action.includes('XXXXXXXX')) {
      e.preventDefault();
      alert('Formspree-ID noch nicht eingetragen. Bitte action-Attribut im Kontaktformular ersetzen.');
      btn.textContent = orig;
      btn.disabled    = false;
      btn.style.opacity = '';
    }
  });
}

/* ---- Smooth anchor offset (fixed nav) ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});
