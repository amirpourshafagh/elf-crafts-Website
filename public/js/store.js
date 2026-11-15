(function () {
  const CART_KEY = 'silverleaf-cart';
  const FALLBACK = {
    cat_necklace: '/images/p_moonleaf.svg',
    cat_earring: '/images/p_dew.svg',
    cat_bracelet: '/images/p_vine.svg',
    cat_hair: '/images/p_crown.svg',
    cat_ring: '/images/p_bud.svg',
    cat_anklet: '/images/p_moss.svg',
  };

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
  }

  function toman(n) {
    return `${Number(n || 0).toLocaleString('fa-IR')} تومان`;
  }

  function readCart() {
    try {
      const data = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(data) ? data.filter((row) => row && row.id && row.qty > 0) : [];
    } catch (err) {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateBadges();
  }

  function updateBadges() {
    const count = readCart().reduce((sum, item) => sum + Number(item.qty || 0), 0);
    document.querySelectorAll('.cart-count').forEach((el) => {
      el.textContent = count.toLocaleString('fa-IR');
      el.hidden = count === 0;
    });
  }

  let toastTimer = 0;
  function toast(message, isError) {
    let node = document.getElementById('toast');
    if (!node) {
      node = document.createElement('div');
      node.id = 'toast';
      node.className = 'toast';
      node.setAttribute('role', 'status');
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.toggle('error', !!isError);
    node.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('show'), 2400);
  }

  async function addToCart(id, qty) {
    const amount = Math.max(1, Number(qty) || 1);
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
    const product = await res.json().catch(() => ({}));
    if (!res.ok) return toast(product.error || 'این دست‌سازه پیدا نشد', true);
    if (product.stock < 1) return toast('این دست‌سازه تمام شده', true);
    const cart = readCart();
    const row = cart.find((item) => item.id === id);
    const next = (row ? row.qty : 0) + amount;
    if (next > product.stock) return toast('بیشتر از موجودی کارگاه در سبد است', true);
    if (next > 10) return toast('از هر دست‌سازه تا ۱۰ عدد می‌توانی برداری', true);
    if (row) row.qty = next;
    else cart.push({ id, qty: amount });
    writeCart(cart);
    toast('به سبد افزوده شد');
  }

  function imageOf(product) {
    return product.image || FALLBACK[product.categoryId] || '/images/mark.svg';
  }

  function priceHtml(product) {
    const sale = product.comparePrice && product.comparePrice > product.price;
    const off = sale ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
    return `<div class="price-row"><strong>${toman(product.price)}</strong>${sale ? `<s>${toman(product.comparePrice)}</s><em>${off.toLocaleString('fa-IR')}٪</em>` : ''}</div>`;
  }

  function productCard(product, catName) {
    const sold = product.stock < 1;
    const badge = sold ? 'ناموجود' : (product.badge || '');
    return `<article class="card">
      <a class="card-media" href="/product.html?id=${esc(product.id)}">
        <img src="${esc(imageOf(product))}" alt="${esc(product.name)}" loading="lazy">
        ${badge ? `<span class="badge${sold ? ' sold' : ''}">${esc(badge)}</span>` : ''}
      </a>
      <div class="card-body">
        ${catName ? `<p class="card-cat">${esc(catName)}</p>` : ''}
        <a class="card-title" href="/product.html?id=${esc(product.id)}">${esc(product.name)}</a>
        ${priceHtml(product)}
        <button type="button" class="btn btn-forest" ${sold ? 'disabled' : `data-add="${esc(product.id)}"`}>${sold ? 'ناموجود' : 'افزودن به سبد'}</button>
      </div>
    </article>`;
  }

  function icon(name) {
    return (window.ICONS && window.ICONS[name]) || (window.ICONS && window.ICONS.leaf) || '';
  }

  function start() {
    updateBadges();
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().toLocaleDateString('fa-IR', { year: 'numeric' });
    const page = document.body.dataset.page;
    document.querySelectorAll('[data-nav]').forEach((link) => {
      if (link.dataset.nav === page) link.setAttribute('aria-current', 'page');
    });
    const menu = document.getElementById('menu-btn');
    const drawer = document.getElementById('drawer');
    const close = document.getElementById('drawer-close');
    function shut() {
      if (!drawer) return;
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      if (menu) menu.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('lock');
    }
    function open() {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      menu.setAttribute('aria-expanded', 'true');
      document.body.classList.add('lock');
      if (close) close.focus();
    }
    if (menu && drawer) {
      menu.addEventListener('click', open);
      if (close) close.addEventListener('click', shut);
      drawer.addEventListener('click', (event) => {
        if (event.target === drawer || event.target.closest('a')) shut();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') shut();
      });
    }
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-add]');
      if (!button) return;
      addToCart(button.dataset.add, 1);
    });
    window.addEventListener('pageshow', updateBadges);
  }

  window.Store = { esc, toman, readCart, writeCart, addToCart, productCard, priceHtml, imageOf, icon, toast, updateBadges };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
