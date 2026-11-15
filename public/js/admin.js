(function () {
  const STATUS = {
    new: 'جدید',
    making: 'در حال آماده‌سازی',
    shipped: 'ارسال شده',
    done: 'تحویل شده',
    cancelled: 'لغو شده',
  };
  const TITLES = {
    dash: 'نمای کلی',
    products: 'دست‌سازه‌ها',
    cats: 'دسته‌ها',
    orders: 'سفارش‌ها',
    settings: 'ورود مدیر',
  };
  const state = {
    view: sessionStorage.getItem('admin-view') || 'dash',
    products: [],
    categories: [],
    orders: [],
    editor: null,
    query: '',
  };

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
  }

  function toman(n) {
    return `${Number(n || 0).toLocaleString('fa-IR')} تومان`;
  }

  function when(ts) {
    return new Date(ts).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function toast(message) {
    let node = document.getElementById('toast');
    if (!node) {
      node = document.createElement('div');
      node.id = 'toast';
      node.className = 'toast';
      document.body.appendChild(node);
    }
    node.textContent = message;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => node.remove(), 2600);
  }

  function ask(message) {
    return new Promise((resolve) => {
      const node = document.createElement('div');
      node.className = 'modal-back';
      node.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><p>${esc(message)}</p><div class="actions"><button type="button" class="btn btn-ghost" data-no>انصراف</button><button type="button" class="btn btn-danger" data-yes>بله، حذف شود</button></div></div>`;
      document.body.appendChild(node);
      node.addEventListener('click', (event) => {
        if (event.target.closest('[data-yes]')) { node.remove(); resolve(true); }
        else if (event.target.closest('[data-no]') || event.target === node) { node.remove(); resolve(false); }
      });
    });
  }

  async function api(url, opts = {}) {
    const options = { credentials: 'same-origin', method: opts.method || 'GET' };
    if (opts.body instanceof FormData) options.body = opts.body;
    else if (opts.body != null) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(opts.body);
    }
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      location.href = '/admin/login.html';
      throw new Error('auth');
    }
    if (!res.ok) throw new Error(data.error || 'خطا');
    return data;
  }

  function catName(id) {
    const cat = state.categories.find((item) => item.id === id);
    return cat ? cat.name : 'بدون دسته';
  }

  function iconOptions(selected) {
    return window.ICON_LABELS.map(([id, label]) => `<option value="${id}"${id === selected ? ' selected' : ''}>${label}</option>`).join('');
  }

  function renderDash() {
    const open = state.orders.filter((order) => order.status !== 'cancelled' && order.status !== 'done');
    const revenue = state.orders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0);
    const low = state.products.filter((product) => product.stock <= 3);
    const recent = state.orders.slice(0, 5);
    return `
      <div class="stats">
        <article class="stat"><b>${state.products.length.toLocaleString('fa-IR')}</b><span>دست‌سازه</span></article>
        <article class="stat"><b>${state.categories.length.toLocaleString('fa-IR')}</b><span>دسته</span></article>
        <article class="stat"><b>${open.length.toLocaleString('fa-IR')}</b><span>سفارش باز</span></article>
        <article class="stat"><b>${revenue ? revenue.toLocaleString('fa-IR') : '۰'}</b><span>تومان فروش ثبت‌شده</span></article>
      </div>
      <section class="panel">
        <h2>سفارش‌های تازه</h2>
        ${recent.length ? `<div class="list">${recent.map((order) => `<article class="item"><h3>${esc(order.code)} · ${esc(order.customer.name)}</h3><p class="meta">${when(order.createdAt)} · ${toman(order.total)}</p><span class="pill">${STATUS[order.status] || ''}</span></article>`).join('')}</div>` : '<p class="empty">هنوز سفارشی از جنگل نرسیده.</p>'}
      </section>
      <section class="panel">
        <h2>موجودی کم</h2>
        ${low.length ? `<div class="list">${low.map((product) => `<article class="item item-row"><img class="thumb" src="${esc(product.image || '/images/mark.svg')}" alt=""><div class="grow"><h3>${esc(product.name)}</h3><p class="meta">${catName(product.categoryId)}</p></div><span class="pill${product.stock === 0 ? ' warn' : ' gold'}">${product.stock.toLocaleString('fa-IR')} عدد</span></article>`).join('')}</div>` : '<p class="empty">موجودی‌ها آرام و کافی‌اند.</p>'}
      </section>`;
  }

  function editorHtml() {
    if (!state.editor) return '';
    const product = state.editor.id ? state.editor : {
      id: '', name: '', categoryId: state.categories[0] ? state.categories[0].id : '', price: '', comparePrice: '', stock: 1, badge: '', featured: false, description: '', image: '',
    };
    return `
      <div class="backdrop" data-act="close-editor"></div>
      <form class="editor" id="product-form">
        <div class="editor-head">
          <h2>${product.id ? 'ویرایش دست‌سازه' : 'دست‌سازه تازه'}</h2>
          <button type="button" class="btn btn-ghost" data-act="close-editor">بستن</button>
        </div>
        <input type="hidden" name="id" value="${esc(product.id || '')}">
        <label class="field"><span>نام</span><input name="name" required maxlength="80" value="${esc(product.name || '')}"></label>
        <label class="field"><span>دسته</span><select name="categoryId">${state.categories.map((cat) => `<option value="${esc(cat.id)}"${cat.id === product.categoryId ? ' selected' : ''}>${esc(cat.name)}</option>`).join('')}</select></label>
        <label class="field"><span>قیمت (تومان)</span><input name="price" inputmode="numeric" required value="${esc(product.price ?? '')}"></label>
        <label class="field"><span>قیمت قبل از تخفیف، اگر دارد</span><input name="comparePrice" inputmode="numeric" value="${esc(product.comparePrice || '')}"></label>
        <label class="field"><span>موجودی</span><input name="stock" inputmode="numeric" required value="${esc(product.stock ?? 0)}"></label>
        <label class="field"><span>نشان</span>
          <select name="badge">
            <option value=""${product.badge ? '' : ' selected'}>بدون نشان</option>
            ${['تازه', 'پرفروش', 'محدود'].map((badge) => `<option value="${badge}"${product.badge === badge ? ' selected' : ''}>${badge}</option>`).join('')}
          </select>
        </label>
        <label class="check"><input type="checkbox" name="featured" value="on"${product.featured ? ' checked' : ''}> در برگزیده‌های خانه نشان داده شود</label>
        <label class="field"><span>شرح</span><textarea name="description" maxlength="2000">${esc(product.description || '')}</textarea></label>
        <label class="field"><span>تصویر تازه (اختیاری، تا ۳ مگابایت)</span><input id="image-file" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif"></label>
        <img id="preview" class="preview" alt="" src="${esc(product.image || '')}"${product.image ? '' : ' hidden'}>
        <button class="btn btn-gold" type="submit" style="margin-top:12px">ذخیرهٔ دست‌سازه</button>
      </form>`;
  }

  function renderProducts() {
    const q = state.query.trim();
    const rows = state.products.filter((product) => !q || product.name.includes(q) || product.description.includes(q));
    return `
      <div class="toolbar">
        <input id="product-q" placeholder="جستجو در دست‌سازه‌ها" value="${esc(state.query)}">
        <button type="button" class="btn btn-forest" data-act="new-product">دست‌سازه تازه</button>
      </div>
      <div class="list">
        ${rows.length ? rows.map((product) => `
          <article class="item item-row">
            <img class="thumb" src="${esc(product.image || '/images/mark.svg')}" alt="">
            <div class="grow">
              <h3>${esc(product.name)}</h3>
              <p class="meta">${esc(catName(product.categoryId))} · ${toman(product.price)} · موجودی ${product.stock.toLocaleString('fa-IR')}</p>
              <div class="actions">
                ${product.featured ? '<span class="pill gold">برگزیده</span>' : ''}
                ${product.badge ? `<span class="pill">${esc(product.badge)}</span>` : ''}
                ${product.stock === 0 ? '<span class="pill warn">ناموجود</span>' : ''}
              </div>
            </div>
            <div class="actions">
              <button type="button" class="btn btn-tiny btn-ghost" data-act="edit-product" data-id="${esc(product.id)}">ویرایش</button>
              <button type="button" class="btn btn-tiny btn-danger" data-act="del-product" data-id="${esc(product.id)}">حذف</button>
            </div>
          </article>`).join('') : '<p class="empty">دست‌سازه‌ای با این نام نیست.</p>'}
      </div>
      ${editorHtml()}`;
  }

  function renderCats() {
    return `
      <form class="panel" id="new-cat">
        <h2>دستهٔ تازه</h2>
        <label class="field"><span>نام</span><input name="name" required maxlength="40"></label>
        <label class="field"><span>توضیح کوتاه</span><input name="description" maxlength="300"></label>
        <label class="field"><span>نشان</span><select name="icon">${iconOptions('leaf')}</select></label>
        <button class="btn btn-forest" type="submit">افزودن دسته</button>
      </form>
      <div class="list" style="margin-top:12px">
        ${state.categories.map((cat, index) => `
          <form class="item cat-form" data-id="${esc(cat.id)}">
            <label class="field"><span>نام</span><input name="name" required maxlength="40" value="${esc(cat.name)}"></label>
            <label class="field"><span>توضیح</span><input name="description" maxlength="300" value="${esc(cat.description || '')}"></label>
            <label class="field"><span>نشان</span><select name="icon">${iconOptions(cat.icon)}</select></label>
            <p class="meta">${state.products.filter((product) => product.categoryId === cat.id).length.toLocaleString('fa-IR')} دست‌سازه</p>
            <div class="actions">
              <button class="btn btn-tiny btn-forest" type="submit">ذخیره</button>
              <button type="button" class="btn btn-tiny btn-ghost" data-act="move-cat" data-id="${esc(cat.id)}" data-dir="up"${index === 0 ? ' disabled' : ''}>بالاتر</button>
              <button type="button" class="btn btn-tiny btn-ghost" data-act="move-cat" data-id="${esc(cat.id)}" data-dir="down"${index === state.categories.length - 1 ? ' disabled' : ''}>پایین‌تر</button>
              <button type="button" class="btn btn-tiny btn-danger" data-act="del-cat" data-id="${esc(cat.id)}">حذف</button>
            </div>
          </form>`).join('')}
      </div>`;
  }

  function renderOrders() {
    if (!state.orders.length) return '<div class="panel"><h2>سفارش‌ها</h2><p class="empty">هنوز سفارشی ثبت نشده است.</p></div>';
    return `<div class="list">${state.orders.map((order) => `
      <article class="item">
        <div class="item-row">
          <div class="grow">
            <h3>${esc(order.code)}</h3>
            <p class="meta">${when(order.createdAt)} · ${esc(order.customer.name)} · ${esc(order.customer.phone)}</p>
          </div>
          <strong>${toman(order.total)}</strong>
        </div>
        <ul class="order-items">${order.items.map((item) => `<li><span>${esc(item.name)} × ${item.qty.toLocaleString('fa-IR')}</span><span>${toman(item.price * item.qty)}</span></li>`).join('')}</ul>
        <p class="meta">${esc(order.customer.city)} — ${esc(order.customer.address)}${order.customer.note ? ` · یادداشت: ${esc(order.customer.note)}` : ''}</p>
        <label class="field"><span>وضعیت</span>
          <select data-act="order-status" data-id="${esc(order.id)}">
            ${Object.entries(STATUS).map(([id, label]) => `<option value="${id}"${order.status === id ? ' selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
      </article>`).join('')}</div>`;
  }

  function renderSettings() {
    return `
      <form class="panel" id="settings" style="max-width:520px">
        <h2>نام کاربری و رمز</h2>
        <p class="meta">این ورود فقط برای مدیر کارگاه است. مشتری‌ها حساب جدا ندارند.</p>
        <label class="field"><span>نام کاربری</span><input name="username" required minlength="3" maxlength="40" value="${esc(state.username || '')}" autocomplete="username"></label>
        <label class="field"><span>رمز فعلی</span><input name="current" type="password" required autocomplete="current-password"></label>
        <label class="field"><span>رمز تازه</span><input name="next" type="password" required minlength="8" autocomplete="new-password"></label>
        <button class="btn btn-forest" type="submit">ذخیرهٔ ورود</button>
      </form>`;
  }

  const views = { dash: renderDash, products: renderProducts, cats: renderCats, orders: renderOrders, settings: renderSettings };

  function paint() {
    document.getElementById('view-title').textContent = TITLES[state.view] || 'پنل';
    document.getElementById('view').innerHTML = views[state.view]();
    document.querySelectorAll('.side [data-view]').forEach((button) => {
      button.classList.toggle('active', button.dataset.view === state.view);
    });
    sessionStorage.setItem('admin-view', state.view);
  }

  async function reload() {
    const [products, categories, orders, me] = await Promise.all([
      api('/api/products'),
      api('/api/categories'),
      api('/api/admin/orders'),
      api('/api/admin/me'),
    ]);
    state.products = products;
    state.categories = categories;
    state.orders = orders;
    state.username = me.username;
  }

  const view = document.getElementById('view');

  document.querySelectorAll('.side [data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      state.view = button.dataset.view;
      state.editor = null;
      document.getElementById('side').classList.remove('open');
      document.getElementById('side-mask').hidden = true;
      paint();
    });
  });

  document.getElementById('side-toggle').addEventListener('click', () => {
    document.getElementById('side').classList.add('open');
    document.getElementById('side-mask').hidden = false;
  });
  document.getElementById('side-mask').addEventListener('click', () => {
    document.getElementById('side').classList.remove('open');
    document.getElementById('side-mask').hidden = true;
  });
  document.getElementById('logout').addEventListener('click', async () => {
    await api('/api/admin/logout', { method: 'POST' });
    location.href = '/admin/login.html';
  });

  view.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-act]');
    if (!button) return;
    const act = button.dataset.act;
    try {
      if (act === 'new-product') {
        state.editor = {};
        paint();
      } else if (act === 'close-editor') {
        state.editor = null;
        paint();
      } else if (act === 'edit-product') {
        state.editor = state.products.find((product) => product.id === button.dataset.id) || null;
        paint();
      } else if (act === 'del-product') {
        const product = state.products.find((item) => item.id === button.dataset.id);
        if (!product) return;
        if (!await ask(`«${product.name}» از فروشگاه حذف شود؟`)) return;
        await api(`/api/admin/products/${product.id}`, { method: 'DELETE' });
        await reload();
        paint();
        toast('دست‌سازه حذف شد');
      } else if (act === 'del-cat') {
        if (!await ask('این دسته حذف شود؟')) return;
        await api(`/api/admin/categories/${button.dataset.id}`, { method: 'DELETE' });
        await reload();
        paint();
      } else if (act === 'move-cat') {
        await api(`/api/admin/categories/${button.dataset.id}/move`, { method: 'POST', body: { dir: button.dataset.dir } });
        await reload();
        paint();
      }
    } catch (err) {
      if (err.message !== 'auth') toast(err.message);
    }
  });

  view.addEventListener('input', (event) => {
    if (event.target.id === 'product-q') {
      state.query = event.target.value;
      const list = view.querySelector('.list');
      const editor = state.editor;
      state.editor = null;
      const html = renderProducts();
      state.editor = editor;
      view.innerHTML = html;
      const search = document.getElementById('product-q');
      if (search) {
        search.focus();
        const end = search.value.length;
        search.setSelectionRange(end, end);
      }
    }
  });

  view.addEventListener('change', async (event) => {
    if (event.target.id === 'image-file' && event.target.files[0]) {
      const preview = document.getElementById('preview');
      preview.src = URL.createObjectURL(event.target.files[0]);
      preview.hidden = false;
    }
    if (event.target.dataset.act === 'order-status') {
      try {
        await api(`/api/admin/orders/${event.target.dataset.id}`, {
          method: 'PATCH',
          body: { status: event.target.value },
        });
        await reload();
        toast('وضعیت سفارش به‌روز شد');
        paint();
      } catch (err) {
        if (err.message !== 'auth') toast(err.message);
        paint();
      }
    }
  });

  view.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    try {
      if (form.getAttribute('id') === 'product-form') {
        const data = new FormData(form);
        const id = String(data.get('id') || '');
        if (!form.featured.checked) data.delete('featured');
        await api(id ? `/api/admin/products/${id}` : '/api/admin/products', {
          method: id ? 'PUT' : 'POST',
          body: data,
        });
        state.editor = null;
        await reload();
        paint();
        toast('دست‌سازه ذخیره شد');
      } else if (form.getAttribute('id') === 'new-cat') {
        await api('/api/admin/categories', {
          method: 'POST',
          body: { name: form.name.value, description: form.description.value, icon: form.icon.value },
        });
        await reload();
        paint();
        toast('دسته اضافه شد');
      } else if (form.classList.contains('cat-form')) {
        await api(`/api/admin/categories/${form.dataset.id}`, {
          method: 'PUT',
          body: { name: form.name.value, description: form.description.value, icon: form.icon.value },
        });
        await reload();
        paint();
        toast('دسته ذخیره شد');
      } else if (form.getAttribute('id') === 'settings') {
        const result = await api('/api/admin/password', {
          method: 'POST',
          body: { username: form.username.value.trim(), current: form.current.value, next: form.next.value },
        });
        state.username = result.username;
        toast('ورود مدیر عوض شد');
        paint();
      }
    } catch (err) {
      if (err.message !== 'auth') toast(err.message);
    }
  });

  reload().then(paint).catch((err) => {
    if (err.message !== 'auth') document.getElementById('view').textContent = 'پنل باز نشد. صفحه را تازه کن.';
  });
})();
