/**
 * VAPOR TYPE COMPONENT (React Bits Pro Specification)
 * Full Vanilla Three.js + WebGL implementation of React Bits <VaporType />
 * "Words that condense out of vapor and drift away"
 * Docs: https://pro.reactbits.dev/docs/components/vapor-type
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    let three;
    try { three = require('three'); } catch (e) { three = (typeof global !== 'undefined' ? global.THREE : root.THREE); }
    module.exports = factory(three);
  } else {
    root.createVaporType = factory(root.THREE);
    root.VaporType = root.createVaporType;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (THREE) {
  'use strict';

  const PRESETS = {
    mist: {
      vapor: { dark: '#B19EEF', light: '#5227FF' },
      sweep: 'left',
      spread: 1.2,
      rise: 1,
      turbulence: 0.8,
      diffusion: 0.35,
      stagger: 0.8,
      particleSize: 1.2
    },
    frost: {
      vapor: { dark: '#9FD8FF', light: '#2B7FC4' },
      sweep: 'right',
      spread: 1.1,
      rise: -0.5,
      turbulence: 0.5,
      diffusion: 0.5,
      stagger: 0.8,
      particleSize: 1.1
    },
    steam: {
      vapor: { dark: '#E8E3FF', light: '#6B5BA8' },
      sweep: 'top',
      spread: 1.7,
      rise: 2,
      turbulence: 1.2,
      diffusion: 0.25,
      stagger: 0.6,
      particleSize: 1.1
    },
    dust: {
      vapor: { dark: '#A3A3A3', light: '#737373' },
      sweep: 'scatter',
      spread: 1.5,
      rise: 0,
      turbulence: 0.3,
      diffusion: 1.4,
      stagger: 0.4,
      particleSize: 1
    },
    bloom: {
      vapor: { dark: '#FF9FFC', light: '#D6249F' },
      sweep: 'center',
      spread: 1.3,
      rise: 0.8,
      turbulence: 1,
      diffusion: 0.45,
      stagger: 0.9,
      particleSize: 1.3
    },
    ink: {
      vapor: { dark: 'currentColor', light: 'currentColor' },
      sweep: 'left',
      spread: 1,
      rise: 0.6,
      turbulence: 0.6,
      diffusion: 0.2,
      stagger: 0.8,
      particleSize: 1.2
    }
  };

  const DEFAULT_WORDS = ['Imagine', 'Create', 'Inspire'];
  const SWEEPS = ['left', 'right', 'center', 'top', 'scatter'];

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  // Shaders
  const SIM_VERT = `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

  const SIM_FRAG = `
precision highp float;

uniform sampler2D uPrevious;
uniform vec2 uResolution;
uniform vec2 uCanvas;
uniform float uFollow;
uniform float uDrain;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform float uRadius;
uniform float uAmount;
uniform vec2 uWind;

float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 e = b - a;
  float t = clamp(dot(p - a, e) / max(dot(e, e), 1e-4), 0.0, 1.0);
  return length(p - a - e * t);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (uv - 0.5) * uCanvas;
  vec4 previous = texture2D(uPrevious, uv);
  float d = segmentDistance(p, uFrom, uTo) / uRadius;
  float paint = exp(-d * d * 2.0) * uAmount;
  float target = max(previous.a - uDrain, paint);
  float strength = previous.r + (target - previous.r) * uFollow;
  vec2 wind = mix(previous.gb, uWind, clamp(paint * 3.0, 0.0, 1.0));
  gl_FragColor = vec4(max(strength, 0.0), wind, max(target, 0.0));
}
`;

  const COMMON_GLSL = `
uniform vec2 uCanvas;
uniform vec4 uBounds;
uniform vec2 uOrigin;
uniform float uSweep;
uniform float uStagger;
uniform float uPhase;
uniform float uMode;
uniform float uGrain;
uniform float uDpr;
uniform float uEm;
uniform float uBreath;
uniform sampler2D uField;

const float TRAVEL = 0.75;

float hash12(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float orderAt(vec2 p) {
  vec2 size = max(uBounds.zw - uBounds.xy, vec2(1.0));
  vec2 q = clamp((p - uBounds.xy) / size, 0.0, 1.0);
  float o;
  if (uSweep < 0.5) {
    o = q.x;
  } else if (uSweep < 1.5) {
    o = 1.0 - q.x;
  } else if (uSweep < 2.5) {
    o = abs(q.x - 0.5) * 2.0;
  } else if (uSweep < 3.5) {
    o = 1.0 - q.y;
  } else if (uSweep < 4.5) {
    o = noise(p / (uEm * 0.5) + 3.7);
  } else {
    o = clamp(length(p - uOrigin) / max(length(size), 1.0) * 1.5, 0.0, 1.0);
  }
  return clamp(mix(o, noise(p / (uEm * 0.35) + 11.0), 0.2), 0.0, 1.0);
}

float frontAt(vec2 p) {
  if (abs(uMode - 1.0) < 0.5) return 0.0;
  float t = clamp(uPhase * (1.0 + uStagger) - orderAt(p) * uStagger, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  return uMode < 0.5 ? 1.0 - t : t;
}

float releaseAt(vec2 p) {
  float g = noise(p / uGrain) * 0.6 + hash12(floor(p * uDpr) + 0.5) * 0.4;
  return 0.02 + 0.98 * clamp((g - 0.5) * 1.4 + 0.5, 0.0, 1.0);
}

vec4 fieldAt(vec2 p) {
  return texture2D(uField, p / uCanvas + 0.5);
}

float blowAt(float strength) {
  return clamp(strength * uBreath - 0.03, 0.0, 0.6);
}

vec3 toSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}
`;

  const TEXT_VERT = `
varying vec2 vUv;
varying vec2 vWorld;

void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xy;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

  const TEXT_FRAG = `
precision highp float;
${COMMON_GLSL}
uniform sampler2D uText;
uniform vec3 uColor;
varying vec2 vUv;
varying vec2 vWorld;

void main() {
  float ink = texture2D(uText, vUv).a;
  if (ink < 0.004) discard;
  float lift = max(frontAt(vWorld), blowAt(fieldAt(vWorld).r));
  if (lift >= releaseAt(vWorld) * (1.0 - TRAVEL)) discard;
  gl_FragColor = vec4(toSrgb(uColor), ink);
}
`;

  const PARTICLE_VERT = `
${COMMON_GLSL}
attribute vec4 aSeed;
uniform float uTime;
uniform float uSpread;
uniform float uRise;
uniform float uTurbulence;
uniform float uDiffusion;
uniform float uSize;
varying float vAlpha;
varying float vTint;

vec2 flow(vec2 p, float t) {
  p += 0.45 * sin(p.yx * vec2(1.3, 1.7) + vec2(t * 0.21, -t * 0.17));
  vec2 v = vec2(0.0);
  vec2 k = normalize(vec2(1.0, 0.6));
  v += vec2(k.y, -k.x) * cos(dot(k, p) * 1.1 + t * 0.55 + 1.3);
  k = normalize(vec2(-0.7, 1.1));
  v += vec2(k.y, -k.x) * cos(dot(k, p) * 1.9 - t * 0.47 + 4.1) * 0.55;
  k = normalize(vec2(1.3, -0.4));
  v += vec2(k.y, -k.x) * cos(dot(k, p) * 3.3 + t * 0.71 + 2.2) * 0.3;
  return v;
}

void main() {
  vec2 home = position.xy;
  vec4 field = fieldAt(home);
  float front = frontAt(home);
  float blow = blowAt(field.r);
  float s = clamp((max(front, blow) - releaseAt(home) * (1.0 - TRAVEL)) / TRAVEL, 0.0, 1.0);
  if (s <= 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    vAlpha = 0.0;
    vTint = 0.0;
    return;
  }
  float blown = smoothstep(-0.04, 0.04, blow - front);
  float eased = uMode < 0.5 ? s * s : 1.0 - (1.0 - s) * (1.0 - s);
  eased = mix(eased, s, blown);
  float angle = aSeed.x * 6.2831853;
  vec2 jitter = vec2(cos(angle), sin(angle) * 0.7);
  vec2 drift = mix(vec2(0.0, uRise), field.gb * 2.2 + vec2(0.0, uRise * 0.3), blown);
  float reach = uSpread * eased * (0.3 + 0.7 * sqrt(aSeed.y));
  float stride = reach / 6.0;
  vec2 p = home;
  for (int i = 0; i < 6; i++) {
    vec2 f = flow(p / uEm * 0.9 + aSeed.z * 0.06, uTime);
    vec2 direction = drift + f * uTurbulence + jitter * uDiffusion * (0.2 + s);
    p += direction / max(length(direction), 0.35) * stride;
  }
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
  gl_PointSize = max(uSize * uDpr * mix(1.0, 1.25, s), 1.0);
  vAlpha = (1.0 - smoothstep(mix(0.45, 0.7, blown), 1.0, s)) * (0.5 + 0.5 * aSeed.w);
  vTint = smoothstep(0.0, 0.5, s);
}
`;

  const PARTICLE_FRAG = `
precision highp float;
uniform vec3 uColor;
uniform vec3 uVaporColor;
varying float vAlpha;
varying float vTint;

vec3 toSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  float d = length(gl_PointCoord - 0.5);
  float soft = 1.0 - smoothstep(0.3, 0.5, d);
  vec3 color = mix(uColor, uVaporColor, vTint);
  gl_FragColor = vec4(toSrgb(color), vAlpha * soft);
}
`;

  function createVaporType(container, userOptions = {}) {
    if (!container) return null;

    // Resolve Three.js dependency
    const T = typeof window !== 'undefined' ? (window.THREE || THREE) : THREE;
    if (!T) {
      console.warn('VaporType requires Three.js to run WebGL simulation');
    }

    const preset = userOptions.preset ? (PRESETS[userOptions.preset] || PRESETS.mist) : PRESETS.mist;

    // Merge options
    let words = userOptions.words;
    if (!words) {
      const inlineText = container.getAttribute('data-words') || container.textContent.trim();
      words = inlineText ? inlineText.split(',').map(s => s.trim()).filter(Boolean) : DEFAULT_WORDS;
    } else if (typeof words === 'string') {
      words = words.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (!words.length) words = DEFAULT_WORDS;

    const opts = {
      words: words,
      as: userOptions.as || 'div',
      align: userOptions.align || 'left',
      color: userOptions.color || '#FFFFFF',
      vaporColor: userOptions.vaporColor || preset.vapor.dark,
      density: userOptions.density ?? 1,
      particleSize: userOptions.particleSize ?? preset.particleSize,
      spread: userOptions.spread ?? preset.spread,
      rise: userOptions.rise ?? preset.rise,
      turbulence: userOptions.turbulence ?? preset.turbulence,
      diffusion: userOptions.diffusion ?? preset.diffusion,
      grain: userOptions.grain ?? 1,
      sweep: userOptions.sweep || preset.sweep,
      stagger: userOptions.stagger ?? preset.stagger,
      condense: userOptions.condense ?? 1.8,
      hold: userOptions.hold ?? 2.4,
      dissolve: userOptions.dissolve ?? 2.0,
      overlap: userOptions.overlap ?? 0.6,
      loop: userOptions.loop ?? true,
      startOnView: userOptions.startOnView ?? true,
      interactive: userOptions.interactive ?? true,
      breath: userOptions.breath ?? 1,
      breathRadius: userOptions.breathRadius ?? 0.8,
      recovery: userOptions.recovery ?? 1.2,
      clickAdvance: userOptions.clickAdvance ?? true,
      pauseOnHover: userOptions.pauseOnHover ?? true,
      area: userOptions.area || 'parent',
      paused: userOptions.paused ?? false,
      dpr: userOptions.dpr ?? 2,
      className: userOptions.className || '',
      style: userOptions.style || {}
    };

    // DOM Setup
    container.classList.add('vapor-type-root');
    container.style.position = 'relative';
    container.style.display = 'inline-block';
    if (opts.style) {
      Object.assign(container.style, opts.style);
    }

    // Accessible hidden text
    const srOnly = document.createElement('span');
    srOnly.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    srOnly.textContent = opts.words.join(', ');

    // Layout grid measurement container
    const layoutGrid = document.createElement('span');
    layoutGrid.setAttribute('aria-hidden', 'true');
    layoutGrid.style.cssText = 'display:grid;';

    opts.words.forEach((w, idx) => {
      const wordSpan = document.createElement('span');
      wordSpan.setAttribute('data-vapor-word', '');
      wordSpan.style.cssText = `grid-area: 1 / 1; justify-self: ${opts.align}; align-self: center; text-align: ${opts.align}; color: transparent;`;
      wordSpan.textContent = w;
      layoutGrid.appendChild(wordSpan);
    });

    // Canvas container
    const canvasWrap = document.createElement('span');
    canvasWrap.setAttribute('aria-hidden', 'true');
    const ed = Math.max(opts.spread, 0) + 0.35;
    canvasWrap.style.cssText = `position:absolute;inset:${-ed}em;display:block;pointer-events:none;`;

    container.innerHTML = '';
    container.appendChild(srOnly);
    container.appendChild(layoutGrid);
    container.appendChild(canvasWrap);

    if (!T) {
      // Fallback: make text visible
      const firstWord = layoutGrid.querySelector('[data-vapor-word]');
      if (firstWord) firstWord.style.color = opts.color;
      return {
        next: () => {},
        replay: () => {},
        destroy: () => { container.innerHTML = ''; }
      };
    }

    // WebGL Canvas
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;left:0;top:0;display:block;pointer-events:none;';
    canvasWrap.appendChild(canvas);

    let renderer;
    try {
      renderer = new T.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.warn('Could not create WebGLRenderer for VaporType:', e);
      const firstWord = layoutGrid.querySelector('[data-vapor-word]');
      if (firstWord) firstWord.style.color = opts.color;
      return { next: () => {}, replay: () => {}, destroy: () => {} };
    }

    renderer.setPixelRatio(1);
    renderer.setClearColor(0, 0);

    const commonUniforms = {
      uCanvas: { value: new T.Vector2(1, 1) },
      uStagger: { value: 1 },
      uGrain: { value: 2 },
      uDpr: { value: 1 },
      uEm: { value: 16 },
      uBreath: { value: 1 },
      uField: { value: null },
      uColor: { value: new T.Color(1, 1, 1) }
    };

    const particleUniforms = {
      uTime: { value: 0 },
      uSpread: { value: 40 },
      uRise: { value: 1 },
      uTurbulence: { value: 1 },
      uDiffusion: { value: 0.35 },
      uSize: { value: 1.2 },
      uVaporColor: { value: new T.Color(1, 1, 1) }
    };

    const simUniforms = {
      uPrevious: { value: null },
      uResolution: { value: new T.Vector2(1, 1) },
      uCanvas: commonUniforms.uCanvas,
      uFollow: { value: 1 },
      uDrain: { value: 0 },
      uFrom: { value: new T.Vector2() },
      uTo: { value: new T.Vector2() },
      uRadius: { value: 40 },
      uAmount: { value: 0 },
      uWind: { value: new T.Vector2() }
    };

    const simMaterial = new T.ShaderMaterial({
      uniforms: simUniforms,
      vertexShader: SIM_VERT,
      fragmentShader: SIM_FRAG,
      depthTest: false,
      depthWrite: false
    });

    const mainScene = new T.Scene();
    const camera = new T.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    const planeGeo = new T.PlaneGeometry(1, 1);
    const emptyGeo = new T.BufferGeometry();

    const makeWordSlot = () => {
      const own = {
        uBounds: { value: new T.Vector4(0, 0, 1, 1) },
        uOrigin: { value: new T.Vector2() },
        uSweep: { value: 0 },
        uPhase: { value: 0 },
        uMode: { value: 1 },
        uText: { value: null }
      };

      const textMaterial = new T.ShaderMaterial({
        uniforms: { ...commonUniforms, ...own },
        vertexShader: TEXT_VERT,
        fragmentShader: TEXT_FRAG,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });

      const particleMaterial = new T.ShaderMaterial({
        uniforms: { ...commonUniforms, ...particleUniforms, ...own },
        vertexShader: PARTICLE_VERT,
        fragmentShader: PARTICLE_FRAG,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });

      const textMesh = new T.Mesh(planeGeo, textMaterial);
      textMesh.frustumCulled = false;
      textMesh.visible = false;

      const pointMesh = new T.Points(emptyGeo, particleMaterial);
      pointMesh.frustumCulled = false;
      pointMesh.renderOrder = 1;
      pointMesh.visible = false;

      mainScene.add(textMesh, pointMesh);

      return {
        own: own,
        text: textMesh,
        points: pointMesh,
        textMaterial: textMaterial,
        particleMaterial: particleMaterial,
        word: -1,
        mode: 1,
        elapsed: 0,
        radial: false
      };
    };

    const slots = [makeWordSlot(), makeWordSlot()];
    const simScene = new T.Scene();
    const simQuad = new T.Mesh(new T.PlaneGeometry(2, 2), simMaterial);
    simQuad.frustumCulled = false;
    simScene.add(simQuad);

    const helperCanvas = document.createElement('canvas');
    helperCanvas.width = 1;
    helperCanvas.height = 1;
    const helperCtx = helperCanvas.getContext('2d', { willReadFrequently: true });

    let simFBOs = [];
    let activeFBOIdx = 0;
    let wordCache = [];
    let lastSig = '';
    let lastColors = '';
    let canvasW = 0;
    let canvasH = 0;
    let effectiveDpr = 1;
    let currentEm = 16;
    let fontRev = 0;
    let fontsReady = false;
    let activeSlotIdx = 0;
    let isRunning = false;
    let isInView = false;
    let isDestroyed = false;
    let rafId = 0;
    let timerId = 0;
    let lastTime = 0;
    let globalTime = 0;
    let lastBlowTime = -Infinity;
    let triggerNext = false;
    let targetWordIdx = -1;
    let clickPos = null;

    const mouse = {
      x: 0,
      y: 0,
      fromX: 0,
      fromY: 0,
      vx: 0,
      vy: 0,
      at: 0,
      fresh: true,
      moved: false,
      over: false
    };

    const parseColor = (colStr, fallback, outColor) => {
      if (!helperCtx) return;
      helperCtx.clearRect(0, 0, 1, 1);
      helperCtx.fillStyle = fallback;
      helperCtx.fillStyle = colStr;
      helperCtx.fillRect(0, 0, 1, 1);
      const [r, g, b] = helperCtx.getImageData(0, 0, 1, 1).data;
      outColor.setRGB(r / 255, g / 255, b / 255);
    };

    const updateColors = () => {
      const computed = getComputedStyle(container);
      const col = opts.color === 'currentColor' ? computed.color : opts.color;
      const vcol = opts.vaporColor === 'currentColor' ? col : opts.vaporColor;
      const key = `${col}|${vcol}`;
      if (key !== lastColors) {
        lastColors = key;
        parseColor(col, '#ffffff', commonUniforms.uColor.value);
        parseColor(vcol, col, particleUniforms.uVaporColor.value);
        return true;
      }
      return false;
    };

    const bindWordToSlot = (slot, wordIdx) => {
      const data = wordCache[wordIdx];
      slot.word = wordIdx;
      if (!data) {
        slot.text.visible = false;
        slot.points.visible = false;
        return;
      }
      slot.own.uText.value = data.texture;
      slot.own.uBounds.value.set(...data.bounds);
      slot.text.position.set(data.center[0], data.center[1], 0);
      slot.text.scale.set(data.size[0], data.size[1], 1);
      slot.text.visible = true;
      slot.points.geometry = data.geometry;
      slot.points.visible = true;
    };

    const clearSlot = (slot) => {
      slot.word = -1;
      slot.text.visible = false;
      slot.points.visible = false;
      slot.points.geometry = emptyGeo;
      slot.own.uText.value = null;
    };

    const makeFBO = (w, h) => {
      return new T.WebGLRenderTarget(w, h, {
        type: T.HalfFloatType || T.FloatType,
        format: T.RGBAFormat,
        minFilter: T.LinearFilter,
        magFilter: T.LinearFilter,
        depthBuffer: false,
        stencilBuffer: false,
        generateMipmaps: false
      });
    };

    const rasterizeWords = () => {
      if (isDestroyed) return false;
      const rect = canvasWrap.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return false;

      const computed = getComputedStyle(container);
      const dpr = Math.min(window.devicePixelRatio || 1, Math.max(opts.dpr, 0.5));
      const wordEls = Array.from(layoutGrid.querySelectorAll('[data-vapor-word]'));

      const sig = [
        Math.round(4 * rect.width),
        Math.round(4 * rect.height),
        dpr,
        fontRev,
        computed.fontStyle,
        computed.fontWeight,
        computed.fontSize,
        computed.fontFamily,
        computed.letterSpacing,
        opts.density,
        opts.align,
        wordEls.map(e => e.textContent || '').join('\0')
      ].join('|');

      if (sig === lastSig) return false;
      lastSig = sig;
      effectiveDpr = dpr;
      currentEm = parseFloat(computed.fontSize) || 16;

      const pxW = Math.max(2, 2 * Math.ceil(rect.width * effectiveDpr / 2));
      const pxH = Math.max(2, 2 * Math.ceil(rect.height * effectiveDpr / 2));
      canvasW = pxW / effectiveDpr;
      canvasH = pxH / effectiveDpr;

      renderer.setSize(pxW, pxH, false);
      canvas.style.width = `${canvasW}px`;
      canvas.style.height = `${canvasH}px`;

      camera.left = -canvasW / 2;
      camera.right = canvasW / 2;
      camera.top = canvasH / 2;
      camera.bottom = -canvasH / 2;
      camera.updateProjectionMatrix();

      commonUniforms.uCanvas.value.set(canvasW, canvasH);
      commonUniforms.uDpr.value = effectiveDpr;
      commonUniforms.uEm.value = currentEm;

      const fboW = Math.max(8, Math.ceil(canvasW / 6));
      const fboH = Math.max(8, Math.ceil(canvasH / 6));

      simFBOs.forEach(f => f.dispose());
      simFBOs = [makeFBO(fboW, fboH), makeFBO(fboW, fboH)];
      simUniforms.uResolution.value.set(fboW, fboH);

      renderer.setRenderTarget(simFBOs[0]);
      renderer.clear();
      renderer.setRenderTarget(simFBOs[1]);
      renderer.clear();
      renderer.setRenderTarget(null);
      activeFBOIdx = 0;
      commonUniforms.uField.value = simFBOs[0].texture;

      const fontStr = [computed.fontStyle, computed.fontWeight, `${currentEm}px`, computed.fontFamily].filter(Boolean).join(' ');
      const letterSpacing = parseFloat(computed.letterSpacing) || 0;

      // Dispose existing word cache
      wordCache.forEach(w => {
        w.texture.dispose();
        w.geometry.dispose();
      });
      wordCache = [];

      wordEls.forEach((el, wordIndex) => {
        const text = el.textContent || '';
        if (!text) return;

        // Measure text using canvas
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
        offCtx.font = fontStr;
        offCtx.letterSpacing = `${letterSpacing}px`;

        const metrics = offCtx.measureText(text);
        const ascent = metrics.fontBoundingBoxAscent || metrics.actualBoundingBoxAscent || 0.8 * currentEm;
        const descent = metrics.fontBoundingBoxDescent || metrics.actualBoundingBoxDescent || 0.2 * currentEm;
        const textW = Math.ceil(metrics.width || 100);
        const textH = Math.ceil(ascent + descent);

        const pad = Math.ceil(0.3 * currentEm);
        const boxW = Math.max(1, textW + pad * 2);
        const boxH = Math.max(1, textH + pad * 2);

        offCanvas.width = Math.ceil(boxW * effectiveDpr);
        offCanvas.height = Math.ceil(boxH * effectiveDpr);

        offCtx.setTransform(effectiveDpr, 0, 0, effectiveDpr, 0, 0);
        offCtx.font = fontStr;
        offCtx.letterSpacing = `${letterSpacing}px`;
        offCtx.fillStyle = '#ffffff';
        offCtx.textAlign = 'left';
        offCtx.textBaseline = 'alphabetic';
        offCtx.fillText(text, pad, pad + ascent);

        const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height).data;
        const step = 1 / Math.sqrt(clamp(opts.density, 0.1, 4));

        let seed = (Math.imul(wordIndex + 1, 0x9e3779b1) >>> 0) || 1;
        const rng = () => {
          seed ^= seed << 13;
          seed ^= seed >>> 17;
          seed ^= seed << 5;
          return (seed >>> 0) / 0x100000000;
        };

        const positions = [];
        const seeds = [];
        const wCss = offCanvas.width / effectiveDpr;
        const hCss = offCanvas.height / effectiveDpr;

        // Calculate center relative to root container
        const elRect = el.getBoundingClientRect();
        const wrapRect = canvasWrap.getBoundingClientRect();
        const offsetX = (elRect.left + elRect.width / 2) - (wrapRect.left + wrapRect.width / 2);
        const offsetY = (wrapRect.top + wrapRect.height / 2) - (elRect.top + elRect.height / 2);

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        for (let y = step / 2; y < hCss; y += step) {
          for (let x = step / 2; x < wCss; x += step) {
            const rx = x + (rng() - 0.5) * step;
            const ry = y + (rng() - 0.5) * step;
            const px = Math.min(offCanvas.width - 1, Math.max(0, Math.floor(rx * effectiveDpr)));
            const py = Math.min(offCanvas.height - 1, Math.max(0, Math.floor(ry * effectiveDpr)));
            const alpha = imgData[(py * offCanvas.width + px) * 4 + 3];

            if (alpha >= 96) {
              const posX = offsetX - wCss / 2 + rx;
              const posY = offsetY + hCss / 2 - ry;
              positions.push(posX, posY, 0);
              seeds.push(rng(), rng(), rng(), rng());

              minX = Math.min(minX, posX);
              maxX = Math.max(maxX, posX);
              minY = Math.min(minY, posY);
              maxY = Math.max(maxY, posY);
            }
          }
        }

        const count = positions.length / 3;
        const geom = new T.BufferGeometry();
        geom.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
        geom.setAttribute('aSeed', new T.Float32BufferAttribute(seeds, 4));

        const tex = new T.CanvasTexture(offCanvas);
        tex.minFilter = T.LinearFilter;
        tex.magFilter = T.LinearFilter;
        tex.generateMipmaps = false;

        wordCache.push({
          texture: tex,
          geometry: geom,
          center: [offsetX, offsetY],
          size: [wCss, hCss],
          bounds: count ? [minX, minY, maxX, maxY] : [0, 0, 1, 1]
        });
      });

      // Bind initial slots
      slots.forEach((s, idx) => {
        if (s.word < 0) {
          if (idx === 0 && wordCache.length > 0) {
            bindWordToSlot(s, 0);
          }
        } else if (s.word < wordCache.length) {
          bindWordToSlot(s, s.word);
        } else {
          clearSlot(s);
        }
      });

      return true;
    };

    const requestTick = () => {
      if (isDestroyed || !isInView || !isRunning || rafId) return;
      if (timerId) {
        clearTimeout(timerId);
        timerId = 0;
      }
      rafId = requestAnimationFrame(animateLoop);
    };

    const startAnimation = () => {
      if (isRunning || !fontsReady || (!isInView && opts.startOnView)) return;
      isRunning = true;
      activeSlotIdx = 0;
      clearSlot(slots[1]);
      const s0 = slots[0];
      bindWordToSlot(s0, 0);
      s0.mode = opts.paused ? 1 : 0;
      s0.elapsed = 0;
      s0.radial = false;
      requestTick();
    };

    function animateLoop(now) {
      rafId = 0;
      if (isDestroyed || !wordCache.length) return;

      const delta = lastTime ? Math.max(0, (now - lastTime) / 1000) : 0;
      lastTime = now;
      const dt = Math.min(delta, 0.1);

      const totalWords = wordCache.length;
      const isUnpaused = !opts.paused;
      const timings = [Math.max(opts.condense, 0.05), Math.max(opts.hold, 0), Math.max(opts.dissolve, 0.05)];
      const overlapTime = timings[2] * (1 - clamp(opts.overlap, 0, 1));
      let currentSlot = slots[activeSlotIdx];
      const isHovered = opts.pauseOnHover && opts.interactive && mouse.over;
      const isLastNonLoop = !opts.loop && currentSlot.word >= totalWords - 1 && !triggerNext && targetWordIdx < 0;

      if (isUnpaused) {
        globalTime += dt;
        const otherSlot = slots[1 - activeSlotIdx];
        if (otherSlot.word >= 0) {
          otherSlot.elapsed += dt;
          if (otherSlot.elapsed >= timings[2]) {
            clearSlot(otherSlot);
          }
        }

        if (currentSlot.mode === 1) {
          if (!isHovered) currentSlot.elapsed += delta;
          const advanceClick = clickPos !== null && opts.clickAdvance && opts.interactive;
          if (advanceClick || triggerNext || targetWordIdx >= 0 || (!isLastNonLoop && currentSlot.elapsed >= timings[1])) {
            currentSlot.mode = 2; // Dissolve
            currentSlot.elapsed = 0;
            currentSlot.radial = advanceClick;
            if (clickPos && advanceClick) {
              currentSlot.own.uOrigin.value.set(clickPos.x, clickPos.y);
            }
          }
          triggerNext = false;
        } else if (currentSlot.mode === 0) {
          currentSlot.elapsed += dt;
          if (currentSlot.elapsed >= timings[0]) {
            currentSlot.mode = 1; // Hold
            currentSlot.elapsed = 0;
            currentSlot.radial = false;
          }
        } else {
          currentSlot.elapsed += dt;
        }

        if (currentSlot.mode === 2 && currentSlot.elapsed >= overlapTime) {
          const nextIdx = targetWordIdx >= 0 ? (targetWordIdx % totalWords) : ((currentSlot.word + 1) % totalWords);
          targetWordIdx = -1;
          const nextSlot = slots[1 - activeSlotIdx];
          bindWordToSlot(nextSlot, nextIdx);
          nextSlot.mode = 0; // Condense
          nextSlot.elapsed = 0;
          nextSlot.radial = false;
          activeSlotIdx = 1 - activeSlotIdx;
          currentSlot = nextSlot;
        }
      }

      clickPos = null;

      // Mouse breath simulation
      const recTime = Math.max(opts.recovery, 0.05);
      const isMouseNear = mouse.moved && isUnpaused && opts.interactive && opts.breath > 0 && (() => {
        const data = wordCache[slots[activeSlotIdx].word];
        if (!data) return false;
        const rad = Math.max(opts.breathRadius, 0.05) * currentEm * 1.5;
        const [bX0, bY0, bX1, bY1] = data.bounds;
        for (let i = 0; i <= 6; i++) {
          const t = i / 6;
          const px = mouse.fromX + (mouse.x - mouse.fromX) * t;
          const py = mouse.fromY + (mouse.y - mouse.fromY) * t;
          if (Math.max(bX0 - px, 0, px - bX1) + Math.max(bY0 - py, 0, py - bY1) < rad) {
            return true;
          }
        }
        return false;
      })();

      const shouldSimulate = now - lastBlowTime < (recTime + 1) * 1000;
      if ((isMouseNear || shouldSimulate) && simFBOs.length === 2) {
        const speed = Math.hypot(mouse.vx, mouse.vy);
        const amt = isMouseNear ? clamp(speed / 1600, 0, 1) : 0;
        const factor = speed > 1 ? Math.min(speed / 1200, 1) / speed : 0;

        simUniforms.uPrevious.value = simFBOs[activeFBOIdx].texture;
        simUniforms.uFollow.value = 1 - Math.exp(-dt / 0.14);
        simUniforms.uDrain.value = dt / recTime;
        simUniforms.uFrom.value.set(mouse.fromX, mouse.fromY);
        simUniforms.uTo.value.set(mouse.x, mouse.y);
        simUniforms.uRadius.value = Math.max(opts.breathRadius, 0.05) * currentEm;
        simUniforms.uAmount.value = amt;
        simUniforms.uWind.value.set(mouse.vx * factor, mouse.vy * factor);

        renderer.setRenderTarget(simFBOs[1 - activeFBOIdx]);
        renderer.render(simScene, camera);
        renderer.setRenderTarget(null);

        activeFBOIdx = 1 - activeFBOIdx;
        commonUniforms.uField.value = simFBOs[activeFBOIdx].texture;

        if (isMouseNear && amt > 0.02) {
          lastBlowTime = now;
        }
      }

      mouse.fromX = mouse.x;
      mouse.fromY = mouse.y;
      mouse.moved = false;

      const sweepIdx = Math.max(0, SWEEPS.indexOf(opts.sweep));
      slots.forEach(s => {
        s.own.uMode.value = s.mode;
        s.own.uPhase.value = s.mode === 1 ? 0 : Math.min(s.elapsed / timings[s.mode], 1);
        s.own.uSweep.value = s.radial ? 5 : sweepIdx;
      });

      commonUniforms.uStagger.value = clamp(opts.stagger, 0, 4);
      commonUniforms.uGrain.value = Math.max(opts.grain, 0.05) * currentEm * 0.035;
      commonUniforms.uBreath.value = opts.interactive ? clamp(opts.breath, 0, 3) : 0;

      particleUniforms.uTime.value = globalTime;
      particleUniforms.uSpread.value = Math.max(opts.spread, 0) * currentEm;
      particleUniforms.uRise.value = clamp(opts.rise, -3, 3);
      particleUniforms.uTurbulence.value = clamp(opts.turbulence, 0, 4);
      particleUniforms.uDiffusion.value = clamp(opts.diffusion, 0, 4);
      particleUniforms.uSize.value = clamp(opts.particleSize, 0.25, 8);

      renderer.render(mainScene, camera);

      if (isUnpaused && (currentSlot.mode !== 1 || slots[1 - activeSlotIdx].word >= 0 || now - lastBlowTime < (recTime + 1) * 1000 || triggerNext || targetWordIdx >= 0)) {
        requestTick();
      } else if (isUnpaused && currentSlot.mode === 1 && !isLastNonLoop && !isHovered && isInView) {
        const remainingHold = Math.max(timings[1] - currentSlot.elapsed, 0);
        timerId = setTimeout(() => {
          timerId = 0;
          requestTick();
        }, remainingHold * 1000 + 16);
      }
    }

    // Pointer Events
    const getPointerCoords = (e) => {
      const rect = canvasWrap.getBoundingClientRect();
      return {
        x: e.clientX - rect.left - canvasW / 2,
        y: rect.top + canvasH / 2 - e.clientY
      };
    };

    const isPointerOver = (e) => {
      const rect = container.getBoundingClientRect();
      return e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    };

    const onPointerMove = (e) => {
      if (e.pointerType === 'touch') return;
      const over = isPointerOver(e);
      if (mouse.over && !over) lastTime = 0;
      mouse.over = over;

      const pos = getPointerCoords(e);
      const stamp = e.timeStamp;

      if (mouse.fresh) {
        mouse.fresh = false;
        mouse.x = pos.x;
        mouse.y = pos.y;
        mouse.fromX = pos.x;
        mouse.fromY = pos.y;
        mouse.vx = 0;
        mouse.vy = 0;
        mouse.at = stamp;
        return;
      }

      const dt = Math.max((stamp - mouse.at) / 1000, 0.002);
      const lerp = Math.min(1, dt / 0.03);
      mouse.vx += ((pos.x - mouse.x) / dt - mouse.vx) * lerp;
      mouse.vy += ((pos.y - mouse.y) / dt - mouse.vy) * lerp;
      mouse.x = pos.x;
      mouse.y = pos.y;
      mouse.at = stamp;
      mouse.moved = true;

      requestTick();
    };

    const onPointerLeave = () => {
      if (mouse.over) lastTime = 0;
      mouse.fresh = true;
      mouse.over = false;
      mouse.vx = 0;
      mouse.vy = 0;
      requestTick();
    };

    const onPointerDown = (e) => {
      if (!opts.clickAdvance || !opts.interactive || e.button > 0) return;
      if (isPointerOver(e)) {
        clickPos = getPointerCoords(e);
        requestTick();
      }
    };

    // Attach area listeners
    const targetArea = opts.area === 'window' ? window : opts.area === 'self' ? container : (container.parentElement || container);
    targetArea.addEventListener('pointermove', onPointerMove, { passive: true });
    targetArea.addEventListener('pointerdown', onPointerDown, { passive: true });
    targetArea.addEventListener('pointerleave', onPointerLeave, { passive: true });
    targetArea.addEventListener('pointercancel', onPointerLeave, { passive: true });

    // Observers
    const resizeObserver = new ResizeObserver(() => {
      if (rasterizeWords()) requestTick();
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting;
      if (isInView) {
        if (!isRunning) {
          startAnimation();
        }
        lastTime = 0;
        requestTick();
      } else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }, { rootMargin: '0px', threshold: 0.1 });
    intersectionObserver.observe(container);

    const onFontLoad = () => {
      fontsReady = true;
      fontRev++;
      rasterizeWords();
      if (isInView && !isRunning) {
        startAnimation();
        requestTick();
      }
    };

    if (document.fonts) {
      document.fonts.ready.then(onFontLoad);
    } else {
      fontsReady = true;
      onFontLoad();
    }

    updateColors();
    rasterizeWords();

    return {
      next: () => {
        triggerNext = true;
        requestTick();
      },
      goTo: (idx) => {
        const numWords = wordCache.length || (opts.words ? opts.words.length : 0);
        if (typeof idx === 'number' && idx >= 0 && idx < numWords) {
          if (slots[activeSlotIdx] && slots[activeSlotIdx].word === idx) return;
          targetWordIdx = idx;
          requestTick();
        }
      },
      replay: () => {
        targetWordIdx = 0;
        requestTick();
      },
      sync: () => {
        updateColors();
        rasterizeWords();
        startAnimation();
        requestTick();
      },
      destroy: () => {
        isDestroyed = true;
        if (rafId) cancelAnimationFrame(rafId);
        if (timerId) clearTimeout(timerId);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        targetArea.removeEventListener('pointermove', onPointerMove);
        targetArea.removeEventListener('pointerdown', onPointerDown);
        targetArea.removeEventListener('pointerleave', onPointerLeave);
        targetArea.removeEventListener('pointercancel', onPointerLeave);
        wordCache.forEach(w => {
          w.texture.dispose();
          w.geometry.dispose();
        });
        simFBOs.forEach(f => f.dispose());
        planeGeo.dispose();
        emptyGeo.dispose();
        simQuad.geometry.dispose();
        slots.forEach(s => {
          s.textMaterial.dispose();
          s.particleMaterial.dispose();
        });
        simMaterial.dispose();
        renderer.dispose();
        canvas.remove();
      }
    };
  }

  createVaporType.presets = PRESETS;
  return createVaporType;
});
