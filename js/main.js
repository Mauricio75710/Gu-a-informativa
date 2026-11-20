/**
 * main.js
 * Archivo principal de JavaScript para manejar funcionalidades globales de la UI.
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initKeyboardShortcuts();
});

/**
 * Inicializa el menú responsivo para dispositivos móviles.
 */
function initMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');

    if (mobileBtn && mainNav) {
        mobileBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileBtn.textContent = mainNav.classList.contains('active') ? '✕' : '☰';
        });
    }
}

/**
 * Permite cerrar cualquier ficha modal abierta presionando la tecla Escape.
 */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                activeModal.classList.remove('active');
            }
        }
    });
}