// script.js - interactions for multi-page Synex site (updated)
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

  /* Ensure external links open safely */
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    if (!a.hasAttribute('rel')) a.setAttribute('rel', 'noopener noreferrer');
  });

  /* Keyboard focus visible helper */
  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.documentElement.classList.add('user-is-tabbing');
  });
});
// Auto-set active nav link
document.querySelectorAll('.top-nav a').forEach(a => {
  try {
    const href = new URL(a.href).pathname;
    if (href === location.pathname || (href === '/index.html' && location.pathname === '/')) {
      a.classList.add('active');
    }
  } catch(e){}
});
