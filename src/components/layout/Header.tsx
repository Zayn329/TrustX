import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, KeyRound, Wallet, Search, UserCheck, ChevronDown, Menu } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';
import { WalletModal } from '../blockchain/WalletModal';

interface HeaderProps {
  onOpenCommandPalette?: () => void;
  onOpenMobileNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette, onOpenMobileNav }) => {
  const { currentResearcher } = useTrust();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

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
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#050505]/92 backdrop-blur-xl">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenMobileNav}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] text-zinc-400 hover:text-[#D7FF3F] lg:hidden"
              aria-label="Open workspace navigation"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="rounded-md border border-[#D7FF3F]/25 bg-[#D7FF3F]/10 p-2 text-[#D7FF3F]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#F5F5F2] text-lg">TrustX<span className="sr-only">Trust Engine</span></span>
                <span className="rounded-full border border-white/[0.08] bg-[#111111] px-2 py-0.5 font-mono text-[10px] font-medium text-zinc-500">
                  DEMO PROTOCOL
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden sm:block">Cryptographic trust infrastructure</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Cmd+K Quick Search Trigger Button */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden sm:inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-[#0B0B0B] px-3 py-2 text-xs text-zinc-300 transition-all hover:border-white/[0.14] hover:text-white"
            >
              <Search className="w-3.5 h-3.5 text-[#D7FF3F]" />
              <span>Quick Search...</span>
              <kbd className="font-mono text-[10px] bg-[#161616] px-1.5 py-0.5 rounded text-zinc-400 border border-white/[0.08]">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-[#D7FF3F]/25 bg-[#D7FF3F]/10 px-3 py-2 text-xs font-semibold text-[#D7FF3F] transition-all hover:bg-[#D7FF3F]/15"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden xs:inline">Connect Wallet</span>
            </button>

            <div className="hidden xl:flex items-center space-x-2 rounded-md border border-white/[0.08] bg-[#111111] px-3 py-1.5 text-xs text-zinc-200">
              <Cpu className="w-4 h-4 text-[#D7FF3F]" />
              <span className="text-zinc-500">Local ledger:</span>
              <span className="font-mono text-zinc-200 font-semibold text-xs">Block #18,420,105</span>
            </div>

            {/* Interactive Profile Dropdown (Issue 4, 5, 6) */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2.5 rounded-md border border-white/[0.08] bg-[#111111] px-3 py-2 text-left transition-all hover:border-white/[0.14]"
              >
                <KeyRound className="w-4 h-4 text-[#D7FF3F] flex-shrink-0" />
                <div className="hidden md:block">
                  <div className="text-xs font-semibold text-zinc-200 leading-tight">{currentResearcher.name}</div>
                  <div className="text-[10px] font-mono text-zinc-500">{currentResearcher.id.slice(0, 14)}...</div>
                </div>
                <div className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400">
                  {currentResearcher.trustScore}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/[0.09] bg-[#111111] p-4 space-y-3 z-50 animate-fadeIn">
                  <div className="flex items-center gap-3 border-b border-white/[0.08] pb-3">
                    <div className="p-2 bg-[#D7FF3F]/10 rounded-md text-[#D7FF3F] border border-[#D7FF3F]/20">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-100">{currentResearcher.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500 break-all">{currentResearcher.id}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-300">
                    <div className="flex justify-between py-1 border-b border-white/[0.07]">
                      <span className="text-zinc-500">Trust Score:</span>
                      <span className="font-bold text-emerald-400">{currentResearcher.trustScore} / 100</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.07]">
                      <span className="text-zinc-500">Acceptance Rate:</span>
                      <span className="font-semibold text-zinc-200">{currentResearcher.acceptanceRate}%</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-500">Rewards Earned:</span>
                      <span className="font-bold text-amber-400">${currentResearcher.totalRewardsEarned.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      window.location.hash = '#passport';
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full rounded-md bg-[#D7FF3F] py-2 text-center text-xs font-semibold text-[#050505] transition-all hover:bg-[#B8E638]"
                  >
                    View Full Trust Passport
                  </button>
                </div>
              )}
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
