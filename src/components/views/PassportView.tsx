import React, { useState } from 'react';
import { UserCheck, Key, Award, QrCode, ArrowLeft, ShieldAlert, Sliders } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';
import { PortableReputationDiagram } from '../passport/PortableReputationDiagram';
import { ScoreBreakdown } from '../passport/ScoreBreakdown';
import { CredentialQRModal } from '../passport/CredentialQRModal';
import { issueTrustScoreCredential } from '../../identity/vcManager';

export const PassportView: React.FC = () => {
  const { currentResearcher, reputationEvents } = useTrust();
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);

  // Category I Item 87: Interactive Reputation Score Simulator
  const [simCriticalCount, setSimCriticalCount] = useState(2);
  const [simHighCount, setSimHighCount] = useState(3);
  const [simPenaltyCount, setSimPenaltyCount] = useState(0);

  const simulatedScore = Math.min(100, Math.max(0, 30 + (simCriticalCount * 15) + (simHighCount * 8) - (simPenaltyCount * 20)));

  const credential = issueTrustScoreCredential(
    currentResearcher.id,
    currentResearcher.trustScore,
    currentResearcher.successfulBountiesCount
  );

  return (
    <div className="space-y-8">
      {/* Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => { window.location.hash = '#dashboard'; }}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Back to Dashboard Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl flex-shrink-0">
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

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => setIsCredentialModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <QrCode className="w-4 h-4" />
            <span>Export W3C Credential</span>
          </button>

          <div className="flex items-center gap-6 bg-slate-950 p-4 rounded-xl border border-slate-800/80 w-full sm:w-auto justify-around">
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
      </div>

      {/* Portable Reputation Model */}
      <PortableReputationDiagram />

      {/* Score Breakdown (Issue 22) */}
      <ScoreBreakdown
        factors={currentResearcher.reputationFactors}
        totalScore={currentResearcher.trustScore}
      />

      {/* Interactive Reputation Score Simulator (Category I Item 87) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">Interactive Reputation Score Simulator</h3>
          </div>
          <span className="text-xs bg-indigo-500/10 text-indigo-300 font-mono font-bold px-3 py-1 rounded-full border border-indigo-500/20">
            Simulated Score: {simulatedScore} / 100
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Adjust the sliders below to test how submitting verified bounties dynamically impacts portable reputation scores in real time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Critical Reports Verified</span>
              <span className="font-mono text-emerald-400">{simCriticalCount} (+{simCriticalCount * 15} pts)</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              value={simCriticalCount}
              onChange={e => setSimCriticalCount(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>High Severity Reports</span>
              <span className="font-mono text-sky-400">{simHighCount} (+{simHighCount * 8} pts)</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              value={simHighCount}
              onChange={e => setSimHighCount(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Sybil / Fraud Penalty Flags</span>
              <span className="font-mono text-rose-400">{simPenaltyCount} (-{simPenaltyCount * 20} pts)</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              value={simPenaltyCount}
              onChange={e => setSimPenaltyCount(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Verified On-Chain Reputation History (Issue 23) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-200 mb-4">On-Chain Reputation Event Log</h3>
        <div className="space-y-3">
          {reputationEvents.map(evt => {
            const isPositive = evt.delta >= 0;

            return (
              <div
                key={evt.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs transition-all hover:bg-slate-900/60"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-slate-200 flex items-center gap-2">
                    {isPositive ? (
                      <Award className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{evt.reason}</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-500">
                    Tx: {evt.txHash} • {new Date(evt.timestamp).toLocaleString()}
                  </div>
                </div>

                <div
                  className={`font-bold px-3 py-1 rounded-lg border font-mono text-xs ${
                    isPositive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}
                >
                  {isPositive ? `+${evt.delta}` : evt.delta} Score
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CredentialQRModal
        isOpen={isCredentialModalOpen}
        onClose={() => setIsCredentialModalOpen(false)}
        credential={credential}
      />
    </div>
  );
};
