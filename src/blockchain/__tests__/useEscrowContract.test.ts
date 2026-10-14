import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEscrowContract } from '../useEscrowContract';

describe('useEscrowContract (Web3 Provider & Escrow Hook)', () => {
  it('initializes disconnected wallet state', () => {
    const { result } = renderHook(() => useEscrowContract());
    expect(result.current.wallet.isConnected).toBe(false);
  });

  it('remains disconnected when window.ethereum is not present', async () => {
    // Mock window.ethereum to be undefined to simulate no web3 provider
    Object.defineProperty(window, 'ethereum', {
      value: undefined,
      configurable: true
    });

    const { result } = renderHook(() => useEscrowContract());

    await act(async () => {
      await result.current.connectWallet();
    });

    expect(result.current.wallet.isConnected).toBe(false);

    // Restore original value
    delete window.ethereum;
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

  it('releases escrow on-chain throwing error when wallet not connected', async () => {
    const { result } = renderHook(() => useEscrowContract());

    await expect(
      result.current.releaseEscrowOnChain('0x1111111111111111111111111111111111111111', 25000)
    ).rejects.toThrow('Wallet not connected');
  });
});
