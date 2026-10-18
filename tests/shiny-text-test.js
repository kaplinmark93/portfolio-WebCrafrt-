const assert = require('assert');
const fs = require('fs');

const shinyJs = fs.readFileSync('scripts/shiny-text.js', 'utf-8');
const terminalJs = fs.readFileSync('scripts/terminal.js', 'utf-8');
const terminalCss = fs.readFileSync('styles/terminal.css', 'utf-8');
const indexHtml = fs.readFileSync('index.html', 'utf-8');

// 1. Script integration
assert(indexHtml.includes('scripts/shiny-text.js'), 'index.html must include scripts/shiny-text.js');
assert(shinyJs.includes('createShinyText'), 'shiny-text.js must define createShinyText');
assert(shinyJs.includes('initShinyText'), 'shiny-text.js must expose initShinyText');
assert(shinyJs.includes('#FFFFFF') || shinyJs.includes('#ffffff'), 'shiny-text.js must handle numbers with #FFFFFF');

// 2. CSS integration
assert(terminalCss.includes('.shiny-text {'), 'terminal.css must define .shiny-text');
assert(terminalCss.includes('.shiny-text__glow {'), 'terminal.css must define .shiny-text__glow');
assert(terminalCss.includes('-webkit-background-clip: text'), 'terminal.css must use text clipping');
assert(terminalCss.includes('-webkit-text-fill-color: transparent'), 'terminal.css must use transparent text fill');
assert(terminalCss.includes('.wc-step-num-vate.shiny-text'), 'terminal.css must explicitly style .wc-step-num-vate.shiny-text');

// 3. Terminal JS markup
assert(terminalJs.includes('data-shiny-text="01"'), 'Card 01 must have data-shiny-text="01"');
assert(terminalJs.includes('data-shiny-text="02"'), 'Card 02 must have data-shiny-text="02"');
assert(terminalJs.includes('data-shiny-text="03"'), 'Card 03 must have data-shiny-text="03"');
assert(terminalJs.includes('data-shiny-text="04"'), 'Card 04 must have data-shiny-text="04"');
assert(terminalJs.includes('data-shiny-text="05"'), 'Card 05 must have data-shiny-text="05"');
assert(terminalJs.includes('initShinyText()'), 'terminal.js must initialize ShinyText after calculator mount');

console.log('React Bits ShinyText integration tests passed successfully!');
