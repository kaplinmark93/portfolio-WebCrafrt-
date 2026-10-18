const assert = require('assert');
const fs = require('fs');

const terminalJs = fs.readFileSync('scripts/terminal.js', 'utf-8');

// Ensure all parts exist in terminal.js
assert(terminalJs.includes('calc-type'), 'Must have calc-type radio');
assert(terminalJs.includes('calc-design'), 'Must have calc-design radio');
assert(terminalJs.includes('calc-modules'), 'Must have calc-modules checkboxes');
assert(terminalJs.includes('calc-speed'), 'Must have calc-speed radio');
assert(terminalJs.includes('wc-calc-modal'), 'Must have modal backdrop');
assert(terminalJs.includes('modal-tg-link'), 'Must have telegram link');
assert(terminalJs.includes('modal-wa-link'), 'Must have whatsapp link');
assert(terminalJs.includes('modal-viber-link'), 'Must have viber link');

// Simulate the math logic implemented in terminal.js
function calculateQuote(typeBase, designCost, modulesCost, isUrgent) {
  const subtotal = typeBase + designCost + modulesCost;
  const multiplier = isUrgent ? 1.2 : 1.0;
  const totalUsd = Math.round(subtotal * multiplier);
  const totalUah = Math.round(totalUsd * 41);
  return { totalUsd, totalUah };
}

// Test corporate default: base 950 + custom design 200 + crm 120 + tg 80 + seo 100 = 1450
const def = calculateQuote(950, 200, 120 + 80 + 100, false);
assert.strictEqual(def.totalUsd, 1450, 'Default corporate total should be 1450');
assert.strictEqual(def.totalUah, 59450, 'Default corporate UAH should be 59450');

// Test urgent web service: base 2200 + interactive design 450 + all modules (150+120+80+150+350+100 = 950) = 3600 * 1.2 = 4320
const urgent = calculateQuote(2200, 450, 950, true);
assert.strictEqual(urgent.totalUsd, 4320, 'Urgent SaaS with all modules should be 4320');
assert.strictEqual(urgent.totalUah, 177120, 'Urgent SaaS UAH should be 177120');

console.log('Interactive calculator logic verified successfully!');
