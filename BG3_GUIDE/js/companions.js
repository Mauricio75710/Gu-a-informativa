/**
 * companions.js
 * Muestra los compañeros reclutables, filtros y fichas con avisos de spoiler claros.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('companionsGrid');
    if (!grid) return;

    initModal();

    const companions = await DataService.getCompanions();
    if (!companions) {
        grid.innerHTML = `<div class="empty-state">❌ Error al cargar los compañeros.</div>`;
        return;
    }

    const searchInput = document.getElementById('compSearch');
    const typeFilter = document.getElementById('typeFilter');

    const applyFilters = () => {
        const filtered = FilterUtils.filterCollection(
            companions,
            searchInput.value,
            ['name', 'race', 'class', 'location', 'history'],
            (comp) => typeFilter.value === 'all' || comp.type === typeFilter.value
        );
        renderCompanions(filtered, grid);
    };

    searchInput.addEventListener('input', applyFilters);
    typeFilter.addEventListener('change', applyFilters);

    renderCompanions(companions, grid);
});

function renderCompanions(list, container) {
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state">No se encontraron compañeros con esos criterios.</div>`;
        return;
    }

    container.innerHTML = list.map(comp => `
        <article class="db-card">
            <div>
                <div class="db-card-header">
                    <h3 class="db-card-title">${comp.name}</h3>
                    <span class="badge">${comp.type}</span>
                </div>
                <p class="db-card-desc">${comp.history}</p>
                <div class="db-card-meta">
                    <p><strong>Raza:</strong> ${comp.race}</p>
                    <p><strong>Clase inicial:</strong> ${comp.class}</p>
                    <p><strong>Ubicación:</strong> ${comp.location}</p>
                </div>
            </div>
            <button class="btn-details" onclick="openCompanionModal('${comp.id}')">Ver ficha del compañero</button>
        </article>
    `).join('');
}

async function openCompanionModal(id) {
    const companions = await DataService.getCompanions();
    const comp = companions.find(c => c.id === id);
    if (!comp) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2 style="color: var(--gold); margin-bottom: 5px;">${comp.name}</h2>
        <span class="badge">${comp.type}</span>
        <span class="badge">${comp.race}</span>
        <span class="badge">${comp.class}</span>
        <p style="margin-top: 15px; color: var(--text-sec);">${comp.history}</p>

        <div class="detail-section">
            <h4>Personalidad y Habilidades</h4>
            <p><strong>Personalidad:</strong> ${comp.personality}</p>
            <p><strong>Habilidades clave:</strong> ${comp.abilities}</p>
        </div>

        <div class="detail-section">
            <h4>Reclutamiento y Misiones</h4>
            <p><strong>Dónde encontrarlo:</strong> ${comp.location}</p>
            <p><strong>Misiones relacionadas:</strong> ${comp.quests.join(', ')}</p>
        </div>

        <div class="detail-section" style="background-color: rgba(139, 107, 181, 0.12); padding: 14px; border-radius: 6px; border: 1px solid var(--violet);">
            <h4 style="margin-top: 0; color: #ffae33;">🏷️ Etiqueta de Spoiler (Acontecimientos Importantes)</h4>
            <p style="margin: 0;">${comp.spoilerNote}</p>
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