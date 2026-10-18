const assert = require('assert');
const fs = require('fs');

// Check terminal.js content
const js = fs.readFileSync('scripts/terminal.js', 'utf-8');
const css = fs.readFileSync('styles/terminal.css', 'utf-8');

// 1. Check "Що збираємо під ключ"
assert(js.includes('Що ми збираємо'), 'terminal.js must include turnkey heading');
assert(js.includes('Лендінги'), 'terminal.js must include Landing turnkey service');
assert(js.includes('Корпоративні сайти'), 'terminal.js must include Corporate turnkey service');
assert(js.includes('Веб-сервіси та дашборди'), 'terminal.js must include Webapp turnkey service');

// 2. Check "НАША ЕКСПЕРТИЗА" (7 Pillars with CardSwap 3D Showcase)
assert(js.includes('НАША'), 'terminal.js must include НАША');
assert(js.includes('ЕКСПЕРТИЗА'), 'terminal.js must include ЕКСПЕРТИЗА');
assert(js.includes('Архітектурний стек'), 'terminal.js must include card 01');
assert(js.includes('Кастомний UI/UX'), 'terminal.js must include card 02');
assert(js.includes('Автономне керування'), 'terminal.js must include card 03');
assert(js.includes('Екосистема та інтеграції'), 'terminal.js must include card 04');
assert(js.includes('Швидкість та Core Web Vitals'), 'terminal.js must include card 05');
assert(js.includes('ШІ-оптимізація: AEO & GEO'), 'terminal.js must include card 06');
assert(js.includes('Безпека та стабільність'), 'terminal.js must include card 07');
assert(js.includes('Next.js, Laravel або WordPress'), 'terminal.js must include exact architecture text');
assert(js.includes('Жодних копій чи чужих рішень'), 'terminal.js must include exact design text');
assert(js.includes('масштабованість'), 'terminal.js must highlight масштабованість');
assert(js.includes('card-swap') && js.includes('CardSwap'), 'terminal.js must integrate CardSwap');

// 3. Check Calculator & Modal
assert(js.includes('Калькулятор вартості'), 'terminal.js must include calculator section');
assert(js.includes('calc-price-usd'), 'terminal.js must calculate price in USD');
assert(js.includes('calc-price-uah'), 'terminal.js must calculate price in UAH');
assert(js.includes('wc-calc-modal'), 'terminal.js must include calc quote modal');
assert(js.includes('initCalculator'), 'terminal.js must define initCalculator function');

// 4. Check Flagship Headline Showcase & Ukrainian brands
assert(js.includes('Просуваємо ваш бренд'), 'terminal.js must include showcase headline "Просуваємо ваш бренд"');
assert(js.includes('Масштабуємо ваш успіх'), 'terminal.js must include showcase headline "Масштабуємо ваш успіх"');
assert(js.includes('createSplitText'), 'terminal.js must initialize createSplitText');
assert(js.includes('data-effect="rise"'), 'terminal.js must set SplitText effect to rise');
assert(js.includes('data-hover-effect="lift"'), 'terminal.js must set SplitText hoverEffect to lift');
assert(css.includes('.split-char'), 'terminal.css must style .split-char');
assert(css.includes('.split-word'), 'terminal.css must style .split-word');
assert(css.includes('.split-parent'), 'terminal.css must style .split-parent');
assert(fs.readFileSync('index.html', 'utf-8').includes('scripts/split-text.js'), 'index.html must include split-text.js');
assert(fs.existsSync('scripts/split-text.js'), 'scripts/split-text.js must exist');
assert(js.includes('WOG Pride'), 'terminal.js must include WOG Pride client brand');
assert(js.includes('Nova Post'), 'terminal.js must include Nova Post client brand');
assert(js.includes('Monobank'), 'terminal.js must include Monobank client brand');
assert(js.includes('Rozetka'), 'terminal.js must include Rozetka client brand');
assert(css.includes('.wc-macbook'), 'terminal.css must define .wc-macbook');
assert(css.includes('.wc-brands-stream'), 'terminal.css must define .wc-brands-stream');

// 5. CSS styling verification
assert(css.includes('.wc-expertise-grid'), 'terminal.css must style expertise grid');
assert(css.includes('.wc-turnkey-grid'), 'terminal.css must style turnkey grid');
assert(css.includes('.wc-calc-layout'), 'terminal.css must style calculator layout');
assert(css.includes('.wc-calc-modal-backdrop'), 'terminal.css must style modal backdrop');
assert(css.includes('.wc-accent-blue'), 'terminal.css must style blue accents');

// 6. Full-screen scroll-piled turnkey slides
assert(js.includes('wc-ts-track'), 'terminal.js must render the .wc-ts-track container');
assert(js.includes('wc-ts-slide'), 'terminal.js must render .wc-ts-slide blocks');
assert(js.includes('initTurnkeySlides'), 'terminal.js must define initTurnkeySlides');
assert((js.match(/id: '(landing|corporate|ecommerce|webapp)'/g) || []).length === 4, 'exactly 4 turnkey services expected');
assert(css.includes('.wc-ts-slide'), 'terminal.css must style slides');
assert(/\.wc-ts-slide \{[^}]*position: sticky/.test(css), 'slides must be sticky (piling) on desktop');
assert(/\.wc-ts-slide\.is-reveal-block \{[^}]*background: #FFFFFF/i.test(css), 'reveal slides (landing & webapp) must have pure solid white idle background');
assert(/(\.wc-ts-slide\.is-reveal-block:hover|\.wc-ts-slide\.is-reveal-block\.is-hovered)[^}]*background: #000000/i.test(css), 'reveal slides must morph to rich black on hover');
assert(js.includes("s.id === 'landing' || s.id === 'webapp'"), 'reveal feature must target landing and webapp');
assert(/\.wc-reveal-section \{[^}]*overflow: clip/.test(css), 'reveal section must not be a scroll container (sticky)');
assert(/@media \(max-width: 900px\), \(max-height: 640px\), \(hover: none\)/.test(css), 'mobile fallback without pinning must exist');
['від $500', 'від $950', 'від $1 400', 'від $2 200', 'від 5 днів', 'від 12 днів', 'від 18 днів', 'від 25 днів']
  .forEach(t => assert(js.includes(t), 'terminal.js must keep value: ' + t));
// 7. Fullscreen React Bits Particles Background block between Turnkey and Expertise
assert(js.includes('wc-particles-fullscreen'), 'terminal.js must include wc-particles-fullscreen');
assert(js.includes('initFullscreenParticles'), 'terminal.js must initialize initFullscreenParticles');
assert(css.includes('.wc-particles-fullscreen-section'), 'terminal.css must define .wc-particles-fullscreen-section');
assert(js.includes('wc-turnkey') && js.includes('wc-expertise'), 'terminal.js must include turnkey and expertise sections');
assert(css.includes('.wc-reveal-container'), 'terminal.css must define .wc-reveal-container');

console.log('All reveal features assertions passed successfully!');
