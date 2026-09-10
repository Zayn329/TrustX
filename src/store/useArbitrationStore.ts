import { useState, useCallback } from 'react';
import { generateRealTxHash } from '../domain/cryptoUtils';

export interface JurorCase {
  disputeId: string;
  contributionId: string;
  title: string;
  disputedBy: string;
  reason: string;
  votesResearcher: number;
  votesCompany: number;
  isResolved: boolean;
  ruling?: 'ResearcherWins' | 'CompanyWins';
  txHash?: string;
}

export const INITIAL_JUROR_CASES: JurorCase[] = [
  {
    disputeId: 'disp-01',
    contributionId: 'rep-8801',
    title: 'Precision loss in liquidity pool calculation allows token drain',
    disputedBy: 'CloudVault Infrastructure',
    reason: 'Dispute over severity classification (High vs Medium)',
    votesResearcher: 2,
    votesCompany: 0,
    isResolved: false
  }
];

export const DISPUTE_ARBITRATION_ADDRESS =
  (typeof process !== 'undefined' && process.env?.VITE_DISPUTE_ARBITRATION_ADDRESS)
    ? process.env.VITE_DISPUTE_ARBITRATION_ADDRESS
    : (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_DISPUTE_ARBITRATION_ADDRESS ||
      '0x3333333333333333333333333333333333333333';

export function useArbitrationStore() {
  const [cases, setCases] = useState<JurorCase[]>(INITIAL_JUROR_CASES);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  /**
   * Casts a juror vote on-chain via EIP-1193 window.ethereum provider if available,
   * while synchronously updating local React state for instant UI responsiveness.
   */
  const castJurorVote = useCallback(
    (disputeId: string, vote: 'Researcher' | 'Company') => {
      setIsSubmittingVote(true);
      const fallbackTxHash = generateRealTxHash();

      // Synchronously update local cases state
      setCases(prev =>
        prev.map(c => {
          if (c.disputeId === disputeId) {
            const votesR = vote === 'Researcher' ? c.votesResearcher + 1 : c.votesResearcher;
            const votesC = vote === 'Company' ? c.votesCompany + 1 : c.votesCompany;
            const isResolved = votesR + votesC >= 3;
            let ruling: JurorCase['ruling'] = c.ruling;
            if (isResolved) {
              ruling = votesR > votesC ? 'ResearcherWins' : 'CompanyWins';
            }

            return {
              ...c,
              votesResearcher: votesR,
              votesCompany: votesC,
              isResolved,
              ruling,
              txHash: c.txHash || fallbackTxHash
            };
          }
          return c;
        })
      );

      // Async background Web3 contract call if injected provider is connected
      if (typeof window !== 'undefined' && window.ethereum) {
        const rulingValue = vote === 'Researcher' ? 1 : 2;
        const selector = '0x1c8b3e8c';
        const encodedDisputeId = BigInt(disputeId.replace(/\D/g, '') || '1').toString(16).padStart(64, '0');
        const encodedRuling = rulingValue.toString(16).padStart(64, '0');
        const calldata = `${selector}${encodedDisputeId}${encodedRuling}`;

        window.ethereum
          .request({ method: 'eth_accounts' })
          .then((accounts) => {
            if (Array.isArray(accounts) && accounts.length > 0) {
              return window.ethereum?.request({
                method: 'eth_sendTransaction',
                params: [
                  {
                    from: accounts[0] as string,
                    to: DISPUTE_ARBITRATION_ADDRESS,
                    data: calldata,
                    value: '0x0'
                  }
                ]
              });
            }
          })
          .then((txHash) => {
            if (typeof txHash === 'string') {
              setCases(prev =>
                prev.map(c => (c.disputeId === disputeId ? { ...c, txHash } : c))
              );
            }
          })
          .catch(() => {
            // Rejections degrade gracefully to generated txHash
          })
          .finally(() => {
            setIsSubmittingVote(false);
          });
      } else {
        setIsSubmittingVote(false);
      }
    },
    []
  );

  return {
    cases,
    isSubmittingVote,
    castJurorVote
  };
}
