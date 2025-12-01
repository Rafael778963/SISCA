// ============================================
// DATOS DE EJEMPLO - TUTORES
// ============================================
const datosEjemplo = {
    "TSU": {
        "matutino": [
            {
                programa: "TSU en Mercadotecnia",
                tutores: [
                    { grupo: "70 TSUM 1A", nombre: "Lic. Jonathan Alejandro Moreno Lozano" },
                    { grupo: "70 TSUM 1B", nombre: "Lic. Celeste Elizabeth de la Cerda Denegri" },
                    { grupo: "70 TSUM 1C", nombre: "Lic. Xóchitl Margarita Romero Arteaga" }
                ]
            },
            {
                programa: "TSU en Desarrollo de Negocios área Mercadotecnia",
                tutores: [
                    { grupo: "67 DNAM 4A", nombre: "MES. María de Jesús Cisneros Guani" },
                    { grupo: "64 DNAM 4B", nombre: "Lic. Celeste Elizabeth de la Cerda Denegri" }
                ]
            },
            {
                programa: "TSU en Enseñanza del Idioma Inglés",
                tutores: [
                    { grupo: "70 TSUEII 1", nombre: "MEBC. Perla Lizeth Vázquez Loredo" }
                ]
            },
            {
                programa: "TSU en Lengua Inglesa",
                tutores: [
                    { grupo: "67 LI 4", nombre: "MEBC. Arianna Iveth Castillo González" }
                ]
            },
            {
                programa: "TSU en Automatización",
                tutores: [
                    { grupo: "70 TSUA 1A", nombre: "Ing. Víctor Morales Hernández" },
                    { grupo: "70 TSUA 1B", nombre: "MGI. Lucia Patricia López Cuevas" }
                ]
            },
            {
                programa: "TSU en Mecatrónica área Automatización",
                tutores: [
                    { grupo: "67 MAA 4A", nombre: "Ing. Arely E. Cotero Rodríguez" },
                    { grupo: "67 MAA 4B", nombre: "Ing. Cristy Sarahi de León Leal" }
                ]
            },
            {
                programa: "TSU en Mantenimiento Industrial",
                tutores: [
                    { grupo: "70 TSUMI 1A", nombre: "Ing. José Gustavo Alanís Nuñez" },
                    { grupo: "70 TSUMI 1B", nombre: "Ing. Arely E. Cotero Rodríguez" },
                    { grupo: "70 TSUMI 1C", nombre: "Ing. José Gustavo Alanís Nuñez" }
                ]
            },
            {
                programa: "TSU en Mantenimiento área Industrial",
                tutores: [
                    { grupo: "67 MAI 4A", nombre: "Ing. Adrián Contreras Palacios" },
                    { grupo: "67 MAI 4B", nombre: "Ing. Adrián Contreras Palacios" }
                ]
            },
            {
                programa: "TSU en Entornos Virtuales y Negocios Digitales",
                tutores: [
                    { grupo: "70 TSUEVND 1A", nombre: "MGTI. Marcela Y. Guzmán Muñoz" }
                ]
            },
            {
                programa: "TSU en Tecnologías de la Información área Entornos Virtuales y Negocios Digitales",
                tutores: [
                    { grupo: "67 TIAEVND 4A", nombre: "MGTI. Marcela Y. Guzmán Muñoz" },
                    { grupo: "67 TIAEVND 4B", nombre: "Ing. Laura Lariza Rodríguez González" }
                ]
            },
            {
                programa: "TSU en Química Industrial",
                tutores: [
                    { grupo: "70 TSUQ 1A", nombre: "Ing. Lucía Patricia López Cuevas" },
                    { grupo: "70 TSUQ 1B", nombre: "MEBC. Elsa Margarita Guevara Merino" }
                ]
            },
            {
                programa: "TSU en Química área Industrial",
                tutores: [
                    { grupo: "67 QAI 4A", nombre: "MSIPA. Karina E. Montoya Ariceaga" },
                    { grupo: "67 QAI 4B", nombre: "Ing. Elsa Margarita Guevara Merino" }
                ]
            }
        ],
        "nocturno": [
            {
                programa: "TSU en Mercadotecnia",
                tutores: [
                    { grupo: "70 TSUM 1AN", nombre: "Lic. Geomara Mercado Briones" }
                ]
            },
            {
                programa: "TSU en Desarrollo de Negocios área Mercadotecnia",
                tutores: [
                    { grupo: "67 DNAM 4N", nombre: "Lic. Diana Luna Florencio" },
                    { grupo: "65 DNAM 6N", nombre: "Lic. Francisco Javier E. Arce Correa" },
                    { grupo: "64 DNAM 7N", nombre: "C.P. Adalberta Jiménez Salgado" }
                ]
            },
            {
                programa: "TSU en Enseñanza del Idioma Inglés",
                tutores: [
                    { grupo: "70 TSUEII 1N", nombre: "Lic. Erick Arturo González Garza" }
                ]
            },
            {
                programa: "TSU en Lengua Inglesa",
                tutores: [
                    { grupo: "67 LI 4N", nombre: "Lic. Silvia Edith González Espinoza" },
                    { grupo: "64 LI 7N", nombre: "Lic. Abigail Camacho Sandoval" }
                ]
            },
            {
                programa: "TSU en Automatización",
                tutores: [
                    { grupo: "70 TSUA 1N", nombre: "Ing. Blanca Margarita Muñoz Jiménez" }
                ]
            },
            {
                programa: "TSU en Mecatrónica área Automatización",
                tutores: [
                    { grupo: "64 MAA 4N", nombre: "Ing. Juan Zúñiga Moreno" },
                    { grupo: "65 MAA 6N", nombre: "Ing. Víctor Manuel Pérez Simón" },
                    { grupo: "62 MAA 7N", nombre: "Ing. Juan Zúñiga Moreno" }
                ]
            },
            {
                programa: "TSU en Mantenimiento Industrial",
                tutores: [
                    { grupo: "70 TSUMI 1AN", nombre: "Ing. Marcos Felipe Rendón Maldonado" },
                    { grupo: "70 TSUMI 1BN", nombre: "Ing. Juan Omar Martínez Ordaz" }
                ]
            },
            {
                programa: "TSU en Mantenimiento área Industrial",
                tutores: [
                    { grupo: "68 MAI 3N", nombre: "C.P. Alfredo Carmona Gutiérrez" },
                    { grupo: "67 MAI 4N", nombre: "Ing. Saúl Espericueta Posadas" },
                    { grupo: "65 MAI 6N", nombre: "MGI. Héctor Torres Cruz" },
                    { grupo: "61 MAI 7N", nombre: "Ing. Jorge Hernán Cortez Lajas" }
                ]
            },
            {
                programa: "TSU en Entornos Virtuales y Negocios Digitales",
                tutores: [
                    { grupo: "70 TSUEVND 1N", nombre: "MEBC. Felipe de Jesús Rmz. Turrubiartes" }
                ]
            },
            {
                programa: "TSU en Tecnologías de la Información área Entornos Virtuales y Negocios Digitales",
                tutores: [
                    { grupo: "67 TIAEVND 4N", nombre: "Ing. Laura Lariza Rodríguez Gzz" },
                    { grupo: "64 TIAEVND 7N", nombre: "Lic. Nubia Romay Franyutti" }
                ]
            },
            {
                programa: "TSU en Química Industrial",
                tutores: [
                    { grupo: "70 TSUQ 1N", nombre: "MGI. Lucia Patricia López Cuevas" }
                ]
            },
            {
                programa: "TSU en Química área Industrial",
                tutores: [
                    { grupo: "67 QAI 4N", nombre: "Ing. Ramiro Alejandro Rodríguez De la Gza" },
                    { grupo: "64 QAI 7N", nombre: "Ing. Francisco Javier González Rodríguez" }
                ]
            }
        ]
    },
    "ING": {
        "nocturno": [
            {
                programa: "Licenciatura en Innovación de Negocios y Mercadotecnia",
                tutores: [
                    { grupo: "14 LINM 1AN", nombre: "MEBC. Francisco Javier Enrique Arce Correa" },
                    { grupo: "14 LINM 1BN", nombre: "Lic. Diana Luna Florencio" },
                    { grupo: "13 LINM 4N", nombre: "MDO. Mario Francisco Garza De León" }
                ]
            },
            {
                programa: "Licenciatura en Gestión Institucional, Educativa y Curricular",
                tutores: [
                    { grupo: "14 LGIEC 1N", nombre: "Lic. Jesús Leal Campos" },
                    { grupo: "13 LGIEC 4N", nombre: "Dr. Jorge Gpe. González González" }
                ]
            },
            {
                programa: "Ingeniería en Mecatrónica",
                tutores: [
                    { grupo: "14 IME 1N", nombre: "Ing. Paúl Azuara Castillo" },
                    { grupo: "13 IME 4N", nombre: "Ing. Jessica Yadhira Guzmán Muñoz" }
                ]
            },
            {
                programa: "Ingeniería en Mantenimiento Industrial",
                tutores: [
                    { grupo: "14 IMI 1N", nombre: "Ing. Armando Aguilar Loera" },
                    { grupo: "13 IMI 4N", nombre: "Ing. Armando Aguilar Loera" }
                ]
            },
            {
                programa: "Ingeniería en Entornos Visuales y Negocios Digitales",
                tutores: [
                    { grupo: "14 IEVND 1N", nombre: "Ing. Omar Alejandro Mata Garza" },
                    { grupo: "13 IEVND 4N", nombre: "MEBC. Felipe de Jesús Ramírez Turrubiates" }
                ]
            },
            {
                programa: "Ingeniería en Química en Procesos Industriales",
                tutores: [
                    { grupo: "14 IQPI 1N", nombre: "Ing. Jorge Hernán Cortez Lajas" },
                    { grupo: "13 IQPI 4N", nombre: "Ing. Francisco Javier González Rodríguez" }
                ]
            }
        ]
    }
};

// ============================================
// FUNCIÓN PARA RENDERIZAR TUTORES
// ============================================
function renderizarTutores(turno, datos) {
    const contenedor = document.getElementById(turno === 'matutino' ? 'tutoresMatutino' : 'tutoresNocturno');
    
    if (!datos || datos.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-user-tie"></i>
                <p>No hay tutores ${turno === 'matutino' ? 'matutinos' : 'nocturnos'} registrados</p>
            </div>
        `;
        return;
    }

    let html = '';
    datos.forEach(programa => {
        html += `
            <div class="programa-section">
                <div class="programa-titulo">${programa.programa}</div>
        `;
        
        programa.tutores.forEach(tutor => {
            html += `
                <div class="tutor-card">
                    <div class="tutor-icon">
                        <i class="fa-solid fa-user-tie"></i>
                    </div>
                    <div class="tutor-info">
                        <div class="tutor-grupo">${tutor.grupo}</div>
                        <div class="tutor-nombre">${tutor.nombre}</div>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    });
    
    contenedor.innerHTML = html;
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos de ejemplo
    cargarDatosEjemplo();
    
    // Event listeners para filtros
    document.getElementById('btnFiltrar')?.addEventListener('click', aplicarFiltros);
    document.getElementById('btnLimpiarFiltros')?.addEventListener('click', limpiarFiltros);
    
    // Event listeners para acciones rápidas
    document.getElementById('btnExportarPDF')?.addEventListener('click', exportarPDF);
    document.getElementById('btnImprimir')?.addEventListener('click', imprimir);
    
    console.log('Módulo de Tutoría inicializado');
});

// ============================================
// CARGAR DATOS DE EJEMPLO
// ============================================
function cargarDatosEjemplo() {
    // Renderizar TSU Matutino y Nocturno
    renderizarTutores('matutino', datosEjemplo.TSU.matutino);
    renderizarTutores('nocturno', datosEjemplo.TSU.nocturno);
    
    // Cargar opciones de periodos (ejemplo)
    const selectPeriodo = document.getElementById('filtroPeriodo');
    if (selectPeriodo) {
        const opcionEjemplo = document.createElement('option');
        opcionEjemplo.value = 'sep-dic-2024';
        opcionEjemplo.textContent = 'Septiembre-Diciembre 2024';
        selectPeriodo.appendChild(opcionEjemplo);
    }
    
    // Cargar opciones de programas (ejemplo)
    const selectPrograma = document.getElementById('filtroPrograma');
    if (selectPrograma) {
        const programas = new Set();
        
        // Recolectar todos los programas
        [...datosEjemplo.TSU.matutino, ...datosEjemplo.TSU.nocturno].forEach(p => {
            programas.add(p.programa);
        });
        
        // Agregar opciones
        programas.forEach(programa => {
            const option = document.createElement('option');
            option.value = programa;
            option.textContent = programa;
            selectPrograma.appendChild(option);
        });
    }
}

// ============================================
// FUNCIONES DE FILTROS
// ============================================
function aplicarFiltros() {
    const busqueda = document.getElementById('busquedaTexto').value.toLowerCase();
    const programaFiltro = document.getElementById('filtroPrograma').value;
    
    // Filtrar datos
    let datosMatutino = datosEjemplo.TSU.matutino;
    let datosNocturno = datosEjemplo.TSU.nocturno;
    
    if (programaFiltro) {
        datosMatutino = datosMatutino.filter(p => p.programa === programaFiltro);
        datosNocturno = datosNocturno.filter(p => p.programa === programaFiltro);
    }
    
    if (busqueda) {
        datosMatutino = datosMatutino.map(programa => ({
            ...programa,
            tutores: programa.tutores.filter(t => 
                t.grupo.toLowerCase().includes(busqueda) || 
                t.nombre.toLowerCase().includes(busqueda)
            )
        })).filter(p => p.tutores.length > 0);
        
        datosNocturno = datosNocturno.map(programa => ({
            ...programa,
            tutores: programa.tutores.filter(t => 
                t.grupo.toLowerCase().includes(busqueda) || 
                t.nombre.toLowerCase().includes(busqueda)
            )
        })).filter(p => p.tutores.length > 0);
    }
    
    // Renderizar datos filtrados
    renderizarTutores('matutino', datosMatutino);
    renderizarTutores('nocturno', datosNocturno);
    
    // Mostrar notificación
    Swal.fire({
        icon: 'success',
        title: 'Filtros aplicados',
        text: 'Se han aplicado los filtros seleccionados',
        timer: 1500,
        showConfirmButton: false
    });
}

function limpiarFiltros() {
    document.getElementById('filtroPeriodo').value = '';
    document.getElementById('filtroPrograma').value = '';
    document.getElementById('busquedaTexto').value = '';
    
    // Recargar datos originales
    cargarDatosEjemplo();
    
    // Mostrar notificación
    Swal.fire({
        icon: 'info',
        title: 'Filtros limpiados',
        text: 'Se han eliminado todos los filtros',
        timer: 1500,
        showConfirmButton: false
    });
}

// ============================================
// FUNCIONES DE ACCIONES RÁPIDAS
// ============================================
function exportarPDF() {
    Swal.fire({
        icon: 'info',
        title: 'Exportar PDF',
        text: 'Funcionalidad de exportación a PDF en desarrollo',
        confirmButtonColor: '#78B543'
    });
}

function imprimir() {
    window.print();
}