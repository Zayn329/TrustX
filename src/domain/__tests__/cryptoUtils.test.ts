import { describe, it, expect } from 'vitest';
import { mockSha256, generateMockTxHash, generateMockSignature } from '../cryptoUtils';

describe('cryptoUtils', () => {
  it('generates consistent SHA-256 hash for identical string content', async () => {
    const input = 'Vulnerability report payload data';
    const hash1 = await mockSha256(input);
    const hash2 = await mockSha256(input);

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it('produces different hash for modified content (avoids hash collisions)', async () => {
    const hashA = await mockSha256('Report V1');
    const hashB = await mockSha256('Report V2');

    expect(hashA).not.toBe(hashB);
  });

  it('generates mock tx hashes with 0x prefix and length 66', () => {
    const txHash = generateMockTxHash();
    expect(txHash).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it('generates pseudo-signatures formatted with sig_ prefix', () => {
    const sig = generateMockSignature('did:trust:0x123456', '0xa8f391c49e8832');
    expect(sig).toContain('sig_123456_a8f391c4');
  });
});
