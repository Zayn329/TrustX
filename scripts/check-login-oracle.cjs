const { spawn } = require('node:child_process');
const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');

const port = 8891;
const jobStorePath = `${process.cwd()}/.tmp-login-oracle-jobs-${process.pid}.json`;
const server = spawn(process.execPath, ['oracle/server.cjs'], {
  cwd: process.cwd(),
  env: { ...process.env, ORACLE_PORT: String(port), ORACLE_JOB_STORE_PATH: jobStorePath },
  stdio: ['ignore', 'pipe', 'pipe']
});

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path, ...options }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: body ? JSON.parse(body) : {} }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function waitForHealth() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try { if ((await request('/health')).status === 200) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Oracle server did not become healthy');
}

async function evaluate(targetId, reproductionSteps) {
  const session = await request('/session', { headers: { origin: 'http://localhost:5173' } });
  const evidenceHash = `0x${crypto.createHash('sha256').update(reproductionSteps).digest('hex')}`;
  return request('/evaluate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost:5173', 'x-trustx-request-token': session.body.requestToken },
    body: JSON.stringify({ targetId, reportId: `login-check-${targetId}`, bountyId: 'bounty-login-check', scope: ['fixture://trustx-login'], reproductionSteps, evidenceHash, idempotencyKey: `login-check-${targetId}-${Date.now()}` })
  });
}

function signatureValid(result) {
  const { signature, publicKeySpkiBase64, ...unsigned } = result;
  return crypto.verify(
    null,
    Buffer.from(JSON.stringify(unsigned)),
    crypto.createPublicKey({ key: Buffer.from(publicKeySpkiBase64, 'base64'), type: 'spki', format: 'der' }),
    Buffer.from(signature, 'base64'),
  );
}

(async () => {
  try {
    await waitForHealth();
    const steps = "POST /login\nusername=admin%27%20--\npassword=anything\nGET /admin";
    const vulnerable = await evaluate('trustx-login-sqli-v1', steps);
    if (vulnerable.status !== 200 || vulnerable.body.status !== 'passed' || !vulnerable.body.vulnerabilityReproduced || vulnerable.body.astFindings.length === 0) throw new Error('Vulnerable login target did not produce the expected runtime and AST evidence');
    if (!signatureValid(vulnerable.body)) throw new Error('Vulnerable login result signature did not verify');
    const tamperedAst = { ...vulnerable.body, astFindings: vulnerable.body.astFindings.map((finding) => ({ ...finding, severity: 'low' })) };
    if (signatureValid(tamperedAst)) throw new Error('Modified AST finding still verified');
    const tamperedRuntime = { ...vulnerable.body, vulnerabilityReproduced: false, runtimeStatus: 'failed' };
    if (signatureValid(tamperedRuntime)) throw new Error('Modified runtime result still verified');
    const fixed = await evaluate('trustx-login-sqli-fixed-v1', steps);
    if (fixed.status !== 200 || fixed.body.status !== 'failed' || fixed.body.vulnerabilityReproduced || fixed.body.astFindings.length !== 0) throw new Error('Fixed login target did not reject the attack as expected');
    const malformed = await evaluate('trustx-login-sqli-v1', 'GET /admin');
    if (malformed.status !== 200 || malformed.body.status !== 'rejected') throw new Error('Malformed reproduction was not rejected');
    const oversized = await evaluate('trustx-login-sqli-v1', `POST /login\nusername=${'admin%27%20--'.padEnd(600, 'a')}\npassword=anything\nGET /admin`);
    if (oversized.status !== 200 || oversized.body.status !== 'rejected') throw new Error('Oversized reproduction was not rejected');
    const unsupported = await evaluate('trustx-unknown-v1', steps);
    if (unsupported.status !== 400) throw new Error('Unsupported target was not rejected');
    console.log('Login oracle check passed: vulnerable target reproduced, fixed target rejected, malformed input rejected.');
  } finally {
    server.kill();
    try { fs.unlinkSync(jobStorePath); } catch {}
  }
})().catch((error) => { console.error(error.message); server.kill(); process.exitCode = 1; });
