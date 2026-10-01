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
        return 'bg-zinc-400/10 text-zinc-200 border-zinc-400/20';
      default:
        return 'bg-slate-800/80 text-slate-300 border-slate-700/70';
    }
  };

  return (
    <>
      <div className="tx-surface rounded-lg p-5 transition-all flex flex-col justify-between space-y-5 hover:border-[#D7FF3F]/25 hover:bg-white/[0.035]">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D7FF3F]" />
              <span className="text-xs font-semibold text-zinc-300">{bounty.organizationName}</span>
              <span className="bg-[#D7FF3F]/10 text-[#D7FF3F] text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-[#D7FF3F]/20 font-bold">
                Org. trust {bounty.organizationTrustScore}
              </span>
            </div>
            <span className={`status-pill ${getSeverityStyle(bounty.severity)}`}>
              {bounty.severity}
            </span>
          </div>

          <h3 className="text-xl font-semibold text-zinc-100 leading-snug line-clamp-2">
            {bounty.title}
          </h3>

          <p className="text-sm text-zinc-400 mt-3 line-clamp-3 leading-6">
            {bounty.description}
          </p>

          {/* Copyable Scope Badges (Issue 15) */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {bounty.scope.map((item, idx) => (
              <button
                key={idx}
                onClick={(e) => handleCopyScope(item, e)}
                title="Click to copy scope target"
                className="bg-[#050505] hover:bg-[#161616] text-zinc-300 text-[10px] font-mono px-2 py-1 rounded-md border border-white/[0.08] hover:border-[#D7FF3F]/30 flex items-center gap-1 transition-all"
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
        <div className="pt-5 border-t border-white/[0.07] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="tx-kicker">Escrow reward</div>
            <div className="text-3xl font-semibold text-zinc-100 flex items-center gap-1 mt-1">
              <DollarSign className="w-4 h-4" />
              <span>{bounty.rewardAmount.toLocaleString()}</span>
              <span className="text-xs text-slate-500 font-medium">{bounty.rewardCurrency}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(bounty)}
              className="px-3 py-2.5 bg-transparent hover:bg-white/[0.04] text-zinc-300 text-xs font-semibold rounded-md border border-white/[0.1] transition-all"
            >
              Details
            </button>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-1.5 bg-[#D7FF3F] hover:bg-[#B8E638] text-[#050505] text-xs font-semibold px-4 py-2.5 rounded-md transition-all"
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
