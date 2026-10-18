const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ARTIFACTS_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function runDiagnostics(viewport, isMobile = false) {
  console.log(`\n======================================================`);
  console.log(`Running Diagnostics on Viewport: ${viewport.width}x${viewport.height} (Mobile: ${isMobile})`);
  console.log(`======================================================`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-gpu-rasterization']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    isMobile,
    hasTouch: isMobile
  });

  await page.goto('http://localhost:5500', { waitUntil: 'networkidle2' });

  // 1. Initial Target Origin Calculation Check
  const originInfo = await page.evaluate(() => {
    window.__storyHero.calculateTargetOrigin();
    const cEl = document.getElementById('shiny-target-c');
    const portal = document.getElementById('story-zoom-portal');
    const rC = cEl.getBoundingClientRect();
    const rP = portal.getBoundingClientRect();
    return {
      cWidth: rC.width,
      cHeight: rC.height,
      cLeft: rC.left,
      cTop: rC.top,
      portalWidth: rP.width,
      portalHeight: rP.height,
      origin: portal.style.transformOrigin,
      willChange: window.getComputedStyle(portal).willChange
    };
  });

  console.log('Target origin metrics:', originInfo);
  assert(originInfo.cWidth > 0, 'Letter C must have non-zero width');
  assert(originInfo.cHeight > 0, 'Letter C must have non-zero height');
  assert(originInfo.origin.includes('px') || originInfo.origin.includes('%'), 'Transform origin must be set');
  assert(originInfo.willChange.includes('transform'), 'will-change: transform must be present');

  // 2. High-Performance Frame Rate & Geometric Trajectory Test
  const perfData = await page.evaluate(async (isMob) => {
    const portal = document.getElementById('story-zoom-portal');
    const whiteout = document.getElementById('story-whiteout-overlay');
    const cEl = document.getElementById('shiny-target-c');
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;

    const startP = 0.200;
    const endP = 1.000;
    const duration = 1200; // 1.2s smooth scrub transition

    // Warm up
    window.__storyHero.stepTo(startP);
    await new Promise(r => requestAnimationFrame(r));

    let frameCount = 0;
    const startTime = performance.now();

    await new Promise(resolve => {
      function step() {
        const now = performance.now();
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const p = startP + (endP - startP) * t;
        window.__storyHero.renderProgress(p);
        frameCount++;
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });

    const totalTime = performance.now() - startTime;
    const avgFps = (frameCount / totalTime) * 1000;

    // Measure key trajectory checkpoints
    const trajectoryPoints = [];
    for (const p of [0.200, 0.400, 0.650, 0.880, 1.000]) {
      window.__storyHero.renderProgress(p);
      const rC = cEl.getBoundingClientRect();
      const currentCenterX = rC.left + rC.width * 0.5;
      const currentCenterY = rC.top + rC.height * 0.5;
      const distToCenter = Math.hypot(screenCenterX - currentCenterX, screenCenterY - currentCenterY);
      trajectoryPoints.push({
        p,
        currentCenterX: Number(currentCenterX.toFixed(2)),
        currentCenterY: Number(currentCenterY.toFixed(2)),
        distToCenter: Number(distToCenter.toFixed(2)),
        scale: portal.style.transform,
        whiteoutOpacity: Number(whiteout.style.opacity || 0)
      });
    }

    const finalPoint = trajectoryPoints[trajectoryPoints.length - 1];

    return {
      avgFps: Number(avgFps.toFixed(1)),
      frameCount,
      totalTime: Number(totalTime.toFixed(1)),
      finalDrift: finalPoint.distToCenter,
      finalWhiteout: finalPoint.whiteoutOpacity,
      trajectoryPoints
    };
  }, isMobile);

  console.log(`Frame Rate: ${perfData.avgFps} fps (${perfData.frameCount} frames in ${perfData.totalTime}ms)`);
  console.log(`Final Center Alignment Distance: ${perfData.finalDrift}px from exact screen center`);
  console.log(`Final Whiteout Opacity: ${perfData.finalWhiteout}`);
  console.log('Sample Trajectory Checkpoints:', perfData.trajectoryPoints);

  assert(perfData.avgFps >= 45, `Frame rate should maintain smooth 50-60fps range (got ${perfData.avgFps} fps)`);
  assert(perfData.finalDrift <= 2.0, `Final camera target must align within 2px of screen center (got ${perfData.finalDrift}px)`);
  assert(perfData.finalWhiteout >= 0.95, `Final whiteout opacity must reach solid white >= 0.95 (got ${perfData.finalWhiteout})`);

  // 3. Visual Milestones Screenshot Capture
  const prefix = isMobile ? 'mobile' : 'desktop';

  // Milestone A: Hero at rest (p = 0.00)
  await page.evaluate(() => window.__storyHero.stepTo(0.00));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, `${prefix}-01-hero-emergence.png`) });

  // Milestone B: Zoom Gateway Entry (p = 0.35)
  await page.evaluate(() => window.__storyHero.stepTo(0.35));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, `${prefix}-02-zoom-entry.png`) });

  // Milestone C: Mid-dive into hollow pocket of "C" (p = 0.65)
  await page.evaluate(() => window.__storyHero.stepTo(0.65));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, `${prefix}-03-dive-pocket.png`) });

  // Milestone D: Approaching massive scale + whiteout inundation (p = 0.90)
  await page.evaluate(() => window.__storyHero.stepTo(0.90));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, `${prefix}-04-whiteout-expansion.png`) });

  // Milestone E: Pure white room breakthrough (p = 1.00)
  await page.evaluate(() => window.__storyHero.stepTo(1.00));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, `${prefix}-05-pure-white-room.png`) });

  console.log(`Visual milestones saved to tests/screenshots/ for ${prefix}`);

  await browser.close();
}

(async () => {
  try {
    // Desktop 1440x900
    await runDiagnostics({ width: 1440, height: 900 }, false);

    // Mobile 390x844 (iPhone 14 / modern smartphone)
    await runDiagnostics({ width: 390, height: 844 }, true);

    console.log('\nAll zoom transition performance & geometric diagnostics PASSED successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Diagnostics failed:', err);
    process.exit(1);
  }
})();
