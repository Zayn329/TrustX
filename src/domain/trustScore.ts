import { TrustScoreBreakdown, VulnerabilityReport, TechnicalVerification, SybilRiskIndicator } from '../types';

/**
 * Pure Domain Logic: Calculates the deterministic Trust Score breakdown based on verifiable researcher behavior.
 */
export function calculateTrustScore(
  reports: VulnerabilityReport[],
  verifications: TechnicalVerification[],
  sybilIndicator?: SybilRiskIndicator
): TrustScoreBreakdown {
  const validReports = reports.filter((r) => r.status === 'VERIFIED_VALID' || r.status === 'REWARD_RELEASED');
  const criticalCount = validReports.filter((r) => r.severity === 'CRITICAL').length;

  // 1. Technical Contributions (Max 300)
  const technicalContributions = Math.min(300, validReports.length * 35 + criticalCount * 50);

  // 2. Successful Verifications / Acceptance Rate (Max 300)
  const totalReviewed = reports.filter((r) => r.status !== 'SUBMITTED' && r.status !== 'PROVEN' && r.status !== 'IN_REVIEW').length;
  const acceptanceRate = totalReviewed > 0 ? validReports.length / totalReviewed : 1.0;
  const successfulVerifications = Math.min(300, Math.round(acceptanceRate * 300));

  // 3. Bounty History / Reward Accumulated (Max 250)
  const totalPayout = verifications.reduce((acc, v) => acc + (v.payoutAmount || 0), 0);
  const bountyHistory = Math.min(250, Math.round(totalPayout / 150));

  // 4. Project Trust / Unique Orgs Audited (Max 150)
  const uniqueBounties = new Set(validReports.map((r) => r.bountyId)).size;
  const projectTrust = Math.min(150, uniqueBounties * 50);

  // 5. Risk Deductions
  let riskDeductions = 0;
  if (sybilIndicator) {
    riskDeductions += Math.round(sybilIndicator.riskScore * 1.5);
  }
  const invalidReports = reports.filter((r) => r.status === 'VERIFIED_INVALID').length;
  riskDeductions += invalidReports * 30;

  const rawOverall = technicalContributions + successfulVerifications + bountyHistory + projectTrust - riskDeductions;
  const overallScore = Math.min(1000, Math.max(0, rawOverall));

  return {
    overallScore,
    technicalContributions,
    successfulVerifications,
    bountyHistory,
    projectTrust,
    riskDeductions,
  };
}
