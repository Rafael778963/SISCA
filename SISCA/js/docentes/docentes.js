


let paginaActual = 1;
let docenteEditando = null;
let filtrosActivos = {};
let mostrandoInactivos = false;
let totalRegistros = 0;




document.addEventListener('DOMContentLoaded', async () => {
    await inicializarPeriodoManager();

    
    if (!hayPeriodoActivo()) {
        Swal.fire({
            icon: 'warning',
            title: 'Periodo no seleccionado',
            html: `
                <p>Debes seleccionar un periodo activo antes de cargar el módulo de Docentes.</p>
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

    cargarDocentes();
    inicializarFormulario();
    inicializarRegimenCheckboxes();
});

function inicializarFormulario() {
    const form = document.querySelector('.docentes-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await guardarDocente();
    });
}

function inicializarRegimenCheckboxes() {
    const checkboxes = document.querySelectorAll('input[name="regimen"]');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const seleccionados = Array.from(checkboxes).filter(cb => cb.checked);

            
            if (seleccionados.length > 2) {
                this.checked = false;
                Swal.fire({
                    html: `
                <div style="color: #856404;">
                    <p>Solo puedes seleccionar un máximo de 2 regímenes</p>
                </div>
            `,
                    icon: 'warning',
                    confirmButtonColor: '#ffc107',
                    confirmButtonText: 'Entendido'
                });
                return;
            }
        });
    });
}




function obtenerRegimenSeleccionado() {
    const checkboxes = document.querySelectorAll('input[name="regimen"]:checked');
    const regimenes = Array.from(checkboxes).map(cb => cb.value);

    if (regimenes.length === 0) {
        return '';
    }

    
    regimenes.sort();

    return regimenes.join('/');
}

function establecerRegimenEnFormulario(regimen) {
    
    document.querySelectorAll('input[name="regimen"]').forEach(cb => {
        cb.checked = false;
    });

    if (!regimen) return;

    
    const regimenes = regimen.split('/');

    regimenes.forEach(reg => {
        const checkbox = document.querySelector(`input[name="regimen"][value="${reg.trim()}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}




async function guardarDocente() {
    
    if (!validarPeriodoActivo('guardar un docente')) {
        return;
    }

    const nombreDocente = document.getElementById('nombreDocente').value.trim();
    const turno = document.getElementById('turno').value;
    const regimen = obtenerRegimenSeleccionado();

    if (!nombreDocente || !turno || !regimen) {
        Swal.fire({
            title: 'CAMPOS INCOMPLETOS',
            html: `
                <div style="color: #856404;">
                    <p>Por favor completa todos los campos requeridos</p>
                </div>
            `,
            icon: 'warning',
            confirmButtonColor: '#ffc107',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    const data = {
        nombre_docente: nombreDocente,
        turno,
        regimen,
        periodo_id: obtenerPeriodoActivoId()
    };

    let resultado;
    if (docenteEditando !== null) {
        data.id = docenteEditando;
        resultado = await DocentesAPI.editar(data);
    } else {
        resultado = await DocentesAPI.crear(data);
    }

    if (resultado.success) {
        Swal.fire({
            title: 'REGISTRO EXITOSO',
            html: `
                <div style="color: #155724;">
                    <p>${resultado.message}</p>
                </div>
            `,
            icon: 'success',
            confirmButtonColor: '#78B543',
            confirmButtonText: 'Aceptar',
            timer: 2000,
            timerProgressBar: true
        });
        limpiarFormulario();
        cargarDocentes(paginaActual);
    } else {
        Swal.fire({
            title: 'ERROR',
            html: `
                <div style="color: #721c24;">
                    <p>${resultado.message}</p>
                </div>
            `,
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Cerrar'
        });
    }
}




async function editarDocente(id) {
    const tbody = document.querySelector('.docentes-table tbody');
    const filas = tbody.querySelectorAll('tr');
    let docenteEncontrado = false;

    
    filas.forEach(fila => {
        const btnEditar = fila.querySelector(`button[onclick="editarDocente(${id})"]`);
        if (btnEditar) {
            const celdas = fila.querySelectorAll('td');
            if (celdas.length >= 3) {
                document.getElementById('nombreDocente').value = celdas[0].textContent;
                document.getElementById('turno').value = celdas[1].textContent;
                establecerRegimenEnFormulario(celdas[2].textContent);
                docenteEditando = id;

                actualizarBotonFormulario('Actualizar');
                docenteEncontrado = true;
            }
        }
    });

    
    if (!docenteEncontrado) {
        const filtrosConEstado = {
            estado: mostrandoInactivos ? 'inactivo' : 'activo'
        };

        const resultado = await DocentesAPI.obtener(filtrosConEstado, 1);
        if (resultado.success) {
            const docente = resultado.data.find(d => d.id === id);
            if (docente) {
                document.getElementById('nombreDocente').value = docente.nombre_docente;
                document.getElementById('turno').value = docente.turno;
                establecerRegimenEnFormulario(docente.regimen);
                docenteEditando = id;

                actualizarBotonFormulario('Actualizar');
            }
        }
    }
}




async function bajaDocente(id) {
    const { value: confirmar } = await Swal.fire({
        title: 'CONFIRMAR BAJA',
        html: `
            <div style="color: #856404;">
                <p>¿Estás seguro de dar de baja a este docente?</p>
                <p style="font-size: 0.9em; margin-top: 10px;">El docente pasará a estado inactivo</p>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'SÍ, DAR DE BAJA',
        cancelButtonText: 'CANCELAR'
        
    });

    if (!confirmar) return;

    const resultado = await DocentesAPI.cambiarEstado(id, 'inactivo');
    if (resultado.success) {
        Swal.fire({
            title: 'BAJA EXITOSA',
            html: `
                <div style="color: #155724;">
                    <p>${resultado.message}</p>
                </div>
            `,
            icon: 'success',
            confirmButtonColor: '#78B543',
            confirmButtonText: 'Aceptar',
            timer: 2000,
            timerProgressBar: true
        });
        cargarDocentes(paginaActual);
    } else {
        Swal.fire({
            title: 'ERROR',
            html: `
                <div style="color: #721c24;">
                    <p>${resultado.message}</p>
                </div>
            `,
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Cerrar'
        });
    }
}

async function altaDocente(id) {
    const { value: confirmar } = await Swal.fire({
        title: 'CONFIRMAR ALTA',
        html: `
            <div style="color: #004085;">
                <p>¿Estás seguro de dar de alta a este docente?</p>
                <p style="font-size: 0.9em; margin-top: 10px;">El docente pasará a estado activo</p>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#78B543',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'SÍ, DAR DE ALTA',
        cancelButtonText: 'CANCELAR'
    });

    if (!confirmar) return;

    const resultado = await DocentesAPI.cambiarEstado(id, 'activo');
    if (resultado.success) {
        Swal.fire({
            title: 'ALTA EXITOSA',
            html: `
                <div style="color: #155724;">
                    <p>${resultado.message}</p>
                </div>
            `,
            icon: 'success',
            confirmButtonColor: '#78B543',
            confirmButtonText: 'Aceptar',
            timer: 2000,
            timerProgressBar: true
        });
        cargarDocentes(paginaActual);
    } else {
        Swal.fire({
            title: 'ERROR',
            html: `
                <div style="color: #721c24;">
                    <p>${resultado.message}</p>
                </div>
            `,
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Cerrar'
        });
    }
}




function eliminarDocente(id) {
    Swal.fire({
        title: 'ELIMINACIÓN PERMANENTE',
        html: `
            <div style="color: #d33;">
                <p><strong>Acción irreversible</strong></p>
                <br>
                <p>El docente será eliminado permanentemente del sistema y se perderán todos sus datos.</p>
            </div>
        `,
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'CONFIRMAR ELIMINACIÓN',
        cancelButtonText: 'CANCELAR',
        backdrop: `
            rgba(220, 53, 69, 0.05)
            left top
            no-repeat
        `
    }).then(result => {
        if (result.isConfirmed) {
            fetch('../../php/docentes/eliminar_docente.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `id=${encodeURIComponent(id)}`
            })
                .then(res => res.json())
                .then(data => {
                    const alertConfig = data.success ? {
                        title: 'Eliminación completada',
                        text: data.message,
                        icon: 'success',
                        confirmButtonColor: '#78B543'
                    } : {
                        title: 'Error',
                        text: data.message,
                        icon: 'error',
                        confirmButtonColor: '#d33'
                    };

                    Swal.fire(alertConfig);
                    if (data.success) cargarDocentes();
                })
                .catch(err => {
                    Swal.fire({
                        title: 'Error',
                        text: 'Ocurrió un error al eliminar',
                        icon: 'error',
                        confirmButtonColor: '#d33'
                    });
                    console.error(err);
                });
        }
    });
}




async function cargarDocentes(page = 1) {
    paginaActual = page;

    const filtrosConEstado = {
        ...filtrosActivos,
        estado: mostrandoInactivos ? 'inactivo' : 'activo',
        periodo_id: obtenerPeriodoActivoId()
    };

    const resultado = await DocentesAPI.obtener(filtrosConEstado, page);

    if (resultado.success) {
        totalRegistros = resultado.total;
        mostrarDocentes(resultado.data);
        actualizarPaginacion(resultado.totalPages);
    } else {
        console.error('Error al cargar docentes:', resultado.message);
    }
}




function mostrarDocentes(docentes) {
    const tbody = document.querySelector('.docentes-table tbody');

    if (docentes.length === 0) {
        const mensaje = mostrandoInactivos ? 'No hay docentes inactivos' : 'No hay docentes registrados';
        tbody.innerHTML = `<tr><td colspan="4" class="empty-message"><i class="fa-solid fa-inbox"></i> ${mensaje}</td></tr>`;
        return;
    }

    tbody.innerHTML = docentes.map(d => generarFilaDocente(d)).join('');
}

function generarFilaDocente(docente) {
    const botonesAccion = docente.estado === 'activo'
        ? `
            <button onclick="editarDocente(${docente.id})" class="btn-edit" title="Editar">
                <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button onclick="bajaDocente(${docente.id})" class="btn-delete" title="Dar de baja">
                <i class="fa-solid fa-user-slash"></i>
            </button>
          `
        : `
            <button onclick="altaDocente(${docente.id})" class="btn-success" title="Dar de alta">
                <i class="fa-solid fa-user-check"></i>
            </button>
            <button onclick="eliminarDocente(${docente.id})" class="btn-delete" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
            </button>
          `;

    
    let clasesTurno = 'turno-badge';
    const turnoLower = docente.turno.toLowerCase();
    
    if (turnoLower === 'nocturno') {
        clasesTurno += ' nocturno';
    } else if (turnoLower === 'matutino') {
        clasesTurno += ' matutino';
    } else if (turnoLower === 'matutino/nocturno') {
        clasesTurno += ' mixto';
    }

    return `
        <tr>
            <td>${docente.nombre_docente}</td>
            <td style="text-align: center !important"><span class="${clasesTurno}">${docente.turno}</span></td>
            <td style="text-align: center !important">${docente.regimen}</td>
            <td class="action-buttons">${botonesAccion}</td>
        </tr>
    `;
}




function actualizarPaginacion(totalPaginas) {
    const paginacionDiv = document.getElementById('paginacion');

    if (totalPaginas <= 1) {
        paginacionDiv.style.display = 'none';
        return;
    }

    paginacionDiv.style.display = 'flex';
    paginacionDiv.innerHTML = generarHTMLPaginacion(totalPaginas);
}

function generarHTMLPaginacion(totalPaginas) {
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

    
    const registrosPorPagina = 10;
    const inicio = (paginaActual - 1) * registrosPorPagina + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, totalRegistros);
    html += `<span class="pag-info">Mostrando ${inicio}-${fin} de ${totalRegistros}</span>`;

    return html;
}

function cambiarPagina(nuevaPagina) {
    const registrosPorPagina = 10;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;

    cargarDocentes(nuevaPagina);

    
    document.querySelector('.docentes-table-panel').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function resetearPaginacion() {
    paginaActual = 1;
    totalRegistros = 0;
}




function limpiarFormulario() {
    document.querySelector('.docentes-form').reset();
    docenteEditando = null;
    actualizarBotonFormulario('Guardar/Actualizar');

    
    document.getElementById('turno').selectedIndex = 0;

    
    document.querySelectorAll('input[name="regimen"]').forEach(cb => {
        cb.checked = false;
    });
}

function actualizarBotonFormulario(texto) {
    const btnSubmit = document.querySelector('.btn-primary');
    btnSubmit.innerHTML = `<i class="fa-solid fa-save"></i> ${texto}`;
}