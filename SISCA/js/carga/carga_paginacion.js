const PaginacionCarga = {
    paginaActual: 1,
    registrosPorPagina: 15,
    totalRegistros: 0,
    totalPaginas: 0,

    inicializar(totalRegistros, registrosPorPagina = 15) {
        this.totalRegistros = totalRegistros;
        this.registrosPorPagina = registrosPorPagina;
        this.totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
        this.paginaActual = 1;
        this.renderizar();
    },

    renderizar() {
        const container = document.getElementById('paginacion');
        
        if (this.totalPaginas <= 1) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        container.innerHTML = '';

        
        const btnAnterior = this.crearBoton('‹', this.paginaActual - 1, this.paginaActual === 1);
        btnAnterior.title = 'Página anterior';
        container.appendChild(btnAnterior);

        
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

        
        const btnSiguiente = this.crearBoton('›', this.paginaActual + 1, this.paginaActual === this.totalPaginas);
        btnSiguiente.title = 'Página siguiente';
        container.appendChild(btnSiguiente);

        
        const info = document.createElement('span');
        info.className = 'pag-info';
        const inicio = (this.paginaActual - 1) * this.registrosPorPagina + 1;
        const fin = Math.min(this.paginaActual * this.registrosPorPagina, this.totalRegistros);
        info.textContent = `${inicio}-${fin} de ${this.totalRegistros}`;
        container.appendChild(info);
    },

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

    obtenerPaginasVisibles() {
        const paginas = [];
        const maxVisibles = 5; 

        if (this.totalPaginas <= maxVisibles + 2) {
            
            for (let i = 1; i <= this.totalPaginas; i++) {
                paginas.push(i);
            }
        } else {
            
            paginas.push(1);

            
            let inicio = Math.max(2, this.paginaActual - 1);
            let fin = Math.min(this.totalPaginas - 1, this.paginaActual + 1);

            
            if (this.paginaActual <= 3) {
                fin = 4;
            }

            
            if (this.paginaActual >= this.totalPaginas - 2) {
                inicio = this.totalPaginas - 3;
            }

            
            if (inicio > 2) {
                paginas.push('...');
            }

            
            for (let i = inicio; i <= fin; i++) {
                paginas.push(i);
            }

            
            if (fin < this.totalPaginas - 1) {
                paginas.push('...');
            }

            
            paginas.push(this.totalPaginas);
        }

        return paginas;
    },

    irAPagina(pagina) {
        if (pagina < 1 || pagina > this.totalPaginas || pagina === this.paginaActual) {
            return;
        }

        this.paginaActual = pagina;
        this.renderizar();

        
        document.dispatchEvent(new CustomEvent('paginaCambiada', {
            detail: {
                pagina: this.paginaActual,
                registrosPorPagina: this.registrosPorPagina
            }
        }));
    },

    obtenerRango() {
        const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
        const fin = inicio + this.registrosPorPagina;
        
        return { inicio, fin };
    },

    reset() {
        this.paginaActual = 1;
        this.renderizar();
    }
};


window.PaginacionCarga = PaginacionCarga;
