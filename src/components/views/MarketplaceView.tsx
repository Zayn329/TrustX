import React, { useState } from 'react';
import { useTrustStore } from '../../store/useTrustStore';
import { Bounty } from '../../types';
import { Lock, CheckCircle, Building2 } from 'lucide-react';

export const MarketplaceView: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { state, setSelectedBountyId } = useTrustStore();
  const { bounties } = state;

  const [selectedBounty, setSelectedBounty] = useState<Bounty>(bounties[0]);

  const handleSelectBounty = (bounty: Bounty) => {
    setSelectedBounty(bounty);
    setSelectedBountyId(bounty.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Bug Bounty Marketplace</h1>
          <p className="text-xs text-slate-400 mt-1">
            Active bounties with smart-contract backed escrow guarantees & verifiable payout criteria.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-dark-800 border border-dark-600 px-3 py-1.5 rounded-lg text-xs">
          <Lock className="w-4 h-4 text-trust-500" />
          <span className="text-slate-300 font-semibold">
            Total TVL Escrow Locked: ${bounties.reduce((s, b) => s + b.totalEscrowLocked, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Grid: Bounty List + Selected Bounty Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Bounty Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Organization Bounties</h2>

          {bounties.map((bounty) => {
            const isSelected = selectedBounty.id === bounty.id;
            return (
              <div
                key={bounty.id}
                onClick={() => handleSelectBounty(bounty)}
                className={`p-5 rounded-2xl border transition cursor-pointer relative ${
                  isSelected
                    ? 'bg-dark-800 border-trust-500 shadow-lg shadow-trust-500/10'
                    : 'bg-dark-800/60 border-dark-600 hover:border-dark-500'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={bounty.orgAvatar}
                      alt={bounty.orgName}
                      className="w-10 h-10 rounded-xl object-cover border border-dark-600"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-semibold text-slate-300">{bounty.orgName}</span>
                        <CheckCircle className="w-3.5 h-3.5 text-trust-500" />
                      </div>
                      <h3 className="text-sm font-bold text-white mt-0.5 line-clamp-1">{bounty.title}</h3>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-dark-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Max Critical Bounty: </span>
                    <span className="font-bold text-emerald-400">${bounty.severityRewards.critical.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded font-mono text-[10px]">
                    <Lock className="w-3 h-3" />
                    <span>Escrow Guaranteed</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: Selected Bounty Detail + Escrow Flow Peek (7 cols) */}
        <div className="lg:col-span-7 bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-dark-700 pb-4">
            <div className="flex items-center space-x-3">
              <img
                src={selectedBounty.orgAvatar}
                alt={selectedBounty.orgName}
                className="w-12 h-12 rounded-xl object-cover border border-dark-600"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-trust-500" />
                  <span className="text-sm font-semibold text-slate-300">{selectedBounty.orgName}</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-0.5">{selectedBounty.title}</h2>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('submit')}
              className="bg-trust-600 hover:bg-trust-500 text-dark-900 font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              Submit Bug →
            </button>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Bounty Overview</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{selectedBounty.description}</p>
          </div>

          {/* Severity Payout Tiers Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-3">Escrow Reward Tiers</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-dark-700/60 border border-red-500/30 p-3 rounded-xl text-center">
                <span className="text-[10px] font-bold text-red-400 uppercase">Critical</span>
                <p className="text-sm font-black text-white mt-1">${selectedBounty.severityRewards.critical.toLocaleString()}</p>
              </div>
              <div className="bg-dark-700/60 border border-orange-500/30 p-3 rounded-xl text-center">
                <span className="text-[10px] font-bold text-orange-400 uppercase">High</span>
                <p className="text-sm font-black text-white mt-1">${selectedBounty.severityRewards.high.toLocaleString()}</p>
              </div>
              <div className="bg-dark-700/60 border border-amber-500/30 p-3 rounded-xl text-center">
                <span className="text-[10px] font-bold text-amber-400 uppercase">Medium</span>
                <p className="text-sm font-black text-white mt-1">${selectedBounty.severityRewards.medium.toLocaleString()}</p>
              </div>
              <div className="bg-dark-700/60 border border-sky-500/30 p-3 rounded-xl text-center">
                <span className="text-[10px] font-bold text-sky-400 uppercase">Low</span>
                <p className="text-sm font-black text-white mt-1">${selectedBounty.severityRewards.low.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Smart Contract Escrow Visualization Box */}
          <div className="bg-dark-900/80 border border-trust-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-trust-500" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Smart Contract Escrow Guarantee
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                DEPOSITED & LOCKED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center">
              <div className="p-3 bg-dark-800 rounded-xl border border-dark-600">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Company Wallet</p>
                <p className="text-xs font-mono text-slate-200 mt-1 truncate">{selectedBounty.orgDid.slice(0, 10)}...</p>
              </div>

              <div className="flex flex-col items-center justify-center py-2">
                <span className="text-xs font-bold text-trust-400 mb-1">${selectedBounty.totalEscrowLocked.toLocaleString()}</span>
                <div className="w-full h-0.5 bg-gradient-to-r from-trust-600 via-emerald-400 to-trust-600 relative">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <span className="text-[9px] text-slate-500 mt-1">Conditional Lock</span>
              </div>

              <div className="p-3 bg-dark-800 rounded-xl border border-dark-600">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Escrow Contract</p>
                <p className="text-xs font-mono text-trust-400 mt-1 truncate">{selectedBounty.escrowContractAddress.slice(0, 10)}...</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('escrow')}
              className="w-full text-center text-xs text-trust-500 hover:text-trust-400 font-medium pt-1"
            >
              Open Interactive Escrow Flow Visualizer →
            </button>
          </div>

          {/* Scope list */}
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Audited Scope Target Repositories</h3>
            <div className="space-y-2">
              {selectedBounty.scope.map((item, idx) => (
                <div key={idx} className="bg-dark-700/50 border border-dark-600 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono text-slate-300">
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
