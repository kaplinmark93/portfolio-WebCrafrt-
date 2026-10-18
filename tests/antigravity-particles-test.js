const assert = require('assert');
const fs = require('fs');

const particlesCode = fs.readFileSync('scripts/particles.js', 'utf-8');
const storyHeroCode = fs.readFileSync('scripts/story-hero.js', 'utf-8');

// 1. Antigravity particle system physics & shader uniforms
assert(particlesCode.includes('snoise(vec3 v)'), 'particles.js must contain 3D Simplex noise function');
assert(particlesCode.includes('uRingPos'), 'particles.js must declare uRingPos uniform');
assert(particlesCode.includes('uRingRadius'), 'particles.js must declare uRingRadius uniform');
assert(particlesCode.includes('uRingWidth'), 'particles.js must declare uRingWidth uniform');
assert(particlesCode.includes('uRingDisplacement'), 'particles.js must declare uRingDisplacement uniform');
assert(particlesCode.includes('uRingWaves'), 'particles.js must declare uRingWaves uniform array');
assert(particlesCode.includes('triggerAntigravityPulse'), 'particles.js must expose triggerAntigravityPulse method');
assert(particlesCode.includes('setRingTarget'), 'particles.js must expose setRingTarget method');
assert(particlesCode.includes('#38bdf8'), 'particles.js must include Antigravity electric cyan palette');
assert(particlesCode.includes('#818cf8'), 'particles.js must include Antigravity violet sheen');

// 2. Story hero step emergence triggers
assert(storyHeroCode.includes('triggerStepParticleEffect'), 'story-hero.js must define triggerStepParticleEffect');
assert(storyHeroCode.includes('getActiveStepIndex'), 'story-hero.js must define getActiveStepIndex');
assert(storyHeroCode.includes('triggerAntigravityPulse'), 'story-hero.js must invoke triggerAntigravityPulse on particles');
assert(storyHeroCode.includes('setRingTarget'), 'story-hero.js must invoke setRingTarget on particles');

console.log('Antigravity hero particles test passed successfully!');
