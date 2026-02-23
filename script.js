// script.js

// Seleciona os elementos
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Função para aplicar o tema com base na string 'light' ou 'dark'
const applyTheme = (theme) => {
    if (theme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.checked = true;
    } else {
        body.classList.remove('dark-mode');
        themeToggle.checked = false;
    }
};

// Adiciona o evento de clique ao botão
themeToggle.addEventListener('change', () => {
    const newTheme = themeToggle.checked ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme); // Salva a preferência no navegador
    applyTheme(newTheme);
});

// Utility function to throttle events for performance.
// It ensures the wrapped function is called at most once per `limit` milliseconds.
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Intersection Observer para animações de scroll
const observerOptions = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.1 // 10% do item visível
};

const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Anima só uma vez
        }
    });
};

const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);

// No carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    // 1. Aplica o tema salvo ou detecta a preferência do sistema
    const initialTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(initialTheme);

    // 2. Adiciona um listener para mudanças no tema do sistema
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', (e) => {
        // Só muda o tema se o usuário não tiver uma preferência salva no localStorage
        if (!localStorage.getItem('theme')) {
            const newSystemTheme = e.matches ? 'dark' : 'light';
            applyTheme(newSystemTheme);
        }
    });

    // 3. Configura o observer para animar elementos
    const elementsToReveal = document.querySelectorAll('.reveal');
    elementsToReveal.forEach(el => scrollObserver.observe(el));

    // 3. Lógica do menu hamburguer
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.getElementById('overlay');
    
    if (menuToggle && navMenu && overlay) {
        const focusableElementsString = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

        const handleFocusTrap = (event) => {
            if (event.key !== 'Tab') return;

            const focusableElements = Array.from(navMenu.querySelectorAll(focusableElementsString));
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) { // Tabbing backwards
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else { // Tabbing forwards
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        };

        const closeMenu = () => {
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
            body.classList.remove('no-scroll');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.querySelector('i').className = 'fas fa-bars';
            document.removeEventListener('keydown', handleFocusTrap);
            // Retorna o foco para o botão que abriu o menu
            menuToggle.focus();
        };

        const openMenu = () => {
            navMenu.classList.add('active');
            overlay.classList.add('active');
            body.classList.add('no-scroll');
            menuToggle.setAttribute('aria-expanded', 'true');
            menuToggle.querySelector('i').className = 'fas fa-times';
            document.addEventListener('keydown', handleFocusTrap);

            // Após a transição do menu, foca no primeiro item
            navMenu.addEventListener('transitionend', () => {
                const firstFocusableElement = navMenu.querySelector(focusableElementsString);
                if (firstFocusableElement) {
                    firstFocusableElement.focus();
                }
            }, { once: true });
        };

        menuToggle.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Fecha o menu ao clicar em um link ou no overlay
        navMenu.querySelectorAll('a[href]').forEach(link => link.addEventListener('click', closeMenu));
        overlay.addEventListener('click', closeMenu);
    }

    // 5. Lógica do Modal de Status
    const createModalController = (modalId, overlayId) => {
        const modal = document.getElementById(modalId);
        const modalOverlay = document.getElementById(overlayId);
        if (!modal || !modalOverlay) return null;

        const modalTitle = modal.querySelector('#modal-title');
        const modalMessage = modal.querySelector('#modal-message');
        const modalCloseBtn = modal.querySelector('#modal-close-btn');
        let elementToFocusOnClose = null;

        const open = (title, message, type, focusOnClose) => {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            modalTitle.className = 'modal-title'; // Reset classes
            if (type) modalTitle.classList.add(type);

            modal.classList.add('active');
            modalOverlay.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            body.classList.add('no-scroll');

            elementToFocusOnClose = focusOnClose || document.activeElement;
            modalCloseBtn.focus();
        };

        const close = () => {
            modal.classList.remove('active');
            modalOverlay.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            body.classList.remove('no-scroll');
            if (elementToFocusOnClose) elementToFocusOnClose.focus();
        };

        modalCloseBtn.addEventListener('click', close);
        modalOverlay.addEventListener('click', close);
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.classList.contains('active')) {
                close();
            }
        });

        return { open, close };
    };

    // 6. Lógica do formulário de contato com AJAX e validação
    const form = document.getElementById('contact-form');
    const modalController = createModalController('status-modal', 'status-modal-overlay');

    const setupFormHandler = (formEl, modalCtrl) => {
        if (!formEl || !modalCtrl) return;

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const submitBtn = document.getElementById('submit-btn');

        const validateEmail = (email) => {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        };

        const validateForm = () => {
            const fields = [
                { input: nameInput, message: "Por favor, preencha seu nome." },
                { input: emailInput, message: "Por favor, insira um e-mail válido.", validator: validateEmail },
                { input: messageInput, message: "Por favor, escreva sua mensagem." }
            ];

            // Clear previous errors
            fields.forEach(field => field.input.classList.remove('error-field'));

            for (const field of fields) {
                const value = field.input.value.trim();
                const isValid = field.validator ? field.validator(value) : !!value;

                if (!isValid) {
                    modalCtrl.open("Erro de Validação", field.message, 'error', field.input);
                    field.input.classList.add('error-field');
                    return false;
                }
            }
            return true;
        };

        formEl.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!validateForm()) return;

            // Desabilita o botão para evitar envios múltiplos
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            const formData = new FormData(formEl);

            try {
                const response = await fetch(formEl.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' },
                });

                if (response.ok) {
                    modalCtrl.open("Enviado com Sucesso!", "Obrigado pela sua mensagem! Entrarei em contato em breve.", 'success', submitBtn);
                    formEl.reset();
                } else {
                    const result = await response.json().catch(() => ({})); // Previne erro se o corpo não for JSON
                    const errorMessage = result.message || "Houve um problema ao enviar sua mensagem. Verifique os campos e tente novamente.";
                    modalCtrl.open("Erro no Envio", errorMessage, 'error', submitBtn);
                }
            } catch (error) {
                modalCtrl.open("Erro de Conexão", "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.", 'error', submitBtn);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    };

    setupFormHandler(form, modalController);

    // 7. Lógica do botão "Voltar ao Topo"
    const backToTopBtn = document.getElementById('back-to-top-btn');

    if (backToTopBtn) {
        const scrollThreshold = 300; // Distância em pixels para o botão aparecer

        const toggleBackToTopButton = () => {
            // Usamos `window.pageYOffset` para compatibilidade com browsers mais antigos
            if (window.pageYOffset > scrollThreshold) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        };

        // Otimização: 'throttle' evita que a função seja chamada excessivamente durante o scroll
        window.addEventListener('scroll', throttle(toggleBackToTopButton, 200));
    }

    // 8. Lógica do Modal de Portfólio
    const setupPortfolioModal = () => {
        const modal = document.getElementById('portfolio-modal');
        const modalOverlay = document.getElementById('portfolio-modal-overlay');
        if (!modal || !modalOverlay) return;

        const modalTitle = modal.querySelector('#portfolio-modal-title');
        const modalIframe = modal.querySelector('iframe');
        const modalCloseBtn = modal.querySelector('#portfolio-modal-close-btn');
        const projectLinks = document.querySelectorAll('.portfolio-modal-trigger');
        let elementToFocusOnClose = null;

        const openModal = (url, title, triggerElement) => {
            modalTitle.textContent = title;
            modalIframe.src = url;

            modal.classList.add('active');
            modalOverlay.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            body.classList.add('no-scroll');

            elementToFocusOnClose = triggerElement || document.activeElement;
            modalCloseBtn.focus();
        };

        const closeModal = () => {
            modal.classList.remove('active');
            modalOverlay.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            body.classList.remove('no-scroll');
            
            // Importante: Limpar o src do iframe para parar a execução do site (ex: vídeos)
            modalIframe.src = '';

            if (elementToFocusOnClose) elementToFocusOnClose.focus();
        };

        projectLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const url = link.href;
                const title = link.dataset.title || 'Visualização do Projeto';
                openModal(url, title, link);
            });
        });

        modalCloseBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', closeModal);
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    };

    setupPortfolioModal();

});