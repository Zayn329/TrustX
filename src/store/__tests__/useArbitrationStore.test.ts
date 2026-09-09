import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useArbitrationStore } from '../useArbitrationStore';

describe('useArbitrationStore', () => {
  it('loads initial cases', () => {
    const { result } = renderHook(() => useArbitrationStore());
    expect(result.current.cases.length).toBeGreaterThan(0);
    expect(result.current.cases[0].disputeId).toBe('disp-01');
  });

  it('increments vote count when casting juror vote', () => {
    const { result } = renderHook(() => useArbitrationStore());

    act(() => {
      result.current.castJurorVote('disp-01', 'Researcher');
    });

    expect(result.current.cases[0].votesResearcher).toBe(3);
    expect(result.current.cases[0].isResolved).toBe(true);
    expect(result.current.cases[0].ruling).toBe('ResearcherWins');
  });
});
