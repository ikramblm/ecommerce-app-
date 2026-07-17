export function logoBadgeHtml(size = 'sm') {
  if (size === 'sm') {
    return `<div class="logo-badge logo-badge--sm"><span class="logo-badge__mark">d</span></div>`;
  }
  return `
    <div class="logo-badge logo-badge--${size}">
      <span class="logo-badge__mark">doudi's beauty</span>
      <span class="logo-badge__tagline">Skincare | Makeup | Aesthetics</span>
    </div>`;
}

export function renderHeader(activePage = 'home') {
  const link = (page, href, key) => `
    <a href="${href}" data-i18n="nav.${key}"
       class="block px-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
         activePage === page ? 'text-rose-600' : 'text-gray-800 hover:text-rose-500'
       }"></a>`;

  return `
    <header class="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div class="relative max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        <button id="mobile-menu-btn" class="text-2xl text-gray-800" aria-label="Menu">☰</button>

        <a href="/index.html" class="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          ${logoBadgeHtml('sm')}
          <span class="hidden sm:block text-base font-extrabold uppercase tracking-widest text-rose-600" data-i18n="brand">Doudis Beauty</span>
        </a>

        <div class="flex rounded-full overflow-hidden border border-gray-200 text-xs font-bold">
          <button data-lang-btn="fr" class="px-2.5 py-1.5">FR</button>
          <button data-lang-btn="en" class="px-2.5 py-1.5">EN</button>
          <button data-lang-btn="ar" class="px-2.5 py-1.5">AR</button>
        </div>
      </div>

      <nav id="mobile-menu" class="hidden flex-col divide-y divide-gray-100 border-t border-gray-100 bg-white px-4">
        ${link('home', '/index.html', 'home')}
        ${link('products', '/produits.html', 'products')}
        ${link('home', '/index.html#about', 'about')}
        ${link('home', '/index.html#contact', 'contact')}
      </nav>
    </header>`;
}

const INSTAGRAM_URL = 'https://www.instagram.com/doudis_beauty/';

const INSTAGRAM_ICON = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" stroke-width="1.8"/>
    <circle cx="12" cy="12" r="4.3" stroke="currentColor" stroke-width="1.8"/>
    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/>
  </svg>`;

export function renderFooter() {
  return `
    <footer id="contact" class="bg-rose-900 text-rose-50 mt-16">
      <div class="max-w-6xl mx-auto px-4 py-14 grid gap-10 sm:grid-cols-2">
        <div>
          <div class="flex items-center gap-2 mb-3">
            ${logoBadgeHtml('sm')}
            <span class="text-base font-extrabold uppercase tracking-widest">Doudis Beauty</span>
          </div>
          <p class="text-rose-200 text-sm" data-i18n="footer.tagline"></p>
          <p class="text-rose-200 text-sm mt-1" data-i18n="footer.location"></p>
        </div>
        <div>
          <h3 class="font-extrabold uppercase tracking-widest text-xs mb-3" data-i18n="footer.contactTitle"></h3>
          <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer"
             class="inline-flex items-center gap-2 text-rose-50 hover:text-white font-semibold text-sm transition-colors">
            ${INSTAGRAM_ICON} @doudis_beauty
          </a>
        </div>
      </div>
      <div class="border-t border-rose-800 py-4 text-center text-xs text-rose-300 uppercase tracking-wide">
        © <span id="footer-year"></span> Doudis Beauty — <span data-i18n="footer.rights"></span>
      </div>
    </footer>`;
}

export function mountLayout(activePage) {
  const headerEl = document.getElementById('header');
  const footerEl = document.getElementById('footer');
  if (headerEl) headerEl.innerHTML = renderHeader(activePage);
  if (footerEl) footerEl.innerHTML = renderFooter();

  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const menuBtn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      const isHidden = menu.classList.contains('hidden');
      menu.classList.toggle('hidden', !isHidden);
      menu.classList.toggle('flex', isHidden);
    });
  }
}
