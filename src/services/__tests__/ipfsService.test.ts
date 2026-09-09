import { describe, it, expect } from 'vitest';
import { uploadToIpfs } from '../ipfsService';

describe('ipfsService', () => {
  it('pins payload content and returns a mock CID and gateway URL', async () => {
    const payload = JSON.stringify({
      title: 'Precision loss bug',
      proofHash: '0xa8f391c49e8832...',
      severity: 'Critical',
    });

    const record = await uploadToIpfs(payload);

    expect(record.cid).toMatch(/^bafybeig[a-f0-9]{32}$/);
    expect(record.gatewayUrl).toContain('https://ipfs.io/ipfs/bafybeig');
    expect(record.sizeBytes).toBeGreaterThan(0);
  });
});
