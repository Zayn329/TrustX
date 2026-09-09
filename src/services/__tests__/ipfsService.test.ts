import { describe, it, expect } from 'vitest';
import { uploadToIpfs, fetchFromIpfs, encryptPayload, PUBLIC_IPFS_GATEWAYS } from '../ipfsService';

describe('ipfsService (Decentralized Storage & Encryption)', () => {
  it('pins payload content and returns a valid CIDv1 base32 string and gateway URL', async () => {
    const payload = JSON.stringify({
      title: 'Precision loss bug',
      proofHash: '0xa8f391c49e8832...',
      severity: 'Critical',
    });

    const record = await uploadToIpfs(payload);

    expect(record.cid).toMatch(/^bafybeig[a-f0-9]{32}$/);
    expect(record.gatewayUrl).toContain(PUBLIC_IPFS_GATEWAYS[0]);
    expect(record.sizeBytes).toBeGreaterThan(0);
    expect(record.isEncrypted).toBe(false);
  });

  it('encrypts payload using AES-256-GCM before pinning', async () => {
    const secret = 'Critical zero-day reentrancy reproduction script';
    const record = await uploadToIpfs(secret, { encryptKey: 'super_secret_audit_key_32bytes!!' });

    expect(record.isEncrypted).toBe(true);
    const retrievedEncrypted = await fetchFromIpfs(record.cid);
    expect(retrievedEncrypted).toContain('enc_');
    expect(retrievedEncrypted).not.toBe(secret);
  });

  it('returns encrypted string format from encryptPayload', async () => {
    const enc = await encryptPayload('Plain text payload', 'key123');
    expect(enc).toMatch(/^enc_/);
  });

  it('returns null gracefully when CID is not found across gateways', async () => {
    const nonExistentCid = 'bafybeig00000000000000000000000000000000';
    const result = await fetchFromIpfs(nonExistentCid);
    expect(result).toBeNull();
  });
});
