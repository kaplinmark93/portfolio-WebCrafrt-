/**
 * PARTICLES BACKGROUND COMPONENT (React Bits -> Vanilla WebGL2)
 * High performance WebGL2 particle field with depth, twinkle, and parallax.
 */

(function () {
  'use strict';

  const SHAPES = { circle: 0, square: 1, ring: 2, sparkle: 3 };
  const EFFECTS = { parallax: 0, repel: 1, attract: 2 };
  const DRIFTS = { none: 0, up: 1, down: 2, forward: 3 };
  const MAX_COUNT = 20000;
  const MAX_LINKED = 900;
  const MAX_LINES = 9000;
  const MAX_BURSTS = 4;
  const MAX_RING_WAVES = 4;
  const RING_WAVE_SECONDS = 1.6;
  const RING_WAVE_SPEED = 820;
  const RING_WAVE_WIDTH = 75;
  const DEPTH = 10;
  const FOCAL = 1 / Math.tan((7.5 * Math.PI) / 180);
  const NEAR = 0.1;
  const FAR = 100;
  const INTRO_SECONDS = 1.8;
  const BURST_SECONDS = 1.5;
  const BURST_SPEED = 520;
  const BURST_WIDTH = 46;

  const PARTICLE_VERTEX = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec3 aPosition;
layout(location = 2) in vec4 aRandom;
layout(location = 3) in vec3 aColor;
uniform mat3 uRotation;
uniform vec3 uOffset;
uniform float uSpread;
uniform float uTime;
uniform float uCamera;
uniform float uAspect;
uniform vec2 uView;
uniform float uRatio;
uniform float uSize;
uniform float uRandomness;
uniform float uBlur;
uniform float uFocus;
uniform float uGlow;
uniform float uTwinkle;
uniform int uShape;
uniform int uDrift;
uniform float uTravel;
uniform vec4 uPointer;
uniform int uEffect;
uniform float uStrength;
uniform vec4 uBursts[${MAX_BURSTS}];
uniform int uBurstCount;
uniform vec2 uRingPos;
uniform float uRingRadius;
uniform float uRingWidth;
uniform float uRingWidth2;
uniform float uRingDisplacement;
uniform vec4 uRingWaves[${MAX_RING_WAVES}];
uniform int uRingWaveCount;
uniform float uReveal;
uniform sampler2D uMorphTexture;
uniform float uMorphProgress;
uniform float uMorphAnchorX;
uniform int uMorphEnabled;
uniform vec3 uMouse;
uniform float uMouseActive;
out vec2 vLocal;
out float vRadius;
out float vBlur;
out float vAlpha;
out float vHalo;
out float vSeed;
out vec3 vColor;
out float vIsGlint;

vec3 bob(vec4 r, float t) {
  return vec3(
    sin(t * r.z + 6.28 * r.w) * mix(0.1, 1.5, r.x),
    sin(t * r.y + 6.28 * r.x) * mix(0.1, 1.5, r.w),
    sin(t * r.w + 6.28 * r.y) * mix(0.1, 1.5, r.z)
  );
}

// Simplex 3D Noise (Ashima / McEwan)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  vec3 pos = aPosition * uSpread;
  pos.z *= ${DEPTH.toFixed(1)};
  float isAmbientType = 0.0;
  float clampedProgress = 0.0;

  if (uMorphEnabled == 1) {
    clampedProgress = clamp(uMorphProgress, 0.0, 8.35);

    // Initial chaotic state: floating ambient dust across the full viewport
    vec3 chaosPos = aPosition * uSpread * vec3(1.4, 1.1, 1.4) + bob(aRandom, uTime * 0.3) * 0.6;

    vec3 target0;
    vec3 target1;
    float blend = 0.0;
    float transitionActivity = 0.0;

    if (clampedProgress < 1.0) {
      // PHASE 0: Materialization from chaotic cloud into Stage 0 (Three Hovering Isometric Diamond Layers)
      float phaseDelay = aRandom.w * 0.35;
      float indT = clamp((clampedProgress - phaseDelay) / (1.0 - 0.35), 0.0, 1.0);
      blend = smoothstep(0.0, 1.0, indT);

      // Target from Stage 0 (Three Hovering Isometric Diamond Layers)
      vec4 startData = texelFetch(uMorphTexture, ivec2(gl_InstanceID, 0), 0);
      vec3 startShape = startData.xyz;
      isAmbientType = mix(1.0, startData.w, blend);

      transitionActivity = sin(clampedProgress * 3.14159265);
      transitionActivity = pow(transitionActivity, 1.35);

      target0 = chaosPos;
      target1 = startShape;
    } else {
      // PHASES 1 to 7: Sequential morphing between the 8 shapes
      float activeProg = clampedProgress - 1.0;
      int s0 = clamp(int(floor(activeProg)), 0, 7);
      int s1 = clamp(s0 + 1, 0, 7);
      float morphT = fract(activeProg);
      if (activeProg >= 7.0) {
        s0 = 7;
        s1 = 7;
        morphT = 0.0;
      }

      vec4 samp0 = texelFetch(uMorphTexture, ivec2(gl_InstanceID, s0), 0);
      vec4 samp1 = texelFetch(uMorphTexture, ivec2(gl_InstanceID, s1), 0);
      vec3 p0 = samp0.xyz;
      vec3 p1 = samp1.xyz;

      float phaseDelay = aRandom.w * 0.28;
      float individualT = clamp((morphT - phaseDelay) / (1.0 - 0.28), 0.0, 1.0);
      blend = smoothstep(0.0, 1.0, individualT);
      isAmbientType = mix(samp0.w, samp1.w, blend);

      transitionActivity = s0 == s1 ? 0.0 : pow(sin(morphT * 3.14159265), 1.35);

      target0 = p0;
      target1 = p1;
    }

    vec3 morphedPos = mix(target0, target1, blend);

    // 3D Simplex Turbulence / Curl Noise during active transitions
    if (transitionActivity > 0.001) {
      vec3 noiseInput = morphedPos * 1.1 + vec3(uTime * 0.35 + aRandom.x * 2.2, uTime * 0.25 + aRandom.y * 2.2, aRandom.z * 2.5);
      float nX = snoise(noiseInput);
      float nY = snoise(noiseInput + vec3(21.43, 53.19, 14.82));
      float nZ = snoise(noiseInput + vec3(79.16, 91.24, 37.45));
      vec3 turbNoise = vec3(nX, nY, nZ);

      vec3 swirl = vec3(-morphedPos.y, morphedPos.x, sin(morphedPos.x * 2.0)) * 0.22;
      vec3 displacement = (turbNoise * 1.1 + swirl) * transitionActivity * 1.35;
      morphedPos += displacement;
    }

    // Exit state dispersion (after stage 7 / progress > 8.0)
    if (clampedProgress > 8.0) {
      float exitT = clampedProgress - 8.0;
      vec3 explodeDir = normalize(morphedPos + (aRandom.xyz - 0.5) * 1.4);
      morphedPos += explodeDir * (exitT * 8.0 + pow(exitT * 2.2, 2.0));
    }

    // Dynamic continuous movement:
    // 1. Core particles: stable on the elements (zero shake / no distortion)
    // 2. Halo particles: gentle subtle aura around the 3D element
    // 3. Full-screen particles: ACTIVE, dynamic 3D travel and flow across the viewport!
    if (clampedProgress <= 9.0) {
      // Core particles (tag <= 0.25): rock-solid and stable on the elements
      vec3 coreBreathe = vec3(0.0);

      // Halo particles (tag ~ 0.5): subtle soft shimmer in the aura
      vec3 haloDrift = vec3(
        sin(uTime * 0.70 + aRandom.x * 6.283) * 0.04 - morphedPos.y * 0.02,
        cos(uTime * 0.70 + aRandom.y * 6.283) * 0.04 + morphedPos.x * 0.02,
        sin(uTime * 0.60 + aRandom.z * 6.283) * 0.04
      );

      // Full-screen particles (tag >= 0.75): energetic, fluid multi-octave 3D drifting flow across the entire viewport
      float tFlow = uTime * 1.15;
      vec3 flow1 = vec3(
        sin(tFlow * 0.90 + aRandom.x * 6.283 + morphedPos.y * 0.55) * 0.85 + cos(tFlow * 0.50 + aRandom.z * 6.283) * 0.55,
        cos(tFlow * 0.80 + aRandom.y * 6.283 + morphedPos.x * 0.55) * 0.85 + sin(tFlow * 0.40 + aRandom.w * 6.283) * 0.55,
        sin(tFlow * 1.05 + aRandom.z * 6.283 + morphedPos.z * 0.55) * 1.10
      );
      vec3 flow2 = vec3(
        sin(tFlow * 0.35 + aRandom.w * 6.283) * 0.85 + cos(tFlow * 0.20) * 0.45,
        cos(tFlow * 0.40 + aRandom.x * 6.283) * 0.95 + sin(tFlow * 0.25) * 0.55,
        sin(tFlow * 0.45 + aRandom.y * 6.283) * 0.75
      );
      vec3 screenFlow = flow1 + flow2;

      float haloWeight = smoothstep(0.40, 0.48, isAmbientType) * (1.0 - smoothstep(0.58, 0.70, isAmbientType));
      float screenWeight = smoothstep(0.70, 0.90, isAmbientType);
      float coreWeight = 1.0 - smoothstep(0.38, 0.46, isAmbientType);

      float idleWeight = 1.0 - smoothstep(0.04, 0.40, transitionActivity);
      vec3 totalMotion = coreBreathe * coreWeight + haloDrift * haloWeight * idleWeight + screenFlow * screenWeight;
      morphedPos += totalMotion;
    }

    // Stationary orientation: elements do not spin, keeping their optimal 3D perspective orientation
    vec3 finalLocal = morphedPos;

    // Anchor the core 3D shape and its halo on the desired side (uMorphAnchorX: >0 right, <0 left)
    // Full-screen particles (tag > 0.75) stay distributed across the entire screen!
    float anchorMultiplier = 1.0 - smoothstep(0.70, 0.90, isAmbientType);
    float baseAnchorX = (uAspect > 1.2 ? uMorphAnchorX : (uAspect > 0.9 ? uMorphAnchorX * 0.65 : 0.0));
    float targetAnchorX = baseAnchorX * anchorMultiplier;
    float targetAnchorY = (uAspect > 1.2 ? 0.0 : (uAspect > 0.9 ? 0.05 : -0.35)) * anchorMultiplier;
    float anchorWeight = smoothstep(0.0, 1.0, clampedProgress);

    finalLocal.x += targetAnchorX * anchorWeight;
    finalLocal.y += targetAnchorY * anchorWeight;

    pos = finalLocal;
  }

  vec3 wobble = bob(aRandom, uTime) * (uMorphEnabled == 1 ? 0.0 : 1.0);
  vec3 world;
  if (uMorphEnabled == 1) {
    // Shape is firmly anchored on the right; no rotation, no turntable spin, no wobble
    world = pos + uOffset;
  } else {
    world = uRotation * pos + uOffset + wobble;
  }

  // ===================================================
  // ЭФФЕКТ ОТТАЛКИВАНИЯ ЧАСТИЦ КУРСОРOM МЫШИ (PINTEREST)
  // ===================================================
  if (uMouseActive > 0.001) {
    vec3 dir = world - uMouse; // Направление вектора от мыши к частице
    float dist = length(dir);     // Физическое расстояние между ними
    float radius = 1.6;           // Радиус силового поля мыши (зона влияния)

    if (dist < radius && dist > 0.0001) {
      // Сила выталкивания: чем ближе частица к центру курсора, тем сильнее толчок
      float force = (radius - dist) / radius;
      force = pow(force, 2.0);  // Делаем эффект более мягким и упругим
      
      float pushStrength = 0.6; // Дистанция разлета партиклов в стороны
      
      // Сдвигаем частицу в сторону по вектору направления от мыши
      world += normalize(dir) * force * pushStrength * uMouseActive;
    }
  }
  // ===================================================
  float edge = 1.0;
  if (uMorphEnabled == 0 && (uDrift == 1 || uDrift == 2)) {
    float span = uSpread * 2.0 + 3.0;
    float k = mod(aRandom.w * span + uOffset.y + wobble.y + (uDrift == 1 ? uTravel : -uTravel), span);
    world.y = k - span * 0.5;
    edge = smoothstep(0.0, span * 0.12, k) * smoothstep(span, span * 0.88, k);
  } else if (uMorphEnabled == 0 && uDrift == 3) {
    float span = uSpread * ${DEPTH.toFixed(1)} * 2.0 + 3.0;
    float k = mod(aRandom.y * span + uOffset.z + wobble.z + uTravel, span);
    world.z = k - span * 0.5;
    edge = smoothstep(0.0, span * 0.1, k);
  }
  vec3 view = world - vec3(0.0, 0.0, uCamera);
  float dist = length(view);
  float ahead = -view.z;
  if (ahead < ${NEAR.toFixed(2)} || ahead > ${FAR.toFixed(1)}) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  edge *= smoothstep(1.0, 4.0, ahead);
  vec2 ndc = vec2(view.x * ${FOCAL.toFixed(6)} / uAspect, view.y * ${FOCAL.toFixed(6)}) / ahead;
  vec2 screen = (ndc * 0.5 + 0.5) * uView;

  vec2 shift = vec2(0.0);
  float flash = 0.0;
  float timeVal = uTime * 0.5;

  // Pointer interaction (repel / attract)
  if (uEffect != 0 && uPointer.z > 0.001) {
    vec2 delta = screen - uPointer.xy;
    float reach = length(delta);
    float falloff = exp(-dot(delta, delta) / (uPointer.w * uPointer.w));
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);
    shift += (uEffect == 1 ? away * uPointer.w * 0.5 : -delta * 0.6) * falloff * uStrength * uPointer.z;
  }

  // Click bursts
  for (int i = 0; i < ${MAX_BURSTS}; i++) {
    if (i >= uBurstCount) break;
    vec4 burst = uBursts[i];
    vec2 delta = screen - burst.xy;
    float reach = length(delta);
    float wave = exp(-pow((reach - burst.z * ${BURST_SPEED.toFixed(1)}) / ${BURST_WIDTH.toFixed(1)}, 2.0));
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);
    float fade = (1.0 - burst.z) * (1.0 - burst.z) * burst.w;
    shift += away * wave * fade * 56.0 * smoothstep(0.0, 30.0, reach);
    flash += wave * fade;
  }

  // Antigravity Google Breathing Aura Ring around active text (disabled during 3D process morphing)
  if (uMorphEnabled == 0 && uRingRadius > 0.001) {
    vec2 ringDelta = screen - uRingPos;
    float rDist = length(ringDelta);
    float normY = max(uView.y, 1.0);
    vec2 normPos = ringDelta / normY;

    float noise0 = snoise(vec3(normPos * 2.2 + vec2(18.4924, 72.9744), timeVal * 0.5));
    float rDistPerturbed = rDist + noise0 * 18.0;

    float tA = smoothstep(uRingRadius - uRingWidth * 2.0, uRingRadius, rDist)
             - smoothstep(uRingRadius, uRingRadius + uRingWidth, rDistPerturbed);
    float tB = smoothstep(uRingRadius - uRingWidth2 * 2.0, uRingRadius, rDist)
             - smoothstep(uRingRadius, uRingRadius + uRingWidth2, rDistPerturbed);
    float tC = smoothstep(uRingRadius + uRingWidth2, uRingRadius, rDist);

    tA = clamp(tA, 0.0, 1.0);
    tB = clamp(tB, 0.0, 1.0);
    tC = clamp(tC, 0.0, 1.0);

    float ringEnergy = pow(tA, 2.0) + pow(tB, 3.0) * 3.0 + tC * 0.35;
    ringEnergy += snoise(vec3(normPos * 14.0 + vec2(11.4924, 12.9744), timeVal * 0.5)) * tC * 0.4;

    float n1 = snoise(vec3(normPos * 3.5 + vec2(88.494, 32.4397), timeVal * 0.35));
    float n2 = snoise(vec3(normPos * 3.5 + vec2(50.904, 120.947), timeVal * 0.35));
    float n3 = snoise(vec3(normPos * 12.0 + vec2(18.4924, 72.9744), timeVal * 0.5));
    float n4 = snoise(vec3(normPos * 12.0 + vec2(50.904, 120.947), timeVal * 0.5));

    vec2 disp = vec2(n1, n2) * 24.0 + vec2(n3, n4) * 8.0;
    disp.x += sin(normPos.x * 16.0 + timeVal * 3.0) * 10.0 * clamp(rDist / normY, 0.0, 1.0);
    disp.y += cos(normPos.y * 16.0 + timeVal * 2.5) * 10.0 * clamp(rDist / normY, 0.0, 1.0);

    vec2 ringDir = rDist > 0.001 ? ringDelta / rDist : vec2(0.0, 1.0);
    shift += (ringDir * 50.0 + disp) * pow(tB, 0.75) * uRingDisplacement;
    flash += ringEnergy * 1.4;
  }

  // Antigravity Google Expanding Shockwave Ripples (disabled during 3D process morphing)
  if (uMorphEnabled == 0) {
    for (int w = 0; w < ${MAX_RING_WAVES}; w++) {
      if (w >= uRingWaveCount) break;
      vec4 wave = uRingWaves[w];
      vec2 wDelta = screen - wave.xy;
      float wDist = length(wDelta);
      float wReach = abs(wDist - wave.z);
      float wFactor = exp(-pow(wReach / ${RING_WAVE_WIDTH.toFixed(1)}, 2.0));
      if (wFactor > 0.001) {
        float nW = snoise(vec3((wDelta / 180.0) + vec2(18.4924, 72.9744), timeVal * 0.8));
        vec2 wAway = wDist > 0.001 ? wDelta / wDist : vec2(0.0, 1.0);
        vec2 wTang = vec2(-wAway.y, wAway.x);
        shift += (wAway * 45.0 + wTang * nW * 22.0) * wFactor * wave.w;
        flash += wFactor * wave.w * 1.8;
      }
    }
  }

  screen += shift;

  float diameter = (uRandomness <= 0.0 ? uSize : uSize * (1.0 + uRandomness * (aRandom.x - 0.5)) / dist) * (1.0 + min(flash, 1.0) * 0.6);
  float device = diameter * uRatio;
  float radius = max(diameter, 1.0 / uRatio) * 0.5;
  float coverage = min(1.0, device * device);
  float blur = uBlur * max(uFocus - dist, 0.0) / max(dist, 1.0);
  float halo = uGlow > 0.0 ? radius * 2.5 + 2.0 : 0.0;
  float extent = radius * (uShape == 3 ? 1.6 : 1.0) + blur + halo + 1.5;

  float twinkle = 1.0 - uTwinkle * 0.6 * (0.5 + 0.5 * sin(uTime * (6.0 + aRandom.y * 14.0) + aRandom.w * 40.0));
  float far = smoothstep(${FAR.toFixed(1)}, ${(FAR * 0.9).toFixed(1)}, ahead);
  float focus = radius / (radius + blur);
  float reveal = clamp(uReveal * 1.6 - aRandom.z * 0.6, 0.0, 1.0);
  vAlpha = min(1.0, coverage * twinkle * (1.0 + flash * 1.4)) * far * edge * max(focus, 0.35) * reveal * reveal;

  float isGlintFlag = 0.0;

  // Antigravity 3D Volumetric Lighting & Signature Diamond/Sapphire/Gold Aesthetic
  if (uMorphEnabled == 1) {
    blur = 0.0;
    float depthLight = clamp(0.78 + 0.32 * (world.z * 0.85 + world.y * 0.25), 0.62, 1.25);
    vec3 baseCol = vec3(1.0, 1.0, 1.0);

    bool isRedDot = (isAmbientType >= 0.135 && isAmbientType < 0.165);
    bool isYellowDot = (isAmbientType >= 0.185 && isAmbientType <= 0.195);
    bool isGreenDot = (isAmbientType >= 0.205 && isAmbientType < 0.245);
    bool isGoldStar = (isAmbientType >= 0.255 && isAmbientType <= 0.275);
    bool isTerminalGreen = (isAmbientType >= 0.285 && isAmbientType < 0.315);
    bool isSpinner = (isAmbientType >= 0.325 && isAmbientType < 0.380);
    bool isEdge = (isAmbientType >= 0.025 && isAmbientType < 0.065) || (isAmbientType < 0.025 && aRandom.y > 0.45);
    bool isSurface = (isAmbientType >= 0.065 && isAmbientType < 0.135) || (isAmbientType < 0.025 && aRandom.y <= 0.45);
    bool isAura = (isAmbientType > 0.40 && isAmbientType < 0.68);

    if (isRedDot) {
      // macOS Red Window Dot
      baseCol = vec3(1.0, 0.22, 0.20); // #FF3833
      radius = max(radius * 1.25, 2.3);
      halo = radius * 1.5 + 0.6;
      vAlpha = 1.0;
      extent = radius + halo + 1.8;
    } else if (isYellowDot) {
      // macOS Yellow Window Dot
      baseCol = vec3(1.0, 0.82, 0.12); // #FFD11F
      radius = max(radius * 1.25, 2.3);
      halo = radius * 1.5 + 0.6;
      vAlpha = 1.0;
      extent = radius + halo + 1.8;
    } else if (isGreenDot) {
      // macOS Green Window Dot
      baseCol = vec3(0.16, 0.92, 0.30); // #29EB4D
      radius = max(radius * 1.25, 2.3);
      halo = radius * 1.5 + 0.6;
      vAlpha = 1.0;
      extent = radius + halo + 1.8;
    } else if (isGoldStar) {
      // 5 Golden 3D Rating Stars for Stage 7 "Реліз та підтримка"
      // Rich luminous royal gold with radiant warm amber & bright incandescent core
      vec3 goldAmber = vec3(1.00, 0.72, 0.05); // #FFB80D
      vec3 goldHot   = vec3(1.00, 0.94, 0.45); // #FFF073
      vec3 goldBase  = mix(goldAmber, goldHot, aRandom.z * 0.6 + 0.2);

      // Shimmering light sweep wave washing across the 5 stars (from left to right)
      float sweep = sin(uTime * 2.2 - world.x * 1.8);
      float sweepGlaze = smoothstep(0.60, 0.98, sweep);
      baseCol = mix(goldBase, vec3(1.0, 1.0, 0.95), sweepGlaze * 0.75) * depthLight;

      radius = max(radius * (1.15 + sweepGlaze * 0.35), 2.1);
      halo = radius * 1.5 + 0.6;
      vAlpha = 1.0;
      extent = radius + halo + 1.8;
    } else if (isTerminalGreen) {
      // Glowing Neon Terminal Matrix Green for ">_ hello, world!!"
      vec3 greenHot = vec3(0.68, 1.00, 0.78);
      vec3 greenNeon = vec3(0.22, 0.98, 0.40); // #38FA66
      baseCol = mix(greenNeon, greenHot, aRandom.z * 0.45) * depthLight;
      radius = max(radius * 1.08, 1.95);
      halo = radius * 1.45 + 0.7;
      vAlpha = 1.0;
      extent = radius + halo + 1.7;
    } else if (isSpinner) {
      // 3D Apple Activity Indicator (Loading Spinner) for Stage 6 "Тестування"
      float spokeIdx = clamp(floor((isAmbientType - 0.328) / 0.004 + 0.5), 0.0, 11.0);

      // Step rotation like the macOS/iOS activity indicator (ticks every 1/12th of a revolution)
      float stepPhase = floor(fract(uTime * 1.5) * 12.0);
      float relSpoke = mod(spokeIdx - stepPhase + 12.0, 12.0);

      // Decay curve matching Apple's activity indicator:
      // Lead spoke (relSpoke = 0): maximum brightness & incandescent glow
      // Tail spoke (relSpoke = 11): faint, soft ambient opacity
      float decay = pow((11.0 - relSpoke) / 11.0, 1.4);
      float brightness = 0.18 + 0.82 * decay;

      // Color: Pure diamond white-silver with subtle incandescent core
      vec3 brightCol = vec3(1.00, 1.00, 1.00);
      vec3 faintCol  = vec3(0.38, 0.40, 0.46);
      baseCol = mix(faintCol, brightCol, brightness) * depthLight;

      radius = max(radius * (0.85 + 0.40 * decay), 1.6);
      halo = radius * (1.20 + 0.50 * decay) + 0.4;
      vAlpha = clamp(brightness * 1.25, 0.22, 1.0);
      extent = radius + halo + 1.5;
    } else if (isEdge) {
      // Radiant Glowing Diamond Pure White Wireframes / Ribs / Contours
      vec3 whiteWarm = vec3(1.00, 1.00, 1.00);
      vec3 whitePure = vec3(0.96, 0.98, 1.00);
      vec3 whiteHot  = vec3(1.00, 1.00, 1.00);
      vec3 edgeCol = mix(whitePure, whiteWarm, aRandom.z);
      if (aRandom.w > 0.55) {
        edgeCol = mix(edgeCol, whiteHot, 0.65);
      }
      baseCol = edgeCol * depthLight;
      radius = max(radius * 0.90, 1.7);
      halo = radius * 1.30 + 0.5;
      vAlpha = 1.0;
      extent = radius + halo + 1.4;
    } else if (isSurface) {
      // Crisp Luminous Pure White & Pearl Silver Facet Planes & Volume
      vec3 surfWhite  = vec3(0.96, 0.98, 1.00);
      vec3 surfBright = vec3(1.00, 1.00, 1.00);
      vec3 surfShade  = vec3(0.76, 0.80, 0.86);
      vec3 surfCol = mix(surfWhite, surfBright, aRandom.x);
      if (aRandom.z > 0.75) {
        surfCol = mix(surfCol, surfShade, 0.45);
      }
      baseCol = surfCol * depthLight;
      radius = max(radius * 0.72, 1.3);
      halo = radius * 1.15 + 0.3;
      vAlpha = clamp(vAlpha * 1.35, 0.90, 1.0);
      extent = radius + halo + 1.3;
    } else if (isAura) {
      // Ethereal surrounding aura (soft diamond white & silver mist)
      vec3 auraCol = mix(vec3(0.88, 0.92, 0.98), vec3(0.98, 0.99, 1.00), aRandom.w);
      baseCol = auraCol;
      radius = max(radius * 0.60, 1.0);
      halo = radius * 1.05 + 0.3;
      vAlpha *= 0.65;
      extent = radius + halo + 1.0;
    } else {
      // Fullscreen cosmic stardust (100% pure diamond white)
      vec3 dustCol = vec3(0.98, 0.99, 1.00);
      baseCol = dustCol;
      radius = max(radius * 0.50, 0.85);
      halo = radius * 0.7;
      vAlpha *= 0.75;
      extent = radius + halo + 0.8;
    }

    vColor = baseCol;
  } else {
    vec3 sheen = vec3(1.0, 1.0, 1.0);
    vColor = mix(aColor, sheen, min(flash, 1.0));
  }

  vLocal = aCorner * extent;
  vRadius = radius;
  vBlur = blur;
  vHalo = halo;
  vSeed = aRandom.y;
  vIsGlint = isGlintFlag;

  gl_Position = vec4((screen + aCorner * extent) / uView * 2.0 - 1.0, 0.0, 1.0);
}`;


  const PARTICLE_FRAGMENT = `#version 300 es
precision highp float;
precision highp int;
uniform int uShape;
uniform float uGlow;
uniform float uRatio;
uniform float uTime;
uniform float uSoft;
uniform float uShimmer;
uniform float uOpacity;
in vec2 vLocal;
in float vRadius;
in float vBlur;
in float vAlpha;
in float vHalo;
in float vSeed;
in vec3 vColor;
in float vIsGlint;
out vec4 outColor;

float ray(vec2 q, float aa) {
  float width = 0.14 * max(0.0, 1.0 - q.x);
  return (1.0 - smoothstep(width - aa, width + aa, q.y)) * step(q.x, 1.0);
}

void main() {
  float soft = vBlur + 0.7 / uRatio + vRadius * uSoft;
  float d = length(vLocal);
  float shape;

  if (uShape == 1) {
    float box = max(abs(vLocal.x), abs(vLocal.y));
    shape = 1.0 - smoothstep(vRadius * 0.86 - soft, vRadius * 0.86 + soft, box);
  } else if (uShape == 2) {
    float edge = max(vRadius * 0.22, 0.6 / uRatio);
    shape = 1.0 - smoothstep(edge - soft, edge + soft, abs(d - vRadius * 0.8));
  } else if (uShape == 3) {
    float reach = vRadius * 1.6;
    vec2 q = abs(vLocal) / max(reach, 0.0001);
    float aa = soft / max(reach, 0.0001);
    shape = max(max(ray(q, aa), ray(q.yx, aa)), 1.0 - smoothstep(vRadius * 0.32 - soft, vRadius * 0.32 + soft, d));
  } else {
    shape = 1.0 - smoothstep(vRadius - soft, vRadius + soft, d);
  }

  float halo = vHalo > 0.0 ? exp(-d / (vHalo * 0.40)) * max(uGlow, 0.80) * 0.35 : 0.0;
  float alpha = clamp(shape + halo * (1.0 - shape * 0.30), 0.0, 1.0) * vAlpha * uOpacity * (1.0 - uSoft);
  float shimmer = uShimmer * 0.15 * sin(uTime * 2.5 + vSeed * 6.28);
  vec3 color = clamp(vColor + vec3(shimmer), 0.0, 1.0);

  // Incandescent hot-white center core - creates the jewel / crystal luminescence seen in reference image
  float hotCore = smoothstep(vRadius * 0.42, 0.0, d);
  color = mix(color, vec3(1.0, 1.0, 1.0), hotCore * 0.65);

  outColor = vec4(color * alpha, alpha);
}`;

  const LINE_VERTEX = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aEnds;
layout(location = 2) in vec4 aTint;
uniform vec2 uView;
uniform float uRatio;
uniform float uWidth;
out float vAcross;
out float vHalf;
out vec4 vTint;

void main() {
  vec2 a = aEnds.xy;
  vec2 b = aEnds.zw;
  vec2 along = b - a;
  float span = max(length(along), 0.0001);
  vec2 normal = vec2(-along.y, along.x) / span;
  float reach = uWidth * 0.5 + 1.0 / uRatio;
  vec2 point = mix(a, b, aCorner.x * 0.5 + 0.5) + normal * aCorner.y * reach;
  vAcross = aCorner.y * reach;
  vHalf = uWidth * 0.5;
  vTint = aTint;
  gl_Position = vec4(point / uView * 2.0 - 1.0, 0.0, 1.0);
}`;

  const LINE_FRAGMENT = `#version 300 es
precision highp float;
uniform float uRatio;
uniform float uOpacity;
in float vAcross;
in float vHalf;
in vec4 vTint;
out vec4 outColor;

void main() {
  float edge = 0.6 / uRatio;
  float cover = 1.0 - smoothstep(vHalf - edge, vHalf + edge, abs(vAcross));
  float alpha = cover * vTint.a * uOpacity;
  outColor = vec4(vTint.rgb * alpha, alpha);
}`;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    console.error('Particle shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  };

  const link = (gl, vertexSource, fragmentSource) => {
    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Particle program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);
    }
    return { program, uniforms };
  };

  const seeded = seed => {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const wrap = (value, span) => ((value % span) + span) % span;

  function initParticles(container, userProps = {}) {
    if (!container) return;

    let canvas = container.querySelector('canvas.particles-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'particles-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      container.appendChild(canvas);
    }

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false
    });

    if (!gl) {
      console.warn('WebGL2 not supported, particles background disabled');
      return;
    }

    const palette = (Array.isArray(userProps.particleColors) ? userProps.particleColors : [userProps.particleColors || '#ffffff'])
      .filter(Boolean)
      .map(String);

    const settings = {
      count: clamp(Math.round(userProps.particleCount ?? 1810), 1, MAX_COUNT),
      spread: Math.max(0.1, userProps.particleSpread ?? 7),
      speed: userProps.speed ?? 0.05,
      colors: palette.length ? palette : ['#ffffff'],
      mouse: userProps.moveParticlesOnHover !== undefined ? userProps.moveParticlesOnHover : true,
      hoverFactor: Math.max(0, userProps.particleHoverFactor ?? 1),
      soft: !!userProps.alphaParticles,
      size: Math.max(0, userProps.particleBaseSize ?? 20),
      randomness: Math.max(0, userProps.sizeRandomness ?? 0.1),
      camera: Math.max(1, userProps.cameraDistance ?? 20),
      rotate: userProps.disableRotation !== undefined ? !userProps.disableRotation : true,
      dpr: userProps.pixelRatio,
      shape: SHAPES[userProps.shape] ?? 0,
      glow: Math.max(0, userProps.glow ?? 0),
      twinkle: clamp(userProps.twinkle ?? 0.1, 0, 1),
      depthOfField: Math.max(0, userProps.depthOfField ?? 0),
      connections: !!userProps.connections,
      connectionDistance: Math.max(10, userProps.connectionDistance ?? 110),
      hoverEffect: EFFECTS[userProps.hoverEffect] ?? 0,
      hoverRadius: Math.max(20, userProps.hoverRadius ?? 140),
      clickBurst: userProps.clickBurst !== undefined ? userProps.clickBurst : true,
      drift: DRIFTS[userProps.drift] ?? 0,
      driftSpeed: userProps.driftSpeed ?? 1,
      variation: Math.max(0, Math.round(userProps.variation ?? 2)),
      intro: userProps.intro !== undefined ? userProps.intro : false,
      opacity: clamp(userProps.opacity ?? 0.85, 0, 1),
      lightMode: !!userProps.lightMode,
      paused: !!userProps.paused
    };

    const dots = link(gl, PARTICLE_VERTEX, PARTICLE_FRAGMENT);
    const lines = link(gl, LINE_VERTEX, LINE_FRAGMENT);
    if (!dots || !lines) return;

    const corners = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const positionBuffer = gl.createBuffer();
    const randomBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    const dotVao = gl.createVertexArray();
    gl.bindVertexArray(dotVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const attach = (buffer, location, width) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, width, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(location, 1);
    };
    attach(positionBuffer, 1, 3);
    attach(randomBuffer, 2, 4);
    attach(colorBuffer, 3, 3);

    const lineBuffer = gl.createBuffer();
    const lineData = new Float32Array(MAX_LINES * 8);
    const lineVao = gl.createVertexArray();
    gl.bindVertexArray(lineVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, corners);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lineData.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 32, 16);
    gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);

    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const cache = new Map();
    const parse = value => {
      if (cache.has(value)) return cache.get(value);
      let rgb = [1, 1, 1];
      if (probe) {
        probe.clearRect(0, 0, 1, 1);
        probe.fillStyle = '#ffffff';
        probe.fillStyle = value;
        probe.fillRect(0, 0, 1, 1);
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
        rgb = [r / 255, g / 255, b / 255];
      }
      cache.set(value, rgb);
      return rgb;
    };
    const ink = rgb => {
      const linear = rgb.map(v => Math.pow(v, 2.2));
      const tone = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
      const depth = Math.min(1, 0.06 / Math.max(tone, 0.0001));
      return linear.map(v => Math.pow(v * depth, 1 / 2.2));
    };

    const view = { width: 1, height: 1, ratio: 1 };
    const pointer = { x: 0, y: 0, sx: 0, sy: 0, nx: 0, ny: 0, inside: false, active: 0 };
    const state = {
      clock: 0,
      spin: 0,
      travel: 0,
      offsetX: 0,
      offsetY: 0,
      reveal: settings.intro && !reduce ? 0 : 1
    };
    const bursts = [];
    const packedBursts = new Float32Array(MAX_BURSTS * 4);

    // 3D Mouse Repulsion (Pinterest-style) using THREE.Raycaster & Plane
    const hasThree = typeof THREE !== 'undefined';
    const mouse2D = hasThree ? new THREE.Vector2() : { x: 0, y: 0 };
    const mouse3D = hasThree ? new THREE.Vector3(999, 999, 999) : { x: 999, y: 999, z: 999 };
    const targetMouse3D = hasThree ? new THREE.Vector3(999, 999, 999) : { x: 999, y: 999, z: 999 };
    const raycaster = hasThree ? new THREE.Raycaster() : null;
    const plane = hasThree ? new THREE.Plane(new THREE.Vector3(0, 0, 1), 0) : null;
    let camera3D = null;
    if (hasThree) {
      camera3D = new THREE.PerspectiveCamera(15, 1.0, NEAR, FAR);
      camera3D.position.set(0, 0, settings.camera);
      camera3D.lookAt(0, 0, 0);
      camera3D.updateMatrixWorld();
    }
    let mouseActive = 0;
    let targetMouseActive = 0;

    // Antigravity Google ring aura & shockwave ripples
    const ringState = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      baseRadius: 150,
      width: 70,
      width2: 28,
      displacement: 1.0,
      initialized: false
    };
    const ringWaves = [];
    const packedRingWaves = new Float32Array(MAX_RING_WAVES * 4);

    const triggerAntigravityPulse = (x, y, strength = 1.0) => {
      const pulseX = x !== undefined ? x : (ringState.initialized ? ringState.targetX : view.width / 2);
      const pulseY = y !== undefined ? y : (ringState.initialized ? ringState.targetY : view.height / 2);
      ringWaves.push({
        x: pulseX,
        y: pulseY,
        age: 0,
        strength: clamp(strength, 0.3, 2.0)
      });
      if (ringWaves.length > MAX_RING_WAVES) ringWaves.shift();
      wake();
    };

    const setRingTarget = (x, y) => {
      ringState.targetX = x;
      ringState.targetY = y;
      if (!ringState.initialized) {
        ringState.x = x;
        ringState.y = y;
        ringState.initialized = true;
      }
      wake();
    };

    let morphTexture = null;
    let targetMorphProgress = userProps.morphProgress || 0.0;
    let morphProgress = targetMorphProgress;
    let targetMorphAnchorX = userProps.morphAnchorX !== undefined ? userProps.morphAnchorX : 1.6;
    let morphAnchorX = targetMorphAnchorX;
    let morphEnabled = userProps.enableMorph !== undefined ? !!userProps.enableMorph : true;

    const initMorphData = (customData) => {
      const geomProvider = typeof window !== 'undefined' ? (window.ProcessMorphGeometries || window.AntigravityMorphGeometries) : null;
      const data = customData || (geomProvider ? geomProvider.generateAllStages(settings.count) : null);
      if (!data) return;

      if (!morphTexture) {
        morphTexture = gl.createTexture();
      }
      gl.bindTexture(gl.TEXTURE_2D, morphTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const stagesCount = (geomProvider && geomProvider.STAGES_COUNT) || 7;
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA32F,
        settings.count,
        stagesCount,
        0,
        gl.RGBA,
        gl.FLOAT,
        data
      );
      gl.bindTexture(gl.TEXTURE_2D, null);
    };

    if (morphEnabled || userProps.morphStages) {
      initMorphData(userProps.morphStages);
    }

    const cloud = {
      key: '',
      count: 0,
      positions: new Float32Array(0),
      randoms: new Float32Array(0),
      colors: new Float32Array(0)
    };
    const screen = {
      x: new Float32Array(0),
      y: new Float32Array(0),
      ahead: new Float32Array(0),
      alpha: new Float32Array(0)
    };
    let raf = 0;
    let last = 0;
    let visible = true;

    const rebuild = s => {
      const key = `${s.count}|${s.variation}|${s.colors.join(',')}|${s.lightMode ? 1 : 0}`;
      if (key === cloud.key) return;
      cloud.key = key;
      const next = seeded(s.variation * 7919 + 1);
      const total = s.count;
      const positions = new Float32Array(total * 3);
      const randoms = new Float32Array(total * 4);
      const tints = new Float32Array(total * 3);
      const swatches = s.colors.map(value => (s.lightMode ? ink(parse(value)) : parse(value)));
      for (let i = 0; i < total; i++) {
        let x, y, z, len;
        do {
          x = next() * 2 - 1;
          y = next() * 2 - 1;
          z = next() * 2 - 1;
          len = x * x + y * y + z * z;
        } while (len > 1 || len === 0);
        const r = Math.cbrt(next());
        positions.set([x * r, y * r, z * r], i * 3);
        randoms.set([next(), next(), next(), next()], i * 4);
        tints.set(swatches[Math.floor(next() * swatches.length)], i * 3);
      }
      cloud.count = total;
      cloud.positions = positions;
      cloud.randoms = randoms;
      cloud.colors = tints;
      const linked = Math.min(total, MAX_LINKED);
      screen.x = new Float32Array(linked);
      screen.y = new Float32Array(linked);
      screen.ahead = new Float32Array(linked);
      screen.alpha = new Float32Array(linked);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, randomBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, randoms, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, tints, gl.STATIC_DRAW);
    };

    const rotationOf = s => {
      const elapsed = state.clock * 1000;
      const x = s.rotate ? Math.sin(elapsed * 0.0002) * 0.1 : 0;
      const y = s.rotate ? Math.cos(elapsed * 0.0005) * 0.15 : 0;
      const z = s.rotate ? state.spin : 0;
      const [sx, cx, sy, cy, sz, cz] = [Math.sin(x), Math.cos(x), Math.sin(y), Math.cos(y), Math.sin(z), Math.cos(z)];
      return [
        cy * cz + sy * sx * sz,
        cx * sz,
        -sy * cz + cy * sx * sz,
        -cy * sz + sy * sx * cz,
        cx * cz,
        sy * sz + cy * sx * cz,
        sy * cx,
        -sx,
        cy * cx
      ];
    };

    const offsetOf = () => [state.offsetX, state.offsetY, -(1 - easeOut(state.reveal)) * 70];

    const project = (s, matrix) => {
      const total = Math.min(cloud.count, MAX_LINKED);
      const [ox, oy, oz] = offsetOf();
      const aspect = view.width / view.height;
      const time = state.clock;
      const radius = s.hoverRadius;
      const active = s.hoverEffect !== 0 ? pointer.active : 0;
      const spanY = s.spread * 2 + 3;
      const spanZ = s.spread * DEPTH * 2 + 3;
      for (let i = 0; i < total; i++) {
        const px = cloud.positions[i * 3] * s.spread;
        const py = cloud.positions[i * 3 + 1] * s.spread;
        const pz = cloud.positions[i * 3 + 2] * s.spread * DEPTH;
        const r0 = cloud.randoms[i * 4];
        const r1 = cloud.randoms[i * 4 + 1];
        const r2 = cloud.randoms[i * 4 + 2];
        const r3 = cloud.randoms[i * 4 + 3];
        const bobX = Math.sin(time * r2 + 6.28 * r3) * (0.1 + 1.4 * r0);
        const bobY = Math.sin(time * r1 + 6.28 * r0) * (0.1 + 1.4 * r3);
        const bobZ = Math.sin(time * r3 + 6.28 * r1) * (0.1 + 1.4 * r2);
        const wx = matrix[0] * px + matrix[3] * py + matrix[6] * pz + ox + bobX;
        let wy = matrix[1] * px + matrix[4] * py + matrix[7] * pz + oy + bobY;
        let wz = matrix[2] * px + matrix[5] * py + matrix[8] * pz + oz + bobZ;
        let edge = 1;
        if (s.drift === 1 || s.drift === 2) {
          const k = wrap(r3 * spanY + oy + bobY + (s.drift === 1 ? state.travel : -state.travel), spanY);
          wy = k - spanY / 2;
          const low = clamp(k / (spanY * 0.12), 0, 1);
          const high = clamp((spanY - k) / (spanY * 0.12), 0, 1);
          edge = low * low * (3 - 2 * low) * high * high * (3 - 2 * high);
        } else if (s.drift === 3) {
          const k = wrap(r1 * spanZ + oz + bobZ + state.travel, spanZ);
          wz = k - spanZ / 2;
          const fresh = clamp(k / (spanZ * 0.1), 0, 1);
          edge = fresh * fresh * (3 - 2 * fresh);
        }
        const ahead = s.camera - wz;
        if (ahead < NEAR || ahead > FAR) {
          screen.alpha[i] = 0;
          continue;
        }
        const close = clamp((ahead - 1) / 3, 0, 1);
        edge *= close * close * (3 - 2 * close);
        let sx = ((wx * FOCAL) / aspect / ahead) * 0.5 * view.width + view.width / 2;
        let sy = ((wy * FOCAL) / ahead) * 0.5 * view.height + view.height / 2;
        let dx = 0;
        let dy = 0;
        if (active > 0.001) {
          const ex = sx - pointer.sx;
          const ey = sy - pointer.sy;
          const reach = Math.hypot(ex, ey);
          const falloff = Math.exp(-(ex * ex + ey * ey) / (radius * radius)) * s.hoverFactor * active;
          if (s.hoverEffect === 1 && reach > 0.001) {
            dx += (ex / reach) * radius * 0.5 * falloff;
            dy += (ey / reach) * radius * 0.5 * falloff;
          } else if (s.hoverEffect === 2) {
            dx -= ex * 0.6 * falloff;
            dy -= ey * 0.6 * falloff;
          }
        }
        for (const burst of bursts) {
          const progress = burst.age / BURST_SECONDS;
          const ex = sx - burst.x;
          const ey = sy - burst.y;
          const reach = Math.hypot(ex, ey);
          if (reach < 0.001) continue;
          const wave = Math.exp(-Math.pow((reach - progress * BURST_SPEED) / BURST_WIDTH, 2));
          const ramp = clamp(reach / 30, 0, 1);
          const push = wave * (1 - progress) * (1 - progress) * 56 * ramp * ramp * (3 - 2 * ramp);
          dx += (ex / reach) * push;
          dy += (ey / reach) * push;
        }
        sx += dx;
        sy += dy;
        const far = clamp((FAR - ahead) / (FAR - FAR * 0.9), 0, 1);
        const reveal = clamp(state.reveal * 1.6 - r2 * 0.6, 0, 1);
        screen.x[i] = sx;
        screen.y[i] = sy;
        screen.ahead[i] = ahead;
        screen.alpha[i] = far * far * (3 - 2 * far) * edge * reveal * reveal;
      }
      return total;
    };

    const buildLines = (s, matrix) => {
      const total = project(s, matrix);
      const reach = s.connectionDistance;
      const columns = Math.max(1, Math.ceil(view.width / reach) + 2);
      const buckets = new Map();
      for (let i = 0; i < total; i++) {
        if (screen.alpha[i] < 0.02) continue;
        const key = (Math.floor(screen.y[i] / reach) + 1) * columns + Math.floor(screen.x[i] / reach) + 1;
        const bucket = buckets.get(key);
        if (bucket) bucket.push(i);
        else buckets.set(key, [i]);
      }
      let lineCount = 0;
      const limit = reach * reach;
      for (const [key, members] of buckets) {
        for (const offset of [0, 1, columns - 1, columns, columns + 1]) {
          const others = offset === 0 ? members : buckets.get(key + offset);
          if (!others) continue;
          for (let a = 0; a < members.length; a++) {
            const i = members[a];
            for (let b = offset === 0 ? a + 1 : 0; b < others.length; b++) {
              const j = others[b];
              const dx = screen.x[i] - screen.x[j];
              const dy = screen.y[i] - screen.y[j];
              const gap = dx * dx + dy * dy;
              if (gap > limit) continue;
              const layer = clamp(1 - Math.abs(screen.ahead[i] - screen.ahead[j]) / 18, 0, 1);
              if (layer <= 0) continue;
              if (lineCount >= MAX_LINES) return lineCount;
              const fade = 1 - Math.sqrt(gap) / reach;
              const base = lineCount * 8;
              lineData[base] = screen.x[i];
              lineData[base + 1] = screen.y[i];
              lineData[base + 2] = screen.x[j];
              lineData[base + 3] = screen.y[j];
              lineData[base + 4] = (cloud.colors[i * 3] + cloud.colors[j * 3]) / 2;
              lineData[base + 5] = (cloud.colors[i * 3 + 1] + cloud.colors[j * 3 + 1]) / 2;
              lineData[base + 6] = (cloud.colors[i * 3 + 2] + cloud.colors[j * 3 + 2]) / 2;
              lineData[base + 7] = fade * fade * layer * 0.7 * Math.min(screen.alpha[i], screen.alpha[j]);
              lineCount++;
            }
          }
        }
      }
      return lineCount;
    };

    const render = () => {
      const s = settings;
      rebuild(s);
      const matrix = rotationOf(s);
      const [ox, oy, oz] = offsetOf();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      if (s.connections) {
        const lineCount = buildLines(s, matrix);
        if (lineCount) {
          gl.useProgram(lines.program);
          gl.bindVertexArray(lineVao);
          gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineData.subarray(0, lineCount * 8));
          gl.uniform2f(lines.uniforms.uView, view.width, view.height);
          gl.uniform1f(lines.uniforms.uRatio, view.ratio);
          gl.uniform1f(lines.uniforms.uWidth, 1);
          gl.uniform1f(lines.uniforms.uOpacity, s.opacity);
          gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, lineCount);
        }
      }

      const u = dots.uniforms;
      let burstCount = 0;
      for (let i = bursts.length - 1; i >= 0 && burstCount < MAX_BURSTS; i--) {
        packedBursts.set([bursts[i].x, bursts[i].y, bursts[i].age / BURST_SECONDS, 1], burstCount * 4);
        burstCount++;
      }

      let waveCount = 0;
      for (let i = ringWaves.length - 1; i >= 0 && waveCount < MAX_RING_WAVES; i--) {
        const w = ringWaves[i];
        const progress = w.age / RING_WAVE_SECONDS;
        const radius = progress * RING_WAVE_SPEED;
        const fade = (1 - progress) * (1 - progress) * w.strength;
        packedRingWaves.set([w.x, w.y, radius, fade], waveCount * 4);
        waveCount++;
      }

      const engaged = s.mouse && pointer.inside && !reduce && !morphEnabled;
      const mouseBiasX = engaged ? (pointer.sx - view.width / 2) * 0.07 : 0;
      const mouseBiasY = engaged ? (pointer.sy - view.height / 2) * 0.07 : 0;
      const ringActiveX = ringState.x + mouseBiasX;
      const ringActiveY = ringState.y + mouseBiasY;
      const currentRadius = ringState.baseRadius + Math.sin(state.clock * 1.5) * 12.0 + Math.cos(state.clock * 3.2) * 7.0;

      gl.useProgram(dots.program);
      gl.bindVertexArray(dotVao);
      gl.uniformMatrix3fv(u.uRotation, false, matrix);
      gl.uniform3f(u.uOffset, ox, oy, oz);
      gl.uniform1f(u.uSpread, s.spread);
      gl.uniform1f(u.uTime, state.clock);
      gl.uniform1f(u.uCamera, s.camera);
      gl.uniform1f(u.uAspect, view.width / view.height);
      gl.uniform2f(u.uView, view.width, view.height);
      gl.uniform1f(u.uRatio, view.ratio);
      gl.uniform1f(u.uSize, s.size);
      gl.uniform1f(u.uRandomness, s.randomness);
      gl.uniform1f(u.uBlur, s.depthOfField * 14);
      gl.uniform1f(u.uFocus, s.camera + 14);
      gl.uniform1f(u.uGlow, s.lightMode ? s.glow * 0.3 : s.glow);
      gl.uniform1f(u.uTwinkle, s.twinkle);
      gl.uniform1i(u.uShape, s.shape);
      gl.uniform1i(u.uDrift, s.drift);
      gl.uniform1f(u.uTravel, state.travel);
      gl.uniform4f(u.uPointer, pointer.sx, pointer.sy, pointer.active, s.hoverRadius);
      gl.uniform1i(u.uEffect, s.hoverEffect);
      gl.uniform1f(u.uStrength, s.hoverFactor);
      gl.uniform4fv(u.uBursts, packedBursts);
      gl.uniform1i(u.uBurstCount, burstCount);

      if (u.uRingPos) gl.uniform2f(u.uRingPos, ringActiveX, ringActiveY);
      if (u.uRingRadius) gl.uniform1f(u.uRingRadius, currentRadius);
      if (u.uRingWidth) gl.uniform1f(u.uRingWidth, ringState.width);
      if (u.uRingWidth2) gl.uniform1f(u.uRingWidth2, ringState.width2);
      if (u.uRingDisplacement) gl.uniform1f(u.uRingDisplacement, ringState.displacement);
      if (u.uRingWaves) gl.uniform4fv(u.uRingWaves, packedRingWaves);
      if (u.uRingWaveCount) gl.uniform1i(u.uRingWaveCount, waveCount);

      if (morphTexture && morphEnabled) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, morphTexture);
        if (u.uMorphTexture) gl.uniform1i(u.uMorphTexture, 0);
      }
      if (u.uMorphProgress) gl.uniform1f(u.uMorphProgress, morphProgress);
      if (u.uMorphAnchorX) gl.uniform1f(u.uMorphAnchorX, morphAnchorX);
      if (u.uMorphEnabled) gl.uniform1i(u.uMorphEnabled, morphEnabled ? 1 : 0);

      if (u.uMouse) gl.uniform3f(u.uMouse, mouse3D.x, mouse3D.y, mouse3D.z);
      if (u.uMouseActive) gl.uniform1f(u.uMouseActive, mouseActive);

      gl.uniform1f(u.uReveal, state.reveal);
      gl.uniform1f(u.uSoft, s.soft ? 0.2 : 0);
      gl.uniform1f(u.uShimmer, s.lightMode ? 0 : 1);
      gl.uniform1f(u.uOpacity, s.opacity);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, cloud.count);
      gl.bindVertexArray(null);
    };

    const frame = now => {
      raf = 0;
      if (!visible || document.hidden) return;
      const s = settings;
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;
      last = now;

      // Smooth 3D mouse repulsion active state and coordinates interpolation
      mouseActive += (targetMouseActive - mouseActive) * (1 - Math.exp(-dt / 0.08));
      if (hasThree && mouse3D.lerp) {
        mouse3D.lerp(targetMouse3D, 1 - Math.exp(-dt / 0.05));
      } else {
        mouse3D.x += (targetMouse3D.x - mouse3D.x) * (1 - Math.exp(-dt / 0.05));
        mouse3D.y += (targetMouse3D.y - mouse3D.y) * (1 - Math.exp(-dt / 0.05));
        mouse3D.z += (targetMouse3D.z - mouse3D.z) * (1 - Math.exp(-dt / 0.05));
      }
      if (s.paused) {
        state.reveal = 1;
        render();
        last = 0;
        return;
      }
      const motion = reduce ? 0 : 1;
      const pace = dt * s.speed * motion;
      state.clock += pace;
      if (s.rotate) state.spin += pace * 0.6;
      state.travel += dt * s.driftSpeed * motion * (s.drift === 3 ? 6 : 0.9);

      const engaged = s.mouse && pointer.inside && !reduce;
      const follow = 1 - Math.exp(-dt / 0.35);
      const parallax = engaged && s.hoverEffect === 0 ? s.hoverFactor : 0;
      state.offsetX += (-pointer.nx * parallax - state.offsetX) * follow;
      state.offsetY += (-pointer.ny * parallax - state.offsetY) * follow;
      pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt / 0.06));
      pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt / 0.06));
      pointer.active += ((engaged ? 1 : 0) - pointer.active) * (1 - Math.exp(-dt / 0.2));

      // Glide Antigravity ring center smoothly towards target heading
      const ringFollow = 1 - Math.exp(-dt / 0.16);
      ringState.x += (ringState.targetX - ringState.x) * ringFollow;
      ringState.y += (ringState.targetY - ringState.y) * ringFollow;

      // Smoothly interpolate morphProgress towards targetMorphProgress for buttery, cinematic materialization
      const morphFollow = 1 - Math.exp(-dt / 0.35);
      if (Math.abs(targetMorphProgress - morphProgress) > 0.0001) {
        morphProgress += (targetMorphProgress - morphProgress) * morphFollow;
      } else {
        morphProgress = targetMorphProgress;
      }

      // Smoothly interpolate morphAnchorX towards targetMorphAnchorX
      const anchorFollow = 1 - Math.exp(-dt / 0.30);
      if (Math.abs(targetMorphAnchorX - morphAnchorX) > 0.0001) {
        morphAnchorX += (targetMorphAnchorX - morphAnchorX) * anchorFollow;
      } else {
        morphAnchorX = targetMorphAnchorX;
      }

      // Update active shockwave ripples
      for (let i = ringWaves.length - 1; i >= 0; i--) {
        ringWaves[i].age += dt;
        if (ringWaves[i].age >= RING_WAVE_SECONDS) ringWaves.splice(i, 1);
      }

      for (let i = bursts.length - 1; i >= 0; i--) {
        bursts[i].age += dt;
        if (bursts[i].age >= BURST_SECONDS) bursts.splice(i, 1);
      }

      if (!s.intro || reduce) state.reveal = 1;
      else if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);

      render();
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      const width = Math.max(1, container.clientWidth || window.innerWidth);
      const height = Math.max(1, container.clientHeight || window.innerHeight);
      const ratio = Math.min(settings.dpr || window.devicePixelRatio || 1, 2);
      view.width = width;
      view.height = height;
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      view.ratio = canvas.width / width;

      if (!ringState.initialized) {
        ringState.x = width / 2;
        ringState.y = height / 2;
        ringState.targetX = width / 2;
        ringState.targetY = height / 2;
      }
      ringState.baseRadius = clamp(Math.min(width, height) * 0.22, 120, 260);
      ringState.width = clamp(Math.min(width, height) * 0.08, 45, 90);
      ringState.width2 = clamp(Math.min(width, height) * 0.035, 18, 40);

      render();
      wake();
    };

    const locate = event => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const wasInside = pointer.inside;
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      pointer.x = x;
      pointer.y = rect.height - y;
      pointer.nx = (x / Math.max(1, rect.width)) * 2 - 1;
      pointer.ny = -((y / Math.max(1, rect.height)) * 2 - 1);
      if (pointer.inside && !wasInside) {
        pointer.sx = pointer.x;
        pointer.sy = pointer.y;
      }

      if (pointer.inside) {
        targetMouseActive = 1.0;
        if (hasThree && raycaster && camera3D && plane) {
          mouse2D.x = pointer.nx;
          mouse2D.y = pointer.ny;
          camera3D.aspect = rect.width / Math.max(1, rect.height);
          camera3D.updateProjectionMatrix();
          camera3D.updateMatrixWorld();
          raycaster.setFromCamera(mouse2D, camera3D);
          raycaster.ray.intersectPlane(plane, targetMouse3D);
        } else {
          const aspect = rect.width / Math.max(1, rect.height);
          targetMouse3D.x = pointer.nx * aspect * settings.camera / FOCAL;
          targetMouse3D.y = pointer.ny * settings.camera / FOCAL;
          targetMouse3D.z = 0.0;
        }
      } else {
        targetMouseActive = 0.0;
      }
    };

    const onPointerMove = event => {
      locate(event);
      if (!settings.paused) wake();
    };

    const onPointerDown = event => {
      locate(event);
      if (!pointer.inside || !settings.clickBurst || settings.paused || reduce) return;
      bursts.push({ x: pointer.x, y: pointer.y, age: 0 });
      if (bursts.length > MAX_BURSTS) bursts.shift();
      triggerAntigravityPulse(pointer.x, pointer.y, 0.85);
      wake();
    };

    const onPointerUp = event => {
      if (event.pointerType !== 'mouse') {
        pointer.inside = false;
        targetMouseActive = 0.0;
      }
    };

    const onPointerLeave = () => {
      pointer.inside = false;
      targetMouseActive = 0.0;
    };

    const onVisibility = () => {
      last = 0;
      wake();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener('resize', resize, { passive: true });

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);

    resize();
    wake();

    return {
      pause: () => {
        settings.paused = true;
        cancelAnimationFrame(raf);
        raf = 0;
      },
      resume: () => {
        if (!settings.paused) return;
        settings.paused = false;
        wake();
      },
      triggerAntigravityPulse,
      setRingTarget,
      setMorphProgress: (val, immediate = false) => {
        targetMorphProgress = typeof val === 'number' ? val : 0;
        if (immediate) {
          morphProgress = targetMorphProgress;
        }
        wake();
      },
      setMorphEnabled: (val) => {
        morphEnabled = !!val;
        if (morphEnabled && !morphTexture) {
          initMorphData();
        }
        wake();
      },
      loadMorphStages: (data) => {
        initMorphData(data);
        wake();
      },
      getMorphProgress: () => morphProgress,
      setMorphAnchorX: (val, immediate = false) => {
        targetMorphAnchorX = typeof val === 'number' ? val : 1.6;
        if (immediate) {
          morphAnchorX = targetMorphAnchorX;
        }
        wake();
      },
      getMorphAnchorX: () => morphAnchorX,
      material: {
        uniforms: {
          uMouse: {
            value: targetMouse3D
          },
          uMouseActive: {
            value: 1.0
          }
        }
      },
      setMouse3D: (x, y, z) => {
        targetMouse3D.x = x;
        targetMouse3D.y = y;
        targetMouse3D.z = z !== undefined ? z : 0;
        targetMouseActive = 1.0;
        wake();
      },
      destroy: () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        window.removeEventListener('resize', resize);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        document.documentElement.removeEventListener('pointerleave', onPointerLeave);
        document.removeEventListener('visibilitychange', onVisibility);
        if (morphTexture) gl.deleteTexture(morphTexture);
        gl.deleteProgram(dots.program);
        gl.deleteProgram(lines.program);
        [corners, positionBuffer, randomBuffer, colorBuffer, lineBuffer].forEach(buffer => gl.deleteBuffer(buffer));
        gl.deleteVertexArray(dotVao);
        gl.deleteVertexArray(lineVao);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    };
    window.myAntigravityMaterial = instance.material;
    return instance;
  }

  // Export globally
  window.initParticles = initParticles;
  window.__triggerAntigravityPulse = (x, y, s) => {
    const container = document.getElementById('particles-background');
    if (container && container._particles && container._particles.triggerAntigravityPulse) {
      container._particles.triggerAntigravityPulse(x, y, s);
    }
  };

  // Auto-init on DOMContentLoaded if #particles-background exists
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('particles-background');
    if (container) {
      const pInstance = initParticles(container, {
        particleColors: ['#ffffff'],
        particleCount: 820,
        particleSpread: 7,
        speed: 0.1,
        particleBaseSize: 20,
        glow: 0.35,
        twinkle: 0.25,
        moveParticlesOnHover: true,
        hoverEffect: 'repel',
        hoverFactor: 0.65,
        driftSpeed: 1.1
      });
      container._particles = pInstance;
    }
  });
})();
