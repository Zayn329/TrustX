import React from 'react';
import { ShieldCheck, DollarSign, ExternalLink } from 'lucide-react';
import { Bounty } from '../../domain/types';

interface BountyCardProps {
  bounty: Bounty;
  onSelect: (bounty: Bounty) => void;
}

export const BountyCard: React.FC<BountyCardProps> = ({ bounty, onSelect }) => {
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Medium':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">{bounty.organizationName}</span>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/20">
              Trust Score: {bounty.organizationTrustScore}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getSeverityStyle(bounty.severity)}`}>
            {bounty.severity}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-100 leading-snug line-clamp-2">
          {bounty.title}
        </h3>

        <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
          {bounty.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {bounty.scope.map((item, idx) => (
            <span key={idx} className="bg-slate-950 text-slate-400 text-[10px] font-mono px-2 py-1 rounded border border-slate-800">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Bounty Escrow Reward</div>
          <div className="text-lg font-black text-emerald-400 flex items-center gap-1 mt-0.5">
            <DollarSign className="w-4 h-4" />
            <span>{bounty.rewardAmount.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-medium">{bounty.rewardCurrency}</span>
          </div>
        </div>

        <button
          onClick={() => onSelect(bounty)}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
        >
          <span>View Details</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
