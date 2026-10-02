import { parseEther } from 'viem';

// Demo conversion rate: 1 ETH = 2500 USDC
// This is configurable via environment variable for testnet/demo purposes
export const getDemoUsdcPerEth = (): number => {
  const rate = import.meta.env.VITE_DEMO_USDC_PER_ETH;

  if (!rate) {
    console.warn('VITE_DEMO_USDC_PER_ETH not set, using default rate of 2500 USDC per ETH');
    return 2500;
  }

  const numericRate = Number(rate);
  if (isNaN(numericRate) || numericRate <= 0) {
    console.warn(`Invalid VITE_DEMO_USDC_PER_ETH value: ${rate}, using default rate of 2500`);
    return 2500;
  }

  return numericRate;
};

/**
 * Convert USDC amount to ETH using demo conversion rate
 * @param usdcAmount Amount in USDC (must be positive)
 * @returns Amount in ETH as a string (for display)
 */
export const usdcToEth = (usdcAmount: number): string => {
  if (usdcAmount <= 0) {
    throw new Error('USDC amount must be positive');
  }

  const usdcPerEth = getDemoUsdcPerEth();
  const ethAmount = usdcAmount / usdcPerEth;

  return ethAmount.toString();
};

/**
 * Convert USDC amount to wei using demo conversion rate
 * @param usdcAmount Amount in USDC (must be positive)
 * @returns Amount in wei as bigint
 */
export const usdcToWei = (usdcAmount: number): bigint => {
  if (usdcAmount <= 0) {
    throw new Error('USDC amount must be positive');
  }

  const usdcPerEth = getDemoUsdcPerEth();
  const ethAmount = usdcAmount / usdcPerEth;

  // Convert ETH to wei using viem's parseEther (which handles decimals correctly)
  return parseEther(ethAmount.toString());
};

/**
 * Generate a deterministic numeric on-chain ID from a Firestore string ID
 * Uses keccak256 hash of the string ID, then takes the first 4 bytes as uint256
 * This ensures the same Firestore ID always maps to the same on-chain ID
 * @param id Firestore document ID (string)
 * @returns Numeric on-chain ID as string
 */
export const generateOnChainIdFromFirestoreId = (id: string): string => {
  // Simple hash function to convert string to number
  // In a production app, you might use a proper cryptographic hash
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Make positive and ensure it's a reasonable size
  const positiveHash = Math.abs(hash);
  // Ensure it's at least 1 (since contract requires value > 0)
  return Math.max(1, positiveHash).toString();
};