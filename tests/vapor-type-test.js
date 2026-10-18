const assert = require('assert');
const fs = require('fs');

console.log('Testing VaporType component and Process Morph integration...');

// 1. Verify files exist
assert(fs.existsSync('scripts/vapor-type.js'), 'scripts/vapor-type.js must exist');
const vaporJs = fs.readFileSync('scripts/vapor-type.js', 'utf8');
const terminalJs = fs.readFileSync('scripts/terminal.js', 'utf8');
const terminalCss = fs.readFileSync('styles/terminal.css', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

// 2. Verify scripts included in index.html
assert(indexHtml.includes('scripts/three.min.js'), 'index.html must include scripts/three.min.js');
assert(indexHtml.includes('scripts/vapor-type.js'), 'index.html must include scripts/vapor-type.js');

// 3. Verify VaporType component definition and presets
assert(vaporJs.includes('createVaporType'), 'vapor-type.js must define createVaporType');
assert(vaporJs.includes('PRESETS'), 'vapor-type.js must define presets');
assert(vaporJs.includes('mist') && vaporJs.includes('frost'), 'vapor-type.js must include mist and frost presets');
assert(vaporJs.includes('PARTICLE_VERT'), 'vapor-type.js must include vertex shader');
assert(vaporJs.includes('PARTICLE_FRAG'), 'vapor-type.js must include fragment shader');
assert(vaporJs.includes('SIM_FRAG'), 'vapor-type.js must include fluid simulation shader');

// 4. Verify terminal.js integration
assert(terminalJs.includes('wc-morph-eyebrow'), 'terminal.js must include #wc-morph-eyebrow');
assert(terminalJs.includes('createVaporType'), 'terminal.js must invoke createVaporType');
assert(terminalJs.includes('Етапи Розробки'), 'terminal.js must set words to Етапи Розробки');

// 5. Verify styling makes eyebrow large
assert(terminalCss.includes('.wc-morph-eyebrow'), 'terminal.css must style .wc-morph-eyebrow');
assert(/font-size:\s*clamp\(32px/i.test(terminalCss), 'terminal.css must have large font size for eyebrow');

// 6. Test basic execution without browser crash
const VaporType = require('../scripts/vapor-type.js');
assert(typeof VaporType === 'function', 'VaporType export must be a function');
assert(VaporType.presets && VaporType.presets.mist, 'VaporType.presets must be available');

console.log('VaporType component tests passed successfully!');
