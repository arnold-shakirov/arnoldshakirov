// ----------------------
// Mobile nav toggle
// ----------------------
(() => {
  const btn = document.querySelector('.nav-toggle');
  const menu = document.getElementById('primary-nav');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    menu.style.display = open ? 'none' : 'block';
  });

  // Close on link click (mobile)
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.setAttribute('aria-expanded', 'false');
      menu.style.display = 'none';
    });
  });

  // Ensure desktop layout shows menu
  const mq = window.matchMedia('(min-width: 900px)');
  const sync = () => { menu.style.display = mq.matches ? 'flex' : 'none'; };
  mq.addEventListener('change', sync);
  sync();
})();

// ----------------------
// Filtering (Work grid)
// ----------------------
(() => {
  const buttons = document.querySelectorAll('.filters .pill');
  const cards = document.querySelectorAll('#grid .card');
  if (!buttons.length || !cards.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter || 'all';
      cards.forEach(c => {
        const cat = c.getAttribute('data-cat') || '';
        c.style.display = (filter === 'all' || cat.includes(filter)) ? '' : 'none';
      });
    });
  });
})();

// -------------------------------------------
// Contact form -> Formspree (automatic email)
// Formats: "<name> tries to connect ... <message>"
// -------------------------------------------
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('contact-submit');

  function buildPayload(formData) {
    const name = (formData.get('name') || '').trim();
    const email = (formData.get('_replyto') || '').trim();
    const message = (formData.get('message') || '').trim();

    formData.set('_subject', `New message from ${name}`);
    const composed = `${name} tries to connect with you and left this message:\n\n${message}\n\nReply to: ${email}`;
    formData.set('message', composed);

    return formData;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (feedback) feedback.textContent = '';
    if (submitBtn) submitBtn.disabled = true;

    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('_replyto')?.value.trim();
    const msg = document.getElementById('message')?.value.trim();
    if (!name || !email || !msg) {
      if (feedback) feedback.textContent = 'Please fill out name, email, and message.';
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    try {
      const action = form.getAttribute('action');
      const raw = new FormData(form);
      const payload = buildPayload(raw);

      const res = await fetch(action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: payload
      });

      if (res.ok) {
        if (feedback) feedback.textContent = 'Thanks! Your message has been sent.';
        form.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        if (feedback) feedback.textContent = data?.errors?.[0]?.message || 'Sorry, something went wrong. Please try again or email me directly.';
      }
    } catch (err) {
      if (feedback) feedback.textContent = 'Network error. Please try again or email me directly.';
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();

// ----------------------
// Theme toggle (default LIGHT, persist choice)
// ----------------------
(() => {
  const html = document.documentElement;
  const btn  = document.getElementById('theme-toggle');
  if (!btn) return;

  const saved = localStorage.getItem('theme');         // 'light' or 'dark'
  const initial = saved ? saved : 'light';             // default to light
  html.setAttribute('data-theme', initial);
  btn.textContent = initial === 'dark' ? 'Light' : 'Dark';

  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    btn.textContent = next === 'dark' ? 'Light' : 'Dark';
  });
})();
