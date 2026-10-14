import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useArbitrationStore } from '../useArbitrationStore';

describe('useArbitrationStore', () => {
  it('loads initial cases', () => {
    const { result } = renderHook(() => useArbitrationStore());
    expect(result.current.cases.length).toBeGreaterThan(0);
    expect(result.current.cases[0].disputeId).toBe('disp-01');
  });

  it('does not mutate votes when a real Sepolia transaction cannot be submitted', async () => {
    const { result } = renderHook(() => useArbitrationStore());

    await act(async () => {
      await expect(result.current.castJurorVote('disp-01', 'Researcher')).rejects.toThrow();
    });

    expect(result.current.cases[0].votesResearcher).toBe(2);
    expect(result.current.cases[0].isResolved).toBe(false);
  });
});
