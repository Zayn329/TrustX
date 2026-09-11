import React, { useState, useEffect } from 'react';
import { Target, Search, RotateCcw, ArrowLeft, X, LayoutGrid, List } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';
import { BountyCard } from '../bounties/BountyCard';
import { BountyDetailModal } from '../bounties/BountyDetailModal';
import { Bounty } from '../../domain/types';

export const BountiesView: React.FC = () => {
  const { bounties } = useTrust();
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Category A Item 7: Filter State Memory with sessionStorage
  const [searchTerm, setSearchTerm] = useState(() => sessionStorage.getItem('bounty_search') || '');
  const [selectedSeverity, setSelectedSeverity] = useState(() => sessionStorage.getItem('bounty_severity') || 'all');

  useEffect(() => {
    sessionStorage.setItem('bounty_search', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    sessionStorage.setItem('bounty_severity', selectedSeverity);
  }, [selectedSeverity]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSeverity('all');
    sessionStorage.removeItem('bounty_search');
    sessionStorage.removeItem('bounty_severity');
  };

  const filteredBounties = bounties.filter(bounty => {
    const matchesSearch =
      bounty.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bounty.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bounty.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      selectedSeverity === 'all' || bounty.severity.toLowerCase() === selectedSeverity.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { window.location.hash = '#dashboard'; }}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/50 text-slate-400 hover:text-white transition-colors"
              title="Back to Dashboard Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Target className="w-5 h-5 text-[#D7FF3F]" />
            <h1 className="tx-page-title">Technical Opportunity Index</h1>
            <span className="sr-only">Bug Bounty Marketplace</span>
          </div>
          <p className="text-sm text-zinc-400 mt-3 max-w-xl leading-6">
            Find security work with clear scope, funded rewards, and a traceable path from report to verification.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.08] bg-[#111111] p-2">
          {/* Card / Table View Toggle (Category F Item 57) */}
          <div className="flex items-center gap-1 border-r border-slate-700/40 pr-2">
            <button
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
              className={`p-1.5 rounded transition-all ${
                viewMode === 'grid' ? 'bg-[#D7FF3F] text-[#050505]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Compact Table View"
              className={`p-1.5 rounded transition-all ${
                viewMode === 'table' ? 'bg-[#D7FF3F] text-[#050505]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search bounties..."
              className="w-full bg-[#050505] border border-white/[0.08] rounded-md pl-9 pr-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-[#D7FF3F]/60"
            />
          </div>

          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="bg-[#050505] border border-white/[0.08] rounded-md px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-[#D7FF3F]/60"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {(searchTerm !== '' || selectedSeverity !== 'all') && (
            <button
              onClick={resetFilters}
              title="Reset Filters"
              className="p-2.5 bg-[#161616] hover:bg-white/[0.07] text-zinc-300 rounded-md border border-white/[0.08] text-xs flex items-center gap-1 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Count Summary & Filter Pills */}
      <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 border-y border-white/[0.07] py-4 gap-2">
        <div className="font-semibold text-zinc-300">
          Showing <span className="text-[#D7FF3F] font-bold">{filteredBounties.length}</span> of {bounties.length} active opportunities
        </div>

        {(searchTerm !== '' || selectedSeverity !== 'all') && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Active Filters:</span>
            {searchTerm && (
                <span className="bg-[#D7FF3F]/10 text-[#D7FF3F] px-2 py-0.5 rounded-full border border-[#D7FF3F]/20 font-mono flex items-center gap-1">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')}><X className="w-3 h-3 hover:text-white" /></button>
              </span>
            )}
            {selectedSeverity !== 'all' && (
                <span className="bg-amber-300/10 text-amber-200 px-2 py-0.5 rounded-full border border-amber-300/20 font-mono flex items-center gap-1 capitalize">
                Severity: {selectedSeverity}
                <button onClick={() => setSelectedSeverity('all')}><X className="w-3 h-3 hover:text-white" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grid or Compact Table Mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBounties.map(bounty => (
            <BountyCard
              key={bounty.id}
              bounty={bounty}
              onSelect={b => setSelectedBounty(b)}
            />
          ))}
        </div>
      ) : (
        <div className="tx-surface rounded-lg p-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-500 font-medium uppercase tracking-[0.14em] text-[10px]">
                <th className="py-3 px-4">Target Title</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Escrow Reward</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredBounties.map(b => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-semibold text-slate-100">{b.title}</td>
                  <td className="py-3 px-4 text-slate-400">{b.organizationName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {b.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-400 font-mono">${b.rewardAmount.toLocaleString()} USDC</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedBounty(b)}
                    className="px-3 py-1.5 bg-[#D7FF3F] hover:bg-[#B8E638] text-[#050505] font-semibold text-xs rounded-md transition-all"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredBounties.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-3">
          <p className="text-sm">No bounties matching search criteria found.</p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Search & Filters</span>
          </button>
        </div>
      )}

      {selectedBounty && (
        <BountyDetailModal
          bounty={selectedBounty}
          onClose={() => setSelectedBounty(null)}
        />
      )}
    </div>
  );
};
