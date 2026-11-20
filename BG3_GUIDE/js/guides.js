/**
 * guides.js
 * Muestra las guías y tutoriales paso a paso con índice de contenidos.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('guidesGrid');
    if (!grid) return;

    initModal();

    const guides = await DataService.getGuides();
    if (!guides) {
        grid.innerHTML = `<div class="empty-state">❌ Error al cargar las guías y tutoriales.</div>`;
        return;
    }

    const searchInput = document.getElementById('guideSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');

    const applyFilters = () => {
        const filtered = FilterUtils.filterCollection(
            guides,
            searchInput.value,
            ['title', 'description', 'category'],
            (guide) => {
                const matchCat = categoryFilter.value === 'all' || guide.category === categoryFilter.value;
                const matchDiff = difficultyFilter.value === 'all' || guide.difficulty === difficultyFilter.value;
                return matchCat && matchDiff;
            }
        );
        renderGuides(filtered, grid);
    };

    searchInput.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    difficultyFilter.addEventListener('change', applyFilters);

    renderGuides(guides, grid);
});

function renderGuides(list, container) {
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state">No se encontraron guías con esos criterios.</div>`;
        return;
    }

    container.innerHTML = list.map(g => `
        <article class="db-card">
            <div>
                <div class="db-card-header">
                    <h3 class="db-card-title">${g.title}</h3>
                    <span class="badge">${g.difficulty}</span>
                </div>
                <p class="db-card-desc">${g.description}</p>
                <div class="db-card-meta">
                    <p><strong>Categoría:</strong> ${g.category}</p>
                    <p><strong>Apartados:</strong> ${g.sections.length} secciones detalladas</p>
                </div>
            </div>
            <button class="btn-details" onclick="openGuideModal('${g.id}')">Leer guía completa</button>
        </article>
    `).join('');
}

async function openGuideModal(id) {
    const guides = await DataService.getGuides();
    const g = guides.find(item => item.id === id);
    if (!g) return;

    const tocHtml = g.toc.map(item => `<li style="margin-bottom: 4px; color: var(--text-main);">• ${item}</li>`).join('');
    const sectionsHtml = g.sections.map(sec => `
        <div class="detail-section">
            <h4>${sec.heading}</h4>
            <p style="color: var(--text-sec);">${sec.content}</p>
        </div>
    `).join('');

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2 style="color: var(--gold); margin-bottom: 5px;">${g.title}</h2>
        <span class="badge">${g.category}</span>
        <span class="badge">Dificultad: ${g.difficulty}</span>
        <p style="margin-top: 15px; color: var(--text-sec);">${g.description}</p>

        <div class="detail-section" style="background-color: var(--panel); padding: 14px; border-radius: 6px;">
            <h4 style="margin-top: 0; color: var(--gold);">Índice de Contenidos</h4>
            <ul>${tocHtml}</ul>
        </div>

        ${sectionsHtml}

        <div class="detail-section">
            <h4>Información Relacionada</h4>
            <p style="color: var(--violet);">${g.related}</p>
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