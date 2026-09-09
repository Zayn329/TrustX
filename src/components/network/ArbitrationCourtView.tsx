import React from 'react';
import { Scale, Gavel } from 'lucide-react';
import { useArbitrationStore } from '../../store/useArbitrationStore';

export const ArbitrationCourtView: React.FC = () => {
  const { cases, castJurorVote } = useArbitrationStore();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200">Phase 8: Decentralized Juror Arbitration Court</h3>
        </div>
        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
          Staked Juror Consensus
        </span>
      </div>

      <div className="space-y-3">
        {cases.map(c => (
          <div key={c.disputeId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100">{c.title}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  c.isResolved
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {c.isResolved ? `RULING: ${c.ruling}` : 'ACTIVE JURY VOTING'}
              </span>
            </div>

            <p className="text-slate-400 text-xs">{c.reason}</p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="font-mono text-[11px] text-slate-300">
                Votes: <span className="text-emerald-400">{c.votesResearcher} Researcher</span> vs{' '}
                <span className="text-indigo-400">{c.votesCompany} Company</span>
              </div>

              {!c.isResolved && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => castJurorVote(c.disputeId, 'Researcher')}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] px-3 py-1.5 rounded transition-all"
                  >
                    <Gavel className="w-3 h-3" /> Vote Researcher
                  </button>
                  <button
                    onClick={() => castJurorVote(c.disputeId, 'Company')}
                    className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] px-3 py-1.5 rounded transition-all"
                  >
                    <Gavel className="w-3 h-3" /> Vote Company
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
