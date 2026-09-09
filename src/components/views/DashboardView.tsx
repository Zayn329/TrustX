import React from 'react';
import { ShieldCheck, Award, Lock, FileCheck, ArrowRight, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { currentResearcher, reports, proofs, verifications, escrows } = useTrust();

  const totalRewardsLocked = escrows.reduce((sum, e) => (e.status === 'locked' ? sum + e.amount : sum), 0);
  const totalRewardsReleased = escrows.reduce((sum, e) => (e.status === 'released' ? sum + e.amount : sum), 0);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <ShieldCheck className="w-96 h-96 text-indigo-400" />
        </div>
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Open-Source Decentralized Trust Infrastructure</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Trustless Bug Bounty Platform
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate intermediary dispute delays with cryptographic proof-of-discovery, programmatic escrow releases, and portable, multi-platform researcher reputation records.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('bounties')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-indigo-600/20"
            >
              <span>Explore Active Bounties</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('explorer')}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm px-5 py-2.5 rounded-lg transition-all"
            >
              <span>Audit Contribution Trail</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Researcher Trust Score</div>
            <div className="text-2xl font-bold text-slate-100 mt-1 flex items-baseline gap-2">
              <span>{currentResearcher.trustScore}</span>
              <span className="text-xs text-emerald-400 font-semibold">/ 100</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Calculated deterministically</div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Verified Contributions</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">
              {currentResearcher.verifiedContributionsCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Acceptance Rate: {currentResearcher.acceptanceRate}%</div>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Rewards Earned</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              ${currentResearcher.totalRewardsEarned.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">USDC / ETH Programmatic Escrow</div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Escrow Value Locked</div>
            <div className="text-2xl font-bold text-indigo-300 mt-1">
              ${totalRewardsLocked.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Released: ${totalRewardsReleased.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
            <Lock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Protocol Core Principle Highlight */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          <span>Core Protocol Flow & Integrity Distinction</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80">
            <div className="font-semibold text-emerald-400 flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Cryptographic Proof & Provenance</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Submissions undergo immediate SHA-256 evidence hashing, cryptographic key signatures, and block timestamping. This guarantees indisputable timestamped evidence that cannot be altered or backdated.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80">
            <div className="font-semibold text-sky-400 flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>2. Technical Vulnerability Verification</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Security reviewers evaluate the submission against defined scope and impact criteria. Once technically confirmed, the smart contract escrow triggers automatic payout and updates portable reputation records.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Submissions & Proofs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-200">Recent Proof-Anchored Submissions</h2>
          <button
            onClick={() => onNavigate('explorer')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            View Full Explorer →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider">
                <th className="py-3 px-4">Report / Vulnerability</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">SHA-256 Proof Hash</th>
                <th className="py-3 px-4">Technical Verification</th>
                <th className="py-3 px-4">Escrow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {reports.map(report => {
                const proof = proofs.find(p => p.contributionId === report.id);
                const verification = verifications.find(v => v.contributionId === report.id);

                return (
                  <tr key={report.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-200">
                      <div>{report.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{report.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        {report.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {proof ? `${proof.contentHash.slice(0, 16)}...` : 'Generating...'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                          verification?.status === 'valid'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : verification?.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        {verification?.status ? verification.status.toUpperCase() : 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      <span className="text-emerald-400">Programmatic Escrow Active</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
