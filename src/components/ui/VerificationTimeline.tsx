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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-200 mb-6">Verification Lifecycle Timeline</h3>

      <div className="relative overflow-x-auto scrollbar-none pb-2">
        <div className="flex items-center justify-between min-w-[700px] px-2">
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isPassed
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-600 border border-slate-800'
                  } ${isCurrent ? 'ring-4 ring-indigo-500/30 border-2 border-indigo-400 animate-pulse' : ''}`}
                >
                  {stage.icon}
                </div>
                <span
                  className={`mt-3 text-xs whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'text-indigo-300 font-bold'
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
