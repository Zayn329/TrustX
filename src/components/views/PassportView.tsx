import React, { useState } from 'react';
import { UserCheck, Key, Award, QrCode, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';
import { PortableReputationDiagram } from '../passport/PortableReputationDiagram';
import { ScoreBreakdown } from '../passport/ScoreBreakdown';
import { CredentialQRModal } from '../passport/CredentialQRModal';
import { issueTrustScoreCredential } from '../../identity/vcManager';

export const PassportView: React.FC = () => {
  const { currentResearcher, reputationEvents } = useTrust();
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);

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
