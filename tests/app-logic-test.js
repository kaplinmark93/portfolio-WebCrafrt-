const assert = require('assert');
const fs = require('fs');

const js = fs.readFileSync('scripts/app.js', 'utf-8');
assert(js.includes('switchTab'), 'app.js must handle tab switching');
assert(js.includes('openContactModal'), 'app.js must handle modal open');
assert(js.includes('closeContactModal'), 'app.js must handle modal close');
assert(js.includes('Escape'), 'app.js must support Esc key to close modal');
assert(js.includes('renderActiveService'), 'app.js must render active service details');
console.log('App logic test passed');
