/**
 * MÓDULO DE CARGA ACADÉMICA - SISCA
 * Gestiona la asignación de materias a docentes por periodo
 * Incluye funcionalidad de plantillas para guardar trabajo en progreso
 */

// ============================================================
// VARIABLES GLOBALES
// ============================================================
let datosGlobales = {
    docentes: [],
    grupos: [],
    materias: [],
    turnos: [],
    cargasActuales: [],
    estadisticas: {}
};

let cargasEnTabla = []; // Cargas mostradas en la tabla actual (antes de guardar)

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Inicializar gestor de periodos
        await inicializarPeriodoManager();

        // Cargar datos iniciales
        await cargarDatosFiltros();
        await cargarCargasAcademicas();

        // Configurar event listeners
        configurarEventListeners();

        console.log(' Módulo de Carga Académica inicializado correctamente');
    } catch (error) {
        console.error('L Error al inicializar módulo:', error);
        mostrarError('Error al inicializar el módulo de carga académica');
    }
});

// ============================================================
// CARGA DE DATOS INICIALES
// ============================================================

/**
 * Cargar datos para los filtros (docentes, grupos, materias)
 */
async function cargarDatosFiltros() {
    try {
        const response = await fetch('../../php/carga/obtener_datos_filtros.php');
        const data = await response.json();

        if (data.success) {
            datosGlobales.docentes = data.docentes;
            datosGlobales.grupos = data.grupos;
            datosGlobales.materias = data.materias;
            datosGlobales.turnos = data.turnos;

            // Poblar selectores
            poblarSelectDocentes();
            poblarSelectGrupos();
            poblarSelectMaterias();

            console.log('=Ê Datos de filtros cargados:', {
                docentes: data.docentes.length,
                grupos: data.grupos.length,
                materias: data.materias.length
            });
        } else {
            throw new Error(data.message || 'Error al cargar datos');
        }
    } catch (error) {
        console.error('Error al cargar datos de filtros:', error);
        mostrarError('Error al cargar datos de filtros: ' + error.message);
    }
}

/**
 * Cargar cargas académicas del periodo activo
 */
async function cargarCargasAcademicas() {
    try {
        const periodo_id = periodoActivo ? periodoActivo.id : 0;
        const response = await fetch(`../../php/carga/obtener_cargas.php?periodo_id=${periodo_id}`);
        const data = await response.json();

        if (data.success) {
            datosGlobales.cargasActuales = data.data;
            datosGlobales.estadisticas = data.estadisticas;

            // Mostrar en tabla
            mostrarCargasEnTabla(data.data);

            console.log('=Ë Cargas académicas cargadas:', data.total_registros);
        } else {
            console.warn('  ' + data.message);
            mostrarCargasEnTabla([]);
        }
    } catch (error) {
        console.error('Error al cargar cargas académicas:', error);
        mostrarError('Error al cargar cargas académicas: ' + error.message);
    }
}

// ============================================================
// POBLAR SELECTORES
// ============================================================

function poblarSelectDocentes() {
    const select = document.getElementById('docente');
    select.innerHTML = '<option value="" disabled selected>Selecciona un docente...</option>';

    datosGlobales.docentes.forEach(docente => {
        const option = document.createElement('option');
        option.value = docente.id;
        option.textContent = docente.label;
        option.dataset.turno = docente.turno;
        option.dataset.regimen = docente.regimen;
        select.appendChild(option);
    });
}

function poblarSelectGrupos() {
    const select = document.getElementById('grupo');
    select.innerHTML = '<option value="" disabled selected>Selecciona un grupo...</option>';

    datosGlobales.grupos.forEach(grupo => {
        const option = document.createElement('option');
        option.value = grupo.id;
        option.textContent = grupo.label;
        option.dataset.turno = grupo.turno;
        option.dataset.programa = grupo.programa;
        option.dataset.grado = grupo.grado;
        select.appendChild(option);
    });
}

function poblarSelectMaterias() {
    const select = document.getElementById('asignatura');
    select.innerHTML = '<option value="" disabled selected>Selecciona una asignatura...</option>';

    datosGlobales.materias.forEach(materia => {
        const option = document.createElement('option');
        option.value = materia.id;
        option.textContent = materia.label;
        option.dataset.horas = materia.horas;
        option.dataset.clave = materia.clave;
        option.dataset.grado = materia.grado;
        option.dataset.programa = materia.programa;
        select.appendChild(option);
    });
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function configurarEventListeners() {
    const form = document.getElementById('cargaForm');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const btnGuardarPlantilla = document.getElementById('btnGuardarPlantilla');
    const selectAsignatura = document.getElementById('asignatura');

    // Submit del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await agregarAsignatura();
    });

    // Limpiar formulario
    btnLimpiar.addEventListener('click', () => {
        limpiarFormulario();
    });

    // Guardar plantilla
    btnGuardarPlantilla.addEventListener('click', async () => {
        await guardarPlantilla();
    });

    // Cuando se selecciona una materia, auto-rellenar las horas
    selectAsignatura.addEventListener('change', (e) => {
        const option = e.target.selectedOptions[0];
        if (option && option.dataset.horas) {
            const horas = parseInt(option.dataset.horas);
            document.getElementById('horas').value = horas;
            document.getElementById('hrsClase').value = horas; // Por defecto, todas las horas son de clase
        }
    });
}

// ============================================================
// AGREGAR ASIGNATURA
// ============================================================

async function agregarAsignatura() {
    try {
        // Validar formulario
        if (!validarFormulario()) {
            return;
        }

        // Obtener datos del formulario
        const formData = new FormData(document.getElementById('cargaForm'));

        // Mostrar loading
        Swal.fire({
            title: 'Guardando...',
            text: 'Guardando asignatura',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Enviar datos
        const response = await fetch('../../php/carga/guardar_carga.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // Cerrar loading
            Swal.close();

            // Mostrar éxito
            await Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: data.message,
                timer: 1500,
                showConfirmButton: false
            });

            // Recargar cargas
            await cargarCargasAcademicas();

            // Limpiar formulario
            limpiarFormulario();

        } else {
            throw new Error(data.message || 'Error al guardar');
        }

    } catch (error) {
        console.error('Error al agregar asignatura:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Error al guardar la asignatura'
        });
    }
}

// ============================================================
// VALIDACIÓN DEL FORMULARIO
// ============================================================

function validarFormulario() {
    const turno = document.getElementById('turno').value;
    const grupo = document.getElementById('grupo').value;
    const asignatura = document.getElementById('asignatura').value;
    const docente = document.getElementById('docente').value;
    const horas = parseInt(document.getElementById('horas').value || 0);
    const hrsClase = parseInt(document.getElementById('hrsClase').value || 0);

    // Limpiar errores previos
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    let errores = [];

    if (!turno) {
        errores.push({ campo: 'turno', mensaje: 'Selecciona un turno' });
    }

    if (!grupo) {
        errores.push({ campo: 'grupo', mensaje: 'Selecciona un grupo' });
    }

    if (!asignatura) {
        errores.push({ campo: 'asignatura', mensaje: 'Selecciona una asignatura' });
    }

    if (!docente) {
        errores.push({ campo: 'docente', mensaje: 'Selecciona un docente' });
    }

    if (horas <= 0) {
        errores.push({ campo: 'horas', mensaje: 'Ingresa horas válidas' });
    }

    if (hrsClase < 0) {
        errores.push({ campo: 'hrsClase', mensaje: 'Horas de clase no puede ser negativo' });
    }

    // Mostrar errores
    if (errores.length > 0) {
        errores.forEach(error => {
            const errorEl = document.getElementById(`error-${error.campo}`);
            if (errorEl) {
                errorEl.textContent = error.mensaje;
            }
        });

        Swal.fire({
            icon: 'warning',
            title: 'Formulario incompleto',
            text: 'Por favor completa todos los campos requeridos'
        });

        return false;
    }

    return true;
}

// ============================================================
// MOSTRAR CARGAS EN TABLA
// ============================================================

function mostrarCargasEnTabla(cargas) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';

    if (cargas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 30px; color: #999;">
                    <i class="fa-solid fa-inbox fa-3x" style="margin-bottom: 15px;"></i><br>
                    No hay cargas académicas registradas para este periodo
                </td>
            </tr>
        `;
        return;
    }

    // Agrupar por docente
    const cargasPorDocente = {};
    cargas.forEach(carga => {
        if (!cargasPorDocente[carga.docente_id]) {
            cargasPorDocente[carga.docente_id] = {
                docente: carga.docente,
                turno: carga.turno_docente,
                regimen: carga.regimen,
                cargas: []
            };
        }
        cargasPorDocente[carga.docente_id].cargas.push(carga);
    });

    // Renderizar filas
    Object.keys(cargasPorDocente).forEach(docente_id => {
        const info = cargasPorDocente[docente_id];
        const estadisticas = datosGlobales.estadisticas[docente_id] || {};

        info.cargas.forEach((carga, index) => {
            const tr = document.createElement('tr');
            tr.dataset.id = carga.id;

            // Primera fila del docente: mostrar nombre
            if (index === 0) {
                tr.innerHTML = `
                    <td rowspan="${info.cargas.length}" class="docente-cell">
                        <strong>${info.docente}</strong><br>
                        <small>${info.turno} - ${info.regimen}</small>
                    </td>
                    <td>${carga.horas}</td>
                    <td>${carga.grupo}</td>
                    <td>${carga.horas_clase}</td>
                    <td>${carga.horas_tutoria || 0}</td>
                    <td>${carga.horas_estadia || 0}</td>
                    <td>${carga.administrativas || '-'}</td>
                    <td>${carga.total}</td>
                    <td>
                        <button class="btn-icon btn-danger" onclick="eliminarCarga(${carga.id})" title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
            } else {
                tr.innerHTML = `
                    <td>${carga.horas}</td>
                    <td>${carga.grupo}</td>
                    <td>${carga.horas_clase}</td>
                    <td>${carga.horas_tutoria || 0}</td>
                    <td>${carga.horas_estadia || 0}</td>
                    <td>${carga.administrativas || '-'}</td>
                    <td>${carga.total}</td>
                    <td>
                        <button class="btn-icon btn-danger" onclick="eliminarCarga(${carga.id})" title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
            }

            tbody.appendChild(tr);
        });

        // Fila de totales por docente
        if (estadisticas.total_horas_general) {
            const trTotal = document.createElement('tr');
            trTotal.className = 'total-row';
            trTotal.innerHTML = `
                <td colspan="3" style="text-align: right;"><strong>TOTAL:</strong></td>
                <td><strong>${estadisticas.total_horas_clase || 0}</strong></td>
                <td><strong>${estadisticas.total_horas_tutoria || 0}</strong></td>
                <td><strong>${estadisticas.total_horas_estadia || 0}</strong></td>
                <td>${estadisticas.actividades_admin || '-'}</td>
                <td><strong>${estadisticas.total_horas_general || 0}</strong></td>
                <td></td>
            `;
            tbody.appendChild(trTotal);
        }
    });
}

// ============================================================
// ELIMINAR CARGA
// ============================================================

async function eliminarCarga(id) {
    try {
        const result = await Swal.fire({
            title: '¿Eliminar carga?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) {
            return;
        }

        // Mostrar loading
        Swal.fire({
            title: 'Eliminando...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Enviar solicitud
        const formData = new FormData();
        formData.append('id', id);

        const response = await fetch('../../php/carga/eliminar_carga.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            Swal.close();

            await Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: data.message,
                timer: 1500,
                showConfirmButton: false
            });

            // Recargar cargas
            await cargarCargasAcademicas();

        } else {
            throw new Error(data.message || 'Error al eliminar');
        }

    } catch (error) {
        console.error('Error al eliminar carga:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Error al eliminar la carga'
        });
    }
}

// ============================================================
// GUARDAR PLANTILLA
// ============================================================

async function guardarPlantilla() {
    try {
        // Solicitar nombre de la plantilla
        const { value: nombrePlantilla } = await Swal.fire({
            title: 'Guardar Plantilla',
            input: 'text',
            inputLabel: 'Nombre de la plantilla',
            inputPlaceholder: 'Ej: Carga Académica Enero 2025',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) {
                    return 'Debes ingresar un nombre para la plantilla';
                }
                if (value.length > 100) {
                    return 'El nombre es muy largo (máximo 100 caracteres)';
                }
            }
        });

        if (!nombrePlantilla) {
            return;
        }

        // Recopilar datos de la tabla actual
        const datosPlantilla = {
            cargas: datosGlobales.cargasActuales,
            fecha: new Date().toISOString(),
            periodo_id: periodoActivo ? periodoActivo.id : 0
        };

        if (datosPlantilla.cargas.length === 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'Sin datos',
                text: 'No hay cargas para guardar en la plantilla'
            });
            return;
        }

        // Mostrar loading
        Swal.fire({
            title: 'Guardando plantilla...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Enviar datos
        const formData = new FormData();
        formData.append('nombre_plantilla', nombrePlantilla);
        formData.append('descripcion', `${datosPlantilla.cargas.length} cargas académicas`);
        formData.append('datos_json', JSON.stringify(datosPlantilla));

        const response = await fetch('../../php/carga/guardar_plantilla.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            Swal.close();

            await Swal.fire({
                icon: 'success',
                title: '¡Plantilla guardada!',
                text: `La plantilla "${nombrePlantilla}" ha sido ${data.accion} exitosamente`,
                timer: 2000,
                showConfirmButton: false
            });

        } else {
            throw new Error(data.message || 'Error al guardar plantilla');
        }

    } catch (error) {
        console.error('Error al guardar plantilla:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Error al guardar la plantilla'
        });
    }
}

// ============================================================
// FUNCIONES DE EXPORTACIÓN E IMPRESIÓN
// ============================================================

function imprimirPagina() {
    window.print();
}

function exportToExcel() {
    try {
        // Crear datos para Excel
        const datosExcel = [];

        // Encabezados
        datosExcel.push(['CARGA ACADÉMICA']);
        datosExcel.push([`Periodo: ${periodoActivo ? periodoActivo.texto : '-'}`]);
        datosExcel.push([]);
        datosExcel.push(['Docente', 'Horas', 'Grupo', 'Hrs Clase', 'Tutoría', 'Estadía', 'Administrativas', 'Total']);

        // Datos
        datosGlobales.cargasActuales.forEach(carga => {
            datosExcel.push([
                carga.docente,
                carga.horas,
                carga.grupo,
                carga.horas_clase,
                carga.horas_tutoria || 0,
                carga.horas_estadia || 0,
                carga.administrativas || '',
                carga.total
            ]);
        });

        // Convertir a CSV
        const csv = datosExcel.map(row => row.join(',')).join('\n');

        // Crear blob y descargar
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `carga_academica_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Swal.fire({
            icon: 'success',
            title: 'Exportado',
            text: 'Archivo CSV descargado exitosamente',
            timer: 1500,
            showConfirmButton: false
        });

    } catch (error) {
        console.error('Error al exportar:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al exportar a Excel'
        });
    }
}

// Esta función se llama desde el HTML
function guardarPlantillaComoImagen() {
    guardarPlantilla();
}

// ============================================================
// UTILIDADES
// ============================================================

function limpiarFormulario() {
    document.getElementById('cargaForm').reset();
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

function mostrarError(mensaje) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje
    });
}

console.log('=Ú Módulo de Carga Académica cargado');
