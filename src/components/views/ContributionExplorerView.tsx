import React, { useState } from 'react';
import { useTrustStore } from '../../store/useTrustStore';
import { Search } from 'lucide-react';

export const ContributionExplorerView: React.FC<{ setActiveTab: (tab: string) => void }> = () => {
  const { state } = useTrustStore();
  const { reports, bounties, verifications } = state;

  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');

  const report = reports.find((r) => r.id === selectedReportId) || reports[0];
  const bounty = bounties.find((b) => b.id === report?.bountyId);
  const verification = verifications.find((v) => v.submissionId === report?.id);

  if (!report) return <div className="text-white p-6">No contributions to explore.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Contribution Verification Trace Explorer</h1>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end provenance audit tracing a contribution from Identity → Proof → Verification → Ledger → Escrow.
          </p>
        </div>

        {/* Report Selector */}
        <div className="flex items-center space-x-2 bg-dark-800 border border-dark-600 px-3 py-1.5 rounded-xl text-xs">
          <Search className="w-4 h-4 text-trust-500" />
          <select
            value={report.id}
            onChange={(e) => setSelectedReportId(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none"
          >
            {reports.map((r) => (
              <option key={r.id} value={r.id} className="bg-dark-800 text-white">
                {r.title} ({r.severity})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trace Chain Cards */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Provenance Trace Execution Path</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Step 1: Identity */}
          <div className="bg-dark-900 border border-dark-600 rounded-xl p-4 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-trust-400 uppercase">1. Researcher DID</span>
            <p className="font-bold text-white truncate">{report.researcherHandle}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{report.researcherDid}</p>
          </div>

          {/* Step 2: Proof */}
          <div className="bg-dark-900 border border-dark-600 rounded-xl p-4 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-trust-400 uppercase">2. Proof Anchor</span>
            <p className="font-bold text-white truncate">Evidence Hash</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{report.proof.evidenceHash}</p>
          </div>

          {/* Step 3: Verification */}
          <div className="bg-dark-900 border border-dark-600 rounded-xl p-4 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">3. Triage Status</span>
            <p className="font-bold text-white truncate">{report.status}</p>
            <p className="text-[10px] text-slate-400 truncate">{verification ? verification.verifierName : 'Pending'}</p>
          </div>

          {/* Step 4: Ledger Block */}
          <div className="bg-dark-900 border border-dark-600 rounded-xl p-4 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-sky-400 uppercase">4. Block Anchor</span>
            <p className="font-bold text-white truncate">Block #{report.proof.blockNumber}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{report.proof.blockHash}</p>
          </div>

          {/* Step 5: Reward Released */}
          <div className="bg-dark-900 border border-amber-500/40 rounded-xl p-4 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-amber-400 uppercase">5. Escrow Released</span>
            <p className="font-bold text-white">${verification?.payoutAmount?.toLocaleString() || 0} USD</p>
            <p className="text-[10px] text-slate-400 truncate">Smart Contract Release</p>
          </div>
        </div>

        {/* Detailed Breakdown Section */}
        <div className="bg-dark-900/80 border border-dark-600 rounded-2xl p-5 space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-dark-700 pb-2">
            <span className="text-slate-400">Contribution ID:</span>
            <span className="text-trust-400">{report.id}</span>
          </div>

          <div className="flex justify-between items-center border-b border-dark-700 pb-2">
            <span className="text-slate-400">Title:</span>
            <span className="text-white font-sans">{report.title}</span>
          </div>

          <div className="flex justify-between items-center border-b border-dark-700 pb-2">
            <span className="text-slate-400">Cryptographic Ed25519 Signature:</span>
            <span className="text-emerald-400 truncate max-w-xs">{report.proof.signature}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Bounty Escrow Contract:</span>
            <span className="text-sky-400">{bounty?.escrowContractAddress}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
