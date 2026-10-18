const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf-8');
const css = fs.readFileSync('styles/main.css', 'utf-8');

// 1. Structure assertions
assert(html.includes('id="hero"'), 'Hero section must exist');
assert(html.includes('story-pinned-viewport'), 'Pinned viewport must exist');
assert(!html.includes('id="story-progress-bar"'), 'Story progress bar must be removed per user request');
assert(html.includes('scripts/story-hero.js'), 'scripts/story-hero.js must be linked in index.html');
assert(fs.existsSync('scripts/story-hero.js'), 'scripts/story-hero.js file must exist');

// 2. Pre-hero steps removed per user request
assert(!html.includes('Потрібен новий сайт для бізнесу?'), 'Step 1 question must be removed per user request');
assert(!html.includes('Хочете уникнути рутини та затяжних процесів?'), 'Step 2 question must be removed per user request');
assert(!html.includes('Шукаєте підрядника, який розуміє цілі з пів слова?'), 'Step 3 question must be removed per user request');
assert(!html.includes('Важливий результат, а не просто візитка?'), 'Step 4 question must be removed per user request');
assert(!html.includes('Довірте розробку нам.'), 'Step 5 statement must be removed per user request');
assert(!html.includes('story-scroll-hint'), 'Scroll hint must be removed per user request');

// 3. Final hero state (opens immediately)
assert(html.includes('WebCraft'), 'Brand WebCraft must exist in hero');
assert(html.includes('data-shiny-text'), 'ShinyText must exist for WebCraft');
assert(html.includes('scripts/shiny-text.js'), 'scripts/shiny-text.js must be linked in index.html');
assert(fs.existsSync('scripts/shiny-text.js'), 'scripts/shiny-text.js file must exist');
assert(html.includes('Створюємо сайти, де кожен відвідувач'), 'Main title must match');
assert(html.includes('стає вашим покупцем'), 'Main title highlight must match');
assert(!html.includes('Комплексна розробка інтернет-проектів під ключ'), 'Subtitle text must be removed per user request');
assert(!html.includes('id="final-hero-cta-btn"'), 'CTA button in final hero must be removed per user request');

// 4. CSS Styling & Responsiveness
assert(css.includes('.story-pinned-viewport'), 'CSS must define .story-pinned-viewport');
assert(css.includes('position: sticky'), 'Viewport must use sticky pinning');
assert(css.includes('background: transparent'), 'Pinned container must be transparent');
assert(css.includes('.hero-section.story-hero-section'), 'CSS must define .hero-section.story-hero-section');
assert(css.includes('.story-final-hero'), 'CSS must style hero state');
assert(css.includes('@media (max-width: 768px)'), 'CSS must include mobile media query');

// 6. Header visibility & removed elements per user request
assert(!html.includes('story-step-badge'), 'Step badges (КРОК 0X / 05) must be removed from HTML');
assert(!html.includes('story-nav-dots'), 'Nav dots on the right must be removed from HTML');
assert(html.includes('header-visible'), 'Header must have header-visible class on page load');
assert(css.includes('.site-header.header-visible'), 'CSS must define .site-header.header-visible');

// 7. Cinematic Zoom & Whiteout Transition
assert(html.includes('id="story-zoom-portal"'), 'Zoom portal container must exist in HTML');
assert(html.includes('id="story-whiteout-overlay"'), 'Whiteout overlay must exist in HTML');
assert(css.includes('.story-zoom-portal'), 'CSS must define .story-zoom-portal');
assert(css.includes('.story-whiteout-overlay'), 'CSS must define .story-whiteout-overlay');
assert(css.includes('height: 350vh'), 'Hero height must be 350vh for smooth zoom transition');

console.log('Story-driven hero test passed successfully!');
