/**
 * PERIODO MANAGER - Sistema centralizado para gestión de periodo activo
 * Este archivo debe incluirse en todos los módulos que requieran periodo activo
 */

// Variable global para almacenar el periodo activo
let periodoActivo = null;

/**
 * Inicializa el gestor de periodo
 * Debe llamarse en el DOMContentLoaded de cada módulo
 */
async function inicializarPeriodoManager() {
    await cargarPeriodoActivo();
    crearIndicadorPeriodo();
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
 * Crea el indicador visual del periodo en el header (esquina derecha)
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

    // Insertar en el user-menu, al inicio (antes de los botones)
    const userMenu = header.querySelector('.user-menu');
    if (userMenu) {
        userMenu.insertBefore(indicador, userMenu.firstChild);
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
                cancelButtonText: 'Cancelar'
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
