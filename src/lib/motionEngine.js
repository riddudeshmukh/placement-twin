// =============================================================================
// Global motion engine — fully passive, framework-agnostic.
// Wires up scroll reveals, magnetic/ripple buttons, and a cursor glow across
// the whole app without needing every component to opt in individually.
// Safe to call once; it watches the DOM for new nodes (view switches, tab
// changes, dynamically rendered cards) and keeps everything wired up.
// =============================================================================

const REVEAL_SELECTORS = [
  '.neu-float', '.neu-card-lg', '.console-eval-card', '.console-twin-card',
  '.feature-block', '.workflow-cards-deck > *', '.feature-boxes-deck > *',
  '.twin-stat-box', '.pill-tag', '.section-title-center',
].join(', ');

const MAGNETIC_SELECTORS = [
  '.btn-brass', '.btn-soft', '.btn-moss', '.hero-primary-cta', '.hero-secondary-cta',
].join(', ');

let revealObserver = null;
let mutationObserver = null;
let initialized = false;

function wireReveal(root) {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (!el.style.transitionDelay) {
              const siblingIndex = Array.prototype.indexOf.call(
                el.parentElement ? el.parentElement.children : [],
                el
              );
              const delay = Math.min(Math.max(siblingIndex, 0), 6) * 70;
              el.style.transitionDelay = `${delay}ms`;
            }
            el.classList.add('reveal-in');
            revealObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
  }

  root.querySelectorAll(REVEAL_SELECTORS).forEach((el) => {
    if (el.dataset.revealBound) return;
    el.dataset.revealBound = '1';
    el.classList.add('reveal-init');
    revealObserver.observe(el);
  });
}

function wireMagnetic(root) {
  root.querySelectorAll(MAGNETIC_SELECTORS).forEach((el) => {
    if (el.dataset.magneticBound) return;
    el.dataset.magneticBound = '1';

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mx', `${x}%`);
      el.style.setProperty('--my', `${y}%`);
    });

    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple-el';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      el.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 700);
    });
  });
}

function wireCursorGlow() {
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
  if (document.querySelector('.cursor-glow')) return;

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let raf = null;
  window.addEventListener('mousemove', (e) => {
    glow.classList.add('active');
    if (raf) return;
    raf = requestAnimationFrame(() => {
      glow.style.setProperty('--cx', `${e.clientX}px`);
      glow.style.setProperty('--cy', `${e.clientY}px`);
      raf = null;
    });
  });
  window.addEventListener('mouseleave', () => glow.classList.remove('active'));
}

function scan(root = document) {
  wireReveal(root);
  wireMagnetic(root);
}

export function initMotionEngine() {
  if (initialized) {
    scan();
    return;
  }
  initialized = true;

  scan();
  wireCursorGlow();

  mutationObserver = new MutationObserver((mutations) => {
    let shouldScan = false;
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length) {
        shouldScan = true;
        break;
      }
    }
    if (shouldScan) {
      // Defer slightly so newly-mounted subtrees are fully laid out.
      window.requestAnimationFrame(() => scan());
    }
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });
}
