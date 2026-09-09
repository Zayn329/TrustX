import React from 'react';
import { UserCheck, Key, Award } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';
import { PortableReputationDiagram } from '../passport/PortableReputationDiagram';
import { ScoreBreakdown } from '../passport/ScoreBreakdown';

export const PassportView: React.FC = () => {
  const { currentResearcher, reputationEvents } = useTrust();

  return (
    <div className="space-y-8">
      {/* Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-100">{currentResearcher.name}</h1>
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                Verified Security Researcher
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentResearcher.id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-slate-950 p-4 rounded-xl border border-slate-800/80 w-full md:w-auto justify-around">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-medium uppercase">Trust Score</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{currentResearcher.trustScore} / 100</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-medium uppercase">Total Bounties</div>
            <div className="text-xl font-bold text-slate-100 mt-0.5">{currentResearcher.successfulBountiesCount}</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-medium uppercase">Rewards Earned</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">${currentResearcher.totalRewardsEarned.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Portable Reputation Model */}
      <PortableReputationDiagram />

      {/* Score Breakdown */}
      <ScoreBreakdown
        factors={currentResearcher.reputationFactors}
        totalScore={currentResearcher.trustScore}
      />

      {/* Verified On-Chain Reputation History */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-bold text-slate-200 mb-4">On-Chain Reputation Event Log</h3>
        <div className="space-y-3">
          {reputationEvents.map(evt => (
            <div
              key={evt.id}
              className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div className="space-y-1">
                <div className="font-semibold text-slate-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>{evt.reason}</span>
                </div>
                <div className="font-mono text-[10px] text-slate-500">
                  Tx: {evt.txHash} • {new Date(evt.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded border border-emerald-500/20 font-mono text-sm">
                +{evt.delta} Score
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
