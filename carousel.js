// Carrossel automático para cartas e peças em telas menores
class Carousel {
    constructor(container, options = {}) {
        this.container = container;
        this.images = container.querySelectorAll('img');
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.isPaused = false;
        
        // Opções padrão
        this.options = {
            interval: options.interval || 3000, // 3 segundos
            autoPlay: options.autoPlay !== false,
            showIndicators: options.showIndicators !== false,
            showControls: options.showControls !== false
        };
        
        this.init();
    }
    
    init() {
        if (this.images.length <= 1) return;
        
        // Criar container para as imagens
        this.createImageContainer();
        
        // Criar indicadores se necessário
        if (this.options.showIndicators) {
            this.createIndicators();
        }
        
        // Criar controles se necessário
        if (this.options.showControls) {
            this.createControls();
        }
        
        // Criar modal para ampliar imagens
        this.createModal();
        
        // Adicionar eventos
        this.addEventListeners();
        
        // Iniciar autoplay
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
        
        // Mostrar primeira imagem
        this.showImage(0);
    }
    
    createImageContainer() {
        // Criar wrapper para as imagens
        this.imageWrapper = document.createElement('div');
        this.imageWrapper.className = this.container.classList.contains('cartas') ? 'cartas-container' : 'peças-container';
        
        // Mover imagens para o wrapper
        this.images.forEach(img => {
            const clonedImg = img.cloneNode(true);
            // Preservar atributos importantes
            clonedImg.src = img.src;
            clonedImg.alt = img.alt;
            clonedImg.className = img.className;
            this.imageWrapper.appendChild(clonedImg);
        });
        
        // Limpar container e adicionar wrapper
        this.container.innerHTML = '';
        this.container.appendChild(this.imageWrapper);
        
        // Atualizar referência das imagens
        this.images = this.imageWrapper.querySelectorAll('img');
    }
    
    createIndicators() {
        this.indicatorsContainer = document.createElement('div');
        this.indicatorsContainer.className = 'carousel-indicators';
        
        for (let i = 0; i < this.images.length; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'carousel-indicator';
            indicator.dataset.index = i;
            this.indicatorsContainer.appendChild(indicator);
        }
        
        this.container.appendChild(this.indicatorsContainer);
        this.indicators = this.indicatorsContainer.querySelectorAll('.carousel-indicator');
    }
    
    createControls() {
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.className = 'carousel-controls';
        
        // Botão pausar/continuar
        this.playPauseBtn = document.createElement('button');
        this.playPauseBtn.className = 'carousel-btn';
        this.playPauseBtn.textContent = 'Pausar';
        this.playPauseBtn.dataset.action = 'play-pause';
        
        // Botão anterior
        this.prevBtn = document.createElement('button');
        this.prevBtn.className = 'carousel-btn';
        this.prevBtn.textContent = 'Anterior';
        this.prevBtn.dataset.action = 'prev';
        
        // Botão próximo
        this.nextBtn = document.createElement('button');
        this.nextBtn.className = 'carousel-btn';
        this.nextBtn.textContent = 'Próximo';
        this.nextBtn.dataset.action = 'next';
        
        this.controlsContainer.appendChild(this.prevBtn);
        this.controlsContainer.appendChild(this.playPauseBtn);
        this.controlsContainer.appendChild(this.nextBtn);
        
        this.container.appendChild(this.controlsContainer);
    }
    
    createModal() {
        // Criar modal se não existir
        if (!document.querySelector('.image-modal')) {
            this.modal = document.createElement('div');
            this.modal.className = 'image-modal';
            this.modal.innerHTML = `
                <div class="modal-content">
                    <button class="modal-close" aria-label="Fechar imagem">&times;</button>
                    <img class="modal-image" src="" alt="Imagem ampliada">
                </div>
            `;
            document.body.appendChild(this.modal);
            
            // Evento para fechar modal
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal || e.target.classList.contains('modal-close')) {
                    this.closeModal();
                }
            });
            
            // Evento de touch para fechar modal em dispositivos móveis
            this.modal.addEventListener('touchend', (e) => {
                if (e.target === this.modal || e.target.classList.contains('modal-close')) {
                    e.preventDefault();
                    this.closeModal();
                }
            }, { passive: false });
            
            // Evento de touch para abrir modal em dispositivos móveis
            this.modal.addEventListener('touchstart', (e) => {
                e.stopPropagation();
            }, { passive: false });
            
            // Fechar com ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                    this.closeModal();
                }
            });
        } else {
            this.modal = document.querySelector('.image-modal');
        }
    }

    
    addEventListeners() {
        // Eventos para as imagens
        this.images.forEach((img, index) => {
            img.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openModal(img.src, img.alt);
            });
            
            img.addEventListener('mouseenter', () => {
                this.pauseAutoPlay();
            });
            
            img.addEventListener('mouseleave', () => {
                if (!this.isPaused) {
                    this.resumeAutoPlay();
                }
            });
            
            // Eventos de touch para as imagens - melhorado para dispositivos móveis
            let touchStartTime = 0;
            let touchStartY = 0;
            
            img.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                this.touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
                this.pauseAutoPlay();
            }, { passive: false });
            
            img.addEventListener('touchmove', (e) => {
                e.stopPropagation();
                // Permitir scroll vertical mas prevenir scroll horizontal
                const touchY = e.touches[0].clientY;
                const touchX = e.touches[0].clientX;
                const deltaY = Math.abs(touchY - touchStartY);
                const deltaX = Math.abs(touchX - this.touchStartX);
                
                if (deltaX > deltaY) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            img.addEventListener('touchend', (e) => {
                e.stopPropagation();
                this.touchEndX = e.changedTouches[0].clientX;
                const touchEndTime = Date.now();
                const touchDuration = touchEndTime - touchStartTime;
                
                // Verificar se foi um clique simples (sem movimento e duração curta)
                const touchDistance = Math.abs(this.touchEndX - this.touchStartX);
                if (touchDistance < 15 && touchDuration < 300) {
                    // Foi um clique, abrir modal
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    setTimeout(() => {
                        this.openModal(img.src, img.alt);
                    }, 100);
                } else {
                    // Foi um swipe
                    this.handleSwipe();
                }
                
                setTimeout(() => {
                    if (!this.isPaused) {
                        this.resumeAutoPlay();
                    }
                }, 3000);
            }, { passive: false });
        });
        
        // Eventos para indicadores
        if (this.indicators) {
            this.indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    this.showImage(index);
                    this.pauseAutoPlay();
                    setTimeout(() => this.resumeAutoPlay(), 5000); // Retomar após 5 segundos
                });
            });
        }
        
        // Eventos para controles
        if (this.controlsContainer) {
            this.controlsContainer.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (!action) return;
                
                switch (action) {
                    case 'prev':
                        this.prev();
                        break;
                    case 'next':
                        this.next();
                        break;
                    case 'play-pause':
                        this.togglePlayPause();
                        break;
                }
            });
        }
        
        // Variáveis para detectar swipe
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.minSwipeDistance = 30; // Distância mínima reduzida para facilitar o swipe
        
        // Eventos de touch para swipe
        this.container.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            this.touchStartX = e.touches[0].clientX;
            this.pauseAutoPlay();
        }, { passive: false });
        
        this.container.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        }, { passive: false });
        
        this.container.addEventListener('touchend', (e) => {
            e.stopPropagation();
            this.touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
            
            setTimeout(() => {
                if (!this.isPaused) {
                    this.resumeAutoPlay();
                }
            }, 3000);
        }, { passive: false });
        
        // Evitar interferência com scroll da página
        this.container.addEventListener('wheel', (e) => {
            e.stopPropagation();
        });
    }
    
    handleSwipe() {
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        console.log('Swipe detectado:', {
            start: this.touchStartX,
            end: this.touchEndX,
            distance: swipeDistance,
            minDistance: this.minSwipeDistance
        });
        
        if (Math.abs(swipeDistance) > this.minSwipeDistance) {
            if (swipeDistance > 0) {
                // Swipe para direita - imagem anterior
                console.log('Swipe para direita - imagem anterior');
                this.prev();
            } else {
                // Swipe para esquerda - próxima imagem
                console.log('Swipe para esquerda - próxima imagem');
                this.next();
            }
        } else {
            console.log('Swipe muito pequeno, ignorado');
        }
    }
    
    showImage(index) {
        // Remover todas as classes de posição
        this.images.forEach(img => {
            img.classList.remove('active', 'prev', 'next');
        });
        
        // Adicionar classes de posição
        if (this.images[index]) {
            this.images[index].classList.add('active');
        }
        
        // Adicionar classe prev para a imagem anterior
        const prevIndex = index === 0 ? this.images.length - 1 : index - 1;
        if (this.images[prevIndex]) {
            this.images[prevIndex].classList.add('prev');
        }
        
        // Adicionar classe next para a próxima imagem
        const nextIndex = (index + 1) % this.images.length;
        if (this.images[nextIndex]) {
            this.images[nextIndex].classList.add('next');
        }
        
        // Atualizar indicadores
        if (this.indicators) {
            this.indicators.forEach(indicator => indicator.classList.remove('active'));
            if (this.indicators[index]) {
                this.indicators[index].classList.add('active');
            }
        }
        
        this.currentIndex = index;
    }
    
    next() {
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.showImage(nextIndex);
    }
    
    prev() {
        const prevIndex = this.currentIndex === 0 ? this.images.length - 1 : this.currentIndex - 1;
        this.showImage(prevIndex);
    }
    
    startAutoPlay() {
        if (this.autoPlayInterval) return;
        
        this.autoPlayInterval = setInterval(() => {
            if (!this.isPaused) {
                this.next();
            }
        }, this.options.interval);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    pauseAutoPlay() {
        this.isPaused = true;
        this.container.classList.add('paused');
    }
    
    resumeAutoPlay() {
        this.isPaused = false;
        this.container.classList.remove('paused');
    }
    
    togglePlayPause() {
        if (this.isPaused) {
            this.resumeAutoPlay();
            this.playPauseBtn.textContent = 'Pausar';
        } else {
            this.pauseAutoPlay();
            this.playPauseBtn.textContent = 'Continuar';
        }
    }
    
    openModal(src, alt) {
        console.log('Abrindo modal:', src, alt);
        const modalImage = this.modal.querySelector('.modal-image');
        modalImage.src = src;
        modalImage.alt = alt;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Pausar o carrossel quando o modal estiver aberto
        this.pauseAutoPlay();
        
        // Forçar o foco no modal para dispositivos móveis
        setTimeout(() => {
            this.modal.focus();
        }, 100);
    }
    
    closeModal() {
        console.log('Fechando modal');
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Retomar o carrossel quando o modal for fechado
        setTimeout(() => {
            this.resumeAutoPlay();
        }, 1000);
    }
}

// Inicializar carrosséis quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos em uma tela menor
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Inicializar carrossel para cartas
        const cartasContainers = document.querySelectorAll('.cartas');
        cartasContainers.forEach(container => {
            const images = container.querySelectorAll('img');
            if (images.length > 1) {
                new Carousel(container, {
                    interval: 3000,
                    autoPlay: true,
                    showIndicators: false,
                    showControls: false
                });
            }
        });
        
        // Inicializar carrossel para peças
        const pecasContainers = document.querySelectorAll('.peças');
        pecasContainers.forEach(container => {
            const images = container.querySelectorAll('img');
            if (images.length > 1) {
                new Carousel(container, {
                    interval: 3000,
                    autoPlay: true,
                    showIndicators: false,
                    showControls: false
                });
            }
        });
    }
});

// Reinicializar carrosséis quando a janela for redimensionada
window.addEventListener('resize', () => {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Remover carrosséis existentes
        document.querySelectorAll('.cartas-container, .peças-container').forEach(container => {
            container.remove();
        });
        
        document.querySelectorAll('.carousel-indicators, .carousel-controls').forEach(container => {
            container.remove();
        });
        
        // Recarregar a página para reinicializar
        setTimeout(() => {
            location.reload();
        }, 100);
    }
});
