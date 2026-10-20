import { ArrowRight, BadgeCheck, BriefcaseBusiness, FileWarning, Landmark, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useTrust } from '../../store/TrustContext';

interface RoleDashboardProps { onNavigate: (tab: 'bounties' | 'reports' | 'passport' | 'settings') => void; }

export function RoleDashboard({ onNavigate }: RoleDashboardProps) {
  const { role, profile, user } = useAuth();
  const { bounties, reports, verifications, escrows } = useTrust();
  const company = role === 'company';
  const verified = reports.filter((report) => verifications.some((item) => item.contributionId === report.id && item.status === 'valid')).length;
  const pending = reports.filter((report) => !verifications.some((item) => item.contributionId === report.id && item.status === 'valid')).length;
  const released = escrows.filter((escrow) => escrow.status === 'released').length;
  const cards: [string, number, LucideIcon, 'bounties' | 'reports'][] = company
    ? [['Active programs', bounties.length, BriefcaseBusiness, 'bounties'], ['Incoming reports', reports.length, FileWarning, 'reports'], ['Verified findings', verified, BadgeCheck, 'reports'], ['Released escrows', released, Landmark, 'bounties']]
    : [['Available programs', bounties.length, BriefcaseBusiness, 'bounties'], ['My submissions', reports.length, FileWarning, 'reports'], ['Verified findings', verified, BadgeCheck, 'reports'], ['Rewards released', released, Landmark, 'reports']];

  return <div className="space-y-7">
    <header className="flex flex-col gap-3 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="tx-kicker">{company ? 'Company workspace' : 'Researcher workspace'}</p><h1 className="tx-page-title mt-2">Welcome back, {profile?.companyName || profile?.displayName || user?.email}.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{company ? 'Review the work your programs received and keep technical evidence and escrow decisions connected.' : 'Track your security work from scoped program to company response and signed verification evidence.'}</p></div><button onClick={() => onNavigate(company ? 'reports' : 'bounties')} className="inline-flex items-center gap-2 self-start border border-blue-300/25 bg-blue-400/10 px-4 py-2.5 text-xs font-semibold text-blue-200 hover:bg-blue-400/15">{company ? 'Review submissions' : 'Discover programs'} <ArrowRight className="h-3.5 w-3.5" /></button></header>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon, tab]) => <button key={label as string} onClick={() => onNavigate(tab as 'bounties' | 'reports')} className="tx-surface p-5 text-left hover:border-blue-300/30"><Icon className="h-5 w-5 text-blue-300" /><div className="mt-5 text-2xl font-semibold text-white">{value as number}</div><div className="mt-1 text-xs text-slate-400">{label as string}</div></button>)}</section>
    <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><div className="tx-surface p-6"><p className="tx-kicker">Current review queue</p><h2 className="mt-2 text-xl font-semibold text-white">{company ? 'Reports requiring a company decision' : 'Your private submission history'}</h2><div className="mt-5 space-y-3">{reports.slice(0, 4).map((report) => <button key={report.id} onClick={() => onNavigate('reports')} className="flex w-full items-center justify-between border-b border-slate-800 pb-3 text-left last:border-0"><span><span className="block text-sm font-medium text-slate-200">{report.title}</span><span className="mt-1 block font-mono text-[10px] text-slate-500">{report.id} · {report.severity}</span></span><span className="text-xs text-blue-300">View</span></button>)}{reports.length === 0 && <p className="py-5 text-sm text-slate-500">No authorized reports yet.</p>}</div></div><div className="tx-surface p-6"><ShieldCheck className="h-5 w-5 text-emerald-300" /><p className="tx-kicker mt-5">Trust boundary</p><h2 className="mt-2 text-lg font-semibold text-white">Evidence is not an automatic decision.</h2><p className="mt-3 text-sm leading-6 text-slate-400">Proof records provenance. Signed oracle output is technical evidence. Company acceptance and any escrow payout remain separate, authorized actions.</p></div></section>
    {pending > 0 && <section className="border border-amber-300/20 bg-amber-300/[0.05] p-5 text-sm text-amber-100"><strong>{pending} {company ? 'reports await review' : 'submissions are still under review'}.</strong><span className="ml-2 text-amber-100/70">Open the reports workspace to inspect the latest status and evidence.</span></section>}
  </div>;
}
