(function () {
  const error = document.getElementById('err');
  const form = document.getElementById('login');

  fetch('/api/admin/me').then((res) => {
    if (res.ok) location.replace('/admin/dashboard.html');
  });

  fetch('/api/admin/setup').then((res) => res.json()).then((data) => {
    if (data.needsSetup) document.getElementById('setup').hidden = false;
  });

  document.getElementById('toggle-pass').addEventListener('click', () => {
    const input = document.getElementById('password');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    document.getElementById('toggle-pass').textContent = show ? 'پنهان' : 'نمایش';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.textContent = '';
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          username: form.username.value.trim(),
          password: form.password.value,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ورود انجام نشد');
      location.href = '/admin/dashboard.html';
    } catch (err) {
      error.textContent = err.message;
      button.disabled = false;
    }
  });
})();
