import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEscrowContract } from '../useEscrowContract';

describe('useEscrowContract (Web3 Provider & Escrow Hook)', () => {
  it('initializes disconnected wallet state', () => {
    const { result } = renderHook(() => useEscrowContract());
    expect(result.current.wallet.isConnected).toBe(false);
  });

  it('connects wallet via fallback mechanism when window.ethereum is not present', async () => {
    const { result } = renderHook(() => useEscrowContract());

    await act(async () => {
      await result.current.connectWallet();
    });

    expect(result.current.wallet.isConnected).toBe(true);
    expect(result.current.wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it('disconnects wallet resetting state to default', async () => {
    const { result } = renderHook(() => useEscrowContract());

    await act(async () => {
      await result.current.connectWallet();
    });

    act(() => {
      result.current.disconnectWallet();
    });

    expect(result.current.wallet.isConnected).toBe(false);
  });

  it('releases escrow on-chain returning valid transaction hash', async () => {
    const { result } = renderHook(() => useEscrowContract());

    let txRes: { success: boolean; txHash: string } | undefined;
    await act(async () => {
      txRes = await result.current.releaseEscrowOnChain('0x1111111111111111111111111111111111111111', 25000);
    });

    expect(txRes?.success).toBe(true);
    expect(txRes?.txHash).toMatch(/^0x[a-f0-9]{64}$/);
  });
});
