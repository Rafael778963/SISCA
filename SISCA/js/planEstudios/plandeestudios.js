// ====================================
// PLAN DE ESTUDIOS - SISCA
// ====================================

// Variables globales
let asignaturas = []; // Array principal de asignaturas
let asignaturasFiltradas = []; // Array filtrado
let viendoPlantilla = false; // Indica si se está viendo una plantilla
let asignaturasOriginales = []; // Backup de asignaturas originales
let nombrePlantillaActual = ''; // Nombre de la plantilla actual
let plantillaActualId = null; // ID de la plantilla actual

// ====================================
// INICIALIZACIÓN
// ====================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Iniciando Plan de Estudios...');

    // Inicializar periodo manager
    await inicializarPeriodoManager();

    // Verificar que hay periodo activo
    if (!hayPeriodoActivo()) {
        Swal.fire({
            icon: 'warning',
            title: 'No hay periodo activo',
            text: 'Por favor, selecciona un periodo desde el módulo de Períodos.',
            confirmButtonText: 'Ir a Períodos',
            allowOutsideClick: false
        }).then(() => {
            window.location.href = '../periodos/periodos.html';
        });
        return;
    }

    // Inicializar componentes
    inicializarEventos();
    await cargarAsignaturas();
    await cargarPlantillas();
});

// ====================================
// EVENTOS
// ====================================

function inicializarEventos() {
    // Botón agregar asignatura
    const btnAgregar = document.getElementById('btn-agregar-asignatura');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', agregarAsignatura);
    }

    // Botón limpiar
    const btnLimpiar = document.getElementById('btnLimpiar');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFormulario);
    }

    // Botón guardar plantilla
    const btnGuardarPlantilla = document.getElementById('btn-guardar-plantilla');
    if (btnGuardarPlantilla) {
        btnGuardarPlantilla.addEventListener('click', mostrarDialogoGuardarPlantilla);
    }
}

// ====================================
// CARGAR ASIGNATURAS
// ====================================

async function cargarAsignaturas() {
    try {
        const periodoId = obtenerPeriodoActivoId();
        if (!periodoId) {
            console.error('No hay periodo activo');
            return;
        }

        const response = await fetch(`../../php/planEstudios/obtener_asignaturas.php?periodo_id=${periodoId}`);
        const data = await response.json();

        if (data.success) {
            asignaturas = data.data || [];
            asignaturasFiltradas = [...asignaturas];
            renderizarTabla();
        } else {
            console.error('Error al cargar asignaturas:', data.message);
            // No mostrar error si no hay datos, solo inicializar vacío
            asignaturas = [];
            asignaturasFiltradas = [];
            renderizarTabla();
        }
    } catch (error) {
        console.error('Error en cargarAsignaturas:', error);
        asignaturas = [];
        asignaturasFiltradas = [];
        renderizarTabla();
    }
}

// ====================================
// AGREGAR ASIGNATURA
// ====================================

async function agregarAsignatura() {
    // Validar periodo activo
    const periodoId = obtenerPeriodoActivoId();
    if (!periodoId) {
        Swal.fire({
            icon: 'warning',
            title: 'No hay periodo activo',
            text: 'Por favor, selecciona un periodo primero.'
        });
        return;
    }

    // Obtener valores del formulario
    const nivel = document.getElementById('nivel').value.trim();
    const turno = document.getElementById('turno').value.trim();
    const programaEducativo = document.getElementById('programa_educativo').value.trim();
    const cuatrimestre = document.getElementById('cuatrimestre').value;
    const areaConocimiento = document.getElementById('programa').value.trim();
    const asignatura = document.getElementById('asignatura').value.trim();
    const horasTotal = document.getElementById('horas_total').value;

    // Validar campos requeridos
    if (!nivel || !turno || !programaEducativo || !cuatrimestre) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, completa todos los campos obligatorios (Nivel, Turno, Programa Educativo y Grado).'
        });
        return;
    }

    if (!asignatura || !horasTotal) {
        Swal.fire({
            icon: 'warning',
            title: 'Datos incompletos',
            text: 'Por favor, ingresa el nombre de la asignatura y las horas totales.'
        });
        return;
    }

    // Preparar datos
    const formData = new FormData();
    formData.append('periodo_id', periodoId);
    formData.append('nivel', nivel);
    formData.append('turno', turno);
    formData.append('programa_educativo', programaEducativo);
    formData.append('cuatrimestre', cuatrimestre);
    formData.append('area_conocimiento', areaConocimiento);
    formData.append('asignatura', asignatura);
    formData.append('horas_total', horasTotal);

    try {
        const response = await fetch('../../php/planEstudios/guardar_asignatura.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Asignatura agregada',
                text: 'La asignatura se agregó correctamente.',
                timer: 1500,
                showConfirmButton: false
            });

            // Limpiar campos de asignatura
            document.getElementById('programa').value = '';
            document.getElementById('asignatura').value = '';
            document.getElementById('horas_total').value = '';

            // Recargar asignaturas
            await cargarAsignaturas();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'No se pudo agregar la asignatura.'
            });
        }
    } catch (error) {
        console.error('Error al agregar asignatura:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al agregar la asignatura.'
        });
    }
}

// ====================================
// RENDERIZAR TABLA
// ====================================

function renderizarTabla() {
    const tbody = document.getElementById('tabla-body');
    const infoCarrera = document.getElementById('informacion-carrera');

    if (!tbody) return;

    // Limpiar tabla
    tbody.innerHTML = '';

    // Si no hay asignaturas, mostrar mensaje
    if (asignaturasFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="12" style="text-align: center; padding: 20px;">
                    <i class="fa-solid fa-inbox"></i> No hay asignaturas registradas
                </td>
            </tr>
        `;
        infoCarrera.innerHTML = '';
        return;
    }

    // Agrupar asignaturas por área de conocimiento
    const asignaturasPorArea = agruparPorArea(asignaturasFiltradas);

    // Obtener información del plan (del primer registro)
    const primerAsignatura = asignaturasFiltradas[0];
    actualizarInformacionCarrera(primerAsignatura);

    // Determinar el número máximo de cuatrimestres
    const maxCuatrimestre = Math.max(...asignaturasFiltradas.map(a => parseInt(a.cuatrimestre || a.grado)));

    // Actualizar encabezados de la tabla
    actualizarEncabezados(maxCuatrimestre);

    // Renderizar filas por área
    for (const [area, asignaturasArea] of Object.entries(asignaturasPorArea)) {
        const tr = document.createElement('tr');

        // Columna de área
        const tdArea = document.createElement('td');
        tdArea.className = 'area-cell';
        tdArea.textContent = area || 'Sin área';
        tr.appendChild(tdArea);

        // Columnas de cuatrimestres
        for (let i = 1; i <= maxCuatrimestre; i++) {
            const td = document.createElement('td');
            td.className = 'asignatura-cell';

            // Buscar asignaturas de este cuatrimestre
            const asignaturasEnCuatrimestre = asignaturasArea.filter(a =>
                parseInt(a.cuatrimestre || a.grado) === i
            );

            if (asignaturasEnCuatrimestre.length > 0) {
                asignaturasEnCuatrimestre.forEach((asig, index) => {
                    const div = document.createElement('div');
                    div.className = 'asignatura-item';
                    div.innerHTML = `
                        <strong>${asig.asignatura || asig.nombre_materia}</strong><br>
                        <small>${asig.horas_total || asig.horas_semanales} hrs</small>
                        <button class="btn-eliminar-asig" onclick="eliminarAsignatura(${asig.id})" title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    `;
                    td.appendChild(div);

                    if (index < asignaturasEnCuatrimestre.length - 1) {
                        td.appendChild(document.createElement('br'));
                    }
                });
            }

            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }

    // Actualizar indicador si se está viendo plantilla
    actualizarIndicadorPlantilla();
}

function agruparPorArea(asignaturas) {
    const grupos = {};

    asignaturas.forEach(asig => {
        const area = asig.area_conocimiento || asig.programa || 'General';
        if (!grupos[area]) {
            grupos[area] = [];
        }
        grupos[area].push(asig);
    });

    return grupos;
}

function actualizarEncabezados(maxCuatrimestre) {
    const thead = document.getElementById('tabla-header');
    if (!thead) return;

    let html = '<tr><th>Áreas del Conocimiento</th>';

    for (let i = 1; i <= maxCuatrimestre; i++) {
        html += `<th>${i}°</th>`;
    }

    html += '</tr>';
    thead.innerHTML = html;
}

function actualizarInformacionCarrera(asignatura) {
    const infoCarrera = document.getElementById('informacion-carrera');
    if (!infoCarrera || !asignatura) return;

    const nivel = asignatura.nivel || '';
    const programa = asignatura.programa_educativo || '';
    const turno = asignatura.turno || '';

    infoCarrera.innerHTML = `
        <p><strong>Nivel:</strong> ${nivel} | <strong>Programa:</strong> ${programa} | <strong>Turno:</strong> ${turno}</p>
    `;
}

// ====================================
// ELIMINAR ASIGNATURA
// ====================================

async function eliminarAsignatura(id) {
    const result = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar asignatura?',
        text: 'Esta acción no se puede deshacer.',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33'
    });

    if (!result.isConfirmed) return;

    try {
        const formData = new FormData();
        formData.append('id', id);

        const response = await fetch('../../php/planEstudios/eliminar_asignatura.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Eliminada',
                text: 'La asignatura se eliminó correctamente.',
                timer: 1500,
                showConfirmButton: false
            });

            await cargarAsignaturas();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'No se pudo eliminar la asignatura.'
            });
        }
    } catch (error) {
        console.error('Error al eliminar asignatura:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al eliminar la asignatura.'
        });
    }
}

// ====================================
// LIMPIAR FORMULARIO
// ====================================

function limpiarFormulario() {
    document.getElementById('planEstudiosForm').reset();
}

// ====================================
// PLANTILLAS - GUARDAR
// ====================================

async function mostrarDialogoGuardarPlantilla() {
    // Verificar que hay asignaturas
    if (asignaturas.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'No hay datos',
            text: 'Debes agregar al menos una asignatura antes de guardar una plantilla.'
        });
        return;
    }

    // Mostrar diálogo
    const { value: formValues } = await Swal.fire({
        title: 'Guardar Plantilla',
        html: `
            <div style="text-align: left;">
                <label for="swal-nombre" style="display: block; margin-bottom: 5px;">Nombre de la plantilla:</label>
                <input id="swal-nombre" class="swal2-input" placeholder="Ej: Plan 2025" style="width: 90%;">

                <label for="swal-descripcion" style="display: block; margin-top: 15px; margin-bottom: 5px;">Descripción (opcional):</label>
                <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Descripción..." style="width: 90%; height: 80px;"></textarea>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const nombre = document.getElementById('swal-nombre').value.trim();
            if (!nombre) {
                Swal.showValidationMessage('El nombre es requerido');
                return false;
            }
            return {
                nombre: nombre,
                descripcion: document.getElementById('swal-descripcion').value.trim()
            };
        }
    });

    if (formValues) {
        await guardarPlantilla(formValues);
    }
}

async function guardarPlantilla(formValues) {
    try {
        const periodoId = obtenerPeriodoActivoId();

        // Preparar datos de la plantilla
        const datosPlantilla = {
            asignaturas: asignaturas,
            fecha_guardado: new Date().toISOString(),
            total_registros: asignaturas.length
        };

        const formData = new FormData();
        formData.append('nombre_plantilla', formValues.nombre);
        formData.append('descripcion', formValues.descripcion);
        formData.append('periodo_id', periodoId);
        formData.append('datos_json', JSON.stringify(datosPlantilla));

        const response = await fetch('../../php/planEstudios/guardar_plantilla.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Plantilla guardada',
                text: `La plantilla "${formValues.nombre}" se guardó correctamente.`,
                timer: 2000,
                showConfirmButton: false
            });

            // Recargar plantillas
            await cargarPlantillas();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'No se pudo guardar la plantilla.'
            });
        }
    } catch (error) {
        console.error('Error al guardar plantilla:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al guardar la plantilla.'
        });
    }
}

// ====================================
// PLANTILLAS - CARGAR Y LISTAR
// ====================================

async function cargarPlantillas() {
    try {
        const periodoId = obtenerPeriodoActivoId();
        if (!periodoId) return;

        const response = await fetch(`../../php/planEstudios/obtener_plantillas.php?periodo_id=${periodoId}`);
        const data = await response.json();

        if (data.success) {
            mostrarPlantillas(data.data || []);
        }
    } catch (error) {
        console.error('Error al cargar plantillas:', error);
    }
}

function mostrarPlantillas(plantillas) {
    const tabsHeader = document.getElementById('tabs-plantillas');
    const tabsContent = document.getElementById('contenido-plantillas');

    if (!tabsHeader || !tabsContent) return;

    // Limpiar contenido previo (excepto botón "Nueva")
    const btnNueva = document.getElementById('nueva-tab');
    tabsHeader.innerHTML = '';
    if (btnNueva) {
        tabsHeader.appendChild(btnNueva);
        btnNueva.addEventListener('click', regresarDePlantilla);
    }
    tabsContent.innerHTML = '';

    if (plantillas.length === 0) {
        tabsContent.innerHTML = '<p style="text-align: center; padding: 20px;">No hay plantillas guardadas.</p>';
        return;
    }

    // Crear tabs para cada plantilla
    plantillas.forEach((plantilla, index) => {
        // Tab button
        const tabBtn = document.createElement('button');
        tabBtn.className = 'tab-btn';
        tabBtn.innerHTML = `<i class="fa-solid fa-file"></i> ${plantilla.nombre_plantilla}`;
        tabBtn.addEventListener('click', () => mostrarContenidoPlantilla(plantilla, index));
        tabsHeader.appendChild(tabBtn);

        // Tab content
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        tabContent.id = `content-${index}`;
        tabContent.style.display = 'none';

        const asignaturas = plantilla.datos_json ? JSON.parse(plantilla.datos_json).asignaturas || [] : [];

        tabContent.innerHTML = `
            <div class="plantilla-info">
                <h3>${plantilla.nombre_plantilla}</h3>
                <p>${plantilla.descripcion || 'Sin descripción'}</p>
                <p><small>Creada: ${new Date(plantilla.fecha_creacion).toLocaleDateString()}</small></p>
                <p><strong>Total de asignaturas:</strong> ${asignaturas.length}</p>

                <div class="plantilla-actions">
                    <button class="btn btn-primary" onclick="cargarPlantilla(${plantilla.id}, '${plantilla.nombre_plantilla}')">
                        <i class="fa-solid fa-eye"></i> Ver Plantilla
                    </button>
                    <button class="btn btn-danger" onclick="eliminarPlantilla(${plantilla.id})">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;

        tabsContent.appendChild(tabContent);
    });
}

function mostrarContenidoPlantilla(plantilla, index) {
    // Ocultar todos los contenidos
    const allContents = document.querySelectorAll('.tab-content');
    allContents.forEach(content => content.style.display = 'none');

    // Desactivar todos los botones
    const allBtns = document.querySelectorAll('.tab-btn');
    allBtns.forEach(btn => btn.classList.remove('active'));

    // Mostrar contenido seleccionado
    const content = document.getElementById(`content-${index}`);
    if (content) {
        content.style.display = 'block';
    }

    // Activar botón seleccionado
    const btns = document.querySelectorAll('.tab-btn');
    if (btns[index + 1]) { // +1 porque el primer botón es "Nueva"
        btns[index + 1].classList.add('active');
    }
}

async function cargarPlantilla(id, nombre) {
    try {
        const response = await fetch(`../../php/planEstudios/cargar_plantilla.php?id=${id}`);
        const data = await response.json();

        if (data.success) {
            // Backup de asignaturas actuales si no estamos ya viendo una plantilla
            if (!viendoPlantilla) {
                asignaturasOriginales = [...asignaturas];
            }

            // Cargar datos de la plantilla
            const datosPlantilla = JSON.parse(data.plantilla.datos_json);
            asignaturas = datosPlantilla.asignaturas || [];
            asignaturasFiltradas = [...asignaturas];

            // Marcar que estamos viendo plantilla
            viendoPlantilla = true;
            nombrePlantillaActual = nombre;
            plantillaActualId = id;

            // Renderizar
            renderizarTabla();

            Swal.fire({
                icon: 'success',
                title: 'Plantilla cargada',
                text: `Viendo plantilla: ${nombre}`,
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'No se pudo cargar la plantilla.'
            });
        }
    } catch (error) {
        console.error('Error al cargar plantilla:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al cargar la plantilla.'
        });
    }
}

function regresarDePlantilla() {
    if (!viendoPlantilla) return;

    // Restaurar asignaturas originales
    asignaturas = [...asignaturasOriginales];
    asignaturasFiltradas = [...asignaturas];
    viendoPlantilla = false;
    nombrePlantillaActual = '';
    plantillaActualId = null;

    // Renderizar
    renderizarTabla();

    // Ocultar todos los contenidos de plantillas
    const allContents = document.querySelectorAll('.tab-content');
    allContents.forEach(content => content.style.display = 'none');

    // Desactivar todos los botones excepto "Nueva"
    const allBtns = document.querySelectorAll('.tab-btn');
    allBtns.forEach((btn, index) => {
        if (index === 0) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function actualizarIndicadorPlantilla() {
    // Crear o actualizar indicador de visualización de plantilla
    let indicador = document.getElementById('indicador-plantilla');

    if (viendoPlantilla) {
        if (!indicador) {
            indicador = document.createElement('div');
            indicador.id = 'indicador-plantilla';
            indicador.style.cssText = 'background: #4CAF50; color: white; padding: 10px; text-align: center; margin: 10px 0; border-radius: 5px;';

            const container = document.querySelector('.plan-display-panel');
            if (container) {
                container.insertBefore(indicador, container.firstChild);
            }
        }
        indicador.innerHTML = `<i class="fa-solid fa-eye"></i> Viendo plantilla: <strong>${nombrePlantillaActual}</strong> | <a href="#" onclick="regresarDePlantilla(); return false;" style="color: white; text-decoration: underline;">Regresar</a>`;
    } else {
        if (indicador) {
            indicador.remove();
        }
    }
}

async function eliminarPlantilla(id) {
    const result = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar plantilla?',
        text: 'Esta acción no se puede deshacer.',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33'
    });

    if (!result.isConfirmed) return;

    try {
        const formData = new FormData();
        formData.append('id', id);

        const response = await fetch('../../php/planEstudios/eliminar_plantilla.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Eliminada',
                text: 'La plantilla se eliminó correctamente.',
                timer: 1500,
                showConfirmButton: false
            });

            await cargarPlantillas();

            // Si era la plantilla actual, regresar a vista normal
            if (plantillaActualId === id) {
                regresarDePlantilla();
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'No se pudo eliminar la plantilla.'
            });
        }
    } catch (error) {
        console.error('Error al eliminar plantilla:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al eliminar la plantilla.'
        });
    }
}

// ====================================
// IMPRIMIR
// ====================================

function imprimirPagina() {
    window.print();
}
