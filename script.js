// Dados padrão iniciais dos carros
const defaultCars = [
    {
        id: 1,
        marca: 'PORSCHE',
        modelo: '911 CARRERA S',
        ano: 2023,
        km: '2.450 KM',
        preco: 1250000,
        imagem: 'https://images.unsplash.com/photo-1503376762360-15bd16611581?auto=format&fit=crop&w=800&q=80',
        novidade: true
    },
    {
        id: 2,
        marca: 'FERRARI',
        modelo: 'F8 TRIBUTO',
        ano: 2022,
        km: '5.200 KM',
        preco: 3800000,
        imagem: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=800&q=80',
        novidade: false
    },
    {
        id: 3,
        marca: 'BMW',
        modelo: 'M5 COMPETITION',
        ano: 2024,
        km: '0 KM',
        preco: 1050000,
        imagem: 'https://images.unsplash.com/photo-1555353540-64fd1bec5a40?auto=format&fit=crop&w=800&q=80',
        novidade: false
    },
    {
        id: 4,
        marca: 'AMG',
        modelo: 'GT BLACK SERIES',
        ano: 2021,
        km: '500 KM',
        preco: 4200000,
        imagem: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
        novidade: false
    },
    {
        id: 5,
        marca: 'AUDI',
        modelo: 'R8 V10 PLUS',
        ano: 2019,
        km: '15.000 KM',
        preco: 1180000,
        imagem: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80',
        novidade: false
    },
    {
        id: 6,
        marca: 'HURACÁN',
        modelo: 'STO',
        ano: 2023,
        km: '0 KM',
        preco: 5500000,
        imagem: 'https://images.unsplash.com/photo-1627454820516-dc7671ce946b?auto=format&fit=crop&w=800&q=80',
        novidade: false
    }
];

// Recupera os carros armazenados, senão inicializa com defaults e salva no banco (localStorage)
let cars = JSON.parse(localStorage.getItem('mhp_cars'));
if (!cars || cars.length === 0) {
    cars = defaultCars;
    localStorage.setItem('mhp_cars', JSON.stringify(cars));
}

// Formatar moeda brasileira para display
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0
    }).format(value);
};

// Inicializa state do catálogo
let catalogLimit = 6;

const catalogGrid = document.getElementById('catalog-grid');

// Armazena a lista de carros visíveis após filtragem, ou todos por padrão
let visibleCars = [...cars];

const renderCars = () => {
    if (!catalogGrid) return;
    catalogGrid.innerHTML = '';
    
    // Limita a exibição dos carros baseando-se no limite estipulado
    const carsToShow = visibleCars.slice(0, catalogLimit);
    
    if(carsToShow.length === 0) {
        catalogGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-muted); padding: 40px 0;">Nenhum veículo encontrado com os filtros selecionados.</p>';
        return;
    }
    
    carsToShow.forEach(car => {
        const card = document.createElement('div');
        card.classList.add('car-card');
        
        const badgeHTML = car.novidade ? '<div class="badge-new">NOVIDADE</div>' : '';
        
        card.innerHTML = `
            <div class="car-img-box">
                ${badgeHTML}
                <img src="${car.imagem}" alt="${car.marca} ${car.modelo}" loading="lazy">
            </div>
            <div class="car-info">
                <div class="car-title-row">
                    <h3>${car.marca} ${car.modelo}</h3>
                </div>
                <div class="car-meta">
                    ${car.ano} &bull; ${car.km}
                </div>
                <div class="car-price-row">
                    <span class="price">${formatCurrency(car.preco)}</span>
                    <a href="javascript:void(0)" class="btn-details" onclick="openModal(${car.id})">VER DETALHES</a>
                </div>
            </div>
        `;
        catalogGrid.appendChild(card);
    });

    // Controla a visibilidade e texto do botão 'Ver Catálogo/Ver Menos'
    const footerWrapper = document.getElementById('catalog-footer-wrapper');
    const btnVerCatalogo = document.getElementById('btn-ver-catalogo');
    
    if (footerWrapper && btnVerCatalogo) {
        // Esconde permanentemente se no total da busca houver 6 ou menos veículos cadastrados
        if (visibleCars.length <= 6) {
            footerWrapper.style.display = 'none';
        } else {
            footerWrapper.style.display = 'flex';
            // Altera o texto baseado na condição de limite
            if (catalogLimit === 6) {
                btnVerCatalogo.innerText = 'VER CATÁLOGO COMPLETO';
            } else {
                btnVerCatalogo.innerText = 'VER MENOS';
            }
        }
    }
};

// Scroll Animation Logic para a Hero
const canvas = document.getElementById("hero-canvas");
if (canvas) {
    const context = canvas.getContext("2d");
    const frameCount = 160;
    
    // Calcula o frame correspondente
    const currentFrame = index => (
        `frames/frame${index}.jpg`
    );

    const images = [];
    const heroTrack = document.getElementById("hero-track");
    
    // Carrega o frame inicial
    const imgFirst = new Image();
    imgFirst.src = currentFrame(1);
    imgFirst.onload = () => {
        canvas.width = imgFirst.width;
        canvas.height = imgFirst.height;
        context.drawImage(imgFirst, 0, 0);
    };

    // Preload dos frames em background para performance (Apenas Desktop)
    if (window.innerWidth > 990) {
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            images.push(img);
        }
    }

    // Engine da animação vinculada ao scroll
    window.addEventListener('scroll', () => {
        if (!heroTrack) return;
        
        // Posição do track em relação a tela
        const trackRect = heroTrack.getBoundingClientRect();
        
        // Espaço de scroll disponível = (altura do track - altura da tela)
        const maxScroll = heroTrack.clientHeight - window.innerHeight;
        
        // Progresso será 0 quando trackRect.top = 0, e 1 quando trackRect.top = -maxScroll
        let scrollProgress = 0;
        if (maxScroll > 0) {
            scrollProgress = -trackRect.top / maxScroll;
        }
        
        // Evita extrapolar
        if (scrollProgress < 0) scrollProgress = 0;
        if (scrollProgress > 1) scrollProgress = 1;
        
        // Transforma o progresso (0.0 até 1.0) num índíce de array
        // Math.floor para não estourar. Index máximo é frameCount - 1
        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(scrollProgress * frameCount)
        );
        
        // Desenha a imagem correspondente no canvas, mas evita chamar requestAnimationFrame para simplicity
        if (images[frameIndex] && images[frameIndex].complete) {
            // Em navegadores modernos requestAnimationFrame fica melhor
            requestAnimationFrame(() => {
                context.drawImage(images[frameIndex], 0, 0, canvas.width, canvas.height);
            });
        }
        
        // Header scrolled logic - fixed overlay after passing hero
        const header = document.querySelector('.header');
        if (header) {
            // Hero passa da tela quando scroll é maior que a diferença
            if (window.scrollY > maxScroll - 50) { 
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
}

// Inicializa a renderização dos carros na página
document.addEventListener('DOMContentLoaded', () => {
    
            // Auto-poppulação fluida do Fitro de Marcas
    const filterMarcaSelect = document.getElementById('filter-marca');
    if (filterMarcaSelect) {
        const marcasUnicas = [...new Set(cars.map(c => c.marca.toUpperCase()))].sort();
        marcasUnicas.forEach(marca => {
            const opt = document.createElement('option');
            opt.value = marca;
            opt.innerText = marca.charAt(0) + marca.slice(1).toLowerCase();
            if (marca === 'AMG' || marca === 'BMW') opt.innerText = marca; 
            filterMarcaSelect.appendChild(opt);
        });
    }

    // Auto-população dinânica do Filtro de Preços baseado no teto do inventário
    const filterPrecoSelect = document.getElementById('filter-preco');
    if (filterPrecoSelect && cars.length > 0) {
        // Encontra o veículo mais caro do estoque (ex: R$ 600.000 ou R$ 5.000.000)
        const maxPreco = Math.max(...cars.map(c => c.preco));
        
        // Ranges lógicos de preço (em Reais)
        const limitesPredefinidos = [25000, 50000, 80000, 100000, 200000, 400000, 600000, 800000, 1000000, 2000000, 5000000];
        
        // Filtra até encontrar um limite que seja suficiente para englobar o carro mais caro
        const limitesAtivos = limitesPredefinidos.filter(l => l <= maxPreco || limitesPredefinidos.indexOf(l) === limitesPredefinidos.findIndex(limit => limit >= maxPreco));
        
        limitesAtivos.forEach(limit => {
            const opt = document.createElement('option');
            opt.value = limit; // Esse é o value matemático que o script JS usa pra calcular
            
            // Formatador dinâmico: Ex "Até R$ 50 mil" ou "Até R$ 1 Milhão"
            if (limit < 1000000) {
                opt.innerText = `Até R$ ${limit / 1000} mil`;
            } else {
                const milhoes = limit / 1000000;
                opt.innerText = `Até R$ ${milhoes} Milh${milhoes === 1 ? 'ão' : 'ões'}`;
            }
            filterPrecoSelect.appendChild(opt);
        });
    }

    // Toggle Mobile Menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Clica nos itens do menu
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    renderCars();
    
    // Funcionalidade de Expandir / Retrair Catálogo Completo
    const btnVerCatalogo = document.getElementById('btn-ver-catalogo');
    if (btnVerCatalogo) {
        btnVerCatalogo.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (catalogLimit === 6) {
                catalogLimit = visibleCars.length; // Exibe todos
            } else {
                catalogLimit = 6; // Retrai para o padrão
                document.getElementById('estoque').scrollIntoView({ behavior: 'smooth' });
            }
            
            renderCars();
        });
    }

    // Funcionalidade do Filtro
    const btnFiltrar = document.getElementById('btn-filtrar');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', (e) => {
            e.preventDefault();
            
            const selectedMarca = document.getElementById('filter-marca').value.toUpperCase();
            const selectedPreco = document.getElementById('filter-preco').value;
            const selectedAno = document.getElementById('filter-ano').value;
            
            // Filtra iterando o Array Oficial de `cars`
            visibleCars = cars.filter(car => {
                let matchMarca = true;
                if(selectedMarca !== "") matchMarca = car.marca.toUpperCase().includes(selectedMarca);
                
                let matchPreco = true;
                if(selectedPreco !== "") {
                    // Aqui a mágica matemática compara diretamente o limite gerado:
                    const precoFiltradoLimite = parseFloat(selectedPreco);
                    matchPreco = car.preco <= precoFiltradoLimite;
                }
                
                let matchAno = true;
                if(selectedAno !== "") {
                    const anoFiltrado = parseInt(selectedAno);
                    if (anoFiltrado === 2020) {
                        matchAno = car.ano <= 2020; // relíquias (-2020)
                    } else {
                        matchAno = car.ano >= anoFiltrado;
                    }
                }
                
                return matchMarca && matchPreco && matchAno;
            });

            // Reseta paginado do limiter e renderiza visiveis
            catalogLimit = 6;
            renderCars();
            document.getElementById('estoque').scrollIntoView({ behavior: 'smooth' });
        });
    }
});

// Modal Logic
const modal = document.getElementById('details-modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

window.openModal = (id) => {
    const car = cars.find(c => c.id === id);
    if (!car) return;
    
    // Constrói O array visual da galeria: Inicia sempre com a foto de Capa
    let galeria = [car.imagem];
    
    // Concatena as fotos do array do BD caso existam (se houver uploaders novos)
    if (car.galeria && car.galeria.length > 0) {
        galeria = [...galeria, ...car.galeria];
    } else if (car.id <= 5) {
        // Apenas para os carros de demonstração originais do layout, mantem o preview estético
        galeria.push('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
        galeria.push('https://images.unsplash.com/photo-1600705722908-babf1aa2fdf4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
    }

    window.currentSlide = 0;
    window.galeriaLength = galeria.length;
    window.galeriaAtual = galeria; // Guarda o array de imagens no escopo para o lightbox
    
    // Configuração de especificações extras para o modal
    const motor = car.id === 1 ? '3.0 6 Cilindros' : 
                  car.id === 2 ? '3.9 V8 Bi-Turbo' :
                  car.id === 3 ? '4.4 V8 Bi-Turbo' :
                  car.id === 4 ? '4.0 V8 Bi-Turbo' :
                  car.id === 5 ? '5.2 V10 Aspirado' : '5.2 V10 Aspirado';
                  
    const aceleracao = car.id === 1 ? '3.7s (0-100)' : 
                       car.id === 2 ? '2.9s (0-100)' :
                       car.id === 3 ? '3.3s (0-100)' :
                       car.id === 4 ? '3.2s (0-100)' :
                       car.id === 5 ? '3.2s (0-100)' : '3.0s (0-100)';
    
    const fone = "27997067711"; 
    const textoPreEscrito = `Olá! Tenho interesse e gostaria de mais detalhes sobre o ${car.marca} ${car.modelo} no valor de ${formatCurrency(car.preco)}.`;
    const zapLink = `https://wa.me/${fone}?text=${textoPreEscrito}`;

    modalBody.innerHTML = `
        <div class="modal-grid">
            <div class="modal-img-col">
                <div class="carousel" id="modal-carousel">
                    ${galeria.map((img, index) => `<img src="${img}" class="carousel-img ${index === 0 ? 'active' : ''}" alt="${car.modelo}" onclick="openLightbox(${index})" title="Expandir imagem">`).join('')}
                    
                    ${galeria.length > 1 ? `
                        <button class="carousel-btn prev" onclick="moveCarousel(-1)" aria-label="Imagem Anterior">&#10094;</button>
                        <button class="carousel-btn next" onclick="moveCarousel(1)" aria-label="Próxima Imagem">&#10095;</button>
                        
                        <div class="carousel-dots">
                            ${galeria.map((_, index) => `<span class="dot ${index === 0 ? 'active' : ''}" onclick="setCarousel(${index})"></span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="modal-info-col">
                <span class="modal-brand">${car.marca}</span>
                <h2 class="modal-car-title">${car.modelo}</h2>
                <div class="modal-price">${formatCurrency(car.preco)}</div>
                
                <div class="modal-specs">
                    <div class="spec-item">
                        <span class="spec-label">Ano</span>
                        <span class="spec-value">${car.ano}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Quilometragem</span>
                        <span class="spec-value">${car.km}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Motor</span>
                        <span class="spec-value">${motor}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Aceleração</span>
                        <span class="spec-value">${aceleracao}</span>
                    </div>
                </div>
                
                <a href="${zapLink}" target="_blank" class="btn btn-red btn-block btn-lg" style="display: block; width: 100%; text-align: center; text-transform: uppercase;">TENHO INTERESSE (WHATSAPP)</a>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Evita scroll do fundo
};

window.closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restaura scroll normal
};

modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Funções do Carrossel Modal (Normal)
window.moveCarousel = (direction) => {
    const newIndex = (window.currentSlide + direction + window.galeriaLength) % window.galeriaLength;
    setCarousel(newIndex);
};

window.setCarousel = (index) => {
    window.currentSlide = index;
    const images = document.querySelectorAll('#modal-carousel .carousel-img');
    const dots = document.querySelectorAll('#modal-carousel .dot');
    
    if (images.length) {
        images.forEach(img => img.classList.remove('active'));
        images[index].classList.add('active');
    }
    
    if (dots.length) {
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
    }
};

// Funções do Lightbox (Fullscreen Image Viewer)
const lightbox = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

window.lightboxIndex = 0;

window.openLightbox = (index) => {
    window.lightboxIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
};

window.updateLightboxImage = () => {
    if (window.galeriaAtual && window.galeriaAtual.length > 0) {
        lightboxImg.src = window.galeriaAtual[window.lightboxIndex];
    }
};

window.closeLightbox = () => {
    lightbox.classList.remove('active');
};

window.moveLightbox = (direction) => {
    window.lightboxIndex = (window.lightboxIndex + direction + window.galeriaAtual.length) % window.galeriaAtual.length;
    updateLightboxImage();
};

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev) lightboxPrev.addEventListener('click', () => moveLightbox(-1));
if (lightboxNext) lightboxNext.addEventListener('click', () => moveLightbox(1));

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
}

// Global Keyboard Navigation (Escape to close, Arrows to navigate)
document.addEventListener('keydown', (e) => {
    const isLightboxActive = lightbox && lightbox.classList.contains('active');
    const isModalActive = modal && modal.classList.contains('active');
    
    if (e.key === 'Escape') {
        if (isLightboxActive) closeLightbox();
        else if (isModalActive) closeModal();
    }
    
    if (e.key === 'ArrowRight') {
        if (isLightboxActive) moveLightbox(1);
        else if (isModalActive) moveCarousel(1);
    }
    
    if (e.key === 'ArrowLeft') {
        if (isLightboxActive) moveLightbox(-1);
        else if (isModalActive) moveCarousel(-1);
    }
});

// Formulário WhatsApp Handling
const whatsappForm = document.getElementById('whatsapp-form');
if (whatsappForm) {
    whatsappForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        const msg = document.getElementById('mensagem').value;
        
        // Número da concessionária
        const fone = "27997067711"; 
        
        const textoPreEscrito = `Olá, me chamo ${nome}.%0A${msg}`;
        const zapLink = `https://wa.me/${fone}?text=${textoPreEscrito}`;
        
        window.open(zapLink, '_blank');
    });
}
