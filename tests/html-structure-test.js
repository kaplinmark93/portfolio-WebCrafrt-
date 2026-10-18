const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf-8');
assert(html.includes('<title>'), 'HTML must have title');
assert(html.includes('id="header"'), 'HTML must have header');
assert(html.includes('id="main"'), 'HTML must have main container');
assert(html.includes('id="footer"'), 'HTML must have footer');
assert(!html.includes('id="hero"'), 'Dark hero section must be removed per user request');
assert(!html.includes('id="story-pinned-viewport"'), 'Story pinned viewport must be removed per user request');
assert(!html.includes('id="story-zoom-portal"'), 'Zoom portal container must be removed per user request');
assert(!html.includes('id="story-whiteout-overlay"'), 'Whiteout overlay must be removed per user request');
assert(!html.includes('id="overview"'), 'Overview section must be removed per user request');
assert(!html.includes('id="particles-background"'), 'Particles background must be removed per user request');
assert(html.includes('styles/main.css'), 'HTML must link main.css');
assert(html.includes('styles/terminal.css'), 'HTML must link terminal.css');
assert(html.includes('scripts/terminal.js'), 'HTML must link terminal.js');

// Verify old screenshot sections are removed per user request
assert(!html.includes('id="services"'), 'Old services section must be removed per user request');
assert(!html.includes('id="process"'), 'Old process section must be removed per user request');
assert(!html.includes('id="portfolio"'), 'Old portfolio section must be removed per user request');
assert(!html.includes('id="tech"'), 'Old tech section must be removed per user request');
assert(!html.includes('id="floating-cta"'), 'Old floating CTA must be removed per user request');
assert(!html.includes('id="contact-modal"'), 'Old modal must be removed per user request');

console.log('HTML structure test passed');
