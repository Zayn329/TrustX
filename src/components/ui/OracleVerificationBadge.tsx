import React from 'react';
import {
  ArrowRight, CheckCircle2, CircleAlert, Code2, Cpu, FileCheck2,
  LockKeyhole, PlayCircle, ShieldCheck, Terminal,
} from 'lucide-react';
import { SandboxExecutionResult } from '../../../oracle/sandboxRunner';

interface OracleVerificationBadgeProps { result: SandboxExecutionResult; }
type StageState = 'passed' | 'failed' | 'unavailable' | 'not_run';

const stateLabel: Record<StageState, string> = { passed: 'Complete', failed: 'Failed', unavailable: 'Unavailable', not_run: 'Not run' };
const stateClasses: Record<StageState, string> = {
  passed: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
  failed: 'border-rose-400/25 bg-rose-400/10 text-rose-200',
  unavailable: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
  not_run: 'border-slate-700 bg-slate-900/70 text-slate-400',
};

function StageIcon({ state }: { state: StageState }) {
  return state === 'passed' ? <CheckCircle2 className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />;
}

function responseClass(status?: number) {
  if (status && status >= 200 && status < 300) return 'text-emerald-300 border-emerald-400/20 bg-emerald-400/10';
  if (status && status >= 400 && status < 500) return 'text-amber-200 border-amber-400/20 bg-amber-400/10';
  return 'text-slate-300 border-slate-700 bg-slate-900';
}

export const OracleVerificationBadge: React.FC<OracleVerificationBadgeProps> = ({ result }) => {
  const passed = result.status === 'passed';
  const astState: StageState = result.astStatus === 'passed' ? 'passed' : result.astStatus === 'failed' ? 'failed' : result.astStatus === 'unavailable' ? 'unavailable' : 'not_run';
  const runtimeState: StageState = result.runtimeStatus === 'passed' ? 'passed' : result.runtimeStatus === 'unavailable' ? 'unavailable' : result.runtimeStatus === 'failed' || result.runtimeStatus === 'rejected' ? 'failed' : 'not_run';
  const signatureState: StageState = result.signature ? 'passed' : 'unavailable';
  const aiAvailable = result.aiStatus === 'available';
  const stages = [
    { label: 'AST analysis', detail: astState === 'passed' ? `${result.astFindings?.length || 0} finding(s) inspected` : 'Deterministic source rule', state: astState, icon: Code2 },
    { label: 'Runtime reproduction', detail: result.vulnerabilityReproduced ? 'Protected resource reached' : result.runtimeStatus || 'Awaiting execution', state: runtimeState, icon: PlayCircle },
    { label: 'Signed result', detail: result.signature ? 'Ed25519 response verified' : 'Signature unavailable', state: signatureState, icon: FileCheck2 },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-400/20 bg-slate-950 shadow-2xl shadow-indigo-950/20">
      <div className="relative border-b border-slate-800 bg-gradient-to-br from-indigo-950/70 via-slate-950 to-cyan-950/30 p-5 sm:p-6">
        <div className="absolute right-5 top-5 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-300"><Cpu className="h-4 w-4" />Signed oracle execution</div>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">{result.targetId || 'Remote technical verifier'}</h3>
            <p className="mt-1 text-xs text-slate-400">{result.vulnerabilityCategory}</p>
          </div>
          <div className={`inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-[10px] font-semibold ${passed ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-amber-400/30 bg-amber-400/10 text-amber-200'}`}>
            {passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}
            {passed ? 'Vulnerability reproduced' : `Oracle ${result.status}`}
          </div>
        </div>
        <div className="relative mt-6 grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
          {stages.map((stage, index) => { const Icon = stage.icon; return <React.Fragment key={stage.label}>
            <div className={`rounded-xl border p-3 ${stateClasses[stage.state]}`}>
              <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2 text-xs font-semibold"><Icon className="h-4 w-4" />{stage.label}</div><StageIcon state={stage.state} /></div>
              <div className="mt-2 text-[10px] opacity-80">{stateLabel[stage.state]} · {stage.detail}</div>
            </div>
            {index < stages.length - 1 && <ArrowRight className="mx-auto hidden h-4 w-4 text-slate-600 md:block" />}
          </React.Fragment>; })}
        </div>
      </div>

      <div className="grid gap-3 border-b border-slate-800 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">Security rule</div><div className="mt-2 flex gap-2 text-xs leading-5 text-slate-200"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />{result.securityRule || 'Target-specific rule evaluated.'}</div></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">Protected resource</div><div className={`mt-2 text-sm font-semibold ${result.protectedResourceReached ? 'text-rose-200' : 'text-emerald-200'}`}>{result.protectedResourceReached ? 'Reached by reproduction' : 'Not reached'}</div><div className="mt-1 text-[10px] text-slate-500">Coverage {result.coveragePercentage}%</div></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">AST evidence</div><div className="mt-2 text-sm font-semibold text-amber-200">{result.astFindings?.length || 0} deterministic finding(s)</div><div className="mt-1 text-[10px] text-slate-500">Source hash {result.sourceHash ? 'bound' : 'not provided'}</div></div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">AI explanation</div><div className={`mt-2 text-sm font-semibold ${aiAvailable ? 'text-cyan-200' : 'text-slate-400'}`}>{aiAvailable ? `${result.astFindings?.[0]?.aiProvider || 'AI'} available` : 'Optional / unavailable'}</div><div className="mt-1 text-[10px] text-slate-500">Does not determine validity</div></div>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500"><Terminal className="h-3.5 w-3.5 text-indigo-300" />HTTP reproduction trace</div><div className="mt-3 space-y-2">
          {(result.requestTrace || []).map((trace, index) => <div key={`${trace}-${index}`} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[9px] font-bold text-slate-400">{index + 1}</span><span className="min-w-0 flex-1 font-mono text-[10px] text-slate-300">{trace}</span>{result.responseStatuses?.[index] !== undefined && <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold ${responseClass(result.responseStatuses[index])}`}>{result.responseStatuses[index]}</span>}</div>)}
          {!result.requestTrace?.length && <div className="rounded-lg border border-dashed border-slate-800 p-4 text-xs text-slate-500">No HTTP trace was returned for this target.</div>}
        </div></section>
        <section className="space-y-3">
          {result.astFindings?.map((finding, idx) => <div key={`ast-${idx}`} className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200"><Code2 className="h-3.5 w-3.5" />Deterministic AST finding</div><div className="mt-2 text-xs font-semibold text-white">{finding.ruleId} · {finding.file}:{finding.line}</div><p className="mt-2 text-xs leading-5 text-slate-300">{finding.explanation}</p>{finding.aiExplanation && <div className="mt-3 border-t border-amber-300/10 pt-3"><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200">{finding.aiProvider ? `${finding.aiProvider} explanation` : 'AI explanation'}</div><p className="mt-2 text-xs leading-5 text-cyan-100/80">{finding.aiExplanation}</p><div className="mt-2 text-[10px] text-slate-500">AI explains this finding; runtime reproduction determines technical validity.</div></div>}</div>)}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />Execution record</div><div className="mt-2 break-all font-mono text-[10px] leading-5 text-slate-400">{result.executionId}</div><div className="mt-2 text-[10px] text-slate-500">{result.verifierVersion} · {result.signature ? 'signed response verified' : 'signature unavailable'}</div></div>
        </section>
      </div>
    </div>
  );
};
