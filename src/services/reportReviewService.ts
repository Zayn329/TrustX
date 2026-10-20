import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export type ReviewDecision = 'accepted' | 'rejected' | 'needs_info';

export async function reviewReport(reportId: string, decision: ReviewDecision, response: string): Promise<void> {
  if (!functions) throw new Error('Secure report review is unavailable because Firebase is not configured.');
  await httpsCallable<{ reportId: string; decision: ReviewDecision; response: string }, { status: ReviewDecision }>(functions, 'reviewReport')({ reportId, decision, response });
}

export async function requestOracleVerification(reportId: string): Promise<{ executionId: string; status: string }> {
  if (!functions) throw new Error('Secure oracle verification is unavailable because Firebase is not configured.');
  const result = await httpsCallable<{ reportId: string }, { executionId: string; status: string }>(functions, 'runReportVerification')({ reportId });
  return result.data;
}
