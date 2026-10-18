const assert = require('assert');
const fs = require('fs');

const configSource = fs.readFileSync('scripts/config.js', 'utf-8');
assert(configSource.includes('phone'), 'Config must include phone');
assert(configSource.includes('telegram'), 'Config must include telegram');
assert(configSource.includes('whatsapp'), 'Config must include whatsapp');
assert(configSource.includes('viber'), 'Config must include viber');
assert(configSource.includes('instagram'), 'Config must include instagram');
console.log('Config test passed');
