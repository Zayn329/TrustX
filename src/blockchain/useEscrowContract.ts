import { useState } from 'react';
import { WalletState, INITIAL_WALLET_STATE, SEPOLIA_CONFIG } from './wagmiConfig';

export function useEscrowContract() {
  const [wallet, setWallet] = useState<WalletState>(INITIAL_WALLET_STATE);
  const [isPending, setIsPending] = useState(false);

  const connectWallet = async () => {
    setIsPending(true);
    setTimeout(() => {
      setWallet({
        isConnected: true,
        address: '0x71c89a42e12bA901C48812C41022031a002a71f0',
        chainId: SEPOLIA_CONFIG.chainId,
        balance: '4.85 ETH'
      });
      setIsPending(false);
    }, 600);
  };

  const disconnectWallet = () => {
    setWallet(INITIAL_WALLET_STATE);
  };

  const releaseEscrowOnChain = async (_escrowContractAddress: string, _amount: number) => {
    setIsPending(true);
    await new Promise(res => setTimeout(res, 800));
    setIsPending(false);
    return {
      success: true,
      txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
  };

  return {
    wallet,
    isPending,
    connectWallet,
    disconnectWallet,
    releaseEscrowOnChain
  };
}
