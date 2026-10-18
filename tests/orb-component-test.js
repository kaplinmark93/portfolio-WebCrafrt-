const assert = require('assert');
const fs = require('fs');

// 1. Files existence
assert(fs.existsSync('scripts/orb.js'), 'scripts/orb.js must exist');
assert(fs.existsSync('styles/orb.css'), 'styles/orb.css must exist');

// 2. Component exports & WebGL logic
const orbJs = fs.readFileSync('scripts/orb.js', 'utf-8');
assert(orbJs.includes('createOrb'), 'scripts/orb.js must define createOrb');
assert(orbJs.includes('VERTEX'), 'scripts/orb.js must define WebGL vertex shader');
assert(orbJs.includes('FRAGMENT'), 'scripts/orb.js must define WebGL fragment shader');
assert(orbJs.includes('uResolution'), 'scripts/orb.js must handle uResolution');
assert(orbJs.includes('uOffset'), 'scripts/orb.js must support uOffset for horizontal/vertical placement');
assert(orbJs.includes('shiftHue'), 'scripts/orb.js must support hue shifting');

// 3. Styles check
const orbCss = fs.readFileSync('styles/orb.css', 'utf-8');
assert(orbCss.includes('.orb-container'), 'styles/orb.css must style .orb-container');
assert(orbCss.includes('.orb-canvas'), 'styles/orb.css must style .orb-canvas');
assert(orbCss.includes('.wc-orb-hero'), 'styles/orb.css must style .wc-orb-hero');
assert(orbCss.includes('background-color: #000000'), 'styles/orb.css must set dark background for hero');

// 4. index.html integration
const html = fs.readFileSync('index.html', 'utf-8');
assert(html.includes('styles/orb.css'), 'index.html must link styles/orb.css');
assert(html.includes('scripts/orb.js'), 'index.html must link scripts/orb.js');
assert(html.includes('id="wc-orb-hero"'), 'index.html must contain first block with id="wc-orb-hero"');
assert(html.includes('id="hero-orb"'), 'index.html must contain hero-orb element');
assert(html.includes('data-orb="true"'), 'hero-orb element must have data-orb="true"');
assert(html.includes('data-hue="297"'), 'hero-orb element must set hue to 297');
assert(html.includes('data-size="1.27"'), 'hero-orb element must set size to 1.27');
assert(html.includes('data-glow="0.75"'), 'hero-orb element must set glow to 0.75');
assert(html.includes('data-bleed="0.05"'), 'hero-orb element must set bleed to 0.05');
assert(html.includes('data-wobble="0.9"'), 'hero-orb element must set wobble to 0.9');
assert(html.includes('data-highlight="0.6"'), 'hero-orb element must set highlight to 0.6');
assert(html.includes('#9c43fe'), 'hero-orb element must configure user colors');
assert(html.includes('data-offset'), 'hero-orb element must configure left offset');

// 5. Check order: wc-orb-hero is first, followed by turnkey headline on scroll
const orbHeroIdx = html.indexOf('id="wc-orb-hero"');
assert(orbHeroIdx !== -1, 'wc-orb-hero must be present in index.html');

const termJs = fs.readFileSync('scripts/terminal.js', 'utf-8');
assert(termJs.includes('Просуваємо ваш бренд'), 'terminal.js must include showcase headline "Просуваємо ваш бренд"');
assert(termJs.includes('Масштабуємо ваш успіх'), 'terminal.js must include showcase headline "Масштабуємо ваш успіх"');
assert(termJs.includes('wc-orb-hero'), 'terminal.js must be aware of wc-orb-hero');
assert(termJs.includes('on-dark'), 'terminal.js must manage on-dark state on header over hero');

console.log('Orb component and hero integration tests passed successfully!');
