import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Lock, DollarSign, Calendar, Send } from 'lucide-react';
import { Bounty } from '../../domain/types';
import { useTrust } from '../../store/TrustContext';
import { SubmitVulnerabilityModal } from './SubmitVulnerabilityModal';

interface BountyDetailModalProps {
  bounty: Bounty;
  onClose: () => void;
}

export const BountyDetailModal: React.FC<BountyDetailModalProps> = ({ bounty, onClose }) => {
  const { escrows } = useTrust();
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const escrow = escrows.find(e => e.id === bounty.escrowId);

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
        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      >
        <div
          onClick={e => e.stopPropagation()}
          className="bg-[#111111] border border-white/[0.09] rounded-xl max-w-4xl w-full p-5 sm:p-8 space-y-7 relative max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/[0.07] pb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D7FF3F]" />
                <span className="text-sm font-semibold text-zinc-200">{bounty.organizationName}</span>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  Organization Trust Score: {bounty.organizationTrustScore}
                </span>
              </div>

              <h1 className="text-3xl font-semibold text-zinc-100">{bounty.title}</h1>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-md hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.07] text-xs text-zinc-400 sm:grid-cols-3">
            <div className="flex items-center gap-1.5 bg-[#050505] p-4">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Max Reward:</span>
              <span className="font-bold text-slate-200">${bounty.rewardAmount.toLocaleString()} {bounty.rewardCurrency}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#050505] p-4">
              <Lock className="w-4 h-4 text-[#D7FF3F]" />
              <span>Escrow Contract:</span>
              <span className="font-mono text-slate-300">{escrow?.escrowContractAddress || 'Smart Escrow'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#050505] p-4">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Deadline:</span>
              <span className="text-slate-300">{new Date(bounty.deadline).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Body Content Container */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
            <div>
              <div className="tx-kicker">The opportunity</div>
              <p className="mt-2 max-w-3xl text-sm text-zinc-300 leading-7">{bounty.description}</p>
            </div>

            <div>
              <h3 className="tx-kicker mb-2">Scope & covered assets</h3>
              <div className="flex flex-wrap gap-2">
                {bounty.scope.map((item, idx) => (
                  <span key={idx} className="bg-[#050505] text-zinc-300 font-mono text-xs px-3 py-1.5 rounded-md border border-white/[0.08]">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="tx-kicker mb-2">Verification & submission rules</h3>
              <ul className="list-disc list-inside space-y-1.5 text-zinc-300 bg-[#050505] p-3.5 rounded-lg border border-white/[0.08]">
                {bounty.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>

              <div className="bg-[#050505] p-4 rounded-lg border border-white/[0.08] space-y-2">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Smart Contract Escrow Status</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Escrow Amount:</span>
                  <span className="font-bold text-emerald-400">${escrow?.amount.toLocaleString()} USDC</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Status:</span>
                  <span className="font-semibold text-rose-300 uppercase">{escrow?.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Payer Address:</span>
                  <span className="font-mono text-slate-400">{escrow?.companyAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer Actions */}
          <div className="pt-5 border-t border-white/[0.07] flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-[#161616] rounded-md"
            >
              Close
            </button>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-[#050505] bg-[#D7FF3F] hover:bg-[#B8E638] rounded-md transition-all"
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
