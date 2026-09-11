import { useState, useEffect } from 'react';
import { TrustProvider } from './store/TrustContext';
import { Header } from './components/layout/Header';
import { Navbar, ViewTab } from './components/layout/Navbar';
import { DashboardView } from './components/views/DashboardView';
import { BountiesView } from './components/views/BountiesView';
import { PassportView } from './components/views/PassportView';
import { ExplorerView } from './components/views/ExplorerView';
import { GraphView } from './components/views/GraphView';
import { NetworkView } from './components/views/NetworkView';
import { CommandPalette } from './components/ui/CommandPalette';
import { ScrollToTop } from './components/ui/ScrollToTop';
import { ToastContainer } from './components/ui/ToastContainer';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { OnboardingTour } from './components/ui/OnboardingTour';
import { ChevronRight, Home, Menu } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>(() => {
    const hash = window.location.hash.replace('#', '') as ViewTab;
    const validTabs: ViewTab[] = ['dashboard', 'bounties', 'passport', 'explorer', 'graph', 'network'];
    return validTabs.includes(hash) ? hash : 'dashboard';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Sync state with URL hash and page document title
  useEffect(() => {
    window.location.hash = activeTab;

    const titles: Record<ViewTab, string> = {
      dashboard: 'Dashboard Overview | Trust Engine',
      bounties: 'Bounty Marketplace | Trust Engine',
      passport: 'Trust Passport & Reputation | Trust Engine',
      explorer: 'Contribution Audit Explorer | Trust Engine',
      graph: 'Interactive Trust Graph | Trust Engine',
      network: 'Network & Ledger Monitor | Trust Engine'
    };
    document.title = titles[activeTab] || 'Trust Engine Protocol';
  }, [activeTab]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ViewTab;
      const validTabs: ViewTab[] = ['dashboard', 'bounties', 'passport', 'explorer', 'graph', 'network'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const viewLabels: Record<ViewTab, string> = {
    dashboard: 'Dashboard Overview',
    bounties: 'Bounty Marketplace',
    passport: 'Trust Passport & W3C Credentials',
    explorer: 'Contribution Audit Explorer',
    graph: 'Interactive Trust Graph',
    network: 'Network & Protocol Monitor'
  };

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
      <ErrorBoundary>
        <div className="min-h-screen bg-[#050505] text-[#F5F5F2] flex flex-col font-sans">
          <Header
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenMobileNav={() => setIsMobileNavOpen(true)}
          />

          <div className="flex flex-1 w-full relative">
            {/* Sidebar Workspace Navigation */}
            <Navbar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
              mobileOpen={isMobileNavOpen}
              setMobileOpen={setIsMobileNavOpen}
            />

            {/* Main Content Workspace Container */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Breadcrumb Navigation Trail Bar */}
              <div className="border-b border-white/[0.07] bg-[#0B0B0B]/85 px-4 sm:px-6 lg:px-10 py-3 flex items-center gap-2 text-[11px] text-zinc-500 backdrop-blur-xl">
                <button
                  onClick={() => setIsMobileNavOpen(true)}
                  className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] text-zinc-400 hover:text-[#D7FF3F] lg:hidden"
                  aria-label="Open workspace navigation"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="hover:text-[#F5F5F2] flex items-center gap-1.5 transition-colors"
                >
                  <Home className="w-3.5 h-3.5 text-[#D7FF3F]" />
                  <span className="font-medium text-zinc-400">TrustX</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
                <span className="text-zinc-200 font-medium">{viewLabels[activeTab]}</span>
              </div>

              <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-7 sm:py-10">
                {renderActiveView()}
              </main>
            </div>
          </div>

          {/* Floating Utilities, Tour & Toasts */}
          <OnboardingTour />
          <ToastContainer />
          <ScrollToTop />
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        </div>
      </ErrorBoundary>
    </TrustProvider>
  );
}

export default App;
