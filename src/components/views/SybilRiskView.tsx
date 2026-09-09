import React from 'react';
import { useTrustStore } from '../../store/useTrustStore';
import { ShieldCheck, Activity } from 'lucide-react';

export const SybilRiskView: React.FC<{ setActiveTab?: (tab: string) => void }> = () => {
  const { state } = useTrustStore();
  const { sybilIndicator, currentIdentity } = state;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Sybil & Fraud Risk Matrix</h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic risk detection analyzing duplicate account heuristics, submission velocity, and identity age.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Assessment Card (5 cols) */}
        <div className="lg:col-span-5 bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-trust-500" />
              <h2 className="text-base font-bold text-white">Identity Risk Analysis</h2>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Risk Score: {sybilIndicator.riskScore} / 100
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-dark-700/40 border border-dark-600 rounded-xl p-3.5 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Researcher Subject</span>
              <p className="font-bold text-white">{currentIdentity.displayName} (@{currentIdentity.handle})</p>
              <p className="text-[10px] font-mono text-slate-400 truncate">{currentIdentity.did}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-700/40 border border-dark-600 p-3 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Duplicate ID Risk</span>
                <p className="text-sm font-black text-emerald-400 mt-1">{sybilIndicator.duplicateIdentityRisk}</p>
              </div>

              <div className="bg-dark-700/40 border border-dark-600 p-3 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Spam Velocity</span>
                <p className="text-sm font-black text-emerald-400 mt-1">{sybilIndicator.submissionSpamRisk}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Account Age Verification</h3>
              <div className="bg-dark-700/40 border border-dark-600 rounded-xl p-3 flex justify-between items-center">
                <span className="text-slate-300">Identity Active Duration:</span>
                <span className="font-mono font-bold text-white">{sybilIndicator.accountAgeDays} Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signals Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-trust-500" />
              <h2 className="text-base font-bold text-white">Heuristic Fraud Signals Matrix</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Deterministic Heuristics</span>
          </div>

          {sybilIndicator.flaggedSignals.length > 0 ? (
            <div className="space-y-3">
              {sybilIndicator.flaggedSignals.map((signal, idx) => (
                <div key={idx} className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center space-x-3 text-xs text-amber-300">
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center text-xs space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-emerald-300">Clean Security Profile</p>
              <p className="text-slate-300">No sybil attack heuristics or submission spam signals detected for this DID identity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
