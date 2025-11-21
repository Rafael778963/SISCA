document.addEventListener('DOMContentLoaded', function () {
    // ==================== VARIABLES GLOBALES ====================
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const periodoFilter = document.getElementById('periodoFilter');
    const sortBtns = document.querySelectorAll('.sort-btn');
    const reloadBtn = document.getElementById('reloadBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    
    const pdfGrid = document.getElementById('pdfGrid');
    const pdfList = document.getElementById('pdfList');
    const pdfGridContainer = document.getElementById('pdfGridContainer');
    const pdfListContainer = document.getElementById('pdfListContainer');
    const emptyState = document.getElementById('emptyState');
    const pdfViewerModal = document.getElementById('pdfViewerModal');
    const closeViewerBtn = document.getElementById('closeViewerBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const printBtn = document.getElementById('printBtn');
    const pdfPreview = document.getElementById('pdfPreview');
    const viewerTitle = document.getElementById('viewerTitle');
    
    const totalPdfsSpan = document.getElementById('total-pdfs');
    const totalSizeSpan = document.getElementById('total-size');
    const resultsCount = document.getElementById('resultsCount');
    const totalCount = document.getElementById('totalCount');
    const alertContainer = document.getElementById('alertContainer');
    
    // Paginación
    const paginationContainer = document.getElementById('paginationContainer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');

    let allPdfs = [];
    let filteredPdfs = [];
    let currentSort = 'nombre';
    let currentView = 'grid';
    let currentPdfUrl = '';
    let currentPdfName = '';
    
    // Variables de paginación
    const itemsPerPage = 16;  
    let currentPage = 1;
    let totalPages = 1;
    let paginatedPdfs = [];

    // ==================== CARGAR TODOS LOS PDFs ====================
    function cargarTodosPdfs() {
        fetch('../../php/prefectura/obtener_todos_horarios.php')
            .then(res => {
                if (!res.ok) throw new Error('Error al cargar PDFs');
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    allPdfs = data.horarios || [];
                    
                    // Asegurarse de que los datos tienen las propiedades necesarias
                    allPdfs = allPdfs.map(pdf => ({
                        ...pdf,
                        tamaño: pdf.tamaño || pdf.size || 0,
                        fecha_carga: pdf.fecha_carga || pdf.fecha || new Date().toISOString(),
                        periodo: pdf.periodo || 'Sin período'
                    }));
                    
                    actualizarEstadisticas();
                    aplicarFiltrosYOrdenamiento();
                    mostrarAlerta('Datos cargados correctamente', 'success', 2000);
                } else {
                    mostrarAlerta(data.message || 'Error al cargar PDFs', 'error');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                mostrarAlerta('Error al conectar con el servidor', 'error');
            });
    }

    // ==================== ACTUALIZAR ESTADÍSTICAS ====================
    function actualizarEstadisticas() {
        const total = allPdfs.length;
        // Sumar todos los tamaños en bytes
        const tamañoTotal = allPdfs.reduce((sum, pdf) => {
            const size = parseFloat(pdf.tamaño) || 0;
            return sum + size;
        }, 0);
        
        // Convertir a MB
        const tamañoMb = (tamañoTotal / 1024 / 1024).toFixed(2);

        totalPdfsSpan.textContent = total;
        totalSizeSpan.textContent = tamañoMb;
    }

    // ==================== CALCULAR PAGINACIÓN ====================
    function calcularPaginacion() {
        totalPages = Math.ceil(filteredPdfs.length / itemsPerPage);
        
        // Si estamos en una página que ya no existe, volver a la primera
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = 1;
        }
        
        // Obtener los PDFs de la página actual
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        paginatedPdfs = filteredPdfs.slice(startIndex, endIndex);
        
        actualizarControlesPaginacion();
    }

    // ==================== ACTUALIZAR CONTROLES DE PAGINACIÓN ====================
    function actualizarControlesPaginacion() {
        currentPageSpan.textContent = currentPage;
        totalPagesSpan.textContent = totalPages;
        
        // Mostrar/ocultar botones y paginación
        if (filteredPdfs.length > itemsPerPage) {
            paginationContainer.style.display = 'flex';
        } else {
            paginationContainer.style.display = 'none';
        }
        
        // Habilitar/deshabilitar botones
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
    }

    // ==================== APLICAR FILTROS Y ORDENAMIENTO ====================
    function aplicarFiltrosYOrdenamiento() {
        const busqueda = searchInput.value.toLowerCase().trim();
        const periodo = periodoFilter.value;

        // Filtrar
        filteredPdfs = allPdfs.filter(pdf => {
            const cumpleBusqueda = !busqueda || pdf.nombre.toLowerCase().includes(busqueda);
            const cumplePeriodo = !periodo || pdf.periodo === periodo || pdf.periodo_id == periodo;
            return cumpleBusqueda && cumplePeriodo;
        });

        // Ordenar
        filteredPdfs.sort((a, b) => {
            switch (currentSort) {
                case 'nombre':
                    return a.nombre.localeCompare(b.nombre);
                case 'fecha':
                    return new Date(b.fecha_carga) - new Date(a.fecha_carga);
                case 'tamaño':
                    return (parseFloat(b.tamaño) || 0) - (parseFloat(a.tamaño) || 0);
                default:
                    return 0;
            }
        });

        // Reiniciar a la primera página
        currentPage = 1;
        
        // Calcular paginación
        calcularPaginacion();
        
        // Actualizar vista
        actualizarVista();
        actualizarContadores();
    }

    // ==================== ACTUALIZAR CONTADORES ====================
    function actualizarContadores() {
        resultsCount.textContent = filteredPdfs.length;
        totalCount.textContent = allPdfs.length;
    }

    // ==================== ACTUALIZAR VISTA ====================
    function actualizarVista() {
        pdfGrid.innerHTML = '';
        pdfList.innerHTML = '';

        if (paginatedPdfs.length === 0 && filteredPdfs.length === 0) {
            pdfGridContainer.style.display = 'none';
            pdfListContainer.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        pdfGridContainer.style.display = paginatedPdfs.length > 0 && currentView === 'grid' ? 'block' : 'none';
        pdfListContainer.style.display = paginatedPdfs.length > 0 && currentView === 'list' ? 'block' : 'none';
        emptyState.style.display = 'none';

        // Usar paginatedPdfs en lugar de filteredPdfs
        paginatedPdfs.forEach((pdf, index) => {
            if (currentView === 'grid') {
                agregarItemGrid(pdf);
            } else {
                agregarItemLista(pdf);
            }
        });
    }

    // ==================== AGREGAR ITEM A GRID ====================
    function agregarItemGrid(pdf) {
        const li = document.createElement('li');
        li.className = 'pdf-grid-item';
        
        const tamaño = (parseFloat(pdf.tamaño || 0) / 1024 / 1024).toFixed(2);
        const fecha = formatearFecha(pdf.fecha_carga);

        li.innerHTML = `
            <div class="pdf-card">
                <div class="pdf-card-icon">
                    <i class="fa-solid fa-file-pdf"></i>
                </div>
                <div class="pdf-card-content">
                    <h4 class="pdf-card-title" title="${pdf.nombre}">
                        ${pdf.nombre}
                    </h4>
                    <div class="pdf-card-meta">
                        <span class="pdf-meta-item">
                            <i class="fa-solid fa-calendar-alt"></i> ${fecha}
                        </span>
                        <span class="pdf-meta-item">
                            <i class="fa-solid fa-weight"></i> ${tamaño} MB
                        </span>
                    </div>
                    <div class="pdf-card-periodo">
                        <span class="periodo-badge">${pdf.periodo}</span>
                    </div>
                </div>
                <div class="pdf-card-actions">
                    <button class="action-btn view-btn" data-id="${pdf.id}" data-url="${pdf.ruta}" 
                            data-name="${pdf.nombre}" title="Ver">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="action-btn download-btn" data-url="${pdf.ruta}" 
                            data-name="${pdf.nombre}" title="Descargar">
                        <i class="fa-solid fa-download"></i>
                    </button>
                </div>
            </div>
        `;

        pdfGrid.appendChild(li);
    }

    // ==================== AGREGAR ITEM A LISTA ====================
    function agregarItemLista(pdf) {
        const li = document.createElement('li');
        li.className = 'pdf-list-item';
        
        const tamaño = (parseFloat(pdf.tamaño || 0) / 1024 / 1024).toFixed(2);
        const fecha = formatearFecha(pdf.fecha_carga);

        li.innerHTML = `
            <div class="pdf-list-content">
                <div class="pdf-list-icon">
                    <i class="fa-solid fa-file-pdf"></i>
                </div>
                <div class="pdf-list-info">
                    <h4 class="pdf-list-name">${pdf.nombre}</h4>
                    <div class="pdf-list-meta">
                        <span class="meta-badge">${pdf.periodo}</span>
                        <span class="meta-text">
                            <i class="fa-solid fa-calendar-alt"></i> ${fecha}
                        </span>
                        <span class="meta-text">
                            <i class="fa-solid fa-weight"></i> ${tamaño} MB
                        </span>
                    </div>
                </div>
            </div>
            <div class="pdf-list-actions">
                <button class="action-btn view-btn" data-id="${pdf.id}" data-url="${pdf.ruta}" 
                        data-name="${pdf.nombre}" title="Ver">
                    <i class="fa-solid fa-eye"></i> Ver
                </button>
                <button class="action-btn download-btn" data-url="${pdf.ruta}" 
                        data-name="${pdf.nombre}" title="Descargar">
                    <i class="fa-solid fa-download"></i> Descargar
                </button>
            </div>
        `;

        pdfList.appendChild(li);
    }

    // ==================== VER PDF ====================
    function verPdf(url, nombre) {
        currentPdfUrl = url;
        currentPdfName = nombre;
        pdfPreview.src = url;
        viewerTitle.textContent = nombre;
        pdfViewerModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // ==================== DESCARGAR PDF ====================
    function descargarPdf(url, nombre) {
        const link = document.createElement('a');
        link.href = url;
        link.download = nombre;
        link.click();
        mostrarAlerta(`Descargando: ${nombre}`, 'success', 2000);
    }

    // ==================== IMPRIMIR PDF ====================
    function imprimirPdf() {
        const printWindow = window.open(currentPdfUrl, 'print_window');
        
        if (printWindow) {
            printWindow.addEventListener('load', () => {
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            });
        } else {
            mostrarAlerta('Por favor, desactiva el bloqueador de ventanas emergentes', 'error');
        }
    }

    // ==================== CERRAR VISOR ====================
    function cerrarVisor() {
        pdfViewerModal.style.display = 'none';
        pdfPreview.src = '';
        currentPdfUrl = '';
        currentPdfName = '';
        document.body.style.overflow = 'auto';
    }

    // ==================== CAMBIAR VISTA ====================
    function cambiarVista(vista) {
        currentView = vista;

        if (vista === 'grid') {
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        } else {
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
        }

        actualizarVista();
    }

    // ==================== BÚSQUEDA ====================
    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim()) {
            clearSearchBtn.classList.remove('hidden');
        } else {
            clearSearchBtn.classList.add('hidden');
        }
        aplicarFiltrosYOrdenamiento();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        aplicarFiltrosYOrdenamiento();
    });

    // ==================== FILTRO POR PERÍODO ====================
    periodoFilter.addEventListener('change', aplicarFiltrosYOrdenamiento);

    // ==================== ORDENAMIENTO ====================
    sortBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sortBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.dataset.sort;
            aplicarFiltrosYOrdenamiento();
        });
    });

    // ==================== PAGINACIÓN ====================
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            calcularPaginacion();
            actualizarVista();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            calcularPaginacion();
            actualizarVista();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // ==================== BOTONES DE ACCIÓN ====================
    reloadBtn.addEventListener('click', () => {
        reloadBtn.disabled = true;
        reloadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Recargando...';
        cargarTodosPdfs();
        setTimeout(() => {
            reloadBtn.disabled = false;
            reloadBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Recargar';
        }, 1500);
    });

    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        periodoFilter.value = '';
        sortBtns.forEach(btn => btn.classList.remove('active'));
        sortBtns[0].classList.add('active');
        currentSort = 'nombre';
        currentPage = 1;
        aplicarFiltrosYOrdenamiento();
        mostrarAlerta('Filtros reseteados', 'success', 2000);
    });

    gridViewBtn.addEventListener('click', () => cambiarVista('grid'));
    listViewBtn.addEventListener('click', () => cambiarVista('list'));

    // ==================== VISOR PDF ====================
    closeViewerBtn.addEventListener('click', cerrarVisor);
    downloadBtn.addEventListener('click', () => descargarPdf(currentPdfUrl, currentPdfName));
    printBtn.addEventListener('click', imprimirPdf);

    // Cerrar visor al hacer clic fuera
    pdfViewerModal.addEventListener('click', (e) => {
        if (e.target === pdfViewerModal) {
            cerrarVisor();
        }
    });

    // Cerrar visor con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pdfViewerModal.style.display === 'flex') {
            cerrarVisor();
        }
    });

    // ==================== DELEGACIÓN DE EVENTOS ====================
    document.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-btn');
        const downloadBtn = e.target.closest('.download-btn');

        if (viewBtn) {
            const url = viewBtn.dataset.url;
            const nombre = viewBtn.dataset.name;
            verPdf(url, nombre);
        }

        if (downloadBtn) {
            const url = downloadBtn.dataset.url;
            const nombre = downloadBtn.dataset.name;
            descargarPdf(url, nombre);
        }
    });

    // ==================== UTILIDADES ====================
    function formatearFecha(fecha) {
        const date = new Date(fecha);
        const opciones = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return date.toLocaleDateString('es-ES', opciones);
    }

    function mostrarAlerta(mensaje, tipo, duracion = 3000) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo}`;
        alertDiv.innerHTML = `
            <div class="alert-content">
                <i class="fa-solid fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${mensaje}</span>
            </div>
        `;

        alertContainer.appendChild(alertDiv);
        alertDiv.style.animation = 'slideIn 0.3s ease';

        if (duracion > 0) {
            setTimeout(() => {
                alertDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => alertDiv.remove(), 300);
            }, duracion);
        }
    }

    // ==================== CARGAR AL INICIAR ====================
    cargarTodosPdfs();

    // Actualizar períodos disponibles
    function actualizarPeriodos() {
        fetch('../../php/periodos/get_periodos.php')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    // Obtener períodos únicos
                    const periodosUnicos = [...new Set(data.map(p => p.periodo))];
                    const optionsHTML = data.map(p => 
                        `<option value="${p.id}">${p.periodo} (${p.año})</option>`
                    ).join('');
                    
                    periodoFilter.innerHTML = '<option value="">Todos los períodos</option>' + optionsHTML;
                }
            })
            .catch(err => console.error('Error al cargar períodos:', err));
    }

    actualizarPeriodos();
});