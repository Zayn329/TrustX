import { useState, useCallback } from 'react';
import { createPublicClient, custom, decodeEventLog, encodeFunctionData, getAddress, parseAbiItem } from 'viem';
import { sepolia } from 'viem/chains';
import { isValidEthAddress } from '../blockchain/config';

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

export const INITIAL_JUROR_CASES: JurorCase[] = [{
  disputeId: 'disp-01',
  contributionId: 'rep-8801',
  title: 'Precision loss in liquidity pool calculation allows token drain',
  disputedBy: 'CloudVault Infrastructure',
  reason: 'Dispute over severity classification (High vs Medium)',
  votesResearcher: 2,
  votesCompany: 0,
  isResolved: false
}];

const DISPUTE_ARBITRATION_ADDRESS = import.meta.env.VITE_DISPUTE_ARBITRATION_ADDRESS as string;
const ARBITRATION_ABI = [
  parseAbiItem('function createCase(uint256 disputeId, uint256 contributionId) external'),
  parseAbiItem('function castVote(uint256 disputeId, uint8 vote) external'),
  parseAbiItem('event JurorVoted(uint256 indexed disputeId, address indexed juror, uint8 vote)'),
  parseAbiItem('event RulingExecuted(uint256 indexed disputeId, uint8 ruling)'),
  parseAbiItem('event DisputeCaseCreated(uint256 indexed disputeId, uint256 indexed contributionId, address indexed creator)')
] as const;

export function useArbitrationStore() {
  const [cases, setCases] = useState<JurorCase[]>(INITIAL_JUROR_CASES);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  const createArbitrationCase = useCallback(async (disputeId: string, contributionId: string) => {
    if (!isValidEthAddress(DISPUTE_ARBITRATION_ADDRESS)) throw new Error('Arbitration contract is not configured');
    if (!window.ethereum) throw new Error('Wallet not connected');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
    if (!accounts?.[0] || !isValidEthAddress(accounts[0])) throw new Error('Wallet account unavailable');
    if (Number(await window.ethereum.request({ method: 'eth_chainId' })) !== 11155111) throw new Error('Wallet is not on Sepolia');
    const numericDisputeId = BigInt(disputeId.replace(/\D/g, '') || '0');
    const numericContributionId = BigInt(contributionId.replace(/\D/g, '') || '0');
    if (numericDisputeId <= 0n || numericContributionId <= 0n) throw new Error('Invalid arbitration identifiers');
    const client = createPublicClient({ chain: sepolia, transport: custom(window.ethereum) });
    const bytecode = await client.getBytecode({ address: getAddress(DISPUTE_ARBITRATION_ADDRESS) });
    if (!bytecode || bytecode === '0x') throw new Error('Arbitration contract has no deployed bytecode');
    const data = encodeFunctionData({ abi: ARBITRATION_ABI, functionName: 'createCase', args: [numericDisputeId, numericContributionId] });
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{ from: getAddress(accounts[0]), to: getAddress(DISPUTE_ARBITRATION_ADDRESS), data, value: '0x0' }]
    }) as `0x${string}`;
    const receipt = await client.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status !== 'success') throw new Error('Dispute case creation reverted');
    const createdLog = receipt.logs.map((log) => {
      try { return decodeEventLog({ abi: [ARBITRATION_ABI[4]], data: log.data, topics: log.topics }); }
      catch { return null; }
    }).find((event) => event?.eventName === 'DisputeCaseCreated');
    if (!createdLog || createdLog.eventName !== 'DisputeCaseCreated') throw new Error('DisputeCaseCreated event not found in receipt');
    return { txHash, blockNumber: receipt.blockNumber.toString(), disputeId, contributionId };
  }, []);

  const castJurorVote = useCallback(async (disputeId: string, vote: 'Researcher' | 'Company') => {
    setIsSubmittingVote(true);
    try {
      if (!isValidEthAddress(DISPUTE_ARBITRATION_ADDRESS)) throw new Error('Arbitration contract is not configured');
      if (!window.ethereum) throw new Error('Wallet not connected');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (!accounts?.[0] || !isValidEthAddress(accounts[0])) throw new Error('Wallet account unavailable');
      const chainId = Number(await window.ethereum.request({ method: 'eth_chainId' }));
      if (chainId !== 11155111) throw new Error('Wallet is not on Sepolia');

      const numericDisputeId = BigInt(disputeId.replace(/\D/g, '') || '0');
      if (numericDisputeId <= 0n) throw new Error('Invalid dispute ID');
      const client = createPublicClient({ chain: sepolia, transport: custom(window.ethereum) });
      const bytecode = await client.getBytecode({ address: getAddress(DISPUTE_ARBITRATION_ADDRESS) });
      if (!bytecode || bytecode === '0x') throw new Error('Arbitration contract has no deployed bytecode');
      const numericVote = vote === 'Researcher' ? 1 : 2;
      const data = encodeFunctionData({
        abi: ARBITRATION_ABI,
        functionName: 'castVote',
        args: [numericDisputeId, numericVote]
      });
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from: getAddress(accounts[0]), to: getAddress(DISPUTE_ARBITRATION_ADDRESS), data, value: '0x0' }]
      }) as `0x${string}`;

      const receipt = await client.waitForTransactionReceipt({ hash: txHash });
      if (receipt.status !== 'success') throw new Error('Juror vote transaction reverted');

      const voteLog = receipt.logs.map((log) => {
        try { return decodeEventLog({ abi: [ARBITRATION_ABI[2]], data: log.data, topics: log.topics }); }
        catch { return null; }
      }).find((event) => event?.eventName === 'JurorVoted');
      if (!voteLog || voteLog.eventName !== 'JurorVoted') throw new Error('JurorVoted event not found in receipt');

      const rulingLog = receipt.logs.map((log) => {
        try { return decodeEventLog({ abi: [ARBITRATION_ABI[3]], data: log.data, topics: log.topics }); }
        catch { return null; }
      }).find((event) => event?.eventName === 'RulingExecuted');

      setCases((prev) => prev.map((item) => {
        if (item.disputeId !== disputeId) return item;
        const votesResearcher = item.votesResearcher + (vote === 'Researcher' ? 1 : 0);
        const votesCompany = item.votesCompany + (vote === 'Company' ? 1 : 0);
        const ruling = rulingLog?.eventName === 'RulingExecuted'
          ? rulingLog.args.ruling === 1 ? 'ResearcherWins' : 'CompanyWins'
          : item.ruling;
        return { ...item, votesResearcher, votesCompany, isResolved: Boolean(rulingLog), ruling, txHash };
      }));
    } finally {
      setIsSubmittingVote(false);
    }
  }, []);

  return { cases, isSubmittingVote, createArbitrationCase, castJurorVote };
}
