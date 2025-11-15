document.addEventListener('DOMContentLoaded', function () {
    const basePath = getBasePath();
    const sessionUrl = `${basePath}php/userName_session.php`;
    const loginUrl = `${basePath}login.html`;

    // Verificación de la sesión al cargar
    verifySession(sessionUrl, loginUrl);

    // Verificación de la sesión cada 5 minutos (300000 ms)
    setInterval(() => verifySession(sessionUrl, loginUrl, true), 300000);

    // Hacer que logout use basePath si hay un botón con id 'logout-btn'
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => logout(basePath));
    }
});


// Verificación si la sesión es válida
function verifySession(sessionUrl, loginUrl, silent = false) {
    fetch(sessionUrl, {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (!data.valid) {
                if (!silent) alert(data.message || 'Sesión expirada');
                window.location.href = loginUrl;
            } else if (!silent) {
                if (typeof loadUserInfo === 'function') {
                    loadUserInfo(getBasePath());
                }
            }
        })
        .catch(error => {
            console.error('Error verificando sesión:', error);
            window.location.href = loginUrl;
        });
}


// Cargar información del usuario
function loadUserInfo(basePath) {
    fetch(`${basePath}php/userName_session.php`, {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.valid && data.user) {
                const usernameElement = document.getElementById('user-name');
                if (usernameElement) {
                    usernameElement.textContent = data.user.username_name;
                }
            }
        })
        .catch(error => {
            console.error('Error cargando info de usuario:', error);
        });
}


// Función para cerrar sesión
function logout() {
    // calcular basePath dinámicamente
    const basePath = getBasePath();
    if (confirm('¿Deseas cerrar sesión?')) {
        window.location.href = `${basePath}php/logout.php`;
    }
}



// Detecta automáticamente la ruta base según la página actual
function getBasePath() {
    const path = window.location.pathname;

    // Si estás en la raíz del proyecto (index o login)
    if (path.endsWith('/SISCA/') ||
        path.endsWith('/SISCA/index.html') ||
        path.endsWith('/SISCA/login.html') ||
        path.endsWith('/sisca/') ||
        path.endsWith('/sisca/index.html') ||
        path.endsWith('/sisca/login.html')) {
        return './';
    }

    // Si estás dentro de templates o más profundo
    // Buscar el directorio SISCA (case insensitive)
    const siscaMatch = path.match(/\/SISCA\//i);
    if (siscaMatch) {
        const afterSisca = path.substring(siscaMatch.index + siscaMatch[0].length);
        const depth = afterSisca.split('/').filter(p => p).length - 1;
        return depth > 0 ? '../'.repeat(depth) : './';
    }

    // Fallback: contar niveles desde el final
    const parts = path.split('/').filter(p => p);
    if (parts.length > 0 && (parts[parts.length - 1].endsWith('.html') || parts[parts.length - 1].endsWith('.php'))) {
        // Estamos en un archivo, contar carpetas hacia atrás
        const depth = parts.length - 2; // -1 por el archivo, -1 por la raíz
        return depth > 0 ? '../'.repeat(depth) : './';
    }

    return './';
}


// --- Logout automático por inactividad ---
let inactivityTime = function () {
    let time;
    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutos en milisegundos

    // Función que redirige al logout
    function logoutByInactivity() {
        alert('Sesión cerrada por inactividad.');
        window.location.href = `${getBasePath()}php/logout.php`;
    }

    // Reinicia el temporizador
    function resetTimer() {
        clearTimeout(time);
        time = setTimeout(logoutByInactivity, INACTIVITY_LIMIT);
    }

    // Escucha eventos de actividad del usuario
    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    document.onscroll = resetTimer;
    document.onclick = resetTimer;
};

// Inicia el detector de inactividad
document.addEventListener('DOMContentLoaded', inactivityTime);
