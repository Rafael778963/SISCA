/* ============================================
   MENU LATERAL - SIDEBAR TOGGLE
   ============================================ */

function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');
    
    if (!sidebar || !toggleBtn) {
        console.warn('Sidebar o botón toggle no encontrado');
        return;
    }
    
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    // IMPORTANTE: Eliminar estilos temporales de preload
    const preloadStyle = document.getElementById('sidebar-preload');
    if (preloadStyle) {
        preloadStyle.remove();
    }
    
    // Aplicar estado correcto con clases normales
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    }
    
    // Mostrar el body ahora que todo está configurado
    document.body.style.visibility = 'visible';
    
    // Event listener para el botón toggle
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        console.log(toggleBtn);
        
        if (sidebar.classList.contains('collapsed')) {
            toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
            localStorage.setItem('sidebarCollapsed', 'true');
        } else {
            toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
            localStorage.setItem('sidebarCollapsed', 'false');
        }
        
    });
}

/* ============================================
   AUTO-INICIALIZACIÓN
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initSidebarToggle();
});