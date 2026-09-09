import React from 'react';
import { ShieldCheck, Cpu, KeyRound } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';

export const Header: React.FC = () => {
  const { currentResearcher } = useTrust();

  return (
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

        <div className="flex items-center space-x-4">
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
  );
};
