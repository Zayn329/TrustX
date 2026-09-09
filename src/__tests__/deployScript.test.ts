import { describe, it, expect } from 'vitest';
import { simulateDeployment } from '../../scripts/deploy';

describe('deploy.ts (Hardhat / Ethers Deployment Script)', () => {
  it('simulates deployment returning contract checksum addresses', async () => {
    const deployment = await simulateDeployment('sepolia');

    expect(deployment.network).toBe('sepolia');
    expect(deployment.trustBountyEscrow).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(deployment.reputationRegistry).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(deployment.disputeArbitration).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(deployment.chainlinkOracleBridge).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(deployment.deployedAt).toBeDefined();
  });
});
