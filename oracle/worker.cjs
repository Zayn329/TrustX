const readline = require('node:readline');

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

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const result = execute(JSON.parse(input));
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
