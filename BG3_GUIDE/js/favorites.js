/**
 * favorites.js
 * Gestiona el sistema de favoritos con LocalStorage y añade el botón
 * de favoritos dinámicamente a las fichas detalladas (modales).
 */

const FavoritesService = {
    STORAGE_KEY: 'bg3_rpg_guide_favorites',

    getAll() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Error leyendo LocalStorage:', e);
            return [];
        }
    },

    isFavorite(id, category) {
        return this.getAll().some(item => item.id === id && item.category === category);
    },

    toggle(item) {
        const list = this.getAll();
        const index = list.findIndex(fav => fav.id === item.id && fav.category === item.category);

        if (index >= 0) {
            list.splice(index, 1);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
            return false;
        } else {
            list.push({
                id: item.id,
                title: item.title,
                category: item.category,
                subtitle: item.subtitle || '',
                pageUrl: item.pageUrl
            });
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
            return true;
        }
    },

    remove(id, category) {
        const list = this.getAll().filter(item => !(item.id === id && item.category === category));
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const modalBody = document.getElementById('modalBody');
    if (modalBody) {
        const observer = new MutationObserver(() => {
            injectFavoriteButtonToModal(modalBody);
        });
        observer.observe(modalBody, { childList: true });
    }

    const favGrid = document.getElementById('favoritesGrid');
    if (favGrid) {
        renderFavoritesPage(favGrid);
    }
});

function injectFavoriteButtonToModal(modalBody) {
    if (modalBody.querySelector('.fav-modal-actions')) return;

    const titleEl = modalBody.querySelector('h2');
    if (!titleEl) return;

    const title = titleEl.textContent.trim();
    const path = window.location.pathname;

    let category = 'Enciclopedia';
    let pageUrl = 'index.html';

    if (path.includes('classes.html')) { category = 'Clase'; pageUrl = 'pages/classes.html'; }
    else if (path.includes('races.html')) { category = 'Raza'; pageUrl = 'pages/races.html'; }
    else if (path.includes('spells.html')) { category = 'Hechizo'; pageUrl = 'pages/spells.html'; }
    else if (path.includes('items.html')) { category = 'Objeto'; pageUrl = 'pages/items.html'; }
    else if (path.includes('companions.html')) { category = 'Compañero'; pageUrl = 'pages/companions.html'; }
    else if (path.includes('enemies.html')) { category = 'Enemigo / Jefe'; pageUrl = 'pages/enemies.html'; }
    else if (path.includes('quests.html')) { category = 'Misión'; pageUrl = 'pages/quests.html'; }
    else if (path.includes('locations.html')) { category = 'Ubicación'; pageUrl = 'pages/locations.html'; }
    else if (path.includes('mechanics.html')) { category = 'Mecánica'; pageUrl = 'pages/mechanics.html'; }
    else if (path.includes('guides.html')) { category = 'Guía'; pageUrl = 'pages/guides.html'; }

    const itemId = title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const firstBadge = modalBody.querySelector('.badge');
    const subtitle = firstBadge ? firstBadge.textContent.trim() : category;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'fav-modal-actions';
    actionsDiv.style.marginTop = '22px';
    actionsDiv.style.paddingTop = '15px';
    actionsDiv.style.borderTop = '1px solid var(--gold-dim)';
    actionsDiv.style.display = 'flex';
    actionsDiv.style.justifyContent = 'flex-end';

    const favBtn = document.createElement('button');
    favBtn.className = 'btn-primary';
    favBtn.style.padding = '10px 18px';
    favBtn.style.display = 'inline-flex';
    favBtn.style.alignItems = 'center';
    favBtn.style.gap = '8px';

    const updateBtnVisual = (saved) => {
        favBtn.innerHTML = saved
            ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Guardado en Favoritos'
            : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Añadir a Favoritos';
        favBtn.style.backgroundColor = saved ? 'var(--gold)' : 'var(--panel)';
        favBtn.style.color = saved ? 'var(--bg-main)' : 'var(--gold)';
        favBtn.style.border = '1px solid var(--gold)';
    };

    updateBtnVisual(FavoritesService.isFavorite(itemId, category));

    favBtn.addEventListener('click', () => {
        const nowSaved = FavoritesService.toggle({
            id: itemId,
            title: title,
            category: category,
            subtitle: subtitle,
            pageUrl: pageUrl
        });
        updateBtnVisual(nowSaved);
    });

    actionsDiv.appendChild(favBtn);
    modalBody.appendChild(actionsDiv);
}

function renderFavoritesPage(container) {
    const categoryFilter = document.getElementById('favCategoryFilter');

    const renderList = () => {
        const currentFavs = FavoritesService.getAll();
        const filterVal = categoryFilter ? categoryFilter.value : 'all';
        const filtered = filterVal === 'all'
            ? currentFavs
            : currentFavs.filter(f => f.category === filterVal);

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p style="font-size: 1.05rem; margin-bottom: 8px; color: var(--gold);">No tienes elementos guardados en esta categoría.</p>
                    <p>Explora cualquier sección de la enciclopedia y selecciona <strong>"Añadir a Favoritos"</strong> dentro de su ficha.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(item => `
            <article class="db-card">
                <div>
                    <div class="db-card-header">
                        <h3 class="db-card-title">${item.title}</h3>
                        <span class="badge">${item.category}</span>
                    </div>
                    <div class="db-card-meta">
                        <p><strong>Detalle:</strong> ${item.subtitle}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <a href="../${item.pageUrl}" class="btn-details" style="text-align: center;">Ir a sección</a>
                    <button class="btn-details" style="border-color: rgba(201, 91, 91, 0.5); color: #e08282;" onclick="removeFavoriteAndRefresh('${item.id}', '${item.category}')">Quitar</button>
                </div>
            </article>
        `).join('');
    };

    if (categoryFilter) {
        categoryFilter.addEventListener('change', renderList);
    }

    renderList();
}

function removeFavoriteAndRefresh(id, category) {
    FavoritesService.remove(id, category);
    const favGrid = document.getElementById('favoritesGrid');
    if (favGrid) renderFavoritesPage(favGrid);
}