import React from 'react';
import { ScoreBreakdownFactors } from '../../domain/types';

interface ScoreBreakdownProps {
  factors: ScoreBreakdownFactors;
  totalScore: number;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ factors, totalScore }) => {
  const factorList = [
    { label: 'Technical Contributions', score: factors.technicalContributions, max: 35, color: 'bg-indigo-500' },
    { label: 'Successful Bounty History', score: factors.bountyHistory, max: 30, color: 'bg-emerald-500' },
    { label: 'Verification Success Rate', score: factors.verificationRate, max: 20, color: 'bg-sky-500' },
    { label: 'Contribution Consistency', score: factors.consistency, max: 15, color: 'bg-amber-500' },
    { label: 'Fraud / Sybil Risk Penalty', score: factors.riskSignals, max: 0, color: 'bg-red-500' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Trust Score Factor Breakdown</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic scoring model derived from verified on-chain history.
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-slate-100">{totalScore}</span>
          <span className="text-xs text-slate-400"> / 100</span>
        </div>
      </div>

      <div className="space-y-3">
        {factorList.map((f, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>{f.label}</span>
              <span className="font-mono font-semibold">
                +{f.score} {f.max > 0 ? `(Max ${f.max})` : ''}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full ${f.color} transition-all duration-500`}
                style={{ width: f.max > 0 ? `${(f.score / f.max) * 100}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
