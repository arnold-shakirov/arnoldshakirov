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
// Formats as: "<name> tries to connect... <message>"
// Uses _replyto for sender email (Reply-To)
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
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  // Default to LIGHT if there is no saved preference
  const saved = localStorage.getItem('theme');
  const initial = saved ? saved : 'light';

  html.setAttribute('data-theme', initial);
  btn.textContent = initial === 'dark' ? 'Light' : 'Dark';

  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    btn.textContent = next === 'dark' ? 'Light' : 'Dark';
  });
})();
