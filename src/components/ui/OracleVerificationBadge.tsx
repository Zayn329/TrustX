import React from 'react';
import { Cpu, CheckCircle2, CircleAlert, Terminal } from 'lucide-react';
import { SandboxExecutionResult } from '../../../oracle/sandboxRunner';

interface OracleVerificationBadgeProps {
  result: SandboxExecutionResult;
}

export const OracleVerificationBadge: React.FC<OracleVerificationBadgeProps> = ({ result }) => {
  const passed = result.status === 'passed';
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-bold text-slate-200">{result.targetId || 'Remote Technical Verifier'}</span>
        </div>
        <span className={`${passed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'} text-[10px] font-mono px-2 py-0.5 rounded border font-semibold flex items-center gap-1`}>
          {passed ? <CheckCircle2 className="w-3 h-3" /> : <CircleAlert className="w-3 h-3" />} {passed ? 'Oracle runtime verified · vulnerability reproduced' : `Oracle ${result.status}`} ({result.coveragePercentage}%)
        </span>
      </div>

      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-sans mb-1">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Verifier execution log · {result.executionMode}</span>
        </div>
        {result.logs.map((log, idx) => (
          <div key={idx} className="text-slate-400 leading-tight">
            {log}
          </div>
        ))}
        {result.securityRule && <div className="border-t border-slate-800 pt-2 text-[10px] text-slate-400">Rule: {result.securityRule}</div>}
        {result.astFindings?.map((finding, idx) => (
          <div key={`ast-${idx}`} className="space-y-1 text-[10px]">
            <div className="text-amber-200">AST finding detected: {finding.ruleId} · {finding.file}:{finding.line}</div>
            <div className="text-slate-400">Deterministic rule: {finding.explanation}</div>
            {finding.aiExplanation && <div className="text-cyan-200">{finding.aiProvider ? `${finding.aiProvider.toUpperCase()} explanation` : 'AI explanation'}: {finding.aiExplanation}</div>}
          </div>
        ))}
        <div className="border-t border-slate-800 pt-2 text-[10px] text-slate-500">
          execution {result.executionId} · {result.verifierVersion} · signed result
        </div>
      </div>
    </div>
  );
};
