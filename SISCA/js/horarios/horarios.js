document.addEventListener('DOMContentLoaded', function () {
    
    const form = document.getElementById('horariosForm');
    const periodoSelect = document.getElementById('periodo');
    const fileInput = document.getElementById('file-input');
    const fileLabel = document.querySelector('.file-label');
    const fileListContainer = document.getElementById('file-list');
    const savePdfBtn = document.getElementById('save-pdf-btn');
    const limpiarBtn = document.getElementById('btnLimpiar');
    const pdfList = document.getElementById('pdf-list');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const pdfViewer = document.getElementById('pdf-viewer');
    const pdfPreview = document.getElementById('pdf-preview');
    const downloadBtn = document.getElementById('download-btn');
    const closeBtn = document.getElementById('close-btn');

    let selectedFiles = [];
    let currentPeriodoId = null;
    let allHorarios = [];

    
    function cargarPeriodos() {
        fetch('../../php/periodos/get_periodos.php')
            .then(res => {
                if (!res.ok) throw new Error('Error al cargar períodos');
                return res.json();
            })
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) {
                    mostrarAlerta('No hay períodos disponibles', 'warning');
                    return;
                }

                periodoSelect.innerHTML = '<option value="" disabled selected>Selecciona un período</option>';
                data.forEach(periodo => {
                    const option = document.createElement('option');
                    option.value = periodo.id;
                    option.textContent = `${periodo.periodo} (${periodo.año})`;
                    option.dataset.periodo = periodo.periodo;
                    option.dataset.año = periodo.año;
                    periodoSelect.appendChild(option);
                });
            })
            .catch(err => {
                console.error('Error:', err);
                mostrarAlerta('Error al cargar los períodos', 'error');
            });
    }

    
    periodoSelect.addEventListener('change', function () {
        currentPeriodoId = parseInt(this.value);
        if (currentPeriodoId) {
            cargarHorarios(currentPeriodoId);
            savePdfBtn.style.display = 'inline-flex';
        } else {
            savePdfBtn.style.display = 'none';
            pdfList.innerHTML = '';
            allHorarios = [];
        }
    });

    
    const dropZone = document.querySelector('.file-upload-container');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    
    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (!currentPeriodoId) {
            mostrarAlerta('Por favor, selecciona un período primero', 'warning');
            return;
        }

        selectedFiles = [];
        const validFiles = [];

        for (let file of files) {
            
            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                mostrarAlerta(`${file.name} no es un archivo PDF válido`, 'error');
                continue;
            }

            
            if (file.size > 50 * 1024 * 1024) {
                mostrarAlerta(`${file.name} excede el tamaño máximo (50MB)`, 'error');
                continue;
            }

            validFiles.push(file);
        }

        selectedFiles = validFiles;
        mostrarArchivosSeleccionados();
    }

    function mostrarArchivosSeleccionados() {
        fileListContainer.innerHTML = '';

        if (selectedFiles.length === 0) {
            fileListContainer.innerHTML = '<p class="no-files">No hay archivos seleccionados</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'file-items';

        selectedFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = 'file-item';
            
            const tamaño = (file.size / 1024 / 1024).toFixed(2);
            
            li.innerHTML = `
                <div class="file-info">
                    <i class="fa-solid fa-file-pdf"></i>
                    <div class="file-details">
                        <span class="file-name">${file.name}</span>
                        <small>${tamaño} MB</small>
                    </div>
                </div>
                <button type="button" class="btn-remove-file" data-index="${index}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            
            li.querySelector('.btn-remove-file').addEventListener('click', () => {
                selectedFiles.splice(index, 1);
                mostrarArchivosSeleccionados();
            });

            ul.appendChild(li);
        });

        fileListContainer.innerHTML = '';
        fileListContainer.appendChild(ul);
    }

    
    savePdfBtn.addEventListener('click', async function () {
        if (selectedFiles.length === 0) {
            mostrarAlerta('Selecciona al menos un archivo PDF', 'warning');
            return;
        }

        if (!currentPeriodoId) {
            mostrarAlerta('Selecciona un período', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('periodo_id', currentPeriodoId);

        selectedFiles.forEach(file => {
            formData.append('files[]', file);
        });

        
        savePdfBtn.disabled = true;
        savePdfBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

        try {
            const response = await fetch('../../php/horarios/guardar_horarios.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                mostrarAlerta(
                    `✓ Se guardaron ${data.total_guardados} de ${data.total_intentos} archivos`,
                    'success'
                );
                selectedFiles = [];
                fileInput.value = '';
                mostrarArchivosSeleccionados();
                cargarHorarios(currentPeriodoId);
            } else {
                mostrarAlerta(data.message || 'Error al guardar archivos', 'error');
            }

            if (data.errores && data.errores.length > 0) {
                console.warn('Errores en carga:', data.errores);
            }
        } catch (err) {
            console.error('Error:', err);
            mostrarAlerta('Error al procesar la solicitud', 'error');
        } finally {
            savePdfBtn.disabled = false;
            savePdfBtn.innerHTML = '<i class="fa-solid fa-save"></i> Guardar PDF';
        }
    });

    
    function cargarHorarios(periodoId) {
        fetch(`../../php/horarios/obtener_horarios.php?periodo_id=${periodoId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    allHorarios = data.horarios;
                    mostrarHorarios(allHorarios);
                } else {
                    console.warn(data.message);
                    pdfList.innerHTML = '<li class="empty-state">No hay horarios para este período</li>';
                }
            })
            .catch(err => {
                console.error('Error:', err);
                mostrarAlerta('Error al cargar horarios', 'error');
            });
    }

    function mostrarHorarios(horarios) {
        pdfList.innerHTML = '';

        if (horarios.length === 0) {
            pdfList.innerHTML = '<li class="empty-state">No hay archivos PDF guardados</li>';
            return;
        }

        horarios.forEach(horario => {
            const li = document.createElement('li');
            li.className = 'pdf-item';
            li.innerHTML = `
                <div class="pdf-info">
                    <i class="fa-solid fa-file-pdf"></i>
                    <div class="pdf-details">
                        <h4 class="pdf-name">${horario.nombre}</h4>
                        <small class="pdf-meta">
                            ${horario.tamaño_formato} • ${formatearFecha(horario.fecha_carga)}
                        </small>
                    </div>
                </div>
                <div class="pdf-actions">
                    <button class="btn-view" data-id="${horario.id}" data-ruta="${horario.ruta}" title="Ver">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-download" data-id="${horario.id}" data-ruta="${horario.ruta}" data-nombre="${horario.nombre}" title="Descargar">
                        <i class="fa-solid fa-download"></i>
                    </button>
                    <button class="btn-delete" data-id="${horario.id}" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;

            
            li.querySelector('.btn-view').addEventListener('click', () => verPDF(horario.ruta, horario.nombre));
            li.querySelector('.btn-download').addEventListener('click', () => descargarPDF(horario.ruta, horario.nombre));
            li.querySelector('.btn-delete').addEventListener('click', () => eliminarHorario(horario.id));

            pdfList.appendChild(li);
        });
    }

    
    function verPDF(ruta, nombre) {
        pdfPreview.src = ruta;
        pdfViewer.style.display = 'flex';
        
        
        downloadBtn.style.display = 'inline-flex';
        downloadBtn.onclick = () => descargarPDF(ruta, nombre);
    }

    
    function descargarPDF(ruta, nombre) {
        const link = document.createElement('a');
        link.href = ruta;
        link.download = nombre;
        link.click();
    }

    
    function eliminarHorario(id) {
        Swal.fire({
            title: '¿Eliminar horario?',
            text: 'Esta acción no se puede deshacer. El horario será eliminado permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#78B543',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                fetch('../../php/horarios/eliminar_horarios.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        mostrarAlerta('El horario se eliminó correctamente.', 'success');
                        cargarHorarios(currentPeriodoId);
                    } else {
                        mostrarAlerta(data.message || 'Ocurrió un error al eliminar el horario.', 'error');
                    }
                })
                .catch(err => {
                    console.error('Error:', err);
                    mostrarAlerta('No se pudo eliminar el horario. Inténtalo más tarde.', 'error');
                });
            }
        });
    }


    
    searchInput.addEventListener('input', function () {
        const termino = this.value.trim().toLowerCase();
        
        if (termino === '') {
            mostrarHorarios(allHorarios);
            clearSearchBtn.style.display = 'none';
            return;
        }

        clearSearchBtn.style.display = 'block';

        const filtrados = allHorarios.filter(h => 
            h.nombre.toLowerCase().includes(termino)
        );

        mostrarHorarios(filtrados);
    });

    clearSearchBtn.addEventListener('click', function () {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        mostrarHorarios(allHorarios);
    });

    
    closeBtn.addEventListener('click', function () {
        pdfViewer.style.display = 'none';
        pdfPreview.src = '';
    });

    
    limpiarBtn.addEventListener('click', function () {
        fileInput.value = '';
        selectedFiles = [];
        mostrarArchivosSeleccionados();
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
    });

    
    function formatearFecha(fecha) {
        const date = new Date(fecha);
        const opciones = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('es-ES', opciones);
    }

    function mostrarAlerta(mensaje, tipo) {
        Swal.fire({
            title: tipo === 'success' ? '¡Éxito!' : tipo === 'warning' ? 'Atención' : 'Error',
            text: mensaje,
            icon: tipo,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
        });
    }

    cargarPeriodos();
});