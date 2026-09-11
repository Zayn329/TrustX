import React from 'react';
import { Network } from 'lucide-react';

export const PortableReputationDiagram: React.FC = () => {
  return (
    <div className="tx-surface rounded-xl p-6 space-y-4 sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-200">Portable Reputation Model</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Verified security contributions are associated with the researcher's DID trust passport rather than trapped inside isolated platforms.
          </p>
        </div>
        <span className="bg-[#D7FF3F]/10 text-[#D7FF3F] text-[10px] font-mono px-2 py-0.5 rounded border border-[#D7FF3F]/20 font-semibold">
          DEMO PROTOCOL
        </span>
      </div>

      <div className="tx-inset rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 w-full md:w-auto">
          <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider text-center md:text-left">
            Ecosystem Platforms
          </div>
          <div className="space-y-2">
            <div className="bg-[#111111] px-4 py-2 rounded-md border border-white/[0.08] text-xs text-zinc-300 font-medium flex items-center justify-between">
              <span>Bounty Platform A</span>
              <span className="text-emerald-400 font-mono text-[10px]">Verified Signal</span>
            </div>
            <div className="bg-[#111111] px-4 py-2 rounded-md border border-white/[0.08] text-xs text-zinc-300 font-medium flex items-center justify-between">
              <span>Open-Source Repo B</span>
              <span className="text-emerald-400 font-mono text-[10px]">Verified Signal</span>
            </div>
            <div className="bg-[#111111] px-4 py-2 rounded-md border border-white/[0.08] text-xs text-zinc-300 font-medium flex items-center justify-between">
              <span>Security Audit Firm C</span>
              <span className="text-emerald-400 font-mono text-[10px]">Verified Signal</span>
            </div>
          </div>
        </div>

        <div className="bg-[#050505] p-5 rounded-lg border border-[#D7FF3F]/20 text-center w-full md:w-auto space-y-2">
          <Network className="w-8 h-8 text-[#D7FF3F] mx-auto" />
          <div className="font-bold text-sm text-zinc-100">Trust Engine Core</div>
          <div className="text-[10px] font-mono text-[#D7FF3F]">DID Cryptographic Ledger Anchor</div>
        </div>
      </div>
    </div>
  );
};
