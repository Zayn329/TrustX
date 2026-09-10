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
        return 'bg-rose-300/10 text-rose-200 border-rose-300/20';
      case 'High':
        return 'bg-amber-300/10 text-amber-200 border-amber-300/20';
      case 'Medium':
        return 'bg-cyan-300/10 text-cyan-200 border-cyan-300/20';
      default:
        return 'bg-slate-800/80 text-slate-300 border-slate-700/70';
    }
  };

  return (
    <>
      <div className="tx-surface rounded-2xl p-6 transition-all flex flex-col justify-between space-y-5 hover:-translate-y-0.5 hover:border-blue-300/30 hover:bg-slate-800/75">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-300" />
              <span className="text-xs font-semibold text-slate-300">{bounty.organizationName}</span>
              <span className="bg-blue-400/10 text-blue-200 text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-blue-300/20 font-bold">
                Org. trust {bounty.organizationTrustScore}
              </span>
            </div>
            <span className={`status-pill ${getSeverityStyle(bounty.severity)}`}>
              {bounty.severity}
            </span>
          </div>

          <h3 className="text-xl font-semibold tracking-[-0.035em] text-slate-100 leading-snug line-clamp-2">
            {bounty.title}
          </h3>

          <p className="text-sm text-slate-400 mt-3 line-clamp-3 leading-6">
            {bounty.description}
          </p>

          {/* Copyable Scope Badges (Issue 15) */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {bounty.scope.map((item, idx) => (
              <button
                key={idx}
                onClick={(e) => handleCopyScope(item, e)}
                title="Click to copy scope target"
                className="bg-slate-950/70 hover:bg-slate-800 text-blue-200 text-[10px] font-mono px-2 py-1 rounded-lg border border-slate-700/50 hover:border-blue-300/30 flex items-center gap-1 transition-all"
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
        <div className="pt-5 border-t border-slate-700/40 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="tx-kicker">Escrow reward</div>
            <div className="text-2xl font-semibold tracking-[-0.04em] text-slate-100 flex items-center gap-1 mt-1">
              <DollarSign className="w-4 h-4" />
              <span>{bounty.rewardAmount.toLocaleString()}</span>
              <span className="text-xs text-slate-500 font-medium">{bounty.rewardCurrency}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(bounty)}
              className="px-3 py-2.5 bg-transparent hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-600/60 transition-all"
            >
              Details
            </button>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-1.5 bg-blue-400 hover:bg-blue-300 text-slate-950 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/15"
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
