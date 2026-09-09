/**
 * Simple client-side deterministic SHA-256 hashing mock utility for demonstration proofs.
 */
export async function mockSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateMockTxHash(): string {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 64; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function generateMockSignature(did: string, hash: string): string {
  return `sig_${did.slice(-6)}_${hash.slice(2, 10)}`;
}
