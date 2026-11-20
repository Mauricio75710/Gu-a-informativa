/**
 * locations.js
 * Muestra las regiones y ubicaciones principales de cada acto del juego.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('locationsGrid');
    if (!grid) return;

    initModal();

    const locations = await DataService.loadData('locations');
    if (!locations) {
        grid.innerHTML = `<div class="empty-state">❌ Error al cargar las ubicaciones.</div>`;
        return;
    }

    const searchInput = document.getElementById('locSearch');
    const actFilter = document.getElementById('actFilter');

    const applyFilters = () => {
        const filtered = FilterUtils.filterCollection(
            locations,
            searchInput.value,
            ['name', 'region', 'description', 'pointsOfInterest', 'bosses'],
            (loc) => actFilter.value === 'all' || loc.act.includes(actFilter.value)
        );
        renderLocations(filtered, grid);
    };

    searchInput.addEventListener('input', applyFilters);
    actFilter.addEventListener('change', applyFilters);

    renderLocations(locations, grid);
});

function renderLocations(list, container) {
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state">No se encontraron ubicaciones con esos criterios.</div>`;
        return;
    }

    container.innerHTML = list.map(loc => `
        <article class="db-card">
            <div>
                <div class="db-card-header">
                    <h3 class="db-card-title">${loc.name}</h3>
                    <span class="badge">${loc.act}</span>
                </div>
                <p class="db-card-desc">${loc.description}</p>
                <div class="db-card-meta">
                    <p><strong>Región:</strong> ${loc.region}</p>
                    <p><strong>Jefes clave:</strong> ${loc.bosses}</p>
                </div>
            </div>
            <button class="btn-details" onclick="openLocationModal('${loc.id}')">Explorar región</button>
        </article>
    `).join('');
}

async function openLocationModal(id) {
    const locations = await DataService.loadData('locations');
    const loc = locations.find(item => item.id === id);
    if (!loc) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2 style="color: var(--gold); margin-bottom: 5px;">${loc.name}</h2>
        <span class="badge">${loc.act}</span>
        <span class="badge">${loc.region}</span>
        <p style="margin-top: 15px; color: var(--text-sec);">${loc.description}</p>

        <div class="detail-section">
            <h4>Puntos de Interés Principales</h4>
            <p>${loc.pointsOfInterest}</p>
        </div>

        <div class="detail-section">
            <h4>Jefes y Encuentros Destacados</h4>
            <p>${loc.bosses}</p>
        </div>

        <div class="detail-section">
            <h4>Misiones Relacionadas</h4>
            <p>${loc.quests}</p>
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