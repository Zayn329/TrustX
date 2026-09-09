import React from 'react';
import { useTrustStore } from '../../store/useTrustStore';
import { Network, ShieldCheck } from 'lucide-react';

export const TrustGraphView: React.FC<{ setActiveTab?: (tab: string) => void }> = () => {
  const { state, trustScoreBreakdown } = useTrustStore();
  const { currentIdentity, organization, bounties, reports } = state;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Trust Score Breakdown & Network Graph</h1>
          <p className="text-xs text-slate-400 mt-1">
            Explainable deterministic scoring algorithm & interconnected web of verified entity relationships.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Deterministic Score Formula Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-trust-500" />
              <h2 className="text-base font-bold text-white">Deterministic Scoring Engine</h2>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-extrabold">
              {trustScoreBreakdown.overallScore} / 1000
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Formula: <code className="font-mono text-trust-400 bg-dark-900 px-1.5 py-0.5 rounded">Trust = min(1000, Tech + Verif + Bounty + Project - Risk)</code>
          </p>

          <div className="space-y-4 text-xs">
            <div className="bg-dark-700/40 border border-dark-600 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-200">1. Technical Contributions</span>
                <span className="text-trust-400 font-mono">+{trustScoreBreakdown.technicalContributions}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Calculated from verified critical/high disclosures.
              </p>
            </div>

            <div className="bg-dark-700/40 border border-dark-600 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-200">2. Verification Accuracy Rate</span>
                <span className="text-emerald-400 font-mono">+{trustScoreBreakdown.successfulVerifications}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ratio of approved disclosures vs rejected spam.
              </p>
            </div>

            <div className="bg-dark-700/40 border border-dark-600 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-200">3. Bounty Payout Provenance</span>
                <span className="text-amber-400 font-mono">+{trustScoreBreakdown.bountyHistory}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Total value released via smart contract escrow.
              </p>
            </div>

            <div className="bg-dark-700/40 border border-dark-600 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-200">4. Risk Signal Deductions</span>
                <span className="text-red-400 font-mono">-{trustScoreBreakdown.riskDeductions}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Penalties applied for account age anomalies or invalid submissions.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Trust & Contribution Relationship Graph (7 cols) */}
        <div className="lg:col-span-7 bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <Network className="w-5 h-5 text-trust-500" />
              <h2 className="text-base font-bold text-white">Trust & Contribution Node Graph</h2>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Dynamic Canvas</span>
          </div>

          <div className="relative w-full h-[380px] bg-dark-900/90 rounded-2xl border border-dark-600 p-4 overflow-hidden flex items-center justify-center">
            {/* SVG Lines Connecting Nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-dark-600" strokeWidth="2">
              <line x1="15%" y1="50%" x2="50%" y2="25%" stroke="#14b8a6" strokeDasharray="4" />
              <line x1="15%" y1="50%" x2="50%" y2="75%" stroke="#10b981" strokeDasharray="4" />
              <line x1="50%" y1="25%" x2="85%" y2="50%" stroke="#f59e0b" strokeDasharray="4" />
              <line x1="50%" y1="75%" x2="85%" y2="50%" stroke="#38bdf8" strokeDasharray="4" />
            </svg>

            {/* Nodes */}
            {/* Center Left: Researcher Node */}
            <div className="absolute left-[8%] top-[40%] transform -translate-y-1/2 bg-dark-800 border-2 border-trust-500 p-3 rounded-2xl text-center space-y-1 shadow-lg shadow-trust-500/20">
              <span className="text-[9px] font-bold text-trust-400 uppercase">Researcher Node</span>
              <p className="text-xs font-black text-white">@{currentIdentity.handle}</p>
              <span className="text-[9px] bg-trust-500/10 text-trust-400 px-1.5 py-0.5 rounded font-mono">
                {trustScoreBreakdown.overallScore} Score
              </span>
            </div>

            {/* Top Middle: Bounty Node */}
            <div className="absolute left-[42%] top-[12%] bg-dark-800 border border-amber-500/50 p-2.5 rounded-xl text-center space-y-0.5">
              <span className="text-[9px] font-bold text-amber-400 uppercase">Active Bounty</span>
              <p className="text-[11px] font-bold text-white truncate max-w-[120px]">{bounties[0].title}</p>
            </div>

            {/* Bottom Middle: Proof Anchor Node */}
            <div className="absolute left-[42%] top-[68%] bg-dark-800 border border-emerald-500/50 p-2.5 rounded-xl text-center space-y-0.5">
              <span className="text-[9px] font-bold text-emerald-400 uppercase">Proof Anchor</span>
              <p className="text-[10px] font-mono text-slate-300">{reports[0]?.proof.evidenceHash.slice(0, 10)}...</p>
            </div>

            {/* Right: Organization Node */}
            <div className="absolute right-[8%] top-[40%] transform -translate-y-1/2 bg-dark-800 border-2 border-sky-400 p-3 rounded-2xl text-center space-y-1">
              <span className="text-[9px] font-bold text-sky-400 uppercase">Organization</span>
              <p className="text-xs font-black text-white">{organization.displayName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
