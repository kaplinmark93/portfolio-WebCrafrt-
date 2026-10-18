/**
 * MASKED HEADING COMPONENT (React Bits Specification)
 * Full implementation: SVG text clipPath, text measurement, parallax pointer motion,
 * idle drift animation, high-contrast monochrome texture, and GSAP entrance reveal.
 */

(function () {
  'use strict';

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  function createMaskedHeading(container, options = {}) {
    if (!container) return null;

    const defaults = {
      text: container.getAttribute('data-text') || container.textContent.trim() || 'WebCraft',
      mediaType: container.getAttribute('data-media-type') || 'image',
      src: container.getAttribute('data-src') || 'assets/hero.jpg',
      poster: container.getAttribute('data-poster') || '',
      fillScale: parseFloat(container.getAttribute('data-fill-scale')) || 1.25,
      parallax: parseFloat(container.getAttribute('data-parallax')) || 26,
      drift: parseFloat(container.getAttribute('data-drift')) || 18,
      brightness: parseFloat(container.getAttribute('data-brightness')) || 1.1,
      saturation: parseFloat(container.getAttribute('data-saturation')) || 1,
      grayscale: true,
      reveal: container.getAttribute('data-reveal') || 'rise',
      duration: parseFloat(container.getAttribute('data-duration')) || 1.1,
      stagger: parseFloat(container.getAttribute('data-stagger')) || 0.09,
      trigger: container.getAttribute('data-trigger') || 'mount',
      align: container.getAttribute('data-align') || 'center',
      weight: container.getAttribute('data-weight') || '800',
      tracking: parseFloat(container.getAttribute('data-tracking')) || -0.03,
      lineHeight: parseFloat(container.getAttribute('data-line-height')) || 1.06,
      textScale: parseFloat(container.getAttribute('data-text-scale')) || 0.22
    };

    const s = Object.assign({}, defaults, options);
    const clipId = `mh-${Math.random().toString(36).substring(2, 9)}`;
    const words = String(s.text).split(/\s+/).filter(Boolean);

    container.classList.add('masked-heading');
    container.style.textAlign = s.align;
    container.style.fontWeight = s.weight;
    container.style.letterSpacing = `${s.tracking}em`;
    container.style.lineHeight = s.lineHeight;

    // Build DOM structure exactly per React Bits spec
    const measureHtml = `<span class="masked-heading__measure">${words.map((w, i) => `<span class="masked-heading__word" data-word-idx="${i}">${w}<i class="masked-heading__baseline" data-base-idx="${i}"></i></span>`).join(' ')}</span>`;

    const svgDefsHtml = `<svg class="masked-heading__defs" aria-hidden="true" focusable="false"><defs><clipPath id="${clipId}" clipPathUnits="userSpaceOnUse">${words.map((w, i) => `<text data-glyph-idx="${i}">${w}</text>`).join('')}</clipPath></defs></svg>`;

    const mediaSourceHtml = s.mediaType === 'video'
      ? `<video class="masked-heading__source" src="${s.src}" poster="${s.poster}" autoplay muted loop playsinline></video>`
      : `<img class="masked-heading__source" src="${s.src}" alt="" draggable="false" />`;

    const revealHtml = `<span class="masked-heading__reveal"><span class="masked-heading__clip" style="clip-path: url(#${clipId}); -webkit-clip-path: url(#${clipId});"><span class="masked-heading__media">${mediaSourceHtml}</span></span></span>`;

    container.innerHTML = measureHtml + svgDefsHtml + revealHtml;

    const measureEl = container.querySelector('.masked-heading__measure');
    const revealEl = container.querySelector('.masked-heading__reveal');
    const mediaEl = container.querySelector('.masked-heading__media');
    const mediaImg = container.querySelector('.masked-heading__source');
    const wordEls = Array.from(container.querySelectorAll('.masked-heading__word'));
    const baseEls = Array.from(container.querySelectorAll('.masked-heading__baseline'));
    const glyphEls = Array.from(container.querySelectorAll('clipPath text'));

    const offset = { x: 0, y: 0, tx: 0, ty: 0 };

    function place() {
      if (!container || !mediaEl) return;
      const W = container.clientWidth || 400;
      const H = container.clientHeight || 120;
      const maxX = Math.max(0, ((s.fillScale - 1) / 2) * W);
      const maxY = Math.max(0, ((s.fillScale - 1) / 2) * H);

      mediaEl.style.transform = `translate3d(${clamp(offset.x, -maxX, maxX).toFixed(2)}px, ${clamp(offset.y, -maxY, maxY).toFixed(2)}px, 0) scale(${s.fillScale})`;
      const filterStyle = `grayscale(1) contrast(1.25) brightness(${s.brightness})`;
      mediaEl.style.filter = filterStyle;
      if (mediaImg) mediaImg.style.filter = filterStyle;
    }

    function sync() {
      if (!container || !measureEl) return;
      const W = container.clientWidth || 400;
      if (W <= 0) return;

      const calculatedFontSize = clamp(W * s.textScale, 48, 160);
      container.style.fontSize = `${calculatedFontSize.toFixed(1)}px`;

      const cs = window.getComputedStyle(measureEl);
      for (let i = 0; i < wordEls.length; i++) {
        const box = wordEls[i];
        const base = baseEls[i];
        const glyph = glyphEls[i];
        if (!box || !base || !glyph) continue;

        glyph.setAttribute('x', `${box.offsetLeft}`);
        glyph.setAttribute('y', `${base.offsetTop}`);
        glyph.style.fontFamily = cs.fontFamily;
        glyph.style.fontSize = cs.fontSize;
        glyph.style.fontWeight = cs.fontWeight || '800';
        glyph.style.fontStyle = cs.fontStyle;
        glyph.style.letterSpacing = cs.letterSpacing;
      }
      place();
    }

    sync();
    const ro = new ResizeObserver(() => sync());
    ro.observe(container);
    if (document.fonts?.ready) {
      document.fonts.ready.then(sync).catch(() => {});
    }

    let raf = 0;
    let last = performance.now();
    let clock = 0;

    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;

      const dx = Math.sin(clock * 0.21) * s.drift;
      const dy = Math.cos(clock * 0.17) * s.drift * 0.6;

      const ease = 1 - Math.exp(-dt / 0.18);
      offset.x += (offset.tx + dx - offset.x) * ease;
      offset.y += (offset.ty + dy - offset.y) * ease;

      place();
      raf = requestAnimationFrame(frame);
    }

    function onMove(e) {
      if (s.parallax <= 0) return;
      const r = container.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / (r.width || 1)) * 2 - 1;
      const ny = ((e.clientY - r.top) / (r.height || 1)) * 2 - 1;
      offset.tx = clamp(nx, -1, 1) * -s.parallax;
      offset.ty = clamp(ny, -1, 1) * -s.parallax;
    }

    function onLeave() {
      offset.tx = 0;
      offset.ty = 0;
    }

    window.addEventListener('pointermove', onMove, { passive: true });
    container.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(frame);

    // Entrance Animation (GSAP)
    const riseDistance = () => (parseFloat(window.getComputedStyle(container).fontSize) || 48) * 1.15;
    const hasGsap = typeof window.gsap !== 'undefined';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function settle() {
      if (hasGsap) {
        window.gsap.set(glyphEls, { y: 0 });
        window.gsap.set(revealEl, { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' });
      }
    }

    // Default settle so it is visible immediately without delay
    settle();

    function rest() {
      if (!hasGsap) return;
      if (s.reveal === 'rise') {
        window.gsap.set(glyphEls, { y: riseDistance() });
      } else if (s.reveal === 'wipe') {
        window.gsap.set(revealEl, { clipPath: 'inset(0% 100% 0% 0%)' });
      } else if (s.reveal === 'fade') {
        window.gsap.set(revealEl, { opacity: 0, scale: 1.08 });
      }
    }

    function play() {
      sync();
      if (!hasGsap || reduce || s.reveal === 'none') {
        settle();
        return;
      }
      if (s.reveal === 'rise') {
        window.gsap.set(revealEl, { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' });
        window.gsap.fromTo(
          glyphEls,
          { y: riseDistance() },
          { y: 0, duration: s.duration, stagger: s.stagger, ease: 'power4.out', overwrite: 'auto' }
        );
      } else if (s.reveal === 'wipe') {
        window.gsap.set(glyphEls, { y: 0 });
        const state = { p: 100 };
        window.gsap.to(state, {
          p: 0,
          duration,
          ease: 'power3.inOut',
          overwrite: 'auto',
          onUpdate: () => {
            revealEl.style.clipPath = `inset(0% ${state.p}% 0% 0%)`;
          }
        });
      } else {
        window.gsap.set(glyphEls, { y: 0 });
        window.gsap.fromTo(
          revealEl,
          { opacity: 0, scale: 1.08 },
          { opacity: 1, scale: 1, duration, ease: 'power3.out', overwrite: 'auto' }
        );
      }
    }

    const instance = {
      sync,
      play,
      settle,
      destroy: () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener('pointermove', onMove);
        container.removeEventListener('pointerleave', onLeave);
      }
    };

    container._maskedHeading = instance;
    return instance;
  }

  window.createMaskedHeading = createMaskedHeading;

  function initAll() {
    document.querySelectorAll('[data-masked-heading]').forEach(el => {
      createMaskedHeading(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
