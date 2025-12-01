


let programasEducativos = {
    'TSU': [],
    'I': [],
    'L': []
};

let modoEdicion = false;
let idGrupoEditando = null;

let paginaActual = 1;
let registrosPorPagina = 15;
let totalRegistros = 0;
let gruposData = [];
let gruposFiltrados = [];
let mostrandoInactivos = false;




document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
});

async function inicializarApp() {
    
    await inicializarPeriodoManager();

    
    if (!hayPeriodoActivo()) {
        Swal.fire({
            icon: 'warning',
            title: 'Periodo no seleccionado',
            html: `
                <p>Debes seleccionar un periodo activo antes de cargar el módulo de Grupos.</p>
                <p>Ve al <strong>inicio</strong> y selecciona un período.</p>
            `,
            confirmButtonText: 'Ir al inicio',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#6b7480',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '../../index.html';
            } else {
                window.location.href = '../../index.html';
            }
        });
        return;
    }

    const programas = await cargarProgramasDesdeDB();
    if (programas) {
        programasEducativos = programas;
    }
    configurarEventListeners();
    cargarGrupos();
}




function configurarEventListeners() {
    const form = document.getElementById('gruposForm');
    const generacion = document.getElementById('generacion');
    const nivel = document.getElementById('nivel');
    const programa = document.getElementById('programa');
    const grado = document.getElementById('grado');
    const turnoRadios = document.querySelectorAll('input[name="turno"]');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validarFormulario()) {
            if (modoEdicion) {
                actualizarGrupo();
            } else {
                guardarGrupo();
            }
        }
    });

    generacion.addEventListener('input', function() {
        validarGeneracion(this);
        generarCodigoGrupo();
    });

    nivel.addEventListener('change', function() {
        cargarProgramasEducativos(this.value);
        limpiarError('nivel');
        generarCodigoGrupo();
    });

    programa.addEventListener('change', function() {
        limpiarError('programa');
        generarCodigoGrupo();
    });

    grado.addEventListener('input', function() {
        validarGrado(this);
        generarCodigoGrupo();
    });

    turnoRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            generarCodigoGrupo();
        });
    });
}




function cargarProgramasEducativos(nivelSeleccionado) {
    const selectPrograma = document.getElementById('programa');
    selectPrograma.innerHTML = '<option value="" disabled selected>Selecciona...</option>';
    
    if (nivelSeleccionado && programasEducativos[nivelSeleccionado]) {
        const programas = programasEducativos[nivelSeleccionado];
        programas.forEach(programa => {
            const option = document.createElement('option');
            option.value = programa.codigo;
            option.textContent = `${programa.codigo} - ${programa.nombre}`;
            selectPrograma.appendChild(option);
        });
        selectPrograma.disabled = false;
    } else {
        selectPrograma.disabled = true;
        selectPrograma.innerHTML = '<option value="">Selecciona un nivel primero...</option>';
    }
}




function validarGeneracion(input) {
    const valor = input.value.trim();
    input.value = valor.replace(/[^0-9]/g, '');
    
    if (input.value.length > 0 && input.value.length < 2) {
        mostrarError('generacion', 'Debe tener 2 dígitos');
        return false;
    } else if (input.value.length === 2) {
        limpiarError('generacion');
        return true;
    }
    return false;
}

function validarGrado(input) {
    const valor = input.value.trim();
    input.value = valor.replace(/[^0-9]/g, '');
    
    if (input.value.length > 0) {
        const grado = parseInt(input.value);
        if (grado < 1 || grado > 9) {
            mostrarError('grado', 'El grado debe estar entre 1 y 9');
            return false;
        } else {
            limpiarError('grado');
            return true;
        }
    }
    return false;
}

function validarFormulario() {
    let valido = true;
    
    const generacion = document.getElementById('generacion').value.trim();
    if (generacion.length !== 2) {
        mostrarError('generacion', 'La generación debe tener 2 dígitos');
        valido = false;
    } else {
        limpiarError('generacion');
    }
    
    const nivel = document.getElementById('nivel').value;
    if (!nivel) {
        mostrarError('nivel', 'Selecciona un nivel educativo');
        valido = false;
    } else {
        limpiarError('nivel');
    }
    
    const programa = document.getElementById('programa').value;
    if (!programa) {
        mostrarError('programa', 'Selecciona un programa educativo');
        valido = false;
    } else {
        limpiarError('programa');
    }
    
    const grado = document.getElementById('grado').value.trim();
    if (!grado || grado < 1 || grado > 9) {
        mostrarError('grado', 'El grado debe estar entre 1 y 9');
        valido = false;
    } else {
        limpiarError('grado');
    }
    
    const turno = document.querySelector('input[name="turno"]:checked');
    if (!turno) {
        mostrarError('turno', 'Selecciona un turno');
        valido = false;
    } else {
        limpiarError('turno');
    }
    
    return valido;
}

function mostrarError(campo, mensaje) {
    const input = document.getElementById(campo);
    const errorSpan = document.getElementById(`error-${campo}`);
    if (input) input.classList.add('error');
    if (errorSpan) errorSpan.textContent = mensaje;
}

function limpiarError(campo) {
    const input = document.getElementById(campo);
    const errorSpan = document.getElementById(`error-${campo}`);
    if (input) input.classList.remove('error');
    if (errorSpan) errorSpan.textContent = '';
}




function generarCodigoGrupo() {
    const generacion = document.getElementById('generacion').value.trim();
    const nivelCodigo = document.getElementById('nivel').value;
    const programaCodigo = document.getElementById('programa').value;
    const grado = document.getElementById('grado').value.trim();
    const turno = document.querySelector('input[name="turno"]:checked')?.value || 'M';
    const grupoGenerado = document.getElementById('grupoGenerado');
    
    if (generacion.length === 2 && nivelCodigo && programaCodigo && grado) {
        const codigoBase = `${generacion}${programaCodigo}${grado}`;
        
        if (modoEdicion) {
            const codigoActual = grupoGenerado.value;
            const longitudBase = codigoBase.length; 
            const parteRestante = codigoActual.substring(longitudBase); 
            
            let letraIdentificacion = '';
            if (parteRestante.length === 2) {
                letraIdentificacion = parteRestante[0]; 
            }
            
            const codigoCompleto = `${codigoBase}${letraIdentificacion}${turno}`;
            grupoGenerado.value = codigoCompleto;
            grupoGenerado.style.color = 'var(--verde-dark)';
            return;
        }
        
        verificarLetraGrupo(generacion, programaCodigo, grado, turno, codigoBase);
    } else {
        grupoGenerado.value = '';
    }
}




function mostrarGrupos(grupos) {
    gruposData = grupos;
    gruposFiltrados = grupos;
    totalRegistros = grupos.length;
    cargarOpcionesFiltros();
    renderizarGruposPaginados();
}




function renderizarGruposPaginados() {
    const tbody = document.getElementById('gruposTableBody');
    
    if (gruposFiltrados.length === 0) {
        const mensaje = mostrandoInactivos ? 'No hay grupos inactivos' : 'No hay grupos registrados';
        tbody.innerHTML = `<tr><td colspan="7" class="empty-message">${mensaje}</td></tr>`;
        document.getElementById('paginacion').style.display = 'none';
        return;
    }
    
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const gruposPagina = gruposFiltrados.slice(inicio, fin);
    
    tbody.innerHTML = '';
    
    gruposPagina.forEach(grupo => {
        const tr = document.createElement('tr');
        const nivelTexto = obtenerTextoNivel(grupo.nivel_educativo);
        const programaTexto = obtenerTextoPrograma(grupo.programa_educativo);
        const turnoBadge = obtenerBadgeTurno(grupo.turno);
        
        
        const botonesAccion = grupo.estado === 'activo' || !grupo.estado
            ? `<button class="btn-action btn-edit" onclick="editarGrupo(${grupo.id})" title="Editar">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-action btn-baja" onclick="bajaGrupo(${grupo.id})" title="Dar de baja">
                    <i class="fa-solid fa-ban"></i>
                </button>`
            : `<button class="btn-action btn-success" onclick="altaGrupo(${grupo.id})" title="Dar de alta">
                    <i class="fa-solid fa-check-circle"></i>
                </button>
                <button class="btn-action btn-delete" onclick="eliminarGrupo(${grupo.id})" title="Eliminar definitivamente">
                    <i class="fa-solid fa-trash"></i>
                </button>`;
        
        tr.innerHTML = `
            <td><strong>${grupo.codigo_grupo}</strong></td>
            <td>${grupo.generacion}</td>
            <td>${nivelTexto}</td>
            <td>${programaTexto}</td>
            <td>${grupo.grado}</td>
            <td>${turnoBadge}</td>
            <td class="action-buttons">${botonesAccion}</td>
        `;
        tbody.appendChild(tr);
    });
    
    actualizarPaginacion();
}




function verInactivos() {
    mostrandoInactivos = !mostrandoInactivos;
    actualizarBotonInactivos();
    resetearPaginacion();
    cargarGrupos();
}

function actualizarBotonInactivos() {
    const btn = document.getElementById('btnVerInactivos');

    if (mostrandoInactivos) {
        btn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Ver Activos';
        btn.classList.add('active');
    } else {
        btn.innerHTML = '<i class="fa-solid fa-ban"></i> Ver Inactivos';
        btn.classList.remove('active');
    }
}




function obtenerBadgeTurno(turno) {
    if (turno === 'M') {
        return '<span class="turno-badge matutino"></i> Matutino</span>';
    } else if (turno === 'N') {
        return '<span class="turno-badge nocturno"></i> Nocturno</span>';
    }
    return turno || 'M';
}




function actualizarPaginacion() {
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    const paginacionDiv = document.getElementById('paginacion');
    
    if (totalPaginas <= 1) {
        paginacionDiv.style.display = 'none';
        return;
    }
    
    paginacionDiv.style.display = 'flex';
    let html = '';
    
    html += `<button class="btn-pag" onclick="cambiarPagina(${paginaActual - 1})" ${paginaActual === 1 ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-left"></i>
            </button>`;
    
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaActual - 1 && i <= paginaActual + 1)) {
            html += `<button class="btn-pag ${i === paginaActual ? 'active' : ''}" onclick="cambiarPagina(${i})">${i}</button>`;
        } else if (i === paginaActual - 2 || i === paginaActual + 2) {
            html += `<span class="pag-dots">...</span>`;
        }
    }
    
    html += `<button class="btn-pag" onclick="cambiarPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-right"></i>
            </button>`;
    
    const inicio = (paginaActual - 1) * registrosPorPagina + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, totalRegistros);
    html += `<span class="pag-info">Mostrando ${inicio}-${fin} de ${totalRegistros}</span>`;
    
    paginacionDiv.innerHTML = html;
}

function cambiarPagina(nuevaPagina) {
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
    
    paginaActual = nuevaPagina;
    renderizarGruposPaginados();
    document.querySelector('.grupos-table-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetearPaginacion() {
    paginaActual = 1;
}

function obtenerTextoNivel(codigo) {
    const niveles = {
        'TSU': 'Técnico Superior',
        'L': 'Licenciatura',
        'I': 'Ingeniería'
    };
    return niveles[codigo] || codigo;
}

function obtenerTextoPrograma(codigo) {
    for (let nivel in programasEducativos) {
        const programa = programasEducativos[nivel].find(p => p.codigo === codigo);
        if (programa) {
            return `${programa.codigo} - ${programa.nombre}`;
        }
    }
    return codigo;
}




function llenarFormularioEdicion(grupo) {
    modoEdicion = true;
    idGrupoEditando = grupo.id;
    
    ['generacion', 'nivel', 'programa', 'grado', 'turno'].forEach(campo => limpiarError(campo));
    
    document.getElementById('generacion').value = grupo.generacion;
    document.getElementById('nivel').value = grupo.nivel_educativo;
    cargarProgramasEducativos(grupo.nivel_educativo);
    
    const turnoRadio = document.getElementById(`turno${grupo.turno || 'M'}`);
    if (turnoRadio) {
        turnoRadio.checked = true;
    }
    
    setTimeout(() => {
        document.getElementById('programa').value = grupo.programa_educativo;
        document.getElementById('grado').value = grupo.grado;
        document.getElementById('grupoGenerado').value = grupo.codigo_grupo;
        document.getElementById('grupoGenerado').style.color = 'var(--verde-dark)';
        
        document.getElementById('btnGuardar').innerHTML = '<i class="fa-solid fa-save"></i> Actualizar';
        document.getElementById('btnCancelar').innerHTML = '<i class="fa-solid fa-times"></i> Cancelar';
        
        document.querySelector('.asignar-grupos-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function confirmarEliminar(id, codigoGrupo) {
    if (confirm(`¿Estás seguro de eliminar el grupo ${codigoGrupo}?`)) {
        eliminarGrupo(id);
    }
}

function limpiarFormulario() {
    document.getElementById('gruposForm').reset();
    document.getElementById('grupoGenerado').value = '';
    document.getElementById('programa').disabled = true;
    document.getElementById('programa').innerHTML = '<option value="">Selecciona un nivel primero...</option>';
    
    document.getElementById('turnoM').checked = true;
    
    ['generacion', 'nivel', 'programa', 'grado', 'turno'].forEach(campo => limpiarError(campo));
}

function cancelarEdicion() {
    limpiarFormulario();
    modoEdicion = false;
    idGrupoEditando = null;
    document.getElementById('btnGuardar').innerHTML = '<i class="fa-solid fa-save"></i> Guardar';
    document.getElementById('btnCancelar').innerHTML = '<i class="fa-solid fa-broom"></i> Limpiar';
}