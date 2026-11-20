/**
 * spells.js
 * Controla el catálogo de hechizos, trucos, filtros y fichas detalladas.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('spellsGrid');
    if (!grid) return;

    initSpellModal();

    const spells = await DataService.getSpells();
    if (!spells) {
        grid.innerHTML = `<div class="empty-state">❌ Error al cargar los hechizos. Verifica tu servidor local.</div>`;
        return;
    }

    const searchInput = document.getElementById('spellSearch');
    const levelFilter = document.getElementById('levelFilter');
    const schoolFilter = document.getElementById('schoolFilter');
    const classFilter = document.getElementById('classFilter');

    const applyFilters = () => {
        const filtered = FilterUtils.filterCollection(
            spells,
            searchInput.value,
            ['name', 'description', 'damage'],
            (spell) => {
                const matchLevel = levelFilter.value === 'all' || String(spell.level) === levelFilter.value;
                const matchSchool = schoolFilter.value === 'all' || spell.school === schoolFilter.value;
                const matchClass = classFilter.value === 'all' || spell.classes.includes(classFilter.value);
                return matchLevel && matchSchool && matchClass;
            }
        );
        renderSpells(filtered, grid);
    };

    searchInput.addEventListener('input', applyFilters);
    levelFilter.addEventListener('change', applyFilters);
    schoolFilter.addEventListener('change', applyFilters);
    classFilter.addEventListener('change', applyFilters);

    renderSpells(spells, grid);
});

function renderSpells(list, container) {
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state">No se encontraron hechizos con esos filtros.</div>`;
        return;
    }

    container.innerHTML = list.map(spell => {
        const levelLabel = spell.level === 0 ? 'Truco' : `Nivel ${spell.level}`;
        return `
            <article class="db-card">
                <div>
                    <div class="db-card-header">
                        <h3 class="db-card-title">${spell.name}</h3>
                        <span class="badge">${levelLabel}</span>
                    </div>
                    <p class="db-card-desc">${spell.description}</p>
                    <div class="db-card-meta">
                        <p><strong>Escuela:</strong> ${spell.school}</p>
                        <p><strong>Efecto/Daño:</strong> ${spell.damage}</p>
                        <p><strong>Clases:</strong> ${spell.classes.join(', ')}</p>
                    </div>
                </div>
                <button class="btn-details" onclick="openSpellModal('${spell.id}')">Ver ficha del hechizo</button>
            </article>
        `;
    }).join('');
}

async function openSpellModal(spellId) {
    const spells = await DataService.getSpells();
    const spell = spells.find(s => s.id === spellId);
    if (!spell) return;

    const levelLabel = spell.level === 0 ? 'Truco (Nivel 0)' : `Nivel ${spell.level}`;
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h2 style="color: var(--gold); margin-bottom: 5px;">${spell.name}</h2>
        <span class="badge">${levelLabel}</span>
        <span class="badge">${spell.school}</span>
        ${spell.concentration ? '<span class="badge" style="color: #ffae33;">Requiere Concentración</span>' : ''}
        <p style="margin-top: 15px; color: var(--text-sec);">${spell.description}</p>

        <div class="detail-section">
            <h4>Propiedades de Lanzamiento</h4>
            <p><strong>Tipo de acción:</strong> ${spell.castingTime}</p>
            <p><strong>Alcance:</strong> ${spell.range}</p>
            <p><strong>Duración:</strong> ${spell.duration}</p>
            <p><strong>Daño / Efecto:</strong> ${spell.damage}</p>
        </div>

        <div class="detail-section">
            <h4>Clases que pueden aprenderlo</h4>
            <p>${spell.classes.join(', ')}</p>
        </div>
    `;

    document.getElementById('detailModal').classList.add('active');
}

function initSpellModal() {
    const modal = document.getElementById('detailModal');
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}