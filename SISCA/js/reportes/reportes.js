





const tipoReporteSelect = document.getElementById('tipoReporte');
const opcionesRegimen = document.getElementById('opcionesRegimen');
const opcionesComparativo = document.getElementById('opcionesComparativo');
const reporteInfo = document.getElementById('reporte-info');
const reporteContent = document.getElementById('reporte-content');
const anioComparativo1Select = document.getElementById('anioComparativo1');
const anioComparativo2Select = document.getElementById('anioComparativo2');
const periodo2Select = document.getElementById('periodo2');
const periodo3Select = document.getElementById('periodo3');






if (tipoReporteSelect) {
    tipoReporteSelect.addEventListener('change', function() {
        const tipoSeleccionado = this.value;
        
        
        opcionesRegimen.style.display = 'none';
        opcionesComparativo.style.display = 'none';
        
        
        document.getElementById('error-regimen').textContent = '';
        document.getElementById('error-anio1').textContent = '';
        document.getElementById('error-anio2').textContent = '';
        document.getElementById('error-periodo2').textContent = '';
        document.getElementById('error-periodo3').textContent = '';
        
        
        if (tipoSeleccionado === 'especifico') {
            opcionesRegimen.style.display = 'block';
        } else if (tipoSeleccionado === 'comparativo') {
            opcionesComparativo.style.display = 'block';
            cargarAnios(); 
        }
    });
}


if (anioComparativo1Select) {
    anioComparativo1Select.addEventListener('change', function() {
        const anioSeleccionado = this.value;
        
        if (anioSeleccionado) {
            
            periodo2Select.disabled = false;
            cargarPeriodosPorAnio(anioSeleccionado, 'periodo2');
        } else {
            
            periodo2Select.disabled = true;
            periodo2Select.innerHTML = '<option value="" disabled selected>-- Selecciona período --</option>';
        }
        
        
        validarPeriodosDiferentes();
    });
}


if (anioComparativo2Select) {
    anioComparativo2Select.addEventListener('change', function() {
        const anioSeleccionado = this.value;
        
        if (anioSeleccionado) {
            
            periodo3Select.disabled = false;
            cargarPeriodosPorAnio(anioSeleccionado, 'periodo3');
        } else {
            
            periodo3Select.disabled = true;
            periodo3Select.innerHTML = '<option value="" disabled selected>-- Selecciona período --</option>';
        }
        
        
        validarPeriodosDiferentes();
    });
}


if (periodo2Select) {
    periodo2Select.addEventListener('change', validarPeriodosDiferentes);
}


if (periodo3Select) {
    periodo3Select.addEventListener('change', validarPeriodosDiferentes);
}


const reportesForm = document.getElementById('reportesForm');
if (reportesForm) {
    reportesForm.addEventListener('submit', function(e) {
        e.preventDefault();
        generarReporte();
    });
}


const btnLimpiar = document.getElementById('btnLimpiar');
if (btnLimpiar) {
    btnLimpiar.addEventListener('click', limpiarFormulario);
}


const btnExportarPDF = document.getElementById('btnExportarPDF');
const btnExportarExcel = document.getElementById('btnExportarExcel');
const btnImprimir = document.getElementById('btnImprimir');

if (btnExportarPDF) btnExportarPDF.addEventListener('click', exportarPDF);
if (btnExportarExcel) btnExportarExcel.addEventListener('click', exportarExcel);
if (btnImprimir) btnImprimir.addEventListener('click', imprimirReporte);






function generarReporte() {
    
    limpiarErrores();
    
    const periodo = document.getElementById('periodo').value;
    const tipoReporte = document.getElementById('tipoReporte').value;
    
    
    if (!periodo) {
        mostrarError('error-periodo', 'Selecciona un período');
        return;
    }
    
    if (!tipoReporte) {
        mostrarError('error-tipo', 'Selecciona un tipo de reporte');
        return;
    }
    
    
    if (tipoReporte === 'especifico') {
        const regimen = document.getElementById('regimen').value;
        if (!regimen) {
            mostrarError('error-regimen', 'Selecciona un régimen');
            return;
        }
    } else if (tipoReporte === 'comparativo') {
        const anio1 = document.getElementById('anioComparativo1').value;
        const anio2 = document.getElementById('anioComparativo2').value;
        const periodo2 = document.getElementById('periodo2').value;
        const periodo3 = document.getElementById('periodo3').value;
        
        if (!anio1) {
            mostrarError('error-anio1', 'Selecciona el primer año');
            return;
        }
        if (!periodo2) {
            mostrarError('error-periodo2', 'Selecciona el primer período');
            return;
        }
        if (!anio2) {
            mostrarError('error-anio2', 'Selecciona el segundo año');
            return;
        }
        if (!periodo3) {
            mostrarError('error-periodo3', 'Selecciona el segundo período');
            return;
        }
        
        
        if (periodo2 === periodo3) {
            Swal.fire({
                icon: 'error',
                title: 'Períodos Duplicados',
                text: 'No puedes comparar el mismo período. Por favor selecciona períodos diferentes.',
                confirmButtonColor: '#78B543'
            });
            mostrarError('error-periodo3', 'Debe ser diferente al primer período');
            return;
        }
    }
    
    
    
    
    switch(tipoReporte) {
        case 'general':
            mostrarReporteGeneral(periodo);
            break;
        case 'especifico':
            const regimen = document.getElementById('regimen').value;
            mostrarReporteEspecifico(periodo, regimen);
            break;
        case 'comparativo':
            const anio1 = document.getElementById('anioComparativo1').value;
            const anio2 = document.getElementById('anioComparativo2').value;
            const periodo2 = document.getElementById('periodo2').value;
            const periodo3 = document.getElementById('periodo3').value;
            mostrarReporteComparativo(periodo2, periodo3, anio1, anio2);
            break;
    }
}


function mostrarReporteGeneral(periodo) {
    
    actualizarInfoReporte(periodo, 'Reporte General');
    
    reporteContent.innerHTML = `
        <table class="reporte-table">
            <thead>
                <tr>
                    <th>Régimen</th>
                    <th class="text-center">Docentes</th>
                    <th class="text-center">Hrs Clase</th>
                    <th class="text-center">Tutoría</th>
                    <th class="text-center">Estadía</th>
                    <th class="text-center">Administrativas</th>
                    <th class="text-center">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>PA</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                </tr>
                <tr>
                    <td>PA/PH</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                </tr>
                <tr>
                    <td>PA/PTC</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                </tr>
                <tr>
                    <td>PH</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                </tr>
                <tr>
                    <td>PH/PTC</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                </tr>
                <tr>
                    <td>PTC</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Total General</strong></td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                </tr>
            </tbody>
        </table>
    `;
    
    habilitarBotonesExportacion();
}


function mostrarReporteEspecifico(periodo, regimen) {
    
    const tituloRegimen = regimen === 'TODOS' ? 'Todos los Regímenes' : regimen;
    actualizarInfoReporte(periodo, 'Reporte Específico', tituloRegimen);
    
    reporteContent.innerHTML = `
        <table class="reporte-table">
            <thead>
                <tr>
                    <th>Docente</th>
                    ${regimen === 'TODOS' ? '<th class="text-center">Régimen</th>' : ''}
                    <th class="text-center">Hrs Clase</th>
                    <th class="text-center">Tutoría</th>
                    <th class="text-center">Estadía</th>
                    <th class="text-center">Administrativas</th>
                    <th class="text-center">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colspan="${regimen === 'TODOS' ? '7' : '6'}" class="text-center" style="padding: 2rem; color: var(--muted);">
                        <i class="fa-solid fa-database fa-2x" style="margin-bottom: 0.5rem; display: block;"></i>
                        <p>No hay datos disponibles para ${tituloRegimen}</p>
                    </td>
                </tr>
            </tbody>
        </table>
    `;
    
    habilitarBotonesExportacion();
}


function mostrarReporteComparativo(periodo1, periodo2, anio1, anio2) {
    
    const nombrePeriodo1 = obtenerNombrePeriodo(periodo1, 'periodo2');
    const nombrePeriodo2 = obtenerNombrePeriodo(periodo2, 'periodo3');
    
    
    const esMismoAnio = anio1 === anio2;
    const tituloComparacion = esMismoAnio 
        ? `${nombrePeriodo1} vs ${nombrePeriodo2}`
        : `${nombrePeriodo1} vs ${nombrePeriodo2}`;
    
    
    actualizarInfoReporte(tituloComparacion, 'Reporte Comparativo');
    
    reporteContent.innerHTML = `
        <div class="tabla-comparativo-container">
            <table class="reporte-table tabla-comparativo">
                <thead>
                    <tr>
                        <th rowspan="2" class="col-regimen">Régimen</th>
                        <th colspan="2" class="text-center header-grupo">Docentes</th>
                        <th colspan="2" class="text-center header-grupo">Horas</th>
                        <th rowspan="2" class="text-center col-diferencia">Diferencia</th>
                    </tr>
                    <tr>
                        <th class="text-center sub-header">${nombrePeriodo1}</th>
                        <th class="text-center sub-header">${nombrePeriodo2}</th>
                        <th class="text-center sub-header">${nombrePeriodo1}</th>
                        <th class="text-center sub-header">${nombrePeriodo2}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="regimen-cell">PA</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center diferencia-neutral">-</td>
                    </tr>
                    <tr>
                        <td class="regimen-cell">PA/PH</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center diferencia-neutral">-</td>
                    </tr>
                    <tr>
                        <td class="regimen-cell">PA/PTC</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center diferencia-neutral">-</td>
                    </tr>
                    <tr>
                        <td class="regimen-cell">PH</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center diferencia-neutral">-</td>
                    </tr>
                    <tr>
                        <td class="regimen-cell">PH/PTC</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center diferencia-neutral">-</td>
                    </tr>
                    <tr>
                        <td class="regimen-cell">PTC</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center">-</td>
                        <td class="text-center diferencia-neutral">-</td>
                    </tr>
                    <tr class="total-row">
                        <td class="regimen-cell"><strong>Total</strong></td>
                        <td class="text-center"><strong>-</strong></td>
                        <td class="text-center"><strong>-</strong></td>
                        <td class="text-center"><strong>-</strong></td>
                        <td class="text-center"><strong>-</strong></td>
                        <td class="text-center diferencia-neutral"><strong>-</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    habilitarBotonesExportacion();
}


function actualizarInfoReporte(periodo, tipo, regimen = null) {
    reporteInfo.style.display = 'flex';
    
    document.getElementById('info-periodo').textContent = `Período: ${periodo}`;
    document.getElementById('info-tipo').textContent = `Tipo: ${tipo}`;
    
    const regimenBadge = document.getElementById('info-regimen-badge');
    if (regimen) {
        regimenBadge.style.display = 'flex';
        document.getElementById('info-regimen').textContent = `Régimen: ${regimen}`;
    } else {
        regimenBadge.style.display = 'none';
    }
}


function limpiarFormulario() {
    reportesForm.reset();
    opcionesRegimen.style.display = 'none';
    opcionesComparativo.style.display = 'none';
    reporteInfo.style.display = 'none';
    limpiarErrores();
    
    reporteContent.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-chart-simple"></i>
            <h3>No hay reporte generado</h3>
            <p>Selecciona un período y tipo de reporte para comenzar</p>
        </div>
    `;
    
    deshabilitarBotonesExportacion();
}


function exportarPDF() {
    if (!validarReporteGenerado()) return;
    
    Swal.fire({
        icon: 'info',
        title: 'Exportar a PDF',
        text: 'Función de exportación a PDF en desarrollo',
        confirmButtonColor: '#78B543'
    });
    
    
    
}


function exportarExcel() {
    if (!validarReporteGenerado()) return;
    
    Swal.fire({
        icon: 'info',
        title: 'Exportar a Excel',
        text: 'Función de exportación a Excel en desarrollo',
        confirmButtonColor: '#78B543'
    });
    
    
    
}


function imprimirReporte() {
    if (!validarReporteGenerado()) return;
    window.print();
}






function mostrarError(elementId, mensaje) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = mensaje;
    }
}


function limpiarErrores() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}


function validarReporteGenerado() {
    const hayReporte = !reporteContent.querySelector('.empty-state');
    
    if (!hayReporte) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin reporte',
            text: 'Primero debes generar un reporte',
            confirmButtonColor: '#78B543'
        });
    }
    
    return hayReporte;
}


function habilitarBotonesExportacion() {
    btnExportarPDF.disabled = false;
    btnExportarExcel.disabled = false;
    btnImprimir.disabled = false;
}


function deshabilitarBotonesExportacion() {
    btnExportarPDF.disabled = true;
    btnExportarExcel.disabled = true;
    btnImprimir.disabled = true;
}


function obtenerNombrePeriodo(periodoId, selectId) {
    
    const selectElement = document.getElementById(selectId);
    const option = selectElement ? selectElement.querySelector(`option[value="${periodoId}"]`) : null;
    return option ? option.textContent : periodoId;
}


function validarPeriodosDiferentes() {
    const periodo2 = document.getElementById('periodo2').value;
    const periodo3 = document.getElementById('periodo3').value;
    
    
    if (periodo2 && periodo3) {
        if (periodo2 === periodo3) {
            mostrarError('error-periodo3', 'Debe ser diferente al primer período');
            
            document.getElementById('generate-report-btn').disabled = true;
        } else {
            
            document.getElementById('error-periodo3').textContent = '';
            document.getElementById('generate-report-btn').disabled = false;
        }
    }
}





document.addEventListener('DOMContentLoaded', async function() {
    
    await inicializarPeriodoManager();

    
    if (!hayPeriodoActivo()) {
        Swal.fire({
            icon: 'warning',
            title: 'Periodo no seleccionado',
            html: `
                <p>Debes seleccionar un periodo activo antes de cargar el módulo de Reportes.</p>
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

    
    cargarPeriodos();

    
    deshabilitarBotonesExportacion();
});


function cargarPeriodos() {
    
    
    
    
    
    
    
    
    const periodoSelect = document.getElementById('periodo');
    
    const periodosEjemplo = [
        { value: '2024-1', text: 'Enero - Abril 2024' },
        { value: '2024-2', text: 'Mayo - Agosto 2024' },
        { value: '2024-3', text: 'Septiembre - Diciembre 2024' },
    ];
    
    
    periodoSelect.innerHTML = '<option value="" disabled selected>-- Selecciona un período --</option>';
    
    
    periodosEjemplo.forEach(periodo => {
        const option = new Option(periodo.text, periodo.value);
        periodoSelect.add(option);
    });
}


function cargarAnios() {
    
    
    
    
    
    
    
    
    const anio1Select = document.getElementById('anioComparativo1');
    const anio2Select = document.getElementById('anioComparativo2');
    
    const aniosEjemplo = [
        { value: '2023', text: '2023' },
        { value: '2024', text: '2024' },
        { value: '2025', text: '2025' },
    ];
    
    
    anio1Select.innerHTML = '<option value="" disabled selected>-- Selecciona un año --</option>';
    anio2Select.innerHTML = '<option value="" disabled selected>-- Selecciona un año --</option>';
    
    
    aniosEjemplo.forEach(anio => {
        const option1 = new Option(anio.text, anio.value);
        const option2 = new Option(anio.text, anio.value);
        anio1Select.add(option1);
        anio2Select.add(option2);
    });
}


function cargarPeriodosPorAnio(anio, targetSelectId) {
    
    
    
    
    
    
    
    
    const periodosPorAnio = {
        '2023': [
            { value: '2023-1', text: 'Enero - Abril 2023' },
            { value: '2023-2', text: 'Mayo - Agosto 2023' },
            { value: '2023-3', text: 'Septiembre - Diciembre 2023' },
        ],
        '2024': [
            { value: '2024-1', text: 'Enero - Abril 2024' },
            { value: '2024-2', text: 'Mayo - Agosto 2024' },
            { value: '2024-3', text: 'Septiembre - Diciembre 2024' },
        ],
        '2025': [
            { value: '2025-1', text: 'Enero - Abril 2025' },
            { value: '2025-2', text: 'Mayo - Agosto 2025' },
            { value: '2025-3', text: 'Septiembre - Diciembre 2025' },
        ],
    };
    
    const periodosDelAnio = periodosPorAnio[anio] || [];
    const targetSelect = document.getElementById(targetSelectId);
    
    
    targetSelect.innerHTML = '<option value="" disabled selected>-- Selecciona período --</option>';
    
    
    periodosDelAnio.forEach(periodo => {
        const option = new Option(periodo.text, periodo.value);
        targetSelect.add(option);
    });
    
    
    validarPeriodosDiferentes();
}