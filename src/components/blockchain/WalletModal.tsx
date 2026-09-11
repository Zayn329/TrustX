import React, { useEffect } from 'react';
import { Wallet, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useEscrowContract } from '../../blockchain/useEscrowContract';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { wallet, isPending, connectWallet, disconnectWallet } = useEscrowContract();

  // Escape key handler (Issue 26)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-[#111111] border border-white/[0.09] rounded-xl max-w-md w-full p-6 space-y-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-200 p-1 rounded-md hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
            <div className="p-3 bg-[#D7FF3F]/10 rounded-lg border border-[#D7FF3F]/20 text-[#D7FF3F]">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">Infrastructure Wallet Connection</h3>
            <p className="text-xs text-zinc-400">DEMO PROTOCOL / EVM smart contract integration</p>
          </div>
        </div>

        {wallet.isConnected ? (
          <div className="bg-[#050505] p-4 rounded-lg border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Connected Wallet</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            </div>
            <div className="font-mono text-xs text-slate-200 break-all bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              {wallet.address}
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-slate-400">Sepolia Balance:</span>
              <span className="font-bold text-[#D7FF3F]">{wallet.balance}</span>
            </div>
            <button
              onClick={disconnectWallet}
              className="w-full mt-2 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition-all"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={connectWallet}
              disabled={isPending}
              className="w-full flex items-center justify-between p-4 bg-[#050505] hover:bg-white/[0.05] rounded-lg border border-white/[0.08] text-zinc-200 font-semibold text-xs transition-all"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D7FF3F]" />
                <span>MetaMask / EVM Wallet</span>
              </div>
              <span className="text-xs text-[#D7FF3F] font-mono">
                {isPending ? 'Connecting...' : 'Connect'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
