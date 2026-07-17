import { t, localizedField } from './i18n.js';
import { imageUrl } from './api.js';

export function productCardHtml(product) {
  const title = localizedField(product, 'title');
  const img = imageUrl(product.image_url);
  const outOfStock = product.stock_status === 'out_of_stock';
  const href = `/produit.html?id=${product.id}`;

  return `
    <div class="group fade-in">
      <a href="${href}" class="block aspect-square bg-rose-50 overflow-hidden relative mb-3">
        ${img
          ? `<img src="${img}" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />`
          : `<span class="absolute inset-0 flex items-center justify-center text-5xl">💅</span>`}
        ${outOfStock ? `<span class="absolute top-2 right-2 bg-gray-900/80 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1">${t('product.outOfStock')}</span>` : ''}
      </a>
      <p class="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">${product.category}</p>
      <a href="${href}" class="block font-bold text-gray-900 text-sm md:text-base leading-snug mb-1 hover:text-rose-600 transition-colors line-clamp-2">${title}</a>
      <p class="text-rose-600 font-extrabold mb-3">${Number(product.price).toLocaleString()} ${t('products.da')}</p>
      <a href="${href}"
         class="block text-center border border-gray-900 text-gray-900 hover:bg-rose-600 hover:text-white hover:border-rose-600 font-bold uppercase text-[11px] tracking-widest py-2.5 transition-colors"
         >${t('products.viewDetails')}</a>
    </div>`;
}
