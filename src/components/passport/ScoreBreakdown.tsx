import React from 'react';
import { ScoreBreakdownFactors } from '../../domain/types';
import { Info } from 'lucide-react';

interface ScoreBreakdownProps {
  factors: ScoreBreakdownFactors;
  totalScore: number;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ factors, totalScore }) => {
  const factorList = [
    {
      label: 'Technical Contributions',
      score: factors.technicalContributions,
      max: 35,
      color: 'bg-[#D7FF3F]',
      description: 'Calculated from SHA-256 evidence hashing and severity weights of verified reports.'
    },
    {
      label: 'Successful Bounty History',
      score: factors.bountyHistory,
      max: 30,
      color: 'bg-emerald-500',
      description: 'Based on total completed bounties backed by programmatic smart contract escrows.'
    },
    {
      label: 'Verification Success Rate',
      score: factors.verificationRate,
      max: 20,
      color: 'bg-zinc-400',
      description: 'Percentage of submitted reports that successfully passed technical review.'
    },
    {
      label: 'Contribution Consistency',
      score: factors.consistency,
      max: 15,
      color: 'bg-amber-500',
      description: 'Regular active security participation without long inactivity gaps.'
    },
    {
      label: 'Fraud / Sybil Risk Penalty',
      score: factors.riskSignals,
      max: 0,
      color: 'bg-red-500',
      description: 'Deductions applied when anti-sybil detection flags duplicate identity signals.'
    },
  ];

  return (
    <div className="tx-surface rounded-xl p-6 space-y-4 sm:p-7">
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-200">Trust Score Factor Breakdown</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Deterministic scoring model derived from verified on-chain history.
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-zinc-100">{totalScore}</span>
          <span className="text-xs text-zinc-400"> / 100</span>
        </div>
      </div>

      <div className="space-y-4">
        {factorList.map((f, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <div className="flex items-center gap-1.5 group relative cursor-help">
                <span className="font-semibold">{f.label}</span>
                <Info className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#D7FF3F] transition-colors" />
                <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-64 p-2 bg-[#050505] border border-white/[0.08] text-[11px] text-zinc-300 rounded-md z-30">
                  {f.description}
                </div>
              </div>

              <span className="font-mono font-bold text-zinc-200">
                +{f.score} {f.max > 0 ? `(Max ${f.max})` : ''}
              </span>
            </div>

            <div className="w-full h-2 bg-[#050505] rounded-full overflow-hidden border border-white/[0.08]">
              <div
                className={`h-full ${f.color} transition-all duration-500 rounded-full`}
                style={{ width: f.max > 0 ? `${(f.score / f.max) * 100}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
