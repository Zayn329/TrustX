import React from 'react';
import { Activity, ShieldAlert, AlertTriangle } from 'lucide-react';
import { BlockchainEvent, Dispute, SybilRiskSignal } from '../../domain/types';

export const LedgerExplorer: React.FC<{ events: BlockchainEvent[] }> = ({ events }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-200">Simulated Blockchain Ledger Events</h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Live Protocol Stream
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
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
            {events.map(evt => (
              <tr key={evt.id} className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-sans font-bold text-indigo-400">{evt.eventType}</td>
                <td className="py-2.5 px-3 text-slate-400">{evt.txHash.slice(0, 14)}...</td>
                <td className="py-2.5 px-3 text-emerald-400">#{evt.blockNumber}</td>
                <td className="py-2.5 px-3 text-slate-300">{evt.actor.slice(0, 16)}...</td>
                <td className="py-2.5 px-3 font-sans text-slate-300">{evt.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const DisputePanel: React.FC<{ disputes: Dispute[] }> = ({ disputes }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-200">Dispute Resolution Panel</h3>
        </div>
        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Escrow Lock Active
        </span>
      </div>

      <div className="space-y-3">
        {disputes.map(disp => (
          <div key={disp.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Dispute #{disp.id} (Submission: {disp.contributionId})</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                {disp.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-300">{disp.reason}</p>
            <div className="text-[10px] text-slate-500 font-mono">Disputed by: {disp.disputedBy} • Raised: {new Date(disp.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RiskAnalysis: React.FC<{ risks: SybilRiskSignal[] }> = ({ risks }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-bold text-slate-200">Sybil & Fraud Risk Analysis</h3>
        </div>
        <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
          Deterministic Demo Risk Engine
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {risks.map(r => (
          <div key={r.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 text-xs space-y-2">
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
