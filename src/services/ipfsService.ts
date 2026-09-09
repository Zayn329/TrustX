export interface IpfsUploadResult {
  cid: string;
  gatewayUrl: string;
  sizeBytes: number;
}

export async function uploadToIpfs(content: string): Promise<IpfsUploadResult> {
  // Simulate client-side Helia/Pinata IPFS pinning
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const mockCid = 'bafybeig' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);

  return {
    cid: mockCid,
    gatewayUrl: `https://ipfs.io/ipfs/${mockCid}`,
    sizeBytes: data.length
  };
}
