const assert = require('assert');
const fs = require('fs');

const terminalJs = fs.readFileSync('scripts/terminal.js', 'utf-8');
const terminalCss = fs.readFileSync('styles/terminal.css', 'utf-8');
const indexHtml = fs.readFileSync('index.html', 'utf-8');

// 1. Heading and Subtitle requirements
assert(terminalJs.includes('Обговорімо'), 'Must contain large heading "Обговорімо?"');
assert(terminalJs.includes('Перетворюємо відвідувачів сайту на ваших клієнтів.'), 'Must contain subtitle "Перетворюємо відвідувачів сайту на ваших клієнтів."');

// 2. Contact form requirements
assert(terminalJs.includes('id="wc-fullscreen-contact-form"'), 'Must have contact form');
assert(terminalJs.includes('id="wc-contact-input-name"'), 'Must have name input');
assert(terminalJs.includes('id="wc-contact-input-phone"'), 'Must have phone input');
assert(terminalJs.includes('id="wc-contact-submit-btn"'), 'Must have submit button');

// 3. Service pills requirements
assert(terminalJs.includes('id="modal-tg-link"'), 'Must have Telegram link pill');
assert(terminalJs.includes('id="modal-wa-link"'), 'Must have WhatsApp link pill');
assert(terminalJs.includes('id="modal-viber-link"'), 'Must have Viber link pill');
assert(terminalJs.includes('id="modal-phone-link"'), 'Must have Phone link pill');

// 4. Header nav link
assert(indexHtml.includes('id="nav-contacts"'), 'Header nav must include Contacts link');

// 5. CSS fullscreen layout
assert(terminalCss.includes('.wc-contact-fullscreen-modal') || terminalCss.includes('.wc-calc-modal-backdrop'), 'Must have fullscreen modal backdrop');
assert(terminalCss.includes('.wc-contact-fullscreen-container'), 'Must style fullscreen container');
assert(terminalCss.includes('.wc-contact-main-heading'), 'Must style main heading');
assert(terminalCss.includes('.wc-contact-sub-heading'), 'Must style sub heading');
assert(terminalCss.includes('.wc-fullscreen-contact-form'), 'Must style contact form');

console.log('Fullscreen contact menu tests passed successfully!');
