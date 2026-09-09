import { describe, it, expect } from 'vitest';
import { issueTrustScoreCredential, issueTrustScoreCredentialAsync, verifyCredential } from '../vcManager';

describe('vcManager (W3C Verifiable Credentials Engine)', () => {
  it('issues a valid W3C Verifiable Credential', () => {
    const did = 'did:trust:0x71c8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8';
    const vc = issueTrustScoreCredential(did, 94, 18);

    expect(vc.id).toMatch(/^urn:uuid:vc-/);
    expect(vc.type).toContain('VerifiableCredential');
    expect(vc.type).toContain('TrustScoreCredential');
    expect(vc.credentialSubject.id).toBe(did);
    expect(vc.credentialSubject.trustScore).toBe(94);
    expect(vc.credentialSubject.verifiedBountiesCount).toBe(18);
    expect(vc.credentialSubject.reputationLevel).toBe('Master Researcher');
    expect(vc.proof.jws).toBeDefined();
  });

  it('verifies untampered Verifiable Credentials successfully', async () => {
    const did = 'did:trust:0x71c8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8';
    const vc = await issueTrustScoreCredentialAsync(did, 95, 20);

    const result = await verifyCredential(vc);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects missing JWS proof in tampered credentials', async () => {
    const did = 'did:trust:0x71c8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8';
    const vc = issueTrustScoreCredential(did, 94, 18);
    const tamperedVc = { ...vc, proof: { ...vc.proof, jws: '' } };

    const result = await verifyCredential(tamperedVc);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Missing cryptographic proof JWS signature');
  });
});
