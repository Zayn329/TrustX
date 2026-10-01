import React from 'react';
import {
  LayoutDashboard,
  Target,
  UserCheck,
  Search,
  Network,
  Activity,
  ChevronLeft,
  ChevronRight,
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
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed = false,
  setIsCollapsed,
  mobileOpen = false,
  setMobileOpen
}) => {
  const { bounties, blockchainEvents, reports } = useTrust();

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
    setMobileOpen?.(false);
  };

  return (
    <>
      {/* Desktop Sidebar Container */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0B0B0B]/92 border-r border-white/[0.07] transition-all duration-300 sticky top-16 h-[calc(100vh-4rem)] z-30 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Navigation Section */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 py-3 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-600">
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#D7FF3F]/10 text-[#D7FF3F] border border-[#D7FF3F]/20'
                    : 'text-zinc-500 hover:text-zinc-100 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`${isActive ? 'text-[#D7FF3F]' : 'text-zinc-600 group-hover:text-zinc-200'}`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <div className="text-left truncate">
                      <div className="font-semibold leading-tight truncate">{item.label}</div>
                      <div className="text-[10px] text-zinc-600 group-hover:text-zinc-500 truncate">{item.description}</div>
                    </div>
                  )}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isActive
                        ? 'bg-[#D7FF3F]/15 text-[#D7FF3F] border-[#D7FF3F]/25'
                        : 'bg-[#111111] text-zinc-500 border-white/[0.08]'
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
        <div className="p-3 border-t border-white/[0.07] bg-[#050505]/40">
          <button
            onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] rounded-md transition-all"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-[#D7FF3F]" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-[#D7FF3F]" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex">
          <div className="bg-[#0B0B0B] border-r border-white/[0.08] w-72 max-w-[82%] h-full p-4 flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D7FF3F]" />
                <span className="font-bold text-zinc-100 text-sm">TrustX Workspace</span>
              </div>
              <button
                onClick={() => setMobileOpen?.(false)}
                className="text-zinc-500 hover:text-white p-1"
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#D7FF3F]/10 text-[#D7FF3F] border border-[#D7FF3F]/25'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="bg-[#111111] text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/[0.08]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileOpen?.(false)} />
        </div>
      )}
    </>
  );
};
