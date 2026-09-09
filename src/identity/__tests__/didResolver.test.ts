import { describe, it, expect } from 'vitest';
import { resolveDid } from '../didResolver';

describe('didResolver', () => {
  it('resolves DID to valid W3C DID document structure', () => {
    const did = 'did:trust:0x71c8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8';
    const doc = resolveDid(did);

    expect(doc.id).toBe(did);
    expect(doc.verificationMethod).toHaveLength(1);
    expect(doc.verificationMethod[0].controller).toBe(did);
    expect(doc.verificationMethod[0].type).toBe('JsonWebKey2020');
  });
});
