// Shared interactions for multi-page site
document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal on scroll
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

  // Back to top button
  const back = document.getElementById('backToTop');
  if (back) {
    window.addEventListener('scroll', () => {
      back.style.display = window.scrollY > 400 ? 'block' : 'none';
    });
    back.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));
  }

  // Keyboard focus visible polyfill for links
  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.documentElement.classList.add('user-is-tabbing');
  });

  // Ensure external links open safely
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    if (!a.hasAttribute('rel')) a.setAttribute('rel', 'noopener noreferrer');
  });
});
