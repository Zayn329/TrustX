import React, { useState, useEffect } from 'react';
import { Search, X, Target, FileText, User, Network, Shield } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';
import { ViewTab } from '../layout/Navbar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ViewTab) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const { bounties, reports } = useTrust();
  const [query, setQuery] = useState('');

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredBounties = bounties.filter(b =>
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.organizationName.toLowerCase().includes(query.toLowerCase())
  );

  const filteredReports = reports.filter(r =>
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.id.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (tab: ViewTab) => {
    onNavigate(tab);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/50">
          <Search className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search bounties, reports, proof hashes, or press ESC..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results / Navigation Hub */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-3">
          {/* Quick Nav Shortcuts */}
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-slate-500 px-3 py-1">
              Quick Views
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-1">
              <button
                onClick={() => handleSelect('bounties')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800 text-left"
              >
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Bounties</span>
              </button>
              <button
                onClick={() => handleSelect('explorer')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800 text-left"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Audit Explorer</span>
              </button>
              <button
                onClick={() => handleSelect('passport')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800 text-left"
              >
                <User className="w-4 h-4 text-amber-400" />
                <span>Passport</span>
              </button>
              <button
                onClick={() => handleSelect('graph')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800 text-left"
              >
                <Network className="w-4 h-4 text-purple-400" />
                <span>Trust Graph</span>
              </button>
              <button
                onClick={() => handleSelect('network')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800 text-left"
              >
                <Shield className="w-4 h-4 text-sky-400" />
                <span>Ledger Monitor</span>
              </button>
            </div>
          </div>

          {/* Bounties Results */}
          {filteredBounties.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-slate-500 px-3 py-1">
                Bounties
              </div>
              <div className="space-y-1">
                {filteredBounties.map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleSelect('bounties')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between text-xs text-slate-200"
                  >
                    <div>
                      <div className="font-semibold">{b.title}</div>
                      <div className="text-[10px] text-slate-500">{b.organizationName}</div>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">${b.rewardAmount}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contribution Reports Results */}
          {filteredReports.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-slate-500 px-3 py-1">
                Verified Reports
              </div>
              <div className="space-y-1">
                {filteredReports.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect('explorer')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between text-xs text-slate-200"
                  >
                    <div>
                      <div className="font-semibold">{r.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{r.id}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {r.severity}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between px-4">
          <span>Navigate with mouse or quick jump buttons</span>
          <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">ESC to close</span>
        </div>
      </div>
    </div>
  );
};
