// Cargar periodos disponibles y establecer el periodo activo
async function cargarPeriodos() {
    try {
        const response = await fetch('./php/periodos/get_periodos.php');
        const data = await response.json();

        if (data.success) {
            const select = document.getElementById('periodo-select');
            if (!select) return;

            select.innerHTML = '';

            // Agregar opción para cada periodo
            data.data.forEach(periodo => {
                const option = document.createElement('option');
                option.value = periodo.id;
                option.textContent = `${periodo.periodo} ${periodo.año}`;
                select.appendChild(option);
            });

            // Obtener el periodo activo de la sesión
            const periodoActivoResponse = await fetch('./php/get_periodo_activo.php');
            const periodoActivoData = await periodoActivoResponse.json();

            if (periodoActivoData.success) {
                select.value = periodoActivoData.periodo_id;
            }

            // Agregar evento de cambio
            select.addEventListener('change', cambiarPeriodo);
        }
    } catch (error) {
        console.error('Error al cargar periodos:', error);
    }
}

// Cambiar el periodo activo
async function cambiarPeriodo() {
    const select = document.getElementById('periodo-select');
    if (!select) return;

    const periodoId = select.value;

    try {
        const formData = new FormData();
        formData.append('periodo_id', periodoId);

        const response = await fetch('./php/cambiar_periodo.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // Mostrar mensaje de confirmación
            mostrarNotificacion('Periodo cambiado exitosamente', 'success');

            // Recargar la página para actualizar los datos
            setTimeout(() => {
                location.reload();
            }, 500);
        } else {
            mostrarNotificacion(data.message || 'Error al cambiar periodo', 'error');
        }
    } catch (error) {
        console.error('Error al cambiar periodo:', error);
        mostrarNotificacion('Error al cambiar periodo', 'error');
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notificacion.textContent = mensaje;

    document.body.appendChild(notificacion);

    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 3000);
}

// Cargar periodos cuando la página carga
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarPeriodos);
} else {
    cargarPeriodos();
}
