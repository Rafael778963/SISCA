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

        // Escuchar cambios de paginación
        document.addEventListener('paginaCambiada', (e) => {
            mostrarCargasEnTabla(datosGlobales.cargasActuales);
        });

        console.log('Módulo de Carga Académica inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar módulo:', error);
        mostrarError('Error al inicializar el módulo de carga académica');
    }
});

// ============================================================
// CARGA DE DATOS INICIALES
// ============================================================

async function cargarDatosFiltros() {
    try {
        const response = await fetch('../../php/carga/obtener_datos_filtros.php');
        const data = await response.json();

        if (data.success) {
            datosGlobales.docentes = data.docentes;
            datosGlobales.grupos = data.grupos;
            datosGlobales.materias = data.materias;
            datosGlobales.turnos = data.turnos;

            poblarSelectDocentes();
            poblarSelectGrupos();
            poblarSelectMaterias();

            console.log('✓ Datos de filtros cargados:', {
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

async function cargarCargasAcademicas() {
    try {
        const periodo_id = periodoActivo ? periodoActivo.id : 0;
        const response = await fetch(`../../php/carga/obtener_cargas.php?periodo_id=${periodo_id}`);
        const data = await response.json();

        if (data.success) {
            datosGlobales.cargasActuales = data.data;
            datosGlobales.estadisticas = data.estadisticas;

            mostrarCargasEnTabla(data.data);

            console.log('Cargas académicas cargadas:', data.total_registros);
        } else {
            console.warn(data.message);
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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await agregarAsignatura();
    });

    btnLimpiar.addEventListener('click', () => {
        limpiarFormulario();
    });

    btnGuardarPlantilla.addEventListener('click', async () => {
        await guardarPlantilla();
    });

    selectAsignatura.addEventListener('change', (e) => {
        const option = e.target.selectedOptions[0];
        if (option && option.dataset.horas) {
            const horas = parseInt(option.dataset.horas);
            document.getElementById('horas').value = horas;
            document.getElementById('hrsClase').value = horas;
        }
    });
}

// ============================================================
// AGREGAR ASIGNATURA
// ============================================================

async function agregarAsignatura() {
    try {
        if (!validarFormulario()) {
            return;
        }

        const formData = new FormData(document.getElementById('cargaForm'));

        Swal.fire({
            title: 'Guardando...',
            text: 'Guardando asignatura',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch('../../php/carga/guardar_carga.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            Swal.close();

            await Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: data.message,
                timer: 1500,
                showConfirmButton: false
            });

            await cargarCargasAcademicas();
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
    const horas = document.getElementById('horas').value;
    const hrsClase = document.getElementById('hrsClase').value;

    let valido = true;

    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    if (!turno) {
        document.getElementById('error-turno').textContent = 'Selecciona un turno';
        valido = false;
    }

    if (!grupo) {
        document.getElementById('error-grupo').textContent = 'Selecciona un grupo';
        valido = false;
    }

    if (!asignatura) {
        document.getElementById('error-asignatura').textContent = 'Selecciona una asignatura';
        valido = false;
    }

    if (!docente) {
        document.getElementById('error-docente').textContent = 'Selecciona un docente';
        valido = false;
    }

    if (!horas || horas < 1) {
        document.getElementById('error-horas').textContent = 'Ingresa las horas (mínimo 1)';
        valido = false;
    }

    if (!hrsClase || hrsClase < 0) {
        document.getElementById('error-hrsClase').textContent = 'Ingresa las horas de clase';
        valido = false;
    }

    return valido;
}

// ============================================================
// MOSTRAR CARGAS EN TABLA
// ============================================================

function mostrarCargasEnTabla(cargas) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';

    if (!cargas || cargas.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="9" class="empty-message">
                <i class="fa-solid fa-inbox"></i> No hay cargas registradas
            </td>
        `;
        tbody.appendChild(tr);
        
        if (window.PaginacionCarga) {
            document.getElementById('paginacion').style.display = 'none';
        }
        return;
    }

    const cargasPorDocente = {};
    cargas.forEach(carga => {
        if (!cargasPorDocente[carga.docente_id]) {
            cargasPorDocente[carga.docente_id] = {
                docente: carga.docente,
                turno_docente: carga.turno_docente,
                regimen: carga.regimen,
                cargas: []
            };
        }
        cargasPorDocente[carga.docente_id].cargas.push(carga);
    });

    const docentesArray = Object.values(cargasPorDocente).sort((a, b) => 
        a.docente.localeCompare(b.docente)
    );

    if (window.PaginacionCarga) {
        PaginacionCarga.inicializar(docentesArray.length, 10);
        const { inicio, fin } = PaginacionCarga.obtenerRango();
        const docentesPaginados = docentesArray.slice(inicio, fin);
        renderizarDocentes(docentesPaginados, tbody);
    } else {
        renderizarDocentes(docentesArray, tbody);
    }
}

function renderizarDocentes(docentes, tbody) {
    docentes.forEach(docenteData => {
        const estadisticas = datosGlobales.estadisticas[docenteData.cargas[0].docente_id] || {};

        const trDocente = document.createElement('tr');
        trDocente.classList.add('docente-row');
        trDocente.innerHTML = `
            <td>
                <strong>${docenteData.docente}</strong><br>
                <small style="color: var(--muted)">${docenteData.turno_docente} - ${docenteData.regimen}</small>
            </td>
            <td>${estadisticas.total_horas_materias || 0}</td>
            <td></td>
            <td>${estadisticas.total_horas_clase || 0}</td>
            <td>${estadisticas.total_horas_tutoria || 0}</td>
            <td>${estadisticas.total_horas_estadia || 0}</td>
            <td>${estadisticas.actividades_admin || '-'}</td>
            <td><strong>${estadisticas.total_horas_general || 0}</strong></td>
            <td></td>
        `;
        tbody.appendChild(trDocente);

        docenteData.cargas.forEach((carga) => {
            const trMateria = document.createElement('tr');
            trMateria.classList.add('materia-row');
            
            trMateria.innerHTML = `
                <td style="padding-left: 2rem; color: var(--muted); font-size: 0.85rem">
                    ${carga.clave_materia} - ${carga.materia}
                </td>
                <td>${carga.horas}</td>
                <td>${carga.grupo}</td>
                <td>${carga.horas_clase}</td>
                <td>${carga.horas_tutoria || 0}</td>
                <td>${carga.horas_estadia || 0}</td>
                <td>${carga.administrativas || '-'}</td>
                <td>${carga.total}</td>
                <td class="action-cell">
                    <div class="action-buttons">
                        <button class="btn-delete" onclick="eliminarCarga(${carga.id})" title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(trMateria);
        });

        const trTotal = document.createElement('tr');
        trTotal.classList.add('total-row');
        trTotal.innerHTML = `
            <td style="text-align: right"><strong>TOTAL:</strong></td>
            <td><strong>${estadisticas.total_horas_materias || 0}</strong></td>
            <td></td>
            <td><strong>${estadisticas.total_horas_clase || 0}</strong></td>
            <td><strong>${estadisticas.total_horas_tutoria || 0}</strong></td>
            <td><strong>${estadisticas.total_horas_estadia || 0}</strong></td>
            <td><strong>${estadisticas.actividades_admin || '-'}</strong></td>
            <td><strong>${estadisticas.total_horas_general || 0}</strong></td>
            <td></td>
        `;
        tbody.appendChild(trTotal);
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

console.log('Módulo de Carga Académica cargado');