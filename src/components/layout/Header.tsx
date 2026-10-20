import React, { useState, useEffect } from 'react';
import { ShieldCheck, KeyRound, Wallet, Search, UserCheck, ChevronDown, LogOut } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';
import { useAuth } from '../../auth/AuthContext';
import { WalletModal } from '../blockchain/WalletModal';

interface HeaderProps {
  onOpenCommandPalette?: () => void;
  onNavigate?: (tab: 'passport') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette, onNavigate }) => {
  const { currentResearcher } = useTrust();
  const { profile, role, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const isCompany = role === 'company';
  const displayName = profile?.companyName || profile?.displayName || currentResearcher.name;
  const signOut = async () => {
    setSigningOut(true);
    try { await logout(); } finally { setSigningOut(false); setIsProfileDropdownOpen(false); }
  };
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
      <header className="bg-[#080d18]/95 border-b border-slate-700/40 sticky top-0 z-40 backdrop-blur-xl">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-[4.5rem] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-400/10 p-2.5 rounded-xl border border-blue-300/20 text-blue-300 shadow-[0_0_24px_rgba(73,143,255,0.12)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-50 text-lg tracking-[-0.03em]">TrustX<span className="sr-only">Trust Engine</span></span>
                <span className="bg-slate-800/80 text-slate-400 text-[10px] px-2 py-0.5 rounded-full border border-slate-700/60 font-mono font-medium">
                  DEMO PROTOCOL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Verifiable trust infrastructure</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Cmd+K Quick Search Trigger Button */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden sm:inline-flex items-center gap-2 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 px-3 py-2 rounded-xl text-xs transition-all"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Quick Search...</span>
              <kbd className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-400/10 hover:bg-blue-400/20 text-blue-200 border border-blue-300/25 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            >
              <Wallet className="w-4 h-4 text-indigo-400" />
              <span className="hidden xs:inline">Connect Wallet</span>
            </button>

            <div className="hidden xl:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-200">
              <span className="text-slate-400">Network:</span>
              <span className="font-mono text-cyan-300 font-bold text-xs">Sepolia Testnet</span>
            </div>

            {/* Interactive Profile Dropdown (Issue 4, 5, 6) */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2.5 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700/70 transition-all text-left"
              >
                <KeyRound className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div className="hidden md:block">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">{displayName}</div>
                  <div className="text-[10px] text-slate-400">{isCompany ? 'Company' : 'Bug Reporter'}</div>
                </div>
                {!isCompany && (
                  <div className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    {currentResearcher.trustScore}
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 space-y-3 z-50 animate-fadeIn">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400 border border-indigo-500/30">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100">{displayName}</div>
                      <div className="text-[10px] text-slate-400">Role is verified by your server session.</div>
                    </div>
                  </div>

                  {!isCompany && (
                    <>
                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex justify-between py-1 border-b border-slate-800/80">
                          <span className="text-slate-400">Trust Score:</span>
                          <span className="font-bold text-emerald-400">{currentResearcher.trustScore} / 100</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/80">
                          <span className="text-slate-400">Acceptance Rate:</span>
                          <span className="font-semibold text-slate-200">{currentResearcher.acceptanceRate}%</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Rewards Earned:</span>
                          <span className="font-bold text-amber-400">${currentResearcher.totalRewardsEarned.toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onNavigate?.('passport');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-center py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all"
                      >
                        View Full Trust Passport
                      </button>
                    </>
                  )}

                  <button
                    disabled={signingOut}
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold rounded-lg transition-all disabled:opacity-60"
                  >
                    <LogOut className="w-4 h-4" />
                    {signingOut ? 'Signing out…' : 'Sign out'}
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
