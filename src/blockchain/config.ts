import { TRUST_BOUNTY_ESCROW_ABI } from './escrowAbi';

// Read from Vite environment variables
export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID);
export const RPC_URL = import.meta.env.VITE_RPC_URL;
export const TRUST_BOUNTY_ESCROW_ADDRESS = import.meta.env.VITE_TRUST_BOUNTY_ESCROW_ADDRESS;

// Validate that required environment variables are set
if (isNaN(CHAIN_ID)) {
  throw new Error('VITE_CHAIN_ID must be a valid number');
}
if (!RPC_URL) {
  throw new Error('VITE_RPC_URL is required');
}
if (!TRUST_BOUNTY_ESCROW_ADDRESS) {
  throw new Error('VITE_TRUST_BOUNTY_ESCROW_ADDRESS is required');
}

// Basic Ethereum address validation (checksum not enforced here, but we can use viem's isAddress later)
export function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Check if the given address matches the configured contract address (case-insensitive)
export function isTrustBountyEscrowAddress(address: string): boolean {
  return (
    isValidEthAddress(address) &&
    address.toLowerCase() === TRUST_BOUNTY_ESCROW_ADDRESS.toLowerCase()
  );
}

// Check if the given chain ID matches the configured chain
export function isConfiguredChain(chainId: number): boolean {
  return chainId === CHAIN_ID;
}

export interface BlockchainConfig {
  chainId: number;
  rpcUrl: string;
  trustBountyEscrowAddress: string;
  abi: typeof TRUST_BOUNTY_ESCROW_ABI;
}

export const blockchainConfig: BlockchainConfig = {
  chainId: CHAIN_ID,
  rpcUrl: RPC_URL,
  trustBountyEscrowAddress: TRUST_BOUNTY_ESCROW_ADDRESS,
  abi: TRUST_BOUNTY_ESCROW_ABI,
};