import React from 'react';
import { useTrustStore } from '../../store/useTrustStore';
import { Lock, ArrowDown, CheckCircle2, ShieldCheck, Wallet } from 'lucide-react';

export const EscrowVisualizerView: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { state } = useTrustStore();
  const { bounties, verifications } = state;

  const bounty = bounties[0];
  const totalPayouts = verifications.reduce((acc, v) => acc + (v.payoutAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Smart Contract Escrow Visualizer</h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualizes conditional smart-contract reward lockups & programmatic release logic.
          </p>
        </div>
      </div>

      {/* Main Flow Canvas */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8 space-y-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-trust-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 3 Step Flow diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Box 1: Organization Wallet */}
          <div className="bg-dark-900 border border-dark-600 rounded-2xl p-5 text-center space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-dark-800 border border-dark-600 flex items-center justify-center mx-auto text-trust-500">
              <BuildingIcon />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{bounty.orgName}</h3>
              <p className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Company Wallet</p>
            </div>
            <div className="bg-dark-800/80 p-2.5 rounded-xl border border-dark-700 text-xs font-mono text-slate-300 truncate">
              {bounty.orgDid}
            </div>
          </div>

          {/* Arrow 1 -> 2 */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="text-[11px] font-bold text-trust-400 bg-trust-500/10 px-3 py-1 rounded-full border border-trust-500/20">
              Deposited ${bounty.totalEscrowLocked.toLocaleString()} USD
            </div>
            <ArrowDown className="w-5 h-5 text-trust-500 animate-bounce md:-rotate-90" />
            <span className="text-[10px] text-slate-500 uppercase font-mono">1. On-Chain Deposit</span>
          </div>

          {/* Box 2: Smart Contract Escrow */}
          <div className="bg-dark-900 border-2 border-trust-500 rounded-2xl p-6 text-center space-y-3 relative shadow-xl shadow-trust-500/10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-trust-600 to-emerald-400 text-dark-900 flex items-center justify-center mx-auto shadow-lg shadow-trust-600/30">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                SMART CONTRACT ESCROW
              </span>
              <h3 className="text-xl font-black text-white mt-1">${bounty.totalEscrowLocked.toLocaleString()}</h3>
            </div>
            <div className="bg-dark-800/90 p-2.5 rounded-xl border border-trust-500/30 text-[11px] font-mono text-trust-400 truncate">
              Address: {bounty.escrowContractAddress}
            </div>
          </div>
        </div>

        {/* Conditional Logic Connection Bar */}
        <div className="border-t border-b border-dark-700 py-4 px-6 bg-dark-900/50 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-slate-300">
              <strong>Escrow Condition:</strong> Requires cryptographically proven Proof-of-Discovery AND valid Technical Verification.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('submit')}
            className="bg-trust-600/20 hover:bg-trust-600/30 text-trust-400 border border-trust-500/30 px-3 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap transition"
          >
            Test Condition Trigger →
          </button>
        </div>

        {/* Box 3: Researcher Payout Outcome */}
        <div className="bg-dark-900 border border-emerald-500/40 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Researcher Wallet (Alex Rivers)</h3>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Total Rewards Released from Escrow</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-emerald-400">${totalPayouts.toLocaleString()} USD</div>
            <span className="text-[10px] text-slate-500 font-mono">Released upon verified disclosure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const BuildingIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
