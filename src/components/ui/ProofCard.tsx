import React from 'react';
import { FileKey2, Key, ShieldCheck } from 'lucide-react';
import { Proof, Verification } from '../../domain/types';

interface ProofCardProps {
  proof: Proof;
  verification?: Verification;
}

export const ProofCard: React.FC<ProofCardProps> = ({ proof, verification }) => {
  return (
    <div className="tx-surface rounded-2xl p-6 space-y-5 sm:p-7">
      {/* Proof Header */}
      <div className="flex items-center justify-between border-b border-slate-700/40 pb-4">
        <div className="flex items-center gap-2">
          <FileKey2 className="w-5 h-5 text-blue-300" />
          <div><div className="tx-kicker">Proof record</div><span className="mt-1 block text-sm font-semibold text-slate-100">Cryptographic proof-of-discovery</span></div>
        </div>
        <span className="status-pill status-success">
          Anchored
        </span>
      </div>

      {/* Proof Content Grid */}
      <div className="space-y-3 font-mono text-xs">
        <div>
          <span className="text-slate-500 text-[10px] block uppercase tracking-wider font-sans">Evidence SHA-256 Hash</span>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-700/40 text-emerald-300 break-all select-all mt-2">
            {proof.contentHash}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="text-slate-500 text-[10px] block uppercase tracking-wider font-sans">Digital Signature</span>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-700/40 text-slate-300 truncate mt-2">
              {proof.signature}
            </div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block uppercase tracking-wider font-sans">Proof Timestamp</span>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-700/40 text-slate-300 mt-2">
              {new Date(proof.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Distinct Callout Box */}
      <div className="bg-slate-950/55 p-4 rounded-2xl border border-slate-700/40 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-sans font-medium flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-blue-300" />
            <span>Cryptographically Proven</span>
          </span>
          <span className="text-emerald-400 font-bold font-sans">PASSED</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-slate-400 font-sans font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
            <span>Technical Vulnerability Verification</span>
          </span>
          <span
            className={`font-bold font-sans ${
              verification?.status === 'valid'
                ? 'text-emerald-400'
                : verification?.status === 'pending'
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            {verification?.status ? verification.status.toUpperCase() : 'PENDING REVIEW'}
          </span>
        </div>
      </div>
    </div>
  );
};
