(function () {
  const { esc, productCard } = window.Store;
  const qInput = document.getElementById('q');
  const sortInput = document.getElementById('sort');
  const chips = document.getElementById('chips');
  const grid = document.getElementById('grid');
  const count = document.getElementById('count');
  let categories = [];
  let timer = 0;

  function stateFromUrl() {
    const params = new URLSearchParams(location.search);
    return {
      cat: params.get('cat') || '',
      q: params.get('q') || '',
      sort: params.get('sort') || 'new',
    };
  }

  function writeUrl(state) {
    const params = new URLSearchParams();
    if (state.cat) params.set('cat', state.cat);
    if (state.q) params.set('q', state.q);
    if (state.sort && state.sort !== 'new') params.set('sort', state.sort);
    const query = params.toString();
    history.replaceState(null, '', query ? `?${query}` : location.pathname);
  }

  function renderChips(active) {
    const all = [{ id: '', name: 'همه' }].concat(categories);
    chips.innerHTML = all.map((cat) => `
      <button type="button" class="chip${cat.id === active ? ' active' : ''}" data-cat="${esc(cat.id)}">${esc(cat.name)}</button>
    `).join('');
  }

  async function render() {
    const state = stateFromUrl();
    qInput.value = state.q;
    sortInput.value = state.sort;
    renderChips(state.cat);
    const params = new URLSearchParams();
    if (state.cat) params.set('category', state.cat);
    if (state.q) params.set('q', state.q);
    if (state.sort) params.set('sort', state.sort);
    grid.setAttribute('aria-busy', 'true');
    const res = await fetch(`/api/products?${params.toString()}`);
    const products = await res.json();
    const names = Object.fromEntries(categories.map((cat) => [cat.id, cat.name]));
    count.textContent = products.length
      ? `${products.length.toLocaleString('fa-IR')} دست‌سازه`
      : '';
    grid.innerHTML = products.length
      ? products.map((product) => productCard(product, names[product.categoryId])).join('')
      : '<div class="empty"><h2>چیزی این‌جا نرویید</h2><p>عبارت دیگری را جستجو کن یا دسته را عوض کن.</p></div>';
    grid.setAttribute('aria-busy', 'false');
  }

  async function boot() {
    categories = await fetch('/api/categories').then((res) => res.json());
    await render();
  }

  chips.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cat]');
    if (!button) return;
    const state = stateFromUrl();
    state.cat = button.dataset.cat;
    writeUrl(state);
    render().catch(() => toastFail());
  });
  sortInput.addEventListener('change', () => {
    const state = stateFromUrl();
    state.sort = sortInput.value;
    writeUrl(state);
    render().catch(() => toastFail());
  });
  qInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const state = stateFromUrl();
      state.q = qInput.value.trim();
      writeUrl(state);
      render().catch(() => toastFail());
    }, 250);
  });

  function toastFail() {
    grid.innerHTML = '<div class="empty"><h2>ارتباط قطع شد</h2><p>صفحه را یک بار تازه کن.</p></div>';
  }

  boot().catch(toastFail);
})();
