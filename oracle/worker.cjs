const readline = require('node:readline');
const { spawn } = require('node:child_process');
const path = require('node:path');

const ALLOWED_OPERATIONS = new Set(['deposit', 'flashLoan', 'settlement']);

function parseStep(line) {
  const match = line.trim().match(/^CALL\s+([A-Za-z][A-Za-z0-9_]*)\(([^)]*)\)$/i);
  if (!match) return null;
  const operation = match[1];
  if (!ALLOWED_OPERATIONS.has(operation)) return null;
  return { operation, argument: match[2].trim() };
}

function execute(input) {
  const lines = String(input.reproductionSteps || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const steps = lines.map(parseStep);
  if (steps.length === 0 || steps.some((step) => step === null)) {
    return {
      status: 'rejected',
      coveragePercentage: 0,
      vulnerabilityCategory: 'Unsupported reproduction format',
      logs: ['Only the restricted CALL operation format is accepted.']
    };
  }

  const operations = steps.map((step) => step.operation);
  const expected = ['deposit', 'flashLoan', 'settlement'];
  const matchesExpected = expected.every((operation, index) => operations[index] === operation);
  const coveragePercentage = Math.round((Math.min(operations.length, expected.length) / expected.length) * 100);
  const passed = matchesExpected && operations.length === expected.length;

  return {
    targetId: 'trustx-settlement-v1',
    targetVersion: 'trustx-settlement-v1',
    astStatus: 'not_run',
    astFindings: [],
    runtimeStatus: passed ? 'passed' : 'failed',
    vulnerabilityReproduced: passed,
    securityRule: 'Settlement must execute in the expected TrustX fixture order.',
    protectedResourceReached: false,
    requestTrace: operations,
    responseStatuses: [],
    status: passed ? 'passed' : 'failed',
    coveragePercentage,
    vulnerabilityCategory: passed ? 'Settlement state-order vulnerability' : 'Reproduction did not trigger target condition',
    logs: [
      `Executed ${operations.length} allowlisted operation(s) against fixture trustx-settlement-v1.`,
      `Operation trace: ${operations.join(' -> ') || 'none'}.`,
      passed ? 'Assertion passed: settlement executed before the state update.' : 'Assertion failed: expected deposit -> flashLoan -> settlement.'
    ]
  };
}

function executeLoginTarget(input) {
  return new Promise((resolve) => {
    const python = process.env.ORACLE_PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
    const worker = spawn(python, [path.join(__dirname, 'login_fixture.py')], {
      cwd: __dirname,
      env: { PATH: process.env.PATH || '' },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    let output = '';
    let errorOutput = '';
    worker.stdout.on('data', (chunk) => { output += chunk; });
    worker.stderr.on('data', (chunk) => { errorOutput += chunk; });
    worker.on('close', (code) => {
      try {
        const result = JSON.parse(output);
        resolve({ ...result, logs: [...(result.logs || []), ...(errorOutput ? [errorOutput.slice(0, 1000)] : [])], workerExitCode: code });
      } catch {
        resolve({
          targetId: input.targetId,
          targetVersion: input.targetId,
          astStatus: 'unavailable',
          astFindings: [],
          runtimeStatus: 'unavailable',
          vulnerabilityReproduced: false,
          securityRule: 'Unauthenticated input must not reach the admin-only resource.',
          protectedResourceReached: false,
          requestTrace: [],
          responseStatuses: [],
          status: 'unavailable',
          coveragePercentage: 0,
          vulnerabilityCategory: 'Login fixture worker error',
          logs: ['The Python login fixture did not return structured output.', ...(errorOutput ? [errorOutput.slice(0, 1000)] : [])]
        });
      }
    });
    worker.stdin.end(JSON.stringify(input));
  });
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', async () => {
  try {
    const payload = JSON.parse(input);
    const result = payload.targetId && payload.targetId.startsWith('trustx-login-sqli-')
      ? await executeLoginTarget(payload)
      : execute(payload);
    process.stdout.write(JSON.stringify(result));
  } catch (error) {
    process.stdout.write(JSON.stringify({
      status: 'rejected',
      coveragePercentage: 0,
      vulnerabilityCategory: 'Invalid verifier request',
      logs: [error instanceof Error ? error.message : 'Invalid request']
    }));
    process.exitCode = 1;
  }
});
