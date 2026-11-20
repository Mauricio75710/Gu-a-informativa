/**
 * filters.js
 * Utilidades reutilizables para filtrar listas de objetos JSON.
 */

const FilterUtils = {
    /**
     * Filtra una colección de elementos por texto de búsqueda y un objeto de filtros.
     * @param {Array} items - Arreglo original de datos
     * @param {string} searchText - Texto ingresado por el usuario
     * @param {Array<string>} searchFields - Propiedades donde buscar el texto (ej. ['name', 'description'])
     * @param {Function|null} customPredicate - Función adicional opcional para filtros selectivos
     * @returns {Array}
     */
    filterCollection(items, searchText = '', searchFields = ['name'], customPredicate = null) {
        const query = searchText.trim().toLowerCase();

        return items.filter(item => {
            // 1. Filtro por texto
            const matchesText = !query || searchFields.some(field => {
                const value = item[field];
                return value && String(value).toLowerCase().includes(query);
            });

            // 2. Filtro personalizado (ej. selectores de atributo, nivel, rareza)
            const matchesCustom = !customPredicate || customPredicate(item);

            return matchesText && matchesCustom;
        });
    }
};