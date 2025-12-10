// Utilitários globais (back-to-top e rolagem suave)

function initBackToTop(buttonId = 'backToTop', offset = 300) {
  const backToTopButton = document.getElementById(buttonId);
  if (!backToTopButton) return;

  const toggleVisibility = () => {
    if (window.pageYOffset > offset) {
      backToTopButton.classList.add('show');
    } else {
      backToTopButton.classList.remove('show');
    }
  };

  toggleVisibility();
  window.addEventListener('scroll', toggleVisibility, { passive: true });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initSmoothScroll(selector = 'a[href^="#"]') {
  const links = document.querySelectorAll(selector);
  if (!links.length) return;

  links.forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        event.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initBackToTop();
  initSmoothScroll();
});

