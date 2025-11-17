/**
 * Selector de Período Activo
 * Gestiona la selección y visualización del período académico activo
 */

// Cargar períodos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarPeriodos();
    cargarPeriodoActivo();
    cargarEstadisticas(null); // Cargar estadísticas generales al inicio
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
            select.innerHTML = '<option value disabled selected>Seleccione un período...</option>';

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

                // Cargar estadísticas del período activo
                cargarEstadisticas(data.periodo.id);
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
        cargarEstadisticas(null); // Cargar estadísticas generales
        return;
    }

    // Obtener el texto de la opción seleccionada
    const selectedOption = event.target.options[event.target.selectedIndex];
    const periodoTexto = selectedOption.textContent;

    // Guardar el período en la sesión
    guardarPeriodoActivo(periodoId, periodoTexto);

    // Cargar estadísticas del período seleccionado
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

/**
 * Carga las estadísticas según el período seleccionado
 */
function cargarEstadisticas(periodoId) {
    // Construir la URL con o sin periodo_id
    let url = './php/periodos/get_estadisticas_periodo.php';
    if (periodoId) {
        url += '?periodo_id=' + periodoId;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Actualizar los valores en el dashboard
                actualizarEstadisticasDashboard(data.data);
            } else {
                console.error('Error al cargar estadísticas:', data.message);
            }
        })
        .catch(error => {
            console.error('Error al cargar estadísticas:', error);
        });
}

/**
 * Actualiza los valores de las estadísticas en el dashboard
 */
function actualizarEstadisticasDashboard(data) {
    // Actualizar período
    const periodosElement = document.getElementById('total-periodos');
    if (periodosElement) {
        periodosElement.textContent = data.periodos || 0;
    }

    // Actualizar grupos
    const gruposElement = document.getElementById('total-grupos');
    if (gruposElement) {
        gruposElement.textContent = data.grupos || 0;
    }

    // Actualizar docentes
    const docentesElement = document.getElementById('total-docentes');
    if (docentesElement) {
        docentesElement.textContent = data.docentes || 0;
    }
}
