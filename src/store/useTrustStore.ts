import { useState, useEffect } from 'react';
import { Identity, Bounty, VulnerabilityReport, TechnicalVerification, BlockchainEvent, Dispute, SybilRiskIndicator, Severity } from '../types';
import {
  INITIAL_RESEARCHER,
  INITIAL_ORGANIZATION,
  INITIAL_BOUNTIES,
  INITIAL_REPORTS,
  INITIAL_VERIFICATIONS,
  INITIAL_BLOCKCHAIN_EVENTS,
  INITIAL_DISPUTE,
  INITIAL_SYBIL_INDICATOR,
} from './initialSeed';
import { generateHash, generateSignature } from '../domain/crypto';
import { calculateTrustScore } from '../domain/trustScore';
import { evaluateSybilRisk } from '../domain/sybil';

export interface TrustState {
  currentIdentity: Identity;
  organization: Identity;
  bounties: Bounty[];
  reports: VulnerabilityReport[];
  verifications: TechnicalVerification[];
  blockchainEvents: BlockchainEvent[];
  disputes: Dispute[];
  sybilIndicator: SybilRiskIndicator;
  selectedBountyId: string;
  selectedSubmissionId: string;
}

let globalState: TrustState = {
  currentIdentity: INITIAL_RESEARCHER,
  organization: INITIAL_ORGANIZATION,
  bounties: INITIAL_BOUNTIES,
  reports: INITIAL_REPORTS,
  verifications: INITIAL_VERIFICATIONS,
  blockchainEvents: INITIAL_BLOCKCHAIN_EVENTS,
  disputes: [INITIAL_DISPUTE],
  sybilIndicator: INITIAL_SYBIL_INDICATOR,
  selectedBountyId: INITIAL_BOUNTIES[0].id,
  selectedSubmissionId: INITIAL_REPORTS[0].id,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function useTrustStore() {
  const [state, setState] = useState<TrustState>(globalState);

  useEffect(() => {
    const listener = () => setState({ ...globalState });
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const trustScoreBreakdown = calculateTrustScore(
    globalState.reports,
    globalState.verifications,
    globalState.sybilIndicator
  );

  const setSelectedBountyId = (id: string) => {
    globalState.selectedBountyId = id;
    notify();
  };

  const setSelectedSubmissionId = (id: string) => {
    globalState.selectedSubmissionId = id;
    notify();
  };

  const submitVulnerabilityReport = (data: {
    bountyId: string;
    title: string;
    vulnerabilityType: string;
    severity: Severity;
    description: string;
    reproductionSteps: string;
    impact: string;
  }): VulnerabilityReport => {
    const bounty = globalState.bounties.find((b) => b.id === data.bountyId) || globalState.bounties[0];
    const reportId = `rep-${Date.now().toString().slice(-6)}`;
    const timestamp = Date.now();

    const contentHash = generateHash(`${data.title}:${data.description}:${data.vulnerabilityType}`);
    const evidenceHash = generateHash(`${data.reproductionSteps}:${data.impact}`);
    const signature = generateSignature(globalState.currentIdentity.did, contentHash);

    const blockNumber = (globalState.blockchainEvents[0]?.blockNumber || 1048312) + 1;
    const blockHash = generateHash(`Block-${blockNumber}-${timestamp}`);

    const newProof = {
      proofId: `proof-${reportId}`,
      submissionId: reportId,
      researcherDid: globalState.currentIdentity.did,
      evidenceHash,
      contentHash,
      signature,
      timestamp,
      blockHash,
      blockNumber,
      isCryptographicallyProven: true,
    };

    const newReport: VulnerabilityReport = {
      id: reportId,
      bountyId: bounty.id,
      bountyTitle: bounty.title,
      researcherDid: globalState.currentIdentity.did,
      researcherHandle: globalState.currentIdentity.handle,
      title: data.title,
      vulnerabilityType: data.vulnerabilityType,
      severity: data.severity,
      description: data.description,
      reproductionSteps: data.reproductionSteps,
      impact: data.impact,
      proof: newProof,
      status: 'PROVEN',
      createdAt: timestamp,
    };

    const proofEvent: BlockchainEvent = {
      id: `evt-${Date.now()}-1`,
      blockNumber,
      blockHash,
      eventType: 'PROOF_ANCHORED',
      timestamp,
      actorDid: globalState.currentIdentity.did,
      actorName: globalState.currentIdentity.displayName,
      txHash: generateHash(`Tx-Proof-${reportId}`),
      details: `Cryptographic Proof-of-Discovery anchored for "${data.title}".`,
      payload: { submissionId: reportId, evidenceHash, contentHash },
    };

    globalState.reports = [newReport, ...globalState.reports];
    globalState.blockchainEvents = [proofEvent, ...globalState.blockchainEvents];
    globalState.selectedSubmissionId = reportId;
    globalState.sybilIndicator = evaluateSybilRisk(
      globalState.currentIdentity.did,
      globalState.reports,
      globalState.currentIdentity.joinedTimestamp
    );

    notify();
    return newReport;
  };

  const verifySubmission = (
    submissionId: string,
    status: 'VERIFIED_VALID' | 'VERIFIED_INVALID',
    notes: string
  ) => {
    const report = globalState.reports.find((r) => r.id === submissionId);
    if (!report) return;

    const bounty = globalState.bounties.find((b) => b.id === report.bountyId);
    const timestamp = Date.now();
    const blockNumber = (globalState.blockchainEvents[0]?.blockNumber || 1048312) + 1;
    const blockHash = generateHash(`Block-Verify-${blockNumber}`);

    let payoutAmount = 0;
    if (status === 'VERIFIED_VALID' && bounty) {
      const rewards = bounty.severityRewards;
      payoutAmount = rewards[report.severity.toLowerCase() as keyof typeof rewards] || 1500;
    }

    const verificationTxHash = generateHash(`Tx-Verify-${submissionId}`);

    const newVerification: TechnicalVerification = {
      id: `ver-${Date.now().toString().slice(-6)}`,
      submissionId,
      verifierDid: globalState.organization.did,
      verifierName: globalState.organization.displayName,
      status: status === 'VERIFIED_VALID' ? 'VERIFIED_VALID' : 'VERIFIED_INVALID',
      assessedSeverity: report.severity,
      payoutAmount,
      verificationNotes: notes,
      verifiedAt: timestamp,
      txHash: verificationTxHash,
    };

    report.status = status === 'VERIFIED_VALID' ? 'REWARD_RELEASED' : 'VERIFIED_INVALID';

    const verifyEvent: BlockchainEvent = {
      id: `evt-${Date.now()}-v`,
      blockNumber,
      blockHash,
      eventType: 'VERIFICATION_RECORDED',
      timestamp,
      actorDid: globalState.organization.did,
      actorName: globalState.organization.displayName,
      txHash: verificationTxHash,
      details: `Technical Verification completed: ${status === 'VERIFIED_VALID' ? 'VALID' : 'REJECTED'}.`,
      payload: { submissionId, status, payoutAmount },
    };

    const newEvents: BlockchainEvent[] = [verifyEvent];

    if (status === 'VERIFIED_VALID' && payoutAmount > 0) {
      const payoutEvent: BlockchainEvent = {
        id: `evt-${Date.now()}-p`,
        blockNumber: blockNumber + 1,
        blockHash: generateHash(`Block-Payout-${blockNumber + 1}`),
        eventType: 'ESCROW_RELEASED',
        timestamp: timestamp + 1000,
        actorDid: '0x0000000000000000000000000000000000000000',
        actorName: 'SMART CONTRACT ESCROW ENGINE',
        txHash: generateHash(`Tx-Payout-${submissionId}`),
        details: `Smart Contract Escrow released $${payoutAmount.toLocaleString()} USD to researcher ${globalState.currentIdentity.displayName}.`,
        payload: { recipient: report.researcherDid, amount: payoutAmount },
      };
      newEvents.unshift(payoutEvent);
    }

    globalState.verifications = [newVerification, ...globalState.verifications];
    globalState.blockchainEvents = [...newEvents, ...globalState.blockchainEvents];
    globalState.sybilIndicator = evaluateSybilRisk(
      globalState.currentIdentity.did,
      globalState.reports,
      globalState.currentIdentity.joinedTimestamp
    );

    notify();
  };

  const simulateFullDemoFlow = () => {
    const demoBounty = globalState.bounties[0];
    const newReport = submitVulnerabilityReport({
      bountyId: demoBounty.id,
      title: 'Automated PoC: Unchecked Transfer Callback Vulnerability',
      vulnerabilityType: 'Smart Contract / Logic Bug',
      severity: 'HIGH',
      description: 'Simulated vulnerability submitted via instant Trust Lifecycle trigger to demonstrate real-time end-to-end verification and reward release.',
      reproductionSteps: '1. Deposit test tokens.\n2. Execute reentrant contract call.\n3. Verify escrow release on-chain.',
      impact: 'Demonstrates automated proof generation, block anchoring, technical verification, and smart contract escrow payout.',
    });

    setTimeout(() => {
      verifySubmission(
        newReport.id,
        'VERIFIED_VALID',
        'Automated Trust Engine test run verified successfully. Severity confirmed HIGH ($20,000 bounty released).'
      );
    }, 400);
  };

  return {
    state,
    trustScoreBreakdown,
    setSelectedBountyId,
    setSelectedSubmissionId,
    submitVulnerabilityReport,
    verifySubmission,
    simulateFullDemoFlow,
  };
}
