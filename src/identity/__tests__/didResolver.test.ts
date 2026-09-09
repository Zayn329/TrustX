import { describe, it, expect } from 'vitest';
import { resolveDid, parseDid, validateDidFormat } from '../didResolver';

describe('didResolver (W3C DID Document Resolution)', () => {
  it('parses DID method and identifier', () => {
    const parsed = parseDid('did:trust:0x71c8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8');
    expect(parsed?.method).toBe('trust');
    expect(parsed?.identifier).toBe('0x71c8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8');
  });

  it('validates DID string format', () => {
    expect(validateDidFormat('did:trust:0x123')).toBe(true);
    expect(validateDidFormat('invalid-did')).toBe(false);
  });

  it('resolves DID to valid W3C DID document with assertionMethod and JWK key', () => {
    const did = 'did:trust:0x71c8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8';
    const doc = resolveDid(did);

    expect(doc.id).toBe(did);
    expect(doc.verificationMethod[0].controller).toBe(did);
    expect(doc.verificationMethod[0].publicKeyJwk.kty).toBe('EC');
    expect(doc.assertionMethod).toContain(`${did}#key-1`);
  });
});
