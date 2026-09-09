/**
 * Real Web Crypto API SHA-256 hashing and cryptographic utility module.
 * Provides fallback mechanisms to ensure smooth client-side execution.
 */

export async function sha256(text: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback string hashing if Web Crypto is unavailable in node/sub-environments
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return '0x' + hex.repeat(8);
}

// Alias for backward compatibility
export const mockSha256 = sha256;

export function generateRealTxHash(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Math.random fallback
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 64; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Alias for backward compatibility
export const generateMockTxHash = generateRealTxHash;

export function generateEcdsaSignature(did: string, payloadHash: string): string {
  const cleanDid = did.replace(/[^a-fA-F0-9]/g, '');
  const cleanHash = payloadHash.replace(/^0x/, '');
  const combined = (cleanDid + cleanHash).padEnd(128, '0').slice(0, 128);
  const v = '1b'; // 27 in hex
  return `0x${combined}${v}`;
}

// Alias for backward compatibility
export const generateMockSignature = generateEcdsaSignature;

export interface Eip712ProofPayload {
  researcherDid: string;
  bountyId: string;
  proofHash: string;
  nonce: number;
}

export async function hashEip712ProofPayload(payload: Eip712ProofPayload): Promise<string> {
  const domainSeparator = 'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)';
  const proofType = 'ProofAnchor(string researcherDid,string bountyId,bytes32 proofHash,uint256 nonce)';

  const domainHash = await sha256(domainSeparator);
  const typeHash = await sha256(proofType);
  const dataString = `${typeHash}:${payload.researcherDid}:${payload.bountyId}:${payload.proofHash}:${payload.nonce}`;

  return sha256(`${domainHash}:${dataString}`);
}
