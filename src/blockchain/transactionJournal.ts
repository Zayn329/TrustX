export type TransactionLifecycle = 'submitted' | 'confirmed' | 'reverted' | 'unknown';

export interface PendingBlockchainTransaction {
  txHash: string;
  action: 'fund_escrow' | 'release_escrow' | 'raise_dispute' | 'update_reputation' | 'anchor_proof';
  chainId: number;
  contractAddress: string;
  submittedAt: string;
  state: TransactionLifecycle;
  arguments: Record<string, string>;
}

const STORAGE_KEY = 'trust-engine:blockchain-transactions';

function readJournal(): PendingBlockchainTransaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as PendingBlockchainTransaction[] : [];
  } catch {
    return [];
  }
}

function writeJournal(entries: PendingBlockchainTransaction[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-50)));
  } catch {
    // A storage failure must not change the blockchain transaction outcome.
  }
}

export function recordBlockchainTransaction(entry: PendingBlockchainTransaction): void {
  const entries = readJournal().filter((item) => item.txHash !== entry.txHash);
  entries.push(entry);
  writeJournal(entries);
}

export function updateBlockchainTransaction(txHash: string, state: TransactionLifecycle): void {
  const entries = readJournal().map((entry) => entry.txHash === txHash ? { ...entry, state } : entry);
  writeJournal(entries);
}

export function getPendingBlockchainTransactions(): PendingBlockchainTransaction[] {
  return readJournal().filter((entry) => entry.state === 'submitted' || entry.state === 'unknown');
}
