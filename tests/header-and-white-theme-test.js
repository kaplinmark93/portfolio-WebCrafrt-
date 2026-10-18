const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf-8');
const termCss = fs.readFileSync('styles/terminal.css', 'utf-8');
const mainCss = fs.readFileSync('styles/main.css', 'utf-8');
const termJs = fs.readFileSync('scripts/terminal.js', 'utf-8');
const storyJs = fs.readFileSync('scripts/story-hero.js', 'utf-8');

// 1. Header HTML checks
assert(html.includes('id="header"'), 'index.html must have header element');
assert(html.includes('WebCraft'), 'Header must contain WebCraft brand name');
assert(html.includes('id="header-discuss-panel"'), 'Header must include discuss panel');
assert(html.includes('id="header-discuss-btn"'), 'Header must include discuss project button');
assert(html.includes('Стати клієнтом'), 'Header button must say "Стати клієнтом"');
assert(!html.includes('header-messengers'), 'Header messenger icons must be removed');
assert(html.includes('specular-button'), 'Header button must have specular-button class');
assert(html.includes('specular-button__light'), 'Header button must have specular-button__light canvas');
assert(html.includes('styles/specular-button.css'), 'index.html must link specular-button.css');
assert(html.includes('scripts/specular-button.js'), 'index.html must link specular-button.js');
assert(fs.existsSync('styles/specular-button.css'), 'styles/specular-button.css must exist');
assert(fs.existsSync('scripts/specular-button.js'), 'scripts/specular-button.js must exist');
assert(fs.readFileSync('scripts/specular-button.js', 'utf-8').includes('createSpecularButton'), 'specular-button.js must define createSpecularButton');

// 2. White theme background checks for the revealed site section
const revealBlock = termCss.slice(termCss.indexOf('.wc-reveal-section {'), termCss.indexOf('.wc-reveal-container {'));
assert(revealBlock.includes('background: #FFFFFF') || revealBlock.includes('background: #ffffff'), 'Revealed section must have white background');
assert(revealBlock.includes('color: #0F172A') || revealBlock.includes('color: #000000'), 'Revealed section must have dark text');

// 3. Launch overlay must have white background
const overlayIdx = termCss.indexOf('.wc-launch-overlay {');
assert(overlayIdx !== -1, 'terminal.css must define .wc-launch-overlay');
const overlayBlock = termCss.slice(overlayIdx, overlayIdx + 300);
assert(overlayBlock.includes('background: #FFFFFF') || overlayBlock.includes('background: #ffffff'), 'Launch overlay must expand with white background');

// 4. Scripts integration
assert(termJs.includes('document.body.classList.add(\'wc-site-opened\')'), 'terminal.js must set wc-site-opened class on body');
assert(termJs.includes('headerDiscussBtn'), 'terminal.js must connect header discuss button');
assert(termJs.includes('openModal'), 'terminal.js must open modal upon clicking discuss button');
assert(storyJs.includes('wc-site-opened'), 'story-hero.js must preserve header visibility when site is opened');

// 5. CSS white header styling
assert(mainCss.includes('body.wc-site-opened .site-header'), 'main.css must style header for opened white site');
assert(mainCss.includes('.header-discuss-cta'), 'main.css must style discuss project button');
assert(mainCss.includes('.site-header.header-scrolled-hidden'), 'main.css must support .site-header.header-scrolled-hidden for smooth hide on scroll');
assert(termJs.includes('initHeaderScrollHide'), 'terminal.js must define initHeaderScrollHide');

console.log('Header and white theme tests passed successfully!');
