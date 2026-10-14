import { describe, it, expect } from 'vitest';
import { simulatedDeploymentIsDisabled, validateDeploymentEnvironment } from '../../scripts/deploy';

describe('deploy.ts deployment guards', () => {
  it('rejects missing deployment configuration', () => {
    expect(() => validateDeploymentEnvironment({})).toThrow(/RPC/);
  });

  it('rejects invalid deployer keys', () => {
    expect(() => validateDeploymentEnvironment({ VITE_RPC_URL: 'https://sepolia.example', DEPLOYER_PRIVATE_KEY: 'not-a-key' })).toThrow(/32-byte/);
    expect(() => validateDeploymentEnvironment({ VITE_RPC_URL: 'https://sepolia.example', DEPLOYER_PRIVATE_KEY: `0x${'0'.repeat(64)}` })).toThrow(/32-byte/);
  });

  it('does not expose a simulated deployment result', () => {
    expect(() => simulatedDeploymentIsDisabled()).toThrow(/disabled/);
  });
});
