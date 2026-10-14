const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const storePath = path.join(os.tmpdir(), `trustx-oracle-persistence-${process.pid}.json`);
const request = {
  reportId: 'rep-persistence-check',
  bountyId: 'bounty-persistence-check',
  scope: ['fixture://trustx-settlement-v1'],
  reproductionSteps: 'CALL deposit(1000)\nCALL flashLoan(1e18)\nCALL settlement(before_state_update)',
  evidenceHash: `0x${'c'.repeat(64)}`,
  idempotencyKey: 'persistence-check-key'
};

function startServer(port) {
  return spawn(process.execPath, ['oracle/server.cjs'], {
    env: { ...process.env, ORACLE_PORT: String(port), ORACLE_ALLOWED_ORIGIN: 'http://localhost:5173', ORACLE_JOB_STORE_PATH: storePath },
    stdio: ['ignore', 'ignore', 'pipe']
  });
}

async function waitForHealth(port) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`http://localhost:${port}/health`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error('Oracle server did not become healthy');
}

async function evaluate(port) {
  const session = await (await fetch(`http://localhost:${port}/session`, { headers: { Origin: 'http://localhost:5173' } })).json();
  const response = await fetch(`http://localhost:${port}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173', 'X-TrustX-Request-Token': session.requestToken },
    body: JSON.stringify(request)
  });
  return response.json();
}

function stopServer(server) {
  return new Promise((resolve) => {
    server.once('close', resolve);
    server.kill();
  });
}

async function main() {
  const firstServer = startServer(8801);
  await waitForHealth(8801);
  const first = await evaluate(8801);
  await stopServer(firstServer);

  const secondServer = startServer(8802);
  await waitForHealth(8802);
  const second = await evaluate(8802);
  await stopServer(secondServer);

  if (first.executionId !== second.executionId) throw new Error('Restart did not preserve idempotent execution result');
  console.log(`Oracle persistence check passed: ${first.executionId}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => {
  try { fs.rmSync(storePath, { force: true }); } catch { /* best effort cleanup */ }
});
