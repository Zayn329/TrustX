import { describe, it, expect } from 'vitest';
import { generateHash, generateSignature } from '../crypto';
import { calculateTrustScore } from '../trustScore';
import { getNextEscrowState, calculatePayout } from '../escrow';
import { evaluateSybilRisk } from '../sybil';
import { VulnerabilityReport, TechnicalVerification } from '../../types';

describe('Crypto Domain Logic', () => {
  it('generates consistent 0x-prefixed 64-char hex hashes', () => {
    const hash1 = generateHash('hello-world');
    const hash2 = generateHash('hello-world');
    const hash3 = generateHash('different-content');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash1.startsWith('0x')).toBe(true);
    expect(hash1.length).toBe(66); // '0x' + 64 hex characters
  });

  it('generates cryptographic researcher signature format', () => {
    const sig = generateSignature('did:trust:0x123', '0xabc');
    expect(sig.startsWith('sig_edd25519_')).toBe(true);
  });
});

describe('Trust Score Calculation', () => {
  it('calculates trust score deterministically within bounds [0, 1000]', () => {
    const mockReports: VulnerabilityReport[] = [
      {
        id: 'rep-1',
        bountyId: 'bounty-1',
        bountyTitle: 'Vault Security',
        researcherDid: 'did:trust:alex',
        researcherHandle: 'alex',
        title: 'Reentrancy Vulnerability',
        vulnerabilityType: 'Smart Contract',
        severity: 'CRITICAL',
        description: 'Desc',
        reproductionSteps: 'Steps',
        impact: 'High',
        status: 'VERIFIED_VALID',
        createdAt: Date.now(),
        proof: {
          proofId: 'proof-1',
          submissionId: 'rep-1',
          researcherDid: 'did:trust:alex',
          evidenceHash: '0x123',
          contentHash: '0x456',
          signature: 'sig_123',
          timestamp: Date.now(),
          blockHash: '0xblock',
          blockNumber: 1,
          isCryptographicallyProven: true,
        },
      },
    ];

    const mockVerifications: TechnicalVerification[] = [
      {
        id: 'ver-1',
        submissionId: 'rep-1',
        verifierDid: 'did:trust:org',
        verifierName: 'DeFi Labs',
        status: 'VERIFIED_VALID',
        assessedSeverity: 'CRITICAL',
        payoutAmount: 15000,
        verificationNotes: 'Valid',
        verifiedAt: Date.now(),
        txHash: '0xtx',
      },
    ];

    const breakdown = calculateTrustScore(mockReports, mockVerifications);
    expect(breakdown.overallScore).toBeGreaterThan(0);
    expect(breakdown.overallScore).toBeLessThanOrEqual(1000);
    expect(breakdown.technicalContributions).toBeGreaterThan(0);
  });
});

describe('Escrow Logic', () => {
  it('transitions escrow states correctly', () => {
    expect(getNextEscrowState('AWAITING_DEPOSIT', 'DEPOSIT')).toBe('DEPOSITED_LOCKED');
    expect(getNextEscrowState('DEPOSITED_LOCKED', 'VERIFY_SUCCESS')).toBe('RELEASED');
    expect(getNextEscrowState('DEPOSITED_LOCKED', 'RAISE_DISPUTE')).toBe('DISPUTED_FROZEN');
    expect(getNextEscrowState('DISPUTED_FROZEN', 'RESOLVE_DISPUTE_PAY')).toBe('RELEASED');
  });

  it('calculates payout tier amounts correctly', () => {
    const rewards = { critical: 10000, high: 5000, medium: 2000, low: 500 };
    expect(calculatePayout('CRITICAL', rewards)).toBe(10000);
    expect(calculatePayout('LOW', rewards)).toBe(500);
  });
});

describe('Sybil Risk Evaluation', () => {
  it('evaluates sybil risk score correctly', () => {
    const sybil = evaluateSybilRisk('did:trust:alex', [], Date.now() - 3600 * 24 * 1000); // 1 day old
    expect(sybil.riskScore).toBeGreaterThan(0);
    expect(sybil.flaggedSignals).toContain('New account (< 7 days old)');
  });
});
