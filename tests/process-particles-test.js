import assert from 'node:assert';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { getProcessStageData, generateShapePoints, STAGES_COUNT } = require('../scripts/process-particles.js');

test('Process Particles: Stage Data & Generators', (t) => {
  assert.strictEqual(STAGES_COUNT, 6, 'Must define exactly 6 stages');

  for (let i = 0; i < STAGES_COUNT; i++) {
    const stage = getProcessStageData(i);
    assert.ok(stage, `Stage ${i} data must exist`);
    assert.ok(stage.stepNumber, `Stage ${i} must have stepNumber`);
    assert.ok(stage.title, `Stage ${i} must have title`);
    assert.ok(stage.description, `Stage ${i} must have description`);
    assert.ok(stage.iconSymbol, `Stage ${i} must have iconSymbol`);

    const points = generateShapePoints(i, 300, 300, 200);
    assert.ok(Array.isArray(points), `Shape points for stage ${i} must be an array`);
    assert.strictEqual(points.length, 200, `Must generate 200 target points for stage ${i}`);
    
    // Check points bounds
    points.forEach((pt, idx) => {
      assert.ok(typeof pt.x === 'number' && !isNaN(pt.x), `Point ${idx} in stage ${i} must have valid x`);
      assert.ok(typeof pt.y === 'number' && !isNaN(pt.y), `Point ${idx} in stage ${i} must have valid y`);
    });
  }
});
