import React from 'react';
import { useTrustStore } from '../../store/useTrustStore';
import { Scale, Lock } from 'lucide-react';

export const DisputeResolutionView: React.FC<{ setActiveTab: (tab: string) => void }> = () => {
  const { state } = useTrustStore();
  const { disputes } = state;

  const dispute = disputes[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Dispute Resolution & Frozen Escrow Arbitration</h1>
          <p className="text-xs text-slate-400 mt-1">
            Demonstrates that disputed bounties are frozen on-chain and resolved via cryptographic evidence & multi-sig referees.
          </p>
        </div>
      </div>

      {dispute ? (
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-dark-700 pb-4">
            <div className="flex items-center space-x-3">
              <Scale className="w-6 h-6 text-amber-400" />
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  DISPUTE #{dispute.id}
                </span>
                <h2 className="text-base font-bold text-white mt-1">Oracle Parameter Boundary Disagreement</h2>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-xl text-xs text-red-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>Escrow Locked: ${dispute.escrowFrozenAmount.toLocaleString()} USD</span>
            </div>
          </div>

          <div className="bg-dark-900/80 border border-dark-600 rounded-xl p-4 space-y-2 text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Dispute Reason</span>
            <p className="text-slate-200">{dispute.reason}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-dark-700/40 border border-dark-600 rounded-xl p-4 space-y-2">
              <h3 className="font-bold text-trust-400 uppercase text-[10px]">Researcher Evidence Statement</h3>
              <p className="text-slate-300">{dispute.researcherEvidence}</p>
            </div>

            <div className="bg-dark-700/40 border border-dark-600 rounded-xl p-4 space-y-2">
              <h3 className="font-bold text-sky-400 uppercase text-[10px]">Organization Counter Statement</h3>
              <p className="text-slate-300">{dispute.orgStatement}</p>
            </div>
          </div>

          {/* Referee Votes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400">Multi-Sig Referee Arbitration Panel</h3>
            {dispute.refereeVotes.map((vote, idx) => (
              <div key={idx} className="bg-dark-900 border border-dark-600 rounded-xl p-3.5 flex items-start justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{vote.refereeName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{vote.reason}</p>
                </div>
                <span className="font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                  VOTED: {vote.vote}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-slate-500 text-xs">No active disputes.</div>
      )}
    </div>
  );
};
