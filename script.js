// script.js
document.addEventListener('DOMContentLoaded', function () {
  // Scroll progress indicator
  const scrollProgress = document.createElement('div');
  scrollProgress.className = 'scroll-progress';
  document.body.prepend(scrollProgress);
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = scrollPercent + '%';
  });

  /* (removed attachment display for main form) */

  // Parallax effect on hero
  window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
      const scrollY = window.scrollY;
      hero.style.backgroundPosition = `0% ${scrollY * 0.5}px`;
    }
  });

  /* Toast helper: floating messages */
  const toastContainer = document.getElementById('toast-container');
  const showToast = (message, type = 'success', ttl = 4200) => {
    if (!toastContainer) return; 
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.setAttribute('role', 'status');
    t.innerHTML = `<div class="t-icon">${type === 'success' ? '✅' : '⚠️'}</div><div class="t-body">${message}</div><button class="t-close" aria-label="Fermer">✕</button>`;
    toastContainer.appendChild(t);
    const remove = () => {
      t.classList.add('hide');
      setTimeout(() => t.remove(), 300);
    };
    t.querySelector('.t-close').addEventListener('click', remove);
    setTimeout(remove, ttl);
  };

  // Smooth scroll for internal anchors
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* Reveal on scroll */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { root: null, threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* Animated counters */
  const animateNumber = (el, target) => {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(progress * (target - start) + start);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.metric-number').forEach(n => {
          const target = parseInt(n.getAttribute('data-target') || '0', 10);
          animateNumber(n, target);
        });
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.metrics').forEach(el => counterObserver.observe(el));

  /* Carousel (testimonials) */
  document.querySelectorAll('.carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const items = Array.from(track.querySelectorAll('.carousel-item'));

    // Enable horizontal scroll-snap layout
    track.classList.add('horizontal');

    // Create dots if not exists
    let dotsContainer = carousel.querySelector('.carousel-dots');
    if (!dotsContainer) {
      dotsContainer = document.createElement('div');
      dotsContainer.className = 'carousel-dots';
      carousel.appendChild(dotsContainer);
      items.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
          const target = items[i];
          const left = target.offsetLeft - (track.clientWidth - target.offsetWidth) / 2;
          track.scrollTo({ left, behavior: 'smooth' });
        });
        dotsContainer.appendChild(dot);
      });
    }

    // IntersectionObserver to update active dot based on visibility
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = items.indexOf(entry.target);
          carousel.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
          items.forEach((it, i) => it.classList.toggle('active', i === idx));
        }
      });
    }, { threshold: 0.6, root: track });

    items.forEach(it => obs.observe(it));

    // Prev/Next controls scroll by one item width
    const nextBtn = carousel.querySelector('.carousel-control.next');
    const prevBtn = carousel.querySelector('.carousel-control.prev');
    const scrollByItem = (dir = 1) => {
      const width = track.clientWidth;
      track.scrollBy({ left: dir * width, behavior: 'smooth' });
    };
    if (nextBtn) nextBtn.addEventListener('click', () => scrollByItem(1));
    if (prevBtn) prevBtn.addEventListener('click', () => scrollByItem(-1));

    // Auto-advance: scroll to next item in sequence, loop to start
    const autoAdvance = () => {
      let visibleIdx = items.findIndex(it => it.classList.contains('active'));
      if (visibleIdx === -1) {
        const center = track.scrollLeft + track.clientWidth / 2;
        visibleIdx = items.findIndex(it => {
          const rectLeft = it.offsetLeft;
          const rectRight = rectLeft + it.offsetWidth;
          return center >= rectLeft && center <= rectRight;
        });
        if (visibleIdx === -1) visibleIdx = 0;
      }
      const nextIdx = (visibleIdx + 1) % items.length;
      const target = items[nextIdx];
      const left = target.offsetLeft - (track.clientWidth - target.offsetWidth) / 2;
      track.scrollTo({ left, behavior: 'smooth' });
    };

    let autoTimer = setInterval(autoAdvance, 5000);
    carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
    carousel.addEventListener('mouseleave', () => { autoTimer = setInterval(autoAdvance, 5000); });
  });

  /* Modal contact + sticky CTA */
  const modal = document.getElementById('contact-modal');
  const sticky = document.getElementById('sticky-contact');
  const openModal = () => {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'block';
    const firstInput = modal.querySelector('input, textarea, button');
    if (firstInput) firstInput.focus();
  };
  const closeModal = () => {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
  };
  if (sticky) sticky.addEventListener('click', openModal);
  if (modal) {
    modal.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  /* Dark mode toggle */
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const setTheme = (t) => {
    // small transition helper: apply class to animate properties
    root.classList.add('theme-transition');
    if (t === 'dark') {
      root.setAttribute('data-theme', 'dark');
      if (themeToggle) themeToggle.textContent = '☼';
    } else {
      root.removeAttribute('data-theme');
      if (themeToggle) themeToggle.textContent = '☾';
    }
    window.setTimeout(() => root.classList.remove('theme-transition'), 360);
  };
  const saved = localStorage.getItem('theme');
  if (saved) setTheme(saved);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  if (themeToggle) themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
  });

  /* Helper: simple validation and feedback */
  const isValidEmail = (em) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
  const ensureInputId = (input) => {
    if (!input.id) input.id = 'input-' + Math.random().toString(36).slice(2,9);
    return input.id;
  };

  const showFeedback = (input, msg) => {
    const inputId = ensureInputId(input);
    let fb = input.nextElementSibling;
    if (!fb || !fb.classList || !fb.classList.contains('form-feedback')) {
      fb = document.createElement('div');
      fb.className = 'form-feedback';
      fb.id = `${inputId}-error`;
      input.parentNode.insertBefore(fb, input.nextSibling);
    }
    fb.textContent = msg;
    fb.style.display = 'block';
    input.classList.add('input-error');
    input.setAttribute('aria-describedby', fb.id);
  };

  const clearFeedback = (input) => {
    const described = input.getAttribute('aria-describedby');
    if (described) {
      const fb = document.getElementById(described);
      if (fb) fb.style.display = 'none';
      input.removeAttribute('aria-describedby');
    } else {
      const fb = input.nextElementSibling;
      if (fb && fb.classList && fb.classList.contains('form-feedback')) fb.style.display = 'none';
    }
    input.classList.remove('input-error');
  };
  const validateForm = (form) => {
    let ok = true;
    form.querySelectorAll('input[required], textarea[required]').forEach(inp => {
      clearFeedback(inp);
      if (!inp.value || inp.value.trim() === '') { showFeedback(inp, 'Ce champ est requis'); ok = false; }
      else if (inp.type === 'email' && !isValidEmail(inp.value)) { showFeedback(inp, 'Adresse email invalide'); ok = false; }
    });
    return ok;
  };

  /* Contact forms handling (all forms with .contact-form) with validation + visual feedback */
  document.querySelectorAll('form.contact-form').forEach(formEl => {
    // clear feedback on input
    formEl.querySelectorAll('input, textarea').forEach(inp => inp.addEventListener('input', () => clearFeedback(inp)));

    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(formEl)) {
        formEl.classList.add('shake');
        setTimeout(() => formEl.classList.remove('shake'), 700);
        return;
      }

      // No file upload on main contact form — handled by separate upload form

      const button = formEl.querySelector('button[type="submit"]') || formEl.querySelector('button');
      const originalText = button ? button.textContent : null;
      if (button) { button.textContent = 'Envoi en cours...'; button.disabled = true; }

      fetch(formEl.action, { method: 'POST', body: new FormData(formEl), headers: { 'Accept': 'application/json' } })
        .then(function (response) {
          if (response.ok) {
            showToast("Merci ! Votre message a été envoyé. Je vous répondrai sous 48h.", 'success');
            formEl.reset();
            closeModal();
          } else {
            showToast("Erreur lors de l'envoi. Réessayez ou contactez via WhatsApp.", 'error');
          }
        })
        .catch(function () {
          showToast('Erreur réseau. Essayez WhatsApp.', 'error');
        })
        .finally(function () {
          if (button) { button.textContent = originalText; button.disabled = false; }
        });
    });
  });

  // Debug mode: simulate validation errors to confirm aria-describedby when ?test=aria is present
  if (window.location.search && window.location.search.indexOf('test=aria') !== -1) {
    console.info('ARIA test mode: simulating validation errors');
    document.querySelectorAll('form.contact-form').forEach(f => {
      // clear values to force required errors
      f.querySelectorAll('input[required], textarea[required]').forEach(inp => inp.value = '');
      const ok = validateForm(f);
      console.info('Form', f.id || '(no id)', 'valid?', ok);
      const firstInvalid = f.querySelector('.input-error');
      if (firstInvalid) {
        firstInvalid.focus();
        console.info('First invalid input id:', firstInvalid.id, 'aria-describedby:', firstInvalid.getAttribute('aria-describedby'));
      }
    });
  }

  /* File upload via EmailJS removed — upload section hidden */

  /* Lazy-load images and background images */
  document.querySelectorAll('img').forEach(img => { try { img.loading = 'lazy'; } catch (e) {} });
  const bgObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const src = el.getAttribute('data-bg');
        if (src) {
          el.style.backgroundImage = `url('${src}')`;
          el.classList.add('bg-loaded');
        }
        obs.unobserve(el);
      }
    });
  }, { root: null, threshold: 0.05 });
  document.querySelectorAll('[data-bg]').forEach(el => bgObserver.observe(el));

});