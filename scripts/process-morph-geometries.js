/**
 * ANTIGRAVITY PROCESS MORPHING GEOMETRIES (STAGES 0 to 6)
 * Generates true 3D volumetric particle point clouds for the 7 stages of web development.
 * Every element is a real 3D solid/surface with full curvature, depth, and volume.
 *
 * Output: Float32Array packed into an RGBA32F WebGL2 Data Texture.
 * Format per particle: [x, y, z, tag]
 * tag = 0.0: Core 3D solid/surface element (stationary, rock-solid, zero drift)
 * tag = 0.5: Ethereal aura/halo floating around the element
 * tag = 1.0: Dynamic full-screen particle dust across the entire screen
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exported = factory();
    root.ProcessMorphGeometries = exported;
    root.AntigravityMorphGeometries = exported;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STAGES_COUNT = 8;

  const STAGES_CONTENT = [
    {
      index: 0,
      id: 'start',
      isStart: true,
      stepNumber: '',
      badge: '',
      title: 'Етапи розробки',
      description: '',
      shapeName: '3D Три парящих ізометричних шари',
      side: 'right'
    },
    {
      index: 1,
      id: 'idea',
      stepNumber: '01',
      badge: 'АНАЛІЗ ТА СТРАТЕГІЯ',
      title: 'Обговорення ідеї',
      description: "З'ясування потреб та складання технічного завдання. Формування чітких бізнес-цілей та дорожньої карти проєкту.",
      shapeName: '3D Лампочка — символ ідеї',
      side: 'left'
    },
    {
      index: 2,
      id: 'prototype',
      stepNumber: '02',
      badge: 'АРХІТЕКТУРА ТА СЦЕНАРІЇ',
      title: 'Створення прототипу',
      description: 'Розробка концепції та аналіз користувальницьких сценаріїв. Проектування структури сторінок та архітектури інтерфейсу.',
      shapeName: '3D Планшет — план проекту',
      side: 'right'
    },
    {
      index: 3,
      id: 'design',
      stepNumber: '03',
      badge: 'ПРЕМІАЛЬНА ЕСТЕТИКА ТА СТИЛЬ',
      title: 'Дизайн',
      description: 'Створення унікального дизайн-макету сайту на основі фірмового стилю. Розробка візуальної мови та естетичних акцентів.',
      shapeName: 'Преміальний огранений кристал',
      side: 'left'
    },
    {
      index: 4,
      id: 'coding',
      stepNumber: '04',
      badge: 'ФУНКЦІОНАЛ ТА ЛОГІКА',
      title: 'WEB-програмування',
      description: 'Робота над функціональністю сайту, програмування логіки, інтеграція платіжних систем, CRM та серверних модулів.',
      shapeName: '3D Вікно терміналу: hello, world!!',
      side: 'right'
    },
    {
      index: 5,
      id: 'seo',
      stepNumber: '05',
      badge: 'ОРГАНІЧНЕ ЗРОСТАННЯ',
      title: 'SEO-підготовка',
      description: 'Звірка з чек-листом з підготовки сайту до органічного просування, технічна оптимізація та підготовка до швидкої індексації.',
      shapeName: '3D Графік зростання',
      side: 'left'
    },
    {
      index: 6,
      id: 'testing',
      stepNumber: '06',
      badge: 'КОНТРОЛЬ ЯКОСТІ',
      title: 'Тестування',
      description: 'Комплексна перевірка коректного відображення та функціональності на всіх типах пристроїв перед офіційним релізом.',
      shapeName: '3D Індикатор тестування (Spinner)',
      side: 'right'
    },
    {
      index: 7,
      id: 'release',
      stepNumber: '07',
      badge: 'ЗАПУСК ТА ПІДТРИМКА',
      title: 'Реліз та підтримка',
      description: 'Успішний реліз проекту, налаштування аналітики, передача доступу та подальша технічна підтримка.',
      shapeName: '3D 5 Золотих зірок — реліз і підтримка',
      side: 'left'
    }
  ];

  // Semantic tagging for jewelry-grade volumetric particles matching user reference:
  const TAG_WIRE_FRAME      = 0.04; // Outer wireframe ribs, chassis, rims, perimeters, axes
  const TAG_SURFACE_FILL    = 0.08; // Facet planes, volume fill, syntax code blocks
  const TAG_DOT_RED         = 0.15; // macOS Red window button dot
  const TAG_DOT_YELLOW      = 0.19; // macOS Yellow window button dot
  const TAG_DOT_GREEN       = 0.23; // macOS Green window button dot
  const TAG_GOLD_STAR       = 0.265; // 5 Golden 3D Rating Stars for Stage 7
  const TAG_TERMINAL_GREEN  = 0.30; // Glowing Matrix Neon Green for ">_ hello, world!!"
  const TAG_ACCENT_CORE     = TAG_WIRE_FRAME; // Pure diamond white core
  const TAG_STAR_GLINT      = TAG_WIRE_FRAME; // Sparkling 3D diamond flare (100% pure diamond white)
  const TAG_HALO_AURA       = 0.50; // Local ethereal surrounding aura
  const TAG_STARDUST        = 1.00; // Fullscreen cosmic stardust

  /**
   * Deterministic pseudo-random generator
   */
  function createRng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  /**
   * 3D Rotation helper (Euler angles in radians: pitch = X, yaw = Y, roll = Z)
   */
  function rotate3D(pt, pitch, yaw, roll = 0) {
    let { x, y, z = 0, tag = 0.0 } = pt;
    if (yaw !== 0) {
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const x1 = x * cy + z * sy;
      const z1 = -x * sy + z * cy;
      x = x1;
      z = z1;
    }
    if (pitch !== 0) {
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const y1 = y * cp - z * sp;
      const z1 = y * sp + z * cp;
      y = y1;
      z = z1;
    }
    if (roll !== 0) {
      const cr = Math.cos(roll), sr = Math.sin(roll);
      const x1 = x * cr - y * sr;
      const y1 = x * sr + y * cr;
      x = x1;
      y = y1;
    }
    return { x, y, z, tag };
  }

  /**
   * 3D Line interpolation helper
   */
  function addLine3D(points, pA, pB, numPts, rng, jitter = 0.008, rotFn = null, tag = 0.0) {
    for (let i = 0; i < numPts; i++) {
      const t = numPts <= 1 ? 0.5 : i / (numPts - 1);
      const lx = pA[0] + (pB[0] - pA[0]) * t + (rng() - 0.5) * jitter;
      const ly = pA[1] + (pB[1] - pA[1]) * t + (rng() - 0.5) * jitter;
      const lz = (pA[2] ?? 0) + ((pB[2] ?? 0) - (pA[2] ?? 0)) * t + (rng() - 0.5) * jitter;
      const pt = { x: lx, y: ly, z: lz, tag };
      points.push(rotFn ? rotFn(pt) : pt);
    }
  }

  /**
   * 3D Rectangular wireframe perimeter
   */
  function addRect3D(points, p1, p2, p3, p4, ptsPerSide, rng, jitter = 0.008, rotFn = null, tag = 0.0) {
    addLine3D(points, p1, p2, ptsPerSide, rng, jitter, rotFn, tag);
    addLine3D(points, p2, p3, ptsPerSide, rng, jitter, rotFn, tag);
    addLine3D(points, p3, p4, ptsPerSide, rng, jitter, rotFn, tag);
    addLine3D(points, p4, p1, ptsPerSide, rng, jitter, rotFn, tag);
  }

  /**
   * 3D Surface Quad helper - bilinearly samples a 3D planar quadrilateral face
   */
  function addSurfaceQuad(points, p0, p1, p2, p3, nx, ny, rng, jitter = 0.008, rotFn = null, tag = 0.0) {
    for (let ix = 0; ix < nx; ix++) {
      const u = nx <= 1 ? 0.5 : ix / (nx - 1);
      for (let iy = 0; iy < ny; iy++) {
        const v = ny <= 1 ? 0.5 : iy / (ny - 1);
        const x = (1 - u) * (1 - v) * p0[0] + u * (1 - v) * p1[0] + u * v * p2[0] + (1 - u) * v * p3[0] + (rng() - 0.5) * jitter;
        const y = (1 - u) * (1 - v) * p0[1] + u * (1 - v) * p1[1] + u * v * p2[1] + (1 - u) * v * p3[1] + (rng() - 0.5) * jitter;
        const z = (1 - u) * (1 - v) * (p0[2] || 0) + u * (1 - v) * (p1[2] || 0) + u * v * (p2[2] || 0) + (1 - u) * v * (p3[2] || 0) + (rng() - 0.5) * jitter;
        const pt = { x, y, z, tag };
        points.push(rotFn ? rotFn(pt) : pt);
      }
    }
  }

  /**
   * 3D Revolution Surface helper - samples a continuous 360-degree round shell around Y axis
   */
  function addRevolutionSurface(points, profile, numTheta, rng, jitter = 0.008, rotFn = null, tag = 0.0) {
    for (let s = 0; s < profile.length; s++) {
      const [y, r] = profile[s];
      if (r <= 0.001) {
        const pt = { x: 0, y, z: 0, tag };
        points.push(rotFn ? rotFn(pt) : pt);
        continue;
      }
      const nTheta = Math.max(8, Math.round(numTheta * Math.min(1.0, r / 0.40)));
      for (let k = 0; k < nTheta; k++) {
        const theta = (k / nTheta) * Math.PI * 2 + (rng() - 0.5) * 0.02;
        const x = Math.cos(theta) * r + (rng() - 0.5) * jitter;
        const z = Math.sin(theta) * r + (rng() - 0.5) * jitter;
        const pt = { x, y: y + (rng() - 0.5) * jitter, z, tag };
        points.push(rotFn ? rotFn(pt) : pt);
      }
    }
  }

  /**
   * 3D Solid Box helper - fills 6 outer faces and cross-volume of a 3D rectangular box/prism
   */
  function addSolidBox(points, minPt, maxPt, nx, ny, nz, rng, jitter = 0.008, rotFn = null, tag = 0.0) {
    const [x1, y1, z1] = minPt;
    const [x2, y2, z2] = maxPt;
    // Front face (z2) & Back face (z1)
    addSurfaceQuad(points, [x1, y1, z2], [x2, y1, z2], [x2, y2, z2], [x1, y2, z2], nx, ny, rng, jitter, rotFn, tag);
    addSurfaceQuad(points, [x1, y1, z1], [x2, y1, z1], [x2, y2, z1], [x1, y2, z1], nx, ny, rng, jitter, rotFn, tag);
    // Top face (y2) & Bottom face (y1)
    addSurfaceQuad(points, [x1, y2, z1], [x2, y2, z1], [x2, y2, z2], [x1, y2, z2], nx, nz, rng, jitter, rotFn, tag);
    addSurfaceQuad(points, [x1, y1, z1], [x2, y1, z1], [x2, y1, z2], [x1, y1, z2], nx, nz, rng, jitter, rotFn, tag);
    // Left face (x1) & Right face (x2)
    addSurfaceQuad(points, [x1, y1, z1], [x1, y2, z1], [x1, y2, z2], [x1, y1, z2], ny, nz, rng, jitter, rotFn, tag);
    addSurfaceQuad(points, [x2, y1, z1], [x2, y2, z1], [x2, y2, z2], [x2, y1, z2], ny, nz, rng, jitter, rotFn, tag);
  }

  /**
   * 3D Circle Ring in the XZ plane at height Y
   */
  function addCircleRing3D(points, centerY, radius, numPts, rng, jitter = 0.008, rotFn = null, tag = 0.0) {
    for (let i = 0; i < numPts; i++) {
      const theta = (i / numPts) * Math.PI * 2;
      const x = Math.cos(theta) * radius + (rng() - 0.5) * jitter;
      const z = Math.sin(theta) * radius + (rng() - 0.5) * jitter;
      const pt = { x, y: centerY + (rng() - 0.5) * jitter, z, tag };
      points.push(rotFn ? rotFn(pt) : pt);
    }
  }

  /**
   * 3D Filled Disc in the XZ plane at height Y
   */
  function addCircleDisc3D(points, centerY, radius, numRadial, numAngular, rng, jitter = 0.008, rotFn = null, tag = 0.0) {
    for (let rStep = 1; rStep <= numRadial; rStep++) {
      const r = (rStep / numRadial) * radius;
      const nAng = Math.max(8, Math.round(numAngular * (rStep / numRadial)));
      for (let aStep = 0; aStep < nAng; aStep++) {
        const theta = (aStep / nAng) * Math.PI * 2;
        const x = Math.cos(theta) * r + (rng() - 0.5) * jitter;
        const z = Math.sin(theta) * r + (rng() - 0.5) * jitter;
        const pt = { x, y: centerY + (rng() - 0.5) * jitter, z, tag };
        points.push(rotFn ? rotFn(pt) : pt);
      }
    }
  }

  /**
   * Systematic Stratified Resampler:
   * Guarantees that ALL components of the 3D element are perfectly preserved in exact proportions!
   * No component is ever truncated or deleted.
   */
  function resampleCorePoints(points, targetCount, rng) {
    if (!points || points.length === 0) {
      const res = [];
      for (let i = 0; i < targetCount; i++) res.push({ x: 0, y: 0, z: 0, tag: 0.0 });
      return res;
    }
    if (points.length === targetCount) return points;
    if (points.length > targetCount) {
      const step = points.length / targetCount;
      const sampled = [];
      for (let i = 0; i < targetCount; i++) {
        const idx = Math.min(points.length - 1, Math.floor(i * step));
        sampled.push(points[idx]);
      }
      return sampled;
    }
    const res = points.slice();
    while (res.length < targetCount) {
      const p = points[Math.floor(rng() * points.length)];
      res.push({
        x: p.x + (rng() - 0.5) * 0.012,
        y: p.y + (rng() - 0.5) * 0.012,
        z: p.z + (rng() - 0.5) * 0.012,
        tag: p.tag !== undefined ? p.tag : 0.0
      });
    }
    return res;
  }

  /**
   * Ambient Clouds Generator:
   * 1. Ethereal Local Halo around the 3D element (tag: 0.5)
   * 2. Fullscreen Ambient Particle Dust across viewport (tag: 1.0)
   */
  function addHaloAndFullscreenParticles(points, haloCount, screenCount, rng, opts = {}) {
    const {
      minR = 1.15,
      maxR = 2.45,
      maxZ = 1.25,
      screenX = 5.0,
      screenY = 3.2,
      screenZ = 2.6
    } = opts;

    // A. Local Halo / Aura around the shape
    for (let i = 0; i < haloCount; i++) {
      const u = rng();
      const radius = minR + Math.pow(u, 1.25) * (maxR - minR);
      const theta = rng() * Math.PI * 2;
      const phi = (rng() - 0.5) * Math.PI * 0.85;

      const x = Math.cos(theta) * Math.cos(phi) * radius;
      const y = Math.sin(theta) * Math.cos(phi) * radius * 0.88;
      const z = Math.sin(phi) * maxZ;

      points.push({ x, y, z, tag: 0.5 });
    }

    // B. Full-Screen Ambient Field across entire viewport
    for (let i = 0; i < screenCount; i++) {
      const sx = (rng() - 0.5) * 2.0 * screenX;
      const sy = (rng() - 0.5) * 2.0 * screenY;
      const sz = (rng() - 0.5) * 2.0 * screenZ;

      points.push({ x: sx, y: sy, z: sz, tag: 1.0 });
    }
  }

  /**
   * Generate 3D coordinates for all 7 shapes for N particles
   * Returns Float32Array of size [count * 7 * 4] for RGBA32F Data Texture
   * xyz = position, w = tag (0.0: core, 0.5: halo, 1.0: fullscreen)
   */
  function generateAllStages(count = 1470) {
    const data = new Float32Array(count * STAGES_COUNT * 4);
    for (let stage = 0; stage < STAGES_COUNT; stage++) {
      const points = generateStageCoordinates(stage, count);
      for (let i = 0; i < count; i++) {
        const pt = points[i] || { x: 0, y: 0, z: 0, tag: 0.0 };
        const idx = (stage * count + i) * 4;
        data[idx] = pt.x;
        data[idx + 1] = pt.y;
        data[idx + 2] = pt.z;
        data[idx + 3] = pt.tag ?? 0.0;
      }
    }
    return data;
  }

  function generateStageCoordinates(stageIndex, count = 1470) {
    switch (stageIndex) {
      case 0: return generateIsometricStackedPlanes(count);
      case 1: return generateLightbulb(count);
      case 2: return generateBlueprintPlan(count);
      case 3: return generateCrystalGem(count);
      case 4: return generateTerminalWindow(count);
      case 5: return generateGrowthChart(count);
      case 6: return generateTestingSpinner(count);
      case 7: return generateFiveStars(count);
      default: return generateIsometricStackedPlanes(count);
    }
  }

  // -------------------------------------------------------------
  // STAGE 0 (START): Three Hovering Semi-Transparent Isometric Diamond Layers
  // Matching user reference screenshot: 3 planar rhombus sheets stacked vertically
  // with dense glittering particles, crisp bevel edges, and soft projected shadows.
  // -------------------------------------------------------------
  function generateIsometricStackedPlanes(count) {
    const points = [];
    const rng = createRng(1000);
    const haloCount = Math.floor(count * 0.12);
    const screenCount = Math.floor(count * 0.10);
    const coreTarget = count - haloCount - screenCount;

    // Classical 30-degree isometric projection rotation (pitch ~35.26°, yaw = 45°)
    const rot = (p) => rotate3D(p, 0.61548, Math.PI / 4);

    const L = 0.74;
    const layersY = [0.26, 0.00, -0.26];
    const shadowY = -0.54;

    layersY.forEach((y, layerIdx) => {
      // 1. Crisp outer perimeter wireframe (TAG_WIRE_FRAME = 0.04)
      const p0 = [-L, y, -L];
      const p1 = [ L, y, -L];
      const p2 = [ L, y,  L];
      const p3 = [-L, y,  L];
      addRect3D(points, p0, p1, p2, p3, 26, rng, 0.003, rot, TAG_WIRE_FRAME);

      // 2. Inner bevel/inset rim (TAG_SURFACE_FILL = 0.08)
      const inL = L - 0.07;
      const ip0 = [-inL, y, -inL];
      const ip1 = [ inL, y, -inL];
      const ip2 = [ inL, y,  inL];
      const ip3 = [-inL, y,  inL];
      addRect3D(points, ip0, ip1, ip2, ip3, 20, rng, 0.003, rot, TAG_SURFACE_FILL);

      // 3. Dense planar surface fill with fine glittering particles
      addSurfaceQuad(points, p0, p1, p2, p3, 16, 16, rng, 0.005, rot, TAG_SURFACE_FILL);

      // Subtle incandescent highlights across the upper plane
      if (layerIdx === 0) {
        addSurfaceQuad(points, ip0, ip1, ip2, ip3, 8, 8, rng, 0.005, rot, TAG_ACCENT_CORE);
      }

      // 4. Star glints at the 4 outer diamond corners
      const corners = [p0, p1, p2, p3];
      corners.forEach(c => {
        points.push(rot({ x: c[0], y: c[1] + 0.015, z: c[2], tag: TAG_STAR_GLINT }));
      });
    });

    // 5. Soft projected shadow plane below the bottom layer
    const sL = L * 1.05;
    const sp0 = [-sL, shadowY, -sL];
    const sp1 = [ sL, shadowY, -sL];
    const sp2 = [ sL, shadowY,  sL];
    const sp3 = [-sL, shadowY,  sL];
    addSurfaceQuad(points, sp0, sp1, sp2, sp3, 12, 12, rng, 0.012, rot, TAG_WIRE_FRAME);

    // Resample core points to target and add halo & screen stardust
    const balancedCore = resampleCorePoints(points, coreTarget, rng);
    addHaloAndFullscreenParticles(balancedCore, haloCount, screenCount, rng, { minR: 1.15, maxR: 2.45, maxZ: 1.25 });
    return fillOrTrim(balancedCore, count, rng);
  }

  // -------------------------------------------------------------
  // STAGE 0 (01): True 3D Volumetric Incandescent Lightbulb (High Density)
  // -------------------------------------------------------------
  function generateLightbulb(count) {
    const points = [];
    const rng = createRng(1001);
    // 75% of particles allocated directly into the solid core light bulb silhouette!
    const haloCount = Math.floor(count * 0.10);
    const screenCount = Math.floor(count * 0.15);
    const coreTarget = count - haloCount - screenCount;

    // Perspective 3D rotation for deep volumetric curvature
    const rot = (p) => rotate3D(p, 0.22, -0.26);

    const domeCy = 0.38;
    const domeR = 0.72;

    // 1. Classical Pear-Shaped Incandescent Bulb Glass Profile
    const bulbProfile = [];
    const numDomeSlices = 38;
    for (let i = 0; i < numDomeSlices; i++) {
      const phi = (Math.PI * 0.5) - (i / (numDomeSlices - 1)) * (Math.PI * 0.66);
      const y = domeCy + Math.sin(phi) * domeR;
      const r = Math.cos(phi) * domeR;
      bulbProfile.push([y, r]);
    }

    // Smooth inward waist taper to the metallic neck
    const numWaistSlices = 24;
    const waistStartY = bulbProfile[bulbProfile.length - 1][0];
    const waistStartR = bulbProfile[bulbProfile.length - 1][1];
    const neckEndR = 0.36;
    const neckEndY = -0.30;
    for (let i = 1; i <= numWaistSlices; i++) {
      const t = i / numWaistSlices;
      const s = t * t * (3 - 2 * t);
      const y = waistStartY + t * (neckEndY - waistStartY);
      const r = waistStartR + s * (neckEndR - waistStartR);
      bulbProfile.push([y, r]);
    }

    // A. Outer 3D Glass Shell (Electric Sapphire Blue Body: tag = TAG_SURFACE_FILL)
    addRevolutionSurface(points, bulbProfile, 56, rng, 0.005, rot, TAG_SURFACE_FILL);

    // B. Intermediate Volumetric Glass Thickness (tag = TAG_SURFACE_FILL)
    const midProfile = bulbProfile.map(([y, r]) => [y, r * 0.96]);
    addRevolutionSurface(points, midProfile, 48, rng, 0.006, rot, TAG_SURFACE_FILL);

    // C. Inner Glass Sheen & Depth Volume (tag = TAG_SURFACE_FILL)
    const innerProfile = bulbProfile.map(([y, r]) => [y, r * 0.91]);
    addRevolutionSurface(points, innerProfile, 40, rng, 0.006, rot, TAG_SURFACE_FILL);

    // D. Longitudinal Glass Rib Curves (Radiant Golden-Amber Ribs: tag = TAG_WIRE_FRAME)
    const numLongRibs = 16;
    for (let rIdx = 0; rIdx < numLongRibs; rIdx++) {
      const theta = (rIdx / numLongRibs) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      for (let s = 0; s < bulbProfile.length; s += 2) {
        const [py, pr] = bulbProfile[s];
        points.push(rot({ x: cosT * pr, y: py, z: sinT * pr, tag: TAG_WIRE_FRAME }));
        points.push(rot({ x: cosT * (pr * 0.95), y: py, z: sinT * (pr * 0.95), tag: TAG_WIRE_FRAME }));
      }
    }

    // 2. High-Light Glare Arc
    const glareR = 0.55;
    const glareStart = Math.PI * 0.58;
    const glareEnd = Math.PI * 0.90;
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      const ang = glareStart + t * (glareEnd - glareStart);
      const gx = Math.cos(ang) * glareR;
      const gy = domeCy + Math.sin(ang) * glareR;
      const gz = Math.sqrt(Math.max(0.01, domeR * domeR - gx * gx - (gy - domeCy) * (gy - domeCy)));
      const isApex = (i === 16 || i === 48);
      points.push(rot({ x: gx, y: gy, z: gz + 0.025, tag: isApex ? TAG_STAR_GLINT : TAG_WIRE_FRAME }));
      points.push(rot({ x: gx * 0.97, y: domeCy + (gy - domeCy) * 0.97, z: gz + 0.025, tag: TAG_WIRE_FRAME }));
      points.push(rot({ x: gx * 0.94, y: domeCy + (gy - domeCy) * 0.94, z: gz + 0.02, tag: TAG_SURFACE_FILL }));
      points.push(rot({ x: gx * 0.91, y: domeCy + (gy - domeCy) * 0.91, z: gz + 0.015, tag: TAG_SURFACE_FILL }));
    }

    // 3. Glowing 3D Incandescent Tungsten Filament Core (tag = TAG_ACCENT_CORE)
    // Dual vertical lead-in support rods (golden tungsten/copper)
    addLine3D(points, [-0.10, -0.30, 0.0], [-0.10, 0.20, 0.02], 48, rng, 0.004, rot, TAG_ACCENT_CORE);
    addLine3D(points, [-0.11, -0.30, 0.01], [-0.11, 0.20, 0.02], 36, rng, 0.004, rot, TAG_ACCENT_CORE);
    addLine3D(points, [0.10, -0.30, 0.0], [0.10, 0.20, 0.02], 48, rng, 0.004, rot, TAG_ACCENT_CORE);
    addLine3D(points, [0.11, -0.30, 0.01], [0.11, 0.20, 0.02], 36, rng, 0.004, rot, TAG_ACCENT_CORE);
    // Glass mount arbor
    addSolidBox(points, [-0.07, -0.15, -0.04], [0.07, 0.02, 0.04], 6, 10, 6, rng, 0.004, rot, TAG_ACCENT_CORE);

    // Double M-shaped coiled tungsten filament bridge
    const filamentPts = [
      [-0.10, 0.20, 0.02],
      [-0.15, 0.34, 0.06],
      [-0.08, 0.46, 0.08],
      [0.00, 0.33, 0.05],
      [0.08, 0.46, 0.08],
      [0.15, 0.34, 0.06],
      [0.10, 0.20, 0.02]
    ];
    for (let k = 0; k < filamentPts.length - 1; k++) {
      // Main filament strand
      addLine3D(points, filamentPts[k], filamentPts[k + 1], 44, rng, 0.004, rot, TAG_ACCENT_CORE);

      // Dense helical micro-coil particles wrapping around the filament strand
      const p1 = filamentPts[k], p2 = filamentPts[k + 1];
      for (let s = 0; s < 40; s++) {
        const u = s / 39;
        const hx = p1[0] + u * (p2[0] - p1[0]);
        const hy = p1[1] + u * (p2[1] - p1[1]);
        const hz = p1[2] + u * (p2[2] - p1[2]);
        const coilAngle = u * Math.PI * 18.0;
        const coilRadius = 0.022;
        const cx = hx + Math.cos(coilAngle) * coilRadius;
        const cz = hz + Math.sin(coilAngle) * coilRadius;
        points.push(rot({ x: cx, y: hy + (rng() - 0.5) * 0.008, z: cz, tag: TAG_ACCENT_CORE }));
        points.push(rot({ x: hx + (rng() - 0.5) * 0.015, y: hy + (rng() - 0.5) * 0.015, z: hz + (rng() - 0.5) * 0.015, tag: TAG_ACCENT_CORE }));
      }
    }

    // Glowing incandescent core volume cluster around the filament center
    for (let c = 0; c < 120; c++) {
      const cy = 0.22 + rng() * 0.24;
      const cr = rng() * 0.12;
      const ca = rng() * Math.PI * 2;
      points.push(rot({ x: Math.cos(ca) * cr, y: cy, z: Math.sin(ca) * cr, tag: TAG_ACCENT_CORE }));
    }

    // 4. Threaded Metallic Base (Radiant Golden Threads: tag = TAG_WIRE_FRAME)
    const threadProfile = [];
    const numThreadSlices = 28;
    for (let i = 0; i < numThreadSlices; i++) {
      const t = i / (numThreadSlices - 1);
      const y = -0.30 - t * 0.32;
      const r = 0.35 + 0.042 * Math.cos(t * Math.PI * 6.0); // 3 distinct threaded helical ribs
      threadProfile.push([y, r]);
    }
    addRevolutionSurface(points, threadProfile, 52, rng, 0.005, rot, TAG_WIRE_FRAME);

    // Inner metallic layer of base for solid density
    const threadInnerProfile = threadProfile.map(([y, r]) => [y, r * 0.94]);
    addRevolutionSurface(points, threadInnerProfile, 40, rng, 0.005, rot, TAG_WIRE_FRAME);

    // Concentric ring grooves emphasizing screw ridges
    for (let g = 0; g < 4; g++) {
      const gy = -0.30 - (g / 3.0) * 0.32;
      addCircleRing3D(points, gy, 0.38, 48, rng, 0.004, rot, TAG_WIRE_FRAME);
      addCircleRing3D(points, gy, 0.36, 40, rng, 0.004, rot, TAG_WIRE_FRAME);
    }

    // Black glass insulator collar + bottom contact solder tip (tag = TAG_WIRE_FRAME)
    const contactProfile = [];
    for (let i = 0; i < 18; i++) {
      const t = i / 17;
      const y = -0.62 - t * 0.16;
      const r = 0.26 * Math.sqrt(Math.max(0.0, 1.0 - t * t));
      contactProfile.push([y, r]);
    }
    addRevolutionSurface(points, contactProfile, 36, rng, 0.005, rot, TAG_WIRE_FRAME);
    addCircleDisc3D(points, -0.78, 0.14, 5, 24, rng, 0.004, rot, TAG_WIRE_FRAME);

    // 5. Twelve Radiating 3D Light Rays (Eureka Idea Sparks: tag = TAG_STAR_GLINT)
    const rayAngles = [
      Math.PI * 0.50, Math.PI * 0.62, Math.PI * 0.76, Math.PI * 0.92, Math.PI * 1.08, Math.PI * 1.22,
      Math.PI * 0.38, Math.PI * 0.24, 0.08, -Math.PI * 0.08, -Math.PI * 0.22, Math.PI * 1.36
    ];
    const rInner = 0.96;
    const rOuter = 1.42;
    const rayHalfW = 0.035;
    const rayThick = 0.08;

    rayAngles.forEach(ang => {
      const cosA = Math.cos(ang);
      const sinA = Math.sin(ang);
      const perpX = -sinA * rayHalfW;
      const perpY = cosA * rayHalfW;

      const pA = [cosA * rInner, domeCy + sinA * rInner];
      const pB = [cosA * rOuter, domeCy + sinA * rOuter];

      for (let s = 0; s < 22; s++) {
        const u = s / 21;
        const cx = pA[0] + u * (pB[0] - pA[0]);
        const cy = pA[1] + u * (pB[1] - pA[1]);
        const isTip = (s >= 20);
        points.push(rot({ x: cx + perpX, y: cy + perpY, z: rayThick * (1.0 - u * 0.5), tag: isTip ? TAG_STAR_GLINT : TAG_WIRE_FRAME }));
        points.push(rot({ x: cx - perpX, y: cy - perpY, z: rayThick * (1.0 - u * 0.5), tag: isTip ? TAG_STAR_GLINT : TAG_WIRE_FRAME }));
        points.push(rot({ x: cx, y: cy, z: 0.0, tag: isTip ? TAG_STAR_GLINT : TAG_WIRE_FRAME }));
      }
    });

    // Uniformly resample so ALL components (glass, filament, screw base, rays) exist in exact balance
    const balancedCore = resampleCorePoints(points, coreTarget, rng);
    addHaloAndFullscreenParticles(balancedCore, haloCount, screenCount, rng, { minR: 1.15, maxR: 2.45, maxZ: 1.25 });
    return fillOrTrim(balancedCore, count, rng);
  }

  // -------------------------------------------------------------
  // STAGE 1 (02): Solid 3D Checklist Clipboard Blueprint
  // -------------------------------------------------------------
  function generateBlueprintPlan(count) {
    const points = [];
    const rng = createRng(2002);
    const haloCount = Math.floor(count * 0.12);
    const screenCount = Math.floor(count * 0.35);
    const coreTarget = count - haloCount - screenCount;

    // Perspective 3D rotation for deep volumetric presence
    const rot = (p) => rotate3D(p, 0.22, -0.28);

    const W = 0.88;
    const H = 1.18;
    const D = 0.12;

    // 1. Solid 3D Clipboard Tablet Board (Front, Back & 4 Beveled Edges)
    // Front face (z = D) with architectural blueprint grid
    addSurfaceQuad(points, [-W, -H, D], [W, -H, D], [W, H, D], [-W, H, D], 18, 22, rng, 0.008, rot, TAG_SURFACE_FILL);
    // Back face (z = -D)
    addSurfaceQuad(points, [-W, -H, -D], [W, -H, -D], [W, H, -D], [-W, H, -D], 12, 16, rng, 0.008, rot, TAG_SURFACE_FILL);
    // 4 Beveled edge borders (Radiant Golden Frame: tag = TAG_WIRE_FRAME)
    addSurfaceQuad(points, [-W, H, -D], [W, H, -D], [W, H, D], [-W, H, D], 16, 3, rng, 0.006, rot, TAG_WIRE_FRAME); // Top
    addSurfaceQuad(points, [-W, -H, -D], [W, -H, -D], [W, -H, D], [-W, -H, D], 16, 3, rng, 0.006, rot, TAG_WIRE_FRAME); // Bottom
    addSurfaceQuad(points, [-W, -H, -D], [-W, H, -D], [-W, H, D], [-W, -H, D], 18, 3, rng, 0.006, rot, TAG_WIRE_FRAME); // Left
    addSurfaceQuad(points, [W, -H, -D], [W, H, -D], [W, H, D], [W, -H, D], 18, 3, rng, 0.006, rot, TAG_WIRE_FRAME); // Right

    // 2. Heavy 3D Metallic Binder Clamp & Arch Wire Handle
    // Front grip clamp bar
    addSolidBox(points, [-0.52, 0.90, D], [0.52, 1.08, D + 0.10], 12, 4, 3, rng, 0.006, rot, TAG_WIRE_FRAME);
    // Top bracket hinge block
    addSolidBox(points, [-0.38, 1.08, D - 0.04], [0.38, 1.28, D + 0.10], 10, 5, 3, rng, 0.006, rot, TAG_WIRE_FRAME);
    // Curved 3D wire handle arching backwards
    for (let i = 0; i < 32; i++) {
      const theta = (i / 31) * Math.PI;
      const hx = Math.cos(theta) * 0.28;
      const hy = 1.28 + Math.sin(theta) * 0.18;
      const hz = D + 0.08 - Math.sin(theta) * 0.22;
      points.push(rot({ x: hx, y: hy, z: hz, tag: TAG_WIRE_FRAME }));
      points.push(rot({ x: hx, y: hy, z: hz + 0.02, tag: TAG_WIRE_FRAME }));
    }
    // Fastener rivet
    addCircleDisc3D(points, 1.16, 0.06, 2, 12, rng, 0.005, rot, TAG_WIRE_FRAME);
    points.push(rot({ x: 0, y: 1.16, z: D + 0.06, tag: TAG_STAR_GLINT }));

    // 3. Header Title Block on Sheet of Paper
    addSolidBox(points, [-0.68, 0.70, D + 0.02], [0.68, 0.78, D + 0.06], 14, 3, 2, rng, 0.006, rot, TAG_SURFACE_FILL);

    // 4. Three Large Interactive Task Checklist Items
    const rows = [0.42, 0.04, -0.34];
    rows.forEach(y => {
      // 3D Checkbox rounded frame (left side)
      addSolidBox(points, [-0.68, y - 0.14, D + 0.02], [-0.40, y + 0.14, D + 0.07], 6, 6, 2, rng, 0.006, rot, TAG_WIRE_FRAME);

      // Bold Raised 3D Checkmark (✓) floating prominently forward (z = D + 0.12 to D + 0.18)
      const pStart = [-0.62, y + 0.02];
      const pKnee  = [-0.52, y - 0.09];
      const pEnd   = [-0.36, y + 0.12];

      const zCheck = D + 0.14;
      addLine3D(points, [pStart[0], pStart[1], zCheck], [pKnee[0], pKnee[1], zCheck], 22, rng, 0.004, rot, TAG_ACCENT_CORE);
      addLine3D(points, [pKnee[0], pKnee[1], zCheck], [pEnd[0], pEnd[1], zCheck], 30, rng, 0.004, rot, TAG_ACCENT_CORE);
      addLine3D(points, [pStart[0], pStart[1], zCheck + 0.04], [pKnee[0], pKnee[1], zCheck + 0.04], 18, rng, 0.004, rot, TAG_ACCENT_CORE);
      addLine3D(points, [pKnee[0], pKnee[1], zCheck + 0.04], [pEnd[0], pEnd[1], zCheck + 0.04], 26, rng, 0.004, rot, TAG_ACCENT_CORE);
      // Struts connecting checkmark depth
      addLine3D(points, [pKnee[0], pKnee[1], D + 0.07], [pKnee[0], pKnee[1], zCheck + 0.04], 8, rng, 0.004, rot, TAG_ACCENT_CORE);
      addLine3D(points, [pStart[0], pStart[1], D + 0.07], [pStart[0], pStart[1], zCheck + 0.04], 6, rng, 0.004, rot, TAG_ACCENT_CORE);
      addLine3D(points, [pEnd[0], pEnd[1], D + 0.07], [pEnd[0], pEnd[1], zCheck + 0.04], 8, rng, 0.004, rot, TAG_ACCENT_CORE);

      // Primary Title Pill Bar (solid 3D horizontal task bar)
      addSolidBox(points, [-0.28, y + 0.02, D + 0.02], [0.68, y + 0.12, D + 0.08], 14, 3, 2, rng, 0.006, rot, TAG_SURFACE_FILL);
      // Secondary Spec Pill Bar (smaller subtitle bar)
      addSolidBox(points, [-0.28, y - 0.10, D + 0.02], [0.38, y - 0.02, D + 0.06], 10, 2, 2, rng, 0.006, rot, TAG_SURFACE_FILL);
    });

    // 5. Lower Wireframe UI Schematic Architecture Block
    addSolidBox(points, [-0.68, -0.92, D + 0.02], [-0.18, -0.56, D + 0.06], 8, 8, 2, rng, 0.006, rot, TAG_SURFACE_FILL); // Sidebar box
    addSolidBox(points, [-0.08, -0.92, D + 0.02], [0.68, -0.56, D + 0.06], 12, 8, 2, rng, 0.006, rot, TAG_SURFACE_FILL);  // Main viewport box

    // 6. Corner Star Glints on Board
    const boardCorners = [[-W, H, D], [W, H, D], [-W, -H, D], [W, -H, D]];
    boardCorners.forEach(([bx, by, bz]) => {
      points.push(rot({ x: bx, y: by, z: bz, tag: TAG_STAR_GLINT }));
      points.push(rot({ x: bx, y: by, z: bz + 0.03, tag: TAG_STAR_GLINT }));
    });

    const balancedCore = resampleCorePoints(points, coreTarget, rng);
    addHaloAndFullscreenParticles(balancedCore, haloCount, screenCount, rng, { minR: 1.15, maxR: 2.45, maxZ: 1.25 });
    return fillOrTrim(balancedCore, count, rng);
  }

  // -------------------------------------------------------------
  // STAGE 2 (03): Solid 3D Faceted Brilliant-Cut Diamond Crystal
  // -------------------------------------------------------------
  // STAGE 2 (03): Solid 3D Faceted Brilliant-Cut Diamond Crystal
  // High-Contrast Dual-Color Structure: Electric Blue Wireframe & Amber Core
  // -------------------------------------------------------------
  function generateCrystalGem(count) {
    const points = [];
    const rng = createRng(3003);
    const haloCount = Math.floor(count * 0.12);
    const screenCount = Math.floor(count * 0.35);
    const coreTarget = count - haloCount - screenCount;

    // Angle to showcase the top table and sparkling lower pavilion facets
    const rot = (p) => rotate3D(p, 0.34, 0.26);

    const TAG_NODE = TAG_WIRE_FRAME;          // Outer primary diamond nodes / vertex junctions (Radiant Golden Nodes)
    const TAG_EDGE = TAG_WIRE_FRAME;          // Outer wireframe ribs, table rim, girdle belt (Radiant Golden-Amber)
    const TAG_SURFACE = TAG_SURFACE_FILL;     // Outer facet constellation grid (Electric Sapphire Blue crystalline planes)
    const TAG_CORE_LINE = TAG_WIRE_FRAME;     // Inner core lines & internal crystal lattice (Glowing Golden-Amber)
    const TAG_CORE_PARTICLE = TAG_SURFACE_FILL; // Inner hot volumetric energetic particles (Electric Sapphire Blue)
    const TAG_GLINT = TAG_STAR_GLINT;         // Sparkling 3D diamond star flares (✦)

    const tableN = 8;
    const tableY = 0.72;
    const tableR = 0.54;
    const tableVerts = [];
    for (let i = 0; i < tableN; i++) {
      const ang = (i / tableN) * Math.PI * 2 + Math.PI / 8;
      tableVerts.push([Math.cos(ang) * tableR, tableY, Math.sin(ang) * tableR]);
    }

    const girdleN = 16;
    const girdleR = 1.24;
    const upperGirdleVerts = [];
    const lowerGirdleVerts = [];
    for (let i = 0; i < girdleN; i++) {
      const ang = (i / girdleN) * Math.PI * 2;
      upperGirdleVerts.push([Math.cos(ang) * girdleR, 0.16, Math.sin(ang) * girdleR]);
      lowerGirdleVerts.push([Math.cos(ang) * girdleR, 0.04, Math.sin(ang) * girdleR]);
    }

    const culet = [0, -1.04, 0];
    const centerNucleus = [0, 0.10, 0];

    // =========================================================
    // 1. MAIN NODES / VERTICES (Glowing Diamond Junctions)
    // =========================================================
    // Table Vertices (8 nodes)
    tableVerts.forEach(v => {
      for (let k = 0; k < 6; k++) {
        points.push(rot({ x: v[0] + (rng() - 0.5) * 0.015, y: v[1] + (rng() - 0.5) * 0.015, z: v[2] + (rng() - 0.5) * 0.015, tag: TAG_NODE }));
      }
    });
    // Girdle Vertices (16 upper + 16 lower = 32 nodes)
    upperGirdleVerts.forEach(v => {
      for (let k = 0; k < 5; k++) {
        points.push(rot({ x: v[0] + (rng() - 0.5) * 0.015, y: v[1] + (rng() - 0.5) * 0.015, z: v[2] + (rng() - 0.5) * 0.015, tag: TAG_NODE }));
      }
    });
    lowerGirdleVerts.forEach(v => {
      for (let k = 0; k < 5; k++) {
        points.push(rot({ x: v[0] + (rng() - 0.5) * 0.015, y: v[1] + (rng() - 0.5) * 0.015, z: v[2] + (rng() - 0.5) * 0.015, tag: TAG_NODE }));
      }
    });
    // Culet Tip Node
    for (let k = 0; k < 12; k++) {
      points.push(rot({ x: culet[0] + (rng() - 0.5) * 0.02, y: culet[1] + (rng() - 0.5) * 0.02, z: culet[2] + (rng() - 0.5) * 0.02, tag: TAG_NODE }));
    }
    // Table Center Apex Node
    for (let k = 0; k < 8; k++) {
      points.push(rot({ x: (rng() - 0.5) * 0.015, y: tableY + (rng() - 0.5) * 0.015, z: (rng() - 0.5) * 0.015, tag: TAG_NODE }));
    }

    // =========================================================
    // 2. OUTER WIREFRAME EDGES & RIBS (Sharp Electric Blue)
    // =========================================================
    // Table boundary rim (8 edges)
    for (let i = 0; i < tableN; i++) {
      addLine3D(points, tableVerts[i], tableVerts[(i + 1) % tableN], 16, rng, 0.005, rot, TAG_EDGE);
    }

    // Crown Facet Ridge Lines (Wireframe Ribs between Table & Girdle)
    for (let i = 0; i < tableN; i++) {
      const tA = tableVerts[i];
      const tB = tableVerts[(i + 1) % tableN];
      const gA = upperGirdleVerts[i * 2];
      const gMid = upperGirdleVerts[(i * 2 + 1) % girdleN];

      // Sharp Facet Ridge Lines
      addLine3D(points, tA, gA, 14, rng, 0.005, rot, TAG_EDGE);
      addLine3D(points, tA, gMid, 14, rng, 0.005, rot, TAG_EDGE);
      addLine3D(points, tB, gMid, 14, rng, 0.005, rot, TAG_EDGE);
    }

    // Girdle Belt Rim (Upper, Lower, and Vertical Struts)
    for (let i = 0; i < girdleN; i++) {
      addLine3D(points, upperGirdleVerts[i], upperGirdleVerts[(i + 1) % girdleN], 12, rng, 0.005, rot, TAG_EDGE);
      addLine3D(points, lowerGirdleVerts[i], lowerGirdleVerts[(i + 1) % girdleN], 12, rng, 0.005, rot, TAG_EDGE);
      addLine3D(points, upperGirdleVerts[i], lowerGirdleVerts[i], 5, rng, 0.004, rot, TAG_EDGE);
    }

    // Pavilion Facet Ribs (from Lower Girdle converging to Culet)
    for (let i = 0; i < girdleN; i++) {
      const gA = lowerGirdleVerts[i];
      addLine3D(points, gA, culet, 18, rng, 0.005, rot, TAG_EDGE);
    }

    // =========================================================
    // 3. OUTER FACET CONSTELLATION GRID (Electric Blue Crystal Planes)
    // =========================================================
    // Table Face Disc
    for (let i = 0; i < 90; i++) {
      const u = rng();
      const theta = rng() * Math.PI * 2;
      const r = Math.sqrt(u) * tableR;
      points.push(rot({ x: Math.cos(theta) * r, y: tableY, z: Math.sin(theta) * r, tag: TAG_SURFACE }));
    }

    // Crown Triangular Facet Planes
    for (let i = 0; i < tableN; i++) {
      const tA = tableVerts[i];
      const tB = tableVerts[(i + 1) % tableN];
      const gA = upperGirdleVerts[i * 2];
      const gMid = upperGirdleVerts[(i * 2 + 1) % girdleN];

      for (let s = 0; s < 16; s++) {
        const u = rng(), v = rng();
        if (u + v <= 1.0) {
          const fx = tA[0] + u * (gA[0] - tA[0]) + v * (gMid[0] - tA[0]);
          const fy = tA[1] + u * (gA[1] - tA[1]) + v * (gMid[1] - tA[1]);
          const fz = tA[2] + u * (gA[2] - tA[2]) + v * (gMid[2] - tA[2]);
          points.push(rot({ x: fx, y: fy, z: fz, tag: TAG_SURFACE }));
        }
      }
      for (let s = 0; s < 16; s++) {
        const u = rng(), v = rng();
        if (u + v <= 1.0) {
          const fx = tA[0] + u * (tB[0] - tA[0]) + v * (gMid[0] - tA[0]);
          const fy = tA[1] + u * (tB[1] - tA[1]) + v * (gMid[1] - tA[1]);
          const fz = tA[2] + u * (tB[2] - tA[2]) + v * (gMid[2] - tA[2]);
          points.push(rot({ x: fx, y: fy, z: fz, tag: TAG_SURFACE }));
        }
      }
    }

    // Pavilion Triangular Facet Planes
    for (let i = 0; i < girdleN; i++) {
      const gA = lowerGirdleVerts[i];
      const gB = lowerGirdleVerts[(i + 1) % girdleN];
      for (let s = 0; s < 18; s++) {
        const u = rng(), v = rng();
        if (u + v <= 1.0) {
          const px = culet[0] + u * (gA[0] - culet[0]) + v * (gB[0] - culet[0]);
          const py = culet[1] + u * (gA[1] - culet[1]) + v * (gB[1] - culet[1]);
          const pz = culet[2] + u * (gA[2] - culet[2]) + v * (gB[2] - culet[2]);
          points.push(rot({ x: px, y: py, z: pz, tag: TAG_SURFACE }));
        }
      }
    }

    // =========================================================
    // 4. INNER CORE LINES (Glowing Golden-Orange / Amber Light)
    // =========================================================
    // Vertical Central Power Spine from Culet to Table Apex
    addLine3D(points, culet, [0, tableY, 0], 42, rng, 0.005, rot, TAG_CORE_LINE);

    // Inner Radial Spokes from Core Center to Girdle Nodes
    for (let i = 0; i < girdleN; i += 2) {
      addLine3D(points, centerNucleus, upperGirdleVerts[i], 12, rng, 0.006, rot, TAG_CORE_LINE);
      addLine3D(points, centerNucleus, lowerGirdleVerts[i], 12, rng, 0.006, rot, TAG_CORE_LINE);
    }

    // Inner Diamond Core Lattice (Nested energetic internal crystal)
    const innerCulet = [0, -0.52, 0];
    const innerApex = [0, 0.42, 0];
    const innerGirdleR = 0.52;
    const innerVerts = [];
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      innerVerts.push([Math.cos(ang) * innerGirdleR, 0.10, Math.sin(ang) * innerGirdleR]);
    }
    for (let i = 0; i < 8; i++) {
      addLine3D(points, innerVerts[i], innerVerts[(i + 1) % 8], 10, rng, 0.005, rot, TAG_CORE_LINE);
      addLine3D(points, innerApex, innerVerts[i], 10, rng, 0.005, rot, TAG_CORE_LINE);
      addLine3D(points, innerCulet, innerVerts[i], 12, rng, 0.005, rot, TAG_CORE_LINE);
    }

    // =========================================================
    // 5. INNER VOLUMETRIC PARTICLES (Hot Energetic Center Amber Glow)
    // =========================================================
    for (let i = 0; i < 480; i++) {
      const y = -0.85 + rng() * 1.48; // within culet to table
      let maxR;
      if (y < 0.10) {
        maxR = girdleR * Math.max(0.01, (y - culet[1]) / (0.10 - culet[1]));
      } else {
        maxR = tableR + (girdleR - tableR) * Math.max(0.01, (tableY - y) / (tableY - 0.10));
      }
      // Inner energetic volume (12% to 62% radial shell from center)
      const r = maxR * (0.10 + 0.52 * Math.sqrt(rng()));
      const theta = rng() * Math.PI * 2;
      points.push(rot({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r, tag: TAG_CORE_PARTICLE }));
    }

    // =========================================================
    // 6. SPARKLING 3D STAR GLINTS (✦)
    // =========================================================
    // Removed stray yellow floating dots as requested by user

    const balancedCore = resampleCorePoints(points, coreTarget, rng);
    addHaloAndFullscreenParticles(balancedCore, haloCount, screenCount, rng, { minR: 1.15, maxR: 2.40, maxZ: 1.20 });
    return fillOrTrim(balancedCore, count, rng);
  }

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // STAGE 6 (06): 3D Apple Activity Indicator (Loading Spinner)
  // Matching user reference image: 12 radial rounded capsules/pills
  // with a progressive opacity/brightness decay gradient around the ring.
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // STAGE 6 (06): 3D Apple Activity Indicator (Loading Spinner)
  // Matching user reference image: 12 radial rounded capsules/pills
  // with a progressive opacity/brightness decay gradient around the ring.
  // -------------------------------------------------------------
  function generateTestingSpinner(count) {
    const points = [];
    const rng = createRng(6006);
    const haloCount = Math.floor(count * 0.10);
    const screenCount = Math.floor(count * 0.25);
    const coreTarget = count - haloCount - screenCount;

    // Subtle 3D perspective orientation (keeps the iconic circular wheel silhouette crisp)
    const rot = (p) => rotate3D(p, 0.05, -0.07);

    const R_MAX = 0.90;
    const R_MIN = 0.38;
    const rCap = 0.076;
    const rInnerCap = R_MIN + rCap;
    const rOuterCap = R_MAX - rCap;
    const depth = 0.08;

    for (let k = 0; k < 12; k++) {
      // 12 o'clock is top (angle = PI / 2), clockwise progression
      const spokeAngle = Math.PI / 2 - k * (2 * Math.PI / 12);
      const tag = 0.330 + k * 0.004;

      const cosA = Math.cos(spokeAngle);
      const sinA = Math.sin(spokeAngle);
      // Unit radial vector (pointing outward) and perpendicular vector (clockwise)
      const radX = cosA;
      const radY = sinA;
      const perpX = -sinA;
      const perpY = cosA;

      // 1. Perimeter Wireframe Contour of the rounded capsule (Front, Back, and Mid-depth)
      const capSteps = 14;
      const sideSteps = 10;

      // Outer semi-circle cap (phi from -PI/2 to +PI/2, pointing outward)
      for (let s = 0; s <= capSteps; s++) {
        const phi = -Math.PI / 2 + Math.PI * (s / capSteps);
        const rx = (rOuterCap + Math.cos(phi) * rCap) * radX + (Math.sin(phi) * rCap) * perpX;
        const ry = (rOuterCap + Math.cos(phi) * rCap) * radY + (Math.sin(phi) * rCap) * perpY;
        points.push(rot({ x: rx, y: ry, z: depth * 0.5, tag }));
        points.push(rot({ x: rx, y: ry, z: -depth * 0.5, tag }));
        if (s % 2 === 0) points.push(rot({ x: rx, y: ry, z: 0.0, tag }));
      }

      // Right straight edge (from outer cap to inner cap)
      for (let s = 1; s < sideSteps; s++) {
        const t = s / sideSteps;
        const curR = rOuterCap * (1 - t) + rInnerCap * t;
        const rx = curR * radX + rCap * perpX;
        const ry = curR * radY + rCap * perpY;
        points.push(rot({ x: rx, y: ry, z: depth * 0.5, tag }));
        points.push(rot({ x: rx, y: ry, z: -depth * 0.5, tag }));
        if (s % 2 === 0) points.push(rot({ x: rx, y: ry, z: 0.0, tag }));
      }

      // Inner semi-circle cap (phi from +PI/2 down to -PI/2, pointing inward)
      for (let s = 0; s <= capSteps; s++) {
        const phi = Math.PI / 2 - Math.PI * (s / capSteps);
        const rx = (rInnerCap - Math.cos(phi) * rCap) * radX + (Math.sin(phi) * rCap) * perpX;
        const ry = (rInnerCap - Math.cos(phi) * rCap) * radY + (Math.sin(phi) * rCap) * perpY;
        points.push(rot({ x: rx, y: ry, z: depth * 0.5, tag }));
        points.push(rot({ x: rx, y: ry, z: -depth * 0.5, tag }));
        if (s % 2 === 0) points.push(rot({ x: rx, y: ry, z: 0.0, tag }));
      }

      // Left straight edge (from inner cap to outer cap)
      for (let s = 1; s < sideSteps; s++) {
        const t = s / sideSteps;
        const curR = rInnerCap * (1 - t) + rOuterCap * t;
        const rx = curR * radX - rCap * perpX;
        const ry = curR * radY - rCap * perpY;
        points.push(rot({ x: rx, y: ry, z: depth * 0.5, tag }));
        points.push(rot({ x: rx, y: ry, z: -depth * 0.5, tag }));
        if (s % 2 === 0) points.push(rot({ x: rx, y: ry, z: 0.0, tag }));
      }

      // 2. Dense Volumetric Body Fill
      const bodyLenSteps = 9;
      const bodyWidthSteps = 6;
      for (let li = 0; li < bodyLenSteps; li++) {
        const lr = rInnerCap + (rOuterCap - rInnerCap) * ((li + 0.5) / bodyLenSteps);
        for (let wi = 0; wi < bodyWidthSteps; wi++) {
          const wFrac = -0.75 + 1.5 * (wi / (bodyWidthSteps - 1));
          const px = lr * radX + (wFrac * rCap) * perpX;
          const py = lr * radY + (wFrac * rCap) * perpY;
          points.push(rot({ x: px, y: py, z: depth * 0.40, tag }));
          points.push(rot({ x: px, y: py, z: -depth * 0.40, tag }));
          points.push(rot({ x: px, y: py, z: 0.0, tag }));
        }
      }

      // 3. Dense Rounded Caps Fill
      for (let crStep = 1; crStep <= 3; crStep++) {
        const cr = rCap * (crStep / 3.5);
        for (let a = 0; a < 6; a++) {
          const phi = -Math.PI / 2 + Math.PI * ((a + 0.5) / 6);
          // Outer cap interior
          const ox = (rOuterCap + Math.cos(phi) * cr) * radX + (Math.sin(phi) * cr) * perpX;
          const oy = (rOuterCap + Math.cos(phi) * cr) * radY + (Math.sin(phi) * cr) * perpY;
          points.push(rot({ x: ox, y: oy, z: 0.0, tag }));
          points.push(rot({ x: ox, y: oy, z: depth * 0.35, tag }));

          // Inner cap interior
          const ix = (rInnerCap - Math.cos(phi) * cr) * radX + (Math.sin(phi) * cr) * perpX;
          const iy = (rInnerCap - Math.cos(phi) * cr) * radY + (Math.sin(phi) * cr) * perpY;
          points.push(rot({ x: ix, y: iy, z: 0.0, tag }));
          points.push(rot({ x: ix, y: iy, z: depth * 0.35, tag }));
        }
      }
    }

    const balancedCore = resampleCorePoints(points, coreTarget, rng);
    addHaloAndFullscreenParticles(balancedCore, haloCount, screenCount, rng, { minR: 1.10, maxR: 2.40, maxZ: 1.20 });
    return fillOrTrim(balancedCore, count, rng);
  }

  // -------------------------------------------------------------
  // STAGE 4 (05): 3D macOS Developer Terminal Window: hello, world!!
  // -------------------------------------------------------------
  function generateTerminalWindow(count) {
    const points = [];
    const rng = createRng(5005);
    const haloCount = Math.floor(count * 0.12);
    const screenCount = Math.floor(count * 0.30);
    const coreTarget = count - haloCount - screenCount;

    // Perspective 3D rotation for a crisp, volumetric presence
    const rot = (p) => rotate3D(p, 0.08, -0.14);

    const W = 1.05;
    const H = 0.85;
    const frontZ = 0.07;
    const backZ = -0.07;

    // 1. macOS Folder-Style Window Outer Contour
    // Left tab from x = -W to -0.25 (y = 0.80), curves down to y = 0.60 for the rest (x = 0.0 to W)
    function getWindowTopY(x) {
      if (x <= -0.28) return 0.80;
      if (x >= -0.04) return 0.60;
      const t = (x - (-0.28)) / ((-0.04) - (-0.28));
      const s = 0.5 - 0.5 * Math.cos(t * Math.PI);
      return 0.80 * (1 - s) + 0.60 * s;
    }

    // A. Front & Back Wireframe Outer Rim
    const perimSteps = 88;
    for (let i = 0; i < perimSteps; i++) {
      const u = i / perimSteps;
      let x, y;
      if (u < 0.25) {
        // Bottom edge
        const t = u / 0.25;
        x = -W + 2 * W * t;
        y = -H;
      } else if (u < 0.50) {
        // Right edge
        const t = (u - 0.25) / 0.25;
        x = W;
        y = -H + (getWindowTopY(W) - (-H)) * t;
      } else if (u < 0.75) {
        // Top edge with tab
        const t = (u - 0.50) / 0.25;
        x = W - 2 * W * t;
        y = getWindowTopY(x);
      } else {
        // Left edge
        const t = (u - 0.75) / 0.25;
        x = -W;
        y = getWindowTopY(-W) * (1 - t) + (-H) * t;
      }

      points.push(rot({ x, y, z: frontZ, tag: TAG_WIRE_FRAME }));
      points.push(rot({ x, y, z: backZ, tag: TAG_WIRE_FRAME }));
      if (i % 3 === 0) {
        points.push(rot({ x, y, z: 0.0, tag: TAG_WIRE_FRAME }));
      }
    }

    // B. Beveled Inner Screen Perimeter
    const scW = W * 0.90;
    const scH = H * 0.85;
    const scTop = 0.46;
    const scBot = -scH;
    addRect3D(points, [-scW, scBot, frontZ + 0.01], [scW, scBot, frontZ + 0.01], [scW, scTop, frontZ + 0.01], [-scW, scTop, frontZ + 0.01], 24, rng, 0.004, rot, TAG_WIRE_FRAME);

    // 2. Three macOS Window Buttons (Red, Yellow, Green) on Top Tab
    const btnY = 0.70;
    const btnR = 0.052;
    const btnConfigs = [
      { cx: -0.80, tag: TAG_DOT_RED },
      { cx: -0.66, tag: TAG_DOT_YELLOW },
      { cx: -0.52, tag: TAG_DOT_GREEN }
    ];
    btnConfigs.forEach(({ cx, tag }) => {
      for (let r = 0.006; r <= btnR; r += 0.007) {
        const numP = Math.floor(14 + r * 150);
        for (let j = 0; j < numP; j++) {
          const theta = (j / numP) * Math.PI * 2;
          points.push(rot({
            x: cx + Math.cos(theta) * r,
            y: btnY + Math.sin(theta) * r,
            z: frontZ + 0.035,
            tag
          }));
        }
      }
    });

    // 3. Subtle Matrix Binary Code Streams in Screen Background
    const cols = 22;
    const rows = 14;
    const colStep = (scW * 1.84) / cols;
    const rowStep = (scTop - scBot - 0.08) / rows;
    for (let c = 0; c < cols; c++) {
      const bx = -scW + 0.06 + c * colStep;
      for (let r = 0; r < rows; r++) {
        const by = scBot + 0.05 + r * rowStep;
        const inPromptZone = (bx < -0.15 && by > -0.05 && by < 0.35);
        const inHelloZone = (bx > -0.78 && bx < 0.78 && by > -0.58 && by < -0.20);
        if (inPromptZone || inHelloZone) {
          if (rng() > 0.12) continue;
        }
        if (rng() > 0.40) {
          points.push(rot({
            x: bx + (rng() - 0.5) * 0.012,
            y: by + (rng() - 0.5) * 0.012,
            z: frontZ - 0.01,
            tag: TAG_SURFACE_FILL
          }));
        }
      }
    }

    // 4. Foreground Chunky Pixel Font:
    const PIXEL_CHARS = {
      '>': [
        'XX...',
        '..XX.',
        '....XX',
        '..XX.',
        'XX...',
        '.....',
        '.....'
      ],
      '_': [
        '.....',
        '.....',
        '.....',
        '.....',
        '.....',
        'XXXXXX',
        'XXXXXX'
      ],
      'h': [
        'X....',
        'X....',
        'X.XX.',
        'XX..X',
        'X...X',
        'X...X',
        'X...X'
      ],
      'e': [
        '.....',
        '.....',
        '.XXX.',
        'X...X',
        'XXXXX',
        'X....',
        '.XXX.'
      ],
      'l': [
        'XX...',
        '.X...',
        '.X...',
        '.X...',
        '.X...',
        '.X...',
        '.XXX.'
      ],
      'o': [
        '.....',
        '.....',
        '.XXX.',
        'X...X',
        'X...X',
        'X...X',
        '.XXX.'
      ],
      ',': [
        '.....',
        '.....',
        '.....',
        '.....',
        '.....',
        '..XX.',
        '..X..',
        '.X...'
      ],
      ' ': [
        '.....',
        '.....',
        '.....',
        '.....',
        '.....',
        '.....',
        '.....'
      ],
      'w': [
        '.....',
        '.....',
        'X...X',
        'X...X',
        'X.X.X',
        'X.X.X',
        '.X.X.'
      ],
      'r': [
        '.....',
        '.....',
        'X.XX.',
        'XX..X',
        'X....',
        'X....',
        'X....'
      ],
      'd': [
        '...X.',
        '...X.',
        '.XXX.',
        'X...X',
        'X...X',
        'X...X',
        '.XXXX'
      ],
      '!': [
        '.XX..',
        '.XX..',
        '.XX..',
        '.XX..',
        '.....',
        '.XX..',
        '.XX..'
      ]
    };

    function renderPixelText(str, startX, startY, charW, charH, textTag) {
      let curX = startX;
      for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        const grid = PIXEL_CHARS[ch];
        if (grid) {
          const numRows = grid.length;
          const numCols = grid[0].length;
          for (let r = 0; r < numRows; r++) {
            const rowStr = grid[r];
            const py = startY - r * (charH / numRows);
            for (let c = 0; c < numCols; c++) {
              if (rowStr[c] === 'X') {
                const px = curX + c * (charW / numCols);
                points.push(rot({ x: px, y: py, z: frontZ + 0.045, tag: textTag }));
                points.push(rot({ x: px + 0.005, y: py - 0.004, z: frontZ + 0.045, tag: textTag }));
              }
            }
          }
        }
        curX += charW + 0.024;
      }
    }

    // A. Render Line 1: "> _"
    renderPixelText('> _', -0.72, 0.22, 0.14, 0.22, TAG_TERMINAL_GREEN);

    // B. Render Line 2: "hello, world!!"
    renderPixelText('hello, world!!', -0.74, -0.26, 0.088, 0.24, TAG_TERMINAL_GREEN);

    const balancedCore = resampleCorePoints(points, coreTarget, rng);
    addHaloAndFullscreenParticles(balancedCore, haloCount, screenCount, rng, { minR: 1.15, maxR: 2.45, maxZ: 1.25 });
    return fillOrTrim(balancedCore, count, rng);
  }

  // -------------------------------------------------------------
  // STAGE 5 (06): Solid 3D SEO Growth Infographic
  // -------------------------------------------------------------
  function generateGrowthChart(count) {
    const points = [];
    const rng = createRng(6006);
    const haloCount = Math.floor(count * 0.12);
    const screenCount = Math.floor(count * 0.35);
    const coreTarget = count - haloCount - screenCount;

    // Perspective 3D rotation for deep volumetric presence
    const rot = (p) => rotate3D(p, 0.24, -0.28);

    const axisZ = 0.20;

    // 1. Thick Solid 3D L-Shaped Coordinate Frame & Ground Grid Platform (Radiant Golden Frame: tag = TAG_WIRE_FRAME)
    // Vertical Axis Beam (solid square column)
    addSolidBox(points, [-0.90, -0.74, -axisZ], [-0.82, 0.92, axisZ], 3, 20, 4, rng, 0.006, rot, TAG_WIRE_FRAME);
    // Horizontal Axis Beam (solid square column)
    addSolidBox(points, [-0.90, -0.74, -axisZ], [0.88, -0.66, axisZ], 20, 3, 4, rng, 0.006, rot, TAG_WIRE_FRAME);
    // Floor Grid Platform (Electric Sapphire Blue Grid: tag = TAG_SURFACE_FILL)
    for (let gz = -axisZ; gz <= axisZ; gz += 0.10) {
      addLine3D(points, [-0.86, -0.72, gz], [0.84, -0.72, gz], 16, rng, 0.006, rot, TAG_SURFACE_FILL);
    }

    // 2. Four Solid 3D Growth Bar Columns (Electric Sapphire Blue Pillars with Golden Rims)
    const yBase = -0.66;
    const barZ = 0.18;
    const bars = [
      { x1: -0.64, x2: -0.42, yTop: -0.28 }, // Pillar 1 (25%)
      { x1: -0.28, x2: -0.06, yTop: 0.08 },  // Pillar 2 (55%)
      { x1: 0.08,  x2: 0.30,  yTop: 0.44 },  // Pillar 3 (80%)
      { x1: 0.44,  x2: 0.66,  yTop: 0.82 }   // Pillar 4 (100% Target)
    ];

    bars.forEach(bar => {
      addSolidBox(points, [bar.x1, yBase, -barZ], [bar.x2, bar.yTop, barZ], 8, 12, 6, rng, 0.006, rot, TAG_SURFACE_FILL);
      // Top cap highlight ring (Radiant Golden Rim: tag = TAG_WIRE_FRAME)
      addRect3D(points, [bar.x1, bar.yTop, -barZ], [bar.x2, bar.yTop, -barZ], [bar.x2, bar.yTop, barZ], [bar.x1, bar.yTop, barZ], 8, rng, 0.004, rot, TAG_WIRE_FRAME);
    });

    // 3. Ascending 3D Zigzag Ribbon & Solid Arrowhead (Incandescent Golden Power Ribbon: tag = TAG_ACCENT_CORE)
    const zigKey = [
      [-0.74, -0.16],
      [-0.17, 0.32],
      [0.19, 0.14],
      [0.62, 0.60]
    ];
    const zigThick = 0.052;
    const zigZ1 = 0.06;
    const zigZ2 = 0.26;

    for (let s = 0; s < zigKey.length - 1; s++) {
      const pA = zigKey[s];
      const pB = zigKey[s + 1];
      const dx = pB[0] - pA[0];
      const dy = pB[1] - pA[1];
      const len = Math.hypot(dx, dy);
      const nx = (-dy / len) * zigThick;
      const ny = (dx / len) * zigThick;

      addSurfaceQuad(points, [pA[0] + nx, pA[1] + ny, zigZ2], [pB[0] + nx, pB[1] + ny, zigZ2], [pB[0] - nx, pB[1] - ny, zigZ2], [pA[0] - nx, pA[1] - ny, zigZ2], 18, 4, rng, 0.005, rot, TAG_ACCENT_CORE);
      addSurfaceQuad(points, [pA[0] + nx, pA[1] + ny, zigZ1], [pB[0] + nx, pB[1] + ny, zigZ1], [pB[0] - nx, pB[1] - ny, zigZ1], [pA[0] - nx, pA[1] - ny, zigZ1], 16, 4, rng, 0.005, rot, TAG_ACCENT_CORE);
      addSurfaceQuad(points, [pA[0] + nx, pA[1] + ny, zigZ1], [pB[0] + nx, pB[1] + ny, zigZ1], [pB[0] + nx, pB[1] + ny, zigZ2], [pA[0] + nx, pA[1] + ny, zigZ2], 18, 3, rng, 0.005, rot, TAG_ACCENT_CORE);
      addSurfaceQuad(points, [pA[0] - nx, pA[1] - ny, zigZ1], [pB[0] - nx, pB[1] - ny, zigZ1], [pB[0] - nx, pB[1] - ny, zigZ2], [pA[0] - nx, pA[1] - ny, zigZ2], 18, 3, rng, 0.005, rot, TAG_ACCENT_CORE);
    }

    // Bold 3D Razor-Sharp Arrowhead
    const arrowTip = [0.86, 0.84];
    const arrowLeft = [0.54, 0.76];
    const arrowRight = [0.76, 0.52];
    const arrowNotch = [0.62, 0.60];

    for (let k = 0; k < 42; k++) {
      const u = rng(), v = rng();
      if (u + v <= 1.0) {
        const ax = arrowNotch[0] + u * (arrowTip[0] - arrowNotch[0]) + v * (arrowLeft[0] - arrowNotch[0]);
        const ay = arrowNotch[1] + u * (arrowTip[1] - arrowNotch[1]) + v * (arrowLeft[1] - arrowNotch[1]);
        const az = zigZ1 + rng() * (zigZ2 - zigZ1 + 0.04);
        points.push(rot({ x: ax, y: ay, z: az, tag: TAG_ACCENT_CORE }));
      }
      const u2 = rng(), v2 = rng();
      if (u2 + v2 <= 1.0) {
        const ax = arrowNotch[0] + u2 * (arrowTip[0] - arrowNotch[0]) + v2 * (arrowRight[0] - arrowNotch[0]);
        const ay = arrowNotch[1] + u2 * (arrowTip[1] - arrowNotch[1]) + v2 * (arrowRight[1] - arrowNotch[1]);
        const az = zigZ1 + rng() * (zigZ2 - zigZ1 + 0.04);
        points.push(rot({ x: ax, y: ay, z: az, tag: TAG_ACCENT_CORE }));
      }
    }
    // Arrowhead perimeter bevel lines
    addLine3D(points, [arrowTip[0], arrowTip[1], zigZ2], [arrowLeft[0], arrowLeft[1], zigZ2], 16, rng, 0.005, rot, TAG_WIRE_FRAME);
    addLine3D(points, [arrowTip[0], arrowTip[1], zigZ2], [arrowRight[0], arrowRight[1], zigZ2], 16, rng, 0.005, rot, TAG_WIRE_FRAME);
    addLine3D(points, [arrowTip[0], arrowTip[1], zigZ1], [arrowLeft[0], arrowLeft[1], zigZ1], 16, rng, 0.005, rot, TAG_WIRE_FRAME);
    addLine3D(points, [arrowTip[0], arrowTip[1], zigZ1], [arrowRight[0], arrowRight[1], zigZ1], 16, rng, 0.005, rot, TAG_WIRE_FRAME);
    points.push(rot({ x: arrowTip[0], y: arrowTip[1], z: zigZ2 + 0.04, tag: TAG_STAR_GLINT }));

    // Floating Metric Sparkle Badge: Diamond Star above Arrow Tip
    const mx = 0.90, my = 0.96, mz = 0.22;
    addLine3D(points, [mx - 0.12, my, mz], [mx + 0.12, my, mz], 12, rng, 0.005, rot, TAG_WIRE_FRAME);
    addLine3D(points, [mx, my - 0.12, mz], [mx, my + 0.12, mz], 12, rng, 0.005, rot, TAG_WIRE_FRAME);
    addLine3D(points, [mx, my, mz - 0.12], [mx, my, mz + 0.12], 12, rng, 0.005, rot, TAG_WIRE_FRAME);
    points.push(rot({ x: mx, y: my, z: mz, tag: TAG_STAR_GLINT }));

    const balancedCore = resampleCorePoints(points, coreTarget, rng);
    addHaloAndFullscreenParticles(balancedCore, haloCount, screenCount, rng, { minR: 1.15, maxR: 2.45, maxZ: 1.25 });
    return fillOrTrim(balancedCore, count, rng);
  }

  // -------------------------------------------------------------
  // STAGE 7 (07): 5 Golden 3D Rating Stars (Release & Support Excellence)
  // Matching user reference image: 5 geometric five-pointed stars
  // arranged horizontally in a row, with faceted 3D ridges and radiant gold gleam.
  // -------------------------------------------------------------
  function generateFiveStars(count) {
    const points = [];
    const rng = createRng(7007);
    const haloCount = Math.floor(count * 0.10);
    const screenCount = Math.floor(count * 0.25);
    const coreTarget = count - haloCount - screenCount;

    // Subtle 3D perspective orientation for depth and facet sparkle
    const rot = (p) => rotate3D(p, 0.06, -0.08);

    const R_outer = 0.245;
    const R_inner = R_outer * 0.382;
    const depth = 0.09;
    const tag = TAG_GOLD_STAR;

    for (let starIdx = 0; starIdx < 5; starIdx++) {
      const cx = -1.04 + starIdx * 0.52;
      const cy = 0.0;

      // 10 perimeter vertices (5 tips, 5 valleys)
      const verts = [];
      for (let k = 0; k < 10; k++) {
        const ang = Math.PI / 2 + k * (Math.PI / 5);
        const r = (k % 2 === 0) ? R_outer : R_inner;
        verts.push([cx + Math.cos(ang) * r, cy + Math.sin(ang) * r]);
      }

      // 1. Perimeter Wireframe Contour (Front, Back, and Mid-depth)
      for (let k = 0; k < 10; k++) {
        const v1 = verts[k];
        const v2 = verts[(k + 1) % 10];
        const steps = 8;
        for (let s = 0; s <= steps; s++) {
          const u = s / steps;
          const px = v1[0] * (1 - u) + v2[0] * u;
          const py = v1[1] * (1 - u) + v2[1] * u;
          points.push(rot({ x: px, y: py, z: depth * 0.5, tag }));
          points.push(rot({ x: px, y: py, z: -depth * 0.5, tag }));
          if (s % 2 === 0) points.push(rot({ x: px, y: py, z: 0.0, tag }));
        }
      }

      // 2. Faceted 3D Ridges: from Center (front/back apex) to each tip and valley
      for (let k = 0; k < 10; k++) {
        const v = verts[k];
        const isTip = (k % 2 === 0);
        const steps = isTip ? 10 : 6;
        for (let s = 1; s < steps; s++) {
          const u = s / steps;
          const px = cx * (1 - u) + v[0] * u;
          const py = cy * (1 - u) + v[1] * u;
          const fz = depth * 0.5 * (1 - u * 0.7);
          points.push(rot({ x: px, y: py, z: fz, tag }));
          points.push(rot({ x: px, y: py, z: -fz, tag }));
          points.push(rot({ x: px, y: py, z: 0.0, tag }));
        }

        // Sparkling tip star glints on the 5 points of each star
        if (isTip) {
          points.push(rot({ x: v[0], y: v[1], z: depth * 0.2, tag: TAG_STAR_GLINT }));
        }
      }

      // 3. Dense Triangular Facet Surface Fill (10 triangular facets per star)
      for (let k = 0; k < 10; k++) {
        const v1 = verts[k];
        const v2 = verts[(k + 1) % 10];
        for (let s1 = 1; s1 <= 5; s1++) {
          const u1 = s1 / 6;
          for (let s2 = 1; s2 <= s1; s2++) {
            const u2 = s2 / s1;
            const edgeX = v1[0] * (1 - u2) + v2[0] * u2;
            const edgeY = v1[1] * (1 - u2) + v2[1] * u2;
            const px = cx * (1 - u1) + edgeX * u1;
            const py = cy * (1 - u1) + edgeY * u1;
            const fz = depth * 0.45 * (1 - u1 * 0.7);
            points.push(rot({ x: px, y: py, z: fz, tag }));
            points.push(rot({ x: px, y: py, z: -fz, tag }));
          }
        }
      }
    }

    const balancedCore = resampleCorePoints(points, coreTarget, rng);
    addHaloAndFullscreenParticles(balancedCore, haloCount, screenCount, rng, { minR: 1.15, maxR: 2.45, maxZ: 1.25 });
    return fillOrTrim(balancedCore, count, rng);
  }
  const generateCheckmarkBadge = generateFiveStars;

  /**
   * Safe filler/trimmer to guarantee exact particle count
   */
  function fillOrTrim(points, count, rng) {
    if (points.length >= count) {
      return points.slice(0, count);
    }
    const orig = points.slice();
    while (points.length < count) {
      const p = orig[Math.floor(rng() * orig.length)];
      points.push({
        x: p.x + (rng() - 0.5) * 0.012,
        y: p.y + (rng() - 0.5) * 0.012,
        z: p.z + (rng() - 0.5) * 0.012,
        tag: p.tag ?? 0.0
      });
    }
    return points;
  }

  return {
    STAGES_COUNT,
    STAGES_CONTENT,
    generateAllStages,
    generateStageCoordinates
  };
});
