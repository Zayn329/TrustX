import React, { useState } from 'react';
import { useTrustStore } from '../../store/useTrustStore';
import { Severity } from '../../types';
import { FileCheck2, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

export const SubmissionProofView: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { state, submitVulnerabilityReport, setSelectedSubmissionId } = useTrustStore();
  const { bounties, reports } = state;

  const [bountyId, setBountyId] = useState(bounties[0].id);
  const [title, setTitle] = useState('');
  const [vulnerabilityType, setVulnerabilityType] = useState('Smart Contract / Reentrancy');
  const [severity, setSeverity] = useState<Severity>('CRITICAL');
  const [description, setDescription] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [impact, setImpact] = useState('');

  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !reproductionSteps) return;

    const newReport = submitVulnerabilityReport({
      bountyId,
      title,
      vulnerabilityType,
      severity,
      description,
      reproductionSteps,
      impact,
    });

    setSubmittedReportId(newReport.id);
  };

  const activeReport = reports.find((r) => r.id === (submittedReportId || reports[0]?.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Vulnerability Submission & Proof-of-Discovery</h1>
          <p className="text-xs text-slate-400 mt-1">
            Generates cryptographic proof (hashes & DID signatures) upon submission, anchoring provenance before technical verification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Submission Form (6 cols) */}
        <div className="lg:col-span-6 bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-5">
          <div className="flex items-center space-x-2 border-b border-dark-700 pb-3">
            <FileCheck2 className="w-5 h-5 text-trust-500" />
            <h2 className="text-base font-bold text-white">Submit Vulnerability Disclosure</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Bounty Program</label>
              <select
                value={bountyId}
                onChange={(e) => setBountyId(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-trust-500"
              >
                {bounties.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.orgName} — {b.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Vulnerability Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Flashloan reentrancy in Vault.withdraw()"
                className="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-trust-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={vulnerabilityType}
                  onChange={(e) => setVulnerabilityType(e.target.value)}
                  className="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-trust-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Claimed Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-trust-500"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Description & Vulnerable Function</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the vulnerability root cause..."
                className="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-trust-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Reproduction Steps & PoC Payload</label>
              <textarea
                rows={3}
                value={reproductionSteps}
                onChange={(e) => setReproductionSteps(e.target.value)}
                placeholder="Step 1, Step 2, PoC script..."
                className="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-trust-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Impact Assessment</label>
              <input
                type="text"
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                placeholder="e.g. Total TVL drain ($4.2M at risk)"
                className="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-trust-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-trust-600 to-emerald-500 hover:from-trust-500 hover:to-emerald-400 text-dark-900 font-extrabold py-3 rounded-xl transition flex items-center justify-center space-x-2 text-sm shadow-lg shadow-trust-600/20"
            >
              <span>Generate Cryptographic Proof & Anchor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Col: Live Proof-of-Discovery Visualizer (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-dark-700 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-trust-500" />
                <h2 className="text-base font-bold text-white">Proof-of-Discovery Record</h2>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                CRYPTOGRAPHICALLY PROVEN
              </span>
            </div>

            {activeReport ? (
              <div className="space-y-4 text-xs">
                {/* Proof distinction callout */}
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-start space-x-3">
                  <KeyRound className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-300">Cryptographic Provenance vs Technical Verification</p>
                    <p className="text-slate-300">
                      This proof anchors existence and ownership timestamp on-chain. Technical vulnerability validity is evaluated separately in the verification phase.
                    </p>
                  </div>
                </div>

                <div className="bg-dark-900/80 border border-dark-600 rounded-xl p-4 space-y-3 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Researcher DID Identity</span>
                    <span className="text-trust-400 font-semibold">{activeReport.researcherDid}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Content Hash (SHA-256)</span>
                    <span className="text-slate-200 break-all">{activeReport.proof.contentHash}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Evidence Payload Hash (SHA-256)</span>
                    <span className="text-slate-200 break-all">{activeReport.proof.evidenceHash}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">DID Signature (Ed25519)</span>
                    <span className="text-emerald-400 break-all">{activeReport.proof.signature}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dark-700 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">On-Chain Block</span>
                      <span className="text-white">#{activeReport.proof.blockNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Anchor Timestamp</span>
                      <span className="text-white">{new Date(activeReport.proof.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      setSelectedSubmissionId(activeReport.id);
                      setActiveTab('verification');
                    }}
                    className="w-full bg-trust-600 hover:bg-trust-500 text-dark-900 font-bold py-2.5 rounded-xl transition text-center"
                  >
                    Track in Verification Timeline →
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                No active report selected. Fill the form to generate proof.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
