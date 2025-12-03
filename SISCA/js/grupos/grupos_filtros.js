let filtrosActivos = {
    grupo: false,
    generacion: false,
    nivel: false,
    programa: false,
    grado: false,
    turno: false
};

let valoresFiltros = {
    grupo: '',
    generacion: '',
    nivel: '',
    programa: '',
    grado: '',
    turno: ''
};

let opcionesFiltros = {
    grupos: [],
    generaciones: [],
    niveles: [],
    programas: [],
    grados: [],
    turnos: []
};


function cargarOpcionesFiltros() {
    if (!gruposData || gruposData.length === 0) return;
    
    opcionesFiltros.grupos = [...new Set(gruposData.map(g => g.codigo_grupo))].sort();
    opcionesFiltros.generaciones = [...new Set(gruposData.map(g => g.generacion))].sort();
    opcionesFiltros.niveles = [...new Set(gruposData.map(g => g.nivel_educativo))].sort();
    opcionesFiltros.programas = [...new Set(gruposData.map(g => g.programa_educativo))].sort();
    opcionesFiltros.grados = [...new Set(gruposData.map(g => g.grado))].sort((a, b) => a - b);
    opcionesFiltros.turnos = [...new Set(gruposData.map(g => g.turno || 'M'))].sort();
}




function toggleFiltro(filtro) {
    const btn = document.querySelector(`[data-filtro="${filtro}"]`);
    
    if (filtrosActivos[filtro]) {
        filtrosActivos[filtro] = false;
        valoresFiltros[filtro] = '';
        btn.classList.remove('active');
        eliminarCampoFiltro(filtro);
    } else {
        filtrosActivos[filtro] = true;
        btn.classList.add('active');
        agregarCampoFiltro(filtro);
    }
    
    actualizarVisibilidadFiltros();
    aplicarFiltros();
}




function agregarCampoFiltro(filtro) {
    const container = document.getElementById('filtros-activos');
    const filtroItem = document.createElement('div');
    filtroItem.className = 'filtro-item';
    filtroItem.id = `filtro-${filtro}`;
    
    let campo = '';
    let icono = '';
    
    switch(filtro) {
        case 'grupo':
            icono = 'fa-hashtag';
            const opcionesGrupo = opcionesFiltros.grupos.map(g => `<option value="${g}">`).join('');
            campo = `
                <div class="filtro-header">
                    <label class="filtro-label"><i class="fa-solid ${icono}"></i> Buscar por Grupo</label>
                    <button type="button" class="filtro-close" onclick="toggleFiltro('grupo')">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <input type="text" class="filtro-input" list="lista-grupos" placeholder="Escribe o selecciona un grupo" 
                    oninput="actualizarFiltro('grupo', this.value)">
                <datalist id="lista-grupos">${opcionesGrupo}</datalist>
            `;
            break;
            
        case 'generacion':
            icono = 'fa-calendar';
            const opcionesGen = opcionesFiltros.generaciones.map(g => `<option value="${g}">`).join('');
            campo = `
                <div class="filtro-header">
                    <label class="filtro-label"><i class="fa-solid ${icono}"></i> Buscar por Generación</label>
                    <button type="button" class="filtro-close" onclick="toggleFiltro('generacion')">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <input type="text" class="filtro-input" list="lista-generaciones" placeholder="Escribe o selecciona una generación"
                    oninput="actualizarFiltro('generacion', this.value)">
                <datalist id="lista-generaciones">${opcionesGen}</datalist>
            `;
            break;
            
        case 'nivel':
            icono = 'fa-layer-group';
            const opcionesNivel = opcionesFiltros.niveles.map(n => {
                const texto = obtenerTextoNivel(n);
                return `<option value="${n}">${texto}</option>`;
            }).join('');
            campo = `
                <div class="filtro-header">
                    <label class="filtro-label"><i class="fa-solid ${icono}"></i> Filtrar por Nivel Educativo</label>
                    <button type="button" class="filtro-close" onclick="toggleFiltro('nivel')">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <select class="filtro-select" onchange="actualizarFiltro('nivel', this.value)">
                    <option value="">TODOS</option>
                    ${opcionesNivel}
                </select>
            `;
            break;
            
        case 'programa':
            icono = 'fa-book';
            const opcionesPrograma = opcionesFiltros.programas.map(p => {
                const nombreCompleto = obtenerNombrePrograma(p);
                return `<option value="${p}">${nombreCompleto}</option>`;
            }).join('');
            campo = `
                <div class="filtro-header">
                    <label class="filtro-label"><i class="fa-solid ${icono}"></i> Filtrar por Programa Educativo</label>
                    <button type="button" class="filtro-close" onclick="toggleFiltro('programa')">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <select class="filtro-select" onchange="actualizarFiltro('programa', this.value)">
                    <option value="">TODOS</option>
                    ${opcionesPrograma}
                </select>
            `;
            break;
            
        case 'grado':
            icono = 'fa-award';
            const opcionesGrado = opcionesFiltros.grados.map(g => `<option value="${g}">Grado ${g}</option>`).join('');
            campo = `
                <div class="filtro-header">
                    <label class="filtro-label"><i class="fa-solid ${icono}"></i> Filtrar por Grado</label>
                    <button type="button" class="filtro-close" onclick="toggleFiltro('grado')">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <select class="filtro-select" onchange="actualizarFiltro('grado', this.value)">
                    <option value="">TODOS</option>
                    ${opcionesGrado}
                </select>
            `;
            break;
            
        case 'turno':
            icono = 'fa-clock';
            campo = `
                <div class="filtro-header">
                    <label class="filtro-label"><i class="fa-solid ${icono}"></i> Filtrar por Turno</label>
                    <button type="button" class="filtro-close" onclick="toggleFiltro('turno')">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <select class="filtro-select" onchange="actualizarFiltro('turno', this.value)">
                    <option value="">TODOS</option>
                    <option value="M">Matutino</option>
                    <option value="N">Nocturno</option>
                </select>
            `;
            break;
    }
    
    filtroItem.innerHTML = campo;
    container.appendChild(filtroItem);
}




function obtenerNombrePrograma(codigo) {
    for (let nivel in programasEducativos) {
        const programa = programasEducativos[nivel].find(p => p.codigo === codigo);
        if (programa) return programa.nombre;
    }
    return codigo;
}

function eliminarCampoFiltro(filtro) {
    const campo = document.getElementById(`filtro-${filtro}`);
    if (campo) campo.remove();
}

function actualizarFiltro(filtro, valor) {
    valoresFiltros[filtro] = valor.toLowerCase().trim();
    aplicarFiltros();
}




function aplicarFiltros() {
    if (!gruposData || gruposData.length === 0) return;
    
    gruposFiltrados = gruposData.filter(grupo => {
        if (filtrosActivos.grupo && valoresFiltros.grupo) {
            if (!grupo.codigo_grupo.toLowerCase().includes(valoresFiltros.grupo)) return false;
        }
        
        if (filtrosActivos.generacion && valoresFiltros.generacion) {
            if (!grupo.generacion.toLowerCase().includes(valoresFiltros.generacion)) return false;
        }
        
        if (filtrosActivos.nivel && valoresFiltros.nivel) {
            if (grupo.nivel_educativo.toLowerCase() !== valoresFiltros.nivel) return false;
        }
        
        if (filtrosActivos.programa && valoresFiltros.programa) {
            if (grupo.programa_educativo.toLowerCase() !== valoresFiltros.programa) return false;
        }
        
        if (filtrosActivos.grado && valoresFiltros.grado) {
            if (grupo.grado.toLowerCase() !== valoresFiltros.grado) return false;
        }
        
        
        if (filtrosActivos.turno && valoresFiltros.turno) {
            const grupoTurno = (grupo.turno || 'M').toLowerCase();
            if (grupoTurno !== valoresFiltros.turno) return false;
        }
        
        return true;
    });
    
    paginaActual = 1;
    totalRegistros = gruposFiltrados.length;
    renderizarGruposPaginados();
}




function limpiarTodosFiltros() {
    Object.keys(filtrosActivos).forEach(filtro => {
        if (filtrosActivos[filtro]) toggleFiltro(filtro);
    });
    
    valoresFiltros = {
        grupo: '',
        generacion: '',
        nivel: '',
        programa: '',
        grado: '',
        turno: ''
    };
    
    paginaActual = 1;
    mostrarGrupos(gruposData);
}




function actualizarVisibilidadFiltros() {
    const container = document.getElementById('filtros-activos');
    const btnLimpiar = document.querySelector('.btn-limpiar-filtros');
    const hayFiltrosActivos = Object.values(filtrosActivos).some(v => v === true);
    
    if (hayFiltrosActivos) {
        container.style.display = 'block';
        btnLimpiar.style.display = 'flex';
    } else {
        container.style.display = 'none';
        btnLimpiar.style.display = 'none';
    }
}