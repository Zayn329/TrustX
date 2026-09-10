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
      icon: <ShieldCheck className="w-8 h-8 text-indigo-400" />
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30 w-fit">
          {current.icon}
        </div>

        <div>
          <div className="text-[10px] font-mono uppercase font-bold text-indigo-400 mb-1">
            Step {tourStep} of {tourSteps.length}
          </div>
          <h2 className="text-xl font-bold text-slate-100">{current.title}</h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">{current.description}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handleClose}
            className="text-xs font-semibold text-slate-400 hover:text-white"
          >
            Skip Tour
          </button>

          {tourStep < tourSteps.length ? (
            <button
              onClick={() => setTourStep(prev => prev + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20"
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
