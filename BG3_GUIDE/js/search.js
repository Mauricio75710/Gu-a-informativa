/**
 * search.js
 * Buscador global en tiempo real para index.html.
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('globalSearch');
    const searchBtn = document.getElementById('globalSearchBtn');
    const resultsContainer = document.getElementById('globalSearchResults');

    if (!searchInput || !resultsContainer) return;

    let globalIndex = null;

    async function buildGlobalIndex() {
        if (globalIndex) return globalIndex;

        const [classes, races, spells, items, companions, enemies, quests, locations, mechanics, guides] = await Promise.all([
            DataService.getClasses(),
            DataService.getRaces(),
            DataService.getSpells(),
            DataService.getItems(),
            DataService.getCompanions(),
            DataService.getEnemies(),
            DataService.getQuests(),
            DataService.loadData('locations'),
            DataService.getMechanics(),
            DataService.getGuides()
        ]);

        globalIndex = [];

        if (classes) classes.forEach(c => globalIndex.push({ name: c.name, category: 'Clase', info: c.description, url: 'pages/classes.html' }));
        if (races) races.forEach(r => globalIndex.push({ name: r.name, category: 'Raza', info: r.description, url: 'pages/races.html' }));
        if (spells) spells.forEach(s => globalIndex.push({ name: s.name, category: 'Hechizo', info: `${s.school} • ${s.damage}`, url: 'pages/spells.html' }));
        if (items) items.forEach(i => globalIndex.push({ name: i.name, category: 'Objeto', info: `${i.rarity} • ${i.type} (${i.act})`, url: 'pages/items.html' }));
        if (companions) companions.forEach(p => globalIndex.push({ name: p.name, category: 'Compañero', info: `${p.race} • ${p.class}`, url: 'pages/companions.html' }));
        if (enemies) enemies.forEach(e => globalIndex.push({ name: e.name, category: 'Enemigo / Jefe', info: `${e.act} • ${e.hp}`, url: 'pages/enemies.html' }));
        if (quests) quests.forEach(q => globalIndex.push({ name: q.name, category: 'Misión', info: `${q.category} • ${q.act}`, url: 'pages/quests.html' }));
        if (locations) locations.forEach(l => globalIndex.push({ name: l.name, category: 'Ubicación', info: `${l.act} • ${l.region}`, url: 'pages/locations.html' }));
        if (mechanics) mechanics.forEach(m => globalIndex.push({ name: m.title, category: 'Mecánica', info: m.summary, url: 'pages/mechanics.html' }));
        if (guides) guides.forEach(g => globalIndex.push({ name: g.title, category: 'Guía', info: `${g.category} • Dificultad ${g.difficulty}`, url: 'pages/guides.html' }));

        return globalIndex;
    }

    async function performSearch() {
        const query = searchInput.value.trim().toLowerCase();

        if (query.length < 2) {
            resultsContainer.style.display = 'none';
            resultsContainer.innerHTML = '';
            return;
        }

        const index = await buildGlobalIndex();
        const matches = index.filter(entry =>
            entry.name.toLowerCase().includes(query) ||
            entry.category.toLowerCase().includes(query) ||
            entry.info.toLowerCase().includes(query)
        );

        resultsContainer.style.display = 'block';

        if (matches.length === 0) {
            resultsContainer.innerHTML = `<div class="search-empty">No se encontraron resultados para "<strong>${searchInput.value}</strong>".</div>`;
            return;
        }

        resultsContainer.innerHTML = `
            <div class="search-results-header">
                <span>Resultados encontrados (${matches.length})</span>
                <button type="button" id="closeSearchResults" class="search-close-btn">Cerrar ✕</button>
            </div>
            <div class="search-results-list">
                ${matches.slice(0, 15).map(m => `
                    <a href="${m.url}" class="search-result-item">
                        <div>
                            <strong>${m.name}</strong>
                            <p>${m.info}</p>
                        </div>
                        <span class="search-result-badge">${m.category}</span>
                    </a>
                `).join('')}
            </div>
        `;

        const closeBtn = document.getElementById('closeSearchResults');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                resultsContainer.style.display = 'none';
            });
        }
    }

    searchInput.addEventListener('input', performSearch);
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
});