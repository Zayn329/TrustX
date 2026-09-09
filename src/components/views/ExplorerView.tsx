import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';
import { ProofCard } from '../ui/ProofCard';
import { VerificationTimeline } from '../ui/VerificationTimeline';
import { OracleVerificationBadge } from '../ui/OracleVerificationBadge';
import { runSandboxEvaluation, SandboxExecutionResult } from '../../../oracle/sandboxRunner';

export const ExplorerView: React.FC = () => {
  const { reports, proofs, verifications, identities } = useTrust();
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [oracleResult, setOracleResult] = useState<SandboxExecutionResult | null>(null);

  const activeReport = reports.find(r => r.id === selectedReportId) || reports[0];
  const activeProof = proofs.find(p => p.contributionId === activeReport?.id);
  const activeVerification = verifications.find(v => v.contributionId === activeReport?.id);
  const activeResearcher = identities.find(i => i.id === activeReport?.researcherId);

  useEffect(() => {
    if (activeReport) {
      runSandboxEvaluation(activeReport.reproductionSteps).then(res => setOracleResult(res));
    }
  }, [activeReport]);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <div className="flex items-center gap-2">
          <Search className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-slate-100">Contribution Audit Explorer</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Inspect end-to-end contribution audit trails: Identity → Contribution → SHA-256 Proof → Verification → Ledger Anchor → Escrow Reward.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Submissions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Select Contribution
          </h3>
          <div className="space-y-2">
            {reports.map(rep => {
              const ver = verifications.find(v => v.contributionId === rep.id);
              const isSelected = rep.id === activeReport?.id;

              return (
                <button
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/40 text-slate-100'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold">{rep.id}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        ver?.status === 'valid'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {ver?.status ? ver.status.toUpperCase() : 'PENDING'}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 line-clamp-1">{rep.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Audit Trail Inspector */}
        {activeReport && (
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <VerificationTimeline
              currentStage={
                activeVerification?.status === 'valid'
                  ? 'escrow_released'
                  : activeVerification?.status === 'pending'
                  ? 'technical_verification'
                  : 'proof_generated'
              }
            />

            {/* Chain Flow Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">End-to-End Lineage Chain</h3>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">1. Identity</div>
                  <div className="font-bold text-slate-200 truncate mt-1">{activeResearcher?.handle || 'Researcher'}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">2. Contribution</div>
                  <div className="font-bold text-slate-200 truncate mt-1">{activeReport.id}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">3. SHA-256 Proof</div>
                  <div className="font-bold text-emerald-400 truncate mt-1">
                    {activeProof ? `${activeProof.contentHash.slice(0, 8)}...` : 'N/A'}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">4. Verification</div>
                  <div className="font-bold text-indigo-400 uppercase truncate mt-1">
                    {activeVerification?.status || 'Pending'}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">5. Reward</div>
                  <div className="font-bold text-amber-400 truncate mt-1">Programmatic Escrow</div>
                </div>
              </div>
            </div>

            {/* Phase 7: Oracle Verification Badge */}
            {oracleResult && <OracleVerificationBadge result={oracleResult} />}

            {/* Proof Card */}
            {activeProof && (
              <ProofCard
                proof={activeProof}
                verification={activeVerification}
              />
            )}

            {/* Report Technical Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Submission Technical Details</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Title</span>
                  <div className="text-slate-200 font-semibold text-sm mt-0.5">{activeReport.title}</div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Reproduction Payload</span>
                  <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-300 font-mono mt-1 overflow-x-auto whitespace-pre-wrap">
                    {activeReport.reproductionSteps}
                  </pre>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Technical Impact</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">{activeReport.impact}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
