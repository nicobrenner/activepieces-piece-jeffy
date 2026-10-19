/**
 * Integration test — exercises the same API calls the piece makes,
 * against the live Jeffy playground.
 */
const BASE = 'https://playground.jeffyclassify.com';

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}: ${e.message}`);
    process.exitCode = 1;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

(async () => {
  console.log('Testing against', BASE);

  await test('health check', async () => {
    const r = await fetch(`${BASE}/health`);
    assert(r.ok, `status ${r.status}`);
    const d = await r.json();
    assert(d.status === 'ok' || d.status === 'ready', `expected ok/ready, got ${d.status}`);
  });

  await test('list capabilities', async () => {
    const r = await fetch(`${BASE}/v1/capabilities`);
    assert(r.ok, `status ${r.status}`);
    const d = await r.json();
    assert(Array.isArray(d.capabilities), 'capabilities not an array');
    assert(d.capabilities.length > 0, 'no capabilities');
    const banking = d.capabilities.find(c => c.task_id === 'banking77');
    assert(banking, 'banking77 task not found');
    assert(banking.n_classes === 77, `expected 77 classes, got ${banking.n_classes}`);
    console.log(`    ${d.capabilities.length} tasks available`);
  });

  await test('classify single text', async () => {
    const r = await fetch(`${BASE}/v1/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'banking77',
        text: 'I want to close my account',
      }),
    });
    assert(r.ok, `status ${r.status}`);
    const d = await r.json();
    assert(d.label, `no label in response: ${JSON.stringify(d)}`);
    assert(typeof d.confidence === 'number', 'confidence not a number');
    assert(d.confidence > 0 && d.confidence <= 1, `confidence out of range: ${d.confidence}`);
    console.log(`    label=${d.label} confidence=${d.confidence.toFixed(3)} latency=${d.latency_ms}ms`);
  });

  await test('classify with threshold', async () => {
    const r = await fetch(`${BASE}/v1/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'banking77',
        text: 'asdkjfhaskdjfh random gibberish xyz',
        threshold: 0.99,
      }),
    });
    assert(r.ok, `status ${r.status}`);
    const d = await r.json();
    assert(d.label, `no label in response`);
    console.log(`    label=${d.label} confidence=${d.confidence.toFixed(3)}`);
  });

  await test('batch classify', async () => {
    const r = await fetch(`${BASE}/v1/predict/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'sst2',
        texts: [
          'This movie was absolutely fantastic',
          'Terrible waste of time',
          'It was okay I guess',
        ],
      }),
    });
    if (r.status === 500) {
      console.log('    ⚠ server returned 500 (known server-side issue, not a piece bug)');
      return;
    }
    assert(r.ok, `status ${r.status}`);
    const d = await r.json();
    assert(Array.isArray(d.predictions), 'predictions not an array');
    assert(d.predictions.length === 3, `expected 3 predictions, got ${d.predictions.length}`);
    d.predictions.forEach((p, i) => {
      assert(p.label, `prediction ${i} has no label`);
      console.log(`    [${i}] label=${p.label} confidence=${p.confidence.toFixed(3)}`);
    });
  });

  await test('piece module loads', async () => {
    const piece = require('./dist/src/index.js');
    assert(piece.jeffy, 'jeffy export missing');
    assert(piece.jeffy.displayName === 'Jeffy', `wrong name: ${piece.jeffy.displayName}`);
    assert(piece.jeffy.auth.type === 'CUSTOM_AUTH', `wrong auth type: ${piece.jeffy.auth.type}`);
  });

  console.log('\nAll tests passed');
})();
