// Variable global para almacenar el periodo activo
let periodoActivo = null;

/**
 * Inicializa el gestor de periodo
 * Debe llamarse en el DOMContentLoaded de cada módulo
 */
async function inicializarPeriodoManager() {
    await cargarPeriodoActivo();
    crearIndicadorPeriodo();
    
    // Ajustar posición del indicador si es necesario
    window.addEventListener('resize', ajustarIndicador);
}

/**
 * Carga el periodo activo desde la sesión
 */
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

/**
 * Crea el indicador visual del periodo en el center del header
 */
function crearIndicadorPeriodo() {
    const header = document.querySelector('.header');
    if (!header) return;

    // Verificar si ya existe el indicador
    let indicador = document.getElementById('periodo-indicator');
    if (indicador) {
        actualizarIndicadorVisual(indicador);
        return;
    }

    // Crear el indicador
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

    // Insertar directamente en el header (para centrado absoluto)
    header.appendChild(indicador);
    
    // Asegurar que el header es relativo
    if (getComputedStyle(header).position === 'static') {
        header.style.position = 'relative';
    }
}

/**
 * Ajusta la posición del indicador según el tamaño de la pantalla
 */
function ajustarIndicador() {
    const indicador = document.getElementById('periodo-indicator');
    if (!indicador) return;

    const screenWidth = window.innerWidth;
    
    // En pantallas muy pequeñas, cambiar a posición estática
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

/**
 * Actualiza el indicador visual
 */
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

/**
 * Valida que haya un periodo activo antes de realizar una operación
 * @param {string} accion - Descripción de la acción que se quiere realizar
 * @returns {boolean} - true si hay periodo activo, false si no
 */
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

/**
 * Obtiene el ID del periodo activo
 * @returns {number|null} - ID del periodo o null si no hay periodo activo
 */
function obtenerPeriodoActivoId() {
    return periodoActivo ? periodoActivo.id : null;
}

/**
 * Obtiene el objeto completo del periodo activo
 * @returns {object|null} - Objeto del periodo o null
 */
function obtenerPeriodoActivo() {
    return periodoActivo;
}

/**
 * Verifica si hay un periodo activo
 * @returns {boolean}
 */
function hayPeriodoActivo() {
    return periodoActivo !== null && periodoActivo.id !== undefined;
}

/**
 * Recarga y actualiza el periodo activo
 * Útil cuando el período cambia desde otro módulo
 */
async function recargarPeriodoActivo() {
    await cargarPeriodoActivo();
    const indicador = document.getElementById('periodo-indicator');
    if (indicador) {
        actualizarIndicadorVisual(indicador);
    }
}