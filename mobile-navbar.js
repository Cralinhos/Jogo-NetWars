class MobileNavbar {
  constructor(mobileMenu, navList, navLinks) {
    this.mobileMenu = document.querySelector(mobileMenu);
    this.navList = document.querySelector(navList);
    this.navLinks = document.querySelectorAll(navLinks);
    this.activeClass = "active";
    this.isOpen = false;

    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
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
    this.animateLinks();
    
    // Atualizar aria-expanded para acessibilidade
    this.mobileMenu.setAttribute('aria-expanded', this.isOpen);
    
    // Adicionar/remover listener para cliques fora do menu
    if (this.isOpen) {
      document.addEventListener('click', this.handleOutsideClick);
      document.addEventListener('keydown', this.handleEscapeKey);
    } else {
      document.removeEventListener('click', this.handleOutsideClick);
      document.removeEventListener('keydown', this.handleEscapeKey);
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
        !this.navList.contains(event.target)) {
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