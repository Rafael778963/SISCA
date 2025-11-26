/**
 * SISCA - Sistema de Carga Académica
 * Módulo principal para gestión de cargas académicas
 * VERSIÓN MEJORADA con optimizaciones y nuevas funcionalidades
 */

// ============================================
// VARIABLES GLOBALES
// ============================================
let cargas = []; // Array global de todas las cargas
let cargasFiltradas = []; // Cargas después de aplicar filtros
let cargasOriginales = []; // Backup de cargas originales antes de cargar plantilla
let viendoPlantilla = false; // Bandera para saber si estamos viendo una plantilla
let nombrePlantillaActual = ''; // Nombre de la plantilla que se está viendo
let datosCache = {
    docentes: [],
    grupos: [],
    materias: []
};
let modoEdicion = false;
let idCargaEdicion = null;
let formularioModificado = false;
let ignorarFiltros = false;

// ============================================
// UTILIDAD: DEBOUNCE
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    inicializarModulo();
});

async function inicializarModulo() {
    try {
        mostrarCargando();
        
        await cargarDatosFiltros();
        await cargarCargas();
        
        configurarEventListeners();
        configurarBusqueda();
        configurarAtajosTeclado();
        monitorearCambiosFormulario();
        
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error de Inicializacion',
            text: 'No se pudo inicializar el modulo correctamente',
            footer: error.message
        });
    }
}

// ============================================
// CONFIGURACIÓN DE EVENT LISTENERS
// ============================================
function configurarEventListeners() {
    const form = document.getElementById('cargaForm');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
    const turnoSelect = document.getElementById('turno');
    const grupoSelect = document.getElementById('grupo');
    
    // Evento submit del formulario
    if (form) {
        form.addEventListener('submit', manejarSubmitFormulario);
    }
    
    // Botón limpiar
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFormulario);
    }
    
    // Botón cancelar edición
    if (btnCancelarEdicion) {
        btnCancelarEdicion.addEventListener('click', cancelarEdicion);
    }
    
    // Filtros dependientes
    if (turnoSelect) {
        turnoSelect.addEventListener('change', filtrarGruposPorTurno);
    }
    
    if (grupoSelect) {
        grupoSelect.addEventListener('change', filtrarMateriasPorGrupo);
    }
    
    // Listener para cambio de paginación
    document.addEventListener('paginaCambiada', function(e) {
        renderizarTabla();
    });
}

// ============================================
// NUEVO: CONFIGURAR BÚSQUEDA EN TABLA
// ============================================
function configurarBusqueda() {
    const inputBusqueda = document.getElementById('busquedaTabla');
    if (inputBusqueda) {
        const buscarConDebounce = debounce(function() {
            buscarEnTabla(inputBusqueda.value);
        }, 300);
        
        inputBusqueda.addEventListener('input', buscarConDebounce);
    }
}

function buscarEnTabla(termino) {
    const terminoLower = termino.toLowerCase().trim();
    
    if (!terminoLower) {
        cargasFiltradas = [...cargas];
    } else {
        cargasFiltradas = cargas.filter(carga => {
            return (
                carga.docente.toLowerCase().includes(terminoLower) ||
                carga.materia.toLowerCase().includes(terminoLower) ||
                carga.grupo.toLowerCase().includes(terminoLower) ||
                carga.clave_materia.toLowerCase().includes(terminoLower)
            );
        });
    }
    
    // Reiniciar paginación y renderizar
    if (window.PaginacionCarga) {
        PaginacionCarga.inicializar(cargasFiltradas.length, 10);
    }
    renderizarTabla();
}

// ============================================
// NUEVO: ATAJOS DE TECLADO
// ============================================
function configurarAtajosTeclado() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S = Guardar
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const form = document.getElementById('cargaForm');
            if (form) {
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
        }
        
        // Ctrl/Cmd + K = Limpiar formulario
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            limpiarFormulario();
        }
        
        // Escape = Cancelar edición
        if (e.key === 'Escape' && modoEdicion) {
            e.preventDefault();
            cancelarEdicion();
        }
    });
}

// ============================================
// NUEVO: MONITOREAR CAMBIOS EN FORMULARIO
// ============================================
function monitorearCambiosFormulario() {
    const form = document.getElementById('cargaForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            formularioModificado = true;
        });
    });
    
    // Advertir antes de salir
    window.addEventListener('beforeunload', (e) => {
        if (formularioModificado && !modoEdicion) {
            e.preventDefault();
            e.returnValue = '¿Estás seguro de salir? Hay cambios sin guardar.';
            return e.returnValue;
        }
    });
}

// ============================================
// CARGAR DATOS INICIALES (MEJORADO CON CACHÉ)
// ============================================
async function cargarDatosFiltros() {
    try {
        // NUEVO: Intentar cargar desde caché primero
        const cacheDatos = cargarDatosCacheLocal();
        
        if (cacheDatos) {
            datosCache.docentes = cacheDatos.docentes;
            datosCache.grupos = cacheDatos.grupos;
            datosCache.materias = cacheDatos.materias;
            
            llenarSelectDocentes(datosCache.docentes);
            llenarSelectGrupos(datosCache.grupos);
            llenarSelectMaterias(datosCache.materias);
            
            
            return;
        }
        
        // Si no hay caché, cargar desde servidor
        const response = await fetch('../../php/carga/obtener_datos_filtros.php');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error al cargar datos');
        }
        
        // Guardar en caché
        datosCache.docentes = data.docentes || [];
        datosCache.grupos = data.grupos || [];
        datosCache.materias = data.materias || [];
        
        // Llenar selectores
        llenarSelectDocentes(datosCache.docentes);
        llenarSelectGrupos(datosCache.grupos);
        llenarSelectMaterias(datosCache.materias);
        
        // NUEVO: Guardar en caché local
        guardarDatosCacheLocal();
        
        
        
    } catch (error) {
        
        throw error;
    }
}

// ============================================
// FUNCIONES DE CACHÉ LOCAL
// ============================================
function guardarDatosCacheLocal() {
    try {
        const cacheData = {
            docentes: datosCache.docentes,
            grupos: datosCache.grupos,
            materias: datosCache.materias,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('sisca_carga_cache', JSON.stringify(cacheData));
    } catch (e) {
        // Error silencioso
    }
}

function cargarDatosCacheLocal() {
    try {
        const cache = localStorage.getItem('sisca_carga_cache');
        if (!cache) return null;
        
        const datos = JSON.parse(cache);
        const ahora = new Date().getTime();
        const CACHE_EXPIRATION = 1000 * 60 * 30; // 30 minutos
        
        if (ahora - datos.timestamp < CACHE_EXPIRATION) {
            return datos;
        }
        
        localStorage.removeItem('sisca_carga_cache');
        return null;
    } catch (e) {
        return null;
    }
}

// ============================================
// LLENAR SELECTORES
// ============================================
function llenarSelectDocentes(docentes) {
    const select = document.getElementById('docente');
    if (!select) return;
    
    // Limpiar opciones existentes (excepto la primera)
    select.innerHTML = '<option value="" disabled selected>Selecciona un docente...</option>';
    
    // Agrupar docentes por turno
    const docentesPorTurno = {
        'Matutino': [],
        'Nocturno': [],
        'Mixto': []
    };
    
    docentes.forEach(docente => {
        const turno = docente.turno || 'Mixto';
        if (docentesPorTurno[turno]) {
            docentesPorTurno[turno].push(docente);
        } else {
            docentesPorTurno['Mixto'].push(docente);
        }
    });
    
    // Agregar docentes agrupados por turno
    Object.keys(docentesPorTurno).forEach(turno => {
        if (docentesPorTurno[turno].length > 0) {
            // Crear optgroup
            const optgroup = document.createElement('optgroup');
            optgroup.label = `━━━ ${turno} ━━━`;
            
            // Ordenar docentes alfabéticamente
            docentesPorTurno[turno].sort((a, b) => 
                a.nombre.localeCompare(b.nombre)
            );
            
            // Agregar opciones
            docentesPorTurno[turno].forEach(docente => {
                const option = document.createElement('option');
                option.value = docente.id;
                option.textContent = `${docente.nombre} (${docente.regimen})`;
                option.dataset.turno = docente.turno;
                option.dataset.regimen = docente.regimen;
                optgroup.appendChild(option);
            });
            
            select.appendChild(optgroup);
        }
    });
}

function llenarSelectGrupos(grupos) {
    const select = document.getElementById('grupo');
    if (!select) return;
    
    select.innerHTML = '<option value="" disabled selected>Selecciona un grupo...</option>';
    
    grupos.forEach(grupo => {
        const option = document.createElement('option');
        option.value = grupo.id;
        option.textContent = grupo.label;
        option.dataset.turno = grupo.turno;
        option.dataset.programa = grupo.programa;
        option.dataset.grado = grupo.grado;
        select.appendChild(option);
    });
}

function llenarSelectMaterias(materias) {
    const select = document.getElementById('asignatura');
    if (!select) return;
    
    select.innerHTML = '<option value="" disabled selected>Selecciona una asignatura...</option>';
    
    materias.forEach(materia => {
        const option = document.createElement('option');
        option.value = materia.id;
        option.textContent = materia.label;
        option.dataset.horas = materia.horas;
        option.dataset.programa = materia.programa;
        option.dataset.grado = materia.grado;
        select.appendChild(option);
    });
}

// ============================================
// FILTROS DEPENDIENTES
// ============================================
function filtrarGruposPorTurno() {
    // Si estamos en modo edicion, ignorar filtros
    if (ignorarFiltros) return;
    
    const turnoSelect = document.getElementById('turno');
    const grupoSelect = document.getElementById('grupo');
    
    if (!turnoSelect || !grupoSelect) return;
    
    const turnoSeleccionado = turnoSelect.value;
    
    grupoSelect.innerHTML = '<option value="" disabled selected>Selecciona un grupo...</option>';
    
    if (!turnoSeleccionado) {
        llenarSelectGrupos(datosCache.grupos);
        return;
    }
    
    const gruposFiltrados = datosCache.grupos.filter(grupo => {
        return grupo.turno === turnoSeleccionado || turnoSeleccionado === 'Mixto';
    });
    
    llenarSelectGrupos(gruposFiltrados);
    
    document.getElementById('asignatura').value = '';
}

function filtrarMateriasPorGrupo() {
    // Si estamos en modo edicion, ignorar filtros
    if (ignorarFiltros) return;
    
    const grupoSelect = document.getElementById('grupo');
    const materiaSelect = document.getElementById('asignatura');
    
    if (!grupoSelect || !materiaSelect) return;
    
    const grupoSeleccionado = grupoSelect.selectedOptions[0];
    
    if (!grupoSeleccionado) {
        llenarSelectMaterias(datosCache.materias);
        return;
    }
    
    const programaGrupo = grupoSeleccionado.dataset.programa;
    const gradoGrupo = grupoSeleccionado.dataset.grado;
    
    const materiasFiltradas = datosCache.materias.filter(materia => {
        return materia.programa === programaGrupo && 
               parseInt(materia.grado) === parseInt(gradoGrupo);
    });
    
    llenarSelectMaterias(materiasFiltradas);
    
    if (materiasFiltradas.length === 1) {
        materiaSelect.value = materiasFiltradas[0].id;
        document.getElementById('horas').value = materiasFiltradas[0].horas;
    }
}

// ============================================
// CARGAR CARGAS ACADÉMICAS
// ============================================
async function cargarCargas() {
    try {
        mostrarCargando();
        
        const response = await fetch('../../php/carga/obtener_cargas.php');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error al cargar cargas');
        }
        
        cargas = data.data || [];
        cargasFiltradas = [...cargas];

        // Inicializar filtros con los datos cargados
        inicializarFiltros();

        // Inicializar paginación
        if (window.PaginacionCarga) {
            PaginacionCarga.inicializar(cargasFiltradas.length, 10);
        }

        renderizarTabla();
        
        
        
    } catch (error) {
        
        mostrarError('Error al cargar datos: ' + error.message);
    } finally {
        ocultarCargando();
    }
}

// ============================================
// RENDERIZAR TABLA
// ============================================
function renderizarTabla() {
    const tbody = document.querySelector('#dataTable tbody');
    if (!tbody) return;
    
    // Mostrar/ocultar botón de regresar según si estamos viendo plantilla
    actualizarBotonRegresar();
    
    tbody.innerHTML = '';
    
    if (!cargasFiltradas || cargasFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fa-solid fa-inbox"></i>
                    <p>No hay cargas académicas registradas</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Obtener rango de registros para la página actual
    let registrosMostrar = cargasFiltradas;
    
    if (window.PaginacionCarga) {
        const rango = PaginacionCarga.obtenerRango();
        registrosMostrar = cargasFiltradas.slice(rango.inicio, rango.fin);
    }
    
    // Agrupar por docente
    const cargasPorDocente = agruparPorDocente(registrosMostrar);
    
    // Renderizar cada docente con sus cargas
    Object.keys(cargasPorDocente).forEach(docenteId => {
        const datos = cargasPorDocente[docenteId];
        renderizarDocenteConCargas(tbody, datos, docenteId);
    });
    
    // Agregar fila de TOTALES GENERALES al final
    agregarTotalesGenerales(tbody);
}

function agruparPorDocente(cargas) {
    const agrupado = {};
    
    cargas.forEach(carga => {
        const docenteId = carga.docente_id;
        
        if (!agrupado[docenteId]) {
            agrupado[docenteId] = {
                docente: carga.docente,
                turno: carga.turno_docente,
                regimen: carga.regimen,
                cargas: [],
                totales: {
                    horas: 0,
                    tutoria: 0,
                    estadia: 0,
                    total: 0
                }
            };
        }
        
        agrupado[docenteId].cargas.push(carga);
        agrupado[docenteId].totales.horas += parseInt(carga.horas) || 0;
        agrupado[docenteId].totales.tutoria += parseInt(carga.horas_tutoria) || 0;
        agrupado[docenteId].totales.estadia += parseInt(carga.horas_estadia) || 0;
        agrupado[docenteId].totales.total += parseInt(carga.total) || 0;
    });
    
    return agrupado;
}

function renderizarDocenteConCargas(tbody, datos, docenteId) {
    // Fila de encabezado del docente
    const trDocente = document.createElement('tr');
    trDocente.className = 'docente-row';
    trDocente.innerHTML = `
        <td colspan="8">
            <strong>${datos.docente}</strong>
            <span class="docente-info">${datos.turno} - ${datos.regimen}</span>
        </td>
    `;
    tbody.appendChild(trDocente);
    
    // Filas de materias/cargas
    datos.cargas.forEach(carga => {
        const trMateria = document.createElement('tr');
        trMateria.className = 'materia-row';
        trMateria.innerHTML = `
            <td style="padding-left: 2rem;">
                <div class="materia-info">
                    <strong>${carga.materia}</strong>
                    <span class="materia-clave">${carga.clave_materia}</span>
                </div>
            </td>
            <td>${carga.horas || 0}</td>
            <td>${carga.grupo}</td>
            <td>${carga.horas_tutoria || 0}</td>
            <td>${carga.horas_estadia || 0}</td>
            <td>${carga.administrativas || '-'}</td>
            <td><strong>${carga.total || 0}</strong></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editarCarga(${carga.id})" title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-delete" onclick="eliminarCarga(${carga.id})" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(trMateria);
    });
    
    // Fila de totales del docente
    const trTotal = document.createElement('tr');
    trTotal.className = 'total-row';
    trTotal.innerHTML = `
        <td><strong>TOTAL:</strong></td>
        <td><strong>${datos.totales.horas}</strong></td>
        <td></td>
        <td><strong>${datos.totales.tutoria}</strong></td>
        <td><strong>${datos.totales.estadia}</strong></td>
        <td></td>
        <td><strong>${datos.totales.total}</strong></td>
        <td></td>
    `;
    tbody.appendChild(trTotal);
    
    // NUEVO: Agregar indicador de carga del docente
    agregarIndicadorCarga(tbody, docenteId, datos);
}

// ============================================
// NUEVO: INDICADOR DE CARGA DOCENTE
// ============================================
function agregarIndicadorCarga(tbody, docenteId, datosDocente) {
    const carga = calcularCargaDocente(docenteId, datosDocente);

    const indicador = document.createElement('tr');
    indicador.className = 'indicador-carga';
    indicador.innerHTML = `
        <td colspan="8" style="padding: 0.5rem 1rem; background: rgba(255,255,255,0.5);">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span style="font-size: 0.85rem; color: #6b7480; min-width: 150px;">
                    <i class="fa-solid fa-gauge-high"></i> Carga: ${carga.totalHoras} / ${carga.horasMaximas} hrs
                </span>
                <div style="flex: 1; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; max-width: 300px;">
                    <div style="
                        width: ${Math.min(carga.porcentaje, 100)}%;
                        height: 100%;
                        background: ${carga.estado === 'excedido' ? '#e74c3c' :
                                     carga.estado === 'casi-lleno' ? '#f39c12' : '#78B543'};
                        transition: width 0.3s ease;
                    "></div>
                </div>
                <span style="font-size: 0.85rem; font-weight: 600; min-width: 60px; color: ${
                    carga.estado === 'excedido' ? '#e74c3c' :
                    carga.estado === 'casi-lleno' ? '#f39c12' : '#78B543'
                };">
                    ${Math.round(carga.porcentaje)}%
                </span>
                ${carga.estado === 'excedido' ? '<i class="fa-solid fa-triangle-exclamation" style="color: #e74c3c;" title="Carga excedida"></i>' : ''}
            </div>
        </td>
    `;

    tbody.appendChild(indicador);
}

function calcularCargaDocente(docenteId, datosDocente) {
    const totalHoras = datosDocente.totales.total;
    
    // Determinar horas máximas según régimen
    const horasMaximas = datosDocente.regimen === 'TC' ? 40 : 
                        datosDocente.regimen === 'MT' ? 20 : 30;
    
    const porcentaje = (totalHoras / horasMaximas) * 100;
    
    return {
        totalHoras,
        horasMaximas,
        porcentaje,
        estado: porcentaje > 100 ? 'excedido' : porcentaje > 90 ? 'casi-lleno' : 'normal'
    };
}

// ============================================
// TOTALES GENERALES
// ============================================
function agregarTotalesGenerales(tbody) {
    // Calcular totales de TODAS las cargas filtradas (no solo la página actual)
    const totalesGenerales = calcularTotalesGenerales(cargasFiltradas);
    
    // Agregar fila separadora
    const trSeparador = document.createElement('tr');
    trSeparador.innerHTML = '<td colspan="8" style="height: 10px; background: transparent;"></td>';
    tbody.appendChild(trSeparador);

    // Fila de totales generales
    const trTotalGeneral = document.createElement('tr');
    trTotalGeneral.className = 'total-general-row';
    trTotalGeneral.style.background = 'linear-gradient(135deg, #78B543, #3B7D2F)';
    trTotalGeneral.style.color = 'white';
    trTotalGeneral.style.fontWeight = 'bold';
    trTotalGeneral.style.fontSize = '1.1rem';
    trTotalGeneral.innerHTML = `
        <td><strong>TOTAL GENERAL:</strong></td>
        <td><strong>${totalesGenerales.horas}</strong></td>
        <td></td>
        <td><strong>${totalesGenerales.tutoria}</strong></td>
        <td><strong>${totalesGenerales.estadia}</strong></td>
        <td></td>
        <td><strong>${totalesGenerales.total}</strong></td>
        <td></td>
    `;
    tbody.appendChild(trTotalGeneral);
}

function calcularTotalesGenerales(cargas) {
    const totales = {
        horas: 0,
        tutoria: 0,
        estadia: 0,
        total: 0
    };

    cargas.forEach(carga => {
        totales.horas += parseInt(carga.horas) || 0;
        totales.tutoria += parseInt(carga.horas_tutoria) || 0;
        totales.estadia += parseInt(carga.horas_estadia) || 0;
        totales.total += parseInt(carga.total) || 0;
    });

    return totales;
}

// ============================================
// MANEJO DEL FORMULARIO (MEJORADO)
// ============================================
async function manejarSubmitFormulario(e) {
    e.preventDefault();
    
    // Limpiar errores previos
    limpiarErrores();
    
    // Validar formulario (versión mejorada)
    if (!validarFormularioMejorado()) {
        return;
    }
    
    // Obtener datos del formulario
    const formData = new FormData(e.target);
    
    try {
        // Deshabilitar botón mientras se procesa
        const btnSubmit = document.getElementById('btnAgregar');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
        
        let url, mensaje;
        
        if (modoEdicion) {
            url = '../../php/carga/actualizar_carga.php';
            formData.append('id', idCargaEdicion);
            mensaje = 'actualizada';
        } else {
            url = '../../php/carga/guardar_carga.php';
            mensaje = 'guardada';
        }
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error al guardar');
        }
        
        // NUEVO: Marcar formulario como guardado
        formularioModificado = false;

        // Actualizar array de cargas en tiempo real SIN recargar página
        if (modoEdicion) {
            // Actualizar registro existente
            const index = cargas.findIndex(c => c.id === idCargaEdicion);
            if (index !== -1) {
                cargas[index] = data.data;
            }
        } else {
            // Agregar nuevo registro
            cargas.unshift(data.data); // Agregar al inicio
        }

        // Actualizar cargas filtradas
        cargasFiltradas = [...cargas];

        // Reinicializar paginación
        if (window.PaginacionCarga) {
            PaginacionCarga.inicializar(cargasFiltradas.length, 10);
        }

        // Renderizar tabla sin recargar página
        renderizarTabla();

        // Limpiar formulario
        limpiarFormulario();

        // Mostrar mensaje de éxito
        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: `Carga académica ${mensaje} correctamente`,
            timer: 1500,
            showConfirmButton: false
        });
        
    } catch (error) {
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo guardar la carga académica'
        });
    } finally {
        // Rehabilitar botón
        const btnSubmit = document.getElementById('btnAgregar');
        btnSubmit.disabled = false;
        if (modoEdicion) {
            btnSubmit.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Actualizar';
        } else {
            btnSubmit.innerHTML = '<i class="fa-solid fa-plus"></i> Agregar Asignatura';
        }
    }
}

// ============================================
// NUEVO: VALIDACIÓN MEJORADA
// ============================================
const validaciones = {
    administrativas: (valor) => {
        if (!valor) return true;
        return /^[A-Za-z\s]+$/.test(valor);
    },
    
    numeroPositivo: (valor) => {
        return /^\d+$/.test(valor) && parseInt(valor) >= 0;
    },
    
    rangoHoras: (valor) => {
        const num = parseInt(valor);
        return num >= 0 && num <= 100;
    }
};

function validarFormularioMejorado() {
    let valido = true;
    limpiarErrores();
    
    // Validar campos requeridos
    const camposRequeridos = [
        { id: 'turno', nombre: 'Turno' },
        { id: 'grupo', nombre: 'Grupo' },
        { id: 'asignatura', nombre: 'Asignatura' },
        { id: 'docente', nombre: 'Docente' },
        { id: 'horas', nombre: 'Horas' }
    ];
    
    camposRequeridos.forEach(campo => {
        const input = document.getElementById(campo.id);
        const errorSpan = document.getElementById(`error-${campo.id}`);
        
        if (!input.value || input.value.trim() === '') {
            mostrarErrorCampo(input, errorSpan, `${campo.nombre} es requerido`);
            valido = false;
        }
    });
    
    // Validar números específicos
    const camposNumero = ['horas', 'tutoria', 'estadia'];
    camposNumero.forEach(campoId => {
        const input = document.getElementById(campoId);
        if (input.value) {
            if (!validaciones.numeroPositivo(input.value)) {
                mostrarErrorCampo(
                    input, 
                    document.getElementById(`error-${campoId}`), 
                    'Debe ser un número entero positivo'
                );
                valido = false;
            } else if (!validaciones.rangoHoras(input.value)) {
                mostrarErrorCampo(
                    input, 
                    document.getElementById(`error-${campoId}`), 
                    'Las horas deben estar entre 0 y 100'
                );
                valido = false;
            }
        }
    });
    
    // Validar administrativas
    const admInput = document.getElementById('administrativas');
    if (admInput.value && !validaciones.administrativas(admInput.value)) {
        mostrarErrorCampo(
            admInput, 
            document.getElementById('error-administrativas'), 
            'Solo se permiten letras y espacios'
        );
        valido = false;
    }
    
    return valido;
}

function mostrarErrorCampo(input, errorSpan, mensaje) {
    input.classList.add('error');
    if (errorSpan) {
        errorSpan.textContent = mensaje;
    }
}

function limpiarErrores() {
    document.querySelectorAll('.form-input, .form-select').forEach(input => {
        input.classList.remove('error');
    });
    
    document.querySelectorAll('.error-message').forEach(span => {
        span.textContent = '';
    });
}

// ============================================
// NUEVO: FEEDBACK VISUAL
// ============================================
function mostrarFeedbackGuardado(elemento) {
    if (!elemento) return;
    
    elemento.classList.add('guardado-exitoso');
    
    setTimeout(() => {
        elemento.classList.remove('guardado-exitoso');
    }, 2000);
}

// ============================================
// EDITAR CARGA
// ============================================
async function editarCarga(id) {
    try {
        const carga = cargas.find(c => c.id === id);

        if (!carga) {
            throw new Error('Carga no encontrada');
        }

        // ACTIVAR flag para ignorar filtros automaticos
        ignorarFiltros = true;

        // Cargar TODOS los grupos sin filtrar
        const grupoSelect = document.getElementById('grupo');
        grupoSelect.innerHTML = '<option value="" disabled>Selecciona un grupo...</option>';
        datosCache.grupos.forEach(grupo => {
            const option = document.createElement('option');
            option.value = String(grupo.id);
            option.textContent = grupo.label;
            option.dataset.turno = grupo.turno;
            option.dataset.programa = grupo.programa;
            option.dataset.grado = grupo.grado;
            grupoSelect.appendChild(option);
        });

        // Cargar TODAS las materias sin filtrar
        const materiaSelect = document.getElementById('asignatura');
        materiaSelect.innerHTML = '<option value="" disabled>Selecciona una asignatura...</option>';
        datosCache.materias.forEach(materia => {
            const option = document.createElement('option');
            option.value = String(materia.id);
            option.textContent = materia.label;
            option.dataset.horas = materia.horas;
            option.dataset.programa = materia.programa;
            option.dataset.grado = materia.grado;
            materiaSelect.appendChild(option);
        });

        // Cargar TODOS los docentes sin filtrar
        const docenteSelect = document.getElementById('docente');
        docenteSelect.innerHTML = '<option value="" disabled>Selecciona un docente...</option>';
        datosCache.docentes.forEach(docente => {
            const option = document.createElement('option');
            option.value = String(docente.id);
            option.textContent = `${docente.nombre} (${docente.regimen})`;
            option.dataset.turno = docente.turno;
            option.dataset.regimen = docente.regimen;
            docenteSelect.appendChild(option);
        });

        // Esperar un tick para que el DOM se actualice
        await new Promise(resolve => setTimeout(resolve, 50));

        // Ahora seleccionar los valores de la BD con conversión explícita
        const turnoInput = document.getElementById('turno');
        const horasInput = document.getElementById('horas');
        const tutoriaInput = document.getElementById('tutoria');
        const estadiaInput = document.getElementById('estadia');
        const administrativasInput = document.getElementById('administrativas');

        // Asignar valores con validación
        // Si turno está vacío, usar turno_docente como fallback
        turnoInput.value = carga.turno || carga.turno_docente || '';
        grupoSelect.value = String(carga.grupo_id);
        materiaSelect.value = String(carga.materia_id);
        docenteSelect.value = String(carga.docente_id);
        horasInput.value = carga.horas || '';
        tutoriaInput.value = carga.horas_tutoria || '';
        estadiaInput.value = carga.horas_estadia || '';
        administrativasInput.value = carga.administrativas || '';

        // Cambiar a modo edicion
        modoEdicion = true;
        idCargaEdicion = id;

        const btnAgregar = document.getElementById('btnAgregar');
        btnAgregar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Actualizar';
        document.getElementById('btnCancelarEdicion').style.display = 'block';

        document.querySelector('.carga-form-panel').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        setTimeout(() => {
            turnoInput.focus();
        }, 300);

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la informacion para editar: ' + error.message
        });
    }
}

// ============================================
// ELIMINAR CARGA
// ============================================
async function eliminarCarga(id) {
    try {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#6b7480',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        
        if (!result.isConfirmed) return;
        
        const formData = new FormData();
        formData.append('id', id);
        
        const response = await fetch('../../php/carga/eliminar_carga.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error al eliminar');
        }
        
        // Eliminar del array de cargas en tiempo real SIN recargar página
        const index = cargas.findIndex(c => c.id === id);
        if (index !== -1) {
            cargas.splice(index, 1);
        }

        // Actualizar cargas filtradas
        cargasFiltradas = [...cargas];

        // Reinicializar paginación
        if (window.PaginacionCarga) {
            PaginacionCarga.inicializar(cargasFiltradas.length, 10);
        }

        // Renderizar tabla sin recargar página
        renderizarTabla();

        Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'Carga académica eliminada correctamente',
            timer: 1500,
            showConfirmButton: false
        });
        
    } catch (error) {
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo eliminar la carga académica'
        });
    }
}

// ============================================
// LIMPIAR Y CANCELAR
// ============================================
function limpiarFormulario() {
    document.getElementById('cargaForm').reset();
    limpiarErrores();
    cancelarEdicion();
    formularioModificado = false;
    ignorarFiltros = false; // REACTIVAR filtros
    
    llenarSelectGrupos(datosCache.grupos);
    llenarSelectMaterias(datosCache.materias);
    llenarSelectDocentes(datosCache.docentes);
}

function cancelarEdicion() {
    modoEdicion = false;
    idCargaEdicion = null;
    ignorarFiltros = false; // REACTIVAR filtros
    
    document.getElementById('btnAgregar').innerHTML = '<i class="fa-solid fa-plus"></i> Agregar Asignatura';
    document.getElementById('btnCancelarEdicion').style.display = 'none';
    
    llenarSelectGrupos(datosCache.grupos);
    llenarSelectMaterias(datosCache.materias);
    llenarSelectDocentes(datosCache.docentes);
}

// ============================================
// PLANTILLAS
// ============================================
async function guardarPlantillaComoImagen() {
    try {
        if (!cargas || cargas.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin Datos',
                text: 'No hay cargas para guardar como plantilla'
            });
            return;
        }
        
        const { value: formValues } = await Swal.fire({
            title: 'Guardar Plantilla',
            html: `
                <div style="text-align: left;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                        Nombre de la plantilla: <span style="color: #e74c3c;">*</span>
                    </label>
                    <input id="swal-nombre" class="swal2-input" style="width: 90%; margin: 0;" 
                           placeholder="Ej: Carga Septiembre 2024">
                    
                    <label style="display: block; margin-top: 1rem; margin-bottom: 0.5rem; font-weight: 500;">
                        Descripción (opcional):
                    </label>
                    <textarea id="swal-descripcion" class="swal2-textarea" style="width: 90%; margin: 0;" 
                              placeholder="Descripción de la plantilla"></textarea>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-floppy-disk"></i> Guardar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const nombre = document.getElementById('swal-nombre').value;
                if (!nombre) {
                    Swal.showValidationMessage('El nombre es requerido');
                    return false;
                }
                return {
                    nombre: nombre,
                    descripcion: document.getElementById('swal-descripcion').value
                };
            }
        });
        
        if (!formValues) return;
        
        // Preparar datos para guardar
        const datosPlantilla = {
            cargas: cargas,
            fecha_guardado: new Date().toISOString(),
            total_registros: cargas.length
        };
        
        const formData = new FormData();
        formData.append('nombre_plantilla', formValues.nombre);
        formData.append('descripcion', formValues.descripcion);
        formData.append('datos_json', JSON.stringify(datosPlantilla));
        
        const response = await fetch('../../php/carga/guardar_plantilla.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error al guardar plantilla');
        }
        
        Swal.fire({
            icon: 'success',
            title: '¡Guardado!',
            text: `Plantilla "${formValues.nombre}" guardada correctamente`,
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo guardar la plantilla'
        });
    }
}

async function verPlantillas() {
    try {
        // Cargar plantillas
        const response = await fetch('../../php/carga/obtener_plantillas.php');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error al cargar plantillas');
        }
        
        const plantillas = data.data || [];
        
        if (plantillas.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Sin Plantillas',
                text: 'No tienes plantillas guardadas'
            });
            return;
        }
        
        // Crear HTML para mostrar plantillas
        let html = '<div style="max-height: 400px; overflow-y: auto; padding: 0 0.5rem;">';
        
        plantillas.forEach(plantilla => {
            html += `
                <div style="border: 2px solid #ddd; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; text-align: left; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h4 style="margin: 0 0 0.5rem 0; color: #2f3a45; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid fa-file-lines" style="color: #78B543;"></i>
                        ${plantilla.nombre}
                    </h4>
                    <p style="margin: 0 0 0.5rem 0; color: #6b7480; font-size: 0.9rem;">
                        ${plantilla.descripcion || 'Sin descripción'}
                    </p>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #6b7480; margin-bottom: 0.75rem;">
                        <span><i class="fa-solid fa-calendar"></i> ${plantilla.periodo_texto}</span>
                        <span><i class="fa-solid fa-chart-simple"></i> ${plantilla.num_registros} registros</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="cargarPlantilla(${plantilla.id})" class="swal2-confirm swal2-styled" 
                                style="flex: 1; background-color: #78B543; font-size: 0.9rem;">
                            <i class="fa-solid fa-eye"></i> Ver
                        </button>
                        <button onclick="eliminarPlantilla(${plantilla.id})" class="swal2-cancel swal2-styled" 
                                style="flex: 1; background-color: #e74c3c; font-size: 0.9rem;">
                            <i class="fa-solid fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        Swal.fire({
            title: '<i class="fa-solid fa-folder-open"></i> Plantillas Guardadas',
            html: html,
            width: '650px',
            showConfirmButton: false,
            showCloseButton: true
        });
        
    } catch (error) {
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudieron cargar las plantillas'
        });
    }
}

async function cargarPlantilla(id) {
    try {
        const response = await fetch(`../../php/carga/cargar_plantilla.php?id=${id}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error al cargar plantilla');
        }
        
        // Confirmar antes de cargar
        const result = await Swal.fire({
            title: '¿Cargar plantilla?',
            html: `Esto mostrará los datos guardados en la plantilla<br>
                   <strong>"${data.plantilla.nombre}"</strong>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, cargar',
            cancelButtonText: 'Cancelar'
        });
        
        if (!result.isConfirmed) return;
        
        // Guardar estado actual antes de cargar plantilla
        if (!viendoPlantilla) {
            cargasOriginales = [...cargas];
        }
        
        // Cargar datos de la plantilla
        if (data.datos && data.datos.cargas) {
            cargas = data.datos.cargas;
            cargasFiltradas = [...cargas];
            viendoPlantilla = true;
            nombrePlantillaActual = data.plantilla.nombre;
            
            // Actualizar paginación y tabla
            if (window.PaginacionCarga) {
                PaginacionCarga.inicializar(cargasFiltradas.length, 10);
            }
            
            renderizarTabla();
            
            // Cerrar el modal de plantillas
            Swal.close();
            
            Swal.fire({
                icon: 'success',
                title: '¡Cargado!',
                html: `Plantilla <strong>"${data.plantilla.nombre}"</strong> cargada correctamente<br><br>
                       <small><i class="fa-solid fa-arrow-left"></i> Usa el botón "Regresar" para volver a los datos actuales</small>`,
                timer: 3000,
                showConfirmButton: false
            });
        }
        
    } catch (error) {
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo cargar la plantilla'
        });
    }
}

async function eliminarPlantilla(id) {
    try {
        const result = await Swal.fire({
            title: '¿Eliminar plantilla?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#6b7480',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        
        if (!result.isConfirmed) return;
        
        const formData = new FormData();
        formData.append('id', id);
        
        const response = await fetch('../../php/carga/eliminar_plantilla.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error al eliminar');
        }
        
        Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'Plantilla eliminada correctamente',
            timer: 1500,
            showConfirmButton: false
        });
        
        // Recargar lista de plantillas
        setTimeout(() => {
            verPlantillas();
        }, 1500);
        
    } catch (error) {
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo eliminar la plantilla'
        });
    }
}

// ============================================
// REGRESAR DE PLANTILLA
// ============================================
function regresarDePlantilla() {
    if (!viendoPlantilla) return;
    
    Swal.fire({
        title: '¿Regresar a datos actuales?',
        text: 'Volverás a ver los datos actuales de carga académica',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, regresar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Restaurar datos originales
            cargas = [...cargasOriginales];
            cargasFiltradas = [...cargas];
            viendoPlantilla = false;
            nombrePlantillaActual = '';
            
            // Actualizar paginación y tabla
            if (window.PaginacionCarga) {
                PaginacionCarga.inicializar(cargasFiltradas.length, 10);
            }
            
            renderizarTabla();
            
            Swal.fire({
                icon: 'success',
                title: '¡Listo!',
                text: 'Has regresado a los datos actuales',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

function actualizarBotonRegresar() {
    // Buscar si ya existe el botón
    let btnRegresar = document.getElementById('btnRegresarPlantilla');
    
    if (viendoPlantilla) {
        // Crear o mostrar botón
        if (!btnRegresar) {
            const tableActions = document.querySelector('.table-actions');
            if (tableActions) {
                btnRegresar = document.createElement('button');
                btnRegresar.id = 'btnRegresarPlantilla';
                btnRegresar.className = 'btn btn-warning';
                btnRegresar.onclick = regresarDePlantilla;
                btnRegresar.style.order = '-1'; // Ponerlo al inicio
                btnRegresar.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Regresar';
                
                // Insertar al inicio
                tableActions.insertBefore(btnRegresar, tableActions.firstChild);
            }
        } else {
            btnRegresar.style.display = 'flex';
        }
        
        // Agregar indicador visual de que se está viendo una plantilla
        actualizarIndicadorPlantilla();
    } else {
        // Ocultar botón si existe
        if (btnRegresar) {
            btnRegresar.style.display = 'none';
        }
        
        // Remover indicador
        const indicador = document.getElementById('indicadorPlantilla');
        if (indicador) {
            indicador.remove();
        }
    }
}

function actualizarIndicadorPlantilla() {
    // Buscar o crear indicador
    let indicador = document.getElementById('indicadorPlantilla');
    
    if (!indicador) {
        const titleSection = document.querySelector('.title-section');
        if (titleSection) {
            indicador = document.createElement('div');
            indicador.id = 'indicadorPlantilla';
            indicador.style.cssText = `
                background: linear-gradient(135deg, #f39c12, #e67e22);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 500;
                margin-top: 0.5rem;
                text-align: center;
                box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
                animation: pulso 2s ease-in-out infinite;
            `;
            titleSection.appendChild(indicador);
        }
    }
    
    if (indicador) {
        indicador.innerHTML = `<i class="fa-solid fa-eye"></i> Viendo plantilla: <strong>${nombrePlantillaActual}</strong>`;
    }
}

// ============================================
// EXPORTAR A EXCEL
// ============================================
function exportToExcel() {
    if (!cargas || cargas.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin Datos',
            text: 'No hay datos para exportar'
        });
        return;
    }
    
    try {
        // Crear datos para exportar
        const datosExportar = [];
        
        // Agrupar por docente
        const cargasPorDocente = agruparPorDocente(cargas);
        
        Object.keys(cargasPorDocente).forEach(docenteId => {
            const datos = cargasPorDocente[docenteId];
            
            // Agregar fila de docente
            datosExportar.push({
                'Docente': datos.docente,
                'Turno': datos.turno,
                'Régimen': datos.regimen,
                'Materia': '',
                'Grupo': '',
                'Horas': '',
                'Tutoría': '',
                'Estadía': '',
                'Administrativas': '',
                'Total': ''
            });
            
            // Agregar cargas
            datos.cargas.forEach(carga => {
                datosExportar.push({
                    'Docente': '',
                    'Turno': '',
                    'Régimen': '',
                    'Materia': carga.materia,
                    'Grupo': carga.grupo,
                    'Horas': carga.horas,
                    'Tutoría': carga.horas_tutoria,
                    'Estadía': carga.horas_estadia,
                    'Administrativas': carga.administrativas || '',
                    'Total': carga.total
                });
            });

            // Agregar totales
            datosExportar.push({
                'Docente': 'TOTAL',
                'Turno': '',
                'Régimen': '',
                'Materia': '',
                'Grupo': '',
                'Horas': datos.totales.horas,
                'Tutoría': datos.totales.tutoria,
                'Estadía': datos.totales.estadia,
                'Administrativas': '',
                'Total': datos.totales.total
            });
            
            // Fila vacía para separar docentes
            datosExportar.push({});
        });
        
        // Convertir a CSV
        const csv = convertirACSV(datosExportar);
        
        // Descargar archivo
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM para Excel
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const fecha = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `carga_academica_${fecha}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Swal.fire({
            icon: 'success',
            title: '¡Exportado!',
            text: 'Archivo descargado correctamente',
            timer: 1500,
            showConfirmButton: false
        });
        
    } catch (error) {
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo exportar el archivo'
        });
    }
}

function convertirACSV(datos) {
    if (!datos || datos.length === 0) return '';
    
    // Obtener encabezados
    const headers = Object.keys(datos[0]);
    
    // Crear filas CSV
    const csvRows = [];
    
    // Agregar encabezados
    csvRows.push(headers.join(','));
    
    // Agregar datos
    datos.forEach(row => {
        const values = headers.map(header => {
            const valor = row[header] || '';
            return `"${String(valor).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
}

// ============================================
// IMPRIMIR
// ============================================
function imprimirPagina() {
    window.print();
}

// ============================================
// UTILIDADES
// ============================================
function mostrarCargando() {
    const tbody = document.querySelector('#dataTable tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="loading-spinner">
                    <div class="spinner"></div>
                    <p style="margin-top: 1rem; color: #6b7480;">Cargando datos...</p>
                </td>
            </tr>
        `;
    }
}

function ocultarCargando() {
    // Se maneja automáticamente al renderizar la tabla
}

function mostrarError(mensaje) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje
    });
}

// ============================================
// FILTROS Y ORDENAMIENTO
// ============================================
function inicializarFiltros() {
    // Llenar select de docentes
    const filtroDocente = document.getElementById('filtro-docente');
    if (filtroDocente && datosCache.docentes) {
        filtroDocente.innerHTML = '<option value="">Todos</option>';

        // Obtener docentes únicos de las cargas
        const docentesUnicos = [...new Set(cargas.map(c => c.docente_id))];
        const docentesFiltrados = datosCache.docentes.filter(d => docentesUnicos.includes(d.id));

        docentesFiltrados.forEach(docente => {
            const option = document.createElement('option');
            option.value = docente.id;
            option.textContent = docente.nombre;
            filtroDocente.appendChild(option);
        });
    }

    // Event listeners para filtros
    document.getElementById('filtro-buscar')?.addEventListener('input', aplicarFiltros);
    document.getElementById('filtro-turno')?.addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-docente')?.addEventListener('change', aplicarFiltros);
    document.getElementById('ordenar-por')?.addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
    const textoBusqueda = document.getElementById('filtro-buscar')?.value.toLowerCase() || '';
    const turnoSeleccionado = document.getElementById('filtro-turno')?.value || '';
    const docenteSeleccionado = document.getElementById('filtro-docente')?.value || '';
    const ordenSeleccionado = document.getElementById('ordenar-por')?.value || 'docente-asc';

    // Aplicar filtros
    cargasFiltradas = cargas.filter(carga => {
        // Filtro de búsqueda por texto
        const cumpleBusqueda = !textoBusqueda ||
            carga.docente.toLowerCase().includes(textoBusqueda) ||
            carga.materia.toLowerCase().includes(textoBusqueda) ||
            carga.grupo.toLowerCase().includes(textoBusqueda) ||
            carga.clave_materia.toLowerCase().includes(textoBusqueda);

        // Filtro por turno
        const cumpleTurno = !turnoSeleccionado || carga.turno === turnoSeleccionado || carga.turno_docente === turnoSeleccionado;

        // Filtro por docente
        const cumpleDocente = !docenteSeleccionado || carga.docente_id == docenteSeleccionado;

        return cumpleBusqueda && cumpleTurno && cumpleDocente;
    });

    // Aplicar ordenamiento
    aplicarOrdenamiento(ordenSeleccionado);

    // Reiniciar paginación
    if (window.PaginacionCarga) {
        PaginacionCarga.inicializar(cargasFiltradas.length, 10);
    }

    // Renderizar tabla
    renderizarTabla();
}

function aplicarOrdenamiento(tipo) {
    switch (tipo) {
        case 'docente-asc':
            cargasFiltradas.sort((a, b) => a.docente.localeCompare(b.docente));
            break;
        case 'docente-desc':
            cargasFiltradas.sort((a, b) => b.docente.localeCompare(a.docente));
            break;
        case 'horas-desc':
            cargasFiltradas.sort((a, b) => (b.total || 0) - (a.total || 0));
            break;
        case 'horas-asc':
            cargasFiltradas.sort((a, b) => (a.total || 0) - (b.total || 0));
            break;
        case 'fecha-desc':
            cargasFiltradas.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
            break;
        case 'fecha-asc':
            cargasFiltradas.sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion));
            break;
    }
}

function limpiarFiltros() {
    document.getElementById('filtro-buscar').value = '';
    document.getElementById('filtro-turno').value = '';
    document.getElementById('filtro-docente').value = '';
    document.getElementById('ordenar-por').value = 'docente-asc';

    // Recargar todos los datos
    cargasFiltradas = [...cargas];

    // Reiniciar paginación
    if (window.PaginacionCarga) {
        PaginacionCarga.inicializar(cargasFiltradas.length, 10);
    }

    // Renderizar tabla
    renderizarTabla();
}

// ============================================
// HACER FUNCIONES DISPONIBLES GLOBALMENTE
// ============================================
window.editarCarga = editarCarga;
window.eliminarCarga = eliminarCarga;
window.guardarPlantillaComoImagen = guardarPlantillaComoImagen;
window.verPlantillas = verPlantillas;
window.cargarPlantilla = cargarPlantilla;
window.eliminarPlantilla = eliminarPlantilla;
window.regresarDePlantilla = regresarDePlantilla;
window.exportToExcel = exportToExcel;
window.limpiarFiltros = limpiarFiltros;
window.imprimirPagina = imprimirPagina;