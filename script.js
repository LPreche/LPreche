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
    // 1. Aplica o tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // 2. Configura o observer para animar elementos
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

    // 4. Lógica do formulário de contato com AJAX
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    async function handleSubmit(event) {
        event.preventDefault();
        const data = new FormData(event.target);
        
        // Limpa status anterior
        formStatus.innerHTML = '';
        formStatus.className = '';

        try {
            const response = await fetch(event.target.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                formStatus.textContent = "Obrigado pela sua mensagem! Entrarei em contato em breve.";
                formStatus.classList.add('success');
                form.reset();
            } else {
                formStatus.textContent = "Oops! Houve um problema ao enviar sua mensagem.";
                formStatus.classList.add('error');
            }
        } catch (error) {
            formStatus.textContent = "Oops! Houve um problema de conexão ao enviar sua mensagem.";
            formStatus.classList.add('error');
        }
    }
    form.addEventListener("submit", handleSubmit);

    // 5. Lógica do botão "Voltar ao Topo"
    const backToTopBtn = document.getElementById('back-to-top-btn');

    if (backToTopBtn) {
        const scrollThreshold = 300; // Distância em pixels para o botão aparecer

        const toggleBackToTopButton = () => {
            if (window.scrollY > scrollThreshold) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', toggleBackToTopButton);
    }

});