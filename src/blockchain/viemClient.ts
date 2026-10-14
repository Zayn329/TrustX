import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { sepolia } from 'viem/chains';
import { CHAIN_ID, RPC_URL } from './config';

const getChainConfig = () => {
  if (CHAIN_ID === 11155111) return sepolia;
  console.warn(`Chain ID ${CHAIN_ID} not explicitly supported, falling back to Sepolia`);
  return sepolia;
};

const chain = getChainConfig();

export const publicClient = createPublicClient({
  chain,
  transport: http(RPC_URL),
});

export const walletClient = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return createWalletClient({
      chain,
      transport: custom(window.ethereum),
    });
  }
  return null;
};