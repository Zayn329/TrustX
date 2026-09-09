import { describe, it, expect } from 'vitest';
import { runSandboxEvaluation } from '../../oracle/sandboxRunner';

describe('sandboxRunner (Oracle Verification Engine)', () => {
  it('executes isolated PoC verification simulation successfully', async () => {
    const reproSteps = '1. Call deposit(100)\n2. Trigger reentrancy flaw in withdraw()';
    const result = await runSandboxEvaluation(reproSteps);

    expect(result.executionId).toMatch(/^exec-\d+$/);
    expect(result.status).toBe('passed');
    expect(result.vulnerabilityCategory).toBe('Reentrancy Vulnerability');
    expect(result.coveragePercentage).toBeGreaterThan(85);
    expect(result.logs.length).toBeGreaterThan(0);
    expect(result.logs[0]).toContain('[ORACLE]');
  });

  it('detects precision loss category correctly', async () => {
    const reproSteps = 'Precision loss in liquidity pool calculation allows token drain';
    const result = await runSandboxEvaluation(reproSteps);

    expect(result.vulnerabilityCategory).toBe('Precision Loss / Math Underflow');
    expect(result.status).toBe('passed');
  });

  it('handles explicit fail payloads gracefully with failed status', async () => {
    const reproSteps = 'invalid malicious exploit script';
    const result = await runSandboxEvaluation(reproSteps);

    expect(result.status).toBe('failed');
    expect(result.logs[result.logs.length - 1]).toContain('FAILED');
  });
});
