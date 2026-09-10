import React, { useState } from 'react';
import { ShieldCheck, DollarSign, Send, Copy, Check } from 'lucide-react';
import { Bounty } from '../../domain/types';
import { SubmitVulnerabilityModal } from './SubmitVulnerabilityModal';

interface BountyCardProps {
  bounty: Bounty;
  onSelect: (bounty: Bounty) => void;
}

export const BountyCard: React.FC<BountyCardProps> = ({ bounty, onSelect }) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [copiedScope, setCopiedScope] = useState<string | null>(null);

  const handleCopyScope = (scopeItem: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(scopeItem);
    setCopiedScope(scopeItem);
    setTimeout(() => setCopiedScope(null), 2000);
  };

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
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-indigo-500/5">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">{bounty.organizationName}</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                Trust Score: {bounty.organizationTrustScore}
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSeverityStyle(bounty.severity)}`}>
              {bounty.severity}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-100 leading-snug line-clamp-2">
            {bounty.title}
          </h3>

          <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
            {bounty.description}
          </p>

          {/* Copyable Scope Badges (Issue 15) */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {bounty.scope.map((item, idx) => (
              <button
                key={idx}
                onClick={(e) => handleCopyScope(item, e)}
                title="Click to copy scope target"
                className="bg-slate-950 hover:bg-slate-800 text-indigo-300 text-[10px] font-mono px-2 py-1 rounded-lg border border-slate-800 hover:border-slate-700 flex items-center gap-1 transition-all"
              >
                <span>{item}</span>
                {copiedScope === item ? (
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                ) : (
                  <Copy className="w-2.5 h-2.5 text-slate-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button Hierarchy (Issue 14) */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Bounty Escrow Reward</div>
            <div className="text-lg font-black text-emerald-400 flex items-center gap-1 mt-0.5">
              <DollarSign className="w-4 h-4" />
              <span>{bounty.rewardAmount.toLocaleString()}</span>
              <span className="text-xs text-slate-400 font-medium">{bounty.rewardCurrency}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(bounty)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            >
              Details
            </button>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Report</span>
            </button>
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <SubmitVulnerabilityModal
          bounty={bounty}
          onClose={() => setShowSubmitModal(false)}
        />
      )}
    </>
  );
};
