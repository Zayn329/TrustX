import React, { useState } from 'react';
import { MainHeader } from './components/common/MainHeader';
import { NavigationTabs } from './components/common/NavigationTabs';

import { DashboardView } from './components/views/DashboardView';
import { MarketplaceView } from './components/views/MarketplaceView';
import { SubmissionProofView } from './components/views/SubmissionProofView';
import { VerificationTimelineView } from './components/views/VerificationTimelineView';
import { EscrowVisualizerView } from './components/views/EscrowVisualizerView';
import { IdentityProfileView } from './components/views/IdentityProfileView';
import { TrustGraphView } from './components/views/TrustGraphView';
import { ContributionExplorerView } from './components/views/ContributionExplorerView';
import { DisputeResolutionView } from './components/views/DisputeResolutionView';
import { BlockchainLedgerView } from './components/views/BlockchainLedgerView';
import { SybilRiskView } from './components/views/SybilRiskView';

import { useTrustStore } from './store/useTrustStore';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { simulateFullDemoFlow } = useTrustStore();

  const handleRunDemoFlow = () => {
    simulateFullDemoFlow();
    setActiveTab('verification');
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'marketplace':
        return <MarketplaceView setActiveTab={setActiveTab} />;
      case 'submit':
        return <SubmissionProofView setActiveTab={setActiveTab} />;
      case 'verification':
        return <VerificationTimelineView setActiveTab={setActiveTab} />;
      case 'escrow':
        return <EscrowVisualizerView setActiveTab={setActiveTab} />;
      case 'identity':
        return <IdentityProfileView setActiveTab={setActiveTab} />;
      case 'graph':
        return <TrustGraphView setActiveTab={setActiveTab} />;
      case 'explorer':
        return <ContributionExplorerView setActiveTab={setActiveTab} />;
      case 'dispute':
        return <DisputeResolutionView setActiveTab={setActiveTab} />;
      case 'ledger':
        return <BlockchainLedgerView setActiveTab={setActiveTab} />;
      case 'risk':
        return <SybilRiskView setActiveTab={setActiveTab} />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col font-sans">
      <MainHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunDemoFlow={handleRunDemoFlow}
      />

      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveView()}
      </main>

      <footer className="bg-dark-800 border-t border-dark-600 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Trust Engine — Blockchain-Powered Open-Source Trust Engine MVP</p>
          <p className="font-mono text-[10px] text-trust-500">[Simulated Web3 Environment — Production Deterministic Engine]</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
