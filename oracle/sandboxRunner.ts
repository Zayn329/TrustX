export interface SandboxExecutionResult {
  executionId: string;
  status: 'passed' | 'failed';
  coveragePercentage: number;
  logs: string[];
  vulnerabilityCategory: string;
  executedAt: string;
  executionMode: 'remote_oracle';
}

/**
 * Remote PoC Evaluation Engine.
 * Technical verification has no local keyword-based fallback: unavailable
 * execution must remain unverified rather than being presented as valid.
 */
export async function runSandboxEvaluation(reproductionSteps: string): Promise<SandboxExecutionResult> {
  const oracleUrl = typeof process !== 'undefined' && process.env?.VITE_ORACLE_SERVICE_URL
    ? process.env.VITE_ORACLE_SERVICE_URL
    : (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ORACLE_SERVICE_URL;

  if (!oracleUrl) {
    throw new Error('Technical verifier is not configured');
  }

  const response = await fetch(`${oracleUrl.replace(/\/$/, '')}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reproductionSteps }),
    signal: AbortSignal.timeout(1200)
  });
  if (!response.ok) {
    throw new Error(`Technical verifier returned HTTP ${response.status}`);
  }

  const remoteResult = await response.json() as Partial<SandboxExecutionResult>;
  if (
    typeof remoteResult.executionId !== 'string' ||
    (remoteResult.status !== 'passed' && remoteResult.status !== 'failed') ||
    typeof remoteResult.coveragePercentage !== 'number' ||
    !Array.isArray(remoteResult.logs) ||
    typeof remoteResult.vulnerabilityCategory !== 'string' ||
    typeof remoteResult.executedAt !== 'string'
  ) {
    throw new Error('Technical verifier returned an invalid result');
  }

  return {
    executionId: remoteResult.executionId,
    status: remoteResult.status,
    coveragePercentage: remoteResult.coveragePercentage,
    logs: remoteResult.logs,
    vulnerabilityCategory: remoteResult.vulnerabilityCategory,
    executedAt: remoteResult.executedAt,
    executionMode: 'remote_oracle'
  } as SandboxExecutionResult;
}
