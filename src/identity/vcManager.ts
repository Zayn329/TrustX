export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: {
    id: string;
    trustScore: number;
    verifiedBountiesCount: number;
    reputationLevel: string;
  };
  proof: {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    jws: string;
  };
}

export function issueTrustScoreCredential(
  did: string,
  trustScore: number,
  verifiedBountiesCount: number
): VerifiableCredential {
  const now = new Date().toISOString();
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.trustengine.io/v1'
    ],
    id: `urn:uuid:vc-${Date.now()}`,
    type: ['VerifiableCredential', 'TrustScoreCredential'],
    issuer: 'did:trust:0xorg_nexus_pay',
    issuanceDate: now,
    credentialSubject: {
      id: did,
      trustScore,
      verifiedBountiesCount,
      reputationLevel: trustScore >= 90 ? 'Master Researcher' : 'Senior Researcher'
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: now,
      proofPurpose: 'assertionMethod',
      verificationMethod: 'did:trust:0xorg_nexus_pay#key-1',
      jws: 'eyJhbGciOiJFZERTQSI...eyJpc3MiOiJkaWQ6dHJ1c3Q'
    }
  };
}
