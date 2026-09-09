import React, { useState } from 'react';
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

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-semibold text-slate-200">{bounty.organizationName}</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                Organization Trust Score: {bounty.organizationTrustScore}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-100">{bounty.title}</h1>

            <div className="flex flex-wrap gap-4 text-xs text-slate-400 border-y border-slate-800/80 py-3">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Max Reward:</span>
                <span className="font-bold text-slate-200">${bounty.rewardAmount.toLocaleString()} {bounty.rewardCurrency}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-400" />
                <span>Escrow Contract:</span>
                <span className="font-mono text-slate-300">{escrow?.escrowContractAddress || 'Smart Escrow'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Deadline:</span>
                <span className="text-slate-300">{new Date(bounty.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Description</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{bounty.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-2">Scope & Covered Assets</h3>
              <div className="flex flex-wrap gap-2">
                {bounty.scope.map((item, idx) => (
                  <span key={idx} className="bg-slate-950 text-indigo-300 font-mono text-xs px-3 py-1 rounded-lg border border-slate-800">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-2">Verification & Submission Rules</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                {bounty.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
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
                  <span className="font-semibold text-indigo-300 uppercase">{escrow?.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Payer Address:</span>
                  <span className="font-mono text-slate-400">{escrow?.companyAddress}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg"
            >
              Close
            </button>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-lg shadow-indigo-600/20"
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
