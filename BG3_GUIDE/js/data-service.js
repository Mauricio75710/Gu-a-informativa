/**
 * data-service.js
 * Se encarga de cargar los archivos JSON, procesarlos y devolver los datos
 * a las demás partes de la aplicación, adaptando rutas relativas automáticamente.
 */

const DataService = {
    cache: {},

    getBasePath() {
        return window.location.pathname.includes('/pages/') ? '../data/' : 'data/';
    },

    async loadData(filename) {
        if (this.cache[filename]) {
            return this.cache[filename];
        }

        try {
            const path = `${this.getBasePath()}${filename}.json`;
            const response = await fetch(path);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} al cargar ${path}`);
            }
            
            const data = await response.json();
            this.cache[filename] = data;
            return data;
            
        } catch (error) {
            console.error(`Error en DataService cargando ${filename}:`, error);
            return null; 
        }
    },

    async getClasses() { return await this.loadData('classes'); },
    async getRaces() { return await this.loadData('races'); },
    async getSpells() { return await this.loadData('spells'); },
    async getItems() { return await this.loadData('items'); },
    async getCompanions() { return await this.loadData('companions'); },
    async getEnemies() { return await this.loadData('enemies'); },
    async getQuests() { return await this.loadData('quests'); },
    async getMechanics() { return await this.loadData('mechanics'); },
    async getGuides() { return await this.loadData('guides'); }
};