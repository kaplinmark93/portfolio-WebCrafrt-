const assert = require('assert');
const fs = require('fs');

const css = fs.readFileSync('styles/main.css', 'utf-8');
assert(css.includes('@media'), 'CSS must include media queries');
assert(css.includes('.tab-btn'), 'CSS must style tabs');
assert(css.includes('.modal-backdrop'), 'CSS must style contact modal');
assert(css.includes('.floating-btn'), 'CSS must style floating CTA');
assert(css.includes('.hero-section'), 'CSS must style hero section');
assert(css.includes('.process-card'), 'CSS must style process cards');
assert(css.includes('.tech-card'), 'CSS must style tech cards');
console.log('CSS responsiveness test passed');
