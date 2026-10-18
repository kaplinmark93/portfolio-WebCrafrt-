const assert = require('assert');
const fs = require('fs');

assert(fs.existsSync('index.html'), 'index.html exists');
assert(fs.existsSync('styles/main.css'), 'styles/main.css exists');
assert(fs.existsSync('scripts/particles.js'), 'scripts/particles.js exists');
assert(fs.existsSync('scripts/story-hero.js'), 'scripts/story-hero.js exists');
assert(fs.existsSync('scripts/shiny-text.js'), 'scripts/shiny-text.js exists');
assert(fs.existsSync('scripts/config.js'), 'scripts/config.js exists');
assert(fs.existsSync('scripts/app.js'), 'scripts/app.js exists');

const html = fs.readFileSync('index.html', 'utf-8');
assert(html.includes('styles/main.css'), 'CSS linked');
assert(!html.includes('id="particles-background"'), 'Particles container removed per user request');
assert(!html.includes('id="story-zoom-portal"'), 'Zoom portal container removed per user request');
assert(!html.includes('id="story-whiteout-overlay"'), 'Whiteout overlay removed per user request');
assert(fs.existsSync('scripts/terminal.js'), 'scripts/terminal.js exists');
assert(fs.existsSync('styles/terminal.css'), 'styles/terminal.css exists');
assert(html.includes('scripts/terminal.js'), 'Terminal script linked');
assert(html.includes('styles/terminal.css'), 'Terminal CSS linked');

console.log('All integration assertions passed!');
