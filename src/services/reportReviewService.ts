import { httpsCallable } from 'firebase/functions';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, functions } from './firebase';

export type ReviewDecision = 'accepted' | 'rejected' | 'needs_info';

/**
 * Records a company decision directly in Firestore. Security rules restrict this write to the
 * company that owns the report and to the status / companyResponse / reviewedAt fields only.
 */
export async function reviewReport(reportId: string, decision: ReviewDecision, response: string): Promise<void> {
  if (!db) throw new Error('Report review is unavailable because Firebase is not configured.');
  await updateDoc(doc(db, 'reports', reportId), {
    status: decision,
    companyResponse: response,
    reviewedAt: serverTimestamp(),
  });
}

export async function requestOracleVerification(reportId: string): Promise<{ executionId: string; status: string }> {
  if (!functions) throw new Error('Secure oracle verification is unavailable because Firebase is not configured.');
  const result = await httpsCallable<{ reportId: string }, { executionId: string; status: string }>(functions, 'runReportVerification')({ reportId });
  return result.data;
}