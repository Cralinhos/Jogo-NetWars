class MobileNavbar {
  constructor(mobileMenu, navList, navLinks) {
    this.mobileMenu = document.querySelector(mobileMenu);
    this.navList = document.querySelector(navList);
    this.navLinks = document.querySelectorAll(navLinks);
    this.activeClass = "active";
    this.isOpen = false;
    
    // Criar overlay se não existir
    this.createOverlay();

    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  createOverlay() {
    // Verificar se já existe um overlay
    if (!document.querySelector('.menu-overlay')) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'menu-overlay';
      this.overlay.addEventListener('click', this.handleClick);
      document.body.appendChild(this.overlay);
    } else {
      this.overlay = document.querySelector('.menu-overlay');
    }
  }

  animateLinks() {
    this.navLinks.forEach((link, index) => {
      if (link.style.animation) {
        link.style.animation = "";
      } else {
        link.style.animation = `navLinkFade 0.5s ease forwards ${
          index / 7 + 0.3
        }s`;
      }
    });
  }

  handleClick() {
    this.isOpen = !this.isOpen;
    this.navList.classList.toggle(this.activeClass);
    this.mobileMenu.classList.toggle(this.activeClass);
    this.overlay.classList.toggle(this.activeClass);
    this.animateLinks();
    
    // Atualizar aria-expanded para acessibilidade
    this.mobileMenu.setAttribute('aria-expanded', this.isOpen);
    
    // Adicionar/remover listener para cliques fora do menu
    if (this.isOpen) {
      document.addEventListener('click', this.handleOutsideClick);
      document.addEventListener('keydown', this.handleEscapeKey);
      // Prevenir scroll do body
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('click', this.handleOutsideClick);
      document.removeEventListener('keydown', this.handleEscapeKey);
      // Restaurar scroll do body
      document.body.style.overflow = 'auto';
    }
  }

  handleKeyPress(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleClick();
    }
  }

  handleEscapeKey = (event) => {
    if (event.key === 'Escape' && this.isOpen) {
      this.handleClick();
    }
  }

  handleOutsideClick = (event) => {
    if (this.isOpen && 
        !this.mobileMenu.contains(event.target) && 
        !this.navList.contains(event.target) &&
        !this.overlay.contains(event.target)) {
      this.handleClick();
    }
  }

  addClickEvent() {
    if (this.mobileMenu) {
      this.mobileMenu.addEventListener("click", this.handleClick);
      this.mobileMenu.addEventListener("keydown", this.handleKeyPress);
    }
  }

  init() {
    if (this.mobileMenu && this.navList) {
      this.addClickEvent();
      
      // Adicionar atributos de acessibilidade
      this.mobileMenu.setAttribute('aria-expanded', 'false');
      this.mobileMenu.setAttribute('aria-controls', 'nav-list');
      this.mobileMenu.setAttribute('aria-label', 'Menu de navegação');
      
      // Fechar menu ao clicar em links (para mobile)
      this.navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (this.isOpen) {
            this.handleClick();
          }
        });
      });
    }
    return this;
  }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  // Garantir que o scroll esteja habilitado
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
  
  const mobileNavbar = new MobileNavbar(
    ".mobile-menu",
    ".nav-list",
    ".nav-list li",
  );
  mobileNavbar.init();
});

// Adicionar animação CSS se não existir
if (!document.querySelector('#nav-animations')) {
  const style = document.createElement('style');
  style.id = 'nav-animations';
  style.textContent = `
    @keyframes navLinkFade {
      from {
        opacity: 0;
        transform: translateX(50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  document.head.appendChild(style);
}

// Garantir que o scroll funcione corretamente
window.addEventListener('load', () => {
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
});

// Garantir que o scroll seja restaurado se houver algum problema
window.addEventListener('scroll', () => {
  if (document.body.style.overflow === 'hidden' && !document.querySelector('.nav-list.active')) {
    document.body.style.overflow = 'auto';
  }
});

// Garantir que o scroll funcione corretamente em todas as situações
window.addEventListener('resize', () => {
  if (!document.querySelector('.nav-list.active')) {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
  }
});

// Garantir que o scroll seja restaurado quando a página ganha foco
window.addEventListener('focus', () => {
  if (!document.querySelector('.nav-list.active')) {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
  }
});