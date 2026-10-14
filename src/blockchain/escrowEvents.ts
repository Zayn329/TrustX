import { decodeEventLog, parseAbiItem, type Address, type Hex } from 'viem';
import { publicClient } from './viemClient';
import { blockchainConfig, PROOF_REGISTRY_ADDRESS, REPUTATION_REGISTRY_ADDRESS } from './config';
import { BlockchainEvent } from '../domain/types';

const ESCROW_EVENTS = [
  parseAbiItem('event EscrowFunded(uint256 indexed escrowId, uint256 indexed bountyId, address company, uint256 amount)'),
  parseAbiItem('event EscrowReleased(uint256 indexed escrowId, address researcher, uint256 amount)'),
  parseAbiItem('event EscrowDisputed(uint256 indexed escrowId, address disputedBy)')
] as const;
const PROOF_EVENTS = [
  parseAbiItem('event ProofAnchored(bytes32 indexed proofHash, uint256 indexed bountyId, string researcherDid, address indexed signer, bytes signature, uint256 nonce)')
] as const;
const REPUTATION_EVENTS = [
  parseAbiItem('event ReputationUpdated(string did, uint256 newScore, uint256 increment)')
] as const;

export interface LiveEscrowEventQuery {
  fromBlock?: bigint;
  toBlock?: bigint;
}

function toEventType(eventName: string): BlockchainEvent['eventType'] {
  if (eventName === 'EscrowFunded') return 'EscrowDeposited';
  if (eventName === 'EscrowReleased') return 'EscrowReleased';
  if (eventName === 'ProofAnchored') return 'ProofAnchored';
  if (eventName === 'ReputationUpdated') return 'ReputationUpdated';
  return 'DisputeRaised';
}

function eventDetails(eventName: string, args: Record<string, unknown>): string {
  if (eventName === 'EscrowFunded') {
    return `Escrow ${String(args.escrowId)} funded for bounty ${String(args.bountyId)} with ${String(args.amount)} wei.`;
  }
  if (eventName === 'EscrowReleased') {
    return `Escrow ${String(args.escrowId)} released to ${String(args.researcher)} for ${String(args.amount)} wei.`;
  }
  if (eventName === 'ProofAnchored') {
    return `Proof ${String(args.proofHash)} anchored for bounty ${String(args.bountyId)} by ${String(args.signer)}.`;
  }
  if (eventName === 'ReputationUpdated') {
    return `Reputation ${String(args.did)} updated to ${String(args.newScore)} (+${String(args.increment)}).`;
  }
  return `Escrow ${String(args.escrowId)} disputed by ${String(args.disputedBy)}.`;
}

async function queryContractEvents(
  address: string,
  eventAbis: readonly unknown[],
  options: LiveEscrowEventQuery
): Promise<BlockchainEvent[]> {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return [];
  const latestBlock = options.toBlock ?? await publicClient.getBlockNumber();
  const fromBlock = options.fromBlock ?? (latestBlock > 10_000n ? latestBlock - 10_000n : 0n);
  const logs = await publicClient.getLogs({ address: address as Address, fromBlock, toBlock: latestBlock });
  const blockTimestamps = new Map<bigint, string>();

  return Promise.all(logs.map(async (log) => {
    let decoded: { eventName: string; args: Record<string, unknown> } | null = null;
    for (const eventAbi of eventAbis) {
      try {
        const result = decodeEventLog({ abi: [eventAbi as never], data: log.data as Hex, topics: log.topics });
        decoded = { eventName: result.eventName, args: result.args as Record<string, unknown> };
        break;
      } catch { }
    }
    if (!decoded) throw new Error(`Unknown event log ${log.transactionHash ?? 'without transaction hash'}`);
    let timestamp = blockTimestamps.get(log.blockNumber);
    if (!timestamp) {
      const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
      timestamp = new Date(Number(block.timestamp) * 1000).toISOString();
      blockTimestamps.set(log.blockNumber, timestamp);
    }
    return {
      id: `${log.transactionHash}:${log.logIndex}`,
      eventType: toEventType(decoded.eventName),
      txHash: log.transactionHash ?? '',
      blockNumber: Number(log.blockNumber),
      timestamp,
      actor: String(decoded.args.company ?? decoded.args.researcher ?? decoded.args.disputedBy ?? decoded.args.signer ?? ''),
      status: 'confirmed',
      source: 'rpc_log',
      details: eventDetails(decoded.eventName, decoded.args)
    } satisfies BlockchainEvent;
  }));
}

/** Reads canonical Trust Engine contract logs directly from the configured Sepolia RPC. */
export async function queryLiveEscrowEvents(
  options: LiveEscrowEventQuery = {}
): Promise<BlockchainEvent[]> {
  const [escrow, proof, reputation] = await Promise.all([
    queryContractEvents(blockchainConfig.trustBountyEscrowAddress, ESCROW_EVENTS, options),
    queryContractEvents(PROOF_REGISTRY_ADDRESS, PROOF_EVENTS, options),
    queryContractEvents(REPUTATION_REGISTRY_ADDRESS, REPUTATION_EVENTS, options)
  ]);
  return [...escrow, ...proof, ...reputation].sort((a, b) => b.blockNumber - a.blockNumber);
}
