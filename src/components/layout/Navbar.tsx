import React, { useState } from 'react';
import {
  LayoutDashboard,
  Target,
  UserCheck,
  Search,
  Network,
  Activity,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { useTrust } from '../../store/TrustContext';

export type ViewTab = 'dashboard' | 'bounties' | 'passport' | 'explorer' | 'graph' | 'network';

interface NavbarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed = false,
  setIsCollapsed
}) => {
  const { bounties, blockchainEvents, reports } = useTrust();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: {
    id: ViewTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    description: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
      description: 'Overview & metrics'
    },
    {
      id: 'bounties',
      label: 'Bounty Marketplace',
      icon: <Target className="w-5 h-5 flex-shrink-0" />,
      badge: bounties.length,
      description: 'Active Escrow Bounties'
    },
    {
      id: 'passport',
      label: 'Trust Passport',
      icon: <UserCheck className="w-5 h-5 flex-shrink-0" />,
      description: 'W3C VCs & Reputation'
    },
    {
      id: 'explorer',
      label: 'Contribution Explorer',
      icon: <Search className="w-5 h-5 flex-shrink-0" />,
      badge: reports.length,
      description: 'SHA-256 Audit Trail'
    },
    {
      id: 'graph',
      label: 'Trust Graph',
      icon: <Network className="w-5 h-5 flex-shrink-0" />,
      description: 'Interactive Proof Net'
    },
    {
      id: 'network',
      label: 'Network & Ledger',
      icon: <Activity className="w-5 h-5 flex-shrink-0" />,
      badge: blockchainEvents.length,
      description: 'Live Event Logs & Jury'
    },
  ];

  const handleTabClick = (id: ViewTab) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navigation Bar Toggle */}
      <div className="lg:hidden bg-[#080d18] border-b border-slate-700/40 px-4 py-3 flex items-center justify-between sticky top-[4.5rem] z-30">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Menu"
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white bg-slate-800/80 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700/60"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Workspace Menu</span>
        </button>
        <div className="text-[11px] font-semibold text-blue-300 capitalize">
          {navItems.find(i => i.id === activeTab)?.label}
        </div>
      </div>

      {/* Desktop Sidebar Container */}
      <aside
        className={`hidden lg:flex flex-col bg-[#080d18]/92 border-r border-slate-700/40 transition-all duration-300 sticky top-[4.5rem] h-[calc(100vh-4.5rem)] z-30 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Navigation Section */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 py-3 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-slate-600">
              Workspace
            </div>
          )}

          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-400/10 text-blue-200 border border-blue-300/20 shadow-[0_8px_24px_rgba(50,120,220,0.12)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/55 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`${isActive ? 'text-blue-300' : 'text-slate-500 group-hover:text-slate-200'}`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <div className="text-left truncate">
                      <div className="font-semibold leading-tight truncate">{item.label}</div>
                      <div className="text-[10px] text-slate-500 group-hover:text-slate-400 truncate">{item.description}</div>
                    </div>
                  )}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isActive
                        ? 'bg-blue-400/15 text-blue-200 border-blue-300/25'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/70'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Collapse Toggle */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-all"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-indigo-400" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-indigo-400" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex">
          <div className="bg-slate-900 border-r border-slate-800 w-72 max-w-[80%] h-full p-4 flex flex-col space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-slate-100 text-sm">Trust Engine Navigation</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-1.5 overflow-y-auto">
              {navItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
};
