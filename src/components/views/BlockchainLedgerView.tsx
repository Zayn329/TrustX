import React from 'react';
import { useTrustStore } from '../../store/useTrustStore';
import { Blocks } from 'lucide-react';

export const BlockchainLedgerView: React.FC<{ setActiveTab: (tab: string) => void }> = () => {
  const { state } = useTrustStore();
  const { blockchainEvents } = state;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Blockchain Activity Explorer</h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable audit trail of all anchored cryptographic proofs, verification records, and escrow payouts.
          </p>
        </div>
        <span className="text-xs font-mono bg-trust-500/10 text-trust-400 border border-trust-500/20 px-3 py-1.5 rounded-xl">
          [Simulated Web3 Environment]
        </span>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-dark-700 pb-3">
          <Blocks className="w-5 h-5 text-trust-500" />
          <h2 className="text-base font-bold text-white">Transaction Block Ledger Stream</h2>
        </div>

        <div className="space-y-3">
          {blockchainEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-dark-900/80 border border-dark-600 hover:border-trust-500/40 rounded-xl p-4 transition space-y-2 text-xs font-mono"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-trust-500/10 text-trust-400 border border-trust-500/20">
                    {evt.eventType}
                  </span>
                  <span className="text-slate-400 text-[11px]">Block #{evt.blockNumber}</span>
                </div>
                <span className="text-slate-500 text-[10px] font-sans">
                  {new Date(evt.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="font-sans text-slate-200 text-xs">{evt.details}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-400 border-t border-dark-700/60 pt-2">
                <div className="truncate">
                  <span className="text-slate-500">Actor: </span>
                  <span className="text-slate-300">{evt.actorName} ({evt.actorDid.slice(0, 10)}...)</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-500">Tx Hash: </span>
                  <span className="text-trust-400">{evt.txHash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
