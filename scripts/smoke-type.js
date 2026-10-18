/**
 * SmokeType Component (Vanilla JS implementation of React Bits SmokeType)
 * "A headline that condenses out of drifting smoke, letter by letter"
 * Docs: https://pro.reactbits.dev/docs/components/smoke-type
 */
(function (global) {
  'use strict';

  const DEFAULTS = {
    text: '',
    as: 'h3',
    fontSize: 'clamp(1.85rem, 3.2vw, 2.75rem)',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    lineHeight: 1.15,
    align: 'left',
    color: '#0F172A',
    smokeColor: '#B19EEF',
    trigger: 'view',
    visible: true,
    direction: 'left',
    delay: 0.05,
    duration: 0.65,
    stagger: 0.035,
    rise: 0.35,
    turbulence: 0.8,
    softness: 0.8,
    density: 0.8,
    speed: 1,
    replayOnHover: false,
    quality: 1,
    onComplete: null
  };

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function createSmokeType(container, userOptions = {}) {
    if (!container) return null;

    const options = Object.assign({}, DEFAULTS, userOptions);
    let currentText = options.text || container.textContent.trim() || '';
    let isAnimating = false;
    let animTimeouts = [];
    let currentAnimToken = 0;

    // Ensure container has appropriate styling and class
    container.classList.add('smoke-type-root');
    container.style.textAlign = options.align;
    container.style.fontSize = typeof options.fontSize === 'number' ? `${options.fontSize}px` : options.fontSize;
    container.style.fontWeight = String(options.fontWeight);
    container.style.letterSpacing = options.letterSpacing;
    container.style.lineHeight = String(options.lineHeight);
    container.style.setProperty('--smoke-color', options.smokeColor);

    // Create wrapper element for text
    const textTag = options.as || 'span';
    let textEl = document.createElement(textTag);
    textEl.className = 'smoke-type-content' + (options.className ? ' ' + options.className : '');
    if (options.color && options.color !== 'inherit') {
      textEl.style.color = options.color;
    }
    container.innerHTML = '';
    container.appendChild(textEl);

    // Subtle ambient smoke canvas behind the text
    const canvas = document.createElement('canvas');
    canvas.className = 'smoke-type-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    container.insertBefore(canvas, textEl);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let canvasRaf = 0;
    let canvasVisible = true;

    function resizeCanvas() {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * options.quality;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
    }

    function createSmokePuff(x, y, color) {
      if (!ctx) return;
      const count = Math.max(1, Math.round(2 * options.density));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 0.3 * options.turbulence,
          vy: -(0.25 + Math.random() * 0.4) * (options.rise || 0.35),
          radius: 2 + Math.random() * 3 * options.softness,
          maxRadius: 4 + Math.random() * 5 * options.softness,
          alpha: 0.12 * options.density,
          life: 0,
          maxLife: 20 + Math.random() * 15,
          color: color || options.smokeColor
        });
      }
    }

    function renderCanvas() {
      if (!ctx || !canvasVisible) return;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.radius += (p.maxRadius - p.radius) * 0.05;
        const progress = p.life / p.maxLife;
        const currentAlpha = p.alpha * Math.sin(progress * Math.PI);

        if (progress >= 1 || currentAlpha <= 0.001) {
          particles.splice(i, 1);
          continue;
        }

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, hexToRgba(p.color, currentAlpha));
        gradient.addColorStop(0.5, hexToRgba(p.color, currentAlpha * 0.3));
        gradient.addColorStop(1, hexToRgba(p.color, 0));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (particles.length > 0) {
        canvasRaf = requestAnimationFrame(renderCanvas);
      } else {
        canvasRaf = 0;
      }
    }

    function hexToRgba(hex, alpha) {
      if (!hex || hex === 'inherit') return `rgba(177, 158, 239, ${alpha})`;
      if (hex.startsWith('rgba')) return hex;
      if (hex.startsWith('rgb')) {
        return hex.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
      }
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      const num = parseInt(c, 16);
      const r = (num >> 16) & 255;
      const g = (num >> 8) & 255;
      const b = num & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function wakeCanvas() {
      if (!canvasRaf && canvasVisible) {
        canvasRaf = requestAnimationFrame(renderCanvas);
      }
    }

    function clearTimeouts() {
      animTimeouts.forEach(clearTimeout);
      animTimeouts = [];
    }

    /**
     * Splits text into words and characters with smoke condensation styles
     */
    function renderText(text, animateIn = true, onComplete = null) {
      clearTimeouts();
      textEl.innerHTML = '';
      currentText = text;

      if (!text) {
        if (onComplete) onComplete();
        return;
      }

      const words = text.split(' ');
      const charElements = [];
      let charIndex = 0;

      words.forEach((word, wIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'smoke-type-word';
        wordSpan.style.display = 'inline-block';
        wordSpan.style.whiteSpace = 'nowrap';

        const chars = Array.from(word);
        chars.forEach((char) => {
          const charSpan = document.createElement('span');
          charSpan.className = 'smoke-type-char';
          charSpan.textContent = char;
          charSpan.style.display = 'inline-block';
          charSpan.style.position = 'relative';

          // Assign subtle turbulence offsets for each letter
          const swirl = ((charIndex % 5) - 2) * 1.5 * options.turbulence;
          const drift = (((charIndex * 3) % 7) - 3) * 1.5 * options.turbulence;
          charSpan.style.setProperty('--char-swirl', `${swirl}deg`);
          charSpan.style.setProperty('--char-drift', `${drift}px`);
          charSpan.style.setProperty('--smoke-rise', `${0.35 * (options.rise || 1)}em`);
          charSpan.style.setProperty('--smoke-blur', `${6 * options.softness}px`);
          charSpan.style.setProperty('--smoke-duration', `${Math.min(0.65, options.duration / options.speed)}s`);

          wordSpan.appendChild(charSpan);
          charElements.push(charSpan);
          charIndex++;
        });

        textEl.appendChild(wordSpan);

        if (wIdx < words.length - 1) {
          const spaceSpan = document.createElement('span');
          spaceSpan.className = 'smoke-type-space';
          spaceSpan.innerHTML = '&nbsp;';
          spaceSpan.style.display = 'inline-block';
          textEl.appendChild(spaceSpan);
        }
      });

      if (!animateIn) {
        charElements.forEach(el => {
          el.classList.add('is-settled');
        });
        if (onComplete) onComplete();
        return;
      }

      // Order of characters based on direction
      let orderedIndices = charElements.map((_, i) => i);
      if (options.direction === 'right') {
        orderedIndices.reverse();
      } else if (options.direction === 'center') {
        const mid = (charElements.length - 1) / 2;
        orderedIndices.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
      } else if (options.direction === 'edges') {
        const mid = (charElements.length - 1) / 2;
        orderedIndices.sort((a, b) => Math.abs(b - mid) - Math.abs(a - mid));
      } else if (options.direction === 'random') {
        orderedIndices.sort(() => Math.random() - 0.5);
      }

      isAnimating = true;
      resizeCanvas();

      const totalChars = charElements.length;
      orderedIndices.forEach((cIdx, seqIndex) => {
        const el = charElements[cIdx];
        const delayMs = (options.delay + seqIndex * options.stagger) * 1000 / options.speed;

        // Initial smoky state
        el.classList.remove('is-settled', 'is-condensing');
        el.classList.add('is-hidden');

        const tid = setTimeout(() => {
          el.classList.remove('is-hidden');
          el.classList.add('is-condensing');

          // Trigger subtle particle puff at letter position
          if (seqIndex % 2 === 0) {
            const rect = el.getBoundingClientRect();
            const cRect = container.getBoundingClientRect();
            const lx = rect.left - cRect.left + rect.width / 2;
            const ly = rect.top - cRect.top + rect.height / 2;
            createSmokePuff(lx, ly, options.smokeColor);
            wakeCanvas();
          }

          const onAnimEnd = () => {
            el.removeEventListener('animationend', onAnimEnd);
            el.classList.remove('is-condensing');
            el.classList.add('is-settled');
          };
          el.addEventListener('animationend', onAnimEnd, { once: true });

          const settleTid = setTimeout(() => {
            el.removeEventListener('animationend', onAnimEnd);
            el.classList.remove('is-condensing');
            el.classList.add('is-settled');

            if (seqIndex === totalChars - 1) {
              isAnimating = false;
              if (onComplete) onComplete();
              if (options.onComplete) options.onComplete();
            }
          }, Math.round((options.duration * 1000) / options.speed) + 40);

          animTimeouts.push(settleTid);
        }, delayMs);

        animTimeouts.push(tid);
      });
    }

    /**
     * Dissolves current letters back into rising smoke
     */
    function dissolve(onComplete = null) {
      clearTimeouts();
      const chars = Array.from(textEl.querySelectorAll('.smoke-type-char'));
      if (chars.length === 0) {
        if (onComplete) onComplete();
        return;
      }

      isAnimating = true;
      chars.forEach((char, i) => {
        const delay = Math.min(0.06, (i * 0.015) / options.speed);
        char.style.animationDelay = `${delay}s`;
        char.classList.remove('is-settled', 'is-condensing');
        char.classList.add('is-dissolving');
      });

      const tid = setTimeout(() => {
        isAnimating = false;
        if (onComplete) onComplete();
      }, 180 / options.speed);

      animTimeouts.push(tid);
    }

    /**
     * Updates text with smoke dissolve then smoke condensation
     */
    function setText(newText, onComplete = null) {
      if (newText === currentText && !isAnimating) {
        if (onComplete) onComplete();
        return;
      }

      currentAnimToken++;
      const token = currentAnimToken;

      dissolve(() => {
        if (token !== currentAnimToken) return;
        renderText(newText, true, onComplete);
      });
    }

    function replay() {
      setText(currentText);
    }

    if (options.replayOnHover) {
      container.addEventListener('mouseenter', () => {
        if (!isAnimating) replay();
      });
    }

    // Initial render
    renderText(currentText, options.visible);

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(entries => {
      canvasVisible = entries[entries.length - 1]?.isIntersecting ?? true;
      if (canvasVisible && particles.length > 0) wakeCanvas();
    });
    intersectionObserver.observe(container);

    return {
      setText,
      dissolve,
      replay,
      getText: () => currentText,
      destroy: () => {
        clearTimeouts();
        cancelAnimationFrame(canvasRaf);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        container.innerHTML = '';
      }
    };
  }

  global.SmokeType = {
    init: createSmokeType,
    create: createSmokeType
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createSmokeType, DEFAULTS };
  }
})(typeof window !== 'undefined' ? window : this);
