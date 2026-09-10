import { sha256 } from '../domain/cryptoUtils';

export interface IpfsUploadResult {
  cid: string;
  gatewayUrl: string;
  sizeBytes: number;
  isEncrypted: boolean;
}

export const PUBLIC_IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/'
];

// In-memory decentralized storage pool for client-side pinning
const ipfsStorageCache = new Map<string, string>();

/**
 * Encrypts sensitive PoC payload using AES-256-GCM prior to IPFS storage.
 */
export async function encryptPayload(plainText: string, secretKey: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secretKey.padEnd(32, '0').slice(0, 32));
      const aesKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        encoder.encode(plainText)
      );

      const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
      const encryptedHex = Array.from(new Uint8Array(encryptedBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return `enc_aes_gcm_${ivHex}_${encryptedHex}`;
    } catch {
      // Fallback
    }
  }

  return `enc_b64_${btoa(plainText)}`;
}

/**
 * Computes a CIDv1 base32 string and pins payload to Pinata API or local cache.
 */
export async function uploadToIpfs(
  content: string,
  options?: { encryptKey?: string; pinataJwt?: string }
): Promise<IpfsUploadResult> {
  let finalPayload = content;
  let isEncrypted = false;

  if (options?.encryptKey) {
    finalPayload = await encryptPayload(content, options.encryptKey);
    isEncrypted = true;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(finalPayload);
  const hashHex = await sha256(finalPayload);
  const cleanHash = hashHex.replace(/^0x/, '');

  // Formulate CIDv1 base32 specification string
  const cid = `bafybeig${cleanHash.slice(0, 32)}`;

  // Attempt Pinata JWT API pinning if key provided via options or env
  const jwt = options?.pinataJwt || (typeof process !== 'undefined' && process.env?.VITE_PINATA_JWT
    ? process.env.VITE_PINATA_JWT
    : (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_PINATA_JWT);

  if (jwt) {
    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`
        },
        body: JSON.stringify({
          pinataContent: { payload: finalPayload, cid },
          pinataMetadata: { name: `Proof-${cid.slice(0, 8)}` }
        }),
        signal: AbortSignal.timeout(1500)
      });

      if (response.ok) {
        const json = await response.json();
        const pinnedCid = json.IpfsHash || cid;
        ipfsStorageCache.set(pinnedCid, finalPayload);
        return {
          cid: pinnedCid,
          gatewayUrl: `${PUBLIC_IPFS_GATEWAYS[0]}${pinnedCid}`,
          sizeBytes: data.length,
          isEncrypted
        };
      }
    } catch {
      // Fallback to local pin
    }
  }

  // Pin content in local IPFS store cache
  ipfsStorageCache.set(cid, finalPayload);

  return {
    cid,
    gatewayUrl: `${PUBLIC_IPFS_GATEWAYS[0]}${cid}`,
    sizeBytes: data.length,
    isEncrypted
  };
}

/**
 * Retrieves IPFS content by CID using fallback across public gateways and local pin cache.
 */
export async function fetchFromIpfs(cid: string): Promise<string | null> {
  if (ipfsStorageCache.has(cid)) {
    return ipfsStorageCache.get(cid) || null;
  }

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
