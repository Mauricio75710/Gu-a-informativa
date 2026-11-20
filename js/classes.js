/**
 * classes.js
 * Lógica dinámica para las páginas de Clases y Razas.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const classesContainer = document.getElementById('classesGrid');
    const racesContainer = document.getElementById('racesGrid');

    initModalEvents();

    if (classesContainer) {
        await initClassesPage(classesContainer);
    }

    if (racesContainer) {
        await initRacesPage(racesContainer);
    }
});

/**
 * Inicializa la vista de Clases
 */
async function initClassesPage(container) {
    const classesData = await DataService.getClasses();

    if (!classesData) {
        container.innerHTML = `<div class="empty-state">❌ Error al cargar los datos de clases. Verifica tu servidor local.</div>`;
        return;
    }

    const searchInput = document.getElementById('classSearch');
    const abilityFilter = document.getElementById('abilityFilter');
    const magicFilter = document.getElementById('magicFilter');

    const applyFilters = () => {
        const filtered = FilterUtils.filterCollection(
            classesData,
            searchInput.value,
            ['name', 'description', 'primaryAbility'],
            (cls) => {
                const matchAbility = abilityFilter.value === 'all' || 
                    cls.primaryAbility.toLowerCase().includes(abilityFilter.value.toLowerCase());
                
                const matchMagic = magicFilter.value === 'all' ||
                    (magicFilter.value === 'caster' && cls.spellsAvailable) ||
                    (magicFilter.value === 'martial' && !cls.spellsAvailable);

                return matchAbility && matchMagic;
            }
        );

        renderClasses(filtered, container);
    };

    searchInput.addEventListener('input', applyFilters);
    abilityFilter.addEventListener('change', applyFilters);
    magicFilter.addEventListener('change', applyFilters);

    renderClasses(classesData, container);
}

/**
 * Renderiza las tarjetas de clases en el DOM
 */
function renderClasses(list, container) {
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state">No se encontraron clases con esos filtros.</div>`;
        return;
    }

    container.innerHTML = list.map(cls => `
        <article class="db-card">
            <div>
                <div class="db-card-header">
                    <h3 class="db-card-title">${cls.name}</h3>
                    <span class="badge">Dado: ${cls.hitDie}</span>
                </div>
                <p class="db-card-desc">${cls.description}</p>
                <div class="db-card-meta">
                    <p><strong>Atributo principal:</strong> ${cls.primaryAbility}</p>
                    <p><strong>Subclases:</strong> ${cls.subclasses.length} disponibles</p>
                </div>
            </div>
            <button class="btn-details" onclick="openClassModal('${cls.id}')">Ver ficha completa</button>
        </article>
    `).join('');
}

/**
 * Abre la ficha detallada de una clase
 */
async function openClassModal(classId) {
    const classesData = await DataService.getClasses();
    const cls = classesData.find(c => c.id === classId);
    if (!cls) return;

    const modalBody = document.getElementById('modalBody');
    const subclassesHtml = cls.subclasses.map(sub => `
        <div class="subclass-item">
            <strong>${sub.name}</strong>
            <span>${sub.desc}</span>
        </div>
    `).join('');

    modalBody.innerHTML = `
        <h2 style="color: var(--gold); margin-bottom: 5px;">${cls.name}</h2>
        <span class="badge">Dado de Golpe: ${cls.hitDie}</span>
        <span class="badge">${cls.spellsAvailable ? 'Lanzador de conjuros' : 'Combatiente marcial'}</span>
        <p style="margin-top: 15px; color: var(--text-sec);">${cls.description}</p>

        <div class="detail-section">
            <h4>Atributos y Estadísticas</h4>
            <p><strong>Atributo principal:</strong> ${cls.primaryAbility}</p>
            <p><strong>Reparto recomendado:</strong> ${cls.recommendedStats}</p>
            <p><strong>Tiradas de salvación:</strong> ${cls.savingThrows.join(', ')}</p>
        </div>

        <div class="detail-section">
            <h4>Competencias y Habilidades</h4>
            <p><strong>Equipo:</strong> ${cls.proficiencies}</p>
            <p><strong>Habilidades a elegir:</strong> ${cls.skills.join(', ')}</p>
        </div>

        <div class="detail-section">
            <h4>Progresión Clave por Niveles</h4>
            <p>${cls.progression}</p>
        </div>

        <div class="detail-section">
            <h4>Subclases (${cls.subclasses.length})</h4>
            ${subclassesHtml}
        </div>
    `;

    document.getElementById('detailModal').classList.add('active');
}

/**
 * Inicializa la vista de Razas
 */
async function initRacesPage(container) {
    const racesData = await DataService.getRaces();

    if (!racesData) {
        container.innerHTML = `<div class="empty-state">❌ Error al cargar los datos de razas.</div>`;
        return;
    }

    const searchInput = document.getElementById('raceSearch');
    const speedFilter = document.getElementById('speedFilter');

    const applyFilters = () => {
        const filtered = FilterUtils.filterCollection(
            racesData,
            searchInput.value,
            ['name', 'description', 'traits'],
            (race) => speedFilter.value === 'all' || race.speed.includes(speedFilter.value)
        );
        renderRaces(filtered, container);
    };

    searchInput.addEventListener('input', applyFilters);
    speedFilter.addEventListener('change', applyFilters);

    renderRaces(racesData, container);
}

/**
 * Renderiza las tarjetas de razas
 */
function renderRaces(list, container) {
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state">No se encontraron razas con esos criterios.</div>`;
        return;
    }

    container.innerHTML = list.map(race => `
        <article class="db-card">
            <div>
                <div class="db-card-header">
                    <h3 class="db-card-title">${race.name}</h3>
                    <span class="badge">Vel: ${race.speed}</span>
                </div>
                <p class="db-card-desc">${race.description}</p>
                <div class="db-card-meta">
                    <p><strong>Subrazas:</strong> ${race.subraces.length > 0 ? race.subraces.length : 'Sin subrazas'}</p>
                    <p><strong>Rasgos:</strong> ${race.traits.substring(0, 75)}...</p>
                </div>
            </div>
            <button class="btn-details" onclick="openRaceModal('${race.id}')">Ver ficha racial</button>
        </article>
    `).join('');
}

/**
 * Abre la ficha detallada de una raza
 */
async function openRaceModal(raceId) {
    const racesData = await DataService.getRaces();
    const race = racesData.find(r => r.id === raceId);
    if (!race) return;

    const modalBody = document.getElementById('modalBody');
    const subracesHtml = race.subraces.length > 0
        ? race.subraces.map(sub => `
            <div class="subclass-item">
                <strong>${sub.name}</strong>
                <span>${sub.desc}</span>
            </div>
        `).join('')
        : `<p style="color: var(--text-sec);">Esta raza no se divide en subrazas.</p>`;

    modalBody.innerHTML = `
        <h2 style="color: var(--gold); margin-bottom: 5px;">${race.name}</h2>
        <span class="badge">Velocidad base: ${race.speed}</span>
        <p style="margin-top: 15px; color: var(--text-sec);">${race.description}</p>

        <div class="detail-section">
            <h4>Características Raciales y Ventajas</h4>
            <p>${race.traits}</p>
        </div>

        <div class="detail-section">
            <h4>Competencias Raciales</h4>
            <p>${race.proficiencies}</p>
        </div>

        <div class="detail-section">
            <h4>Subrazas</h4>
            ${subracesHtml}
        </div>
    `;

    document.getElementById('detailModal').classList.add('active');
}

/**
 * Configura el cierre del modal
 */
function initModalEvents() {
    const modal = document.getElementById('detailModal');
    const closeBtn = document.getElementById('closeModalBtn');

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}