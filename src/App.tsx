import { useState } from 'react';
import { TrustProvider } from './store/TrustContext';
import { Header } from './components/layout/Header';
import { Navbar, ViewTab } from './components/layout/Navbar';
import { DashboardView } from './components/views/DashboardView';
import { BountiesView } from './components/views/BountiesView';
import { PassportView } from './components/views/PassportView';
import { ExplorerView } from './components/views/ExplorerView';
import { GraphView } from './components/views/GraphView';
import { NetworkView } from './components/views/NetworkView';

export function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'bounties':
        return <BountiesView />;
      case 'passport':
        return <PassportView />;
      case 'explorer':
        return <ExplorerView />;
      case 'graph':
        return <GraphView />;
      case 'network':
        return <NetworkView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <TrustProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        <Header />
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderActiveView()}
        </main>
      </div>
    </TrustProvider>
  );
}

export default App;
