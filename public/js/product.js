(function () {
  const { esc, toman, priceHtml, imageOf, addToCart, productCard } = window.Store;

  function paragraphs(text) {
    return String(text || '').split(/\n+/).filter(Boolean).map((part) => `<p>${esc(part)}</p>`).join('');
  }

  async function boot() {
    const id = new URLSearchParams(location.search).get('id');
    const root = document.getElementById('pdp');
    if (!id) {
      root.innerHTML = '<div class="empty"><h2>دست‌سازه‌ای انتخاب نشده</h2><p><a class="text-link" href="/shop.html">بازگشت به فروشگاه</a></p></div>';
      return;
    }
    const [productRes, categories, allRes] = await Promise.all([
      fetch(`/api/products/${encodeURIComponent(id)}`),
      fetch('/api/categories').then((res) => res.json()),
      fetch('/api/products').then((res) => res.json()),
    ]);
    const product = await productRes.json();
    if (!productRes.ok) {
      root.innerHTML = `<div class="empty"><h2>این دست‌سازه پیدا نشد</h2><p><a class="text-link" href="/shop.html">دیدن دست‌سازه‌های دیگر</a></p></div>`;
      return;
    }
    const names = Object.fromEntries(categories.map((cat) => [cat.id, cat.name]));
    const sold = product.stock < 1;
    const low = product.stock > 0 && product.stock <= 3;
    document.title = `${product.name} | Elf crafts`;
    root.innerHTML = `
      <div class="pdp-media"><img src="${esc(imageOf(product))}" alt="${esc(product.name)}"></div>
      <div class="pdp-info">
        <p class="crumb"><a href="/">خانه</a> / <a href="/shop.html?cat=${esc(product.categoryId)}">${esc(names[product.categoryId] || 'فروشگاه')}</a> / ${esc(product.name)}</p>
        <p class="eyebrow">${esc(names[product.categoryId] || 'دست‌سازه')}</p>
        <h1>${esc(product.name)}</h1>
        <div class="pdp-price">${priceHtml(product)}</div>
        <p class="stock-note${sold || low ? ' warn' : ''}">${sold ? 'الان در کارگاه موجود نیست.' : low ? `فقط ${product.stock.toLocaleString('fa-IR')} عدد مانده.` : `${product.stock.toLocaleString('fa-IR')} عدد در کارگاه هست.`}</p>
        <div class="buy-row">
          <div class="qty">
            <button type="button" id="minus" aria-label="کم کردن">−</button>
            <input id="qty" inputmode="numeric" value="۱" aria-label="تعداد">
            <button type="button" id="plus" aria-label="زیاد کردن">+</button>
          </div>
          <button type="button" class="btn btn-forest" id="add" ${sold ? 'disabled' : ''}>${sold ? 'ناموجود' : 'افزودن به سبد'}</button>
        </div>
        <ul class="trust">
          <li>دست‌ساز در کارگاه Elf crafts</li>
          <li>بسته‌بندی پارچهٔ کتانی</li>
          <li>هماهنگی پیش از ارسال</li>
        </ul>
        <div class="prose">${paragraphs(product.description)}</div>
        <p class="care">مراقبت: از آب، عطر و خوابیدن با دست‌سازه دورش نگه دار تا روکش و نخ‌ها آرام بمانند.</p>
      </div>`;
    const related = allRes.filter((item) => item.categoryId === product.categoryId && item.id !== product.id).slice(0, 3);
    const box = document.getElementById('related');
    if (related.length) {
      box.innerHTML = related.map((item) => productCard(item, names[item.categoryId])).join('');
    } else {
      document.getElementById('related-wrap').hidden = true;
    }

    const qtyInput = document.getElementById('qty');
    function currentQty() {
      const digits = qtyInput.value.replace(/[۰-۹]/g, (ch) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(ch))).replace(/\D/g, '');
      let n = Number(digits || '1');
      if (!n || n < 1) n = 1;
      if (n > product.stock) n = Math.max(product.stock, 1);
      if (n > 10) n = 10;
      qtyInput.value = n.toLocaleString('fa-IR');
      return n;
    }
    document.getElementById('minus').addEventListener('click', () => {
      const n = currentQty();
      qtyInput.value = Math.max(1, n - 1).toLocaleString('fa-IR');
    });
    document.getElementById('plus').addEventListener('click', () => {
      const n = currentQty();
      const cap = Math.min(10, product.stock || 1);
      qtyInput.value = Math.min(cap, n + 1).toLocaleString('fa-IR');
    });
    document.getElementById('add').addEventListener('click', () => addToCart(product.id, currentQty()));
  }

  boot().catch(() => {
    document.getElementById('pdp').innerHTML = '<div class="empty"><h2>ارتباط قطع شد</h2></div>';
  });
})();
