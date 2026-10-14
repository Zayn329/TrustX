/**
 * Authoritative deployment entry point for the Trust Engine contracts.
 *
 * Use the CommonJS runner from the repository root:
 *   npm run contracts:deploy:sepolia
 *
 * This source file intentionally contains no simulated-address fallback.
 * The runnable implementation is scripts/deploy-sepolia.cjs, which fails
 * loudly when RPC, signer, or Sepolia configuration is missing.
 */

export interface DeploymentAddresses {
  reputationRegistry: string;
  disputeArbitration: string;
  proofRegistry: string;
  trustBountyEscrow: string;
  deployedAt: string;
  network: 'sepolia';
}

export function validateDeploymentEnvironment(env: NodeJS.ProcessEnv = process.env): void {
  if (!env.SEPOLIA_RPC_URL && !env.VITE_RPC_URL) {
    throw new Error('SEPOLIA_RPC_URL or VITE_RPC_URL is required for a real Sepolia deployment');
  }
  if (!env.DEPLOYER_PRIVATE_KEY || !/^0x[a-fA-F0-9]{64}$/.test(env.DEPLOYER_PRIVATE_KEY) || /^0x0{64}$/.test(env.DEPLOYER_PRIVATE_KEY)) {
    throw new Error('DEPLOYER_PRIVATE_KEY must be a 32-byte hex private key');
  }
}

export function simulatedDeploymentIsDisabled(): never {
  throw new Error('Simulated deployment is disabled; use npm run contracts:deploy:sepolia');
}
