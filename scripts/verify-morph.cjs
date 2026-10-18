const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACTS_DIR = '/Users/mark/.gemini/antigravity-ide/brain/4f72ae6b-520e-4ae8-838a-3b2c27b9965b';

async function verify() {
  console.log('Launching browser to test Antigravity WebGL morphing...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--use-angle=metal',
      '--enable-webgl',
      '--enable-features=Vulkan,UseSkiaRenderer'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  await page.goto('http://localhost:5500', { waitUntil: 'networkidle2' });

  // Scroll to the morph section
  await page.evaluate(() => {
    const sec = document.getElementById('wc-particles-fullscreen');
    sec.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 600));

  const stages = [
    { idx: 0, name: 'morph_00_chaos.png', prog: 0.0, isChaos: true },
    { idx: 0, name: 'morph_01_lightbulb.png', prog: 1.0 },
    { idx: 1, name: 'morph_02_blueprint.png', prog: 2.0 },
    { idx: 2, name: 'morph_03_crystal.png', prog: 3.0 },
    { idx: 3, name: 'morph_04_layers.png', prog: 4.0 },
    { idx: 4, name: 'morph_05_terminal.png', prog: 5.0 },
    { idx: 5, name: 'morph_06_growthchart.png', prog: 6.0 },
    { idx: 6, name: 'morph_07_checkmark.png', prog: 7.0 },
    { idx: 3.5, name: 'morph_turbulence_transition.png', prog: 3.5 }
  ];

  for (const s of stages) {
    await page.evaluate((prog, pillIdx) => {
      const sec = document.getElementById('wc-particles-fullscreen');
      if (sec && sec._particles) {
        sec._particles.setMorphProgress(prog);
        const pills = sec.querySelectorAll('.wc-morph-pill');
        const pIdx = Math.min(6, Math.floor(pillIdx));
        if (pills[pIdx]) {
          pills.forEach((p, i) => p.classList.toggle('is-active', i === pIdx));
        }
        // Update HUD card
        const stagesContent = window.ProcessMorphGeometries.STAGES_CONTENT;
        const stage = stagesContent[pIdx];
        if (stage) {
          const currNum = sec.querySelector('#wc-morph-step-curr');
          const badge = sec.querySelector('#wc-morph-stage-badge');
          const title = sec.querySelector('#wc-morph-step-title');
          const desc = sec.querySelector('#wc-morph-step-desc');
          const shapeText = sec.querySelector('#wc-morph-shape-text');
          const progressBar = sec.querySelector('#wc-morph-progress-bar');
          if (currNum) currNum.textContent = stage.stepNumber;
          if (badge) badge.textContent = stage.badge;
          if (title) title.textContent = stage.title;
          if (desc) desc.textContent = stage.description;
          if (shapeText) shapeText.textContent = prog === 4.5 ? '✦ 3D SIMPLEX TURBULENCE VORTEX' : stage.shapeName;
          if (progressBar) progressBar.style.width = ((prog / 6.0) * 100) + '%';
        }
      }
    }, s.prog, s.idx);

    await new Promise(r => setTimeout(r, 400));
    const ssPath = path.join(ARTIFACTS_DIR, s.name);
    await page.screenshot({ path: ssPath });
    console.log(`Saved screenshot: ${s.name}`);
  }

  await browser.close();
  console.log('All 7 stages + turbulence screenshots successfully captured!');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
