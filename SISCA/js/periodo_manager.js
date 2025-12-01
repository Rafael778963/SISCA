let periodoActivo = null;


async function inicializarPeriodoManager() {
    await cargarPeriodoActivo();
    crearIndicadorPeriodo();
    
        window.addEventListener('resize', ajustarIndicador);
}


async function cargarPeriodoActivo() {
    try {
        const response = await fetch('../../php/periodos/get_periodo_activo.php');
        const data = await response.json();

        if (data.success && data.periodo) {
            periodoActivo = data.periodo;
            return true;
        } else {
            periodoActivo = null;
            return false;
        }
    } catch (error) {
        console.error('Error al cargar periodo activo:', error);
        periodoActivo = null;
        return false;
    }
}


function crearIndicadorPeriodo() {
    const header = document.querySelector('.header');
    if (!header) return;

        let indicador = document.getElementById('periodo-indicator');
    if (indicador) {
        actualizarIndicadorVisual(indicador);
        return;
    }

        indicador = document.createElement('div');
    indicador.id = 'periodo-indicator';
    indicador.className = 'periodo-indicator';

    if (periodoActivo) {
        indicador.classList.add('activo');
        indicador.innerHTML = `
            <i class="fa-solid fa-calendar-check"></i>
            <span class="periodo-texto">${periodoActivo.texto}</span>
        `;
    } else {
        indicador.innerHTML = `
            <i class="fa-solid fa-calendar-xmark"></i>
            <span class="periodo-texto">Sin período activo</span>
        `;
    }

        header.appendChild(indicador);
    
        if (getComputedStyle(header).position === 'static') {
        header.style.position = 'relative';
    }
}


function ajustarIndicador() {
    const indicador = document.getElementById('periodo-indicator');
    if (!indicador) return;

    const screenWidth = window.innerWidth;
    
        if (screenWidth <= 768) {
        indicador.style.position = 'static';
        indicador.style.transform = 'none';
        indicador.style.left = 'auto';
        indicador.style.top = 'auto';
    } else {
        indicador.style.position = 'absolute';
        indicador.style.left = '50%';
        indicador.style.transform = 'translateX(-50%)';
        indicador.style.top = '50%';
    }
}


function actualizarIndicadorVisual(indicador) {
    if (periodoActivo) {
        indicador.classList.add('activo');
        indicador.innerHTML = `
            <i class="fa-solid fa-calendar-check"></i>
            <span class="periodo-texto">${periodoActivo.texto}</span>
        `;
    } else {
        indicador.classList.remove('activo');
        indicador.innerHTML = `
            <i class="fa-solid fa-calendar-xmark"></i>
            <span class="periodo-texto">Sin período activo</span>
        `;
    }
}


function validarPeriodoActivo(accion = 'realizar esta operación') {
    if (!periodoActivo || !periodoActivo.id) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: 'Período no seleccionado',
                html: `
                    <p>Debes seleccionar un período activo antes de ${accion}.</p>
                    <p>Ve al <strong>inicio</strong> y selecciona un período.</p>
                `,
                confirmButtonText: 'Ir al inicio',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#22c55e',
                cancelButtonColor: '#6e6e6eff'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '../../index.html';
                }
            });
        } else {
            alert(`Debes seleccionar un período activo antes de ${accion}.\nVe al inicio y selecciona un período.`);
        }
        return false;
    }
    return true;
}


function obtenerPeriodoActivoId() {
    return periodoActivo ? periodoActivo.id : null;
}


function obtenerPeriodoActivo() {
    return periodoActivo;
}


function hayPeriodoActivo() {
    return periodoActivo !== null && periodoActivo.id !== undefined;
}


async function recargarPeriodoActivo() {
    await cargarPeriodoActivo();
    const indicador = document.getElementById('periodo-indicator');
    if (indicador) {
        actualizarIndicadorVisual(indicador);
    }
}