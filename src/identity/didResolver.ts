export interface W3cDidDocument {
  id: string;
  verificationMethod: {
    id: string;
    type: string;
    controller: string;
    publicKeyJwk: Record<string, string>;
  }[];
}

export function resolveDid(did: string): W3cDidDocument {
  return {
    id: did,
    verificationMethod: [
      {
        id: `${did}#key-1`,
        type: 'JsonWebKey2020',
        controller: did,
        publicKeyJwk: {
          kty: 'EC',
          crv: 'secp256k1',
          x: 'f8391c49e8832a104b291c7784f1122aef902b54d6199321c882103410f11aa'
        }
      }
    ]
  };
}
