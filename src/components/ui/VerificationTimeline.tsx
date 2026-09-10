import React from 'react';
import {
  FileCode2,
  Send,
  FileKey2,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Unlock
} from 'lucide-react';

export type TimelineStage =
  | 'discovered'
  | 'submitted'
  | 'proof_generated'
  | 'technical_verification'
  | 'validated'
  | 'reputation_updated'
  | 'escrow_released';

interface VerificationTimelineProps {
  currentStage: TimelineStage;
}

export const VerificationTimeline: React.FC<VerificationTimelineProps> = ({ currentStage }) => {
  const stages: { id: TimelineStage; label: string; icon: React.ReactNode }[] = [
    { id: 'discovered', label: 'Discovered', icon: <FileCode2 className="w-4 h-4" /> },
    { id: 'submitted', label: 'Submitted', icon: <Send className="w-4 h-4" /> },
    { id: 'proof_generated', label: 'Proof Generated', icon: <FileKey2 className="w-4 h-4" /> },
    { id: 'technical_verification', label: 'Technical Verification', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'validated', label: 'Validated', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'reputation_updated', label: 'Reputation Updated', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'escrow_released', label: 'Escrow Released', icon: <Unlock className="w-4 h-4" /> }
  ];

  const getStageIndex = (stage: TimelineStage) => stages.findIndex(s => s.id === stage);
  const activeIdx = getStageIndex(currentStage);

  return (
    <div className="tx-surface rounded-2xl p-6 sm:p-7">
      <div className="flex items-end justify-between gap-4"><div><div className="tx-kicker">Proof lifecycle</div><h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Where the contribution stands</h3></div><span className="hidden text-xs text-slate-500 sm:block">Completed · current · next</span></div>

      <div className="relative mt-7 overflow-x-auto scrollbar-none pb-2">
        <div className="flex min-w-[620px] items-start justify-between px-2 sm:min-w-0">
          {/* Connecting Base Line */}
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-800 -z-0" />
          <div
            className="absolute top-5 left-8 h-0.5 bg-indigo-500 transition-all duration-500 -z-0 shadow-sm shadow-indigo-500/50"
            style={{ width: `${(activeIdx / (stages.length - 1)) * 90}%` }}
          />

          {stages.map((stage, idx) => {
            const isPassed = idx <= activeIdx;
            const isCurrent = idx === activeIdx;

            return (
              <div key={stage.id} className="relative z-10 flex flex-col items-center group">
              <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                    isPassed
                      ? 'bg-blue-400 text-slate-950 shadow-lg shadow-blue-600/20'
                      : 'bg-slate-950 text-slate-600 border border-slate-800'
                  } ${isCurrent ? 'ring-4 ring-indigo-500/30 border-2 border-indigo-400 animate-pulse' : ''}`}
                >
                  {stage.icon}
                </div>
                  <span
                  className={`mt-3 text-xs whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'text-blue-200 font-bold'
                      : isPassed
                      ? 'text-slate-200 font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
