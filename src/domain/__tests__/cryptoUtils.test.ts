import { describe, it, expect } from 'vitest';
import { sha256, mockSha256, generateRealTxHash, generateEcdsaSignature } from '../cryptoUtils';

describe('cryptoUtils (Real Web Crypto API & Cryptographic Utilities)', () => {
  it('computes real SHA-256 hash using Web Crypto API', async () => {
    const text = 'Precision loss in liquidity pool calculation allows token drain';
    const hash = await sha256(text);

    expect(hash).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it('maintains mockSha256 backward compatibility alias', async () => {
    const text = 'Reentrancy vulnerability payload';
    const hash1 = await sha256(text);
    const hash2 = await mockSha256(text);

    expect(hash1).toBe(hash2);
  });

  it('generates cryptographically random 256-bit Ethereum tx hashes', () => {
    const txHash = generateRealTxHash();
    expect(txHash).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it('generates 65-byte formatted ECDSA signature string with 0x prefix', () => {
    const sig = generateEcdsaSignature(
      'did:trust:0x71c8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
      '0xa8f391c49e8832a104b291c7784f1122aef902b54d6199321c882103410f11aa'
    );

    expect(sig).toMatch(/^0x[a-f0-9]{130}$/);
  });
});
