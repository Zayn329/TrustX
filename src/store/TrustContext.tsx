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
import { sha256, generateRealTxHash, generateEcdsaSignature } from '../domain/cryptoUtils';
import { getBounties, createBounty, updateBounty } from '../services/firestoreService';
import { usdcToEth, generateOnChainIdFromFirestoreId, getDemoUsdcPerEth } from '../services/conversionService';
import { useEscrowContract } from '../blockchain/useEscrowContract';

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
  openCreateBountyModal: () => void;
  closeCreateBountyModal: () => void;
  handleCreateBounty: (formData: Omit<Bounty, 'id'>) => Promise<void>;
  fundEscrow: (bountyId: string) => Promise<void>;
}

const TrustContext = createContext<TrustContextType | undefined>(undefined);

const ESCROW_CONTRACT_ADDRESS =
  (typeof process !== 'undefined' && process.env?.VITE_TRUST_BOUNTY_ESCROW_ADDRESS)
    ? process.env.VITE_TRUST_BOUNTY_ESCROW_ADDRESS
    : (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_TRUST_BOUNTY_ESCROW_ADDRESS ||
      '0x1111111111111111111111111111111111111111';

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
  const { wallet, isWalletOnConfiguredChain, getWalletAddress, createEscrowOnChain } = useEscrowContract();

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

    loadBounties();
  }, []);

  /**
   * Registers a vulnerability submission on-chain or via EIP-1193 Web3 provider when available,
   * while updating local application state for real-time UI synchronization.
   */
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
    const contentHash = await sha256(rawContentToHash);
    const signature = generateEcdsaSignature(payload.researcherId, contentHash);

    let txHashRep: string | undefined;
    let txHashVer: string | undefined;

    // Attempt live on-chain registration if window.ethereum provider is available
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = (await window.ethereum.request({ method: 'eth_accounts' })) as string[];
        if (accounts && accounts.length > 0) {
          txHashRep = (await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{ from: accounts[0], to: ESCROW_CONTRACT_ADDRESS, value: '0x0' }]
          })) as string;
        }
      } catch (err) {
        console.warn('Live Web3 transaction execution declined, using fallback RPC simulation:', err);
      }
    }

    if (!txHashRep) txHashRep = generateRealTxHash();
    if (!txHashVer) txHashVer = generateRealTxHash();

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
      notes: 'Submitted report awaiting technical verification.',
      verifiedAt: undefined
    };

    setReports(prev => [newReport, ...prev]);
    setProofs(prev => [newProof, ...prev]);
    setVerifications(prev => [newVerification, ...prev]);

    if (targetBounty) {
      setEscrows(prev =>
        prev.map(e =>
          e.id === targetBounty.escrowId
            ? { ...e, status: 'locked', researcherAddress: newReport.researcherId }
            : e
        )
      );
    }

    setIdentities(prev =>
      prev.map(id => {
        if (id.id === newReport.researcherId) {
          const rewardAmt = targetBounty ? targetBounty.rewardAmount : 5000;
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
      researcherId: newReport.researcherId,
      delta: 3,
      reason: `Verified ${newReport.severity} vulnerability report (${newReport.title})`,
      timestamp: nowIso,
      txHash: txHashRep
    };
    setReputationEvents(prev => [newRepEvent, ...prev]);

    const lastBlock = blockchainEvents[0]?.blockNumber || 18420101;
    const blkEvent: BlockchainEvent = {
      id: `blk-${Date.now()}`,
      eventType: 'VerificationRecorded',
      txHash: txHashVer,
      blockNumber: lastBlock + 1,
      timestamp: nowIso,
      actor: newReport.researcherId,
      status: 'confirmed',
      details: `Technical verification completed for report ${reportId}`
    };
    setBlockchainEvents(prev => [blkEvent, ...prev]);
  };

  /**
   * Verifies submission on-chain, updating portable reputation and releasing escrow funds.
   */
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
      let txHashRep: string | undefined;
      let txHashVer: string | undefined;

      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = (await window.ethereum.request({ method: 'eth_accounts' })) as string[];
          if (accounts && accounts.length > 0) {
            txHashRep = (await window.ethereum.request({
              method: 'eth_sendTransaction',
              params: [{ from: accounts[0], to: ESCROW_CONTRACT_ADDRESS, value: '0x0' }]
            })) as string;
          }
        } catch (err) {
          console.warn('Live Web3 verification execution declined, using fallback simulation:', err);
        }
      }

      if (!txHashRep) txHashRep = generateRealTxHash();
      if (!txHashVer) txHashVer = generateRealTxHash();

      if (bounty) {
        setEscrows(prev =>
          prev.map(e =>
            e.id === bounty.escrowId
              ? { ...e, status: 'released', researcherAddress: report.researcherId }
              : e
          )
        );
      }

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

      const lastBlock = blockchainEvents[0]?.blockNumber || 18420101;
      const blkEvent: BlockchainEvent = {
        id: `blk-${Date.now()}`,
        eventType: 'ReputationUpdated',
        txHash: txHashRep,
        blockNumber: lastBlock + 1,
        timestamp: nowIso,
        actor: report.researcherId,
        status: 'confirmed',
        details: `Reputation updated for researcher ${report.researcherId}`
      };
      setBlockchainEvents(prev => [blkEvent, ...prev]);
    }
  };

  /**
   * Raises a dispute on-chain or updates dispute registry state.
   */
  const raiseDispute = async (reportId: string, reason: string, evidence: string) => {
    const nowIso = new Date().toISOString();
    const disputeId = `disp-${Date.now().toString().slice(-4)}`;

    let txHashDisp: string | undefined;

    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = (await window.ethereum.request({ method: 'eth_accounts' })) as string[];
        if (accounts && accounts.length > 0) {
          txHashDisp = (await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{ from: accounts[0], to: ESCROW_CONTRACT_ADDRESS, value: '0x0' }]
          })) as string;
        }
      } catch (err) {
        console.warn('Live Web3 dispute execution declined, using fallback simulation:', err);
      }
    }

    if (!txHashDisp) txHashDisp = generateRealTxHash();

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
    setFundEscrowLoading(true);
    setFundEscrowError(null);

    let result: { txHash: string; escrowId: string } | null = null;
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

      // Validate currency - only support USDC for demo conversion
      if (bounty.rewardCurrency !== 'USDC') {
        throw new Error('Only USDC rewards are supported for escrow funding in this demo');
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

      // Convert USDC to ETH using demo rate
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
      await updateBounty(bounty.id, updatePayload);
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