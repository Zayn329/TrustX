import { sha256 } from '../src/domain/cryptoUtils';

export type OracleStatus = 'passed' | 'failed' | 'rejected' | 'unavailable';

export interface SandboxEvaluationRequest {
  reportId?: string;
  reproductionSteps: string;
  evidenceHash?: string;
  idempotencyKey?: string;
}

export interface SandboxExecutionResult {
  executionId: string;
  reportId: string;
  requestHash: string;
  evidenceHash: string;
  status: OracleStatus;
  coveragePercentage: number;
  logs: string[];
  vulnerabilityCategory: string;
  executedAt: string;
  verifierVersion: string;
  targetVersion: string;
  executionMode: 'isolated_remote_oracle';
  signingKeyId: string;
  signature: string;
  publicKeySpkiBase64: string;
}

type UnsignedSandboxExecutionResult = Omit<SandboxExecutionResult, 'signature' | 'publicKeySpkiBase64'>;

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function canonicalRequest(request: Required<Pick<SandboxEvaluationRequest, 'reportId' | 'reproductionSteps' | 'evidenceHash' | 'idempotencyKey'>> & { targetVersion: string }) {
  return JSON.stringify({
    reportId: request.reportId,
    reproductionSteps: request.reproductionSteps,
    evidenceHash: request.evidenceHash,
    targetVersion: request.targetVersion,
    idempotencyKey: request.idempotencyKey
  });
}

async function verifySignature(result: SandboxExecutionResult, configuredPublicKey?: string): Promise<void> {
  const publicKeySpkiBase64 = configuredPublicKey || result.publicKeySpkiBase64;
  if (!publicKeySpkiBase64 || (configuredPublicKey && configuredPublicKey !== result.publicKeySpkiBase64)) {
    throw new Error('Technical verifier signing key is not trusted');
  }
  const unsigned: UnsignedSandboxExecutionResult = {
    executionId: result.executionId,
    reportId: result.reportId,
    requestHash: result.requestHash,
    evidenceHash: result.evidenceHash,
    status: result.status,
    coveragePercentage: result.coveragePercentage,
    logs: result.logs,
    vulnerabilityCategory: result.vulnerabilityCategory,
    executedAt: result.executedAt,
    verifierVersion: result.verifierVersion,
    targetVersion: result.targetVersion,
    executionMode: result.executionMode,
    signingKeyId: result.signingKeyId
  };
  const key = await crypto.subtle.importKey('spki', base64ToBytes(publicKeySpkiBase64).buffer as ArrayBuffer, { name: 'Ed25519' } as AlgorithmIdentifier, false, ['verify']);
  const valid = await crypto.subtle.verify({ name: 'Ed25519' } as AlgorithmIdentifier, key, base64ToBytes(result.signature).buffer as ArrayBuffer, new TextEncoder().encode(JSON.stringify(unsigned)));
  if (!valid) throw new Error('Technical verifier returned an invalid signature');
}

export async function runSandboxEvaluation(input: string | SandboxEvaluationRequest): Promise<SandboxExecutionResult> {
  const request: SandboxEvaluationRequest = typeof input === 'string' ? { reproductionSteps: input } : input;
  const reportId = request.reportId || 'unassigned-report';
  const evidenceHash = request.evidenceHash || await sha256(request.reproductionSteps);
  const idempotencyKey = request.idempotencyKey || await sha256(`${reportId}:${evidenceHash}:${request.reproductionSteps}`);
  const oracleUrl = typeof process !== 'undefined' && process.env?.VITE_ORACLE_SERVICE_URL
    ? process.env.VITE_ORACLE_SERVICE_URL
    : (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ORACLE_SERVICE_URL;

  if (!oracleUrl) throw new Error('Technical verifier is not configured');
  if (!/^0x[0-9a-f]{64}$/i.test(evidenceHash)) throw new Error('Technical verifier evidence hash is invalid');

  const response = await fetch(`${oracleUrl.replace(/\/$/, '')}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportId, reproductionSteps: request.reproductionSteps, evidenceHash, idempotencyKey }),
    signal: AbortSignal.timeout(6000)
  });
  if (!response.ok) throw new Error(`Technical verifier returned HTTP ${response.status}`);

  const result = await response.json() as Partial<SandboxExecutionResult>;
  if (
    typeof result.executionId !== 'string' || typeof result.reportId !== 'string' ||
    typeof result.requestHash !== 'string' || typeof result.evidenceHash !== 'string' ||
    !['passed', 'failed', 'rejected', 'unavailable'].includes(result.status || '') ||
    typeof result.coveragePercentage !== 'number' || !Array.isArray(result.logs) ||
    typeof result.vulnerabilityCategory !== 'string' || typeof result.executedAt !== 'string' ||
    typeof result.verifierVersion !== 'string' || typeof result.targetVersion !== 'string' ||
    result.executionMode !== 'isolated_remote_oracle' || typeof result.signingKeyId !== 'string' ||
    typeof result.signature !== 'string' || typeof result.publicKeySpkiBase64 !== 'string'
  ) throw new Error('Technical verifier returned an invalid result');

  const typedResult = result as SandboxExecutionResult;
  const expectedRequestHash = await sha256(canonicalRequest({ reportId, reproductionSteps: request.reproductionSteps, evidenceHash, idempotencyKey, targetVersion: 'trustx-settlement-v1' }));
  if (typedResult.reportId !== reportId || typedResult.evidenceHash !== evidenceHash || typedResult.requestHash !== expectedRequestHash) {
    throw new Error('Technical verifier result is bound to different evidence');
  }
  const configuredPublicKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ORACLE_SIGNING_PUBLIC_KEY;
  const isDevelopment = (import.meta as unknown as { env?: Record<string, boolean> }).env?.DEV === true;
  if (!configuredPublicKey && !isDevelopment) throw new Error('A pinned verifier signing key is required outside development');
  await verifySignature(typedResult, configuredPublicKey);
  return typedResult;
}
