const { spawn } = require('node:child_process');
const crypto = require('node:crypto');

const port = 8799;
const server = spawn(process.execPath, ['oracle/server.cjs'], {
  env: { ...process.env, ORACLE_PORT: String(port), ORACLE_ALLOWED_ORIGIN: 'http://localhost:5173' },
  stdio: ['ignore', 'pipe', 'pipe']
});

function sha256(value) {
  return `0x${crypto.createHash('sha256').update(value).digest('hex')}`;
}

async function waitForHealth() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await fetch(`http://localhost:${port}/health`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error('Oracle server did not become healthy');
}

async function main() {
  await waitForHealth();
  const request = {
    reportId: 'rep-check',
    reproductionSteps: 'CALL deposit(1000)\nCALL flashLoan(1e18)\nCALL settlement(before_state_update)',
    evidenceHash: `0x${'b'.repeat(64)}`,
    idempotencyKey: sha256('rep-check:oracle-check')
  };
  const firstResponse = await fetch(`http://localhost:${port}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
    body: JSON.stringify(request)
  });
  if (!firstResponse.ok) throw new Error(`Expected evaluation success, got ${firstResponse.status}`);
  const first = await firstResponse.json();
  if (first.status !== 'passed' || !first.signature || !first.executionId) throw new Error('Expected signed passed result');

  const secondResponse = await fetch(`http://localhost:${port}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
    body: JSON.stringify(request)
  });
  const second = await secondResponse.json();
  if (second.executionId !== first.executionId) throw new Error('Idempotency did not reuse execution result');

  const rejectedResponse = await fetch(`http://localhost:${port}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
    body: JSON.stringify({ ...request, idempotencyKey: sha256('rejected'), reproductionSteps: 'rm -rf /' })
  });
  const rejected = await rejectedResponse.json();
  if (rejected.status !== 'rejected') throw new Error('Unsafe reproduction was not rejected');

  console.log(`Oracle integration check passed: ${first.executionId}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => {
  server.kill();
});
