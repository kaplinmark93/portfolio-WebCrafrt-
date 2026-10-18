/**
 * SHINY TEXT COMPONENT (React Bits Specification)
 * Full Vanilla JS implementation of React Bits <ShinyText />
 * Dynamic gradient sweep, pointer tracking, color blending, glowing aura.
 */

(function () {
  'use strict';

  const EASINGS = {
    linear: t => t,
    smooth: t => 0.5 - Math.cos(Math.PI * t) / 2,
    snappy: t => (t < 0.5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2)
  };

  const TRIGGERS = ['loop', 'hover', 'view'];
  const FALLOFF = [0, 0.2, 0.4, 0.6, 0.8, 1];

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  let paint = null;

  const parseColor = value => {
    if (typeof document === 'undefined') return null;
    if (!paint) paint = document.createElement('canvas').getContext('2d');
    if (!paint) return null;
    paint.fillStyle = '#000000';
    paint.fillStyle = value;
    const resolved = String(paint.fillStyle);
    if (resolved.startsWith('#')) {
      return [1, 3, 5].map(i => parseInt(resolved.slice(i, i + 2), 16)).concat(1);
    }
    const parts = resolved.match(/[\d.]+/g);
    if (!parts || parts.length < 3) return null;
    return [Number(parts[0]), Number(parts[1]), Number(parts[2]), parts.length > 3 ? Number(parts[3]) : 1];
  };

  const blend = (from, to, amount) => {
    const channel = (a, b) =>
      Math.round(Math.pow(Math.pow(a / 255, 2.2) * (1 - amount) + Math.pow(b / 255, 2.2) * amount, 1 / 2.2) * 255);
    const alpha = from[3] * (1 - amount) + to[3] * amount;
    if (alpha <= 0) return 'rgba(0, 0, 0, 0)';
    const weigh = (a, b) => (a * from[3] * (1 - amount) + b * to[3] * amount) / alpha;
    const r = from[3] === to[3] ? channel(from[0], to[0]) : Math.round(weigh(from[0], to[0]));
    const g = from[3] === to[3] ? channel(from[1], to[1]) : Math.round(weigh(from[1], to[1]));
    const b = from[3] === to[3] ? channel(from[2], to[2]) : Math.round(weigh(from[2], to[2]));
    return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 1000) / 1000})`;
  };

  function createShinyText(root, options = {}) {
    if (!root) return null;
    if (root._shinyText && typeof root._shinyText.destroy === 'function') {
      root._shinyText.destroy();
    }

    const rawAttr = root.getAttribute('data-shiny-text');
    const attrText = (rawAttr && rawAttr !== 'true') ? rawAttr : (root.getAttribute('data-text') || '');
    const existingGlow = root.querySelector('.shiny-text__glow');
    if (existingGlow) existingGlow.remove();
    const fallbackText = root.textContent.trim();
    const initialText = attrText || fallbackText;

    const defaults = {
      text: initialText,
      color: root.getAttribute('data-color') || '#b5b5b5',
      shineColor: root.getAttribute('data-shine-color') || '#ffffff',
      speed: parseFloat(root.getAttribute('data-speed')) || 2,
      delay: parseFloat(root.getAttribute('data-delay')) || 0,
      angle: parseFloat(root.getAttribute('data-angle')) || 120,
      shineWidth: parseFloat(root.getAttribute('data-shine-width')) || 40,
      softness: parseFloat(root.getAttribute('data-softness')) || 0.8,
      bands: parseInt(root.getAttribute('data-bands'), 10) || 1,
      glow: parseFloat(root.getAttribute('data-glow')) || 0,
      direction: root.getAttribute('data-direction') || 'left',
      easing: root.getAttribute('data-easing') || 'smooth',
      trigger: root.getAttribute('data-trigger') || 'loop',
      yoyo: root.getAttribute('data-yoyo') === 'true',
      followPointer: root.getAttribute('data-follow-pointer') !== 'false',
      pauseOnHover: root.getAttribute('data-pause-on-hover') === 'true',
      disabled: root.getAttribute('data-disabled') === 'true'
    };

    const s = Object.assign({}, defaults, options);
    s.speed = Math.max(0.1, s.speed);
    s.delay = Math.max(0, s.delay);
    s.shineWidth = clamp(s.shineWidth, 2, 200);
    s.softness = clamp(s.softness, 0, 1);
    s.bands = clamp(Math.round(s.bands), 1, 3);
    s.glow = clamp(s.glow, 0, 1);
    s.sign = s.direction === 'right' ? 1 : -1;
    s.ease = EASINGS[s.easing] ?? EASINGS.smooth;
    s.trigger = TRIGGERS.includes(s.trigger) ? s.trigger : 'loop';

    root.classList.add('shiny-text');
    if (s.text === 'WebCraft') {
      root.innerHTML = 'Web<span class="shiny-letter-c" id="shiny-target-c">C</span>raft';
    } else {
      root.textContent = s.text;
    }

    let glowEl = null;
    if (s.glow > 0) {
      glowEl = document.createElement('span');
      glowEl.className = 'shiny-text__glow';
      glowEl.setAttribute('aria-hidden', 'true');
      if (s.text === 'WebCraft') {
        glowEl.innerHTML = 'Web<span class="shiny-letter-c">C</span>raft';
      } else {
        glowEl.textContent = s.text;
      }
      root.appendChild(glowEl);
    }

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const state = {
      pos: null,
      vel: 0,
      phase: 'idle',
      from: 0,
      to: 0,
      start: 0,
      duration: 1,
      resume: 0,
      flip: false,
      inside: false,
      target: 0,
      visible: true,
      seen: false,
      colors: ''
    };

    let base = null;
    let shine = null;
    let clear = null;
    let raf = 0;
    let timer = 0;
    let last = 0;
    let alive = true;

    const extent = () => s.shineWidth / 2 + (s.bands - 1) * s.shineWidth * 1.3 + 2;
    const entry = () => (s.sign > 0 ? -extent() : 100 + extent());
    const exit = () => (s.sign > 0 ? 100 + extent() : -extent());
    const nearest = () => (state.target < 50 ? -extent() : 100 + extent());

    const gradient = (pos, fill) => {
      const half = s.shineWidth / 2;
      const core = half * (1 - s.softness);
      const fade = half - core;
      const stops = [];
      for (let band = 0; band < s.bands; band++) {
        const center = pos - s.sign * band * s.shineWidth * 1.3;
        const strength = 1 - band * 0.28;
        for (const side of [-1, 1]) {
          for (const f of FALLOFF) {
            const at = center + side * (core + fade * (1 - f));
            const amount = f * f * (3 - 2 * f) * strength;
            stops.push([at, amount]);
          }
        }
      }
      stops.sort((a, b) => a[0] - b[0]);
      const list = stops.map(([at, amount]) => `${blend(fill, shine, amount)} ${at.toFixed(2)}%`);
      return `linear-gradient(${s.angle}deg, ${blend(fill, shine, 0)} 0%, ${list.join(', ')}, ${blend(fill, shine, 0)} 100%)`;
    };

    const draw = () => {
      const key = `${s.color}|${s.shineColor}`;
      if (key !== state.colors) {
        state.colors = key;
        base = parseColor(s.color);
        shine = parseColor(s.shineColor);
        clear = shine ? [shine[0], shine[1], shine[2], 0] : null;
      }
      if (!base || !shine) {
        root.style.backgroundImage = `linear-gradient(${s.color}, ${s.color})`;
        return;
      }
      if (state.pos === null || s.disabled) {
        root.style.backgroundImage = `linear-gradient(${s.color}, ${s.color})`;
        if (glowEl) glowEl.style.backgroundImage = 'none';
        return;
      }
      root.style.backgroundImage = gradient(state.pos, base);
      if (glowEl) {
        glowEl.style.backgroundImage = gradient(state.pos, clear);
        glowEl.style.opacity = String(s.glow);
      }
    };

    const sweep = (from, to, now) => {
      const span = Math.abs(exit() - entry()) || 1;
      state.phase = 'sweep';
      state.from = from;
      state.to = to;
      state.start = now;
      state.duration = s.speed * 1000 * Math.max(0.15, Math.abs(to - from) / span);
    };

    const wake = () => {
      if (raf || !alive) return;
      window.clearTimeout(timer);
      timer = 0;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const tick = now => {
      raf = 0;
      if (!alive) return;
      if (!state.visible && root.offsetParent !== null) {
        state.visible = true;
      }
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (s.disabled) {
        state.pos = null;
        state.phase = 'idle';
        draw();
        return;
      }
      const following = s.followPointer && state.inside;
      if (following) {
        if (state.pos === null) state.pos = nearest();
        const stiffness = 220;
        state.vel += ((state.target - state.pos) * stiffness - state.vel * 2 * Math.sqrt(stiffness)) * dt;
        state.pos += state.vel * dt;
        state.phase = 'follow';
        draw();
        raf = requestAnimationFrame(tick);
        return;
      }
      if (state.phase === 'follow') {
        state.vel = 0;
        sweep(state.pos ?? nearest(), nearest(), now);
      }
      if (state.phase === 'sweep') {
        if (s.pauseOnHover && state.inside) {
          state.start += dt * 1000;
          raf = requestAnimationFrame(tick);
          return;
        }
        const t = clamp((now - state.start) / state.duration, 0, 1);
        state.pos = state.from + (state.to - state.from) * s.ease(t);
        draw();
        if (t < 1) {
          raf = requestAnimationFrame(tick);
          return;
        }
        if (s.trigger !== 'loop' || reduce) {
          state.phase = 'idle';
          state.pos = null;
          draw();
          return;
        }
        state.phase = 'wait';
        state.resume = now + s.delay * 1000;
      }
      if (state.phase === 'wait') {
        if (!state.visible) return;
        if (now < state.resume) {
          window.clearTimeout(timer);
          timer = window.setTimeout(wake, state.resume - now);
          return;
        }
        if (s.yoyo) {
          state.flip = !state.flip;
          sweep(state.flip ? exit() : entry(), state.flip ? entry() : exit(), now);
        } else {
          sweep(entry(), exit(), now);
        }
        raf = requestAnimationFrame(tick);
        return;
      }
      if (state.phase === 'idle' && s.trigger === 'loop' && !reduce && state.visible) {
        state.flip = false;
        sweep(entry(), exit(), now);
        raf = requestAnimationFrame(tick);
      }
    };

    const locate = event => {
      const rect = root.getBoundingClientRect();
      const radians = (s.angle * Math.PI) / 180;
      const dx = Math.sin(radians);
      const dy = -Math.cos(radians);
      const length = Math.abs(rect.width * dx) + Math.abs(rect.height * dy) || 1;
      const along =
        (event.clientX - rect.left - rect.width / 2) * dx + (event.clientY - rect.top - rect.height / 2) * dy;
      return 50 + (along / length) * 100;
    };

    const onEnter = event => {
      state.inside = true;
      state.target = locate(event);
      if (s.disabled) return;
      if (s.followPointer) {
        if (state.pos === null) state.pos = nearest();
      } else if (s.trigger === 'hover' && state.phase === 'idle' && !reduce) {
        sweep(entry(), exit(), performance.now());
      }
      wake();
    };

    const onMove = event => {
      state.target = locate(event);
      if (s.followPointer) wake();
    };

    const onLeave = () => {
      state.inside = false;
      wake();
    };

    const observer = new IntersectionObserver(entries => {
      const visible = entries.some(item => item.isIntersecting);
      state.visible = visible;
      if (!visible) return;
      if (s.trigger === 'view' && !state.seen && !reduce && !s.disabled) {
        state.seen = true;
        sweep(entry(), exit(), performance.now());
      }
      wake();
    });
    observer.observe(root);

    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);

    draw();
    wake();

    const instance = {
      wake: () => {
        state.visible = true;
        wake();
      },
      sleep: () => {
        cancelAnimationFrame(raf);
        raf = 0;
        window.clearTimeout(timer);
        timer = 0;
      },
      destroy: () => {
        alive = false;
        cancelAnimationFrame(raf);
        window.clearTimeout(timer);
        observer.disconnect();
        root.removeEventListener('pointerenter', onEnter);
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerleave', onLeave);
        if (glowEl && glowEl.parentNode) glowEl.remove();
        delete root._shinyText;
      }
    };

    root._shinyText = instance;
    return instance;
  }

  window.createShinyText = createShinyText;

  function initAll() {
    // 1. Process elements with [data-shiny-text]
    document.querySelectorAll('[data-shiny-text]').forEach(el => {
      const isTargetNum = el.classList.contains('wc-step-num-vate') ||
                          el.classList.contains('step-num') ||
                          el.classList.contains('wc-shiny-num') ||
                          el.classList.contains('wc-num-crimson');
      if (isTargetNum) {
        createShinyText(el, {
          color: '#FFFFFF',
          shineColor: '#94A3B8',
          speed: 2,
          shineWidth: 40,
          softness: 0.8,
          trigger: 'loop',
          angle: 120,
          glow: 0
        });
      } else {
        createShinyText(el);
      }
    });

    // 2. Process all step numbers by class
    document.querySelectorAll('.wc-step-num-vate, .wc-vate-step-btn .step-num').forEach(el => {
      createShinyText(el, {
        color: '#FFFFFF',
        shineColor: '#94A3B8',
        speed: 2,
        shineWidth: 40,
        softness: 0.8,
        trigger: 'loop',
        angle: 120,
        glow: 0
      });
    });
  }

  window.initShinyText = initAll;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
