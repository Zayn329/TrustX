import React, { useState } from 'react';
import { UserCheck, Key, Award, QrCode, ArrowLeft, ShieldAlert, Sliders, FileSearch } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';
import { PortableReputationDiagram } from '../passport/PortableReputationDiagram';
import { ScoreBreakdown } from '../passport/ScoreBreakdown';
import { CredentialQRModal } from '../passport/CredentialQRModal';
import { ProofDetailModal } from '../passport/ProofDetailModal';
import { issueTrustScoreCredential } from '../../identity/vcManager';
import { VulnerabilityReport } from '../../domain/types';

export const PassportView: React.FC = () => {
  const { currentResearcher, reputationEvents, reports, verifications } = useTrust();
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [selectedInspectReport, setSelectedInspectReport] = useState<VulnerabilityReport | null>(null);

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

  const researcherReports = reports.filter(r => r.researcherId === currentResearcher.id);

  return (
    <div className="space-y-8">
      {/* Header Profile Card */}
      <div className="tx-surface-raised rounded-[2rem] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => { window.location.hash = '#dashboard'; }}
            className="p-2 rounded-xl bg-slate-950/70 border border-slate-700/50 text-slate-400 hover:text-white transition-colors"
            title="Back to Dashboard Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-300/20 flex items-center justify-center text-blue-300 font-bold text-xl flex-shrink-0">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-slate-100">{currentResearcher.name}</h1>
              <span className="status-pill status-success">
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
            className="inline-flex items-center gap-2 bg-blue-400 hover:bg-blue-300 text-slate-950 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/15"
          >
            <QrCode className="w-4 h-4" />
            <span>Export W3C Credential</span>
          </button>

          <div className="flex items-center gap-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-700/50 w-full sm:w-auto justify-around">
            <div className="text-center">
              <div className="text-[10px] text-slate-500 font-medium uppercase">Trust Score</div>
              <div className="text-xl font-semibold text-emerald-300 mt-0.5">{currentResearcher.trustScore} / 100</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center">
              <div className="text-[10px] text-slate-500 font-medium uppercase">Total Bounties</div>
              <div className="text-xl font-bold text-slate-100 mt-0.5">{currentResearcher.successfulBountiesCount}</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center">
              <div className="text-[10px] text-slate-500 font-medium uppercase">Rewards Earned</div>
              <div className="text-xl font-semibold text-amber-200 mt-0.5">${currentResearcher.totalRewardsEarned.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Researcher Contribution Traceability */}
      <div className="tx-surface rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="tx-kicker">Researcher Contributions</div>
            <h3 className="text-lg font-bold text-slate-100 mt-1">Verified Submissions & Proof Records</h3>
          </div>
          <span className="font-mono text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            {researcherReports.length} Submissions Total
          </span>
        </div>

        <div className="space-y-3">
          {researcherReports.map((report) => {
            const verification = verifications.find(v => v.contributionId === report.id);
            const isValid = verification?.status === 'valid';

            return (
              <div
                key={report.id}
                className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-cyan-400">{report.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      isValid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {isValid ? 'Verified Valid (+3 Score)' : 'Pending / Unverified'}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate">{report.title}</h4>
                  <p className="text-xs text-slate-400 font-mono truncate">
                    Bounty: {report.bountyId} • Severity: {report.severity}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedInspectReport(report)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-medium transition-all shrink-0"
                >
                  <FileSearch className="w-3.5 h-3.5" />
                  <span>Inspect Evidence Hash & Proof</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Portable Reputation Model */}
      <PortableReputationDiagram />

      {/* Score Breakdown */}
      <ScoreBreakdown
        factors={currentResearcher.reputationFactors}
        totalScore={currentResearcher.trustScore}
      />

      {/* Interactive Reputation Score Simulator */}
      <div className="tx-surface rounded-2xl p-6 space-y-5 sm:p-7">
        <div className="flex flex-col gap-3 border-b border-slate-700/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-300" />
            <div><div className="tx-kicker text-blue-300/70">Scenario lab · not your current score</div><h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">Reputation score simulator</h3></div>
          </div>
          <span className="status-pill border-blue-300/20 bg-blue-400/10 text-blue-200">
            Simulated Score: {simulatedScore} / 100
          </span>
        </div>

        <p className="text-sm leading-6 text-slate-400">
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

      {/* Verified On-Chain Reputation History */}
      <div className="tx-surface rounded-2xl p-6 sm:p-7">
        <div className="tx-kicker">Reputation provenance</div><h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white mb-5">Reputation event log</h3>
        <div className="space-y-3">
          {reputationEvents.map(evt => {
            const isPositive = evt.delta >= 0;

            return (
              <div
                key={evt.id}
                className="bg-slate-950/55 p-4 rounded-xl border border-slate-700/40 flex items-center justify-between text-xs transition-all hover:bg-slate-900/60"
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
                    {evt.source === 'seeded_demo' ? 'Seeded demo history' : `Tx: ${evt.txHash}`} • {new Date(evt.timestamp).toLocaleString()}
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

      {selectedInspectReport && (
        <ProofDetailModal
          report={selectedInspectReport}
          verification={verifications.find(v => v.contributionId === selectedInspectReport.id)}
          onClose={() => setSelectedInspectReport(null)}
        />
      )}
    </div>
  );
};
