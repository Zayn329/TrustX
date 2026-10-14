import React, { useEffect, useState } from 'react';
import { X, QrCode, ShieldCheck, Download, Copy, Check } from 'lucide-react';
import { VerifiableCredential } from '../../identity/vcManager';

interface CredentialQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  credential: VerifiableCredential;
}

export const CredentialQRModal: React.FC<CredentialQRModalProps> = ({ isOpen, onClose, credential }) => {
  const [copied, setCopied] = useState(false);

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

  const openIdDeepLink = `openid-vc://credential?vc=${encodeURIComponent(JSON.stringify(credential))}`;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(credential, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(credential, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vc_${credential.credentialSubject.id.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
            <p className="text-xs text-slate-400">Portable DID Trust Reputation Export</p>
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center space-y-4">
          <div className="w-48 h-48 bg-white p-3 rounded-xl flex items-center justify-center shadow-inner relative group">
            <a
              href={openIdDeepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-full bg-slate-950 rounded border-2 border-slate-900 flex flex-col items-center justify-center p-2 text-center text-[9px] font-mono text-emerald-400 break-all overflow-hidden cursor-pointer"
              title="Click to open in Mobile DID Wallet (openid-vc://)"
            >
              <QrCode className="w-24 h-24 text-slate-200 mb-1" />
              <span>{credential.id}</span>
            </a>
          </div>

          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-slate-200 block">
              {credential.credentialSubject.reputationLevel}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono block">
              Trust Score: {credential.credentialSubject.trustScore} • Verified Claims: {credential.credentialSubject.verifiedBountiesCount}
            </span>
            <span className="text-[10px] text-indigo-300 font-mono block truncate max-w-[320px]">
              JWS Proof: {credential.proof.jws.slice(0, 32)}...
            </span>
          </div>

          <div className="flex items-center gap-2 w-full pt-1">
            <button
              onClick={handleCopyJson}
              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{copied ? 'Copied JSON' : 'Copy JSON-LD'}</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download VC</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>W3C VC Specification Compliant</span>
          </div>
          <p className="text-[10px] leading-relaxed">
            Import into Polygon ID, MetaMask Institutional, or any W3C compatible identity wallet using <code className="text-indigo-300">openid-vc://</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
