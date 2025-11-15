/**
 * Selector de Período Activo
 * Gestiona la selección y visualización del período académico activo
 */

// Cargar períodos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarPeriodos();
    cargarPeriodoActivo();
    cargarEstadisticas(); // Cargar estadísticas iniciales
});

/**
 * Carga todos los períodos disponibles desde la base de datos
 */
function cargarPeriodos() {
    fetch('./php/periodos/get_periodos.php')
        .then(response => response.json())
        .then(periodos => {
            const select = document.getElementById('periodo-select');

            // Limpiar opciones existentes (excepto la primera)
            select.innerHTML = '<option value="">Seleccione un período...</option>';

            // Agregar cada período como opción
            periodos.forEach(periodo => {
                const option = document.createElement('option');
                option.value = periodo.id;
                option.textContent = `${periodo.periodo} ${periodo.año}`;
                select.appendChild(option);
            });

            // Agregar evento de cambio
            select.addEventListener('change', handlePeriodoChange);
        })
        .catch(error => {
            console.error('Error al cargar períodos:', error);
            mostrarError('Error al cargar los períodos disponibles');
        });
}

/**
 * Carga el período activo desde la sesión
 */
function cargarPeriodoActivo() {
    fetch('./php/periodos/get_periodo_activo.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.periodo) {
                // Establecer el período en el select
                const select = document.getElementById('periodo-select');
                select.value = data.periodo.id;

                // Actualizar el estado visual
                actualizarEstadoPeriodo(data.periodo);
            }
        })
        .catch(error => {
            console.error('Error al cargar período activo:', error);
        });
}

/**
 * Maneja el cambio de período en el selector
 */
function handlePeriodoChange(event) {
    const periodoId = event.target.value;

    if (!periodoId) {
        // Si no hay período seleccionado, limpiar la sesión
        limpiarPeriodoActivo();
        // Cargar estadísticas sin filtro de periodo
        cargarEstadisticas();
        return;
    }

    // Obtener el texto de la opción seleccionada
    const selectedOption = event.target.options[event.target.selectedIndex];
    const periodoTexto = selectedOption.textContent;

    // Guardar el período en la sesión
    guardarPeriodoActivo(periodoId, periodoTexto);

    // Actualizar estadísticas con el nuevo periodo
    cargarEstadisticas(periodoId);
}

/**
 * Guarda el período activo en la sesión
 */
function guardarPeriodoActivo(periodoId, periodoTexto) {
    fetch('./php/periodos/set_periodo_activo.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            periodo_id: periodoId,
            periodo_texto: periodoTexto
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            actualizarEstadoPeriodo({
                id: periodoId,
                texto: periodoTexto
            });

            // Mostrar notificación de éxito (opcional)
            mostrarExito('Período activo actualizado correctamente');
        } else {
            mostrarError('Error al guardar el período activo');
        }
    })
    .catch(error => {
        console.error('Error al guardar período activo:', error);
        mostrarError('Error de conexión al guardar el período');
    });
}

/**
 * Limpia el período activo de la sesión
 */
function limpiarPeriodoActivo() {
    fetch('./php/periodos/clear_periodo_activo.php', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            actualizarEstadoPeriodo(null);
        }
    })
    .catch(error => {
        console.error('Error al limpiar período activo:', error);
    });
}

/**
 * Actualiza el estado visual del período
 */
function actualizarEstadoPeriodo(periodo) {
    const statusDiv = document.getElementById('periodo-status');
    const statusText = document.getElementById('periodo-status-text');

    if (periodo) {
        statusDiv.classList.add('activo');
        statusText.textContent = periodo.texto || `Período ${periodo.id} activo`;
    } else {
        statusDiv.classList.remove('activo');
        statusText.textContent = 'Sin período seleccionado';
    }
}

/**
 * Carga las estadísticas del periodo seleccionado
 */
function cargarEstadisticas(periodoId = null) {
    // Si no se proporciona periodoId, intentar obtener el periodo activo
    if (!periodoId) {
        const select = document.getElementById('periodo-select');
        periodoId = select ? select.value : null;
    }

    // Construir URL con parámetro opcional
    const url = periodoId
        ? `./php/periodos/get_estadisticas_periodo.php?periodo_id=${periodoId}`
        : './php/periodos/get_estadisticas_periodo.php';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.estadisticas) {
                actualizarTarjetasEstadisticas(data.estadisticas);
            } else {
                console.error('Error al cargar estadísticas:', data.message);
            }
        })
        .catch(error => {
            console.error('Error al cargar estadísticas:', error);
        });
}

/**
 * Actualiza las tarjetas de estadísticas en el dashboard
 */
function actualizarTarjetasEstadisticas(estadisticas) {
    // Actualizar cada tarjeta con los datos obtenidos
    if (estadisticas.periodos_activos !== undefined) {
        const elem = document.getElementById('stat-periodos');
        if (elem) elem.textContent = estadisticas.periodos_activos;
    }

    if (estadisticas.grupos_registrados !== undefined) {
        const elem = document.getElementById('stat-grupos');
        if (elem) elem.textContent = estadisticas.grupos_registrados;
    }

    if (estadisticas.horas_tutoria !== undefined) {
        const elem = document.getElementById('stat-tutoria');
        if (elem) elem.textContent = estadisticas.horas_tutoria;
    }

    if (estadisticas.plan_estudios !== undefined) {
        const elem = document.getElementById('stat-plan');
        if (elem) elem.textContent = estadisticas.plan_estudios;
    }

    if (estadisticas.docentes_registrados !== undefined) {
        const elem = document.getElementById('stat-docentes');
        if (elem) elem.textContent = estadisticas.docentes_registrados;
    }

    if (estadisticas.reportes_generados !== undefined) {
        const elem = document.getElementById('stat-reportes');
        if (elem) elem.textContent = estadisticas.reportes_generados;
    }

    if (estadisticas.cartas_emitidas !== undefined) {
        const elem = document.getElementById('stat-cartas');
        if (elem) elem.textContent = estadisticas.cartas_emitidas;
    }

    if (estadisticas.asignaciones_carga !== undefined) {
        const elem = document.getElementById('stat-carga');
        if (elem) elem.textContent = estadisticas.asignaciones_carga;
    }
}

/**
 * Muestra un mensaje de éxito
 */
function mostrarExito(mensaje) {
    // Si tienes SweetAlert2 disponible, úsalo
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: mensaje,
            timer: 2000,
            showConfirmButton: false
        });
    } else {
        console.log('✓', mensaje);
    }
}

/**
 * Muestra un mensaje de error
 */
function mostrarError(mensaje) {
    // Si tienes SweetAlert2 disponible, úsalo
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensaje,
            confirmButtonText: 'OK'
        });
    } else {
        console.error('✗', mensaje);
        alert(mensaje);
    }
}
