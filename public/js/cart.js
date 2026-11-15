(function () {
  const { esc, toman, imageOf, readCart, writeCart, toast } = window.Store;
  const list = document.getElementById('cart-list');
  const summary = document.getElementById('summary');

  function digits(value) {
    return String(value || '').replace(/[۰-۹]/g, (ch) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(ch))).replace(/\D/g, '');
  }

  async function loadLines() {
    const cart = readCart();
    const lines = [];
    for (const row of cart) {
      const res = await fetch(`/api/products/${encodeURIComponent(row.id)}`);
      if (!res.ok) {
        lines.push({ missing: true, id: row.id, qty: row.qty });
        continue;
      }
      const product = await res.json();
      const qty = Math.min(row.qty, product.stock, 10);
      lines.push({ ...product, qty, capped: qty !== row.qty });
    }
    const next = lines.filter((line) => !line.missing && line.qty > 0).map((line) => ({ id: line.id, qty: line.qty }));
    writeCart(next);
    return lines.filter((line) => !line.missing && line.stock > 0);
  }

  async function render() {
    const lines = await loadLines();
    if (!lines.length) {
      list.innerHTML = `<div class="empty"><h2>سبد هنوز سبک است</h2><p>یک دست‌سازه از جنگل فروشگاه بردار.</p><p><a class="btn btn-forest" href="/shop.html">رفتن به فروشگاه</a></p></div>`;
      summary.hidden = true;
      return;
    }
    summary.hidden = false;
    const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
    list.innerHTML = lines.map((line) => `
      <article class="cart-item">
        <img src="${esc(imageOf(line))}" alt="">
        <div>
          <h2><a href="/product.html?id=${esc(line.id)}">${esc(line.name)}</a></h2>
          <div class="row">
            <div class="qty">
              <button type="button" data-delta="-1" data-id="${esc(line.id)}" aria-label="کم کردن">−</button>
              <input value="${line.qty.toLocaleString('fa-IR')}" aria-label="تعداد" readonly>
              <button type="button" data-delta="1" data-id="${esc(line.id)}" aria-label="زیاد کردن">+</button>
            </div>
            <strong>${toman(line.price * line.qty)}</strong>
          </div>
          <button type="button" class="linkish" data-remove="${esc(line.id)}">حذف</button>
        </div>
      </article>`).join('');
    document.getElementById('total').textContent = toman(total);
  }

  list.addEventListener('click', (event) => {
    const cart = readCart();
    const remove = event.target.closest('[data-remove]');
    const delta = event.target.closest('[data-delta]');
    if (remove) {
      writeCart(cart.filter((row) => row.id !== remove.dataset.remove));
      render();
      return;
    }
    if (!delta) return;
    const row = cart.find((item) => item.id === delta.dataset.id);
    if (!row) return;
    row.qty += Number(delta.dataset.delta);
    writeCart(row.qty < 1 ? cart.filter((item) => item.id !== row.id) : cart);
    render().then(() => {
      const fresh = readCart().find((item) => item.id === delta.dataset.id);
      if (fresh && Number(delta.dataset.delta) > 0 && fresh.qty === row.qty - 1) {
        toast('بیشتر از موجودی نیست', true);
      }
    });
  });

  document.getElementById('checkout').addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = document.getElementById('form-error');
    error.textContent = '';
    const form = event.currentTarget;
    const payload = {
      name: form.name.value,
      phone: digits(form.phone.value) ? form.phone.value : form.phone.value,
      city: form.city.value,
      address: form.address.value,
      note: form.note.value,
      items: readCart(),
    };
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ثبت سفارش انجام نشد');
      writeCart([]);
      list.innerHTML = '';
      summary.innerHTML = `
        <div class="success-card">
          <p class="eyebrow">سفارش ثبت شد</p>
          <strong>${esc(data.order.code)}</strong>
          <p>جمع ${toman(data.order.total)}</p>
          <p>به‌زودی برای هماهنگی ارسال با تو تماس می‌گیریم. دست‌سازه‌ها در پارچهٔ کتانی راهی می‌شوند.</p>
          <a class="btn btn-forest" href="/shop.html">ادامهٔ گشت</a>
        </div>`;
      summary.hidden = false;
    } catch (err) {
      error.textContent = err.message;
      button.disabled = false;
      render();
    }
  });

  render().catch(() => {
    list.innerHTML = '<div class="empty"><h2>سبد باز نشد</h2></div>';
  });
})();
