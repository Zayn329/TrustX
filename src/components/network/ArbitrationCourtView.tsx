import React, { useState } from 'react';
import { Scale, Gavel, CheckCircle2 } from 'lucide-react';
import { useArbitrationStore } from '../../store/useArbitrationStore';

export const ArbitrationCourtView: React.FC = () => {
  const { cases, castJurorVote } = useArbitrationStore();
  const [voteToast, setVoteToast] = useState<string | null>(null);

  const handleVote = (disputeId: string, choice: 'Researcher' | 'Company') => {
    castJurorVote(disputeId, choice);
    setVoteToast(`Juror vote recorded for ${choice}! Consensus updated.`);
    setTimeout(() => setVoteToast(null), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200">Decentralized Juror Arbitration Court</h3>
        </div>
        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-semibold">
          Staked Juror Consensus
        </span>
      </div>

      {voteToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{voteToast}</span>
        </div>
      )}

      <div className="space-y-3">
        {cases.map(c => (
          <div key={c.disputeId} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100">{c.title}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  c.isResolved
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {c.isResolved ? `RULING: ${c.ruling}` : 'ACTIVE JURY VOTING'}
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">{c.reason}</p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
              <div className="font-mono text-[11px] text-slate-300">
                Votes Cast: <span className="text-emerald-400 font-bold">{c.votesResearcher} Researcher</span> vs{' '}
                <span className="text-indigo-400 font-bold">{c.votesCompany} Company</span>
              </div>

              {!c.isResolved && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleVote(c.disputeId, 'Researcher')}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-lg transition-all shadow-md shadow-emerald-600/20"
                  >
                    <Gavel className="w-3.5 h-3.5" /> Vote Researcher
                  </button>
                  <button
                    onClick={() => handleVote(c.disputeId, 'Company')}
                    className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-lg transition-all shadow-md shadow-indigo-600/20"
                  >
                    <Gavel className="w-3.5 h-3.5" /> Vote Company
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
