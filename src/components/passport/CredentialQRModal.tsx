import React, { useEffect } from 'react';
import { X, QrCode, ShieldCheck } from 'lucide-react';
import { VerifiableCredential } from '../../identity/vcManager';

interface CredentialQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  credential: VerifiableCredential;
}

export const CredentialQRModal: React.FC<CredentialQRModalProps> = ({ isOpen, onClose, credential }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 relative shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">W3C Verifiable Credential</h3>
            <p className="text-xs text-slate-400">Phase 6: Portable Credential Export</p>
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center space-y-4">
          <div className="w-48 h-48 bg-white p-3 rounded-xl flex items-center justify-center shadow-inner">
            <div className="w-full h-full bg-slate-950 rounded border-2 border-slate-900 flex flex-col items-center justify-center p-2 text-center text-[9px] font-mono text-emerald-400 break-all overflow-hidden">
              <QrCode className="w-24 h-24 text-slate-200 mb-1" />
              <span>{credential.id}</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-slate-200 block">
              {credential.credentialSubject.reputationLevel}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono block">
              Trust Score: {credential.credentialSubject.trustScore} • Verified Bounties: {credential.credentialSubject.verifiedBountiesCount}
            </span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>W3C Standard Compliance</span>
          </div>
          <p className="text-[10px] leading-relaxed">
            Scan with any W3C compatible identity wallet (e.g., Polygon ID Wallet, MetaMask Institutional) to import portable trust reputation.
          </p>
        </div>
      </div>
    </div>
  );
};
