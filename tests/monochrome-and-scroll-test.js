const assert = require('assert');
const fs = require('fs');

// 1. Check Lenis library inclusion and initialization
const html = fs.readFileSync('index.html', 'utf-8');
assert(html.includes('scripts/lenis.min.js'), 'index.html must include local scripts/lenis.min.js');
assert(fs.existsSync('scripts/lenis.min.js'), 'scripts/lenis.min.js must exist on disk');

const js = fs.readFileSync('scripts/terminal.js', 'utf-8');
assert(js.includes('new Lenis'), 'terminal.js must initialize Lenis upon reveal');
assert(js.includes('Math.min(1, 1.001 - Math.pow(2, -10 * t))'), 'terminal.js must configure exponential easing identical to reference');
assert(js.includes('window.__lenisInstance.scrollTo'), 'terminal.js must use Lenis scrollTo for calculator jump');

// 2. Check Black & White theme on reveal section & footer
const termCss = fs.readFileSync('styles/terminal.css', 'utf-8');
const revealIdx = termCss.indexOf('.wc-reveal-section {');
assert(revealIdx !== -1, 'terminal.css must contain .wc-reveal-section');

const postRevealCss = termCss.slice(revealIdx);

// Forbidden colors in reveal section
const forbiddenColors = ['#2563eb', '#38bdf8', '#60a5fa', '#34d399', '#4ade80', '#fbbf24', 'rgba(37, 99, 235'];
forbiddenColors.forEach(color => {
  assert(!postRevealCss.includes(color), `Reveal section CSS must not contain colored accent: ${color}`);
});

// Check that .wc-accent-blue exists for test compatibility but is styled pure white
assert(postRevealCss.includes('.wc-accent-blue'), '.wc-accent-blue must be present');

// Check main.css footer is black & white
const mainCss = fs.readFileSync('styles/main.css', 'utf-8');
const footerIdx = mainCss.indexOf('.white-footer {');
assert(footerIdx !== -1, 'main.css must contain .white-footer');
const footerBlock = mainCss.slice(footerIdx, footerIdx + 300);
assert(footerBlock.includes('background: #08090C'), 'Footer must have dark background');
assert(footerBlock.includes('color: #FFFFFF') || footerBlock.includes('color: #ffffff'), 'Footer must have white text');

console.log('Monochrome and smooth scroll tests passed successfully!');
