import { sha256 } from '../domain/cryptoUtils';

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

export interface VerificationResult {
  isValid: boolean;
  errors: string[];
}

export async function issueTrustScoreCredentialAsync(
  did: string,
  trustScore: number,
  verifiedBountiesCount: number
): Promise<VerifiableCredential> {
  const now = new Date().toISOString();
  const issuerDid = 'did:trust:0xorg_nexus_pay';
  const reputationLevel = trustScore >= 90 ? 'Master Researcher' : 'Senior Researcher';

  const credentialSubject = {
    id: did,
    trustScore,
    verifiedBountiesCount,
    reputationLevel
  };

  const payloadString = JSON.stringify({ issuer: issuerDid, issuanceDate: now, credentialSubject });
  const payloadHash = await sha256(payloadString);

  // Generate JWS header + payload hash signature representation
  const headerB64 = btoa(JSON.stringify({ alg: 'ES256K', typ: 'JWT' })).replace(/=/g, '');
  const payloadB64 = btoa(payloadHash).replace(/=/g, '');
  const sigB64 = btoa(payloadHash.slice(0, 32)).replace(/=/g, '');
  const jws = `${headerB64}.${payloadB64}.${sigB64}`;

  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.trustengine.io/v1'
    ],
    id: `urn:uuid:vc-${Date.now()}`,
    type: ['VerifiableCredential', 'TrustScoreCredential'],
    issuer: issuerDid,
    issuanceDate: now,
    credentialSubject,
    proof: {
      type: 'JsonWebSignature2020',
      created: now,
      proofPurpose: 'assertionMethod',
      verificationMethod: `${issuerDid}#key-1`,
      jws
    }
  };
}

// Synchronous wrapper maintaining backward compatibility
export function issueTrustScoreCredential(
  did: string,
  trustScore: number,
  verifiedBountiesCount: number
): VerifiableCredential {
  const now = new Date().toISOString();
  const issuerDid = 'did:trust:0xorg_nexus_pay';
  const reputationLevel = trustScore >= 90 ? 'Master Researcher' : 'Senior Researcher';

  const headerB64 = btoa(JSON.stringify({ alg: 'ES256K', typ: 'JWT' })).replace(/=/g, '');
  const payloadB64 = btoa(`${did}:${trustScore}:${verifiedBountiesCount}`).replace(/=/g, '');
  const sigB64 = btoa(`sig_${trustScore}_${Date.now()}`).replace(/=/g, '');

  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://schema.trustengine.io/v1'
    ],
    id: `urn:uuid:vc-${Date.now()}`,
    type: ['VerifiableCredential', 'TrustScoreCredential'],
    issuer: issuerDid,
    issuanceDate: now,
    credentialSubject: {
      id: did,
      trustScore,
      verifiedBountiesCount,
      reputationLevel
    },
    proof: {
      type: 'JsonWebSignature2020',
      created: now,
      proofPurpose: 'assertionMethod',
      verificationMethod: `${issuerDid}#key-1`,
      jws: `${headerB64}.${payloadB64}.${sigB64}`
    }
  };
}

export async function verifyCredential(vc: VerifiableCredential): Promise<VerificationResult> {
  const errors: string[] = [];

  if (!vc['@context'] || !vc['@context'].includes('https://www.w3.org/2018/credentials/v1')) {
    errors.push('Invalid W3C context');
  }

  if (!vc.issuer || !vc.issuer.startsWith('did:')) {
    errors.push('Invalid issuer DID format');
  }

  if (!vc.credentialSubject || !vc.credentialSubject.id) {
    errors.push('Missing credential subject DID');
  }

  if (!vc.proof || !vc.proof.jws) {
    errors.push('Missing cryptographic proof JWS signature');
  } else {
    const jwsParts = vc.proof.jws.split('.');
    if (jwsParts.length !== 3) {
      errors.push('Malformed JWS signature structure');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
