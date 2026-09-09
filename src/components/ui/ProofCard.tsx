import React from 'react';
import { FileKey2, Key, ShieldCheck } from 'lucide-react';
import { Proof, Verification } from '../../domain/types';

interface ProofCardProps {
  proof: Proof;
  verification?: Verification;
}

export const ProofCard: React.FC<ProofCardProps> = ({ proof, verification }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Proof Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <FileKey2 className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-bold text-slate-200">Cryptographic Proof-of-Discovery</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Anchored On-Chain
        </span>
      </div>

      {/* Proof Content Grid */}
      <div className="space-y-3 font-mono text-xs">
        <div>
          <span className="text-slate-500 text-[10px] block uppercase tracking-wider font-sans">Evidence SHA-256 Hash</span>
          <div className="bg-slate-950 p-2 rounded border border-slate-800/80 text-emerald-400 break-all select-all mt-1">
            {proof.contentHash}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="text-slate-500 text-[10px] block uppercase tracking-wider font-sans">Digital Signature</span>
            <div className="bg-slate-950 p-2 rounded border border-slate-800/80 text-slate-300 truncate mt-1">
              {proof.signature}
            </div>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block uppercase tracking-wider font-sans">Proof Timestamp</span>
            <div className="bg-slate-950 p-2 rounded border border-slate-800/80 text-slate-300 mt-1">
              {new Date(proof.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Distinct Callout Box */}
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/90 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-sans font-medium flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cryptographically Proven</span>
          </span>
          <span className="text-emerald-400 font-bold font-sans">PASSED</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-slate-400 font-sans font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
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
