const DocentesAPI = {
    baseURL: '../../php/docentes',
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}/${endpoint}`, options);
            return await response.json();
        } catch (error) {
            console.error(`Error en ${endpoint}:`, error);
            return { success: false, message: 'Error de conexión' };
        }
    },

    
    
    

    
    async crear(data) {
        return await this.request('crear_docente.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    
    async editar(data) {
        return await this.request('editar_docente.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    
    async cambiarEstado(id, estado) {
        return await this.request('baja_docente.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, estado })
        });
    },

    
    
    

    
    async obtener(filtros = {}, page = 1) {
        const params = new URLSearchParams({ ...filtros, page });
        return await this.request(`obtener_docentes.php?${params}`);
    },

    
    async obtenerDatosFiltros() {
        return await this.request('obtener_datos_filtros.php');
    }
};