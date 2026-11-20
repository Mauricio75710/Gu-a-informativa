/**
 * enemies.js
 * Muestra los jefes y enemigos destacados, sus estadísticas y estrategias de combate.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('enemiesGrid');
    if (!grid) return;

    initModal();

    const enemies = await DataService.getEnemies();
    if (!enemies) {
        grid.innerHTML = `<div class="empty-state">❌ Error al cargar los enemigos.</div>`;
        return;
    }

    const searchInput = document.getElementById('enemySearch');
    const actFilter = document.getElementById('actFilter');

    const applyFilters = () => {
        const filtered = FilterUtils.filterCollection(
            enemies,
            searchInput.value,
            ['name', 'type', 'location', 'strategy'],
            (enemy) => actFilter.value === 'all' || enemy.act === actFilter.value
        );
        renderEnemies(filtered, grid);
    };

    searchInput.addEventListener('input', applyFilters);
    actFilter.addEventListener('change', applyFilters);

    renderEnemies(enemies, grid);
});

function renderEnemies(list, container) {
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state">No se encontraron enemigos con esos filtros.</div>`;
        return;
    }

    container.innerHTML = list.map(enemy => `
        <article class="db-card">
            <div>
                <div class="db-card-header">
                    <h3 class="db-card-title">${enemy.name}</h3>
                    <span class="badge">${enemy.act}</span>
                </div>
                <p class="db-card-desc">${enemy.type} • ${enemy.location}</p>
                <div class="db-card-meta">
                    <p><strong>Puntos de Golpe:</strong> ${enemy.hp}</p>
                    <p><strong>Clase de Armadura:</strong> ${enemy.ac}</p>
                    <p><strong>Punto débil:</strong> ${enemy.weaknesses.substring(0, 65)}...</p>
                </div>
            </div>
            <button class="btn-details" onclick="openEnemyModal('${enemy.id}')">Ver estrategia y ficha</button>
        </article>
    `).join('');
}

async function openEnemyModal(id) {
    const enemies = await DataService.getEnemies();
    const enemy = enemies.find(e => e.id === id);
    if (!enemy) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2 style="color: var(--gold); margin-bottom: 5px;">${enemy.name}</h2>
        <span class="badge">${enemy.act}</span>
        <span class="badge">${enemy.type}</span>
        <span class="badge">${enemy.hp} | ${enemy.ac}</span>

        <div class="detail-section">
            <h4>Atributos Defensivos y Ubicación</h4>
            <p><strong>Ubicación:</strong> ${enemy.location}</p>
            <p><strong>Resistencias:</strong> ${enemy.resistances}</p>
            <p><strong>Inmunidades:</strong> ${enemy.immunities}</p>
            <p><strong>Debilidades:</strong> ${enemy.weaknesses}</p>
        </div>

        <div class="detail-section">
            <h4>Habilidades Principales</h4>
            <p>${enemy.abilities}</p>
        </div>

        <div class="detail-section">
            <h4>Estrategia Recomendada para Derrotarlo</h4>
            <p>${enemy.strategy}</p>
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