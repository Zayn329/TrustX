import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Lock, DollarSign, Calendar, Send, Sparkles } from 'lucide-react';
import { Bounty } from '../../domain/types';
import { useTrust } from '../../store/TrustContext';
import { SubmitVulnerabilityModal } from './SubmitVulnerabilityModal';

interface BountyDetailModalProps {
  bounty: Bounty;
  onClose: () => void;
}

export const BountyDetailModal: React.FC<BountyDetailModalProps> = ({ bounty, onClose }) => {
  const { reports, verifications, escrows, releaseEscrow, verifySubmission } = useTrust();
  const escrow = escrows.find(e => e.id === bounty.escrowId);
  const bountyReports = reports.filter(r => r.bountyId === bounty.id);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [researcherAddress, setResearcherAddress] = useState(escrow?.researcherAddress || '');
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [verifyingReportId, setVerifyingReportId] = useState<string | null>(null);

  useEffect(() => {
    setResearcherAddress(escrow?.researcherAddress || '');
  }, [escrow?.researcherAddress]);

  // Escape Key listener (Issue 26)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showSubmitModal) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showSubmitModal]);

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      >
        <div
          onClick={e => e.stopPropagation()}
          className="bg-[#0b1220] border border-slate-600/40 rounded-[1.75rem] max-w-4xl w-full p-6 sm:p-8 space-y-7 relative max-h-[90vh] flex flex-col shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-300" />
                <span className="text-sm font-semibold text-slate-200">{bounty.organizationName}</span>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  Organization Trust Score: {bounty.organizationTrustScore}
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-slate-100">{bounty.title}</h1>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs text-slate-400 bg-slate-950/65 p-4 rounded-2xl border border-slate-700/50 sm:grid-cols-3">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Max Reward:</span>
              <span className="font-bold text-slate-200">${bounty.rewardAmount.toLocaleString()} {bounty.rewardCurrency}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Escrow Contract:</span>
              <span className="font-mono text-slate-300">{escrow?.escrowContractAddress || 'Seeded demo — no live address'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Deadline:</span>
              <span className="text-slate-300">{new Date(bounty.deadline).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Body Content Container */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
            <div>
              <div className="tx-kicker">The opportunity</div>
              <p className="mt-2 max-w-3xl text-sm text-slate-300 leading-7">{bounty.description}</p>
            </div>

            <div>
              <h3 className="tx-kicker mb-2">Scope & covered assets</h3>
              <div className="flex flex-wrap gap-2">
                {bounty.scope.map((item, idx) => (
                  <span key={idx} className="bg-slate-950 text-indigo-300 font-mono text-xs px-3 py-1.5 rounded-xl border border-slate-800">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="tx-kicker mb-2">Verification & submission rules</h3>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                {bounty.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>

            {/* Submissions for this Bounty */}
            {bountyReports.length > 0 && (
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-700/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Submissions for this Bounty ({bountyReports.length})</span>
                </div>
                <div className="space-y-2">
                  {bountyReports.map(rep => {
                    const ver = verifications.find(v => v.contributionId === rep.id);
                    const isVerifyingThis = verifyingReportId === rep.id;
                    return (
                      <div key={rep.id} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-blue-300 font-semibold">{rep.id}</span>
                            <span className={`status-pill ${ver?.status === 'valid' ? 'status-success' : ver?.status === 'pending' ? 'status-warning' : 'status-critical'}`}>
                              {ver?.status || 'pending'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-200 font-medium mt-1 truncate">{rep.title}</div>
                        </div>
                        <button
                          disabled={isVerifyingThis}
                          onClick={async () => {
                            setVerifyingReportId(rep.id);
                            try {
                              await verifySubmission(rep.id);
                            } catch (e) {
                              console.error('[BountyDetailModal] Verification failed:', e);
                            } finally {
                              setVerifyingReportId(null);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white flex items-center gap-1 shrink-0"
                        >
                          <Sparkles className="w-3 h-3 text-blue-200" />
                          <span>{isVerifyingThis ? 'Verifying...' : 'Verify'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

              <div className="bg-slate-950/55 p-4 rounded-2xl border border-slate-700/50 space-y-2">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Smart Contract Escrow Status</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Escrow Amount:</span>
                  <span className="font-bold text-emerald-400">{escrow?.currency === 'ETH' ? `${escrow.amount.toFixed(6)} ETH` : `${escrow?.amount.toLocaleString()} USDC (seeded)`}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Status:</span>
                  <span className="font-semibold text-indigo-300 uppercase">{escrow?.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Payer Address:</span>
                  <span className="font-mono text-slate-400">{escrow?.companyAddress}</span>
                </div>
              </div>
              {bounty.escrowStatus === 'funded' && (
                <div className="mt-4 border-t border-slate-800 pt-4 space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500" htmlFor="researcher-payout-address">
                    Researcher payout address
                  </label>
                  <input
                    id="researcher-payout-address"
                    value={researcherAddress}
                    onChange={(event) => setResearcherAddress(event.target.value)}
                    placeholder="0x..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-200 outline-none focus:border-indigo-400"
                  />
                  <button
                    disabled={isReleasing || !/^0x[a-fA-F0-9]{40}$/.test(researcherAddress) || !/^\d+$/.test(bounty.escrowId)}
                    onClick={async () => {
                      setIsReleasing(true);
                      setReleaseError(null);
                      try {
                        await releaseEscrow(bounty.id, researcherAddress);
                      } catch (error) {
                        setReleaseError(error instanceof Error ? error.message : String(error));
                      } finally {
                        setIsReleasing(false);
                      }
                    }}
                    className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isReleasing ? 'Confirming Sepolia payout...' : 'Release ETH escrow'}
                  </button>
                  {releaseError && <p className="text-[11px] text-red-300">{releaseError}</p>}
                  <p className="text-[10px] text-slate-500">Company-authorized payout: the connected funding wallet must approve the transaction.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Footer Actions */}
          <div className="pt-5 border-t border-slate-700/40 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl"
            >
              Close
            </button>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Vulnerability Report</span>
            </button>
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <SubmitVulnerabilityModal
          bounty={bounty}
          onClose={() => {
            setShowSubmitModal(false);
            onClose();
          }}
        />
      )}
    </>
  );
};
