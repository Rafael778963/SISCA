const roles = [
  { name: "SUBDIRECTOR_ACADÉMICO", icon: "fa-solid fa-graduation-cap" },
  { name: "PTC_CARGA_ACADÉMICA", icon: "fa-solid fa-book" },
  { name: "COORDINADOR_MATUTINO", icon: "fa-solid fa-people-arrows" },
  { name: "COORDINADOR_NOCTURNO", icon: "fa-solid fa-people-arrows" },
  { name: "PTC_PI_MATUTINO", icon: "fa-solid fa-screwdriver-wrench" },
  { name: "PTC_PI_NOCTURNO", icon: "fa-solid fa-screwdriver-wrench" },
  { name: "TUTORÍA", icon: "fa-solid fa-chalkboard-user" },
  { name: "PREFECTURA", icon: "fa-solid fa-shield-halved" },
  { name: "PROYECTO_INTEGRADOR", icon: "fa-solid fa-screwdriver-wrench" }
];

let currentIndex = 0;

function updateRole() {
  const role = roles[currentIndex];
  document.getElementById("roleIcon").innerHTML = `<i class='${role.icon}'></i>`;
  document.getElementById("username").value = role.name;
}

function nextRole() {
  currentIndex = (currentIndex + 1) % roles.length;
  updateRole();
}

function prevRole() {
  currentIndex = (currentIndex - 1 + roles.length) % roles.length;
  updateRole();
}


function showMessage(message, type) {
  const existingMsg = document.querySelector('.login-message');
  if (existingMsg) {
    existingMsg.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `login-message ${type}`;
  messageDiv.textContent = message;

  const loginBox = document.querySelector('.login-box');
  loginBox.parentNode.insertBefore(messageDiv, loginBox.nextSibling);

  setTimeout(() => {
    messageDiv.classList.add('fade-out');
    setTimeout(() => messageDiv.remove(), 300);
  }, 3000);
}


function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const passwordInput = document.getElementById("password");
  const password = passwordInput.value;

  if (!username || !password) {
    showMessage('Por favor complete todos los campos', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  fetch('php/login.php', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = data.redirect;
      } else {
        showMessage(data.message, 'error');
        passwordInput.value = '';
        passwordInput.focus();
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showMessage('Error al conectar con el servidor', 'error');
      passwordInput.value = '';
      passwordInput.focus();
    });
}

document.addEventListener('DOMContentLoaded', function () {
  updateRole();

  const loginBtn = document.querySelector('.login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }

  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        handleLogin(e);
      }
    });
  }

  
  const togglePassword = document.getElementById('togglePassword');
  if (togglePassword) {
    togglePassword.addEventListener('click', function () {
      const passwordInput = document.getElementById('password');

      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.innerHTML = '<i class="fa-solid fa-eye"></i>';
      } else {
        passwordInput.type = 'password';
        this.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      prevRole();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      nextRole();
    }
  });
});