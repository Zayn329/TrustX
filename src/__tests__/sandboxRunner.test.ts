import { describe, it, expect } from 'vitest';
import { runSandboxEvaluation } from '../../oracle/sandboxRunner';

describe('sandboxRunner (Oracle Verification Engine)', () => {
  it('executes isolated PoC verification simulation successfully', async () => {
    const reproSteps = '1. Call deposit(100)\n2. Trigger reentrancy flaw in withdraw()';
    const result = await runSandboxEvaluation(reproSteps);

    expect(result.executionId).toMatch(/^exec-\d+$/);
    expect(result.status).toBe('passed');
    expect(result.coveragePercentage).toBeGreaterThan(90);
    expect(result.logs.length).toBeGreaterThan(0);
    expect(result.logs[0]).toContain('[ORACLE]');
  });
});
