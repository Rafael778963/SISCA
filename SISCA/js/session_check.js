document.addEventListener('DOMContentLoaded', function () {
    const basePath = getBasePath();
    const sessionUrl = `${basePath}php/userName_session.php`;
    const loginUrl = `${basePath}login.html`;

    verifySession(sessionUrl, loginUrl);

    setInterval(() => verifySession(sessionUrl, loginUrl, true), 300000);

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => logout(basePath));
    }
});

// ============================================
// VERIFICAR SESIÓN
// ============================================
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

// ============================================
// CARGAR INFORMACIÓN DEL USUARIO
// ============================================
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

// ============================================
// CERRAR SESIÓN
// ============================================
function logout() {
    const basePath = getBasePath();
    if (confirm('¿Deseas cerrar sesión?')) {
        window.location.href = `${basePath}php/logout.php`;
    }
}

// ============================================
// DETECTAR RUTA BASE
// ============================================
function getBasePath() {
    const path = window.location.pathname;

    if (path.endsWith('/SISCA/') ||
        path.endsWith('/SISCA/index.html') ||
        path.endsWith('/SISCA/login.html') ||
        path.endsWith('/sisca/') ||
        path.endsWith('/sisca/index.html') ||
        path.endsWith('/sisca/login.html')) {
        return './';
    }

    const siscaMatch = path.match(/\/SISCA\//i);
    if (siscaMatch) {
        const afterSisca = path.substring(siscaMatch.index + siscaMatch[0].length);
        const depth = afterSisca.split('/').filter(p => p).length - 1;
        return depth > 0 ? '../'.repeat(depth) : './';
    }

    const parts = path.split('/').filter(p => p);
    if (parts.length > 0 && (parts[parts.length - 1].endsWith('.html') || parts[parts.length - 1].endsWith('.php'))) {
        const depth = parts.length - 2;
        return depth > 0 ? '../'.repeat(depth) : './';
    }

    return './';
}

// ============================================
// LOGOUT AUTOMÁTICO POR INACTIVIDAD
// ============================================
let inactivityTime = function () {
    let time;
    const INACTIVITY_LIMIT = 15 * 60 * 1000;

    function logoutByInactivity() {
        alert('Sesión cerrada por inactividad.');
        window.location.href = `${getBasePath()}php/logout.php`;
    }

    function resetTimer() {
        clearTimeout(time);
        time = setTimeout(logoutByInactivity, INACTIVITY_LIMIT);
    }

    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    document.onscroll = resetTimer;
    document.onclick = resetTimer;
};

document.addEventListener('DOMContentLoaded', inactivityTime);
