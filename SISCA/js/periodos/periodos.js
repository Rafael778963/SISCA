document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formPeriodo');
    const cardsContainer = document.getElementById('cardsContainer');
    const filterAnio = document.getElementById('filterAnio');
    let periodos = [];

    
    function cargarPeriodos() {
        fetch('../../php/periodos/get_periodos.php', {
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
                
                if (Array.isArray(data)) {
                    periodos = data;
                } else if (data && data.success === false) {
                    
                    console.error('Error del servidor:', data.message);
                    periodos = [];
                } else {
                    
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

    
    cardsContainer.addEventListener('click', function (e) {
        const deleteBtn = e.target.closest('.btn-delete');
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            if (!id) return console.error('No se encontró ID del periodo');
            verificarContraseña(id);
        }
    });

    
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

    
    function verificarContraseña(id) {

        Swal.fire({
            title: '¡ALERTA DE AUTENTICACIÓN!',
            text: 'Ingresa la contraseña para continuar con la eliminación',
            icon: 'warning',
            input: 'password',
            inputPlaceholder: 'Contraseña',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            confirmButtonColor: '#78B543',
        }).then(result => {
            if (result.isConfirmed) {

                Swal.fire({
                    title: 'Verificando...',
                    text: 'Por favor espera mientras se valida la contraseña.',
                    icon: 'info',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        Swal.showLoading();

                        
                        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 2500));

                        
                        const fetchPromise = fetch('../../php/periodos/verificar_contraseña.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: `password=${encodeURIComponent(result.value)}`,
                        }).then(res => res.json());

                        
                        Promise.all([minLoadingTime, fetchPromise])
                            .then(([_, data]) => {
                                if (data.success) {
                                    
                                    Swal.close();
                                    eliminarPeriodo(id);
                                } else {
                                    Swal.fire('Contraseña incorrecta', 'La contraseña no coincide.', 'error');
                                }
                            })
                            .catch(err => {
                                console.error(err);
                                Swal.fire('Error', 'No se pudo verificar la contraseña', 'error');
                            });
                    }
                });
            }
        });
    }


    
    function eliminarPeriodo(id) {
        
        contarHorariosPeriodo(id).then(cantidadHorarios => {
            let textoAdvertencia = '';

            if (cantidadHorarios > 0) {
                textoAdvertencia = `
                    <p>Este período contiene <strong>${cantidadHorarios} horario(s)</strong>.</p>
                    <p style="margin-top: 15px;"><strong>Se eliminarán:</strong></p>
                    <ul style="text-align: left; display: inline-block; margin-top: 10px;">
                        <li>El período</li>
                        <li>${cantidadHorarios} archivo(s) PDF</li>
                        <li>Todos sus registros de la base de datos</li>
                    </ul>
                    <p style="margin-top: 15px; color: #d33; font-weight: bold;">¡Esta acción no se puede deshacer!</p>
                `;
            } else {
                textoAdvertencia = `
                    <p>Se eliminará el período.</p>
                    <p style="margin-top: 15px; color: #d33; font-weight: bold;">¡Esta acción no se puede deshacer!</p>
                `;
            }

            Swal.fire({
                title: '¡ALERTA DE ELIMINACIÓN!',
                html: textoAdvertencia,
                icon: 'warning',
                input: 'text',
                inputPlaceholder: 'Escribe ELIMINAR',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar todo',
                confirmButtonColor: '#78B543',
                inputValidator: (value) => {
                    if (value !== 'ELIMINAR') {
                        return 'Debes escribir la palabra ELIMINAR para continuar.';
                    }
                }
            }).then(result => {
                if (result.isConfirmed) {
                    
                    Swal.fire({
                        title: 'Eliminando...',
                        text: 'Por favor espera mientras se elimina el período y todos sus horarios.',
                        icon: 'info',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        didOpen: () => {
                            Swal.showLoading();

                            
                            const minLoadingTime = new Promise(resolve => setTimeout(resolve, 5000));

                            
                            const fetchPromise = fetch('../../php/periodos/eliminar_periodo.php', {
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
                                });

                            
                            Promise.all([minLoadingTime, fetchPromise])
                                .then(([_, data]) => {
                                    if (!data) return;
                                    if (data.success) {
                                        let mensajeDetalle = '';

                                        mensajeDetalle = `
                                            <p><strong>${data.message}</strong></p>
                                        `;

                                        if (data.detalles) {
                                            mensajeDetalle += `
                                                <p style="margin-top: 15px;"><strong>Resumen de eliminación:</strong></p>
                                                <ul style="text-align: left; display: inline-block; margin-top: 10px;">
                                                    <li>Horarios eliminados: ${data.detalles.horarios_eliminados}</li>
                                                    <li>PDFs eliminados: ${data.detalles.archivos_pdf_eliminados}</li>
                                                    <li>Grupos eliminados: ${data.detalles.grupos_eliminados}</li>
                                                    <li>Docentes eliminados: ${data.detalles.docentes_eliminados}</li>
                                            `;
                                            if (data.detalles.archivos_no_eliminados > 0) {
                                                mensajeDetalle += `<li style="color: #d33;">PDFs no eliminados: ${data.detalles.archivos_no_eliminados}</li>`;
                                            }
                                            mensajeDetalle += `</ul>`;
                                        }

                                        Swal.fire({
                                            title: '¡Eliminado!',
                                            html: mensajeDetalle,
                                            icon: 'success'
                                        });
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
                }
            });
        });
    }

    
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
                if (!data) return; 
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

    
    cargarPeriodos();
});