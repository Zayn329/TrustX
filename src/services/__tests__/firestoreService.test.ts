import { describe, it, expect } from 'vitest';

// Test that the service module can be imported and has the expected exports
describe('Firestore Service Exports', () => {
  it('should have getBounties function', async () => {
    const module = await import('../firestoreService');
    expect(typeof module.getBounties).toBe('function');
  });

  it('should have getBountyById function', async () => {
    const module = await import('../firestoreService');
    expect(typeof module.getBountyById).toBe('function');
  });

  it('should have createBounty function', async () => {
    const module = await import('../firestoreService');
    expect(typeof module.createBounty).toBe('function');
  });

  it('should have updateBounty function', async () => {
    const module = await import('../firestoreService');
    expect(typeof module.updateBounty).toBe('function');
  });

  it('should have deleteBounty function', async () => {
    const module = await import('../firestoreService');
    expect(typeof module.deleteBounty).toBe('function');
  });
});