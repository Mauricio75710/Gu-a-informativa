/**
 * quests.js
 * Muestra las misiones principales, secundarias y de compañeros junto con sus pasos y consecuencias.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('questsGrid');
    if (!grid) return;

    initModal();

    const quests = await DataService.getQuests();
    if (!quests) {
        grid.innerHTML = `<div class="empty-state">❌ Error al cargar las misiones.</div>`;
        return;
    }

    const searchInput = document.getElementById('questSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const actFilter = document.getElementById('actFilter');

    const applyFilters = () => {
        const filtered = FilterUtils.filterCollection(
            quests,
            searchInput.value,
            ['name', 'description', 'startLocation', 'characters'],
            (quest) => {
                const matchCat = categoryFilter.value === 'all' || quest.category === categoryFilter.value;
                const matchAct = actFilter.value === 'all' || quest.act === actFilter.value;
                return matchCat && matchAct;
            }
        );
        renderQuests(filtered, grid);
    };

    searchInput.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    actFilter.addEventListener('change', applyFilters);

    renderQuests(quests, grid);
});

function renderQuests(list, container) {
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state">No se encontraron misiones con esos filtros.</div>`;
        return;
    }

    container.innerHTML = list.map(q => `
        <article class="db-card">
            <div>
                <div class="db-card-header">
                    <h3 class="db-card-title">${q.name}</h3>
                    <span class="badge">${q.act}</span>
                </div>
                <p class="db-card-desc">${q.description}</p>
                <div class="db-card-meta">
                    <p><strong>Tipo:</strong> ${q.category}</p>
                    <p><strong>Inicio:</strong> ${q.startLocation}</p>
                </div>
            </div>
            <button class="btn-details" onclick="openQuestModal('${q.id}')">Ver guía de misión</button>
        </article>
    `).join('');
}

async function openQuestModal(id) {
    const quests = await DataService.getQuests();
    const q = quests.find(item => item.id === id);
    if (!q) return;

    const stepsHtml = q.steps.map((step, index) => `
        <div class="subclass-item">
            <strong>Paso ${index + 1}</strong>
            <span>${step}</span>
        </div>
    `).join('');

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2 style="color: var(--gold); margin-bottom: 5px;">${q.name}</h2>
        <span class="badge">${q.category}</span>
        <span class="badge">${q.act}</span>
        <span class="badge" style="color: #ffae33;">🏷️ Contiene Spoilers</span>
        <p style="margin-top: 15px; color: var(--text-sec);">${q.description}</p>

        <div class="detail-section">
            <h4>Datos Generales</h4>
            <p><strong>Ubicación inicial:</strong> ${q.startLocation}</p>
            <p><strong>Personajes relacionados:</strong> ${q.characters}</p>
            <p><strong>Objetivos:</strong> ${q.objectives}</p>
        </div>

        <div class="detail-section">
            <h4>Pasos para Completarla</h4>
            ${stepsHtml}
        </div>

        <div class="detail-section">
            <h4>Recompensas, Consecuencias y Finales</h4>
            <p><strong>Recompensas:</strong> ${q.rewards}</p>
            <p><strong>Consecuencias de decisiones:</strong> ${q.consequences}</p>
            <p><strong>Posibles finales:</strong> ${q.endings}</p>
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