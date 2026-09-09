import React from 'react';
import {
  LayoutDashboard,
  Target,
  UserCheck,
  Search,
  Network,
  Activity
} from 'lucide-react';

export type ViewTab = 'dashboard' | 'bounties' | 'passport' | 'explorer' | 'graph' | 'network';

interface NavbarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'bounties', label: 'Bounty Marketplace', icon: <Target className="w-4 h-4" /> },
    { id: 'passport', label: 'Trust Passport', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'explorer', label: 'Contribution Explorer', icon: <Search className="w-4 h-4" /> },
    { id: 'graph', label: 'Trust Graph', icon: <Network className="w-4 h-4" /> },
    { id: 'network', label: 'Network & Ledger', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto scrollbar-none py-2">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
