import React, { useState } from 'react';
import { Activity, ArrowRight, ArrowUpDown, Award, Check, CheckCircle2, Clock3, Copy, FileCheck, Lock, ShieldCheck } from 'lucide-react';
import { useTrust } from '../../store/TrustContext';

interface DashboardViewProps {
  onNavigate: (tab: 'dashboard' | 'bounties' | 'passport' | 'explorer' | 'graph' | 'network') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { currentResearcher, reports, proofs, verifications, escrows } = useTrust();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'title' | 'severity'>('title');
  const [sortAsc, setSortAsc] = useState(true);

  const totalRewardsLocked = escrows.reduce((sum, e) => (e.status === 'locked' ? sum + e.amount : sum), 0);
  const totalRewardsReleased = escrows.reduce((sum, e) => (e.status === 'released' ? sum + e.amount : sum), 0);
  const attentionReport = reports.find(report => {
    const status = verifications.find(item => item.contributionId === report.id)?.status;
    return status === 'pending' || status === 'disputed';
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleSort = (field: 'title' | 'severity') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const sortedReports = [...reports].sort((a, b) => {
    const first = sortField === 'title' ? a.title : a.severity;
    const second = sortField === 'title' ? b.title : b.severity;
    return sortAsc ? first.localeCompare(second) : second.localeCompare(first);
  });

  const summaryItems = [
    { label: 'Verified contributions', value: currentResearcher.verifiedContributionsCount, detail: `${currentResearcher.acceptanceRate}% acceptance`, icon: FileCheck, accent: 'text-[#D7FF3F]', onClick: () => onNavigate('explorer') },
    { label: 'Rewards earned', value: `$${currentResearcher.totalRewardsEarned.toLocaleString()}`, detail: 'USDC / ETH equivalent', icon: Award, accent: 'text-emerald-300', onClick: () => onNavigate('passport') },
    { label: 'Escrow currently locked', value: `$${totalRewardsLocked.toLocaleString()}`, detail: `$${totalRewardsReleased.toLocaleString()} released`, icon: Lock, accent: 'text-zinc-300', onClick: () => onNavigate('network') },
    { label: 'Proof anchors', value: proofs.length, detail: 'SHA-256 evidence records', icon: ShieldCheck, accent: 'text-amber-300', onClick: () => onNavigate('explorer') }
  ];

  return (
    <div className="space-y-10">
      <section className="tx-grid border-b border-white/[0.07] pb-8 lg:pb-10">
        <span className="sr-only">Trustless Bug Bounty Platform</span>
        <span className="sr-only">Researcher Trust Score</span>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <div className="py-4">
            <div className="tx-kicker text-[#D7FF3F]/80">Trust command center</div>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[0.98] text-[#F5F5F2] sm:text-7xl">
              Trust is built from verifiable actions.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
              Track evidence-backed security work, watch verification advance, and inspect exactly which proof events update reputation and release escrow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => onNavigate('bounties')} className="tx-focus-ring inline-flex items-center gap-2 rounded-md bg-[#D7FF3F] px-4 py-2.5 text-sm font-semibold text-[#050505] transition hover:bg-[#B8E638]">Explore bounties <ArrowRight className="h-4 w-4" /></button>
              <button onClick={() => onNavigate('explorer')} className="tx-focus-ring inline-flex items-center gap-2 rounded-md border border-white/[0.1] bg-[#0B0B0B]/70 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-white/[0.18]">Inspect contribution trail</button>
            </div>
          </div>
          <div className="tx-surface-raised rounded-xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="tx-kicker">Trust identity</div>
                <h2 className="mt-3 text-2xl font-semibold text-[#F5F5F2]">{currentResearcher.name}</h2>
                <p className="mt-2 font-mono text-[11px] leading-5 text-zinc-500 break-all">{currentResearcher.id}</p>
              </div>
              <div className="text-right">
                <div className="tx-kicker text-emerald-300/70">Verified</div>
                <div className="mt-1 text-4xl font-semibold text-emerald-300">{currentResearcher.trustScore}<span className="text-sm text-zinc-500"> / 100</span></div>
              </div>
            </div>
            <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-[#D7FF3F]" style={{ width: `${currentResearcher.trustScore}%` }} /></div>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.07] pt-5">
              <div><div className="tx-kicker">Verified work</div><div className="mt-2 text-xl font-semibold text-zinc-100">{currentResearcher.verifiedContributionsCount}</div></div>
              <div><div className="tx-kicker">Acceptance rate</div><div className="mt-2 text-xl font-semibold text-zinc-100">{currentResearcher.acceptanceRate}%</div></div>
            </div>
            <button onClick={() => onNavigate('passport')} className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#D7FF3F] hover:text-[#B8E638]">Open verifiable credential <ArrowRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </section>

      {attentionReport ? <section className="flex flex-col gap-4 rounded-lg border border-amber-300/25 bg-amber-300/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><div><div className="tx-kicker text-amber-200/70">Action required</div><p className="mt-1 text-sm font-medium text-zinc-100">{attentionReport.title} is awaiting a next verification decision.</p><p className="mt-1 text-xs text-zinc-500">The contribution remains visible in the evidence center.</p></div></div><button onClick={() => onNavigate('explorer')} className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-300 px-4 py-2.5 text-xs font-semibold text-[#050505] hover:bg-amber-200">View verification <ArrowRight className="h-3.5 w-3.5" /></button></section> : <section className="flex items-center gap-3 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.05] px-5 py-4"><CheckCircle2 className="h-5 w-5 text-emerald-300" /><div><div className="tx-kicker text-emerald-200/70">No action required</div><p className="mt-1 text-sm text-zinc-200">Your visible contribution trail is verified and in good standing.</p></div></section>}

      <section><div className="mb-4 flex items-end justify-between gap-4"><div><div className="tx-kicker">Network state</div><h2 className="mt-2 text-xl font-semibold text-white">Integrated trust telemetry</h2></div><span className="hidden text-xs text-zinc-500 sm:block">Computed from the current demo ledger</span></div><div className="grid grid-cols-1 border-y border-white/[0.07] sm:grid-cols-2 xl:grid-cols-4">{summaryItems.map(item => { const Icon = item.icon; return <button key={item.label} onClick={item.onClick} className="tx-focus-ring border-b border-white/[0.07] p-5 text-left transition hover:bg-white/[0.035] sm:even:border-l xl:border-b-0 xl:border-l xl:first:border-l-0"><div className="flex items-start justify-between gap-4"><div><div className="tx-kicker">{item.label}</div><div className="mt-3 text-2xl font-semibold text-zinc-100">{item.value}</div><div className="mt-1 text-xs text-zinc-500">{item.detail}</div></div><Icon className={`h-5 w-5 ${item.accent}`} /></div></button>; })}</div></section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]"><div className="tx-surface rounded-xl p-6 sm:p-7"><div className="flex items-start justify-between gap-4"><div><div className="tx-kicker">Trust lifecycle</div><h2 className="mt-2 text-xl font-semibold text-white">Every action leaves a trail</h2></div></div><div className="mt-7 grid grid-cols-2 gap-px border border-white/[0.07] bg-white/[0.07] sm:grid-cols-4">{[['01','Identity','DID anchored'],['02','Contribution','Report submitted'],['03','Proof','Evidence hashed'],['04','Outcome','Trust updated']].map(([num,label,detail]) => <div key={label} className="bg-[#0B0B0B] p-4"><div className="font-mono text-[10px] text-[#D7FF3F]">{num}</div><div className="mt-5 text-sm font-semibold text-zinc-100">{label}</div><div className="mt-1 text-[11px] leading-5 text-zinc-500">{detail}</div></div>)}</div><p className="mt-5 max-w-2xl text-xs leading-6 text-zinc-400">Cryptographic proof establishes provenance. Technical verification determines whether a vulnerability is valid. These are distinct steps in the trust model.</p></div><div className="tx-surface rounded-xl p-6 sm:p-7"><div className="tx-kicker">Recent activity</div><h2 className="mt-2 text-xl font-semibold text-white">What just happened</h2><div className="mt-6 space-y-4">{reports.slice(0, 3).map(report => { const verification = verifications.find(item => item.contributionId === report.id); const proof = proofs.find(item => item.contributionId === report.id); return <div key={report.id} className="flex gap-3 border-b border-white/[0.06] pb-4 last:border-0 last:pb-0"><div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D7FF3F]/20 bg-[#D7FF3F]/10 text-[#D7FF3F]">{verification?.status === 'valid' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}</div><div className="min-w-0"><div className="text-sm font-medium text-zinc-200">{verification?.status === 'valid' ? 'Contribution verified' : 'Contribution submitted'}</div><div className="mt-1 truncate text-xs text-zinc-500">{report.title}</div><div className="mt-2 flex flex-wrap gap-2 text-[10px] font-mono text-zinc-600"><span>{report.id}</span>{proof && <span>proof {proof.contentHash.slice(0, 10)}...</span>}</div></div></div>; })}</div><button onClick={() => onNavigate('explorer')} className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#D7FF3F] hover:text-[#B8E638]">Open full audit trail <ArrowRight className="h-3.5 w-3.5" /></button></div></section>

      <section className="tx-surface rounded-xl p-5 sm:p-7"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><div className="tx-kicker">Evidence register</div><h2 className="mt-2 text-xl font-semibold text-white">Recent proof-anchored submissions</h2></div><button onClick={() => onNavigate('explorer')} className="inline-flex items-center gap-2 text-xs font-semibold text-[#D7FF3F] hover:text-[#B8E638]">View explorer <ArrowRight className="h-3.5 w-3.5" /></button></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead><tr className="border-b border-white/[0.07] text-[10px] uppercase tracking-[0.16em] text-zinc-500"><th className="pb-3 pr-4">Report <ArrowUpDown className="ml-1 inline h-3 w-3 cursor-pointer" onClick={() => handleSort('title')} /></th><th className="pb-3 px-4">Severity <ArrowUpDown className="ml-1 inline h-3 w-3 cursor-pointer" onClick={() => handleSort('severity')} /></th><th className="pb-3 px-4">Proof</th><th className="pb-3 pl-4">Verification</th></tr></thead><tbody className="divide-y divide-white/[0.06]">{sortedReports.map(report => { const proof = proofs.find(item => item.contributionId === report.id); const verification = verifications.find(item => item.contributionId === report.id); return <tr key={report.id} className="group hover:bg-white/[0.025]"><td className="py-4 pr-4"><div className="max-w-[300px] truncate font-medium text-zinc-200">{report.title}</div><div className="mt-1 font-mono text-[10px] text-zinc-600">{report.id}</div></td><td className="px-4"><span className="status-pill status-critical">{report.severity}</span></td><td className="px-4 font-mono text-[11px] text-zinc-400"><span>{proof ? `${proof.contentHash.slice(0, 16)}...` : 'Generating...'}</span>{proof && <button onClick={() => handleCopyHash(proof.contentHash)} className="ml-2 text-zinc-600 hover:text-[#D7FF3F]" title="Copy full SHA-256 hash">{copiedHash === proof.contentHash ? <Check className="inline h-3.5 w-3.5 text-emerald-300" /> : <Copy className="inline h-3.5 w-3.5" />}</button>}</td><td className="pl-4"><span className={`status-pill ${verification?.status === 'valid' ? 'status-success' : verification?.status === 'pending' ? 'status-warning' : 'status-critical'}`}>{verification?.status || 'pending'}</span></td></tr>; })}</tbody></table></div></section>
    </div>
  );
};
