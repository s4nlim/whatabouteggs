const body = document.body;
const btn = document.getElementById('toggleFire');
btn?.addEventListener('click', () => {
  const on = body.classList.toggle('fire');
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
});

