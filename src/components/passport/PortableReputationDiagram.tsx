import React from 'react';
import { Network } from 'lucide-react';

export const PortableReputationDiagram: React.FC = () => {
  return (
    <div className="tx-surface rounded-2xl p-6 space-y-4 sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Portable Reputation Model</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified security contributions are associated with the researcher's DID trust passport rather than trapped inside isolated platforms.
          </p>
        </div>
        <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-mono px-2 py-0.5 rounded border border-indigo-500/20 font-semibold">
          Cross-Platform Sync
        </span>
      </div>

      <div className="tx-inset rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 w-full md:w-auto">
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider text-center md:text-left">
            Ecosystem Platforms
          </div>
          <div className="space-y-2">
            <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 text-xs text-slate-300 font-medium flex items-center justify-between">
              <span>Bounty Platform A</span>
              <span className="text-emerald-400 font-mono text-[10px]">Verified Signal</span>
            </div>
            <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 text-xs text-slate-300 font-medium flex items-center justify-between">
              <span>Open-Source Repo B</span>
              <span className="text-emerald-400 font-mono text-[10px]">Verified Signal</span>
            </div>
            <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 text-xs text-slate-300 font-medium flex items-center justify-between">
              <span>Security Audit Firm C</span>
              <span className="text-emerald-400 font-mono text-[10px]">Verified Signal</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-950/70 to-slate-900 p-5 rounded-2xl border border-blue-300/20 text-center w-full md:w-auto space-y-2">
          <Network className="w-8 h-8 text-indigo-400 mx-auto" />
          <div className="font-bold text-sm text-slate-100">Trust Engine Core</div>
          <div className="text-[10px] font-mono text-indigo-300">DID Cryptographic Ledger Anchor</div>
        </div>
      </div>
    </div>
  );
};
