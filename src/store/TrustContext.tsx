import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
import { getBounties, createBounty, updateBounty, getReports, createReport } from '../services/firestoreService';
import { usdcToEth, generateOnChainIdFromFirestoreId, getDemoUsdcPerEth } from '../services/conversionService';
import { useEscrowContract } from '../blockchain/useEscrowContract';
import { runSandboxEvaluation } from '../../oracle/sandboxRunner';
import { sha256 } from '../domain/cryptoUtils';
import { useArbitrationStore } from './useArbitrationStore';

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
  createdAt: string;
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
  // UI state for modals
  createBountyModalOpen: boolean;
  createBountyForm: Omit<Bounty, 'id'>;
  createBountyLoading: boolean;
  createBountyError: string | null;
  // Escrow funding state
  fundEscrowLoading: boolean;
  fundEscrowError: string | null;
  // Functions
  submitVulnerability: (payload: NewSubmissionPayload) => Promise<void>;
  verifySubmission: (reportId: string, isApproved: boolean, notes: string) => Promise<void>;
  raiseDispute: (reportId: string, reason: string, evidence: string) => Promise<void>;
  releaseEscrow: (bountyId: string, researcherAddress: string) => Promise<void>;
  openCreateBountyModal: () => void;
  closeCreateBountyModal: () => void;
  handleCreateBounty: (formData: Omit<Bounty, 'id'>) => Promise<void>;
  fundEscrow: (bountyId: string) => Promise<void>;
}

const TrustContext = createContext<TrustContextType | undefined>(undefined);

export const TrustProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [identities, setIdentities] = useState<Identity[]>(INITIAL_IDENTITIES);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [reports, setReports] = useState<VulnerabilityReport[]>(INITIAL_REPORTS);
  const [proofs, setProofs] = useState<Proof[]>(INITIAL_PROOFS);
  const [verifications, setVerifications] = useState<Verification[]>(INITIAL_VERIFICATIONS);
  const [reputationEvents, setReputationEvents] = useState<ReputationEvent[]>(INITIAL_REPUTATION_EVENTS);
  const [escrows, setEscrows] = useState<Escrow[]>(INITIAL_ESCROWS);
  const [blockchainEvents, setBlockchainEvents] = useState<BlockchainEvent[]>(INITIAL_BLOCKCHAIN_EVENTS);
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);
  const [sybilRisks] = useState<SybilRiskSignal[]>(INITIAL_SYBIL_RISK);
  // Create bounty modal state
  const [createBountyModalOpen, setCreateBountyModalOpen] = useState(false);
  const [createBountyForm, setCreateBountyForm] = useState<Omit<Bounty, 'id'>>({
    title: '',
    organizationId: '',
    organizationName: '',
    organizationTrustScore: 50,
    severity: 'Low' as const,
    rewardAmount: 0,
    rewardCurrency: 'USDC',
    scope: [],
    rules: [],
    deadline: '',
    verificationRequirements: [],
    status: 'active' as const,
    escrowId: '',
    escrowStatus: '',
    fundingTxHash: '',
    escrowAmountEth: 0,
    escrowDemoRate: 0,
    description: ''
  });
  const [createBountyLoading, setCreateBountyLoading] = useState(false);
  const [createBountyError, setCreateBountyError] = useState<string | null>(null);
  // Escrow funding state
  const [fundEscrowLoading, setFundEscrowLoading] = useState(false);
  const [fundEscrowError, setFundEscrowError] = useState<string | null>(null);

  // Wallet and blockchain functions - moved to component level to avoid Hook violations
  const {
    wallet,
    isWalletOnConfiguredChain,
    getWalletAddress,
    createEscrowOnChain,
    raiseDisputeOnChain,
    releaseEscrowOnChain,
    updateReputationOnChain,
    signTypedDataProof,
    anchorProofOnChain
  } = useEscrowContract();
  const { createArbitrationCase } = useArbitrationStore();

  const currentResearcher = identities[0];

  // Load bounties from Firestore on mount
  useEffect(() => {
    const loadBounties = async () => {
      try {
        const fetchedBounties = await getBounties();
        console.log('[TrustContext] Loaded bounties from Firestore:', fetchedBounties.length);
        console.log('[TrustContext] Loaded bounty IDs:', fetchedBounties.map(b => b.id));
        setBounties(fetchedBounties);
      } catch (err) {
        console.error('[TrustContext] Failed to load bounties from Firestore, falling back to mock data:', err);
        // Fallback to mock data
        setBounties(INITIAL_BOUNTIES);
      }
    };

    // Load reports from Firestore on mount
    const loadReports = async () => {
      try {
        const fetchedReports = await getReports();
        console.log('[TrustContext] Loaded reports from Firestore:', fetchedReports.length);
        console.log('[TrustContext] Loaded report IDs:', fetchedReports.map(r => r.id));
        setReports(fetchedReports);
      } catch (err) {
        console.error('[TrustContext] Failed to load reports from Firestore, falling back to mock data:', err);
        // Fallback to mock data
        setReports(INITIAL_REPORTS);
      }
    };

    loadBounties();
    loadReports();
  }, []);

  /**
   * Registers a vulnerability submission via Firestore persistence.
   * Blockchain anchoring for proofs and other verification steps remain in their respective functions.
   */
  const submitVulnerability = async (payload: NewSubmissionPayload) => {
    // Validate payload
    if (!payload.bountyId || !payload.researcherId || !payload.title.trim()) {
      throw new Error('Invalid submission payload');
    }

    // Create report object with auto-generated ID to be replaced by Firestore
    const nowIso = new Date().toISOString();
    const newReport: Omit<VulnerabilityReport, 'id'> = {
      bountyId: payload.bountyId,
      researcherId: payload.researcherId,
      title: payload.title,
      vulnerabilityType: payload.vulnerabilityType,
      severity: payload.severity,
      description: payload.description,
      reproductionSteps: payload.reproductionSteps,
      impact: payload.impact,
      evidence: payload.evidence,
      createdAt: nowIso
    };

    try {
      // Save report to Firestore and get the real document ID
      const reportId = await createReport(newReport);

      // Create the complete report with the real Firestore ID
      const reportWithId: VulnerabilityReport = {
        id: reportId,
        ...newReport
      };

      const proofHash = await sha256(JSON.stringify(newReport));
      const proofNonce = Date.now();
      const signature = await signTypedDataProof({
        researcherDid: payload.researcherId,
        bountyId: generateOnChainIdFromFirestoreId(payload.bountyId),
        proofHash,
        nonce: proofNonce
      });
      const anchor = await anchorProofOnChain(
        generateOnChainIdFromFirestoreId(payload.bountyId),
        proofHash,
        payload.researcherId,
        signature,
        proofNonce
      );

      setReports(prev => [reportWithId, ...prev]);
      setProofs(prev => [{
        id: `proof-${reportId}`,
        contributionId: reportId,
        contentHash: proofHash,
        signature,
        timestamp: nowIso,
        proofStatus: 'anchored_on_chain',
        source: 'receipt'
      }, ...prev]);
      setBlockchainEvents(prev => [{
        id: `${anchor.txHash}:0`,
        eventType: 'ProofAnchored',
        txHash: anchor.txHash,
        blockNumber: Number(anchor.blockNumber),
        timestamp: nowIso,
        actor: anchor.signer,
        status: 'confirmed',
        source: 'receipt',
        details: `Proof ${anchor.proofHash} anchored for bounty ${anchor.bountyId}.`
      }, ...prev]);

    } catch (err) {
      console.error('[submitVulnerability] Failed to create report in Firestore:', err);
      throw err;
    }
  };

  /**
   * Verifies submission on-chain, updating portable reputation and releasing escrow funds.
   */
  const verifySubmission = async (reportId: string, isApproved: boolean, notes: string) => {
    const nowIso = new Date().toISOString();
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const reportProof = proofs.find((proof) => proof.contributionId === report.id);
    const technicalResult = await runSandboxEvaluation({
      reportId: report.id,
      reproductionSteps: report.reproductionSteps,
      evidenceHash: reportProof?.contentHash
    });
    if (technicalResult.status === 'unavailable') {
      throw new Error('Technical verifier is unavailable; submission remains unverified');
    }
    const technicallyApproved = technicalResult.status === 'passed';
    if (technicallyApproved !== isApproved) {
      throw new Error(`Verifier result is ${technicalResult.status}; manual decision does not match technical evidence`);
    }

    let reputationResult: Awaited<ReturnType<typeof updateReputationOnChain>> | null = null;
    if (isApproved) {
      reputationResult = await updateReputationOnChain(report.researcherId, 3);
    }

    setVerifications(prev =>
      prev.map(v =>
        v.contributionId === reportId
          ? {
              ...v,
              status: isApproved ? 'valid' : 'invalid',
              notes,
              verifiedAt: nowIso,
              oracleExecutionId: technicalResult.executionId,
              oracleRequestHash: technicalResult.requestHash,
              oracleEvidenceHash: technicalResult.evidenceHash,
              oracleVerifierVersion: technicalResult.verifierVersion,
              oracleStatus: technicalResult.status
            }
          : v
      )
    );

    if (isApproved) {
      const bounty = bounties.find(b => b.id === report.bountyId);
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

      // Verification is an application-level decision. The current escrow contract
      // does not authorize release from this result; payout must be an explicit,
      // receipt-confirmed company transaction through the escrow hook.
      if (reputationResult) {
        setReputationEvents(prev => [{
          id: `${reputationResult!.txHash}:0`,
          researcherId: report.researcherId,
          delta: Number(reputationResult!.increment),
          reason: `Technical verification approved for ${report.id}`,
          timestamp: nowIso,
          txHash: reputationResult!.txHash,
          source: 'receipt'
        }, ...prev]);
        setBlockchainEvents(prev => [{
          id: `${reputationResult!.txHash}:0`,
          eventType: 'ReputationUpdated',
          txHash: reputationResult!.txHash,
          blockNumber: Number(reputationResult!.blockNumber),
          timestamp: nowIso,
          actor: wallet.address || report.researcherId,
          status: 'confirmed',
          source: 'receipt',
          details: `Reputation updated for ${reputationResult!.did}; score ${reputationResult!.newScore}.`
        }, ...prev]);
      }
    }
  };

  /**
   * Raises a dispute on-chain or updates dispute registry state.
   */
  const raiseDispute = async (reportId: string, reason: string, evidence: string) => {
    const nowIso = new Date().toISOString();
    const disputeId = `disp-${Date.now().toString().slice(-4)}`;

    const report = reports.find(r => r.id === reportId);
    if (!report) throw new Error('Report not found');
    const bounty = bounties.find(b => b.id === report.bountyId);
    if (!bounty || !/^\d+$/.test(bounty.escrowId)) {
      throw new Error('A confirmed on-chain escrow ID is required before raising a dispute');
    }
    const chainResult = await raiseDisputeOnChain(bounty.escrowId);
    const arbitrationCase = await createArbitrationCase(
      bounty.escrowId,
      generateOnChainIdFromFirestoreId(reportId)
    );

    const newDispute: Dispute = {
      id: disputeId,
      contributionId: reportId,
      disputedBy: currentResearcher.handle,
      reason,
      evidence,
      status: 'open',
      createdAt: nowIso
    };

    setDisputes(prev => [newDispute, ...prev]);

    setVerifications(prev =>
      prev.map(v => (v.contributionId === reportId ? { ...v, status: 'disputed' } : v))
    );

    const blkEvent: BlockchainEvent = {
      id: `${chainResult.txHash}:0`,
      eventType: 'DisputeRaised',
      txHash: chainResult.txHash,
      blockNumber: Number(chainResult.blockNumber),
      timestamp: nowIso,
      actor: chainResult.disputedBy,
      status: 'confirmed',
      source: 'receipt',
      details: `Dispute raised for submission ${reportId}: ${reason}. Arbitration case confirmed in ${arbitrationCase.txHash}.`
    };
    setBlockchainEvents(prev => [blkEvent, ...prev]);
  };

  const releaseEscrow = async (bountyId: string, researcherAddress: string) => {
    const bounty = bounties.find((item) => item.id === bountyId);
    if (!bounty) throw new Error('Bounty not found');
    if (!/^\d+$/.test(bounty.escrowId)) {
      throw new Error('A confirmed on-chain escrow ID is required before release');
    }
    if (bounty.escrowStatus !== 'funded' && bounty.escrowStatus !== 'locked') {
      throw new Error('Escrow is not eligible for release');
    }

    const result = await releaseEscrowOnChain(bounty.escrowId, researcherAddress);
    const nowIso = new Date().toISOString();

    try {
      await updateBounty(bounty.id, {
        escrowStatus: 'released',
        escrowId: result.escrowId,
        fundingTxHash: bounty.fundingTxHash
      });
    } catch (error) {
      console.warn('Escrow release confirmed on-chain but projection sync failed:', error);
    }

    setBounties((prev) => prev.map((item) => item.id === bounty.id
      ? { ...item, escrowStatus: 'released', escrowId: result.escrowId }
      : item));
    setEscrows((prev) => prev.map((item) => item.id === result.escrowId
      ? { ...item, status: 'released', researcherAddress: result.researcher }
      : item));
    setBlockchainEvents((prev) => [{
      id: `${result.txHash}:0`,
      eventType: 'EscrowReleased',
      txHash: result.txHash,
      blockNumber: Number(result.blockNumber),
      timestamp: nowIso,
      actor: result.researcher,
      status: 'confirmed',
      source: 'receipt',
      details: `Escrow ${result.escrowId} released to ${result.researcher} for ${result.amount} wei.`
    }, ...prev]);
  };

  const openCreateBountyModal = () => {
    setCreateBountyModalOpen(true);
    // Reset form when opening
    setCreateBountyForm({
      title: '',
      organizationId: '',
      organizationName: '',
      organizationTrustScore: 50,
      severity: 'Low' as const,
      rewardAmount: 0,
      rewardCurrency: 'USD',
      scope: [],
      rules: [],
      deadline: '',
      verificationRequirements: [],
      status: 'active' as const,
      escrowId: '',
      escrowStatus: '',
      fundingTxHash: '',
      escrowAmountEth: 0,
      escrowDemoRate: 0,
      description: ''
    });
    setCreateBountyError(null);
  };

  const closeCreateBountyModal = () => {
    setCreateBountyModalOpen(false);
    // Reset form
    setCreateBountyForm({
      title: '',
      organizationId: '',
      organizationName: '',
      organizationTrustScore: 50,
      severity: 'Low' as const,
      rewardAmount: 0,
      rewardCurrency: 'USD',
      scope: [],
      rules: [],
      deadline: '',
      verificationRequirements: [],
      status: 'active' as const,
      escrowId: '',
      escrowStatus: '',
      fundingTxHash: '',
      escrowAmountEth: 0,
      escrowDemoRate: 0,
      description: ''
    });
    setCreateBountyError(null);
  };

  const handleCreateBounty = async (formData: Omit<Bounty, 'id'>) => {
    setCreateBountyLoading(true);
    setCreateBountyError(null);
    try {
      await createBounty(formData);
      // Refetch bounties to get the newly created one
      try {
        const freshBounties = await getBounties();
        setBounties(freshBounties);
      } catch (fetchErr) {
        // Error fetching bounties after creation, but we still created the bounty.
        // We can log the error and keep the current bounties.
        console.error('Failed to refetch bounties after creation:', fetchErr);
      }
      closeCreateBountyModal();
    } catch (err) {
      setCreateBountyError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreateBountyLoading(false);
    }
  };

  const fundEscrow = async (bountyId: string) => {
    const nowIso = new Date().toISOString();
    setFundEscrowLoading(true);
    setFundEscrowError(null);

    let result: {
      txHash: string;
      escrowId: string;
      bountyId: string;
      companyAddress: string;
      amount: string;
      blockNumber: string;
    } | null = null;
    try {
      // Get the bounty to validate
      const bounty = bounties.find(b => b.id === bountyId);
      if (!bounty) {
        throw new Error('Bounty not found');
      }

      // Debug logging for document ID verification
      console.log('[fundEscrow] Attempting to fund bounty with ID:', bounty.id);

      // Check if escrow already funded
      if (bounty.escrowId && bounty.escrowId.trim() !== '') {
        throw new Error('Escrow already funded for this bounty');
      }

      // Bounties are currently denominated in USDC-equivalent display values;
      // the deployed escrow contract receives native Sepolia ETH.
      if (bounty.rewardCurrency !== 'USDC') {
        throw new Error('Only USDC-equivalent display rewards are supported for ETH escrow funding in this demo');
      }

      // Validate reward amount
      if (bounty.rewardAmount <= 0) {
        throw new Error('Invalid reward amount');
      }

      // Validate wallet connection
      if (!wallet.isConnected) {
        throw new Error('Wallet not connected');
      }

      // Validate network
      if (!isWalletOnConfiguredChain()) {
        throw new Error(`Wallet is not on the configured Sepolia network. Please switch to Sepolia.`);
      }

      // Get wallet address
      const walletAddress = getWalletAddress();
      if (!walletAddress) {
        throw new Error('Invalid wallet address');
      }

      // Convert the display value to native Sepolia ETH using the demo rate.
      const ethAmount = parseFloat(usdcToEth(bounty.rewardAmount));
      if (ethAmount <= 0) {
        throw new Error('Invalid ETH amount after conversion');
      }

      // Generate deterministic on-chain ID from Firestore ID
      const onChainBountyId = generateOnChainIdFromFirestoreId(bounty.id);

      // Call the escrow contract
      result = await createEscrowOnChain(onChainBountyId, ethAmount);

      // Update the bounty in Firestore with escrow information
      const updatePayload = {
        escrowId: result!.escrowId,
        escrowStatus: 'funded' as const,
        fundingTxHash: result!.txHash,
        escrowAmountEth: parseFloat(usdcToEth(bounty.rewardAmount)), // Store as ETH amount
        escrowDemoRate: getDemoUsdcPerEth() // Store the demo rate used
      };

      console.log('[fundEscrow] Attempting Firestore update for bounty:', bounty.id, 'with payload:', updatePayload);
      try {
        await updateBounty(bounty.id, updatePayload);
      } catch (error) {
        console.warn('Escrow funding confirmed on-chain but projection sync failed:', error);
      }
      console.log('[fundEscrow] Firestore update completed for bounty:', bounty.id);

      // Update local state optimistically with all persisted values
      setBounties(prev =>
        prev.map(b =>
          b.id === bounty.id
            ? {
                ...b,
                escrowId: result!.escrowId,
                escrowStatus: 'funded',
                fundingTxHash: result!.txHash,
                escrowAmountEth: parseFloat(usdcToEth(bounty.rewardAmount)),
                escrowDemoRate: getDemoUsdcPerEth()
              }
            : b
        )
      );

      setEscrows(prev => {
        const nextEscrow: Escrow = {
          id: result!.escrowId,
          bountyId: bounty.id,
          amount: parseFloat(usdcToEth(bounty.rewardAmount)),
          currency: 'ETH',
          status: 'funded',
          companyAddress: walletAddress,
          escrowContractAddress: import.meta.env.VITE_TRUST_BOUNTY_ESCROW_ADDRESS,
        };
        const existing = prev.some((escrow) => escrow.id === nextEscrow.id || escrow.bountyId === bounty.id);
        return existing
          ? prev.map((escrow) => escrow.bountyId === bounty.id ? { ...escrow, ...nextEscrow } : escrow)
          : [nextEscrow, ...prev];
      });

      setBlockchainEvents(prev => [{
        id: `${result!.txHash}:0`,
        eventType: 'EscrowDeposited',
        txHash: result!.txHash,
        blockNumber: Number(result!.blockNumber),
        timestamp: nowIso,
        actor: result!.companyAddress,
        status: 'confirmed',
        source: 'receipt',
        details: `Escrow ${result!.escrowId} funded for bounty ${result!.bountyId} with ${result!.amount} wei.`
      }, ...prev]);

    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : String(err);
      if (result && result.txHash) {
        errorMessage += ` (Transaction hash: ${result.txHash})`;
      }
      console.error('[fundEscrow] Error updating bounty:', err);
      setFundEscrowError(errorMessage);
    } finally {
      setFundEscrowLoading(false);
    }
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
        raiseDispute,
        releaseEscrow,
        createBountyModalOpen,
        createBountyForm,
        createBountyLoading,
        createBountyError,
        openCreateBountyModal,
        closeCreateBountyModal,
        handleCreateBounty,
        fundEscrowLoading,
        fundEscrowError,
        fundEscrow
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
