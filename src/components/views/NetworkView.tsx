import React from 'react';
import { Activity } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';
import { LedgerExplorer, DisputePanel, RiskAnalysis } from '../network/NetworkComponents';

export const NetworkView: React.FC = () => {
  const { blockchainEvents, disputes, sybilRisks } = useTrust();

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-slate-100">Network & Protocol Monitor</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Inspect real-time simulated blockchain ledger events, dispute resolution escrow locks, and Sybil fraud detection signals.
        </p>
      </div>

      <LedgerExplorer events={blockchainEvents} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DisputePanel disputes={disputes} />
        <RiskAnalysis risks={sybilRisks} />
      </div>
    </div>
  );
};
