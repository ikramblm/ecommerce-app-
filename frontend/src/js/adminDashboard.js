import '../css/main.css';
import { initI18n, t, localizedField } from './i18n.js';
import { api, imageUrl, clearToken, getToken } from './api.js';

if (!getToken()) {
  window.location.href = '/admin-login.html';
}

initI18n();

api.me().catch(() => {
  clearToken();
  window.location.href = '/admin-login.html';
});

document.getElementById('logout-btn').addEventListener('click', () => {
  clearToken();
  window.location.href = '/admin-login.html';
});

// ---------- Tabs ----------
const tabProductsBtn = document.getElementById('tab-products-btn');
const tabOrdersBtn = document.getElementById('tab-orders-btn');
const tabProducts = document.getElementById('tab-products');
const tabOrders = document.getElementById('tab-orders');

function setActiveTab(tab) {
  const isProducts = tab === 'products';
  tabProducts.classList.toggle('hidden', !isProducts);
  tabOrders.classList.toggle('hidden', isProducts);
  tabProductsBtn.classList.toggle('bg-rose-500', isProducts);
  tabProductsBtn.classList.toggle('text-white', isProducts);
  tabProductsBtn.classList.toggle('bg-white', !isProducts);
  tabOrdersBtn.classList.toggle('bg-rose-500', !isProducts);
  tabOrdersBtn.classList.toggle('text-white', !isProducts);
  tabOrdersBtn.classList.toggle('bg-white', isProducts);
  if (!isProducts) loadOrders();
}

tabProductsBtn.addEventListener('click', () => setActiveTab('products'));
tabOrdersBtn.addEventListener('click', () => setActiveTab('orders'));

// ---------- Products ----------
const productsList = document.getElementById('products-list');
const productModal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');
const productModalTitle = document.getElementById('product-modal-title');
const productFormError = document.getElementById('product-form-error');

let productsCache = [];

async function loadProducts() {
  try {
    productsCache = await api.getProducts();
    renderProducts();
  } catch (err) {
    productsList.innerHTML = `<p class="text-red-500">${err.message}</p>`;
  }
}

function renderProducts() {
  if (productsCache.length === 0) {
    productsList.innerHTML = `<p class="text-gray-400">${t('admin.noProducts')}</p>`;
    return;
  }
  productsList.innerHTML = productsCache.map((p) => {
    const img = imageUrl(p.image_url);
    return `
      <div class="bg-white rounded-xl border border-rose-100 p-4 flex items-center gap-4">
        <div class="w-16 h-16 rounded-lg bg-rose-100 flex items-center justify-center overflow-hidden shrink-0">
          ${img ? `<img src="${img}" class="w-full h-full object-cover" />` : `<span class="text-2xl">💅</span>`}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-800 truncate">${localizedField(p, 'title')}</p>
          <p class="text-xs text-gray-400">${p.category} · ${Number(p.price).toLocaleString()} ${t('products.da')} ${p.is_featured ? '· ⭐' : ''}</p>
        </div>
        <button data-edit="${p.id}" class="text-sm font-semibold text-rose-600 border border-rose-200 rounded-lg px-3 py-1.5">✏️</button>
        <button data-delete="${p.id}" class="text-sm font-semibold text-red-600 border border-red-200 rounded-lg px-3 py-1.5">🗑️</button>
      </div>`;
  }).join('');

  productsList.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openProductModal(btn.getAttribute('data-edit')));
  });
  productsList.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => deleteProduct(btn.getAttribute('data-delete')));
  });
}

function openProductModal(id) {
  productForm.reset();
  productFormError.classList.add('hidden');
  const product = id ? productsCache.find((p) => String(p.id) === String(id)) : null;

  productModalTitle.textContent = product ? t('admin.editProduct') : t('admin.addProduct');
  productForm.elements.id.value = product ? product.id : '';

  if (product) {
    ['title_fr', 'title_en', 'title_ar', 'description_fr', 'description_en', 'description_ar', 'price', 'category', 'stock_status']
      .forEach((field) => { productForm.elements[field].value = product[field] ?? ''; });
    productForm.elements.is_featured.checked = !!product.is_featured;
  }

  productModal.classList.remove('hidden');
}

function closeProductModal() {
  productModal.classList.add('hidden');
}

document.getElementById('add-product-btn').addEventListener('click', () => openProductModal(null));
document.getElementById('product-modal-close').addEventListener('click', closeProductModal);
document.getElementById('product-form-cancel').addEventListener('click', closeProductModal);
productModal.addEventListener('click', (e) => { if (e.target === productModal) closeProductModal(); });

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  productFormError.classList.add('hidden');

  const id = productForm.elements.id.value;
  const formData = new FormData(productForm);
  formData.set('is_featured', productForm.elements.is_featured.checked ? 'true' : 'false');
  if (!formData.get('image') || formData.get('image').size === 0) formData.delete('image');

  try {
    if (id) {
      await api.updateProduct(id, formData);
    } else {
      await api.createProduct(formData);
    }
    closeProductModal();
    await loadProducts();
  } catch (err) {
    productFormError.textContent = err.message;
    productFormError.classList.remove('hidden');
  }
});

async function deleteProduct(id) {
  if (!window.confirm(t('admin.confirmDelete'))) return;
  try {
    await api.deleteProduct(id);
    await loadProducts();
  } catch (err) {
    window.alert(err.message);
  }
}

// ---------- Orders ----------
const ordersHead = document.getElementById('orders-head');
const ordersBody = document.getElementById('orders-body');

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  processed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-200 text-gray-500',
};

function renderOrdersHead() {
  const cols = ['name', 'phone', 'email', 'wilaya', 'address', 'payment', 'delivery', 'product', 'date', 'status', 'actions'];
  ordersHead.innerHTML = cols.map((c) => `<th class="px-3 py-2 text-start whitespace-nowrap">${t(`admin.ordersTable.${c}`)}</th>`).join('');
}

async function loadOrders() {
  renderOrdersHead();
  try {
    const orders = await api.getOrders();
    if (orders.length === 0) {
      ordersBody.innerHTML = `<tr><td colspan="11" class="text-center text-gray-400 py-6">${t('admin.noOrders')}</td></tr>`;
      return;
    }
    ordersBody.innerHTML = orders.map((o) => `
      <tr class="border-t border-rose-50">
        <td class="px-3 py-2 whitespace-nowrap">${o.customer_name}</td>
        <td class="px-3 py-2 whitespace-nowrap" dir="ltr">${o.customer_phone}</td>
        <td class="px-3 py-2 whitespace-nowrap">${o.customer_email}</td>
        <td class="px-3 py-2 whitespace-nowrap">${o.wilaya}</td>
        <td class="px-3 py-2 max-w-[12rem] truncate" title="${o.address}">${o.address}</td>
        <td class="px-3 py-2 whitespace-nowrap">${t(`orderForm.payment${o.payment_type === 'cod' ? 'Cod' : o.payment_type === 'bank_transfer' ? 'Bank' : 'Ccp'}`)}</td>
        <td class="px-3 py-2 whitespace-nowrap">${t(`orderForm.delivery${o.delivery_type === 'home' ? 'Home' : 'Pickup'}`)}</td>
        <td class="px-3 py-2 whitespace-nowrap">${o.product_title} × ${o.quantity}</td>
        <td class="px-3 py-2 whitespace-nowrap">${new Date(o.created_at).toLocaleDateString()}</td>
        <td class="px-3 py-2 whitespace-nowrap">
          <span class="text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[o.status]}">${t(`admin.status.${o.status}`)}</span>
        </td>
        <td class="px-3 py-2 whitespace-nowrap space-x-1">
          ${o.status !== 'processed' ? `<button data-status="processed" data-id="${o.id}" class="text-green-600 text-xs font-semibold border border-green-200 rounded px-2 py-1">${t('admin.markProcessed')}</button>` : ''}
          ${o.status !== 'cancelled' ? `<button data-status="cancelled" data-id="${o.id}" class="text-red-600 text-xs font-semibold border border-red-200 rounded px-2 py-1">${t('admin.markCancelled')}</button>` : ''}
        </td>
      </tr>`).join('');

    ordersBody.querySelectorAll('[data-status]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await api.updateOrderStatus(btn.getAttribute('data-id'), btn.getAttribute('data-status'));
          loadOrders();
        } catch (err) {
          window.alert(err.message);
        }
      });
    });
  } catch (err) {
    ordersBody.innerHTML = `<tr><td colspan="11" class="text-center text-red-500 py-6">${err.message}</td></tr>`;
  }
}

setActiveTab('products');
loadProducts();
window.addEventListener('doudis:langchange', () => {
  renderProducts();
  if (!tabOrders.classList.contains('hidden')) loadOrders();
});
