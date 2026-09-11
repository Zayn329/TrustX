import React from 'react';
import { Activity } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';
import { LedgerExplorer, DisputePanel, RiskAnalysis } from '../network/NetworkComponents';
import { ArbitrationCourtView } from '../network/ArbitrationCourtView';

export const NetworkView: React.FC = () => {
  const { blockchainEvents, disputes, sybilRisks } = useTrust();

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#D7FF3F]" />
          <h1 className="tx-page-title">Protocol Observability</h1>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Developer-facing infrastructure view for the demo ledger, arbitration state, escrow locks, and risk signals.
        </p>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-zinc-500"><span className="h-1.5 w-1.5 rounded-full bg-[#D7FF3F]" /> DEMO PROTOCOL data / external network state is only shown when connected</div><LedgerExplorer events={blockchainEvents} />

      {/* Phase 8: Arbitration Court View */}
      <ArbitrationCourtView />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DisputePanel disputes={disputes} />
        <RiskAnalysis risks={sybilRisks} />
      </div>
    </div>
  );
};
