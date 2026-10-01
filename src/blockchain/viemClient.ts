import { createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { CHAIN_ID, RPC_URL } from './config';

// Create a custom chain configuration based on VITE_CHAIN_ID
// This allows us to use the chain ID from environment variables
const getChainConfig = () => {
  // For now, we only support Sepolia as specified in the task
  // In a more flexible implementation, we could map chain IDs to configurations
  if (CHAIN_ID === 11155111) {
    return sepolia;
  }

  // Fallback to sepolia if chain ID doesn't match known chains
  // In a production app, you might want to throw an error or support more chains
  console.warn(`Chain ID ${CHAIN_ID} not explicitly supported, falling back to Sepolia`);
  return sepolia;
};

const chain = getChainConfig();

// Create public client for read-only operations
export const publicClient = createPublicClient({
  chain,
  transport: http(RPC_URL),
});

// Create wallet client for transaction operations
// Note: This requires window.ethereum to be available
export const walletClient = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return createWalletClient({
      chain,
      transport: http(),
    });
  }
  return null;
};