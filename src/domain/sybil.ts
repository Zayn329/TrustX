import { VulnerabilityReport, SybilRiskIndicator } from '../types';

/**
 * Pure Domain Logic: Calculates Sybil & Fraud Risk heuristic metrics.
 */
export function evaluateSybilRisk(
  did: string,
  submissions: VulnerabilityReport[],
  joinedTimestamp: number
): SybilRiskIndicator {
  const accountAgeDays = Math.max(1, Math.floor((Date.now() - joinedTimestamp) / (1000 * 60 * 60 * 24)));
  const userSubmissions = submissions.filter((s) => s.researcherDid === did);
  const flaggedSignals: string[] = [];

  let riskScore = 0;

  // Account Age Risk Signal
  if (accountAgeDays < 7) {
    riskScore += 25;
    flaggedSignals.push('New account (< 7 days old)');
  }

  // Submission Velocity Risk Signal
  if (userSubmissions.length > 5) {
    riskScore += 20;
    flaggedSignals.push('High submission velocity (> 5 reports)');
  }

  // Invalid / Rejected Submissions Signal
  const invalidCount = userSubmissions.filter((s) => s.status === 'VERIFIED_INVALID').length;
  if (invalidCount > 1) {
    riskScore += invalidCount * 20;
    flaggedSignals.push(`${invalidCount} rejected invalid reports`);
  }

  const finalRiskScore = Math.min(100, riskScore);

  return {
    researcherDid: did,
    riskScore: finalRiskScore,
    duplicateIdentityRisk: finalRiskScore > 50 ? 'HIGH' : finalRiskScore > 20 ? 'MEDIUM' : 'LOW',
    submissionSpamRisk: userSubmissions.length > 5 ? 'HIGH' : 'LOW',
    accountAgeDays,
    flaggedSignals,
  };
}
