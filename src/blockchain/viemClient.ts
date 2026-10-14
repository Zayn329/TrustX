import { createPublicClient, createWalletClient, custom, http, type Address } from 'viem';
import { sepolia } from 'viem/chains';
import { CHAIN_ID, RPC_URL, blockchainConfig } from './config';
import { TRUST_BOUNTY_ESCROW_ABI } from './escrowAbi';

const getChainConfig = () => {
  if (CHAIN_ID === 11155111) return sepolia;
  throw new Error(`Unsupported configured chain ID: ${CHAIN_ID}. This demo supports Sepolia (11155111) only.`);
};

const chain = getChainConfig();

export const publicClient = createPublicClient({
  chain,
  transport: http(RPC_URL, { timeout: 5000, retryCount: 1 }),
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

export interface EscrowDeploymentStatus {
  chainId: number;
  contractAddress: string;
  hasBytecode: boolean;
  escrowCounter: bigint | null;
}

export async function checkContractBytecode(address: string): Promise<void> {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error('Invalid contract address');
  const chainId = await publicClient.getChainId();
  if (chainId !== CHAIN_ID) throw new Error(`RPC chain mismatch: expected ${CHAIN_ID}, received ${chainId}`);
  const bytecode = await publicClient.getBytecode({ address: address as Address });
  if (!bytecode || bytecode === '0x') throw new Error(`No contract bytecode found at ${address}`);
}

/** Confirms the configured address is a live TrustBountyEscrow deployment. */
export async function checkEscrowDeployment(): Promise<EscrowDeploymentStatus> {
  const chainId = await publicClient.getChainId();
  if (chainId !== CHAIN_ID) {
    throw new Error(`RPC chain mismatch: expected ${CHAIN_ID}, received ${chainId}`);
  }

  const address = blockchainConfig.trustBountyEscrowAddress as Address;
  const bytecode = await publicClient.getBytecode({ address });
  if (!bytecode || bytecode === '0x') {
    return { chainId, contractAddress: address, hasBytecode: false, escrowCounter: null };
  }

  const escrowCounter = await publicClient.readContract({
    address,
    abi: TRUST_BOUNTY_ESCROW_ABI,
    functionName: 'escrowCounter'
  });

  return { chainId, contractAddress: address, hasBytecode: true, escrowCounter };
}
