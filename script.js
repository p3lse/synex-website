// script.js - interactions for multi-page Synex site
document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll('.reveal');
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => obs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* Back to top */
  const back = document.getElementById('backToTop');
  if (back) {
    window.addEventListener('scroll', () => {
      back.style.display = window.scrollY > 400 ? 'block' : 'none';
    });
    back.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));
  }

  /* Theme toggle (persists in localStorage) */
  const themeButtons = document.querySelectorAll('#themeToggle, #themeToggleTop, #themeToggleApps, #themeToggleDonate');
  function applyTheme(theme) {
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
  }
  const saved = localStorage.getItem('synex_theme') || 'dark';
  applyTheme(saved);
  themeButtons.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem('synex_theme', next);
    });
  });

  /* Newsletter form (client-side only) */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[name="email"]').value.trim();
      const msg = document.getElementById('newsletterMsg');
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        msg.textContent = 'Please enter a valid email address.';
        msg.style.color = '#ffb4b4';
        return;
      }
      // No backend: show success message and clear field
      msg.textContent = 'Thanks — you are subscribed (demo).';
      msg.style.color = '#bfffcf';
      newsletterForm.reset();
    });
  }

  /* Carousel (testimonials) */
  const track = document.querySelector('.carousel-track');
  if (track) {
    const prev = document.querySelector('.carousel-prev');
    const next = document.querySelector('.carousel-next');
    const slides = Array.from(track.children);
    let index = 0;
    function updateCarousel() {
      const width = track.clientWidth;
      track.style.transform = `translateX(-${index * width}px)`;
    }
    window.addEventListener('resize', updateCarousel);
    if (prev) prev.addEventListener('click', () => { index = (index - 1 + slides.length) % slides.length; updateCarousel(); });
    if (next) next.addEventListener('click', () => { index = (index + 1) % slides.length; updateCarousel(); });
    // Auto-advance
    let auto = setInterval(() => { index = (index + 1) % slides.length; updateCarousel(); }, 6000);
    track.addEventListener('mouseenter', () => clearInterval(auto));
    track.addEventListener('mouseleave', () => { auto = setInterval(() => { index = (index + 1) % slides.length; updateCarousel(); }, 6000); });
    updateCarousel();
  }

  /* Ensure external links open safely */
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    if (!a.hasAttribute('rel')) a.setAttribute('rel', 'noopener noreferrer');
  });

  /* Keyboard focus visible helper */
  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.documentElement.classList.add('user-is-tabbing');
  });
});
