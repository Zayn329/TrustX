import React, { useState, useEffect } from 'react';
import { Target, Search, RotateCcw, ArrowLeft, X } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';
import { BountyCard } from '../bounties/BountyCard';
import { BountyDetailModal } from '../bounties/BountyDetailModal';
import { Bounty } from '../../domain/types';

export const BountiesView: React.FC = () => {
  const { bounties } = useTrust();
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { window.location.hash = '#dashboard'; }}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Back to Dashboard Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Target className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-slate-100">Bug Bounty Marketplace</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse active security bounties backed by programmatic smart contract escrows.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search bounties..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs flex items-center gap-1 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Count Summary & Filter Pills (Issue 13) */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3 gap-2">
        <div className="font-semibold text-slate-300">
          Showing <span className="text-indigo-400 font-bold">{filteredBounties.length}</span> of {bounties.length} active bounties
        </div>

        {(searchTerm !== '' || selectedSeverity !== 'all') && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Active Filters:</span>
            {searchTerm && (
              <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 font-mono flex items-center gap-1">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')}><X className="w-3 h-3 hover:text-white" /></button>
              </span>
            )}
            {selectedSeverity !== 'all' && (
              <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20 font-mono flex items-center gap-1 capitalize">
                Severity: {selectedSeverity}
                <button onClick={() => setSelectedSeverity('all')}><X className="w-3 h-3 hover:text-white" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBounties.map(bounty => (
          <BountyCard
            key={bounty.id}
            bounty={bounty}
            onSelect={b => setSelectedBounty(b)}
          />
        ))}
      </div>

      {filteredBounties.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-3">
          <p className="text-sm">No bounties matching search criteria found.</p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
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
