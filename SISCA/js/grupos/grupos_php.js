// ============================================
// CARGAR PROGRAMAS DESDE BASE DE DATOS
// ============================================
function cargarProgramasDesdeDB() {
    return fetch('../../php/grupos/obtener_programas.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                return data.data;
            } else {
                console.error('Error al cargar programas educativos:', data.message);
                return null;
            }
        })
        .catch(error => {
            console.error('Error al cargar programas educativos:', error);
            return null;
        });
}

// ============================================
// VERIFICAR LETRA DE GRUPO
// ============================================
function verificarLetraGrupo(generacion, programa, grado, turno, codigoBase) {
    const grupoGenerado = document.getElementById('grupoGenerado');
    
    fetch(`../../php/grupos/verificar_letra.php?generacion=${generacion}&programa=${programa}&grado=${grado}&turno=${turno}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let codigoCompleto = codigoBase;
                if (data.letra) {
                    codigoCompleto = codigoBase + data.letra + turno;
                    grupoGenerado.style.color = '#ff9800';
                } else {
                    codigoCompleto = codigoBase + turno;
                    grupoGenerado.style.color = 'var(--verde-dark)';
                }
                grupoGenerado.value = codigoCompleto;
            } else {
                grupoGenerado.value = codigoBase + turno;
                grupoGenerado.style.color = 'var(--verde-dark)';
            }
        })
        .catch(error => {
            console.error('Error al verificar letra:', error);
            grupoGenerado.value = codigoBase + turno;
            grupoGenerado.style.color = 'var(--verde-dark)';
        });
}

// ============================================
// GUARDAR GRUPO
// ============================================
function guardarGrupo() {
    // Validar que haya periodo activo
    if (!validarPeriodoActivo('guardar un grupo')) {
        return;
    }

    const formData = new FormData();
    formData.append('generacion', document.getElementById('generacion').value.trim());
    formData.append('nivel', document.getElementById('nivel').value);
    formData.append('programa', document.getElementById('programa').value);
    formData.append('grado', document.getElementById('grado').value.trim());
    formData.append('periodo_id', obtenerPeriodoActivoId());

    const turnoSeleccionado = document.querySelector('input[name="turno"]:checked');
    formData.append('turno', turnoSeleccionado ? turnoSeleccionado.value : 'M');

    fetch('../../php/grupos/guardar_grupo.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                limpiarFormulario();
                resetearPaginacion();
                cargarGrupos();
            } else {
                console.error('Error al guardar:', data.message);
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error al guardar grupo:', error);
            alert('Error al guardar el grupo');
        });
}

// ============================================
// CARGAR GRUPOS
// ============================================
function cargarGrupos() {
    const estado = mostrandoInactivos ? 'inactivo' : 'activo';
    
    fetch(`../../php/grupos/obtener_grupos.php?estado=${estado}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarGrupos(data.data);
            } else {
                console.error('Error al cargar grupos:', data.message);
            }
        })
        .catch(error => {
            console.error('Error al cargar grupos:', error);
        });
}

// ============================================
// EDITAR GRUPO
// ============================================
function editarGrupo(id) {
    const estado = mostrandoInactivos ? 'inactivo' : 'activo';
    
    fetch(`../../php/grupos/obtener_grupos.php?estado=${estado}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const grupo = data.data.find(g => g.id == id);
                if (grupo) {
                    llenarFormularioEdicion(grupo);
                } else {
                    console.error('Grupo no encontrado con ID:', id);
                    alert('No se encontró el grupo');
                }
            } else {
                console.error('Error al cargar datos:', data.message);
                alert('Error al cargar datos del grupo');
            }
        })
        .catch(error => {
            console.error('Error al editar grupo:', error);
            alert('Error al cargar los datos del grupo');
        });
}

// ============================================
// ACTUALIZAR GRUPO
// ============================================
function actualizarGrupo() {
    // Validar que haya periodo activo
    if (!validarPeriodoActivo('actualizar un grupo')) {
        return;
    }

    const formData = new FormData();
    formData.append('id', idGrupoEditando);
    formData.append('generacion', document.getElementById('generacion').value.trim());
    formData.append('nivel', document.getElementById('nivel').value);
    formData.append('programa', document.getElementById('programa').value);
    formData.append('grado', document.getElementById('grado').value.trim());
    formData.append('periodo_id', obtenerPeriodoActivoId());

    const turnoSeleccionado = document.querySelector('input[name="turno"]:checked');
    formData.append('turno', turnoSeleccionado ? turnoSeleccionado.value : 'M');

    fetch('../../php/grupos/editar_grupo.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                cancelarEdicion();
                cargarGrupos();
            } else {
                console.error('Error al actualizar:', data.message);
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error al actualizar grupo:', error);
            alert('Error al actualizar el grupo');
        });
}

// ============================================
// DAR DE BAJA GRUPO
// ============================================
function bajaGrupo(id) {
    if (!confirm('¿Estás seguro de dar de baja este grupo?')) return;

    fetch('../../php/grupos/baja_grupo.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, estado: 'inactivo' })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                cargarGrupos();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error al dar de baja grupo:', error);
            alert('Error al dar de baja el grupo');
        });
}

// ============================================
// DAR DE ALTA GRUPO
// ============================================
function altaGrupo(id) {
    if (!confirm('¿Estás seguro de dar de alta este grupo?')) return;

    fetch('../../php/grupos/baja_grupo.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, estado: 'activo' })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                cargarGrupos();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error al dar de alta grupo:', error);
            alert('Error al dar de alta el grupo');
        });
}

// ============================================
// ELIMINAR GRUPO DEFINITIVAMENTE
// ============================================
function eliminarGrupo(id) {
    if (!confirm('ADVERTENCIA: Esta acción eliminará el grupo permanentemente. ¿Estás completamente seguro?')) return;

    const formData = new FormData();
    formData.append('id', id);
    
    fetch('../../php/grupos/eliminar_grupo.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                cargarGrupos();
            } else {
                console.error('Error al eliminar:', data.message);
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error al eliminar grupo:', error);
            alert('Error al eliminar el grupo');
        });
}