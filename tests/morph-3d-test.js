import assert from 'node:assert';
import test from 'node:test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const morphGeom = require('../scripts/process-morph-geometries.js');

test('Antigravity 3D Morphing Geometries Test', (t) => {
  assert.strictEqual(morphGeom.STAGES_COUNT, 8, 'Must define exactly 8 stages (Start screen + 7 steps)');
  assert.strictEqual(morphGeom.STAGES_CONTENT.length, 8, 'Must have 8 stage content descriptors');

  // Verify Start screen (Stage 0)
  const startStage = morphGeom.STAGES_CONTENT[0];
  assert.strictEqual(startStage.isStart, true, 'Stage 0 must be marked isStart');
  assert.strictEqual(startStage.title, 'Етапи розробки', 'Stage 0 title must be Етапи розробки');
  assert.strictEqual(startStage.side, 'right', 'Stage 0 3D element must be on the right');

  const expectedTitles = [
    'Обговорення ідеї',
    'Створення прототипу',
    'Дизайн',
    'WEB-програмування',
    'SEO-підготовка',
    'Тестування',
    'Реліз та підтримка'
  ];

  morphGeom.STAGES_CONTENT.slice(1).forEach((stage, idx) => {
    assert.strictEqual(stage.title, expectedTitles[idx], `Stage ${idx + 1} title must match requirement`);
    assert.ok(stage.description && stage.description.length > 20, `Stage ${idx + 1} must have full Ukrainian description`);
    assert.ok(stage.stepNumber, `Stage ${idx + 1} must have stepNumber`);
    assert.ok(stage.shapeName, `Stage ${idx + 1} must have shapeName`);
    assert.ok(stage.side === 'left' || stage.side === 'right', `Stage ${idx + 1} must have side alternating left/right`);
  });

  const count = 1470;
  const data = morphGeom.generateAllStages(count);
  assert.strictEqual(data.length, count * 8 * 4, 'Data texture array must be [count x 8 x 4]');

  let hasNan = false;
  for (let i = 0; i < data.length; i++) {
    if (isNaN(data[i]) || !isFinite(data[i])) {
      hasNan = true;
      break;
    }
  }
  assert.strictEqual(hasNan, false, 'Generated coordinates must be valid finite numbers');
});

test('Antigravity Shader & GSAP Integration Verification', (t) => {
  const particlesJs = fs.readFileSync('scripts/particles.js', 'utf-8');
  assert.ok(particlesJs.includes('uMorphTexture'), 'particles.js must contain uMorphTexture sampler uniform');
  assert.ok(particlesJs.includes('uMorphProgress'), 'particles.js must contain uMorphProgress uniform');
  assert.ok(particlesJs.includes('texelFetch(uMorphTexture'), 'particles.js must sample morph coordinates via texelFetch');
  assert.ok(particlesJs.includes('snoise('), 'particles.js must apply 3D Simplex noise turbulence');
  assert.ok(particlesJs.includes('setMorphProgress'), 'particles.js must expose setMorphProgress API');

  const terminalJs = fs.readFileSync('scripts/terminal.js', 'utf-8');
  assert.ok(terminalJs.includes('wc-particles-fullscreen'), 'terminal.js must mount to #wc-particles-fullscreen');
  assert.ok(terminalJs.includes('scrub: true'), 'terminal.js must configure GSAP ScrollTrigger with scrub: true');
  assert.ok(terminalJs.includes('snap:'), 'terminal.js must configure stage snapping');
  assert.ok(terminalJs.includes('moveParticlesOnHover: true'), 'terminal.js must enable cursor reaction on hover');
  assert.ok(terminalJs.includes('pin: true'), 'terminal.js must configure GSAP ScrollTrigger with pin: true');
  assert.ok(terminalJs.includes('pinSpacing: true'), 'terminal.js must configure pinSpacing: true to prevent overlapping lower sections');

  const terminalCss = fs.readFileSync('styles/terminal.css', 'utf-8');
  assert.ok(terminalCss.includes('.wc-particles-fullscreen-section'), 'terminal.css must define .wc-particles-fullscreen-section');
  assert.ok(terminalCss.includes('.wc-morph-hud-overlay'), 'terminal.css must style .wc-morph-hud-overlay');
  assert.ok(terminalCss.includes('.pin-spacer-wc-particles-pin'), 'terminal.css must style .pin-spacer-wc-particles-pin');
});
