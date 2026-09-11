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
      <div className="tx-surface-raised relative overflow-hidden rounded-xl p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-[#D7FF3F]/45" />
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start space-x-4">
          <button
            onClick={() => { window.location.hash = '#dashboard'; }}
            className="p-2 rounded-md bg-[#050505] border border-white/[0.08] text-zinc-400 hover:text-white transition-colors"
            title="Back to Dashboard Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-16 h-16 rounded-lg bg-[#D7FF3F]/10 border border-[#D7FF3F]/20 flex items-center justify-center text-[#D7FF3F] font-bold text-xl flex-shrink-0">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="tx-kicker text-[#D7FF3F]/80">Verifiable Credential</div>
            <div className="flex items-center gap-2">
              <h1 className="mt-2 text-3xl font-semibold text-zinc-100">{currentResearcher.name}</h1>
              <span className="status-pill status-success">
                Verified Security Researcher
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400 font-mono break-all">
              <Key className="w-3.5 h-3.5 text-zinc-500" />
              <span>{currentResearcher.id}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => setIsCredentialModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#D7FF3F] hover:bg-[#B8E638] text-[#050505] font-semibold text-xs px-4 py-2.5 rounded-md transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Export W3C Credential</span>
          </button>

          <div className="flex items-center gap-6 bg-[#050505] p-4 rounded-lg border border-white/[0.08] w-full sm:w-auto justify-around">
            <div className="text-center">
              <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.14em]">Trust Score</div>
              <div className="text-xl font-semibold text-emerald-300 mt-0.5">{currentResearcher.trustScore} / 100</div>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.14em]">Total Bounties</div>
              <div className="text-xl font-bold text-zinc-100 mt-0.5">{currentResearcher.successfulBountiesCount}</div>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.14em]">Rewards Earned</div>
              <div className="text-xl font-semibold text-amber-200 mt-0.5">${currentResearcher.totalRewardsEarned.toLocaleString()}</div>
            </div>
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
      <div className="tx-surface rounded-xl p-6 space-y-5 sm:p-7">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#D7FF3F]" />
            <div><div className="tx-kicker text-[#D7FF3F]/70">SIMULATED / not your current score</div><h3 className="mt-1 text-xl font-semibold text-white">Reputation score simulator</h3></div>
          </div>
          <span className="status-pill border-[#D7FF3F]/20 bg-[#D7FF3F]/10 text-[#D7FF3F]">
            Simulated Score: {simulatedScore} / 100
          </span>
        </div>

        <p className="text-sm leading-6 text-zinc-400">
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
              className="w-full accent-[#D7FF3F]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>High Severity Reports</span>
              <span className="font-mono text-[#D7FF3F]">{simHighCount} (+{simHighCount * 8} pts)</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              value={simHighCount}
              onChange={e => setSimHighCount(Number(e.target.value))}
              className="w-full accent-[#D7FF3F]"
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
              className="w-full accent-[#D7FF3F]"
            />
          </div>
        </div>
      </div>

      {/* Verified On-Chain Reputation History (Issue 23) */}
      <div className="tx-surface rounded-xl p-6 sm:p-7">
        <div className="tx-kicker">Reputation provenance</div><h3 className="mt-2 text-xl font-semibold text-white mb-5">Reputation event log</h3>
        <div className="space-y-3">
          {reputationEvents.map(evt => {
            const isPositive = evt.delta >= 0;

            return (
              <div
                key={evt.id}
                className="bg-[#050505] p-4 rounded-lg border border-white/[0.08] flex flex-col gap-3 text-xs transition-all hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
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
                  <div className="font-mono text-[10px] text-zinc-500 break-all">
                    Tx: {evt.txHash} / {new Date(evt.timestamp).toLocaleString()}
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
