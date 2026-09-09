import { EscrowStatus } from '../types';

/**
 * Pure Domain Logic: Determines allowed state transitions for Smart Contract Escrow.
 */
export function getNextEscrowState(
  currentStatus: EscrowStatus,
  action: 'DEPOSIT' | 'VERIFY_SUCCESS' | 'RAISE_DISPUTE' | 'RESOLVE_DISPUTE_PAY' | 'REFUND'
): EscrowStatus {
  switch (currentStatus) {
    case 'AWAITING_DEPOSIT':
      if (action === 'DEPOSIT') return 'DEPOSITED_LOCKED';
      break;
    case 'DEPOSITED_LOCKED':
      if (action === 'VERIFY_SUCCESS') return 'RELEASED';
      if (action === 'RAISE_DISPUTE') return 'DISPUTED_FROZEN';
      if (action === 'REFUND') return 'REFUNDED';
      break;
    case 'DISPUTED_FROZEN':
      if (action === 'RESOLVE_DISPUTE_PAY') return 'RELEASED';
      if (action === 'REFUND') return 'REFUNDED';
      break;
    default:
      break;
  }
  return currentStatus;
}

/**
 * Calculates payout amount based on severity tier and bounty reward rules.
 */
export function calculatePayout(
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
  rewards: { critical: number; high: number; medium: number; low: number }
): number {
  switch (severity) {
    case 'CRITICAL':
      return rewards.critical;
    case 'HIGH':
      return rewards.high;
    case 'MEDIUM':
      return rewards.medium;
    case 'LOW':
      return rewards.low;
  }
}
