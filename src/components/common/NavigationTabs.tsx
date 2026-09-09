import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  FileCheck2,
  GitFork,
  Coins,
  UserCheck,
  Network,
  Search,
  Scale,
  Blocks,
  ShieldCheck,
} from 'lucide-react';

export const tabs = [
  { id: 'dashboard', label: 'Trust Dashboard', icon: LayoutDashboard },
  { id: 'marketplace', label: 'Bounty Marketplace', icon: ShieldAlert },
  { id: 'submit', label: 'Submit & Proof', icon: FileCheck2 },
  { id: 'verification', label: 'Verification Timeline', icon: GitFork },
  { id: 'escrow', label: 'Escrow Visualizer', icon: Coins },
  { id: 'identity', label: 'Identity & Portable Reputation', icon: UserCheck },
  { id: 'graph', label: 'Trust Score & Graph', icon: Network },
  { id: 'explorer', label: 'Contribution Explorer', icon: Search },
  { id: 'dispute', label: 'Dispute Resolution', icon: Scale },
  { id: 'ledger', label: 'Blockchain Activity', icon: Blocks },
  { id: 'risk', label: 'Sybil & Fraud Risk', icon: ShieldCheck },
];

export const NavigationTabs: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-dark-800 border-b border-dark-600 overflow-x-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-trust-600/20 text-trust-500 border border-trust-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-trust-500' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
