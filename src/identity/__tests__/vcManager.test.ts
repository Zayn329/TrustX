import { describe, it, expect } from 'vitest';
import { issueTrustScoreCredential } from '../vcManager';

describe('vcManager', () => {
  it('issues a valid Verifiable Credential conforming to W3C structure', () => {
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
});
