/**
 * SPLITTEXT COMPONENT (React Bits Specification)
 * Full Vanilla JS + GSAP implementation of React Bits <SplitText />
 * Supports: effect="rise" | "fade" | "blur" | "flip" | "pop" | "skew" | "wave"
 * Supports: hoverEffect="lift" (spring physics) | "wave" | "none"
 * Supports: splitType="chars" | "words" | "lines"
 * Supports: trigger="view" | "load" | "hover" | "click"
 */

(function () {
  'use strict';

  const DEFAULT_FROM = { opacity: 0, y: 40 };
  const DEFAULT_TO = { opacity: 1, y: 0 };
  const STIFFNESS = 180;
  const DAMPING = 19;
  const KICK = 0.024;

  const waveEase = t => 1 - Math.cos(t * Math.PI * 1.5) * Math.pow(1 - t, 1.2);

  const getEffect = (effect, em) => {
    switch (effect) {
      case 'fade':
        return { from: { opacity: 0 }, to: { opacity: 1 }, ease: 'power2.inOut' };
      case 'blur':
        return {
          from: { opacity: 0, filter: `blur(${Math.round(em * 1.4) / 10}px)` },
          to: { opacity: 1, filter: 'blur(0px)' },
          ease: 'power2.out'
        };
      case 'flip': {
        const setup = { transformPerspective: em * 6, transformOrigin: '50% 100%' };
        return {
          from: { ...setup, opacity: 0, rotationX: -90 },
          to: { ...setup, opacity: 1, rotationX: 0 },
          ease: 'power3.out'
        };
      }
      case 'pop':
        return { from: { opacity: 0, scale: 0 }, to: { opacity: 1, scale: 1 }, ease: 'back.out(1.6)' };
      case 'skew':
        return {
          from: { transformOrigin: '50% 100%', opacity: 0, x: -em * 0.4, skewX: -24 },
          to: { transformOrigin: '50% 100%', opacity: 1, x: 0, skewX: 0 },
          ease: 'expo.out'
        };
      case 'wave':
        return { from: { opacity: 0, y: em * 0.45 }, to: { opacity: 1, y: 0 }, ease: waveEase };
      case 'rise':
      default:
        return { from: { ...DEFAULT_FROM }, to: { ...DEFAULT_TO }, ease: 'power3.out' };
    }
  };

  /**
   * Split an element's text into nested words and characters while preserving child elements
   */
  function splitDOMText(container, splitType, mask) {
    const chars = [];
    const words = [];
    const lines = [];

    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text) return null;

        const fragment = document.createDocumentFragment();
        // Split text by whitespace, preserving newlines
        const tokens = text.split(/(\s+)/);

        tokens.forEach(token => {
          if (!token) return;
          if (/^\s+$/.test(token)) {
            // Whitespace: text node with space
            fragment.appendChild(document.createTextNode(token));
          } else {
            // Word
            const wordSpan = document.createElement('span');
            wordSpan.className = 'split-word';
            wordSpan.style.display = 'inline-block';
            wordSpan.style.whiteSpace = 'nowrap';
            words.push(wordSpan);

            // Characters inside word
            for (let i = 0; i < token.length; i++) {
              const ch = token[i];
              const charSpan = document.createElement('span');
              charSpan.className = 'split-char';
              charSpan.style.display = 'inline-block';
              charSpan.style.position = 'relative';
              charSpan.style.willChange = 'transform, opacity';
              charSpan.textContent = ch;

              if (mask) {
                const maskSpan = document.createElement('span');
                maskSpan.className = 'split-mask';
                maskSpan.style.display = 'inline-block';
                maskSpan.style.overflow = 'hidden';
                maskSpan.style.verticalAlign = 'top';
                maskSpan.appendChild(charSpan);
                wordSpan.appendChild(maskSpan);
              } else {
                wordSpan.appendChild(charSpan);
              }

              chars.push(charSpan);
            }

            fragment.appendChild(wordSpan);
          }
        });

        return fragment;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'BR') {
          return node.cloneNode(true);
        }
        const clone = node.cloneNode(false);
        const childNodes = Array.from(node.childNodes);
        childNodes.forEach(child => {
          const processed = processNode(child);
          if (processed) clone.appendChild(processed);
        });
        return clone;
      }
      return null;
    }

    const originalChildren = Array.from(container.childNodes);
    const newFragment = document.createDocumentFragment();
    originalChildren.forEach(child => {
      const processed = processNode(child);
      if (processed) newFragment.appendChild(processed);
    });

    container.innerHTML = '';
    container.appendChild(newFragment);

    return {
      chars,
      words,
      lines: [container],
      pieces: splitType === 'words' ? words : chars
    };
  }

  function createSplitText(el, options = {}) {
    if (!el) return null;

    const defaults = {
      effect: el.getAttribute('data-effect') || 'rise',
      splitType: el.getAttribute('data-split-type') || 'chars',
      delay: parseFloat(el.getAttribute('data-delay')) || 50,
      duration: parseFloat(el.getAttribute('data-duration')) || 1.25,
      staggerFrom: el.getAttribute('data-stagger-from') || 'start',
      trigger: el.getAttribute('data-trigger') || 'view',
      hoverEffect: el.getAttribute('data-hover-effect') || 'lift',
      loop: el.getAttribute('data-loop') === 'true',
      loopDelay: parseFloat(el.getAttribute('data-loop-delay')) || 1.5,
      mask: el.getAttribute('data-mask') === 'true',
      threshold: parseFloat(el.getAttribute('data-threshold')) || 0.1,
      rootMargin: el.getAttribute('data-root-margin') || '-100px',
      textAlign: el.getAttribute('data-text-align') || 'left',
      color: el.getAttribute('data-color') || undefined,
      accentColor: el.getAttribute('data-accent-color') || undefined,
      from: undefined,
      to: undefined,
      ease: undefined,
      onLetterAnimationComplete: undefined
    };

    const s = Object.assign({}, defaults, options);
    const live = { trigger: s.trigger, hoverEffect: s.hoverEffect, accentColor: s.accentColor };

    el.classList.add('split-parent');
    el.style.textAlign = s.textAlign;
    el.style.overflow = s.hoverEffect === 'none' && s.effect === 'rise' ? 'hidden' : 'visible';
    el.style.display = 'inline-block';
    el.style.whiteSpace = 'normal';
    el.style.wordWrap = 'break-word';
    if (s.color) el.style.color = s.color;
    if (s.trigger === 'click') el.style.cursor = 'pointer';

    // Check reduced motion
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      if (typeof s.onLetterAnimationComplete === 'function') s.onLetterAnimationComplete();
      return { destroy: () => {} };
    }

    // Split DOM
    const splitData = splitDOMText(el, s.splitType, s.mask);
    const pieces = splitData.pieces;
    const movers = pieces;

    if (!pieces.length) return null;

    const em = parseFloat(getComputedStyle(el).fontSize) || 16;
    const custom = s.from !== undefined || s.to !== undefined;
    const look = getEffect(s.effect, em);
    const fromVars = custom ? { ...(s.from || DEFAULT_FROM) } : look.from;
    const toVars = custom ? { ...(s.to || DEFAULT_TO) } : look.to;
    const easing = s.ease || (custom ? 'power3.out' : look.ease);
    const settle = custom ? 'willChange' : 'transform,filter,willChange';
    const exit = Math.max(0.35, s.duration * 0.55);

    let order = window.gsap ? gsap.utils.distribute({ each: s.delay / 1000, from: s.staggerFrom }) : 0.05;
    let revealed = false;
    let intro = null;
    let busy = null;
    let queued = null;
    let raf = 0;
    let last = 0;
    let centers = null;
    const lift = em * 0.22;
    const springs = [];
    const kicks = [];
    const pointer = { x: 0, y: 0, inside: false };

    // Initially hide pieces before reveal
    if (window.gsap) {
      gsap.set(pieces, { ...fromVars, willChange: 'transform, opacity' });
    } else {
      pieces.forEach(p => { p.style.opacity = '0'; p.style.transform = 'translateY(40px)'; });
    }

    const reveal = (initial, vars = {}) => {
      if (!window.gsap) {
        pieces.forEach(p => { p.style.opacity = '1'; p.style.transform = 'none'; });
        revealed = true;
        if (typeof s.onLetterAnimationComplete === 'function') s.onLetterAnimationComplete();
        return null;
      }

      const accent = live.accentColor;
      const tl = gsap.timeline(vars);
      tl.fromTo(
        pieces,
        { ...fromVars, willChange: 'transform, opacity' },
        { ...toVars, duration: s.duration, ease: easing, stagger: order, immediateRender: initial },
        0
      );

      if (accent) {
        tl.fromTo(
          pieces,
          { color: accent },
          {
            color: getComputedStyle(el).color,
            duration: s.duration * 0.7,
            ease: 'power1.inOut',
            stagger: order,
            immediateRender: initial
          },
          s.duration * 0.3
        );
      }

      tl.set(pieces, { clearProps: accent ? `${settle},color` : settle });
      return tl;
    };

    const conceal = () => {
      if (!window.gsap) return null;
      const accent = live.accentColor;
      const tl = gsap.timeline();
      tl.fromTo(
        pieces,
        { ...toVars, willChange: 'transform, opacity' },
        { ...fromVars, duration: exit, ease: 'power2.in', stagger: order, immediateRender: false },
        0
      );
      if (accent) tl.to(pieces, { color: accent, duration: exit, ease: 'power1.in', stagger: order }, 0);
      return tl;
    };

    const cycle = () => {
      if (busy || !revealed || !pieces.length || !window.gsap) return;
      queued?.kill();
      queued = null;
      busy = gsap
        .timeline({
          onComplete: () => {
            busy = null;
            queue();
          }
        })
        .add(conceal(), 0)
        .add(reveal(false), exit);
    };

    const queue = () => {
      if (!window.gsap) return;
      queued?.kill();
      queued = s.loop ? gsap.delayedCall(s.loopDelay, cycle) : null;
    };

    const measure = () => {
      const box = el.getBoundingClientRect();
      centers = movers.map((node, i) => {
        const rect = node.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - box.left,
          y: rect.top + rect.height / 2 - box.top - (springs[i]?.y || 0)
        };
      });
    };

    const tick = now => {
      raf = 0;
      const dt = Math.min(0.032, Math.max(0.001, (now - last) / 1000));
      last = now;
      const spots = live.hoverEffect === 'lift' && pointer.inside && revealed ? centers : null;
      const radius = em * 1.15;
      let moving = false;

      for (let k = kicks.length - 1; k >= 0; k--) {
        if (now < kicks[k].at) continue;
        const spring = springs[kicks[k].index];
        if (spring) spring.v -= kicks[k].velocity;
        kicks.splice(k, 1);
      }

      movers.forEach((node, i) => {
        const spring = springs[i] || (springs[i] = { y: 0, v: 0 });
        const spot = spots?.[i];
        let target = 0;
        if (spot) {
          const dx = (spot.x - pointer.x) / radius;
          const dy = (spot.y - pointer.y) / (radius * 1.4);
          target = -lift * Math.exp(-(dx * dx + dy * dy) * 0.5);
        }
        spring.v += (STIFFNESS * (target - spring.y) - DAMPING * spring.v) * dt;
        spring.y += spring.v * dt;
        if (Math.abs(target - spring.y) < 0.02 && Math.abs(spring.v) < 0.05) {
          spring.y = target;
          spring.v = 0;
        } else {
          moving = true;
        }
        node.style.translate = Math.abs(spring.y) > 0.01 ? `0 ${spring.y.toFixed(2)}px` : '';
      });

      if (moving || kicks.length) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const locate = e => {
      const box = el.getBoundingClientRect();
      pointer.x = e.clientX - box.left;
      pointer.y = e.clientY - box.top;
    };

    const onEnter = e => {
      locate(e);
      pointer.inside = true;
      if (!revealed) return;
      if (live.trigger === 'hover') cycle();
      if (live.hoverEffect === 'none') return;
      measure();
      if (live.hoverEffect === 'wave') {
        const now = performance.now();
        const speed = em * 9;
        const velocity = (em * 0.16) / KICK;
        centers.forEach((center, index) => {
          kicks.push({ index, velocity, at: now + (Math.abs(center.x - pointer.x) / speed) * 1000 });
        });
      }
      wake();
    };

    const onMove = e => {
      locate(e);
      pointer.inside = true;
      if (!revealed || live.hoverEffect !== 'lift') return;
      if (!centers) measure();
      wake();
    };

    const onLeave = () => {
      pointer.inside = false;
      wake();
    };

    const onClick = () => {
      if (live.trigger === 'click') cycle();
    };

    // Calculate ScrollTrigger start if ScrollTrigger is present
    const startPct = (1 - s.threshold) * 100;
    const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(s.rootMargin);
    const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
    const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
    const sign =
      marginValue === 0
        ? ''
        : marginValue < 0
          ? `-=${Math.abs(marginValue)}${marginUnit}`
          : `+=${marginValue}${marginUnit}`;
    const start = `top ${startPct}%${sign}`;

    // Trigger reveal
    const startReveal = () => {
      if (revealed) return;
      const scrollTriggerConfig =
        s.trigger === 'load'
          ? undefined
          : window.ScrollTrigger
            ? { trigger: el, start, once: true, fastScrollEnd: true, anticipatePin: 0.4 }
            : undefined;

      intro = reveal(true, {
        scrollTrigger: scrollTriggerConfig,
        onComplete: () => {
          revealed = true;
          intro = null;
          busy = null;
          if (typeof s.onLetterAnimationComplete === 'function') s.onLetterAnimationComplete();
          queue();
        }
      });
      busy = intro;
    };

    if (s.trigger === 'load' || window.ScrollTrigger) {
      startReveal();
    } else {
      // IntersectionObserver fallback for view trigger
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              startReveal();
              observer.disconnect();
            }
          });
        },
        { threshold: s.threshold, rootMargin: s.rootMargin }
      );
      observer.observe(el);
    }

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('click', onClick);

    const instance = {
      destroy: () => {
        cancelAnimationFrame(raf);
        queued?.kill();
        busy?.kill();
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
        el.removeEventListener('click', onClick);
        movers.forEach(node => {
          node.style.transform = '';
          node.style.translate = '';
        });
        if (window.ScrollTrigger) {
          ScrollTrigger.getAll().forEach(st => {
            if (st.trigger === el) st.kill();
          });
        }
      }
    };

    el._splitTextInstance = instance;
    return instance;
  }

  window.createSplitText = createSplitText;

  // Auto-init on DOMContentLoaded
  function initAll() {
    document.querySelectorAll('[data-split-text]').forEach(el => {
      createSplitText(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
