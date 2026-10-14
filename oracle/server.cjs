const http = require('node:http');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const path = require('node:path');

const PORT = Number(process.env.ORACLE_PORT || 8787);
const MAX_BODY_BYTES = 32 * 1024;
const MAX_EXECUTION_MS = 5000;
const VERIFIER_VERSION = 'trustx-verifier-1';
const ALLOWED_ORIGIN = process.env.ORACLE_ALLOWED_ORIGIN || 'http://localhost:5173';
const GATEWAY_TOKEN = process.env.ORACLE_GATEWAY_TOKEN || '';
const WORKER_MODE = process.env.ORACLE_WORKER_MODE || 'process';
const WORKER_IMAGE = process.env.ORACLE_WORKER_IMAGE || 'trustx-oracle-worker:local';
const jobs = new Map();

const keyPair = process.env.ORACLE_SIGNING_PRIVATE_KEY_PEM
  ? crypto.createPrivateKey(process.env.ORACLE_SIGNING_PRIVATE_KEY_PEM)
  : crypto.generateKeyPairSync('ed25519').privateKey;
const publicKey = crypto.createPublicKey(keyPair);
const publicKeySpkiBase64 = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');

function hashJson(value) {
  return `0x${crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')}`;
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'content-type, x-trustx-gateway-token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  response.end(JSON.stringify(body));
}

function authorized(request) {
  if (GATEWAY_TOKEN && request.headers['x-trustx-gateway-token'] !== GATEWAY_TOKEN) return false;
  const origin = request.headers.origin;
  return !origin || origin === ALLOWED_ORIGIN;
}

function runWorker(payload) {
  return new Promise((resolve) => {
    const command = WORKER_MODE === 'docker' ? 'docker' : process.execPath;
    const args = WORKER_MODE === 'docker'
      ? ['run', '--rm', '--network', 'none', '--read-only', '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges', '--memory', '256m', '--cpus', '0.5', '-i', WORKER_IMAGE]
      : [path.join(__dirname, 'worker.cjs')];
    const worker = spawn(command, args, {
      cwd: __dirname,
      env: { PATH: process.env.PATH || '' },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    let output = '';
    let errorOutput = '';
    const timer = setTimeout(() => {
      worker.kill('SIGKILL');
      resolve({
        status: 'unavailable',
        coveragePercentage: 0,
        vulnerabilityCategory: 'Verifier timeout',
        logs: ['Execution exceeded the verifier timeout.']
      });
    }, MAX_EXECUTION_MS);
    worker.stdout.on('data', (chunk) => { output += chunk; });
    worker.stderr.on('data', (chunk) => { errorOutput += chunk; });
    worker.on('close', () => {
      clearTimeout(timer);
      try {
        const result = JSON.parse(output);
        resolve({ ...result, logs: [...(result.logs || []), ...(errorOutput ? [errorOutput.slice(0, 1000)] : [])] });
      } catch {
        resolve({
          status: 'unavailable',
          coveragePercentage: 0,
          vulnerabilityCategory: 'Verifier worker error',
          logs: ['The isolated verifier worker returned no structured result.']
        });
      }
    });
    worker.stdin.end(JSON.stringify(payload));
  });
}

async function evaluate(body) {
  if (typeof body.reportId !== 'string' || body.reportId.length > 128) throw new Error('Invalid reportId');
  if (typeof body.reproductionSteps !== 'string' || body.reproductionSteps.length === 0 || body.reproductionSteps.length > 16000) throw new Error('Invalid reproductionSteps');
  if (typeof body.evidenceHash !== 'string' || !/^0x[0-9a-f]{64}$/i.test(body.evidenceHash)) throw new Error('Invalid evidenceHash');
  if (typeof body.idempotencyKey !== 'string' || body.idempotencyKey.length < 8 || body.idempotencyKey.length > 128) throw new Error('Invalid idempotencyKey');

  const request = {
    reportId: body.reportId,
    reproductionSteps: body.reproductionSteps,
    evidenceHash: body.evidenceHash,
    targetVersion: 'trustx-settlement-v1',
    idempotencyKey: body.idempotencyKey
  };
  const requestHash = hashJson(request);
  const previous = jobs.get(body.idempotencyKey);
  if (previous) return previous;

  const executionId = `exec-${crypto.randomUUID()}`;
  const workerResult = await runWorker(request);
  const unsigned = {
    executionId,
    reportId: request.reportId,
    requestHash,
    evidenceHash: request.evidenceHash,
    status: workerResult.status,
    coveragePercentage: workerResult.coveragePercentage,
    logs: workerResult.logs,
    vulnerabilityCategory: workerResult.vulnerabilityCategory,
    executedAt: new Date().toISOString(),
    verifierVersion: VERIFIER_VERSION,
    targetVersion: request.targetVersion,
    executionMode: 'isolated_remote_oracle',
    signingKeyId: 'default-ed25519'
  };
  const signature = crypto.sign(null, Buffer.from(JSON.stringify(unsigned)), keyPair).toString('base64');
  const result = { ...unsigned, signature, publicKeySpkiBase64 };
  jobs.set(body.idempotencyKey, result);
  return result;
}

const server = http.createServer((request, response) => {
  if (request.method === 'OPTIONS') return sendJson(response, 204, {});
  if (!authorized(request)) return sendJson(response, 401, { error: 'Unauthorized verifier request' });
  if (request.method === 'GET' && request.url === '/health') return sendJson(response, 200, { status: 'ok', verifierVersion: VERIFIER_VERSION });
  if (request.method === 'GET' && request.url === '/public-key') return sendJson(response, 200, { signingKeyId: 'default-ed25519', publicKeySpkiBase64 });
  if (request.method !== 'POST' || request.url !== '/evaluate') return sendJson(response, 404, { error: 'Not found' });

  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) request.destroy();
  });
  request.on('end', async () => {
    try {
      const result = await evaluate(JSON.parse(body));
      sendJson(response, 200, result);
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });
});

server.listen(PORT, () => {
  console.log(`TrustX oracle verifier listening on http://localhost:${PORT}`);
  if (!process.env.ORACLE_SIGNING_PRIVATE_KEY_PEM) console.warn('Using an ephemeral signing key; configure ORACLE_SIGNING_PRIVATE_KEY_PEM for a stable verifier identity.');
});
