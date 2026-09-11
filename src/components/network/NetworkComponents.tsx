import React, { useState } from 'react';
import { Activity, ShieldAlert, AlertTriangle, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlockchainEvent, Dispute, SybilRiskSignal } from '../../domain/types';

export const LedgerExplorer: React.FC<{ events: BlockchainEvent[] }> = ({ events }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredEvents = events.filter(evt =>
    evt.eventType.toLowerCase().includes(search.toLowerCase()) ||
    evt.txHash.toLowerCase().includes(search.toLowerCase()) ||
    evt.actor.toLowerCase().includes(search.toLowerCase()) ||
    evt.details.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize);

  const handleExportCSV = () => {
    const headers = 'ID,Event Type,Tx Hash,Block Number,Actor,Details\n';
    const rows = filteredEvents
      .map(e => `"${e.id}","${e.eventType}","${e.txHash}",${e.blockNumber},"${e.actor}","${e.details}"`)
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trust_engine_ledger_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tx-surface rounded-xl p-6 space-y-4 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#D7FF3F]" />
          <div><div className="tx-kicker text-[#D7FF3F]/70">Protocol ledger</div><h3 className="mt-1 text-xl font-semibold text-white">Local ledger events</h3></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search ledger..."
              className="w-full bg-[#050505] border border-white/[0.08] rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-[#D7FF3F]"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#161616] hover:bg-white/[0.07] text-zinc-200 font-semibold text-xs rounded-md border border-white/[0.08] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider">
              <th className="py-2.5 px-3">Event Type</th>
              <th className="py-2.5 px-3">Tx Hash</th>
              <th className="py-2.5 px-3">Block #</th>
              <th className="py-2.5 px-3">Actor / Address</th>
              <th className="py-2.5 px-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
            {paginatedEvents.map(evt => (
              <tr key={evt.id} className="hover:bg-white/[0.035] transition-colors">
                <td className="py-2.5 px-3 font-sans font-bold text-[#D7FF3F]">{evt.eventType}</td>
                <td className="py-2.5 px-3 text-zinc-400">{evt.txHash.slice(0, 14)}...</td>
                <td className="py-2.5 px-3 text-emerald-400">#{evt.blockNumber}</td>
                <td className="py-2.5 px-3 text-zinc-300">{evt.actor.slice(0, 16)}...</td>
                <td className="py-2.5 px-3 font-sans text-zinc-300">{evt.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 md:hidden">
        {paginatedEvents.map(evt => (
          <div key={evt.id} className="rounded-lg border border-white/[0.08] bg-[#050505] p-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-[#D7FF3F]">{evt.eventType}</span>
              <span className="font-mono text-emerald-400">#{evt.blockNumber}</span>
            </div>
            <div className="mt-2 font-mono text-[10px] text-zinc-500 break-all">{evt.txHash}</div>
            <div className="mt-2 text-zinc-300">{evt.details}</div>
          </div>
        ))}
      </div>

      {/* Pagination Footer (Issue 25) */}
      <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-white/[0.07] pt-3">
        <span>Showing Page {page} of {totalPages}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-1.5 rounded-md bg-[#050505] border border-white/[0.08] disabled:opacity-40 hover:bg-white/[0.06]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="p-1.5 rounded-md bg-[#050505] border border-white/[0.08] disabled:opacity-40 hover:bg-white/[0.06]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const DisputePanel: React.FC<{ disputes: Dispute[] }> = ({ disputes }) => {
  return (
    <div className="tx-surface rounded-xl p-6 space-y-4 sm:p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-300" />
          <div><div className="tx-kicker text-amber-200/70">Arbitration</div><h3 className="mt-1 text-xl font-semibold text-white">Dispute resolution</h3></div>
        </div>
        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-semibold">
          Escrow Lock Active
        </span>
      </div>

      <div className="space-y-3">
        {disputes.map(disp => (
          <div key={disp.id} className="bg-[#050505] p-4 rounded-lg border border-white/[0.08] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Dispute #{disp.id} (Submission: {disp.contributionId})</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                {disp.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">{disp.reason}</p>
            <div className="text-[10px] text-slate-500 font-mono">Disputed by: {disp.disputedBy} • Raised: {new Date(disp.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RiskAnalysis: React.FC<{ risks: SybilRiskSignal[] }> = ({ risks }) => {
  return (
    <div className="tx-surface rounded-xl p-6 space-y-4 sm:p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#D7FF3F]" />
          <div><div className="tx-kicker text-[#D7FF3F]/70">Integrity signals</div><h3 className="mt-1 text-xl font-semibold text-white">Sybil & fraud risk</h3></div>
        </div>
        <span className="text-[10px] font-mono text-[#D7FF3F] bg-[#D7FF3F]/10 px-2.5 py-0.5 rounded-full border border-[#D7FF3F]/20 font-semibold">
          Deterministic Risk Engine
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {risks.map(r => (
          <div key={r.id} className="bg-[#050505] p-4 rounded-lg border border-white/[0.08] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-slate-300">{r.researcherId.slice(0, 18)}...</span>
              <span className="font-bold text-emerald-400">Risk Score: {r.riskScore}/100</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">{r.recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
