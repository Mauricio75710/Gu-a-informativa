/**
 * mechanics.js
 * Muestra las explicaciones de las mecánicas de Baldur's Gate 3 con ejemplos prácticos.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('mechanicsGrid');
    if (!grid) return;

    initModal();

    const mechanics = await DataService.getMechanics();
    if (!mechanics) {
        grid.innerHTML = `<div class="empty-state">❌ Error al cargar las mecánicas del juego.</div>`;
        return;
    }

    const searchInput = document.getElementById('mechSearch');
    const categoryFilter = document.getElementById('categoryFilter');

    const applyFilters = () => {
        const filtered = FilterUtils.filterCollection(
            mechanics,
            searchInput.value,
            ['title', 'summary', 'explanation', 'example'],
            (mech) => categoryFilter.value === 'all' || mech.category === categoryFilter.value
        );
        renderMechanics(filtered, grid);
    };

    searchInput.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);

    renderMechanics(mechanics, grid);
});

function renderMechanics(list, container) {
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state">No se encontraron mecánicas con esos filtros.</div>`;
        return;
    }

    container.innerHTML = list.map(m => `
        <article class="db-card">
            <div>
                <div class="db-card-header">
                    <h3 class="db-card-title">${m.title}</h3>
                    <span class="badge">${m.category}</span>
                </div>
                <p class="db-card-desc">${m.summary}</p>
                <div class="db-card-meta">
                    <p><strong>Ejemplo práctico:</strong> ${m.example.substring(0, 85)}...</p>
                </div>
            </div>
            <button class="btn-details" onclick="openMechanicModal('${m.id}')">Leer explicación y ejemplo</button>
        </article>
    `).join('');
}

async function openMechanicModal(id) {
    const mechanics = await DataService.getMechanics();
    const m = mechanics.find(item => item.id === id);
    if (!m) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2 style="color: var(--gold); margin-bottom: 5px;">${m.title}</h2>
        <span class="badge">${m.category}</span>
        <p style="margin-top: 15px; font-weight: 500; color: var(--text-main);">${m.summary}</p>

        <div class="detail-section">
            <h4>¿Cómo funciona en el juego?</h4>
            <p style="color: var(--text-sec);">${m.explanation}</p>
        </div>

        <div class="detail-section" style="background-color: var(--panel); padding: 15px; border-radius: 6px; border-left: 3px solid var(--gold);">
            <h4 style="margin-top: 0; color: var(--gold);">🎲 Ejemplo Práctico</h4>
            <p style="margin: 0;">${m.example}</p>
        </div>
    `;

    document.getElementById('detailModal').classList.add('active');
}

function initModal() {
    const modal = document.getElementById('detailModal');
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}