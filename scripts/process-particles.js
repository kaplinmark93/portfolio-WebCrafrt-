/**
 * Process Particles Engine
 * High-performance Canvas particle morphing simulation for Turnkey Development Process.
 */

(function (global) {
  'use strict';

  const STAGES_COUNT = 6;

  const STAGES_DATA = [
    {
      stepNumber: '01',
      stageLabel: 'ЕТАП 01 // СТРАТЕГІЯ',
      title: 'Суть & Залізний кошторис',
      description: 'Жодної води. Розбираємо вашу бізнес-модель, фіксуємо фінальну вартість у договорі до цента і закладаємо фундамент майбутньої конверсії.',
      iconSymbol: 'RADAR // 01',
      badge: 'Фіксована ціна & Сроки'
    },
    {
      stepNumber: '02',
      stageLabel: 'ЕТАП 02 // ПРОТОТИП',
      title: 'Тексти, що продають',
      description: 'Смисли замість «успішного успіху». Пишемо залізобетонні тексти та збираємо інтерактивний прототип, що веде клієнта до оплати.',
      iconSymbol: 'LAYOUT // 02',
      badge: 'Психологія продажів'
    },
    {
      stepNumber: '03',
      stageLabel: 'ЕТАП 03 // 3D & СТИЛЬ',
      title: 'Візуальний вау-ефект & 3D',
      description: 'Унікальний дизайн преміум-рівня. Інтерактивні 3D-моделі, плавна кінематика та світлові акценти, що закохують у ваш бренд із першого погляду.',
      iconSymbol: 'PRISM // 03',
      badge: 'Awwwards Quality'
    },
    {
      stepNumber: '04',
      stageLabel: 'ЕТАП 04 // РОЗРОБКА',
      title: 'Швидкість світла (Frontend)',
      description: 'Чистий код без важких CMS і непотрібних плагінів. Бездоганна мікроанімація, адаптивність та завантаження сайту за 0.3 секунди.',
      iconSymbol: 'CODE // 04',
      badge: 'PageSpeed 95+ & 60 FPS'
    },
    {
      stepNumber: '05',
      stageLabel: 'ЕТАП 05 // ЕКОСИСТЕМА',
      title: 'Повний автопілот (CRM & API)',
      description: 'Підключаємо платіжні шлюзи, ШІ-індексацію, аналітику, Telegram-боти та CRM. Ваші ліди миттєво летять менеджеру, сайт працює на автоматі.',
      iconSymbol: 'NEURAL // 05',
      badge: 'Автономні продажі'
    },
    {
      stepNumber: '06',
      stageLabel: 'ЕТАП 06 // РЕЛІЗ',
      title: 'Запуск & Свобода',
      description: 'Фінальне тестування, перенесення на наднадійний хостинг і навчання вашої команди. Ви отримуєте готовий цифровий актив «під ключ».',
      iconSymbol: 'ORBIT // 06',
      badge: '100% Готовність'
    }
  ];

  function getProcessStageData(index) {
    const safeIndex = Math.max(0, Math.min(STAGES_COUNT - 1, Math.floor(index)));
    return STAGES_DATA[safeIndex];
  }

  /**
   * Generates an array of target {x, y} points corresponding to each stage's iconic shape.
   */
  function generateShapePoints(stageIndex, centerX, centerY, count = 240) {
    const points = [];
    const safeIndex = Math.max(0, Math.min(STAGES_COUNT - 1, Math.floor(stageIndex)));
    const scale = Math.min(centerX, centerY) * 0.65;

    switch (safeIndex) {
      case 0: {
        // Stage 01: Radar / Blueprint
        const rings = [0.35 * scale, 0.65 * scale, 1.0 * scale];
        const ptsPerRing = Math.floor(count * 0.25);
        
        rings.forEach(r => {
          for (let i = 0; i < ptsPerRing; i++) {
            const theta = (i / ptsPerRing) * Math.PI * 2;
            points.push({
              x: centerX + Math.cos(theta) * r,
              y: centerY + Math.sin(theta) * r
            });
          }
        });
        const remaining = count - points.length;
        for (let i = 0; i < remaining; i++) {
          const t = (i / remaining) * 2 - 1;
          if (i % 2 === 0) {
            points.push({ x: centerX + t * scale, y: centerY });
          } else {
            points.push({ x: centerX, y: centerY + t * scale });
          }
        }
        break;
      }

      case 1: {
        // Stage 02: Content Wireframe / Typo Grid
        const w = scale * 1.3;
        const h = scale * 0.95;
        const left = centerX - w / 2;
        const top = centerY - h / 2;
        
        const borderCount = Math.floor(count * 0.45);
        for (let i = 0; i < borderCount; i++) {
          const p = (i / borderCount) * 4;
          let px, py;
          if (p < 1) { px = left + p * w; py = top; }
          else if (p < 2) { px = left + w; py = top + (p - 1) * h; }
          else if (p < 3) { px = left + (3 - p) * w; py = top + h; }
          else { px = left; py = top + (4 - p) * h; }
          points.push({ x: px, y: py });
        }

        const innerLeft = count - points.length;
        for (let i = 0; i < innerLeft; i++) {
          const t = i / innerLeft;
          if (t < 0.3) {
            const lt = t / 0.3;
            points.push({ x: left + 0.15 * w + lt * (w * 0.7), y: top + 0.25 * h });
          } else if (t < 0.65) {
            const lt = (t - 0.3) / 0.35;
            const line = Math.floor(lt * 4);
            const colT = (lt * 4) - line;
            points.push({ x: left + 0.15 * w + colT * (w * 0.3), y: top + 0.45 * h + line * 14 });
          } else {
            const lt = (t - 0.65) / 0.35;
            const theta = lt * Math.PI * 2;
            points.push({ x: left + 0.7 * w + Math.cos(theta) * (w * 0.15), y: top + 0.6 * h + Math.sin(theta) * 12 });
          }
        }
        break;
      }

      case 2: {
        // Stage 03: 3D Faceted Diamond / Prism
        const topV = { x: centerX, y: centerY - scale * 0.95 };
        const botV = { x: centerX, y: centerY + scale * 0.95 };
        const equatorRadius = scale * 0.85;
        const numEquator = 6;
        const equatorPts = [];
        for (let i = 0; i < numEquator; i++) {
          const theta = (i / numEquator) * Math.PI * 2;
          equatorPts.push({
            x: centerX + Math.cos(theta) * equatorRadius,
            y: centerY + Math.sin(theta) * (equatorRadius * 0.4)
          });
        }

        const ptsPerFacet = Math.floor(count / (numEquator * 2));
        for (let i = 0; i < numEquator; i++) {
          const eq1 = equatorPts[i];
          for (let j = 0; j < ptsPerFacet; j++) {
            const t = j / ptsPerFacet;
            points.push({ x: topV.x + (eq1.x - topV.x) * t, y: topV.y + (eq1.y - topV.y) * t });
          }
          for (let j = 0; j < ptsPerFacet; j++) {
            const t = j / ptsPerFacet;
            points.push({ x: botV.x + (eq1.x - botV.x) * t, y: botV.y + (eq1.y - botV.y) * t });
          }
        }
        while (points.length < count) {
          const t = points.length / count;
          const theta = t * Math.PI * 2;
          points.push({
            x: centerX + Math.cos(theta) * equatorRadius,
            y: centerY + Math.sin(theta) * (equatorRadius * 0.4)
          });
        }
        break;
      }

      case 3: {
        // Stage 04: Code Terminal & Brackets < / >
        const s = scale * 0.7;
        const ptsPerBracket = Math.floor(count * 0.32);
        
        for (let i = 0; i < ptsPerBracket; i++) {
          const t = i / ptsPerBracket;
          if (t < 0.5) {
            const sub = t / 0.5;
            points.push({ x: centerX - s * 0.3 - (1 - sub) * (s * 0.45), y: centerY - s * 0.7 + sub * (s * 0.7) });
          } else {
            const sub = (t - 0.5) / 0.5;
            points.push({ x: centerX - s * 0.75 + sub * (s * 0.45), y: centerY + sub * (s * 0.7) });
          }
        }
        
        for (let i = 0; i < ptsPerBracket; i++) {
          const t = i / ptsPerBracket;
          if (t < 0.5) {
            const sub = t / 0.5;
            points.push({ x: centerX + s * 0.3 + sub * (s * 0.45), y: centerY - s * 0.7 + sub * (s * 0.7) });
          } else {
            const sub = (t - 0.5) / 0.5;
            points.push({ x: centerX + s * 0.75 - sub * (s * 0.45), y: centerY + sub * (s * 0.7) });
          }
        }

        const remaining = count - points.length;
        for (let i = 0; i < remaining; i++) {
          const t = i / remaining;
          points.push({ x: centerX + s * 0.2 - t * (s * 0.4), y: centerY - s * 0.8 + t * (s * 1.6) });
        }
        break;
      }

      case 4: {
        // Stage 05: Neural API Network / Constellation Nodes
        const centerNodeCount = Math.floor(count * 0.25);
        for (let i = 0; i < centerNodeCount; i++) {
          const theta = (i / centerNodeCount) * Math.PI * 2;
          points.push({
            x: centerX + Math.cos(theta) * (scale * 0.22),
            y: centerY + Math.sin(theta) * (scale * 0.22)
          });
        }

        const satellites = 5;
        const satRadius = scale * 0.85;
        const ptsRemaining = count - points.length;
        const ptsPerSat = Math.floor(ptsRemaining / satellites);

        for (let s = 0; s < satellites; s++) {
          const satAngle = (s / satellites) * Math.PI * 2 - Math.PI / 2;
          const satX = centerX + Math.cos(satAngle) * satRadius;
          const satY = centerY + Math.sin(satAngle) * satRadius;

          for (let i = 0; i < ptsPerSat; i++) {
            const t = i / ptsPerSat;
            if (t < 0.45) {
              const lt = t / 0.45;
              points.push({ x: centerX + (satX - centerX) * lt, y: centerY + (satY - centerY) * lt });
            } else {
              const lt = (t - 0.45) / 0.55;
              const theta = lt * Math.PI * 2;
              points.push({
                x: satX + Math.cos(theta) * (scale * 0.12),
                y: satY + Math.sin(theta) * (scale * 0.12)
              });
            }
          }
        }
        while (points.length < count) {
          points.push({ x: centerX, y: centerY });
        }
        break;
      }

      case 5: {
        // Stage 06: Rocket & Orbital Launch
        const rocketCount = Math.floor(count * 0.65);
        for (let i = 0; i < rocketCount; i++) {
          const t = i / rocketCount;
          if (t < 0.4) {
            const sub = t / 0.4;
            const side = (i % 2 === 0) ? 1 : -1;
            points.push({
              x: centerX + side * sub * (scale * 0.25),
              y: centerY - scale * 0.9 + sub * (scale * 0.55)
            });
          } else if (t < 0.75) {
            const sub = (t - 0.4) / 0.35;
            const side = (i % 2 === 0) ? 1 : -1;
            points.push({
              x: centerX + side * (scale * 0.25),
              y: centerY - scale * 0.35 + sub * (scale * 0.7)
            });
          } else {
            const sub = (t - 0.75) / 0.25;
            const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.6;
            points.push({
              x: centerX + Math.cos(angle) * (sub * scale * 0.65),
              y: centerY + scale * 0.35 + Math.sin(angle) * (sub * scale * 0.65)
            });
          }
        }

        const orbitLeft = count - points.length;
        for (let i = 0; i < orbitLeft; i++) {
          const theta = (i / orbitLeft) * Math.PI * 2;
          points.push({
            x: centerX + Math.cos(theta) * (scale * 0.95),
            y: centerY + Math.sin(theta) * (scale * 0.32) + Math.cos(theta) * (scale * 0.25)
          });
        }
        break;
      }
    }

    while (points.length < count) {
      points.push({ x: centerX, y: centerY });
    }
    return points.slice(0, count);
  }

  /**
   * Initializes the Process Particles canvas controller and attaches to the HUD.
   */
  function initProcessParticles(canvas, hudElements = {}) {
    if (!canvas || !canvas.getContext) return null;

    const ctx = canvas.getContext('2d');
    let animationFrameId = null;
    let isDestroyed = false;

    let width = canvas.clientWidth || 800;
    let height = canvas.clientHeight || 600;
    let dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2);

    function resize() {
      if (isDestroyed) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      updateTargets();
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 180 : 320;
    const AMBIENT_COUNT = isMobile ? 30 : 60;

    const particles = [];
    const ambientParticles = [];

    let currentStageIndex = 0;
    let scrollProgress = 0;

    const colors = ['#7c3aed', '#a855f7', '#38bdf8', '#c084fc', '#ffffff'];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 400,
        y: height / 2 + (Math.random() - 0.5) * 400,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        targetX: width / 2,
        targetY: height / 2,
        baseRadius: Math.random() * 2 + 1.2,
        color: colors[i % colors.length],
        alpha: Math.random() * 0.6 + 0.4,
        stiffness: 0.05 + Math.random() * 0.03,
        damping: 0.84 + Math.random() * 0.05
      });
    }

    for (let i = 0; i < AMBIENT_COUNT; i++) {
      ambientParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1
      });
    }

    function updateTargets() {
      const centerX = width / 2;
      const centerY = height * 0.44;
      const targetPoints = generateShapePoints(currentStageIndex, centerX, centerY, PARTICLE_COUNT);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (targetPoints[i]) {
          particles[i].targetX = targetPoints[i].x;
          particles[i].targetY = targetPoints[i].y;
        }
      }
    }

    function loop() {
      if (isDestroyed) return;

      ctx.clearRect(0, 0, width, height);

      // Ambient particles
      ctx.fillStyle = '#38bdf8';
      for (let i = 0; i < ambientParticles.length; i++) {
        const p = ambientParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connecting webs
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.12)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i += 3) {
        for (let j = i + 1; j < Math.min(i + 8, particles.length); j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 2000) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Morphing particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const ax = (p.targetX - p.x) * p.stiffness;
        const ay = (p.targetY - p.y) * p.stiffness;
        p.vx = (p.vx + ax) * p.damping;
        p.vy = (p.vy + ay) * p.damping;

        p.x += p.vx;
        p.y += p.vy;

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.baseRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(loop);
    }

    function setProgress(progress) {
      scrollProgress = Math.max(0, Math.min(1, progress));
      const stageIdx = Math.min(STAGES_COUNT - 1, Math.floor(scrollProgress * STAGES_COUNT));

      if (stageIdx !== currentStageIndex) {
        currentStageIndex = stageIdx;
        updateTargets();
        updateHud(currentStageIndex);
      }

      if (hudElements.progressBar) {
        hudElements.progressBar.style.width = `${(scrollProgress * 100).toFixed(1)}%`;
      }
    }

    function updateHud(stageIndex) {
      const data = getProcessStageData(stageIndex);
      if (!data) return;

      if (hudElements.stepTag) {
        hudElements.stepTag.textContent = data.stageLabel;
      }
      if (hudElements.title) {
        hudElements.title.textContent = data.title;
      }
      if (hudElements.description) {
        hudElements.description.textContent = data.description;
      }
      if (hudElements.stepIndicator) {
        hudElements.stepIndicator.textContent = `[ 0${stageIndex + 1} / 0${STAGES_COUNT} ]`;
      }
      if (hudElements.badge) {
        hudElements.badge.textContent = data.badge;
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', resize);
    }
    resize();
    updateHud(0);
    loop();

    return {
      setProgress,
      getActiveStage: () => currentStageIndex,
      destroy: () => {
        isDestroyed = true;
        if (animationFrameId && typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(animationFrameId);
        }
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', resize);
        }
      }
    };
  }

  const api = {
    STAGES_COUNT,
    STAGES_DATA,
    getProcessStageData,
    generateShapePoints,
    initProcessParticles
  };

  global.ProcessParticles = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
