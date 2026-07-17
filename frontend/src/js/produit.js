import '../css/main.css';
import { initI18n, t, getLang, localizedField } from './i18n.js';
import { mountLayout } from './layout.js';
import { api, imageUrl } from './api.js';
import wilayas from '../i18n/wilayas.json';

mountLayout('products');
initI18n();

const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
const detailEl = document.getElementById('product-detail');
const wilayaSelect = document.getElementById('wilaya-select');
const algerianPhoneRegex = /^0[5-7][0-9]{8}$/;

let currentProduct = null;

function renderWilayaOptions() {
  const lang = getLang();
  const selected = wilayaSelect.value;
  wilayaSelect.innerHTML =
    `<option value="" disabled ${!selected ? 'selected' : ''}>${t('orderForm.chooseWilaya')}</option>` +
    wilayas.map((w) => `<option value="${w.fr}" ${w.fr === selected ? 'selected' : ''}>${w.code}. ${w[lang] || w.fr}</option>`).join('');
}

function renderProductDetail() {
  if (!currentProduct) return;
  const p = currentProduct;
  const title = localizedField(p, 'title');
  const description = localizedField(p, 'description');
  const img = imageUrl(p.image_url);
  const outOfStock = p.stock_status === 'out_of_stock';

  detailEl.innerHTML = `
    <div class="bg-rose-50 overflow-hidden aspect-square flex items-center justify-center">
      ${img ? `<img src="${img}" alt="${title}" class="w-full h-full object-cover" />` : `<span class="text-8xl">💅</span>`}
    </div>
    <div>
      <p class="text-[11px] uppercase tracking-widest text-gray-400 font-bold mb-2">${p.category}</p>
      <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">${title}</h1>
      <p class="text-2xl font-extrabold text-rose-600 mb-6">${Number(p.price).toLocaleString()} ${t('products.da')}</p>
      <h2 class="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">${t('product.description')}</h2>
      <p class="text-gray-600 leading-relaxed mb-6">${description || ''}</p>
      ${outOfStock
        ? `<span class="inline-block bg-gray-200 text-gray-600 font-bold uppercase tracking-widest text-xs px-8 py-3.5">${t('product.outOfStock')}</span>`
        : `<button id="request-btn" class="bg-gray-900 hover:bg-rose-600 text-white font-bold uppercase tracking-widest text-xs px-8 py-3.5 transition-colors">${t('product.requestButton')}</button>`}
    </div>`;

  const requestBtn = document.getElementById('request-btn');
  if (requestBtn) requestBtn.addEventListener('click', openModal);
}

async function loadProduct() {
  if (!productId) {
    detailEl.innerHTML = `<p class="text-gray-400">${t('products.empty')}</p>`;
    return;
  }
  try {
    currentProduct = await api.getProduct(productId);
    renderProductDetail();
  } catch (err) {
    detailEl.innerHTML = `<p class="text-red-500">${err.message}</p>`;
  }
}

// ---- Order modal ----
const modal = document.getElementById('order-modal');
const form = document.getElementById('order-form');
const summaryEl = document.getElementById('order-product-summary');
const errorEl = document.getElementById('order-error');
const submitBtn = document.getElementById('order-submit-btn');
const successView = document.getElementById('order-success');

function openModal() {
  form.reset();
  form.classList.remove('hidden');
  successView.classList.add('hidden');
  errorEl.classList.add('hidden');
  renderWilayaOptions();
  summaryEl.innerHTML = `<strong>${t('orderForm.productSummary')}:</strong> ${localizedField(currentProduct, 'title')}`;
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

document.getElementById('order-modal-close').addEventListener('click', closeModal);
document.getElementById('order-success-close').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.classList.add('hidden');

  const formData = new FormData(form);
  const phone = formData.get('customer_phone').trim();
  if (!algerianPhoneRegex.test(phone)) {
    errorEl.textContent = t('errors.invalidPhone');
    errorEl.classList.remove('hidden');
    return;
  }

  const payload = {
    product_id: Number(productId),
    quantity: Number(formData.get('quantity')) || 1,
    customer_name: formData.get('customer_name').trim(),
    customer_phone: phone,
    customer_email: formData.get('customer_email').trim(),
    wilaya: formData.get('wilaya'),
    address: formData.get('address').trim(),
    payment_type: formData.get('payment_type'),
    delivery_type: formData.get('delivery_type'),
  };

  submitBtn.disabled = true;
  submitBtn.textContent = t('orderForm.submitting');

  try {
    await api.createOrder(payload);
    form.classList.add('hidden');
    successView.classList.remove('hidden');
  } catch (err) {
    errorEl.textContent = err.message || t('orderForm.errorGeneric');
    errorEl.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = t('orderForm.submit');
  }
});

loadProduct();
window.addEventListener('doudis:langchange', () => {
  renderProductDetail();
  if (!modal.classList.contains('hidden')) renderWilayaOptions();
});
