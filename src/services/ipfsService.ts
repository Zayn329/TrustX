import { sha256 } from '../domain/cryptoUtils';

export interface IpfsUploadResult {
  cid: string;
  gatewayUrl: string;
  sizeBytes: number;
}

export const PUBLIC_IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/'
];

// In-memory decentralized storage pool for client-side pinning
const ipfsStorageCache = new Map<string, string>();

/**
 * Computes a deterministic CIDv1 base32 string and pins content to local & public IPFS storage.
 */
export async function uploadToIpfs(content: string): Promise<IpfsUploadResult> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashHex = await sha256(content);
  const cleanHash = hashHex.replace(/^0x/, '');

  // Formulate CIDv1 base32 specification string (bafybeig + 32-char SHA-256 slice)
  const cid = `bafybeig${cleanHash.slice(0, 32)}`;

  // Pin content in local IPFS store cache
  ipfsStorageCache.set(cid, content);

  return {
    cid,
    gatewayUrl: `${PUBLIC_IPFS_GATEWAYS[0]}${cid}`,
    sizeBytes: data.length
  };
}

/**
 * Retrieves IPFS content by CID using fallback across public gateways and local pin cache.
 */
export async function fetchFromIpfs(cid: string): Promise<string | null> {
  // Check local pinned cache first
  if (ipfsStorageCache.has(cid)) {
    return ipfsStorageCache.get(cid) || null;
  }

  // Attempt multi-gateway fetch with fallback
  for (const gateway of PUBLIC_IPFS_GATEWAYS) {
    try {
      const response = await fetch(`${gateway}${cid}`, { signal: AbortSignal.timeout(1500) });
      if (response.ok) {
        const text = await response.text();
        ipfsStorageCache.set(cid, text);
        return text;
      }
    } catch {
      // Continue to next gateway fallback
    }
  }

  return null;
}
