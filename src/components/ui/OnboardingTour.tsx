import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Target, Search, ArrowRight, X } from 'lucide-react';

export const OnboardingTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tourStep, setTourStep] = useState(1);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('has_seen_onboarding_tour');
    if (!hasSeenTour) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('has_seen_onboarding_tour', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Welcome to Trust Engine',
      description: 'An open-source, trustless infrastructure for bug bounty discovery, cryptographic proof-of-discovery, and automated smart contract escrows.',
      icon: <ShieldCheck className="w-8 h-8 text-[#D7FF3F]" />
    },
    {
      title: 'Explore Active Bounties',
      description: 'Browse active security bounties backed by locked smart contract escrows and submit vulnerability evidence with automated SHA-256 proof generation.',
      icon: <Target className="w-8 h-8 text-emerald-400" />
    },
    {
      title: 'Audit Contribution Lineage',
      description: 'Inspect end-to-end contribution trails: Identity → SHA-256 Evidence Hash → Technical Verification → On-Chain Ledger Anchor.',
      icon: <Search className="w-8 h-8 text-amber-400" />
    }
  ];

  const current = tourSteps[tourStep - 1];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#111111] border border-white/[0.09] rounded-xl max-w-md w-full p-6 sm:p-8 space-y-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/[0.06]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-3 bg-[#D7FF3F]/10 rounded-lg border border-[#D7FF3F]/20 w-fit">
          {current.icon}
        </div>

        <div>
          <div className="text-[10px] font-mono uppercase font-bold text-[#D7FF3F] mb-1">
            Step {tourStep} of {tourSteps.length}
          </div>
          <h2 className="text-xl font-bold text-zinc-100">{current.title}</h2>
          <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{current.description}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
          <button
            onClick={handleClose}
            className="text-xs font-semibold text-slate-400 hover:text-white"
          >
            Skip Tour
          </button>

          {tourStep < tourSteps.length ? (
            <button
              onClick={() => setTourStep(prev => prev + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D7FF3F] hover:bg-[#B8E638] text-[#050505] font-semibold text-xs rounded-md transition-all"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#D7FF3F] hover:bg-[#B8E638] text-[#050505] font-bold text-xs rounded-md transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get Started</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
