import React from 'react';

export const MainHeader: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunDemoFlow: () => void;
}> = ({ setActiveTab, onRunDemoFlow }) => {
  return (
    <header className="bg-dark-800/80 backdrop-blur border-b border-dark-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-trust-600 to-emerald-400 flex items-center justify-center font-black text-dark-900 shadow-lg shadow-trust-600/20">
              TE
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">TrustEngine</span>
                <span className="text-[10px] font-mono uppercase bg-trust-900/60 text-trust-500 border border-trust-500/30 px-2 py-0.5 rounded-full">
                  [Simulated Web3 Engine]
                </span>
              </div>
              <p className="text-xs text-slate-400">Trustless Bug Bounty & Portable Reputation Passport</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onRunDemoFlow}
              className="bg-gradient-to-r from-trust-600 to-emerald-500 hover:from-trust-500 hover:to-emerald-400 text-dark-900 font-semibold text-xs px-3.5 py-2 rounded-lg shadow-md transition flex items-center space-x-1.5"
            >
              <span>⚡ Trigger Complete Demo Lifecycle</span>
            </button>
            <div className="h-6 w-px bg-dark-600 hidden sm:block" />
            <div className="hidden sm:flex items-center space-x-2 bg-dark-700/60 border border-dark-600 px-3 py-1.5 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-mono">Ledger Block #1,048,313</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
