import { describe, it, expect, vi, afterEach } from 'vitest';
import { runSandboxEvaluation } from '../../oracle/sandboxRunner';
import { sha256 } from '../domain/cryptoUtils';

describe('sandboxRunner (remote technical verifier)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fails closed when the verifier is unavailable', async () => {
    await expect(runSandboxEvaluation('reproduction steps')).rejects.toThrow();
  });

  it('accepts only a structured remote verifier result', async () => {
    const evidenceHash = `0x${'a'.repeat(64)}`;
    const reportId = 'rep-test';
    const bountyId = 'bounty-test';
    const scope = ['fixture://trustx-settlement-v1'];
    const reproductionSteps = 'CALL deposit(1000)';
    const idempotencyKey = 'idempotency-test';
    const requestHash = await sha256(JSON.stringify({
      reportId,
      reproductionSteps,
      evidenceHash,
      bountyId,
      scope,
      targetId: 'trustx-settlement-v1',
      targetVersion: 'trustx-settlement-v1',
      idempotencyKey
    }));
    vi.spyOn(crypto.subtle, 'importKey').mockResolvedValue({} as CryptoKey);
    vi.spyOn(crypto.subtle, 'verify').mockResolvedValue(true);
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ requestToken: 'request-token-123456789' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
      executionId: 'exec-123',
      reportId,
      bountyId,
      scope,
      targetId: 'trustx-settlement-v1',
      requestHash,
      evidenceHash,
      status: 'passed',
      coveragePercentage: 91,
      logs: ['remote execution complete'],
      vulnerabilityCategory: 'Reentrancy Vulnerability',
      executedAt: '2026-10-14T00:00:00.000Z',
      verifierVersion: 'trustx-verifier-1',
      targetVersion: 'trustx-settlement-v1',
      executionMode: 'isolated_remote_oracle',
      astFindings: [],
      signingKeyId: 'default-ed25519',
      signature: 'AA==',
      publicKeySpkiBase64: 'AA=='
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })));

    const result = await runSandboxEvaluation({ reportId, bountyId, scope, reproductionSteps, evidenceHash, idempotencyKey });
    expect(result.executionMode).toBe('isolated_remote_oracle');
    expect(result.executionId).toBe('exec-123');
    expect(result.status).toBe('passed');
  });

  it('rejects an unavailable verifier instead of fabricating a result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    await expect(runSandboxEvaluation('reproduction steps')).rejects.toThrow(/session failed HTTP 503/);
  });

  it('rejects a result bound to different evidence', async () => {
    const evidenceHash = `0x${'a'.repeat(64)}`;
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ requestToken: 'request-token-123456789' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
      executionId: 'exec-tampered', reportId: 'rep-other', bountyId: 'bounty-test', scope: [], targetId: 'trustx-settlement-v1', requestHash: '0xwrong', evidenceHash,
      status: 'passed', coveragePercentage: 100, logs: [], vulnerabilityCategory: 'Tampered',
      executedAt: '2026-10-14T00:00:00.000Z', verifierVersion: 'trustx-verifier-1',
      targetVersion: 'trustx-settlement-v1', executionMode: 'isolated_remote_oracle',
      astFindings: [],
      signingKeyId: 'default-ed25519', signature: 'AA==', publicKeySpkiBase64: 'AA=='
      }), { status: 200 })));
    await expect(runSandboxEvaluation({ reportId: 'rep-test', reproductionSteps: 'CALL deposit(1000)', evidenceHash })).rejects.toThrow(/bound to different evidence/);
  });
});
