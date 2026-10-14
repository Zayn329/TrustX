import { describe, it, expect, vi, afterEach } from 'vitest';
import { runSandboxEvaluation } from '../../oracle/sandboxRunner';

describe('sandboxRunner (remote technical verifier)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('fails closed when the verifier is unavailable', async () => {
    await expect(runSandboxEvaluation('reproduction steps')).rejects.toThrow();
  });

  it('accepts only a structured remote verifier result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      executionId: 'exec-123',
      status: 'passed',
      coveragePercentage: 91,
      logs: ['remote execution complete'],
      vulnerabilityCategory: 'Reentrancy Vulnerability',
      executedAt: '2026-10-14T00:00:00.000Z'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })));

    const result = await runSandboxEvaluation('reproduction steps');
    expect(result.executionMode).toBe('remote_oracle');
    expect(result.executionId).toBe('exec-123');
    expect(result.status).toBe('passed');
  });

  it('rejects an unavailable verifier instead of fabricating a result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    await expect(runSandboxEvaluation('reproduction steps')).rejects.toThrow(/HTTP 503/);
  });
});
