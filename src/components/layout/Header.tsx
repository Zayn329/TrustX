import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, KeyRound, Wallet, Search } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';
import { WalletModal } from '../blockchain/WalletModal';

interface HeaderProps {
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette }) => {
  const { currentResearcher } = useTrust();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Global Keyboard Listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenCommandPalette?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette]);

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30 text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-lg tracking-wide">Trust Engine</span>
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded border border-slate-700 font-mono">
                  v1.0 (Demo Protocol)
                </span>
              </div>
              <p className="text-xs text-slate-400">Trustless Open-Source Infrastructure</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Cmd+K Quick Search Trigger Button */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden sm:inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 px-3 py-1.5 rounded-xl text-xs transition-all"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Quick Search...</span>
              <kbd className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            >
              <Wallet className="w-4 h-4 text-indigo-400" />
              <span>Connect Wallet</span>
            </button>

            <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Ledger:</span>
              <span className="font-mono text-emerald-400">Simulated Block #18,420,105</span>
            </div>

            <div className="flex items-center space-x-3 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-200">{currentResearcher.name}</div>
                <div className="text-[10px] font-mono text-slate-400">{currentResearcher.id.slice(0, 16)}...</div>
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                Score: {currentResearcher.trustScore}
              </div>
            </div>
          </div>
        </div>
      </header>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
};
