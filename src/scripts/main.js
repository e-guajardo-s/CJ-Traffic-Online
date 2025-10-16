// This file contains JavaScript code to handle form submission, validation, and any interactive elements on the login page.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;

  // Permitir múltiples usuarios válidos con rol
  const USERS = [
    { email: 'correo@cjtraffic.cl',     password: 'CJtraffic2025',     role: 'admin' },
    { email: 'correo@municipalidad.cl', password: 'Municipalidad2025', role: 'municipal' },
    { email: 'tecnico@cjtraffic.cl',    password: 'Tecnico2025',       role: 'tecnico' },
  ];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawEmail = form.elements.email.value.trim();
    const email = rawEmail.toLowerCase();
    const pass  = form.elements.password.value;

    const user = USERS.find(u => u.email.toLowerCase() === email && u.password === pass);

    if (user) {
      sessionStorage.setItem('cj_user_email', rawEmail);
      sessionStorage.setItem('cj_user_role', user.role); // <- rol para permisos
      window.location.href = './dashboard.html';
    } else {
      showError('Usuario o contraseña incorrectos');
    }
  });

  function showError(msg) {
    let el = document.getElementById('login-error');
    if (!el) {
      el = document.createElement('p');
      el.id = 'login-error';
      el.style.color = '#d32f2f';
      el.style.fontSize = '12px';
      el.style.textAlign = 'center';
      el.style.marginTop = '8px';
      document.querySelector('.login-container').appendChild(el);
    }
    el.textContent = msg;
  }
});