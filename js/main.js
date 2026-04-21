/**
 * FORGOTTEN WIZARD — Main JS
 * UI interactions: nav, quotes rotator, scroll effects, cursor glow, counter
 */

(function () {
  'use strict';

  // ─── Mobile nav ────────────────────────────────────────────────────
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.querySelector('.nav__links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // ─── Cursor glow ───────────────────────────────────────────────────
  const cursorGlow = document.getElementById('cursor-glow');
  let glowX = 0, glowY = 0, curX = 0, curY = 0;

  window.addEventListener('mousemove', e => {
    glowX = e.clientX;
    glowY = e.clientY;
  });

  function animateCursor() {
    curX += (glowX - curX) * 0.08;
    curY += (glowY - curY) * 0.08;
    if (cursorGlow) {
      cursorGlow.style.left = curX + 'px';
      cursorGlow.style.top = curY + 'px';
    }
    requestAnimationFrame(animateCursor);
  }
  requestAnimationFrame(animateCursor);

  // ─── Quote rotator ─────────────────────────────────────────────────
  const quotes = [
    {
      text: "The present is theirs; the future, for which I really worked, is mine.",
      attr: "Nikola Tesla"
    },
    {
      text: "If you only knew the magnificence of the 3, 6 and 9, then you would have a key to the universe.",
      attr: "Nikola Tesla"
    },
    {
      text: "My brain is only a receiver. In the Universe there is a core from which we obtain knowledge, strength, inspiration.",
      attr: "Nikola Tesla"
    },
    {
      text: "The day science begins to study non-physical phenomena, it will make more progress in one decade than in all previous centuries.",
      attr: "Nikola Tesla"
    },
    {
      text: "I do not think there is any thrill that can go through the human heart like that felt by the inventor when he sees some creation of the brain unfolding to success.",
      attr: "Nikola Tesla"
    }
  ];

  let currentQuote = 0;
  const quoteText = document.getElementById('quote-text');
  const quoteDots = document.querySelectorAll('.quote__dot');

  function setQuote(idx) {
    if (!quoteText) return;
    currentQuote = idx;
    quoteText.style.opacity = '0';
    setTimeout(() => {
      quoteText.textContent = `"${quotes[idx].text}"`;
      quoteText.style.opacity = '1';
    }, 300);

    quoteDots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  quoteDots.forEach((dot, i) => {
    dot.addEventListener('click', () => setQuote(i));
  });

  setQuote(0);
  setInterval(() => {
    setQuote((currentQuote + 1) % quotes.length);
  }, 6000);

  if (quoteText) {
    quoteText.style.transition = 'opacity 0.3s ease';
  }

  // ─── Animated stat counters ────────────────────────────────────────
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = Math.floor(ease * target);
      el.textContent = val.toLocaleString() + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // ─── Newsletter form ───────────────────────────────────────────────
  const form = document.querySelector('.newsletter__form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input.value.includes('@')) {
        input.style.borderColor = 'rgba(255,80,80,0.6)';
        return;
      }
      const btn = form.querySelector('button');
      if (btn) {
        btn.textContent = 'Welcome to the Lab! ⚡';
        btn.disabled = true;
        btn.style.opacity = '0.7';
      }
      input.value = '';
    });
  }

  // ─── Nav scroll state ──────────────────────────────────────────────
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    if (nav) {
      nav.style.background = window.scrollY > 50
        ? 'rgba(5,5,8,0.97)'
        : 'linear-gradient(to bottom, rgba(5,5,8,0.95), rgba(5,5,8,0))';
    }
  });

  // ─── Canvas resize on scroll height change ────────────────────────
  let prevHeight = document.documentElement.scrollHeight;
  setInterval(() => {
    const h = document.documentElement.scrollHeight;
    if (h !== prevHeight) {
      prevHeight = h;
      const lc = document.getElementById('lightning-canvas');
      if (lc) {
        lc.height = h;
        lc.style.height = h + 'px';
      }
    }
  }, 500);

})();
