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

function tagContentForAnimation() {
  const targets = document.querySelectorAll(
    'main h1, main h2, main h3, main p, main img, main li, main blockquote, main .barra-vertical'
  );
  targets.forEach((el) => {
    if (!el.dataset.animate) {
      el.dataset.animate = 'fade-up';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  tagContentForAnimation();
  initBackToTop();
  initSmoothScroll();
  initScrollAnimations(); // já inicializa para evitar flash ao sair do loader
});

let scrollAnimationsInitialized = false;

function initScrollAnimations() {
  if (scrollAnimationsInitialized) return;
  if (!window.gsap) return;
  scrollAnimationsInitialized = true;

  const elements = Array.from(document.querySelectorAll('[data-animate="fade-up"]')).filter(
    (el) => {
      const styles = getComputedStyle(el);
      const hasBgImage = styles.backgroundImage && styles.backgroundImage !== 'none';
      const hasBgColor =
        styles.backgroundColor &&
        styles.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
        styles.backgroundColor !== 'transparent';
      return !(hasBgImage || hasBgColor);
    }
  );

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.dataset.animated !== 'true') {
          const delay = Number(entry.target.dataset.animationDelay || 0);
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power2.out',
            delay,
            onComplete: () => {
              entry.target.style.willChange = 'auto';
            }
          });
          entry.target.dataset.animated = 'true';
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach((el, index) => {
    if (el.dataset.animated === 'true') return;
    gsap.set(el, { opacity: 0, y: 24 });
    el.style.willChange = 'opacity, transform';
    el.dataset.animationDelay = (index * 0.02).toFixed(2);
    observer.observe(el);
  });
}

function initPreloader(afterReveal) {
  const preloader = document.getElementById('preloader');
  const pageContent = document.getElementById('pageContent');
  const body = document.body;
  const finish = () => {
    body.classList.remove('is-loading');
    if (pageContent) {
      pageContent.removeAttribute('aria-hidden');
      pageContent.style.opacity = '1';
      pageContent.style.transform = 'none';
    }
    if (preloader) preloader.remove();
    if (typeof afterReveal === 'function') afterReveal();
  };

  if (!preloader || !pageContent) {
    finish();
    return;
  }

  if (!window.gsap) {
    setTimeout(finish, 3000);
    return;
  }

  gsap.fromTo(
    '.preloader-logo',
    { scale: 0.94 },
    { scale: 1.06, duration: 0.9, yoyo: true, repeat: 2, ease: 'sine.inOut' }
  );

  setTimeout(() => {
    gsap
      .timeline({ defaults: { ease: 'power2.out' } })
      .to(preloader, {
        opacity: 0,
        duration: 0.6,
        onComplete: () => preloader.remove()
      })
      .to(
        pageContent,
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          clearProps: 'all',
          onStart: () => {
            pageContent.removeAttribute('aria-hidden');
            body.classList.remove('is-loading');
          }
        },
        '-=0.3'
      )
      .add(() => {
        if (typeof afterReveal === 'function') afterReveal();
      });
  }, 3000);
}

// Registrar Service Worker para cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch((err) => {
    console.log('Service Worker registration failed:', err);
  });
}

// Verificar se é primeira visita
const isFirstVisit = !sessionStorage.getItem('netwars-visited');

window.addEventListener('load', () => {
  if (isFirstVisit) {
    // Primeira visita: mostrar preloader
    sessionStorage.setItem('netwars-visited', 'true');
    initPreloader(() => {
      initScrollAnimations();
    });
  } else {
    // Visitas subsequentes: pular preloader
    const pageContent = document.getElementById('pageContent');
    const preloader = document.getElementById('preloader');
    const body = document.body;
    
    if (preloader) preloader.remove();
    if (pageContent) {
      pageContent.removeAttribute('aria-hidden');
      pageContent.style.opacity = '1';
      pageContent.style.transform = 'none';
    }
    body.classList.remove('is-loading');
    
    initScrollAnimations();
  }
});

