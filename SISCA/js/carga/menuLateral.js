

function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');
    
    if (!sidebar || !toggleBtn) {
        console.warn('Sidebar o botón toggle no encontrado');
        return;
    }
    
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    
    const preloadStyle = document.getElementById('sidebar-preload');
    if (preloadStyle) {
        preloadStyle.remove();
    }
    
    
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    }
    
    
    document.body.style.visibility = 'visible';
    
    
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



document.addEventListener('DOMContentLoaded', function() {
    initSidebarToggle();
});