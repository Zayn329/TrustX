import { describe, it, expect } from 'vitest';
import { uploadToIpfs, fetchFromIpfs, PUBLIC_IPFS_GATEWAYS } from '../ipfsService';

describe('ipfsService (Decentralized Storage & Gateway Resolver)', () => {
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
  });

  it('retrieves pinned content successfully from storage cache', async () => {
    const secretPayload = 'Encrypted PoC Exploit Code';
    const record = await uploadToIpfs(secretPayload);

    const retrieved = await fetchFromIpfs(record.cid);
    expect(retrieved).toBe(secretPayload);
  });

  it('returns null gracefully when CID is not found across gateways', async () => {
    const nonExistentCid = 'bafybeig00000000000000000000000000000000';
    const result = await fetchFromIpfs(nonExistentCid);
    expect(result).toBeNull();
  });
});
