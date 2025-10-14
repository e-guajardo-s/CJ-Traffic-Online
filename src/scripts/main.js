// This file contains JavaScript code to handle form submission, validation, and any interactive elements on the login page.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;

  const VALID_EMAIL = 'correo@cjtraffic.cl';
  const VALID_PASS  = 'CJtraffic2025';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawEmail = form.elements.email.value.trim();
    const email = rawEmail.toLowerCase();
    const pass  = form.elements.password.value;

    if (email === VALID_EMAIL && pass === VALID_PASS) {
      sessionStorage.setItem('cj_user_email', rawEmail);
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