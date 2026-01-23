// script.js

// Seleciona os elementos
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Função para aplicar o tema com base na string 'light' ou 'dark'
const applyTheme = (theme) => {
    const skillIcons = document.querySelectorAll('.skills-container img');
    if (theme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.checked = true;
        // Atualiza os ícones de habilidades para o tema escuro
        skillIcons.forEach(icon => {
            if (icon.src.includes('skillicons.dev')) {
                icon.src = icon.src.replace('theme=light', 'theme=dark');
            }
        });
    } else {
        body.classList.remove('dark-mode');
        themeToggle.checked = false;
        // Atualiza os ícones de habilidades para o tema claro
        skillIcons.forEach(icon => {
            if (icon.src.includes('skillicons.dev')) {
                icon.src = icon.src.replace('theme=dark', 'theme=light');
            }
        });
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

    // 3. Lógica do formulário de contato com AJAX
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
});