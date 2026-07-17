import '../css/main.css';
import { initI18n, t } from './i18n.js';
import { mountLayout } from './layout.js';
import { api } from './api.js';
import { productCardHtml } from './productCard.js';

mountLayout('products');
initI18n();

const grid = document.getElementById('products-grid');
const status = document.getElementById('products-status');
const categorySelect = document.getElementById('filter-category');
const minInput = document.getElementById('filter-min');
const maxInput = document.getElementById('filter-max');

const urlParams = new URLSearchParams(window.location.search);
const initialCategory = urlParams.get('category');
if (initialCategory) categorySelect.value = initialCategory;

async function loadProducts() {
  status.classList.remove('hidden');
  status.textContent = t('products.loading');
  grid.innerHTML = '';

  const params = {};
  if (categorySelect.value) params.category = categorySelect.value;
  if (minInput.value) params.minPrice = minInput.value;
  if (maxInput.value) params.maxPrice = maxInput.value;

  try {
    const products = await api.getProducts(params);
    if (products.length === 0) {
      status.textContent = t('products.empty');
      return;
    }
    status.classList.add('hidden');
    grid.innerHTML = products.map(productCardHtml).join('');
  } catch (err) {
    status.textContent = err.message;
  }
}

document.getElementById('filter-apply').addEventListener('click', loadProducts);
document.getElementById('filter-reset').addEventListener('click', () => {
  categorySelect.value = '';
  minInput.value = '';
  maxInput.value = '';
  loadProducts();
});

loadProducts();
window.addEventListener('doudis:langchange', loadProducts);
