


document.addEventListener('DOMContentLoaded', function() {
    cargarPeriodos();
    cargarPeriodoActivo();
    cargarEstadisticas(null); 
});


function cargarPeriodos() {
    fetch('./php/periodos/get_periodos.php')
        .then(response => response.json())
        .then(periodos => {
            const select = document.getElementById('periodo-select');

            
            select.innerHTML = '<option value disabled selected>Seleccione un período...</option>';

            
            periodos.forEach(periodo => {
                const option = document.createElement('option');
                option.value = periodo.id;
                option.textContent = `${periodo.periodo} ${periodo.año}`;
                select.appendChild(option);
            });

            
            select.addEventListener('change', handlePeriodoChange);
        })
        .catch(error => {
            console.error('Error al cargar períodos:', error);
            mostrarError('Error al cargar los períodos disponibles');
        });
}


function cargarPeriodoActivo() {
    fetch('./php/periodos/get_periodo_activo.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.periodo) {
                
                const select = document.getElementById('periodo-select');
                select.value = data.periodo.id;

                
                actualizarEstadoPeriodo(data.periodo);

                
                cargarEstadisticas(data.periodo.id);
            }
        })
        .catch(error => {
            console.error('Error al cargar período activo:', error);
        });
}


function handlePeriodoChange(event) {
    const periodoId = event.target.value;

    if (!periodoId) {
        
        limpiarPeriodoActivo();
        cargarEstadisticas(null); 
        return;
    }

    
    const selectedOption = event.target.options[event.target.selectedIndex];
    const periodoTexto = selectedOption.textContent;

    
    guardarPeriodoActivo(periodoId, periodoTexto);

    
    cargarEstadisticas(periodoId);
}


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


function mostrarExito(mensaje) {
    
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


function mostrarError(mensaje) {
    
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


function cargarEstadisticas(periodoId) {
    
    let url = './php/periodos/get_estadisticas_periodo.php';
    if (periodoId) {
        url += '?periodo_id=' + periodoId;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                
                actualizarEstadisticasDashboard(data.data);
            } else {
                console.error('Error al cargar estadísticas:', data.message);
            }
        })
        .catch(error => {
            console.error('Error al cargar estadísticas:', error);
        });
}


function actualizarEstadisticasDashboard(data) {
    
    const periodosElement = document.getElementById('total-periodos');
    if (periodosElement) {
        periodosElement.textContent = data.periodos || 0;
    }

    
    const gruposElement = document.getElementById('total-grupos');
    if (gruposElement) {
        gruposElement.textContent = data.grupos || 0;
    }

    
    const docentesElement = document.getElementById('total-docentes');
    if (docentesElement) {
        docentesElement.textContent = data.docentes || 0;
    }

    
    const cargaDocentesElement = document.getElementById('total-carga-docentes');
    if (cargaDocentesElement) {
        cargaDocentesElement.textContent = data.carga_docentes || 0;
    }
}
