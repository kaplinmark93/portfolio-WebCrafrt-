/**
 * SmokeType and Expertise Block Verification Test
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('Testing SmokeType component and Expertise block optimization...');

// 1. Verify SmokeType script exists and exports properly
const smokeTypeJs = fs.readFileSync(path.join(__dirname, '../scripts/smoke-type.js'), 'utf8');
assert(smokeTypeJs.includes('createSmokeType'), 'smoke-type.js must define createSmokeType');
assert(smokeTypeJs.includes('SmokeType'), 'smoke-type.js must expose SmokeType');
assert(smokeTypeJs.includes('is-condensing'), 'smoke-type.js must utilize is-condensing class');
assert(smokeTypeJs.includes('is-dissolving'), 'smoke-type.js must utilize is-dissolving class');

// 2. Verify SmokeType is included in index.html
const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
assert(indexHtml.includes('scripts/smoke-type.js'), 'index.html must include scripts/smoke-type.js');

// 3. Verify terminal.js uses single dynamic title with SmokeType and no lag-inducing pill recreation
const terminalJs = fs.readFileSync(path.join(__dirname, '../scripts/terminal.js'), 'utf8');
assert(terminalJs.includes('wc-exp-smoke-title-root'), 'terminal.js must render single smoke title root');
assert(!terminalJs.includes('updateActiveCardPills'), 'terminal.js must remove lag-inducing updateActiveCardPills');
assert(terminalJs.includes('window.SmokeType'), 'terminal.js must initialize window.SmokeType');
assert(terminalJs.includes('auroraInst.pause()'), 'terminal.js must pause Aurora WebGL loop when card 06 is inactive');

// 4. Verify terminal.css contains SmokeType styles and hardware acceleration
const terminalCss = fs.readFileSync(path.join(__dirname, '../styles/terminal.css'), 'utf8');
assert(terminalCss.includes('@keyframes smokeCondense'), 'terminal.css must define @keyframes smokeCondense');
assert(terminalCss.includes('@keyframes smokeDissolve'), 'terminal.css must define @keyframes smokeDissolve');
assert(terminalCss.includes('.smoke-type-char'), 'terminal.css must style .smoke-type-char');
assert(terminalCss.includes('.wc-exp-single-container'), 'terminal.css must style .wc-exp-single-container');
assert(terminalCss.includes('will-change: transform, opacity;'), 'terminal.css must hardware accelerate .card-swap-slot');

console.log('SmokeType and Expertise block optimization tests passed successfully!');
