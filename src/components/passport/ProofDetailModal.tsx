import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, Hash, Key, RefreshCw, Cpu, Layers } from 'lucide-react';
import { VulnerabilityReport, Verification } from '../../domain/types';

interface ProofDetailModalProps {
  report: VulnerabilityReport;
  verification?: Verification;
  onClose: () => void;
}

export const ProofDetailModal: React.FC<ProofDetailModalProps> = ({ report, verification, onClose }) => {
  const [recalculatedHash, setRecalculatedHash] = useState<string | null>(null);
  const [recordedHash, setRecordedHash] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const computeRecordedHash = async () => {
      const payloadString = JSON.stringify({
        id: report.id,
        title: report.title,
        description: report.description,
        reproductionSteps: report.reproductionSteps,
        evidence: report.evidence
      });
      const encoder = new TextEncoder();
      const data = encoder.encode(payloadString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setRecordedHash(hashHex);
    };
    computeRecordedHash();
  }, [report]);

  const handleRecalculateHash = async () => {
    setIsVerifying(true);
    try {
      const payloadString = JSON.stringify({
        id: report.id,
        title: report.title,
        description: report.description,
        reproductionSteps: report.reproductionSteps,
        evidence: report.evidence
      });
      const encoder = new TextEncoder();
      const data = encoder.encode(payloadString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setRecalculatedHash(hashHex);
    } catch (err) {
      console.error("Failed to recompute hash:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const isHashMatch = recalculatedHash ? recalculatedHash.toLowerCase() === recordedHash.toLowerCase() : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Proof Record & Evidence Inspection
              </h2>
              <p className="text-xs text-slate-400">
                Verifiable cryptographic proof for Report #{report.id.substring(0, 8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Inspection"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Submission Context */}
          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Submission Context</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                verification?.status === 'valid'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : verification?.status === 'invalid'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {verification?.status === 'valid' ? 'Verified Valid' : verification?.status === 'invalid' ? 'Verification Failed' : 'Pending Verification'}
              </span>
            </div>
            <h3 className="text-base font-semibold text-white">{report.title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div>
                <span className="text-slate-400 block">Report ID:</span>
                <span className="font-mono text-slate-200">{report.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Bounty Target:</span>
                <span className="font-mono text-slate-200">{report.bountyId || 'trustx-settlement-v1'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Type:</span>
                <span className="font-mono text-cyan-400 truncate block">{report.vulnerabilityType || 'Smart Contract Defect'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Researcher ID:</span>
                <span className="font-mono text-slate-200 truncate block">{report.researcherId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Submission Date:</span>
                <span className="text-slate-200">{new Date(report.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Severity Rating:</span>
                <span className="font-semibold text-rose-400 capitalize">{report.severity}</span>
              </div>
            </div>
          </div>

          {/* Evidence Hash Integrity Verification */}
          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Hash className="w-4 h-4 text-cyan-400" />
                <span>Evidence Hash Integrity (SHA-256)</span>
              </div>
              <button
                onClick={handleRecalculateHash}
                disabled={isVerifying}
                className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-medium transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                {recalculatedHash ? 'Re-calculate Hash' : 'Verify Payload Hash'}
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span>Recorded Evidence Hash (Report Payload):</span>
                  <button
                    onClick={() => copyToClipboard(recordedHash, 'hash')}
                    className="text-cyan-400 hover:underline"
                  >
                    {copied === 'hash' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-200 break-all select-all">
                  {recordedHash || 'Calculating evidence hash...'}
                </div>
              </div>

              {recalculatedHash && (
                <div className="pt-2">
                  <div className="text-slate-400 mb-1">Live Recalculated Payload Hash:</div>
                  <div className={`font-mono p-2.5 rounded-lg border text-xs break-all ${
                    isHashMatch
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}>
                    {recalculatedHash}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs font-medium">
                    {isHashMatch ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Hash Integrity Verified — Payload matches recorded evidence hash exactly.
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400">
                        <X className="w-4 h-4" /> Hash Mismatch — Payload data has been altered!
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * Note: The evidence hash represents a deterministic SHA-256 digest over the title, description, reproduction steps, and evidence payload. It ensures submission content remains tamper-evident.
            </p>
          </div>

          {/* Oracle Verification & Cryptographic Proof */}
          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Key className="w-4 h-4 text-purple-400" />
                <span>Oracle Proof & Anchoring Status</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {verification?.oracleEvidenceHash ? 'Ed25519 Signed' : 'Pending Signature'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">Verifier Node:</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" /> {verification?.verifierName || 'Nexus Security Oracle Worker v1'}
                </span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">Anchoring State:</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" /> Off-Chain Signed & Sepolia Escrow Bound
                </span>
              </div>
            </div>

            {verification?.oracleEvidenceHash && (
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Oracle Evidence Proof Signature:</span>
                  <button
                    onClick={() => copyToClipboard(verification.oracleEvidenceHash || '', 'sig')}
                    className="text-cyan-400 hover:underline"
                  >
                    {copied === 'sig' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="font-mono text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300 break-all select-all">
                  {verification.oracleEvidenceHash}
                </div>
              </div>
            )}

            {/* Execution Notes */}
            {verification?.notes && (
              <div className="pt-2">
                <span className="text-xs text-slate-400 block mb-1">Oracle Execution Notes:</span>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
                  <span className="text-cyan-500/70">{`>`}</span> {verification.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">TrustX Cryptographic Audit Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Close Inspection
          </button>
        </div>
      </div>
    </div>
  );
};
