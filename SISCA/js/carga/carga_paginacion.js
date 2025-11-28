/**
 * Sistema de Paginación para Carga Académica
 * Maneja la paginación de la tabla de cargas
 */

const PaginacionCarga = {
    paginaActual: 1,
    registrosPorPagina: 15,
    totalRegistros: 0,
    totalPaginas: 0,

    /**
     * Inicializa la paginación
     */
    inicializar(totalRegistros, registrosPorPagina = 15) {
        this.totalRegistros = totalRegistros;
        this.registrosPorPagina = registrosPorPagina;
        this.totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
        this.paginaActual = 1;
        this.renderizar();
    },

    /**
     * Renderiza los controles de paginación
     */
    renderizar() {
        const container = document.getElementById('paginacion');
        
        if (this.totalPaginas <= 1) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        container.innerHTML = '';

        // Botón Anterior
        const btnAnterior = this.crearBoton('‹', this.paginaActual - 1, this.paginaActual === 1);
        btnAnterior.title = 'Página anterior';
        container.appendChild(btnAnterior);

        // Números de página
        const paginas = this.obtenerPaginasVisibles();
        
        paginas.forEach((pagina, index) => {
            if (pagina === '...') {
                const dots = document.createElement('span');
                dots.className = 'pag-dots';
                dots.textContent = '...';
                container.appendChild(dots);
            } else {
                const btn = this.crearBoton(
                    pagina, 
                    pagina, 
                    false, 
                    pagina === this.paginaActual
                );
                container.appendChild(btn);
            }
        });

        // Botón Siguiente
        const btnSiguiente = this.crearBoton('›', this.paginaActual + 1, this.paginaActual === this.totalPaginas);
        btnSiguiente.title = 'Página siguiente';
        container.appendChild(btnSiguiente);

        // Info de paginación
        const info = document.createElement('span');
        info.className = 'pag-info';
        const inicio = (this.paginaActual - 1) * this.registrosPorPagina + 1;
        const fin = Math.min(this.paginaActual * this.registrosPorPagina, this.totalRegistros);
        info.textContent = `${inicio}-${fin} de ${this.totalRegistros}`;
        container.appendChild(info);
    },

    /**
     * Crea un botón de paginación
     */
    crearBoton(texto, pagina, disabled, active = false) {
        const btn = document.createElement('button');
        btn.className = 'btn-pag';
        btn.textContent = texto;
        btn.disabled = disabled;
        
        if (active) {
            btn.classList.add('active');
        }

        if (!disabled && !active) {
            btn.addEventListener('click', () => this.irAPagina(pagina));
        }

        return btn;
    },

    /**
     * Obtiene las páginas visibles según la página actual
     */
    obtenerPaginasVisibles() {
        const paginas = [];
        const maxVisibles = 5; // Número máximo de páginas visibles

        if (this.totalPaginas <= maxVisibles + 2) {
            // Mostrar todas las páginas si son pocas
            for (let i = 1; i <= this.totalPaginas; i++) {
                paginas.push(i);
            }
        } else {
            // Siempre mostrar primera página
            paginas.push(1);

            // Rango alrededor de la página actual
            let inicio = Math.max(2, this.paginaActual - 1);
            let fin = Math.min(this.totalPaginas - 1, this.paginaActual + 1);

            // Ajustar si estamos cerca del inicio
            if (this.paginaActual <= 3) {
                fin = 4;
            }

            // Ajustar si estamos cerca del final
            if (this.paginaActual >= this.totalPaginas - 2) {
                inicio = this.totalPaginas - 3;
            }

            // Agregar puntos suspensivos si es necesario
            if (inicio > 2) {
                paginas.push('...');
            }

            // Agregar páginas del rango
            for (let i = inicio; i <= fin; i++) {
                paginas.push(i);
            }

            // Agregar puntos suspensivos si es necesario
            if (fin < this.totalPaginas - 1) {
                paginas.push('...');
            }

            // Siempre mostrar última página
            paginas.push(this.totalPaginas);
        }

        return paginas;
    },

    /**
     * Navega a una página específica
     */
    irAPagina(pagina) {
        if (pagina < 1 || pagina > this.totalPaginas || pagina === this.paginaActual) {
            return;
        }

        this.paginaActual = pagina;
        this.renderizar();

        // Emitir evento personalizado para que otros módulos lo escuchen
        document.dispatchEvent(new CustomEvent('paginaCambiada', {
            detail: {
                pagina: this.paginaActual,
                registrosPorPagina: this.registrosPorPagina
            }
        }));
    },

    /**
     * Obtiene el rango de registros para la página actual
     */
    obtenerRango() {
        const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
        const fin = inicio + this.registrosPorPagina;
        
        return { inicio, fin };
    },

    /**
     * Resetea la paginación a la primera página
     */
    reset() {
        this.paginaActual = 1;
        this.renderizar();
    }
};

// Hacer disponible globalmente
window.PaginacionCarga = PaginacionCarga;
