import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import type { AccountRole } from '../../auth/roleAccess';

const labels: Record<AccountRole, { name: string; detail: string }> = {
  company: { name: 'Company', detail: 'Manage programs, triage submissions, and review evidence.' },
  researcher: { name: 'Bug Reporter', detail: 'Discover programs and manage your private security reports.' },
};

export function AuthPage() {
  const { signIn, resetPassword, configurationError } = useAuth();
  const [role, setRole] = useState<AccountRole>('researcher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null); setMessage(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    if (!password) return setError('Enter your password.');
    setBusy(true);
    try { await signIn(email, password, role); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in.'); }
    finally { setBusy(false); }
  }

  async function requestReset() {
    setError(null); setMessage(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter your email address, then request a reset.');
    setBusy(true);
    try {
      await resetPassword(email);
      setMessage('If this address has a TrustX account, password reset instructions have been sent.');
    } catch { setMessage('If this address has a TrustX account, password reset instructions have been sent.'); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#060a13] px-4 py-8 text-slate-100 sm:px-6 lg:px-10">
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_430px]">
      <section className="max-w-xl">
        <div className="mb-7 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl border border-blue-300/20 bg-blue-400/10 text-blue-300"><ShieldCheck className="h-6 w-6" /></span><div><div className="text-xl font-semibold tracking-[-0.04em]">TrustX</div><p className="text-xs text-slate-500">Verifiable trust infrastructure</p></div></div>
        <p className="tx-kicker">Secure workspace access</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl">The right evidence, with the right people.</h1>
        <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400">Sign in to review only the programs, reports, and verification evidence your TrustX account is authorized to access.</p>
        <p className="mt-8 border-l border-blue-300/35 pl-4 text-xs leading-6 text-slate-500">Cryptographic provenance records when evidence was submitted. Technical verification determines whether a finding is valid.</p>
      </section>
      <section aria-labelledby="signin-heading" className="border border-slate-700/60 bg-[#0b1220] p-6 shadow-2xl shadow-black/20 sm:p-8">
        <div className="flex items-start gap-3"><span className="mt-0.5 text-blue-300"><KeyRound className="h-5 w-5" /></span><div><p className="tx-kicker">TrustX account</p><h2 id="signin-heading" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Sign in</h2></div></div>
        <div className="mt-7 grid grid-cols-2 gap-2" role="group" aria-label="Workspace type">{(Object.keys(labels) as AccountRole[]).map((candidate) => <button key={candidate} type="button" onClick={() => setRole(candidate)} aria-pressed={role === candidate} className={`border px-3 py-3 text-left text-xs ${role === candidate ? 'border-blue-300/50 bg-blue-400/10 text-blue-100' : 'border-slate-700/70 text-slate-400 hover:border-slate-500'}`}><span className="block font-semibold">{labels[candidate].name}</span><span className="mt-1 block text-[10px] leading-4 text-slate-500">{labels[candidate].detail}</span></button>)}</div>
        <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
          <label className="block text-xs font-medium text-slate-300">Email<input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" type="email" className="mt-2 w-full border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-300" /></label>
          <label className="block text-xs font-medium text-slate-300">Password<span className="relative mt-2 block"><input value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" type={showPassword ? 'text' : 'password'} className="w-full border border-slate-700 bg-slate-950 px-3 py-2.5 pr-11 text-sm text-white outline-none focus:border-blue-300" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-white">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
          {(error || configurationError) && <p role="alert" className="border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{error || configurationError}</p>}
          {message && <p role="status" className="border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">{message}</p>}
          <button disabled={busy || !!configurationError} className="flex w-full items-center justify-center gap-2 bg-blue-300 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? 'Signing in…' : `Sign in as ${labels[role].name}`}</button>
          <button type="button" disabled={busy || !!configurationError} onClick={requestReset} className="w-full text-center text-xs font-semibold text-blue-300 hover:text-blue-200 disabled:opacity-50">Forgot password?</button>
        </form>
        <p className="mt-6 border-t border-slate-800 pt-4 text-[11px] leading-5 text-slate-500">Accounts are provisioned by TrustX. Contact your organization administrator if you need access.</p>
      </section>
    </div>
  </main>;
}
