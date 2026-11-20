/**
 * items.js
 * Controla la base de datos de objetos, filtros por categoría/rareza y fichas individuales.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('itemsGrid');
    if (!grid) return;

    initItemModal();

    const items = await DataService.getItems();
    if (!items) {
        grid.innerHTML = `<div class="empty-state">❌ Error al cargar los objetos. Verifica tu servidor local.</div>`;
        return;
    }

    const searchInput = document.getElementById('itemSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const rarityFilter = document.getElementById('rarityFilter');
    const actFilter = document.getElementById('actFilter');

    const applyFilters = () => {
        const filtered = FilterUtils.filterCollection(
            items,
            searchInput.value,
            ['name', 'description', 'effects', 'location'],
            (item) => {
                const matchCat = categoryFilter.value === 'all' || item.category === categoryFilter.value;
                const matchRarity = rarityFilter.value === 'all' || item.rarity === rarityFilter.value;
                const matchAct = actFilter.value === 'all' || item.act.includes(actFilter.value);
                return matchCat && matchRarity && matchAct;
            }
        );
        renderItems(filtered, grid);
    };

    searchInput.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    rarityFilter.addEventListener('change', applyFilters);
    actFilter.addEventListener('change', applyFilters);

    renderItems(items, grid);
});

function getRarityClass(rarity) {
    const map = {
        'Común': 'rarity-comun',
        'Poco común': 'rarity-poco-comun',
        'Raro': 'rarity-raro',
        'Muy raro': 'rarity-muy-raro',
        'Legendario': 'rarity-legendario'
    };
    return map[rarity] || 'rarity-comun';
}

function renderItems(list, container) {
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state">No se encontraron objetos con esos criterios.</div>`;
        return;
    }

    container.innerHTML = list.map(item => `
        <article class="db-card">
            <div>
                <div class="db-card-header">
                    <h3 class="db-card-title">${item.name}</h3>
                    <span class="badge ${getRarityClass(item.rarity)}">${item.rarity}</span>
                </div>
                <p class="db-card-desc">${item.description}</p>
                <div class="db-card-meta">
                    <p><strong>Tipo:</strong> ${item.type} (${item.category})</p>
                    <p><strong>Estadística:</strong> ${item.stat}</p>
                    <p><strong>Ubicación:</strong> ${item.act}</p>
                </div>
            </div>
            <button class="btn-details" onclick="openItemModal('${item.id}')">Ver ficha del objeto</button>
        </article>
    `).join('');
}

async function openItemModal(itemId) {
    const items = await DataService.getItems();
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2 style="color: var(--gold); margin-bottom: 5px;">${item.name}</h2>
        <span class="badge ${getRarityClass(item.rarity)}">${item.rarity}</span>
        <span class="badge">${item.type}</span>
        <p style="margin-top: 15px; color: var(--text-sec);">${item.description}</p>

        <div class="detail-section">
            <h4>Estadísticas y Propiedades</h4>
            <p><strong>Daño / Protección / Valor:</strong> ${item.stat}</p>
            <p><strong>Efectos especiales:</strong> ${item.effects}</p>
            <p><strong>Requisitos:</strong> ${item.requirements}</p>
        </div>

        <div class="detail-section">
            <h4>Obtención en el Juego</h4>
            <p><strong>Acto:</strong> ${item.act}</p>
            <p><strong>Ubicación exacta:</strong> ${item.location}</p>
            <p><strong>Misión relacionada:</strong> ${item.quest}</p>
        </div>
    `;

    document.getElementById('detailModal').classList.add('active');
}

function initItemModal() {
    const modal = document.getElementById('detailModal');
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}