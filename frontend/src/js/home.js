import '../css/main.css';
import { initI18n } from './i18n.js';
import { mountLayout } from './layout.js';
import { api } from './api.js';
import { productCardHtml } from './productCard.js';

mountLayout('home');
initI18n();

const grid = document.getElementById('featured-grid');

async function loadFeatured() {
  if (!grid) return;
  try {
    const products = await api.getProducts({ featured: 'true' });
    const list = products.length ? products : await api.getProducts();
    grid.innerHTML = list.slice(0, 8).map(productCardHtml).join('');
  } catch (err) {
    grid.innerHTML = `<p class="col-span-full text-center text-gray-400">${err.message}</p>`;
  }
}

loadFeatured();
window.addEventListener('doudis:langchange', loadFeatured);
