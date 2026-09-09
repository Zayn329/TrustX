import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Identity,
  Bounty,
  VulnerabilityReport,
  Proof,
  Verification,
  ReputationEvent,
  Escrow,
  BlockchainEvent,
  Dispute,
  SybilRiskSignal
} from '../domain/types';
import {
  INITIAL_IDENTITIES,
  INITIAL_BOUNTIES,
  INITIAL_ESCROWS,
  INITIAL_REPORTS,
  INITIAL_PROOFS,
  INITIAL_VERIFICATIONS,
  INITIAL_REPUTATION_EVENTS,
  INITIAL_BLOCKCHAIN_EVENTS,
  INITIAL_DISPUTES,
  INITIAL_SYBIL_RISK
} from '../domain/mockData';
import { mockSha256, generateMockTxHash, generateMockSignature } from '../domain/cryptoUtils';

interface NewSubmissionPayload {
  bountyId: string;
  researcherId: string;
  title: string;
  vulnerabilityType: string;
  severity: VulnerabilityReport['severity'];
  description: string;
  reproductionSteps: string;
  impact: string;
  evidence: string;
}

interface TrustContextType {
  identities: Identity[];
  bounties: Bounty[];
  reports: VulnerabilityReport[];
  proofs: Proof[];
  verifications: Verification[];
  reputationEvents: ReputationEvent[];
  escrows: Escrow[];
  blockchainEvents: BlockchainEvent[];
  disputes: Dispute[];
  sybilRisks: SybilRiskSignal[];
  currentResearcher: Identity;
  submitVulnerability: (payload: NewSubmissionPayload) => Promise<void>;
  verifySubmission: (reportId: string, isApproved: boolean, notes: string) => Promise<void>;
  raiseDispute: (reportId: string, reason: string, evidence: string) => Promise<void>;
}

const TrustContext = createContext<TrustContextType | undefined>(undefined);

export const TrustProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [identities, setIdentities] = useState<Identity[]>(INITIAL_IDENTITIES);
  const [bounties] = useState<Bounty[]>(INITIAL_BOUNTIES);
  const [reports, setReports] = useState<VulnerabilityReport[]>(INITIAL_REPORTS);
  const [proofs, setProofs] = useState<Proof[]>(INITIAL_PROOFS);
  const [verifications, setVerifications] = useState<Verification[]>(INITIAL_VERIFICATIONS);
  const [reputationEvents, setReputationEvents] = useState<ReputationEvent[]>(INITIAL_REPUTATION_EVENTS);
  const [escrows, setEscrows] = useState<Escrow[]>(INITIAL_ESCROWS);
  const [blockchainEvents, setBlockchainEvents] = useState<BlockchainEvent[]>(INITIAL_BLOCKCHAIN_EVENTS);
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);
  const [sybilRisks] = useState<SybilRiskSignal[]>(INITIAL_SYBIL_RISK);

  const currentResearcher = identities[0];

  const submitVulnerability = async (payload: NewSubmissionPayload) => {
    const reportId = `rep-${Date.now().toString().slice(-4)}`;
    const proofId = `proof-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();

    const newReport: VulnerabilityReport = {
      id: reportId,
      ...payload,
      createdAt: nowIso
    };

    const rawContentToHash = `${payload.title}|${payload.description}|${payload.reproductionSteps}|${payload.evidence}|${nowIso}`;
    const contentHash = await mockSha256(rawContentToHash);
    const signature = generateMockSignature(payload.researcherId, contentHash);

    const newProof: Proof = {
      id: proofId,
      contributionId: reportId,
      contentHash,
      signature,
      timestamp: nowIso,
      proofStatus: 'anchored_on_chain'
    };

    const verificationId = `ver-${Date.now().toString().slice(-4)}`;
    const targetBounty = bounties.find(b => b.id === payload.bountyId);
    const newVerification: Verification = {
      id: verificationId,
      contributionId: reportId,
      verifierId: targetBounty?.organizationId || 'did:trust:verifier_org',
      verifierName: targetBounty?.organizationName || 'Bounty Reviewer',
      status: 'pending',
      notes: 'Submitted report awaiting technical verification.'
    };

    const txHashSub = generateMockTxHash();
    const txHashProof = generateMockTxHash();
    const lastBlock = blockchainEvents[0]?.blockNumber || 18420101;

    const eventSub: BlockchainEvent = {
      id: `blk-${Date.now()}-1`,
      eventType: 'SubmissionRegistered',
      txHash: txHashSub,
      blockNumber: lastBlock + 1,
      timestamp: nowIso,
      actor: payload.researcherId,
      status: 'confirmed',
      details: `Registered vulnerability report "${payload.title}"`
    };

    const eventProof: BlockchainEvent = {
      id: `blk-${Date.now()}-2`,
      eventType: 'ProofAnchored',
      txHash: txHashProof,
      blockNumber: lastBlock + 2,
      timestamp: nowIso,
      actor: payload.researcherId,
      status: 'confirmed',
      details: `Proof hash ${contentHash.slice(0, 12)}... anchored`
    };

    setReports(prev => [newReport, ...prev]);
    setProofs(prev => [newProof, ...prev]);
    setVerifications(prev => [newVerification, ...prev]);
    setBlockchainEvents(prev => [eventProof, eventSub, ...prev]);
  };

  const verifySubmission = async (reportId: string, isApproved: boolean, notes: string) => {
    const nowIso = new Date().toISOString();
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    setVerifications(prev =>
      prev.map(v =>
        v.contributionId === reportId
          ? {
              ...v,
              status: isApproved ? 'valid' : 'invalid',
              notes,
              verifiedAt: nowIso
            }
          : v
      )
    );

    if (isApproved) {
      const bounty = bounties.find(b => b.id === report.bountyId);
      if (bounty) {
        setEscrows(prev =>
          prev.map(e =>
            e.id === bounty.escrowId
              ? { ...e, status: 'released', researcherAddress: report.researcherId }
              : e
          )
        );
      }

      const txHashRep = generateMockTxHash();
      setIdentities(prev =>
        prev.map(id => {
          if (id.id === report.researcherId) {
            const rewardAmt = bounty ? bounty.rewardAmount : 5000;
            return {
              ...id,
              trustScore: Math.min(100, id.trustScore + 3),
              verifiedContributionsCount: id.verifiedContributionsCount + 1,
              successfulBountiesCount: id.successfulBountiesCount + 1,
              totalRewardsEarned: id.totalRewardsEarned + rewardAmt
            };
          }
          return id;
        })
      );

      const newRepEvent: ReputationEvent = {
        id: `repevt-${Date.now()}`,
        researcherId: report.researcherId,
        delta: 3,
        reason: `Verified ${report.severity} vulnerability report (${report.title})`,
        timestamp: nowIso,
        txHash: txHashRep
      };
      setReputationEvents(prev => [newRepEvent, ...prev]);

      const txHashVer = generateMockTxHash();
      const lastBlock = blockchainEvents[0]?.blockNumber || 18420101;
      const blkEvent: BlockchainEvent = {
        id: `blk-${Date.now()}`,
        eventType: 'VerificationRecorded',
        txHash: txHashVer,
        blockNumber: lastBlock + 1,
        timestamp: nowIso,
        actor: report.researcherId,
        status: 'confirmed',
        details: `Technical verification confirmed VALID for report ${reportId}`
      };
      setBlockchainEvents(prev => [blkEvent, ...prev]);
    }
  };

  const raiseDispute = async (reportId: string, reason: string, evidence: string) => {
    const nowIso = new Date().toISOString();
    const disputeId = `disp-${Date.now().toString().slice(-4)}`;

    const newDispute: Dispute = {
      id: disputeId,
      contributionId: reportId,
      disputedBy: currentResearcher.handle,
      reason,
      evidence,
      status: 'under_review',
      createdAt: nowIso
    };

    setDisputes(prev => [newDispute, ...prev]);

    setVerifications(prev =>
      prev.map(v => (v.contributionId === reportId ? { ...v, status: 'disputed' } : v))
    );

    const txHashDisp = generateMockTxHash();
    const lastBlock = blockchainEvents[0]?.blockNumber || 18420101;
    const blkEvent: BlockchainEvent = {
      id: `blk-${Date.now()}`,
      eventType: 'DisputeRaised',
      txHash: txHashDisp,
      blockNumber: lastBlock + 1,
      timestamp: nowIso,
      actor: currentResearcher.id,
      status: 'confirmed',
      details: `Dispute raised for submission ${reportId}: ${reason}`
    };
    setBlockchainEvents(prev => [blkEvent, ...prev]);
  };

  return (
    <TrustContext.Provider
      value={{
        identities,
        bounties,
        reports,
        proofs,
        verifications,
        reputationEvents,
        escrows,
        blockchainEvents,
        disputes,
        sybilRisks,
        currentResearcher,
        submitVulnerability,
        verifySubmission,
        raiseDispute
      }}
    >
      {children}
    </TrustContext.Provider>
  );
};

export const useTrust = () => {
  const context = useContext(TrustContext);
  if (!context) {
    throw new Error('useTrust must be used within a TrustProvider');
  }
  return context;
};
