import '../css/main.css';
import { initI18n, t } from './i18n.js';
import { api, setToken, getToken } from './api.js';

initI18n();

if (getToken()) {
  window.location.href = '/admin-dashboard.html';
}

const form = document.getElementById('login-form');
const errorEl = document.getElementById('login-error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.classList.add('hidden');
  const formData = new FormData(form);

  try {
    const { token } = await api.login(formData.get('email'), formData.get('password'));
    setToken(token);
    window.location.href = '/admin-dashboard.html';
  } catch (err) {
    errorEl.textContent = err.status === 401 ? t('admin.loginError') : err.message;
    errorEl.classList.remove('hidden');
  }
});
