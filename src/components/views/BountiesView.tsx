import React, { useState } from 'react';
import { Target, Search } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';
import { BountyCard } from '../bounties/BountyCard';
import { BountyDetailModal } from '../bounties/BountyDetailModal';
import { Bounty } from '../../domain/types';

export const BountiesView: React.FC = () => {
  const { bounties } = useTrust();
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

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
        </div>
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <p className="text-sm">No bounties matching search criteria found.</p>
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
