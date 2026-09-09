import React from 'react';
import { useTrustStore } from '../../store/useTrustStore';
import { GitFork, ArrowRight, ShieldCheck } from 'lucide-react';

export const VerificationTimelineView: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { state, verifySubmission, setSelectedSubmissionId } = useTrustStore();
  const { reports, verifications, bounties, selectedSubmissionId } = state;

  const currentReport = reports.find((r) => r.id === selectedSubmissionId) || reports[0];
  const currentBounty = bounties.find((b) => b.id === currentReport?.bountyId);
  const currentVerification = verifications.find((v) => v.submissionId === currentReport?.id);

  if (!currentReport) {
    return <div className="text-white p-6">No submission found.</div>;
  }

  const stages = [
    {
      id: 1,
      title: 'Vulnerability Discovered',
      subtitle: 'Researcher identified bug & drafted PoC',
      status: 'completed',
    },
    {
      id: 2,
      title: 'Submitted to Trust Engine',
      subtitle: 'Report payload compiled',
      status: 'completed',
    },
    {
      id: 3,
      title: 'Cryptographic Proof Anchored',
      subtitle: `Evidence SHA-256: ${currentReport.proof.evidenceHash.slice(0, 14)}...`,
      status: 'completed',
    },
    {
      id: 4,
      title: 'Technical Severity Verification',
      subtitle: currentVerification ? `Verified by ${currentVerification.verifierName}` : 'Under technical review by organization',
      status: currentReport.status === 'VERIFIED_INVALID'
        ? 'failed'
        : currentReport.status === 'PROVEN' || currentReport.status === 'IN_REVIEW'
        ? 'active'
        : 'completed',
    },
    {
      id: 5,
      title: 'Validated & Severity Confirmed',
      subtitle: currentReport.status === 'VERIFIED_INVALID' ? 'Rejected as invalid' : `Assessed as ${currentReport.severity}`,
      status: currentReport.status === 'VERIFIED_INVALID'
        ? 'failed'
        : currentReport.status === 'REWARD_RELEASED' || currentReport.status === 'VERIFIED_VALID'
        ? 'completed'
        : 'pending',
    },
    {
      id: 6,
      title: 'Reputation Updated On-Chain',
      subtitle: 'Trust Score & Graph node recorded',
      status: currentReport.status === 'REWARD_RELEASED' || currentReport.status === 'VERIFIED_VALID' ? 'completed' : 'pending',
    },
    {
      id: 7,
      title: 'Smart Contract Escrow Released',
      subtitle: currentVerification?.payoutAmount ? `$${currentVerification.payoutAmount.toLocaleString()} released to Researcher` : 'Awaiting verification completion',
      status: currentReport.status === 'REWARD_RELEASED' ? 'completed' : 'pending',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">7-Stage Verification Lifecycle Timeline</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracks real-time progress from initial discovery through proof generation, technical triage, reputation update, and escrow release.
          </p>
        </div>

        {/* Report Selector Pill */}
        <div className="flex items-center space-x-2 bg-dark-800 border border-dark-600 rounded-xl px-3 py-1.5">
          <span className="text-xs text-slate-400">Viewing Report:</span>
          <select
            value={currentReport.id}
            onChange={(e) => setSelectedSubmissionId(e.target.value)}
            className="bg-transparent text-white font-bold text-xs focus:outline-none"
          >
            {reports.map((r) => (
              <option key={r.id} value={r.id} className="bg-dark-800 text-white">
                {r.title} ({r.severity})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Vertical Timeline Visualizer */}
        <div className="lg:col-span-7 bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <GitFork className="w-5 h-5 text-trust-500" />
              <h2 className="text-base font-bold text-white">Lifecycle Progression</h2>
            </div>
            <span className="text-xs font-mono text-trust-400 bg-trust-500/10 px-2.5 py-0.5 rounded border border-trust-500/20">
              State: {currentReport.status}
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-dark-600">
            {stages.map((stage) => {
              const isCompleted = stage.status === 'completed';
              const isActive = stage.status === 'active';
              const isFailed = stage.status === 'failed';

              return (
                <div key={stage.id} className="relative flex items-start space-x-4">
                  {/* Circle Marker */}
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      isCompleted
                        ? 'bg-emerald-500 text-dark-900 border-emerald-400'
                        : isActive
                        ? 'bg-trust-500 text-dark-900 border-trust-400 animate-pulse'
                        : isFailed
                        ? 'bg-red-500 text-white border-red-400'
                        : 'bg-dark-700 text-slate-500 border-dark-600'
                    }`}
                  >
                    {isCompleted ? '✓' : isFailed ? '✕' : stage.id}
                  </div>

                  <div className="bg-dark-700/40 border border-dark-600/80 rounded-xl p-3.5 w-full space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white">{stage.title}</h3>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : isActive
                            ? 'bg-trust-500/10 text-trust-400'
                            : isFailed
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-slate-700/50 text-slate-500'
                        }`}
                      >
                        {stage.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{stage.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 cols: Technical Verification Panel & Escrow Trigger */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-dark-700 pb-3">
              <ShieldCheck className="w-5 h-5 text-trust-500" />
              <h2 className="text-base font-bold text-white">Technical Verification Triage</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Target Program</span>
                <span className="text-white font-semibold">{currentBounty?.title}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Claimed Severity</span>
                <span className="font-bold text-red-400">{currentReport.severity}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Description</span>
                <p className="text-slate-300 bg-dark-700/50 p-2.5 rounded-lg border border-dark-600 mt-1 line-clamp-3">
                  {currentReport.description}
                </p>
              </div>

              {currentReport.status === 'PROVEN' || currentReport.status === 'IN_REVIEW' ? (
                <div className="pt-3 border-t border-dark-700 space-y-3">
                  <p className="text-amber-400 text-[11px] font-semibold">
                    ⚡ Organization Triage Action Required:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        verifySubmission(
                          currentReport.id,
                          'VERIFIED_VALID',
                          'Vulnerability verified on mainnet fork test. Severity confirmed.'
                        )
                      }
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition"
                    >
                      ✓ Approve & Release Escrow
                    </button>
                    <button
                      onClick={() =>
                        verifySubmission(
                          currentReport.id,
                          'VERIFIED_INVALID',
                          'Rejected after triage: Out of scope or intended behavior.'
                        )
                      }
                      className="bg-red-600/80 hover:bg-red-500 text-white font-bold py-2 rounded-xl text-xs transition"
                    >
                      ✕ Reject / Invalid
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-dark-900/80 border border-dark-600 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Verification Outcome:</span>
                    <span className="font-bold text-emerald-400 uppercase">{currentReport.status}</span>
                  </div>
                  {currentVerification && (
                    <div className="space-y-1 text-[11px] text-slate-300 border-t border-dark-700 pt-2">
                      <p>
                        <strong className="text-slate-400">Verifier:</strong> {currentVerification.verifierName}
                      </p>
                      <p>
                        <strong className="text-slate-400">Notes:</strong> {currentVerification.verificationNotes}
                      </p>
                      {currentVerification.payoutAmount > 0 && (
                        <p className="text-emerald-400 font-bold">
                          Reward Payout: ${currentVerification.payoutAmount.toLocaleString()} USD Released
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setActiveTab('escrow')}
                className="w-full text-center text-xs text-trust-500 hover:text-trust-400 font-medium pt-2 flex items-center justify-center space-x-1"
              >
                <span>Inspect Smart Contract Escrow State</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
