import React from 'react';
import { useTrustStore } from '../../store/useTrustStore';
import { UserCheck, ShieldCheck, Globe } from 'lucide-react';

export const IdentityProfileView: React.FC<{ setActiveTab: (tab: string) => void }> = () => {
  const { state, trustScoreBreakdown } = useTrustStore();
  const { currentIdentity, reports } = state;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Decentralized Identity Profile & Portable Reputation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Self-sovereign trust passport (`did:trust:...`). Portable reputation belongs to the researcher, not locked to a vendor.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Researcher DID Card (5 cols) */}
        <div className="lg:col-span-5 bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-6">
          <div className="flex items-start space-x-4">
            <img
              src={currentIdentity.avatarUrl}
              alt={currentIdentity.displayName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-trust-500 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">{currentIdentity.displayName}</h2>
                <ShieldCheck className="w-5 h-5 text-trust-500" />
              </div>
              <p className="text-xs text-trust-400 font-mono">@{currentIdentity.handle}</p>
              <span className="inline-block mt-2 text-[10px] uppercase font-bold bg-trust-500/10 text-trust-400 border border-trust-500/20 px-2 py-0.5 rounded-full">
                Verified Security Researcher
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs border-t border-dark-700 pt-4 font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-sans">Decentralized Identifier (DID)</span>
              <span className="text-slate-200 break-all">{currentIdentity.did}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-sans">Public Verification Key</span>
              <span className="text-slate-400 break-all">{currentIdentity.publicKey}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Verified Platform Credentials</h3>
            <div className="space-y-2">
              {currentIdentity.verifiedPlatforms.map((plat, idx) => (
                <div
                  key={idx}
                  className="bg-dark-700/50 border border-dark-600 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-trust-500" />
                    <div>
                      <p className="font-bold text-white">{plat.platformName}</p>
                      <p className="text-[10px] text-slate-400">@{plat.externalUsername}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">✓ Verified</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Portable Reputation Demonstration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-dark-700 pb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-trust-500" />
                <h2 className="text-base font-bold text-white">Portable Trust Passport</h2>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                Score: {trustScoreBreakdown.overallScore} / 1000
              </span>
            </div>

            {/* Portability Architecture Diagram */}
            <div className="bg-dark-900/80 border border-dark-600 rounded-2xl p-5 space-y-4">
              <p className="text-xs text-slate-300">
                <strong>Reputation Portability Principle:</strong> Because disclosures and verification records are signed and anchored on-chain, reputation can be imported natively into any compatible platform without locked-in vendor databases.
              </p>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-dark-800 border border-dark-600 rounded-xl">
                  <p className="font-bold text-white">Platform A</p>
                  <p className="text-[10px] text-slate-400 mt-1">Bug Bounty Net</p>
                </div>

                <div className="p-3 bg-trust-600/10 border border-trust-500/40 rounded-xl flex flex-col justify-center items-center">
                  <span className="text-[10px] font-bold text-trust-400 uppercase">Trust Engine</span>
                  <span className="text-xs font-bold text-white mt-0.5">Portable Passport</span>
                </div>

                <div className="p-3 bg-dark-800 border border-dark-600 rounded-xl">
                  <p className="font-bold text-white">Platform B</p>
                  <p className="text-[10px] text-slate-400 mt-1">OpenSource Org</p>
                </div>
              </div>
            </div>

            {/* Verifiable Credentials List */}
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-3">On-Chain Verifiable Claims</h3>
              <div className="space-y-3 text-xs">
                {reports.map((r) => (
                  <div key={r.id} className="bg-dark-700/40 border border-dark-600 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{r.title}</span>
                      <span className="text-[10px] font-mono text-emerald-400">CLAIM_VERIFIED</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      Proof Hash: {r.proof.evidenceHash}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
