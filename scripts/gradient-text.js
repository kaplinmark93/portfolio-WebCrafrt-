/**
 * GRADIENTTEXT COMPONENT (React Bits Specification)
 * Living animated gradient text with linear, flow (fluid mesh), and conic variants.
 */

(function (global) {
  'use strict';

  const VARIANTS = ['linear', 'flow', 'conic'];
  const ANGLES = { horizontal: 90, vertical: 180, diagonal: 135 };
  const TAU = Math.PI * 2;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function createGradientText(element, userOptions = {}) {
    if (!element) return null;

    const rawColors = Array.isArray(userOptions.colors) ? userOptions.colors : ['#5227FF', '#FF9FFC', '#B497CF'];
    const palette = rawColors.length > 1 ? rawColors : [rawColors[0] ?? '#ffffff', rawColors[0] ?? '#ffffff'];

    const settings = {
      colors: palette,
      speed: Math.max(0.2, Number(userOptions.animationSpeed) || 8),
      variant: VARIANTS.includes(userOptions.variant) ? userOptions.variant : 'flow',
      angle: userOptions.direction ? (ANGLES[userOptions.direction] ?? (userOptions.angle ?? 90)) : (userOptions.angle ?? 90),
      scale: clamp(userOptions.scale !== undefined ? Number(userOptions.scale) : 3, 1, 6),
      yoyo: userOptions.yoyo !== undefined ? Boolean(userOptions.yoyo) : true,
      glow: clamp(userOptions.glow !== undefined ? Number(userOptions.glow) : 0.4, 0, 1),
      showBorder: Boolean(userOptions.showBorder),
      borderWidth: userOptions.borderWidth !== undefined ? Number(userOptions.borderWidth) : 1.5,
      pauseOnHover: Boolean(userOptions.pauseOnHover),
      followPointer: Boolean(userOptions.followPointer)
    };

    // Ensure DOM structure
    element.classList.add('gradient-text');
    if (settings.showBorder) {
      element.classList.add('gradient-text--border');
    }

    const textContent = element.textContent.trim();
    if (!element.querySelector('.gradient-text__inner')) {
      element.innerHTML = `
        <span class="gradient-text__inner">
          <span class="gradient-text__content">${element.innerHTML}</span>
          ${settings.glow > 0 ? `<span class="gradient-text__glow" aria-hidden="true">${element.innerHTML}</span>` : ''}
        </span>
      `;
    }

    element.style.setProperty('--gt-border', `${settings.borderWidth}px`);
    element.style.setProperty('--gt-glow', String(settings.glow));

    const loop = [...palette, palette[0]];
    element.style.setProperty('--gt-gradient', `linear-gradient(${settings.angle}deg, ${loop.join(', ')})`);

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const state = { time: 0, inside: false, visible: true, x: 0.5, y: 0.5, px: 0.5, py: 0.5, vx: 0, vy: 0, pull: 0 };
    let raf = 0;
    let last = 0;
    let alive = true;

    const paint = () => {
      const list = settings.colors;
      const cycle = state.time / settings.speed;
      let image;
      if (settings.variant === 'flow') {
        const blobs = list.map((color, i) => {
          const spin = cycle * TAU;
          const rate = 0.55 + ((i * 0.618) % 1) * 0.5;
          let x = 50 + 44 * Math.sin(spin * rate + i * 2.1);
          let y = 50 + 40 * Math.sin(spin * (rate * 0.83 + 0.21) + i * 1.3);
          if (i === 0) {
            x += (state.px * 100 - x) * state.pull;
            y += (state.py * 100 - y) * state.pull;
          }
          return `radial-gradient(ellipse ${(22 + 12 * settings.scale).toFixed(1)}% ${(60 + 30 * settings.scale).toFixed(1)}% at ${x.toFixed(2)}% ${y.toFixed(2)}%, ${color} 0%, transparent 100%)`;
        });
        image = `${blobs.join(', ')}, linear-gradient(${settings.angle}deg, ${list.join(', ')})`;
      } else if (settings.variant === 'conic') {
        const sway = settings.yoyo ? Math.sin(cycle * Math.PI) * 50 : cycle * 360;
        const cx = 50 + (state.px * 100 - 50) * state.pull;
        const cy = 260 + (state.py * 100 - 260) * state.pull;
        image = `repeating-conic-gradient(from ${(sway - 30).toFixed(2)}deg at ${cx.toFixed(2)}% ${cy.toFixed(2)}%, ${[...list, list[0]].map((color, i) => `${color} ${((i / list.length) * 60 * (3 / settings.scale)).toFixed(2)}deg`).join(', ')})`;
      } else {
        const loopStops = [...list, list[0]];
        const period = 100 * settings.scale;
        let offset;
        if (settings.yoyo) {
          const swing = cycle % 2;
          const t = swing < 1 ? swing : 2 - swing;
          offset = (0.5 - Math.cos(Math.PI * t) / 2) * (period - 100);
        } else {
          offset = (cycle % 1) * period;
        }
        offset += (state.px - 0.5) * period * 0.5 * state.pull;
        const stops = loopStops.map((color, i) => `${color} ${((i / (loopStops.length - 1)) * period - offset).toFixed(2)}%`);
        image = `repeating-linear-gradient(${settings.angle}deg, ${stops.join(', ')})`;
      }
      element.style.setProperty('--gt-gradient', image);
    };

    const tick = now => {
      raf = 0;
      if (!alive) return;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const paused = reduce || (settings.pauseOnHover && state.inside);
      if (!paused) state.time += dt;
      const target = settings.followPointer && state.inside ? 1 : 0;
      state.pull += (target - state.pull) * (1 - Math.exp(-dt * 6));
      const stiffness = 160;
      state.vx += ((state.x - state.px) * stiffness - state.vx * 2 * Math.sqrt(stiffness)) * dt;
      state.vy += ((state.y - state.py) * stiffness - state.vy * 2 * Math.sqrt(stiffness)) * dt;
      state.px += state.vx * dt;
      state.py += state.vy * dt;
      paint();
      const settling = Math.abs(state.pull - target) > 0.001 || Math.abs(state.vx) + Math.abs(state.vy) > 0.001;
      if (!state.visible || (paused && !settling)) return;
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const locate = event => {
      const rect = element.getBoundingClientRect();
      state.x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      state.y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    };
    const onEnter = event => {
      locate(event);
      if (!state.inside) {
        state.px = state.x;
        state.py = state.y;
      }
      state.inside = true;
      wake();
    };
    const onMove = event => {
      locate(event);
      wake();
    };
    const onLeave = () => {
      state.inside = false;
      wake();
    };

    const observer = new IntersectionObserver(entries => {
      state.visible = entries.some(entry => entry.isIntersecting);
      if (state.visible) wake();
    });
    observer.observe(element);
    element.addEventListener('pointerenter', onEnter);
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerleave', onLeave);
    paint();
    wake();

    return {
      destroy: () => {
        alive = false;
        cancelAnimationFrame(raf);
        observer.disconnect();
        element.removeEventListener('pointerenter', onEnter);
        element.removeEventListener('pointermove', onMove);
        element.removeEventListener('pointerleave', onLeave);
      },
      update: newOpts => {
        Object.assign(settings, newOpts);
        paint();
        wake();
      }
    };
  }

  global.GradientText = {
    init: createGradientText
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createGradientText };
  }
})(typeof window !== 'undefined' ? window : this);
