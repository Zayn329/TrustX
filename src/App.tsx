import { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Home, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { TrustProvider } from './store/TrustContext';
import { Header } from './components/layout/Header';
import { Navbar, ViewTab } from './components/layout/Navbar';
import { RoleDashboard } from './components/views/RoleDashboard';
import { BountiesView } from './components/views/BountiesView';
import { ReportsView } from './components/views/ReportsView';
import { PassportView } from './components/views/PassportView';
import { CommandPalette } from './components/ui/CommandPalette';
import { ScrollToTop } from './components/ui/ScrollToTop';
import { ToastContainer } from './components/ui/ToastContainer';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { OnboardingTour } from './components/ui/OnboardingTour';

// Tabs each server-verified role may open. Hash edits outside this list fall back to the overview.
const PERMITTED_TABS: Record<'company' | 'researcher', ViewTab[]> = {
  company: ['dashboard', 'bounties', 'reports', 'settings'],
  researcher: ['dashboard', 'bounties', 'reports', 'passport', 'settings'],
};

function Workspace() {
  const { role, loading, user } = useAuth();
  const allowed = useMemo<ViewTab[]>(() => (role ? PERMITTED_TABS[role] : []), [role]);
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Pick the starting tab from the URL hash once the role is known
  useEffect(() => {
    if (!role) return;
    const hash = window.location.hash.replace('#', '') as ViewTab;
    setActiveTab(allowed.includes(hash) ? hash : 'dashboard');
  }, [role, allowed]);

  // Sync state with URL hash, document title and browser back/forward
  useEffect(() => {
    if (!role) return;
    window.location.hash = activeTab;
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ViewTab;
      setActiveTab(allowed.includes(hash) ? hash : 'dashboard');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [activeTab, allowed, role]);

  const navigate = (tab: ViewTab) => {
    // Command palette still offers audit-trail links; route them to the role-safe equivalent.
    const target: ViewTab = allowed.includes(tab) ? tab : tab === 'explorer' ? 'reports' : activeTab;
    setActiveTab(target);
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#060a13] text-slate-300">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-300" />
          Checking secure session…
        </div>
      </div>
    );
  }
  if (!user || !role) return <AuthPage />;

  const company = role === 'company';
  const viewLabels: Record<ViewTab, string> = {
    dashboard: 'Overview',
    bounties: company ? 'Programs' : 'Discover programs',
    reports: company ? 'Submissions' : 'My submissions',
    passport: 'Trust Passport & W3C Credentials',
    settings: company ? 'Company settings' : 'Researcher settings',
    explorer: 'Contribution Audit Explorer',
    graph: 'Interactive Trust Graph',
    network: 'Network & Protocol Monitor',
  };
  const titles: Partial<Record<ViewTab, string>> = {
    dashboard: 'Overview', bounties: 'Programs', reports: 'Submissions', passport: 'Trust Passport', settings: 'Settings',
  };
  document.title = `${titles[activeTab] ?? 'TrustX'} | TrustX`;

  const renderActiveView = () => {
    switch (activeTab) {
      case 'bounties':
        return <BountiesView />;
      case 'reports':
        return <ReportsView />;
      case 'passport':
        return <PassportView />;
      case 'settings':
        return (
          <section className="tx-surface max-w-2xl p-7">
            <p className="tx-kicker">Account settings</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">{viewLabels.settings}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Profile and access are managed by your TrustX administrator. Your workspace role is verified from your authenticated server token.
            </p>
          </section>
        );
      default:
        return <RoleDashboard onNavigate={navigate} />;
    }
  };

  return (
    <TrustProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-[#060a13] text-slate-100 flex flex-col font-sans">
          <Header onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} onNavigate={navigate} />

          <div className="flex flex-1 w-full relative">
            {/* Sidebar Workspace Navigation */}
            <Navbar
              activeTab={activeTab}
              setActiveTab={navigate}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
            />

            {/* Main Content Workspace Container */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Breadcrumb Navigation Trail Bar */}
              <div className="bg-slate-950/45 border-b border-slate-800/60 px-4 sm:px-6 lg:px-10 py-3 flex items-center gap-2 text-[11px] text-slate-500">
                <button
                  onClick={() => navigate('dashboard')}
                  className="hover:text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Home className="w-3.5 h-3.5 text-blue-300" />
                  <span className="font-medium text-slate-400">TrustX</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-slate-200 font-medium">{viewLabels[activeTab]}</span>
              </div>

              <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
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
            onNavigate={navigate}
          />
        </div>
      </ErrorBoundary>
    </TrustProvider>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Workspace />
    </AuthProvider>
  );
}

export default App;
