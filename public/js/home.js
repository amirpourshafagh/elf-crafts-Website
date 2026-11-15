(function () {
  const { esc, productCard, icon } = window.Store;

  async function load() {
    const [categories, products] = await Promise.all([
      fetch('/api/categories').then((res) => res.json()),
      fetch('/api/products?featured=1').then((res) => res.json()),
    ]);
    const names = Object.fromEntries(categories.map((cat) => [cat.id, cat.name]));
    const mosaic = document.getElementById('mosaic');
    mosaic.innerHTML = categories.map((cat) => `
      <a class="tile" href="/shop.html?cat=${esc(cat.id)}">
        <span class="tile-icon">${icon(cat.icon)}</span>
        <strong>${esc(cat.name)}</strong>
        <em>${esc(cat.description)}</em>
      </a>`).join('');
    mosaic.setAttribute('aria-busy', 'false');
    const featured = document.getElementById('featured');
    featured.innerHTML = products.length
      ? products.slice(0, 4).map((product) => productCard(product, names[product.categoryId])).join('')
      : '<p>هنوز دست‌سازه برگزیده‌ای چیده نشده.</p>';
  }

  load().catch(() => {
    const mosaic = document.getElementById('mosaic');
    if (mosaic) mosaic.innerHTML = '<p>فروشگاه الان در دسترس نیست. سرور را روشن کن و صفحه را تازه کن.</p>';
  });
})();
