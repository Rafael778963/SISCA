document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formPeriodo');
    const cardsContainer = document.getElementById('cardsContainer');
    const filterAnio = document.getElementById('filterAnio');
    let periodos = [];

    // Cargar periodos
    function cargarPeriodos() {
        fetch('../../php/periodos/get_periodos.php', {
            credentials: 'include'
        })
            .then(res => {
                // Si hay error de autenticación, redirigir a login
                if (res.status === 401) {
                    alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
                    window.location.href = '../../login.html';
                    return;
                }
                return res.json();
            })
            .then(data => {
                // Verificar que data sea un array
                if (Array.isArray(data)) {
                    periodos = data;
                } else if (data && data.success === false) {
                    // Error del servidor
                    console.error('Error del servidor:', data.message);
                    periodos = [];
                } else {
                    // Otro tipo de respuesta inesperada
                    periodos = [];
                }
                llenarSelectorAnios();
                filtrarYCargarCards(filterAnio.value || 'Todos');
            })
            .catch(err => {
                console.error('Error al cargar periodos:', err);
                periodos = [];
                llenarSelectorAnios();
                filtrarYCargarCards(filterAnio.value || 'Todos');
            });
    }

    // Llenar selector de años
    function llenarSelectorAnios() {
        const anios = [...new Set(periodos.map(p => p.año))].sort((a, b) => b - a);
        filterAnio.innerHTML = '';
        const optionTodos = document.createElement('option');
        optionTodos.value = 'Todos';
        optionTodos.textContent = 'Todos';
        filterAnio.appendChild(optionTodos);

        anios.forEach(anio => {
            const option = document.createElement('option');
            option.value = anio;
            option.textContent = anio;
            filterAnio.appendChild(option);
        });

        filterAnio.value = 'Todos';
    }

    // Cargar cards según filtro
    function filtrarYCargarCards(anioSeleccionado) {
        cardsContainer.innerHTML = '';
        const filtrados = anioSeleccionado === 'Todos'
            ? periodos
            : periodos.filter(p => parseInt(p.año) === parseInt(anioSeleccionado));

        filtrados.forEach((periodo, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${periodo.periodo}</h3>
                <p>Año: ${periodo.año}</p>
                <i class="fas fa-trash btn-delete" data-id="${periodo.id}" title="Eliminar"></i>
            `;
            cardsContainer.appendChild(card);
            setTimeout(() => card.classList.add('show'), index * 100);
        });
    }

    // Delegación de eventos: icono eliminar
    cardsContainer.addEventListener('click', function (e) {
        const deleteBtn = e.target.closest('.btn-delete');
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            if (!id) return console.error('No se encontró ID del periodo');
            eliminarPeriodo(id);
        }
    });

    // Función para contar horarios de un período
    function contarHorariosPeriodo(periodoId) {
        return fetch(`../../php/horarios/obtener_horarios.php?periodo_id=${periodoId}`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.horarios)) {
                    return data.horarios.length;
                }
                return 0;
            })
            .catch(err => {
                console.error('Error al contar horarios:', err);
                return 0;
            });
    }

    // Función eliminar periodo
    function eliminarPeriodo(id) {
        // Primero contar cuántos horarios hay
        contarHorariosPeriodo(id).then(cantidadHorarios => {
            let textoAdvertencia = '';

            if (cantidadHorarios > 0) {
                textoAdvertencia = `⚠️ Este período contiene ${cantidadHorarios} horario(s).\n\n`;
                textoAdvertencia += 'Se eliminarán:\n';
                textoAdvertencia += `• El período\n`;
                textoAdvertencia += `• ${cantidadHorarios} archivo(s) PDF\n`;
                textoAdvertencia += `• Todos sus registros de la base de datos\n\n`;
                textoAdvertencia += '¡Esta acción no se puede deshacer!';
            } else {
                textoAdvertencia = 'Se eliminará el período.\n¡Esta acción no se puede deshacer!';
            }

            Swal.fire({
                title: '¿Estás seguro?',
                text: textoAdvertencia,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#78B543',
                confirmButtonText: 'Sí, eliminar todo',
                cancelButtonText: 'Cancelar'
            }).then(result => {
                if (result.isConfirmed) {
                    // Mostrar loading
                    Swal.fire({
                        title: 'Eliminando...',
                        text: 'Por favor espera mientras se elimina el período y todos sus horarios.',
                        icon: 'info',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    fetch('../../php/periodos/eliminar_periodo.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `id=${encodeURIComponent(id)}`,
                        credentials: 'include'
                    })
                        .then(res => {
                            if (res.status === 401) {
                                alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
                                window.location.href = '../../login.html';
                                return;
                            }
                            return res.json();
                        })
                        .then(data => {
                            if (!data) return; // Si fue 401, ya redirigió
                            if (data.success) {
                                let mensajeDetalle = data.message;
                                if (data.detalles) {
                                    mensajeDetalle += `\n\n📊 Detalles:\n`;
                                    mensajeDetalle += `• PDFs eliminados: ${data.detalles.archivos_pdf_eliminados}\n`;
                                    mensajeDetalle += `• Horarios eliminados: ${data.detalles.horarios_eliminados}\n`;
                                    if (data.detalles.archivos_no_eliminados > 0) {
                                        mensajeDetalle += `⚠️ PDFs no eliminados: ${data.detalles.archivos_no_eliminados}`;
                                    }
                                }
                                Swal.fire('¡Eliminado!', mensajeDetalle, 'success');
                                cargarPeriodos();
                            } else {
                                Swal.fire('Error', data.message || 'No se pudo eliminar', 'error');
                            }
                        })
                        .catch(err => {
                            Swal.fire('Error', 'Ocurrió un error al eliminar', 'error');
                            console.error(err);
                        });
                }
            });
        });
    }

    // Guardar nuevo periodo
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);

        fetch('../../php/periodos/guardar_periodo.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
            .then(res => {
                if (res.status === 401) {
                    alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
                    window.location.href = '../../login.html';
                    return;
                }
                return res.json();
            })
            .then(data => {
                if (!data) return; // Si fue 401, ya redirigió
                if (data.success) {
                    Swal.fire('¡Éxito!', data.message, 'success');
                    form.reset();
                    cargarPeriodos();
                } else {
                    Swal.fire('Error', data.message, 'error');
                }
            })
            .catch(err => {
                Swal.fire('Error', 'Ocurrió un error al guardar', 'error');
                console.error(err);
            });
    });

    filterAnio.addEventListener('change', function () {
        filtrarYCargarCards(this.value);
    });

    // Inicializar
    cargarPeriodos();
});
