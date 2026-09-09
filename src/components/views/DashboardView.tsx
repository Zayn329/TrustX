import React from 'react';
import { useTrustStore } from '../../store/useTrustStore';
import { ShieldCheck, Award, Lock, CheckCircle2, FileCode2, ArrowUpRight } from 'lucide-react';

export const DashboardView: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { state, trustScoreBreakdown } = useTrustStore();
  const { currentIdentity, bounties, reports, verifications, blockchainEvents } = state;

  const totalLockedTVL = bounties.reduce((sum, b) => sum + b.totalEscrowLocked, 0);
  const totalPayouts = verifications.reduce((sum, v) => sum + (v.payoutAmount || 0), 0);
  const validCount = reports.filter((r) => r.status === 'VERIFIED_VALID' || r.status === 'REWARD_RELEASED').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner & Question */}
      <div className="bg-gradient-to-r from-dark-800 via-dark-800 to-dark-700 border border-dark-600 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-trust-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-trust-500 text-xs font-semibold uppercase tracking-wider bg-trust-500/10 px-2.5 py-1 rounded-full border border-trust-500/20">
              <span>Open-Source Decentralized Trust Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why should a project trust <span className="text-trust-500">@{currentIdentity.handle}</span>?
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Trust is not an arbitrary score. It is an immutable accumulation of cryptographically proven disclosures, verified technical severity, and smart contract escrow releases.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('submit')}
            className="bg-trust-600 hover:bg-trust-500 text-dark-900 font-bold px-5 py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-sm whitespace-nowrap"
          >
            <span>Submit Vulnerability</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Researcher Trust Score</span>
            <ShieldCheck className="w-5 h-5 text-trust-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{trustScoreBreakdown.overallScore}</span>
            <span className="text-xs text-slate-400">/ 1000</span>
          </div>
          <p className="mt-1 text-xs text-emerald-400">High Trust Rating (Top 2%)</p>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Bounty Rewards Earned</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">${totalPayouts.toLocaleString()}</div>
          <p className="mt-1 text-xs text-slate-400">Released via Smart Escrow</p>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Verified Disclosures</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">{validCount}</div>
          <p className="mt-1 text-xs text-slate-400">100% Technical Accuracy</p>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Escrow Locked TVL</span>
            <Lock className="w-5 h-5 text-sky-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">${totalLockedTVL.toLocaleString()}</div>
          <p className="mt-1 text-xs text-sky-400">Active Bounty Contracts</p>
        </div>
      </div>

      {/* Two Column Layout: Trust Breakdown & Recent On-Chain Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Trust Score Breakdown & Recent Reports */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Trust Score Contributing Dimensions</span>
              </h2>
              <button
                onClick={() => setActiveTab('graph')}
                className="text-xs text-trust-500 hover:text-trust-400 font-medium"
              >
                View Full Score Model & Graph →
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Technical Contributions (Severity Weight)</span>
                  <span className="text-white font-mono">{trustScoreBreakdown.technicalContributions} / 300</span>
                </div>
                <div className="w-full bg-dark-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-trust-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(trustScoreBreakdown.technicalContributions / 300) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Successful Verification Rate</span>
                  <span className="text-white font-mono">{trustScoreBreakdown.successfulVerifications} / 300</span>
                </div>
                <div className="w-full bg-dark-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(trustScoreBreakdown.successfulVerifications / 300) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Bounty Payout Provenance</span>
                  <span className="text-white font-mono">{trustScoreBreakdown.bountyHistory} / 250</span>
                </div>
                <div className="w-full bg-dark-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(trustScoreBreakdown.bountyHistory / 250) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Cross-Project Verification Trust</span>
                  <span className="text-white font-mono">{trustScoreBreakdown.projectTrust} / 150</span>
                </div>
                <div className="w-full bg-dark-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(trustScoreBreakdown.projectTrust / 150) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Disclosures */}
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Recent Verified Vulnerability Disclosures</h2>
              <button
                onClick={() => setActiveTab('verification')}
                className="text-xs text-trust-500 hover:text-trust-400 font-medium"
              >
                View Verification Timelines →
              </button>
            </div>

            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-dark-700/50 border border-dark-600 hover:border-trust-500/50 rounded-xl p-4 transition cursor-pointer"
                  onClick={() => setActiveTab('verification')}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                          {report.severity}
                        </span>
                        <span className="text-xs text-slate-400">{report.vulnerabilityType}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white mt-1">{report.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Bounty: {report.bountyTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-md">
                        ✓ {report.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Live On-Chain Activity Feed */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <FileCode2 className="w-4 h-4 text-trust-500" />
              <span>On-Chain Trust Events</span>
            </h2>
            <span className="text-[10px] bg-trust-900/60 text-trust-400 px-2 py-0.5 rounded border border-trust-500/20 font-mono">
              Simulated Web3
            </span>
          </div>

          <div className="space-y-3">
            {blockchainEvents.slice(0, 5).map((evt) => (
              <div key={evt.id} className="border-l-2 border-trust-500 pl-3 py-1 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-trust-400 uppercase">{evt.eventType}</span>
                  <span className="text-slate-500 font-mono">Block #{evt.blockNumber}</span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{evt.details}</p>
                <div className="text-[10px] text-slate-500 font-mono truncate">Tx: {evt.txHash}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('ledger')}
            className="w-full text-center py-2 bg-dark-700 hover:bg-dark-600 text-xs text-slate-300 font-medium rounded-lg transition"
          >
            Explore Complete Ledger Stream →
          </button>
        </div>
      </div>
    </div>
  );
};
