/**
 * Pure Domain Function: Deterministic SHA-256 string hashing simulation.
 * Uses a standard fast cyrb53/sha-sim string hashing technique to generate 0x-prefixed 64-char hex strings.
 */
export function generateHash(input: string): string {
  let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
  for (let i = 0, ch; i < input.length; i++) {
    ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hashVal = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
  // Replicate 64-character 256-bit hash format deterministically
  return `0x${hashVal}${hashVal}${hashVal}${hashVal}`;
}

/**
 * Generates cryptographic signature representation for a Researcher DID.
 */
export function generateSignature(did: string, contentHash: string): string {
  const raw = `${did}::SIG::${contentHash}`;
  return `sig_edd25519_${generateHash(raw).slice(2, 34)}`;
}
