/**
 * WEBCRAFT STUDIO — SCROLL-DRIVEN STORYTELLING HERO & CINEMATIC ZOOM TRANSITION
 * 1. 5 кроків запитань сторителінгу (українською мовою).
 * 2. Фінальний заголовок: WebCraft (ShinyText) + Створюємо сайти, де кожен відвідувач стає вашим покупцем.
 * 3. Кінематографічний зум у букву "C" слова "WebCraft" (scale: 85x-100x) із синхронним переходом у білий фон (#ffffff).
 * 4. GSAP ScrollTrigger + Lenis smooth scroll: чуйний, плавний скрол без затримок і лагів.
 * 5. Субпіксельна апаратна GPU-акселерація (scale, translate3d).
 */

(function () {
  'use strict';

  function initStorytelling() {
    const heroWrapper = document.getElementById('hero');
    const pinnedViewport = document.getElementById('story-pinned-viewport');
    if (!heroWrapper || !pinnedViewport) return;

    const steps = Array.from(heroWrapper.querySelectorAll('.story-step'));
    const finalHero = document.getElementById('story-final-hero');
    const finalHeroTitle = document.getElementById('final-hero-title');
    const finalHeroBrand = document.getElementById('hero-shiny-brand');
    const progressBar = document.getElementById('story-progress-bar');
    const scrollHint = document.getElementById('story-scroll-hint');
    const siteHeader = document.getElementById('header');
    const storyZoomPortal = document.getElementById('story-zoom-portal');
    const storyWhiteoutOverlay = document.getElementById('story-whiteout-overlay');
    const particlesContainer = document.getElementById('particles-background');

    // Головний екран Hero (WebCraft + слоган): активний одразу з відкриття сайту
    const FINAL_RANGE = {
      start: 0.000,
      peakStart: 0.000,
      peakEnd: 0.200,
      end: 1.000
    };

    // Кінематографічний зум у букву "C" та перехід у білий фон
    const ZOOM_RANGE = {
      start: 0.200,
      end: 1.000
    };

    let targetProgress = 0;
    let currentProgress = 0;
    let isTicking = false;
    let storyScrollTrigger = null;

    // Кешовані координати центру літери "C"
    let originPxX = 0;
    let originPxY = 0;
    let originPercentX = 50;
    let originPercentY = 50;
    let panTargetX = 0;
    let panTargetY = 0;
    let hasTargetCalculated = false;
    let isZoomingState = false;

    /**
     * PERFECT TRANSFORM ORIGIN:
     * Обчислює геометричний центр літери "C" без виклику layout thrashing
     */
    function calculateTargetOrigin() {
      const letterCEl = document.getElementById('shiny-target-c');
      if (!letterCEl || !storyZoomPortal || !finalHero) return;

      const prevPortalTransform = storyZoomPortal.style.transform;
      const prevHeroTransform = finalHero.style.transform;
      const prevDisplay = finalHero.style.display;
      const prevVisibility = finalHero.style.visibility;

      // Скидаємо трансформації для абсолютно точного вимірювання базової геометрії
      storyZoomPortal.style.transform = 'none';
      finalHero.style.transform = 'none';

      if (finalHero.style.display === 'none') {
        finalHero.style.display = 'flex';
      }
      finalHero.style.visibility = 'visible';

      const rectC = letterCEl.getBoundingClientRect();
      const rectPortal = storyZoomPortal.getBoundingClientRect();

      if (rectC.width > 0 && rectC.height > 0 && rectPortal.width > 0 && rectPortal.height > 0) {
        // Точний геометричний центр внутрішньої порожнини літери "C":
        const cCenterX = (rectC.left + rectC.width * 0.50) - rectPortal.left;
        const cCenterY = (rectC.top + rectC.height * 0.50) - rectPortal.top;

        originPxX = cCenterX;
        originPxY = cCenterY;
        originPercentX = (cCenterX / rectPortal.width) * 100;
        originPercentY = (cCenterY / rectPortal.height) * 100;

        // Вектор центрування камери:
        panTargetX = (window.innerWidth / 2) - (rectPortal.left + cCenterX);
        panTargetY = (window.innerHeight / 2) - (rectPortal.top + cCenterY);
        hasTargetCalculated = true;

        // Фіксуємо transform-origin безпосередньо у центрі літери "C"
        storyZoomPortal.style.transformOrigin = `${cCenterX.toFixed(2)}px ${cCenterY.toFixed(2)}px`;
      }

      finalHero.style.display = prevDisplay;
      finalHero.style.visibility = prevVisibility;
      finalHero.style.transform = prevHeroTransform;
      storyZoomPortal.style.transform = prevPortalTransform;
    }

    // Квінтичний smootherstep для надзвичайно м'яких переходів
    function smootherstep(t) {
      const c = Math.max(0, Math.min(1, t));
      return c * c * c * (c * (6 * c - 15) + 10);
    }

    function calculateScrollProgress() {
      const rect = heroWrapper.getBoundingClientRect();
      const heroTop = window.scrollY + rect.top;
      const totalScrollable = heroWrapper.offsetHeight - window.innerHeight;

      if (totalScrollable <= 0) return 0;

      const relativeScroll = window.scrollY - heroTop;
      const progress = Math.max(0, Math.min(1, relativeScroll / totalScrollable));
      return progress;
    }

    function calculateStageMetrics(progress, range) {
      if (progress < range.start || progress > range.end) {
        return { opacity: 0, translateY: 24, visible: false };
      }

      let opacity = 0;
      let translateY = 0;

      if (progress < range.peakStart) {
        const t = (progress - range.start) / (range.peakStart - range.start);
        const ease = smootherstep(t);
        opacity = ease;
        translateY = (1 - ease) * 24;
      } else if (progress <= range.peakEnd) {
        opacity = 1;
        translateY = 0;
      } else {
        const t = (progress - range.peakEnd) / (range.end - range.peakEnd);
        const ease = smootherstep(t);
        opacity = 1 - ease;
        translateY = -ease * 20;
      }

      return {
        opacity: Math.max(0, Math.min(1, opacity)),
        translateY,
        visible: opacity > 0.005
      };
    }

    let lastActiveStepIndex = -1;

    function getActiveStepIndex(progress) {
      if (progress < 0.115) return 0; // Step 1: Потрібен новий сайт для бізнесу?
      if (progress < 0.230) return 1; // Step 2: Хочете уникнути рутини...
      if (progress < 0.345) return 2; // Step 3: Шукаєте підрядника...
      if (progress < 0.460) return 3; // Step 4: Важливий результат...
      if (progress < 0.580) return 4; // Step 5: Довірте розробку нам.
      return 5; // Final Hero: WebCraft — Створюємо сайти...
    }

    function triggerStepParticleEffect(stepIdx) {
      const pContainer = particlesContainer || document.getElementById('particles-background');
      if (!pContainer) return;
      const pInstance = pContainer._particles;
      if (!pInstance || !pInstance.triggerAntigravityPulse) return;

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      if (pInstance.setRingTarget) {
        pInstance.setRingTarget(cx, cy);
      }
      pInstance.triggerAntigravityPulse(cx, cy, 1.15);
    }

    function renderProgress(p) {
      // 0. Antigravity particle pulse on step change
      const activeIdx = getActiveStepIndex(p);
      if (activeIdx !== lastActiveStepIndex) {
        lastActiveStepIndex = activeIdx;
        triggerStepParticleEffect(activeIdx);
      }

      // 1. Прогрес-бар зверху
      if (progressBar) {
        progressBar.style.width = (p * 100).toFixed(2) + '%';
      }

      // 2. Підказка скролу
      if (scrollHint) {
        const hintOpacity = Math.max(0, 1 - (p / 0.04));
        scrollHint.style.opacity = hintOpacity.toFixed(3);
        scrollHint.style.pointerEvents = hintOpacity < 0.1 ? 'none' : 'auto';
      }

      // 3. Фінальний екран Hero (WebCraft + слоган) — активний одразу з відкриття сайту
      if (finalHero) {
        finalHero.style.visibility = 'visible';
        finalHero.style.opacity = '1';
        finalHero.style.pointerEvents = 'auto';

        if (p < ZOOM_RANGE.start) {
          finalHero.style.transform = 'translate3d(0, 0, 0) scale(1)';
          if (finalHeroTitle) {
            finalHeroTitle.style.opacity = '1';
            finalHeroTitle.style.visibility = 'visible';
            finalHeroTitle.style.transform = 'translate3d(0, 0, 0)';
          }
          if (!hasTargetCalculated) {
            calculateTargetOrigin();
          }
        }

        if (!finalHero._maskedSynced) {
          finalHero._maskedSynced = true;
          const mhEl = finalHero.querySelector('[data-masked-heading]');
          if (mhEl && mhEl._maskedHeading) {
            mhEl._maskedHeading.sync();
            mhEl._maskedHeading.play();
          }
          const stEl = finalHero.querySelector('[data-shiny-text]');
          if (stEl && stEl._shinyText) {
            stEl._shinyText.wake();
          }
        }
      }

      // 5. КІНЕМАТОГРАФІЧНИЙ ЗУМ У ЛІТЕРУ "C" ТА WHITEOUT GATEWAY (0.730 .. 1.000)
      if (storyZoomPortal) {
        if (p < ZOOM_RANGE.start) {
          storyZoomPortal.style.transform = 'translate3d(0, 0, 0) scale(1)';
          storyZoomPortal.style.opacity = '1';

          if (isZoomingState) {
            isZoomingState = false;
            storyZoomPortal.style.willChange = 'transform, opacity';
            if (finalHeroBrand) {
              finalHeroBrand.style.filter = '';
              finalHeroBrand.style.backgroundImage = '';
              finalHeroBrand.style.webkitBackgroundClip = '';
              finalHeroBrand.style.backgroundClip = '';
              finalHeroBrand.style.webkitTextFillColor = '';
              finalHeroBrand.style.color = '';
              const glow = finalHeroBrand.querySelector('.shiny-text__glow');
              if (glow) glow.style.opacity = '';
            }
            if (finalHeroTitle) {
              finalHeroTitle.style.visibility = 'visible';
            }

            const stEl = finalHero ? finalHero.querySelector('[data-shiny-text]') : null;
            if (stEl && stEl._shinyText && stEl._shinyText.wake) {
              stEl._shinyText.wake();
            }
            if (particlesContainer && particlesContainer._particles && particlesContainer._particles.resume) {
              particlesContainer._particles.resume();
            }
          }

          if (storyWhiteoutOverlay) {
            storyWhiteoutOverlay.style.opacity = '0';
          }
          if (pinnedViewport) {
            pinnedViewport.style.backgroundColor = '';
          }
          if (particlesContainer) {
            particlesContainer.style.opacity = '1';
          }
        } else {
          if (!hasTargetCalculated) {
            calculateTargetOrigin();
          }

          if (!isZoomingState) {
            isZoomingState = true;
            // Switch to dynamic vector rendering so Chromium rasterizes text dynamically at full screen DPI instead of stretching a 1x bitmap tile
            storyZoomPortal.style.willChange = 'opacity';
            if (finalHeroBrand) {
              finalHeroBrand.style.filter = 'none';
              finalHeroBrand.style.backgroundImage = 'none';
              finalHeroBrand.style.webkitBackgroundClip = 'unset';
              finalHeroBrand.style.backgroundClip = 'unset';
              finalHeroBrand.style.webkitTextFillColor = '#FFFFFF';
              finalHeroBrand.style.color = '#FFFFFF';
              const glow = finalHeroBrand.querySelector('.shiny-text__glow');
              if (glow) glow.style.opacity = '0';
            }

            const stEl = finalHero ? finalHero.querySelector('[data-shiny-text]') : null;
            if (stEl && stEl._shinyText && stEl._shinyText.sleep) {
              stEl._shinyText.sleep();
            }
            if (particlesContainer && particlesContainer._particles && particlesContainer._particles.pause) {
              particlesContainer._particles.pause();
            }
          }

          const zoomT = Math.min(1, Math.max(0, (p - ZOOM_RANGE.start) / (ZOOM_RANGE.end - ZOOM_RANGE.start)));
          const isMobile = window.innerWidth <= 768;
          const maxScale = isMobile ? 85 : 100;

          // Кінематографічна експоненційна крива зуму
          const easeZoom = Math.pow(zoomT, 2.2);
          const currentScale = 1 + easeZoom * (maxScale - 1);

          // Бездоганне центрування камери строго на порожнину літери "C" без бокових дрейфів
          const panFactor = Math.min(1, Math.pow(zoomT, 1.15));
          const panX = panTargetX * panFactor;
          const panY = panTargetY * panFactor;

          storyZoomPortal.style.transform = `translate3d(${panX.toFixed(2)}px, ${panY.toFixed(2)}px, 0) scale(${currentScale.toFixed(3)})`;

          // Плавне згасання підзаголовка (використовуємо visibility: hidden замість display: none, щоб зберегти базову геометрію flex-контейнера)
          if (finalHeroTitle) {
            const subOpacity = Math.max(0, 1 - zoomT * 3.5);
            if (subOpacity <= 0.005) {
              finalHeroTitle.style.opacity = '0';
              finalHeroTitle.style.visibility = 'hidden';
            } else {
              finalHeroTitle.style.visibility = 'visible';
              finalHeroTitle.style.opacity = subOpacity.toFixed(3);
              finalHeroTitle.style.transform = `translate3d(0, ${(zoomT * 32).toFixed(1)}px, 0)`;
            }
          }

          // THE WHITEOUT GATEWAY (Синхронне затоплення білим світлом #ffffff)
          if (storyWhiteoutOverlay) {
            let whiteOpacity = 0;
            if (zoomT > 0.45) {
              const whiteT = Math.min(1, (zoomT - 0.45) / 0.50);
              whiteOpacity = Math.pow(whiteT, 1.4);
            }
            storyWhiteoutOverlay.style.opacity = whiteOpacity.toFixed(3);
          }

          // Фіксація чистокровного білого фону на піку тунелю
          if (pinnedViewport) {
            if (zoomT >= 0.95) {
              pinnedViewport.style.backgroundColor = '#FFFFFF';
            } else {
              pinnedViewport.style.backgroundColor = '';
            }
          }

          // М'яке розчинення портальних гліфів у білому просторі
          if (zoomT > 0.82) {
            const fadeT = Math.min(1, (zoomT - 0.82) / 0.16);
            storyZoomPortal.style.opacity = Math.max(0, 1 - fadeT).toFixed(3);
          } else {
            storyZoomPortal.style.opacity = '1';
          }

          // Згасання фонових часточок
          if (particlesContainer) {
            const partOpacity = Math.max(0, 1 - zoomT * 2.5);
            particlesContainer.style.opacity = partOpacity.toFixed(3);
          }
        }
      }

      // 6. Шапка сайту
      if (siteHeader) {
        if (document.body.classList.contains('wc-site-opened')) {
          siteHeader.classList.add('header-visible', 'header-site-opened');
          siteHeader.style.opacity = '';
          siteHeader.style.transform = '';
          return;
        }

        if (p >= FINAL_RANGE.start && p < ZOOM_RANGE.start + 0.05) {
          siteHeader.classList.add('header-visible');
          siteHeader.style.opacity = '1';
          siteHeader.style.transform = 'translateY(0)';
          siteHeader.style.pointerEvents = 'auto';
        } else if (p >= ZOOM_RANGE.start + 0.05) {
          const zoomT = (p - ZOOM_RANGE.start) / (ZOOM_RANGE.end - ZOOM_RANGE.start);
          const headerOpacity = Math.max(0, 1 - zoomT * 4);
          siteHeader.style.opacity = headerOpacity.toFixed(3);
          siteHeader.style.transform = `translateY(-${(zoomT * 28).toFixed(1)}px)`;
          siteHeader.style.pointerEvents = 'none';
        } else {
          siteHeader.classList.remove('header-visible');
          siteHeader.style.opacity = '';
          siteHeader.style.transform = '';
        }
      }
    }

    // Резервний плавний демпфер (fallback)
    function tick() {
      const diff = targetProgress - currentProgress;
      const absDiff = Math.abs(diff);

      if (absDiff < 0.00012) {
        currentProgress = targetProgress;
        renderProgress(currentProgress);
        isTicking = false;
        return;
      }

      const factor = Math.min(0.35, Math.max(0.20, 0.25 + absDiff * 1.8));
      currentProgress += diff * factor;
      renderProgress(currentProgress);
      requestAnimationFrame(tick);
    }

    function onScrollNative() {
      if (storyScrollTrigger) return;
      targetProgress = calculateScrollProgress();
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(tick);
      }
    }

    function onResize() {
      hasTargetCalculated = false;
      calculateTargetOrigin();
      if (typeof ScrollTrigger !== 'undefined' && storyScrollTrigger) {
        ScrollTrigger.refresh();
      } else {
        onScrollNative();
      }
    }

    /**
     * Ініціалізація Lenis Smooth Scroll для всієї сторінки
     */
    function initLenisSmoothScroll() {
      if (typeof Lenis !== 'undefined' && !window.__lenisInstance) {
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (!reduceMotion) {
          window.__lenisInstance = new Lenis({
            duration: 1.8,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.82,
            touchMultiplier: 1.2,
            infinite: false
          });

          function lenisRaf(time) {
            if (window.__lenisInstance) {
              window.__lenisInstance.raf(time);
              requestAnimationFrame(lenisRaf);
            }
          }
          requestAnimationFrame(lenisRaf);

          if (typeof ScrollTrigger !== 'undefined') {
            window.__lenisInstance.on('scroll', ScrollTrigger.update);
          }
        }
      }
    }

    /**
     * Ініціалізація GSAP ScrollTrigger з чуйним демпфером
     */
    function initScrollTriggerIntegration() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return false;
      }

      gsap.registerPlugin(ScrollTrigger);

      if (storyScrollTrigger) {
        storyScrollTrigger.kill();
        storyScrollTrigger = null;
      }

      if (typeof gsap !== 'undefined' && gsap.ticker) {
        gsap.ticker.lagSmoothing(0);
      }

      storyScrollTrigger = ScrollTrigger.create({
        trigger: heroWrapper,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.65, // Плавний кінематографічний демпфер: усуває ступінчасті стрибки коліщатка миші
        fastScrollEnd: true,
        preventOverlaps: true,
        onUpdate: (self) => {
          targetProgress = self.progress;
          currentProgress = self.progress;
          renderProgress(self.progress);
        }
      });

      if (window.__lenisInstance) {
        window.__lenisInstance.on('scroll', ScrollTrigger.update);
      }

      return true;
    }

    window.addEventListener('scroll', onScrollNative, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Початкове налаштування
    initLenisSmoothScroll();

    setTimeout(() => {
      calculateTargetOrigin();
      initScrollTriggerIntegration();

      if (lastActiveStepIndex === -1 || lastActiveStepIndex === 0) {
        lastActiveStepIndex = 0;
        triggerStepParticleEffect(0);
      }
    }, 150);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        calculateTargetOrigin();
      });
    }

    targetProgress = calculateScrollProgress();
    currentProgress = targetProgress;
    renderProgress(currentProgress);

    window.__storyHero = {
      renderProgress,
      calculateTargetOrigin,
      getProgress: () => currentProgress,
      getTarget: () => targetProgress,
      stepTo: (p) => {
        targetProgress = p;
        currentProgress = p;
        if (storyScrollTrigger) {
          const totalScroll = storyScrollTrigger.end - storyScrollTrigger.start;
          const targetY = storyScrollTrigger.start + p * totalScroll;
          window.scrollTo({ top: targetY, behavior: 'instant' });
        }
        renderProgress(p);
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStorytelling);
  } else {
    initStorytelling();
  }
})();
