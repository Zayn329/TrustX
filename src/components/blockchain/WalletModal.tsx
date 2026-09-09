import React from 'react';
import { Wallet, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useEscrowContract } from '../../blockchain/useEscrowContract';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { wallet, isPending, connectWallet, disconnectWallet } = useEscrowContract();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Web3 Wallet Connection</h3>
            <p className="text-xs text-slate-400">Phase 4: EVM Smart Contract Integration</p>
          </div>
        </div>

        {wallet.isConnected ? (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Connected Wallet</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            </div>
            <div className="font-mono text-xs text-slate-200 break-all bg-slate-900 p-2 rounded border border-slate-800">
              {wallet.address}
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-slate-400">Sepolia Balance:</span>
              <span className="font-bold text-indigo-400">{wallet.balance}</span>
            </div>
            <button
              onClick={disconnectWallet}
              className="w-full mt-2 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-all"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={connectWallet}
              disabled={isPending}
              className="w-full flex items-center justify-between p-3.5 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800 text-slate-200 font-semibold text-xs transition-all"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>MetaMask / EVM Wallet</span>
              </div>
              <span className="text-xs text-indigo-400 font-mono">
                {isPending ? 'Connecting...' : 'Connect'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
