class FiltrosDocentes {
    constructor() {
        this.filtrosActivos = new Map();
        this.datosFiltros = { turnos: [], regimenes: [] };
        this.init();
    }

    async init() {
        await this.cargarDatosFiltros();
    }

    async cargarDatosFiltros() {
        const resultado = await DocentesAPI.obtenerDatosFiltros();
        if (resultado.success) {
            this.datosFiltros = resultado.data;
        }
    }

    verInactivos() {
        mostrandoInactivos = !mostrandoInactivos;
        this.actualizarBotonInactivos();
        cargarDocentes(1);
    }

    actualizarBotonInactivos() {
        const btn = document.getElementById('btnVerInactivos');

        if (mostrandoInactivos) {
            btn.innerHTML = '<i class="fa-solid fa-user-check"></i> Ver Activos';
            btn.classList.add('active');
        } else {
            btn.innerHTML = '<i class="fa-solid fa-user-slash"></i> Ver Inactivos';
            btn.classList.remove('active');
        }
    }

    
    agregarFiltro(tipo) {
        if (this.filtrosActivos.has(tipo)) {
            const filtroId = this.filtrosActivos.get(tipo);
            this.quitarFiltro(tipo, filtroId);
            return;
        }

        const contenedor = document.getElementById('filtros-activos');
        const filtroId = `filtro-${tipo}-${Date.now()}`;
        const inputHTML = this.generarHTMLFiltro(tipo, filtroId);

        contenedor.insertAdjacentHTML('beforeend', inputHTML);
        this.filtrosActivos.set(tipo, filtroId);
        contenedor.style.display = 'flex';
    }


    
    quitarFiltro(tipo, filtroId) {
        document.getElementById(filtroId)?.remove();
        this.filtrosActivos.delete(tipo);

        const contenedor = document.getElementById('filtros-activos');
        if (this.filtrosActivos.size === 0) {
            contenedor.style.display = 'none';
        }

        this.aplicarFiltros();
    }

    
    aplicarFiltros() {
        filtrosActivos = {};

        this.filtrosActivos.forEach((filtroId, tipo) => {
            const input = document.getElementById(`input-${tipo}`);
            if (input && input.value) {
                filtrosActivos[tipo] = input.value;
            }
        });

        cargarDocentes(1);
    }

   
    generarHTMLFiltro(tipo, filtroId) {
        const configuraciones = {
            nombre_docente: {
                icono: 'fa-user',
                label: 'NOMBRE DEL DOCENTE',
                contenido: `<input type="text" 
                           id="input-${tipo}" 
                           placeholder="Escribe el nombre..." 
                           class="filtro-input"
                           onchange="filtrosDocentes.aplicarFiltros()">`
            },
            turno: {
                icono: 'fa-clock',
                label: 'TURNO',
                contenido: this.generarSelectFiltro(tipo, this.datosFiltros.turnos, 'turno')
            },
            regimen: {
                icono: 'fa-briefcase',
                label: 'RÉGIMEN',
                contenido: this.generarSelectFiltro(tipo, this.datosFiltros.regimenes, 'régimen')
            }
        };

        const config = configuraciones[tipo];
        if (!config) return '';

        return `
            <div class="filtro-card" id="${filtroId}">
                <div class="filtro-header-card">
                    <label class="filtro-label">
                        <i class="fa-solid ${config.icono}"></i> ${config.label}
                    </label>
                    <button onclick="filtrosDocentes.quitarFiltro('${tipo}', '${filtroId}')" class="filtro-close">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                ${config.contenido}
            </div>
        `;
    }

    
    generarSelectFiltro(tipo, opciones, placeholder) {
        const opcionesHTML = opciones.map(o => `<option value="${o}">${o}</option>`).join('');

        return `
            <select id="input-${tipo}" 
                    class="filtro-select"
                    onchange="filtrosDocentes.aplicarFiltros()">
                <option value="">Todos</option>
                ${opcionesHTML}
            </select>
        `;
    }
}




let filtrosDocentes;

document.addEventListener('DOMContentLoaded', () => {
    filtrosDocentes = new FiltrosDocentes();
});