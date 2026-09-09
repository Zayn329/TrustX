import React from 'react';
import { Cpu, CheckCircle2, Terminal } from 'lucide-react';
import { SandboxExecutionResult } from '../../../oracle/sandboxRunner';

interface OracleVerificationBadgeProps {
  result: SandboxExecutionResult;
}

export const OracleVerificationBadge: React.FC<OracleVerificationBadgeProps> = ({ result }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-bold text-slate-200">Phase 7: Automated Oracle Sandbox Runner</span>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/20 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Oracle Verified ({result.coveragePercentage}%)
        </span>
      </div>

      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-sans mb-1">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Chainlink Functions Execution Log</span>
        </div>
        {result.logs.map((log, idx) => (
          <div key={idx} className="text-slate-400 leading-tight">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};
