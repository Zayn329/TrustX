export const ORACLE_TARGET_OPTIONS = [
  { id: 'trustx-settlement-v1', label: 'TrustX settlement fixture', description: 'Existing allowlisted settlement reproduction.' },
  { id: 'trustx-login-sqli-v1', label: 'TrustX Login SQLi fixture', description: 'Pinned vulnerable login application for authentication-bypass testing.' },
  { id: 'trustx-login-sqli-fixed-v1', label: 'TrustX Login SQLi fixed fixture', description: 'Pinned patched login application for negative-control testing.' },
] as const;

export type OracleTargetId = typeof ORACLE_TARGET_OPTIONS[number]['id'];

export const getOracleTargetLabel = (targetId?: string) =>
  ORACLE_TARGET_OPTIONS.find((target) => target.id === targetId)?.label || 'Manual review / no automated target';
