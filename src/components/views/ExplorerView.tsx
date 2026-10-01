import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Copy, FileKey2, ShieldCheck, UserRound } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';
import { ProofCard } from '../ui/ProofCard';
import { VerificationTimeline } from '../ui/VerificationTimeline';
import { OracleVerificationBadge } from '../ui/OracleVerificationBadge';
import { runSandboxEvaluation, SandboxExecutionResult } from '../../../oracle/sandboxRunner';

export const ExplorerView: React.FC = () => {
  const { reports, proofs, verifications, identities } = useTrust();
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [oracleResult, setOracleResult] = useState<SandboxExecutionResult | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isPayloadExpanded, setIsPayloadExpanded] = useState(false);
  const detailPanelRef = useRef<HTMLDivElement>(null);

  const activeReport = reports.find(r => r.id === selectedReportId) || reports[0];
  const activeProof = proofs.find(p => p.contributionId === activeReport?.id);
  const activeVerification = verifications.find(v => v.contributionId === activeReport?.id);
  const activeResearcher = identities.find(i => i.id === activeReport?.researcherId);

  useEffect(() => {
    if (activeReport) runSandboxEvaluation(activeReport.reproductionSteps).then(res => setOracleResult(res));
  }, [activeReport]);

  const handleSelectReport = (id: string) => {
    setSelectedReportId(id);
    if (window.innerWidth < 1024 && detailPanelRef.current) detailPanelRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopyPayload = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!activeReport) return <div className="tx-surface rounded-2xl p-10 text-center text-sm text-slate-400">No contributions are available yet.</div>;

  const lifecycleStage = activeVerification?.status === 'valid' ? 'escrow_released' : activeVerification?.status === 'pending' ? 'technical_verification' : 'proof_generated';

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-white/[0.07] pb-7 sm:flex-row sm:items-end sm:justify-between"><div><button onClick={() => { window.location.hash = '#dashboard'; }} className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-200"><ArrowLeft className="h-3.5 w-3.5" /> Back to workspace</button><div className="tx-kicker text-[#D7FF3F]/80">Evidence center</div><h1 className="tx-page-title mt-3">Contribution provenance</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Follow what happened, why it matters, and which technical evidence backs each state change.</p></div><span className="status-pill status-success"><ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Local ledger</span></header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="tx-surface h-fit rounded-xl p-4 lg:sticky lg:top-24"><div className="flex items-center justify-between px-1"><div className="tx-kicker">Contributions</div><span className="font-mono text-[10px] text-zinc-600">{reports.length} total</span></div><div className="mt-4 space-y-1">{reports.map(rep => { const ver = verifications.find(v => v.contributionId === rep.id); const isSelected = rep.id === activeReport.id; return <button key={rep.id} onClick={() => handleSelectReport(rep.id)} className={`w-full rounded-md border p-3 text-left transition ${isSelected ? 'border-[#D7FF3F]/30 bg-[#D7FF3F]/10' : 'border-transparent hover:border-white/[0.08] hover:bg-white/[0.04]'}`}><div className="flex items-center justify-between gap-2"><span className="font-mono text-[10px] font-semibold text-[#D7FF3F]">{rep.id}</span><span className={`status-pill ${ver?.status === 'valid' ? 'status-success' : ver?.status === 'pending' ? 'status-warning' : 'status-critical'}`}>{ver?.status || 'pending'}</span></div><div className="mt-3 line-clamp-2 text-xs font-medium leading-5 text-zinc-200">{rep.title}</div></button>; })}</div></aside>

        <main ref={detailPanelRef} className="min-w-0 space-y-5">
          <section className="tx-surface-raised rounded-xl p-6 sm:p-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><div className="tx-kicker">Selected contribution / {activeReport.id}</div><h2 className="mt-3 max-w-3xl text-2xl font-semibold text-white sm:text-3xl">{activeReport.title}</h2><div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-400"><span className="inline-flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5 text-[#D7FF3F]" /> {activeResearcher?.name || 'Researcher'}</span><span className="font-mono text-zinc-600 break-all">{activeResearcher?.id}</span></div></div><div className="flex shrink-0 flex-col items-start gap-2 lg:items-end"><span className={`status-pill ${activeVerification?.status === 'valid' ? 'status-success' : activeVerification?.status === 'pending' ? 'status-warning' : 'status-critical'}`}>{activeVerification?.status || 'pending'} verification</span><span className="text-xs text-zinc-500">{activeProof ? 'Proof available' : 'Proof generating'}</span></div></div><div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.07] sm:grid-cols-4"><div className="bg-[#0B0B0B] p-4"><div className="tx-kicker">Severity</div><div className="mt-2 text-sm font-semibold text-rose-200">{activeReport.severity}</div></div><div className="bg-[#0B0B0B] p-4"><div className="tx-kicker">Proof state</div><div className="mt-2 text-sm font-semibold text-emerald-300">{activeProof?.proofStatus === 'anchored_on_chain' ? 'Anchored' : 'Generated'}</div></div><div className="bg-[#0B0B0B] p-4"><div className="tx-kicker">Verifier</div><div className="mt-2 truncate text-sm font-semibold text-zinc-200">{activeVerification?.verifierName || 'Pending assignment'}</div></div><div className="bg-[#0B0B0B] p-4"><div className="tx-kicker">Outcome</div><div className="mt-2 text-sm font-semibold text-[#D7FF3F]">{activeVerification?.status === 'valid' ? 'Escrow path active' : 'Under review'}</div></div></div></section>

          <VerificationTimeline currentStage={lifecycleStage} />

          <section className="tx-surface rounded-xl p-6 sm:p-7"><div className="flex items-start justify-between gap-4"><div><div className="tx-kicker">PAYLOAD / PROOF / SANDBOX / ANCHOR / REPUTATION / REWARD</div><h3 className="mt-2 text-xl font-semibold text-white">Evidence provenance path</h3></div><FileKey2 className="h-5 w-5 text-[#D7FF3F]" /></div><div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.07] sm:grid-cols-2 xl:grid-cols-6">{[['01','Payload',activeReport.id],['02','Cryptographic proof',activeProof ? `${activeProof.contentHash.slice(0, 10)}...` : 'Pending'],['03','Sandbox',oracleResult ? `${oracleResult.coveragePercentage}% coverage` : 'Running'],['04','On-chain anchor',activeProof?.proofStatus === 'anchored_on_chain' ? 'Confirmed' : 'Local proof'],['05','Reputation',activeVerification?.status === 'valid' ? 'Updated' : 'Waiting'],['06','Reward',activeVerification?.status === 'valid' ? 'Release path' : 'Conditional']].map(([num,label,value]) => <div key={label} className="bg-[#0B0B0B] p-4"><div className="font-mono text-[10px] text-[#D7FF3F]">{num}</div><div className="mt-4 text-[10px] uppercase tracking-[0.12em] text-zinc-500">{label}</div><div className="mt-1 truncate text-sm font-semibold text-zinc-200">{value}</div></div>)}</div></section>

          {oracleResult && <OracleVerificationBadge result={oracleResult} />}
          {activeProof && <ProofCard proof={activeProof} verification={activeVerification} />}

          <section className="tx-surface rounded-xl p-6 sm:p-7"><div className="flex items-start justify-between gap-4"><div><div className="tx-kicker">Technical evidence</div><h3 className="mt-2 text-xl font-semibold text-white">Why this contribution can be inspected</h3></div><button onClick={() => setIsPayloadExpanded(!isPayloadExpanded)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D7FF3F] hover:text-[#B8E638]">{isPayloadExpanded ? 'Collapse' : 'Expand'} {isPayloadExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}</button></div><div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2"><div><div className="tx-kicker">Impact</div><p className="mt-3 text-sm leading-7 text-zinc-300">{activeReport.impact}</p></div><div><div className="tx-kicker">Report description</div><p className="mt-3 text-sm leading-7 text-zinc-300">{activeReport.description}</p></div></div>{isPayloadExpanded && <div className="mt-7 border-t border-white/[0.07] pt-6"><div className="flex items-center justify-between gap-3"><div className="tx-kicker">Reproduction payload & code evidence</div><button onClick={() => handleCopyPayload(activeReport.reproductionSteps)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D7FF3F] hover:text-[#B8E638]">{copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}{copiedCode ? 'Copied' : 'Copy payload'}</button></div><pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-white/[0.08] bg-[#050505] p-4 font-mono text-xs leading-6 text-zinc-200">{activeReport.reproductionSteps}</pre><div className="mt-5"><div className="tx-kicker">Evidence input</div><p className="mt-2 text-sm leading-6 text-zinc-400">{activeReport.evidence}</p></div></div>}</section>
        </main>
      </div>
    </div>
  );
};
