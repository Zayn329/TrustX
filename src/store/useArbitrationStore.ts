import { useState } from 'react';

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

export function useArbitrationStore() {
  const [cases, setCases] = useState<JurorCase[]>(INITIAL_JUROR_CASES);

  const castJurorVote = (disputeId: string, vote: 'Researcher' | 'Company') => {
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
            ruling
          };
        }
        return c;
      })
    );
  };

  return {
    cases,
    castJurorVote
  };
}
