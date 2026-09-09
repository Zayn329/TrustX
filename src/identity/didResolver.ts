export interface W3cDidDocument {
  '@context': string[];
  id: string;
  verificationMethod: {
    id: string;
    type: string;
    controller: string;
    publicKeyJwk: {
      kty: string;
      crv: string;
      x: string;
      y?: string;
    };
  }[];
  authentication: string[];
  assertionMethod: string[];
}

export function parseDid(did: string): { method: string; identifier: string } | null {
  const parts = did.split(':');
  if (parts.length >= 3 && parts[0] === 'did') {
    return {
      method: parts[1],
      identifier: parts.slice(2).join(':')
    };
  }
  return null;
}

export function validateDidFormat(did: string): boolean {
  return parseDid(did) !== null;
}

export function resolveDid(did: string): W3cDidDocument {
  const parsed = parseDid(did);
  const identifier = parsed ? parsed.identifier : '0x0000000000000000000000000000000000000000';
  const cleanId = identifier.replace(/^0x/, '').padEnd(64, '0');

  const keyId = `${did}#key-1`;

  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/jws-2020/v1'
    ],
    id: did,
    verificationMethod: [
      {
        id: keyId,
        type: 'JsonWebKey2020',
        controller: did,
        publicKeyJwk: {
          kty: 'EC',
          crv: 'secp256k1',
          x: cleanId.slice(0, 32),
          y: cleanId.slice(32, 64)
        }
      }
    ],
    authentication: [keyId],
    assertionMethod: [keyId]
  };
}
