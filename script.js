// Lightweight interactions: smooth scroll, reveal, FAQ accordion, modal, back-to-top

document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Smooth scroll for internal links with data-scroll
  document.querySelectorAll('a[data-scroll]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const href = a.getAttribute('href');
      const target = document.querySelector(href);
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
      // update active nav
      document.querySelectorAll('.top-nav a').forEach(n => n.classList.remove('active'));
      a.classList.add('active');
    });
  });

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          o.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => obs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach((btn, i) => {
    const panel = btn.nextElementSibling;
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      if (expanded) {
        panel.hidden = true;
      } else {
        panel.hidden = false;
      }
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Back to top
  const back = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) back.style.display = 'block'; else back.style.display = 'none';
  });
  back.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));

  // Staff modal (example usage: you can wire staff cards to open modal)
  const modal = document.getElementById('staffModal');
  const modalClose = modal.querySelector('.modal-close');
  const staffDetails = document.getElementById('staffDetails');

  function openStaffModal(html) {
    staffDetails.innerHTML = html;
    modal.setAttribute('aria-hidden', 'false');
    modal.querySelector('.modal-close').focus();
  }
  function closeStaffModal() {
    modal.setAttribute('aria-hidden', 'true');
    staffDetails.innerHTML = '';
  }
  modalClose.addEventListener('click', closeStaffModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeStaffModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeStaffModal(); });

  // Example: attach to staff card (if you add staff cards later)
  // document.querySelectorAll('.staff-card').forEach(card => {
  //   card.addEventListener('click', () => openStaffModal('<h3>Staff Name</h3><p>Role details...</p>'));
  // });
});
