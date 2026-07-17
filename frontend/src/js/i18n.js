import fr from '../i18n/fr.json';
import en from '../i18n/en.json';
import ar from '../i18n/ar.json';

const DICTS = { fr, en, ar };
const RTL_LANGS = new Set(['ar']);
const STORAGE_KEY = 'doudis_lang';

let currentLang = localStorage.getItem(STORAGE_KEY) || 'fr';
if (!DICTS[currentLang]) currentLang = 'fr';

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

export function t(key) {
  const value = getByPath(DICTS[currentLang], key);
  if (value === undefined) return key;
  return value;
}

export function getLang() {
  return currentLang;
}

export function isRtl() {
  return RTL_LANGS.has(currentLang);
}

function applyDomTranslations() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = isRtl() ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = t(key);
    if (value !== undefined) el.textContent = value;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });

  document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
    const lang = btn.getAttribute('data-lang-btn');
    btn.classList.toggle('bg-rose-500', lang === currentLang);
    btn.classList.toggle('text-white', lang === currentLang);
    btn.classList.toggle('text-rose-700', lang !== currentLang);
  });

  window.dispatchEvent(new CustomEvent('doudis:langchange', { detail: { lang: currentLang } }));
}

export function setLanguage(lang) {
  if (!DICTS[lang]) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  applyDomTranslations();
}

export function initI18n() {
  applyDomTranslations();
  document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang-btn')));
  });
}

export function localizedField(obj, field) {
  return obj[`${field}_${currentLang}`] ?? obj[`${field}_fr`] ?? '';
}
