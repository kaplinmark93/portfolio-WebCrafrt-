import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const morphGeom = require('../scripts/process-morph-geometries.js');

console.log('Testing Volumetric 3D Geometries & Ambient Particle Clouds...');

const count = 4200;
const stagesCount = morphGeom.STAGES_COUNT;
assert.strictEqual(stagesCount, 7, 'Must have 7 stages');

for (let stage = 0; stage < stagesCount; stage++) {
  const points = morphGeom.generateStageCoordinates(stage, count);
  assert.strictEqual(points.length, count, `Stage ${stage} must return exactly ${count} points`);

  let sumZ = 0;
  let minZ = Infinity;
  let maxZ = -Infinity;
  let ambientCount = 0;

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    assert.ok(isFinite(pt.x) && !isNaN(pt.x), `Stage ${stage} pt ${i} x must be finite`);
    assert.ok(isFinite(pt.y) && !isNaN(pt.y), `Stage ${stage} pt ${i} y must be finite`);
    assert.ok(isFinite(pt.z) && !isNaN(pt.z), `Stage ${stage} pt ${i} z must be finite`);

    sumZ += pt.z;
    if (pt.z < minZ) minZ = pt.z;
    if (pt.z > maxZ) maxZ = pt.z;

    const r = Math.sqrt(pt.x * pt.x + pt.y * pt.y);
    if (r >= 1.15) {
      ambientCount++;
    }
  }

  const meanZ = sumZ / points.length;
  let varZ = 0;
  for (let i = 0; i < points.length; i++) {
    const dz = points[i].z - meanZ;
    varZ += dz * dz;
  }
  const stdZ = Math.sqrt(varZ / points.length);
  const depthSpan = maxZ - minZ;

  console.log(`Stage ${stage} (${morphGeom.STAGES_CONTENT[stage].title}):`);
  console.log(`  Z range: [${minZ.toFixed(2)}, ${maxZ.toFixed(2)}], depth span = ${depthSpan.toFixed(2)}, std(Z) = ${stdZ.toFixed(3)}`);
  console.log(`  Ambient particles count (r >= 1.15): ${ambientCount} (${((ambientCount / count) * 100).toFixed(1)}%)`);

  // Assert volumetric 3D: depth span must be substantial (> 0.8) and standard deviation > 0.20
  assert.ok(depthSpan >= 0.8, `Stage ${stage} must have substantial 3D depth span (got ${depthSpan})`);
  assert.ok(stdZ >= 0.20, `Stage ${stage} must have volumetric 3D distribution in Z (got stdZ=${stdZ})`);

  // Assert ambient cloud: at least 700 particles around the element
  assert.ok(ambientCount >= 700, `Stage ${stage} must have plenty of ambient particles around the core (got ${ambientCount})`);
}

console.log('✅ ALL 7 STAGES ARE DEEPLY VOLUMETRIC 3D AND SURROUNDED BY AMBIENT CLOUDS!');
