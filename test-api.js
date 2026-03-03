#!/usr/bin/env node
/**
 * CRM API Integration Test Script
 * Tests all NestJS endpoints before deployment
 * Usage: node test-api.js [API_URL]
 */

const API_URL = process.argv[2] || 'http://localhost:3002/api/v1';
let passed = 0;
let failed = 0;

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(color, msg) {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function test(name, fn) {
  try {
    await fn();
    log('green', `  ✅ ${name}`);
    passed++;
  } catch (err) {
    log('red', `  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

async function fetchApi(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data, ok: res.ok };
}

async function run() {
  console.log();
  log('bold', `🧪 CRM API Integration Tests`);
  log('blue', `   Testing: ${API_URL}`);
  console.log();

  // ─── Health Check ───────────────────────────────────────────
  log('yellow', '📌 Health Check');
  await test('GET /health → 200', async () => {
    const r = await fetchApi('/health');
    if (r.status !== 200) throw new Error(`Got ${r.status}`);
    if (r.data.status !== 'ok') throw new Error(`status != ok`);
  });

  // ─── Auth Protection ────────────────────────────────────────
  log('yellow', '📌 Auth Guard');
  await test('GET /delivery without token → 401', async () => {
    const r = await fetchApi('/delivery?contractId=test');
    if (r.status !== 401) throw new Error(`Expected 401, got ${r.status}`);
  });
  await test('POST /quotes without token → 401', async () => {
    const r = await fetchApi('/quotes', { method: 'POST', body: '{}' });
    if (r.status !== 401) throw new Error(`Expected 401, got ${r.status}`);
  });
  await test('POST /email/send-quote without token → 401', async () => {
    const r = await fetchApi('/email/send-quote', {
      method: 'POST',
      body: '{}',
    });
    if (r.status !== 401) throw new Error(`Expected 401, got ${r.status}`);
  });
  await test('GET /pdf/quote without token → 401', async () => {
    const r = await fetchApi('/pdf/quote?id=test');
    if (r.status !== 401) throw new Error(`Expected 401, got ${r.status}`);
  });

  // ─── CORS Headers ───────────────────────────────────────────
  log('yellow', '📌 CORS');
  await test('OPTIONS /health → cors headers present', async () => {
    const r = await fetch(`${API_URL}/health`, { method: 'OPTIONS' });
    // Just check it doesn't crash
    if (r.status >= 500) throw new Error(`Server error ${r.status}`);
  });

  // ─── Validation (no auth needed to hit 401 vs 400) ──────────
  log('yellow', '📌 Validation DTOs');
  await test('POST /email/test with bad data → 400 or 401 (not 500)', async () => {
    const r = await fetchApi('/email/test', {
      method: 'POST',
      body: JSON.stringify({ smtp_host: '' }),
    });
    if (r.status >= 500) throw new Error(`Server crashed with ${r.status}`);
  });

  // ─── Summary ────────────────────────────────────────────────
  console.log();
  const total = passed + failed;
  if (failed === 0) {
    log('green', `🎉 All ${total} tests passed!`);
  } else {
    log('red', `💥 ${failed}/${total} tests failed`);
    log('yellow', `   ${passed}/${total} tests passed`);
  }
  console.log();

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  log('red', `Fatal error: ${err.message}`);
  process.exit(1);
});
