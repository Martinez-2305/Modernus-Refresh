/* ── Section entrance animations (repeatable) ────────────────────────── */
const sectEls = document.querySelectorAll('.sect-anim');
const sectObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.transition = '';
      e.target.classList.add('in-view');
    } else {
      e.target.style.transition = 'none';
      e.target.classList.remove('in-view');
      void e.target.offsetHeight;
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
sectEls.forEach(el => sectObserver.observe(el));

/* ── Scroll reveal (repeatable, left + right) ────────────────────────── */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.transition = '';
      e.target.classList.add('visible');
    } else {
      e.target.style.transition = 'none';
      e.target.classList.remove('visible');
      void e.target.offsetHeight;
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

/* ── About image scroll reveal ───────────────────────────────────────── */
const aboutImg  = document.querySelector('.about-img');
const aboutWrap = document.querySelector('.about-img-wrap');

function updateAboutReveal() {
  if (!aboutWrap || !aboutImg) return;
  const rect    = aboutWrap.getBoundingClientRect();
  const windowH = window.innerHeight;
  const inView  = rect.top < windowH * 0.85;
  if (inView) {
    aboutImg.classList.add('revealed');
  } else {
    aboutImg.style.transition = 'none';
    aboutImg.classList.remove('revealed');
    void aboutImg.offsetHeight;
    aboutImg.style.transition = '';
  }
}
window.addEventListener('scroll', updateAboutReveal, { passive: true });
updateAboutReveal();

/* ── Contact form submit ─────────────────────────────────────────────── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('.form-submit');
    btn.textContent = '✓ Message Sent!';
    btn.style.background = 'rgb(60,140,60)';
    btn.style.borderColor = 'rgb(60,140,60)';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.disabled = false;
      this.reset();
    }, 3500);
  });
}

/* ── Circular stat animations ────────────────────────────────────────── */
const CIRCUMFERENCE = 238.76;
const statArcs  = document.querySelectorAll('.why-arc');
const statNums  = document.querySelectorAll('.why-pct-num');
const whyRight  = document.querySelector('.why-right');

function animateStats(play) {
  statArcs.forEach(arc => {
    const pct = parseInt(arc.dataset.pct, 10);
    arc.style.strokeDashoffset = play
      ? CIRCUMFERENCE * (1 - pct / 100)
      : CIRCUMFERENCE;
  });
  statNums.forEach(num => {
    const target = parseInt(num.dataset.target, 10);
    if (!play) { num.textContent = '0%'; return; }
    let start = null;
    const duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      num.textContent = Math.round(progress * target) + '%';
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

if (whyRight) {
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      animateStats(e.isIntersecting);
    });
  }, { threshold: 0.3 });
  statsObserver.observe(whyRight);
}

/* ── Hamburger menu ──────────────────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

function openMenu() {
  mobileMenu.classList.add('open');
  hamburger.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});

/* Close when a nav link is tapped */
mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

/* Close when tapping the backdrop */
mobileMenu.addEventListener('click', (e) => {
  if (e.target === mobileMenu) closeMenu();
});

/* ── Portfolio cards: tap to reveal on touch devices ────────────────── */
const portfolioCards = document.querySelectorAll('.portfolio-card');

portfolioCards.forEach(card => {
  card.addEventListener('touchend', (e) => {
    const isActive = card.classList.contains('touch-active');
    /* Deactivate any other open card first */
    portfolioCards.forEach(c => c.classList.remove('touch-active'));
    if (!isActive) {
      card.classList.add('touch-active');
      e.preventDefault();
    }
  });
});

/* Tapping anywhere else closes open cards */
document.addEventListener('touchend', (e) => {
  if (!e.target.closest('.portfolio-card')) {
    portfolioCards.forEach(c => c.classList.remove('touch-active'));
  }
});
